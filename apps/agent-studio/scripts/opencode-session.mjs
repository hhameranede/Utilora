export function findSessionId(raw) {
  for (const line of String(raw || "").split(/\r?\n/)) {
    try {
      const event = JSON.parse(line);
      const part = event?.part && typeof event.part === "object" ? event.part : {};
      const session = event?.sessionID || event?.sessionId || part.sessionID || part.sessionId;
      if (typeof session === "string" && session) return session;
    } catch {
      // Ignore non-JSON log lines emitted by OpenCode.
    }
  }
  return "";
}

export function latestAssistantState(transcript) {
  const messages = Array.isArray(transcript?.messages) ? transcript.messages : [];
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (!message || typeof message !== "object") continue;
    const info = message.info && typeof message.info === "object" ? message.info : {};
    if ((info.role || message.role) !== "assistant") continue;

    const parts = Array.isArray(message.parts) ? message.parts : [];
    const text = parts
      .filter((part) => part && part.type === "text" && !part.synthetic && !part.ignored)
      .map((part) => String(part.text || "").trim())
      .filter(Boolean)
      .join("\n")
      .trim();

    return {
      finish: info.finish || message.finish || "missing",
      text
    };
  }
  return { finish: "missing", text: "" };
}

export function extractFinalAssistantText(transcript) {
  const state = latestAssistantState(transcript);
  return state.finish === "stop" ? state.text : "";
}

export function buildOpenCodeArgs({ workspace, agent, model, prompt, sessionId = "" }) {
  const args = [
    "run",
    "--dir", workspace,
    "--agent", agent,
    "--model", model,
    "--format", "json",
    "--auto"
  ];
  if (sessionId) args.push("--session", sessionId);
  args.push(prompt);
  return args;
}

export function needsSessionRecovery(state, exitCode) {
  return Number(exitCode) !== 0 || state?.finish !== "stop" || !String(state?.text || "").trim();
}
