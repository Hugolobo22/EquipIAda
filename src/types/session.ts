export type Trait = "laziness" | "sarcasm" | "drama" | "curiosity" | "patience";

export type Traits = Record<Trait, number>;

export type PrankId =
  | "short-prompt"
  | "long-prompt"
  | "runaway-button"
  | "interrogation"
  | "magic-word"
  | "word-thief"
  | "blackout"
  | "dramatic-delay"
  | "maintenance";

export type SessionStage = "idle" | "prank" | "answering" | "answered";

export type SessionState = {
  /** Cópia exata do primeiro envio; a UI nunca a reescreve durante a pergunta. */
  questionOriginal: string | null;
  attemptCount: number;
  prankCount: number;
  usedPranks: PrankId[];
  activePrank: PrankId | null;
  traits: Traits;
  stage: SessionStage;
};

export type SessionEvent =
  | { type: "START_QUESTION"; question: string }
  | { type: "REGISTER_ATTEMPT" }
  | { type: "SHOW_PRANK"; prank: PrankId }
  | { type: "RESOLVE_PRANK" }
  | { type: "SKIP" }
  | { type: "ANSWER" }
  | { type: "RESET_QUESTION" };

export type ChaosDecision = { kind: "prank"; prank: PrankId } | { kind: "answer" } | { kind: "await-prank"; prank: PrankId };
