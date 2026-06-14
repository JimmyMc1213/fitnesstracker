import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { applyVisualParityBootstrapIfEnabled } from "./fitness/visualParityBootstrap";
import "./index.css";

applyVisualParityBootstrapIfEnabled();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
