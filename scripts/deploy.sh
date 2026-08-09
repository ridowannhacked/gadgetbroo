#!/bin/bash
# Runs ON THE SERVER after the repo has already been fetched/reset to the target commit
set -euo pipefail

# Make sure this path matches the Node.js version installed on your aaPanel
export PATH="$PATH:/www/server/nodejs/v22.17.1/bin"

# Make sure this matches your project's root folder in aaPanel
ROOT="/www/wwwroot/dev.gadgetbroo.com"
PORT=3000

echo "==> Install dependencies, generate Prisma client, run migrations, and build"
cd "$ROOT"

npm ci
npx prisma generate
npx prisma migrate deploy
npm run build

echo "==> Restarting on port $PORT"
# Kill whatever is currently running on the port
fuser -k "${PORT}/tcp" >/dev/null 2>&1 || true
sleep 2

# Background the process properly using www user (aaPanel standard)
su -s /bin/bash www -c "cd '$ROOT' && export PATH=\"\$PATH:/www/server/nodejs/v22.17.1/bin\" PORT=$PORT && (setsid nohup npm run start >> /www/wwwlogs/gadgetbroo.log 2>&1 < /dev/null &) >/dev/null 2>&1"

sleep 3
echo "==> Health check"
curl -sf -o /dev/null "http://localhost:$PORT/" && echo " App OK" || { echo " App FAILED to start"; exit 1; }

echo "==> Deploy complete!"
