#!/bin/bash
set -e
cd /opt/convex-evidcheck
docker compose exec postgres psql -U convex -d convex -c 'CREATE DATABASE evidcheck;' || true
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
