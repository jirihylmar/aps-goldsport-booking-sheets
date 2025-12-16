#!/bin/bash
# Open Playground sheet and script editor
# Usage: ./scripts/open-playground.sh

echo "Opening Playground..."
echo ""

# Open sheet
xdg-open "https://docs.google.com/spreadsheets/d/1Vzw2O21MH2VLBefoVzD2CJ940nu05iUlQ2S5MPn0J-M" 2>/dev/null || \
open "https://docs.google.com/spreadsheets/d/1Vzw2O21MH2VLBefoVzD2CJ940nu05iUlQ2S5MPn0J-M" 2>/dev/null || \
echo "Sheet URL: https://docs.google.com/spreadsheets/d/1Vzw2O21MH2VLBefoVzD2CJ940nu05iUlQ2S5MPn0J-M"
