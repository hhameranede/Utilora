"""Capture only a completed OpenCode assistant turn for workflow reporting."""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

from opencode_smoke import extract_latest_assistant_state

CREDENTIAL_PATTERNS = [
    re.compile(r"nvapi-[A-Za-z0-9_-]{12,}", re.I),
    re.compile(r"gh[pousr]_[A-Za-z0-9]{20,}", re.I),
    re.compile(r"github_pat_[A-Za-z0-9_]{20,}", re.I),
    re.compile(r"sb_secret_[A-Za-z0-9_-]{12,}", re.I),
    re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b", re.I),
]


def extract_session_id(events_text: str) -> str:
    for line in events_text.splitlines():
        try:
            event = json.loads(line)
        except json.JSONDecodeError:
            continue
        if not isinstance(event, dict):
            continue
        part = event.get("part") if isinstance(event.get("part"), dict) else {}
        candidate = (
            event.get("sessionID")
            or event.get("sessionId")
            or part.get("sessionID")
            or part.get("sessionId")
        )
        if isinstance(candidate, str) and candidate.strip():
            return candidate.strip()
    return ""


def contains_credentials(text: str, secret: str = "") -> bool:
    if secret and secret in text:
        return True
    return any(pattern.search(text) for pattern in CREDENTIAL_PATTERNS)


def export_transcript(session_id: str) -> dict[str, Any]:
    result = subprocess.run(
        ["opencode", "export", session_id, "--sanitize"],
        check=True,
        capture_output=True,
        text=True,
        timeout=90,
    )
    value = json.loads(result.stdout)
    if not isinstance(value, dict):
        raise ValueError("OpenCode export returned an invalid transcript.")
    return value


def capture(events_path: Path, output_path: Path, exit_code: int) -> str:
    events_text = events_path.read_text(encoding="utf-8", errors="replace")
    session_id = extract_session_id(events_text)
    if not session_id:
        raise ValueError("OpenCode did not return a session identifier.")
    transcript = export_transcript(session_id)
    finish, answer = extract_latest_assistant_state(transcript)
    if exit_code != 0:
        raise ValueError(f"OpenCode exited with status {exit_code}; report is not trusted.")
    if finish != "stop" or not answer.strip():
        raise ValueError(f"OpenCode final turn is incomplete (finish={finish}).")

    inspected = events_text + "\n" + json.dumps(transcript, ensure_ascii=False) + "\n" + answer
    if contains_credentials(inspected, os.environ.get("NVIDIA_API_KEY", "")):
        raise ValueError("Credential-like content detected; report suppressed.")

    if len(answer.encode("utf-8")) > 200_000:
        raise ValueError("OpenCode report exceeds the 200 KB safety limit.")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(answer.rstrip() + "\n", encoding="utf-8")
    return answer


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--events", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--exit-code", required=True, type=int)
    args = parser.parse_args()
    try:
        answer = capture(args.events, args.output, args.exit_code)
    except Exception as error:
        print(f"Report capture failed: {type(error).__name__}: {error}", file=sys.stderr)
        return 1
    print(f"Captured a completed report ({len(answer)} characters).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
