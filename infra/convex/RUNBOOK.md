# EvidCheck Self-Hosted Convex — Runbook

Staging backend lives on the VPS (`213.199.44.13`) at `/opt/convex-evidcheck`.

| Piece | Location |
|---|---|
| Client sync API | `https://convex-api.evidcheck.com` → `127.0.0.1:3210` |
| HTTP actions (REST API, Paystack webhook) | `https://convex-api.evidcheck.com:8443` → `127.0.0.1:3211` |
| Dashboard | `127.0.0.1:6791` on VPS (localhost-only, use SSH tunnel) |
| Postgres 16 | Docker volume `convex-evidcheck_pgdata` (no host ports) |
| nginx configs | `/etc/nginx/sites-enabled/convex-api.config`, `convex-api-actions.config` |
| Local copies | `infra/convex/` in this repo (secrets NEVER committed) |

## Local CLI targeting

All Convex commands target staging with the isolated env file (it overrides
`.env.local`, so Cloud is never touched):

```powershell
npx convex <command> --env-file infra/convex/.env.selfhosted
```

`.env.selfhosted` and `*.zip` / `.env*` under `infra/convex/` are gitignored.

## Dashboard access (SSH tunnel)

```bash
ssh -N -L 6791:127.0.0.1:6791 root@213.199.44.13
# then open http://localhost:6791 — paste the admin key when asked
```

The admin key was generated on the VPS via
`docker compose exec backend ./generate_admin_key.sh`.
To rotate: generate a new one and update `infra/convex/.env.selfhosted`.

## Backup & restore

```powershell
# Backup staging (or Cloud — omit --env-file to target Cloud dev)
npx convex export --env-file infra/convex/.env.selfhosted --path ./infra/convex/backup-YYYYMMDD.zip

# Restore
npx convex import --env-file infra/convex/.env.selfhosted --replace-all ./infra/convex/backup-YYYYMMDD.zip
```

Recommended: weekly `convex export` cron on the VPS + copy the zip off-site.
Postgres volume alone is NOT a sufficient backup (exports are portable).

## Deploying function changes to staging

```powershell
npx convex deploy --env-file infra/convex/.env.selfhosted --message "what changed"
```

Backend env vars mirror Cloud:

```powershell
npx convex env set KEY value --env-file infra/convex/.env.selfhosted
```

Current keys: `EMAIL_USER`, `EMAIL_PASSWORD`, `GAVA_BASE_URL`,
`GAVA_CONSUMER_KEY`, `GAVA_CONSUMER_SECRET`, `LLM_API_KEY`, `LLM_MODEL`,
`LLM_PROVIDER`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`.

## Upgrading the backend image

```bash
# on VPS
cd /opt/convex-evidcheck
docker compose pull
docker compose up -d
# keep convex npm in package.json aligned with the backend image
```

## Smoke test

```powershell
node infra/convex/smoke-test.cjs
# runs a sandbox verification through public HTTPS -> backend -> Postgres
```

## Cutover checklist (Cloud -> self-hosted, when approved)

1. [ ] Re-export Cloud prod data, import to staging, verify counts per table
2. [ ] Deploy latest functions to staging (`convex deploy --env-file ...`)
3. [ ] Full click-through on staging frontend (login, verification, billing, reports)
4. [ ] Frontend env switch (hosting provider / `.env`):
   - `NEXT_PUBLIC_CONVEX_URL=https://convex-api.evidcheck.com`
   - `NEXT_PUBLIC_CONVEX_SITE_URL=https://convex-api.evidcheck.com:8443`
5. [ ] Paystack dashboard: webhook URL ->
   `https://convex-api.evidcheck.com:8443/paystack/webhook`
6. [ ] Transactional emails: verify `NEXT_PUBLIC_SITE_URL` links still correct
7. [ ] Watch VPS backend logs during soak: `docker compose logs -f backend`
8. [ ] Set up weekly export cron + off-site copy
9. [ ] Keep Cloud deployment for 30 days as rollback, then decommission

## Gotchas found during setup (do not regress)

- `POSTGRES_URL` must have NO database path and needs `?sslmode=disable`:
  `postgres://convex:PASS@postgres:5432?sslmode=disable`
- `DO_NOT_REQUIRE_SSL=true` must be passed to the backend container
- The database must be named after `INSTANCE_NAME` (`evidcheck`) — created
  explicitly; `POSTGRES_DB=convex` alone is not enough
- Backend ports are bound to `127.0.0.1` only; nginx is the only public entry
