// Portfolio interactions are grouped by feature inside one shared runtime.
(function(){
  // --- Shared state and utilities ---
  const backToTop = document.getElementById('backToTop');
  const brandLink = document.getElementById('brandLink');
  const bioSummary = document.getElementById('bioSummary');
  const grid = document.querySelector('.grid');
  const contactPanel = document.getElementById('contactPanel');
  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let bioAnimationFrame = 0;
  let bioAnimationTimeout = 0;
  let bioAnimationToken = 0;

  function scrollPageToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  function isUnmodifiedPrimaryClick(event) {
    return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
  }

  const decodeCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+-/<>_';

  const getDecodeCharacter = function(targetCharacter) {
    let character = targetCharacter;
    while (character === targetCharacter) {
      character = decodeCharacters.charAt(Math.floor(Math.random() * decodeCharacters.length));
      if (/[A-Z]/.test(character) && /[a-z]/.test(targetCharacter)) character = character.toLowerCase();
    }
    return character;
  };

  const createRollingPrefixDecode = function(options) {
    let timer = 0;
    let cancelled = false;
    const text = options.text;
    const cancel = function() {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      timer = 0;
    };
    if (!text) return { cancel: cancel };

    options.setText(text.charAt(0));
    let characterIndex = 1;
    const decodeNextCharacter = function() {
      if (cancelled) return;
      if (characterIndex >= text.length) {
        if (options.onComplete) options.onComplete();
        return;
      }
      const resolvedPrefix = text.slice(0, characterIndex);
      const targetCharacter = text.charAt(characterIndex);
      const scrambleFrameCount = options.getScrambleFrameCount(characterIndex);
      let scrambleFrame = 0;
      const rollCharacter = function() {
        if (cancelled) return;
        if (targetCharacter === ' ') {
          options.setText(resolvedPrefix + targetCharacter);
          characterIndex += 1;
          timer = window.setTimeout(decodeNextCharacter, options.getResolveDelay(characterIndex));
          return;
        }
        if (scrambleFrame < scrambleFrameCount) {
          options.setText(resolvedPrefix + getDecodeCharacter(targetCharacter));
          scrambleFrame += 1;
          timer = window.setTimeout(rollCharacter, options.getFrameDelay(characterIndex));
          return;
        }
        options.setText(resolvedPrefix + targetCharacter);
        characterIndex += 1;
        timer = window.setTimeout(decodeNextCharacter, options.getResolveDelay(characterIndex));
      };
      rollCharacter();
    };
    decodeNextCharacter();
    return { cancel: cancel };
  };

  const createFullStringProgressiveDecode = function(options) {
    let timer = 0;
    let cancelled = false;
    const text = options.text;
    const scrambledCharacters = text.split('').map(function(character) {
      return character === ' ' || (options.shouldPreserveCharacter && options.shouldPreserveCharacter(character))
        ? character
        : getDecodeCharacter(character);
    });
    const cancel = function() {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      timer = 0;
    };
    let characterIndex = 0;
    const resolveNextCharacter = function() {
      if (cancelled) return;
      if (characterIndex >= text.length) {
        options.setText(text);
        if (options.onComplete) options.onComplete();
        return;
      }
      const targetCharacter = text.charAt(characterIndex);
      if (targetCharacter === ' ' || (options.shouldPreserveCharacter && options.shouldPreserveCharacter(targetCharacter))) {
        scrambledCharacters[characterIndex] = targetCharacter;
        characterIndex += 1;
        timer = window.setTimeout(resolveNextCharacter, options.getResolveDelay(characterIndex));
        return;
      }
      let scrambleFrame = 0;
      const rollCharacter = function() {
        if (cancelled) return;
        if (scrambleFrame < options.getScrambleFrameCount(characterIndex)) {
          scrambledCharacters[characterIndex] = getDecodeCharacter(targetCharacter);
          options.setText(text.slice(0, characterIndex) + scrambledCharacters.slice(characterIndex).join(''));
          scrambleFrame += 1;
          timer = window.setTimeout(rollCharacter, options.getFrameDelay(characterIndex));
          return;
        }
        scrambledCharacters[characterIndex] = targetCharacter;
        options.setText(text.slice(0, characterIndex + 1) + scrambledCharacters.slice(characterIndex + 1).join(''));
        characterIndex += 1;
        timer = window.setTimeout(resolveNextCharacter, options.getResolveDelay(characterIndex));
      };
      rollCharacter();
    };
    options.setText(scrambledCharacters.join(''));
    resolveNextCharacter();
    return { cancel: cancel };
  };

  // Enhanced-only nameplate decode: the stable aria-label remains the accessible name.
  const nameplate = document.querySelector('[data-nameplate-scramble]');
  const nameplateText = nameplate ? nameplate.querySelector('[data-nameplate-scramble-text]') : null;

  if (nameplate && nameplateText) {
    const resolvedName = nameplateText.textContent;
    const NAMEPLATE_HOVER_REPEAT_DELAY_MS = 3000;
    let nameplateRepeatTimer = 0;
    let nameplateDecodeController = null;
    let isNameplateHovered = false;
    let isNameplateFocused = false;
    let isScrambleRunning = false;
    let isNameplateEntranceRunning = false;
    let hasQueuedEntryTrigger = false;

    const enhancedNameplateEnabled = function() {
      return document.documentElement.getAttribute('data-portfolio-mode') === 'enhanced' && !reduceMotionQuery.matches;
    };

    const restoreNameplate = function() {
      nameplateText.textContent = resolvedName;
    };

    const clearNameplateRepeat = function() {
      if (!nameplateRepeatTimer) return;
      window.clearTimeout(nameplateRepeatTimer);
      nameplateRepeatTimer = 0;
    };

    const stopNameplateScramble = function() {
      clearNameplateRepeat();
      if (nameplateDecodeController) nameplateDecodeController.cancel();
      nameplateDecodeController = null;
      isScrambleRunning = false;
      isNameplateEntranceRunning = false;
      hasQueuedEntryTrigger = false;
      restoreNameplate();
    };

    const scheduleHoveredScramble = function() {
      if (!isNameplateHovered || !enhancedNameplateEnabled() || isScrambleRunning || isNameplateEntranceRunning || hasQueuedEntryTrigger || nameplateRepeatTimer) return;

      nameplateRepeatTimer = window.setTimeout(function() {
        nameplateRepeatTimer = 0;
        if (isNameplateHovered && !isScrambleRunning && !isNameplateEntranceRunning && !hasQueuedEntryTrigger) runNameplateScramble();
      }, NAMEPLATE_HOVER_REPEAT_DELAY_MS);
    };

    const runNameplateScramble = function() {
      if (!enhancedNameplateEnabled() || isNameplateEntranceRunning) return;

      if (nameplateDecodeController) nameplateDecodeController.cancel();
      isScrambleRunning = true;
      nameplateDecodeController = createFullStringProgressiveDecode({
        text: resolvedName,
        setText: function(value) { nameplateText.textContent = value; },
        getScrambleFrameCount: function() { return 2; },
        getFrameDelay: function() { return 16; },
        getResolveDelay: function() { return 6; },
        onComplete: function() {
          nameplateDecodeController = null;
          restoreNameplate();
          isScrambleRunning = false;
          if (hasQueuedEntryTrigger) {
            hasQueuedEntryTrigger = false;
            runNameplateScramble();
          } else {
            scheduleHoveredScramble();
          }
        }
      });
    };

    const requestNameplateScramble = function() {
      if (!enhancedNameplateEnabled()) return;

      clearNameplateRepeat();
      if (isNameplateEntranceRunning) {
        hasQueuedEntryTrigger = true;
        return;
      }
      if (isScrambleRunning) stopNameplateScramble();
      runNameplateScramble();
    };

    const runNameplateLoadEntrance = function() {
      stopNameplateScramble();
      if (!enhancedNameplateEnabled()) return;
      isNameplateEntranceRunning = true;
      nameplateDecodeController = createRollingPrefixDecode({
        text: resolvedName,
        setText: function(value) { nameplateText.textContent = value; },
        getScrambleFrameCount: function(index) { return index <= 2 ? 2 : 1; },
        getFrameDelay: function() { return 12 + Math.floor(Math.random() * 7); },
        getResolveDelay: function() { return 10; },
        onComplete: function() {
          nameplateDecodeController = null;
          isNameplateEntranceRunning = false;
          restoreNameplate();
          hasQueuedEntryTrigger = false;
          if (isNameplateHovered) scheduleHoveredScramble();
        }
      });
    };

    const syncNameplateMode = function() {
      if (document.documentElement.getAttribute('data-portfolio-mode') === 'enhanced') {
        nameplate.tabIndex = 0;
      } else {
        nameplate.removeAttribute('tabindex');
        isNameplateHovered = false;
        isNameplateFocused = false;
        stopNameplateScramble();
      }
    };

    nameplate.addEventListener('pointerenter', function() {
      isNameplateHovered = true;
      requestNameplateScramble();
    });

    nameplate.addEventListener('pointerleave', function() {
      isNameplateHovered = false;
      clearNameplateRepeat();
    });

    nameplate.addEventListener('focus', function() {
      isNameplateFocused = true;
      requestNameplateScramble();
    });

    nameplate.addEventListener('blur', function() {
      isNameplateFocused = false;
      if (!isNameplateHovered) clearNameplateRepeat();
    });

    let nameplateMode = document.documentElement.getAttribute('data-portfolio-mode');
    const nameplateModeObserver = new MutationObserver(function() {
      const nextMode = document.documentElement.getAttribute('data-portfolio-mode');
      syncNameplateMode();
      nameplateMode = nextMode;
    });
    nameplateModeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-portfolio-mode']
    });

    if (typeof reduceMotionQuery.addEventListener === 'function') {
      reduceMotionQuery.addEventListener('change', function() {
        if (reduceMotionQuery.matches) {
          isNameplateHovered = false;
          isNameplateFocused = false;
          stopNameplateScramble();
        }
      });
    }

    syncNameplateMode();
    document.addEventListener('enhanced-identity-decode', runNameplateLoadEntrance);
  }

  // Enhanced-only navbar URL decode: the resolved prefix stays stable while one next character rolls.
  const navbarUrl = brandLink ? brandLink.querySelector('.role') : null;

  if (navbarUrl) {
    const navbarUrlText = navbarUrl.textContent.trim();
    let navbarUrlVisualText = null;
    let navbarUrlDecodeController = null;
    let navbarUrlGeneration = 0;

    const ensureNavbarUrlStructure = function() {
      if (navbarUrlVisualText) return;
      navbarUrl.textContent = '';
      navbarUrlVisualText = document.createElement('span');
      navbarUrlVisualText.className = 'brand-url-decode';
      navbarUrlVisualText.setAttribute('aria-hidden', 'true');
      navbarUrl.append(navbarUrlVisualText);
      brandLink.setAttribute('aria-label', navbarUrlText);
    };

    const stopNavbarUrlDecode = function() {
      navbarUrlGeneration += 1;
      if (navbarUrlDecodeController) navbarUrlDecodeController.cancel();
      navbarUrlDecodeController = null;
      ensureNavbarUrlStructure();
      navbarUrlVisualText.textContent = navbarUrlText;
    };

    const startNavbarUrlDecode = function() {
      stopNavbarUrlDecode();
      if (reduceMotionQuery.matches || document.documentElement.getAttribute('data-portfolio-mode') !== 'enhanced') return;

      navbarUrlDecodeController = createRollingPrefixDecode({
        text: navbarUrlText,
        setText: function(value) { navbarUrlVisualText.textContent = value; },
        getScrambleFrameCount: function(index) {
          return index <= 2 ? 2 : index < 7 && Math.random() < 0.35 ? 2 : 1;
        },
        getFrameDelay: function(index) {
          return index >= 'lawrence'.length ? 12 + Math.floor(Math.random() * 5) : 13 + Math.floor(Math.random() * 6);
        },
        getResolveDelay: function(index) { return index >= 'lawrence'.length ? 5 : 8; },
        onComplete: function() { navbarUrlDecodeController = null; }
      });
    };

    const runNavbarUrlHoverScramble = function() {
      if (reduceMotionQuery.matches || document.documentElement.getAttribute('data-portfolio-mode') !== 'enhanced') return;
      if (navbarUrlDecodeController) navbarUrlDecodeController.cancel();
      ensureNavbarUrlStructure();
      navbarUrlDecodeController = createFullStringProgressiveDecode({
        text: navbarUrlText,
        setText: function(value) { navbarUrlVisualText.textContent = value; },
        shouldPreserveCharacter: function(character) { return character === '.'; },
        getScrambleFrameCount: function() { return 1; },
        getFrameDelay: function() { return 18 + Math.floor(Math.random() * 8); },
        getResolveDelay: function() { return 0; },
        onComplete: function() {
          navbarUrlDecodeController = null;
          navbarUrlVisualText.textContent = navbarUrlText;
        }
      });
    };

    navbarUrl.addEventListener('pointerenter', runNavbarUrlHoverScramble);
    brandLink.addEventListener('focus', runNavbarUrlHoverScramble);

    let navbarUrlMode = document.documentElement.getAttribute('data-portfolio-mode');
    const navbarUrlModeObserver = new MutationObserver(function() {
      const nextMode = document.documentElement.getAttribute('data-portfolio-mode');
      if (nextMode !== 'enhanced') {
        stopNavbarUrlDecode();
      }
      navbarUrlMode = nextMode;
    });
    navbarUrlModeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-portfolio-mode']
    });

    if (typeof reduceMotionQuery.addEventListener === 'function') {
      reduceMotionQuery.addEventListener('change', function() {
        if (reduceMotionQuery.matches) stopNavbarUrlDecode();
      });
    }

    if (navbarUrlMode !== 'enhanced') stopNavbarUrlDecode();
    document.addEventListener('enhanced-identity-decode', startNavbarUrlDecode);
  }

  // Start the navbar URL and hero name rolling decodes together on every Enhanced entry.
  let identityDecodeEntranceFrame = 0;
  let identityDecodeEntranceTimer = 0;
  const cancelIdentityDecodeEntrance = function() {
    if (identityDecodeEntranceFrame) window.cancelAnimationFrame(identityDecodeEntranceFrame);
    if (identityDecodeEntranceTimer) window.clearTimeout(identityDecodeEntranceTimer);
    identityDecodeEntranceFrame = 0;
    identityDecodeEntranceTimer = 0;
  };
  const startIdentityDecodeEntrance = function() {
    cancelIdentityDecodeEntrance();
    if (reduceMotionQuery.matches || document.documentElement.getAttribute('data-portfolio-mode') !== 'enhanced') return;
    identityDecodeEntranceFrame = window.requestAnimationFrame(function() {
      identityDecodeEntranceFrame = 0;
      identityDecodeEntranceTimer = window.setTimeout(function() {
        identityDecodeEntranceTimer = 0;
        if (reduceMotionQuery.matches || document.documentElement.getAttribute('data-portfolio-mode') !== 'enhanced') return;
        document.dispatchEvent(new Event('enhanced-identity-decode'));
      }, 100);
    });
  };
  let identityDecodeMode = document.documentElement.getAttribute('data-portfolio-mode');
  const identityDecodeModeObserver = new MutationObserver(function() {
    const nextMode = document.documentElement.getAttribute('data-portfolio-mode');
    if (nextMode === 'enhanced' && identityDecodeMode !== 'enhanced') {
      startIdentityDecodeEntrance();
    } else if (nextMode !== 'enhanced') {
      cancelIdentityDecodeEntrance();
    }
    identityDecodeMode = nextMode;
  });
  identityDecodeModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-portfolio-mode']
  });
  if (typeof reduceMotionQuery.addEventListener === 'function') {
    reduceMotionQuery.addEventListener('change', function() {
      if (reduceMotionQuery.matches) cancelIdentityDecodeEntrance();
    });
  }
  if (identityDecodeMode === 'enhanced') {
    startIdentityDecodeEntrance();
  }

  // Enhanced-only hero summary typewriter: the full sentence remains available to assistive technology.
  const heroIdentitySummary = document.querySelector('.hero-identity-summary');

  if (heroIdentitySummary) {
    const heroSummaryText = heroIdentitySummary.textContent.trim();
    const heroSummaryPhrasePauses = {
      systems: 260,
      'data,': 130,
      'sensing,': 130
    };
    let heroSummaryTypedText = null;
    let heroSummaryAccessibleText = null;
    let heroSummaryCaret = null;
    let heroSummaryTypeTimer = 0;
    let heroSummaryCaretTimer = 0;
    let heroSummaryCaretFadeTimer = 0;
    let heroSummaryAnimationToken = 0;

    const ensureHeroSummaryStructure = function() {
      if (heroSummaryTypedText) return;
      heroIdentitySummary.textContent = '';
      heroSummaryTypedText = document.createElement('span');
      heroSummaryTypedText.className = 'hero-identity-summary__typed';
      heroSummaryTypedText.setAttribute('aria-hidden', 'true');
      heroSummaryAccessibleText = document.createElement('span');
      heroSummaryAccessibleText.className = 'hero-identity-summary__accessible';
      heroSummaryAccessibleText.textContent = heroSummaryText;
      heroIdentitySummary.append(heroSummaryTypedText, heroSummaryAccessibleText);
    };

    const removeHeroSummaryCaret = function() {
      if (!heroSummaryCaret) return;
      heroSummaryCaret.remove();
      heroSummaryCaret = null;
    };

    const getHeroSummaryTypingDelay = function(typedText) {
      const phrasePause = Object.keys(heroSummaryPhrasePauses).find(function(phrase) {
        return typedText.endsWith(phrase);
      });
      if (phrasePause) return { duration: heroSummaryPhrasePauses[phrasePause], shouldBlink: true };

      if (typedText.endsWith(' ') && Math.random() < 0.28) {
        return { duration: 20 + Math.floor(Math.random() * 16), shouldBlink: true };
      }

      return { duration: 8 + Math.floor(Math.random() * 9), shouldBlink: false };
    };

    const stopHeroSummaryTypewriter = function() {
      heroSummaryAnimationToken += 1;
      if (heroSummaryTypeTimer) window.clearTimeout(heroSummaryTypeTimer);
      if (heroSummaryCaretTimer) window.clearTimeout(heroSummaryCaretTimer);
      if (heroSummaryCaretFadeTimer) window.clearTimeout(heroSummaryCaretFadeTimer);
      heroSummaryTypeTimer = 0;
      heroSummaryCaretTimer = 0;
      heroSummaryCaretFadeTimer = 0;
      ensureHeroSummaryStructure();
      heroSummaryTypedText.textContent = heroSummaryText;
      heroIdentitySummary.style.removeProperty('min-height');
      removeHeroSummaryCaret();
    };

    const startHeroSummaryTypewriter = function() {
      stopHeroSummaryTypewriter();
      if (reduceMotionQuery.matches || document.documentElement.getAttribute('data-portfolio-mode') !== 'enhanced') return;

      const animationToken = heroSummaryAnimationToken;
      const summaryHeight = heroIdentitySummary.getBoundingClientRect().height;
      if (summaryHeight) heroIdentitySummary.style.minHeight = summaryHeight + 'px';
      heroSummaryTypedText.textContent = '';
      heroSummaryCaret = document.createElement('span');
      heroSummaryCaret.className = 'hero-identity-summary__caret';
      heroSummaryCaret.setAttribute('aria-hidden', 'true');
      heroSummaryTypedText.after(heroSummaryCaret);

      let characterIndex = 0;
      const typeNextCharacter = function() {
        if (animationToken !== heroSummaryAnimationToken) return;
        if (heroSummaryCaret) heroSummaryCaret.classList.remove('is-blinking');
        heroSummaryTypedText.textContent += heroSummaryText.charAt(characterIndex);
        characterIndex += 1;

        if (characterIndex < heroSummaryText.length) {
          const nextCharacterDelay = getHeroSummaryTypingDelay(heroSummaryTypedText.textContent);
          if (heroSummaryCaret) heroSummaryCaret.classList.toggle('is-blinking', nextCharacterDelay.shouldBlink);
          heroSummaryTypeTimer = window.setTimeout(typeNextCharacter, nextCharacterDelay.duration);
          return;
        }

        heroSummaryTypeTimer = 0;
        if (heroSummaryCaret) heroSummaryCaret.classList.add('is-blinking');
        heroSummaryCaretTimer = window.setTimeout(function() {
          if (animationToken !== heroSummaryAnimationToken || !heroSummaryCaret) return;
          heroSummaryCaret.classList.add('is-fading');
          heroSummaryCaretFadeTimer = window.setTimeout(function() {
            if (animationToken !== heroSummaryAnimationToken) return;
            removeHeroSummaryCaret();
            heroIdentitySummary.style.removeProperty('min-height');
            heroSummaryCaretFadeTimer = 0;
          }, 350);
          heroSummaryCaretTimer = 0;
        }, 2000);
      };

      typeNextCharacter();
    };

    let heroSummaryMode = document.documentElement.getAttribute('data-portfolio-mode');
    const heroSummaryModeObserver = new MutationObserver(function() {
      const nextMode = document.documentElement.getAttribute('data-portfolio-mode');
      if (nextMode === 'enhanced' && heroSummaryMode !== 'enhanced') {
        startHeroSummaryTypewriter();
      } else if (nextMode !== 'enhanced') {
        stopHeroSummaryTypewriter();
      }
      heroSummaryMode = nextMode;
    });
    heroSummaryModeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-portfolio-mode']
    });

    if (typeof reduceMotionQuery.addEventListener === 'function') {
      reduceMotionQuery.addEventListener('change', function() {
        if (reduceMotionQuery.matches) stopHeroSummaryTypewriter();
      });
    }

    if (heroSummaryMode === 'enhanced') {
      window.requestAnimationFrame(startHeroSummaryTypewriter);
    } else {
      stopHeroSummaryTypewriter();
    }
  }

  // Enhanced-only portrait acquisition: a short monitor-like settle with no persistent visual effects.
  const heroPortrait = document.querySelector('.profile-pic-overlay');

  if (heroPortrait) {
    let heroPortraitAnimation = null;
    let heroPortraitFrame = 0;
    let heroPortraitGeneration = 0;
    let heroPortraitConfirmationHandler = null;
    let isHeroPortraitScanning = false;
    let pendingHeroPortraitScans = 0;

    const heroPortraitScanEnabled = function() {
      return document.documentElement.getAttribute('data-portfolio-mode') === 'enhanced'
        && typeof heroPortrait.animate === 'function';
    };

    const updateHeroPortraitInteractivity = function() {
      const interactive = document.documentElement.getAttribute('data-portfolio-mode') === 'enhanced';
      if (interactive) {
        heroPortrait.setAttribute('role', 'button');
        heroPortrait.setAttribute('tabindex', '0');
        heroPortrait.setAttribute('aria-label', 'Replay biometric scan');
        heroPortrait.removeAttribute('aria-hidden');
      } else {
        heroPortrait.removeAttribute('role');
        heroPortrait.removeAttribute('tabindex');
        heroPortrait.removeAttribute('aria-label');
        heroPortrait.setAttribute('aria-hidden', 'true');
        if (document.activeElement === heroPortrait) heroPortrait.blur();
      }
    };

    const clearHeroPortraitConfirmationHandler = function() {
      if (!heroPortraitConfirmationHandler) return;
      heroPortrait.removeEventListener('animationend', heroPortraitConfirmationHandler);
      heroPortraitConfirmationHandler = null;
    };

    const resetHeroPortrait = function() {
      clearHeroPortraitConfirmationHandler();
      heroPortrait.classList.remove('is-biometric-scanning', 'is-biometric-confirmed');
      heroPortrait.style.removeProperty('will-change');
      heroPortrait.querySelectorAll('.profile-biometric-layer, .profile-biometric-scanline, .profile-biometric-markers').forEach(function(element) {
        element.remove();
      });
    };

    const stopHeroPortraitEntrance = function() {
      heroPortraitGeneration += 1;
      if (heroPortraitFrame) window.cancelAnimationFrame(heroPortraitFrame);
      heroPortraitFrame = 0;
      pendingHeroPortraitScans = 0;
      isHeroPortraitScanning = false;
      const previousAnimation = heroPortraitAnimation;
      heroPortraitAnimation = null;
      if (previousAnimation) previousAnimation.animations.forEach(function(animation) { animation.cancel(); });
      resetHeroPortrait();
    };

    const createHeroPortraitScanner = function() {
      const sourceImage = heroPortrait.querySelector('img');
      if (!sourceImage) return null;
      const scanLine = document.createElement('span');
      scanLine.className = 'profile-biometric-scanline';
      scanLine.setAttribute('aria-hidden', 'true');
      const markers = document.createElement('span');
      markers.className = 'profile-biometric-markers';
      markers.setAttribute('aria-hidden', 'true');
      heroPortrait.append(scanLine, markers);
      return { scanLine: scanLine, markers: markers };
    };

    const startHeroPortraitEntrance = function() {
      if (!heroPortraitScanEnabled()) {
        pendingHeroPortraitScans = 0;
        return;
      }
      if (isHeroPortraitScanning) {
        pendingHeroPortraitScans += 1;
        return;
      }

      isHeroPortraitScanning = true;
      resetHeroPortrait();
      const animationGeneration = heroPortraitGeneration;
      heroPortraitFrame = window.requestAnimationFrame(function() {
        heroPortraitFrame = 0;
        if (animationGeneration !== heroPortraitGeneration || !heroPortraitScanEnabled()) {
          isHeroPortraitScanning = false;
          pendingHeroPortraitScans = 0;
          return;
        }

        const scanner = createHeroPortraitScanner();
        if (!scanner) {
          isHeroPortraitScanning = false;
          pendingHeroPortraitScans = 0;
          return;
        }
        heroPortrait.classList.add('is-biometric-scanning');
        scanner.scanLine.style.willChange = 'transform, opacity';
        scanner.markers.style.willChange = 'opacity';
        const reducedMotion = reduceMotionQuery.matches;
        const scanDistance = Math.max(0, heroPortrait.clientHeight + 22);
        const scanLineAnimation = scanner.scanLine.animate(reducedMotion ? [
          { opacity: 0 },
          { offset: .25, opacity: .45 },
          { opacity: 0 }
        ] : [
          { opacity: 0, transform: 'translate3d(0, -22px, 0)' },
          { offset: 0.08, opacity: 1, transform: 'translate3d(0, -22px, 0)' },
          { offset: 0.9, opacity: 1, transform: 'translate3d(0, ' + scanDistance + 'px, 0)' },
          { opacity: 0, transform: 'translate3d(0, ' + scanDistance + 'px, 0)' }
        ], {
          duration: reducedMotion ? 150 : 650,
          delay: reducedMotion ? 0 : 100,
          easing: reducedMotion ? 'ease-out' : 'linear',
          fill: 'both'
        });
        const markerAnimation = scanner.markers.animate([
          { opacity: 0 },
          { offset: reducedMotion ? .28 : .12, opacity: .72 },
          { offset: .82, opacity: .72 },
          { opacity: 0 }
        ], {
          duration: reducedMotion ? 150 : 750,
          easing: 'ease-out',
          fill: 'both'
        });
        const transition = { animations: [scanLineAnimation, markerAnimation], reducedMotion: reducedMotion };
        heroPortraitAnimation = transition;

        const finishScan = function() {
          if (animationGeneration !== heroPortraitGeneration || heroPortraitAnimation !== transition) return;
          heroPortraitAnimation = null;
          transition.animations.forEach(function(animation) { animation.cancel(); });
          resetHeroPortrait();
          isHeroPortraitScanning = false;

          if (pendingHeroPortraitScans > 0 && heroPortraitScanEnabled()) {
            pendingHeroPortraitScans -= 1;
            startHeroPortraitEntrance();
          } else if (!heroPortraitScanEnabled()) {
            pendingHeroPortraitScans = 0;
          }
        };

        Promise.all(transition.animations.map(function(animation) { return animation.finished; }))
          .then(function() {
            if (animationGeneration !== heroPortraitGeneration || heroPortraitAnimation !== transition) return;
            if (transition.reducedMotion) {
              finishScan();
              return;
            }
            heroPortraitConfirmationHandler = function(event) {
              if (event.target !== heroPortrait || event.animationName !== 'hero-portrait-confirmation') return;
              finishScan();
            };
            heroPortrait.addEventListener('animationend', heroPortraitConfirmationHandler);
            heroPortrait.classList.add('is-biometric-confirmed');
          })
          .catch(function() {
            // Cancellation is handled by stopHeroPortraitEntrance().
          });
      });
    };

    const queueHeroPortraitScan = function() {
      if (!heroPortraitScanEnabled()) return;
      startHeroPortraitEntrance();
    };

    heroPortrait.addEventListener('click', queueHeroPortraitScan);
    heroPortrait.addEventListener('keydown', function(event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      queueHeroPortraitScan();
    });

    let heroPortraitMode = document.documentElement.getAttribute('data-portfolio-mode');
    const heroPortraitModeObserver = new MutationObserver(function() {
      const nextMode = document.documentElement.getAttribute('data-portfolio-mode');
      if (nextMode === 'enhanced' && heroPortraitMode !== 'enhanced') {
        updateHeroPortraitInteractivity();
        startHeroPortraitEntrance();
      } else if (nextMode !== 'enhanced') {
        stopHeroPortraitEntrance();
        updateHeroPortraitInteractivity();
      }
      heroPortraitMode = nextMode;
    });
    heroPortraitModeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-portfolio-mode']
    });

    if (typeof reduceMotionQuery.addEventListener === 'function') {
      reduceMotionQuery.addEventListener('change', function() {
        if (reduceMotionQuery.matches) stopHeroPortraitEntrance();
      });
    }

    updateHeroPortraitInteractivity();
    if (heroPortraitMode === 'enhanced') {
      window.requestAnimationFrame(startHeroPortraitEntrance);
    } else {
      resetHeroPortrait();
    }
  }

  // Enhanced-only hero identification sequence. The nameplate remains a hover/focus-only interaction.
  const heroRole = document.querySelector('.hero-identity-enhanced.title');
  const heroCapabilityLabels = Array.from(document.querySelectorAll('.hero-identity-enhanced.tagline .tagline-item'));

  if (heroRole || heroCapabilityLabels.length) {
    let heroIdentificationFrame = 0;
    let heroIdentificationFinishTimer = 0;
    let heroIdentificationGeneration = 0;
    const pendingCapabilityConfirmations = new Set();

    const runCapabilityConfirmation = function(label) {
      if (document.documentElement.getAttribute('data-portfolio-mode') !== 'enhanced') return;
      label.classList.remove('is-capability-confirming');
      void label.offsetWidth;
      label.classList.add('is-capability-confirming');
    };

    const resetHeroIdentification = function(runPendingConfirmations) {
      if (heroRole) {
        heroRole.classList.remove('is-hero-role-confirming');
      }
      heroCapabilityLabels.forEach(function(label) {
        label.classList.remove('is-hero-capability-activating');
        label.style.removeProperty('--hero-capability-delay');
        if (runPendingConfirmations && pendingCapabilityConfirmations.has(label)) {
          pendingCapabilityConfirmations.delete(label);
          runCapabilityConfirmation(label);
        }
      });
    };

    const stopHeroIdentification = function() {
      heroIdentificationGeneration += 1;
      if (heroIdentificationFrame) window.cancelAnimationFrame(heroIdentificationFrame);
      if (heroIdentificationFinishTimer) window.clearTimeout(heroIdentificationFinishTimer);
      heroIdentificationFrame = 0;
      heroIdentificationFinishTimer = 0;
      pendingCapabilityConfirmations.clear();
      heroCapabilityLabels.forEach(function(label) { label.classList.remove('is-capability-confirming'); });
      resetHeroIdentification(false);
    };

    const startHeroIdentification = function() {
      stopHeroIdentification();
      if (reduceMotionQuery.matches || document.documentElement.getAttribute('data-portfolio-mode') !== 'enhanced') return;

      const animationGeneration = heroIdentificationGeneration;
      heroIdentificationFrame = window.requestAnimationFrame(function() {
        heroIdentificationFrame = 0;
        if (animationGeneration !== heroIdentificationGeneration || reduceMotionQuery.matches || document.documentElement.getAttribute('data-portfolio-mode') !== 'enhanced') return;

        if (heroRole) heroRole.classList.add('is-hero-role-confirming');

        heroCapabilityLabels.forEach(function(label, index) {
          label.style.setProperty('--hero-capability-delay', (500 + (index * 80)) + 'ms');
          label.classList.add('is-hero-capability-activating');
        });
        heroIdentificationFinishTimer = window.setTimeout(function() {
          if (animationGeneration !== heroIdentificationGeneration) return;
          resetHeroIdentification(true);
          heroIdentificationFinishTimer = 0;
        }, 900);
      });
    };

    let heroIdentificationMode = document.documentElement.getAttribute('data-portfolio-mode');
    const heroIdentificationModeObserver = new MutationObserver(function() {
      const nextMode = document.documentElement.getAttribute('data-portfolio-mode');
      if (nextMode === 'enhanced' && heroIdentificationMode !== 'enhanced') {
        startHeroIdentification();
      } else if (nextMode !== 'enhanced') {
        stopHeroIdentification();
      }
      heroIdentificationMode = nextMode;
    });
    heroIdentificationModeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-portfolio-mode']
    });

    if (typeof reduceMotionQuery.addEventListener === 'function') {
      reduceMotionQuery.addEventListener('change', function() {
        if (reduceMotionQuery.matches) stopHeroIdentification();
      });
    }

    if (heroIdentificationMode === 'enhanced') {
      window.requestAnimationFrame(startHeroIdentification);
    } else {
      resetHeroIdentification(false);
    }

    heroCapabilityLabels.forEach(function(label) {
      label.addEventListener('click', function() {
        if (document.documentElement.getAttribute('data-portfolio-mode') !== 'enhanced') return;
        if (label.classList.contains('is-hero-capability-activating')) {
          pendingCapabilityConfirmations.add(label);
          return;
        }
        runCapabilityConfirmation(label);
      });
      label.addEventListener('animationend', function(event) {
        if (event.target !== label) return;
        if (event.animationName !== 'hero-capability-confirm' && event.animationName !== 'hero-capability-confirm-reduced') return;
        label.classList.remove('is-capability-confirming');
      });
    });
  }

  // --- Shared guard for selectable content inside interactive panels ---
  const panelGestureStates = new WeakMap();
  const panelInteractiveSelector = "a, button, input, textarea, select, option, label, summary, [contenteditable='true'], [data-own-interaction]";

  function selectedTextInPanel(panel) {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) return '';
    const anchor = selection.anchorNode;
    const focus = selection.focusNode;
    const containsNode = node => node && panel.contains(node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement);
    return containsNode(anchor) || containsNode(focus) ? selection.toString() : '';
  }

  function getPanelGestureState(panel) {
    if (!panelGestureStates.has(panel)) {
      panelGestureStates.set(panel, { startX: 0, startY: 0, didDrag: false, selectionBefore: '', suppressNextClick: false, toggleTimer: 0 });
    }
    return panelGestureStates.get(panel);
  }

  function trackPanelPointerStart(panel, event) {
    const state = getPanelGestureState(panel);
    if (event.button !== 0) {
      state.didDrag = false;
      return;
    }
    state.startX = event.clientX;
    state.startY = event.clientY;
    state.didDrag = false;
    state.selectionBefore = selectedTextInPanel(panel);
    state.suppressNextClick = false;
  }

  function trackPanelPointerMove(panel, event) {
    const state = getPanelGestureState(panel);
    if (Math.hypot(event.clientX - state.startX, event.clientY - state.startY) > 5) {
      state.didDrag = true;
    }
  }

  function clearPanelPointer(panel) {
    const state = getPanelGestureState(panel);
    state.didDrag = false;
    state.selectionBefore = '';
  }

  function recordPanelSelectionGesture(panel) {
    const state = getPanelGestureState(panel);
    const selectionAfter = selectedTextInPanel(panel);
    state.suppressNextClick = Boolean(
      state.didDrag && selectionAfter && selectionAfter !== state.selectionBefore
    );
  }

  function shouldIgnorePanelToggle(event, panel) {
    if (event.button !== undefined && event.button !== 0) return true;

    const target = event.target instanceof Element ? event.target : null;
    if (target && target.closest(panelInteractiveSelector)) return true;

    const state = getPanelGestureState(panel);
    if (state.suppressNextClick) {
      state.suppressNextClick = false;
      return true;
    }
    const selectionAfter = selectedTextInPanel(panel);
    const createdSelection = Boolean(selectionAfter && selectionAfter !== state.selectionBefore);
    return createdSelection && (state.didDrag || event.detail > 1);
  }

  function addPanelPointerTracking(panel) {
    panel.addEventListener('pointerdown', event => trackPanelPointerStart(panel, event));
    panel.addEventListener('pointermove', event => trackPanelPointerMove(panel, event));
    panel.addEventListener('pointercancel', () => clearPanelPointer(panel));
  }

  function requestPanelToggle(panel, event, toggle) {
    const state = getPanelGestureState(panel);
    if (shouldIgnorePanelToggle(event, panel)) {
      if (state.toggleTimer) clearTimeout(state.toggleTimer);
      state.toggleTimer = 0;
      clearPanelPointer(panel);
      return;
    }

    if (event.detail > 1) {
      if (state.toggleTimer) clearTimeout(state.toggleTimer);
      state.toggleTimer = 0;
      clearPanelPointer(panel);
      return;
    }

    if (state.toggleTimer) clearTimeout(state.toggleTimer);
    state.toggleTimer = window.setTimeout(() => {
      state.toggleTimer = 0;
      toggle();
    }, 180);
    clearPanelPointer(panel);
  }

  // --- Bio ---
  function setBioExpanded(expanded) {
    if (!bioSummary) return;

    const nextExpanded = Boolean(expanded);
    const prefersReducedMotion = reduceMotionQuery.matches;

    if (bioAnimationFrame) {
      cancelAnimationFrame(bioAnimationFrame);
      bioAnimationFrame = 0;
    }

    if (bioAnimationTimeout) {
      clearTimeout(bioAnimationTimeout);
      bioAnimationTimeout = 0;
    }

    const currentHeight = bioSummary.getBoundingClientRect().height;

    if (prefersReducedMotion) {
      bioSummary.classList.remove('is-animating');
      bioSummary.style.height = '';
      bioSummary.classList.toggle('is-expanded', nextExpanded);
      bioSummary.setAttribute('aria-expanded', String(nextExpanded));
      return;
    }

    bioAnimationToken += 1;
    const animationToken = bioAnimationToken;

    bioSummary.classList.add('is-animating');
    bioSummary.style.height = `${currentHeight}px`;
    bioSummary.classList.toggle('is-expanded', nextExpanded);
    bioSummary.setAttribute('aria-expanded', String(nextExpanded));

    bioSummary.style.height = 'auto';
    const targetHeight = bioSummary.getBoundingClientRect().height;
    bioSummary.style.height = `${currentHeight}px`;

    if (Math.abs(targetHeight - currentHeight) < 1) {
      bioSummary.classList.remove('is-animating');
      bioSummary.style.height = '';
      return;
    }

    bioSummary.offsetHeight;

    bioAnimationFrame = requestAnimationFrame(() => {
      bioAnimationFrame = 0;
      bioSummary.style.height = `${targetHeight}px`;
    });

    const finishBioAnimation = () => {
      if (animationToken !== bioAnimationToken || !bioSummary) return;
      bioSummary.classList.remove('is-animating');
      bioSummary.style.height = '';
      if (bioAnimationTimeout) {
        clearTimeout(bioAnimationTimeout);
        bioAnimationTimeout = 0;
      }
    };

    bioSummary.addEventListener('transitionend', (event) => {
      if (event.propertyName !== 'height') return;
      finishBioAnimation();
    }, { once: true });

    bioAnimationTimeout = window.setTimeout(finishBioAnimation, 420);
  }

  // --- Navigation and responsive layout ---
  function isDrawerOpen() {
    return Boolean(window.PortfolioNavigation && window.PortfolioNavigation.isDrawerOpen());
  }

  function setDrawerOpen(open) {
    if (window.PortfolioNavigation) window.PortfolioNavigation.setDrawerOpen(open);
  }

  // Close drawer on window resize to desktop size
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && typeof setContactDrawerOpen === 'function') {
      setContactDrawerOpen(false);
    }
    
    // Keep the desktop Contact sidebar in its column at every desktop height.
    checkContactPanelPosition();
  });

  // The sidebar remains sticky on desktop; the shared panel becomes a drawer below this breakpoint.
  function checkContactPanelPosition() {
    if (grid) grid.classList.remove('contact-bottom');
  }

  // Initial check
  checkContactPanelPosition();

  // --- Contact and clipboard behavior ---
  const copyResetTimers = new WeakMap();
  const emailResetTimers = new WeakMap();

  async function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch (err) {
        // Fall back to the legacy clipboard path below.
      }
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    try {
      const success = document.execCommand('copy');
      if (!success) {
        throw new Error('Copy command failed');
      }
      return Promise.resolve();
    } finally {
      document.body.removeChild(textarea);
    }
  }

  function flashCopyButton(button, label) {
    const originalLabel = button.dataset.originalLabel || button.getAttribute('aria-label') || 'Copy email';
    if (!button.dataset.originalLabel) {
      button.dataset.originalLabel = originalLabel;
    }

    button.classList.add('copied');
    button.setAttribute('aria-label', label);

    const existingTimer = copyResetTimers.get(button);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      button.classList.remove('copied');
      button.setAttribute('aria-label', button.dataset.originalLabel || 'Copy email');
      copyResetTimers.delete(button);
    }, 1400);

    copyResetTimers.set(button, timer);
  }

  function resetCopyButton(button) {
    if (!button) return;

    const existingTimer = copyResetTimers.get(button);
    if (existingTimer) {
      clearTimeout(existingTimer);
      copyResetTimers.delete(button);
    }

    button.classList.remove('copied');
    button.setAttribute('aria-label', button.dataset.originalLabel || 'Copy email');
  }

  function clearEmailResetTimer(valueEl) {
    const timers = emailResetTimers.get(valueEl);
    if (!timers) return;

    if (timers.fadeTimer) {
      clearTimeout(timers.fadeTimer);
    }
    if (timers.restoreTimer) {
      clearTimeout(timers.restoreTimer);
    }

    emailResetTimers.delete(valueEl);
  }

  function getEmailCopyState(valueEl) {
    if (!valueEl) return 'idle';
    if (valueEl.classList.contains('is-copy-fading')) return 'restoring';
    if (valueEl.classList.contains('is-copy-active')) return 'message';
    return 'idle';
  }

  function restoreEmailCopyState(valueEl) {
    if (!valueEl) return;

    const originalText = valueEl.dataset.originalText || valueEl.dataset.defaultText || valueEl.textContent;
    clearEmailResetTimer(valueEl);
    valueEl.classList.add('is-copy-fading');

    const restoreTimer = setTimeout(() => {
      valueEl.textContent = originalText;
      requestAnimationFrame(() => {
        valueEl.classList.remove('is-copy-fading', 'is-copy-active');
      });
      emailResetTimers.delete(valueEl);
    }, 180);

    emailResetTimers.set(valueEl, { restoreTimer });
  }

  function flashEmailCopyState(valueEl, message) {
    const originalText = valueEl.dataset.originalText || valueEl.textContent;
    if (!valueEl.dataset.originalText) {
      valueEl.dataset.originalText = originalText;
    }

    clearEmailResetTimer(valueEl);

    valueEl.classList.remove('is-copy-fading');
    valueEl.classList.add('is-copy-active');
    valueEl.textContent = message;

    const fadeTimer = setTimeout(() => {
      restoreEmailCopyState(valueEl);
    }, 2000);

    emailResetTimers.set(valueEl, { fadeTimer });
  }

  async function copyEmailAddress() {
    const copyText = (emailRow && emailRow.dataset.copyText) || (copyEmailButton && copyEmailButton.dataset.copyText) || '';
    if (!copyText) return;

    try {
      await copyTextToClipboard(copyText);
      if (copyEmailButton) {
        flashCopyButton(copyEmailButton, 'Copied to clipboard!');
      }
      if (emailValue) {
        flashEmailCopyState(emailValue, 'Copied to clipboard!');
      }
    } catch (err) {
      if (copyEmailButton) {
        flashCopyButton(copyEmailButton, 'Copy failed!');
      }
      if (emailValue) {
        flashEmailCopyState(emailValue, 'Copy failed!');
      }
    }
  }

  function handleEmailRowActivation() {
    const emailState = getEmailCopyState(emailValue);

    if (emailState === 'restoring') {
      return;
    }

    if (emailState === 'message') {
      restoreEmailCopyState(emailValue);
      resetCopyButton(copyEmailButton);
      return;
    }

    copyEmailAddress();
  }

  function syncEmailValueWidth() {
    if (!emailValue) return;

    const currentText = emailValue.textContent;
    const basisText = emailValue.dataset.defaultText || emailValue.dataset.originalText || currentText;

    emailValue.style.width = 'auto';
    emailValue.style.minWidth = '0px';
    emailValue.textContent = basisText;
    const width = Math.ceil(emailValue.getBoundingClientRect().width);
    emailValue.style.width = `${width}px`;
    emailValue.style.minWidth = `${width}px`;
    emailValue.textContent = currentText;
  }

  // Let users drag to select contact text, while keeping normal clicks navigable.
  document.querySelectorAll('.contact-item').forEach(item => {
    let pointerDown = false;
    let dragged = false;
    let startX = 0;
    let startY = 0;

    item.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      pointerDown = true;
      dragged = false;
      startX = e.clientX;
      startY = e.clientY;
    });

    item.addEventListener('pointermove', (e) => {
      if (!pointerDown) return;
      const dx = Math.abs(e.clientX - startX);
      const dy = Math.abs(e.clientY - startY);
      if (dx > 6 || dy > 6) {
        dragged = true;
      }
    });

    const clearPointerState = () => {
      pointerDown = false;
    };

    item.addEventListener('pointerup', clearPointerState);
    item.addEventListener('pointercancel', clearPointerState);
    item.addEventListener('click', (e) => {
      if (item.classList.contains('contact-item-email')) {
        if (dragged) {
          e.preventDefault();
          e.stopPropagation();
          dragged = false;
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        handleEmailRowActivation();
        return;
      }

      if (dragged) {
        e.preventDefault();
        e.stopPropagation();
        dragged = false;
        return;
      }

    });

  });

  const emailRow = document.querySelector('.contact-item-email');
  const copyEmailButton = document.querySelector('.copy-email-btn');
  const copyEmailControl = document.querySelector('.copy-email-control');
  const emailValue = document.querySelector('.contact-value-email');

  if (emailRow) {
    emailRow.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleEmailRowActivation();
      }
    });
  }

  if (copyEmailControl) {
    copyEmailControl.addEventListener('pointerenter', () => {
      if (!copyEmailControl.classList.contains('tooltip-suppressed')) {
        copyEmailControl.classList.add('tooltip-visible');
      }
    });

    copyEmailControl.addEventListener('pointerleave', () => {
      copyEmailControl.classList.remove('tooltip-visible', 'tooltip-suppressed');
    });

    copyEmailControl.addEventListener('focusin', () => {
      if (!copyEmailControl.classList.contains('tooltip-suppressed')) {
        copyEmailControl.classList.add('tooltip-visible');
      }
    });

    copyEmailControl.addEventListener('focusout', () => {
      copyEmailControl.classList.remove('tooltip-visible');
    });
  }

  if (copyEmailButton) {
    copyEmailButton.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && copyEmailControl) {
        copyEmailControl.classList.add('tooltip-suppressed');
        copyEmailControl.classList.remove('tooltip-visible');
      }
    });

    copyEmailButton.addEventListener('click', (e) => {
      if (e.detail === 0 && copyEmailControl) {
        copyEmailControl.classList.remove('tooltip-visible');
      }
    });
  }

  syncEmailValueWidth();
  window.addEventListener('resize', syncEmailValueWidth);

  // --- In-page navigation and scroll spy ---
  // Smooth scroll for in-page links (except contact buttons which are handled separately)
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    // Skip ALL contact buttons as they're handled by their own listener
    if(a.classList.contains('contact') || 
       a.classList.contains('nav-contact-btn') || 
       (a.getAttribute('href') === '#contact' && (a.closest('.drawer') || a.closest('.nav-links')))) {
      return;
    }
    
    a.addEventListener('click', e=>{
      const target = document.querySelector(a.getAttribute('href'));
      if(target){ 
        e.preventDefault(); 
        target.scrollIntoView({behavior:'smooth',block:'start'}); 
      }
    });
  });

  // Keep same-page navigation semantically synchronized with the section in view.
  // The visual treatment is scoped to Enhanced mode in CSS; this state remains useful to assistive technology in either mode.
  const navigationSectionIds = ['about', 'projects', 'experience', 'skills'];
  const sectionNavLinks = navigationSectionIds
    .map(sectionId => {
      const link = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
      const target = document.getElementById(sectionId);
      return link && target ? { sectionId, link, target } : null;
    })
    .filter(Boolean);

  // Enhanced desktop primary navigation: a measured terminal cursor follows
  // individual label glyphs without changing the accessible navigation names.
  const primaryNavRail = document.querySelector('.nav-primary-rail');
  if (primaryNavRail && primaryNavRail.dataset.characterCursorReady !== 'true') {
    const primaryNavMedia = window.matchMedia('(min-width: 901px)');
    const primaryNavControls = Array.from(primaryNavRail.querySelectorAll(':scope > a, :scope > .nav-portfolio > .nav-portfolio-trigger'));
    let primaryNavMeasureFrame = 0;
    let primaryNavPointerFrame = 0;
    let pendingPrimaryNavPointer = null;
    const NAV_CURSOR_CLICK_HOLD_MS = 450;
    let clickLatchedControl = null;
    let clickLatchStartedAt = 0;
    let clickLatchConfirmationTimer = 0;

    const primaryNavRecords = primaryNavControls.map(function(control) {
      const labelNode = Array.from(control.childNodes).find(function(node) {
        return node.nodeType === Node.TEXT_NODE && node.textContent.trim();
      });
      if (!labelNode) return null;

      const label = labelNode.textContent.trim();
      const visualLabel = document.createElement('span');
      visualLabel.className = 'nav-label-visual';
      visualLabel.setAttribute('aria-hidden', 'true');
      Array.from(label).forEach(function(character) {
        const characterElement = document.createElement('span');
        characterElement.className = 'nav-label-char';
        characterElement.textContent = character;
        visualLabel.appendChild(characterElement);
      });

      const cursor = document.createElement('span');
      cursor.className = 'nav-character-cursor';
      cursor.setAttribute('aria-hidden', 'true');
      control.insertBefore(visualLabel, labelNode);
      labelNode.remove();
      control.appendChild(cursor);
      control.classList.add('nav-character-control');
      if (control.tagName === 'A' && !control.hasAttribute('aria-label')) control.setAttribute('aria-label', label);

      return {
        control: control,
        characters: Array.from(visualLabel.querySelectorAll('.nav-label-char')),
        cursor: cursor,
        metrics: null
      };
    }).filter(Boolean);

    const primaryNavIsInteractive = function() {
      return primaryNavMedia.matches && document.documentElement.getAttribute('data-portfolio-mode') === 'enhanced';
    };

    const measurePrimaryNavRecord = function(record) {
      const characters = record.characters.map(function(character) {
        const rect = character.getBoundingClientRect();
        return {
          element: character,
          centerX: rect.left + rect.width / 2,
          left: rect.left,
          right: rect.right,
          offsetLeft: character.offsetLeft,
          width: character.offsetWidth
        };
      });
      return {
        characters: characters,
        left: characters.length ? characters[0].left : 0,
        right: characters.length ? characters[characters.length - 1].right : 0
      };
    };

    const positionPrimaryNavCursor = function(record, character) {
      const target = character || record.characters[0];
      if (!target) return;
      const targetMetrics = record.metrics && record.metrics.characters.find(function(metrics) {
        return metrics.element === target;
      });
      record.control.style.setProperty('--nav-cursor-x', (targetMetrics ? targetMetrics.offsetLeft : target.offsetLeft) + 'px');
      record.control.style.setProperty('--nav-cursor-width', (targetMetrics ? targetMetrics.width : target.offsetWidth) + 'px');
    };

    const clearPrimaryNavTransientState = function() {
      clickLatchedControl = null;
      clickLatchStartedAt = 0;
      if (clickLatchConfirmationTimer) window.clearTimeout(clickLatchConfirmationTimer);
      clickLatchConfirmationTimer = 0;
      pendingPrimaryNavPointer = null;
      if (primaryNavPointerFrame) window.cancelAnimationFrame(primaryNavPointerFrame);
      primaryNavPointerFrame = 0;
      primaryNavRail.classList.remove('has-nav-pointer-owner', 'has-nav-focus-owner');
      primaryNavRecords.forEach(function(record) {
        record.control.classList.remove('is-nav-pointer-owner', 'is-nav-focus-owner');
        positionPrimaryNavCursor(record);
      });
    };

    const measurePrimaryNavCursors = function() {
      primaryNavMeasureFrame = 0;
      primaryNavRecords.forEach(function(record) {
        record.metrics = measurePrimaryNavRecord(record);
      });
      primaryNavRecords.forEach(function(record) {
        positionPrimaryNavCursor(record);
      });
      if (!primaryNavIsInteractive()) clearPrimaryNavTransientState();
    };

    const schedulePrimaryNavMeasure = function() {
      if (primaryNavMeasureFrame) window.cancelAnimationFrame(primaryNavMeasureFrame);
      primaryNavMeasureFrame = window.requestAnimationFrame(measurePrimaryNavCursors);
    };

    const updatePrimaryNavPointer = function() {
      primaryNavPointerFrame = 0;
      const pending = pendingPrimaryNavPointer;
      pendingPrimaryNavPointer = null;
      if (!pending || !primaryNavIsInteractive()) return;

      const record = pending.record;
      const tolerance = 4;
      const metrics = record.metrics || measurePrimaryNavRecord(record);
      record.metrics = metrics;
      let hoveredCharacter = null;
      if (metrics.characters.length && pending.clientX >= metrics.left - tolerance && pending.clientX <= metrics.right + tolerance) {
        let nearestDistance = Infinity;
        metrics.characters.forEach(function(characterMetrics) {
          const distance = Math.abs(pending.clientX - characterMetrics.centerX);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            hoveredCharacter = characterMetrics.element;
          }
        });
      }

      positionPrimaryNavCursor(record, hoveredCharacter || record.characters[0]);
    };

    primaryNavRecords.forEach(function(record) {
      record.control.addEventListener('pointerenter', function() {
        if (!primaryNavIsInteractive()) return;
        if (clickLatchedControl && clickLatchedControl !== record.control) {
          clickLatchedControl = null;
          clickLatchStartedAt = 0;
          if (clickLatchConfirmationTimer) window.clearTimeout(clickLatchConfirmationTimer);
          clickLatchConfirmationTimer = 0;
        }
        record.metrics = measurePrimaryNavRecord(record);
        primaryNavRail.classList.add('has-nav-pointer-owner');
        primaryNavRecords.forEach(function(candidate) {
          candidate.control.classList.toggle('is-nav-pointer-owner', candidate === record);
        });
        positionPrimaryNavCursor(record);
      });

      record.control.addEventListener('pointermove', function(event) {
        if (!primaryNavIsInteractive()) return;
        if (clickLatchedControl === record.control) {
          positionPrimaryNavCursor(record);
          return;
        }
        pendingPrimaryNavPointer = { record: record, clientX: event.clientX };
        if (!primaryNavPointerFrame) primaryNavPointerFrame = window.requestAnimationFrame(updatePrimaryNavPointer);
      });

      record.control.addEventListener('pointerleave', function() {
        pendingPrimaryNavPointer = null;
        if (primaryNavPointerFrame) window.cancelAnimationFrame(primaryNavPointerFrame);
        primaryNavPointerFrame = 0;
        if (clickLatchedControl === record.control) {
          positionPrimaryNavCursor(record);
          return;
        }
        primaryNavRail.classList.remove('has-nav-pointer-owner');
        record.control.classList.remove('is-nav-pointer-owner');
        positionPrimaryNavCursor(record);
      });

      record.control.addEventListener('focus', function() {
        if (!primaryNavIsInteractive()) return;
        primaryNavRail.classList.add('has-nav-focus-owner');
        record.control.classList.add('is-nav-focus-owner');
        positionPrimaryNavCursor(record);
      });

      record.control.addEventListener('blur', function() {
        primaryNavRail.classList.remove('has-nav-focus-owner');
        record.control.classList.remove('is-nav-focus-owner');
        positionPrimaryNavCursor(record);
      });

      record.control.addEventListener('click', function(event) {
        if (!primaryNavIsInteractive() || event.detail === 0) return;
        clickLatchedControl = record.control;
        clickLatchStartedAt = performance.now();
        if (clickLatchConfirmationTimer) window.clearTimeout(clickLatchConfirmationTimer);
        clickLatchConfirmationTimer = window.setTimeout(function() {
          clickLatchConfirmationTimer = 0;
          if (clickLatchedControl !== record.control || clickLatchStartedAt === 0) return;
          positionPrimaryNavCursor(record);
        }, NAV_CURSOR_CLICK_HOLD_MS);
        pendingPrimaryNavPointer = null;
        if (primaryNavPointerFrame) window.cancelAnimationFrame(primaryNavPointerFrame);
        primaryNavPointerFrame = 0;
        primaryNavRail.classList.add('has-nav-pointer-owner');
        primaryNavRecords.forEach(function(candidate) {
          candidate.control.classList.toggle('is-nav-pointer-owner', candidate === record);
        });
        positionPrimaryNavCursor(record);
      });
    });

    primaryNavRail.addEventListener('pointerleave', function() {
      clearPrimaryNavTransientState();
    });

    window.addEventListener('resize', schedulePrimaryNavMeasure, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedulePrimaryNavMeasure);
    if (typeof primaryNavMedia.addEventListener === 'function') primaryNavMedia.addEventListener('change', schedulePrimaryNavMeasure);
    else primaryNavMedia.addListener(schedulePrimaryNavMeasure);
    const primaryNavModeObserver = new MutationObserver(schedulePrimaryNavMeasure);
    primaryNavModeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-portfolio-mode'] });
    schedulePrimaryNavMeasure();
  }

  function setCurrentSection(link) {
    if (!link) return;

    sectionNavLinks.forEach(({ link: navLink }) => {
      if (navLink === link) {
        navLink.setAttribute('aria-current', 'location');
      } else {
        navLink.removeAttribute('aria-current');
      }
    });

    const href = link.getAttribute('href');
    document.querySelectorAll(`.drawer a[href="${href}"]`).forEach(drawerLink => {
      drawerLink.setAttribute('aria-current', 'location');
    });
    sectionNavLinks
      .filter(({ link: navLink }) => navLink !== link)
      .forEach(({ link: navLink }) => {
        const otherHref = navLink.getAttribute('href');
        document.querySelectorAll(`.drawer a[href="${otherHref}"]`).forEach(drawerLink => {
          drawerLink.removeAttribute('aria-current');
        });
      });
  }

  function syncCurrentSection() {
    if (!sectionNavLinks.length) return;

    const activationLine = 120;
    const measuredSections = sectionNavLinks.map(item => ({ ...item, rect: item.target.getBoundingClientRect() }));
    let current = measuredSections.find(item => item.rect.top <= activationLine && item.rect.bottom > activationLine);

    if (!current) {
      const passedSections = measuredSections
        .filter(item => item.rect.top <= activationLine)
        .sort((a, b) => b.rect.top - a.rect.top);
      const upcomingSections = measuredSections
        .filter(item => item.rect.top > activationLine)
        .sort((a, b) => a.rect.top - b.rect.top);
      current = passedSections[0] || upcomingSections[0] || measuredSections[0];
    }
    setCurrentSection(current.link);
  }

  if (sectionNavLinks.length) {
    let sectionSyncFrame = 0;
    const requestSectionSync = () => {
      if (sectionSyncFrame) return;
      sectionSyncFrame = requestAnimationFrame(() => {
        sectionSyncFrame = 0;
        syncCurrentSection();
      });
    };

    sectionNavLinks.forEach(({ link }) => link.addEventListener('click', () => setCurrentSection(link)));
    window.addEventListener('scroll', requestSectionSync, { passive: true });
    window.addEventListener('hashchange', () => {
      const hashMatch = sectionNavLinks.find(({ link }) => link.getAttribute('href') === window.location.hash);
      if (hashMatch) {
        setCurrentSection(hashMatch.link);
      } else {
        syncCurrentSection();
      }
    });
    window.addEventListener('resize', requestSectionSync);
    const initialHashMatch = sectionNavLinks.find(({ link }) => link.getAttribute('href') === window.location.hash);
    if (initialHashMatch) {
      setCurrentSection(initialHashMatch.link);
    } else {
      syncCurrentSection();
    }
  }

  if (brandLink) {
    brandLink.addEventListener('click', (e) => {
      if (!isUnmodifiedPrimaryClick(e)) return;

      e.preventDefault();
      if (window.innerWidth <= 900 && isDrawerOpen()) {
        setDrawerOpen(false);
      }
      scrollPageToTop();
    });
  }

  // --- Utility controls ---
  // Back to top button functionality
  if(backToTop) {
    let isVisible = false;
    
    window.addEventListener('scroll', () => {
      const shouldShow = window.pageYOffset > 300;
      
      if (shouldShow && !isVisible) {
        // Show with bounce animation
        backToTop.classList.remove('hiding');
        backToTop.classList.add('visible');
        isVisible = true;
      } else if (!shouldShow && isVisible) {
        // Hide with bounce animation
        backToTop.classList.add('hiding');
        isVisible = false;
        
        // Wait for animation to finish before hiding
        setTimeout(() => {
          if (!isVisible) {
            backToTop.classList.remove('visible', 'hiding');
          }
        }, 400);
      }
    });

    backToTop.addEventListener('click', () => {
      scrollPageToTop();
    });
  }

  if (bioSummary) {
    addPanelPointerTracking(bioSummary);
    bioSummary.addEventListener('click', event => {
      requestPanelToggle(bioSummary, event, () => {
        setBioExpanded(!bioSummary.classList.contains('is-expanded'));
      });
    });

    bioSummary.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setBioExpanded(!bioSummary.classList.contains('is-expanded'));
      } else if (e.key === 'Escape') {
        setBioExpanded(false);
      }
    });
  }

  // --- Skills ---
  // Skills flip functionality - FIXED: proper event delegation
  const skillsGrid = document.querySelector('.skills-grid');
  document.querySelectorAll('.skill-items > p').forEach(item => {
    const textNode = Array.from(item.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim());
    if (!textNode || !textNode.nodeValue.trimStart().startsWith('•')) return;

    const marker = document.createElement('span');
    marker.className = 'skill-native-bullet';
    marker.setAttribute('aria-hidden', 'true');
    marker.textContent = '• ';
    textNode.nodeValue = textNode.nodeValue.replace(/^\s*•\s*/, '');
    item.insertBefore(marker, textNode);
  });
  if (skillsGrid) {
    function syncSkillFaces(skill) {
      const flipped = skill.classList.contains('flipped');
      const front = skill.querySelector('.skill-front');
      const back = skill.querySelector('.skill-back');
      if (front) front.setAttribute('aria-hidden', String(flipped));
      if (back) back.setAttribute('aria-hidden', String(!flipped));
    }

    skillsGrid.querySelectorAll('.skill').forEach(syncSkillFaces);

    skillsGrid.addEventListener('pointerdown', event => {
      const skill = event.target.closest('.skill');
      if (!skill) return;
      trackPanelPointerStart(skill, event);
    });
    skillsGrid.addEventListener('pointermove', event => {
      const skill = event.target.closest('.skill');
      if (skill) trackPanelPointerMove(skill, event);
    });
    skillsGrid.addEventListener('pointerup', event => {
      const skill = event.target.closest('.skill');
      if (!skill) return;
      recordPanelSelectionGesture(skill);
    });
    skillsGrid.addEventListener('pointercancel', event => {
      const skill = event.target.closest('.skill');
      if (skill) clearPanelPointer(skill);
    });
    skillsGrid.addEventListener('click', (e) => {
      const skill = e.target.closest('.skill');
      if (!skill) return;
      const target = e.target instanceof Element ? e.target : null;
      if (e.button !== 0 || (target && target.closest(panelInteractiveSelector))) return;
      e.stopPropagation();
      requestPanelToggle(skill, e, () => {
        skill.classList.toggle('flipped');
        syncSkillFaces(skill);
      });
    });

    skillsGrid.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const skill = e.target.closest('.skill');
      if (!skill || e.target !== skill) return;
      e.preventDefault();
      skill.classList.toggle('flipped');
      syncSkillFaces(skill);
    });
  }

  const capabilityButtons = Array.from(document.querySelectorAll('.capability-index [data-skill-target]'));
  capabilityButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.skillTarget;
      const targetRecord = targetId ? document.getElementById(targetId) : null;
      if (!targetRecord) return;

      capabilityButtons.forEach(item => {
        const selected = item === button;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      skillsGrid.querySelectorAll('.skill').forEach(skill => {
        skill.classList.toggle('is-capability-selected', skill === targetRecord);
      });

      const recordRect = targetRecord.getBoundingClientRect();
      const visibleTop = 92;
      const fullyVisible = recordRect.top >= visibleTop && recordRect.bottom <= window.innerHeight;
      if (!fullyVisible) {
        targetRecord.scrollIntoView({
          behavior: reduceMotionQuery.matches ? 'auto' : 'smooth',
          block: 'center'
        });
      }
    });
  });

  // --- Experience ---
  // Job experience expand functionality
  document.querySelectorAll('.job').forEach(job => {
    addPanelPointerTracking(job);
    const closeControl = job.querySelector('.job-close');
    const roleTitle = job.querySelector('h3');
    if (closeControl) {
      closeControl.setAttribute('role', 'button');
      closeControl.setAttribute('tabindex', '0');
      closeControl.setAttribute('aria-label', `Collapse ${roleTitle ? roleTitle.textContent.trim() : 'experience'}`);
    }
    const setJobExpanded = expanded => {
      job.classList.toggle('expanded', expanded);
      job.setAttribute('aria-expanded', String(expanded));
    };
    job.addEventListener('click', (e) => {
      if (e.target.closest('.job-close')) {
        e.stopPropagation();
        setJobExpanded(false);
        clearPanelPointer(job);
        return;
      }

      requestPanelToggle(job, e, () => setJobExpanded(!job.classList.contains('expanded')));
    });
    job.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      if (e.target.closest('.job-close')) {
        setJobExpanded(false);
        return;
      }
      setJobExpanded(!job.classList.contains('expanded'));
    });
  });

  // --- Projects ---
  // Projects expand functionality
  document.querySelectorAll('.proj').forEach(proj => {
    addPanelPointerTracking(proj);
    proj.addEventListener('click', (e) => {
      if (e.target.closest('.proj-close')) {
        e.stopPropagation();
        proj.classList.remove('expanded');
        clearPanelPointer(proj);
        return;
      }

      if (proj.classList.contains('proj--featured-system') && document.documentElement.getAttribute('data-portfolio-mode') === 'enhanced') {
        return;
      }

      requestPanelToggle(proj, e, () => proj.classList.toggle('expanded'));
    });
  });

  // --- Contact navigation actions ---
  const navContactButton = document.querySelector('.nav-links .nav-contact-btn');
  const drawerContactButton = document.querySelector('.drawer a[href="#contact"]');
  const contactDrawerClose = document.querySelector('.contact-drawer-close');
  const primaryColumn = grid && grid.firstElementChild;
  const siteNavigation = document.querySelector('.nav');
  let contactDrawerTrigger = null;

  function isContactDrawerOpen() {
    return Boolean(contactPanel && contactPanel.classList.contains('contact-drawer-open'));
  }

  function setContactDrawerOpen(open, trigger) {
    if (!contactPanel) return;
    const useDrawer = window.innerWidth <= 900;
    const nextOpen = Boolean(open && useDrawer);

    if (nextOpen && trigger) contactDrawerTrigger = trigger;
    contactPanel.classList.toggle('contact-drawer-open', nextOpen);
    document.body.classList.toggle('contact-drawer-open', nextOpen);

    if (nextOpen) {
      contactPanel.setAttribute('role', 'dialog');
      contactPanel.setAttribute('aria-modal', 'true');
      contactPanel.setAttribute('aria-hidden', 'false');
      if (primaryColumn) primaryColumn.inert = true;
      if (siteNavigation) siteNavigation.inert = true;
      window.setTimeout(() => contactDrawerClose && contactDrawerClose.focus(), 0);
    } else {
      contactPanel.removeAttribute('role');
      contactPanel.removeAttribute('aria-modal');
      contactPanel.removeAttribute('aria-hidden');
      if (primaryColumn) primaryColumn.inert = false;
      if (siteNavigation) siteNavigation.inert = false;
      if (contactDrawerTrigger && useDrawer) contactDrawerTrigger.focus();
      contactDrawerTrigger = null;
    }
  }

  function highlightContactPanel() {
    if (!contactPanel) return;
    contactPanel.classList.add('highlight-border');
    window.setTimeout(() => contactPanel.classList.remove('highlight-border'), 700);
  }

  function contactPanelIsVisible() {
    if (!contactPanel) return false;
    const rect = contactPanel.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
  }

  [navContactButton, drawerContactButton].forEach(contactTrigger => {
    if (!contactTrigger) return;
    contactTrigger.setAttribute('aria-controls', 'contactPanel');
    contactTrigger.addEventListener('click', event => {
      event.preventDefault();
      if (window.innerWidth <= 900) {
        if (isDrawerOpen()) setDrawerOpen(false);
        setContactDrawerOpen(true, contactTrigger);
        return;
      }

      if (!contactPanelIsVisible()) {
        contactPanel.scrollIntoView({ behavior: reduceMotionQuery.matches ? 'auto' : 'smooth', block: 'start' });
      }
      highlightContactPanel();
    });
  });

  if (contactDrawerClose) {
    contactDrawerClose.addEventListener('click', () => setContactDrawerOpen(false));
  }

  document.addEventListener('keydown', event => {
    if (!isContactDrawerOpen()) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setContactDrawerOpen(false);
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = Array.from(contactPanel.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'))
      .filter(element => !element.hasAttribute('hidden'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  // Add tooltips to stat buttons with line breaks
  const stats = document.querySelectorAll('.stat');
  stats.forEach(stat => {
    const text = stat.querySelector('h4').textContent.trim();
    const desc = stat.querySelector('p').textContent.trim();
    
    if (text.includes('7+')) {
      stat.setAttribute('data-tooltip', 'Closed Circuit Racing\nAutocross\nDrifting');
    } else if (text.includes('2+')) {
      stat.setAttribute('data-tooltip', 'Autonomous vehicles\nServiceNow');
    } else if (text === 'NVIDIA') {
      stat.setAttribute('data-tooltip', 'Current Employer');
    } else if (text.includes('B.S. CS')) {
      stat.setAttribute('data-tooltip', 'Computer Science Degree');
    }
  });

  // Skills see more functionality
  const skillsSeeMore = document.getElementById('skillsSeeMore');

  function syncSkillsSeeMoreLabel() {
    if (!skillsSeeMore) return;
    const expanded = skillsSeeMore.getAttribute('aria-expanded') === 'true';
    skillsSeeMore.setAttribute('aria-label', expanded ? 'Show fewer skills' : 'Show more skills');
  }

  function getRenderedSkillColumnCount(grid) {
    const tracks = window.getComputedStyle(grid).gridTemplateColumns.trim();
    if (!tracks || tracks === 'none') return 1;

    const repeatMatch = tracks.match(/^repeat\(\s*(\d+)\s*,/);
    if (repeatMatch) return Number(repeatMatch[1]);

    let depth = 0;
    let count = 0;
    let hasTrack = false;

    for (const character of tracks) {
      if (character === '(') depth += 1;
      else if (character === ')') depth = Math.max(0, depth - 1);
      else if (/\s/.test(character) && depth === 0) {
        if (hasTrack) {
          count += 1;
          hasTrack = false;
        }
        continue;
      }

      hasTrack = true;
    }

    return Math.max(1, count + (hasTrack ? 1 : 0));
  }

  function getCollapsedSkillCount(columnCount) {
    if (columnCount >= 3) return 6;
    if (columnCount === 2) return 4;
    return 3;
  }

  function syncSkillsCollapsedCount() {
    if (!skillsGrid || !skillsSeeMore) return;

    const skillCards = Array.from(skillsGrid.querySelectorAll('.skill'));
    const columnCount = getRenderedSkillColumnCount(skillsGrid);
    const enhancedMode = document.documentElement.getAttribute('data-portfolio-mode') === 'enhanced';
    const expanded = skillsSeeMore.getAttribute('aria-expanded') === 'true';

    skillCards.forEach((skill, index) => {
      const collapsedCount = Math.min(skillCards.length, getCollapsedSkillCount(columnCount));
      const hiddenRecord = !enhancedMode && !expanded && index >= collapsedCount;
      skill.classList.toggle('skill-collapsed-hidden', hiddenRecord);
      skill.classList.toggle('skill-revealed', !enhancedMode && expanded && index >= collapsedCount);
    });

    skillsGrid.dataset.renderedColumns = String(columnCount);
    skillsSeeMore.hidden = enhancedMode
      ? !skillsGrid.querySelector('.skill-item-hidden')
      : skillCards.length <= getCollapsedSkillCount(columnCount);
  }
  
  if (skillsSeeMore && skillsGrid) {
    syncSkillsCollapsedCount();

    let skillsLayoutFrame;
    const scheduleSkillsVisibilitySync = () => {
      window.cancelAnimationFrame(skillsLayoutFrame);
      skillsLayoutFrame = window.requestAnimationFrame(syncSkillsCollapsedCount);
    };

    const skillsGridObserver = new ResizeObserver(scheduleSkillsVisibilitySync);
    skillsGridObserver.observe(skillsGrid);

    const skillsModeObserver = new MutationObserver(scheduleSkillsVisibilitySync);
    skillsModeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-portfolio-mode']
    });

    scheduleSkillsVisibilitySync();

    skillsSeeMore.addEventListener('click', function(e) {
      e.preventDefault();
      
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      
      if (isExpanded) {
        // Collapsing - different behavior for mobile vs desktop
        const isMobile = window.innerWidth <= 600;
        
        if (isMobile) {
          // Mobile: lock current scroll position, then adjust after collapse
          const currentScroll = window.pageYOffset;
          
          this.setAttribute('aria-expanded', 'false');
          skillsGrid.classList.remove('skills-expanded');
          syncSkillsSeeMoreLabel();
          syncSkillsCollapsedCount();
          
          // Keep scroll locked during collapse animation
          window.scrollTo({ top: currentScroll, behavior: 'auto' });
          
          // After collapse completes, scroll button to bottom of viewport
          setTimeout(() => {
            const buttonRect = skillsSeeMore.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const targetScroll = window.pageYOffset + buttonRect.top - viewportHeight + buttonRect.height + 20;
            window.scrollTo({ top: targetScroll, behavior: 'auto' });
          }, 500);
        } else {
          // Desktop: keep viewport completely static
          const scrollTop = window.pageYOffset;
          const skillsSection = document.getElementById('skills');
          const skillsTop = skillsSection.getBoundingClientRect().top + scrollTop;
          
          this.setAttribute('aria-expanded', 'false');
          skillsGrid.classList.remove('skills-expanded');
          syncSkillsSeeMoreLabel();
          syncSkillsCollapsedCount();
          
          // Calculate how much height was removed and adjust scroll to compensate
          requestAnimationFrame(() => {
            const heightDiff = skillsTop - (skillsSection.getBoundingClientRect().top + window.pageYOffset);
            
            // If we're scrolled past the skills section, adjust scroll to keep view static
            if (scrollTop > skillsTop) {
              window.scrollTo({ top: scrollTop - heightDiff, behavior: 'auto' });
            }
          });
        }
      } else {
        // Expanding
        this.setAttribute('aria-expanded', 'true');
        skillsGrid.classList.add('skills-expanded');
        syncSkillsSeeMoreLabel();
        syncSkillsCollapsedCount();
      }
    });
  }

  // Skills expand all functionality - triggers see more button
  const skillsExpandAll = document.getElementById('skillsExpandAll');
  
  if (skillsExpandAll && skillsSeeMore) {
    skillsExpandAll.addEventListener('click', () => {
      const isExpanded = skillsSeeMore.getAttribute('aria-expanded') === 'true';
      
      if (isExpanded) {
        // Collapse - trigger see more button to collapse
        skillsSeeMore.setAttribute('aria-expanded', 'false');
        skillsGrid.classList.remove('skills-expanded');
        skillsExpandAll.classList.remove('all-expanded');
        syncSkillsSeeMoreLabel();
        syncSkillsCollapsedCount();
      } else {
        // Expand - trigger see more button to expand
        skillsSeeMore.setAttribute('aria-expanded', 'true');
        skillsGrid.classList.add('skills-expanded');
        skillsExpandAll.classList.add('all-expanded');
        syncSkillsSeeMoreLabel();
        syncSkillsCollapsedCount();
      }
    });
    
    // Update expand all button when see more is clicked
    skillsSeeMore.addEventListener('click', () => {
      setTimeout(() => {
        const isExpanded = skillsSeeMore.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
          skillsExpandAll.classList.add('all-expanded');
        } else {
          skillsExpandAll.classList.remove('all-expanded');
        }
      }, 50);
    });
  }

  // Experience expand all functionality
  const experienceExpandAll = document.getElementById('experienceExpandAll');
  
  if (experienceExpandAll) {
    experienceExpandAll.addEventListener('click', () => {
      const isAllExpanded = experienceExpandAll.classList.contains('all-expanded');
      const jobs = document.querySelectorAll('.job');
      
      if (isAllExpanded) {
        // Collapse all
        jobs.forEach(job => job.classList.remove('expanded'));
        experienceExpandAll.classList.remove('all-expanded');
      } else {
        // Expand all
        jobs.forEach(job => job.classList.add('expanded'));
        experienceExpandAll.classList.add('all-expanded');
      }
    });
    
    // Update button state when individual jobs are clicked
    document.querySelectorAll('.job').forEach(job => {
      job.addEventListener('click', () => {
        setTimeout(() => {
          const allExpanded = Array.from(document.querySelectorAll('.job')).every(j => j.classList.contains('expanded'));
          if (allExpanded) {
            experienceExpandAll.classList.add('all-expanded');
          } else {
            experienceExpandAll.classList.remove('all-expanded');
          }
        }, 50);
      });
    });
  }

  // Projects expand all functionality
  const projectsExpandAll = document.getElementById('projectsExpandAll');
  
  if (projectsExpandAll) {
    projectsExpandAll.addEventListener('click', () => {
      const isAllExpanded = projectsExpandAll.classList.contains('all-expanded');
      const projects = document.querySelectorAll('.proj');
      
      if (isAllExpanded) {
        // Collapse all
        projects.forEach(proj => proj.classList.remove('expanded'));
        projectsExpandAll.classList.remove('all-expanded');
      } else {
        // Expand all
        projects.forEach(proj => proj.classList.add('expanded'));
        projectsExpandAll.classList.add('all-expanded');
      }
    });
    
    // Update button state when individual projects are clicked
    document.querySelectorAll('.proj').forEach(proj => {
      proj.addEventListener('click', () => {
        setTimeout(() => {
          const allExpanded = Array.from(document.querySelectorAll('.proj')).every(p => p.classList.contains('expanded'));
          if (allExpanded) {
            projectsExpandAll.classList.add('all-expanded');
          } else {
            projectsExpandAll.classList.remove('all-expanded');
          }
        }, 50);
      });
    });
  }

  // Enhanced hero career dossier tabs.
  const careerTabs = Array.from(document.querySelectorAll('.career-tab'));

  if (careerTabs.length) {
    const CAREER_SIGNATURE_CYCLE_COOLDOWN_MS = 10000;
    const CAREER_SIGNATURE_DURATION_MS = 580;
    const CAREER_SIGNATURE_STAGGER_MS = 65;
    const CAREER_SIGNATURE_DROP_PX = 64;
    const CAREER_SIGNATURE_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';
    const CAREER_LOGO_REVEAL_DURATION_MS = 220;
    const CAREER_LOGO_REVEAL_INTERVAL_MS = 200;
    const CAREER_QUIET_DURATION_MS = 150;
    const careerTabsAnimatedThisCycle = new Set();
    let careerAnimationCycleExpiresAt = 0;
    let activeCareerTransition = null;
    let careerTransitionFrame = 0;
    let careerTransitionGeneration = 0;

    const resetCareerTransitionStyles = function(element) {
      if (!element) return;
      element.style.removeProperty('will-change');
      element.style.removeProperty('opacity');
      element.style.removeProperty('transform');
    };

    const resetCareerLogoStyles = function(element) {
      if (!element) return;
      element.style.removeProperty('will-change');
      element.style.removeProperty('opacity');
      element.style.removeProperty('transform');
    };

    const clearCareerTransition = function() {
      if (careerTransitionFrame) window.cancelAnimationFrame(careerTransitionFrame);
      careerTransitionFrame = 0;
      careerTransitionGeneration += 1;

      const previousTransition = activeCareerTransition;
      activeCareerTransition = null;
      if (!previousTransition) return;
      previousTransition.logoSequenceTimers.forEach(function(timer) { window.clearTimeout(timer); });
      previousTransition.logoSequenceTimers = [];
      previousTransition.logoAnimations.forEach(function(animation) { animation.cancel(); });
      previousTransition.logoAnimations = [];
      previousTransition.logoElements.forEach(resetCareerLogoStyles);
      previousTransition.entries.forEach(function(entry) {
        if (entry.animation) entry.animation.cancel();
        resetCareerTransitionStyles(entry.element);
      });
    };

    const getCareerSignatureTargets = function(panel) {
      if (panel.classList.contains('career-panel--overview')) {
        return [
          ...panel.querySelectorAll('.career-overview-company'),
          panel.querySelector('.career-overview-projects'),
          panel.querySelector('.career-footer-strip')
        ].filter(Boolean);
      }

      if (panel.classList.contains('career-panel--experience')) {
        return Array.from(panel.querySelectorAll('.career-experience-card'));
      }

      if (panel.classList.contains('career-panel--projects')) {
        return [
          panel.querySelector('.career-project-feature-card'),
          ...panel.querySelectorAll('.career-project-support-card')
        ].filter(Boolean);
      }

      if (panel.classList.contains('career-panel--credentials')) {
        return Array.from(panel.querySelectorAll('.career-qualification-module'));
      }

      return [];
    };

    const resetCareerAnimationCycleIfExpired = function(now) {
      if (careerTabsAnimatedThisCycle.size && now >= careerAnimationCycleExpiresAt) {
        careerTabsAnimatedThisCycle.clear();
        careerAnimationCycleExpiresAt = 0;
      }
    };

    const animateCareerPanel = function(panel, tabId) {
      clearCareerTransition();
      const now = performance.now();
      resetCareerAnimationCycleIfExpired(now);
      if (!panel || reduceMotionQuery.matches || typeof panel.animate !== 'function') return;

      const shouldUseSignature = !careerTabsAnimatedThisCycle.has(tabId);
      const targets = shouldUseSignature ? getCareerSignatureTargets(panel) : [panel];
      const companyCards = shouldUseSignature && panel.classList.contains('career-panel--overview')
        ? Array.from(panel.querySelectorAll('.career-overview-company'))
        : [];
      const companyRevealRecords = companyCards.map(function(card) {
        return {
          card: card,
          logo: card.querySelector('.hero-company-mark img'),
          readyPromise: null,
          resolveReady: null,
          readyResolved: false
        };
      }).filter(function(record) {
        return Boolean(record.logo);
      });
      const logoElements = companyRevealRecords.map(function(record) {
        return record.logo;
      }).filter(Boolean);
      if (shouldUseSignature) {
        careerTabsAnimatedThisCycle.add(tabId);
        careerAnimationCycleExpiresAt = now + CAREER_SIGNATURE_CYCLE_COOLDOWN_MS;
      }
      const transition = {
        generation: careerTransitionGeneration,
        entries: [],
        logoElements: logoElements,
        logoAnimations: [],
        logoSequenceTimers: [],
        logoSequencePending: companyRevealRecords.length === 3,
        signature: shouldUseSignature,
        tabId: tabId
      };
      activeCareerTransition = transition;

      if (transition.logoSequencePending) {
        companyRevealRecords.forEach(function(record) {
          record.readyPromise = new Promise(function(resolve) {
            record.resolveReady = resolve;
          });
          record.logo.style.opacity = '0';
          record.logo.style.transform = 'translate3d(-4px, 0, 0)';
        });
      }

      const maybeCompleteTransition = function() {
        if (activeCareerTransition !== transition || transition.generation !== careerTransitionGeneration) return;
        if (!transition.entries.length && !transition.logoSequencePending) activeCareerTransition = null;
      };

      const transitionIsCurrent = function() {
        return activeCareerTransition === transition
          && transition.generation === careerTransitionGeneration
          && !panel.hidden
          && !reduceMotionQuery.matches
          && document.documentElement.getAttribute('data-portfolio-mode') === 'enhanced';
      };

      const waitForCareerLogoInterval = function() {
        return new Promise(function(resolve) {
          const timer = window.setTimeout(function() {
            transition.logoSequenceTimers = transition.logoSequenceTimers.filter(function(candidate) { return candidate !== timer; });
            resolve();
          }, CAREER_LOGO_REVEAL_INTERVAL_MS);
          transition.logoSequenceTimers.push(timer);
        });
      };

      const startCareerLogoReveal = function(logo) {
        if (!transitionIsCurrent()) return null;
        logo.style.willChange = 'opacity, transform';
        const animation = logo.animate([
          { opacity: 0, transform: 'translate3d(-4px, 0, 0)' },
          { opacity: 1, transform: 'translate3d(0, 0, 0)' }
        ], {
          duration: CAREER_LOGO_REVEAL_DURATION_MS,
          easing: CAREER_SIGNATURE_EASING,
          fill: 'both'
        });
        transition.logoAnimations.push(animation);
        return animation;
      };

      careerTransitionFrame = window.requestAnimationFrame(function() {
        careerTransitionFrame = 0;
        if (activeCareerTransition !== transition || transition.generation !== careerTransitionGeneration || panel.hidden || reduceMotionQuery.matches) return;

        targets.forEach(function(element, index) {
          resetCareerTransitionStyles(element);
          element.style.willChange = 'opacity, transform';
          const animation = element.animate(
            transition.signature
              ? [
                  { opacity: 0, transform: 'translate3d(0, -' + CAREER_SIGNATURE_DROP_PX + 'px, 0) scale(0.985)' },
                  { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' }
                ]
              : [{ opacity: 0.88 }, { opacity: 1 }],
            {
              duration: transition.signature ? CAREER_SIGNATURE_DURATION_MS : CAREER_QUIET_DURATION_MS,
              delay: transition.signature ? index * CAREER_SIGNATURE_STAGGER_MS : 0,
              easing: CAREER_SIGNATURE_EASING,
              fill: 'both'
            }
          );
          const entry = { element: element, animation: animation, settled: false };
          const companyRevealRecord = companyRevealRecords.find(function(record) {
            return record.card === element;
          });
          transition.entries.push(entry);
          const markCompanyCardReady = function() {
            if (!companyRevealRecord || companyRevealRecord.readyResolved || !companyRevealRecord.resolveReady) return;
            companyRevealRecord.readyResolved = true;
            companyRevealRecord.resolveReady();
          };
          const cleanUp = function() {
            if (entry.settled || activeCareerTransition !== transition || transition.generation !== careerTransitionGeneration) return;
            entry.settled = true;
            animation.cancel();
            resetCareerTransitionStyles(element);
            transition.entries = transition.entries.filter(function(candidate) { return candidate !== entry; });
            maybeCompleteTransition();
          };
          const handleFinish = function() {
            markCompanyCardReady();
            cleanUp();
          };
          const handleCancel = function() {
            markCompanyCardReady();
            cleanUp();
          };
          animation.addEventListener('finish', handleFinish, { once: true });
          animation.addEventListener('cancel', handleCancel, { once: true });
        });

        if (transition.logoSequencePending) {
          (async function() {
            try {
              await companyRevealRecords[0].readyPromise;
              if (!transitionIsCurrent() || !startCareerLogoReveal(companyRevealRecords[0].logo)) return;

              await Promise.all([companyRevealRecords[1].readyPromise, waitForCareerLogoInterval()]);
              if (!transitionIsCurrent() || !startCareerLogoReveal(companyRevealRecords[1].logo)) return;

              await Promise.all([companyRevealRecords[2].readyPromise, waitForCareerLogoInterval()]);
              if (!transitionIsCurrent() || !startCareerLogoReveal(companyRevealRecords[2].logo)) return;

              await Promise.all(transition.logoAnimations.map(function(animation) { return animation.finished; }));
              if (!transitionIsCurrent()) return;
              transition.logoAnimations.forEach(function(animation) { animation.cancel(); });
              transition.logoAnimations = [];
              transition.logoElements.forEach(resetCareerLogoStyles);
              transition.logoSequencePending = false;
              maybeCompleteTransition();
            } catch (error) {
              if (!transitionIsCurrent()) return;
              transition.logoSequenceTimers.forEach(function(timer) { window.clearTimeout(timer); });
              transition.logoSequenceTimers = [];
              transition.logoAnimations.forEach(function(animation) { animation.cancel(); });
              transition.logoAnimations = [];
              transition.logoElements.forEach(resetCareerLogoStyles);
              transition.logoSequencePending = false;
              maybeCompleteTransition();
            }
          })();
        }
      });
    };

    const activateCareerTab = function(tab, shouldFocus) {
      const targetId = tab.getAttribute('aria-controls');
      const snapshot = tab.closest('.career-snapshot');
      if (snapshot) snapshot.dataset.activeCareerTab = targetId.replace('career-panel-', '');

      careerTabs.forEach(function(candidate) {
        const selected = candidate === tab;
        candidate.setAttribute('aria-selected', String(selected));
        candidate.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(candidate.getAttribute('aria-controls'));
        if (panel) panel.hidden = !selected;
      });

      const activePanel = document.getElementById(targetId);
      if (document.documentElement.getAttribute('data-portfolio-mode') === 'enhanced') {
        animateCareerPanel(activePanel, targetId);
      } else {
        clearCareerTransition();
      }

      if (shouldFocus) tab.focus({ preventScroll: true });
      return targetId;
    };

    careerTabs.forEach(function(tab, index) {
      tab.addEventListener('click', function() { activateCareerTab(tab, false); });
      tab.addEventListener('keydown', function(event) {
        const lastIndex = careerTabs.length - 1;
        let nextIndex = null;

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = index === lastIndex ? 0 : index + 1;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = index === 0 ? lastIndex : index - 1;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = lastIndex;

        if (nextIndex !== null) {
          event.preventDefault();
          activateCareerTab(careerTabs[nextIndex], true);
        }
      });
    });

    document.querySelectorAll('.career-overview-group__action[data-career-tab-target]').forEach(function(action) {
      action.addEventListener('click', function() {
        const snapshot = action.closest('.career-snapshot');
        const targetTab = snapshot && snapshot.querySelector(
          '.career-tab[aria-controls="career-panel-' + action.dataset.careerTabTarget + '"]'
        );
        if (targetTab) activateCareerTab(targetTab, true);
      });
    });

    const careerModeObserver = new MutationObserver(function() {
      if (document.documentElement.getAttribute('data-portfolio-mode') !== 'enhanced') {
        clearCareerTransition();
        return;
      }

      const activeTab = careerTabs.find(function(tab) { return tab.getAttribute('aria-selected') === 'true'; });
      if (activeTab) animateCareerPanel(document.getElementById(activeTab.getAttribute('aria-controls')), activeTab.getAttribute('aria-controls'));
    });
    careerModeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-portfolio-mode']
    });

    if (typeof reduceMotionQuery.addEventListener === 'function') {
      reduceMotionQuery.addEventListener('change', function() {
        if (reduceMotionQuery.matches) clearCareerTransition();
      });
    }

    const initialCareerTab = careerTabs.find(function(tab) { return tab.getAttribute('aria-selected') === 'true'; });
    const initialCareerGeneration = careerTransitionGeneration;
    window.requestAnimationFrame(function() {
      window.requestAnimationFrame(function() {
        if (careerTransitionGeneration !== initialCareerGeneration || document.documentElement.getAttribute('data-portfolio-mode') !== 'enhanced' || !initialCareerTab) return;
        const panelId = initialCareerTab.getAttribute('aria-controls');
        animateCareerPanel(document.getElementById(panelId), panelId);
      });
    });

  }

  // Rotate verified Local Driving Intelligence interface views without loading every large asset up front.
  const osintSlideshow = document.querySelector('[data-osint-slideshow]');
  if (osintSlideshow) {
    const osintSlides = Array.from(osintSlideshow.querySelectorAll('[data-osint-slide]'));
    const osintDots = Array.from(osintSlideshow.querySelectorAll('[data-osint-dot]'));
    const osintPrevious = osintSlideshow.querySelector('[data-osint-previous]');
    const osintNext = osintSlideshow.querySelector('[data-osint-next]');
    const osintStatus = osintSlideshow.querySelector('[data-osint-status]');
    const osintCaptionCategory = osintSlideshow.querySelector('[data-osint-caption-category]');
    const osintCaptionTitle = osintSlideshow.querySelector('[data-osint-caption-title]');
    const osintCaptionDescription = osintSlideshow.querySelector('[data-osint-caption-description]');
    const osintViewport = osintSlideshow.querySelector('.osint-slideshow__viewport');
    const osintPlayback = osintSlideshow.querySelector('[data-osint-playback]');
    const osintProgress = osintSlideshow.querySelector('[data-osint-progress]');
    const osintTrack = document.createElement('div');
    osintTrack.className = 'carousel-track osint-slideshow__track';
    let osintSlideIndex = 0;
    let osintInteraction = null;
    let osintRenderGeneration = 0;
    let osintTrackReady = false;

    osintViewport.replaceChildren(osintTrack);

    const loadOsintSlide = function(index) {
      const slide = osintSlides[index];
      const image = slide && slide.querySelector('img');
      if (!image || image.dataset.loaded === 'true') return;
      image.draggable = false;
      if (image.dataset.srcset) image.srcset = image.dataset.srcset;
      if (image.dataset.src) image.src = image.dataset.src;
      const ambientSource = image.dataset.src || image.currentSrc || image.getAttribute('src');
      if (ambientSource) slide.style.setProperty('--osint-slide-image', 'url("' + ambientSource + '")');
      image.dataset.loaded = 'true';
    };

    const previewOsintSlide = function(index, direction) {
      const normalizedIndex = (index + osintSlides.length) % osintSlides.length;
      const activeCaption = osintSlides[normalizedIndex].querySelector('figcaption');
      if (!activeCaption) return;
      const category = activeCaption.querySelector('span');
      const title = activeCaption.querySelector('strong');
      const description = activeCaption.querySelector('small');
      osintSlideshow.classList.remove('is-caption-shifting-next', 'is-caption-shifting-previous');
      osintSlideshow.classList.add(direction === 'previous' ? 'is-caption-shifting-previous' : 'is-caption-shifting-next');
      if (osintCaptionCategory && category) osintCaptionCategory.textContent = category.textContent;
      if (osintCaptionTitle && title) osintCaptionTitle.textContent = title.textContent;
      if (osintCaptionDescription && description) osintCaptionDescription.textContent = description.textContent;
      window.setTimeout(function() {
        osintSlideshow.classList.remove('is-caption-shifting-next', 'is-caption-shifting-previous');
      }, 430);
    };

    const commitOsintSlide = function(index, source) {
      if (!osintSlides.length) return;
      osintSlideIndex = (index + osintSlides.length) % osintSlides.length;
      osintSlides.forEach(function(slide, slideIndex) {
        const active = slideIndex === osintSlideIndex;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });

      osintDots.forEach(function(dot, dotIndex) {
        const active = dotIndex === osintSlideIndex;
        dot.classList.toggle('is-active', active);
        if (active) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });

      if (osintStatus) {
        osintStatus.setAttribute('aria-live', source && source !== 'autoplay' ? 'polite' : 'off');
        osintStatus.textContent = String(osintSlideIndex + 1).padStart(2, '0') + ' / ' + String(osintSlides.length).padStart(2, '0');
      }
      if (source === 'initial') previewOsintSlide(osintSlideIndex, 'next');
    };

    const prepareOsintTrack = function(activeIndex, targetIndex, direction) {
      const generation = ++osintRenderGeneration;
      osintTrackReady = false;
      const normalize = function(index) { return (index + osintSlides.length) % osintSlides.length; };
      const previousIndex = targetIndex !== undefined && direction === 'previous' ? normalize(targetIndex) : normalize(activeIndex - 1);
      const nextIndex = targetIndex !== undefined && direction === 'next' ? normalize(targetIndex) : normalize(activeIndex + 1);
      const cardIndexes = [previousIndex, normalize(activeIndex), nextIndex];
      const cards = cardIndexes.map(function(cardIndex) {
        loadOsintSlide(cardIndex);
        return osintSlides[cardIndex];
      });
      cards.forEach(function(card, cardPosition) {
        card.dataset.carouselPosition = ['previous', 'current', 'next'][cardPosition];
      });
      osintTrack.replaceChildren.apply(osintTrack, cards);
      const decodes = cards.map(function(card) {
        const image = card.querySelector('img');
        return image && typeof image.decode === 'function' ? image.decode().catch(function() {}) : Promise.resolve();
      });
      return Promise.all(decodes).then(function() {
        const current = generation === osintRenderGeneration;
        if (current) osintTrackReady = true;
        return current;
      });
    };

    if (osintPrevious) osintPrevious.addEventListener('click', function() {
      if (osintInteraction) osintInteraction.goTo(osintSlideIndex - 1, 'previous', 'previous');
    });
    if (osintNext) osintNext.addEventListener('click', function() {
      if (osintInteraction) osintInteraction.goTo(osintSlideIndex + 1, 'next', 'next');
    });
    osintDots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        if (osintInteraction) osintInteraction.goTo(Number(dot.dataset.osintDot), 'dot');
      });
    });

    osintSlides.forEach(function(slide) {
      const image = slide.querySelector('img');
      if (image) image.draggable = false;
    });

    if (typeof window.createCarouselInteraction === 'function') {
      osintInteraction = window.createCarouselInteraction({
        root: osintSlideshow,
        viewport: osintViewport,
        track: osintTrack,
        count: osintSlides.length,
        getIndex: function() { return osintSlideIndex; },
        prepareTransition: function(currentIndex, targetIndex, direction) { return prepareOsintTrack(currentIndex, targetIndex, direction); },
        normalizeTrack: function(activeIndex) { return prepareOsintTrack(activeIndex); },
        preview: previewOsintSlide,
        commit: commitOsintSlide,
        pauseButton: osintPlayback,
        progress: osintProgress,
        isTrackReady: function() { return osintTrackReady; },
        isEnabled: function() { return document.documentElement.getAttribute('data-portfolio-mode') === 'enhanced'; }
      });
    }

    const osintModeObserver = new MutationObserver(function() {
      if (osintInteraction) osintInteraction.refresh();
    });
    osintModeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-portfolio-mode'] });
    commitOsintSlide(0, 'initial');
    prepareOsintTrack(0);
  }

  // Open matching full project records from the dedicated project cards.
  const careerProjectRecords = Array.from(document.querySelectorAll('.career-project-feature-card__action[data-project-target]'));
  careerProjectRecords.forEach(function(record) {
    const openProject = function() {
      if (record.dataset.projectUrl) {
        window.location.assign(record.dataset.projectUrl);
        return;
      }
      const heading = document.getElementById(record.dataset.projectTarget);
      const project = heading ? heading.closest('.proj') : null;
      if (!project) return;
      project.classList.add('expanded');
      project.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    record.addEventListener('click', openProject);
    record.addEventListener('keydown', function(event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openProject();
    });
  });

  // Load the latest public master commit without delaying initial rendering.
  const siteFooter = document.querySelector('[data-site-footer]');
  if (siteFooter) {
    const published = siteFooter.querySelector('[data-site-published]');
    const separator = siteFooter.querySelector('[data-site-publish-separator]');
    const pushLink = siteFooter.querySelector('[data-site-push-link]');
    const repositoryUrl = 'https://github.com/LawrenceDinh/lawrencedinh.github.io';
    const commitsUrl = 'https://api.github.com/repos/LawrenceDinh/lawrencedinh.github.io/commits?sha=master&per_page=1';

    fetch(commitsUrl, { headers: { Accept: 'application/vnd.github+json' } })
      .then(function(response) {
        if (!response.ok) throw new Error('GitHub commit request failed');
        return response.json();
      })
      .then(function(commits) {
        const commit = Array.isArray(commits) ? commits[0] : null;
        const dateValue = commit && commit.commit && ((commit.commit.committer && commit.commit.committer.date) || (commit.commit.author && commit.commit.author.date));
        const date = dateValue ? new Date(dateValue) : null;
        if (!commit || !commit.html_url || !date || Number.isNaN(date.getTime())) throw new Error('Invalid commit response');

        const formattedDate = new Intl.DateTimeFormat('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          timeZone: 'UTC'
        }).format(date).toUpperCase();

        if (published) published.textContent = 'LAST PUBLISHED: ' + formattedDate;
        if (separator) separator.hidden = false;
        if (pushLink) {
          pushLink.href = commit.html_url;
          pushLink.textContent = 'VIEW LAST PUSH ↗';
          pushLink.setAttribute('aria-label', 'View latest master commit on GitHub');
        }
      })
      .catch(function() {
        if (published) published.textContent = 'LAST PUBLISHED:';
        if (separator) separator.hidden = true;
        if (pushLink) {
          pushLink.href = repositoryUrl;
          pushLink.textContent = 'VIEW REPOSITORY ↗';
          pushLink.setAttribute('aria-label', 'View repository on GitHub');
        }
      });
  }
})();
