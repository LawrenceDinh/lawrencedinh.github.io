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
  let previous;
  let next;
  let closeButton;
  let activeGallery = null;
  let returnFocus = null;
  let pausedGallery = null;
  let manualFrameInteraction = false;
  let centerFrameRequest = 0;
  let viewerResizeObserver = null;
  let dialogPointer = null;

  const isEnabled = () => mobileQuery.matches && document.documentElement.dataset.portfolioMode === 'enhanced';
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
      description: item.description || ''
    };
  };

  const centerFrame = () => {
    if (!dialog?.open || !isCurrentImageMode(activeGallery) || manualFrameInteraction) return;
    frame.scrollLeft = Math.max(0, (frame.scrollWidth - frame.clientWidth) / 2);
    frame.scrollTop = Math.max(0, (frame.scrollHeight - frame.clientHeight) / 2);
  };

  const scheduleCenterFrame = () => {
    if (centerFrameRequest) window.cancelAnimationFrame(centerFrameRequest);
    centerFrameRequest = window.requestAnimationFrame(() => {
      centerFrameRequest = window.requestAnimationFrame(() => {
        centerFrameRequest = 0;
        centerFrame();
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
          <button class="project-image-viewer__close" type="button" aria-label="Close enlarged image">&times;</button>
        </header>
        <div class="project-image-viewer__stage">
          <div class="project-image-viewer__image-frame"><img alt=""></div>
        </div>
        <footer class="project-image-viewer__caption">
          <strong id="project-image-viewer-title"></strong>
          <p id="project-image-viewer-description"></p>
        </footer>
      </div>`;
    document.body.append(dialog);
    panel = dialog.querySelector('.project-image-viewer__panel');
    frame = dialog.querySelector('.project-image-viewer__image-frame');
    image = dialog.querySelector('img');
    label = dialog.querySelector('.project-image-viewer__label');
    title = dialog.querySelector('#project-image-viewer-title');
    description = dialog.querySelector('#project-image-viewer-description');
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
    image.src = item.src;
    image.srcset = item.srcset;
    image.sizes = item.sizes;
    image.alt = item.alt;
    title.textContent = item.title;
    description.textContent = item.description;
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
      if (isEnabled()) {
        trigger.setAttribute('role', 'button');
        trigger.setAttribute('tabindex', '0');
        trigger.setAttribute('aria-label', 'Expand current project screenshot');
        expand.removeAttribute('aria-hidden');
      } else {
        trigger.removeAttribute('role');
        trigger.removeAttribute('tabindex');
        trigger.removeAttribute('aria-label');
        expand.setAttribute('aria-hidden', 'true');
      }
    };
    setA11y();
    mobileQuery.addEventListener('change', () => { setA11y(); if (!mobileQuery.matches) forceReset({ restoreFocus: false }); });
    trigger.addEventListener('pointerdown', event => { if (isEnabled()) pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false }; }, { passive: true });
    trigger.addEventListener('pointermove', event => { if (pointer && event.pointerId === pointer.id && Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 8) pointer.moved = true; }, { passive: true });
    trigger.addEventListener('pointercancel', () => { pointer = null; }, { passive: true });
    trigger.addEventListener('pointerup', event => {
      if (pointer && event.pointerId === pointer.id && !pointer.moved) open(registration, trigger);
      pointer = null;
    }, { passive: true });
    trigger.addEventListener('keydown', event => { if (isEnabled() && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); open(registration, trigger); } });
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
