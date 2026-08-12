#!/bin/bash
# Runs ON THE SERVER after the repo has already been fetched/reset to the target commit
set -euo pipefail

# Make sure this path matches the Node.js version installed on your aaPanel.
# Prepended (not appended!) so it actually wins over whatever else is on
# PATH — the logs showed v24.19.0 running before this fix, since appending
# after $PATH never overrides an earlier match.
export PATH="/www/server/nodejs/v24.19.0/bin:$PATH"

# Make sure this matches your project's root folder in aaPanel
# NOTE: aaPanel's Node Project creator nests the actual git checkout one
# level deeper, inside a subfolder named after the project itself.
ROOT="/www/wwwroot/dev.gadgetbroo.com/gadgetbroo"
PORT=2222

# Must match the app name/ID shown by `pm2 list` (or in aaPanel's
# Website > Node Project page) for this project. Verify this on the
# server before your first CI/CD run — deploy.sh can't detect it for you.
PM2_APP_NAME="gadgetbroo"

echo "==> Install dependencies, generate Prisma client, run migrations, and build"
cd "$ROOT"

# `npm ci`'s own internal node_modules cleanup can throw ENOTEMPTY if
# anything else (a leftover build process, an overlapping deploy run) is
# touching node_modules at the same time. Removing it ourselves first with
# a plain rm -rf sidesteps that — a straight recursive delete doesn't have
# the same race-prone rmdir-then-reinstall dance npm does internally.
rm -rf node_modules
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build   # also copies public/ and .next/static into .next/standalone

echo "==> Restarting via PM2 ($PM2_APP_NAME)"
# aaPanel's Node Project manager runs PM2 as the "www" user — restart
# through that same user so it finds the right PM2 daemon/process.
# Falls back to `pm2 start` on the first-ever deploy, when the process
# hasn't been registered with PM2 yet.
su -s /bin/bash www -c "export PATH=\"/www/server/nodejs/v24.19.0/bin:\$PATH\" && (pm2 restart '$PM2_APP_NAME' --update-env || pm2 start server.js --name '$PM2_APP_NAME')"
su -s /bin/bash www -c "pm2 save"

sleep 3
echo "==> Health check"
curl -sf -o /dev/null "http://localhost:$PORT/" && echo " App OK" || { echo " App FAILED to start"; exit 1; }

echo "==> Deploy complete!"
