import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MockAgentRunsClient } from "./mock-client";

describe("MockAgentRunsClient", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("lists runs covering every supported status", async () => {
    const client = new MockAgentRunsClient();
    const pendingRuns = client.list();
    await vi.advanceTimersByTimeAsync(180);
    const runs = await pendingRuns;

    expect(runs).toHaveLength(8);
    expect(new Set(runs.map(run => run.status))).toEqual(
      new Set(["queued", "running", "succeeded", "failed", "cancelled"])
    );
  });

  it("emits incremental progress and stops after unsubscribe", async () => {
    const client = new MockAgentRunsClient();
    const pendingRuns = client.list();
    await vi.advanceTimersByTimeAsync(180);
    const initialRuns = await pendingRuns;
    const initialProgress = initialRuns.find(
      run => run.id === "mock-run-analytics"
    )?.progress;
    const snapshots: (typeof initialRuns)[] = [];

    const unsubscribe = client.subscribe(runs => snapshots.push(runs));
    await vi.advanceTimersByTimeAsync(2_000);

    expect(snapshots).toHaveLength(1);
    expect(
      snapshots[0].find(run => run.id === "mock-run-analytics")?.progress
    ).toBeGreaterThan(initialProgress ?? 0);

    await vi.advanceTimersByTimeAsync(4_000);
    expect(
      snapshots.at(-1)?.some(run => run.id.startsWith("mock-run-3-"))
    ).toBe(true);

    unsubscribe();
    const emittedBeforeStop = snapshots.length;
    await vi.advanceTimersByTimeAsync(4_000);
    expect(snapshots).toHaveLength(emittedBeforeStop);
  });
});
