import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
let modelServer;
let appServer;

function stop() {
  appServer?.kill();
  modelServer?.kill();
}

process.on("SIGINT", () => { stop(); process.exit(0); });
process.on("SIGTERM", () => { stop(); process.exit(0); });
process.on("exit", stop);

async function models() {
  const response = await fetch("http://127.0.0.1:11434/api/tags", { signal: AbortSignal.timeout(2000) });
  if (!response.ok) throw new Error("Ollama indisponível");
  const payload = await response.json();
  return Array.isArray(payload.models) ? payload.models : [];
}

try {
  const [nodeMajor, nodeMinor] = process.versions.node.split(".").map(Number);
  if (nodeMajor < 22 || (nodeMajor === 22 && nodeMinor < 13)) {
    throw new Error("Use Node.js 22.13 ou superior para o banco SQLite local.");
  }
  if (!existsSync(join(root, "node_modules/next/package.json"))) {
    throw new Error("Instale as dependências com npm ci antes de iniciar.");
  }
  require("@next/env").loadEnvConfig(root, true);
  if (process.env.ANSWER_PROVIDER !== "ollama") {
    throw new Error("Configure ANSWER_PROVIDER=ollama em .env.local para iniciar o modo local.");
  }
  const model = process.env.OLLAMA_MODEL || "qwen3:4b-instruct";
  let installed;
  try {
    installed = await models();
  } catch {
    const localAppData = process.env.LOCALAPPDATA || "";
    const candidates = [
      join(localAppData, "Programs", "Ollama", "ollama.exe"),
      join(localAppData, "EquipIAda", "ollama", "ollama.exe"),
    ];
    const executable = candidates.find(path => existsSync(path)) || "ollama";
    modelServer = spawn(executable, ["serve"], {
      windowsHide: true,
      stdio: "ignore",
      env: { ...process.env, OLLAMA_HOST: "127.0.0.1:11434" },
    });
    let startError;
    modelServer.on("error", error => { startError = error; });
    for (let attempt = 0; attempt < 30; attempt++) {
      if (startError) break;
      await new Promise(resolve => setTimeout(resolve, 300));
      try { installed = await models(); break; } catch { /* aguarda o servidor local */ }
    }
    if (!installed) throw new Error("Não consegui iniciar o Ollama. Confira a instalação e tente novamente.");
  }
  if (!installed.some(item => item?.name === model || item?.model === model)) {
    throw new Error(`Modelo ${model} ausente. Baixe-o com ollama pull ${model} e tente novamente.`);
  }
  console.log(`Ollama local pronto: ${model}.`);
  console.log("Abra http://127.0.0.1:3000 e mantenha esta janela aberta. Ctrl+C encerra a aplicação.");
  appServer = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "dev", "--hostname", "127.0.0.1", "--port", "3000"], {
    cwd: root,
    stdio: "inherit",
    windowsHide: true,
  });
  appServer.on("error", error => { console.error(error.message); process.exit(1); });
  appServer.on("exit", code => process.exit(code ?? 1));
} catch (error) {
  console.error(`Não foi possível iniciar: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
  stop();
}
