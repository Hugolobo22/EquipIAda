"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowRight, BrainCircuit, CheckCircle2, ChevronRight,
  Coffee, CornerDownLeft, Eye, Hand, MessageCircle, MousePointer2,
  Flashlight, Lightbulb, MoveUpRight, RotateCcw, Send, Sparkles, WandSparkles,
} from "lucide-react";
import { Mascot } from "@/components/Mascot";
import { MAX_PRANKS } from "@/lib/sessionEngine";
import { createWordTheftPreview } from "@/lib/wordTheft";
import { EMOTIONS, type MascotEmotion } from "@/types/mascot";
import type { PrankId } from "@/types/session";
import { useMascotScene } from "@/hooks/useMascotScene";

const faceIcons: Record<MascotEmotion, string> = {
  neutral: "◡", curious: "?", sarcastic: "↗", annoyed: "!", sleepy: "zZ",
};

const prankChallenges: Record<PrankId, { instruction: string; action: string }> = {
  "short-prompt": { instruction: "A IAda achou a pergunta curta. Confirme que quer manter exatamente esse texto.", action: "Manter minha pergunta" },
  "long-prompt": { instruction: "Ela reclamou do tamanho. Assuma o textão para continuar sem perder nenhuma palavra.", action: "Assumir o textão" },
  "runaway-button": { instruction: "Espere a IAda devolver o botão e recupere o controle da cena.", action: "Recuperar o botão" },
  interrogation: { instruction: "A pergunta dela é retórica. Confirme que você insiste na sua pergunta original.", action: "Sim, eu insisto" },
  "magic-word": { instruction: "Digite a expressão de duas palavras que a IAda pediu. Sua pergunta original fica intacta.", action: "Dizer a palavra mágica" },
  "word-thief": { instruction: "A IAda escondeu duas palavras em bolsos diferentes. Recupere cada uma; a pergunta original está segura.", action: "Devolver palavras" },
  blackout: { instruction: "Acenda a lanterna no palco e encontre o interruptor. Use Tab e Enter se preferir; Pular segue disponível.", action: "Restaurar a luz" },
  "dramatic-delay": { instruction: "O drama já passou. Chame a IAda de volta para continuar.", action: "Chega de drama" },
  maintenance: { instruction: "A manutenção era uma desculpa. Peça para ela encerrar a pausa.", action: "Encerrar a pausa" },
};

function BlackoutChallenge({ onRestore }: { onRestore: () => void }) {
  const [lanternOn, setLanternOn] = useState(false);
  const lanternRef = useRef<HTMLButtonElement>(null);
  const lightSwitchRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (lanternOn) lightSwitchRef.current?.focus();
    else lanternRef.current?.focus();
  }, [lanternOn]);

  return (
    <>
      <div className={`blackout-shade${lanternOn ? " lantern-lit" : ""}`} aria-hidden="true" />
      <button type="button" className="lantern-button" ref={lanternRef} onClick={() => setLanternOn(true)} disabled={lanternOn}>
        <Flashlight size={18} aria-hidden="true"/> {lanternOn ? "Lanterna acesa" : "Acender lanterna"}
      </button>
      {lanternOn && (
        <button type="button" className="light-switch" ref={lightSwitchRef} onClick={onRestore}>
          <Lightbulb size={20} aria-hidden="true"/> Restaurar a luz
        </button>
      )}
    </>
  );
}

