import { test, expect, type Page } from "@playwright/test";

const evidenceDate = new Date().toISOString().slice(0, 10);
async function answered(page: Page) {
  await page.route("**/api/ask", route => route.fulfill({ json: { answer: "Resposta sintética do teste de integração.", provider: "ollama" } }));
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("textbox", { name: "Sua pergunta para a IAda" }).fill("Pergunta sintética que não deve ir para o banco.");
  await page.getByRole("button", { name: "Pular pegadinha" }).click();
  await expect(page.getByRole("region", { name: "Avaliar experiência" })).toBeVisible();
}

test("avaliação voluntária passa pela API, persiste em SQLite e aparece após recarregar", async ({ page, request }) => {
  const before = await (await request.get("/api/feedback")).json();
  await answered(page);
  const form = page.getByRole("region", { name: "Avaliar experiência" });
  await expect(form).toContainText("Perguntas e respostas não são guardadas");
  await expect(form.getByRole("button", { name: "Salvar avaliação" })).toBeDisabled();
  expect((await (await request.get("/api/feedback")).json()).total).toBe(before.total);
  await form.getByRole("radio", { name: "Sim", exact: true }).check();
  await form.getByRole("radio", { name: "Divertida", exact: true }).check();
  const post = page.waitForResponse(response => response.url().endsWith("/api/feedback") && response.request().method() === "POST");
  await form.getByRole("button", { name: "Salvar avaliação" }).click();
  const response = await post;
  expect(response.status()).toBe(201);
  const payload = response.request().postDataJSON();
  expect(Object.keys(payload).sort()).toEqual(["enjoyment", "helpfulness", "id", "pranks"]);
  await expect(form.getByRole("status")).toBeFocused();
  await expect(form).toContainText(`${before.total + 1} ${before.total === 0 ? "avaliação" : "avaliações"} neste computador`);
  expect((await request.post("/api/feedback", { data: payload })).status()).toBe(200);
  expect((await (await request.get("/api/feedback")).json()).total).toBe(before.total + 1);
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Pular pegadinha" }).click();
  await expect(page.getByRole("region", { name: "Avaliar experiência" })).toContainText(`${before.total + 1} ${before.total === 0 ? "avaliação" : "avaliações"} neste computador`);
});

test("falha ao salvar não apaga resposta e permite repetir a mesma avaliação", async ({ page }) => {
  const ids: string[] = [];
  await page.route("**/api/feedback", async route => {
    if (route.request().method() !== "POST") return route.fulfill({ status: 503, json: { code: "FEEDBACK_UNAVAILABLE" } });
    ids.push(route.request().postDataJSON().id);
    if (ids.length === 1) return route.fulfill({ status: 503, json: { code: "FEEDBACK_UNAVAILABLE" } });
    return route.continue();
  });
  await answered(page);
  const form = page.getByRole("region", { name: "Avaliar experiência" });
  await form.getByRole("radio", { name: "Em parte", exact: true }).check();
  await form.getByRole("radio", { name: "Neutra", exact: true }).check();
  await form.getByRole("button", { name: "Salvar avaliação" }).click();
  await expect(form.getByRole("alert")).toContainText("Sua resposta continua disponível");
  await expect(page.getByText("Resposta sintética do teste de integração.", { exact: true })).toBeVisible();
  await form.getByRole("button", { name: "Tentar salvar novamente" }).click();
  await expect(form.getByRole("status")).toContainText("Avaliação salva");
  expect(ids).toHaveLength(2);
  expect(ids[0]).toBe(ids[1]);
});

test("API rejeita dados privados, notas inválidas, tipo incorreto e corpo excessivo", async ({ request }) => {
  const before = await (await request.get("/api/feedback")).json();
  const input = { id: crypto.randomUUID(), helpfulness: 3, enjoyment: 2, pranks: [] };
  expect((await request.post("/api/feedback", { data: { ...input, question: "dado privado sintético" } })).status()).toBe(400);
  expect((await request.post("/api/feedback", { data: { ...input, helpfulness: 5 } })).status()).toBe(400);
  expect((await request.post("/api/feedback", { data: "texto" })).status()).toBe(415);
  expect((await request.post("/api/feedback", { data: { ...input, extra: "x".repeat(3000) } })).status()).toBe(413);
  expect((await (await request.get("/api/feedback")).json()).total).toBe(before.total);
});

test("avaliação em tela estreita funciona por teclado e não cria rolagem horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await answered(page);
  const form = page.getByRole("region", { name: "Avaliar experiência" });
  await form.getByRole("radio", { name: "Sim", exact: true }).focus();
  await page.keyboard.press("Space");
  await form.getByRole("radio", { name: "Divertida", exact: true }).focus();
  await page.keyboard.press("Space");
  await page.screenshot({ path: `reports/feedback-mobile-${evidenceDate}.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await form.getByRole("button", { name: "Salvar avaliação" }).press("Enter");
  await expect(form.getByRole("status")).toBeFocused();
  await expect(form.getByRole("status")).toContainText("Avaliação salva");
});
