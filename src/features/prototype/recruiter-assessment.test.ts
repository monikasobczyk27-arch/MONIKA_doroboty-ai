import { describe, expect, it } from "vitest";
import cv from "./data/cv-text.json" with { type: "json" };
import marketplace from "./data/marketplace.json" with { type: "json" };
import {
  productCriteria,
  assessProductCriterion,
  recruiterRecommendation,
} from "./recruiter-assessment";
import { offerRequirements } from "./requirement-evidence";

describe("product manager screening criteria", () => {
  const agro =
    "Przykład: na potrzeby współpracy z dużym producentem maszyn rolniczych przygotowaliśmy system sprzedażowy dla pracowników dealerów maszyn, tak aby klient zainteresowany maszyną automatycznie otrzymał również ofertę, a często decyzję i finansowanie juz podczas jednej wizyty.";
  const medical = `Przykład: oferta dla branży medycznej
punkt startu udział w rynku finansowania sprzetu med na poziomie 3%
oczekiwany udział w rynku do 2027 - min. 5%
Samodzielny wkład: wywiady z siecią sprzedaży
badania z przedstawicielami branży med - screener, scenariusz badań. z Badaczem uzgodniliśmy szczegółowo pytania, co dokładnie chcielibysmy się dowiedzieć - wyjaśniliśmy wątpliwości tak, aby badacz czuł komfort rozmawiając z medykami.`;
  const businessCriterion = productCriteria.find((item) => item.id === "2")!.title;
  it("recognizes manufacturer/dealer sales workflows without the literal B2B keyword", () => {
    const review = assessProductCriterion(agro, businessCriterion, "")!;
    expect(review.status).toBe("Tak");
    expect(review.source).toContain("producentem maszyn rolniczych");
    expect(review.source).toContain("system sprzedażowy");
  });
  it("uses multi-line professional medical finance context, retaining separate process evidence", () => {
    const review = assessProductCriterion(medical, businessCriterion, cv["candidate-anna"].text)!;
    expect(review.status).toBe("Tak");
    expect(review.rationale).toContain("produkt B2B");
    expect(review.sources.find((source) => source.label === "Odpowiedź kandydata")?.text).toContain(
      "finansowania sprzetu med",
    );
    expect(assessProductCriterion(medical, businessCriterion, "")!.status).toBe("Częściowo");
  });
  it("does not equate sectors, personal equipment finance or bare partner names with B2B work", () => {
    for (const text of [
      "Interesuje mnie branża agro i medyczna.",
      "Producent maszyn. Dealerzy. Medycyna.",
      "Przygotowałam ofertę finansowania sprzętu medycznego dla pacjentów indywidualnych.",
      "Badania z medykami, screener i scenariusz badań.",
    ]) {
      expect(assessProductCriterion(text, businessCriterion, "")!.status).toBe("Brak danych");
    }
  });
  const answer =
    "Pracowałem nad automatyzacją obsługi zgłoszeń. Poprowadziłem badania z użytkownikami i wdrożenie, które skróciło czas odpowiedzi o 25%. Chętnie opowiem o decyzjach i ograniczeniach tego projektu.";
  it("includes backlog, experiment and B2B requirements from the full offer", () => {
    expect(offerRequirements(marketplace.jobs[0].description)).toEqual(
      productCriteria.map((item) => item.title),
    );
    expect(productCriteria).toHaveLength(6);
  });
  it("recognizes Marek's backlog and B2B, without inventing experiment or product analytics", () => {
    const rows = productCriteria.map((item) => ({
      requirement: item.title,
      ...assessProductCriterion(answer, item.title, cv["candidate-marek"].text)!,
    }));
    expect(rows.map((row) => row.status)).toEqual([
      "Tak",
      "Tak",
      "Częściowo",
      "Brak danych",
      "Częściowo",
      "Tak",
    ]);
    expect(rows[1].source).toContain("backlog");
    expect(rows[5].source).toContain("B2B");
    expect(rows[2].rationale).toContain("Do doprecyzowania: analiza danych o produkcie");
    expect(recruiterRecommendation(rows).title).toBe("Warto zaprosić do rozmowy");
  });
  it("recognizes Anna's experiments and recommendations while leaving costs and B2B open", () => {
    const rows = productCriteria.map((item) => ({
      requirement: item.title,
      ...assessProductCriterion("", item.title, cv["candidate-anna"].text)!,
    }));
    expect(rows.map((row) => row.status)).toEqual([
      "Tak",
      "Tak",
      "Tak",
      "Tak",
      "Częściowo",
      "Częściowo",
    ]);
    expect(rows[4].rationale).toContain("koszt rozwiązania");
    expect(rows[5].rationale).toContain("produkt B2B");
    expect(
      recruiterRecommendation(
        productCriteria.map((item) => ({ requirement: item.title, status: "Brak danych" })),
      ).title,
    ).toBe("Najpierw poproś o uzupełnienie");
  });
});
