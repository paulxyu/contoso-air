# Contoso Air

Modern demo airline booking experience built with **Next.js 15 (App Router + Turbopack)**, **React 19**, streaming AI chat, and realistic mock data. Clean architecture, minimal dependencies, and clear extension points.

For demo / educational use.

## Highlights

- End‑to‑end flight search & booking flow (search → select → passenger details → purchase → confirmation).
- Streaming chat assistant with pluggable providers: OpenAI, Azure OpenAI, Ollama, or a fast mock.
- Optional tool (function) calling for airport & destination lookups.
- Fully typed (TypeScript) + modular components (`src/components`).
- Mock data generators for flights & bookings (no external API required).
- Playwright E2E test for the happy booking path.
- Tailwind (via PostCSS) + global styles; easy theming.

## Quick Start

```bash
git clone <repo-url>
cd contoso-air
cp .env.example .env.local   # then edit if using real models
npm install
npm run dev
```

Visit: <http://localhost:3000>

## Scripts

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm start        # Build + start
npm run lint     # ESLint
npm run test:e2e # Playwright tests
```

## Environment Variables

Only add what you need. For mock chat you can skip everything.

- Provider selection: `NEXT_PUBLIC_CHAT_PROVIDER` set to one of `mock`, `openai`, `azure`, `ollama`.
- OpenAI: `OPENAI_API_KEY` (optional `OPENAI_MODEL`).
- Azure OpenAI: `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT` (optional `AZURE_OPENAI_API_VERSION`).
- Ollama: `OLLAMA_BASE_URL` (default `http://localhost:11434`), `OLLAMA_MODEL`.
- Client model hint: `NEXT_PUBLIC_CHAT_MODEL` (optional override sent by browser).
- Tool calling: `CHAT_ENABLE_TOOLS=1` enables non‑stream tool rounds.

Restart `npm run dev` after changes. Prefix with `NEXT_PUBLIC_` for values needed client‑side.

## Chat API (Summary)

Endpoint: `POST /api/chat`

Request body:

```json
{
  "messages": [{ "role": "user", "content": "Hi" }],
  "provider": "openai",
  "model": "gpt-4o-mini"
}
```

Streaming SSE response sends chunks (`data: ...`) and finishes with `data: [DONE]`. Errors mid‑stream send `data: [ERROR]` then close. Non‑stream (tool mode) returns JSON: `{ ok, answer, provider, model, tools? }`.

Tools provided (when enabled):

- `search_airport_by_code(code)`
- `find_airports_in_city(city)`
- `list_featured_destinations()`

Extend tools in `src/app/api/chat/route.ts`.

## Booking Flow

Pages under `app/book/*` orchestrate a multi‑step flow using context in `BookingProvider` and components like `Flights`, `FlightOption`, `BookingForm`, and `BookingSegment`. Mock flight & booking generation lives in `src/utils/*Generator.ts`.

## Directory Glimpse

```text
src/app        # App Router pages & API routes
src/components # Reusable UI + domain components
src/data       # Static JSON datasets (airports, destinations)
src/utils      # Mock generators & helpers
tests          # Playwright E2E spec
public/images  # Marketing / destination imagery
```

## Testing

Playwright is configured; launch headed for debugging:

```bash
npm run test:e2e -- --ui
```

Keep tests fast: mock network calls (none by default) and prefer data generators.

## Linting & Quality

ESLint (Next.js base) + TypeScript. Run `npm run lint`. Add stricter rules in `eslint.config.mjs` as needed.

## Extending Ideas

- Persist bookings to a real database (e.g. Postgres + Prisma) instead of in‑memory mock.
- Add passenger profile management & loyalty points.
- Add price caching + SSR flight search results.
- Enhance chat with RAG (vector store) or retrieval of live pricing.

## Troubleshooting

Variable undefined? Check: filename starts with `.env`, server restarted, correct `NEXT_PUBLIC_` prefix, no stray spaces (`grep -n VAR_NAME .env*`).

Chat hangs? Confirm provider keys + network, then temporarily force mock (`NEXT_PUBLIC_CHAT_PROVIDER=mock`).

Tools not firing? Ensure streaming not forced (tools run only in non‑stream path) and `CHAT_ENABLE_TOOLS=1`.

---

Built with ❤️ using Next.js + React and the help of GitHub Copilot Agent. Enjoy exploring Contoso Air.
