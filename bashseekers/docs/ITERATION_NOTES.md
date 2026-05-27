# Iteration Notes

## Current design decisions

- Homepage sections should feel standardized on desktop, but not at the cost of awkward composition.
- Desktop section rhythm matters; equal height is a guide, not a reason to damage the layout.
- Media/Gallery should feel like an intentional magazine/zine spread, not a random thumbnail grid.
- Media thumbnails should fill cards with cover-style cropping; black letterboxing is not acceptable.
- Homepage Media/Gallery cards should use readable thumbnails in prominent slots, and visible yellow numbers should follow the visual reading order.
- Hero mobile swipe direction is intentionally finger-right = next and finger-left = previous.
- Services image preview should remain visible in collapsed state, focus on the top of the image, and animate both expand and hide.
- Normal browser scrolling is the preferred default.
- Navbar smooth-scroll and scrollspy remain, but natural wheel/trackpad/scrollbar movement should not be hijacked.
- Mobile may simplify effects and use static background fallbacks to keep content readable.

## Rejected directions / avoid repeating

- Do not make Media/Gallery short and purely content-driven if it breaks section rhythm.
- Do not fill Media/Gallery with random tiny square cards just to occupy height.
- Do not hide the Services image preview completely behind the expand button.
- Do not make scroll snapping trigger from generic scrollbar movement.
- Do not reintroduce automatic scroll snapping unless specifically requested and tested carefully across wheel, trackpad, scrollbar dragging, upward scrolling, mobile scrolling, modals, and swipe gestures.
- If future section navigation is desired, prefer explicit controls like nav links or a next-section button.
- Do not let mobile VHS/static overlays overpower content.
- Do not replace Bashseekers with a generic polished ecommerce look.

## Fragile areas

- Navbar anchor offset and scrollspy need to stay aligned with sticky header height.
- Hero card overlay composition can drift on mobile if poster elements are positioned independently.
- Gallery card thumbnail cropping depends on CSS background sizing and per-card layout classes.
- Services proof image collapsed/expanded states depend on matching CSS classes and `data-service-proof-toggle` text.
