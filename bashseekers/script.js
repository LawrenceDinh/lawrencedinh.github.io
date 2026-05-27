const productCards = document.querySelectorAll(".product-card");
const heroVideo = document.querySelector("[data-hero-video]");
const heroSlideshow = document.querySelector("[data-hero-slideshow]");
const heroDotsContainer = document.querySelector("[data-hero-dots]");
const heroBackgroundVideo = typeof HERO_BACKGROUND_VIDEO !== "undefined" ? HERO_BACKGROUND_VIDEO : "";
const heroSlidePaths = typeof HERO_SLIDES !== "undefined" && Array.isArray(HERO_SLIDES) ? HERO_SLIDES : [];
const galleryGrid = document.querySelector("[data-gallery-grid]");
const galleryFilterButtons = document.querySelectorAll("[data-gallery-filter]");
const galleryEmpty = document.querySelector("[data-gallery-empty]");
const videoModal = document.querySelector("[data-video-modal]");
const videoModalTitle = document.querySelector("#video-modal-title");
const videoModalFrame = document.querySelector("[data-video-modal-frame]");
const videoModalFallback = document.querySelector("[data-video-modal-fallback]");
const videoModalCloseControls = document.querySelectorAll("[data-video-modal-close]");
const backToTop = document.querySelector("[data-back-to-top]");
const serviceProofPanel = document.querySelector("[data-service-proof]");
const serviceProofToggle = document.querySelector("[data-service-proof-toggle]");
const siteHeader = document.querySelector(".site-header");
const mobileMenuToggle = document.querySelector("[data-mobile-menu-toggle]");
const siteNav = document.querySelector("#site-nav");
const galleryItems = typeof GALLERY_ITEMS !== "undefined" && Array.isArray(GALLERY_ITEMS) ? GALLERY_ITEMS : [];
const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const getNavScrollOffset = () => {
  const headerHeight = siteHeader ? siteHeader.getBoundingClientRect().height : 0;
  return Math.ceil(headerHeight + 12);
};

const updateNavScrollOffset = () => {
  document.documentElement.style.setProperty("--nav-scroll-offset", `${getNavScrollOffset()}px`);
};

const setMobileMenuOpen = (isOpen) => {
  if (!siteHeader || !mobileMenuToggle) {
    return;
  }

  siteHeader.classList.toggle("is-menu-open", isOpen);
  mobileMenuToggle.setAttribute("aria-expanded", String(isOpen));
  updateNavScrollOffset();
};

if (siteHeader && mobileMenuToggle && siteNav) {
  mobileMenuToggle.addEventListener("click", () => {
    setMobileMenuOpen(!siteHeader.classList.contains("is-menu-open"));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMobileMenuOpen(false));
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMobileMenuOpen(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) {
      setMobileMenuOpen(false);
    }
  });
}

updateNavScrollOffset();
window.addEventListener("load", updateNavScrollOffset);
window.addEventListener("resize", updateNavScrollOffset);

const scrollToSection = (target, behavior = reduceMotionQuery.matches ? "auto" : "smooth") => {
  const targetId = target.getAttribute("id");

  if (targetId === "home") {
    window.scrollTo({ top: 0, behavior });
    return;
  }

  const top = target.getBoundingClientRect().top + window.scrollY - getNavScrollOffset();
  window.scrollTo({
    top: Math.max(0, top),
    behavior
  });
};

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const sectionId = link.hash ? decodeURIComponent(link.hash.slice(1)) : "";
    const target = sectionId ? document.getElementById(sectionId) : null;

    if (!target) {
      return;
    }

    event.preventDefault();
    setMobileMenuOpen(false);

    window.requestAnimationFrame(() => {
      updateNavScrollOffset();
      scrollToSection(target);

      if (window.history && window.history.pushState) {
        window.history.pushState(null, "", link.hash);
      } else {
        window.location.hash = link.hash;
      }
    });
  });
});

if (window.location.hash) {
  window.addEventListener("load", () => {
    const sectionId = decodeURIComponent(window.location.hash.slice(1));
    const target = sectionId ? document.getElementById(sectionId) : null;

    if (target) {
      window.requestAnimationFrame(() => scrollToSection(target, "auto"));
    }
  });
}

const navSectionLinks = siteNav ? Array.from(siteNav.querySelectorAll('a[href^="#"]')) : [];

