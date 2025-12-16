#!/bin/bash
# Deploy to Production environment
# Usage: ./scripts/deploy-production.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=== Deploying to PRODUCTION ==="
echo "Sheet: https://docs.google.com/spreadsheets/d/1OFaiqRb87tvlp3kCiPNqOlNCz2Z86KwMWKdJD-zxGFw"
echo ""

# Safety confirmation
read -p "Are you sure you want to deploy to PRODUCTION? (y/N): " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# Copy production config to root
cp "$PROJECT_ROOT/config/.clasp.production.json" "$PROJECT_ROOT/.clasp.json"

# Push to production
cd "$PROJECT_ROOT"
clasp push

echo ""
echo "=== Deployed to Production ==="
