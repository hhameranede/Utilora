import os
import unittest
from unittest.mock import patch

from run_exportflow_laguna import (
    AGENT,
    MODEL,
    agent_environment,
    build_permission_overlay,
    build_run_args,
    check_environment,
    contains_credential,
    protected_path_reason,
)


class LagunaRunnerTests(unittest.TestCase):
    def test_run_arguments_target_the_exportflow_workspace(self):
        args = build_run_args("/workspace/exportflow", "Inspect roadmap", "session-123")
        self.assertIn("/workspace/exportflow", args)
        self.assertIn(AGENT, args)
        self.assertIn(MODEL, args)
        self.assertEqual(args[-3:-1], ["--session", "session-123"])
        self.assertEqual(args[-1], "Inspect roadmap")

    def test_permission_overlay_denies_shell_except_read_only_git_inspection(self):
        import json
        config = json.loads(build_permission_overlay())
        permissions = config["permission"]
        self.assertEqual(permissions["edit"], "allow")
        self.assertEqual(permissions["bash"]["*"], "deny")
        self.assertEqual(permissions["bash"]["git status*"], "allow")
        self.assertEqual(permissions["bash"]["git diff*"], "allow")
        self.assertEqual(permissions["external_directory"], "deny")
        self.assertEqual(permissions["websearch"], "deny")
        self.assertEqual(permissions["task"], "deny")

    def test_model_process_receives_no_github_or_actions_tokens(self):
        with patch.dict(os.environ, {
            "PATH": "/bin",
            "HOME": "/home/runner",
            "NVIDIA_API_KEY": "nvapi-example-not-a-real-secret",
            "EXPORTFLOW_GITHUB_TOKEN": "github_pat_example",
            "GH_TOKEN": "ghp_example",
            "ACTIONS_ID_TOKEN_REQUEST_TOKEN": "actions-example",
            "SUPABASE_SECRET_KEY": "sb_secret_example",
        }, clear=True):
            env = agent_environment("nvapi-example-not-a-real-secret")
            self.assertEqual(env["NVIDIA_API_KEY"], "nvapi-example-not-a-real-secret")
            self.assertNotIn("EXPORTFLOW_GITHUB_TOKEN", env)
            self.assertNotIn("GH_TOKEN", env)
            self.assertNotIn("ACTIONS_ID_TOKEN_REQUEST_TOKEN", env)
            self.assertNotIn("SUPABASE_SECRET_KEY", env)

    def test_test_process_receives_no_credentials(self):
        with patch.dict(os.environ, {
            "PATH": "/bin",
            "NVIDIA_API_KEY": "nvapi-example",
            "EXPORTFLOW_GITHUB_TOKEN": "github_pat_example",
            "GH_TOKEN": "ghp_example",
            "CI": "true",
        }, clear=True):
            env = check_environment()
            self.assertNotIn("NVIDIA_API_KEY", env)
            self.assertNotIn("EXPORTFLOW_GITHUB_TOKEN", env)
            self.assertNotIn("GH_TOKEN", env)
            self.assertEqual(env["CI"], "true")

    def test_protected_files_are_rejected(self):
        for path in (
            ".github/workflows/ci.yml",
            "wrangler.toml",
            "functions/wrangler.toml",
            ".devcontainer/devcontainer.json",
            ".env",
            ".env.local",
            "certs/signing.pem",
            "keys/production.key",
            "secrets.json",
        ):
            with self.subTest(path=path):
                self.assertTrue(protected_path_reason(path))

    def test_normal_product_files_are_not_blocked(self):
        for path in (
            "app.js",
            "translations.js",
            "functions/api/track.js",
            "scripts/engine-smoke-test.mjs",
            "README.md",
        ):
            with self.subTest(path=path):
                self.assertEqual(protected_path_reason(path), "")

    def test_credential_scanner_detects_known_secret_shapes(self):
        self.assertTrue(contains_credential("nvapi-abcdefghijklmnopqrstuvwxyz012345"))
        self.assertTrue(contains_credential("github_pat_abcdefghijklmnopqrstuvwxyz012345"))
        self.assertTrue(contains_credential("ghp_abcdefghijklmnopqrstuvwxyz012345"))
        self.assertFalse(contains_credential("This is a normal test report."))


if __name__ == "__main__":
    unittest.main()
