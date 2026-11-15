# Compact recruiter brief

User requests three clearly distinguished summary labels, smaller text and less scattered spacing. Scope: employer RecruiterBrief only; do not change screening data, recommendations, note behavior or candidate summaries.

Composition: three named semantic sections, separated by an ink rule. Use existing C08-style noninteractive supporting-pink labels (paper/ink/light pink, 10px radius) for the compact section labels, with a consistent interface font for labels and working text as explicitly requested. Retain semantic H3 for navigation and the parent Geist Serif H2. This is a host composition of label/reading roles, not a new immutable kit variant. Body text 13px/1.45; labels 13px bold; internal gaps 6–8px and section gaps 12px. Preserve lists and original content.

Acceptance: all three section labels are visually distinct, summary uses one interface font, desktop/mobile wrap without overflow. Verification below.

## Verification and review

Types, lint and production build passed. Existing Chrome journey passed (recommendation/count consistency, CV sources, keyboard disclosure, editable note/history persistence, reload and mobile overflow). Visually inspected new desktop and mobile captures in evidence/recruiter-summary-v6: the three labelled sections are distinct, all brief working text uses the interface font and compact spacing, and content remains complete. Related candidate list captures were saved separately in evidence/candidate-list-recommendation-v2 to preserve earlier evidence.

Separate review confirmed scoped selectors, named section semantics and unchanged recommendation/content/state behavior. FEATURES.md was reviewed and needs no update for this visual-only change. The immutable kit is unchanged. Existing full-repository gate blockers remain documented in recruiter-summary.md; this does not claim a full-suite pass or design-library release.
