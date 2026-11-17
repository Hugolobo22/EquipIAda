import test from "node:test";
import assert from "node:assert/strict";
import {
  chooseNextAction, createSessionState, INITIAL_TRAITS, isMagicWordReply, isQuestionLocked, MAX_PRANKS, sessionReducer,
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
  state = sessionReducer(state, { type: "REQUEST_ANSWER" });
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

  state = sessionReducer(createSessionState({ ...INITIAL_TRAITS, drama: 90 }), {
    type: "START_QUESTION", question: "Explique com cuidado. ".repeat(30),
  });
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

test("pergunta fica bloqueada entre desafios e durante a consulta; só sucesso ou reinício libera edição", () => {
  const original = "  Minha pergunta exata?\n";
  assert.equal(isQuestionLocked(createSessionState()), false);
  let state = start(original);
  assert.equal(isQuestionLocked(state), true);
  state = sessionReducer(state, { type: "SHOW_PRANK", prank: "maintenance" });
  state = sessionReducer(state, { type: "RESOLVE_PRANK" });
  assert.equal(isQuestionLocked(state), true);
  assert.equal(sessionReducer(state, { type: "START_QUESTION", question: "Outra" }), state);
  state = sessionReducer(state, { type: "REQUEST_ANSWER" });
  assert.equal(state.stage, "answering");
  assert.equal(isQuestionLocked(state), true);
  assert.equal(sessionReducer(state, { type: "START_QUESTION", question: "Outra" }), state);
  state = sessionReducer(state, { type: "ANSWER" });
  assert.equal(isQuestionLocked(state), false);
  assert.equal(state.questionOriginal, original);
  state = sessionReducer(state, { type: "START_QUESTION", question: "Outra" });
  assert.equal(state.questionOriginal, "Outra");
  assert.equal(isQuestionLocked(sessionReducer(state, { type: "RESET_QUESTION" })), false);
});

for (const event of ["ANSWER_ERROR", "CANCEL_ANSWER"]) {
  test(`${event} preserva a rodada e nova tentativa não repete pegadinhas`, () => {
    let state = start("  Pergunta preservada?\n");
    state = sessionReducer(state, { type: "SHOW_PRANK", prank: "blackout" });
    state = sessionReducer(state, { type: "SKIP" });
    state = sessionReducer(state, { type: event });
    assert.equal(state.stage, event === "ANSWER_ERROR" ? "answer-error" : "answer-cancelled");
    assert.equal(isQuestionLocked(state), true);
    assert.equal(state.activePrank, null);
    assert.deepEqual(chooseNextAction(state), { kind: "answer" });
    assert.equal(sessionReducer(state, { type: "START_QUESTION", question: "Alterada" }), state);
    const snapshot = structuredClone(state);
    state = sessionReducer(state, { type: "REGISTER_ATTEMPT" });
    state = sessionReducer(state, { type: "REQUEST_ANSWER" });
    assert.equal(state.stage, "answering");
    assert.equal(state.questionOriginal, snapshot.questionOriginal);
    assert.equal(state.prankCount, snapshot.prankCount);
    assert.deepEqual(state.traits, snapshot.traits);
    state = sessionReducer(state, { type: "ANSWER" });
    assert.equal(state.stage, "answered");
  });
}

test("conclusão, falha e cancelamento fora da consulta não alteram uma rodada reiniciada", () => {
  const initial = createSessionState();
  for (const type of ["ANSWER", "ANSWER_ERROR", "CANCEL_ANSWER", "REQUEST_ANSWER"]) {
    assert.equal(sessionReducer(initial, { type }), initial);
  }
  const state = start();
  assert.equal(sessionReducer(state, { type: "ANSWER" }), state);
  assert.equal(sessionReducer(state, { type: "CANCEL_ANSWER" }), state);
});

test("rodadas curtas encerram em duas cenas; longas em três, sem alterar o limite durante a rodada", () => {
  for (const [question, drama, expected] of [["Quanto é 2+2?", 90, 2], ["Explique. ".repeat(15), 55, 3], ["Explique. ".repeat(60), 90, 4]]) {
    let state = sessionReducer(createSessionState({ ...INITIAL_TRAITS, drama }), { type: "START_QUESTION", question });
    assert.equal(state.prankBudget, expected);
    const seen = new Set();
    for (let i = 0; i < expected; i++) {
      state = sessionReducer(state, { type: "REGISTER_ATTEMPT" });
      const decision = chooseNextAction(state, { reducedMotion: true }, () => .1);
      assert.equal(decision.kind, "prank");
      assert.equal(seen.has(decision.prank), false);
      seen.add(decision.prank);
      state = sessionReducer(state, { type: "SHOW_PRANK", prank: decision.prank });
      state = sessionReducer(state, { type: "RESOLVE_PRANK" });
      assert.equal(state.prankBudget, expected);
    }
    assert.deepEqual(chooseNextAction(state), { kind: "answer" });
    assert.equal(sessionReducer(state, { type: "SHOW_PRANK", prank: "blackout" }), state);
    assert.equal(state.questionOriginal, question);
  }
});

test("contador de rodadas só avança no início e persiste ao reiniciar sem guardar histórico", () => {
  let state = start();
  assert.equal(state.roundCount, 1);
  assert.equal(sessionReducer(state, { type: "START_QUESTION", question: "Outra" }).roundCount, 1);
  state = sessionReducer(state, { type: "RESET_QUESTION" });
  assert.equal(state.roundCount, 1);
  assert.equal(state.questionOriginal, null);
  state = sessionReducer(state, { type: "START_QUESTION", question: "Outra" });
  assert.equal(state.roundCount, 2);
});
