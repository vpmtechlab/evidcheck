#!/bin/bash
set -e
cd /opt/convex-evidcheck
if [ ! -f .env ]; then
  PG_PASS=$(openssl rand -hex 24)
  INST_SECRET=$(openssl rand -hex 32)
  printf '%s\n' \
    "POSTGRES_PASSWORD=$PG_PASS" \
    "POSTGRES_URL=postgres://convex:$PG_PASS@postgres:5432?sslmode=disable" \
    "INSTANCE_NAME=evidcheck" \
    "INSTANCE_SECRET=$INST_SECRET" \
    "CONVEX_CLOUD_ORIGIN=https://convex-api.evidcheck.com" \
    "CONVEX_SITE_ORIGIN=https://convex-api.evidcheck.com:8443" \
    "RUST_LOG=info" \
    > .env
  chmod 600 .env
  echo "CREATED_ENV"
else
  echo "ENV_EXISTS"
fi
docker compose up -d postgres
echo "--- waiting for postgres ---"
for i in $(seq 1 12); do
  if docker compose exec postgres pg_isready -U convex -d convex > /dev/null 2>&1; then
    break
  fi
  sleep 5
done
docker compose exec postgres psql -U convex -d convex -c 'CREATE DATABASE evidcheck;' > /dev/null 2>&1 || true
docker compose pull --quiet
docker compose up -d
echo "--- waiting for backend health ---"
for i in $(seq 1 24); do
  if curl -sf http://127.0.0.1:3210/version > /dev/null 2>&1; then
    echo "BACKEND_HEALTHY"
    curl -s http://127.0.0.1:3210/version
    echo
    break
  fi
  sleep 5
  if [ "$i" = "24" ]; then echo "BACKEND_UNHEALTHY"; docker compose ps; exit 1; fi
done
echo "--- generating admin key ---"
docker compose exec backend ./generate_admin_key.sh
