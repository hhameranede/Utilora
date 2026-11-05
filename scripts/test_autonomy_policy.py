import unittest

from autonomy_policy import evaluate, is_allowed_path


class AutonomyPolicyTests(unittest.TestCase):
    def test_allows_existing_ui_localization_seo_tests_and_docs(self):
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

    def test_blocks_engine_registry_infrastructure_and_secret_paths(self):
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

    def test_blocks_parent_and_absolute_path_traversal_before_normalization(self):
        blocked = [
            "/src/pages/page.tsx",
            "../secrets.txt",
            "src/pages/../../.env",
            "src/pages/../../docs/market-radar.md",
            r"src\pages\..\..\docs\market-radar.md",
            "./docs/market-radar.md",
            "docs/../.env",
        ]
        for path in blocked:
            with self.subTest(path=path):
                self.assertFalse(is_allowed_path(path))

    def test_blocks_more_than_eight_changed_files(self):
        paths = [f"src/pages/page-{index}.tsx" for index in range(9)]
        ok, blocked = evaluate(paths)
        self.assertFalse(ok)
        self.assertIn("CHANGESET_LIMIT_EXCEEDED:9>8", blocked)

    def test_research_only_mode_rejects_every_code_edit(self):
        ok, blocked = evaluate(["src/pages/HomePage.tsx"], code_edits_allowed=False)
        self.assertFalse(ok)
        self.assertEqual(blocked, ["src/pages/HomePage.tsx"])

    def test_empty_cycle_is_valid(self):
        ok, blocked = evaluate([])
        self.assertTrue(ok)
        self.assertEqual(blocked, [])


if __name__ == "__main__":
    unittest.main()
