# Neuland Dashboard

Internal admin UI for Neuland Next (Hochschulsport, Ankündigungen, Raum-Meldungen, Audit-Log).

## Stack

- TanStack Start + React 19 + Vite + Nitro
- Tailwind CSS v4 + IBM Plex Sans
- Authentik OIDC (encrypted session cookie)
- Bun + Biome 2

## Development

```bash
cp .env.example .env.local
# fill AUTHENTIK_*, SESSION_SECRET, GRAPHQL_URL, optional S3_*
bun install
bun run dev
```

App: http://127.0.0.1:43127

Authentik redirect URI: `$APP_URL/api/auth/callback`

Mock auth (local only): `AUTH_MOCK=true`

## Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Dev server |
| `bun run build` | Production build |
| `bun run start` | Run `.output` server |
| `bun run typecheck` | TypeScript |
| `bun run check` | Biome |
| `bun run docker:build` | Docker image |

## Docker

```bash
bun run docker:build
```

Runtime env: `APP_URL`, `SESSION_SECRET`, `AUTHENTIK_*`, `GRAPHQL_URL`, `DEV_GRAPHQL_URL`, `S3_*`.
