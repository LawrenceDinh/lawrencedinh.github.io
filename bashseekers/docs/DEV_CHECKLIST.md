# Development Checklist

## Before editing

- [ ] Read `AGENTS.md` first.
- [ ] Inspect the relevant HTML/CSS/JS/data files before changing them.
- [ ] Check `git status --short` and avoid touching unrelated work.
- [ ] Keep the change minimal and scoped.
- [ ] Preserve existing selectors, IDs, data attributes, and external links unless the task requires changing them.
- [ ] Keep paths relative and GitHub Pages-safe.

## Before reporting done

- [ ] Relevant files inspected before editing.
- [ ] Change is minimal and scoped.
- [ ] Desktop checked.
- [ ] Mobile checked, if affected.
- [ ] No absolute local paths introduced.
- [ ] No unused assets, temp exports, screenshots, caches, or `node_modules` added.
- [ ] JS syntax checks run.
- [ ] `git diff --check` run.
- [ ] `docs/CHANGELOG.md` updated.
- [ ] `docs/CURRENT_STATE.md` updated if behavior/layout changed.
- [ ] `docs/ITERATION_NOTES.md` updated if this change corrected drift or established a design decision.
- [ ] Report includes changed files, verification, and unresolved concerns.

## Command checks

```powershell
node --check bashseekers/script.js
node --check bashseekers/hero-media.js
node --check bashseekers/media-data.js
git diff --check
```

## Manual checks

- [ ] Homepage loads.
- [ ] Media page loads.
- [ ] Navbar links align correctly below the sticky header.
- [ ] Scrollspy marks the right section.
- [ ] Mouse wheel scrolling is normal.
- [ ] Trackpad scrolling is normal.
- [ ] Right browser scrollbar dragging is normal.
- [ ] Scrolling does not auto-jump to adjacent sections.
- [ ] Hero slideshow works.
- [ ] Mobile hero swipe works.
- [ ] Media thumbnails fill cards without black letterboxing.
- [ ] Gallery filters and modal behavior work.
- [ ] Services expand/hide animation works both ways.
- [ ] Mobile menu works.
- [ ] No horizontal overflow on mobile.
- [ ] No console errors.
