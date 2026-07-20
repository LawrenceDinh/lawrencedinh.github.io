(() => {
  'use strict';

  const explorer = document.querySelector('[data-project-feature-explorer]');
  if (!explorer) return;
  const mobileFeatureQuery = window.matchMedia('(max-width: 760px)');

  // This is the one ordered source for the index, viewer, counter, controls,
  // hash activation, and image preloading.
  const projectFeatures = [
    {
      id: 'osint-weather-heading',
      domain: 'Weather',
      title: 'Weather Imagery Playback',
      description: 'Displays NOAA radar and cloud imagery with current and archived frames.',
      caption: 'Stored imagery supports regional weather review beyond a single current frame.',
      src: 'imgsrc/projects/osint/optimized/weather-radar-960.webp',
      srcset: 'imgsrc/projects/osint/optimized/weather-radar-960.webp 960w, imgsrc/projects/osint/optimized/weather-radar-1600.webp 1600w',
      width: 1599,
      height: 1166,
      alt: 'NOAA radar and satellite imagery with precipitation and cloud controls'
    },
    {
      id: 'osint-forecast-heading',
      domain: 'Weather',
      title: 'Forecast Trends',
      description: 'Shows hourly and daily temperature changes with nearby station context.',
      caption: 'Charts make changing conditions easier to compare across the planned period.',
      src: 'imgsrc/projects/osint/optimized/forecast-charts-960.webp',
      srcset: 'imgsrc/projects/osint/optimized/forecast-charts-960.webp 960w, imgsrc/projects/osint/optimized/forecast-charts-1600.webp 1600w',
      width: 1599,
      height: 1230,
      alt: 'Hourly and daily temperature forecast charts with station pressure data'
    },
    {
      id: 'osint-route-heading',
      domain: 'Traffic',
      title: 'Route & Camera Map',
      description: 'Configured routes combine camera locations, incidents, closures, message signs, and recent activity.',
      caption: 'Regional route configuration keeps traffic information tied to the drive being planned.',
      src: 'imgsrc/projects/osint/optimized/camera-route-map-960.webp',
      srcset: 'imgsrc/projects/osint/optimized/camera-route-map-960.webp 960w, imgsrc/projects/osint/optimized/camera-route-map-1600.webp 1600w',
      width: 1600,
      height: 1223,
      alt: 'Route map with primary and alternate corridors, cameras, incidents, closures, and message signs'
    },
    {
      id: 'osint-cameras-heading',
      domain: 'Traffic',
      title: 'Traffic Camera Monitor',
      description: 'Filters and ranks Caltrans camera feeds around the selected location and route.',
      caption: 'Route proximity and camera status reduce the need to search an unfiltered statewide feed.',
      src: 'imgsrc/projects/osint/optimized/traffic-camera-grid-960.webp',
      srcset: 'imgsrc/projects/osint/optimized/traffic-camera-grid-960.webp 960w, imgsrc/projects/osint/optimized/traffic-camera-grid-1600.webp 1600w',
      width: 1600,
      height: 1188,
      alt: 'Filterable Caltrans traffic camera grid prioritized near Salinas'
    },
    {
      id: 'osint-intelligence-heading',
      domain: 'Alerts',
      title: 'CHP Alerts & Enforcement',
      description: 'Groups official CHP notices and enforcement periods with status filters.',
      caption: 'Time-sensitive public notices remain separate from general traffic activity.',
      src: 'imgsrc/projects/osint/optimized/chp-enforcement-news-960.webp',
      srcset: 'imgsrc/projects/osint/optimized/chp-enforcement-news-960.webp 960w, imgsrc/projects/osint/optimized/chp-enforcement-news-1600.webp 1600w',
      width: 1600,
      height: 1191,
      alt: 'Official CHP news and enforcement alert cards with status filters'
    },
    {
      id: 'osint-events-heading',
      domain: 'Planning',
      title: 'Event Calendar',
      description: 'Supports event import, review, editing, duplicate checks, and calendar planning.',
      caption: 'Regional events and preparation dates stay connected to the same application.',
      src: 'imgsrc/projects/osint/optimized/event-calendar-960.webp',
      srcset: 'imgsrc/projects/osint/optimized/event-calendar-960.webp 960w, imgsrc/projects/osint/optimized/event-calendar-1600.webp 1600w',
      width: 1600,
      height: 1209,
      alt: 'Motorsport event workflow with bulk schedule import, event list, and calendar'
    },
    {
      id: 'osint-checklists-heading',
      domain: 'Operations',
      title: 'Preparation Checklists',
      description: 'Reusable templates open into check-off workflows with required-item state.',
      caption: 'Recurring event, vehicle, safety, and travel preparation stays in one workflow.',
      src: 'imgsrc/projects/osint/optimized/reusable-checklists-960.webp',
      srcset: 'imgsrc/projects/osint/optimized/reusable-checklists-960.webp 960w, imgsrc/projects/osint/optimized/reusable-checklists-1600.webp 1600w',
      width: 1600,
      height: 1215,
      alt: 'Reusable preparation checklist templates beside a detailed event packlist'
    },
    {
      id: 'osint-regional-weather-heading',
      domain: 'Weather',
      title: 'Regional Weather',
      description: 'Combines current conditions, forecasts, alerts, air quality, and source status by location.',
      caption: 'Configured locations provide a consistent weather view across the region.',
      src: 'imgsrc/projects/osint/optimized/weather-overview-960.webp',
      srcset: 'imgsrc/projects/osint/optimized/weather-overview-960.webp 960w, imgsrc/projects/osint/optimized/weather-overview-1600.webp 1600w',
      width: 1600,
      height: 1197,
      alt: 'Regional weather dashboard showing locations, current conditions, and source status'
    }
  ].sort((a, b) => {
    const order = ['osint-route-heading', 'osint-cameras-heading', 'osint-checklists-heading', 'osint-intelligence-heading', 'osint-events-heading', 'osint-regional-weather-heading', 'osint-forecast-heading', 'osint-weather-heading'];
    return order.indexOf(a.id) - order.indexOf(b.id);
  });

  const index = explorer.querySelector('[role="tablist"]');
  const viewer = explorer.querySelector('[role="tabpanel"]');
  const initialImage = explorer.querySelector('[data-project-feature-image]');
  const domain = explorer.querySelector('[data-project-feature-domain]');
  const counter = explorer.querySelector('[data-project-feature-counter]');
  const title = explorer.querySelector('[data-project-feature-title]');
  const description = explorer.querySelector('[data-project-feature-description]');
  const caption = explorer.querySelector('[data-project-feature-caption]');
  const dots = explorer.querySelector('[data-project-feature-dots]');
  const previous = explorer.querySelector('[data-project-feature-previous]');
  const next = explorer.querySelector('[data-project-feature-next]');
  const mediaViewport = explorer.querySelector('.projects-application-capture__viewport');
  const playback = explorer.querySelector('[data-project-feature-playback]');
  const progress = explorer.querySelector('[data-project-feature-progress]');
  const progressTrack = progress?.closest('.carousel-progress');
  const navigation = explorer.querySelector('.projects-feature-explorer__navigation');
  const navigationCenter = explorer.querySelector('.projects-feature-explorer__navigation-center');
  const requiredElements = {
    explorer,
    index,
    viewer,
    initialImage,
    domain,
    counter,
    title,
    description,
    caption,
    dots,
    previous,
    next,
    mediaViewport,
    playback,
    progress,
    progressTrack,
    navigation,
    navigationCenter
  };
  const missingElements = Object.entries(requiredElements)
    .filter(([, element]) => !element)
    .map(([name]) => name);
  if (missingElements.length) {
    console.error('[Projects Feature Explorer] Missing required elements:', missingElements);
    explorer.dataset.featureExplorerReady = 'false';
    return;
  }

  let activeIndex = 0;
  let renderGeneration = 0;
  let interaction = null;
  let projectTrackReady = false;
  const projectTrack = document.createElement('div');
  projectTrack.className = 'carousel-track projects-feature-explorer__track';
  const trackCards = Array.from({ length: 3 }, () => {
    const card = document.createElement('div');
    const cardImage = document.createElement('img');
    card.className = 'carousel-card projects-feature-explorer__card';
    cardImage.decoding = 'async';
    cardImage.draggable = false;
    card.append(cardImage);
    return { element: card, image: cardImage, featureIndex: -1 };
  });

  const indexButtons = projectFeatures.map((feature, featureIndex) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.id = feature.id;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', viewer.id);
    button.setAttribute('aria-selected', 'false');
    button.tabIndex = -1;
    button.innerHTML = `<span>${String(featureIndex + 1).padStart(2, '0')} / ${feature.domain}</span><strong>${feature.title}</strong>`;
    button.addEventListener('click', () => {
      requestFeature(featureIndex, 'index');
    });
    index.append(button);
    return button;
  });

  const dotButtons = projectFeatures.map((feature, featureIndex) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.projectFeatureDot = String(featureIndex);
    button.setAttribute('aria-label', `Show ${feature.title}`);
    button.addEventListener('click', () => {
      requestFeature(featureIndex, 'dot');
    });
    dots.append(button);
    return button;
  });

  const mobileStatus = document.createElement('span');
  mobileStatus.className = 'mobile-feature-carousel__status';
  mobileStatus.setAttribute('aria-live', 'polite');
  previous.setAttribute('aria-label', 'Show previous feature');
  next.setAttribute('aria-label', 'Show next feature');

  function syncProjectFeatureDots() {
    activeIndex = (activeIndex + projectFeatures.length) % projectFeatures.length;

    if (typeof window.syncCompactCarouselDots === 'function') {
      window.syncCompactCarouselDots({
        container: dots,
        dots: dotButtons,
        activeIndex,
        enabled: mobileFeatureQuery.matches,
        unit: mobileFeatureQuery.matches && window.innerWidth <= 340 ? 8 : 9,
        minCapacity: 5,
        maxCapacity: 10,
        preserveEnds: true,
        ellipsisClass: 'projects-feature-explorer__ellipsis'
      });
    }

    dotButtons.forEach(button => {
      const selected = Number(button.dataset.projectFeatureDot) === activeIndex;
      button.classList.toggle('is-active', selected);
      if (selected) {
        button.hidden = false;
        button.removeAttribute('aria-hidden');
        button.setAttribute('aria-current', 'true');
        if (button.tabIndex < 0) button.removeAttribute('tabindex');
      } else {
        button.removeAttribute('aria-current');
      }
    });
  }

  function syncMobilePresentation() {
    const mobile = mobileFeatureQuery.matches;
    explorer.classList.toggle('mobile-feature-carousel', mobile);
    index.hidden = mobile;
    index.inert = mobile;
    mediaViewport.classList.toggle('mobile-feature-carousel__viewport', mobile);
    explorer.querySelector('.projects-feature-explorer__rail').classList.toggle('mobile-feature-carousel__caption', mobile);
    navigation.classList.toggle('mobile-feature-carousel__controls', mobile);
    dots.classList.toggle('mobile-feature-carousel__dots', mobile);
    playback.classList.toggle('mobile-feature-carousel__playback', mobile);

    if (mobile) {
      viewer.removeAttribute('aria-labelledby');
      viewer.setAttribute('aria-label', 'Projects feature slideshow');
      previous.textContent = '←';
      next.textContent = '→';
      navigationCenter.hidden = true;
      navigation.replaceChildren(previous, mobileStatus, dots, next, playback, progressTrack);
    } else {
      viewer.removeAttribute('aria-label');
      previous.textContent = '← Previous';
      next.textContent = 'Next →';
      navigationCenter.hidden = false;
      navigationCenter.replaceChildren(dots, playback);
      navigation.replaceChildren(previous, navigationCenter, next, progressTrack);
    }
    window.requestAnimationFrame(syncProjectFeatureDots);
  }

  function syncHash(feature) {
    const nextUrl = `${window.location.pathname}${window.location.search}#${feature.id}`;
    window.history.replaceState(null, '', nextUrl);
  }

  function renderFeatureMetadata(nextIndex, direction) {
    const normalizedIndex = (nextIndex + projectFeatures.length) % projectFeatures.length;
    const feature = projectFeatures[normalizedIndex];
    domain.textContent = `${String(normalizedIndex + 1).padStart(2, '0')} / ${feature.domain}`;
    counter.textContent = `${String(normalizedIndex + 1).padStart(2, '0')} / ${String(projectFeatures.length).padStart(2, '0')}`;
    mobileStatus.textContent = counter.textContent;
    title.textContent = feature.title;
    description.textContent = feature.description;
    caption.textContent = feature.caption;
    initialImage.src = feature.src;
    initialImage.srcset = feature.srcset;
    initialImage.sizes = '(max-width: 760px) 100vw, (max-width: 980px) 94vw, 68vw';
    initialImage.width = feature.width;
    initialImage.height = feature.height;
    initialImage.alt = feature.alt;
    initialImage.draggable = false;
    if (mobileFeatureQuery.matches) {
      viewer.removeAttribute('aria-labelledby');
      viewer.setAttribute('aria-label', 'Projects feature slideshow');
    } else {
      viewer.removeAttribute('aria-label');
      viewer.setAttribute('aria-labelledby', feature.id);
    }

    indexButtons.forEach((button, buttonIndex) => {
      const selected = buttonIndex === normalizedIndex;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    syncProjectFeatureDots();

    const selectedButton = indexButtons[normalizedIndex];
    if (selectedButton && index.scrollWidth > index.clientWidth) {
      const left = selectedButton.offsetLeft - (index.clientWidth - selectedButton.offsetWidth) / 2;
      index.scrollTo({ left: Math.max(0, left), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }

    if (!direction) return;
    explorer.classList.remove('is-caption-shifting-next', 'is-caption-shifting-previous');
    explorer.classList.add(direction === 'previous' ? 'is-caption-shifting-previous' : 'is-caption-shifting-next');
    window.setTimeout(() => explorer.classList.remove('is-caption-shifting-next', 'is-caption-shifting-previous'), 430);
  }

  function previewProjectFeature(nextIndex, direction) {
    renderFeatureMetadata(nextIndex, direction);
  }

  function commitProjectFeature(nextIndex, source, direction) {
    const normalizedIndex = (nextIndex + projectFeatures.length) % projectFeatures.length;
    activeIndex = normalizedIndex;
    renderFeatureMetadata(normalizedIndex, source === 'initial' ? direction || 'next' : null);

    if (source !== 'initial' && source !== 'hash') syncHash(projectFeatures[normalizedIndex]);
  }

  function activateFeatureImmediately(nextIndex, source, direction) {
    const normalizedIndex = (nextIndex + projectFeatures.length) % projectFeatures.length;
    activeIndex = normalizedIndex;
    renderFeatureMetadata(normalizedIndex, direction || null);
    if (source !== 'initial' && source !== 'hash') syncHash(projectFeatures[normalizedIndex]);
  }

  function requestFeature(nextIndex, source, direction) {
    const normalizedIndex = (nextIndex + projectFeatures.length) % projectFeatures.length;
    if (interaction) {
      interaction.goTo(normalizedIndex, source, direction);
      return;
    }
    activateFeatureImmediately(normalizedIndex, source, direction);
  }

  function configureTrackCard(card, featureIndex) {
    const normalizedIndex = (featureIndex + projectFeatures.length) % projectFeatures.length;
    const feature = projectFeatures[normalizedIndex];
    if (card.featureIndex === normalizedIndex) return Promise.resolve();
    const generation = ++renderGeneration;
    card.featureIndex = normalizedIndex;
    card.image.src = feature.src;
    card.image.srcset = feature.srcset;
    card.image.sizes = '(max-width: 760px) 100vw, (max-width: 980px) 94vw, 68vw';
    card.image.width = feature.width;
    card.image.height = feature.height;
    card.image.alt = feature.alt;
    card.image.dataset.featureId = feature.id;
    const decoded = typeof card.image.decode === 'function' ? card.image.decode().catch(() => {}) : Promise.resolve();
    return decoded.then(() => generation <= renderGeneration);
  }

  function positionTrackCards() {
    trackCards.forEach((card, cardIndex) => {
      card.element.dataset.carouselPosition = ['previous', 'current', 'next'][cardIndex];
      card.element.setAttribute('aria-hidden', String(cardIndex !== 1));
    });
    projectTrack.replaceChildren(...trackCards.map(card => card.element));
  }

  function prepareProjectTransition(currentIndex, targetIndex, direction) {
    projectTrackReady = false;
    const incomingCard = direction === 'previous' ? trackCards[0] : trackCards[2];
    return configureTrackCard(incomingCard, targetIndex).then(() => { projectTrackReady = true; });
  }

  function normalizeProjectTrack(nextIndex, direction) {
    projectTrackReady = false;
    if (direction === 'next') trackCards.push(trackCards.shift());
    if (direction === 'previous') trackCards.unshift(trackCards.pop());
    positionTrackCards();
    return Promise.all([
      configureTrackCard(trackCards[0], nextIndex - 1),
      configureTrackCard(trackCards[1], nextIndex),
      configureTrackCard(trackCards[2], nextIndex + 1)
    ]).then(() => { projectTrackReady = true; });
  }

  function moveFeature(delta, focusTab) {
    const targetIndex = (activeIndex + delta + projectFeatures.length) % projectFeatures.length;
    requestFeature(targetIndex, 'button', delta > 0 ? 'next' : 'previous');
    if (focusTab) indexButtons[targetIndex].focus();
  }

  previous.addEventListener('click', () => moveFeature(-1));
  next.addEventListener('click', () => moveFeature(1));

  index.addEventListener('keydown', event => {
    let targetIndex = null;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') targetIndex = activeIndex + 1;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') targetIndex = activeIndex - 1;
    if (event.key === 'Home') targetIndex = 0;
    if (event.key === 'End') targetIndex = projectFeatures.length - 1;
    if (targetIndex === null) return;
    event.preventDefault();
    const normalizedTarget = (targetIndex + projectFeatures.length) % projectFeatures.length;
    requestFeature(normalizedTarget, 'keyboard', normalizedTarget === (activeIndex + 1) % projectFeatures.length ? 'next' : normalizedTarget === (activeIndex - 1 + projectFeatures.length) % projectFeatures.length ? 'previous' : undefined);
    indexButtons[normalizedTarget].focus();
  });

  viewer.addEventListener('keydown', event => {
    if (event.target.closest('button, a, input, select, textarea, [role="tab"]')) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      moveFeature(1);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      moveFeature(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      requestFeature(0, 'keyboard');
    } else if (event.key === 'End') {
      event.preventDefault();
      requestFeature(projectFeatures.length - 1, 'keyboard');
    }
  });

  window.addEventListener('hashchange', () => {
    const featureIndex = projectFeatures.findIndex(feature => feature.id === window.location.hash.slice(1));
    if (featureIndex >= 0) requestFeature(featureIndex, 'hash');
  });

  const hashedFeatureIndex = projectFeatures.findIndex(feature => feature.id === window.location.hash.slice(1));
  activeIndex = hashedFeatureIndex >= 0 ? hashedFeatureIndex : 0;
  syncMobilePresentation();
  commitProjectFeature(activeIndex, 'initial', 'next');
  playback.disabled = true;

  async function initializeTrack() {
    if (typeof window.createCarouselInteraction !== 'function') return;
    try {
      await normalizeProjectTrack(activeIndex);
      mediaViewport.append(projectTrack);
      interaction = window.createCarouselInteraction({
        root: explorer,
        viewport: mediaViewport,
        track: projectTrack,
        count: projectFeatures.length,
        getIndex: () => activeIndex,
        prepareTransition: prepareProjectTransition,
        normalizeTrack: normalizeProjectTrack,
        preview: previewProjectFeature,
        commit: commitProjectFeature,
        pauseButton: playback,
        progress,
        isTrackReady: () => projectTrackReady,
        keyboard: false,
        isEnabled: () => document.documentElement.getAttribute('data-portfolio-mode') === 'enhanced'
      });
      if (!interaction) throw new Error('Shared carousel controller did not initialize.');
      interaction.refresh();
      initialImage.remove();
      playback.disabled = false;
      explorer.classList.add('is-ready');
      explorer.dataset.featureExplorerReady = 'true';
    } catch (error) {
      projectTrack.remove();
      projectTrackReady = false;
      interaction = null;
      playback.disabled = true;
      explorer.dataset.featureExplorerReady = 'false';
      console.error('[Projects Feature Explorer] Initialization failed:', error);
    }
  }

  void initializeTrack();

  if (window.ProjectImageViewer) {
    window.ProjectImageViewer.register({
      trigger: mediaViewport,
      mode: 'current-image',
      item: () => {
        const feature = projectFeatures[activeIndex];
        return {
          src: feature.src,
          srcset: feature.srcset,
          sizes: '140vw',
          alt: feature.alt,
          title: feature.title,
          description: feature.description
        };
      },
      pause: () => { if (interaction) interaction.pauseAutoplay('viewer'); },
      resume: () => { if (interaction) interaction.startAutoplay(); }
    });
  }

  const modeObserver = new MutationObserver(() => {
    if (interaction) interaction.refresh();
  });
  modeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-portfolio-mode'] });

  mobileFeatureQuery.addEventListener('change', () => {
    syncMobilePresentation();
    if (interaction) interaction.refresh();
  });
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(() => {
      if (mobileFeatureQuery.matches) syncProjectFeatureDots();
    }).observe(navigation);
  }
})();
