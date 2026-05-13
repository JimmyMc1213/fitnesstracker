import { useEffect } from "react";

import { FitnessApp } from "./fitness/FitnessApp";
import { attachVisualViewportBodyFit } from "./visualViewportBodyFit";

export default function App() {
  useEffect(() => attachVisualViewportBodyFit(), []);

  return (
    <div className="app-root">
      <FitnessApp />
    </div>
  );
}
