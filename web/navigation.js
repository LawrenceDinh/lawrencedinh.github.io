(function () {
  const navToggle = document.getElementById('navToggle');
  const drawer = document.getElementById('drawer');
  const hamburger = document.getElementById('hamburgerIcon');
  const desktopMenu = document.querySelector('[data-portfolio-menu="desktop"]');
  const mobileMenu = document.querySelector('[data-portfolio-menu="mobile"]');
  const portfolioCloseTimers = new WeakMap();
  const fineHoverPointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const PORTFOLIO_CLOSE_DELAY_MS = 320;
  const CONTACT = Object.freeze({
    email: 'lawrencetdinh@gmail.com',
    resume: 'Lawrence%20Dinh%20Resume%20Web.pdf',
    linkedin: 'https://www.linkedin.com/in/lawrence-dinh-profile/',
    github: 'https://github.com/LawrenceDinh',
    location: 'San Jose, CA',
    maps: 'https://www.google.com/maps/place/San+Jose,+CA',
    status: 'Open to Work'
  });
  let contactDisclosure = null;

  function contactPanelMarkup() {
    return `<div class="nav-contact-panel" id="navContactPanel" role="region" aria-labelledby="navContactTitle" hidden><div class="section-panel" id="contactPanel">
      <div class="contact-panel-header"><h2 class="section-heading" id="navContactTitle">Contact</h2><button class="contact-drawer-close" type="button" aria-label="Close contact panel">Close</button></div>
      <div class="contact-grid">
        <div class="contact-item contact-item-email" role="button" tabindex="0" data-copy-text="${CONTACT.email}" aria-label="Copy email address ${CONTACT.email}">
          <svg class="inline-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 6.5A2.5 2.5 0 014.5 4h15A2.5 2.5 0 0122 6.5v11A2.5 2.5 0 0119.5 20h-15A2.5 2.5 0 012 17.5v-11z" stroke="currentColor" stroke-width="1.2"></path><path d="M3.5 6.7l8.2 5.2a1 1 0 001.06 0l8.2-5.2" stroke="currentColor" stroke-width="1.2"></path></svg>
          <div class="contact-copy"><div class="small muted">Email</div><div class="contact-email-row"><div class="contact-value contact-value-email" data-default-text="${CONTACT.email}">${CONTACT.email}</div><span class="copy-email-control" data-tooltip="Copy email"><button class="copy-email-btn" type="button" data-contact-copy aria-label="Copy email to clipboard"></button></span></div></div>
        </div>
        <a class="contact-item contact-item--resume" href="${CONTACT.resume}" target="_blank" rel="noopener" aria-label="Open resume PDF"><svg class="inline-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 4h16v16H4z" stroke="currentColor" stroke-width="1.2"></path><path d="M8 9h8M8 13h8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"></path></svg><div class="contact-copy"><div class="small muted">Resume</div><div class="contact-action">Open Resume</div></div></a>
        <div class="contact-item contact-profiles"><svg class="inline-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 4h16v16H4zM8 10v6M8 7.5v.1M11.5 16v-3.3a2.2 2.2 0 014.4 0V16M11.5 11v5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"></path></svg><div class="contact-copy"><div class="small muted">Profiles</div><div class="contact-value contact-profiles-links"><a href="${CONTACT.linkedin}" target="_blank" rel="noopener" aria-label="Open LinkedIn profile">LinkedIn <span class="contact-external-link" aria-hidden="true">↗</span></a><a href="${CONTACT.github}" target="_blank" rel="noopener" aria-label="Open GitHub profile">GitHub <span class="contact-external-link" aria-hidden="true">↗</span></a></div></div></div>
      </div>
      <a class="location-text" href="${CONTACT.maps}" target="_blank" rel="noopener" aria-label="Open ${CONTACT.location} in Google Maps"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg><div><div class="small muted">Location</div><div class="contact-status-value"><span class="contact-status-location">${CONTACT.location}</span><span class="contact-status-divider" aria-hidden="true"></span><span class="contact-status-availability">${CONTACT.status} <svg class="contact-status-check" width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8.25 6.5 11l6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg></span></div></div></a>
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
    ['desktop', 'mobile'].forEach(type => {
      const trigger = contactDisclosure[`${type}Trigger`];
      const panel = contactDisclosure[`${type}Panel`];
      trigger.addEventListener('click', event => {
        if (!isEnhancedMode()) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        const open = !contactIsOpen(type);
        closePortfolioMenus();
        closeContactDisclosures(type);
        setContactOpen(type, open);
      });
    });
    const copyButton = contactDisclosure.desktopPanel.querySelector('[data-contact-copy]');
    const emailRow = contactDisclosure.desktopPanel.querySelector('.contact-item-email');
    const closeButton = contactDisclosure.desktopPanel.querySelector('.contact-drawer-close');
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
    if (!open) {
      setMenuOpen(mobileMenu, false);
      setContactOpen('mobile', false);
    }
  }

  bindContactDisclosure();
  bindPortfolioMenu(desktopMenu, true);
  bindPortfolioMenu(mobileMenu, false);

  if (navToggle && drawer && hamburger) {
    navToggle.setAttribute('aria-label', 'Open menu');
    navToggle.title = 'Open menu';
    navToggle.addEventListener('click', () => setDrawerOpen(!isDrawerOpen()));
    drawer.querySelectorAll('a[href]').forEach(link => {
      link.addEventListener('click', () => setDrawerOpen(false));
    });
  }

  document.addEventListener('click', event => {
    if (desktopMenu && !desktopMenu.contains(event.target)) setMenuOpen(desktopMenu, false);
    if (mobileMenu && !mobileMenu.contains(event.target)) setMenuOpen(mobileMenu, false);
    if (contactIsOpen('desktop') && !contactDisclosure.desktopHost.contains(event.target)) setContactOpen('desktop', false);
    if (window.innerWidth <= 900 && isDrawerOpen() && !drawer.contains(event.target) && !navToggle.contains(event.target)) {
      setDrawerOpen(false);
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;

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
    if (window.innerWidth <= 900) setMenuOpen(desktopMenu, false);
    if (window.innerWidth <= 900) setContactOpen('desktop', false);
    else setContactOpen('mobile', false);
  });

  // Shared Enhanced desktop terminal cursor for the complete primary rail,
  // including the nested Portfolio button used as the current-page control.
  const primaryNavRail = document.querySelector('.nav-primary-rail');
  if (primaryNavRail && primaryNavRail.dataset.characterCursorReady !== 'true') {
    primaryNavRail.dataset.characterCursorReady = 'true';
    primaryNavRail.querySelectorAll('.nav-portfolio-menu .nav-character-cursor').forEach(cursor => cursor.remove());
    primaryNavRail.querySelectorAll('.nav-portfolio-menu .nav-label-visual').forEach(label => {
      label.replaceWith(document.createTextNode(label.textContent));
    });
    primaryNavRail.querySelectorAll('.nav-portfolio-menu .nav-label-char').forEach(character => {
      character.replaceWith(document.createTextNode(character.textContent));
    });
    const desktopPrimaryNav = window.matchMedia('(min-width: 901px)');
    const controls = Array.from(primaryNavRail.querySelectorAll(':scope > a, :scope > .nav-portfolio > .nav-portfolio-trigger'));
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
        span.textContent = character;
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

  window.PortfolioNavigation = { isDrawerOpen, setDrawerOpen };
})();
