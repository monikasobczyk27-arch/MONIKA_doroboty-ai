import { describe, expect, it } from "vitest";
import {
  evidenceBlock,
  evidenceNarrative,
  offerRequirements,
  sourceEvidence,
  requirementReview,
  candidateStrengths,
} from "./requirement-evidence";

describe("recruiter evidence boundaries", () => {
  it("uses submitted CV experience in both evidence and strengths even with a brief answer", () => {
    const cv =
      "2021–2026: rozwój platformy B2B. Automatyzacja obsługi zgłoszeń i skrócenie czasu odpowiedzi o 25%. Prowadzenie warsztatów z użytkownikami, praca z backlogiem i zespołem wdrożeniowym.";
    const row = requirementReview("Chętnie porozmawiam.", "Prowadzenie badań i wdrożeń.", cv);
    expect(row.sources).toEqual([
      {
        label: "CV dołączone do aplikacji",
        text: "Prowadzenie warsztatów z użytkownikami, praca z backlogiem i zespołem wdrożeniowym.",
      },
    ]);
    const strengths = candidateStrengths("Chętnie porozmawiam.", cv);
    expect(strengths).toContain("Doświadczenie w produktach B2B");
    expect(strengths).toContain("Priorytetyzacja i prowadzenie backlogu");
    expect(strengths).not.toContain("Python");
    const narrative = evidenceNarrative(
      "### Wymagania\n- Badania i wdrożenia",
      "Chętnie porozmawiam.",
      cv,
    );
    expect(narrative).toContain("2021–2026");
    expect(narrative).toContain("25%");
    expect(narrative).not.toContain("deklaracje");
    expect(requirementReview("Chętnie porozmawiam.", "Python", cv).source).toBeNull();
  });
  it("uses ordinary candidate text as partial evidence without inventing ownership or analytics", () => {
    const answer =
      "Pracowałem nad automatyzacją obsługi zgłoszeń. Poprowadziłem badania z użytkownikami i wdrożenie, które skróciło czas odpowiedzi o 25%. Chętnie opowiem o decyzjach i ograniczeniach tego projektu.";
    const requirements = [
      "Masz za sobą prowadzenie produktu cyfrowego od discovery do wdrożenia.",
      "Umiesz połączyć rozmowy z analizą danych i wyjaśnić, dlaczego ograniczasz zakres.",
      "Rozmawiasz z inżynierami o jakości, koszcie i ograniczeniach rozwiązania.",
    ];
    const rows = requirements.map((requirement) => requirementReview(answer, requirement));
    expect(rows.filter((row) => row.source)).toHaveLength(2);
    expect(rows.every((row) => !row.complete)).toBe(true);
    expect(rows[0].source).toContain("25%");
    expect(rows[1].question).toContain("analizą danych");
    expect(rows[2].source).toBeNull();
    const narrative = evidenceNarrative(
      "### Wymagania\n" + requirements.map((item) => "- " + item).join("\n"),
      answer,
    );
    expect(narrative).toContain("25%");
    expect(narrative).toContain("2 z 3");
    expect(narrative).not.toContain("Brak ustrukturyzowanych");
    expect(requirementReview("Nie znam Pythona.", "Python").source).toBeNull();
  });
  it("never counts keyword overlap or incomplete ownership as evidence", () => {
    expect(sourceEvidence("Znam Python i SQL", "Python")).toBeNull();
    expect(sourceEvidence(evidenceBlock("Python", "Projekt", ""), "Python")).toBeNull();
    expect(sourceEvidence(evidenceBlock("Python", "Projekt", "Kod i testy"), "SQL")).toBeNull();
    expect(sourceEvidence(evidenceBlock("Python", "Projekt", "Kod i testy"), "Python")).toContain(
      "Kod i testy",
    );
  });
  it("extracts explicit requirements, excluding responsibilities and exemptions", () => {
    expect(
      offerRequirements(
        "### Obowiązki\n- Buduj modele.\n### Wymagania\n- Python\n- SQL\n### Warunki\n- Zdalnie",
      ),
    ).toEqual(["Python", "SQL"]);
    expect(
      offerRequirements(
        "### Oczekiwania\nMasz doświadczenie. Nie musisz trenować modeli. Przyda się B2B.",
      ),
    ).toEqual(["Masz doświadczenie."]);
    expect(offerRequirements("Buduj modele")).toEqual([]);
  });
});
