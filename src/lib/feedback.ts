import type { PrankId } from "../types/session.ts";

export const FEEDBACK_PRANKS: readonly PrankId[] = [
  "short-prompt", "long-prompt", "runaway-button", "interrogation", "magic-word",
  "word-thief", "blackout", "dramatic-delay", "maintenance",
];

export type Rating = 1 | 2 | 3;
export type FeedbackInput = { id: string; helpfulness: Rating; enjoyment: Rating; pranks: PrankId[] };
export type FeedbackSummary = { total: number; helpfulnessAverage: number | null; enjoymentAverage: number | null };

/** Contrato fechado: nenhum campo livre, pergunta ou resposta pode ser persistido. */
export function validateFeedback(value: unknown): value is FeedbackInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const data = value as Record<string, unknown>;
  if (Object.keys(data).some(key => !["id", "helpfulness", "enjoyment", "pranks"].includes(key))) return false;
  return typeof data.id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.id)
    && [1, 2, 3].includes(data.helpfulness as number)
    && [1, 2, 3].includes(data.enjoyment as number)
    && Array.isArray(data.pranks) && data.pranks.length <= 4
    && new Set(data.pranks).size === data.pranks.length
    && data.pranks.every(prank => FEEDBACK_PRANKS.includes(prank as PrankId));
}
