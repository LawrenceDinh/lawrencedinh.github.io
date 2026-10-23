# lawrencedinh.com

Static GitHub Pages portfolio for Lawrence Dinh, a software and systems engineer. The public experience includes:

- an Enhanced interactive portfolio homepage
- a project explorer with responsive case-study presentations
- a Writing archive and article reader
- the Bashseekers branded demo site

Public site: `https://lawrencedinh.com/`
GitHub Pages origin/fallback: `https://lawrencedinh.github.io/`

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

Cloudflare Web Analytics is loaded by `analytics.js` on the canonical portfolio pages and the standalone Bashseekers pages. The loader accepts `lawrencedinh.com`, `www.lawrencedinh.com`, and the GitHub Pages fallback `lawrencedinh.github.io`; localhost, IP-based previews, file URLs, and other development hosts do not send analytics traffic. The Cloudflare site token is intentionally public client-side configuration.

After deployment, verify the integration on the live site with browser developer tools: confirm `beacon.min.js` loads once, a Cloudflare analytics request is sent without console errors, and the visit later appears in the Cloudflare Web Analytics dashboard. Compatibility redirects under `/web/` are intentionally not instrumented to avoid counting both the redirect and its canonical destination.

## Deployment summary

Deployment is inferred to be direct static publishing through GitHub Pages:

- `index.html` is published through GitHub Pages and is publicly served at `https://lawrencedinh.com/` with `https://lawrencedinh.github.io/` retained as the Pages fallback origin
- root-level portfolio files are the canonical implementation; `web/` preserves legacy links with redirects
- `bashseekers/` is published as a subpath
- no repo-defined build step or deployment automation was found

## Minecraft Work portfolio

The `/minecraft-work/` index and fifteen directory-based project pages present the curated BassFreerunning Minecraft archive, with local responsive images and the shared site navigation/gallery. See [the authoring and provenance notes](minecraft-work/README.md).

```powershell
node scripts/build-game-design.mjs
node scripts/check-game-design.mjs
```

The generator is an authoring utility. Generated HTML is committed and served by the existing static GitHub Pages deployment.


## Archived portfolio page headers

The visible Projects, Minecraft Work and Writing header panels have been removed. Their exact HTML, shared CSS and Minecraft Work template are saved under `backups/portfolio-page-headers/2026-10-21/`, with restoration instructions in `RESTORE.txt`. Screen-reader page titles, the shared page frame and all content-section anchors remain. The notes below describe the archived header design.

Projects, Minecraft Work, and Writing share `.portfolio-page-header` in `style.css`. Each places the title beside a `.portfolio-page-header__context` group containing the description and `.portfolio-page-header__nav`. Subsection links align directly beneath the description, with no full-width footer divider. Content drives the height and the transition from horizontal to stacked layout; navigation wraps between labels, never within them. Enhanced tokens supply the existing typography, colors and surfaces, with Simple-mode fallbacks. Legacy hero and outlined subsection-button rules were removed from the shared and page-specific stylesheets.

Header anchor targets:

- Projects: `#featured-case-study`, `#current-projects`, `#academic-projects`.
- Minecraft Work: `#featured`, `#selected`, `#tools-workflow`, `#studies`.
- Writing: new semantic section anchor `#featured-writing`, plus existing `#all-writing`. The older `#writing-featured` and `#writing-archive-list` links still work with header clearance.

`navigation.js` reuses the section-scroll controller for these anchors, including reduced motion, browser hash history and an indicator synchronized with visible sections. Writing signals when its async archive becomes available and restores direct hashes after rendering. The article-count hero dependency was removed from `writing.js`. BassFreerunning attribution remains in the Minecraft Work archive and project credits.

Latest header/transition review artifacts and runnable browser checks are in `output/portfolio-transitions/` (local, not production dependencies). Checks cover 1920, 1440, 1100, 1024, 820, 760, 390 and 320 CSS-pixel widths, keyboard anchors, direct hashes, slow Writing manifest loading, scroll offsets, history, reduced motion and Simple mode. The existing `node scripts/build-game-design.mjs` / `node scripts/check-game-design.mjs` workflow remains applicable. No commit or deployment is part of generation.


The first content section follows a shared spacing rhythm. Projects leads directly into its project selector, Minecraft Work into the featured environment/capabilities cards, and Writing into its article grid. Section headings remain available to screen readers; the repeated visible labels and Projects supporting line are removed. The duplicate visible Writing label and section count were removed, together with the renderer dependency on that count. Article-level metadata is unchanged. Cross-page visual, responsive, anchor and preservation checks pass; the existing mobile Projects viewer `nested-interactive` accessibility finding remains outside this header scope.


Portfolio index framing is also shared: `.portfolio-index-page` supplies the same dark Enhanced backdrop and `main.portfolio-page-shell` supplies the same content width, responsive gutters and top spacing for Projects, Minecraft Work and Writing. Minecraft Work's narrower index shell and inherited homepage gradient were removed; its detail-page shell remains separate. Desktop header bounds match across all three pages at identical viewport sizes. Cross-page screenshots and geometry checks are in `output/portfolio-shells/`.


`portfolio-entrance.js` shares Projects' progressive fade/rise reveal with the Minecraft Work index: 520ms easing with a capped 45ms stagger, triggered as content enters view. Projects and Minecraft Work configure their own content groups; gallery initialization remains independent. Reduced motion, missing animation/observer APIs, and disabled JavaScript leave content visible. The existing cross-page fade in `navigation.js` and Writing's entrance sequence remain intact. Animation review captures and checks are in `output/game-design-entrance/`.


Portfolio index pages show a temporary bottom-edge gradient when first loaded at the top with more content below. The cue uses the page background color, ignores pointer input, and is dismissed on the first downward scroll (or focus entering its area), without returning when scrolling back up. Direct hashes/restored scroll positions skip it; pages that already fit the viewport do not show it. Reduced motion skips the fade transition. `portfolio-entrance.js` now reveals targets at the full viewport edge rather than withholding the last 8%, so partially visible lower cards can be previewed beneath the gradient. Review captures and checks are in `output/scroll-preview/`.