if (navSectionLinks.length) {
  const trackedNavItems = navSectionLinks
    .map((link) => {
      const sectionId = link.hash ? decodeURIComponent(link.hash.slice(1)) : "";
      const section = sectionId ? document.getElementById(sectionId) : null;
      return section ? { link, section, sectionId } : null;
    })
    .filter(Boolean);

  if (trackedNavItems.length) {
    const setActiveNavSection = (activeSectionId) => {
      trackedNavItems.forEach(({ link, sectionId }) => {
        const isActive = sectionId === activeSectionId;
        link.classList.toggle("is-active", isActive);

        if (isActive) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    const getActiveSectionId = () => {
      const headerOffset = getNavScrollOffset();
      const topThreshold = Math.max(24, headerOffset * 0.45);

      if (window.scrollY <= topThreshold) {
        return trackedNavItems[0].sectionId;
      }

      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      const isNearBottom = window.innerHeight + window.scrollY >= documentHeight - 4;
      const lastItem = trackedNavItems[trackedNavItems.length - 1];

      if (isNearBottom) {
        return lastItem.sectionId;
      }

      const probeY = headerOffset + Math.min(window.innerHeight * 0.14, 140);
      let activeSectionId = trackedNavItems[0].sectionId;

      trackedNavItems.forEach(({ section, sectionId }) => {
        if (section.getBoundingClientRect().top <= probeY) {
          activeSectionId = sectionId;
        }
      });

      return activeSectionId;
    };

    let navUpdateQueued = false;

    const updateActiveNav = () => {
      navUpdateQueued = false;
      setActiveNavSection(getActiveSectionId());
    };

    const queueActiveNavUpdate = () => {
      if (navUpdateQueued) {
        return;
      }

      navUpdateQueued = true;
      window.requestAnimationFrame(updateActiveNav);
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(queueActiveNavUpdate, {
        rootMargin: `-${getNavScrollOffset()}px 0px -62% 0px`,
        threshold: [0, 0.18, 0.4, 0.65]
      });

      trackedNavItems.forEach(({ section }) => observer.observe(section));
    }

    window.addEventListener("scroll", queueActiveNavUpdate, { passive: true });
    window.addEventListener("resize", () => {
      updateNavScrollOffset();
      queueActiveNavUpdate();
    });
    queueActiveNavUpdate();
  }
}

productCards.forEach((card) => {
  card.addEventListener("pointerenter", () => card.classList.add("is-tilted"));
  card.addEventListener("pointerleave", () => card.classList.remove("is-tilted"));
});

if (backToTop) {
  const backToTopThreshold = 360;

  const setBackToTopVisible = (isVisible) => {
    backToTop.classList.toggle("is-visible", isVisible);
    backToTop.setAttribute("aria-hidden", String(!isVisible));
    backToTop.tabIndex = isVisible ? 0 : -1;
  };

  const updateBackToTop = () => {
    setBackToTopVisible(window.pageYOffset > backToTopThreshold);
  };

  window.addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();

  backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: reduceMotionQuery.matches ? "auto" : "smooth"
    });
  });
}

if (serviceProofPanel && serviceProofToggle) {
  const setServiceProofExpanded = (isExpanded) => {
    serviceProofPanel.classList.toggle("is-expanded", isExpanded);
    serviceProofPanel.classList.toggle("is-collapsed", !isExpanded);
    serviceProofToggle.setAttribute("aria-expanded", String(isExpanded));
    serviceProofToggle.textContent = isExpanded ? "HIDE IMAGE \u2191" : "EXPAND IMAGE \u2193";
  };

  setServiceProofExpanded(false);

  serviceProofToggle.addEventListener("click", () => {
    setServiceProofExpanded(!serviceProofPanel.classList.contains("is-expanded"));
  });
}

if (heroVideo && heroBackgroundVideo) {
  const source = document.createElement("source");
  source.src = heroBackgroundVideo;
  source.type = "video/mp4";
  heroVideo.append(source);
  heroVideo.load();
}

if (heroSlideshow && heroSlidePaths.length) {
  heroSlidePaths.forEach((slidePath, index) => {
    const slide = document.createElement("img");
    slide.className = index === 0 ? "poster-slide is-active" : "poster-slide";
    slide.src = slidePath;
    slide.alt = "";
    heroSlideshow.append(slide);
  });
}

if (heroDotsContainer && heroSlidePaths.length > 1) {
  heroSlidePaths.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className = index === 0 ? "poster-dot is-active" : "poster-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
    dot.dataset.slideIndex = String(index);

    if (index === 0) {
      dot.setAttribute("aria-current", "true");
    }

    heroDotsContainer.append(dot);
  });
}

const heroSlides = heroSlideshow ? heroSlideshow.querySelectorAll(".poster-slide") : [];
const heroDots = heroDotsContainer ? heroDotsContainer.querySelectorAll(".poster-dot") : [];

