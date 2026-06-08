import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { WorkoutCoachCard } from "./WorkoutCoachCard";

const baseProps = {
  overloadTip: "Add 5 lb when all sets feel easy.",
  warmupGroups: [{ label: "General", drills: [{ name: "Easy cardio", prescription: "5 min" }] }],
};

function renderCoachCard(defaultExpanded?: boolean): string {
  return renderToStaticMarkup(
    createElement(WorkoutCoachCard, {
      ...baseProps,
      ...(defaultExpanded === undefined ? {} : { defaultExpanded }),
    }),
  );
}

describe("WorkoutCoachCard defaultExpanded", () => {
  it("mounts expanded when defaultExpanded is true", () => {
    const html = renderCoachCard(true);
    expect(html).toContain('aria-expanded="true"');
    expect(html).not.toContain("Tap for coach note");
    expect(html).toContain(baseProps.overloadTip);
  });

  it("mounts collapsed when defaultExpanded is false", () => {
    const html = renderCoachCard(false);
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("Tap for coach note");
    expect(html).not.toContain(baseProps.overloadTip);
  });

  it("defaults to collapsed for backward compatibility", () => {
    const html = renderCoachCard();
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("Tap for coach note");
  });
});
