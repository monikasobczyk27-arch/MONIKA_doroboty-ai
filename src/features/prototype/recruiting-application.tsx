import { useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ApplicationRecord } from "./application-record";
import { nextStages, stageLabels, type Application } from "./model";
import { usePrototype } from "./store";
import { RequirementSummary, RecruiterBrief, reviewRows } from "./requirement-summary";
import { recruiterRecommendation } from "./recruiter-assessment";
import { submittedCvText } from "./submitted-cv";

export function RecruitingApplication({ application }: { application: Application }) {
  const { state, run } = usePrototype();
  const [note, setNote] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const statusRef = useRef<HTMLSpanElement>(null);
  const pendingFocus = useRef(false);
  const company = state.companies.find((item) => item.id === application.companyId);
  const availableStages = nextStages[application.stage];
  const description = state.jobs.find((item) => item.id === application.jobId)?.description ?? "";
  const cv = submittedCvText(application.candidateId, application.cv);
  const review = { description, answer: application.answer, cv };
  const rows = reviewRows(review);
  const recommendation = recruiterRecommendation(rows);
  const suggestedNote = `${recommendation.title}. ${recommendation.why}\nDo omówienia:\n${rows
    .filter((row) => row.status !== "Tak")
    .map((row) => `• ${row.question}`)
    .join("\n")}\nSamodzielny wkład kandydata i sposób pomiaru rezultatu.`;

  useLayoutEffect(() => {
    if (pendingFocus.current) {
      statusRef.current?.focus();
      pendingFocus.current = false;
    }
  }, [application.stage]);

  return (
    <>
      <ApplicationRecord
        application={application}
        summaryContent={<RecruiterBrief {...review} />}
        companyName={company?.name ?? ""}
        audience="employer"
        history={application.events}
        statusRef={statusRef}
        footer={
          availableStages.length > 0 ? (
            <>
              <p className="record-caption">Notatka zapisze się w historii po zmianie etapu.</p>
              <div className="record-actions">
                {availableStages.map((stage) => (
                  <Button
                    key={stage}
                    variant={stage === "rejected" ? "outline" : "default"}
                    onClick={() => {
                      if (run({ type: "stage", applicationId: application.id, stage, note })) {
                        setNote("");
                        setAnnouncement(`Zapisano etap: ${stageLabels[stage]}.`);
                        pendingFocus.current = true;
                      }
                    }}
                  >
                    {stageLabels[stage]}
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <p className="record-caption">
              {stageLabels[application.stage]}. Brak kolejnych działań w tym procesie.
            </p>
          )
        }
      >
        <RequirementSummary
          cv={cv}
          description={state.jobs.find((item) => item.id === application.jobId)?.description ?? ""}
          answer={application.answer}
        />
        {availableStages.length > 0 ? (
          <>
            <h3>
              <label htmlFor="recruiting-note">Notatka rekrutacyjna</label>
            </h3>
            <p className="record-caption" id="recruiting-note-hint">
              Widoczna tylko pracodawcy w tym scenariuszu.
            </p>
            <Button
              type="button"
              variant="outline"
              disabled={Boolean(note.trim())}
              onClick={() => {
                setNote(suggestedNote);
                document.getElementById("recruiting-note")?.focus();
              }}
            >
              Wstaw proponowaną notatkę
            </Button>
            <Textarea
              id="recruiting-note"
              aria-label="Notatka rekrutacyjna (widoczna pracodawcy)"
              aria-describedby="recruiting-note-hint"
              maxLength={12000}
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Co warto sprawdzić w rozmowie?"
            />
          </>
        ) : null}
      </ApplicationRecord>
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </>
  );
}
