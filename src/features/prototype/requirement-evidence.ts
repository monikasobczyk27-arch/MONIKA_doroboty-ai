import { parseJobDescription } from "@/features/jobs/description";
import {
  assessProductCriterion,
  productCriteria,
  usesProductCriteria,
} from "./recruiter-assessment";

const headings =
  /^(Oczekiwania|Wymagania|Doświadczenie, z którego skorzystasz|Co powinieneś umieć na starcie|Pokaż nam, jak podejmujesz decyzje|Z czym przychodzisz|Kiedy ta rola będzie dla Ciebie dobra|Warsztat)$/i;

/** Only explicit requirement sections; never reinterpret responsibilities as requirements. */
export function offerRequirements(description: string): string[] {
  if (usesProductCriteria(description)) return productCriteria.map((item) => item.title);
  let active = false;
  const result: string[] = [];
  for (const block of parseJobDescription(description)) {
    if (block.type === "heading") active = headings.test(block.text);
    else if (active) {
      const items = block.type === "list" ? block.items : block.text.split(/(?<=[.!?])\s+/);
      result.push(
        ...items.filter(
          (item) =>
            !/^(Nie |Przyda |Doświadczenie w healthtech|AI może|Materiały objęte|Projekt nie)/i.test(
              item,
            ),
        ),
      );
    }
  }
  return [...new Set(result)];
}

export function evidenceBlock(requirement: string, example: string, ownWork: string) {
  return `\n\n[Wymaganie: ${requirement}]\nPrzykład: ${example.trim()}\nSamodzielny wkład: ${ownWork.trim()}\n[Koniec wymagania]`;
}

export function sourceEvidence(answer: string, requirement: string) {
  const marker = `[Wymaganie: ${requirement}]\n`;
  const start = answer.indexOf(marker);
  if (start < 0) return null;
  const end = answer.indexOf("\n[Koniec wymagania]", start);
  if (end < 0) return null;
  const source = answer.slice(start + marker.length, end);
  const parts = source.match(/^Przykład: ([\s\S]+)\nSamodzielny wkład: ([\s\S]+)$/);
  return parts?.[1].trim() && parts[2].trim() ? source : null;
}

const concepts = [
  /bada[ńn]|badani|wywiad|rozm[oó]w|discovery|warsztat.*użytkown/i,
  /wdro[zż]|wprowadz.*produk|uruchomi/i,
  /anali[zst]|metryk|pomiar|mierzeni|danych/i,
  /in[zż]ynier|programist|technicz/i,
  /python/i,
  /\bsql\b/i,
  /\bapi\b/i,
  /test[yoó]|testowa/i,
  /automatyzac/i,
  /portfolio|figma|prototyp/i,
  /produkt|platform/i,
  /jakoś|ewalu|regres/i,
  /koszt/i,
  /zakres|prioryt/i,
];

