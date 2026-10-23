# Game Design portfolio

Sixteen static, crawlable GitHub Pages routes live under `/game-design/`. Directory indexes support direct navigation and refreshes, including redirects from slashless URLs. Publishing remains the repository's existing static deployment; there is no production build dependency.

## Authoring

- `content.mjs`: landing copy, evidence-grounded technical capabilities, curated project facts, card summaries, cover choices/focal positions, captions, image credits, grouped tools, and optional breakdowns.
- `assets.json`: imported image provenance, HTTP content type, decoded dimensions, original file path, SHA-256, and responsive variants. Image order follows the supplied project mappings.
- `../scripts/build-game-design.mjs`: one template for all fifteen build detail pages and the index. Reads the actual shared header from `projects.html`, footer and existing destinations from `index.html`, and the Drift Course Designer description from `projects.html`.
- `game-design.css`: all new layout/viewer rules are scoped to `.game-design-page`.
- `game-design.js`: progressive enhancement using the existing `ProjectImageViewer`; original-image links still work without JavaScript.

After content or shared-template changes:

```powershell
node scripts/build-game-design.mjs
node scripts/check-game-design.mjs
node --check game-design/content.mjs
node --check game-design/game-design.js
node --check scripts/build-game-design.mjs
node --check navigation.js
node --check project-image-viewer.js
node --check script.js
git diff --check
```

Generated HTML is checked in and deployed directly. Do not edit generated pages independently. Essential content, navigation, captions, facts and source links are in HTML, not fetched client-side.

For a local preview, serve the repository root with any static server. The review used `py -m http.server 4173 --bind 127.0.0.1`.

## Images and provenance

55 imported images for the six project pages and nine gallery-only archive builds returned successful image responses and decoded successfully. All originals are preserved locally, including visible render marks. Each has WebP variants at 480, 960 and original width (1100 pixels); no variant is upscaled. Original files load only when a viewer is opened. Only the opening Moneywars cover loads eagerly and has high fetch priority; selected-work images below the opening load lazily. Other images load lazily with stable intrinsic dimensions.

The importer (`../scripts/import-game-design.py`) accepts the supplied manifest text file and requires Pillow as an authoring-only dependency. It validates status, content type and decode, retries failures, preserves original bytes and writes provenance. Re-import only when intentionally refreshing source assets, then regenerate and review the pages. No external image hotlinks or generated artwork are used.

Cover order matches the requested curation. Autumn Wind uses view 05; this avoids cropping the render credits visible on alternative cover candidates. The detailed gallery preserves full images and includes the Dr_Bond collaboration credit throughout. Explicit render signatures in the images are credited where readable; unknown render authors are not guessed.

## Content boundaries

WorldEdit and VoxelSniper were supplied in the original request. The October 6 tools refinement adds the author-confirmed creation/server tools and the common tools selected under the author's subsequent instruction; see the provenance notes below. Project years, individual roles/contributions, dimensions, player counts, shipped status, production tools per project, outcomes and design decisions are omitted because project-specific evidence was not supplied. The archive update date and image filenames are not used as creation dates.

The optional `breakdowns` array supports up to two image/text modules with sources and a retrospective flag. It is empty at launch, so no process section appears. Author-confirmed process notes, exact responsibilities and outcomes can be added later without changing the layout. The template also gates optional contribution, role, year, decisions and outcome fields.

Vaeron, Shapescape, clients, and Dr_Bond retain their distinct relationships. Strandbeest inspiration is attributed to Theo Jansen without claiming animation or mechanical functionality. The October 22 archive comparison adds all five previously omitted builds to Selected Work.

## Shared integration

Game Design appears in desktop/mobile navigation on the homepage, Projects, Writing, article reader and Tools index. The phone menu uses root-relative links for nested routes. One image-led card reuses the homepage selected-work card, and both existing Shapescape presentations link to the portfolio. Keyboard activation of links inside experience cards is preserved.

