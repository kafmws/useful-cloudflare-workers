#!/usr/bin/env bash
# Deploy ONLY public assets to Cloudflare Pages (project: dayscount).
#
# Why not `wrangler pages deploy .`? The project root also holds .dev.vars,
# wrangler.toml, supabase-setup.sql, etc. Pages direct-upload publishes EVERY
# file in the output dir (dotfiles included, and .assetsignore is NOT honored),
# which would expose those files at https://dayscount.pages.dev/<file>.
# So we stage the public files into a clean dir and deploy that instead.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="dayscount"
BRANCH="main"
STAGE=".deploy-tmp"

# Public files that should be served. Add icons/screenshot here if you create them.
FILES=(index.html app.css app.js sw.js manifest.json _headers)
DIRS=(vendor functions)

rm -rf "$STAGE"
mkdir -p "$STAGE"
cp "${FILES[@]}" "$STAGE"/
for d in "${DIRS[@]}"; do cp -r "$d" "$STAGE"/; done

# Move wrangler.toml aside so its `pages_build_output_dir = "."` doesn't override
# the staged directory; restore it no matter what happens.
trap 'mv -f _wrangler.toml.bak wrangler.toml 2>/dev/null || true; rm -rf "$STAGE"' EXIT
mv wrangler.toml _wrangler.toml.bak

npx wrangler pages deploy "$STAGE" --project-name "$PROJECT" --branch "$BRANCH" --commit-dirty=true

echo "Deployed. Verify: curl -sI https://dayscount.pages.dev/.dev.vars  (should be text/html SPA fallback, not the file)"
