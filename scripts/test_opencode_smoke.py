import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))

from opencode_smoke import extract_final_assistant_text, extract_latest_assistant_state
from unittest.mock import patch

import run_opencode_agent
from run_opencode_agent import build_run_args, contains_credential, find_session_id, run_agent


class OpenCodeSmokeParserTests(unittest.TestCase):
    def test_ignores_assistant_text_from_an_unfinished_tool_call(self):
        transcript = {
            "messages": [
                {
                    "info": {"role": "assistant", "finish": "tool-calls"},
                    "parts": [{"type": "text", "text": "Inspecting first."}],
                }
            ]
        }

        self.assertEqual(extract_final_assistant_text(transcript), "")
        self.assertEqual(extract_latest_assistant_state(transcript), ("tool-calls", "Inspecting first."))

    def test_returns_only_a_completed_final_assistant_response(self):
        transcript = {
            "messages": [
                {
                    "info": {"role": "assistant", "finish": "tool-calls"},
                    "parts": [{"type": "text", "text": "Starting an inspection."}],
                },
                {
                    "info": {"role": "assistant", "finish": "stop"},
                    "parts": [{"type": "text", "text": "The final answer."}],
                },
            ]
        }

        self.assertEqual(extract_final_assistant_text(transcript), "The final answer.")
        self.assertEqual(extract_latest_assistant_state(transcript), ("stop", "The final answer."))

    def test_ignores_user_messages_and_non_text_parts(self):
        transcript = {
            "messages": [
                {
                    "info": {"role": "user", "finish": "stop"},
                    "parts": [{"type": "text", "text": "User text."}],
                },
                {
                    "info": {"role": "assistant", "finish": "stop"},
                    "parts": [
                        {"type": "tool", "tool": "read"},
                        {"type": "reasoning", "text": "Private reasoning"},
                    ],
                },
            ]
        }

        self.assertEqual(extract_final_assistant_text(transcript), "")
        self.assertEqual(extract_latest_assistant_state(transcript), ("stop", ""))

    def test_ignores_synthetic_and_ignored_text_parts(self):
        transcript = {
            "messages": [
                {
                    "info": {"role": "assistant", "finish": "stop"},
                    "parts": [
                        {"type": "text", "text": "Synthetic.", "synthetic": True},
                        {"type": "text", "text": "Ignored.", "ignored": True},
                        {"type": "text", "text": "Visible final."},
                    ],
                }
            ]
        }

        self.assertEqual(extract_final_assistant_text(transcript), "Visible final.")

    def test_accepts_finish_on_message_when_info_wrapper_is_absent(self):
        transcript = {
            "messages": [
                {
                    "role": "assistant",
                    "finish": "stop",
                    "parts": [{"type": "text", "text": "Complete."}],
                }
            ]
        }

        self.assertEqual(extract_final_assistant_text(transcript), "Complete.")

    def test_does_not_fall_back_to_an_older_completed_turn(self):
        transcript = {
            "messages": [
                {
                    "info": {"role": "assistant", "finish": "stop"},
                    "parts": [{"type": "text", "text": "Old answer."}],
                },
                {
                    "info": {"role": "assistant", "finish": "tool-calls"},
                    "parts": [{"type": "text", "text": "Still working."}],
                },
            ]
        }

        self.assertEqual(extract_final_assistant_text(transcript), "")
        self.assertEqual(extract_latest_assistant_state(transcript), ("tool-calls", "Still working."))

    def test_missing_finish_is_not_marked_completed(self):
        transcript = {
            "messages": [
                {
                    "info": {"role": "assistant"},
                    "parts": [{"type": "text", "text": "Possibly incomplete."}],
                }
            ]
        }

        self.assertEqual(extract_final_assistant_text(transcript), "")
        self.assertEqual(extract_latest_assistant_state(transcript), ("missing", "Possibly incomplete."))


class OpenCodeRunnerTests(unittest.TestCase):
    def test_finds_session_id_from_jsonl_events(self):
        raw = '{"type":"message.part.updated","part":{"sessionID":"session-123"}}\\n'
        self.assertEqual(find_session_id(raw), "session-123")

    def test_builds_non_interactive_same_session_recovery_command(self):
        args = build_run_args("/workspace", "qa-engineer", "model-x", "Finish.", "session-123")
        self.assertIn("--auto", args)
        self.assertEqual(args[args.index("--session") + 1], "session-123")
        self.assertEqual(args[-1], "Finish.")

    def test_rejects_credential_like_diagnostics(self):
        self.assertTrue(contains_credential("provider returned nvapi-abcdefghijklmnop"))
        self.assertFalse(contains_credential("No credentials were present."))

    def test_resumes_the_same_session_after_an_incomplete_tool_call(self):
        initial_stdout = '{"sessionID":"session-789"}\\n'
        command_results = [
            {"exit": 0, "timed_out": False, "overflow": False, "stdout": initial_stdout, "stderr": ""},
            {"exit": 0, "timed_out": False, "overflow": False, "stdout": "", "stderr": ""},
        ]
        export_results = [
            ("0", "tool-calls", "Partial inspection."),
            ("0", "stop", "Completed specialist report."),
        ]
        with patch.object(run_opencode_agent, "_run_command", side_effect=command_results) as command, \\
             patch.object(run_opencode_agent, "_export_state", side_effect=export_results):
            success, report = run_agent("/workspace", "qa-engineer", "model-x", "Inspect the project.")

        self.assertTrue(success)
        self.assertEqual(report, "Completed specialist report.\\n")
        self.assertEqual(command.call_count, 2)
        recovery_args = command.call_args_list[1].args[0]
        self.assertEqual(recovery_args[recovery_args.index("--session") + 1], "session-789")

    def test_keeps_incomplete_results_as_diagnostics_not_success(self):
        initial_stdout = '{"sessionID":"session-999"}\\n'
        command_results = [
            {"exit": 124, "timed_out": True, "overflow": False, "stdout": initial_stdout, "stderr": ""},
            {"exit": 124, "timed_out": True, "overflow": False, "stdout": "", "stderr": ""},
        ]
        export_results = [
            ("0", "tool-calls", "Draft only."),
            ("0", "tool-calls", "Draft only."),
        ]
        with patch.object(run_opencode_agent, "_run_command", side_effect=command_results), \\
             patch.object(run_opencode_agent, "_export_state", side_effect=export_results):
            success, report = run_agent("/workspace", "qa-engineer", "model-x", "Inspect the project.")

        self.assertFalse(success)
        self.assertIn("Recovery attempted: true", report)
        self.assertIn("Latest assistant finish: tool-calls", report)
        self.assertIn("Partial visible draft (not a completed response)", report)


if __name__ == "__main__":
    unittest.main()