The current site intentionally disables its Simple/Enhanced switch and forces Enhanced mode. This implementation uses that same loader and does not enable the switch. Simple mode was inspected by setting the existing mode attribute during local validation. The shared viewer is enabled for Game Design in both modes; additional collection-viewer styling and keyboard handling are page-scoped.

No publishing, commits, or production deployment are performed by the generator.

## Validation — October 6, 2026

- Static generator and integrity checks passed for all seven pages and 37 image records. Relevant JavaScript syntax checks and `git diff --check` passed. The existing repository has no typecheck/lint/package build commands.
- Chromium: all seven direct routes and reloads returned 200; slashless index/detail links redirected to directory routes. No page JavaScript errors or failed local responses were recorded by the browser suite.
- Axe WCAG 2 A/AA and 2.1 AA scans: zero reported violations on all seven desktop pages, the desktop open gallery, and mobile index, Autumn Wind and Pixelmon pages. This is an automated scan, not a claim of complete accessibility conformance.
- Visually inspected 1440×900, 1024×768 and 390×844 layouts, detail pages, galleries, mobile navigation and homepage integration. The desktop opening contains all three featured previews and captions. New pages have no horizontal overflow at these widths.
- Tested 200%-equivalent reflow at 720×450 CSS pixels. Native browser chrome zoom could not be set in the headless runner; a manual browser zoom check remains useful.
- Verified Enter activation, arrow-key image navigation, Tab containment, Escape, return focus, scroll locking/release, single-image galleries, mobile menu destinations, back navigation, homepage About/Experience/Skills/Contact destinations, Simple-mode rendering/viewer, reduced-motion mode and content with JavaScript disabled.
- Compared original committed homepage assets against the modified homepage. Both have the same pre-existing contact-sidebar overflow at 1024 px (about 49 px in the controlled comparison); it is outside this page implementation. Desktop and phone homepage layouts and the new selected-work card were visually checked.
- Screenshots and machine-readable browser results are in `output/game-design-review/` (local review artifacts, not deployment dependencies).


## Landing-page refinement — October 6, 2026

The landing page now leads with “Game Environments & Technical Level Design” and the supplied hybrid-design supporting copy. The opening uses a 60/40 OPBlocks feature and technical-capabilities panel. At 1440×900 both columns finish at approximately 885 px, including the engineering link; Selected Work begins below the viewport. Five capability descriptions connect confirmed tools, production/QA collaboration, multiplayer environments, scripting/automation, and software systems. Their source notes remain in the editable data, not the public UI.

Moneywars and Autumn Wind now lead the five-card Selected Work grid. All six project links still appear once. The compact WorldEdit/VoxelSniper row stays beneath the projects. The opening stacks at 1024 px and below; mobile order is introduction, OPBlocks, capabilities, Selected Work. The selected grid is three columns on desktop, two at intermediate widths, and one on mobile.

OPBlocks copy describes the verified commission and visible Free World/Mines entrances. Moneywars copy describes the central island, surrounding platforms and tiered landmarks. No project-specific WorldEdit/VoxelSniper usage, production-speed improvements, combat-flow rationale, visibility testing or optimization claims were added. No process breakdowns were enabled, and no additional tools were introduced.

Changed source files: `content.mjs`, `game-design.css`, `../scripts/build-game-design.mjs`, `../scripts/check-game-design.mjs`, and this guide. Generated `index.html` contains the new layout/copy/metadata. The six generated detail-page HTML files only received the shared Game Design stylesheet cache-version update; their content is byte-identical after normalizing that version. Shared navigation, homepage, gallery scripts, asset manifest, and sitemap were verified unchanged from the start of this refinement.

Validation passed: generator, static integrity checks, relevant JavaScript syntax checks, and `git diff --check`. Chromium and Axe WCAG 2/2.1 A/AA checks at 1440, 1024, 768 and 390 px reported no violations, broken local image loads, horizontal overflow, page errors or failed local responses. Verified the engineering link using Enter, keyboard order from feature to capabilities, all six direct project routes/reloads and gallery focus restoration, all four study viewers, the mobile menu, and Simple/reduced-motion rendering. The existing homepage sidebar issue was not modified.

