import json
import unittest

from capture_autonomous_report import contains_credentials, extract_session_id


class AutonomousReportCaptureTests(unittest.TestCase):
    def test_extracts_session_id_from_events(self):
        events = "\n".join([
            "not-json",
            json.dumps({"type": "step-start", "sessionID": "ses_abc123"}),
        ])
        self.assertEqual(extract_session_id(events), "ses_abc123")

    def test_extracts_session_id_from_part(self):
        events = json.dumps({"part": {"sessionId": "ses_nested"}})
        self.assertEqual(extract_session_id(events), "ses_nested")

    def test_rejects_known_credential_patterns(self):
        self.assertTrue(contains_credentials("found nvapi-abcdefghijklmnop"))
        self.assertTrue(contains_credentials("found ghp_" + "a" * 25))

    def test_rejects_exact_injected_secret(self):
        self.assertTrue(contains_credentials("prefix-secret-suffix", "secret"))

    def test_accepts_normal_report(self):
        self.assertFalse(contains_credentials("Market findings, evidence, and proposed fixes."))


if __name__ == "__main__":
    unittest.main()