function sentences(answer: string) {
  return answer
    .replace(/\[Wymaganie: [^\n]*\]\n/g, "")
    .replace(/\[Koniec wymagania\]/g, "")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Conservative local cues select source excerpts, never infer skills from a score. */
export function requirementReview(answer: string, requirement: string, cv = "") {
  const productReview = assessProductCriterion(answer, requirement, cv);
  if (productReview) return productReview;
  const structured = sourceEvidence(answer, requirement);
  const expected = concepts.filter((concept) => concept.test(requirement));
  const excerpts = sentences(answer).filter(
    (sentence) =>
      !/\b(nie|brak)\b/i.test(sentence) && expected.some((concept) => concept.test(sentence)),
  );
  const cvExcerpts = sentences(cv).filter(
    (sentence) =>
      !/\b(nie|brak)\b/i.test(sentence) && expected.some((concept) => concept.test(sentence)),
  );
  const sources = [
    ...(structured || excerpts.length
      ? [{ label: "Odpowiedź kandydata", text: structured ?? excerpts.join(" ") }]
      : []),
    ...(cvExcerpts.length
      ? [{ label: "CV dołączone do aplikacji", text: cvExcerpts.join(" ") }]
      : []),
  ];
  const source = sources.length ? sources.map((item) => item.text).join(" ") : null;
  const covered = expected.length > 0 && expected.every((concept) => concept.test(source ?? ""));
  const complete = covered;
  const question = !source
    ? `Podaj przykład doświadczenia odpowiadającego wymaganiu: „${requirement}”. Co wykonałaś lub wykonałeś samodzielnie?`
    : /rozm[oó]w|bada|anali|danych/i.test(requirement)
      ? "Jak połączono badania z analizą danych? Jakie dane i wnioski wpłynęły na zakres wdrożenia? Co zrobiłaś lub zrobiłeś samodzielnie?"
      : /wdro|produkt/i.test(requirement)
        ? "Za które etapy od rozpoznania problemu do wdrożenia odpowiadałaś lub odpowiadałeś samodzielnie, a co wykonał zespół?"
        : `Jak opisany przykład pokazuje wymaganie: „${requirement}”? Doprecyzuj własne decyzje, wykonanie i rezultat.`;
  return {
    source,
    sources,
    complete,
    status: complete ? "Tak" : source ? "Częściowo" : "Brak danych",
    rationale: source
      ? "Materiały opisują powiązane doświadczenie. Zakres sprawdź w źródłach poniżej."
      : "Brak opisu tego doświadczenia w CV i odpowiedzi.",
    question,
  };
}

export function candidateStrengths(answer: string, cv = "") {
  const materials = sentences(`${cv}\n${answer}`)
    .filter((sentence) => !/\b(nie|brak)\b/i.test(sentence))
    .join(" ");
  const strengths: [RegExp, string][] = [
    [/produkt.*b2b|platform.*b2b/i, "Doświadczenie w produktach B2B"],
    [/bada[ńn]|badani|wywiad|warsztat.*użytkown/i, "Badania i praca z użytkownikami"],
    [/anali[zst]|analityk|metryk|danych/i, "Analityka produktu i praca z danymi"],
    [/wdro[zż]|uruchomi/i, "Doświadczenie we wdrożeniach"],
    [/automatyzac|asystent/i, "Automatyzacja procesów operacyjnych"],
    [/in[zż]ynier|programist|technicz/i, "Współpraca z zespołem technicznym"],
    [/backlog|priorytetyzac/i, "Priorytetyzacja i prowadzenie backlogu"],
    [/eksperyment|a\/b/i, "Doświadczenie w eksperymentach"],
    [/python/i, "Python"],
    [/\bsql\b/i, "SQL"],
  ];
  return strengths.filter(([pattern]) => pattern.test(materials)).map(([, label]) => label);
}

export function evidenceNarrative(description: string, answer: string, cv = "") {
  const rows = offerRequirements(description).map((requirement) =>
    requirementReview(answer, requirement, cv),
  );
  const related = rows.filter((row) => row.source).length;
  const strengths = candidateStrengths(answer, cv);
  const experienceSection = cv.includes("DOŚWIADCZENIE")
    ? cv.split("DOŚWIADCZENIE")[1].split("UMIEJĘTNOŚCI")[0]
    : cv;
  const experience = sentences(experienceSection)
    .filter(
      (sentence) =>
        !/umiejętności:|^[\p{L} -]+ — /iu.test(sentence) && !/\b(nie|brak)\b/i.test(sentence),
    )
    .slice(0, 4)
    .join(" ");
  const result = sentences(answer).find((sentence) => /\d+\s*%/.test(sentence));
  return `${strengths.length ? `Mocne strony: ${strengths.join("; ")}.` : "Materiały wymagają doprecyzowania doświadczenia względem tej roli."} ${experience ? `Doświadczenie w CV: ${experience}` : "Brak opisu doświadczenia w dołączonym CV."} ${result ? `Rezultat opisany w odpowiedzi: „${result}”` : ""} ${related ? `CV i odpowiedź zawierają podstawę do omówienia ${related} z ${rows.length} wymagań.` : "Materiały nie zawierają jeszcze konkretnych przykładów odnoszących się do wymagań."} Na rozmowie warto doprecyzować zakres samodzielnych decyzji i pracy względem zespołu${/\d+\s*%/.test(`${answer} ${cv}`) ? " oraz sposób pomiaru podanych rezultatów" : " oraz rezultat wybranego projektu"}.`;
}
