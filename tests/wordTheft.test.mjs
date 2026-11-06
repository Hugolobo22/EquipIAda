import test from "node:test";
import assert from "node:assert/strict";
import { canStealWords, createWordTheftPreview } from "../src/lib/wordTheft.ts";
import { chooseNextAction, createSessionState, sessionReducer } from "../src/lib/sessionEngine.ts";

test("roubo mascara apenas a prévia e preserva pergunta e pontuação", () => {
  const original = "Como funciona o JavaScript?";
  const preview = createWordTheftPreview(original);
  assert.equal(preview, "Como ▯▯▯▯▯▯▯▯ o ▯▯▯▯▯▯▯▯?");
  assert.equal(createWordTheftPreview(original, [0]), "Como funciona o ▯▯▯▯▯▯▯▯?");
  assert.equal(createWordTheftPreview(original, [1]), "Como ▯▯▯▯▯▯▯▯ o JavaScript?");
  assert.equal(createWordTheftPreview(original, [1, 0]), original);
  assert.equal(original, "Como funciona o JavaScript?");
  assert.equal(canStealWords(original), true);
  assert.equal(canStealWords("Oi?"), false);
  assert.equal(createWordTheftPreview("Oi?"), "Oi?");
});

test("pular o ladrão de palavras mantém a pergunta exata e encerra o desafio", () => {
  const original = "  Como funciona a linguagem JavaScript no navegador?\n";
  let state = sessionReducer(createSessionState(), { type: "START_QUESTION", question: original });
  state = { ...state, usedPranks: ["interrogation", "dramatic-delay", "maintenance", "blackout"] };
  assert.deepEqual(chooseNextAction(state, { reducedMotion: true }), { kind: "prank", prank: "word-thief" });
  state = sessionReducer(state, { type: "SHOW_PRANK", prank: "word-thief" });
  assert.equal(state.prankCount, 1);
  assert.equal(state.activePrank, "word-thief");
  state = sessionReducer(state, { type: "SKIP" });
  assert.equal(state.questionOriginal, original);
  assert.equal(state.activePrank, null);
  assert.equal(state.stage, "answering");
});
