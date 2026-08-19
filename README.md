# veldy — static site

Self-contained static export (HTML/CSS/JS/images all local). No external Framer/CDN dependency required to run.

## Run locally
```bash
python -m http.server 8000
# open http://127.0.0.1:8000/index.html
```
Serve over HTTP (not file://) so ES module scripts (`assets/js/*.mjs`) load correctly.

## Deploy (GitHub Pages)
Push this folder's contents to the repo root (or `/docs`) and enable Pages. `index.html` is the entry point.

## Structure
- `index.html`, `work.html`, `gallery.html`, `contact.html` — top pages
- `article/`, `work/` — sub pages
- `assets/js/` — ES module bundles (`.mjs`) + CMS data (`.framercms`)
- `framerusercontent.com/` — local images, fonts, JSON
