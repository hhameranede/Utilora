"""Small, dependency-free helpers for trustworthy OpenCode response capture."""

from __future__ import annotations

from typing import Any


def extract_latest_assistant_state(transcript: dict[str, Any]) -> tuple[str, str]:
    """Return the latest assistant turn's finish reason and visible text.

    A tool-calling or interrupted assistant turn is deliberately exposed as
    incomplete; callers may resume its session, but must never mark it complete.
    """
    messages = transcript.get("messages")
    if not isinstance(messages, list):
        return "missing", ""

    for message in reversed(messages):
        if not isinstance(message, dict):
            continue

        info = message.get("info")
        if not isinstance(info, dict):
            info = {}

        role = info.get("role") or message.get("role")
        if role != "assistant":
            continue

        finish = info.get("finish") or message.get("finish") or "missing"
        parts = message.get("parts")
        if not isinstance(parts, list):
            return str(finish), ""

        extracted: list[str] = []
        for part in parts:
            if not isinstance(part, dict):
                continue
            if part.get("type") != "text" or part.get("synthetic") or part.get("ignored"):
                continue

            value = part.get("text")
            if isinstance(value, str) and value.strip():
                extracted.append(value.strip())

        return str(finish), "\n".join(extracted).strip()

    return "missing", ""


def extract_final_assistant_text(transcript: dict[str, Any]) -> str:
    """Return text only when the latest assistant message finished normally."""
    finish, text = extract_latest_assistant_state(transcript)
    return text if finish == "stop" else ""
