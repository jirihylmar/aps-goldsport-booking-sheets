#!/bin/bash
# Open Production sheet
# Usage: ./scripts/open-production.sh

echo "Opening Production..."
echo ""

# Open sheet
xdg-open "https://docs.google.com/spreadsheets/d/1OFaiqRb87tvlp3kCiPNqOlNCz2Z86KwMWKdJD-zxGFw" 2>/dev/null || \
open "https://docs.google.com/spreadsheets/d/1OFaiqRb87tvlp3kCiPNqOlNCz2Z86KwMWKdJD-zxGFw" 2>/dev/null || \
echo "Sheet URL: https://docs.google.com/spreadsheets/d/1OFaiqRb87tvlp3kCiPNqOlNCz2Z86KwMWKdJD-zxGFw"
