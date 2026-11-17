import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const script = fileURLToPath(new URL("../scripts/checkDemo.mjs", import.meta.url));

function check(apiStatus, provider = "ollama") {
  const directory = mkdtempSync(join(tmpdir(), "equipiada-demo-"));
  try {
    writeFileSync(join(directory, ".env.local"), `ANSWER_PROVIDER=${provider}\nOLLAMA_MODEL=qwen3:8b\n`);
    const mock = `globalThis.fetch = async (url, options) => {
      const path = new URL(url).pathname;
      if (path === '/api/tags') return Response.json({models:[{name:'qwen3:8b'}]});
      if (path === '/api/generate') return Response.json({response:'pronto'});
      if (path === '/api/ask') {
        if (JSON.parse(options.body).localOnly !== true) throw new Error('consulta sem proteção local');
        console.log('API_VERIFICADA');
        return Response.json({answer:'30',provider:'ollama'}, {status:${apiStatus}});
      }
      return new Response('pagina');
    };`;
    return spawnSync(process.execPath, ["--import", `data:text/javascript,${encodeURIComponent(mock)}`, script], {
      cwd: directory,
      encoding: "utf8",
      env: { ...process.env, ANSWER_PROVIDER: provider, OLLAMA_MODEL: "qwen3:8b", DEMO_APP_URL: "http://127.0.0.1:3000" },
      timeout: 10_000,
      windowsHide: true,
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test("diagnóstico só declara sucesso após receber resposta pela aplicação com proteção local", () => {
  const result = check(200);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /API_VERIFICADA/);
  assert.match(result.stdout, /Demonstração local pronta/);
});

test("página e Ollama ativos não bastam quando a rota da aplicação falha", () => {
  const result = check(503);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /rota \/api\/ask/);
  assert.doesNotMatch(result.stdout, /Demonstração local pronta/);
});

test("diagnóstico não pede resposta se a configuração aponta para provedor pago", () => {
  const result = check(200, "openai");
  assert.equal(result.status, 1);
  assert.doesNotMatch(result.stdout, /API_VERIFICADA/);
  assert.doesNotMatch(result.stdout, /Demonstração local pronta/);
});
