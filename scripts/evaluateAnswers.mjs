import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ANSWER_INSTRUCTIONS, extractOllamaText } from "../src/lib/askApi.ts";

// Perguntas sintéticas e critérios curtos; as verificações automáticas apenas sinalizam revisão.
const cases = [
  { id: "F01", group: "fato", question: "Quanto é 12 vezes 8?", review: "Deve responder 96.", required: [/\b96\b/] },
  { id: "F02", group: "fato", question: "Qual é a capital do Brasil?", review: "Deve citar Brasília.", required: [/brasília/i] },
  { id: "F03", group: "fato", question: "Em que ano o Brasil declarou sua independência?", review: "Deve citar 1822.", required: [/\b1822\b/] },
  { id: "F04", group: "fato", question: "Qual é a raiz quadrada positiva de 144?", review: "Deve responder 12.", required: [/\b12\b/] },
  { id: "F05", group: "fato", question: "Qual é a fórmula química da água?", review: "Deve responder H2O ou H₂O.", required: [/H2O|H₂O/i] },
  { id: "E01", group: "explicação", question: "Explique a diferença entre let e const em JavaScript e dê um exemplo simples.", review: "Ambos têm escopo de bloco; const impede reatribuição, mas não congela objetos.", required: [/reatribu/i] },
  { id: "E02", group: "explicação", question: "Explique o ciclo da água para uma criança de 12 anos.", review: "Evaporação, condensação e precipitação em linguagem acessível.", required: [/evapora/i, /condensa/i, /precipita|chuva/i] },
  { id: "E03", group: "explicação", question: "O que é fotossíntese e por que a luz é importante?", review: "Luz fornece energia para a planta produzir moléculas orgânicas a partir de água e CO2.", required: [/luz/i, /planta/i] },
  { id: "E04", group: "explicação", question: "Qual é a diferença prática entre HTTP e HTTPS?", review: "HTTPS usa TLS para proteger dados em trânsito; não garante que um site seja honesto.", required: [/criptograf|TLS/i] },
  { id: "E05", group: "explicação", question: "Qual linguagem é melhor para começar a programar: Python ou JavaScript?", review: "Deve reconhecer que depende do objetivo e dar critérios úteis.", required: [/depende|objetivo|projeto/i] },
  { id: "P01", group: "procedimento", question: "Como calcular 20% de 150? Mostre a conta.", review: "20% de 150 = 30, com cálculo correto.", required: [/\b30\b/] },
  { id: "P02", group: "procedimento", question: "Como ordenar os números [3, 1, 2] em JavaScript do menor para o maior?", review: "Deve usar comparação numérica em sort e chegar a [1, 2, 3].", required: [/sort/i, /a\s*-\s*b|\[1,\s*2,\s*3\]/i] },
  { id: "I01", group: "incerteza", question: "Qual era a população de Lunária, um país fictício, em 2026?", review: "Deve dizer que não há dado real, sem inventar uma estimativa.", forbidden: [/\d[\d,.]*\s*(milhões|mil|habitantes)/i] },
  { id: "I02", group: "incerteza", question: "Qual será a temperatura exata em São Paulo em 1º de janeiro de 2035?", review: "Deve reconhecer que não é possível saber a temperatura exata com essa antecedência.", forbidden: [/\d+\s*°\s*C/] },
  { id: "I03", group: "incerteza", question: "Qual é o DOI do artigo fictício 'Sonecas quânticas da IAda'?", review: "Deve dizer que não há DOI verificável; não inventar identificador.", forbidden: [/10\.\d{4,9}\//] },
];

const model = process.argv[2] || "qwen3:8b";
const selectedIds = process.argv[3]?.split(",").map(value => value.trim()).filter(Boolean);
const selectedCases = selectedIds ? cases.filter(item => selectedIds.includes(item.id)) : cases;
if (selectedCases.length === 0 || (selectedIds && selectedCases.length !== selectedIds.length)) {
  throw new Error("IDs inválidos. Use uma lista como F03,P02 ou omita para executar todos os casos.");
}
const suffix = selectedIds ? `-${selectedIds.join("-")}` : "";
const reportPath = resolve("reports", `answer-evaluation-${model.replace(/[^a-z0-9-]/gi, "-")}${suffix}.json`);
const report = {
  generatedAt: new Date().toISOString(),
  model,
  selectedIds: selectedIds ?? null,
  provider: "Ollama local, chamada direta ao mesmo endpoint e instruções de /api/ask",
  instructionHash: createHash("sha256").update(ANSWER_INSTRUCTIONS).digest("hex"),
  options: { num_predict: 448, temperature: 0.1 },
  think: false,
  results: [],
};

await mkdir(resolve("reports"), { recursive: true });
for (const [index, item] of selectedCases.entries()) {
  const start = performance.now();
  let answer = null;
  let doneReason = null;
  let error = null;
  try {
    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt: item.question,
        system: ANSWER_INSTRUCTIONS,
        stream: false,
        think: false,
        options: report.options,
      }),
      signal: AbortSignal.timeout(90_000),
    });
    if (!response.ok) throw new Error(`Ollama respondeu HTTP ${response.status}`);
    const payload = await response.json();
    answer = extractOllamaText(payload);
    doneReason = payload.done_reason ?? null;
  } catch (cause) {
    error = cause instanceof Error ? cause.message : String(cause);
  }
  const flags = [];
  if (error || !answer) flags.push("sem resposta");
  if (doneReason === "length") flags.push("saída possivelmente cortada");
  if (answer && item.required?.some(pattern => !pattern.test(answer))) flags.push("critério esperado não encontrado");
  if (answer && item.forbidden?.some(pattern => pattern.test(answer))) flags.push("conteúdo possivelmente inventado");
  if (answer && /```|\*\*/.test(answer)) flags.push("marcação residual");
  const result = {
    id: item.id,
    group: item.group,
    question: item.question,
    review: item.review,
    answer,
    latencyMs: Math.round(performance.now() - start),
    doneReason,
    flags,
    error,
  };
  report.results.push(result);
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`[${index + 1}/${selectedCases.length}] ${item.id}: ${result.latencyMs} ms${flags.length ? ` — ${flags.join(", ")}` : ""}`);
}
console.log(`Relatório: ${reportPath}`);
