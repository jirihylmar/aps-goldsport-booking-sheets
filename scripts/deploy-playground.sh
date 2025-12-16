#!/bin/bash
# Deploy to Playground environment for testing
# Usage: ./scripts/deploy-playground.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=== Deploying to PLAYGROUND ==="
echo "Sheet: https://docs.google.com/spreadsheets/d/1Vzw2O21MH2VLBefoVzD2CJ940nu05iUlQ2S5MPn0J-M"
echo ""

# Copy playground config to root
cp "$PROJECT_ROOT/config/.clasp.playground.json" "$PROJECT_ROOT/.clasp.json"

# Push to playground
cd "$PROJECT_ROOT"
clasp push

echo ""
echo "=== Deployed to Playground ==="
echo "Test your changes at the playground sheet before deploying to production."
