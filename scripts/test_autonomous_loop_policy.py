import unittest

from autonomous_loop_policy import evaluate, is_allowed_path


class AutonomousLoopPolicyTests(unittest.TestCase):
    def test_allows_bounded_product_presentation_work(self):
        allowed = [
            "src/pages/tools/ImageCompressorPage.tsx",
            "src/components/tools/UploadPanel.tsx",
            "src/i18n/locales/ar.ts",
            "src/seo/meta.ts",
            "src/tests/tool-experience.test.ts",
            "src/index.css",
            "src/design-v3.css",
            "src/data/articles.data.ts",
            "docs/market-radar.md",
            "README.md",
        ]
        for path in allowed:
            with self.subTest(path=path):
                self.assertTrue(is_allowed_path(path))

    def test_blocks_registry_engines_routing_and_infrastructure(self):
        blocked = [
            "src/registry/tools.registry.ts",
            "src/registry/workflows.registry.ts",
            "src/engines/image/processor.ts",
            "src/router/index.tsx",
            "supabase/migrations/secret-change.sql",
            "supabase/functions/agent-studio-callback/index.ts",
            ".github/workflows/agent-autonomous-loop.yml",
            "apps/agent-studio/functions/api/chat.js",
            "package.json",
            "package-lock.json",
            "opencode.json",
            ".env.production",
            "scripts/generate-seo-files.ts",
        ]
        for path in blocked:
            with self.subTest(path=path):
                self.assertFalse(is_allowed_path(path))

    def test_blocks_absolute_and_parent_paths(self):
        self.assertFalse(is_allowed_path("/src/pages/page.tsx"))
        self.assertFalse(is_allowed_path("../secrets.txt"))
        self.assertFalse(is_allowed_path("src/pages/../../.env"))

    def test_requires_owner_when_an_autonomous_pr_is_already_open(self):
        ok, blocked = evaluate(["src/pages/HomePage.tsx"], code_edits_allowed=False)
        self.assertFalse(ok)
        self.assertEqual(blocked, ["src/pages/HomePage.tsx"])

    def test_empty_cycle_is_valid(self):
        ok, blocked = evaluate([])
        self.assertTrue(ok)
        self.assertEqual(blocked, [])


if __name__ == "__main__":
    unittest.main()
