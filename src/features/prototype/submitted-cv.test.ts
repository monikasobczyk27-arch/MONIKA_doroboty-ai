import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import people from "./data/people.json" with { type: "json" };
import extracted from "./data/cv-text.json" with { type: "json" };
import { submittedCvText } from "./submitted-cv";

describe("submitted CV source", () => {
  it("uses the full immutable PDF text only for the corresponding saved snapshot", () => {
    for (const [id, data] of Object.entries(extracted)) {
      const person = people.find((item) => item.id === id)!;
      expect(
        createHash("sha256")
          .update(readFileSync(`public/cv/${data.file}`))
          .digest("hex"),
      ).toBe(data.sha256);
      expect(submittedCvText(id, person.cv)).toBe(data.text);
      expect(data.text).not.toContain("\ufffd");
      expect(submittedCvText(id, "Moje nowe CV: Python i SQL.")).toBe(
        "Moje nowe CV: Python i SQL.",
      );
    }
    const anna = people.find((item) => item.id === "candidate-anna")!;
    expect(submittedCvText(anna.id, anna.cv)).toContain("Opero Systems");
    expect(submittedCvText(anna.id, anna.cv)).toContain("SQL");
    expect(submittedCvText("unknown", anna.cv)).toBe(anna.cv);
  });
});
