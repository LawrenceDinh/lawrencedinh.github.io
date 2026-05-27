# Known Issues

Only record observed unresolved issues or concrete fragile areas here.

## Instagram feed placeholder

- `media.html` contains an Instagram feed widget placeholder.
- GitHub Pages is static, so a live Instagram feed requires a third-party script/iframe widget or manual entries in `media-data.js`.

## Manual media registration

- GitHub Pages cannot auto-scan `hero-slideshow/`, `gallery-uploads/`, or `gallery-thumbs/` at runtime.
- New hero images must be added to `HERO_SLIDES` in `hero-media.js`.
- New gallery/archive items must be added to `GALLERY_ITEMS` in `media-data.js`.

## Fragile interaction areas

- Sticky header offset, scrollspy, and anchor scrolling are tightly related.
- Hero swipe, media modals, mobile menu behavior, and service image toggling share `script.js`; keep edits targeted when touching those systems.
