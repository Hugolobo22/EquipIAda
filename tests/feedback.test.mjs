import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { validateFeedback } from "../src/lib/feedback.ts";

function valid() { return { id: randomUUID(), helpfulness: 3, enjoyment: 2, pranks: ["blackout"] }; }

test("avaliação aceita somente notas, identificador e até quatro cenas conhecidas", () => {
  assert.equal(validateFeedback(valid()), true);
  assert.equal(validateFeedback({ ...valid(), pranks: [] }), true);
  for (const change of [
    { id: "não é UUID" }, { helpfulness: 0 }, { enjoyment: 4 }, { enjoyment: "3" },
    { pranks: ["blackout", "blackout"] }, { pranks: ["desconhecida"] },
    { pranks: ["blackout", "maintenance", "word-thief", "magic-word", "interrogation"] },
  ]) assert.equal(validateFeedback({ ...valid(), ...change }), false);
  assert.equal(validateFeedback(null), false);
  assert.equal(validateFeedback([]), false);
});

test("campos de pergunta, resposta e dados livres são rejeitados para preservar privacidade", () => {
  for (const field of ["question", "questionOriginal", "answer", "name", "comment", "email"]) {
    assert.equal(validateFeedback({ ...valid(), [field]: "texto que não deve ser salvo" }), false);
  }
});
