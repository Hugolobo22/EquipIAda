import { readFile } from "node:fs/promises";

const ollamaUrl = "http://127.0.0.1:11434";
const appUrl = process.env.DEMO_APP_URL || "http://127.0.0.1:3000";

function setting(contents, name) {
  const line = contents.split(/\r?\n/).find(value => new RegExp(`^\\s*${name}\\s*=`).test(value));
  if (!line) return undefined;
  const value = line.slice(line.indexOf("=") + 1).trim();
  return value.replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, (_match, double, single) => double ?? single);
}

async function request(url, options, timeoutMs) {
  return fetch(url, { ...options, signal: AbortSignal.timeout(timeoutMs) });
}

function fail(message) {
  console.error(`✗ ${message}`);
  process.exitCode = 1;
}

let envContents;
try {
  envContents = await readFile(".env.local", "utf8");
} catch {
  fail("Arquivo .env.local ausente. Copie .env.example e configure ANSWER_PROVIDER=ollama.");
}

if (envContents !== undefined) {
  const provider = process.env.ANSWER_PROVIDER ?? setting(envContents, "ANSWER_PROVIDER");
  const model = process.env.OLLAMA_MODEL ?? setting(envContents, "OLLAMA_MODEL") ?? "qwen3:4b-instruct";

  if (provider !== "ollama") {
    fail("ANSWER_PROVIDER deve ser ollama para a apresentação local. Nenhuma chamada paga foi feita.");
  } else {
    console.log(`✓ Provedor local configurado. Modelo: ${model}`);
    let modelReady = false;
    try {
      const response = await request(`${ollamaUrl}/api/tags`, {}, 5_000);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      const models = Array.isArray(payload.models) ? payload.models : [];
      modelReady = models.some(item => item?.name === model || item?.model === model);
      if (modelReady) console.log("✓ Ollama ativo e modelo instalado.");
      else fail(`Modelo ${model} não encontrado. Confira OLLAMA_MODEL ou execute: ollama pull ${model}`);
    } catch {
      fail("Ollama não respondeu em 127.0.0.1:11434. Abra o Ollama antes da apresentação.");
    }

    if (modelReady) {
      const started = performance.now();
      try {
        const response = await request(`${ollamaUrl}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            prompt: "Responda somente com a palavra pronto.",
            system: "Esta é uma checagem local da demonstração. Responda brevemente em português.",
            stream: false,
            think: false,
            keep_alive: "10m",
            options: { num_predict: 24, temperature: 0 },
          }),
        }, 90_000);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = await response.json();
        if (typeof payload.response !== "string" || !payload.response.trim()) throw new Error("Resposta vazia");
        console.log(`✓ Modelo aquecido em ${((performance.now() - started) / 1000).toFixed(1)} s (mantido por até 10 minutos).`);
      } catch {
        fail("O modelo não concluiu a checagem em até 90 s. Tente um modelo menor ou verifique os recursos da máquina.");
      }
    }
  }
}

try {
  const parsed = new URL(appUrl);
  if (parsed.protocol !== "http:" || !["localhost", "127.0.0.1"].includes(parsed.hostname)) {
    throw new Error("URL não local");
  }
  const response = await request(parsed.href, {}, 5_000);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  console.log(`✓ Página disponível em ${parsed.href}`);
} catch {
  fail(`Página não disponível em ${appUrl}. Inicie npm run dev e confira a porta exibida pelo Next.js.`);
}

if (process.exitCode !== 1) console.log("Demonstração local pronta. Use perguntas já revisadas no roteiro.");
