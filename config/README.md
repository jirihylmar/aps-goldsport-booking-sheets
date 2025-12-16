# Configuration Directory

This directory contains environment-specific configurations for CLASP deployment.

## Files

### `.clasp.playground.json` / `.clasp.production.json`
Environment-specific CLASP configurations that point to different Google Apps Script projects and Google Sheets.

**These files ARE committed to git** - they only contain project IDs, not credentials.

### `service-account-key.json` (NOT USED)
**Note:** This file is no longer used for deployment. CLASP uses OAuth authentication instead.

If you need to use a service account for other purposes:
1. Copy `service-account-key.json.example` to `service-account-key.json`
2. Add your actual credentials (this file is git-ignored)
3. **Never commit this file to git**

## Authentication

CLASP deployment uses **OAuth authentication**:
- Run `clasp login` once to authenticate
- Credentials are stored in `~/.clasprc.json` (in your home directory, not in this repo)
- Each developer authenticates with their own Google account
- No shared credentials needed!
