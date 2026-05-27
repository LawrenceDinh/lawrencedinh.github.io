# Changelog

## 2026-05-27 - Fix hero mobile swipe direction

Changed:

- `script.js`: made the hero slideshow swipe mapping explicit so finger-right advances to the next slide and finger-left goes to the previous slide.
- `docs/CURRENT_STATE.md`: noted the intentional mobile swipe direction.
- `docs/ITERATION_NOTES.md`: recorded the direction as a design decision to avoid future reversal.

Why:

- The mobile hero card sequence is intended to read left-to-right, so its finger-swipe mapping should stay finger-right = next.

Verified:

- `node --check bashseekers/script.js`
- `node --check bashseekers/hero-media.js`
- `node --check bashseekers/media-data.js`
- `git diff --check`

Follow-up:

- Manually confirm on a touch device that finger-right advances and finger-left goes back.

## 2026-05-27 - Add contact social icons

Changed:

- `index.html`: added decorative Instagram and YouTube inline SVG icons to the matching Contact section buttons.
- `styles.css`: added scoped icon spacing and sizing for Contact section buttons.

Why:

- The Contact actions should match the site's existing social icon language without changing button text, links, or layout.

Verified:

- `node --check bashseekers/script.js`
- `node --check bashseekers/hero-media.js`
- `node --check bashseekers/media-data.js`
- `git diff --check`

Follow-up:

- None.

## 2026-05-27 - Curate homepage media order

Changed:

- `media-data.js`: added homepage-only ordering for featured media so card 1 uses the previous card 2 media and card 7 uses the previous card 5 media.
- `script.js`: sorted only the homepage featured gallery by `homeOrder`; the full archive keeps the main media order.
- `styles.css`: swapped the desktop top-row wide/side grid slots so visible numbers read left-to-right.
- `docs/ITERATION_NOTES.md`: noted that homepage media cards need readable thumbnails and visual-order numbering.

Why:

- The previous homepage Media/Gallery order made the yellow card numbers read out of order and put unclear thumbnails in prominent slots.

Verified:

- `node --check bashseekers/script.js`
- `node --check bashseekers/media-data.js`
- `node --check bashseekers/hero-media.js`
- `git diff --check`

Follow-up:

- Manually confirm the curated homepage thumbnails read clearly at desktop and mobile sizes.

## 2026-05-27 - Featured sale badge

Changed:

- `index.html`: marked only the BS-AUTO-STYLE Featured Decals card as on sale.
- `styles.css`: reused the existing red `ON SALE` badge styling for sale-state Featured Decals cards.

Why:

- BS-AUTO-STYLE already shows as on sale in the product card section, and the Featured Decals version should match that sale state.

Verified:

- `node --check bashseekers/script.js`
- `node --check bashseekers/hero-media.js`
- `node --check bashseekers/media-data.js`
- `git diff --check`

Follow-up:

- None.

## 2026-05-27 - Remove automatic section snapping

Changed:

- `script.js`: removed the automatic desktop section snap controller, wheel debounce state, snap timers, and scrollbar-drag suppression that only existed for snapping.
- `AGENTS.md`: updated behavior guidance to prefer normal browser scrolling.
- `docs/PROJECT_BASELINE.md`: removed soft snapping from the current JS/system baseline.
- `docs/CURRENT_STATE.md`: updated the current interaction list to normal browser scrolling plus nav smooth-scroll/scrollspy.
- `docs/ITERATION_NOTES.md`: recorded automatic scroll snapping as a rejected direction unless explicitly requested and carefully tested.
- `docs/DEV_CHECKLIST.md`: replaced soft-snap checks with normal wheel/trackpad/scrollbar checks.
- `docs/KNOWN_ISSUES.md`: removed stale soft-snap fragility guidance.

Why:

- Automatic section snapping felt janky and unpredictable, sometimes overscrolled or skipped sections, and made normal scrolling and scrollbar dragging feel unreliable.

Verified:

- `node --check bashseekers/script.js`
- `node --check bashseekers/hero-media.js`
- `node --check bashseekers/media-data.js`
- `git diff --check`
- Static inspection confirmed no `initSoftSectionSnap()` logic, snap timers, wheel snap listener, or CSS `scroll-snap-*` rules remain.
- Manual browser scroll-feel checks are still recommended because headless browser verification was blocked in this environment.

Follow-up:

- If future section navigation is desired, prefer explicit nav links or a next-section button instead of automatic snapping on natural scroll.
- Manually verify wheel, trackpad, and scrollbar dragging in a real browser after pulling this change.

## 2026-05-27 - Documentation foundation

Changed:

- `AGENTS.md`: added project-specific development rules for the static Bashseekers demo.
- `docs/PROJECT_BASELINE.md`: documented the current pages, sections, assets, and interactive systems.
- `docs/DESIGN_SYSTEM.md`: captured visual direction and anti-drift guidance.
- `docs/DEV_CHECKLIST.md`: added command and manual verification checklist.
- `docs/CHANGELOG.md`: started user-visible change tracking.
- `docs/ITERATION_NOTES.md`: recorded current design decisions and rejected drift directions.
- `docs/CURRENT_STATE.md`: added quick current-state context.
- `docs/KNOWN_ISSUES.md`: recorded observed static/placeholder limitations.

Why:

- Future changes need a grounded baseline so layout, visual identity, static-page constraints, and fragile interactions do not drift.

Verified:

- Documentation added only; no webpage behavior, styling, layout, assets, links, or JavaScript functionality changed.
- Command checks are listed in `docs/DEV_CHECKLIST.md`.

Follow-up:

- After the next meaningful website change, update this changelog with the actual changed files and verification performed.
