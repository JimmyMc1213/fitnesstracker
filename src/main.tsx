import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { initKeyboardScrollIntoView } from "./fitness/keyboardScrollIntoView";
import "./index.css";

initKeyboardScrollIntoView();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
