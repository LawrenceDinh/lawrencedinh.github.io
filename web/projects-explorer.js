(() => {
  'use strict';

  const explorer = document.querySelector('[data-project-feature-explorer]');
  if (!explorer) return;

  // This is the one ordered source for the index, viewer, counter, controls,
  // hash activation, and image preloading.
  const projectFeatures = [
    {
      id: 'osint-weather-heading',
      domain: 'Weather Imagery',
      title: 'Radar and Satellite View',
      description: 'NOAA precipitation and cloud layers provide animated regional awareness while preserving the map controls needed to inspect changing weather.',
      caption: 'Imagery, playback state, and map controls remain visible in the full capture.',
      src: 'imgsrc/projects/osint/optimized/weather-radar-960.webp',
      srcset: 'imgsrc/projects/osint/optimized/weather-radar-960.webp 960w, imgsrc/projects/osint/optimized/weather-radar-1600.webp 1600w',
      width: 1599,
      height: 1166,
      alt: 'NOAA radar and satellite imagery with precipitation and cloud controls'
    },
    {
      id: 'osint-forecast-heading',
      domain: 'Weather',
      title: 'Forecast Visualization',
      description: 'Hourly and daily temperature trends combine with station-pressure context to make changing conditions easier to compare before a route or event.',
      caption: 'The complete chart range and supporting controls remain in frame.',
      src: 'imgsrc/projects/osint/optimized/forecast-charts-960.webp',
      srcset: 'imgsrc/projects/osint/optimized/forecast-charts-960.webp 960w, imgsrc/projects/osint/optimized/forecast-charts-1600.webp 1600w',
      width: 1599,
      height: 1230,
      alt: 'Hourly and daily temperature forecast charts with station pressure data'
    },
    {
      id: 'osint-route-heading',
      domain: 'Caltrans',
      title: 'Route Intelligence Map',
      description: 'Configured corridors bring camera locations, incidents, closures, message signs, and route activity into one operational map for pre-drive review.',
      caption: 'Corridor, provider, and roadway state remain visible in one complete application view.',
      src: 'imgsrc/projects/osint/optimized/camera-route-map-960.webp',
      srcset: 'imgsrc/projects/osint/optimized/camera-route-map-960.webp 960w, imgsrc/projects/osint/optimized/camera-route-map-1600.webp 1600w',
      width: 1600,
      height: 1223,
      alt: 'Route map with primary and alternate corridors, cameras, incidents, closures, and message signs'
    },
    {
      id: 'osint-cameras-heading',
      domain: 'Cameras',
      title: 'Traffic Camera Monitor',
      description: 'Filterable Caltrans CCTV views prioritize the feeds nearest a selected corridor so visual roadway checks do not require searching separate provider pages.',
      caption: 'Relevant live feeds remain readable at their complete dashboard scale.',
      src: 'imgsrc/projects/osint/optimized/traffic-camera-grid-960.webp',
      srcset: 'imgsrc/projects/osint/optimized/traffic-camera-grid-960.webp 960w, imgsrc/projects/osint/optimized/traffic-camera-grid-1600.webp 1600w',
      width: 1600,
      height: 1188,
      alt: 'Filterable Caltrans traffic camera grid prioritized near Salinas'
    },
    {
      id: 'osint-intelligence-heading',
      domain: 'CHP Intelligence',
      title: 'CHP Intelligence Feed',
      description: 'Official enforcement updates are normalized into grouped, filterable records that support faster driver-focused review than an undifferentiated news stream.',
      caption: 'Filters, status, and enforcement periods remain visible without cropping.',
      src: 'imgsrc/projects/osint/optimized/chp-enforcement-news-960.webp',
      srcset: 'imgsrc/projects/osint/optimized/chp-enforcement-news-960.webp 960w, imgsrc/projects/osint/optimized/chp-enforcement-news-1600.webp 1600w',
      width: 1600,
      height: 1191,
      alt: 'Official CHP news and enforcement alert cards with status filters'
    },
    {
      id: 'osint-events-heading',
      domain: 'Planning',
      title: 'Event Planning Calendar',
      description: 'Bulk schedule import, upcoming-event review, and calendar planning share a structured workflow for coordinating regional travel and preparation.',
      caption: 'Import controls, event records, and calendar context remain legible together.',
      src: 'imgsrc/projects/osint/optimized/event-calendar-960.webp',
      srcset: 'imgsrc/projects/osint/optimized/event-calendar-960.webp 960w, imgsrc/projects/osint/optimized/event-calendar-1600.webp 1600w',
      width: 1600,
      height: 1209,
      alt: 'Motorsport event workflow with bulk schedule import, event list, and calendar'
    },
    {
      id: 'osint-checklists-heading',
      domain: 'Operations',
      title: 'Checklist Pipeline',
      description: 'Reusable preparation templates open into a detailed check-off workflow with completion state and required-item tracking for repeatable event readiness.',
      caption: 'Templates and their active packlists stay connected in one workflow.',
      src: 'imgsrc/projects/osint/optimized/reusable-checklists-960.webp',
      srcset: 'imgsrc/projects/osint/optimized/reusable-checklists-960.webp 960w, imgsrc/projects/osint/optimized/reusable-checklists-1600.webp 1600w',
      width: 1600,
      height: 1215,
      alt: 'Reusable preparation checklist templates beside a detailed event packlist'
    }
  ];

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

  initialImage.remove();
  mediaViewport.append(projectTrack);

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
      if (interaction) interaction.goTo(featureIndex, 'index');
    });
    index.append(button);
    return button;
  });

  const dotButtons = projectFeatures.map((feature, featureIndex) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Show ${feature.title}`);
    button.addEventListener('click', () => {
      if (interaction) interaction.goTo(featureIndex, 'dot');
    });
    dots.append(button);
    return button;
  });

  function syncHash(feature) {
    const nextUrl = `${window.location.pathname}${window.location.search}#${feature.id}`;
    window.history.replaceState(null, '', nextUrl);
  }

  function previewProjectFeature(nextIndex, direction) {
    const normalizedIndex = (nextIndex + projectFeatures.length) % projectFeatures.length;
    const feature = projectFeatures[normalizedIndex];
    domain.textContent = `${String(normalizedIndex + 1).padStart(2, '0')} / ${feature.domain}`;
    title.textContent = feature.title;
    description.textContent = feature.description;
    caption.textContent = feature.caption;
    explorer.classList.remove('is-caption-shifting-next', 'is-caption-shifting-previous');
    explorer.classList.add(direction === 'previous' ? 'is-caption-shifting-previous' : 'is-caption-shifting-next');
    window.setTimeout(() => explorer.classList.remove('is-caption-shifting-next', 'is-caption-shifting-previous'), 430);
  }

  function commitProjectFeature(nextIndex, source, direction) {
    const normalizedIndex = (nextIndex + projectFeatures.length) % projectFeatures.length;
    const feature = projectFeatures[normalizedIndex];
    activeIndex = normalizedIndex;
    counter.textContent = `${String(normalizedIndex + 1).padStart(2, '0')} / ${String(projectFeatures.length).padStart(2, '0')}`;
    viewer.setAttribute('aria-labelledby', feature.id);
    if (source === 'initial') previewProjectFeature(normalizedIndex, direction || 'next');

    indexButtons.forEach((button, buttonIndex) => {
      const selected = buttonIndex === normalizedIndex;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    dotButtons.forEach((button, buttonIndex) => {
      const selected = buttonIndex === normalizedIndex;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-current', selected ? 'true' : 'false');
    });

    const selectedButton = indexButtons[normalizedIndex];
    if (selectedButton && index.scrollWidth > index.clientWidth) {
      const left = selectedButton.offsetLeft - (index.clientWidth - selectedButton.offsetWidth) / 2;
      index.scrollTo({ left: Math.max(0, left), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }

    if (source !== 'initial' && source !== 'hash') syncHash(feature);
  }

  function configureTrackCard(card, featureIndex) {
    const normalizedIndex = (featureIndex + projectFeatures.length) % projectFeatures.length;
    const feature = projectFeatures[normalizedIndex];
    if (card.featureIndex === normalizedIndex) return Promise.resolve();
    const generation = ++renderGeneration;
    card.featureIndex = normalizedIndex;
    card.image.src = feature.src;
    card.image.srcset = feature.srcset;
    card.image.sizes = '(max-width: 760px) 100vw, 70vw';
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
    if (interaction) interaction.goTo(activeIndex + delta, 'button', delta > 0 ? 'next' : 'previous');
    if (focusTab) indexButtons[activeIndex].focus();
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
    if (interaction) interaction.goTo(normalizedTarget, 'keyboard', normalizedTarget === (activeIndex + 1) % projectFeatures.length ? 'next' : normalizedTarget === (activeIndex - 1 + projectFeatures.length) % projectFeatures.length ? 'previous' : undefined);
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
      if (interaction) interaction.goTo(0, 'keyboard');
    } else if (event.key === 'End') {
      event.preventDefault();
      if (interaction) interaction.goTo(projectFeatures.length - 1, 'keyboard');
    }
  });

  window.addEventListener('hashchange', () => {
    const featureIndex = projectFeatures.findIndex(feature => feature.id === window.location.hash.slice(1));
    if (featureIndex >= 0 && interaction) interaction.goTo(featureIndex, 'hash');
  });

  const hashedFeatureIndex = projectFeatures.findIndex(feature => feature.id === window.location.hash.slice(1));
  activeIndex = hashedFeatureIndex >= 0 ? hashedFeatureIndex : 0;
  commitProjectFeature(activeIndex, 'initial', 'next');
  normalizeProjectTrack(activeIndex);

  if (typeof window.createCarouselInteraction === 'function') {
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
  }

  const modeObserver = new MutationObserver(() => {
    if (interaction) interaction.refresh();
  });
  modeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-portfolio-mode'] });
})();
