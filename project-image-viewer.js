(() => {
  'use strict';

  const mobileQuery = window.matchMedia('(max-width: 760px)');
  let dialog;
  let panel;
  let frame;
  let image;
  let label;
  let title;
  let description;
  let sourceActions;
  let imageCredit;
  let previous;
  let next;
  let closeButton;
  let thumbnailStrip;
  let thumbnailSignature = null;
  let activeGallery = null;
  let returnFocus = null;
  let pausedGallery = null;
  let manualFrameInteraction = false;
  let centerFrameRequest = 0;
  let viewerResizeObserver = null;
  let dialogPointer = null;

  const isEnabled = () => document.documentElement.dataset.portfolioMode === 'enhanced' || document.body.classList.contains('game-design-page');
  const isCurrentImageMode = gallery => gallery?.mode === 'current-image';

  const normalizeItem = item => {
    if (!item) return null;
    const source = item.image instanceof HTMLImageElement ? item.image : item;
    const dataset = source.dataset || {};
    const src = source.currentSrc || source.src || dataset.src || '';
    const srcset = source.srcset || dataset.srcset || '';
    const sizes = source.sizes || dataset.sizes || '100vw';
    if (!src && !srcset) return null;
    return {
      src,
      srcset,
      sizes,
      alt: source.alt || item.alt || '',
      title: item.title || '',
      thumbnailSrc: item.thumbnailSrc || source.thumbnailSrc || '',
      description: item.description || '',
      credit: item.credit || '',
      projectUrl: item.projectUrl || '',
      sourceUrl: item.sourceUrl || '',
      reducedMotionSrc: item.reducedMotionSrc || '',
      sourceAlbum: item.sourceAlbum || ''
    };
  };

  const centerFrame = () => {
    if (!dialog?.open || !isCurrentImageMode(activeGallery) || manualFrameInteraction) return;
    frame.scrollLeft = Math.max(0, (frame.scrollWidth - frame.clientWidth) / 2);
    frame.scrollTop = Math.max(0, (frame.scrollHeight - frame.clientHeight) / 2);
  };

  const positionImageCredit = () => {
    if (!dialog?.open || imageCredit?.hidden) return;
    const stageBounds = frame.parentElement.getBoundingClientRect();
    const frameBounds = frame.getBoundingClientRect();
    const imageBounds = image.getBoundingClientRect();
    const left = Math.max(frameBounds.left, imageBounds.left);
    const right = Math.min(frameBounds.right, imageBounds.right);
    const bottom = Math.min(frameBounds.bottom, imageBounds.bottom);
    imageCredit.style.left = `${left - stageBounds.left + 8}px`;
    imageCredit.style.bottom = `${stageBounds.bottom - bottom + 8}px`;
    imageCredit.style.maxWidth = `${Math.max(0, right - left - 16)}px`;
  };

  const scheduleCenterFrame = () => {
    if (centerFrameRequest) window.cancelAnimationFrame(centerFrameRequest);
    centerFrameRequest = window.requestAnimationFrame(() => {
      centerFrameRequest = window.requestAnimationFrame(() => {
        centerFrameRequest = 0;
        centerFrame();
        positionImageCredit();
      });
    });
  };

  const clearOpenState = ({ restoreFocus = true } = {}) => {
    if (centerFrameRequest) window.cancelAnimationFrame(centerFrameRequest);
    centerFrameRequest = 0;
    document.documentElement.classList.remove('project-image-viewer-open');
    const focusTarget = returnFocus;
    const galleryToResume = pausedGallery;
    activeGallery = null;
    pausedGallery = null;
    returnFocus = null;
    dialogPointer = null;
    manualFrameInteraction = false;
    frame?.scrollTo({ left: 0, top: 0, behavior: 'auto' });
    if (galleryToResume?.resume) galleryToResume.resume();
    if (restoreFocus && focusTarget?.isConnected) focusTarget.focus({ preventScroll: true });
  };

  const forceReset = ({ restoreFocus = true } = {}) => {
    try {
      if (dialog?.open) dialog.close();
    } catch (error) {
      console.warn('Unable to close project image viewer:', error);
    }
    clearOpenState({ restoreFocus });
  };

  const removeCollectionNavigation = () => {
    previous?.remove();
    next?.remove();
    previous = null;
    next = null;
  };

  const navigate = direction => {
    if (!activeGallery || isCurrentImageMode(activeGallery) || !activeGallery.goTo) return;
    const { items, index } = resolveCurrent(activeGallery);
    activeGallery.goTo((index + direction + items.length) % items.length);
    window.setTimeout(() => {
      try { render(); } catch (error) { console.error('Unable to render project image viewer:', error); forceReset(); }
    }, 320);
  };

  const ensureCollectionNavigation = () => {
    if (previous && next) return;
    previous = document.createElement('button');
    previous.className = 'project-image-viewer__previous';
    previous.type = 'button';
    previous.setAttribute('aria-label', 'Show previous screenshot');
    previous.textContent = '←';
    next = document.createElement('button');
    next.className = 'project-image-viewer__next';
    next.type = 'button';
    next.setAttribute('aria-label', 'Show next screenshot');
    next.textContent = '→';
    frame.before(previous);
    frame.after(next);
    previous.addEventListener('click', () => navigate(-1));
    next.addEventListener('click', () => navigate(1));
  };

  const ensureDialog = () => {
    if (dialog) return;
    dialog = document.createElement('dialog');
    dialog.className = 'project-image-viewer';
    dialog.setAttribute('aria-labelledby', 'project-image-viewer-title');
    dialog.setAttribute('aria-describedby', 'project-image-viewer-description');
    dialog.innerHTML = `
      <div class="project-image-viewer__panel">
        <header class="project-image-viewer__header">
          <span class="project-image-viewer__label">Image Detail</span>
          <nav class="project-image-viewer__source-actions" aria-label="Project and image links" hidden></nav>
          <button class="project-image-viewer__close" type="button" aria-label="Close enlarged image">&times;</button>
        </header>
        <div class="project-image-viewer__stage">
          <div class="project-image-viewer__image-frame"><img alt=""></div>
          <small class="project-image-viewer__credit" hidden></small>
        </div>
        <nav class="project-image-viewer__thumbnails" aria-label="Choose a gallery image" hidden></nav>
        <footer class="project-image-viewer__caption">
          <strong id="project-image-viewer-title"></strong>
          <p id="project-image-viewer-description"></p>
        </footer>
      </div>`;
    document.body.append(dialog);
    panel = dialog.querySelector('.project-image-viewer__panel');
    thumbnailStrip = dialog.querySelector('.project-image-viewer__thumbnails');
    frame = dialog.querySelector('.project-image-viewer__image-frame');
    image = dialog.querySelector('img');
    label = dialog.querySelector('.project-image-viewer__label');
    title = dialog.querySelector('#project-image-viewer-title');
    description = dialog.querySelector('#project-image-viewer-description');
    sourceActions = dialog.querySelector('.project-image-viewer__source-actions');
    imageCredit = dialog.querySelector('.project-image-viewer__credit');
    closeButton = dialog.querySelector('.project-image-viewer__close');
    closeButton.addEventListener('click', () => forceReset());
    dialog.addEventListener('cancel', event => { event.preventDefault(); forceReset(); });
    dialog.addEventListener('click', event => {
      if (!isCurrentImageMode(activeGallery) && event.target === dialog) forceReset();
    });
    dialog.addEventListener('pointerdown', event => {
      if (!isCurrentImageMode(activeGallery)) return;
      const rect = panel.getBoundingClientRect();
      dialogPointer = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        startedOutside: event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom,
        moved: false
      };
    }, { passive: true });
    dialog.addEventListener('pointermove', event => {
      if (dialogPointer?.id === event.pointerId && Math.hypot(event.clientX - dialogPointer.x, event.clientY - dialogPointer.y) > 5) dialogPointer.moved = true;
    }, { passive: true });
    dialog.addEventListener('pointerup', event => {
      if (dialogPointer?.id !== event.pointerId) return;
      const pointer = dialogPointer;
      dialogPointer = null;
      if (!isCurrentImageMode(activeGallery) || !pointer.startedOutside || pointer.moved) return;
      const rect = panel.getBoundingClientRect();
      const endedOutside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
      if (endedOutside) forceReset();
    }, { passive: true });
    dialog.addEventListener('pointercancel', () => { dialogPointer = null; }, { passive: true });
    dialog.addEventListener('close', () => clearOpenState());
    image.addEventListener('load', scheduleCenterFrame);
    frame.addEventListener('pointerdown', () => { manualFrameInteraction = true; }, { passive: true });
    frame.addEventListener('touchstart', () => { manualFrameInteraction = true; }, { passive: true });
    frame.addEventListener('wheel', () => { manualFrameInteraction = true; }, { passive: true });
    if (typeof ResizeObserver === 'function') {
      viewerResizeObserver = new ResizeObserver(() => scheduleCenterFrame());
      viewerResizeObserver.observe(panel);
      viewerResizeObserver.observe(image);
    }
  };

  const resolveCurrent = gallery => {
    if (isCurrentImageMode(gallery)) {
      const item = normalizeItem(gallery?.item?.());
      if (!item) throw new Error('Project image viewer has no usable image source.');
      return { items: [item], index: 0, item };
    }
    const items = gallery?.items?.() || [];
    const index = Math.max(0, Math.min(gallery?.index?.() ?? 0, items.length - 1));
    const item = normalizeItem(items[index]);
    if (!item) throw new Error('Project image viewer has no usable image source.');
    return { items, index, item };
  };

  const renderThumbnails = (items, index) => {
    const enabled = activeGallery?.showThumbnails && items.length > 1 && !isCurrentImageMode(activeGallery);
    thumbnailStrip.hidden = !enabled;
    dialog.dataset.hasThumbnails = String(Boolean(enabled));
    if (!enabled) return;
    const normalized = items.map(normalizeItem);
    const signature = normalized.map(item => item.src).join('|');
    if (signature !== thumbnailSignature) {
      thumbnailSignature = signature;
      thumbnailStrip.replaceChildren(...normalized.map((item, targetIndex) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'project-image-viewer__thumbnail';
        button.setAttribute('aria-label', `Show image ${targetIndex + 1}: ${item.alt || item.title}`);
        const thumbnail = document.createElement('img');
        thumbnail.src = item.thumbnailSrc || item.src;
        thumbnail.alt = '';
        thumbnail.decoding = 'async';
        button.append(thumbnail);
        const select = nextIndex => {
          activeGallery.goTo(nextIndex);
          render();
        };
        button.addEventListener('click', () => select(targetIndex));
        button.addEventListener('keydown', event => {
          let target;
          if (event.key === 'ArrowRight') target = (targetIndex + 1) % items.length;
          else if (event.key === 'ArrowLeft') target = (targetIndex - 1 + items.length) % items.length;
          else if (event.key === 'Home') target = 0;
          else if (event.key === 'End') target = items.length - 1;
          else return;
          event.preventDefault();
          event.stopPropagation();
          select(target);
          thumbnailStrip.children[target].focus({ preventScroll: true });
        });
        return button;
      }));
    }
    [...thumbnailStrip.children].forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    const selected = thumbnailStrip.children[index];
    const start = selected.offsetLeft - thumbnailStrip.offsetLeft;
    const end = start + selected.offsetWidth;
    if (start < thumbnailStrip.scrollLeft) thumbnailStrip.scrollLeft = start;
    else if (end > thumbnailStrip.scrollLeft + thumbnailStrip.clientWidth) thumbnailStrip.scrollLeft = end - thumbnailStrip.clientWidth;
  };

  const render = () => {
    const { items, index, item } = resolveCurrent(activeGallery);
    const currentImage = isCurrentImageMode(activeGallery);
    dialog.dataset.viewerMode = currentImage ? 'current-image' : 'collection';
    if (currentImage) {
      removeCollectionNavigation();
      label.textContent = 'Image Detail';
      manualFrameInteraction = false;
    } else {
      ensureCollectionNavigation();
      label.textContent = `FEATURE ${String(index + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
      previous.hidden = next.hidden = items.length < 2;
    }
    renderThumbnails(items, index);
    image.src = item.reducedMotionSrc && matchMedia('(prefers-reduced-motion: reduce)').matches ? item.reducedMotionSrc : item.src;
    image.srcset = item.srcset;
    image.sizes = item.sizes;
    image.alt = item.alt;
    title.textContent = item.title;
    description.textContent = item.description;
    imageCredit.textContent = item.credit;
    imageCredit.hidden = !item.credit;
    sourceActions.replaceChildren();
    for (const [href, text, kind] of [
      [item.projectUrl, 'Project details', 'project'],
      [item.sourceUrl, 'Full resolution', 'image'],
      [item.sourceAlbum, 'Source album', 'album']
    ]) {
      if (!href) continue;
      let destination;
      try { destination = new URL(href, document.baseURI); } catch { continue; }
      if (!['https:', 'http:'].includes(destination.protocol)) continue;
      const link = document.createElement('a');
      link.className = 'project-image-viewer__source-link';
      link.dataset.imageSource = kind;
      link.href = destination.href;
      if (kind !== 'project') {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      link.setAttribute('aria-label', kind === 'project' ? text : `${text} (opens in a new tab)`);
      const fullLabel = document.createElement('span');
      fullLabel.className = 'project-image-viewer__source-label';
      fullLabel.textContent = text;
      const compactLabel = document.createElement('span');
      compactLabel.className = 'project-image-viewer__source-label--compact';
      compactLabel.setAttribute('aria-hidden', 'true');
      compactLabel.textContent = kind === 'project' ? 'Details' : kind === 'image' ? 'Original' : 'Album';
      link.append(fullLabel, compactLabel, document.createTextNode(' \u2197'));
      sourceActions.append(link);
    }
    sourceActions.hidden = !sourceActions.childElementCount;
    scheduleCenterFrame();
  };

  const open = (gallery, opener) => {
    if (!isEnabled() || dialog?.open) return;
    try {
      ensureDialog();
      activeGallery = gallery;
      returnFocus = opener;
      render();
      dialog.showModal();
      const current = resolveCurrent(activeGallery);
      renderThumbnails(current.items, current.index);
      document.documentElement.classList.add('project-image-viewer-open');
      if (gallery.pause) {
        gallery.pause();
        pausedGallery = gallery;
      }
      closeButton.focus({ preventScroll: true });
      scheduleCenterFrame();
    } catch (error) {
      console.error('Unable to open project image viewer:', error);
      forceReset();
    }
  };

  const register = gallery => {
    const trigger = gallery?.trigger;
    if (!trigger || trigger.dataset.projectImageViewerBound === 'true') return;
    trigger.dataset.projectImageViewerBound = 'true';
    const registration = { ...gallery, mode: gallery.mode === 'current-image' ? 'current-image' : 'collection' };
    let pointer = null;
    const expand = document.createElement('button');
    expand.type = 'button';
    expand.className = 'project-image-viewer__expand';
    expand.setAttribute('aria-label', 'Expand current project screenshot');
    expand.setAttribute('aria-hidden', 'true');
    expand.innerHTML = '&#10530;';
    trigger.append(expand);
    expand.addEventListener('pointerdown', event => event.stopPropagation());
    expand.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); open(registration, expand); });
    const setA11y = () => {
      // The dedicated native button provides keyboard access without nesting
      // carousel controls inside a second interactive container.
      const enabled = isEnabled();
      expand.hidden = !enabled;
      expand.disabled = !enabled;
      if (enabled) expand.removeAttribute('aria-hidden');
      else expand.setAttribute('aria-hidden', 'true');
    };
    setA11y();
    mobileQuery.addEventListener('change', () => { setA11y(); });
    trigger.addEventListener('pointerdown', event => { if (isEnabled()) pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false }; }, { passive: true });
    trigger.addEventListener('pointermove', event => { if (pointer && event.pointerId === pointer.id && Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 8) pointer.moved = true; }, { passive: true });
    trigger.addEventListener('pointercancel', () => { pointer = null; }, { passive: true });
    trigger.addEventListener('pointerup', event => {
      const control = event.target.closest('button, a, input, select, textarea');
      if (pointer && event.pointerId === pointer.id && !pointer.moved && !control) open(registration, expand);
      pointer = null;
    }, { passive: true });
  };

  window.ProjectImageViewer = {
    register,
    open,
    refresh: () => { try { if (activeGallery) render(); } catch (error) { console.error('Unable to refresh project image viewer:', error); forceReset(); } },
    close: forceReset
  };
  new MutationObserver(() => { if (!isEnabled()) forceReset({ restoreFocus: false }); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-portfolio-mode'] });
  window.addEventListener('orientationchange', scheduleCenterFrame);
  window.addEventListener('pagehide', () => forceReset({ restoreFocus: false }));
  if (document.documentElement.classList.contains('project-image-viewer-open')) forceReset({ restoreFocus: false });
})();
