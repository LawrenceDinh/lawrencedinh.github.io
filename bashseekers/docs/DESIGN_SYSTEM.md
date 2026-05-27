# Design System

Use this to keep future visual changes aligned with the current Bashseekers direction.

## Visual language

Preferred:

- Dark VHS/grunge/street-style foundation.
- White card borders, black/charcoal panels, yellow accents, red/cyan chromatic glitch shadows.
- Heavy display type for headings, condensed labels, monospace metadata, handwritten accent type.
- Scanline/static overlays as atmosphere, especially on desktop.
- Magazine/zine compositions with intentional asymmetry and editorial pacing.
- Product/media imagery that feels inspectable and physical.

Avoid:

- Generic clean corporate styling.
- Soft SaaS cards, oversized empty marketing sections, or polished gradients replacing the gritty identity.
- Removing all texture or making the page feel sterile.
- Letting overlays overpower content, especially on mobile.

## Desktop layout principles

Preferred:

- Major sections should feel standardized and deliberate in height/rhythm.
- Equal section height should not override composition; a section may be taller or shorter when the content needs it.
- Keep section panels dense enough to feel designed, with clear hierarchy and purposeful gaps.
- Gallery layouts should feel like a magazine/zine spread with varied tile sizes and planned placement.
- Service cards, inquiry CTA, and image preview should read as one coordinated services area.

Avoid:

- Random square thumbnail grids just to fill space.
- Excessive empty vertical gaps.
- Nested card-in-card surfaces unless the existing component already uses that pattern.
- Overfitting desktop rules so mobile becomes cramped or unreadable.

## Mobile layout principles

Preferred:

- Preserve readability and tap comfort before preserving desktop composition.
- Reduce distracting overlays and disable decorative video backgrounds when needed.
- Use static background fallbacks for decorative video areas.
- Keep hero poster composition visually consistent with desktop while allowing mobile-specific placement.
- Prevent horizontal overflow in nav, gallery filters, hero cards, service panels, and modals.

Avoid:

- Relying on mobile autoplay video for essential visuals.
- Letting VHS/static overlays darken or obscure text.
- Positioning hero card elements independently in a way that breaks the composition at narrow widths.
- Shrinking text until it becomes hard to read.

## Component notes

- Hero card: keep the slideshow, logo, stamp/note, stripe, and dots composed as one poster-like object.
- Hero video: decorative only; poster/static fallback must be acceptable.
- Product cards: preserve product image visibility, BigCartel links, white borders, and bold label/price treatment.
- About: keep magazine cover/copy split and the VHS background mood.
- Media cards: thumbnails should fill cards using cover-style cropping; black letterboxing is not acceptable.
- Homepage Media/Gallery: preserve the editorial spread feeling and varied card hierarchy.
- Media archive: filters should stay simple, obvious, and compatible with static `GALLERY_ITEMS`.
- Services: keep service cards + inquiry + image preview behavior.
- Services image preview: collapsed state should remain visible, focus the top of the image, and expand/hide smoothly both ways.
- Modal: preserve media viewing without breaking escape/close/fallback links.
- Nav: active states should stay high-contrast and aligned with sticky-header offsets.