Updated review artifacts are in `output/game-design-refinement/`: `opening-1440.png`, `landing-390.png`, plus the 1024/768 screenshots, layout and interaction result JSON, and preservation checks. No deployment was performed.

### Technical capability groups

The opening Technical Capabilities panel is now divided into **Build Tools** (WorldEdit + VoxelSniper; Environment Production) and **Server Admin** (Server & Plugin Systems; Scripting & QA). These groups use the existing Shapescape and author-confirmed tool evidence; no named server platforms, hosting providers, permission systems or backup procedures were invented. The Engineering work link remains beneath both groups.

The updated grouped data, generated markup and scoped styling passed static checks and Axe scans at 1440, 1024, 768 and 390 px with no violations or horizontal overflow. The complete desktop opening ends at approximately 872 px. Updated screenshots are in `output/game-design-capabilities/`.

## Three capability groups and expandable inventory — October 6, 2026

The landing card now contains Environment Creation, Server Administration, and Gameplay Systems, each with representative inline tools and one sentence. Scripting & QA was replaced. The OPBlocks feature, heading, project order, galleries, and shared navigation remain intact. The secondary Engineering work destination remains `/projects.html`.

`toolGroups` in `content.mjs` is the single inventory of tool IDs, names, and evidence. `technicalCapabilities[].toolIds` selects representatives from that inventory; it does not duplicate names. Invalid IDs stop generation. The three inventory categories use native `details`/`summary`; empty categories are filtered out. The full inventory appears after Selected Work at `#tools-workflow`. Its anchor uses the existing page-specific 100px scroll margin, and native scrolling respects reduced-motion preferences. Individual tool names wrap as units; the panel has no fixed height.

Author provenance:

