"""Policy checks for the UTILORA autonomous improvement workflow.

The model may propose work broadly, but an unattended cycle may only open a PR
for a deliberately small set of presentation, localization, SEO-content, and
documentation paths. Tool registries, processing engines, auth, infra, secrets,
CI workflows, and database code always require owner-led work.
"""
from __future__ import annotations

import argparse
import os
import subprocess
from pathlib import PurePosixPath
from typing import Iterable

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
    path = str(PurePosixPath(raw_path.replace("\\", "/")))
    if not path or path.startswith("../") or path.startswith("/"):
        return False
    if path in ALLOWED_FILES:
        return True
    return any(path.startswith(prefix) for prefix in ALLOWED_PREFIXES)


def changed_paths() -> list[str]:
    result = subprocess.run(
        ["git", "diff", "--name-only", "HEAD", "--"],
        check=True,
        capture_output=True,
        text=True,
    )
    paths = {line.strip() for line in result.stdout.splitlines() if line.strip()}
    untracked = subprocess.run(
        ["git", "ls-files", "--others", "--exclude-standard"],
        check=True,
        capture_output=True,
        text=True,
    )
    paths.update(line.strip() for line in untracked.stdout.splitlines() if line.strip())
    return sorted(paths)


def write_outputs(path: str | None, values: dict[str, str]) -> None:
    if not path:
        return
    with open(path, "a", encoding="utf-8") as handle:
        for key, value in values.items():
            safe = value.replace("%", "%25").replace("\n", "%0A").replace("\r", "%0D")
            handle.write(f"{key}={safe}\n")


def evaluate(paths: Iterable[str], code_edits_allowed: bool = True) -> tuple[bool, list[str]]:
    changed = sorted(set(paths))
    blocked = [path for path in changed if not is_allowed_path(path)]
    if changed and not code_edits_allowed:
        blocked.extend(changed)
    return not blocked, sorted(set(blocked))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--github-output", default=os.environ.get("GITHUB_OUTPUT"))
    parser.add_argument("--code-edits-allowed", choices=("true", "false"), default="true")
    args = parser.parse_args()

    paths = changed_paths()
    allowed, blocked = evaluate(paths, args.code_edits_allowed == "true")
    outputs = {
        "has_changes": "true" if paths else "false",
        "scope_ok": "true" if allowed else "false",
        "changed_paths": ",".join(paths),
        "blocked_paths": ",".join(blocked),
    }
    write_outputs(args.github_output, outputs)

    print("Changed paths:")
    for path in paths:
        print(f"  - {path}")
    if blocked:
        print("Autonomous PR blocked; these paths require owner-led review:")
        for path in blocked:
            print(f"  - {path}")
        return 1
    if not paths:
        print("No repository changes were produced in this cycle.")
    else:
        print("All changes are within the autonomous allowlist.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
