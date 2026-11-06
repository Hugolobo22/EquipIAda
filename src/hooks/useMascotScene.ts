"use client";

import { useCallback, useEffect, useReducer, useRef, useState, type PointerEvent } from "react";
import gsap from "gsap";
import { mascotReducer } from "@/lib/mascotReducer";
import { chooseAnswerReadySpeech, chooseAnswerSpeech, choosePrankSpeech } from "@/lib/contextualSpeech";
import { chooseNextAction, createSessionState, isMagicWordReply, sessionReducer } from "@/lib/sessionEngine";
import { initialMascotState, type MascotEmotion, type MascotGesture } from "@/types/mascot";
import type { PrankId, SessionEvent } from "@/types/session";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

export function useMascotScene() {
  const [state, dispatch] = useReducer(mascotReducer, initialMascotState);
  const [session, setSession] = useState(createSessionState);
  const sessionRef = useRef(session);
  const [answerText, setAnswerText] = useState<string | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [answerCancelled, setAnswerCancelled] = useState(false);
  const [answering, setAnswering] = useState(false);
  const answerRequestRef = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState(false);
  const [stolen, setStolen] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const actorRef = useRef<HTMLDivElement>(null);
  const sendButtonRef = useRef<HTMLButtonElement>(null);
  const sequenceRef = useRef<gsap.core.Timeline | null>(null);
  const busyRef = useRef(false);
  const wanderingIndexRef = useRef(0);
  const [hint, setHint] = useState("O mascote reage ao seu cursor. Experimente provocar!");

  const speak = useCallback((text: string, emotion?: MascotEmotion, gesture?: MascotGesture) => {
    dispatch({ type: "SPEAK", text, emotion, gesture });
  }, []);

  const applySessionEvent = useCallback((event: SessionEvent) => {
    const next = sessionReducer(sessionRef.current, event);
    sessionRef.current = next;
    setSession(next);
    return next;
  }, []);

  const resetAnimations = useCallback(() => {
    sequenceRef.current?.kill();
    sequenceRef.current = null;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (actorRef.current) {
      gsap.killTweensOf(actorRef.current);
      if (reducedMotion) gsap.set(actorRef.current, { x: 0, y: 0, rotation: 0 });
      else gsap.to(actorRef.current, { x: 0, y: 0, rotation: 0, duration: .4, overwrite: true });
    }
    if (sendButtonRef.current) {
      gsap.killTweensOf(sendButtonRef.current);
      if (reducedMotion) gsap.set(sendButtonRef.current, { x: 0, y: 0, scale: 1, rotation: 0 });
      else gsap.to(sendButtonRef.current, { x: 0, y: 0, scale: 1, rotation: 0, duration: .4, overwrite: true });
    }
    busyRef.current = false;
    setBusy(false);
    setStolen(false);
  }, []);

  const setEmotion = useCallback((emotion: MascotEmotion) => {
    if (busyRef.current) return;
    dispatch({ type: "SET_EMOTION", emotion });
    const texts: Record<MascotEmotion, string> = {
      neutral: "Tudo bem. Vou fingir que estou prestando atenção.",
      curious: "Pera... o que é isso aí que você está fazendo? 👀",
      sarcastic: "Uau. Uma pergunta. Que evento histórico.",
      annoyed: "JÁ FALEI QUE EU ESTOU OCUPADA! (Não estou.)",
      sleepy: "Só mais cinco minutinhos... zzz...",
    };
    speak(texts[emotion], emotion, emotion === "annoyed" ? "shrug" : "idle");
  }, [speak]);

  const setGesture = useCallback((gesture: MascotGesture) => {
    if (busyRef.current) return;
    dispatch({ type: "SET_GESTURE", gesture });
  }, []);

  const move = useCallback(() => {
    const actor = actorRef.current;
    const scene = sceneRef.current;
    if (!actor || !scene || busyRef.current) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;
    const positions = [
      { x: -.17, y: -.03, rot: -9 },
      { x: .16, y: .03, rot: 9 },
      { x: -.05, y: -.09, rot: 4 },
      { x: .09, y: .08, rot: -4 },
      { x: 0, y: 0, rot: 0 },
    ];
    const index = wanderingIndexRef.current++ % positions.length;
    const choice = positions[index];
    const sceneWidth = Math.min(scene.clientWidth, 880);
    const sceneHeight = Math.min(scene.clientHeight, 660);
    const narrow = sceneWidth < 540;
    const bubbleWidth = actor.querySelector<HTMLElement>(".bubble")?.offsetWidth ?? 257;
    const maxHorizontalShift = Math.max(0, (sceneWidth - bubbleWidth) / 2 - 16);
    gsap.to(actor, {
      x: narrow ? clamp(choice.x * sceneWidth, -maxHorizontalShift, maxHorizontalShift) : choice.x * sceneWidth,
      y: narrow ? clamp(choice.y * sceneHeight, -10, 30) : choice.y * sceneHeight,
      rotation: narrow ? clamp(choice.rot, -4, 4) : choice.rot,
      duration: 1.1,
      ease: "power2.inOut",
      overwrite: true,
    });
  }, []);

  const onPointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    // Atualização direta das variáveis CSS, sem rerender por movimento do mouse.
    const actor = actorRef.current;
    if (!actor || event.pointerType === "touch") return;
    const rect = actor.getBoundingClientRect();
    const diffX = (event.clientX - (rect.left + rect.width / 2)) / Math.max(120, rect.width / 2);
    const diffY = (event.clientY - (rect.top + rect.height / 2)) / Math.max(120, rect.height / 2);
    actor.style.setProperty("--pupil-x", `${clamp(diffX * 5.5, -5.5, 5.5)}px`);
    actor.style.setProperty("--pupil-y", `${clamp(diffY * 4.5, -4.5, 4.5)}px`);
  }, []);

  const onPointerLeave = useCallback(() => {
    actorRef.current?.style.setProperty("--pupil-x", "0px");
    actorRef.current?.style.setProperty("--pupil-y", "0px");
  }, []);

  const stealButton = useCallback(() => {
    const scene = sceneRef.current;
    const actor = actorRef.current;
    const button = sendButtonRef.current;
    if (!scene || !actor || !button || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setHint("Roubo em andamento! A IAda está sequestrando o botão...");
    speak("OPA! Esse botão agora é meu. Vai reclamar com quem?", "sarcastic", "grab");

    const sceneRect = scene.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const actorRect = actor.getBoundingClientRect();
    const currentX = Number(gsap.getProperty(actor, "x")) || 0;
    const currentY = Number(gsap.getProperty(actor, "y")) || 0;
    const buttonCenterX = buttonRect.left + buttonRect.width / 2;
    const buttonCenterY = buttonRect.top + buttonRect.height / 2;

    // A IAda se aproxima de modo que sua mão direita possa alcançar Enviar.
    const targetCenterX = clamp(buttonCenterX - sceneRect.left - 82, 130, sceneRect.width - 134);
    const targetCenterY = clamp(buttonCenterY - sceneRect.top - 119, 130, sceneRect.height - 164);
    const targetX = targetCenterX - sceneRect.width * .5;
    const targetY = targetCenterY - sceneRect.height * .42;

    // Usar a posição real da mão SVG, em vez de coordenadas rígidas por tela.
    const arm = actor.querySelector<SVGGElement>(".arm-right");
    const handRect = arm?.getBoundingClientRect();
    const handX = (handRect ? handRect.left + handRect.width * .72 : actorRect.left + actorRect.width * .80) + (targetX - currentX);
    const handY = (handRect ? handRect.top + handRect.height * .55 : actorRect.top + actorRect.height * .61) + (targetY - currentY);
    const buttonX = handX - buttonCenterX - 12;
    const buttonY = handY - buttonCenterY + 8;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      busyRef.current = false;
      setBusy(false);
      speak("Tentei fugir com o botão, mas o modo de movimento reduzido me pegou!", "sarcastic", "idle");
      setHint("Animações complexas reduzidas por sua preferência de acessibilidade.");
      return;
    }
    const tl = gsap.timeline({
      onComplete: () => {
        busyRef.current = false;
        setBusy(false);
        setStolen(false);
        speak("Pronto, devolvi o botão. Recupere-o no desafio abaixo.", "annoyed", "shrug");
        setHint("Use a ação da pegadinha ou Pular pegadinha.");
        sequenceRef.current = null;
      },
    });
    sequenceRef.current = tl;
    tl.to(actor, { x: targetX, y: targetY, rotation: -8, duration: .75, ease: "back.out(1.3)", overwrite: true })
      .call(() => setStolen(true))
      .to(button, { x: buttonX, y: buttonY, scale: .83, rotation: -9, duration: .38, ease: "back.inOut(2)", overwrite: true })
      .to(actor, { x: targetX - 95, y: targetY - 62, rotation: 10, duration: .65, ease: "power2.inOut" }, "+=.15")
      .to(button, { x: buttonX - 95, y: buttonY - 62, rotation: -18, duration: .65, ease: "power2.inOut" }, "<")
      .to({}, { duration: .6 })
      .to(button, { x: 0, y: 0, scale: 1, rotation: 0, duration: .55, ease: "back.out(1.3)" })
      .to(actor, { x: 0, y: 0, rotation: 0, duration: .65, ease: "power2.out" }, "<");
  }, [speak]);

  const revealAnswer = useCallback(async () => {
    if (!sessionRef.current.questionOriginal) {
      speak("Escreva uma pergunta primeiro. Até eu preciso de um ponto de partida.", "curious", "point");
      return;
    }
    if (answerRequestRef.current) return;
    const line = chooseAnswerSpeech(sessionRef.current);
    resetAnimations();
    applySessionEvent({ type: "ANSWER" });
    setAnswerText(null);
    setAnswerError(null);
    setAnswerCancelled(false);
    setAnswering(true);
    speak(line.text, line.emotion, line.gesture);
    setHint("Consultando o provedor configurado para a pergunta original.");
    const controller = new AbortController();
    answerRequestRef.current = controller;
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: sessionRef.current.questionOriginal }),
        signal: controller.signal,
      });
      const data: unknown = await response.json();
      if (answerRequestRef.current !== controller) return;
      const result = data && typeof data === "object" ? data as { answer?: unknown; code?: unknown } : {};
      if (response.ok && typeof result.answer === "string" && result.answer.trim()) {
        setAnswerText(result.answer);
        const readyLine = chooseAnswerReadySpeech(sessionRef.current);
        speak(readyLine.text, readyLine.emotion, readyLine.gesture);
        setHint("Resposta gerada para a pergunta original.");
      } else if (result.code === "NOT_CONFIGURED" || result.code === "PRODUCTION_DISABLED") {
        setAnswerError("A resposta está indisponível nesta configuração. Ative o modelo local e tente novamente.");
        speak("Ainda estou em modo de demonstração. Configure um modelo local para eu responder de verdade.", "sleepy", "shrug");
        setHint("Nenhuma consulta externa foi realizada; resposta ainda indisponível nesta configuração.");
      } else {
        setAnswerError("Não consegui obter a resposta. Verifique o modelo local e tente novamente.");
        speak("Minha conexão com o cérebro extra falhou. Pode tentar de novo.", "curious", "shrug");
        setHint("A pergunta original foi preservada. Tente novamente ou reinicie a rodada.");
      }
    } catch {
      if (answerRequestRef.current !== controller) return;
      setAnswerError("Não consegui obter a resposta. Verifique o modelo local e tente novamente.");
      speak("O cérebro extra não respondeu. Sua pergunta continua salva.", "curious", "shrug");
      setHint("Tente novamente ou reinicie a rodada.");
    } finally {
      if (answerRequestRef.current === controller) {
        answerRequestRef.current = null;
        setAnswering(false);
      }
    }
  }, [applySessionEvent, resetAnimations, speak]);

  const cancelAnswer = useCallback(() => {
    const controller = answerRequestRef.current;
    if (!controller) return;
    answerRequestRef.current = null;
    controller.abort();
    setAnswering(false);
    setAnswerText(null);
    setAnswerError(null);
    setAnswerCancelled(true);
    speak("Tudo bem, parei. Sua pergunta continua guardada.", "neutral", "shrug");
    setHint("Consulta cancelada. Tente novamente ou reinicie a pergunta.");
  }, [speak]);

  const skipPrank = useCallback((question: string) => {
    if (answerRequestRef.current) return;
    if (!sessionRef.current.questionOriginal || sessionRef.current.stage === "answered") {
      if (!question.trim()) {
        speak("Escreva uma pergunta primeiro. Até eu preciso de um ponto de partida.", "curious", "point");
        return;
      }
      setAnswerText(null);
      setAnswerError(null);
      setAnswerCancelled(false);
      applySessionEvent({ type: "START_QUESTION", question });
    }
    applySessionEvent({ type: "SKIP" });
    void revealAnswer();
  }, [applySessionEvent, revealAnswer, speak]);

  const retryAnswer = useCallback(() => {
    if ((answerError || answerCancelled) && !answerRequestRef.current) void revealAnswer();
  }, [answerError, answerCancelled, revealAnswer]);

  const resolvePrank = useCallback((reply = "") => {
    const active = sessionRef.current.activePrank;
    if (!active || busyRef.current) return false;
    if (active === "magic-word" && !isMagicWordReply(reply)) {
      speak("Pista: são duas palavras. Começa com 'por' e termina com 'favor'.", "curious", "point");
      setHint("Digite 'por favor' no campo do desafio; sua pergunta não será alterada.");
      return false;
    }
    const current = applySessionEvent({ type: "RESOLVE_PRANK" });
    speak(active === "word-thief"
      ? "Pronto, devolvi cada palavra. Nem encostei na pergunta de verdade."
      : active === "blackout"
        ? "Achou o interruptor. Eu tinha deixado a conta de luz em dia, infelizmente."
        : "Tá, essa você venceu. Minha próxima desculpa já está quase pronta.", "sarcastic", "shrug");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (chooseNextAction(current, { reducedMotion }).kind === "answer") {
      void revealAnswer();
    } else {
      setHint("Pegadinha resolvida. Use Enviar para continuar ou Pular para a resposta.");
    }
    return true;
  }, [applySessionEvent, revealAnswer, speak]);

  const showPrank = useCallback((prank: PrankId) => {
    if (prank === "runaway-button") {
      stealButton();
      return;
    }
    const line = choosePrankSpeech(prank, sessionRef.current);
    speak(line.text, line.emotion, line.gesture);
    setHint("Resolva a ação da pegadinha abaixo ou use Pular pegadinha.");
  }, [speak, stealButton]);

  const send = useCallback((question: string) => {
    if (busyRef.current || answerRequestRef.current) return;
    let current = sessionRef.current;
    if (current.stage === "prank") {
      setHint("Enviar não avança esta pegadinha. Resolva o desafio ou use Pular pegadinha.");
      return;
    }
    if (!current.questionOriginal || current.stage === "answered") {
      if (!question.trim()) {
        speak("Você quer que eu responda o quê? O silêncio?", "curious", "point");
        return;
      }
      setAnswerText(null);
      setAnswerError(null);
      setAnswerCancelled(false);
      current = applySessionEvent({ type: "START_QUESTION", question });
    }
    current = applySessionEvent({ type: "REGISTER_ATTEMPT" });
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const decision = chooseNextAction(current, { reducedMotion });
    if (decision.kind === "await-prank") return;
    if (decision.kind === "answer") {
      void revealAnswer();
      return;
    }
    applySessionEvent({ type: "SHOW_PRANK", prank: decision.prank });
    showPrank(decision.prank);
  }, [applySessionEvent, revealAnswer, showPrank, speak]);

  const resetQuestion = useCallback(() => {
    answerRequestRef.current?.abort();
    answerRequestRef.current = null;
    setAnswering(false);
    setAnswerText(null);
    setAnswerError(null);
    setAnswerCancelled(false);
    resetAnimations();
    applySessionEvent({ type: "RESET_QUESTION" });
    speak("Recomeçamos. Sua pergunta continua no campo para você enviar de novo.", "neutral", "idle");
    setHint("Pergunta reiniciada; sua próxima tentativa começa uma nova rodada.");
  }, [applySessionEvent, resetAnimations, speak]);

  const enterTease = useCallback(() => {
    if (busyRef.current) return;
    speak("Você apertou Enter? Achei que queria escrever uma segunda linha. Eu decido 😌", "sarcastic", "point");
  }, [speak]);

  const wave = useCallback(() => {
    if (busyRef.current) return;
    dispatch({ type: "SET_GESTURE", gesture: "wave" });
    speak("Oi! Pode acenar de volta. Trabalhar já é outra história.", "neutral", "wave");
  }, [speak]);

  useEffect(() => {
    const actorAtMount = actorRef.current;
    const buttonAtMount = sendButtonRef.current;
    const timer = window.setInterval(() => {
      if (!busyRef.current && document.visibilityState === "visible") move();
    }, 12000);
    return () => {
      window.clearInterval(timer);
      answerRequestRef.current?.abort();
      answerRequestRef.current = null;
      sequenceRef.current?.kill();
      if (actorAtMount) gsap.killTweensOf(actorAtMount);
      if (buttonAtMount) gsap.killTweensOf(buttonAtMount);
    };
  }, [move]);

  return {
    state,
    session,
    answerText,
    answerError,
    answerCancelled,
    answering,
    busy,
    stolen,
    sceneRef,
    actorRef,
    sendButtonRef,
    hint,
    speak,
    send,
    setEmotion,
    setGesture,
    move,
    wave,
    enterTease,
    onPointerMove,
    onPointerLeave,
    retryAnswer,
    cancelAnswer,
    resolvePrank,
    skipPrank,
    resetQuestion,
    resetAnimations,
  };
}
