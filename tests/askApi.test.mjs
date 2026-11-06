import test from "node:test";
import assert from "node:assert/strict";
import { cleanAnswerText, createRateLimiter, extractOllamaText, extractOutputText, validateQuestion } from "../src/lib/askApi.ts";

test("aceita pergunta válida sem alterar espaços e rejeita entrada vazia ou longa", () => {
  assert.equal(validateQuestion("  Qual a resposta?\n"), true);
  assert.equal(validateQuestion("   \n"), false);
  assert.equal(validateQuestion("x".repeat(4001)), false);
  assert.equal(validateQuestion({ question: "texto" }), false);
});

test("extrai apenas texto de mensagens da resposta HTTP", () => {
  const payload = { output: [
    { type: "reasoning", content: [{ type: "summary_text", text: "interno" }] },
    { type: "message", content: [{ type: "output_text", text: "Primeira parte" }] },
    { type: "message", content: [{ type: "output_text", text: "Segunda parte" }] },
  ] };
  assert.equal(extractOutputText(payload), "Primeira parte\nSegunda parte");
  assert.equal(extractOutputText({ output: [] }), null);
  assert.equal(extractOutputText(null), null);
});

test("extrai texto da resposta local sem aceitar objetos inválidos", () => {
  assert.equal(extractOllamaText({ response: "  Resposta local.  ", done: true }), "Resposta local.");
  assert.equal(extractOllamaText({ response: " " }), null);
  assert.equal(extractOllamaText({ response: 42 }), null);
});

test("limpa Markdown residual sem remover código ou o conteúdo da resposta", () => {
  const raw = "**Exemplo:**\n```javascript\nconst objeto = { valor: 1 };\n```\n> O objeto muda, mas a referência `objeto` não pode ser reatribuída.";
  const expected = "Exemplo:\nconst objeto = { valor: 1 };\nO objeto muda, mas a referência objeto não pode ser reatribuída.";
  assert.equal(cleanAnswerText(raw), expected);
  assert.equal(extractOllamaText({ response: raw }), expected);
});

test("limite local bloqueia excesso e libera após uma hora", () => {
  let time = 0;
  const allow = createRateLimiter(() => time);
  assert.equal(allow("client-A", 2), true);
  assert.equal(allow("client-A", 2), true);
  assert.equal(allow("client-A", 2), false);
  assert.equal(allow("client-B", 2), true);
  time = 60 * 60 * 1000;
  assert.equal(allow("client-A", 2), true);
});
