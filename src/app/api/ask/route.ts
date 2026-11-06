import { NextResponse } from "next/server";
import { ANSWER_INSTRUCTIONS, createRateLimiter, extractOllamaText, extractOutputText, MAX_REQUEST_BYTES, validateQuestion } from "@/lib/askApi";

export const runtime = "nodejs";

const allowLocalRequest = createRateLimiter();
const noStore = { "Cache-Control": "no-store" };

function error(status: number, code: string, message: string) {
  return NextResponse.json({ code, error: message }, { status, headers: noStore });
}

function positiveInteger(value: string | undefined) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

export async function POST(request: Request) {
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") {
    return error(415, "UNSUPPORTED_MEDIA", "Envie JSON.");
  }
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    return error(413, "TOO_LARGE", "Pergunta grande demais.");
  }
  let body: unknown;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > MAX_REQUEST_BYTES) {
      return error(413, "TOO_LARGE", "Pergunta grande demais.");
    }
    body = JSON.parse(raw);
  } catch {
    return error(400, "INVALID_JSON", "JSON inválido.");
  }
  const question = body && typeof body === "object" ? (body as { question?: unknown }).question : undefined;
  if (!validateQuestion(question)) {
    return error(400, "INVALID_QUESTION", "Escreva uma pergunta com até 4.000 caracteres.");
  }

  // O limite em memória não funciona entre instâncias. Produção só após limite compartilhado e orçamento definidos.
  if (process.env.NODE_ENV === "production") {
    return error(503, "PRODUCTION_DISABLED", "A consulta por IA ainda não está habilitada em produção.");
  }

  const provider = process.env.ANSWER_PROVIDER;
  if (provider !== "ollama" && provider !== "openai") {
    return error(503, "NOT_CONFIGURED", "Escolha um provedor de IA antes de responder.");
  }
  const maxPerHour = provider === "ollama"
    ? 20
    : positiveInteger(process.env.OPENAI_MAX_REQUESTS_PER_HOUR);
  if (!maxPerHour) return error(503, "NOT_CONFIGURED", "Defina o limite de consultas por hora.");

  const clientAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowLocalRequest(clientAddress, Math.min(maxPerHour, 60))) {
    return error(429, "RATE_LIMITED", "Muitas perguntas nesta hora. Tente mais tarde.");
  }

  if (provider === "ollama") {
    const localModel = process.env.OLLAMA_MODEL || "qwen3:4b-instruct";
    try {
      const upstream = await fetch("http://127.0.0.1:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: localModel,
          prompt: question,
          system: ANSWER_INSTRUCTIONS,
          stream: false,
          think: false,
          options: { num_predict: 448, temperature: 0.1 },
        }),
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(90_000)]),
        cache: "no-store",
      });
      if (!upstream.ok) return error(502, "LOCAL_MODEL_ERROR", "O modelo local não conseguiu responder.");
      const payload: unknown = await upstream.json();
      const answer = extractOllamaText(payload);
      if (!answer) return error(502, "EMPTY_ANSWER", "O modelo local não retornou texto.");
      return NextResponse.json({ answer, provider: "ollama" }, { headers: noStore });
    } catch {
      return error(503, "OLLAMA_UNAVAILABLE", "Ollama não está disponível neste computador.");
    }
  }

  const key = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;
  if (process.env.OPENAI_ENABLE_PAID_CALLS !== "true" || !key || !model) {
    return error(503, "NOT_CONFIGURED", "A resposta por IA paga ainda não está configurada.");
  }

  const maxOutput = Math.max(16, Math.min(1024, positiveInteger(process.env.OPENAI_MAX_OUTPUT_TOKENS) ?? 512));
  try {
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        instructions: ANSWER_INSTRUCTIONS,
        input: question,
        max_output_tokens: maxOutput,
        store: false,
      }),
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(15_000)]),
      cache: "no-store",
    });
    if (!upstream.ok) {
      return error(upstream.status === 429 ? 429 : 502, "UPSTREAM_ERROR", "Não foi possível consultar a IA agora.");
    }
    const payload: unknown = await upstream.json();
    const answer = extractOutputText(payload);
    if (!answer) return error(502, "EMPTY_ANSWER", "A IA não retornou uma resposta legível.");
    return NextResponse.json({ answer, provider: "openai" }, { headers: noStore });
  } catch {
    return error(504, "UPSTREAM_TIMEOUT", "A consulta demorou demais. Tente novamente.");
  }
}
