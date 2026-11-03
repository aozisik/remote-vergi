# Remote Vergi API (Cloudflare Worker + D1)

Tiny backend for the crowdsourced **YMM tasdik ücreti** tool. Just SQLite + one
function. The static site (GitHub Pages) calls it; nothing about the site's
deploy changes.

## One-time setup

```bash
cd worker
npm i -g wrangler            # or: npx wrangler ...
wrangler login

# 1. Create the D1 database, then paste the printed database_id into wrangler.toml
wrangler d1 create remote-vergi

# 2. Create the table
wrangler d1 execute remote-vergi --remote --file=./schema.sql

# 3. Set the moderation secret
wrangler secret put ADMIN_TOKEN

# 4. Deploy (serves at api.remotevergi.com once the custom-domain route provisions)
wrangler deploy
```

The `routes` block in `wrangler.toml` binds `api.remotevergi.com` (zone is on
Cloudflare). To smoke-test first without DNS, comment that block out and use the
printed `*.workers.dev` URL — the frontend reads the URL from
`src/scripts/ymm.ts` (`API_BASE`).

## Local dev

```bash
wrangler d1 execute remote-vergi --local --file=./schema.sql
wrangler dev            # http://localhost:8787
```

## Endpoints

| Method | Path          | Auth  | Purpose                                  |
|--------|---------------|-------|------------------------------------------|
| POST   | `/quote`      | none  | submit one anonymous quote               |
| GET    | `/aggregates` | none  | medians/ranges/fee arrays per bracket    |
| GET    | `/admin/list` | token | recent rows for moderation               |
| POST   | `/admin/hide` | token | `{ "id": 123 }` → hide a row             |

Admin calls send `Authorization: Bearer <ADMIN_TOKEN>`.

```bash
# review recent submissions
curl -H "Authorization: Bearer $TOKEN" https://api.remotevergi.com/admin/list

# hide a fake/spam row
curl -X POST -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" -d '{"id":123}' \
     https://api.remotevergi.com/admin/hide
```

## Seeding (recommended before launch)

Cold-start with ~20-30 real data points so the page isn't empty. Either insert
via SQL or POST to `/quote`:

Brackets are by **yıllık ciro** (TL): `0-1.5m`, `1.5m-3m`, `3m-6m`, `6m-12m`, `12m+`.

```bash
wrangler d1 execute remote-vergi --remote --command \
  "INSERT INTO quotes (bracket, fee, annual_revenue, year) VALUES ('3m-6m', 45000, 4200000, 2026);"
```

## Notes

- Submissions are `approved` by default and shown immediately. The read path
  trims IQR outliers so a few gamed extremes can't move the median; use
  `/admin/hide` to remove obvious junk.
- Rate limit: 8 submissions/hour per IP (hashed, never stored raw). Honeypot
  field `website` silently drops bots.
- Raw rows never leave the DB; `/aggregates` returns only numbers.
