import people from "./data/people.json" with { type: "json" };
import extracted from "./data/cv-text.json" with { type: "json" };

/** Same identity + snapshot guard as CvAttachment: never substitute a PDF for custom text. */
export function submittedCvText(candidateId: string, snapshot: string) {
  const person = people.find((item) => item.id === candidateId);
  const attachment = extracted[candidateId as keyof typeof extracted];
  return attachment && person?.cv === snapshot ? attachment.text : snapshot;
}
