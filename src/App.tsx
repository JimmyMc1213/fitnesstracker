import { FitnessApp } from "./fitness/FitnessApp";

export default function App() {
  return (
    <div className="app-root">
      <div
        style={{
          position: "fixed",
          top: 10,
          left: 10,
          zIndex: 9999,
          background: "red",
          color: "white",
          fontSize: 12,
          padding: 4,
        }}
      >
        win: {window.innerHeight} | doc: {document.documentElement.clientHeight}
      </div>
      <FitnessApp />
    </div>
  );
}
