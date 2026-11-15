import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  evidenceBlock,
  offerRequirements,
  sourceEvidence,
  requirementReview,
} from "./requirement-evidence";
import "./requirement-summary.css";
import { recruiterRecommendation, productCriteria } from "./recruiter-assessment";

export function EvidenceHelper({
  description,
  answer,
  onChange,
  disabled,
}: {
  description: string;
  answer: string;
  onChange: (answer: string) => void;
  disabled: boolean;
}) {
  const requirements = offerRequirements(description);
  const [selected, setSelected] = useState(0);
  const [example, setExample] = useState("");
  const [ownWork, setOwnWork] = useState("");
  const [message, setMessage] = useState("");
  const requirement = requirements[selected];
  if (!requirement) return null;
  return (
    <details className="evidence-helper">
      <summary>Uzupełnij aplikację z asystentem</summary>
      <p>
        Symulacja bez AI: asystent zadaje przygotowane pytania. Odpowiedzi piszesz i zatwierdzasz
        samodzielnie. Możesz pozostawić wymaganie do rozmowy.
      </p>
      <fieldset disabled={disabled}>
        <label>
          Wymaganie z oferty
          <select
            value={selected}
            onChange={(e) => {
              setSelected(Number(e.target.value));
              setExample("");
              setOwnWork("");
              setMessage("");
            }}
          >
            {requirements.map((item, index) => (
              <option key={item} value={index}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          Jaki konkretny projekt lub sytuacja pokazuje to doświadczenie?
          <Textarea
            value={example}
            maxLength={2500}
            onChange={(e) => setExample(e.target.value)}
            placeholder="Opisz kontekst, wykonane działanie i rezultat. Jeśli nie masz przykładu, pozostaw do oceny."
          />
        </label>
        <label>
          Co dokładnie zrobiłaś lub zrobiłeś samodzielnie?
          <Textarea
            value={ownWork}
            maxLength={2500}
            onChange={(e) => setOwnWork(e.target.value)}
            placeholder="Oddziel własne decyzje i wykonanie od pracy zespołu i pomocy AI."
          />
        </label>
        <Button
          type="button"
          disabled={
            !example.trim() || !ownWork.trim() || Boolean(sourceEvidence(answer, requirement))
          }
          onClick={() => {
            const next = answer + evidenceBlock(requirement, example, ownWork);
            if (next.length > 12000) {
              setMessage("Brak miejsca w aplikacji. Skróć odpowiedź przed dodaniem.");
              return;
            }
            onChange(next);
            setMessage(
              "Dodano Twoje odpowiedzi do aplikacji. Przeczytaj i edytuj je przed wysłaniem.",
            );
          }}
        >
          Zatwierdź i dodaj do odpowiedzi
        </Button>
        {sourceEvidence(answer, requirement) && (
          <p>To wymaganie jest już opisane. Treść możesz poprawić w odpowiedzi poniżej.</p>
        )}
      </fieldset>
      <p role="status">{message}</p>
    </details>
  );
}

type ReviewProps = { description: string; answer: string; cv: string };

export function reviewRows({ description, answer, cv }: ReviewProps) {
  return offerRequirements(description).map((requirement) => ({
    requirement,
    ...requirementReview(answer, requirement, cv),
  }));
}

export function ContactRecommendation(props: ReviewProps) {
  const rows = reviewRows(props);
  const recommendation = recruiterRecommendation(rows);
  const yes = rows.filter((row) => row.status === "Tak").length;
  return (
    <div
      className="flex max-w-[260px] flex-col items-start gap-2 text-sm sm:items-end sm:text-right"
      data-contact-recommendation
    >
      <span
        className="requirement-score"
        aria-label={`Wymagania spełnione: ${yes} z ${rows.length}`}
      >
        <span>Wymagania:</span> {yes} / {rows.length}
      </span>
      <p>
        <span className="block text-muted-foreground">Rekomendacja kontaktu</span>
        <strong>{recommendation.title}</strong>
      </p>
    </div>
  );
}

export function RecruiterBrief(props: ReviewProps) {
  const rows = reviewRows(props);
  const recommendation = recruiterRecommendation(rows);
  const strengths = rows.filter((row) => row.status === "Tak");
  return (
    <div className="recruiter-brief">
      <section className="brief-group" aria-labelledby="brief-experience">
        <h3 id="brief-experience">Zakres doświadczenia</h3>
        {strengths.length ? (
          <ul>
            {strengths.map((row) => (
              <li key={row.requirement}>{row.requirement}</li>
            ))}
          </ul>
        ) : (
          <p>Materiały opisują powiązane doświadczenia; zakres wymaga doprecyzowania.</p>
        )}
      </section>
      <section className="brief-group" aria-labelledby="brief-recommendation">
        <h3 id="brief-recommendation">Rekomendacja kontaktu</h3>
        <p>
          <strong>{recommendation.title}</strong>
        </p>
        <p>{recommendation.why}</p>
      </section>
      <section className="brief-group" aria-labelledby="brief-questions">
        <h3 id="brief-questions">Co doprecyzować</h3>
        <ul>
          {recommendation.gaps.length ? (
            rows
              .filter((row) => row.status !== "Tak")
              .map((row) => <li key={row.requirement}>{row.question}</li>)
          ) : (
            <li>Samodzielny wkład w wybranym projekcie i sposób pomiaru wyniku.</li>
          )}
        </ul>
      </section>
    </div>
  );
}

export function RequirementSummary(props: ReviewProps) {
  const rows = reviewRows(props);
  const yes = rows.filter((row) => row.status === "Tak").length;
  const partial = rows.filter((row) => row.status === "Częściowo").length;
  return (
    <section className="requirement-summary" aria-labelledby="requirements-heading">
      <h3 id="requirements-heading">Wymagania a aplikacja</h3>
      <p className="requirement-count">
        {yes} / {rows.length}
      </p>
      <p>
        Tak: {yes} · Częściowo: {partial} · Brak danych: {rows.length - yes - partial}
      </p>
      <p className="record-caption">
        Ocena na podstawie CV i odpowiedzi. Częściowe spełnienie pokazujemy osobno. Match Score
        mierzy zgodność tekstów.
      </p>
      {!rows.length && <p>Brak rozpoznanej listy wymagań w ofercie.</p>}
      <ul className="requirement-list">
        {rows.map((row, index) => (
          <li key={row.requirement} className="requirement-item">
            <div className="requirement-item-heading">
              <h4>
                {productCriteria.find((item) => item.title === row.requirement)?.id ?? index + 1}.{" "}
                {row.requirement}
              </h4>
              <strong className="requirement-verdict" data-verdict={row.status}>
                {row.status}
              </strong>
            </div>
            <p>{row.rationale}</p>
            <details className="requirement-row">
              <summary>Zobacz źródła i pytanie do rozmowy</summary>
              {row.sources.map((item) => (
                <div key={item.label}>
                  <p className="record-caption">{item.label}</p>
                  <blockquote>{item.text}</blockquote>
                </div>
              ))}
              {!row.source && <p>W CV i odpowiedzi nie znaleziono opisu tego doświadczenia.</p>}
              <h4>Co doprecyzować</h4>
              <p>{row.question}</p>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
