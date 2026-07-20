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

- `index.html`: root redirect to `web/index.html`
- `web/`: portfolio homepage, Projects, Writing, shared scripts, styles, and public assets
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
node --check web/script.js
node --check web/navigation.js
node --check web/display-mode.js
node --check web/projects-explorer.js
node --check web/writing.js
node --check bashseekers/script.js
node --check bashseekers/hero-media.js
node --check bashseekers/media-data.js
git diff --check
```

For manual checks, open the relevant HTML file directly in a browser or serve the repo root with a generic static server.

## Deployment summary

Deployment is inferred to be direct static publishing through GitHub Pages:

- `index.html` redirects to `https://lawrencedinh.github.io/web/index.html`
- `web/` holds the main portfolio branch
- `bashseekers/` is published as a subpath
- no repo-defined build step or deployment automation was found
