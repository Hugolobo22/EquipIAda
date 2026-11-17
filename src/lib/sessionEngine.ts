import type { ChaosDecision, PrankId, SessionEvent, SessionState, Traits } from "@/types/session";
import { canStealWords } from "./wordTheft.ts";

export const MAX_PRANKS = 4;

export function isMagicWordReply(value: string) {
  return /\bpor\s+favor\b/i.test(value);
}

export const INITIAL_TRAITS: Traits = {
  laziness: 85,
  sarcasm: 65,
  drama: 55,
  curiosity: 40,
  patience: 45,
};

function clampTrait(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function createSessionState(traits: Traits = INITIAL_TRAITS, roundCount = 0): SessionState {
  return {
    questionOriginal: null,
    attemptCount: 0,
    prankCount: 0,
    prankBudget: MAX_PRANKS,
    roundCount,
    usedPranks: [],
    activePrank: null,
    traits: { ...traits },
    stage: "idle",
  };
}

/** Perguntas curtas têm duas cenas; longas têm três, ou quatro com drama alto. */
export function questionPrankBudget(question: string, traits: Traits) {
  if (question.trim().length <= 80) return 2;
  return question.trim().length > 400 && traits.drama >= 80 ? MAX_PRANKS : 3;
}

/** A rodada termina apenas com resposta recebida ou reinício explícito. */
export function isQuestionLocked(state: SessionState) {
  return state.questionOriginal !== null && state.stage !== "answered";
}

export function sessionReducer(state: SessionState, event: SessionEvent): SessionState {
  switch (event.type) {
    case "START_QUESTION":
      if (!event.question.trim() || isQuestionLocked(state)) return state;
      return {
        ...createSessionState(state.traits, state.roundCount + 1),
        questionOriginal: event.question,
        prankBudget: questionPrankBudget(event.question, state.traits),
      };
    case "REGISTER_ATTEMPT":
      if (!state.questionOriginal || state.stage !== "idle") return state;
      return {
        ...state,
        attemptCount: state.attemptCount + 1,
        traits: {
          ...state.traits,
          laziness: clampTrait(state.traits.laziness - 2),
          sarcasm: clampTrait(state.traits.sarcasm + 2),
          curiosity: clampTrait(state.traits.curiosity + 1),
          patience: clampTrait(state.traits.patience - 3),
        },
      };
    case "SHOW_PRANK":
      if (!state.questionOriginal || state.stage !== "idle" ||
          state.prankCount >= Math.min(MAX_PRANKS, state.prankBudget) || state.usedPranks.includes(event.prank)) return state;
      return {
        ...state,
        prankCount: state.prankCount + 1,
        usedPranks: [...state.usedPranks, event.prank],
        activePrank: event.prank,
        stage: "prank",
        traits: { ...state.traits, drama: clampTrait(state.traits.drama + 2) },
      };
    case "RESOLVE_PRANK":
      if (state.stage !== "prank") return state;
      return { ...state, stage: "idle", activePrank: null };
    case "SKIP":
      if (!state.questionOriginal || state.stage === "answered" || state.stage === "answering") return state;
      return {
        ...state,
        stage: "answering",
        activePrank: null,
        traits: { ...state.traits, patience: clampTrait(state.traits.patience + 5) },
      };
    case "REQUEST_ANSWER":
      if (!state.questionOriginal || state.stage === "prank" || state.stage === "answered") return state;
      return { ...state, stage: "answering", activePrank: null };
    case "ANSWER":
      return state.stage === "answering" ? { ...state, stage: "answered" } : state;
    case "ANSWER_ERROR":
      return state.stage === "answering" ? { ...state, stage: "answer-error" } : state;
    case "CANCEL_ANSWER":
      return state.stage === "answering" ? { ...state, stage: "answer-cancelled" } : state;
    case "RESET_QUESTION":
      return createSessionState(state.traits, state.roundCount);
  }
}

type Choice = { prank: PrankId; weight: number };

/** Não conhece React, GSAP nem texto de balão; random é injetável para testes. */
export function chooseNextAction(
  state: SessionState,
  options: { reducedMotion?: boolean } = {},
  random: () => number = Math.random,
): ChaosDecision {
  if (state.stage === "prank" && state.activePrank) return { kind: "await-prank", prank: state.activePrank };
  if (!state.questionOriginal || state.stage !== "idle" ||
      state.prankCount >= Math.min(MAX_PRANKS, state.prankBudget)) return { kind: "answer" };

  const length = state.questionOriginal.trim().length;
  const choices: Choice[] = [
    { prank: "interrogation", weight: 2 + state.traits.curiosity / 20 },
    { prank: "dramatic-delay", weight: 2 + state.traits.drama / 20 },
    { prank: "maintenance", weight: 2 + state.traits.laziness / 20 },
  ];
  if (length < 45) choices.push({ prank: "short-prompt", weight: 8 });
  if (length > 160) choices.push({ prank: "long-prompt", weight: 8 });
  if (state.attemptCount >= 2) choices.push({ prank: "magic-word", weight: 9 });
  if (canStealWords(state.questionOriginal)) choices.push({ prank: "word-thief", weight: 9 });
  choices.push({ prank: "blackout", weight: 8 });
  if (!options.reducedMotion) choices.push({ prank: "runaway-button", weight: 3 + state.traits.sarcasm / 20 });

  const eligible = choices.filter(choice => !state.usedPranks.includes(choice.prank));
  if (eligible.length === 0) return { kind: "answer" };
  const total = eligible.reduce((sum, choice) => sum + choice.weight, 0);
  let target = Math.min(Math.max(random(), 0), 0.999999) * total;
  for (const choice of eligible) {
    target -= choice.weight;
    if (target < 0) return { kind: "prank", prank: choice.prank };
  }
  return { kind: "prank", prank: eligible[eligible.length - 1].prank };
}
