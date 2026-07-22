(() => {
  'use strict';

  const interactiveSelector = "button, a, input, select, textarea, [role='tab'], [data-own-interaction]";
  const transitionClasses = ['is-transitioning-next', 'is-transitioning-previous', 'is-snapping-back'];

  // Shared compact-dot presentation for responsive carousels. The buttons keep
  // their full touch target; CSS controls the small visible indicator.
  window.syncCompactCarouselDots = function syncCompactCarouselDots(options) {
    const container = options?.container;
    const dots = Array.from(options?.dots || []);
    const enabled = Boolean(options?.enabled);
    if (!container || !dots.length) return;

    const state = container._compactCarouselDotState || (container._compactCarouselDotState = {
      tabindex: new Map(dots.map(dot => [dot, dot.getAttribute('tabindex')]))
    });
    const ellipsisClass = options.ellipsisClass || 'mobile-feature-carousel__ellipsis';
    Array.from(container.querySelectorAll(`.${ellipsisClass}`)).forEach(node => node.remove());

    dots.forEach(dot => {
      dot.hidden = false;
      dot.style.order = '';
      dot.removeAttribute('aria-hidden');
      const originalTabindex = state.tabindex.get(dot);
      if (originalTabindex === null || originalTabindex === undefined) dot.removeAttribute('tabindex');
      else dot.setAttribute('tabindex', originalTabindex);
    });
    if (!enabled) return;

    const activeIndex = Math.max(0, Math.min(Number(options.activeIndex) || 0, dots.length - 1));
    const unit = Number(options.unit) || 28;
    const measuredWidth = container.getBoundingClientRect().width || container.parentElement?.getBoundingClientRect().width || 0;
    const minCapacity = Number(options.minCapacity) || 3;
    const maxCapacity = Number(options.maxCapacity) || dots.length;
    const capacity = Math.max(minCapacity, Math.min(dots.length, maxCapacity, Math.floor(Math.max(unit * minCapacity, measuredWidth - 4) / unit)));
    let visibleIndexes;
    if (dots.length <= capacity) {
      visibleIndexes = dots.map((_, index) => index);
    } else if (options.preserveEnds) {
      const middle = Math.max(1, capacity - 2);
      const start = Math.max(1, Math.min(activeIndex - Math.floor(middle / 2), dots.length - 1 - middle));
      visibleIndexes = [0];
      for (let index = start; index < start + middle; index += 1) visibleIndexes.push(index);
      visibleIndexes.push(dots.length - 1);
    } else {
      const half = Math.floor(capacity / 2);
      const start = Math.max(0, Math.min(activeIndex - half, dots.length - capacity));
      visibleIndexes = Array.from({ length: capacity }, (_, offset) => start + offset);
    }
    const visible = new Set(visibleIndexes);
    dots.forEach((dot, index) => {
      dot.style.order = String(index * 2 + 1);
      if (!visible.has(index)) {
        dot.hidden = true;
        dot.setAttribute('aria-hidden', 'true');
        dot.setAttribute('tabindex', '-1');
      }
    });
    const firstVisible = visibleIndexes[0];
    const lastVisible = visibleIndexes[visibleIndexes.length - 1];
    [[firstVisible > 0, firstVisible * 2 - 1], [lastVisible < dots.length - 1, lastVisible * 2 + 2]].forEach(([needed, order]) => {
      if (!needed) return;
      const ellipsis = document.createElement('span');
      ellipsis.className = ellipsisClass;
      ellipsis.setAttribute('aria-hidden', 'true');
      ellipsis.style.order = String(order);
      ellipsis.textContent = '…';
      container.append(ellipsis);
    });
  };

  window.createCarouselInteraction = function createCarouselInteraction(options) {
    const root = options.root;
    const viewport = options.viewport;
    const track = options.track;
    const count = Number(options.count) || 0;
    if (!root || !viewport || !track || count < 2 || root.dataset.carouselInteractionReady === 'true') return null;

    root.dataset.carouselInteractionReady = 'true';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pauseButton = options.pauseButton || null;
    const progress = options.progress || null;
    const initialDelay = options.initialDelay || 4000;
    const interval = options.interval || 7000;
    const manualDelay = options.manualDelay || 10000;
    const transitionDuration = options.transitionDuration || 420;
    const snapDuration = options.snapDuration || 230;
    const visibilityThreshold = options.visibilityThreshold || 0.55;
    const listeners = [];
    let timer = 0;
    let motionTimer = 0;
    let motionResolve = null;
    let dueAt = 0;
    let remaining = initialDelay;
    let progressAnimation = null;
    let holdUntil = 0;
    let userPaused = false;
    let hovered = false;
    let focused = false;
    let inViewport = typeof window.IntersectionObserver !== 'function';
    let destroyed = false;
    let pointer = null;
    let dragFrame = 0;
    let pendingOffset = 0;
    let intersectionObserver = null;
    let hasScheduled = false;
    let transitioning = false;
    let generation = 0;
    let queuedNavigation = null;

    function listen(target, type, handler, settings) {
      target.addEventListener(type, handler, settings);
      listeners.push(() => target.removeEventListener(type, handler, settings));
    }

    function normalizeIndex(index) {
      return (Number(index) + count) % count;
    }

    function getViewportWidth() {
      const currentCard = track.children[1];
      const cardWidth = currentCard && currentCard.getBoundingClientRect().width;
      return Math.max(1, cardWidth || viewport.clientWidth);
    }

    function setOffset(offset) {
      pendingOffset = offset;
      root.style.setProperty('--carousel-track-offset', `${offset}px`);
      const width = getViewportWidth();
      root.style.setProperty('--carousel-drag-progress', String(Math.min(1, Math.abs(offset) / width)));
      if (offset) root.dataset.carouselDragDirection = offset < 0 ? 'next' : 'previous';
      else delete root.dataset.carouselDragDirection;
    }

    function clearTransitionClasses() {
      transitionClasses.forEach(className => root.classList.remove(className));
    }

    function canAutoplay() {
      return !destroyed && !userPaused && !reducedMotion.matches && !document.hidden && inViewport && !hovered && !focused && !pointer && !transitioning && (!options.isEnabled || options.isEnabled());
    }

    function clearTimer() {
      if (timer) window.clearTimeout(timer);
      timer = 0;
      dueAt = 0;
    }

    function clearProgress() {
      if (progressAnimation) progressAnimation.cancel();
      progressAnimation = null;
      if (progress) progress.style.transform = 'scaleX(0)';
    }

    function pauseProgress() {
      if (progressAnimation && progressAnimation.playState === 'running') progressAnimation.pause();
    }

    function updatePauseButton() {
      if (!pauseButton) return;
      const paused = userPaused || reducedMotion.matches;
      pauseButton.setAttribute('aria-pressed', String(paused));
      pauseButton.setAttribute('aria-label', paused ? 'Resume slideshow' : 'Pause slideshow');
      pauseButton.setAttribute('aria-disabled', String(reducedMotion.matches));
      pauseButton.title = reducedMotion.matches ? 'Autoplay disabled by reduced-motion preference' : (paused ? 'Resume slideshow' : 'Pause slideshow');
      pauseButton.dataset.playbackState = paused ? 'paused' : 'playing';
    }

    function beginProgress(duration) {
      if (!progress || reducedMotion.matches || typeof progress.animate !== 'function') return;
      clearProgress();
      progressAnimation = progress.animate(
        [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
        { duration, easing: 'linear', fill: 'forwards' }
      );
    }

    function schedule(delay) {
      clearTimer();
      if (!canAutoplay()) return;
      hasScheduled = true;
      const wait = Math.max(0, delay);
      remaining = wait;
      dueAt = performance.now() + wait;
      beginProgress(wait);
      timer = window.setTimeout(() => {
        timer = 0;
        dueAt = 0;
        if (!canAutoplay()) return;
        navigate(options.getIndex() + 1, 'autoplay', 'next');
      }, wait);
    }

    function resumeAutoplay(fresh) {
      if (destroyed || !canAutoplay()) return;
      const now = performance.now();
      if (holdUntil > now) {
        clearTimer();
        clearProgress();
        timer = window.setTimeout(() => {
          timer = 0;
          resumeAutoplay(true);
        }, holdUntil - now);
        return;
      }
      if (progressAnimation && !fresh && remaining > 0) {
        dueAt = now + remaining;
        progressAnimation.play();
        timer = window.setTimeout(() => {
          timer = 0;
          dueAt = 0;
          if (canAutoplay()) navigate(options.getIndex() + 1, 'autoplay', 'next');
        }, remaining);
        return;
      }
      schedule(fresh ? interval : remaining || interval);
    }

    function pauseAutoplay(reason) {
      if (dueAt) remaining = Math.max(0, dueAt - performance.now());
      clearTimer();
      pauseProgress();
      if (reason === 'manual') {
        holdUntil = performance.now() + manualDelay;
        remaining = interval;
        clearProgress();
      }
    }

    function markManualInteraction() {
      pauseAutoplay('manual');
    }

    function chooseDirection(current, target, requestedDirection) {
      if (requestedDirection === 'next' || requestedDirection === 'previous') return requestedDirection;
      const forward = (target - current + count) % count;
      const backward = (current - target + count) % count;
      return forward <= backward ? 'next' : 'previous';
    }

    function waitForMotion(duration) {
      return new Promise(resolve => {
        if (motionTimer) window.clearTimeout(motionTimer);
        if (motionResolve) motionResolve();
        motionResolve = resolve;
        motionTimer = window.setTimeout(() => {
          motionTimer = 0;
          motionResolve = null;
          resolve();
        }, duration + 24);
      });
    }

    function waitForFrames(countFrames) {
      return new Promise(resolve => {
        const next = frames => {
          if (frames <= 0) resolve();
          else window.requestAnimationFrame(() => next(frames - 1));
        };
        next(countFrames);
      });
    }

    async function normalizeTrack(activeIndex, direction) {
      clearTransitionClasses();
      root.classList.add('is-normalizing');
      setOffset(0);
      if (options.normalizeTrack) await options.normalizeTrack(activeIndex, direction);
      void track.offsetWidth;
      await waitForFrames(2);
      root.classList.remove('is-normalizing');
    }

    async function completeTransition(target, source, direction, requestGeneration) {
      if (requestGeneration !== generation || destroyed) return;
      if (options.commit) options.commit(target, source, direction);
      await normalizeTrack(target, direction);
      if (requestGeneration !== generation || destroyed) return;
      transitioning = false;
      clearProgress();
      remaining = interval;
      const queued = queuedNavigation;
      queuedNavigation = null;
      if (queued) {
        navigate(queued.index, queued.source, queued.direction);
      } else {
        resumeAutoplay(true);
      }
    }

    async function navigate(index, source = 'manual', requestedDirection) {
      const target = normalizeIndex(index);
      const current = normalizeIndex(options.getIndex());
      const manual = source !== 'autoplay' && source !== 'initial' && source !== 'hash';
      if (manual) markManualInteraction();
      if (target === current) {
        resumeAutoplay(true);
        return false;
      }
      const direction = chooseDirection(current, target, requestedDirection);
      if (transitioning || pointer) {
        if (manual) queuedNavigation = { index: target, source, direction };
        return false;
      }

      transitioning = true;
      pauseAutoplay('transition');
      const requestGeneration = ++generation;
      if (options.prepareTransition) await options.prepareTransition(current, target, direction, requestGeneration);
      if (requestGeneration !== generation || destroyed) return false;

      if (reducedMotion.matches) {
        if (options.preview) options.preview(target, direction);
        if (options.commit) options.commit(target, source, direction);
        await normalizeTrack(target, direction);
        transitioning = false;
        return true;
      }

      clearTransitionClasses();
      root.classList.add(direction === 'next' ? 'is-transitioning-next' : 'is-transitioning-previous');
      void track.offsetWidth;
      window.requestAnimationFrame(() => setOffset((direction === 'next' ? -1 : 1) * getViewportWidth()));
      if (options.preview) window.setTimeout(() => {
        if (requestGeneration === generation) options.preview(target, direction);
      }, Math.round(transitionDuration * 0.52));
      await waitForMotion(transitionDuration);
      await completeTransition(target, source, direction, requestGeneration);
      return true;
    }

    function renderDrag() {
      dragFrame = 0;
      setOffset(pendingOffset);
    }

    function queueDrag(offset) {
      pendingOffset = offset;
      if (!dragFrame) dragFrame = window.requestAnimationFrame(renderDrag);
    }

    function calculateDragOffset(rawOffset) {
      const maxDrag = Math.max(0, getViewportWidth() - 10);
      const resistanceZone = Math.min(48, maxDrag);
      const freeRange = Math.max(0, maxDrag - resistanceZone);
      const magnitude = Math.min(Math.abs(rawOffset), maxDrag);
      if (magnitude <= freeRange || !resistanceZone) return Math.sign(rawOffset) * magnitude;
      const progress = (magnitude - freeRange) / resistanceZone;
      const softenedProgress = 0.96 * progress + 0.04 * Math.pow(progress, 8);
      return Math.sign(rawOffset) * (freeRange + resistanceZone * softenedProgress);
    }

    function clearPointerState() {
      if (dragFrame) window.cancelAnimationFrame(dragFrame);
      dragFrame = 0;
      root.classList.remove('is-dragging');
    }

    function beginDrag(event) {
      if (pointer || (options.isTrackReady && !options.isTrackReady()) || event.isPrimary === false || (event.pointerType === 'mouse' && event.button !== 0)) return;
      if (event.target.closest(interactiveSelector)) return;
      if (transitioning) {
        if (!root.classList.contains('is-snapping-back')) return;
        generation += 1;
        if (motionTimer) window.clearTimeout(motionTimer);
        motionTimer = 0;
        if (motionResolve) motionResolve();
        motionResolve = null;
        clearTransitionClasses();
        setOffset(0);
        transitioning = false;
      }
      pointer = {
        id: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        x: event.clientX,
        time: event.timeStamp,
        velocity: 0,
        raw: 0,
        locked: false
      };
      pauseAutoplay('drag');
      try { viewport.setPointerCapture(event.pointerId); } catch (error) { /* capture is optional in older engines */ }
    }

    function updateDrag(event) {
      if (!pointer || event.pointerId !== pointer.id) return;
      const dx = event.clientX - pointer.startX;
      const dy = event.clientY - pointer.startY;
      if (!pointer.locked) {
        if (Math.hypot(dx, dy) < 8) return;
        if (Math.abs(dy) >= Math.abs(dx)) {
          const pointerId = pointer.id;
          pointer = null;
          try { viewport.releasePointerCapture(pointerId); } catch (error) { /* already released */ }
          resumeAutoplay(false);
          return;
        }
        pointer.locked = true;
        markManualInteraction();
        root.classList.add('is-dragging');
      }
      event.preventDefault();
      const elapsed = Math.max(1, event.timeStamp - pointer.time);
      pointer.velocity = (event.clientX - pointer.x) / elapsed;
      pointer.x = event.clientX;
      pointer.time = event.timeStamp;
      pointer.raw = dx;
      if (!reducedMotion.matches) queueDrag(calculateDragOffset(dx));
    }

    async function finishCommittedDrag(drag, direction) {
      transitioning = true;
      const target = normalizeIndex(options.getIndex() + (direction === 'next' ? 1 : -1));
      const requestGeneration = ++generation;
      clearPointerState();
      clearTransitionClasses();
      root.classList.add(direction === 'next' ? 'is-transitioning-next' : 'is-transitioning-previous');
      void track.offsetWidth;
      setOffset((direction === 'next' ? -1 : 1) * getViewportWidth());
      if (options.preview) window.setTimeout(() => {
        if (requestGeneration === generation) options.preview(target, direction);
      }, Math.round(transitionDuration * 0.45));
      await waitForMotion(transitionDuration);
      await completeTransition(target, 'drag', direction, requestGeneration);
    }

    async function finishDrag(event) {
      if (!pointer || (event.pointerId !== undefined && event.pointerId !== pointer.id)) return;
      const drag = pointer;
      pointer = null;
      try { viewport.releasePointerCapture(drag.id); } catch (error) { /* already released */ }
      if (!drag.locked) {
        clearPointerState();
        resumeAutoplay(false);
        return;
      }
      const threshold = getViewportWidth() * 0.20;
      const flick = Math.abs(drag.velocity) >= 0.55 && Math.abs(drag.raw) >= 24;
      if (Math.abs(drag.raw) >= threshold || flick) {
        if (reducedMotion.matches) {
          const direction = drag.raw < 0 ? 'next' : 'previous';
          const target = normalizeIndex(options.getIndex() + (direction === 'next' ? 1 : -1));
          clearPointerState();
          setOffset(0);
          if (options.commit) options.commit(target, 'drag', direction);
          if (options.normalizeTrack) await options.normalizeTrack(target, direction);
          resumeAutoplay(true);
        } else {
          finishCommittedDrag(drag, drag.raw < 0 ? 'next' : 'previous');
        }
        return;
      }

      transitioning = true;
      const snapGeneration = ++generation;
      clearPointerState();
      clearTransitionClasses();
      root.classList.add('is-snapping-back');
      void track.offsetWidth;
      setOffset(0);
      await waitForMotion(snapDuration);
      if (snapGeneration !== generation) return;
      clearTransitionClasses();
      transitioning = false;
      resumeAutoplay(true);
    }

    async function cancelDrag(useIdleDelay = true) {
      if (!pointer && !root.classList.contains('is-dragging')) return;
      const pointerId = pointer && pointer.id;
      pointer = null;
      if (pointerId !== null && pointerId !== undefined) {
        try { viewport.releasePointerCapture(pointerId); } catch (error) { /* already released */ }
      }
      if (useIdleDelay) markManualInteraction();
      clearPointerState();
      if (reducedMotion.matches) {
        setOffset(0);
        resumeAutoplay(true);
        return;
      }
      transitioning = true;
      const snapGeneration = ++generation;
      clearTransitionClasses();
      root.classList.add('is-snapping-back');
      void track.offsetWidth;
      setOffset(0);
      await waitForMotion(snapDuration);
      if (snapGeneration !== generation) return;
      clearTransitionClasses();
      transitioning = false;
      resumeAutoplay(true);
    }

    function cancelAllMotion() {
      generation += 1;
      if (motionTimer) window.clearTimeout(motionTimer);
      motionTimer = 0;
      if (motionResolve) motionResolve();
      motionResolve = null;
      queuedNavigation = null;
      pointer = null;
      transitioning = false;
      clearPointerState();
      clearTransitionClasses();
      root.classList.add('is-normalizing');
      setOffset(0);
      if (options.normalizeTrack) options.normalizeTrack(options.getIndex());
      window.requestAnimationFrame(() => root.classList.remove('is-normalizing'));
    }

    listen(root, 'mouseenter', () => { hovered = true; pauseAutoplay('hover'); });
    listen(root, 'mouseleave', () => { hovered = false; resumeAutoplay(false); });
    listen(root, 'focusin', () => { focused = true; pauseAutoplay('focus'); });
    listen(root, 'focusout', () => window.setTimeout(() => {
      focused = root.contains(document.activeElement);
      if (!focused) resumeAutoplay(false);
    }, 0));
    listen(viewport, 'pointerdown', beginDrag);
    listen(viewport, 'pointermove', updateDrag, { passive: false });
    listen(viewport, 'pointerup', finishDrag);
    listen(viewport, 'pointercancel', () => cancelDrag(true));
    listen(viewport, 'lostpointercapture', event => {
      if (pointer && pointer.id === event.pointerId) cancelDrag(true);
    });
    listen(viewport, 'dragstart', event => event.preventDefault());
    listen(window, 'blur', () => cancelDrag(true));

    if (options.keyboard !== false) {
      if (!viewport.hasAttribute('tabindex')) viewport.tabIndex = 0;
      if (!viewport.hasAttribute('aria-label')) viewport.setAttribute('aria-label', 'Slide viewport. Use Left and Right Arrow keys to navigate.');
      listen(viewport, 'keydown', event => {
        if (event.target.closest(interactiveSelector)) return;
        let target = null;
        let direction = null;
        if (event.key === 'ArrowLeft') { target = options.getIndex() - 1; direction = 'previous'; }
        if (event.key === 'ArrowRight') { target = options.getIndex() + 1; direction = 'next'; }
        if (event.key === 'Home') target = 0;
        if (event.key === 'End') target = count - 1;
        if (target === null) return;
        event.preventDefault();
        navigate(target, 'keyboard', direction);
      });
    }

    listen(document, 'visibilitychange', () => {
      if (document.hidden) pauseAutoplay('visibility');
      else { remaining = interval; clearProgress(); resumeAutoplay(true); }
    });

    const onMotionChange = () => {
      pauseAutoplay('motion');
      cancelAllMotion();
      remaining = interval;
      clearProgress();
      updatePauseButton();
      if (!reducedMotion.matches) resumeAutoplay(true);
    };
    if (typeof reducedMotion.addEventListener === 'function') {
      reducedMotion.addEventListener('change', onMotionChange);
      listeners.push(() => reducedMotion.removeEventListener('change', onMotionChange));
    }

    if (pauseButton) listen(pauseButton, 'click', () => {
      if (reducedMotion.matches) return;
      userPaused = !userPaused;
      holdUntil = 0;
      updatePauseButton();
      if (userPaused) {
        pauseAutoplay('user');
        clearProgress();
      } else {
        remaining = interval;
        resumeAutoplay(true);
      }
    });

    if (typeof window.IntersectionObserver === 'function') {
      intersectionObserver = new IntersectionObserver(entries => {
        const visible = entries[0].isIntersecting && entries[0].intersectionRatio >= visibilityThreshold;
        if (visible === inViewport) return;
        inViewport = visible;
        if (!visible) pauseAutoplay('viewport');
        else {
          remaining = hasScheduled ? interval : initialDelay;
          clearProgress();
          if (hasScheduled) resumeAutoplay(true);
          else schedule(initialDelay);
        }
      }, { threshold: [0, visibilityThreshold, 1] });
      intersectionObserver.observe(root);
    }

    updatePauseButton();
    setOffset(0);
    if (inViewport) schedule(initialDelay);

    return {
      startAutoplay: () => resumeAutoplay(true),
      pauseAutoplay,
      scheduleAutoplayResume: markManualInteraction,
      manualAction: markManualInteraction,
      beginDrag,
      updateDrag,
      finishDrag,
      cancelDrag,
      goTo: navigate,
      refresh() {
        if (!options.isEnabled || options.isEnabled()) resumeAutoplay(true);
        else { pauseAutoplay('mode'); cancelAllMotion(); }
      },
      destroy() {
        destroyed = true;
        generation += 1;
        clearTimer();
        clearProgress();
        if (motionTimer) window.clearTimeout(motionTimer);
        if (motionResolve) motionResolve();
        motionResolve = null;
        if (dragFrame) window.cancelAnimationFrame(dragFrame);
        if (intersectionObserver) intersectionObserver.disconnect();
        listeners.splice(0).forEach(remove => remove());
        cancelAllMotion();
        root.style.removeProperty('--carousel-track-offset');
        root.style.removeProperty('--carousel-drag-progress');
        delete root.dataset.carouselInteractionReady;
      }
    };
  };
})();