export function Scene() {
  const { state, session, answerText, answerError, answerCancelled, answering, busy, stolen, sceneRef, actorRef, sendButtonRef, hint, speak, send, setEmotion, move, wave, enterTease, onPointerMove, onPointerLeave, skipPrank, resolvePrank, retryAnswer, cancelAnswer, resetQuestion } = useMascotScene();
  const [question, setQuestion] = useState("Como funciona o JavaScript?");
  const [prankReply, setPrankReply] = useState("");
  const [restoredWords, setRestoredWords] = useState<number[]>([]);
  const [aboutOpen, setAboutOpen] = useState(false);
  const answerPanelRef = useRef<HTMLElement>(null);
  const prankPanelRef = useRef<HTMLElement>(null);
  const prankInputRef = useRef<HTMLInputElement>(null);
  const wordReturnButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const previousStageRef = useRef(session.stage);
  const wordTheftActive = session.stage === "prank" && session.activePrank === "word-thief";
  const blackoutActive = session.stage === "prank" && session.activePrank === "blackout";
  const maskedQuestion = wordTheftActive && session.questionOriginal
    ? createWordTheftPreview(session.questionOriginal, restoredWords)
    : null;

  useEffect(() => {
    if (answering || answerText || answerError || answerCancelled) answerPanelRef.current?.focus();
  }, [answering, answerText, answerError, answerCancelled]);

  useEffect(() => {
    if (session.stage === "prank") {
      if (session.activePrank === "magic-word") prankInputRef.current?.focus();
      else if (session.activePrank !== "blackout") prankPanelRef.current?.focus();
    } else if (previousStageRef.current === "prank" && session.stage === "idle") {
      sendButtonRef.current?.focus();
    }
    previousStageRef.current = session.stage;
  }, [session.stage, session.activePrank, sendButtonRef]);

  useEffect(() => {
    if (wordTheftActive && restoredWords.length === 1) {
      wordReturnButtonsRef.current[1 - restoredWords[0]]?.focus();
    }
  }, [wordTheftActive, restoredWords]);

  function onResolvePrank() {
    if (resolvePrank(prankReply)) setPrankReply("");
  }

  function onReturnWord(index: number) {
    if (!wordTheftActive || restoredWords.includes(index)) return;
    const next = [...restoredWords, index];
    setRestoredWords(next);
    if (next.length === 2) {
      resolvePrank();
      setRestoredWords([]);
    } else {
      speak("Uma palavra voltou. A outra ainda está no meu bolso.", "sarcastic", "grab");
    }
  }

  function onSkipPrank() {
    setRestoredWords([]);
    skipPrank(question);
  }

  function onResetQuestion() {
    setRestoredWords([]);
    resetQuestion();
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      send(question);
    } else if (event.key === "Enter" && !event.shiftKey) {
      // Enter mantém comportamento de textarea (quebra de linha).
      enterTease();
    }
  }

  return (
    <div className="page-shell">
      <div className="background-flare flare-one" aria-hidden="true" />
      <div className="background-flare flare-two" aria-hidden="true" />
      <header className="topbar layout-width">
        <a href="#inicio" className="brand" aria-label="EquipIAda — início">
          <span className="brand-emblem"><Sparkles size={21} strokeWidth={2.6}/></span>
          <span>Equip<span className="brand-accent">IA</span>da<span className="brand-dot">.</span></span>
        </a>
        <nav className="topnav" aria-label="Navegação">
          <a href="#laboratorio" className="active-nav">Laboratório</a>
          <a href="#controles">Personalidade</a>
          <button type="button" onClick={() => setAboutOpen(!aboutOpen)} aria-expanded={aboutOpen}>Sobre o protótipo</button>
        </nav>
        <div className="top-status"><span className="status-light"/> IAda está acordada <span className="status-divider">·</span> v0.1</div>
      </header>

      <main className="layout-width" id="inicio">
        <div className="intro">
          <div className="eyebrow"><span className="eyebrow-spark">✦</span> CONHEÇA A IA MENOS PRESTATIVA DA INTERNET <span className="eyebrow-spark">✦</span></div>
          <h1>Ela tem todas as respostas.<br/><span>Só não quer te dar.</span></h1>
          <p>Faça uma pergunta. Conheça a IAda. E boa sorte tentando fazê-la trabalhar.</p>
        </div>

        {aboutOpen && (
          <section className="about-inline" aria-label="Sobre o protótipo">
            <strong>Uma demonstração de interação com a IAda.</strong>
            <span>O mascote é SVG animado e a resposta útil pode vir de um modelo Ollama neste computador. Sem o modelo configurado, a IAda informa que a resposta está indisponível.</span>
          </section>
        )}

        <div className="workspace" id="laboratorio">
          <section className="stage-frame" aria-label="Palco interativo da IAda">
            <div className="stage-top">
              <div className="stage-pills"><span className="purple-pill"><span className="purple-pulse"/> {stolen ? "BOTÃO SEQUESTRADO" : "EXPERIÊNCIA AO VIVO"}</span><span className="stage-meta">CENA 01 / A IA QUE NÃO QUER TRABALHAR</span></div>
              <div className="stage-top-icon"><WandSparkles size={16}/></div>
            </div>
            <div className="stage-body" ref={sceneRef} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
              <div className="stage-grid" aria-hidden="true"/>
              <div className="planet planet-one" aria-hidden="true">✳</div>
              <div className="planet planet-two" aria-hidden="true">✦</div>
              <div className="planet planet-three" aria-hidden="true">✧</div>
              <div className="tiny-note note-left"><span>💤</span> intervalo<br/>em andamento</div>
              <div className="tiny-note note-right"><span>✧</span> 0% motivada<br/>100% debochada</div>
              <div className="scene-floor" aria-hidden="true" />
              <div className="actor" ref={actorRef}>
                <div className="bubble" key={state.speech} role="status" aria-live="polite">
                  <span className="bubble-avatar">IA</span>
                  <p>{state.speech}</p>
                  <span className="bubble-tail" />
                </div>
                <Mascot emotion={state.emotion} gesture={state.gesture}/>
                <span className="mascot-shadow" aria-hidden="true"/>
              </div>
              {blackoutActive && <BlackoutChallenge onRestore={onResolvePrank} />}
              <div className="stage-bottom-group">
                {session.questionOriginal && <div className="last-question"><strong>Última pergunta:</strong>{" "}{maskedQuestion ? <><span aria-hidden="true">{maskedQuestion}</span><span className="sr-only">{session.questionOriginal}</span></> : session.questionOriginal}</div>}
                <div className={`composer${wordTheftActive ? " word-theft-active" : ""}`}>
                  <textarea
                    aria-label="Sua pergunta para a IAda"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    onKeyDown={onInputKeyDown}
                    readOnly={session.stage === "prank"}
                    placeholder="Escreva sua pergunta... se tiver coragem."
                    rows={2}
                    maxLength={4000}
                  />
                  {maskedQuestion && <div className="stolen-question-preview" aria-hidden="true">{maskedQuestion}</div>}
                  <button type="button" className="send-button" ref={sendButtonRef} onClick={() => send(question)} aria-label="Tentar enviar pergunta" disabled={busy || session.stage === "prank" || answering}>
                    <Send size={20} strokeWidth={2.4}/>
                  </button>
                </div>
                <div className="composer-help"><span><CornerDownLeft size={12}/> {session.stage === "prank" ? "Resolva o desafio abaixo ou use Pular pegadinha." : "Enter quebra linha. Ctrl + Enter tenta enviar."}</span><span><MousePointer2 size={12}/> Mova o cursor para testar os olhos</span></div>
              </div>
            </div>
            <div className="stage-footer">
              <div className="tip"><span className="tip-icon"><Sparkles size={16}/></span><span>{hint}</span></div>
              <button type="button" className="skip-button" onClick={onSkipPrank} title="Ignorar pegadinhas e pedir a resposta útil">Pular pegadinha <ArrowRight size={15}/></button>
            </div>
            {session.stage === "prank" && session.activePrank && (
              <section className="prank-panel" aria-label="Pegadinha ativa" ref={prankPanelRef} tabIndex={-1}>
                <strong>Desafio da IAda</strong>
                <p>{prankChallenges[session.activePrank].instruction}</p>
                {session.activePrank === "magic-word" ? (
                  <form onSubmit={event => { event.preventDefault(); onResolvePrank(); }}>
                    <input ref={prankInputRef} aria-label="Palavra mágica" value={prankReply} onChange={event => setPrankReply(event.target.value)} maxLength={80} autoComplete="off" placeholder="Dica: por favor" />
                    <button type="submit">{prankChallenges[session.activePrank].action}</button>
                  </form>
                ) : session.activePrank === "word-thief" ? (
                  <div className="word-return-controls" role="group" aria-label="Recuperar palavras">
                    <p aria-live="polite">{restoredWords.length} de 2 palavras devolvidas</p>
                    {[0, 1].map(index => (
                      <button key={index} type="button" ref={element => { wordReturnButtonsRef.current[index] = element; }} disabled={restoredWords.includes(index)} onClick={() => onReturnWord(index)}>
                        {restoredWords.includes(index) ? `Palavra ${index + 1} devolvida` : `Devolver palavra ${index + 1}`}
                      </button>
                    ))}
                  </div>
                ) : session.activePrank === "blackout" ? (
                  <p className="blackout-instruction">O interruptor aparece no palco depois que a lanterna acender.</p>
                ) : (
                  <button type="button" disabled={busy} onClick={onResolvePrank}>{prankChallenges[session.activePrank].action}</button>
                )}
              </section>
            )}
            {(answering || answerText || answerError || answerCancelled) && (
              <section className="answer-panel" aria-label="Resposta à pergunta original" ref={answerPanelRef} tabIndex={-1}>
                <strong>Resposta útil</strong>
                {answering && <div className="answer-wait"><p role="status">A IAda está gerando a resposta. Com o modelo local, isso pode levar cerca de um minuto.</p><button type="button" onClick={cancelAnswer}>Cancelar resposta</button></div>}
                {answerText && <p>{answerText}</p>}
                {answerError && <div role="alert"><p>{answerError}</p><button type="button" onClick={retryAnswer}>Tentar novamente</button></div>}
                {answerCancelled && <div><p role="status">Consulta cancelada. Sua pergunta original foi preservada.</p><button type="button" onClick={retryAnswer}>Tentar novamente</button></div>}
              </section>
            )}
          </section>

          <aside className="control-panel" id="controles">
            <div className="panel-header"><div className="panel-icon"><BrainCircuit size={20}/></div><div><h2>Controle de cena</h2><p>Brinque com o humor da IAda</p></div></div>
            <div className="panel-section">
              <div className="panel-section-label"><span>01</span> HUMOR ATUAL</div>
              <div className="emotions">
                {EMOTIONS.map(item => (
                  <button key={item.key} type="button" disabled={busy} className={`emotion-option ${state.emotion===item.key?"emotion-active":""}`} onClick={() => setEmotion(item.key)} aria-pressed={state.emotion===item.key}>
                    <span className="emotion-face">{faceIcons[item.key]}</span><span className="emotion-name">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="panel-separator"/>
            <div className="panel-section">
              <div className="panel-section-label"><span>02</span> AÇÕES</div>
              <div className="action-buttons">
                <button type="button" onClick={move} disabled={busy}><MoveUpRight size={18}/><span><strong>Passear pelo cenário</strong><small>Movimentação livre</small></span><ChevronRight size={16} className="action-chevron"/></button>
                <button type="button" onClick={wave} disabled={busy}><Hand size={18}/><span><strong>Acenar para você</strong><small>Gesto + balão de fala</small></span><ChevronRight size={16} className="action-chevron"/></button>
                <button type="button" onClick={()=>setEmotion("sarcastic")} disabled={busy}><MessageCircle size={18}/><span><strong>Modo debochado</strong><small>Sarcasmo ativado</small></span><ChevronRight size={16} className="action-chevron"/></button>
                <button type="button" onClick={()=>setEmotion("sleepy")} disabled={busy}><Coffee size={18}/><span><strong>Hora do cochilo</strong><small>Pausa dramática</small></span><ChevronRight size={16} className="action-chevron"/></button>
              </div>
            </div>
            <div className="panel-separator"/>
            <div className="panel-section">
              <div className="panel-section-label"><span>03</span> ESTADO DA SESSÃO</div>
              <div className="metric-card"><div><span>Pegadinhas nesta pergunta</span><strong>{session.prankCount} / {MAX_PRANKS}</strong></div><div className="progress-track"><div style={{width:`${session.prankCount / MAX_PRANKS * 100}%`}}/></div><small>Após o limite, a IAda encerra a encenação.</small></div>
              <button type="button" className="reset-control" onClick={onResetQuestion}><RotateCcw size={14}/> Reiniciar pergunta</button>
            </div>
            <div className="panel-bottom"><span className="star">✦</span><p><strong>Pequeno detalhe:</strong> a resposta útil depende do Ollama local. As pegadinhas continuam funcionando mesmo se o modelo estiver indisponível.</p></div>
          </aside>
        </div>

        <section className="feature-row" aria-label="Funcionalidades do protótipo">
          <div><span><Eye size={18}/></span><strong>Olhos que te seguem</strong><small>Tracking em tempo real</small></div>
          <div><span><WandSparkles size={18}/></span><strong>5 expressões</strong><small>Traços mudam na sessão</small></div>
          <div><span><MousePointer2 size={18}/></span><strong>Botão sequestrado</strong><small>Interação física animada</small></div>
          <div><span><CheckCircle2 size={18}/></span><strong>Um pouco de caos</strong><small>Mas sempre reversível</small></div>
        </section>
      </main>
      <footer className="layout-width footer"><span>© EquipIAda Lab — Feito para não ajudar.</span><span>Protótipo local · Next.js + React + GSAP + Ollama opcional</span></footer>
    </div>
  );
}