if (heroSlides.length > 1 && heroDots.length) {
  let activeSlide = 0;
  let slideTimer;
  let swipeState = null;

  const showHeroSlide = (index) => {
    activeSlide = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });

    heroDots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeSlide;
      dot.classList.toggle("is-active", isActive);

      if (isActive) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  };

  const startHeroSlideshow = () => {
    window.clearInterval(slideTimer);
    slideTimer = window.setInterval(() => {
      showHeroSlide(activeSlide + 1);
    }, 5000);
  };

  const goToNextHeroSlide = () => {
    showHeroSlide(activeSlide + 1);
    startHeroSlideshow();
  };

  const goToPreviousHeroSlide = () => {
    showHeroSlide(activeSlide - 1);
    startHeroSlideshow();
  };

  heroDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      showHeroSlide(Number(dot.dataset.slideIndex));
      startHeroSlideshow();
    });
  });

  const heroSwipeTarget = heroSlideshow.closest(".hero-poster") || heroSlideshow;

  if (window.PointerEvent && heroSwipeTarget) {
    const swipeThreshold = 52;
    const swipeIntentThreshold = 12;
    const horizontalRatio = 1.25;
    const interactiveSelector = "a, button, input, textarea, select, summary, [role='button'], [tabindex]";

    const resetSwipeState = () => {
      swipeState = null;
    };

    heroSwipeTarget.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" || event.button !== 0 || event.target.closest(interactiveSelector)) {
        return;
      }

      swipeState = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        currentX: event.clientX,
        currentY: event.clientY,
        isHorizontalSwipe: false,
        hasChangedSlide: false
      };

      heroSwipeTarget.setPointerCapture(event.pointerId);
    });

    heroSwipeTarget.addEventListener("pointermove", (event) => {
      if (!swipeState || event.pointerId !== swipeState.pointerId) {
        return;
      }

      swipeState.currentX = event.clientX;
      swipeState.currentY = event.clientY;

      const deltaX = swipeState.currentX - swipeState.startX;
      const deltaY = swipeState.currentY - swipeState.startY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (
        !swipeState.isHorizontalSwipe &&
        absDeltaX >= swipeIntentThreshold &&
        absDeltaX > absDeltaY * horizontalRatio
      ) {
        swipeState.isHorizontalSwipe = true;
      }

      if (swipeState.isHorizontalSwipe && event.cancelable) {
        event.preventDefault();
      }
    });

    heroSwipeTarget.addEventListener("pointerup", (event) => {
      if (!swipeState || event.pointerId !== swipeState.pointerId) {
        return;
      }

      swipeState.currentX = event.clientX;
      swipeState.currentY = event.clientY;

      const deltaX = swipeState.currentX - swipeState.startX;
      const deltaY = swipeState.currentY - swipeState.startY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (
        !swipeState.hasChangedSlide &&
        absDeltaX >= swipeThreshold &&
        absDeltaX > absDeltaY * horizontalRatio
      ) {
        const isFingerMovingRight = deltaX > 0;

        // Intentional: the hero card sequence treats finger-right as next.
        if (isFingerMovingRight) {
          goToNextHeroSlide();
        } else if (deltaX < 0) {
          goToPreviousHeroSlide();
        }

        swipeState.hasChangedSlide = true;
      }

      resetSwipeState();
    });

    heroSwipeTarget.addEventListener("pointercancel", resetSwipeState);
  }

  startHeroSlideshow();
}

const getGalleryThumbnail = (item) => {
  if (item.thumbnail) {
    return item.thumbnail;
  }

  if (item.type === "youtube" && item.videoId) {
    return `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`;
  }

  return "";
};

const getGalleryActionLabel = (item) => {
  if (item.type === "instagram") {
    return "OPEN";
  }

  if (item.type === "upload") {
    return item.src && /\.(mp4|webm|mov)$/i.test(item.src) ? "PLAY" : "VIEW";
  }

  return "PLAY VIDEO";
};

