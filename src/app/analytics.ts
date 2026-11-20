import posthog from "posthog-js";

const publicReplayLabels = new Set([
  "DoRoboty.ai",
  "Oferty",
  "Zobacz oferty",
  "Wszystkie oferty",
  "Wróć do ofert",
  "Jak wybieramy role",
  "Metodologia",
  "Aplikuj",
  "Filtry",
  "Wybierz osobę",
  "Prywatność",
]);

type JobEvent = "job_viewed" | "application_started" | "application_submitted";

export function captureJobEvent(event: JobEvent, jobId: string) {
  posthog.capture(event, { job_id: jobId });
}

export const interactionAnalyticsConfigured = Boolean(
  import.meta.env.VITE_POSTHOG_PROJECT_TOKEN?.trim() && import.meta.env.VITE_POSTHOG_HOST?.trim(),
);

export function isPublicAnalyticsPath(pathname: string) {
  return pathname === "/" || /^\/oferty(?:\/[^/]+)?\/?$/.test(pathname);
}

function publicInteractionCaptureAllowed() {
  const hashPath = window.location.hash.slice(1).split(/[?#]/, 1)[0] || "/";
  return (
    isPublicAnalyticsPath(hashPath) &&
    document.querySelector("[data-public-interaction-capture]") !== null
  );
}

export function setPublicInteractionCapture(enabled: boolean) {
  if (!interactionAnalyticsConfigured) return;
  if (enabled) posthog.startSessionRecording();
  else posthog.stopSessionRecording();
}

export function startBrowserAnalytics() {
  const token = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN?.trim();
  const host = import.meta.env.VITE_POSTHOG_HOST?.trim();
  if (!token || !host) return;

  posthog.init(token, {
    api_host: host,
    defaults: "2026-08-30",
    autocapture: {
      dom_event_allowlist: ["click"],
      element_allowlist: ["a", "button"],
      css_selector_allowlist: ["[data-public-interaction-capture]"],
      css_selector_ignorelist: [
        ".ph-no-autocapture",
        "[data-ph-no-autocapture]",
        "[data-private-analytics]",
        "form",
        "input",
        "select",
        "textarea",
        "[contenteditable]",
      ],
    },
    mask_all_text: true,
    mask_all_element_attributes: true,
    capture_pageview: false,
    capture_pageleave: false,
    capture_dead_clicks: false,
    capture_exceptions: false,
    capture_performance: false,
    disable_session_recording: true,
    disable_surveys: true,
    enable_recording_console_log: false,
    session_recording: {
      blockSelector:
        "[data-private-analytics], form, input, textarea, select, [contenteditable], iframe",
      maskAllInputs: true,
      maskTextSelector: "*",
      maskTextFn: (text, element) => {
        if (element?.closest("a, button") && publicReplayLabels.has(text.trim())) return text;
        return text.replace(/\S/g, "*");
      },
      maskAttributeFn: (name, value, element) => {
        if (["class", "role", "width", "height"].includes(name)) return value;
        if (element?.tagName === "LINK" && element.getAttribute("rel") === "stylesheet") {
          if (name === "rel") return "stylesheet";
          if (name === "href") {
            const asset = new URL(value, window.location.origin);
            if (
              asset.origin === window.location.origin &&
              /^\/assets\/[\w.-]+\.css$/.test(asset.pathname)
            )
              return asset.origin + asset.pathname;
          }
        }
        return "";
      },
      maskCapturedNetworkRequestFn: (request) => {
        // Replay metadata needs an href to render. Keep only a generic public route.
        if (Object.keys(request).length !== 1 || !publicInteractionCaptureAllowed()) return null;
        const path = window.location.hash.startsWith("#/oferty") ? "#/oferty" : "#/";
        return { ...request, name: window.location.origin + "/" + path };
      },
      recordHeaders: false,
      recordBody: false,
    },
    advanced_disable_feature_flags: true,
    disable_conversations: true,
    disable_product_tours: true,
    person_profiles: "never",
    persistence: "memory",
    before_send: (event) => {
      if (!event) return null;
      const { token, distinct_id, $process_person_profile, job_id } = event.properties;
      const properties = { token, distinct_id, $process_person_profile };
      switch (event.event) {
        case "$autocapture":
          return publicInteractionCaptureAllowed()
            ? { ...event, properties: { ...properties, $event_type: "click" } }
            : null;
        case "$snapshot":
          return publicInteractionCaptureAllowed() ? event : null;
        case "prototype_opened":
          return { ...event, properties };
        case "job_viewed":
        case "application_started":
        case "application_submitted":
          return { ...event, properties: { ...properties, job_id } };
        default:
          return null;
      }
    },
    loaded: (client) => {
      client.capture("prototype_opened");
    },
  });
}
