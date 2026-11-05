import json
import unittest

from capture_market_report import extract_session_id


class MarketReportCaptureTests(unittest.TestCase):
    def test_extracts_session_id_from_jsonl_event(self):
        events = "not-json\n" + json.dumps({"type": "start", "sessionID": "session-123"})
        self.assertEqual(extract_session_id(events), "session-123")

    def test_extracts_nested_session_id(self):
        events = json.dumps({"part": {"sessionId": "session-nested"}})
        self.assertEqual(extract_session_id(events), "session-nested")

    def test_ignores_non_json_lines(self):
        self.assertEqual(extract_session_id("progress text only"), "")


if __name__ == "__main__":
    unittest.main()
