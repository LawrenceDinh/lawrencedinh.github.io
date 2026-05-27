# Project Baseline

This snapshot describes the current Bashseekers static GitHub Pages demo as inspected in the working tree.

## Current pages

- `index.html`: homepage at `/bashseekers/` or `/bashseekers/index.html`.
- `media.html`: media archive at `/bashseekers/media.html`.

Both pages share `styles.css`, `script.js`, and `media-data.js`. The homepage also loads `hero-media.js`.

## Homepage sections

- Hero / intro: `#home`, video background, static poster fallback, hero slideshow card, product preview cards, and CTAs to shop/gallery/contact.
- Ticker: repeated Bashseekers style labels between hero and products.
- Shop/product area: `#products`, four static decal cards linked to BigCartel product pages.
- About: `#about`, background video with poster fallback, magazine cover panel, about copy, and YouTube/Instagram/contact CTAs.
- Media/Gallery: `#gallery`, featured media wall rendered from `GALLERY_ITEMS` with `data-gallery-scope="featured"` and `data-gallery-limit="9"`.
- Services: `#services`, three service cards, inquiry CTAs, and an expandable service proof image.
- Contact/footer: `#contact`, external contact/social CTAs, footer link back to the parent site, and back-to-top button.

## Media archive page

- Header/nav links back to homepage sections.
- Archive section renders all non-hidden `GALLERY_ITEMS` with filters for all, YouTube, Instagram, and uploads.
- Instagram feed section currently contains a static widget placeholder comment and message.
- The shared modal shell handles YouTube embeds, Instagram fallback panels, and local upload previews.

## Current JS modules

- `hero-media.js`: defines `HERO_BACKGROUND_VIDEO` and `HERO_SLIDES`.
- `media-data.js`: defines `GALLERY_ITEMS`.
- `script.js`: initializes all page behavior directly in the browser.

Key `script.js` systems:

- Mobile menu open/close on `[data-mobile-menu-toggle]`.
- Sticky-header-aware anchor scrolling via `getNavScrollOffset()`, `updateNavScrollOffset()`, and `scrollToSection()`.
- Nav scrollspy using section probes and `IntersectionObserver` when available.
- Product card hover tilt.
- Back-to-top visibility and smooth scroll.
- Services proof image expand/collapse with `data-service-proof`.
- Hero background video injection and hero slideshow/dots/swipe.
- Gallery thumbnail/action helpers, filters, card rendering, and media modal.

## Asset folders

- `hero-vid/`: decorative video backgrounds.
- `hero-slideshow/`: hero slideshow images.
- `gallery-uploads/`: local gallery upload sources, including current BigCartel gallery images.
- `gallery-thumbs/`: thumbnail location reserved for gallery media.
- `service-images/`: service proof images.

Root-level assets currently used include `56777.webp` for the nav logo and `bs.png` inside the hero poster card.

## Known interactive systems

- Hero slideshow with generated slides, dots, autoplay, and pointer swipe.
- Mobile menu.
- Navbar anchor offset and scrollspy.
- Normal browser scrolling; automatic section snapping is not active.
- Media/gallery cards and filters rendered from static data.
- YouTube modal embeds, Instagram fallback modal, and upload preview modal.
- Services proof image expand/collapse.
- Mobile background fallback that hides decorative videos and uses static images.
- Back-to-top button.

## Intentionally static

- Product cards are static HTML and link to BigCartel.
- Media data is manually registered in `media-data.js`; folders are not scanned at runtime.
- Hero media is manually registered in `hero-media.js`.
- Instagram live feed is a placeholder until a static-page-compatible embed is added.
- No build system, package manifest, backend, CMS, or client-side router is present.

## External destinations

- BigCartel shop, cart, product, and contact links use `https://bsauto.bigcartel.com/`.
- YouTube links use `https://www.youtube.com/@bashseekers` and YouTube thumbnails/embeds by video ID.
- Instagram links use `https://www.instagram.com/bashseekers/`.
- The footer links back to `../web/index.html`.
