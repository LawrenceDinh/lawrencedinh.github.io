(function () {
  function updateCurrentYear() {
    try {
      const currentYear = new Date().getFullYear();
      if (!Number.isInteger(currentYear) || currentYear < 2026 || currentYear > 2100) return;

      document.querySelectorAll('[data-current-year]').forEach(function (element) {
        const yearText = String(currentYear);
        if (element.textContent !== yearText) element.textContent = yearText;
        if (element.tagName === 'TIME' && element.getAttribute('datetime') !== yearText) {
          element.setAttribute('datetime', yearText);
        }
      });
    } catch (error) {
      // Preserve the static HTML fallback if date or DOM access fails.
    }
  }

  let currentYearInterval = 0;
  function initializeCurrentYear() {
    updateCurrentYear();
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) updateCurrentYear();
    });
    if (!currentYearInterval) currentYearInterval = window.setInterval(updateCurrentYear, 6 * 60 * 60 * 1000);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCurrentYear, { once: true });
  } else {
    initializeCurrentYear();
  }

  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let isBackToTopVisible = false;

    function updateBackToTopVisibility() {
      const shouldShow = window.pageYOffset > 300;
      if (shouldShow === isBackToTopVisible) return;

      isBackToTopVisible = shouldShow;
      if (shouldShow) {
        backToTop.classList.remove('hiding');
        backToTop.classList.add('visible');
        return;
      }

      backToTop.classList.add('hiding');
      window.setTimeout(function () {
        if (!isBackToTopVisible) backToTop.classList.remove('visible', 'hiding');
      }, 400);
    }

    window.addEventListener('scroll', updateBackToTopVisibility, { passive: true });
    backToTop.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: reducedMotion.matches ? 'auto' : 'smooth'
      });
    });
    updateBackToTopVisibility();
  }

  const SECTION_ARRIVAL_KEY = 'portfolio-section-arrival';
  const queueSectionArrival = function(hash) {
    try {
      window.sessionStorage.setItem(SECTION_ARRIVAL_KEY, hash);
    } catch (error) {
      // Section navigation remains functional when storage is unavailable.
    }
  };
  const consumeSectionArrival = function() {
    try {
      const hash = window.sessionStorage.getItem(SECTION_ARRIVAL_KEY) || '';
      window.sessionStorage.removeItem(SECTION_ARRIVAL_KEY);
      return hash;
    } catch (error) {
      return '';
    }
  };

  const projectSectionLinks = Array.from(document.querySelectorAll('.portfolio-page-header__nav a[href^="#"], [data-projects-menu] .nav-about-menu a[href^="#"]'));
  if (projectSectionLinks.length) {
    const sectionLinkReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sectionTargets = projectSectionLinks.map(function(link) {
      const id = link.getAttribute('href');
      return { link: link, id: id, target: id && id !== '#' ? document.querySelector(id) : null };
    }).filter(function(record) { return record.target; });
    const arrivalTimers = new WeakMap();
    const arrivalWaiters = new WeakMap();
    let sectionNavigationLockUntil = 0;
    let sectionScrollFrame = 0;

    const setActiveSection = function(id) {
      sectionTargets.forEach(function(record) {
        const active = record.id === id;
        if (active) record.link.setAttribute('aria-current', 'location');
        else record.link.removeAttribute('aria-current');
        if (!active) {
          const timer = arrivalTimers.get(record.target);
          if (timer) window.clearTimeout(timer);
          arrivalTimers.delete(record.target);
          const cancelWaiter = arrivalWaiters.get(record.target);
          if (cancelWaiter) cancelWaiter();
          arrivalWaiters.delete(record.target);
          record.target.classList.remove('projects-section-nav-arrival');
        }
      });
    };

    const pulseSection = function(target) {
      const existingTimer = arrivalTimers.get(target);
      if (existingTimer) window.clearTimeout(existingTimer);
      target.classList.remove('projects-section-nav-arrival');
      void target.offsetWidth;
      target.classList.add('projects-section-nav-arrival');
      arrivalTimers.set(target, window.setTimeout(function() {
        target.classList.remove('projects-section-nav-arrival');
        arrivalTimers.delete(target);
      }, 850));
    };

    const pulseSectionOnArrival = function(target) {
      const existingWaiter = arrivalWaiters.get(target);
      if (existingWaiter) existingWaiter();
      if (sectionLinkReducedMotion.matches) {
        pulseSection(target);
        return;
      }

      let finished = false;
      let settleTimer = 0;
      let fallbackTimer = 0;
      const cleanup = function() {
        window.removeEventListener('scroll', scheduleSettle);
        window.removeEventListener('scrollend', finish);
        if (settleTimer) window.clearTimeout(settleTimer);
        if (fallbackTimer) window.clearTimeout(fallbackTimer);
        arrivalWaiters.delete(target);
      };
      const finish = function() {
        if (finished) return;
        finished = true;
        cleanup();
        pulseSection(target);
      };
      const scheduleSettle = function() {
        if (settleTimer) window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(finish, 120);
      };

      arrivalWaiters.set(target, cleanup);
      window.addEventListener('scroll', scheduleSettle, { passive: true });
      window.addEventListener('scrollend', finish, { once: true });
      window.requestAnimationFrame(scheduleSettle);
      fallbackTimer = window.setTimeout(finish, 1300);
    };

    const updateActiveSectionFromScroll = function() {
      sectionScrollFrame = 0;
      if (window.performance.now() < sectionNavigationLockUntil) return;
      const activationLine = Math.min(220, window.innerHeight * 0.3);
      let activeRecord = null;
      sectionTargets.forEach(function(record) {
        if (!record.target.getClientRects().length) return;
        if (record.target.getBoundingClientRect().top <= activationLine) activeRecord = record;
      });
      if (!activeRecord) {
        activeRecord = sectionTargets.find(function(record) {
          const bounds = record.target.getBoundingClientRect();
          return record.target.getClientRects().length && bounds.top < window.innerHeight && bounds.bottom > activationLine;
        });
      }
      const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      const atPageBottom = window.scrollY + window.innerHeight >= documentHeight - 6;
      if (atPageBottom) {
        const finalVisibleRecord = sectionTargets.slice().reverse().find(function(record) {
          return record.target.getClientRects().length;
        });
        if (finalVisibleRecord) activeRecord = finalVisibleRecord;
      }
      setActiveSection(activeRecord ? activeRecord.id : '');
    };

    const scheduleActiveSectionUpdate = function() {
      if (sectionScrollFrame) return;
      sectionScrollFrame = window.requestAnimationFrame(updateActiveSectionFromScroll);
    };

    projectSectionLinks.forEach(function (link) {
      link.addEventListener('click', function (event) {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        event.preventDefault();
        setActiveSection(targetId);
        sectionNavigationLockUntil = window.performance.now() + (sectionLinkReducedMotion.matches ? 0 : 1400);
        pulseSectionOnArrival(target);
        target.scrollIntoView({
          behavior: sectionLinkReducedMotion.matches ? 'auto' : 'smooth',
          block: 'start'
        });
        window.history.pushState(null, '', targetId);
        window.setTimeout(scheduleActiveSectionUpdate, sectionLinkReducedMotion.matches ? 0 : 1420);
      });
    });

    window.addEventListener('scroll', scheduleActiveSectionUpdate, { passive: true });
    window.addEventListener('resize', scheduleActiveSectionUpdate, { passive: true });
    window.addEventListener('portfolio:sections-ready', scheduleActiveSectionUpdate);
    window.addEventListener('hashchange', function() {
      const matchingRecord = sectionTargets.find(function(record) { return record.id === window.location.hash; });
      if (!matchingRecord) return;
      setActiveSection(matchingRecord.id);
    });

    const requestedArrival = document.body.classList.contains('projects-page') ? consumeSectionArrival() : '';
    const initialRecord = sectionTargets.find(function(record) { return record.id === window.location.hash; });
    if (initialRecord) {
      setActiveSection(initialRecord.id);
      sectionNavigationLockUntil = window.performance.now() + 900;
      if (requestedArrival === initialRecord.id) {
        const showRequestedArrival = function() {
          window.setTimeout(function() { pulseSectionOnArrival(initialRecord.target); }, 180);
        };
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', showRequestedArrival, { once: true });
        } else {
          showRequestedArrival();
        }
      }
      window.setTimeout(scheduleActiveSectionUpdate, 920);
    } else {
      scheduleActiveSectionUpdate();
    }
  }

  const navToggle = document.getElementById('navToggle');
  const drawer = document.getElementById('drawer');
  const hamburger = document.getElementById('hamburgerIcon');
  const desktopMenu = document.querySelector('[data-portfolio-menu="desktop"]');
  const mobileMenu = document.querySelector('[data-portfolio-menu="mobile"]');
  const aboutMenu = document.querySelector('[data-about-menu]');
  const projectsMenu = document.querySelector('[data-projects-menu]');
  const portfolioCloseTimers = new WeakMap();
  const fineHoverPointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const PORTFOLIO_CLOSE_DELAY_MS = 320;
  const ABOUT_CLOSE_DELAY_MS = 300;
  const CONTACT = Object.freeze({
    email: 'lawrencetdinh@gmail.com',
    resume: '/Luat%20Lawrence%20Dinh%20%E2%80%93%20Software%20%26%20Systems%20Engineer%20Resume.pdf',
    linkedin: 'https://www.linkedin.com/in/lawrence-dinh-profile/',
    github: 'https://github.com/LawrenceDinh',
    location: 'San Jose, CA',
    maps: 'https://www.google.com/maps/place/San+Jose,+CA',
    status: 'Open to Work'
  });
  let contactDisclosure = null;
  let aboutCloseTimer = 0;
  let projectsCloseTimer = 0;

  // A fixed descendant of the filtered navbar can use the navbar as its
  // containing block. Keep the shared drawer contract, but place the live
  // drawer beside the header so phone geometry is viewport-relative.
  if (drawer) {
    const navHeader = drawer.closest('.nav');
    if (navHeader) navHeader.insertAdjacentElement('afterend', drawer);
  }

  const phoneConsoleMedia = window.matchMedia('(max-width: 760px)');
  const drawerSourceNodes = drawer ? Array.from(drawer.childNodes) : [];
  let phoneConsoleMounted = false;

  function makeDrawerRow(index, label, href, current) {
    const link = document.createElement('a');
    link.className = 'drawer-console-row';
    link.href = href;
    if (current) link.setAttribute('aria-current', 'page');

    const number = document.createElement('span');
    number.className = 'drawer-console-row__index';
    number.textContent = String(index).padStart(2, '0');
    const text = document.createElement('span');
    text.className = 'drawer-console-row__label';
    text.textContent = label;
    const arrow = document.createElement('span');
    arrow.className = 'drawer-console-row__arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';
    link.append(number, text, arrow);
    return link;
  }

  function getPhoneDrawerPage() {
    const body = document.body;
    const isArticle = Boolean(document.getElementById('article-body'));
    const isWriting = body.classList.contains('writing-page');
    const isProjects = body.classList.contains('projects-page');
    const homePrefix = isProjects || isWriting ? '/index.html' : '';
    if (body.classList.contains('game-design-page')) {
      return { label: 'On this page', rows: Array.from(document.querySelectorAll('[data-game-section]')).map(section => ({ label: section.dataset.gameSection, href: '#' + section.id })), current: 'Game Design', secondary: true };
    }

    if (isArticle) {
      const tocLinks = Array.from(document.querySelectorAll('#writing-toc-list a[href^="#"]'))
        .filter(link => document.getElementById(link.hash.slice(1)))
        .map(link => ({ label: link.textContent.trim(), href: link.getAttribute('href') }));
      return {
        label: 'In this article',
        rows: tocLinks,
        current: 'Writing',
        secondary: true,
        article: true
      };
    }

    if (isWriting) {
      return {
        label: 'On this page',
        rows: [
          { label: 'Overview', href: '#writing-content' },
          { label: 'Featured Writing', href: '#writing-featured' },
          { label: 'All Writing', href: '#writing-archive-list' }
        ].filter(row => document.querySelector(row.href)),
        current: 'Writing',
        secondary: true
      };
    }

    if (isProjects) {
      return {
        label: 'On this page',
        rows: [
          { label: 'Overview', href: '#projects-content' },
          { label: 'Local Driving Intelligence', href: '#local-driving-intelligence' },
          { label: 'Current Projects', href: '#current-projects' },
          { label: 'Academic Projects', href: '#academic-projects' }
        ].filter(row => document.querySelector(row.href)),
        current: 'Projects',
        secondary: true
      };
    }

    return {
      label: 'On this page',
      rows: [
        { label: 'Overview', href: `${homePrefix}#about` },
        { label: 'Featured', href: `${homePrefix}#projects` },
        { label: 'Experience', href: `${homePrefix}#experience` },
        { label: 'Skills', href: `${homePrefix}#skills` }
      ].filter(row => document.querySelector(row.href.replace(homePrefix, ''))),
      current: ''
    };
  }

  function getDrawerSource(selector) {
    return drawerSourceNodes.find(node => node.nodeType === Node.ELEMENT_NODE && node.matches(selector))
      || drawerSourceNodes.find(node => node.nodeType === Node.ELEMENT_NODE && node.querySelector(selector))?.querySelector(selector);
  }

  function makeDrawerReturn(page) {
    if (!page.secondary) return null;
    const link = document.createElement('a');
    link.className = 'drawer-console-return';
    link.href = '/#about';
    link.setAttribute('aria-label', 'Return to the main portfolio');
    const icon = document.createElement('span');
    icon.className = 'drawer-console-return__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '←';
    const copy = document.createElement('span');
    copy.className = 'drawer-console-return__copy';
    const strong = document.createElement('strong');
    strong.textContent = 'Main Portfolio';
    const small = document.createElement('small');
    small.textContent = 'About · Experience · Skills';
    copy.append(strong, small);
    const indicator = document.createElement('span');
    indicator.className = 'drawer-console-return__indicator';
    indicator.setAttribute('aria-hidden', 'true');
    indicator.textContent = '↗';
    link.append(icon, copy, indicator);
    return link;
  }

  function makeDrawerBreadcrumb() {
    const nav = document.createElement('nav');
    nav.className = 'drawer-console-breadcrumb';
    nav.setAttribute('aria-label', 'Navigation path');
    const portfolio = document.createElement('a');
    portfolio.href = '/#about';
    portfolio.textContent = 'Main Portfolio';
    const slashOne = document.createElement('span');
    slashOne.setAttribute('aria-hidden', 'true');
    slashOne.textContent = '/';
    const writing = document.createElement('a');
    writing.href = '/writing.html';
    writing.textContent = 'Writing';
    const slashTwo = document.createElement('span');
    slashTwo.setAttribute('aria-hidden', 'true');
    slashTwo.textContent = '/';
    const article = document.createElement('span');
    article.setAttribute('aria-current', 'page');
    article.textContent = 'Article';
    nav.append(portfolio, slashOne, writing, slashTwo, article);
    return nav;
  }

  function renderPhoneDrawerConsole() {
    if (!drawer || phoneConsoleMounted || !phoneConsoleMedia.matches || !isEnhancedMode()) return;
    const modeToggle = getDrawerSource('[data-presentation-mode-toggle]');
    const resume = getDrawerSource('a.highlight');
    const contact = getDrawerSource('.drawer-contact');
    if (!modeToggle || !resume || !contact) return;

    const page = getPhoneDrawerPage();
    const projectRows = [
      { label: 'Projects', href: '/projects.html', current: page.current === 'Projects' },
      { label: 'Game Design', href: '/game-design/', current: page.current === 'Game Design' }
    ];
    const portfolioRows = [
      { label: 'Writing', href: '/writing.html', current: page.current === 'Writing' }
    ];
    const total = page.rows.length + projectRows.length + portfolioRows.length;
    const heading = document.createElement('header');
    heading.className = 'drawer-console-heading';
    const headingTitle = document.createElement('p');
    headingTitle.className = 'drawer-console-heading__title';
    headingTitle.textContent = 'Navigation';
    const headingCount = document.createElement('p');
    headingCount.className = 'drawer-console-heading__count';
    headingCount.textContent = `${String(total).padStart(2, '0')} items`;
    heading.append(headingTitle, headingCount);

    const body = document.createElement('div');
    body.className = 'drawer-console-body';
    if (page.article) body.appendChild(makeDrawerBreadcrumb());
    else if (page.secondary) body.appendChild(makeDrawerReturn(page));
    const addGroup = (label, rows, startIndex) => {
      const group = document.createElement('section');
      group.className = 'drawer-console-group';
      const groupLabel = document.createElement('p');
      groupLabel.className = 'drawer-console-group__label';
      groupLabel.textContent = label;
      const list = document.createElement('div');
      list.className = 'drawer-console-list';
      rows.forEach((row, offset) => list.appendChild(makeDrawerRow(startIndex + offset, row.label, row.href, row.current)));
      group.append(groupLabel, list);
      body.appendChild(group);
    };
    addGroup(page.label, page.rows, 1);
    addGroup('Projects', projectRows, page.rows.length + 1);
    addGroup('Portfolio', portfolioRows, page.rows.length + projectRows.length + 1);

    const actions = document.createElement('div');
    actions.className = 'drawer-console-actions';
    const closeAction = document.createElement('button');
    closeAction.className = 'drawer-console-close';
    closeAction.type = 'button';
    closeAction.textContent = 'Close';
    closeAction.setAttribute('aria-label', 'Close navigation menu');
    closeAction.addEventListener('click', () => {
      setDrawerOpen(false);
      navToggle?.focus();
    });
    actions.append(resume, contact, closeAction);
    drawer.replaceChildren(heading, modeToggle, body, actions);
    drawer.setAttribute('role', 'navigation');
    drawer.setAttribute('aria-label', 'Mobile navigation');
    phoneConsoleMounted = true;
  }

  function restorePhoneDrawerSource() {
    if (!drawer || !phoneConsoleMounted) return;
    drawer.replaceChildren(...drawerSourceNodes);
    drawer.removeAttribute('role');
    phoneConsoleMounted = false;
  }

  function syncPhoneDrawerConsole() {
    if (phoneConsoleMedia.matches && isEnhancedMode()) renderPhoneDrawerConsole();
    else restorePhoneDrawerSource();
  }

  function refreshPhoneDrawerConsole() {
    if (!phoneConsoleMounted || !phoneConsoleMedia.matches || !isEnhancedMode()) return;
    phoneConsoleMounted = false;
    renderPhoneDrawerConsole();
  }

  syncPhoneDrawerConsole();
  phoneConsoleMedia.addEventListener('change', syncPhoneDrawerConsole);
  new MutationObserver(syncPhoneDrawerConsole).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-portfolio-mode']
  });
  const articleBody = document.getElementById('article-body');
  if (articleBody) {
    new MutationObserver(() => window.requestAnimationFrame(refreshPhoneDrawerConsole)).observe(articleBody, {
      childList: true,
      subtree: true
    });
  }

  function contactPanelMarkup() {
    return `<div class="nav-contact-panel" id="navContactPanel" role="region" aria-labelledby="navContactTitle" hidden><div class="section-panel" id="contactPanel">
      <div class="contact-panel-header"><h2 class="section-heading" id="navContactTitle">Contact</h2><button class="contact-drawer-close" type="button" aria-label="Close contact panel">Close</button></div>
      <div class="contact-grid">
        <div class="contact-item contact-item-email" role="button" tabindex="0" data-copy-text="${CONTACT.email}" aria-label="Copy email address ${CONTACT.email}">
          <svg class="inline-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 6.5A2.5 2.5 0 014.5 4h15A2.5 2.5 0 0122 6.5v11A2.5 2.5 0 0119.5 20h-15A2.5 2.5 0 012 17.5v-11z" stroke="currentColor" stroke-width="1.2"></path><path d="M3.5 6.7l8.2 5.2a1 1 0 001.06 0l8.2-5.2" stroke="currentColor" stroke-width="1.2"></path></svg>
          <div class="contact-copy"><div class="small muted">Email</div><div class="contact-email-row"><div class="contact-value contact-value-email" data-default-text="${CONTACT.email}">${CONTACT.email}</div><span class="copy-email-control" data-tooltip="Copy email"><button class="copy-email-btn" type="button" data-contact-copy aria-label="Copy email to clipboard"></button></span></div></div>
        </div>
        <a class="contact-item contact-item--resume" href="${CONTACT.resume}" target="_blank" rel="noopener" aria-label="Open resume PDF"><svg class="inline-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 4h16v16H4z" stroke="currentColor" stroke-width="1.2"></path><path d="M8 9h8M8 13h8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"></path></svg><div class="contact-copy"><div class="small muted">Resume</div><div class="contact-action">Open Resume</div></div></a>
        <div class="contact-item contact-profiles"><div class="contact-copy"><div class="small muted">Profiles</div><div class="contact-value contact-profiles-links" role="list"><div class="contact-profile-entry" role="listitem"><svg class="contact-profile-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 4h16v16H4zM8 10v6M8 7.5v.1M11.5 16v-3.3a2.2 2.2 0 014.4 0V16M11.5 11v5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"></path></svg><a href="${CONTACT.linkedin}" target="_blank" rel="noopener" aria-label="Open LinkedIn profile">LinkedIn <span class="contact-external-link" aria-hidden="true">↗</span></a></div><div class="contact-profile-entry" role="listitem"><svg class="contact-profile-icon contact-profile-icon--github" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.58 9.58 0 0 1 12 6.82c.85 0 1.71.11 2.51.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"></path></svg><a href="${CONTACT.github}" target="_blank" rel="noopener" aria-label="Open GitHub profile">GitHub <span class="contact-external-link" aria-hidden="true">↗</span></a></div></div></div></div>
      </div>
      <a class="location-text" href="${CONTACT.maps}" target="_blank" rel="noopener" aria-label="Open ${CONTACT.location} in Google Maps"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg><div><div class="small muted">Location</div><div class="contact-status-value"><span class="contact-status-location">${CONTACT.location}</span><span class="contact-status-divider" aria-hidden="true"></span><span class="contact-status-availability">${CONTACT.status} <svg class="contact-status-check" width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8.25 6.5 11l6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg></span></div></div></a>
      <div class="contact-mobile-actions" aria-label="Contact panel actions"><button class="contact-mobile-back" type="button">Back to Nav</button><button class="contact-mobile-close" type="button">Close</button></div>
      <span class="sr-only" aria-live="polite" data-contact-live></span>
    </div></div>`;
  }

  function initializeContactDisclosure() {
    if (document.getElementById('contactPanel')) return null;
    const desktopTrigger = document.querySelector('.nav-links .nav-contact-btn');
    const mobileTrigger = drawer && drawer.querySelector('.drawer-contact');
    if (!desktopTrigger || !mobileTrigger) return null;

    const desktopHost = document.createElement('div');
    desktopHost.className = 'nav-contact-disclosure';
    desktopTrigger.parentNode.insertBefore(desktopHost, desktopTrigger);
    desktopHost.appendChild(desktopTrigger);
    desktopHost.insertAdjacentHTML('beforeend', contactPanelMarkup());

    const desktopPanel = desktopHost.querySelector('.nav-contact-panel');
    const mobilePanel = desktopPanel;
    desktopTrigger.setAttribute('aria-controls', desktopPanel.id);
    mobileTrigger.setAttribute('aria-controls', mobilePanel.id);
    [desktopTrigger, mobileTrigger].forEach(trigger => trigger.setAttribute('aria-expanded', 'false'));

    return { desktopHost, desktopTrigger, desktopPanel, mobileTrigger, mobilePanel };
  }

  function contactIsOpen(type) {
    if (!contactDisclosure) return false;
    return contactDisclosure[`${type}Trigger`].getAttribute('aria-expanded') === 'true';
  }

  function setContactOpen(type, open) {
    if (!contactDisclosure) return;
    const trigger = contactDisclosure[`${type}Trigger`];
    const panel = contactDisclosure[`${type}Panel`];
    if (open) {
      if (type === 'mobile') contactDisclosure.mobileTrigger.insertAdjacentElement('afterend', panel);
      else contactDisclosure.desktopHost.appendChild(panel);
      panel.classList.toggle('nav-contact-panel--mobile', type === 'mobile');
    }
    trigger.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    trigger.classList.toggle('is-open', open);
    panel.classList.toggle('is-open', open);
    if (type === 'mobile') {
      panel.setAttribute('role', open ? 'dialog' : 'region');
      if (open) panel.setAttribute('aria-modal', 'true');
      else panel.removeAttribute('aria-modal');
    }
    const nav = document.querySelector('.nav');
    if (nav) nav.classList.toggle('has-contact-disclosure-open', contactIsOpen('desktop') || contactIsOpen('mobile'));
  }

  function closeContactDisclosures(except) {
    ['desktop', 'mobile'].forEach(type => {
      if (type !== except) setContactOpen(type, false);
    });
  }

  async function copyContactEmail(button, panel) {
    const live = panel.querySelector('[data-contact-live]');
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      button.classList.add('copied');
      button.setAttribute('aria-label', 'Email copied');
      live.textContent = 'Email address copied.';
    } catch (_) {
      live.textContent = `Copy failed. Email address: ${CONTACT.email}`;
      return;
    }
    window.setTimeout(() => {
      button.classList.remove('copied');
      button.setAttribute('aria-label', 'Copy email to clipboard');
      live.textContent = '';
    }, 1800);
  }

  function bindContactDisclosure() {
    contactDisclosure = initializeContactDisclosure();
    if (!contactDisclosure) return;
    const contactContent = contactDisclosure.desktopPanel.querySelector('#contactPanel');
    let feedbackTimer, feedbackAnimation;
    const highlightContact = () => {
      clearTimeout(feedbackTimer);
      feedbackAnimation?.cancel();
      contactContent.classList.add('highlight-border');
      feedbackTimer = setTimeout(() => contactContent.classList.remove('highlight-border'), 700);
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches && contactContent.animate) {
        feedbackAnimation = contactContent.animate([
          { transform: 'translateX(0)' }, { transform: 'translateX(-4px)' },
          { transform: 'translateX(4px)' }, { transform: 'translateX(-3px)' },
          { transform: 'translateX(3px)' }, { transform: 'translateX(0)' }
        ], { duration: 320, easing: 'ease-in-out' });
      }
    };
    ['desktop', 'mobile'].forEach(type => {
      const trigger = contactDisclosure[`${type}Trigger`];
      const panel = contactDisclosure[`${type}Panel`];
      trigger.addEventListener('click', event => {
        if (!isEnhancedMode()) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (contactIsOpen(type)) { highlightContact(); return; }
        closePortfolioMenus();
        setAboutMenuOpen(false);
        setProjectsMenuOpen(false);
        closeContactDisclosures(type);
        setContactOpen(type, true);
      });
    });
    const copyButton = contactDisclosure.desktopPanel.querySelector('[data-contact-copy]');
    const emailRow = contactDisclosure.desktopPanel.querySelector('.contact-item-email');
    const closeButton = contactDisclosure.desktopPanel.querySelector('.contact-drawer-close');
    const mobileBackButton = contactDisclosure.desktopPanel.querySelector('.contact-mobile-back');
    const mobileCloseButton = contactDisclosure.desktopPanel.querySelector('.contact-mobile-close');
    copyButton.addEventListener('click', event => copyContactEmail(event.currentTarget, contactDisclosure.desktopPanel));
    emailRow.addEventListener('click', event => {
      if (event.target.closest('[data-contact-copy]')) return;
      copyContactEmail(copyButton, contactDisclosure.desktopPanel);
    });
    emailRow.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      copyContactEmail(copyButton, contactDisclosure.desktopPanel);
    });
    closeButton.addEventListener('click', () => {
      const type = contactIsOpen('mobile') ? 'mobile' : 'desktop';
      setContactOpen(type, false);
      contactDisclosure[`${type}Trigger`].focus();
    });
    mobileBackButton.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      setContactOpen('mobile', false);
      if (!isDrawerOpen()) setDrawerOpen(true);
      window.requestAnimationFrame(() => contactDisclosure.mobileTrigger.focus());
    });
    mobileCloseButton.addEventListener('click', () => {
      setContactOpen('mobile', false);
      setDrawerOpen(false);
      navToggle?.focus();
    });
  }

  function menuParts(menu) {
    if (!menu) return {};
    return {
      trigger: menu.querySelector('[data-portfolio-trigger]'),
      panel: menu.querySelector('[data-portfolio-panel]')
    };
  }

  function cancelPortfolioClose(menu) {
    if (!menu) return;
    const timer = portfolioCloseTimers.get(menu);
    if (timer) window.clearTimeout(timer);
    portfolioCloseTimers.delete(menu);
  }

  function setMenuOpen(menu, open, focusTarget) {
    const { trigger, panel } = menuParts(menu);
    if (!trigger || !panel) return;
    cancelPortfolioClose(menu);
    trigger.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    menu.classList.toggle('is-open', open);
    if (open) closeContactDisclosures();

    if (open && focusTarget) {
      const items = Array.from(panel.querySelectorAll('a[href]'));
      const target = focusTarget === 'last' ? items[items.length - 1] : items[0];
      if (target) target.focus();
    }
  }

  function isMenuOpen(menu) {
    const { trigger } = menuParts(menu);
    return Boolean(trigger && trigger.getAttribute('aria-expanded') === 'true');
  }

  function isEnhancedMode() {
    return document.documentElement.dataset.portfolioMode === 'enhanced';
  }

  function schedulePortfolioClose(menu) {
    if (!menu) return;
    cancelPortfolioClose(menu);
    const timer = window.setTimeout(() => {
      portfolioCloseTimers.delete(menu);
      if (menu.matches(':hover') || menu.contains(document.activeElement)) return;
      setMenuOpen(menu, false);
    }, isEnhancedMode() ? PORTFOLIO_CLOSE_DELAY_MS : 0);
    portfolioCloseTimers.set(menu, timer);
  }

  function closePortfolioMenus(except) {
    [desktopMenu, mobileMenu].forEach(menu => {
      if (menu && menu !== except) setMenuOpen(menu, false);
    });
  }

  function returnFocusToTrigger(menu) {
    const { trigger } = menuParts(menu);
    if (!menu || !trigger) return;
    menu.dataset.suppressFocusOpen = 'true';
    trigger.focus();
    window.setTimeout(() => delete menu.dataset.suppressFocusOpen, 0);
  }

  function bindPortfolioMenu(menu, desktop) {
    const { trigger, panel } = menuParts(menu);
    if (!menu || !trigger || !panel) return;
    let pointerDownOpenState = null;
    trigger.setAttribute('aria-haspopup', 'menu');
    panel.setAttribute('role', 'menu');
    panel.querySelectorAll('a[href]').forEach(link => link.setAttribute('role', 'menuitem'));

    trigger.addEventListener('pointerdown', () => {
      pointerDownOpenState = isMenuOpen(menu);
      cancelPortfolioClose(menu);
    });

    trigger.addEventListener('click', event => {
      event.stopPropagation();
      const wasOpen = event.detail > 0 && pointerDownOpenState !== null
        ? pointerDownOpenState
        : isMenuOpen(menu);
      pointerDownOpenState = null;
      closePortfolioMenus(menu);
      setMenuOpen(menu, !wasOpen);
    });

    trigger.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        closePortfolioMenus(menu);
        setMenuOpen(menu, true, event.key === 'ArrowUp' ? 'last' : 'first');
      }
    });

    panel.addEventListener('keydown', event => {
      const items = Array.from(panel.querySelectorAll('a[href]'));
      const index = items.indexOf(document.activeElement);
      let nextIndex = index;

      if (event.key === 'ArrowDown') nextIndex = (index + 1) % items.length;
      else if (event.key === 'ArrowUp') nextIndex = (index - 1 + items.length) % items.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = items.length - 1;
      else return;

      event.preventDefault();
      if (items[nextIndex]) items[nextIndex].focus();
    });
    panel.querySelectorAll('a[href]').forEach(link => {
      link.addEventListener('click', () => setMenuOpen(menu, false));
    });

    if (desktop) {
      menu.addEventListener('focusin', () => {
        cancelPortfolioClose(menu);
        if (menu.dataset.suppressFocusOpen === 'true') {
          return;
        }
        closePortfolioMenus(menu);
        setMenuOpen(menu, true);
      });
      menu.addEventListener('focusout', event => {
        const nextFocused = event.relatedTarget;
        if (nextFocused && menu.contains(nextFocused)) return;
        schedulePortfolioClose(menu);
      });
      menu.addEventListener('pointerenter', () => {
        if (!fineHoverPointer.matches) return;
        cancelPortfolioClose(menu);
        closePortfolioMenus(menu);
        setMenuOpen(menu, true);
      });
      menu.addEventListener('pointerleave', () => {
        if (!fineHoverPointer.matches) return;
        schedulePortfolioClose(menu);
      });
    }
  }

  function cancelAboutClose() {
    if (!aboutCloseTimer) return;
    window.clearTimeout(aboutCloseTimer);
    aboutCloseTimer = 0;
  }

  function scheduleAboutClose() {
    cancelAboutClose();
    aboutCloseTimer = window.setTimeout(() => {
      aboutCloseTimer = 0;
      const keyboardFocusWithin = aboutMenu && aboutMenu.matches(':focus-within') && aboutMenu.querySelector(':focus-visible');
      if (!aboutMenu || aboutMenu.matches(':hover') || keyboardFocusWithin) return;
      setAboutMenuOpen(false);
    }, ABOUT_CLOSE_DELAY_MS);
  }

  function setAboutMenuOpen(open, focusFirst) {
    if (!aboutMenu) return;
    const toggle = aboutMenu.querySelector('.nav-about-toggle');
    const panel = aboutMenu.querySelector('.nav-about-menu');
    if (!toggle || !panel) return;
    cancelAboutClose();
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close About destinations' : 'Open About destinations');
    panel.hidden = !open;
    aboutMenu.classList.toggle('is-open', open);
    if (open) {
      setProjectsMenuOpen(false);
      closePortfolioMenus();
      closeContactDisclosures();
      if (focusFirst) panel.querySelector('a[href]')?.focus();
    }
  }

  function bindAboutMenu() {
    if (!aboutMenu) return;
    const toggle = aboutMenu.querySelector('.nav-about-toggle');
    const panel = aboutMenu.querySelector('.nav-about-menu');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      setAboutMenuOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    toggle.addEventListener('keydown', event => {
      if (event.key !== 'ArrowDown') return;
      event.preventDefault();
      setAboutMenuOpen(true, true);
    });
    panel.querySelectorAll('a[href]').forEach(link => {
      link.addEventListener('click', () => setAboutMenuOpen(false));
    });
    aboutMenu.querySelector('.nav-about-link')?.addEventListener('click', () => setAboutMenuOpen(false));
    aboutMenu.addEventListener('focusout', event => {
      if (event.relatedTarget && aboutMenu.contains(event.relatedTarget)) return;
      setAboutMenuOpen(false);
    });
    aboutMenu.addEventListener('pointerenter', () => {
      if (!fineHoverPointer.matches) return;
      cancelAboutClose();
      setAboutMenuOpen(true);
    });
    aboutMenu.addEventListener('pointerleave', () => {
      if (!fineHoverPointer.matches) return;
      scheduleAboutClose();
    });
  }

  function cancelProjectsClose() {
    if (!projectsCloseTimer) return;
    window.clearTimeout(projectsCloseTimer);
    projectsCloseTimer = 0;
  }

  function scheduleProjectsClose() {
    cancelProjectsClose();
    projectsCloseTimer = window.setTimeout(() => {
      projectsCloseTimer = 0;
      const keyboardFocusWithin = projectsMenu && projectsMenu.matches(':focus-within') && projectsMenu.querySelector(':focus-visible');
      if (!projectsMenu || projectsMenu.matches(':hover') || keyboardFocusWithin) return;
      setProjectsMenuOpen(false);
    }, ABOUT_CLOSE_DELAY_MS);
  }

  function setProjectsMenuOpen(open, focusFirst) {
    if (!projectsMenu) return;
    const toggle = projectsMenu.querySelector('.nav-about-toggle');
    const panel = projectsMenu.querySelector('.nav-about-menu');
    if (!toggle || !panel) return;
    cancelProjectsClose();
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close Project destinations' : 'Open Project destinations');
    panel.hidden = !open;
    projectsMenu.classList.toggle('is-open', open);
    if (open) {
      setAboutMenuOpen(false);
      closePortfolioMenus();
      closeContactDisclosures();
      if (focusFirst) panel.querySelector('a[href]')?.focus();
    }
  }

  function bindProjectsMenu() {
    if (!projectsMenu) return;
    const toggle = projectsMenu.querySelector('.nav-about-toggle');
    const panel = projectsMenu.querySelector('.nav-about-menu');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      setProjectsMenuOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    toggle.addEventListener('keydown', event => {
      if (event.key !== 'ArrowDown') return;
      event.preventDefault();
      setProjectsMenuOpen(true, true);
    });
    panel.querySelectorAll('a[href]').forEach(link => {
      link.addEventListener('click', event => {
        if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
          try {
            const destination = new URL(link.href, window.location.href);
            const currentDocument = window.location.pathname + window.location.search;
            const destinationDocument = destination.pathname + destination.search;
            if (destination.origin === window.location.origin && destinationDocument !== currentDocument && destination.hash) {
              queueSectionArrival(destination.hash);
            }
          } catch (error) {
            // The link still follows its native destination if URL parsing fails.
          }
        }
        setProjectsMenuOpen(false);
      });
    });
    projectsMenu.querySelector('.nav-projects-link')?.addEventListener('click', () => setProjectsMenuOpen(false));
    projectsMenu.addEventListener('focusout', event => {
      if (event.relatedTarget && projectsMenu.contains(event.relatedTarget)) return;
      setProjectsMenuOpen(false);
    });
    projectsMenu.addEventListener('pointerenter', () => {
      if (!fineHoverPointer.matches) return;
      cancelProjectsClose();
      setProjectsMenuOpen(true);
    });
    projectsMenu.addEventListener('pointerleave', () => {
      if (!fineHoverPointer.matches) return;
      scheduleProjectsClose();
    });
  }

  function isDrawerOpen() {
    return Boolean(navToggle && navToggle.getAttribute('aria-expanded') === 'true');
  }

  function setDrawerOpen(open) {
    if (!navToggle || !drawer || !hamburger) return;
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    navToggle.title = open ? 'Close menu' : 'Open menu';
    drawer.setAttribute('aria-hidden', String(!open));
    drawer.classList.toggle('is-open', open);
    hamburger.classList.toggle('open', open);
    document.body.classList.toggle('nav-drawer-open', open);
    if (!open) {
      setMenuOpen(mobileMenu, false);
      setContactOpen('mobile', false);
    }
  }

  bindContactDisclosure();
  bindPortfolioMenu(desktopMenu, true);
  bindPortfolioMenu(mobileMenu, false);
  bindAboutMenu();
  bindProjectsMenu();

  if (navToggle && drawer && hamburger) {
    navToggle.setAttribute('aria-label', 'Open menu');
    navToggle.title = 'Open menu';
    navToggle.addEventListener('click', () => setDrawerOpen(!isDrawerOpen()));
    drawer.querySelectorAll('a[href]').forEach(link => {
      link.addEventListener('click', () => setDrawerOpen(false));
    });
    drawer.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (link && !link.classList.contains('drawer-contact')) setDrawerOpen(false);
    });
  }

  document.addEventListener('click', event => {
    if (aboutMenu && !aboutMenu.contains(event.target)) setAboutMenuOpen(false);
    if (projectsMenu && !projectsMenu.contains(event.target)) setProjectsMenuOpen(false);
    if (desktopMenu && !desktopMenu.contains(event.target)) setMenuOpen(desktopMenu, false);
    if (mobileMenu && !mobileMenu.contains(event.target)) setMenuOpen(mobileMenu, false);
    if (contactIsOpen('desktop') && !contactDisclosure.desktopHost.contains(event.target)) setContactOpen('desktop', false);
    if (contactIsOpen('mobile') && !contactDisclosure.mobilePanel.contains(event.target) && !contactDisclosure.mobileTrigger.contains(event.target)) {
      setContactOpen('mobile', false);
      contactDisclosure.mobileTrigger.focus({ preventScroll: true });
    }
    if (window.innerWidth <= 900 && isDrawerOpen() && !drawer.contains(event.target) && !navToggle.contains(event.target)) {
      setDrawerOpen(false);
      navToggle.focus({ preventScroll: true });
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;

    if (aboutMenu && aboutMenu.classList.contains('is-open')) {
      setAboutMenuOpen(false);
      aboutMenu.querySelector('.nav-about-toggle')?.focus();
      return;
    }

    if (projectsMenu && projectsMenu.classList.contains('is-open')) {
      setProjectsMenuOpen(false);
      projectsMenu.querySelector('.nav-about-toggle')?.focus();
      return;
    }

    if (isMenuOpen(desktopMenu)) {
      setMenuOpen(desktopMenu, false);
      returnFocusToTrigger(desktopMenu);
      return;
    }
    if (isMenuOpen(mobileMenu)) {
      setMenuOpen(mobileMenu, false);
      returnFocusToTrigger(mobileMenu);
      return;
    }
    if (contactIsOpen('desktop')) {
      setContactOpen('desktop', false);
      contactDisclosure.desktopTrigger.focus();
      return;
    }
    if (contactIsOpen('mobile')) {
      setContactOpen('mobile', false);
      contactDisclosure.mobileTrigger.focus();
      return;
    }
    if (isDrawerOpen()) {
      setDrawerOpen(false);
      navToggle.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && isDrawerOpen()) setDrawerOpen(false);
    if (window.innerWidth <= 900) setAboutMenuOpen(false);
    if (window.innerWidth <= 900) setProjectsMenuOpen(false);
    if (window.innerWidth <= 900) setMenuOpen(desktopMenu, false);
    if (window.innerWidth <= 900) setContactOpen('desktop', false);
    else setContactOpen('mobile', false);
  });

  // Shared Enhanced desktop terminal cursor for the five primary link labels.
  const primaryNavRail = document.querySelector('.nav-primary-rail');
  if (primaryNavRail && primaryNavRail.dataset.characterCursorReady !== 'true') {
    primaryNavRail.dataset.characterCursorReady = 'true';
    const desktopPrimaryNav = window.matchMedia('(min-width: 901px)');
    const controls = Array.from(primaryNavRail.querySelectorAll(':scope > a, :scope > .nav-about > .nav-about-link'));
    const records = [];
    let measureFrame = 0;
    let pointerFrame = 0;
    let pendingPointer = null;
    let latchedControl = null;
    let latchTimer = 0;

    controls.forEach(control => {
      const labelNode = Array.from(control.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
      if (!labelNode) return;
      const label = labelNode.textContent.trim();
      const visual = document.createElement('span');
      visual.className = 'nav-label-visual';
      visual.setAttribute('aria-hidden', 'true');
      Array.from(label).forEach(character => {
        const span = document.createElement('span');
        span.className = 'nav-label-char';
        span.textContent = character === ' ' ? '\u00a0' : character;
        visual.appendChild(span);
      });
      const cursor = document.createElement('span');
      cursor.className = 'nav-character-cursor';
      cursor.setAttribute('aria-hidden', 'true');
      control.insertBefore(visual, labelNode);
      labelNode.remove();
      control.appendChild(cursor);
      control.classList.add('nav-character-control');
      if (control.tagName === 'A' && !control.hasAttribute('aria-label')) control.setAttribute('aria-label', label);
      records.push({ control, characters: Array.from(visual.children), metrics: null });
    });

    const interactive = () => desktopPrimaryNav.matches && document.documentElement.getAttribute('data-portfolio-mode') === 'enhanced';
    const measure = record => {
      const characters = record.characters.map(element => {
        const rect = element.getBoundingClientRect();
        return { element, centerX: rect.left + rect.width / 2, left: rect.left, right: rect.right, offsetLeft: element.offsetLeft, width: element.offsetWidth };
      });
      record.metrics = { characters, left: characters.length ? characters[0].left : 0, right: characters.length ? characters[characters.length - 1].right : 0 };
    };
    const position = (record, character = record.characters[0]) => {
      if (!character) return;
      const metric = record.metrics && record.metrics.characters.find(candidate => candidate.element === character);
      record.control.style.setProperty('--nav-cursor-x', `${metric ? metric.offsetLeft : character.offsetLeft}px`);
      record.control.style.setProperty('--nav-cursor-width', `${metric ? metric.width : character.offsetWidth}px`);
    };
    const scheduleMeasure = () => {
      if (measureFrame) cancelAnimationFrame(measureFrame);
      measureFrame = requestAnimationFrame(() => {
        measureFrame = 0;
        records.forEach(measure);
        records.forEach(record => position(record));
        if (!interactive()) clearTransient();
      });
    };
    const clearTransient = () => {
      latchedControl = null;
      pendingPointer = null;
      if (latchTimer) clearTimeout(latchTimer);
      latchTimer = 0;
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      primaryNavRail.classList.remove('has-nav-pointer-owner', 'has-nav-focus-owner');
      records.forEach(record => {
        record.control.classList.remove('is-nav-pointer-owner', 'is-nav-focus-owner');
        position(record);
      });
    };
    const updatePointer = () => {
      pointerFrame = 0;
      const pending = pendingPointer;
      pendingPointer = null;
      if (!pending || !interactive()) return;
      const record = pending.record;
      if (!record.metrics) measure(record);
      let nearest = null;
      let nearestDistance = Infinity;
      if (pending.clientX >= record.metrics.left - 4 && pending.clientX <= record.metrics.right + 4) {
        record.metrics.characters.forEach(metric => {
          const distance = Math.abs(pending.clientX - metric.centerX);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearest = metric.element;
          }
        });
      }
      position(record, nearest || record.characters[0]);
    };

    records.forEach(record => {
      record.control.addEventListener('pointerenter', () => {
        if (!interactive()) return;
        if (latchedControl && latchedControl !== record.control) {
          latchedControl = null;
          if (latchTimer) clearTimeout(latchTimer);
          latchTimer = 0;
        }
        measure(record);
        primaryNavRail.classList.add('has-nav-pointer-owner');
        records.forEach(candidate => candidate.control.classList.toggle('is-nav-pointer-owner', candidate === record));
        position(record);
      });
      record.control.addEventListener('pointermove', event => {
        if (!interactive() || latchedControl === record.control) return;
        pendingPointer = { record, clientX: event.clientX };
        if (!pointerFrame) pointerFrame = requestAnimationFrame(updatePointer);
      });
      record.control.addEventListener('pointerleave', () => {
        pendingPointer = null;
        if (pointerFrame) cancelAnimationFrame(pointerFrame);
        pointerFrame = 0;
        if (latchedControl === record.control) {
          position(record);
          return;
        }
        primaryNavRail.classList.remove('has-nav-pointer-owner');
        record.control.classList.remove('is-nav-pointer-owner');
        position(record);
      });
      record.control.addEventListener('focus', () => {
        if (!interactive()) return;
        primaryNavRail.classList.add('has-nav-focus-owner');
        record.control.classList.add('is-nav-focus-owner');
        position(record);
      });
      record.control.addEventListener('blur', () => {
        primaryNavRail.classList.remove('has-nav-focus-owner');
        record.control.classList.remove('is-nav-focus-owner');
        position(record);
      });
      record.control.addEventListener('click', event => {
        if (!interactive() || event.detail === 0) return;
        latchedControl = record.control;
        if (latchTimer) clearTimeout(latchTimer);
        latchTimer = setTimeout(() => {
          latchTimer = 0;
          if (latchedControl === record.control) position(record);
        }, 450);
        primaryNavRail.classList.add('has-nav-pointer-owner');
        records.forEach(candidate => candidate.control.classList.toggle('is-nav-pointer-owner', candidate === record));
        position(record);
      });
    });

    primaryNavRail.addEventListener('pointerleave', clearTransient);
    window.addEventListener('resize', scheduleMeasure, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleMeasure);
    if (desktopPrimaryNav.addEventListener) desktopPrimaryNav.addEventListener('change', scheduleMeasure);
    else desktopPrimaryNav.addListener(scheduleMeasure);
    new MutationObserver(scheduleMeasure).observe(document.documentElement, { attributes: true, attributeFilter: ['data-portfolio-mode'] });
    scheduleMeasure();
  }

  // Smooth the handoff between same-site pages. Hash navigation within the
  // current document remains immediate so existing section scrolling is not
  // delayed or replaced.
  const initializePageNavigationTransition = function() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const transitionKey = 'portfolio-page-transition';
    const transitionDuration = 65;
    let isNavigating = false;
    let transitionOverlay = null;
    let activeAnimations = [];

    const readTransitionFlag = function() {
      try {
        const isPending = window.sessionStorage.getItem(transitionKey) === 'pending';
        if (isPending) window.sessionStorage.removeItem(transitionKey);
        return isPending;
      } catch (error) {
        return false;
      }
    };

    const writeTransitionFlag = function() {
      try {
        window.sessionStorage.setItem(transitionKey, 'pending');
      } catch (error) {
        // Navigation still works if storage is unavailable.
      }
    };

    const getTransitionColor = function() {
      const bodyColor = window.getComputedStyle(document.body).backgroundColor;
      return bodyColor && bodyColor !== 'rgba(0, 0, 0, 0)' && bodyColor !== 'transparent'
        ? bodyColor
        : '#0f1724';
    };

    const createOverlay = function(initialOpacity) {
      if (transitionOverlay) transitionOverlay.remove();
      const overlay = document.createElement('div');
      overlay.setAttribute('aria-hidden', 'true');
      Object.assign(overlay.style, {
        position: 'fixed',
        inset: '0',
        zIndex: '2147483647',
        pointerEvents: 'none',
        background: getTransitionColor(),
        opacity: String(initialOpacity)
      });
      document.body.appendChild(overlay);
      transitionOverlay = overlay;
      return overlay;
    };

    const clearTransition = function() {
      activeAnimations.forEach(function(animation) { animation.cancel(); });
      activeAnimations = [];
      if (transitionOverlay) transitionOverlay.remove();
      transitionOverlay = null;
      document.documentElement.classList.remove('portfolio-page-transition-pending');
      isNavigating = false;
    };

    const hasPendingTransition = readTransitionFlag();
    if (hasPendingTransition && !reducedMotion.matches && typeof Element.prototype.animate === 'function') {
      const startEntrance = function() {
        document.documentElement.classList.remove('portfolio-page-transition-pending');
        const entrance = document.body.animate([
          { opacity: 0.72 },
          { opacity: 1 }
        ], {
          duration: 85,
          easing: 'cubic-bezier(0.2, 0.78, 0.2, 1)',
          fill: 'forwards'
        });
        activeAnimations.push(entrance);
        entrance.finished.then(clearTransition).catch(clearTransition);
      };
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startEntrance, { once: true });
      } else {
        startEntrance();
      }
    } else {
      document.documentElement.classList.remove('portfolio-page-transition-pending');
    }

    document.addEventListener('click', function(event) {
      if (event.defaultPrevented || isNavigating || reducedMotion.matches) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = event.target.closest('a[href]');
      if (!link || link.hasAttribute('download') || link.target === '_blank') return;

      let destination;
      try {
        destination = new URL(link.href, window.location.href);
      } catch (error) {
        return;
      }

      if (!/^https?:$/.test(destination.protocol) || destination.origin !== window.location.origin) return;
      const currentDocument = window.location.pathname + window.location.search;
      const destinationDocument = destination.pathname + destination.search;
      if (destinationDocument === currentDocument) return;
      if (/\.pdf$/i.test(destination.pathname) || typeof Element.prototype.animate !== 'function') return;

      event.preventDefault();
      isNavigating = true;
      writeTransitionFlag();

      const overlay = createOverlay(0);
      const overlayAnimation = overlay.animate([
        { opacity: 0 },
        { opacity: 1 }
      ], {
        duration: transitionDuration,
        easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
        fill: 'forwards'
      });
      activeAnimations.push(overlayAnimation);

      const pageSurfaces = Array.from(document.querySelectorAll('body > .nav, body > main'));
      pageSurfaces.forEach(function(surface) {
        const animation = surface.animate([
          { opacity: 1, transform: 'translate3d(0, 0, 0)' },
          { opacity: 0.9, transform: 'translate3d(0, -2px, 0)' }
        ], {
          duration: transitionDuration,
          easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
          fill: 'forwards'
        });
        activeAnimations.push(animation);
      });

      let navigationCommitted = false;
      const navigate = function() {
        if (navigationCommitted) return;
        navigationCommitted = true;
        window.location.assign(destination.href);
      };
      overlayAnimation.finished.then(navigate).catch(navigate);
      window.setTimeout(function() {
        if (isNavigating) navigate();
      }, transitionDuration + 65);
    });

    window.addEventListener('pageshow', function(event) {
      if (event.persisted) clearTransition();
    });
  };

  // Hint at the next content without withholding what is already in view.
  const initializePortfolioScrollCue = function() {
    if (!document.body.classList.contains('portfolio-index-page') || window.scrollY > 0 || window.location.hash) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let cue = null;
    let dismissed = false;

    const dismiss = function() {
      if (dismissed) return;
      dismissed = true;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      window.removeEventListener('load', update);
      window.removeEventListener('pageshow', update);
      window.removeEventListener('portfolio:sections-ready', update);
      document.removeEventListener('focusin', onFocus);
      if (!cue) return;
      const fadingCue = cue;
      cue = null;
      fadingCue.classList.remove('is-visible');
      if (reducedMotion.matches) fadingCue.remove();
      else window.setTimeout(function() { fadingCue.remove(); }, 240);
    };
    const onScroll = function() {
      if (window.scrollY > 0) dismiss();
    };
    const onFocus = function(event) {
      if (cue && event.target instanceof Element && event.target.getBoundingClientRect().bottom > cue.getBoundingClientRect().top) dismiss();
    };
    const update = function() {
      if (dismissed) return;
      if (window.scrollY > 0 || window.location.hash) { dismiss(); return; }
      if (document.documentElement.scrollHeight <= window.innerHeight + 1) {
        if (cue) cue.remove();
        cue = null;
        return;
      }
      if (cue) return;
      cue = document.createElement('div');
      cue.className = 'portfolio-scroll-cue';
      cue.setAttribute('aria-hidden', 'true');
      document.body.appendChild(cue);
      void cue.offsetHeight;
      window.requestAnimationFrame(function() {
        if (cue && !dismissed) cue.classList.add('is-visible');
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('load', update);
    window.addEventListener('pageshow', update);
    window.addEventListener('portfolio:sections-ready', update);
    document.addEventListener('focusin', onFocus);
    update();
  };

  initializePortfolioScrollCue();
  initializePageNavigationTransition();

  window.PortfolioNavigation = { isDrawerOpen, setDrawerOpen };
})();
