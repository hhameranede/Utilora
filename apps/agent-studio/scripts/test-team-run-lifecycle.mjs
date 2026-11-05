import test from "node:test";
import assert from "node:assert/strict";
import { REQUIRED_SPECIALIST_IDS, summarizeSpecialistRuns } from "../../../supabase/functions/agent-studio-callback/lifecycle.mjs";

function specialistRows(overrides = {}) {
  return [
    ...REQUIRED_SPECIALIST_IDS.map((agent_id) => ({
      agent_id,
      status: overrides[agent_id] || "completed",
    })),
    { agent_id: "project-lead", status: "completed" },
  ];
}

test("marks a group successful when all specialists complete or intentionally skip", () => {
  const rows = specialistRows({
    "visual-reviewer": "skipped",
    "long-horizon-engineer": "skipped",
  });

  assert.deepEqual(summarizeSpecialistRuns(rows), {
    status: "completed",
    failedAgentIds: [],
    unfinishedAgentIds: [],
    error: null,
  });
});

test("does not hide a failed specialist behind a completed Project Lead", () => {
  const result = summarizeSpecialistRuns(specialistRows({
    "qa-engineer": "failed",
  }));

  assert.equal(result.status, "failed");
  assert.deepEqual(result.failedAgentIds, ["qa-engineer"]);
  assert.deepEqual(result.unfinishedAgentIds, []);
  assert.match(result.error, /qa-engineer/);
});

test("treats queued or running specialists as incomplete when the lead finishes", () => {
  const result = summarizeSpecialistRuns(specialistRows({
    "problem-analyst": "running",
    "qa-engineer": "queued",
  }));

  assert.equal(result.status, "failed");
  assert.deepEqual(result.failedAgentIds, []);
  assert.deepEqual(result.unfinishedAgentIds, ["problem-analyst", "qa-engineer"]);
});

test("treats a missing specialist row as incomplete instead of silently succeeding", () => {
  const rows = specialistRows().filter((row) => row.agent_id !== "security-auditor");
  const result = summarizeSpecialistRuns(rows);

  assert.equal(result.status, "failed");
  assert.deepEqual(result.unfinishedAgentIds, ["security-auditor"]);
});

test("does not count the Project Lead as one of the seven specialists", () => {
  const result = summarizeSpecialistRuns([
    { agent_id: "project-lead", status: "completed" },
  ]);

  assert.equal(result.status, "failed");
  assert.deepEqual(result.unfinishedAgentIds, [...REQUIRED_SPECIALIST_IDS]);
});
