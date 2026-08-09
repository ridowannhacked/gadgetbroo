<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# iamge kit id

rt9szzzbg

# The chosen ImageKit ID will be used in asset URLs

<https://ik.imagekit.io/rt9szzzbg/path/to/myimage.jpg>

> Thre is a problem when I toggle the permission of a role for the admin panel can view can update etc, in the
  ui 1 permisson, 6 permission, I mean

```tsx
        {role.description && (
                        <p className="text-[11px] text-slate-500 truncate">{role.description}</p>
                      )}
                      <div className="flex gap-3 text-[10px] text-slate-600 mt-0.5">
                        <span>{role.users.length} user{role.users.length !== 1 ? "s" : ""}</span>
                        <span>{role.permissions.length} permission{role.permissions.length !== 1 ? "s" :
  ""}</span>
                      </div>

```

this isn't showing the permission correctyly but the db permission table is working fine when I am toggling the permission for a role from the permission toggle menu

# ci cd pipeline

Step by step
Generate the key (on your own machine, not the server):

ssh-keygen -t ed25519 -f deploy_key -N "" -C "github-actions-<project>-deploy"
Install it on the server, appending to ~/.ssh/authorized_keys with a forced command and locked-down options:

command="/root/dev.gadgetbroo-deploy-entrypoint.sh",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty ssh-ed25519 AAAA... github-actions-dev.gadgetbroo-deploy

command="/root/<project>-deploy-entrypoint.sh",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty ssh-ed25519 AAAA... github-actions-<project>-deploy
That command= prefix is what makes it safe — whatever command GitHub Actions tries to send, the server ignores it and runs the entrypoint instead.

Write the entrypoint on the server at /root/<project>-deploy-entrypoint.sh, exactly like the snippet above, chmod 700 it.

Write scripts/deploy.sh in your repo — install/build/migrate/restart, whatever your stack needs. TradeJet's does:

cd backend && npm ci && npx prisma generate && npx prisma migrate deploy && npm run build
cd ../frontend && npm ci && npm run build

# then kill+restart both processes on their ports, health-check, done

Add the workflow:

name: Deploy to VPS
on:
  push:
    branches: [master]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          script_stop: true
          command_timeout: 20m
          script: /root/<project>-deploy-entrypoint.sh
Add repo secrets (Settings → Secrets and variables → Actions): DEPLOY_HOST, DEPLOY_USER, DEPLOY_SSH_KEY (the private key, full BEGIN/END OPENSSH PRIVATE KEY block).

Two things that'll bite you if you skip them
Why the entrypoint is a separate, untracked file. If deploy.sh did the git reset --hard on itself while it was still executing, you'd risk truncating a running script mid-read. The entrypoint pulls first, then execs the freshly-updated script as a brand-new process — no self-modification hazard.

The SSH-hang trap when restarting a long-running process. If your restart step looks like cd dir && export X=y && nohup npm start & , that backgrounds the whole chain as one subshell — which then blocks forever waiting for npm start (a server that never exits) before it can return. Your SSH session hangs until GitHub's timeout kills it, even though the deploy actually succeeded. Fix: background the actual long-running command in its own subshell, not the setup steps:

(setsid nohup npm run start >> app.log 2>&1 < /dev/null &) >/dev/null 2>&1
This is exactly what's in scripts/deploy.sh right now, with a comment explaining why.

If you tell me the stack/hosting for the other project(s), I can draft the actual deploy.sh + workflow for it directly instead of you translating this by hand.
