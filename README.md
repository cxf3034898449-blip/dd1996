# Design portfolio

Source for the current portfolio, including nine numbered design covers.

## GitHub Pages

Pages serves the committed `docs/` directory on `main`.

To update: use Node.js 24, run `npm ci` and `npm run build`, copy the generated `out/` contents to `docs/`, preserve `docs/.nojekyll`, then commit and push.

## GitHub Pages mobile startup

`npm run build` runs `scripts/pack-home.mjs` after the static export. The homepage embeds its webpack chunks, CSS, nine gallery previews, and entry Lottie data so a separate startup request cannot leave the entry screen unresponsive. Three.js geometry and motion parameters remain unchanged. Other routes keep the normal exported assets. Keep existing hashed files in `docs/_next` when copying `out` into `docs` so cached HTML can still resolve older chunks.

Validated locally with entry clicks, spiral/list switching, a 390 × 844 viewport, and a server deliberately returning 503 for external JavaScript/JSON. Actual iPhone WeChat and GitHub network conditions still require device verification.
