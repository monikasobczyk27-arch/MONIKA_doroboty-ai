# Recruiter summary experiment

Implement on `prototyp-moniki`. Provide offer-specific requirement counts, source answers, open questions and a descriptive summary in the employer application. Missing evidence stays unknown. Scores remain illustrative text-match proxies. A local scripted candidate helper asks for a concrete example and independent contribution before inserting candidate-approved text into the existing persisted answer. No API or external messages. Existing submissions remain immutable.

Acceptance: requirements come from the offer, helper never invents experience, editing resets consent, evidence survives draft/reload/submission, older free-text answers stay available without inferred positive statuses, keyboard/mobile layout works. Run the repository verification gate and a separate review.

## Validation and independent review pass

- TypeScript, ESLint and all 29 unit tests passed after the final source change. Static Vite build passed before the final descriptive-summary adjustment (the final TypeScript check includes that adjustment).
- Local Chrome browser journey passed twice, including the final summary change: helper ownership gate, draft/reload, submit, employer count 1/3, exact source, persisted summary and 390px overflow. Screenshots: evidence/recruiter-summary/desktop.png and mobile.png, visually reviewed. This test uses an isolated browser context and does not populate the user's existing browser state.
- Reviewed separately for unsupported claims and stale persona data: employer sidebar now derives its narrative from the submitted answer instead of the fixed persona summary. No changes to the immutable kit, existing source evidence, role authorization or state schema.
- Full verification is not green: npm/npx are absent from this shell, so equivalent individual checks were invoked through Node. Repository-wide formatting reports existing files, kit hash verification fails on .nvmrc, and participant CSV verification fails on CRLF versus LF. Standalone kit checks and its six renderer tests pass. Default Playwright Chromium is not provisioned; the focused journey used installed Chrome. Full existing browser suite was not executed.
- Scope limits: helper is optional and scripted; it does not evaluate meaning, generate text, contact candidates or verify skills. A positive status means an example and ownership were declared for that requirement. Existing free text is not automatically mapped. Offer requirements are read from recognized headings in the current offer; edited offers can change the comparison. Submitted text remains unchanged.

## Correction after user review — 15 November

The initial structured-only summary hid existing candidate evidence. Replaced it with extractive summaries from the submitted text and conservative concept-based excerpt matching, with partial status separate from missing information. The number now means requirements with supporting text, not verified requirements met. Preserved original candidate text and structured helper. This supersedes the initial structured-only acceptance behavior.

Regression: the user's automation/research/deployment/25% example gives 2/3 requirements with partial evidence, leaves engineering collaboration unknown, and asks about independent work, analytics and measurement. 30 unit tests, TypeScript and lint passed. Installed Chrome journey passed including this exact free-text fixture, source excerpts, keyboard disclosure, reload and 390px overflow. New screenshots are in evidence/recruiter-summary-v2. Prior full-gate blockers remain as documented above; no complete-suite success is claimed.

Separate review: checked partial versus missing semantics, no fabricated ownership/analytics/engineer experience for the regression case, shared narrative between sidebar and main summary, and the limitations of local cue matching. Broad arbitrary text and CV need a later semantic assessment; excerpts remain visible so the recruiter can evaluate the basis.

## Correction — full CV as evidence and strengths

User reported that summaries still ignored CV experience and repeated an unnecessary declaration disclaimer. Both employer summary locations and requirement excerpts now use submitted CV plus answer. Added experience/strength extraction and removed the closing declaration disclaimer. Prepared PDFs contain more than the original short snapshot: checked-in full PDF extraction is used only under the exact candidate/snapshot guard shared with CvAttachment. Custom CV text stays custom; immutable PDF files and application snapshots were not changed. Offline PDF extraction uses pypdf via the PDF skill, not a new frontend dependency.

Validation: 32 unit tests, TypeScript, ESLint and production build passed. Tests verify hashes of both source PDFs, matching identities/snapshots, custom/unknown fallbacks, CV-only strengths, no unsupported Python claim, and the absence of replacement characters. Chrome journey passed with PDF-only employer name and SQL in the summary, CV-labelled evidence, reload, keyboard disclosure and mobile overflow. Captures in evidence/recruiter-summary-v3 were visually inspected at 1280/390px. Existing full-repository gate blockers remain; full browser suite was not repeated.

Separate review checked source fidelity, full versus concise CV data, identity/snapshot boundaries, labels, and both shared summary callers. Local cue matching remains limited; source excerpts and unknowns stay visible. No API capability or verified competency assessment is claimed. The fixed persona PDF text is built into the prototype; dynamic arbitrary PDF ingestion is outside this change.

## Explicit offer criteria and recruiter decision support

User clarified the offer's lifecycle/backlog/discovery/experiment/technical/B2B criteria and requested short bullets, direct verdicts and a note/recommendation. Implemented six visible items, including expectations outside the original requirements heading, with Tak/Częściowo/Brak danych, concise rationale and expandable sources. The overall lifecycle and its subareas are intentionally displayed separately using 1 / 1a–1d / 2 labels; the displayed denominator is six review items, not six independent measurements. Generic scoring remains only for other offers.

Sidebar uses experience-scope bullets instead of copied CV text; concrete gap questions accompany a contact recommendation and rationale. Human can insert a proposed note into the empty editor, edit it, and save it with a stage change. Typed notes are never overwritten by the suggestion button; candidate views do not receive recruiter content. Source data and immutable CVs remain unchanged.

Validation: 35 unit tests, types and lint passed. Static production build passed before the final sidebar question/number-label refinement, whose types and lint passed. Chrome journey verified six-item counts, CV sources, keyboard disclosure, recommendation, proposed note, manual note editing, stage/history persistence, reload and mobile overflow. Desktop capture in evidence/recruiter-summary-v4 was visually reviewed. Existing full-gate blockers remain as recorded; no full-suite or deployment claim.

Separate review: checked both canonical candidates. Marek's backlog and B2B/operations are Tak; product-data analysis is partial, experiment/recommendation missing. Anna's experiment/recommendation is Tak; B2B and cost/quality discussion remain partial. Acceptance tests pin these distinctions rather than treating acceptance testing as an experiment or requirements analysis as product analytics. Matching is still a limited scripted prototype. The recommendation is an aid to contact, leaving the human decision and process actions intact.
