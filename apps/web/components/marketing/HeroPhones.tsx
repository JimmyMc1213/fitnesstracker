"use client";

import { useState } from "react";

import { FutureYouPhone, PlanPhone } from "./PhoneMockups";

const ACTIVE_STYLE: React.CSSProperties = {
  transform: "translate(-50%, -50%) translateX(66px) rotate(3.5deg) scale(1)",
  filter: "drop-shadow(0 48px 80px rgba(23, 21, 14, 0.34))",
  zIndex: 3,
};

const BACK_STYLE: React.CSSProperties = {
  transform: "translate(-50%, -50%) translateX(-150px) rotate(-6deg) scale(0.86)",
  filter: "drop-shadow(0 26px 55px rgba(23, 21, 14, 0.24)) brightness(0.96)",
  zIndex: 1,
};

export function HeroPhones() {
  const [front, setFront] = useState<"future" | "plan">("future");
  const planActive = front === "plan";

  return (
    <div className="relative mx-auto min-h-[600px] w-full min-w-[320px] flex-1 basis-[420px]">
      <PlanPhone
        style={planActive ? ACTIVE_STYLE : BACK_STYLE}
        onClick={() => setFront((f) => (f === "plan" ? "future" : "plan"))}
      />
      <FutureYouPhone
        style={planActive ? BACK_STYLE : ACTIVE_STYLE}
        onClick={() => setFront((f) => (f === "plan" ? "future" : "plan"))}
      />
    </div>
  );
}

export function RevealPhone() {
  return (
    <div className="relative mx-auto flex min-h-[580px] w-full max-w-[360px] flex-1 basis-[360px] items-center justify-center">
      <FutureYouPhone
        style={{
          transform: "translate(-50%, -50%)",
          filter: "drop-shadow(0 48px 80px rgba(0, 0, 0, 0.45))",
          zIndex: 3,
        }}
      />
    </div>
  );
}
