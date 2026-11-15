type Check = { label: string; pattern: RegExp; context?: (text: string) => boolean };

function normalizeContext(text: string) {
  return text.normalize("NFD").replace(/\p{M}/gu, "").replace(/ł/gi, "l").toLocaleLowerCase("pl");
}

function businessProductContext(text: string) {
  const value = normalizeContext(text);
  const businessPartner = /producent|dealer|dystrybutor|przedsiebiorstw|firm/.test(value);
  const productWork = /wspolprac|na potrzeby|przygotow|wdroz|system|ofert|produkt/.test(value);
  const professionalEquipment =
    /finansowan|leasing/.test(value) &&
    /sprzet|urzadzen/.test(value) &&
    /medyczn|branzy med\b|medyk|klin|szpital|gabinet/.test(value) &&
    /ofert|produkt|rynku|klient|sprzedaz/.test(value) &&
    !/pacjent|indywidualn|konsumen|osob.{0,15}prywatn|do domu/.test(value);
  return (businessPartner && productWork) || professionalEquipment;
}

function operationalProcessContext(text: string) {
  const value = normalizeContext(text);
  return /system.{0,25}sprzedazow|automatycz.{0,35}ofert|decyzj.{0,35}finansowan|finansowan.{0,40}wizyt|przeplyw.{0,25}(sprzedaz|finansowan)|obslugi dealer/.test(
    value,
  );
}

function matches(check: Check, text: string) {
  return check.pattern.test(text) || Boolean(check.context?.(text));
}
export const productCriteria: { id: string; title: string; checks: Check[]; question: string }[] = [
  {
    id: "1",
    title: "Prowadzenie produktu cyfrowego od discovery do wdrożenia",
    checks: [
      { label: "prowadzenie produktu", pattern: /produkt|platform/i },
      {
        label: "discovery z użytkownikami",
        pattern: /discovery|bada[ńn]|wywiad|warsztat.*użytkown/i,
      },
      { label: "wdrożenie", pattern: /wdro[zż]|uruchomi/i },
    ],
    question:
      "Za które decyzje od discovery do wdrożenia odpowiadałeś samodzielnie? Co robił zespół?",
  },
  {
    id: "1a",
    title: "Priorytetyzacja backlogu i ograniczanie zakresu na początek",
    checks: [
      { label: "backlog lub priorytetyzacja", pattern: /backlog|priorytet/i },
      { label: "wybór zakresu", pattern: /zakres|iterac|wybra.{0,30}obszar|pilota|planowanie/i },
    ],
    question: "Które pomysły odłożyłeś i dlaczego? Jak wybrałeś zakres pierwszej iteracji?",
  },
  {
    id: "1b",
    title: "Discovery: połączenie rozmów z analizą danych i decyzją o zakresie",
    checks: [
      { label: "rozmowy z użytkownikami", pattern: /bada[ńn]|badani|wywiad|warsztat.*użytkown/i },
      {
        label: "analiza danych o produkcie",
        pattern:
          /analiz.{0,25}(lejk|retenc|danych)|analityk[aęi] produktu|analityczne|miernik|metryk/i,
      },
      { label: "decyzja o zakresie", pattern: /zakres|wybra.{0,30}obszar|pilota|priorytet/i },
    ],
    question:
      "Pokaż decyzję, w której rozmowy i dane doprowadziły do ograniczenia zakresu. Jakie dane rozstrzygnęły?",
  },
  {
    id: "1c",
    title: "Przeprowadzenie eksperymentu i dalsze rekomendacje",
    checks: [
      { label: "eksperyment", pattern: /eksperyment|a\/b/i },
      {
        label: "rekomendacja po wyniku",
        pattern: /rekomendac|co rozwija|co popraw|z czego rezygn/i,
      },
    ],
    question:
      "Jaka była hipoteza, miara sukcesu i wynik eksperymentu? Co na tej podstawie zarekomendowałeś?",
  },
  {
    id: "1d",
    title: "Rozmowy z inżynierami o jakości, koszcie i ograniczeniach rozwiązania",
    checks: [
      { label: "współpraca z inżynierami", pattern: /in[zż]ynier|programist|techniczn/i },
      { label: "jakość rozwiązania", pattern: /jakoś|ewaluac|kryteria akceptacji/i },
      { label: "koszt rozwiązania", pattern: /koszt|budżet/i },
      { label: "ograniczenia rozwiązania", pattern: /ograniczeni|kompromis/i },
    ],
    question:
      "Omów kompromis uzgodniony z inżynierami: jakość, koszt i ograniczenia. Która decyzja była Twoja?",
  },
  {
    id: "2",
    title: "Znajomość produktów B2B i procesów operacyjnych",
    checks: [
      {
        label: "produkt B2B",
        pattern: /b2b|klient.{0,15}biznesow/i,
        context: businessProductContext,
      },
      {
        label: "procesy operacyjne",
        pattern: /operacyjn|obsług.{0,20}(zgłosze|klient)|proces.{0,20}(obsług|zgłosze)/i,
        context: operationalProcessContext,
      },
    ],
    question:
      "Który proces klienta B2B usprawniałeś i jakie wyjątki lub ograniczenia miały znaczenie?",
  },
];

