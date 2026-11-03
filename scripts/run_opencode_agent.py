"""Run one OpenCode agent with bounded same-session recovery and safe diagnostics."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import sys
from typing import Any

from opencode_smoke import extract_latest_assistant_state

MAX_OUTPUT_BYTES = 8 * 1024 * 1024
DEFAULT_INITIAL_SECONDS = 330
DEFAULT_RECOVERY_SECONDS = 115
RECOVERY_PROMPT = """Continue this exact session and finish the requested response now.
Do not restart the investigation, delegate to another agent, or repeat completed work.
Use only tools explicitly permitted by the current policy. This workflow is read-only:
do not edit files, run shell commands, push, merge, deploy, or change settings.
If a requested inspection could not be completed, state that limitation clearly.
Return a complete, concise final answer in the language of the original request."""


def find_session_id(raw: str) -> str:
    """Find the first OpenCode session identifier in its JSONL event stream."""
    for line in raw.splitlines():
        try:
            event = json.loads(line)
        except json.JSONDecodeError:
            continue
        if not isinstance(event, dict):
            continue
        part = event.get("part")
        if not isinstance(part, dict):
            part = {}
        session = event.get("sessionID") or event.get("sessionId") or part.get("sessionID") or part.get("sessionId")
        if isinstance(session, str) and session:
            return session
    return ""


def build_run_args(workspace: str, agent: str, model: str, prompt: str, session_id: str = "") -> list[str]:
    """Build a non-interactive command; --auto never overrides explicit deny rules."""
    args = [
        "opencode", "run",
        "--dir", workspace,
        "--agent", agent,
        "--model", model,
        "--format", "json",
        "--auto",
    ]
    if session_id:
        args.extend(["--session", session_id])
    args.append(prompt)
    return args


def _as_text(value: str | bytes | None) -> str:
    if value is None:
        return ""
    if isinstance(value, bytes):
        return value.decode("utf-8", errors="replace")
    return value


def _run_command(args: list[str], cwd: str, timeout_seconds: int) -> dict[str, Any]:
    try:
        result = subprocess.run(
            args,
            cwd=cwd,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=timeout_seconds,
            check=False,
        )
        stdout, stderr = result.stdout or "", result.stderr or ""
        overflow = len(stdout.encode("utf-8")) > MAX_OUTPUT_BYTES
        return {
            "exit": result.returncode,
            "timed_out": False,
            "overflow": overflow,
            "stdout": stdout[:MAX_OUTPUT_BYTES],
            "stderr": stderr[-12000:],
        }
    except subprocess.TimeoutExpired as error:
        stdout, stderr = _as_text(error.stdout), _as_text(error.stderr)
        return {
            "exit": 124,
            "timed_out": True,
            "overflow": len(stdout.encode("utf-8")) > MAX_OUTPUT_BYTES,
            "stdout": stdout[:MAX_OUTPUT_BYTES],
            "stderr": stderr[-12000:],
        }


def _export_state(session_id: str, cwd: str) -> tuple[str, str, str]:
    try:
        result = subprocess.run(
            ["opencode", "export", session_id, "--sanitize"],
            cwd=cwd,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=45,
            check=False,
        )
        if result.returncode != 0:
            return "export-exit-" + str(result.returncode), "missing", ""
        transcript = json.loads(result.stdout or "{}")
        finish, answer = extract_latest_assistant_state(transcript)
        return "0", finish, answer
    except subprocess.TimeoutExpired:
        return "export-timeout", "missing", ""
    except (ValueError, OSError):
        return "export-invalid", "missing", ""


def contains_credential(value: str, secret: str = "") -> bool:
    if secret and secret in value:
        return True
    patterns = (
        r"nvapi-[A-Za-z0-9_-]{12,}",
        r"gh[pousr]_[A-Za-z0-9]{20,}",
        r"github_pat_[A-Za-z0-9_]{20,}",
        r"sb_secret_[A-Za-z0-9_-]{12,}",
        r"\bAKIA[0-9A-Z]{16}\b",
        r"-----BEGIN [A-Z ]*PRIVATE KEY-----",
        r"\bsk-[A-Za-z0-9_-]{20,}\b",
    )
    return any(re.search(pattern, value, re.IGNORECASE) for pattern in patterns)


def run_agent(
    workspace: str,
    agent: str,
    model: str,
    prompt: str,
    initial_seconds: int = DEFAULT_INITIAL_SECONDS,
    recovery_seconds: int = DEFAULT_RECOVERY_SECONDS,
) -> tuple[bool, str]:
    """Run once, then resume the same session once if it did not finish."""
    env = os.environ.copy()
    secret = env.get("NVIDIA_API_KEY", "")
    first = _run_command(build_run_args(workspace, agent, model, prompt), workspace, initial_seconds)
    session_id = find_session_id(first["stdout"])
    export_status, finish, answer = _export_state(session_id, workspace) if session_id else ("missing-session", "missing", "")

    recovery: dict[str, Any] | None = None
    if session_id and (first["exit"] != 0 or finish != "stop" or not answer.strip()):
        recovery = _run_command(
            build_run_args(workspace, agent, model, RECOVERY_PROMPT, session_id),
            workspace,
            recovery_seconds,
        )
        export_status, finish, answer = _export_state(session_id, workspace)

    combined = first["stdout"] + first["stderr"] + (recovery or {}).get("stdout", "") + (recovery or {}).get("stderr", "") + answer
    if contains_credential(combined, secret):
        return False, (
            "The specialist response and diagnostics were withheld because credential-like output was detected.\n"
        )

    recovered = bool(recovery and recovery["exit"] == 0)
    command_succeeded = first["exit"] == 0 if recovery is None else recovered
    complete = finish == "stop" and bool(answer.strip()) and command_succeeded
    if complete:
        return True, answer.strip() + "\n"

    lines = [
        "The specialist did not return a complete final answer.",
        "",
        f"- Initial command exit: {first['exit']}",
        f"- Initial command timed out: {str(first['timed_out']).lower()}",
        f"- Session found: {str(bool(session_id)).lower()}",
        f"- Recovery attempted: {str(recovery is not None).lower()}",
        f"- Recovery exit: {recovery['exit'] if recovery else 'not-run'}",
        f"- Recovery timed out: {str(recovery['timed_out']).lower() if recovery else 'not-run'}",
        f"- Session export: {export_status}",
        f"- Latest assistant finish: {finish}",
    ]
    if answer.strip():
        lines.extend(["", "Partial visible draft (not a completed response):", "", answer.strip()[:3000]])
    return False, "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--agent", required=True)
    parser.add_argument("--model", required=True)
    parser.add_argument("--prompt-file", required=True)
    parser.add_argument("--output-file", required=True)
    parser.add_argument("--initial-seconds", type=int, default=DEFAULT_INITIAL_SECONDS)
    parser.add_argument("--recovery-seconds", type=int, default=DEFAULT_RECOVERY_SECONDS)
    args = parser.parse_args()

    workspace = os.environ.get("GITHUB_WORKSPACE") or os.getcwd()
    prompt = Path(args.prompt_file).read_text(encoding="utf-8")
    success, report = run_agent(
        workspace, args.agent, args.model, prompt,
        args.initial_seconds, args.recovery_seconds,
    )
    Path(args.output_file).write_text(report, encoding="utf-8")
    print(
        f"OpenCode agent={args.agent}; completed={str(success).lower()}; "
        "same-session recovery is attempted only for incomplete turns."
    )
    return 0 if success else 1


if __name__ == "__main__":
    raise SystemExit(main())
