import test from "node:test";
import assert from "node:assert/strict";
import {
  chooseNextAction, createSessionState, INITIAL_TRAITS, isMagicWordReply, MAX_PRANKS, sessionReducer,
} from "../src/lib/sessionEngine.ts";

function start(question = "Como funciona o JavaScript?") {
  return sessionReducer(createSessionState(), { type: "START_QUESTION", question });
}

test("guarda a pergunta exata e não a troca durante a rodada", () => {
  const original = "  Como funciona o JavaScript?\n";
  let state = start(original);
  state = sessionReducer(state, { type: "REGISTER_ATTEMPT" });
  state = sessionReducer(state, { type: "SHOW_PRANK", prank: "interrogation" });
  state = sessionReducer(state, { type: "SHOW_PRANK", prank: "interrogation" });
  state = sessionReducer(state, { type: "START_QUESTION", question: "Pergunta adulterada" });
  assert.equal(state.questionOriginal, original);
  assert.equal(state.prankCount, 1);
});

test("traços evoluem, ficam entre 0 e 100 e persistem na próxima pergunta", () => {
  let state = start();
  for (let index = 0; index < 40; index++) state = sessionReducer(state, { type: "REGISTER_ATTEMPT" });
  assert.equal(state.traits.patience, 0);
  assert.equal(state.traits.sarcasm, 100);
  state = sessionReducer(state, { type: "ANSWER" });
  state = sessionReducer(state, { type: "START_QUESTION", question: "Outra pergunta" });
  assert.equal(state.traits.patience, 0);
  assert.equal(state.attemptCount, 0);
  assert.deepEqual(INITIAL_TRAITS, { laziness: 85, sarcasm: 65, drama: 55, curiosity: 40, patience: 45 });
});

test("seleciona por contexto sem repetir uma pegadinha", () => {
  let state = start("Oi?");
  for (const prank of ["interrogation", "dramatic-delay", "maintenance", "runaway-button"]) {
    state = sessionReducer(state, { type: "SHOW_PRANK", prank });
    state = sessionReducer(state, { type: "RESOLVE_PRANK" });
  }
  // O limite prevalece mesmo quando ainda existe uma ação contextual elegível.
  assert.deepEqual(chooseNextAction(state, {}, () => 0), { kind: "answer" });

  state = start("Oi?");
  state = { ...state, usedPranks: ["interrogation", "dramatic-delay", "maintenance", "runaway-button"] };
  assert.deepEqual(chooseNextAction(state, {}, () => 0), { kind: "prank", prank: "short-prompt" });

  state = start("Explique ".repeat(30));
  state = { ...state, usedPranks: ["interrogation", "dramatic-delay", "maintenance", "runaway-button"] };
  assert.deepEqual(chooseNextAction(state, {}, () => 0), { kind: "prank", prank: "long-prompt" });
});

test("movimento reduzido exclui o botão fugitivo", () => {
  const state = start();
  for (const random of [() => 0, () => 0.5, () => 0.999999]) {
    assert.notEqual(chooseNextAction(state, { reducedMotion: true }, random).prank, "runaway-button");
  }
});

test("os traços mudam a escolha com o mesmo sorteio", () => {
  const state = {
    ...start("Uma pergunta de tamanho intermediário e sem gatilho de comprimento."),
    usedPranks: ["word-thief", "blackout"],
  };
  const initial = chooseNextAction(state, { reducedMotion: true }, () => 0.4);
  const curious = chooseNextAction({
    ...state,
    traits: { ...state.traits, curiosity: 100, drama: 0, laziness: 0 },
  }, { reducedMotion: true }, () => 0.4);
  assert.deepEqual(initial, { kind: "prank", prank: "dramatic-delay" });
  assert.deepEqual(curious, { kind: "prank", prank: "interrogation" });
});

test("pular e chegar ao limite sempre levam ao encerramento", () => {
  let state = start();
  state = sessionReducer(state, { type: "SKIP" });
  assert.deepEqual(chooseNextAction(state), { kind: "answer" });
  assert.equal(sessionReducer(state, { type: "ANSWER" }).stage, "answered");

  state = start();
  for (const prank of ["interrogation", "dramatic-delay", "maintenance", "runaway-button"]) {
    state = sessionReducer(state, { type: "SHOW_PRANK", prank });
    state = sessionReducer(state, { type: "RESOLVE_PRANK" });
  }
  assert.equal(state.prankCount, MAX_PRANKS);
  assert.deepEqual(chooseNextAction(state), { kind: "answer" });
  assert.equal(sessionReducer(state, { type: "SHOW_PRANK", prank: "short-prompt" }).prankCount, MAX_PRANKS);
});

