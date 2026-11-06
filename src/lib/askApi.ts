export const MAX_QUESTION_LENGTH = 4000;
export const MAX_REQUEST_BYTES = 16_384;

export const ANSWER_INSTRUCTIONS = [
  "Responda à pergunta original em português do Brasil. A brincadeira acabou: não interprete a IAda nem imponha outra pergunta ao usuário.",
  "Siga o que foi pedido: quando a pergunta pede somente um dado isolado, como capital, ano, fórmula ou resultado de conta simples, responda em uma frase sem contexto adicional.",
  "Perguntas com 'como', 'por que', 'explique', 'diferença', 'mostre', 'exemplo' ou 'melhor' pedem explicação ou critérios. Nelas, nunca devolva apenas um nome ou resultado: comece pela resposta direta e depois explique os passos ou o motivo, com exemplo se ajudar.",
  "Priorize precisão. Omita detalhes sobre causas, pessoas ou consequências quando não tiver certeza; não preencha lacunas com suposições. Confira se afirmações e exemplos são consistentes, diferencie conceitos próximos e evite generalizações.",
  "Se mostrar código ou cálculo, confira que a descrição verbal corresponde exatamente à operação exibida.",
  "Se pedir um número, data, identificador ou fato inexistente ou sem dados confiáveis, diga em uma frase por que não é possível determinar e pare. Não crie estimativas, comparações, hipóteses nem regras gerais não solicitadas. Em perguntas abertas, declare uma suposição apenas quando necessária. Nunca invente fontes, números, datas ou citações.",
  "Ao comparar tecnologias ou explicar uma proteção, nomeie o mecanismo relevante e uma limitação que evite conclusão enganosa. Perguntas complexas podem ter parágrafos curtos, até cerca de 180 palavras. Termine sem ofertas genéricas de ajuda.",
  "Saída: texto puro. Não use Markdown, asteriscos de destaque, cercas de código, tabelas, emojis, tags de raciocínio ou instruções de interface.",
].join(" ");

/** Remove marcações comuns que modelos pequenos às vezes geram apesar das instruções. */
export function cleanAnswerText(value: string): string {
  return value
    .replace(/^```[^\n]*\n?/gm, "")
    .replace(/^\s*#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/\*\*([^*\n]+)\*\*/g, "$1")
    .replace(/`([^`\n]+)`/g, "$1")
    .trim();
}

export function validateQuestion(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= MAX_QUESTION_LENGTH;
}

type ResponseContent = { type?: unknown; text?: unknown };
type ResponseItem = { type?: unknown; content?: unknown };

/** A resposta HTTP não contém necessariamente a conveniência `output_text` do SDK. */
export function extractOutputText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) return null;
  const text = output
    .filter((item): item is ResponseItem => !!item && typeof item === "object" && item.type === "message")
    .flatMap(item => Array.isArray(item.content) ? item.content as ResponseContent[] : [])
    .filter(item => item?.type === "output_text" && typeof item.text === "string")
    .map(item => item.text as string)
    .join("\n")
    .trim();
  return text ? cleanAnswerText(text) : null;
}

export function extractOllamaText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const response = (payload as { response?: unknown }).response;
  return typeof response === "string" && response.trim() ? cleanAnswerText(response) : null;
}

/** Limite local de desenvolvimento; em produção precisa de armazenamento compartilhado. */
export function createRateLimiter(now: () => number = Date.now) {
  const buckets = new Map<string, { count: number; resetAt: number }>();
  return (key: string, maxPerHour: number) => {
    const time = now();
    const current = buckets.get(key);
    if (!current || current.resetAt <= time) {
      buckets.set(key, { count: 1, resetAt: time + 60 * 60 * 1000 });
      return true;
    }
    if (current.count >= maxPerHour) return false;
    current.count += 1;
    return true;
  };
}
