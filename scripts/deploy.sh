#!/bin/bash
# Runs ON THE SERVER after the repo has already been fetched/reset to the target commit
set -euo pipefail

# Make sure this path matches the Node.js version installed on your aaPanel
export PATH="$PATH:/www/server/nodejs/v22.17.1/bin"

# Make sure this matches your project's root folder in aaPanel
# NOTE: aaPanel's Node Project creator nests the actual git checkout one
# level deeper, inside a subfolder named after the project itself.
ROOT="/www/wwwroot/dev.gadgetbroo.com/gadgetbroo"
PORT=3000

# Must match the app name/ID shown by `pm2 list` (or in aaPanel's
# Website > Node Project page) for this project. Verify this on the
# server before your first CI/CD run — deploy.sh can't detect it for you.
PM2_APP_NAME="gadgetbroo"

echo "==> Install dependencies, generate Prisma client, run migrations, and build"
cd "$ROOT"

npm ci
npx prisma generate
npx prisma migrate deploy
npm run build   # also copies public/ and .next/static into .next/standalone

echo "==> Restarting via PM2 ($PM2_APP_NAME)"
# aaPanel's Node Project manager runs PM2 as the "www" user — restart
# through that same user so it finds the right PM2 daemon/process.
su -s /bin/bash www -c "export PATH=\"\$PATH:/www/server/nodejs/v22.17.1/bin\" && pm2 restart '$PM2_APP_NAME' --update-env"

sleep 3
echo "==> Health check"
curl -sf -o /dev/null "http://localhost:$PORT/" && echo " App OK" || { echo " App FAILED to start"; exit 1; }

echo "==> Deploy complete!"
