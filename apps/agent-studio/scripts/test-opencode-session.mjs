import test from "node:test";
import assert from "node:assert/strict";
import {
  buildOpenCodeArgs,
  extractFinalAssistantText,
  findSessionId,
  latestAssistantState,
  needsSessionRecovery
} from "./opencode-session.mjs";

test("finds a session identifier from OpenCode JSONL events", () => {
  const raw = [
    "not-json",
    JSON.stringify({ type: "message.part.updated", part: { sessionID: "session-123" } })
  ].join("\n");
  assert.equal(findSessionId(raw), "session-123");
});

test("keeps tool-call text marked as incomplete", () => {
  const transcript = {
    messages: [{
      info: { role: "assistant", finish: "tool-calls" },
      parts: [{ type: "text", text: "I am still checking." }]
    }]
  };
  assert.deepEqual(latestAssistantState(transcript), {
    finish: "tool-calls",
    text: "I am still checking."
  });
  assert.equal(extractFinalAssistantText(transcript), "");
  assert.equal(needsSessionRecovery(latestAssistantState(transcript), 0), true);
});

test("does not fall back to an older completed assistant turn", () => {
  const transcript = {
    messages: [
      { info: { role: "assistant", finish: "stop" }, parts: [{ type: "text", text: "Old answer." }] },
      { info: { role: "assistant", finish: "tool-calls" }, parts: [{ type: "text", text: "New unfinished turn." }] }
    ]
  };
  assert.equal(extractFinalAssistantText(transcript), "");
  assert.equal(latestAssistantState(transcript).finish, "tool-calls");
});

test("accepts only a final stop turn with visible text", () => {
  const transcript = {
    messages: [{
      info: { role: "assistant", finish: "stop" },
      parts: [
        { type: "reasoning", text: "private reasoning" },
        { type: "text", text: "Visible final answer." },
        { type: "text", text: "Hidden.", synthetic: true }
      ]
    }]
  };
  const state = latestAssistantState(transcript);
  assert.deepEqual(state, { finish: "stop", text: "Visible final answer." });
  assert.equal(extractFinalAssistantText(transcript), "Visible final answer.");
  assert.equal(needsSessionRecovery(state, 0), false);
});

test("adds auto-approval and the existing session only to a bounded continuation", () => {
  const args = buildOpenCodeArgs({
    workspace: "/repo",
    agent: "qa-engineer",
    model: "nvidia-nim/deepseek-v4-1-flash",
    prompt: "Finish the report.",
    sessionId: "session-456"
  });
  assert.ok(args.includes("--auto"));
  assert.equal(args[args.indexOf("--session") + 1], "session-456");
  assert.equal(args.at(-1), "Finish the report.");
});
