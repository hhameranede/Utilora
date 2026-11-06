"""Prepare the authoritative, data-backed Laguna prompt from GitHub issue and PR snapshots."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any


PLACEHOLDERS = (
    "__ISSUE_TITLE__",
    "__ISSUE_BODY__",
    "__OWNER_COMMENTS__",
    "__OPEN_PRS__",
    "__FETCHED_REFS__",
)


def _load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def prepare_prompt(
    template: str,
    issue: dict[str, Any],
    comment_pages: list[Any],
    prs: list[dict[str, Any]],
    fetched_pr_numbers: list[int],
) -> str:
    comments = [
        item
        for page in comment_pages
        for item in (page if isinstance(page, list) else [page])
        if isinstance(item, dict)
    ]

    comment_sections: list[str] = []
    for comment in comments:
        author = (comment.get("user") or {}).get("login", "unknown")
        body = str(comment.get("body") or "")[:18000]
        comment_sections.append(f"### Comment by {author}\n\n{body}")

    pr_lines: list[str] = []
    fetched = set(fetched_pr_numbers)
    for pr in prs:
        number = pr.get("number")
        head = (pr.get("head") or {}).get("ref", "unknown")
        base = (pr.get("base") or {}).get("ref", "unknown")
        ref_note = "local ref available" if number in fetched else "metadata only"
        pr_lines.append(
            f"- #{number}: {pr.get('title')} — {head} → {base} "
            f"({ref_note}) — {pr.get('html_url')}"
        )

    replacements = {
        "__ISSUE_TITLE__": str(issue.get("title") or ""),
        "__ISSUE_BODY__": str(issue.get("body") or ""),
        "__OWNER_COMMENTS__": "\n\n---\n\n".join(comment_sections),
        "__OPEN_PRS__": "\n".join(pr_lines),
        "__FETCHED_REFS__": "\n".join(
            f"refs/remotes/origin/pr-{number}" for number in fetched_pr_numbers
        ) or "(No additional PR refs were fetched.)",
    }

    prompt = template
    for marker, value in replacements.items():
        prompt = prompt.replace(marker, value)

    remaining = sorted(set(re.findall(r"__[A-Z][A-Z0-9_]*__", prompt)))
    if remaining:
        raise ValueError("Unresolved prompt placeholders: " + ", ".join(remaining))
    if not str(issue.get("body") or "").strip():
        raise ValueError("Issue #29 body is empty; refusing to run Laguna without its roadmap.")
    return prompt


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--temp-dir", required=True, type=Path)
    parser.add_argument("--template", required=True, type=Path)
    args = parser.parse_args()

    temp = args.temp_dir
    issue = _load(temp / "exportflow-issue-29.json")
    comment_pages = _load(temp / "exportflow-issue-29-comments.json")
    prs = _load(temp / "exportflow-open-prs.json")
    fetched = _load(temp / "exportflow-fetched-prs.json")

    if not isinstance(issue, dict) or not isinstance(comment_pages, list):
        raise ValueError("Issue or comments API response has an unexpected shape.")
    if not isinstance(prs, list) or not isinstance(fetched, list):
        raise ValueError("Pull request API response has an unexpected shape.")

    template = args.template.read_text(encoding="utf-8")
    prompt = prepare_prompt(template, issue, comment_pages, prs, fetched)
    output = temp / "exportflow-laguna-prompt.md"
    output.write_text(prompt, encoding="utf-8")
    print("Prepared the ExportFlow roadmap prompt from Issue #29, owner comments and open PR metadata.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
