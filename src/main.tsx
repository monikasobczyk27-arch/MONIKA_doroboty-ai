import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./features/prototype/app";
import { startBrowserAnalytics } from "./app/analytics";
import "./app/globals.css";
startBrowserAnalytics();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
