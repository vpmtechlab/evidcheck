#!/bin/bash
set -e
cd /opt/convex-evidcheck
PASS=$(grep POSTGRES_PASSWORD .env | cut -d= -f2)
grep -v '^POSTGRES_URL=' .env > /tmp/env.new
printf '%s\n' "POSTGRES_URL=postgres://convex:${PASS}@postgres:5432?sslmode=disable" >> /tmp/env.new
mv /tmp/env.new .env
chmod 600 .env
grep -o 'POSTGRES_URL=.*' .env
docker compose up -d
echo "--- waiting for backend ---"
for i in $(seq 1 24); do
  if curl -sf http://127.0.0.1:3210/version > /dev/null 2>&1; then
    echo "BACKEND_HEALTHY"
    curl -s http://127.0.0.1:3210/version
    echo
    break
  fi
  sleep 5
  if [ "$i" = "24" ]; then echo "BACKEND_UNHEALTHY"; docker compose logs backend --tail 5; exit 1; fi
done
docker compose exec backend ./generate_admin_key.sh
