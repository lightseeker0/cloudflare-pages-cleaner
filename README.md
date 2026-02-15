# Cloudflare Pages Cleaner

A simple Node.js utility to clean up Cloudflare Pages projects that have a high number of deployments, causing the dashboard "Delete Project" button to hang or fail.

## Why this exists?
Official Cloudflare documentation and deletion utilities sometimes have broken links or inaccessible tools (e.g., when trying to download the legacy bulk-delete scripts). This tool was created to provide a reliable, lightweight alternative using the latest Cloudflare API to wipe your project slate clean so you can reuse your project names and domains.

## Features
- Fetches all deployments across all pages (paginated).
- Deletes deployments individually to bypass bulk API timeouts.
- Automatically deletes the project once all deployments are cleared.
- Uses environment variables for security.

## Installation

1. Clone or download this project.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Rename `.env.example` to `.env` and fill in your details.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `CLOUDFLARE_EMAIL` | Your Cloudflare login email |
| `CLOUDFLARE_API_KEY` | Your Global API Key (Profile -> API Tokens -> Global API Key) |
| `CLOUDFLARE_ACCOUNT_ID` | Your Account ID (found in the dashboard URL) |
| `CLOUDFLARE_PROJECT_NAME` | The name of the project you want to delete |

## Usage

Run the script:
```bash
npm start
```

## Security Warning
> [!CAUTION]
> This script performs irreversible deletions. Ensure you have targeted the correct project name before running. Never share your `.env` file or commit it to a public repository.

## License
MIT
