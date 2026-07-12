import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { ApplicationManager } from "./core";
import { EvidenceRepository } from "./repositories";

import "./index.css";

async function bootstrap(): Promise<void> {
  ApplicationManager.initialize();

  try {
    const migration =
      await EvidenceRepository.initializeDurableStorage();

    console.info("Evidence storage initialized.", migration);
  } catch (error) {
    console.error(
      "IndexedDB initialization failed. Continuing with localStorage fallback.",
      error
    );
  }

  const rootElement = document.getElementById("root");

  if (!rootElement) {
    throw new Error("Application root element was not found.");
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

void bootstrap();
