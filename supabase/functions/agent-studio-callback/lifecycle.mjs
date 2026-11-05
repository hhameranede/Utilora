export const REQUIRED_SPECIALIST_IDS = Object.freeze([
  "problem-analyst",
  "implementation-engineer",
  "fast-task-engineer",
  "visual-reviewer",
  "long-horizon-engineer",
  "qa-engineer",
  "security-auditor",
]);

const TERMINAL_STATUSES = new Set(["completed", "failed", "skipped"]);

/**
 * A group run is fully successful only when every specialist reached a
 * terminal state and none failed. Missing rows are treated as unfinished.
 * Project Lead is intentionally excluded: this summarizes the seven
 * specialists whose reports the lead is expected to synthesize.
 */
export function summarizeSpecialistRuns(rows) {
  const byId = new Map(
    (Array.isArray(rows) ? rows : [])
      .filter((row) => row && typeof row.agent_id === "string")
      .map((row) => [row.agent_id, row])
  );

  const failedAgentIds = [];
  const unfinishedAgentIds = [];

  for (const agentId of REQUIRED_SPECIALIST_IDS) {
    const row = byId.get(agentId);
    if (!row || !TERMINAL_STATUSES.has(row.status)) {
      unfinishedAgentIds.push(agentId);
    } else if (row.status === "failed") {
      failedAgentIds.push(agentId);
    }
  }

  const successful = failedAgentIds.length === 0 && unfinishedAgentIds.length === 0;
  const details = [];
  if (failedAgentIds.length) details.push("فشل: " + failedAgentIds.join("، "));
  if (unfinishedAgentIds.length) details.push("لم يكتمل: " + unfinishedAgentIds.join("، "));

  return {
    status: successful ? "completed" : "failed",
    failedAgentIds,
    unfinishedAgentIds,
    error: successful ? null : "اكتمل رد قائد الفريق مع تعذّر بعض الوكلاء. " + details.join(" | "),
  };
}
