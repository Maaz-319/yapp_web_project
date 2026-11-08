#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
mysql_options="$(mktemp)"
chmod 600 "$mysql_options"
trap 'rm -f "$mysql_options"' EXIT

printf '%s\n' \
    '[client]' \
    'host=127.0.0.1' \
    'user=yapp_app' \
    'password=choose-a-local-password' > "$mysql_options"

sudo mysql < "$project_root/database/startup.sql"
mysql --defaults-extra-file="$mysql_options" yapp < "$project_root/database/schema.sql"
mysql --defaults-extra-file="$mysql_options" yapp < "$project_root/database/seed.sql"

printf '%s\n' 'Yapp database setup is complete.'
