"""Small, dependency-free helpers for trustworthy OpenCode smoke checks."""

from __future__ import annotations

from typing import Any


def extract_final_assistant_text(transcript: dict[str, Any]) -> str:
    """Return text only when the latest assistant message finished normally.

    OpenCode may emit useful-looking assistant text before a tool call. Such a
    message has finish == "tool-calls" and is not the final answer. Never
    promote it to a successful smoke result.
    """
    messages = transcript.get("messages")
    if not isinstance(messages, list):
        return ""

    for message in reversed(messages):
        if not isinstance(message, dict):
            continue

        info = message.get("info")
        if not isinstance(info, dict):
            info = {}

        role = info.get("role") or message.get("role")
        if role != "assistant":
            continue

        finish = info.get("finish") or message.get("finish")
        if finish != "stop":
            return ""

        parts = message.get("parts")
        if not isinstance(parts, list):
            return ""

        extracted: list[str] = []
        for part in parts:
            if not isinstance(part, dict):
                continue
            if part.get("type") != "text" or part.get("synthetic") or part.get("ignored"):
                continue

            value = part.get("text")
            if isinstance(value, str) and value.strip():
                extracted.append(value.strip())

        return "\n".join(extracted).strip()

    return ""
