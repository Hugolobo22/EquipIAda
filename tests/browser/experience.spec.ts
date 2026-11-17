import { test, expect, type Page } from "@playwright/test";
import { chooseNextAction, createSessionState, sessionReducer } from "../../src/lib/sessionEngine";
import type { PrankId } from "../../src/types/session";

const evidenceDate = new Date().toISOString().slice(0, 10);
const original = "  Como funciona uma variável em JavaScript?\n";
const fixture = "Resposta simulada exclusivamente para verificar a interface.";
const question = (page: Page) => page.getByRole("textbox", { name: "Sua pergunta para a IAda" });
const panel = (page: Page) => page.getByRole("region", { name: "Pegadinha ativa" });
const skip = (page: Page) => page.getByRole("button", { name: "Pular pegadinha" });
const transition = (page: Page) => page.locator(".prank-transition");

function randomFor(prank: PrankId, reducedMotion = true) {
  let state = sessionReducer(createSessionState(), { type: "START_QUESTION", question: original });
  state = sessionReducer(state, { type: "REGISTER_ATTEMPT" });
  for (let value = .001; value < 1; value += .001) {
    const decision = chooseNextAction(state, { reducedMotion }, () => value);
    if (decision.kind === "prank" && decision.prank === prank) return value;
  }
  throw new Error(`Pegadinha não elegível: ${prank}`);
}

async function prepare(page: Page, prank: PrankId = "interrogation", reducedMotion = true) {
  await page.goto("/", { waitUntil: "networkidle" });
  // Só fixa o sorteio após a hidratação; os identificadores internos do React permanecem livres.
  await page.evaluate(value => { Math.random = () => value; }, randomFor(prank, reducedMotion));
  await question(page).fill(original);
}

async function complete(page: Page) {
  if (await page.getByRole("button", { name: "Carregar coragem", exact: true }).count()) {
    await page.getByRole("button", { name: "Carregar coragem", exact: true }).click();
    await page.getByRole("button", { name: "Completar a carga" }).click();
  } else if (await page.getByRole("button", { name: "Desligar modo soneca" }).count()) {
    await page.getByRole("button", { name: "Desligar modo soneca" }).click();
    await page.getByRole("button", { name: "Conectar boa vontade" }).click();
  } else if (await page.getByRole("textbox", { name: "Palavra mágica" }).count()) {
    await page.getByRole("textbox", { name: "Palavra mágica" }).fill("por favor");
    await panel(page).getByRole("button").click();
  } else if (await page.getByRole("button", { name: "Devolver palavra 1" }).count()) {
    await page.getByRole("button", { name: "Devolver palavra 1" }).click();
    await page.getByRole("button", { name: "Devolver palavra 2" }).click();
  } else if (await page.getByRole("button", { name: "Acender lanterna" }).count()) {
    await page.getByRole("button", { name: "Acender lanterna" }).click();
    await page.getByRole("button", { name: "Restaurar a luz" }).click();
  } else await panel(page).getByRole("button").click();
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/ask", route => route.fulfill({ json: { answer: fixture, provider: "ollama" } }));
});

test("duas cenas avançam sozinhas e enviam a pergunta exata uma única vez", async ({ page }) => {
  const sent: unknown[] = [];
  await page.route("**/api/ask", route => { sent.push(route.request().postDataJSON()); return route.fulfill({ json: { answer: fixture, provider: "ollama" } }); });
  await prepare(page);
  await question(page).press("Control+Enter");
  await expect(panel(page)).toBeVisible();
  await expect(page.locator(".metric-card strong")).toHaveText("1 / 2");
  await expect(page.getByRole("button", { name: "Acenar para você" })).toBeDisabled();
  await question(page).press("Control+Enter");
  await expect(page.locator(".metric-card strong")).toHaveText("1 / 2");
  await complete(page);
  await expect(transition(page)).toBeFocused();
  await expect(question(page)).not.toBeEditable();
  await expect(page.getByRole("button", { name: "Tentar enviar pergunta" })).toBeDisabled();
  await expect(page.locator(".metric-card strong")).toHaveText("2 / 2");
  await complete(page);
  await expect(page.getByText(fixture, { exact: true })).toBeVisible();
  expect(sent).toEqual([{ question: original, localOnly: true }]);
  await expect(question(page)).toBeEditable();
});

