# Vai — Marketing Site

Marketing and landing page for [Vai](https://github.com/mrlynn/voyageai-cli) (voyageai-cli), hosted at [vaicli.com](https://vaicli.com).

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Material UI (MUI)** — dark theme with MongoDB Design System colors
- **MongoDB** — telemetry storage
- **Vercel** — hosting

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (for telemetry)

### Setup

```bash
# Clone and install
git clone https://github.com/mrlynn/vai-site.git
cd vai-site
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and API key

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `TELEMETRY_API_KEY` | Secret key for the `/api/telemetry/stats` endpoint |

## API Endpoints

### `POST /api/telemetry`

Accepts anonymous usage events from the Vai CLI and desktop app.

**Request body:**
```json
{
  "event": "cli_command",
  "version": "1.0.0",
  "platform": "darwin-arm64",
  "context": "cli",
  "command": "embed"
}
```

**Response:** `{ "ok": true }`

- Rate limited: 100 events/hour per IP
- CORS: all origins allowed
- Stores country (from Vercel headers), never full IP

### `GET /api/telemetry/stats?API_KEY=your-key`

Returns aggregated telemetry stats. Protected by API key.

## Deploying to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables (`MONGODB_URI`, `TELEMETRY_API_KEY`)
4. Configure domain: `vaicli.com`
5. Deploy

### Custom Domain Setup

In your DNS provider, add a CNAME record:
```
vaicli.com → cname.vercel-dns.com
```

Then add the domain in Vercel project settings → Domains.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── telemetry/
│   │       ├── route.ts          # POST - ingest events
│   │       └── stats/
│   │           └── route.ts      # GET - aggregated stats
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── Models.tsx
│   ├── CliDemo.tsx
│   ├── DesktopApp.tsx
│   └── Footer.tsx
├── lib/
│   └── mongodb.ts
└── theme/
    ├── theme.ts
    └── ThemeRegistry.tsx
```

## License

MIT