export function usesProductCriteria(description: string) {
  return (
    description.includes("Pomysłów na automatyzację jest więcej niż czasu") &&
    description.includes("od discovery do wdrożenia")
  );
}

function fragments(text: string) {
  return text
    .replace(/\[Wymaganie: [^\n]*\]/g, "")
    .replace(/\[Koniec wymagania\]/g, "")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((item) => item.trim())
    .filter((item) => item && !/\b(nie|brak)\b/i.test(item));
}

export function assessProductCriterion(answer: string, requirement: string, cv: string) {
  const criterion = productCriteria.find((item) => item.title === requirement);
  if (!criterion) return null;
  const sources = [
    { label: "CV dołączone do aplikacji", text: cv },
    { label: "Odpowiedź kandydata", text: answer },
  ].flatMap((source) => {
    const parts = fragments(source.text);
    const candidates = parts.flatMap((_, index) =>
      [1, 2, 3, 4].map((size) => parts.slice(index, index + size).join(" ")),
    );
    // Context can span a heading and following lines. Keep the shortest supporting excerpt per check.
    const relevant = criterion.checks
      .map(
        (check) =>
          candidates.filter((text) => matches(check, text)).sort((a, b) => a.length - b.length)[0],
      )
      .filter((text): text is string => Boolean(text));
    return relevant.length ? [{ label: source.label, text: [...new Set(relevant)].join(" ") }] : [];
  });
  // Evaluate all source text; excerpts are intentionally concise and expandable in the UI.
  // Do not assemble contextual business relationships from unrelated CV/answer fragments.
  const supports = (check: Check) => sources.some((source) => matches(check, source.text));
  const found = criterion.checks.filter(supports);
  const missing = criterion.checks.filter((check) => !supports(check));
  const complete = missing.length === 0;
  const status = complete ? "Tak" : found.length ? "Częściowo" : "Brak danych";
  return {
    source: sources.length ? sources.map((item) => item.text).join(" ") : null,
    sources,
    complete,
    status,
    question: criterion.question,
    rationale: `${found.length ? `Jest opis: ${found.map((item) => item.label).join(", ")}.` : "Materiały nie opisują tego doświadczenia."}${missing.length ? ` Do doprecyzowania: ${missing.map((item) => item.label).join(", ")}.` : ""}`,
  };
}

export function recruiterRecommendation(rows: { status: string; requirement: string }[]) {
  const yes = rows.filter((row) => row.status === "Tak");
  const partial = rows.filter((row) => row.status === "Częściowo");
  // Transparent prototype rule: contact is proposed only with a clearly described relevant area.
  const invite = yes.length > 0;
  return {
    title: invite ? "Warto zaprosić do rozmowy" : "Najpierw poproś o uzupełnienie",
    why: invite
      ? `Podstawą kontaktu jest opisane doświadczenie: ${yes
          .slice(0, 2)
          .map((row) => row.requirement.toLocaleLowerCase("pl"))
          .join("; ")}.`
      : partial.length
        ? "Są powiązane doświadczenia, ale brakuje konkretnego przykładu spełnienia wymagań. Uzupełnienie pomoże ustalić zakres rozmowy."
        : "Materiały nie dają jeszcze podstawy do oceny wymagań tej oferty.",
    gaps: rows.filter((row) => row.status !== "Tak").map((row) => row.requirement),
  };
}