test("manutenção tem dois ajustes independentes, foco progressivo e Pular cancela continuação", async ({ page }) => {
  await prepare(page, "maintenance");
  await question(page).press("Control+Enter");
  await page.getByRole("button", { name: "Conectar boa vontade" }).click();
  await expect(page.getByRole("button", { name: "Desligar modo soneca" })).toBeFocused();
  await expect(panel(page)).toContainText("1 de 2 ajustes");
  await page.keyboard.press("Enter");
  await expect(transition(page)).toBeVisible();
  await skip(page).click();
  await expect(page.getByText(fixture, { exact: true })).toBeVisible();
  await page.waitForTimeout(1400); // excede o timer cancelado; nenhuma cena antiga pode reaparecer
  await expect(panel(page)).toHaveCount(0);
  await expect(question(page)).toHaveValue(original);
});

test("carregamento dramático reage ao teclado sem fingir progresso da resposta real", async ({ page }) => {
  await prepare(page, "dramatic-delay");
  await question(page).press("Control+Enter");
  await page.getByRole("button", { name: "Carregar coragem", exact: true }).press("Enter");
  await expect(page.getByRole("progressbar", { name: "Coragem para trabalhar" })).toHaveAttribute("aria-valuenow", "50");
  await expect(panel(page)).toContainText("Isso não é o progresso da resposta real");
  await page.screenshot({ path: `reports/dramatic-preview-${evidenceDate}.png`, fullPage: true });
  await page.getByRole("button", { name: "Completar a carga" }).press("Enter");
  await expect(transition(page)).toBeVisible();
  await page.getByRole("button", { name: "Reiniciar pergunta" }).click();
  await page.waitForTimeout(1400);
  await expect(panel(page)).toHaveCount(0);
  await expect(question(page)).toBeEditable();
  await expect(question(page)).toBeFocused();
});

test("cancelar e tentar novamente preservam o original e descartam a resposta tardia", async ({ page }) => {
  let calls = 0;
  const sent: unknown[] = [];
  await page.route("**/api/ask", async route => {
    sent.push(route.request().postDataJSON());
    calls++;
    if (calls === 1) await new Promise(resolve => setTimeout(resolve, 1800));
    try { await route.fulfill({ json: { answer: fixture, provider: "ollama" } }); } catch { /* cancelada */ }
  });
  await prepare(page);
  await skip(page).click();
  await expect.poll(() => calls).toBe(1);
  await page.getByRole("button", { name: "Cancelar resposta" }).click();
  await expect(question(page)).not.toBeEditable();
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.getByText(fixture, { exact: true })).toBeVisible();
  expect(sent).toEqual([{ question: original, localOnly: true }, { question: original, localOnly: true }]);
});

test("gesto de aceno termina e os controles ficam disponíveis fora da rodada", async ({ page }) => {
  await prepare(page);
  await expect(page.locator(".iada-svg")).toHaveClass(/gesture-idle/);
  await page.getByRole("button", { name: "Acenar para você" }).click();
  await expect(page.locator(".iada-svg")).toHaveClass(/gesture-wave/);
  await expect(page.locator(".iada-svg")).toHaveClass(/gesture-idle/);
});

test("ladrão devolve cada palavra, mantém o foco e libera continuação sem adulterar o original", async ({ page }) => {
  await prepare(page, "word-thief");
  await question(page).press("Control+Enter");
  await expect(page.locator(".stolen-question-preview")).toContainText("▯");
  await expect(question(page)).toHaveValue(original);
  await page.getByRole("button", { name: "Devolver palavra 1" }).click();
  await expect(page.getByRole("button", { name: "Devolver palavra 2" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(transition(page)).toBeFocused();
  await skip(page).click();
  await expect(page.getByText(fixture, { exact: true })).toBeVisible();
  await expect(question(page)).toHaveValue(original);
});

test("limite de consultas informa a espera e a nova tentativa preserva a rodada", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/ask", route => {
    calls++;
    return route.fulfill(calls === 1 ? { status: 429, json: { code: "RATE_LIMITED" } } : { json: { answer: fixture, provider: "ollama" } });
  });
  await prepare(page);
  await skip(page).click();
  await expect(page.getByRole("region", { name: "Resposta à pergunta original" }).getByRole("alert")).toContainText("limite de consultas");
  await expect(question(page)).not.toBeEditable();
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.getByText(fixture, { exact: true })).toBeVisible();
  await expect(question(page)).toHaveValue(original);
  await expect(panel(page)).toHaveCount(0);
});

