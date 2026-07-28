(() => {
  'use strict';

  const explorers = document.querySelectorAll('[data-project-feature-explorer]');
  if (!explorers.length) return;
  const mobileFeatureQuery = window.matchMedia('(max-width: 760px)');

  // These ordered sources drive each explorer's index, viewer, counter,
  // controls, image preloading, and accessible selected state.
  const localDrivingFeatures = [
    {
      id: 'osint-weather-heading',
      domain: 'Weather',
      title: 'Radar & Cloud History',
      description: 'Replay recent radar and cloud imagery to see how conditions developed. Stored frames provide a short local history instead of showing only the latest image.',
      caption: 'Radar and cloud controls pair current imagery with locally stored recent frames.',
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
      description: 'See how temperature and conditions are expected to change through the day. Hourly and daily forecasts use one consistent layout.',
      caption: 'Forecast charts compare temperature changes across the planned period.',
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
      description: 'Review recent road events and reported issues along the selected route. The newest activity appears first.',
      caption: 'The route map keeps road activity and camera locations tied to the selected drive.',
      src: 'imgsrc/projects/osint/optimized/camera-route-map-960.webp',
      srcset: 'imgsrc/projects/osint/optimized/camera-route-map-960.webp 960w, imgsrc/projects/osint/optimized/camera-route-map-1600.webp 1600w',
      width: 1600,
      height: 1223,
      alt: 'Route map with primary and alternate corridors, cameras, incidents, closures, and message signs'
    },
    {
      id: 'osint-cameras-heading',
      domain: 'Traffic',
      title: 'Traffic Camera Monitoring',
      description: 'Review still images and live feeds from public cameras along important routes. Available photo and video feeds use the same viewing workflow.',
      caption: 'Route proximity and camera status keep the most relevant public feeds in view.',
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
      description: 'Review official CHP notices and enforcement periods using status filters.',
      caption: 'Time-sensitive notices remain separate from general road activity.',
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
      description: 'View venue details and upcoming events beside the related travel information.',
      caption: 'The calendar keeps event dates and venue details beside trip planning.',
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
      description: 'Open reusable preparation templates and track required items as they are completed.',
      caption: 'Preparation tasks share one reusable checklist workflow.',
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
      description: 'Review current conditions and the multi-day forecast for a selected destination. Hourly and daily forecasts use one consistent layout.',
      caption: 'Configured destinations use the same weather and source-status layout.',
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

  const driftCourseFeatures = [
    {
      id: 'drift-editing-heading',
      domain: 'Editing',
      title: 'Anchor Refinement',
      description: 'Edit anchors, endpoints, smoothing, and course width without recreating the original path.',
      caption: 'Local editing controls preserve the overall course while allowing precise geometric adjustments.',
      src: 'web/imgsrc/projects/drift-course-designer/optimized/course-editing-960.webp',
      srcset: 'web/imgsrc/projects/drift-course-designer/optimized/course-editing-960.webp 960w, web/imgsrc/projects/drift-course-designer/optimized/course-editing-1600.webp 1600w',
      width: 2048,
      height: 1080,
      alt: 'Drift Course Designer showing a selected course path with editable anchors, smoothing, and width controls'
    },
    {
      id: 'drift-operations-heading',
      domain: 'Operations',
      title: 'Course Markers & Zones',
      description: 'Add clipping points, cones, gates, zones, boundaries, labels, and direction markers around the course.',
      caption: 'The completed layout shows course markings, a return route, boundaries, and venue context together.',
      src: 'web/imgsrc/projects/drift-course-designer/optimized/complete-event-layout-960.webp',
      srcset: 'web/imgsrc/projects/drift-course-designer/optimized/complete-event-layout-960.webp 960w, web/imgsrc/projects/drift-course-designer/optimized/complete-event-layout-1600.webp 1600w',
      width: 2048,
      height: 1080,
      alt: 'Complete Drift Course Designer layout with a driving line, return route, cones, labels, zones, and boundaries'
    },
    {
      id: 'drift-analysis-heading',
      domain: 'Analysis',
      title: 'Geometry Analysis',
      description: 'Review the drawn course with turn, transition, and judging overlays visible.',
      caption: 'The screenshot shows analyzed course sections mapped directly onto the active driving line.',
      src: 'web/imgsrc/projects/drift-course-designer/optimized/course-analysis-960.webp',
      srcset: 'web/imgsrc/projects/drift-course-designer/optimized/course-analysis-960.webp 960w, web/imgsrc/projects/drift-course-designer/optimized/course-analysis-1600.webp 1600w',
      width: 2048,
      height: 1080,
      alt: 'Drift Course Designer analysis overlay labeling turns, transitions, setup, and judging sections'
    },
    {
      id: 'drift-export-heading',
      domain: 'Output',
      title: 'Annotated Export',
      description: 'Export the project as a PNG, SVG, GeoJSON, simulation geometry, or a portable Drift Course package.',
      caption: 'The export dialog shows format choices and options for venue imagery, direction arrows, title, and legend.',
      src: 'web/imgsrc/projects/drift-course-designer/optimized/course-export-960.webp',
      srcset: 'web/imgsrc/projects/drift-course-designer/optimized/course-export-960.webp 960w, web/imgsrc/projects/drift-course-designer/optimized/course-export-1600.webp 1600w',
      width: 2048,
      height: 1080,
      alt: 'Drift Course Designer export dialog with PNG, SVG, GeoJSON, simulation geometry, and project package options'
    }
  ];

  const featureSets = {
    local: localDrivingFeatures,
    drift: driftCourseFeatures
  };

  function initializeFeatureExplorer(explorer) {
    const projectFeatures = featureSets[explorer.dataset.projectFeatureExplorer];
    if (!projectFeatures?.length) return;
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

  }

  function activateFeatureImmediately(nextIndex, source, direction) {
    const normalizedIndex = (nextIndex + projectFeatures.length) % projectFeatures.length;
    activeIndex = normalizedIndex;
    renderFeatureMetadata(normalizedIndex, direction || null);
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

  activeIndex = 0;
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
  }

  explorers.forEach(initializeFeatureExplorer);

  const featuredSection = document.getElementById('featured-case-study');
  const featuredTabs = [...document.querySelectorAll('[data-featured-project]')];
  const featuredPanels = featuredTabs
    .map(tab => document.getElementById(tab.dataset.featuredProject))
    .filter(Boolean);
  const featuredIds = new Set(featuredPanels.map(panel => panel.id));

  function initializeProjectsEntrance() {
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
        targetDelays.set(element, Math.min(index, 4) * 65);
      });
    }

    addGroup([document.querySelector('.projects-intro')]);
    addGroup([
      document.querySelector('.projects-featured__header'),
      document.querySelector('.projects-featured-selector')
    ]);

    featuredPanels.forEach(panel => {
      addGroup([
        panel.querySelector('.projects-case-study__header'),
        panel.querySelector('.projects-case-study__summary'),
        ...panel.querySelectorAll('.projects-case-study__detail--capabilities > article'),
        panel.querySelector('.projects-osint-evidence > header'),
        panel.querySelector('.projects-osint-evidence > .projects-feature-explorer'),
        panel.querySelector('.projects-architecture > div'),
        panel.querySelector('.projects-architecture > ol')
      ]);
    });

    document.querySelectorAll('.projects-registry').forEach(registry => {
      addGroup([
        registry.querySelector('.projects-section-header'),
        ...registry.querySelectorAll('.projects-card, .projects-academic-list > article')
      ]);
    });

    addGroup([document.querySelector('.projects-footer')]);

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
        { opacity: 0, transform: 'translate3d(0, -64px, 0) scale(0.985)' },
        { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' }
      ], {
        duration: 580,
        delay: targetDelays.get(element) || 0,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
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
      element.style.transform = 'translate3d(0, -64px, 0) scale(0.985)';
    });

    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) revealTarget(entry.target);
      });
    }, {
      threshold: 0.01,
      rootMargin: '0px 0px -8% 0px'
    });

    targets.forEach(element => observer.observe(element));

    reducedMotion.addEventListener('change', event => {
      if (!event.matches) return;
      observer.disconnect();
      activeAnimations.forEach(animation => animation.cancel());
      activeAnimations.clear();
      targets.forEach(resetTarget);
    }, { once: true });
  }

  function activateFeaturedProject(projectId, options = {}) {
    const targetIndex = featuredTabs.findIndex(tab => tab.dataset.featuredProject === projectId);
    if (targetIndex < 0) return false;

    featuredTabs.forEach((tab, index) => {
      const selected = index === targetIndex;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    featuredPanels.forEach(panel => {
      const selected = panel.id === projectId;
      panel.hidden = !selected;
      panel.inert = !selected;
    });

    if (options.focus) featuredTabs[targetIndex].focus();
    if (options.updateHash) {
      const nextUrl = `${window.location.pathname}${window.location.search}#${projectId}`;
      window.history.pushState({ featuredProject: projectId }, '', nextUrl);
    }
    if (options.scroll && featuredSection) {
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      featuredSection.scrollIntoView({ block: 'start', behavior });
    }
    return true;
  }

  featuredTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      const alreadySelected = tab.getAttribute('aria-selected') === 'true';
      if (!alreadySelected) activateFeaturedProject(tab.dataset.featuredProject, { updateHash: true });
    });
    tab.addEventListener('keydown', event => {
      let nextIndex = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % featuredTabs.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + featuredTabs.length) % featuredTabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = featuredTabs.length - 1;
      if (nextIndex === null) return;
      event.preventDefault();
      activateFeaturedProject(featuredTabs[nextIndex].dataset.featuredProject, { focus: true, updateHash: true });
    });
  });

  function restoreFeaturedFromHash({ scroll = false } = {}) {
    const projectId = window.location.hash.slice(1);
    if (featuredIds.has(projectId)) activateFeaturedProject(projectId, { scroll });
  }

  const initialProjectId = window.location.hash.slice(1);
  const requestedProjectId = new URLSearchParams(window.location.search).get('project');
  const initialFeaturedProject = featuredIds.has(initialProjectId)
    ? initialProjectId
    : featuredIds.has(requestedProjectId)
      ? requestedProjectId
      : featuredTabs[0]?.dataset.featuredProject;
  if (initialFeaturedProject) {
    activateFeaturedProject(initialFeaturedProject);
    window.history.replaceState(
      { ...(window.history.state || {}), featuredProject: initialFeaturedProject },
      '',
      window.location.href
    );
  }

  window.addEventListener('hashchange', () => restoreFeaturedFromHash());
  window.addEventListener('popstate', event => {
    const hashProject = window.location.hash.slice(1);
    const historyProject = event.state?.featuredProject;
    const projectId = featuredIds.has(hashProject)
      ? hashProject
      : featuredIds.has(historyProject)
        ? historyProject
        : featuredTabs[0]?.dataset.featuredProject;
    if (projectId) activateFeaturedProject(projectId);
  });

  if (featuredIds.has(initialProjectId)) {
    window.requestAnimationFrame(() => {
      if (featuredSection) featuredSection.scrollIntoView({ block: 'start', behavior: 'auto' });
    });
  }

  initializeProjectsEntrance();
})();
