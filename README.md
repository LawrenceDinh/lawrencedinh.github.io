# lawrencedinh.github.io

Static GitHub Pages portfolio for Lawrence Dinh, a software and systems engineer. The public experience includes:

- an Enhanced interactive portfolio homepage
- a project explorer with responsive case-study presentations
- a Writing archive and article reader
- the Bashseekers branded demo site

Live root URL: `https://lawrencedinh.github.io/`

## Major capabilities

- Portfolio homepage with interactive career, skills, and featured-project views
- Shared responsive navigation across the homepage, Projects, and Writing
- Project archive and detail presentations driven by static project data
- Writing archive and article reader backed by a static JSON manifest
- Enhanced presentation enabled by default while the Simple implementation remains available in source for future development
- Bashseekers homepage and media archive powered by static registries

## Repository layout

- `index.html`: canonical portfolio homepage
- root HTML, CSS, JavaScript, `imgsrc/`, and `writing/`: portfolio pages, shared code, and public assets
- `web/`: lightweight compatibility redirects for previously shared portfolio URLs
- `bashseekers/`: Bashseekers homepage, media archive, data registries, project docs

## Stack

- HTML
- CSS
- Vanilla JavaScript
- Static GitHub Pages hosting

## Development and validation

No install command is defined by the repository.

Useful verified commands:

```powershell
node --check script.js
node --check navigation.js
node --check display-mode.js
node --check projects-explorer.js
node --check writing.js
node --check bashseekers/script.js
node --check bashseekers/hero-media.js
node --check bashseekers/media-data.js
git diff --check
```

For manual checks, open the relevant HTML file directly in a browser or serve the repo root with a generic static server.

## Analytics

Cloudflare Web Analytics is loaded by `analytics.js` on the canonical portfolio pages and the standalone Bashseekers pages. The loader accepts only `lawrencedinh.com`, `www.lawrencedinh.com`, and `lawrencedinh.github.io`, so localhost, IP-based previews, file URLs, and other development hosts do not send analytics traffic. The Cloudflare site token is intentionally public client-side configuration.

After deployment, verify the integration on the live site with browser developer tools: confirm `beacon.min.js` loads once, a Cloudflare analytics request is sent without console errors, and the visit later appears in the Cloudflare Web Analytics dashboard. Compatibility redirects under `/web/` are intentionally not instrumented to avoid counting both the redirect and its canonical destination.

## Deployment summary

Deployment is inferred to be direct static publishing through GitHub Pages:

- `index.html` serves the portfolio directly at `https://lawrencedinh.github.io/`
- root-level portfolio files are the canonical implementation; `web/` preserves legacy links with redirects
- `bashseekers/` is published as a subpath
- no repo-defined build step or deployment automation was found
