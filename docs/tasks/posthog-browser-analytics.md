# PostHog browser analytics

Configure VITE_POSTHOG_PROJECT_TOKEN and VITE_POSTHOG_HOST in .env.local for local use or at build time for deployment. Use the browser project token and the ingestion host shown in the intended PostHog project. Both values are required.

Acceptance: a configured build sends prototype_opened once per document load without recruitment data, URL, or referrer. A build without configuration collects no analytics.

Acceptance for the candidate journey: opening an offer, opening its application form, and successfully saving a submission send job_viewed, application_started, and application_submitted respectively. All three use the same anonymous ID in a single page load and send only the job ID alongside SDK identifiers.
