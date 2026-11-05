"""Strict path and scope policy for unattended UTILORA improvements."""
from __future__ import annotations

import argparse
import os
import subprocess
from pathlib import PurePosixPath
from typing import Iterable

MAX_CHANGED_FILES = 8
ALLOWED_PREFIXES = (
    "src/components/",
    "src/pages/",
    "src/i18n/",
    "src/seo/",
    "src/tests/",
    "docs/",
)
ALLOWED_FILES = {
    "src/index.css",
    "src/design-v3.css",
    "src/data/article-content.data.ts",
    "src/data/articles.data.ts",
    "README.md",
}


def is_allowed_path(raw_path: str) -> bool:
    # Inspect the original segments before PurePosixPath can normalize them.
    raw = str(raw_path).replace("\\", "/")
    segments = raw.split("/")
    if (
        not raw
        or raw.startswith("/")
        or any(segment in {".", ".."} for segment in segments)
        or "\x00" in raw
    ):
        return False

    path = str(PurePosixPath(raw))
    if path in ALLOWED_FILES:
        return True
    return any(path.startswith(prefix) for prefix in ALLOWED_PREFIXES)


def changed_paths() -> list[str]:
    tracked = subprocess.run(
        ["git", "diff", "--name-only", "HEAD", "--"],
        check=True, capture_output=True, text=True,
    )
    untracked = subprocess.run(
        ["git", "ls-files", "--others", "--exclude-standard"],
        check=True, capture_output=True, text=True,
    )
    paths = {line.strip() for line in tracked.stdout.splitlines() if line.strip()}
    paths.update(line.strip() for line in untracked.stdout.splitlines() if line.strip())
    return sorted(paths)


def evaluate(paths: Iterable[str], code_edits_allowed: bool = True) -> tuple[bool, list[str]]:
    changed = sorted(set(paths))
    blocked = [path for path in changed if not is_allowed_path(path)]
    if len(changed) > MAX_CHANGED_FILES:
        blocked.append(f"CHANGESET_LIMIT_EXCEEDED:{len(changed)}>{MAX_CHANGED_FILES}")
    if changed and not code_edits_allowed:
        blocked.extend(changed)
    return not blocked, sorted(set(blocked))


def write_outputs(path: str | None, values: dict[str, str]) -> None:
    if not path:
        return
    with open(path, "a", encoding="utf-8") as handle:
        for key, value in values.items():
            safe = value.replace("%", "%25").replace("\n", "%0A").replace("\r", "%0D")
            handle.write(f"{key}={safe}\n")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--github-output", default=os.environ.get("GITHUB_OUTPUT"))
    parser.add_argument("--code-edits-allowed", choices=("true", "false"), default="true")
    args = parser.parse_args()

    paths = changed_paths()
    allowed, blocked = evaluate(paths, args.code_edits_allowed == "true")
    write_outputs(args.github_output, {
        "has_changes": "true" if paths else "false",
        "scope_ok": "true" if allowed else "false",
        "changed_count": str(len(paths)),
    })
    print("Changed paths:")
    for path in paths:
        print(f"  - {path}")
    if blocked:
        print("Autonomous PR blocked by the path/scope policy:")
        for path in blocked:
            print(f"  - {path}")
        return 1
    print("No repository changes were produced." if not paths else "All changes are within the autonomous allowlist.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
