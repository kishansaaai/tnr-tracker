# 🔌 TNR Tracker — API & AI Integration Documentation

## Overview

TNR Tracker uses a combination of **Supabase Edge Functions** (serverless Deno functions) and **direct client-side API calls** to integrate with external services. This document covers all API integrations, their failover strategies, and usage patterns.

---

## Supabase Edge Functions

Edge Functions are deployed on Supabase's Deno runtime and act as secure proxies between the frontend and external APIs. They are invoked via the Supabase JS client:

```javascript
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { /* payload */ }
})
```

### `gemini-proxy`

**Purpose**: Proxies AI requests to Google Gemini API for colony health reports and cat photo analysis.

**Location**: `supabase/functions/gemini-proxy/`

**Authentication**: Requires valid Supabase JWT token (automatic via `supabase.functions.invoke`).

#### Actions

| Action | Description | Request Body | Response |
|--------|-------------|-------------|----------|
| `health_report` | Generate colony health analysis | `{ action, colony, cats, updates }` | `{ text: "..." }` |
| `analyze_photo` | Analyze cat photo for ear-tip/breed | `{ action, imageBase64, mimeType }` | `{ text: "..." }` |

**Environment Variables** (server-side only):
```env
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
```

---

### `cat-api-proxy`

**Purpose**: Proxies requests to [TheCatAPI](https://thecatapi.com) for random cat images and breed data.

**Location**: `supabase/functions/cat-api-proxy/`

**Authentication**: Requires valid Supabase JWT token.

#### Actions

| Action | Description | Response |
|--------|-------------|----------|
| `image` | Get a random cat image | `{ url: "...", breeds: [...] }` |
| `gif` | Get a random cat GIF | `{ url: "..." }` |

**Environment Variables** (server-side only):
```env
THE_CAT_API_KEY=your-thecatapi-key
```

---

## AI Integration

### Architecture: 3-Tier Failover

TNR Tracker implements a resilient AI pipeline that tries three providers in sequence:

```
┌──────────────────────────┐
│  1. Groq API             │  ← Fastest, used as primary
│     Model: LLaMA 3.3 70B │
│     Endpoint: api.groq.com│
└────────────┬─────────────┘
             │ on failure
┌────────────▼─────────────┐
│  2. Supabase Edge Fn     │  ← Server-side proxy
│     Function: gemini-proxy│
│     Model: Gemini 2.5 Flash│
└────────────┬─────────────┘
             │ on failure
┌────────────▼─────────────┐
│  3. Direct Gemini API    │  ← Client-side fallback
│     Model: Gemini 1.5    │
│     Flash Latest         │
└──────────────────────────┘
```

### Configuration

**Environment Variables** (Securely stored in Supabase Secrets, not exposed to client):

```bash
# Set via Supabase CLI:
supabase secrets set GEMINI_API_KEY=your-api-key
```

**Client Wrapper Behavior**: The frontend routes all requests through the Supabase Edge Function (`gemini-proxy`). No credentials or raw endpoints are exposed to the client application.

### Colony Health Report API

**Function**: `analyseColonyHealth({ colony, cats, updates })`  
**File**: `src/lib/gemini.js`

**Input Schema**:
```javascript
{
  colony: {
    name: string,
    status: 'unmanaged' | 'in_progress' | 'managed',
    description: string
  },
  cats: [{
    name: string,
    gender: 'male' | 'female' | 'unknown',
    neutered: boolean,
    health_notes: string
  }],
  updates: [{
    created_at: string (ISO 8601),
    message: string
  }]
}
```

**Output**: A markdown-formatted string with four sections:
1. `## Colony Status Summary`
2. `## Health Concerns`
3. `## Health Concerns`
4. `## Recommended Next Steps`

**Parsing**: Use `parseHealthReport(text)` to split the response into a structured object:
```javascript
{
  statusSummary: string,
  healthConcerns: string,
  neuteringProgress: string,
  nextSteps: string
}
```

### Cat Photo Analysis API

**Function**: `analyseCatPhoto(imageBase64, mimeType)`  
**File**: `src/lib/gemini.js`

**Input**:
- `imageBase64`: Base64-encoded image data (no `data:` prefix)
- `mimeType`: Image MIME type (e.g., `image/jpeg`)

**Output**: JSON string:
```json
{
  "has_ear_tip": true,
  "breed": "Domestic Shorthair - Tabby",
  "reason": "Left ear shows a clean diagonal tip, consistent with TNR ear-tipping."
}
```

---

## TheCatAPI Integration

**File**: `src/lib/catApi.js`

### `getRandomCat()`
Returns a random cat image URL and breed data for the "Cat of the Day" dashboard widget.

### `getRandomCatGif()`
Returns a random cat GIF URL used in the Adoption Matchmaker results page.

**Failover**: If the Edge Function proxy fails, falls back to a direct client-side fetch.

---

## Data Export APIs

### CSV Export

**Function**: `exportColoniesCSV(colonies, cats)`  
**File**: `src/lib/exportCSV.js`

Generates a downloadable CSV file containing:
- Colony name, status, coordinates
- Cat count per colony
- Neutered percentage
- Individual cat details (name, gender, neutered status, health notes)

### Vet Summary Export

**Function**: `openVetSummary(cats, colonies)`  
**File**: `src/lib/vetExport.js`

Opens a new browser tab with a **printable HTML document** listing all un-neutered cats organized by colony. Designed to be printed and brought to veterinary clinics for TNR surgery days.

**Security**: All user-provided text is HTML-escaped via `escapeHtml()` before rendering.

---

## Utility Functions

**File**: `src/lib/utils.js`

### `haversineDistance(lat1, lng1, lat2, lng2)`
Calculates geodetic distance between two GPS coordinates in kilometers using the Haversine formula.

### `computeRoute(traps)`
Solves the Traveling Salesman Problem (TSP) for trap pickup routes:
1. **Phase 1**: Nearest-neighbor greedy heuristic (Euclidean distance)
2. **Phase 2**: 2-opt improvement pass (Haversine distance)

Returns an optimally-ordered array of trap objects.

### `sanitizeForPrompt(str)`
Strips backticks and angle brackets from user input before embedding into AI prompts. Truncates to 500 characters.

### `friendlyError(err)`
Converts raw database/network errors into user-friendly toast messages.

### `hasKeywordWithoutNegation(text, keyword)`
Checks if a keyword appears in text without being preceded by negation words (e.g., "not", "no", "isn't"). Used by the Adoption Matchmaker to match cat personalities.

---

## Rate Limiting & Security

### Edge Function Security
- All Edge Functions verify the `Authorization` header contains a valid Supabase JWT
- Invalid or missing tokens return `401 Unauthorized`
- Request body validation prevents malformed payloads

### Client-Side Security
- API keys prefixed with `VITE_` are intentionally public (anon keys, not service role keys)
- Service role keys are **only** stored in Supabase Edge Function secrets
- AI prompt inputs are sanitized via `sanitizeForPrompt()` to prevent prompt injection
- All database mutations go through RLS policies regardless of the client library used
