#!/usr/bin/env bash
# Drops database schema + data on remote database.
# Use when schema changes occur to reset production DB.
#
# Usage: DATABASE_URL=xxx bash util/db-reset.sh

set -euo pipefail
: "${DATABASE_URL:?Set DATABASE_URL to *external* database URL}"

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
  -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'

for f in ProjectSourceCode/init-data/*.sql; do
  echo "Loading $f"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"
done
