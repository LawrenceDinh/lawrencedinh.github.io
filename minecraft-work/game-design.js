/* Progressive enhancement: every thumbnail remains a link to its local original. */
(() => {
  'use strict';
  if (document.body.classList.contains('portfolio-index-page') && document.documentElement.dataset.portfolioMode === 'enhanced') {
    window.PortfolioEntrance?.([
      [document.querySelector('.gd-card--lead'), document.querySelector('.gd-capabilities')],
      [...document.querySelectorAll('#selected .gd-section-heading, .gd-selected .gd-card, .gd-selected-compact article')],
      [document.querySelector('#tools-workflow')],
      [...document.querySelectorAll('.gd-section:has(.gd-related) > .gd-section-heading, .gd-related')],
      [document.querySelector('.gd-contact')]
    ]);
  }
  document.querySelectorAll('.gd-card--lead, .gd-detail-slideshow').forEach(carousel => {
    const slides = [...carousel.querySelectorAll('[data-feature-slide]')];
    const controls = carousel.querySelector('.gd-slideshow-controls');
    if (slides.length > 1 && controls) {
      const motion = matchMedia('(prefers-reduced-motion: reduce)');
      const pause = controls.querySelector('[data-feature-pause]');
      const count = controls.querySelector('[data-feature-count]');
      const status = carousel.querySelector('[data-feature-status]');
      const progress = carousel.querySelector('[data-feature-progress]');
      const dots = [...carousel.querySelectorAll('[data-feature-dot]')];
      const dotNav = carousel.querySelector('.gd-feature-dots');
      const duration = 6500;
      let index = Number(carousel.dataset.startIndex || 0), paused = motion.matches, playThroughFocus = false, timer, elapsed = 0, lastFrame = null;
      const sync = () => {
        cancelAnimationFrame(timer);
        lastFrame = null;
        pause.textContent = paused ? '\u25b6' : '\u23f8';
        const pauseLabel = paused ? 'Play slideshow' : 'Pause slideshow';
        pause.setAttribute('aria-label', pauseLabel);
        pause.title = pauseLabel;
        if (!paused && !document.hidden && (playThroughFocus || !carousel.matches(':focus-within'))) {
          timer = requestAnimationFrame(tick);
        }
      };
      const show = (next, announce = false) => {
        index = (next + slides.length) % slides.length;
        elapsed = 0;
        if (progress) progress.style.transform = 'scaleX(0)';
        slides.forEach((slide, i) => {
          slide.inert = i !== index;
          if (i === index) slide.removeAttribute('aria-hidden');
          else slide.setAttribute('aria-hidden', 'true');
        });
        count.textContent = `${index + 1} / ${slides.length}`;
        const projectLink = carousel.querySelector('[data-feature-project]');
        if (projectLink) projectLink.href = slides[index].querySelector('.gd-build-title-link').getAttribute('href');
        dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === index)));
        if (announce) status.textContent = `${slides[index].querySelector('h3')?.textContent.trim() || slides[index].querySelector('img').alt}, ${count.textContent}`;
        if (carousel.classList.contains('gd-detail-slideshow')) {
          carousel.querySelector('[data-detail-caption]').textContent = slides[index].querySelector('figcaption').textContent.trim();
          const activeDot = dots[index];
          if (activeDot) dotNav.scrollLeft = activeDot.offsetLeft - dotNav.offsetLeft - (dotNav.clientWidth - activeDot.offsetWidth) / 2;
        }
      };
      const tick = now => {
        if (lastFrame !== null) elapsed += now - lastFrame;
        lastFrame = now;
        if (elapsed >= duration) show(index + 1);
        if (progress) progress.style.transform = `scaleX(${elapsed / duration})`;
        timer = requestAnimationFrame(tick);
      };
      if (progress) progress.parentElement.hidden = false;
      controls.hidden = false;
      if (dotNav) dotNav.hidden = false;
      dots.forEach((dot, i) => dot.addEventListener('click', () => {
        paused = true;
        show(i, true);
        sync();
      }));
      dotNav?.addEventListener('keydown', event => {
        const current = dots.indexOf(document.activeElement);
        if (current < 0) return;
        let target;
        if (event.key === 'ArrowRight') target = (current + 1) % dots.length;
        else if (event.key === 'ArrowLeft') target = (current - 1 + dots.length) % dots.length;
        else if (event.key === 'Home') target = 0;
        else if (event.key === 'End') target = dots.length - 1;
        else return;
        event.preventDefault();
        dots[target].focus();
        dots[target].click();
      });
      for (const [selector, step] of [['[data-feature-prev]', -1], ['[data-feature-next]', 1]]) {
        controls.querySelector(selector).addEventListener('click', () => {
          paused = true;
          show(index + step, true);
          sync();
        });
      }
      pause.addEventListener('click', () => {
        paused = !paused;
        // An explicit Play request takes precedence over retained keyboard focus.
        playThroughFocus = !paused;
        sync();
      });
      carousel.addEventListener('focusin', event => {
        // Focusing the toggle must not change the state before its click handler runs.
        if (event.target !== pause) { paused = true; playThroughFocus = false; }
        sync();
      });
      carousel.addEventListener('focusout', () => setTimeout(sync, 0));
      document.addEventListener('visibilitychange', sync);
      motion.addEventListener('change', () => { if (motion.matches) paused = true; sync(); });
      show(index);
      sync();
    }
  });
  const iconButtons = document.querySelectorAll('[data-capability-preview]');
  if (iconButtons.length && typeof HTMLDialogElement !== 'undefined') {
    const preview = document.createElement('dialog');
    preview.className = 'gd-icon-preview';
    preview.setAttribute('aria-labelledby', 'gd-icon-preview-title');
    preview.innerHTML = '<div class="gd-icon-preview-header"><h2 id="gd-icon-preview-title"></h2><button type="button" aria-label="Close icon preview">&#215;</button></div><div class="gd-icon-preview-stage" aria-hidden="true"></div>';
    document.body.append(preview);
    const title = preview.querySelector('h2');
    const stage = preview.querySelector('.gd-icon-preview-stage');
    const close = preview.querySelector('button');
    let trigger;
    close.addEventListener('click', () => preview.close());
    preview.addEventListener('keydown', event => {
      if (event.key === 'Tab') { event.preventDefault(); close.focus(); }
    });
    preview.addEventListener('click', event => {
      const bounds = preview.getBoundingClientRect();
      if (event.target === preview && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) preview.close();
    });
    preview.addEventListener('close', () => {
      document.body.classList.remove('gd-icon-preview-open');
      trigger?.focus();
    });
    iconButtons.forEach(button => button.addEventListener('click', () => {
      trigger = button;
      title.textContent = button.closest('.gd-capability-heading').querySelector('h4').textContent;
      stage.replaceChildren(button.querySelector('img, svg').cloneNode(true));
      document.body.classList.add('gd-icon-preview-open');
      preview.showModal();
      close.focus();
    }));
  }
  document.querySelectorAll('[data-open-nav-contact]').forEach(link => {
    const desktop = document.querySelector('.nav-contact-disclosure .nav-contact-btn');
    const mobile = document.querySelector('.drawer-contact');
    const panel = document.getElementById('navContactPanel');
    if (!desktop || !mobile || !panel) return;
    const update = () => link.setAttribute('aria-expanded', String(!panel.hidden));
    new MutationObserver(update).observe(panel, { attributes: true, attributeFilter: ['hidden'] });
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || document.documentElement.dataset.portfolioMode !== 'enhanced') return;
      event.preventDefault();
      event.stopPropagation();
      const isMobile = matchMedia('(max-width: 900px)').matches;
      if (isMobile) window.PortfolioNavigation?.setDrawerOpen(true);
      const trigger = isMobile ? mobile : desktop;
      trigger.click();
      [...panel.querySelectorAll('button, a[href]')].find(control => control.getClientRects().length)?.focus();
      update();
    });
  });
  document.querySelectorAll('[data-scroll-tools]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const target = document.getElementById('tools-workflow');
      if (!target) return;
      event.preventDefault();
      if (location.hash !== '#tools-workflow') history.pushState(null, '', '#tools-workflow');
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    });
  });
  const workPreview = document.querySelector('[data-work-preview]');
  const workToggle = document.querySelector('[data-work-toggle]');
  if (workPreview && workToggle) {
    const cards = [...workPreview.querySelectorAll('.gd-selected-compact > article')];
    if (cards.length > 8) {
      const setExpanded = expanded => {
        cards.forEach((card, index) => { card.hidden = !expanded && index >= 8; });
        workPreview.dataset.collapsed = String(!expanded);
        workToggle.setAttribute('aria-expanded', String(expanded));
        workToggle.querySelector('[data-work-toggle-label]').textContent = expanded ? 'Show fewer builds' : 'See more builds';
      };
      setExpanded(false);
      workToggle.hidden = false;
      workToggle.addEventListener('click', () => {
        const expanded = workToggle.getAttribute('aria-expanded') !== 'true';
        const startHeight = workPreview.getBoundingClientRect().height;
        setExpanded(expanded);
        const endHeight = workPreview.getBoundingClientRect().height;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
          return;
        }
        // Keep outgoing cards in place while the viewport clips the closing rows.
        if (!expanded) cards.slice(8).forEach(card => { card.hidden = false; card.inert = true; });
        workToggle.disabled = true;
        workPreview.style.overflow = 'clip';
        const animation = workPreview.animate(
          [{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
          { duration: 420, easing: 'cubic-bezier(.2,.75,.25,1)' }
        );
        animation.finished.then(() => {
          setExpanded(expanded);
          cards.slice(8).forEach(card => { card.inert = false; });
          workPreview.style.overflow = '';
          workToggle.disabled = false;
        });
      });
    }
  }
  // Compact cards share one size and aligned text tracks across the grid.
  const workGrids = [...document.querySelectorAll('.gd-selected-compact')];
  const layoutWorkCards = () => {
    for (const grid of workGrids) {
      const cards = [...grid.querySelectorAll(':scope > .gd-work-card')];
      const hidden = cards.filter(card => card.hidden);
      grid.classList.remove('gd-work-grid');
      hidden.forEach(card => { card.hidden = false; });
      const rows = new Map();
      const compact = grid.classList.contains('gd-selected-compact');
      for (const card of cards) {
        const bounds = card.getBoundingClientRect();
        const title = card.querySelector('h3');
        const metadata = card.querySelector('.gd-work-metadata');
        const entries = [...metadata.children];
        const rowKey = compact ? 0 : card.offsetTop;
        const row = rows.get(rowKey) || [];
        row.push({card, height:bounds.height,
          title:Math.max(title.getBoundingClientRect().height, 2 * parseFloat(getComputedStyle(title).lineHeight)),
          meta:Math.max(0, entries.reduce((sum, entry) => sum + entry.getBoundingClientRect().height, 0) + Math.max(0, entries.length - 1) * 4)});
        rows.set(rowKey, row);
      }
      for (const row of rows.values()) {
        const titleHeight = Math.max(...row.map(item => item.title));
        const metaHeight = Math.max(...row.map(item => item.meta));
        // Budget the final aligned layout, not the shorter unaligned measurement.
        // Otherwise reserving title/metadata tracks consumes the description space.
        const compactHeight = Math.max(...row.map(({card, height}) => {
          const imageHeight = card.querySelector('.gd-study-link').getBoundingClientRect().height;
          const lineHeight = parseFloat(getComputedStyle(card.querySelector('.gd-work-description')).lineHeight);
          return Math.max(height, imageHeight + titleHeight + metaHeight + 3 * lineHeight + 41);
        }));
        for (const {card, height} of row) {
          card.style.setProperty('--gd-work-height', `${compact ? compactHeight : height}px`);
          card.style.setProperty('--gd-title-height', `${titleHeight}px`);
          card.style.setProperty('--gd-meta-height', `${metaHeight}px`);
        }
      }
      cards.forEach(card => card.classList.remove('gd-work-tight'));
      grid.classList.add('gd-work-grid');
      for (const row of rows.values()) {
        const tight = row.some(({card}) => {
          const description = card.querySelector('.gd-work-description');
          const tracks = getComputedStyle(card.querySelector('.gd-work-copy')).gridTemplateRows.split(' ').map(parseFloat);
          const style = getComputedStyle(description);
          return tracks[2] - parseFloat(style.marginTop) < parseFloat(style.lineHeight);
        });
        if (tight) row.forEach(({card}) => card.classList.add('gd-work-tight'));
      }
      for (const card of cards) {
        const copy = card.querySelector('.gd-work-copy');
        const description = card.querySelector('.gd-work-description');
        const tracks = getComputedStyle(copy).gridTemplateRows.split(' ').map(parseFloat);
        const lineHeight = parseFloat(getComputedStyle(description).lineHeight);
        const available = tracks[2] - parseFloat(getComputedStyle(description).marginTop);
        const lines = Math.max(1, Math.floor((available + 0.5) / lineHeight));
        description.style.setProperty('--gd-description-lines', lines);
        description.toggleAttribute('data-overflow', description.scrollHeight > description.clientHeight + 1);
      }
      hidden.forEach(card => { card.hidden = true; });
    }
  };
  if (workGrids.length) {
    layoutWorkCards();
    document.fonts.ready.then(layoutWorkCards);
    workToggle?.addEventListener('click', layoutWorkCards);
    let frame;
    const widths = new WeakMap();
    const observer = new ResizeObserver(entries => {
      let changed = false;
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (widths.get(entry.target) === width) continue;
        widths.set(entry.target, width);
        changed = true;
      }
      if (!changed) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(layoutWorkCards);
    });
    workGrids.forEach(grid => observer.observe(grid));
  }
  document.querySelectorAll('[data-build-animation]').forEach(video => {
    const preview = video.closest('.gd-process-preview');
    const poster = preview.querySelector('[data-animation-poster]');
    const toggle = preview.querySelector('[data-animation-toggle]');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => { toggle.textContent = video.paused ? 'Play animation' : 'Pause animation'; };
    const play = () => {
      if (!video.getAttribute('src')) video.src = video.dataset.videoSrc;
      video.muted = true;
      video.autoplay = true;
      video.hidden = false;
      poster.hidden = true;
      video.play().catch(sync);
    };
    const applyMotionPreference = () => {
      if (motion.matches) {
        video.pause();
        video.hidden = true;
        poster.hidden = false;
      } else play();
      sync();
    };
    toggle.hidden = false;
    toggle.addEventListener('click', () => { if (video.paused) play(); else video.pause(); });
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    motion.addEventListener('change', applyMotionPreference);
    applyMotionPreference();
  });
  const node = document.getElementById('game-galleries');
  if (!node || !window.ProjectImageViewer) return;
  const galleries = JSON.parse(node.textContent);
  // Keep collection controls keyboard-accessible and focus within the native dialog.
  document.addEventListener('keydown', event => {
    const dialog = document.querySelector('.project-image-viewer[open]');
    if (!dialog) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      const control = dialog.querySelector(event.key === 'ArrowLeft' ? '.project-image-viewer__previous' : '.project-image-viewer__next');
      if (control && !control.hidden) { event.preventDefault(); control.click(); }
    }
    if (event.key === 'Tab') {
      const controls = Array.from(dialog.querySelectorAll('button:not([hidden]), a[href]')).filter(el => el.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  document.querySelectorAll('[data-gallery]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const items = galleries[link.dataset.gallery];
      if (!items?.length) return;
      event.preventDefault();
      let current = Number(link.dataset.imageIndex) || 0;
      window.ProjectImageViewer.open({
        mode: items.length === 1 ? 'current-image' : 'collection',
        showThumbnails: true,
        item: () => items[current],
        items: () => items,
        index: () => current,
        goTo: index => { current = index; }
      }, link);
    });
  });
})();