test("reiniciar durante consulta libera nova pergunta e descarta resultado antigo", async ({ page }) => {
  let started = false;
  await page.route("**/api/ask", async route => {
    started = true;
    await new Promise(resolve => setTimeout(resolve, 1000));
    try { await route.fulfill({ json: { answer: fixture, provider: "ollama" } }); } catch { /* reiniciada */ }
  });
  await prepare(page);
  await skip(page).click();
  await expect.poll(() => started).toBe(true);
  await page.getByRole("button", { name: "Reiniciar pergunta" }).click();
  await question(page).fill("Nova pergunta sem resposta antiga.");
  await page.waitForTimeout(1300);
  await expect(question(page)).toHaveValue("Nova pergunta sem resposta antiga.");
  await expect(page.getByRole("region", { name: "Resposta à pergunta original" })).toHaveCount(0);
});

for (const width of [320, 390]) {
  test.describe(`viewport ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, hasTouch: true });
    test("manutenção e apagão funcionam com foco, touch simulado e movimento reduzido", async ({ page }) => {
      await prepare(page, "maintenance");
      await question(page).press("Control+Enter");
      await expect(page.getByRole("button", { name: "Desligar modo soneca" })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const touchTarget = await page.getByRole("button", { name: "Conectar boa vontade" }).boundingBox();
      expect(touchTarget?.height).toBeGreaterThanOrEqual(44);
      if (width === 320) await page.screenshot({ path: `reports/maintenance-preview-${evidenceDate}.png`, fullPage: true });
      await page.getByRole("button", { name: "Reiniciar pergunta" }).click();
      await prepare(page, "blackout");
      await question(page).press("Control+Enter");
      await expect(page.getByRole("button", { name: "Acender lanterna" })).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("button", { name: "Restaurar a luz" })).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(transition(page)).toBeFocused();
      await skip(page).click();
      await expect(page.getByText(fixture, { exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  });
}

test("roubo mantém gesto de pegar durante a animação e Pular restaura posições", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await prepare(page, "runaway-button", false);
  await question(page).press("Control+Enter");
  await expect(page.getByRole("button", { name: "Recuperar o botão" })).toBeDisabled();
  await page.waitForTimeout(1300);
  await expect(page.locator(".iada-svg")).toHaveClass(/gesture-grab/);
  await skip(page).click();
  await expect(page.getByText(fixture, { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const actor = document.querySelector(".actor")!.getBoundingClientRect();
    const stage = document.querySelector(".stage-body")!.getBoundingClientRect();
    const button = document.querySelector(".send-button")!.getBoundingClientRect();
    const composer = document.querySelector(".composer")!.getBoundingClientRect();
    return Math.abs(actor.x + actor.width / 2 - stage.x - stage.width / 2) < 3 && Math.abs(button.y + button.height / 2 - composer.y - composer.height / 2) < 3;
  })).toBe(true);
});

test("rodada completa termina com resposta real do Ollama local", async ({ page }) => {
  test.skip(process.env.EQUIPIADA_REAL_MODEL !== "true", "Ative EQUIPIADA_REAL_MODEL=true para consultar o Ollama local.");
  test.setTimeout(100_000);
  await page.unroute("**/api/ask");
  await prepare(page);
  await question(page).fill("Quanto é 20% de 150?");
  await question(page).press("Control+Enter");
  await expect(panel(page)).toBeVisible();
  await complete(page);
  await expect(page.locator(".metric-card strong")).toHaveText("2 / 2");
  await complete(page);
  const answer = page.getByRole("region", { name: "Resposta à pergunta original" });
  await expect(answer).toContainText(/\b30\b/, { timeout: 95_000 });
  await expect(answer).toContainText("Gerada pelo modelo local. Confira informações importantes.");
  await expect(page.getByRole("img", { name: "IAda, mascote robô, expressão Sarcástica" })).toBeVisible();
  await expect(question(page)).toBeEditable();
  await page.screenshot({ path: `reports/experience-${evidenceDate}.png`, fullPage: true });
});
