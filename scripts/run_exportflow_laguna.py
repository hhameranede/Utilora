"""Run Laguna against an isolated ExportFlow checkout, without exposing its write token.

The GitHub write token is deliberately not passed to this process. OpenCode receives only
the NVIDIA model key, and its shell permission is restricted to read-only Git inspection.
The trusted workflow runs tests without any model or GitHub credentials and publishes the
resulting patch in a separate job.
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import shutil
from typing import Any

from opencode_smoke import extract_latest_assistant_state

MODEL = "nvidia-nim/laguna-xs-2-1"
AGENT = "long-horizon-engineer"
MAX_OUTPUT_BYTES = 8 * 1024 * 1024
SECRET_PATTERNS = (
    r"nvapi-[A-Za-z0-9_-]{20,}",
    r"gh[pousr]_[A-Za-z0-9]{20,}",
    r"github_pat_[A-Za-z0-9_]{20,}",
    r"sb_secret_[A-Za-z0-9_-]{20,}",
    r"\bAKIA[0-9A-Z]{16}\b",
    r"-----BEGIN [A-Z ]*PRIVATE KEY-----",
    r"\bsk-[A-Za-z0-9_-]{24,}\b",
)

RECOVERY_PROMPT = """Continue this exact Laguna session and finish the ExportFlow implementation.
Do not restart completed research and do not delegate. You are authorized to edit source code,
tests, localization, documentation, and product UI in this checked-out ExportFlow repository.
You are NOT authorized to commit, push, merge, deploy, access Cloudflare, change DNS, touch
remote databases, inspect or alter secrets, or change repository permissions/settings.
The workflow runs all verification commands outside the model process and will provide exact
results. Do not use shell commands; use repository read/edit tools only. Never weaken or delete
tests to make checks pass. Return a factual final report in Arabic, separating implemented work,
checks, and unresolved blockers."""

CHECK_REPAIR_PREFIX = """The trusted verification harness ran the repository checks outside the model process.
The following exact checks failed. Diagnose the root cause, make the smallest correct code/test
fixes, and do not weaken/delete tests, hide failures, alter deployment configuration, or invent
success. You may edit the repository but must not run shell commands; the harness will rerun
the fixed checks after your repair. Continue the same session and work only in ExportFlow.

