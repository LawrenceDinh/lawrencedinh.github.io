/* Shared progressive entrance animation, using the existing Projects timing and easing.
 * No CSS hides content: absent JS, Web Animations, or IntersectionObserver leaves it visible.
 */
(() => {
  'use strict';
  window.PortfolioEntrance = function(groups) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const canAnimate = typeof Element.prototype.animate === 'function';
    const canObserve = typeof IntersectionObserver === 'function';
    const targets = [];
    const targetSet = new Set();
    const targetDelays = new WeakMap();
    const activeAnimations = new Map();
    let observer = null;

    function addGroup(elements) {
      [...elements].filter(Boolean).forEach((element, index) => {
        if (targetSet.has(element)) return;
        targetSet.add(element);
        targets.push(element);
        targetDelays.set(element, Math.min(index, 4) * 45);
      });
    }

    groups.forEach(addGroup);

    function resetTarget(element) {
      element.style.removeProperty('opacity');
      element.style.removeProperty('transform');
      element.style.removeProperty('will-change');
    }

    function revealTarget(element) {
      if (observer) observer.unobserve(element);
      resetTarget(element);

      if (reducedMotion.matches || !canAnimate) return;

      element.style.willChange = 'opacity, transform';
      const animation = element.animate([
        { opacity: 0, transform: 'translate3d(0, 16px, 0)' },
        { opacity: 1, transform: 'translate3d(0, 0, 0)' }
      ], {
        duration: 520,
        delay: targetDelays.get(element) || 0,
        easing: 'cubic-bezier(0.2, 0.78, 0.2, 1)',
        fill: 'both'
      });

      activeAnimations.set(element, animation);
      animation.finished.then(() => {
        activeAnimations.delete(element);
        animation.cancel();
        resetTarget(element);
      }).catch(() => {
        activeAnimations.delete(element);
        resetTarget(element);
      });
    }

    if (reducedMotion.matches || !canAnimate || !canObserve) {
      targets.forEach(resetTarget);
      return;
    }

    targets.forEach(element => {
      element.style.opacity = '0';
      element.style.transform = 'translate3d(0, 16px, 0)';
    });

    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) revealTarget(entry.target);
      });
    }, {
      threshold: 0,
      rootMargin: '0px'
    });

    targets.forEach(element => observer.observe(element));

    reducedMotion.addEventListener('change', event => {
      if (!event.matches) return;
      observer.disconnect();
      activeAnimations.forEach(animation => animation.cancel());
      activeAnimations.clear();
      targets.forEach(resetTarget);
    }, { once: true });
  };
})();