- The author explicitly confirmed FAWE, WorldPainter, Spigot/Paper, Essentials/EssentialsX, WorldGuard, Towny, and mcMMO in response to the named-tool question.
- When asked about permissions, NPC, quest, economy, and asset tools, the author instructed: “just pull common tools from web, i have used it”. LuckPerms, Citizens, Quests, Vault, and Blockbench were selected under this broad attestation. These are not independently verified personal-history claims or project-specific attributions. No further confirmation is pending under that instruction.
- Official references establish tool functions: [LuckPerms permissions](https://luckperms.net/), [Citizens NPCs](https://www.citizensnpcs.co/), [Quests](https://github.com/PikaMug/Quests), [Blockbench](https://blockbench.net/), [EssentialsX economy features](https://essentialsx.net/), and [Vault integration](https://github.com/MilkBowl/Vault). Vault is labeled “economy integration”; it is not presented as a standalone economy.
- Server/gameplay copy describes configuration and integration of existing plugins. No custom Java code, automation, testing, performance gains, shipped features, or project-specific tool use was added.

Validation for this refinement:

- Generator and static integrity checks passed; all seven routes and 37 source image records remain valid.
- Chromium at 1440×900, 1024×768, 768×1024, and 390×844: no horizontal overflow, broken images, page errors, failed local requests, or reported Axe WCAG 2 A/AA and 2.1 AA violations.
- Keyboard Enter/Space toggles every disclosure; visible focus and the tools anchor were checked on desktop/mobile. The tools heading lands at approximately 124px/121px beneath a 72px header. Reduced-motion scrolling uses `auto`.
- All six project routes and four study galleries retain keyboard opening, Escape closing, and restored focus. Engineering, résumé, contact, mobile navigation, and Simple-mode reflow checks pass.
- Current screenshots and browser results: `output/game-design-workflows/`. Earlier validation sections above describe earlier versions of the layout.
- No deployment performed.

## Writing-based opening composition — October 6, 2026

The introduction now uses the existing `portfolio-page-hero` component with the shorter “Game Design” title, requested description and publishing alias, and the original action destinations. The game page overrides only title scale and context alignment; mobile replaces the vertical separator with a horizontal divider. The index loads the existing `writing.css` to reuse `writing-featured-heading` and `writing-featured-card__footer` directly. Writing/homepage files and shared CSS were not edited.

Featured Work & Capabilities introduces a top-aligned 60/40 grid with a 24px gap. OPBlocks retains its full image and original content; a separated “View project” footer remains within the single card link. The capabilities outer card contains a heading, three bordered inset subcards, and a separated action footer. Each subcard presents heading, description, and a quieter tools row. The existing shared type, color, surface, divider and spacing tokens are used. No fixed heights or forced matching bottoms are applied. The existing 1024px stacking breakpoint remains.

All tool data, capability claims, lower-page content, image assets and gallery behavior remain unchanged. Card heading levels follow the featured section heading. Local review artifacts for this version are in `output/game-design-composition/`.

Validation: generation/integrity, JavaScript syntax and whitespace checks passed. Chromium layouts at 1440×900, 1024×768, 768×1024 and 390×844 had no horizontal overflow, broken images, local request failures, page errors or reported Axe WCAG A/AA violations. Keyboard disclosures, tools-anchor header clearance, reduced motion, Simple mode, project and study galleries, project footer navigation, résumé/contact and engineering links passed. Preservation comparisons verified unchanged Writing/homepage/shared files, lower-page HTML and inventory, and unchanged detail content apart from the CSS cache version. No deployment performed.

## Default viewport fit — October 6, 2026

Reduced the opening header from roughly 176px to 107px at 1440px, with a smaller 40–48px title and an inline alias/action row. Tightened card/subcard padding and dividers while preserving the description and tool font sizes, and balanced the grid at 58/42. Both cards and footer actions now fit in 1440×900 (bottom ~851px), 1366×768 (~752px), and 1920×1080 (~853px). Short desktop viewports use a contained image with a viewport-relative maximum height, preserving the full credit and image. Text containers remain natural-height; mobile still scrolls and stacks normally.

The viewport validation now explicitly asserts that both complete desktop cards fit with bottom clearance. No horizontal overflow or Axe violations were reported at those desktop sizes, 1024×768 or 390×844. Generator/integrity and keyboard/link/gallery checks passed. Review images and results are in `output/game-design-viewport/`. No deployment.

## Archive coverage update — October 22, 2026

Selected Work now covers all 15 build groups listed on the [reference archive](https://bassfreerunning.weebly.com/builds.html): the six project-page builds and nine gallery-only entries. The three large selected cards and the featured slideshow order remain unchanged. Five additional compact cards include 18 locally imported images, bringing the provenance inventory to 55. Existing original files and records are preserved.

Added PokeMeadows Pixelmon Spawn (Meraki commission), Plan C2 (Team Varuna trial), Arcade Themed Hub (personal commission), Downgrade Minigame Map (Shapescape commission for Minecraft Party Zone), and Gazamo Trial Build. Plan C2 links to both its [original project page](https://www.planetminecraft.com/project/plan-c2/) and [album](https://imgur.com/a/LEpvR); the project page documents the Spirited Away inspiration and credits Joebricksy for renders and Team Varuna for the build server. These source credits are also included in the gallery. Descriptions use the archived purpose or trial context without inventing project-specific tools or results.

Import inputs, the append-only Sharp authoring runner, and review sheets are saved under `output/archive-additions/`. The runner produces a separate addition manifest; existing records are merged by slug rather than regenerated. The original Pillow importer remains for its initial supplied manifest and should not overwrite the expanded inventory.

## Individual build pages and image actions — October 22, 2026

All 15 builds have directory-based detail routes, canonical metadata, a gallery, source/credit links, and previous/next navigation through the full inventory. Card and slideshow images link to their original local images and open the shared gallery when JavaScript is available. Titles are separate links to the local build page; image links never contain title links. This also gives the nine former gallery-only entries their own pages. The index gallery payload includes every build, and the slideshow's View project action stays synchronized with the active slide's title link. The eight-card preview and See more control remain intact.


## Autumn Wind source expansion - October 23, 2026

Autumn Wind now follows its [original Planet Minecraft project](https://www.planetminecraft.com/project/autumn-wind-of-the-red-leaf-maple---/): a 2016 collaboration by BassFreerunning and Dr_Bond, drawing on Japanese architecture, ceramics, bonsai and an autumn palette. Gazamo hosted the build server. Per-image render credits follow the source gallery, and the full renderer list is retained on the detail page.

All 16 full-resolution gallery images are saved locally with original source URLs, SHA-256 hashes, dimensions and responsive WebP variants in `assets.json`. These replace the five lower-resolution Autumn Wind gallery records; old files remain on disk. The gallery inventory now contains 66 images across 15 builds. Cover 7 retains the side-view composition.

The three inline reference images (one animated view and ceramics/bonsai references) are stored separately in `autumn-wind/reference-assets.json` and displayed in Process & Inspiration. They are labeled as reference media rather than build screenshots. The 200-frame source GIF is approximately 67 MB; its original is archived locally at `output/autumn-reference/originals/process.gif`, while a 720px animated WebP loads only when selected in the reference popup. Page previews use static responsive posters. Reduced-motion users see the static poster in the popup as well. Full-resolution source links still point to the originals.

Downloads, source manifest and review sheets for this update are under `output/autumn-reference/`. No deployment performed.


### Inline animation playback

The Autumn Wind turntable now autoplays inline as a muted, looping, 640px MP4 (15 fps, 10 seconds, about 1.6 MB). A pause/play control shares the Enlarge row. The popup uses a 640px animated WebP (12 fps, about 5.3 MB). The original 67 MB GIF remains in the local archive. Reduced-motion visitors receive a static poster without loading the MP4, and can explicitly choose Play animation. The poster also remains the no-JavaScript fallback.


### Archive-only Autumn Wind view restored

The gallery also includes the pink-lit `onsen1_orig.png` render from BassFreerunning, which is absent from the PlanetMinecraft gallery. Its existing local `view-05.png` original and responsive variants are retained as gallery record `view-17`, with the archive source URL and album association. Autumn Wind now has 17 build images plus the three separate reference media. The global gallery inventory is 67 images.

Build detail heroes now cycle through every project image using the shared slideshow engine, with dots, previous/next, pause/play, and a thin progress indicator. Cover selection and popup image indices are preserved; single-image projects remain static. The image stage stays stable between slides, dots scroll within narrow screens, and reduced-motion users start paused. Validated all 15 builds at 1440px, 768px, and 390px, plus automatic playback and the landing slideshow pause/play regression.


## Final pre-deployment review - October 23, 2026

The current portfolio contains 16 routes (index plus 15 project details), 67 gallery images and three reference media. Validation covered all routes at 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920 CSS pixels: 144 layouts with no horizontal overflow, missing alt text or local development URLs. All 147 rendered image instances decoded successfully.

Automated WCAG A/AA scans reported zero violations in 32 portfolio page checks, ten shared-page regression checks and four open-gallery checks. Keyboard gallery controls, focus restoration, slideshow playback, reduced motion, mobile menus, anchors, history and no-JavaScript fallbacks passed. The shared viewer's previously documented nested-interactive finding was fixed by keeping its native enlarge button as the keyboard entry point. Homepage nameplate and email semantics were also corrected.

Static generation, integrity validation, JavaScript syntax and Git whitespace checks passed. All 70 source image URLs responded and original local file hashes matched their manifests. LinkedIn and two PlanetMinecraft destinations restrict automated HTTP requests; their responses are recorded separately from broken links. Throttled mobile lab checks measured layout shift below 0.02 on the index and Autumn Wind detail page. These automated results do not represent a complete manual accessibility audit or field performance measurement.

Review scripts, screenshots and machine-readable reports remain local under `output/final-review/` and are excluded from deployment. Production uses committed static HTML, local responsive assets and the existing root GitHub Pages configuration.