Exact verification output:
"""

def _text(value: str | bytes | None) -> str:
    if value is None:
        return ""
    if isinstance(value, bytes):
        return value.decode("utf-8", errors="replace")
    return value

def contains_credential(value: str, secret: str = "") -> bool:
    if secret and secret in value:
        return True
    return any(re.search(pattern, value, re.IGNORECASE) for pattern in SECRET_PATTERNS)

def build_run_args(workspace: str, prompt: str, session_id: str = "") -> list[str]:
    args = [
        "opencode", "run", "--dir", workspace, "--agent", AGENT,
        "--model", MODEL, "--format", "json", "--auto",
    ]
    if session_id:
        args.extend(["--session", session_id])
    args.append(prompt)
    return args

def build_permission_overlay() -> str:
    permissions: dict[str, Any] = {
        "read": "allow",
        "glob": "allow",
        "grep": "allow",
        "list": "allow",
        "edit": "allow",
        "skill": {"*": "allow"},
        "bash": {
            "*": "deny",
            "git status*": "allow",
            "git diff*": "allow",
            "git log*": "allow",
            "git show*": "allow",
            "git grep*": "allow",
            "git branch*": "allow",
        },
        "external_directory": "deny",
        "webfetch": "deny",
        "websearch": "deny",
        "task": "deny",
        "todowrite": "deny",
        "question": "deny",
        "lsp": "deny",
    }
    return json.dumps({
        "permission": permissions,
        "agent": {AGENT: {"permission": permissions}},
        "mcp": {
            name: {"enabled": False}
            for name in ("playwright", "context7", "firecrawl", "cloudflare-docs",
                         "cloudflare-api", "posthog")
        },
    }, separators=(",", ":"))

def agent_environment(secret: str) -> dict[str, str]:
    allowed = ("PATH", "HOME", "TMPDIR", "LANG", "LC_ALL", "SSL_CERT_FILE",
               "SSL_CERT_DIR", "HTTPS_PROXY", "HTTP_PROXY", "NO_PROXY", "CI")
    env = {key: os.environ[key] for key in allowed if os.environ.get(key)}
    env["NVIDIA_API_KEY"] = secret
    env["OPENCODE_CONFIG_CONTENT"] = build_permission_overlay()
    return env

def check_environment() -> dict[str, str]:
    """Return a clean environment for tests: no model, GitHub, or Actions credentials."""
    env = dict(os.environ)
    for key in list(env):
        upper = key.upper()
        if any(marker in upper for marker in (
            "TOKEN", "SECRET", "API_KEY", "PRIVATE_KEY", "PASSWORD", "CREDENTIAL"
        )) or upper.startswith("ACTIONS_ID_TOKEN"):
            env.pop(key, None)
    return env

def protected_path_reason(path: str) -> str:
    normalized = path.replace("\\", "/").lstrip("/")
    base = normalized.rsplit("/", 1)[-1]
    if normalized.startswith(".github/workflows/"):
        return "GitHub Actions workflows are outside this task's write scope."
    if normalized == "wrangler.toml" or normalized.endswith("/wrangler.toml"):
        return "Cloudflare deployment configuration is outside this task's write scope."
    if normalized == ".devcontainer" or normalized.startswith(".devcontainer/"):
        return "Development-container configuration is outside this task's write scope."
    if base == ".env" or base.startswith(".env.") or base in {
        "id_rsa", "id_ed25519", "credentials.json", "secrets.json"
    }:
        return "Environment or credential files must not be changed."
    if base.endswith((".pem", ".key", ".p12", ".pfx")):
        return "Private-key or certificate files must not be changed."
    return ""

def _run(args: list[str], cwd: str, env: dict[str, str], timeout: int) -> dict[str, Any]:
    try:
        result = subprocess.run(
            args, cwd=cwd, env=env, capture_output=True, text=True,
            encoding="utf-8", errors="replace", timeout=timeout, check=False,
        )
        stdout, stderr = result.stdout or "", result.stderr or ""
        overflow = len(stdout.encode("utf-8")) > MAX_OUTPUT_BYTES
        return {
            "exit": result.returncode, "timed_out": False, "overflow": overflow,
            "stdout": stdout[:MAX_OUTPUT_BYTES], "stderr": stderr[-16000:],
        }
    except subprocess.TimeoutExpired as error:
        stdout, stderr = _text(error.stdout), _text(error.stderr)
        return {
            "exit": 124, "timed_out": True,
            "overflow": len(stdout.encode("utf-8")) > MAX_OUTPUT_BYTES,
            "stdout": stdout[:MAX_OUTPUT_BYTES], "stderr": stderr[-16000:],
        }

def _session_id(raw: str) -> str:
    for line in raw.splitlines():
        try:
            event = json.loads(line)
        except json.JSONDecodeError:
            continue
        if not isinstance(event, dict):
            continue
        part = event.get("part") if isinstance(event.get("part"), dict) else {}
        session = (event.get("sessionID") or event.get("sessionId")
                   or part.get("sessionID") or part.get("sessionId"))
        if isinstance(session, str) and session:
            return session
    return ""

def _export_state(session_id: str, cwd: str, env: dict[str, str]) -> tuple[str, str]:
    result = _run(["opencode", "export", session_id, "--sanitize"], cwd, env, 45)
    if result["exit"] != 0 or result["overflow"]:
        return "missing", ""
    try:
        transcript = json.loads(result["stdout"])
    except json.JSONDecodeError:
        return "invalid", ""
    finish, answer = extract_latest_assistant_state(transcript)
    return str(finish), answer

def invoke_turn(
    workspace: str, prompt: str, session_id: str, timeout: int,
    env: dict[str, str],
) -> tuple[str, str, dict[str, Any]]:
    result = _run(build_run_args(workspace, prompt, session_id), workspace, env, timeout)
    found_id = session_id or _session_id(result["stdout"])
    finish, answer = _export_state(found_id, workspace, env) if found_id else ("missing", "")
    combined = result["stdout"] + result["stderr"] + answer
    if contains_credential(combined, env.get("NVIDIA_API_KEY", "")):
        return found_id, "", {
            "complete": False, "diagnostic": "Credential-like output detected; output withheld."
        }
    complete = result["exit"] == 0 and finish == "stop" and bool(answer.strip())
    diagnostic = {
        "complete": complete,
        "exit": result["exit"],
        "timed_out": result["timed_out"],
        "session_found": bool(found_id),
        "finish": finish,
        "stderr": result["stderr"][-6000:],
    }
    return found_id, answer.strip(), diagnostic

def run_checks(workspace: str) -> tuple[bool, str]:
    env = check_environment()
    commands: list[tuple[str, list[str]]] = [
        ("Syntax: app.js", ["node", "--check", "app.js"]),
        ("Syntax: translations.js", ["node", "--check", "translations.js"]),
        ("Syntax: coverage.js", ["node", "--check", "coverage.js"]),
        ("Syntax: functions/api/track.js", ["node", "--check", "functions/api/track.js"]),
        ("Syntax: functions/api/carriers.js", ["node", "--check", "functions/api/carriers.js"]),
        ("Syntax: functions/api/coverage.js", ["node", "--check", "functions/api/coverage.js"]),
        ("Syntax: functions/api/health.js", ["node", "--check", "functions/api/health.js"]),
        ("Syntax: functions/_middleware.js", ["node", "--check", "functions/_middleware.js"]),
        ("Syntax: scripts/locale-build-test.mjs", ["node", "--check", "scripts/locale-build-test.mjs"]),
        ("Syntax: functions/lib/country-codes.mjs", ["node", "--check", "functions/lib/country-codes.mjs"]),
        ("Repository regression suite: npm test", ["npm", "test"]),
        ("Repository lint: npm run lint", ["npm", "run", "lint"]),
        ("Production build: npm run build", ["npm", "run", "build"]),
        ("Locale and hreflang audit", ["node", "scripts/locale-build-test.mjs"]),
        ("Cloudflare Pages Functions local bundle",
         ["npx", "--yes", "wrangler@3.114.17", "pages", "functions", "build",
          "functions", "--outdir", ".wrangler/pages-functions"]),
    ]
    report: list[str] = []
    all_ok = True
    for label, command in commands:
        result = _run(command, workspace, env, 12 * 60)
        ok = result["exit"] == 0 and not result["timed_out"] and not result["overflow"]
        report.append(("PASS" if ok else "FAIL") + " — " + label)
        if not ok:
            all_ok = False
            report.append("Command: " + " ".join(command))
            report.append("Exit: " + str(result["exit"]) +
                          "; timeout: " + str(result["timed_out"]).lower())
            detail = (result["stdout"] + "\n" + result["stderr"]).strip()
            if contains_credential(detail):
                detail = "[credential-like output withheld]"
            report.append(detail[-10000:] or "[no command output]")
        report.append("")
    return all_ok, "\n".join(report).strip()

def inspect_diff(workspace: str) -> tuple[bool, str]:
    env = check_environment()
    add_intent = _run(["git", "add", "--intent-to-add", "--all"], workspace, env, 60)
    if add_intent["exit"] != 0:
        return False, "Could not prepare a safe diff for review."
    names = _run(["git", "diff", "--name-only", "HEAD"], workspace, env, 60)
    if names["exit"] != 0:
        return False, "Could not enumerate changed paths."
    paths = [line.strip() for line in names["stdout"].splitlines() if line.strip()]
    if not paths:
        return False, "Laguna completed without producing any source changes."
    violations = [(path, protected_path_reason(path)) for path in paths]
    violations = [(path, reason) for path, reason in violations if reason]
    if violations:
        return False, "Protected-path changes must be reverted before publishing:\n" + "\n".join(
            "- " + path + ": " + reason for path, reason in violations
        )
    diff = _run(["git", "diff", "--binary", "--full-index", "HEAD"], workspace, env, 120)
    if diff["exit"] != 0 or diff["overflow"]:
        return False, "Could not produce a complete patch for review."
    if contains_credential(diff["stdout"]):
        return False, "Credential-like text detected in the proposed diff; publication blocked."
    check = _run(["git", "diff", "--check", "HEAD"], workspace, env, 60)
    if check["exit"] != 0:
        return False, "git diff --check failed:\n" + (check["stdout"] + check["stderr"])[-5000:]
    return True, "Changed paths:\n" + "\n".join("- " + path for path in paths)

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--prompt-file", required=True)
    parser.add_argument("--output-file", required=True)
    parser.add_argument("--initial-seconds", type=int, default=9000)
    parser.add_argument("--recovery-seconds", type=int, default=300)
    parser.add_argument("--repair-seconds", type=int, default=900)
    parser.add_argument("--max-repair-rounds", type=int, default=2)
    args = parser.parse_args()

    workspace = os.environ.get("EXPORTFLOW_WORKSPACE") or os.getcwd()
    prompt = Path(args.prompt_file).read_text(encoding="utf-8")
    secret = os.environ.get("NVIDIA_API_KEY", "")
    if not secret:
        Path(args.output_file).write_text("Blocked: NVIDIA_API_KEY is missing.\n", encoding="utf-8")
        return 1

    env = agent_environment(secret)
    session_id, answer, state = invoke_turn(
        workspace, prompt, "", args.initial_seconds, env
    )
    if not state.get("complete") and session_id:
        session_id, answer, state = invoke_turn(
            workspace, RECOVERY_PROMPT, session_id, args.recovery_seconds, env
        )
    if not state.get("complete") or not session_id:
        Path(args.output_file).write_text(
            "Laguna did not return a complete response. No patch will be published.\n"
            + json.dumps(state, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        return 1

    checks_report = ""
    checks_ok = False
    for round_number in range(args.max_repair_rounds + 1):
        checks_ok, checks_report = run_checks(workspace)
        if checks_ok:
            break
        if round_number >= args.max_repair_rounds:
            break
        repair_prompt = (
            CHECK_REPAIR_PREFIX + checks_report
            + "\n\nRepair round " + str(round_number + 1)
            + " of " + str(args.max_repair_rounds)
            + ". Continue the same session, fix root causes, and report accurately."
        )
        session_id, answer, state = invoke_turn(
            workspace, repair_prompt, session_id, args.repair_seconds, env
        )
        if not state.get("complete"):
            checks_report += "\n\nLaguna repair turn did not finish: " + json.dumps(
                state, ensure_ascii=False
            )
            break

    if not checks_ok:
        Path(args.output_file).write_text(
            "Laguna changes are not ready: verification remained failing after bounded repair.\n\n"
            + checks_report + "\n",
            encoding="utf-8",
        )
        return 1

    # Remove only the temporary agent profile created by the workflow before reviewing the patch.
    shutil.rmtree(Path(workspace) / ".opencode", ignore_errors=True)
    diff_ok, diff_report = inspect_diff(workspace)
    if not diff_ok:
        Path(args.output_file).write_text(
            "Laguna changes are not publishable.\n\n" + diff_report
            + "\n\nVerification:\n" + checks_report + "\n",
            encoding="utf-8",
        )
        return 1

    report = (
        "# Laguna implementation report\n\n"
        + answer + "\n\n## Independent verification\n\n"
        + checks_report + "\n\n## Diff safety review\n\n"
        + diff_report + "\n"
    )
    if contains_credential(report, secret):
        Path(args.output_file).write_text(
            "Report withheld because credential-like output was detected.\n",
            encoding="utf-8",
        )
        return 1
    Path(args.output_file).write_text(report, encoding="utf-8")
    print("Laguna completed; independent checks passed; diff is eligible for isolated PR publication.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
