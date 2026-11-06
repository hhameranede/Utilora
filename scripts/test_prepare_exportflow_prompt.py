import unittest

from prepare_exportflow_prompt import prepare_prompt


class PrepareExportFlowPromptTests(unittest.TestCase):
    def test_includes_issue_owner_comments_and_pr_ref_inventory(self):
        template = (
            "TITLE=__ISSUE_TITLE__\nBODY=__ISSUE_BODY__\n"
            "COMMENTS=__OWNER_COMMENTS__\nPRS=__OPEN_PRS__\nREFS=__FETCHED_REFS__"
        )
        issue = {"title": "Roadmap title", "body": "Roadmap phases"}
        comments = [[
            {"user": {"login": "owner"}, "body": "Review PR 30 and fix test failures."}
        ]]
        prs = [{
            "number": 30,
            "title": "Shipment truth engine",
            "head": {"ref": "copilot/tracking"},
            "base": {"ref": "main"},
            "html_url": "https://github.com/hhameranede/exportflow/pull/30",
        }]

        result = prepare_prompt(template, issue, comments, prs, [30])

        self.assertIn("TITLE=Roadmap title", result)
        self.assertIn("BODY=Roadmap phases", result)
        self.assertIn("Comment by owner", result)
        self.assertIn("Shipment truth engine", result)
        self.assertIn("local ref available", result)
        self.assertIn("refs/remotes/origin/pr-30", result)
        self.assertNotIn("__ISSUE_BODY__", result)

    def test_marks_unfetched_pr_refs_as_metadata_only(self):
        template = "__OPEN_PRS__"
        prs = [{
            "number": 28,
            "title": "Docs pilot",
            "head": {"ref": "docs"},
            "base": {"ref": "main"},
            "html_url": "https://github.com/hhameranede/exportflow/pull/28",
        }]
        self.assertIn(
            "metadata only",
            prepare_prompt(template, {"title": "T", "body": "B"}, [], prs, []),
        )

    def test_rejects_missing_roadmap_body(self):
        with self.assertRaisesRegex(ValueError, "Issue #29 body is empty"):
            prepare_prompt("__ISSUE_BODY__", {"title": "T", "body": ""}, [], [], [])

    def test_rejects_unresolved_template_tokens(self):
        with self.assertRaisesRegex(ValueError, "Unresolved prompt placeholders"):
            prepare_prompt("__ISSUE_TITLE__ __UNKNOWN__", {"title": "T", "body": "B"}, [], [], [])


if __name__ == "__main__":
    unittest.main()
