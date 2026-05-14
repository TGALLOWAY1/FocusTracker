import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Hydrate localStorage from Convex (for absent keys only) BEFORE statically
// importing App. Zustand's persist middleware reads storage at store-creation
// time — which happens transitively when App's module graph is loaded — so
// the dynamic import below ensures any backend-only state lands in
// localStorage first, then the stores hydrate from it.
async function bootstrap(): Promise<void> {
  const { hydrateFromBackend, installSync } = await import(
    "./sync/installSync"
  );
  await hydrateFromBackend();

  const { default: App } = await import("./App");

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  installSync();
}

void bootstrap();
