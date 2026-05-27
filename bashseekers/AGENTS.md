# Bashseekers Agent Guide

## Project identity

Bashseekers is a static GitHub Pages demo for a drift team, vinyl/design shop, media archive, and service inquiry presence. It should feel dark, VHS/grunge, street-style, and garage-built, not generic corporate.

This is a static webpage/demo, not an app with a build system unless the repo proves otherwise. Keep changes minimal and targeted.

## Static GitHub Pages constraints

- Use plain HTML, CSS, and browser JavaScript.
- Keep paths relative and safe for `/bashseekers/` on GitHub Pages.
- No absolute local paths in committed website code.
- GitHub Pages cannot auto-scan folders at runtime. Register hero media in `hero-media.js` and gallery/media entries in `media-data.js`.
- Do not add build-only dependencies, `node_modules`, caches, screenshots, temp files, or unused exports.

## Main files

- `index.html`: homepage sections, nav, product links, about copy, gallery mount, services, contact, modal shell.
- `media.html`: full media archive page, gallery filters, Instagram widget placeholder, shared modal shell.
- `styles.css`: visual system, responsive layout, section rhythm, gallery card crops, service image expansion, modal styling.
- `script.js`: mobile menu, anchor offset scrolling, scrollspy, back-to-top, service image expand/collapse, hero slideshow/swipe, gallery rendering and modal behavior.
- `hero-media.js`: static hero background video path and hero slideshow image list.
- `media-data.js`: static media/archive item data for YouTube, Instagram, and local uploads.

## Section structure

Homepage order:

1. Hero / intro with video background, poster slideshow card, product preview, and CTAs.
2. Ticker strip.
3. Shop/product area linked to BigCartel.
4. About magazine-style panel.
5. Media/Gallery featured archive wall.
6. Services cards, inquiry CTA, and expandable proof image.
7. Contact/footer.

Media archive page:

- Shared header/nav.
- Full media archive with filters and gallery modal.
- Instagram feed widget placeholder.
- Shared footer.

## Design language

- Preserve the Bashseekers identity: dark VHS/grunge/street styling, white borders, yellow accent labels/buttons, scanline/static texture, zine/magazine composition, heavy condensed/handwritten type.
- Do not replace the site with generic clean corporate styling.
- Do not remove grunge/VHS/street style, but reduce mobile distractions when needed.
- Media/Gallery homepage should feel like a magazine/zine spread, not a random thumbnail grid.
- Media thumbnails should fill their cards; crop/zoom is preferred over black letterboxing.

## Responsive rules

- Desktop and mobile layouts are allowed to differ.
- Major desktop sections should feel standardized and intentional, but equal section height must not override composition.
- Mobile must prioritize readability, no horizontal overflow, tappable controls, and lighter overlays.
- Mobile Safari video autoplay is unreliable; static image fallbacks are acceptable and preferred for decorative backgrounds.
- Hero slideshow card composition should remain visually consistent between desktop and mobile.

## Behavior rules

- Inspect existing selectors/functions before editing.
- Navbar anchors must account for sticky header offset via the shared nav offset behavior.
- Normal browser scrolling is preferred. Do not add automatic section snapping unless it is specifically requested and carefully tested.
- If future section-to-section navigation is desired, prefer explicit controls such as nav links or next-section buttons instead of hijacking natural scroll.
- Services section should keep cards + inquiry + image preview behavior.
- Services collapsed image preview should focus on the top of the image.
- Services expand and hide should both animate smoothly.
- Do not change external product/social/media links unless clearly broken.

## Asset rules

- Use relative paths from `bashseekers/`.
- Keep hero slideshow images in `hero-slideshow/`.
- Keep decorative/hero videos in `hero-vid/`.
- Keep gallery uploads in `gallery-uploads/`; keep generated thumbs in `gallery-thumbs/` when used.
- Keep service proof images in `service-images/`.
- Do not add unused assets or committed temp exports.

## Testing and checks

Run the relevant checks before reporting done:

```powershell
node --check bashseekers/script.js
node --check bashseekers/hero-media.js
node --check bashseekers/media-data.js
git diff --check
```

Manual checks should cover homepage load, media page load, normal wheel/trackpad/scrollbar scrolling, sticky nav/anchors, scrollspy, hero slideshow/swipe, media cards/modals, services expand/hide, desktop wide view, mobile view, and console errors.

## Documentation self-update rule

After every meaningful code/design change, update the internal docs before reporting done.

Minimum update rules:

- Update `docs/CHANGELOG.md` for every completed user-visible change.
- Update `docs/CURRENT_STATE.md` when the current layout, behavior, or known status changes.
- Update `docs/ITERATION_NOTES.md` when a design direction is accepted, rejected, or corrected to prevent future drift.
- Update `docs/DESIGN_SYSTEM.md` only when a reusable visual rule changes.
- Update `docs/PROJECT_BASELINE.md` only when structure, files, sections, or major systems change.
- Update `docs/KNOWN_ISSUES.md` when a real unresolved bug or fragile area is discovered.

Do not over-document tiny edits, but do record anything that would help the next development pass avoid undoing the intended direction.

## Do not drift

- Keep changes scoped to the requested behavior or doc update.
- Preserve existing IDs/classes/data attributes unless updating all dependent CSS/JS.
- Avoid broad rewrites of `styles.css` or `script.js`.
- Preserve Bashseekers product, social, media, and contact destinations.
- Prefer improving the current system over introducing a parallel one.
