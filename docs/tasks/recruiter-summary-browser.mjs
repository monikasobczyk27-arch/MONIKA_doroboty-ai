import { chromium, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const browser = await chromium.launch({
  headless: true,
  channel: process.env.TEST_BROWSER_CHANNEL || undefined,
});
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  await page.goto("http://127.0.0.1:3001/#/auth/sign-in");
  await page.getByRole("button", { name: "Wejdź jako Anna Kowalska", exact: true }).click();
  await page.goto("http://127.0.0.1:3001/#/aplikuj/ai-product-manager");
  await page.getByText("Uzupełnij aplikację z asystentem", { exact: true }).click();
  const add = page.getByRole("button", { name: "Zatwierdź i dodaj do odpowiedzi" });
  await expect(add).toBeDisabled();
  await page
    .getByLabel("Jaki konkretny projekt lub sytuacja pokazuje to doświadczenie?")
    .fill("Prowadziłam wdrożenie asystenta do obsługi zgłoszeń w zespole operacyjnym.");
  await expect(add).toBeDisabled();
  await page
    .getByLabel("Co dokładnie zrobiłaś lub zrobiłeś samodzielnie?")
    .fill(
      "Samodzielnie przeprowadziłam 18 wywiadów i ustaliłam zakres MVP. Inżynierowie wdrożyli integrację.",
    );
  await add.click();
  await page.getByRole("button", { name: "Zapisz szkic", exact: true }).click();
  await page.reload();

  await expect(page.getByLabel("Dlaczego pasujesz do tej roli?")).toHaveValue(/Samodzielny wkład/);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Wyślij aplikację", exact: true }).click();
  await page.waitForURL("**/#/app/aplikacje?wyslano=1");
  await expect(page.locator("[data-contact-recommendation]")).toHaveCount(0);
  const appId = await page.evaluate(
    () => JSON.parse(localStorage.getItem("doroboty.prototype.v1")).applications.at(-1).id,
  );
  await page.goto("http://127.0.0.1:3001/#/auth/sign-in");
  await page.getByRole("button", { name: "Wejdź jako Karolina Wiśniewska", exact: true }).click();
  await page.goto("http://127.0.0.1:3001/#/app/kandydaci");
  const card = page.locator(".prototype-panel").filter({ hasText: "Anna Kowalska" });
  await expect(card.locator("[data-contact-recommendation]")).toContainText(
    "Warto zaprosić do rozmowy",
  );
  await expect(card.locator(".requirement-score")).toContainText("4 / 6");
  if (
    (await card
      .locator(".requirement-score")
      .evaluate((el) => getComputedStyle(el).backgroundColor)) !== "rgb(255, 224, 247)"
  )
    throw Error("Requirement score must use supporting pink");
  await mkdir("docs/tasks/evidence/candidate-list-recommendation-v2", { recursive: true });
  await page.locator("h1").click();
  await page.screenshot({
    path: "docs/tasks/evidence/candidate-list-recommendation-v2/desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "docs/tasks/evidence/candidate-list-recommendation-v2/mobile.png",
    fullPage: true,
  });
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
    throw Error("Candidate list horizontal overflow");
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto(`http://127.0.0.1:3001/#/app/kandydaci/${appId}`);
  await expect(page.locator(".requirement-count")).toHaveText("4 / 6");
  await page.locator(".requirement-row summary").first().click();
  await expect(page.locator(".requirement-row blockquote").first()).toContainText("discovery");
  // Seed the user's unstructured regression example in this isolated context.
  await page.evaluate((id) => {
    const state = JSON.parse(localStorage.getItem("doroboty.prototype.v1"));
    state.applications.find((item) => item.id === id).answer =
      "Pracowałem nad automatyzacją obsługi zgłoszeń. Poprowadziłem badania z użytkownikami i wdrożenie, które skróciło czas odpowiedzi o 25%. Chętnie opowiem o decyzjach i ograniczeniach tego projektu.";
    localStorage.setItem("doroboty.prototype.v1", JSON.stringify(state));
  }, appId);
  await page.reload();
  await expect(page.locator(".requirement-count")).toHaveText("4 / 6");
  await expect(
    page.locator(".requirement-verdict").filter({ hasText: "Częściowo", exact: true }),
  ).toHaveCount(2);
  await expect(page.locator(".record-summary ul").first().locator("li")).toHaveCount(4);
  await expect(page.locator(".record-summary")).not.toContainText("Brak ustrukturyzowanych");
  await expect(page.locator(".record-summary")).toContainText("Zakres doświadczenia");
  await expect(page.locator(".record-summary")).toContainText("Warto zaprosić do rozmowy");
  await expect(page.locator(".record-summary")).toContainText("Priorytetyzacja backlogu");
  await expect(page.locator(".record-summary")).not.toContainText("To deklaracje");
  await page.locator(".requirement-row summary").first().focus();
  await page.keyboard.press("Enter");
  await expect(
    page.locator(".requirement-row blockquote").filter({ hasText: "25%" }).first(),
  ).toContainText("25%");
  await expect(page.getByText("CV dołączone do aplikacji", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Wstaw proponowaną notatkę" }).click();
  await expect(page.getByLabel("Notatka rekrutacyjna (widoczna pracodawcy)")).toHaveValue(
    /Warto zaprosić/,
  );
  await page
    .getByLabel("Notatka rekrutacyjna (widoczna pracodawcy)")
    .fill("Moja decyzja: rozmowa o kosztach i ograniczeniach.");
  await page.getByRole("button", { name: "W przeglądzie", exact: true }).click();
  await expect(
    page.getByText("Moja decyzja: rozmowa o kosztach i ograniczeniach.", { exact: true }),
  ).toBeVisible();
  await mkdir("docs/tasks/evidence/recruiter-summary-v6", { recursive: true });
  await page.locator("h1").click();
  await page.screenshot({
    path: "docs/tasks/evidence/recruiter-summary-v6/desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("h1").click();
  await page.screenshot({
    path: "docs/tasks/evidence/recruiter-summary-v6/mobile.png",
    fullPage: true,
  });
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
    throw Error("Mobile horizontal overflow");
  await page.reload();
  await expect(page.locator(".requirement-count")).toHaveText("4 / 6");
  console.log(
    "PASS: candidate ownership gate, draft/reload, submission, employer sources/count, mobile overflow, persisted summary.",
  );
} finally {
  await browser.close();
}
