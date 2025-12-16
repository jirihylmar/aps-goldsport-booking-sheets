# Goldsport Booking Sheets

Google Apps Script for managing Goldsport ski resort bookings in Google Sheets.

## Project Structure

```
├── src/
│   ├── Code.gs              # Main Google Apps Script code
│   └── appsscript.json      # Apps Script manifest
├── config/
│   ├── .clasp.playground.json   # Playground environment config
│   └── .clasp.production.json   # Production environment config
├── scripts/
│   ├── deploy-playground.sh     # Deploy to playground
│   ├── deploy-production.sh     # Deploy to production (with confirmation)
│   ├── open-playground.sh       # Open playground sheet
│   └── open-production.sh       # Open production sheet
├── data/
│   └── *.tsv                    # Sample data files
└── docs/
    └── environment-info.txt     # Environment URLs and IDs
```

## Environments

| Environment | Sheet URL | Purpose |
|-------------|-----------|---------|
| **Playground** | [Playground Sheet](https://docs.google.com/spreadsheets/d/1Vzw2O21MH2VLBefoVzD2CJ940nu05iUlQ2S5MPn0J-M) | Testing changes |
| **Production** | [Production Sheet](https://docs.google.com/spreadsheets/d/1OFaiqRb87tvlp3kCiPNqOlNCz2Z86KwMWKdJD-zxGFw) | Live system |

## Setup

### Prerequisites

1. Install Node.js (v14+)
2. Install clasp globally: `npm install -g @google/clasp`
3. **Authenticate with Google:** `npm run login` or `clasp login`
   - This creates OAuth credentials in `~/.clasprc.json` (not in this repo)
   - You only need to do this once per machine
   - Credentials are stored securely in your home directory

### Install Dependencies

```bash
npm install
```

## Authentication & Security

**CLASP uses OAuth authentication** - no service account keys needed!

- Run `clasp login` once to authenticate
- Credentials are stored in `~/.clasprc.json` in your home directory
- This file is **automatically ignored** and never committed to git
- Each developer authenticates individually with their Google account

## Deployment Workflow

### 1. Test in Playground First

```bash
# Deploy to playground
npm run deploy:playground

# Or just push without the script wrapper
npm run push:playground

# Open the playground sheet to test
npm run open:playground
```

### 2. Test Your Changes

1. Open the playground sheet
2. Use the **Custom Actions** menu to test:
   - Sort Reservations
   - Refresh view orders
   - Add manual booking
3. Verify everything works as expected

### 3. Deploy to Production

```bash
# Deploy to production (requires confirmation)
npm run deploy:production

# Or just push
npm run push:production
```

## Available npm Scripts

| Command | Description |
|---------|-------------|
| `npm run deploy:playground` | Deploy to playground (test environment) |
| `npm run deploy:production` | Deploy to production (requires confirmation) |
| `npm run push:playground` | Push code to playground |
| `npm run push:production` | Push code to production |
| `npm run pull:playground` | Pull code from playground |
| `npm run pull:production` | Pull code from production |
| `npm run open:playground` | Open playground Google Sheet |
| `npm run open:production` | Open production Google Sheet |
| `npm run login` | Login to Google with clasp |

## Features

The script adds a **Custom Actions** menu to Google Sheets with:

1. **Sort Reservations** - Sorts booking data with priority logic:
   - Normal rows sorted by Course Start (desc), then Lesson Type (asc)
   - Unconfirmed and replaced bookings sorted to bottom

2. **Refresh view orders** - Exports filtered view:
   - Only confirmed bookings
   - Only today and future dates
   - Preserves formatting from previous exports

3. **Add manual booking** - Creates new booking with:
   - Auto-generated UUID
   - Timestamp
   - Pre-filled booking type

## Script Editor Links

- **Playground Script:** https://script.google.com/d/18CEXDSxrjqbOi90HF1I6IlI_dOFccw3m67roAx1Uns-_lB20y-CPRMNm/edit
- **Production Script:** https://script.google.com/d/120jyEh9mxHaESQxoW1nzWZCjWTnesgmSEc1knIBum1-kqXE4Mp5qkfYZ/edit
