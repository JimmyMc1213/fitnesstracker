import { describe, expect, it } from "vitest";
import {
  FUTURE_YOU_ACTIVE_STATUSES,
  FUTURE_YOU_JOB_STATUSES,
  canTransitionFutureYouJobStatus,
  isFutureYouJobActive,
  isFutureYouJobStatus,
  isFutureYouJobTerminal,
} from "./jobs";

describe("futureYouJobs", () => {
  it("defines the four lifecycle statuses", () => {
    expect(FUTURE_YOU_JOB_STATUSES).toEqual(["queued", "generating", "ready", "failed"]);
  });

  it("treats queued and generating as active", () => {
    expect(FUTURE_YOU_ACTIVE_STATUSES).toEqual(["queued", "generating"]);
    expect(isFutureYouJobActive("queued")).toBe(true);
    expect(isFutureYouJobActive("generating")).toBe(true);
    expect(isFutureYouJobActive("ready")).toBe(false);
    expect(isFutureYouJobActive("failed")).toBe(false);
  });

  it("treats ready and failed as terminal", () => {
    expect(isFutureYouJobTerminal("ready")).toBe(true);
    expect(isFutureYouJobTerminal("failed")).toBe(true);
    expect(isFutureYouJobTerminal("queued")).toBe(false);
  });

  it("narrows unknown strings with isFutureYouJobStatus", () => {
    expect(isFutureYouJobStatus("generating")).toBe(true);
    expect(isFutureYouJobStatus("pending")).toBe(false);
  });

  it("allows queued → generating → ready", () => {
    expect(canTransitionFutureYouJobStatus("queued", "generating")).toBe(true);
    expect(canTransitionFutureYouJobStatus("generating", "ready")).toBe(true);
  });

  it("allows failure from queued or generating", () => {
    expect(canTransitionFutureYouJobStatus("queued", "failed")).toBe(true);
    expect(canTransitionFutureYouJobStatus("generating", "failed")).toBe(true);
  });

  it("blocks transitions out of terminal states", () => {
    expect(canTransitionFutureYouJobStatus("ready", "generating")).toBe(false);
    expect(canTransitionFutureYouJobStatus("failed", "queued")).toBe(false);
  });

  it("blocks skipping generating", () => {
    expect(canTransitionFutureYouJobStatus("queued", "ready")).toBe(false);
  });
});
