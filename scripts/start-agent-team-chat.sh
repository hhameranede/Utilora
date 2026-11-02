#!/usr/bin/env bash
set -euo pipefail

PORT="${OPENCODE_PORT:-49374}"

if ! command -v opencode >/dev/null 2>&1; then
  echo "OpenCode is not installed. Rebuild the Codespace container first." >&2
  exit 1
fi

if [[ -z "${NVIDIA_API_KEY:-}" ]]; then
  cat >&2 <<'EOF'
NVIDIA_API_KEY is missing.
Add it as a GitHub Codespaces secret, grant access to hhameranede/Utilora,
then stop and restart this Codespace so the environment receives it.
EOF
  exit 1
fi

if [[ -z "${OPENCODE_SERVER_PASSWORD:-}" ]]; then
  if [[ ! -t 0 ]]; then
    echo "Run this script in an interactive terminal so it can ask for a server password." >&2
    exit 1
  fi

  read -r -s -p "Create a strong OpenCode server password (20+ characters): " OPENCODE_SERVER_PASSWORD
  printf '\n'
  read -r -s -p "Confirm the password: " CONFIRM_PASSWORD
  printf '\n'

  if [[ "$OPENCODE_SERVER_PASSWORD" != "$CONFIRM_PASSWORD" ]]; then
    echo "The passwords do not match." >&2
    exit 1
  fi
  unset CONFIRM_PASSWORD
fi

if (( ${#OPENCODE_SERVER_PASSWORD} < 20 )); then
  echo "Use an OpenCode server password of at least 20 characters." >&2
  exit 1
fi

export OPENCODE_SERVER_PASSWORD

cat <<EOF
Starting the private UTILORA agent chat on port $PORT.
Open the forwarded port named "UTILORA Agent Chat" in the Codespaces Ports panel.
The port must remain Private. OpenCode will request the password you just set.
Press Ctrl+C here to stop the chat server.
EOF

exec opencode web --hostname 0.0.0.0 --port "$PORT"
