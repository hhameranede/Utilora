import unittest

from opencode_smoke import extract_final_assistant_text, extract_latest_assistant_state


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


if __name__ == "__main__":
    unittest.main()
