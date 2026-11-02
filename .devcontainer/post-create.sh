#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "Installing UTILORA dependencies..."
npm install --no-audit --no-fund

echo "Installing the tested OpenCode CLI version..."
npm install --global opencode-ai@1.19.5

echo
echo "Codespace setup complete."
opencode --version
