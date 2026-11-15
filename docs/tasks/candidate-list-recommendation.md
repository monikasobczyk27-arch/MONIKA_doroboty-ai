# Candidate list contact recommendation

Show the contact recommendation directly beneath Match Score on each employer candidate card, as requested in the supplied screenshot. Reuse the detail screen's requirement review and recommendation with the same submitted CV resolver. Candidate-owned applications must not display this employer recommendation. Preserve stage actions and the existing card link; no invitation is sent by displaying the recommendation.

Acceptance: list and detail agree; each card uses its own offer and immutable submitted materials; narrow cards wrap without overflow. Validation results below.

## Delivery and validation

Implemented on prototyp-moniki. Employer cards stack Match Score, a pink requirement count and the shared contact recommendation. Details use the same requirement count color. Candidate-owned cards do not expose recruiter recommendations or requirement verdicts.

35 unit tests, types, lint and static build passed. The Chrome journey verified candidate-side absence, employer list/detail recommendation consistency, 4/6 for Anna, computed supporting-pink badge color, CV snapshot resolution, mobile horizontal overflow, note persistence and reload. Visually reviewed list captures at 1280px and 390px in evidence/candidate-list-recommendation. Marek's prepared card shows 3/6; Anna's shows 4/6. Existing full-gate limitations remain as recorded in recruiter-summary.md; no full-suite or deployment success is claimed.

Separate review checked role boundaries, per-application offer/CV inputs, shared calculation, noninteractive fact semantics and responsive wrapping. No change to stage actions, candidate answers, CVs or recommendation rules.
