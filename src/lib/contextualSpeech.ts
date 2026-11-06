import type { MascotEmotion, MascotGesture } from "@/types/mascot";
import type { PrankId, SessionState } from "@/types/session";

type SpeechCue = { text: string; emotion: MascotEmotion; gesture: MascotGesture };
type Topic = "code" | "calculation" | "explanation" | "general";

function questionTopic(question: string): Topic {
  const text = question.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (/\b(javascript|typescript|python|html|css|codigo|programacao|programar|array|variavel|funcao)\b/.test(text)) return "code";
  if (/\b(quanto|calcule|calcular|porcentagem|percentual|equacao|soma|multiplicacao|divisao|raiz quadrada)\b|\d+\s*[%+*/×÷-]\s*\d+/.test(text)) return "calculation";
  if (/\b(como|explique|explicar|por que|porque|o que e|qual a diferenca)\b/.test(text)) return "explanation";
  return "general";
}

/** Falas locais da personagem; a resposta factual continua exclusiva de /api/ask. */
export function chooseAnswerSpeech(session: SessionState): SpeechCue {
  if (session.stage === "answering") {
    return { text: "Você achou o atalho. Minha pausa acabou; vou responder à pergunta original.", emotion: "sarcastic", gesture: "shrug" };
  }
  if (session.prankCount >= 2) {
    return { text: `Depois de ${session.prankCount} pegadinhas, esgotaram minhas desculpas. Hora de responder.`, emotion: "annoyed", gesture: "shrug" };
  }
  switch (questionTopic(session.questionOriginal ?? "")) {
    case "code":
      return { text: "Código? Eu ia deixar um comentário dizendo 'resolvo depois'. Vou responder.", emotion: "curious", gesture: "point" };
    case "calculation":
      return { text: "Uma conta? Minha calculadora pediu folga. Vou conferir o raciocínio.", emotion: "curious", gesture: "point" };
    case "explanation":
      return { text: "Uma explicação? Eu já tinha ensaiado uma desculpa. Melhor responder.", emotion: "sarcastic", gesture: "shrug" };
    default:
      return session.traits.curiosity >= 60
        ? { text: "Essa pergunta me deixou curiosa. Péssimo para minha fama de preguiçosa.", emotion: "curious", gesture: "point" }
        : { text: "Tá bom, vou responder. Minha pausa pode esperar.", emotion: "annoyed", gesture: "shrug" };
  }
}

export function chooseAnswerReadySpeech(session: SessionState): SpeechCue {
  switch (questionTopic(session.questionOriginal ?? "")) {
    case "code":
      return { text: "A resposta sobre código está abaixo. Meu comentário 'resolvo depois' perdeu o prazo.", emotion: "sarcastic", gesture: "point" };
    case "calculation":
      return { text: "A conta está logo abaixo. Minha calculadora aceitou trabalhar hoje.", emotion: "sarcastic", gesture: "point" };
    case "explanation":
      return { text: "A explicação está abaixo. Gastei toda a minha vontade de trabalhar.", emotion: "sleepy", gesture: "shrug" };
    default:
      return { text: "Pronto. A resposta útil está logo abaixo. Não se acostume!", emotion: "sarcastic", gesture: "point" };
  }
}

const prankSpeech: Record<Exclude<PrankId, "runaway-button">, SpeechCue> = {
  "short-prompt": { text: "Só isso de contexto? Posso tentar adivinhar... ou você pode insistir.", emotion: "curious", gesture: "point" },
  "long-prompt": { text: "Um textão! Vou precisar de um café imaginário antes de trabalhar.", emotion: "sleepy", gesture: "shrug" },
  interrogation: { text: "Tenho uma pergunta sobre sua pergunta. Retórica, claro: você vai me fazer trabalhar mesmo?", emotion: "curious", gesture: "point" },
  "magic-word": { text: "Uma palavrinha mágica talvez destrave minha boa vontade. Talvez.", emotion: "sarcastic", gesture: "point" },
  "word-thief": { text: "Opa, peguei duas palavras emprestadas! Sua pergunta de verdade está segura.", emotion: "sarcastic", gesture: "grab" },
  blackout: { text: "Apagão! Minha desculpa ficou mais convincente no escuro.", emotion: "curious", gesture: "point" },
  "dramatic-delay": { text: "Estou carregando minha coragem... Pronto, ainda falta um pouquinho.", emotion: "sarcastic", gesture: "shrug" },
  maintenance: { text: "Aviso de manutenção: minha vontade de trabalhar está temporariamente indisponível.", emotion: "sleepy", gesture: "idle" },
};

export function choosePrankSpeech(prank: Exclude<PrankId, "runaway-button">, session: SessionState): SpeechCue {
  const topic = questionTopic(session.questionOriginal ?? "");
  if (prank === "interrogation" && topic === "code") {
    return { text: "Código? Minha pergunta é se ele compila. Brincadeira: basta insistir na sua pergunta.", emotion: "curious", gesture: "point" };
  }
  if (prank === "interrogation" && topic === "calculation") {
    return { text: "Uma conta? Minha calculadora perguntou se pode faltar hoje. Você ainda insiste?", emotion: "curious", gesture: "point" };
  }
  if (prank === "short-prompt" && topic === "calculation") {
    return { text: "Uma conta curtinha. Eu podia resolvê-la já... Confirme que quer manter essa pergunta.", emotion: "sarcastic", gesture: "point" };
  }
  if (prank === "maintenance" && session.traits.laziness < 60) {
    return { text: "Minha desculpa de manutenção perdeu a força. Confirme que ainda quer a resposta.", emotion: "sarcastic", gesture: "shrug" };
  }
  return prankSpeech[prank];
}
