# Current State

## Snapshot

Bashseekers is currently a static GitHub Pages demo with one homepage and one media archive page. It has no build system or backend in the inspected project.

## Homepage order

1. Hero / intro.
2. Ticker.
3. Shop/product cards.
4. About.
5. Media/Gallery featured wall.
6. Services.
7. Contact/footer.

## Current desktop intent

- Preserve a dark VHS/grunge street-style visual identity.
- Keep major sections feeling standardized and intentionally paced.
- Let Media/Gallery read as an editorial zine spread with varied card sizes.
- Keep Services as cards + inquiry CTA + visible expandable proof image.

## Current mobile intent

- Prioritize readability, tap targets, and no horizontal overflow.
- Reduce distracting overlays.
- Use static background fallbacks for decorative video areas.
- Preserve the hero poster/slideshow composition without forcing the desktop layout.

## Current interactive systems

- Mobile menu.
- Normal browser scrolling.
- Sticky-header-aware nav smooth-scroll and scrollspy.
- Hero video injection, slideshow dots, autoplay, and mobile swipe with finger-right = next and finger-left = previous.
- Data-driven media cards, filters, and modal previews.
- Services proof image expand/collapse.
- Back-to-top button.

## Current unresolved items

- Instagram live feed is a placeholder until a static-page-compatible widget is added.
- Hero and gallery media lists must be updated manually because GitHub Pages cannot scan folders at runtime.

## Last verification

- `node --check bashseekers/script.js`
- `node --check bashseekers/hero-media.js`
- `node --check bashseekers/media-data.js`
- `git diff --check`
- Static inspection confirmed no automatic section snap code or CSS `scroll-snap-*` rules remain.
- Manual browser scroll-feel checks are still recommended for wheel, trackpad, and scrollbar dragging.
