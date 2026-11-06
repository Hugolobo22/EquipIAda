import test from "node:test";
import assert from "node:assert/strict";
import { chooseAnswerReadySpeech, chooseAnswerSpeech, choosePrankSpeech } from "../src/lib/contextualSpeech.ts";
import { createSessionState, sessionReducer } from "../src/lib/sessionEngine.ts";

function start(question) {
  return sessionReducer(createSessionState(), { type: "START_QUESTION", question });
}

test("a piada reage ao assunto sem copiar nem alterar a pergunta original", () => {
  const code = start("  Como funciona uma variável em JavaScript?  ");
  const calculation = start("Quanto é 20% de 150?");
  const snapshot = structuredClone(code);
  const codeLine = choosePrankSpeech("interrogation", code);
  const calculationLine = choosePrankSpeech("interrogation", calculation);

  assert.match(codeLine.text, /código/i);
  assert.match(calculationLine.text, /conta/i);
  assert.notEqual(codeLine.text, calculationLine.text);
  assert.equal(codeLine.text.includes(code.questionOriginal), false);
  assert.deepEqual(code, snapshot);
});

test("pular e vencer desafios rendem falas diferentes sem mudar a resposta factual", () => {
  const question = "Como funciona o JavaScript?";
  const initial = start(question);
  const skipped = sessionReducer(initial, { type: "SKIP" });
  const challenged = { ...initial, prankCount: 3 };

  assert.match(chooseAnswerSpeech(skipped).text, /atalho/i);
  assert.match(chooseAnswerSpeech(challenged).text, /3 pegadinhas/i);
  assert.match(chooseAnswerSpeech(initial).text, /código/i);
  assert.equal(skipped.questionOriginal, question);
  assert.equal(challenged.questionOriginal, question);
});

test("pergunta sem categoria conhecida usa curiosidade da sessão e não repete dados privados", () => {
  const original = "Qual é o significado de X7Q9?";
  const session = start(original);
  const curious = { ...session, traits: { ...session.traits, curiosity: 75 } };

  assert.notEqual(chooseAnswerSpeech(session).text, chooseAnswerSpeech(curious).text);
  assert.equal(chooseAnswerSpeech(curious).text.includes("X7Q9"), false);
});

test("a fala após resposta mantém o contexto no balão sem incorporar a pergunta", () => {
  const code = start("Como funciona uma variável em JavaScript?");
  const calculation = start("Quanto é 20% de 150?");

  assert.match(chooseAnswerReadySpeech(code).text, /código/i);
  assert.match(chooseAnswerReadySpeech(calculation).text, /conta/i);
  assert.equal(chooseAnswerReadySpeech(calculation).text.includes(calculation.questionOriginal), false);
});