if (galleryGrid && videoModal && videoModalFrame && videoModalTitle) {
  const closeVideoModal = () => {
    videoModal.hidden = true;
    videoModalFrame.replaceChildren();
  };

  const setFallbackLink = (href, text) => {
    if (!videoModalFallback) {
      return;
    }

    videoModalFallback.hidden = !href;
    videoModalFallback.href = href || "#gallery";
    videoModalFallback.textContent = text || "Open media";
  };

  const openYoutubeModal = (item) => {
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${item.videoId}?rel=0&playsinline=1`;
    iframe.title = item.title;
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;

    videoModalTitle.textContent = item.title;
    setFallbackLink(`https://www.youtube.com/watch?v=${item.videoId}`, "Watch video on YouTube \u2192");
    videoModalFrame.replaceChildren(iframe);
    videoModal.hidden = false;
  };

  const openInstagramModal = (item) => {
    const panel = document.createElement("div");
    panel.className = "video-modal-fallback-panel";

    if (item.thumbnail) {
      const image = document.createElement("img");
      image.src = item.thumbnail;
      image.alt = "";
      panel.append(image);
    }

    const copy = document.createElement("p");
    copy.textContent = "Instagram embeds can be unreliable on static pages. Open the original post in a new tab.";
    panel.append(copy);

    videoModalTitle.textContent = item.title;
    setFallbackLink(item.url, "Open on Instagram \u2192");
    videoModalFrame.replaceChildren(panel);
    videoModal.hidden = false;
  };

  const openUploadModal = (item) => {
    const isVideo = item.mediaKind === "video" || (item.src && /\.(mp4|webm|mov)$/i.test(item.src));
    const media = document.createElement(isVideo ? "video" : "img");
    media.src = item.src;

    if (isVideo) {
      media.controls = true;
      media.preload = "metadata";
    } else {
      media.alt = item.title;
    }

    videoModalTitle.textContent = item.title;
    setFallbackLink(item.src, "Open upload \u2192");
    videoModalFrame.replaceChildren(media);
    videoModal.hidden = false;
  };

  const openGalleryItem = (item) => {
    if (item.type === "instagram") {
      openInstagramModal(item);
      return;
    }

    if (item.type === "upload") {
      openUploadModal(item);
      return;
    }

    openYoutubeModal(item);
  };

  const galleryScope = galleryGrid.dataset.galleryScope || "featured";
  const galleryLimit = Number(galleryGrid.dataset.galleryLimit) || Infinity;
  const scopedGalleryItems = galleryItems
    .filter((item) => !item.hidden)
    .filter((item) => galleryScope === "all" || item.featured);
  const orderedGalleryItems = galleryScope === "featured"
    ? scopedGalleryItems.slice().sort((firstItem, secondItem) => {
        const firstOrder = Number.isFinite(firstItem.homeOrder) ? firstItem.homeOrder : Number.MAX_SAFE_INTEGER;
        const secondOrder = Number.isFinite(secondItem.homeOrder) ? secondItem.homeOrder : Number.MAX_SAFE_INTEGER;
        return firstOrder - secondOrder;
      })
    : scopedGalleryItems;
  const visibleGalleryItems = orderedGalleryItems
    .slice(0, galleryLimit);

  const renderGalleryItems = (activeFilter = "all") => {
    const filteredItems = visibleGalleryItems.filter((item) => activeFilter === "all" || item.type === activeFilter);
    galleryGrid.replaceChildren();

    if (galleryEmpty) {
      galleryEmpty.hidden = filteredItems.length > 0;
    }

    filteredItems.forEach((item, index) => {
      const card = document.createElement("button");
      const number = document.createElement("span");
      const title = document.createElement("h3");
      const action = document.createElement("em");
      const thumbnail = getGalleryThumbnail(item);

      card.className = `archive-panel${item.layout ? ` ${item.layout}` : ""}`;
      card.type = "button";
      card.dataset.galleryType = item.type;
      card.setAttribute("aria-label", `${getGalleryActionLabel(item)}: ${item.title}`);

      if (thumbnail) {
        card.style.setProperty("--archive-thumb", `url("${thumbnail}")`);
      }

      number.textContent = String(index + 1).padStart(2, "0");
      title.textContent = item.title;
      action.className = "archive-action";

      if (item.type === "youtube" || getGalleryActionLabel(item).includes("PLAY")) {
        const youtubeIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const youtubePath = document.createElementNS("http://www.w3.org/2000/svg", "path");

        youtubeIcon.classList.add("archive-action-icon");
        youtubeIcon.setAttribute("viewBox", "0 0 24 24");
        youtubeIcon.setAttribute("aria-hidden", "true");
        youtubeIcon.setAttribute("focusable", "false");
        youtubePath.setAttribute("d", "M21.6 7.2c-.2-.9-.9-1.6-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8c.2.9.9 1.6 1.8 1.8 1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 14.9V9.1l5.1 2.9L10 14.9Z");
        youtubeIcon.append(youtubePath);
        action.append(youtubeIcon);
      }

      action.append(document.createTextNode(getGalleryActionLabel(item)));

      card.append(number, title, action);
      card.addEventListener("click", () => openGalleryItem(item));
      galleryGrid.append(card);
    });
  };

  galleryFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const activeFilter = button.dataset.galleryFilter || "all";

      galleryFilterButtons.forEach((filterButton) => {
        const isActive = filterButton === button;
        filterButton.classList.toggle("is-active", isActive);
        filterButton.setAttribute("aria-pressed", String(isActive));
      });

      renderGalleryItems(activeFilter);
    });
  });

  videoModalCloseControls.forEach((control) => {
    control.addEventListener("click", closeVideoModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !videoModal.hidden) {
      closeVideoModal();
    }
  });

  renderGalleryItems();
}
