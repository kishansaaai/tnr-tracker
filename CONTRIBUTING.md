# Contributing to TNR Tracker

Thank you for your interest in contributing to TNR Tracker! This project aims to help communities manage Trap-Neuter-Return (TNR) programs for community cats.

## How to Contribute

### 1. Reporting Bugs
- Open an issue on GitHub detailing the problem.
- Include steps to reproduce, actual vs. expected behavior, and screenshots if applicable.

### 2. Suggesting Enhancements
- Open a feature request issue on GitHub.
- Describe the use-case and how this feature benefits TNR volunteers or administrators.

### 3. Submitting Pull Requests
- Fork the repository.
- Create a new branch: `git checkout -b feature/my-new-feature` or `bugfix/my-bugfix`.
- Ensure code style is consistent and follow JavaScript best practices.
- Add JSDoc comments to hooks, components, and utility functions where appropriate.
- Verify your changes locally using the Vitest suite:
  ```bash
  npm run test
  ```
- Push to your branch and submit a Pull Request (PR) to the `main` branch.

## 🦕 Edge Function Local Development

TNR Tracker uses Supabase Edge Functions (`gemini-proxy` and `cat-api-proxy`) written in Deno TypeScript to handle Vision AI processing, external API calls, and rate-limiting safely.

### 1. Prerequisites
- **Deno CLI**: Required for local testing, linting, and type checking in your editor.
  - Windows (PowerShell): `irm https://deno.land/install.ps1 | iex`
  - macOS/Linux: `curl -fsSL https://deno.land/x/install/install.sh | sh`
- **Supabase CLI**: Runs functions locally. Ensure you have installed the CLI and logged in.

### 2. Local Environment & Secrets Configuration
Create a `.env` or `.env.local` configuration file inside your local development directory (or use a dedicated environment file path) with the required API secrets:
```env
GEMINI_API_KEY=your-gemini-api-key
THE_CAT_API_KEY=your-cat-api-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-for-rate-limiting
```

### 3. Local Serving
Start the Deno function server locally:
```bash
supabase functions serve --env-file supabase/functions/.env.local
```
This launches the local API gateway (typically at `http://localhost:54321/functions/v1/`).

### 4. Deploying Functions and Secrets
To upload functions to your hosted Supabase instance:
```bash
# Set secrets on the remote environment
supabase secrets set GEMINI_API_KEY=xxx THE_CAT_API_KEY=xxx SUPABASE_SERVICE_ROLE_KEY=xxx

# Deploy functions
supabase functions deploy gemini-proxy
supabase functions deploy cat-api-proxy
```

## Code of Conduct
Please be respectful and supportive to other contributors. We are here to build a helpful tool for cat welfare.
