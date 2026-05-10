import { useEffect } from "react";

import { FitnessApp } from "./fitness/FitnessApp";
import { subscribeAppViewportHeight } from "./syncViewportHeight";

export default function App() {
  useEffect(() => subscribeAppViewportHeight(), []);

  return (
    <div className="app-root">
      <FitnessApp />
    </div>
  );
}