test("spam em Enviar não avança pegadinha ativa nem altera a pergunta", () => {
  let state = start("  Qual é a capital do Brasil? ");
  state = sessionReducer(state, { type: "REGISTER_ATTEMPT" });
  state = sessionReducer(state, { type: "SHOW_PRANK", prank: "interrogation" });
  const attempts = state.attemptCount;
  const traits = state.traits;
  for (let index = 0; index < 20; index++) {
    state = sessionReducer(state, { type: "REGISTER_ATTEMPT" });
    state = sessionReducer(state, { type: "SHOW_PRANK", prank: "maintenance" });
  }
  assert.equal(state.attemptCount, attempts);
  assert.equal(state.prankCount, 1);
  assert.equal(state.questionOriginal, "  Qual é a capital do Brasil? ");
  assert.deepEqual(state.traits, traits);
  assert.deepEqual(chooseNextAction(state), { kind: "await-prank", prank: "interrogation" });
  state = sessionReducer(state, { type: "RESOLVE_PRANK" });
  assert.equal(state.stage, "idle");
  assert.equal(state.activePrank, null);
  state = sessionReducer(state, { type: "REGISTER_ATTEMPT" });
  assert.equal(state.attemptCount, attempts + 1);
});

test("palavra mágica só aparece após insistência e não se repete", () => {
  let state = start("Explique o funcionamento de uma linguagem de programação de maneira bem simples.");
  assert.notEqual(chooseNextAction(state, {}, () => 0.99).prank, "magic-word");
  state = sessionReducer(state, { type: "REGISTER_ATTEMPT" });
  state = sessionReducer(state, { type: "REGISTER_ATTEMPT" });
  state = { ...state, usedPranks: ["interrogation", "dramatic-delay", "maintenance", "runaway-button", "word-thief", "blackout"] };
  assert.deepEqual(chooseNextAction(state), { kind: "prank", prank: "magic-word" });
  state = sessionReducer(state, { type: "SHOW_PRANK", prank: "magic-word" });
  state = sessionReducer(state, { type: "RESOLVE_PRANK" });
  assert.notEqual(chooseNextAction(state).prank, "magic-word");
});

test("palavra mágica aceita variações sem alterar a pergunta", () => {
  assert.equal(isMagicWordReply("Por favor, IAda!"), true);
  assert.equal(isMagicWordReply("POR   FAVOR"), true);
  assert.equal(isMagicWordReply("favor"), false);
  assert.equal(isMagicWordReply("porfavor"), false);
});

test("apagão ocupa uma pegadinha e não avança com spam em Enviar", () => {
  let state = start("  Explique o ciclo da água. ");
  state = { ...state, usedPranks: ["interrogation", "dramatic-delay", "maintenance", "runaway-button", "word-thief", "short-prompt"] };
  assert.deepEqual(chooseNextAction(state), { kind: "prank", prank: "blackout" });
  state = sessionReducer(state, { type: "SHOW_PRANK", prank: "blackout" });
  for (let index = 0; index < 10; index++) state = sessionReducer(state, { type: "REGISTER_ATTEMPT" });
  assert.equal(state.prankCount, 1);
  assert.equal(state.questionOriginal, "  Explique o ciclo da água. ");
  assert.deepEqual(chooseNextAction(state), { kind: "await-prank", prank: "blackout" });
  state = sessionReducer(state, { type: "SKIP" });
  assert.deepEqual(chooseNextAction(state), { kind: "answer" });
});

test("catálogo esgotado encerra e reinício mantém os traços", () => {
  let state = start("Uma pergunta de tamanho intermediário que não ativa gatilhos de texto curto ou longo.");
  state = { ...state, usedPranks: ["interrogation", "dramatic-delay", "maintenance", "runaway-button", "word-thief", "blackout"] };
  assert.deepEqual(chooseNextAction(state), { kind: "answer" });
  state = sessionReducer(state, { type: "REGISTER_ATTEMPT" });
  const traits = state.traits;
  state = sessionReducer(state, { type: "RESET_QUESTION" });
  assert.equal(state.questionOriginal, null);
  assert.equal(state.prankCount, 0);
  assert.deepEqual(state.traits, traits);
});
