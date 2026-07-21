(function () {
  "use strict";

  const MANIFEST_PATH = "writing-data.json";
  const ARTICLE_PATH_PATTERN = /^writing\/articles\/[a-z0-9]+(?:-[a-z0-9]+)*\.html$/;
  const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  let articleImageViewerController = null;
  let articleImageViewerElement = null;

  /*
   * Publishing contract for a future importer:
   * 1. Create one semantic HTML body under writing/articles/.
   * 2. Add or update one manifest record in writing-data.json.
   * 3. Validate that every slug is unique.
   * 4. Use only repository-relative writing/articles/<slug>.html content paths.
   * Article records contain slug, title, subtitle, summary, optional excerpt,
   * category, articleType, classification, date, updated, readingTime, tags,
   * featured, published, and contentPath.
   */

  function getElement(id) {
    return document.getElementById(id);
  }

  function setMetaContent(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.setAttribute("content", value);
  }

  async function loadWritingManifest() {
    const response = await fetch(MANIFEST_PATH, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("The article manifest could not be loaded.");
    const records = await response.json();
    if (!Array.isArray(records)) throw new Error("The article manifest has an invalid format.");
    return records;
  }

  function getPublishedArticles(records) {
    return records
      .filter(function (record) {
        return record && record.published === true && SLUG_PATTERN.test(record.slug || "");
      })
      .sort(function (a, b) {
        return String(b.date || "").localeCompare(String(a.date || ""));
      });
  }

  function articleUrl(article) {
    return "writing-article.html?slug=" + encodeURIComponent(article.slug);
  }

  function formatDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return value || "";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(new Date(value + "T00:00:00"));
  }

  function createTextElement(tagName, className, value) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = value || "";
    return element;
  }

  function createDateElement(value) {
    const time = createTextElement("time", "", formatDate(value));
    time.dateTime = value || "";
    return time;
  }

  function createTags(tags) {
    const list = document.createElement("ul");
    list.className = "writing-tags";
    list.setAttribute("aria-label", "Article tags");
    (Array.isArray(tags) ? tags : []).forEach(function (tag) {
      const item = document.createElement("li");
      item.textContent = tag;
      list.appendChild(item);
    });
    return list;
  }

  function createFeaturedArticle(article, index) {
    const card = document.createElement("article");
    card.className = "writing-featured-card writing-featured-card--primary";

    const indexLabel = createTextElement("span", "writing-featured-card__index", String(index + 1).padStart(2, "0"));
    indexLabel.setAttribute("aria-hidden", "true");

    const meta = document.createElement("div");
    meta.className = "writing-card-meta";
    meta.append(createTextElement("span", "", article.category), createDateElement(article.date));

    const title = document.createElement("h3");
    const titleLink = document.createElement("a");
    titleLink.className = "writing-featured-card__link";
    titleLink.href = articleUrl(article);
    titleLink.textContent = article.title;
    title.appendChild(titleLink);

    const subtitle = createTextElement("p", "writing-card-subtitle", article.subtitle);
    const summary = createTextElement("p", "writing-card-summary", article.summary);
    const rationale = document.createElement("div");
    rationale.className = "writing-featured-rationale";
    rationale.append(
      subtitle,
      summary
    );

    let excerpt = null;
    if (typeof article.excerpt === "string" && article.excerpt.trim()) {
      excerpt = document.createElement("div");
      excerpt.className = "writing-featured-excerpt";
      excerpt.append(
        createTextElement("span", "writing-featured-excerpt__label", "Opening excerpt"),
        createTextElement("p", "", article.excerpt.trim())
      );
    }

    const footer = document.createElement("div");
    footer.className = "writing-featured-card__footer";
    footer.appendChild(createTags(article.tags));

    const action = document.createElement("a");
    action.className = "writing-read-action";
    action.href = articleUrl(article);
    action.append(document.createTextNode("Read article "), createTextElement("span", "", "→"));

    const readingTime = createTextElement("span", "writing-reading-time", article.readingTime);
    const actions = document.createElement("div");
    actions.className = "writing-featured-card__actions";
    actions.append(readingTime, action);
    footer.appendChild(actions);

    card.append(indexLabel, meta, title, rationale);
    if (excerpt) card.appendChild(excerpt);
    card.appendChild(footer);
    return card;
  }

  function createSupportingArticle(article, index) {
    const card = document.createElement("article");
    card.className = "writing-featured-card writing-featured-card--supporting";

    const indexLabel = createTextElement("span", "writing-featured-card__index", String(index + 1).padStart(2, "0"));
    indexLabel.setAttribute("aria-hidden", "true");

    const meta = document.createElement("div");
    meta.className = "writing-card-meta";
    meta.append(createTextElement("span", "", article.category), createDateElement(article.date));

    const title = document.createElement("h3");
    const titleLink = document.createElement("a");
    titleLink.href = articleUrl(article);
    titleLink.textContent = article.title;
    title.appendChild(titleLink);

    const rationale = createTextElement("p", "writing-supporting-rationale", article.subtitle);

    const footer = document.createElement("div");
    footer.className = "writing-supporting-footer";
    footer.appendChild(createTextElement("span", "writing-reading-time", article.readingTime));

    const action = document.createElement("a");
    action.className = "writing-read-action";
    action.href = articleUrl(article);
    action.setAttribute("aria-label", "Read " + article.title);
    action.append(document.createTextNode("Read "), createTextElement("span", "", "→"));
    footer.appendChild(action);

    card.append(indexLabel, meta, title, rationale, footer);
    return card;
  }

  function createArchiveRow(article, index) {
    const row = document.createElement("article");
    row.className = "writing-archive-row";

    const number = createTextElement("span", "writing-archive-row__index", String(index + 1).padStart(2, "0"));
    number.setAttribute("aria-hidden", "true");

    const identity = document.createElement("div");
    identity.className = "writing-archive-row__identity";
    const title = document.createElement("h3");
    const link = document.createElement("a");
    link.href = articleUrl(article);
    link.textContent = article.title;
    title.appendChild(link);
    identity.append(title, createTextElement("p", "", article.summary));

    const why = document.createElement("div");
    why.className = "writing-archive-row__why";
    why.append(
      createTextElement("span", "writing-archive-row__why-label", "About"),
      createTextElement("p", "", article.subtitle)
    );

    const details = document.createElement("div");
    details.className = "writing-archive-row__details";
    details.append(createTextElement("span", "", article.category), createDateElement(article.date), createTextElement("span", "", article.readingTime));

    const arrow = document.createElement("a");
    arrow.className = "writing-archive-row__action";
    arrow.href = articleUrl(article);
    arrow.setAttribute("aria-label", "Read " + article.title);
    arrow.append(
      createTextElement("span", "writing-archive-row__action-label", "Read"),
      createTextElement("span", "", "→")
    );

    row.append(number, identity, why, details, arrow);
    return row;
  }

  function renderWritingError(message, articleView) {
    const status = getElement("writing-status");
    if (!status) return;
    status.className = "writing-status writing-status--error";
    status.replaceChildren();
    status.appendChild(createTextElement("strong", "", articleView ? "Article unavailable" : "Writing unavailable"));
    status.appendChild(createTextElement("span", "", message));

    const links = document.createElement("span");
    links.className = "writing-status__links";
    const archiveLink = document.createElement("a");
    archiveLink.href = "writing.html";
    archiveLink.textContent = "Writing archive";
    const portfolioLink = document.createElement("a");
    portfolioLink.href = "index.html";
    portfolioLink.textContent = "Main portfolio";
    links.append(archiveLink, portfolioLink);
    status.appendChild(links);
  }

  function renderWritingArchive(articles) {
    const status = getElement("writing-status");
    const content = getElement("writing-archive-content");
    const featuredTarget = getElement("writing-featured");
    const listTarget = getElement("writing-archive-list");
    const count = getElement("writing-count");
    const listCount = getElement("writing-list-count");
    const featuredCount = getElement("writing-featured-count");
    if (!status || !content || !featuredTarget || !listTarget || !count || !listCount || !featuredCount) return;

    const noun = articles.length === 1 ? "article" : "articles";
    count.textContent = articles.length + " published " + noun;
    listCount.textContent = String(articles.length).padStart(2, "0") + " / " + noun.toUpperCase();

    if (!articles.length) {
      status.textContent = "No published articles are available yet.";
      return;
    }

    const featured = articles.find(function (article) { return article.featured === true; }) || articles[0];
    const supporting = articles.filter(function (article) { return article !== featured; }).slice(0, 2);
    const selectedCount = 1 + supporting.length;
    const featuredChildren = [createFeaturedArticle(featured, articles.indexOf(featured))];
    supporting.forEach(function (article) {
      featuredChildren.push(createSupportingArticle(article, articles.indexOf(article)));
    });
    featuredTarget.replaceChildren.apply(featuredTarget, featuredChildren);
    featuredTarget.classList.toggle("writing-featured-grid--solo", supporting.length === 0);
    featuredTarget.classList.toggle("writing-featured-grid--one-support", supporting.length === 1);
    featuredTarget.classList.toggle("writing-featured-grid--two-supports", supporting.length === 2);
    featuredCount.textContent = String(selectedCount).padStart(2, "0") + " / SELECTED";
    listTarget.replaceChildren.apply(listTarget, articles.map(createArchiveRow));
    status.hidden = true;
    content.hidden = false;
  }

  function getRequestedSlug() {
    const slug = new URLSearchParams(window.location.search).get("slug");
    return slug && SLUG_PATTERN.test(slug) ? slug : "";
  }

  function appendMetaItem(container, label, value, dateValue) {
    const item = document.createElement("span");
    item.appendChild(createTextElement("b", "", label));
    item.appendChild(dateValue ? createDateElement(dateValue) : document.createTextNode(value));
    container.appendChild(item);
  }

  function renderArticleHeader(article) {
    const title = getElement("article-title");
    const subtitle = getElement("article-subtitle");
    const articleType = getElement("article-type");
    const category = getElement("article-category");
    const meta = getElement("article-meta");
    const tags = getElement("article-tags");
    const railDate = getElement("rail-date");
    const railReadingTime = getElement("rail-reading-time");
    const classification = getElement("article-classification");
    if (!title || !subtitle || !articleType || !category || !meta || !tags || !railDate || !railReadingTime || !classification) return;

    title.textContent = article.title;
    subtitle.textContent = article.subtitle;
    articleType.textContent = article.articleType || "Article";
    category.textContent = article.category;
    meta.replaceChildren();
    const byline = document.createElement("span");
    byline.className = "writing-article-byline";
    const bylineLabel = document.createElement("b");
    bylineLabel.textContent = "By";
    const bylineLink = document.createElement("a");
    bylineLink.href = "index.html#about";
    bylineLink.textContent = "Lawrence Dinh";
    byline.append(bylineLabel, bylineLink);
    meta.appendChild(byline);
    appendMetaItem(meta, "Published", "", article.date);
    if (article.updated && article.updated !== article.date) appendMetaItem(meta, "Updated", "", article.updated);
    appendMetaItem(meta, "Reading time", article.readingTime);

    tags.replaceChildren();
    (Array.isArray(article.tags) ? article.tags : []).forEach(function (tag) {
      const item = document.createElement("li");
      item.textContent = tag;
      tags.appendChild(item);
    });

    railDate.replaceChildren(createDateElement(article.date));
    railReadingTime.textContent = article.readingTime;
    classification.textContent = article.classification || "Writing";
    document.title = article.title + " | Luat “Lawrence” Dinh";
    const canonicalUrl = "https://lawrencedinh.com/writing-article.html?slug=" + encodeURIComponent(article.slug);
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = article.summary;
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = canonicalUrl;
    setMetaContent('meta[property="og:title"]', document.title);
    setMetaContent('meta[property="og:description"]', article.summary);
    setMetaContent('meta[property="og:url"]', canonicalUrl);
    setMetaContent('meta[name="twitter:title"]', document.title);
    setMetaContent('meta[name="twitter:description"]', article.summary);

    let structuredData = getElement("article-structured-data");
    if (!structuredData) {
      structuredData = document.createElement("script");
      structuredData.id = "article-structured-data";
      structuredData.type = "application/ld+json";
      document.head.appendChild(structuredData);
    }
    structuredData.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.summary,
      datePublished: article.date,
      dateModified: article.updated || article.date,
      mainEntityOfPage: canonicalUrl,
      author: {
        "@type": "Person",
        "@id": "https://lawrencedinh.com/#person",
        name: "Luat “Lawrence” Dinh"
      },
      publisher: {
        "@id": "https://lawrencedinh.com/#person"
      }
    });
  }

  function getRelatedArticles(currentArticle, articles, limit) {
    const sameCategory = articles.filter(function (article) {
      return article.slug !== currentArticle.slug && article.category === currentArticle.category;
    });
    const otherArticles = articles.filter(function (article) {
      return article.slug !== currentArticle.slug && article.category !== currentArticle.category;
    });
    return sameCategory.concat(otherArticles).slice(0, limit);
  }

  function renderRelatedArticles(currentArticle, articles) {
    const list = getElement("writing-related-list");
    if (!list) return;
    list.replaceChildren();
    getRelatedArticles(currentArticle, articles, 3).forEach(function (article) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = articleUrl(article);
      link.append(
        createTextElement("span", "writing-related__title", article.title),
        createTextElement("span", "writing-related__meta", article.category + " · " + article.readingTime)
      );
      item.appendChild(link);
      list.appendChild(item);
    });
  }

  function renderArticleNavigation(currentArticle, articles) {
    const newerLink = getElement("writing-newer-article");
    const olderLink = getElement("writing-older-article");
    if (!newerLink || !olderLink) return;
    const currentIndex = articles.findIndex(function (article) { return article.slug === currentArticle.slug; });
    const newer = currentIndex > 0 ? articles[currentIndex - 1] : null;
    const older = currentIndex >= 0 && currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;

    [[newerLink, newer], [olderLink, older]].forEach(function (entry) {
      const link = entry[0];
      const article = entry[1];
      if (!article) {
        link.hidden = true;
        link.removeAttribute("href");
        return;
      }
      link.href = articleUrl(article);
      const title = link.querySelector("strong");
      if (title) title.textContent = article.title;
      link.hidden = false;
    });
  }

  function initializeArticleBackNavigation() {
    const topButton = document.querySelector(".writing-back-link--top");
    const scrollButton = getElement("writing-scroll-back");
    if (!topButton || !scrollButton) return;
    const mediaQuery = window.matchMedia("(max-width: 980px)");

    function hideScrollButton() {
      scrollButton.hidden = true;
    }

    function updateForViewport() {
      if (!mediaQuery.matches) hideScrollButton();
    }

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(function (entries) {
        if (!mediaQuery.matches) {
          hideScrollButton();
          return;
        }
        scrollButton.hidden = entries[0].isIntersecting;
      }, { threshold: 0 });
      observer.observe(topButton);
    }

    mediaQuery.addEventListener("change", updateForViewport);
    updateForViewport();
  }

  async function loadArticleBody(article) {
    if (!ARTICLE_PATH_PATTERN.test(article.contentPath || "")) {
      throw new Error("This article has an invalid content location.");
    }
    const response = await fetch(article.contentPath, { headers: { Accept: "text/html" } });
    if (!response.ok) throw new Error("The article body could not be loaded.");
    return response.text();
  }

  function headingId(text, usedIds) {
    const base = text.toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section";
    let candidate = base;
    let suffix = 2;
    while (usedIds.has(candidate)) candidate = base + "-" + suffix++;
    usedIds.add(candidate);
    return candidate;
  }

  const ARTICLE_IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg"];

  function getArticleImageBase(image) {
    const explicitBase = (image.dataset.imageBase || "").trim();
    if (explicitBase) return explicitBase.replace(/\.(?:png|jpe?g)$/i, "");

    const source = (image.getAttribute("src") || "").trim();
    if (!source) return "";
    const match = source.match(/^([^?#]*)([?#].*)?$/);
    const pathname = match ? match[1] : source;
    return pathname.replace(/\.(?:png|jpe?g)$/i, "");
  }

  function getArticleImageCandidates(image) {
    const base = getArticleImageBase(image);
    return base ? ARTICLE_IMAGE_EXTENSIONS.map(function (extension) { return base + extension; }) : [];
  }

  function prepareArticleImageSources(root) {
    root.querySelectorAll(".writing-article-figure__image").forEach(function (image) {
      const candidates = getArticleImageCandidates(image);
      if (!candidates.length) return;
      image.dataset.imageBase = getArticleImageBase(image);
      image.src = candidates[0];
    });
  }

  function setActiveTocLink(links, id) {
    links.forEach(function (link) {
      if (link.getAttribute("href") === "#" + id) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  function buildTableOfContents(articleBody) {
    const list = getElement("writing-toc-list");
    if (!list || !articleBody) return;
    const nestedArticle = articleBody.querySelector(":scope > .writing-article-body");
    const contentRoot = nestedArticle || articleBody;
    const headings = Array.from(contentRoot.querySelectorAll(":scope > h2"));
    const numberedHeadings = contentRoot.hasAttribute("data-numbered-sections");
    const usedIds = new Set(Array.from(articleBody.querySelectorAll("[id]")).map(function (element) { return element.id; }));
    let tocCounter = 0;
    let headingCounter = 0;
    const sections = headings.map(function (heading) {
      const existingTitle = heading.querySelector(".writing-section-heading__title");
      const originalTitle = (existingTitle ? existingTitle.textContent : heading.textContent).trim();
      if (!heading.id) heading.id = headingId(originalTitle, usedIds);
      const excludeTocNumber = heading.dataset.tocNumber === "false";
      const excludeHeadingNumber = heading.dataset.sectionNumber === "false";
      const tocNumber = excludeTocNumber ? null : String(++tocCounter).padStart(2, "0");
      const headingNumber = numberedHeadings && !excludeHeadingNumber
        ? String(++headingCounter).padStart(2, "0")
        : null;
      if (headingNumber && !existingTitle) {
        const title = document.createElement("span");
        title.className = "writing-section-heading__title";
        while (heading.firstChild) title.appendChild(heading.firstChild);
        const numberElement = document.createElement("span");
        numberElement.className = "writing-section-heading__number";
        numberElement.setAttribute("aria-hidden", "true");
        numberElement.textContent = headingNumber + " /";
        heading.append(numberElement, title);
      }
      return { heading: heading, originalTitle: originalTitle, tocTitle: heading.dataset.tocTitle || originalTitle, id: heading.id, tocNumber: tocNumber, headingNumber: headingNumber };
    });
    list.replaceChildren();
    const links = [];
    function createLink(titleText, section) {
      const link = document.createElement("a");
      const numbered = section && section.tocNumber;
      link.className = "writing-toc__link" + (numbered ? " writing-toc__link--numbered" : " writing-toc__link--utility");
      link.href = section ? "#" + section.heading.id : "#article-overview";
      if (numbered) {
        const number = document.createElement("span");
        number.className = "writing-toc__number";
        number.setAttribute("aria-hidden", "true");
        number.textContent = section.tocNumber;
        link.appendChild(number);
      }
      const label = document.createElement("span");
      label.className = "writing-toc__label";
      const title = document.createElement("span");
      title.className = "writing-toc__title";
      title.textContent = titleText;
      label.appendChild(title);
      link.appendChild(label);
      return link;
    }
    const overviewItem = document.createElement("li");
    const overviewLink = createLink("Overview");
    overviewLink.addEventListener("click", function (event) {
      event.preventDefault();
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
      window.history.pushState(null, "", "#article-overview");
      setActiveTocLink(links, "article-overview");
    });
    overviewItem.appendChild(overviewLink); list.appendChild(overviewItem); links.push(overviewLink);
    sections.forEach(function (section) {
      const item = document.createElement("li");
      const link = createLink(section.tocTitle, section);
      link.addEventListener("click", function (event) {
        event.preventDefault();
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        section.heading.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
        window.history.pushState(null, "", "#" + section.heading.id);
        setActiveTocLink(links, section.heading.id);
      });
      item.appendChild(link); list.appendChild(item); links.push(link);
    });
    setActiveTocLink(links, "article-overview");
    let scrollFrame = 0;
    const headingOffset = 112;
    function updateActiveTocLink() { scrollFrame = 0; let activeId = "article-overview"; sections.forEach(function (section) { if (section.heading.getBoundingClientRect().top <= headingOffset) activeId = section.heading.id; }); setActiveTocLink(links, activeId); }
    function requestTocUpdate() { if (scrollFrame) return; scrollFrame = window.requestAnimationFrame(updateActiveTocLink); }
    window.addEventListener("scroll", requestTocUpdate, { passive: true });
    window.addEventListener("resize", requestTocUpdate);
    updateActiveTocLink();
  }
  function initializeArticleFigures(articleBody) {
    if (articleImageViewerController) articleImageViewerController.abort();
    if (articleImageViewerElement) articleImageViewerElement.remove();

    const controller = new AbortController();
    const signal = controller.signal;
    const viewer = document.createElement("div");
    viewer.className = "article-image-viewer";
    viewer.setAttribute("role", "dialog");
    viewer.setAttribute("aria-modal", "true");
    viewer.setAttribute("aria-label", "Expanded article figure");
    viewer.hidden = true;
    viewer.innerHTML = '<div class="article-image-viewer__backdrop"></div><figure class="article-image-viewer__window"><button class="article-image-viewer__close" type="button" aria-label="Close expanded image">×</button><img class="article-image-viewer__image" alt=""><figcaption class="article-image-viewer__caption"><span class="article-image-viewer__heading"><span class="article-image-viewer__number"></span><span class="article-image-viewer__separator" aria-hidden="true">/</span><span class="article-image-viewer__title"></span></span><span class="article-image-viewer__description"></span></figcaption></figure>';
    document.body.appendChild(viewer);
    articleImageViewerController = controller;
    articleImageViewerElement = viewer;

    const viewerWindow = viewer.querySelector(".article-image-viewer__window");
    const closeButton = viewer.querySelector(".article-image-viewer__close");
    const expandedImage = viewer.querySelector(".article-image-viewer__image");
    const viewerNumber = viewer.querySelector(".article-image-viewer__number");
    const viewerTitle = viewer.querySelector(".article-image-viewer__title");
    const viewerDescription = viewer.querySelector(".article-image-viewer__description");
    let activeImageTrigger = null;

    function closeImageViewer(options) {
      if (!activeImageTrigger) return;
      const restoreFocus = Boolean(options && options.restoreFocus);
      const trigger = activeImageTrigger;
      activeImageTrigger = null;
      viewer.classList.remove("is-open");
      viewer.hidden = true;
      expandedImage.removeAttribute("src");
      if (restoreFocus && trigger.isConnected) trigger.focus({ preventScroll: true });
    }

    function openImageViewer(trigger) {
      const figure = trigger.closest("[data-writing-figure].has-image");
      if (!figure) return;
      const image = trigger.querySelector(".writing-article-figure__image");
      if (!image) return;
      const number = figure.querySelector(".article-figure-caption__number");
      const title = figure.querySelector(".article-figure-caption__title");
      const description = figure.querySelector(".article-figure-caption__text");
      activeImageTrigger = trigger;
      expandedImage.src = image.currentSrc || image.src;
      expandedImage.alt = image.alt;
      viewerNumber.textContent = number ? number.textContent.trim() : "";
      viewerTitle.textContent = title ? title.textContent.trim() : "";
      viewerDescription.textContent = description ? description.textContent.trim() : "";
      viewer.hidden = false;
      window.requestAnimationFrame(function () { viewer.classList.add("is-open"); });
      closeButton.focus({ preventScroll: true });
    }

    function imageTriggerFrom(target) {
      const trigger = target.closest && target.closest(".writing-article-figure__trigger");
      return trigger && articleBody.contains(trigger) ? trigger : null;
    }

    articleBody.addEventListener("click", function (event) {
      const trigger = imageTriggerFrom(event.target);
      if (trigger && !trigger.disabled) openImageViewer(trigger);
    }, { signal });

    closeButton.addEventListener("click", function () {
      closeImageViewer({ restoreFocus: true });
    }, { signal });

    viewer.addEventListener("click", function (event) {
      if (!viewerWindow.contains(event.target)) closeImageViewer({ restoreFocus: false });
    }, { signal });

    document.addEventListener("keydown", function (event) {
      if (!activeImageTrigger) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeImageViewer({ restoreFocus: true });
        return;
      }
      if (event.target === closeButton && (event.key === "Enter" || event.key === " ")) return;
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) {
        closeImageViewer({ restoreFocus: false });
      }
    }, { signal });

    function closeOnScrollIntent() {
      closeImageViewer({ restoreFocus: false });
    }

    window.addEventListener("scroll", closeOnScrollIntent, { passive: true, capture: true, signal });
    window.addEventListener("wheel", closeOnScrollIntent, { passive: true, capture: true, signal });
    window.addEventListener("touchmove", closeOnScrollIntent, { passive: true, capture: true, signal });

    articleBody.querySelectorAll("[data-writing-figure]").forEach(function (figure) {
      const trigger = figure.querySelector(".writing-article-figure__trigger");
      const image = figure.querySelector(".writing-article-figure__image");
      const placeholder = figure.querySelector(".article-media-placeholder");
      const caption = figure.querySelector(".article-figure-caption");
      if (!trigger || !image) return;

      trigger.disabled = true;

      function updateFigureOrientation() {
        const override = (figure.dataset.figureOrientation || "").toLowerCase();
        const isPortrait = override === "portrait"
          || (override !== "landscape" && image.naturalHeight > image.naturalWidth && image.naturalWidth > 0);
        figure.classList.toggle("writing-article-figure--portrait", isPortrait);
      }

      function showLoadedImage() {
        figure.hidden = false;
        figure.classList.add("has-image");
        figure.classList.remove("is-image-missing");
        updateFigureOrientation();
        trigger.hidden = false;
        trigger.disabled = false;
        if (placeholder) placeholder.hidden = true;
        if (caption) caption.hidden = false;
      }

      function showMissingImage() {
        figure.classList.remove("has-image");
        figure.classList.remove("writing-article-figure--portrait");
        figure.classList.add("is-image-missing");
        trigger.hidden = true;
        trigger.disabled = true;
        if (caption) caption.hidden = true;
        if (placeholder) {
          figure.hidden = false;
          placeholder.hidden = false;
        } else {
          figure.hidden = true;
        }
      }

      const candidates = getArticleImageCandidates(image);
      let candidateIndex = 0;
      let finished = false;

      function loadCandidate(index) {
        if (finished) return;
        if (index >= candidates.length) {
          finished = true;
          showMissingImage();
          return;
        }
        candidateIndex = index;
        const candidate = candidates[index];
        if (image.getAttribute("src") !== candidate) image.setAttribute("src", candidate);
      }

      function handleLoad() {
        if (finished) return;
        finished = true;
        image.dataset.resolvedImageSrc = image.currentSrc || image.src;
        showLoadedImage();
      }

      function handleError() {
        if (finished) return;
        loadCandidate(candidateIndex + 1);
      }

      image.addEventListener("load", handleLoad, { signal });
      image.addEventListener("error", handleError, { signal });
      loadCandidate(0);
      if (image.complete) {
        if (image.naturalWidth > 0) handleLoad();
        else handleError();
      }
    });
  }

  function initializeCitationRibbon(articleBody) {
    const GROUP_CITATION_SWITCH_DELAY = 75;
    const citationLinks = Array.from(articleBody.querySelectorAll(".article-citation a, .article-citation-group a"));
    const citationGroups = Array.from(articleBody.querySelectorAll("[data-citation-group]"));
    const citationReferenceCache = new Map();
    if (!citationLinks.length) return;

    articleBody.querySelectorAll(".article-reference").forEach(function (reference) {
      const externalSource = reference.querySelector("a[href^='http']");
      if (!externalSource) return;
      citationReferenceCache.set(reference.id, {
        source: reference.dataset.citationSource || "",
        title: reference.dataset.citationTitle || "",
        secondary: reference.dataset.citationSecondary || "",
        url: externalSource.href
      });
    });

    const popover = document.createElement("div");
    popover.className = "article-citation-popover";
    popover.id = "article-citation-popover";
    popover.setAttribute("role", "tooltip");
    popover.dataset.state = "preview";
    popover.hidden = true;
    popover.innerHTML = '<button class="article-citation-popover__close" type="button" aria-label="Close citation details" tabindex="-1" hidden>×</button><div class="article-citation-popover__body"><div class="article-citation-popover__primary"><span class="article-citation-popover__number"></span> <span class="article-citation-popover__source"></span> <cite class="article-citation-popover__title"></cite></div><div class="article-citation-popover__secondary"></div></div><div class="article-citation-popover__url-tray" aria-hidden="true" hidden><a class="article-citation-popover__url" href="" target="_blank" rel="noopener noreferrer" tabindex="-1"></a></div>';
    document.body.appendChild(popover);

    const closeButton = popover.querySelector(".article-citation-popover__close");
    const number = popover.querySelector(".article-citation-popover__number");
    const source = popover.querySelector(".article-citation-popover__source");
    const title = popover.querySelector(".article-citation-popover__title");
    const secondary = popover.querySelector(".article-citation-popover__secondary");
    const urlTray = popover.querySelector(".article-citation-popover__url-tray");
    const urlLink = popover.querySelector(".article-citation-popover__url");
    let activeLink = null;
    let state = "closed";
    let positionFrame = 0;
    let lockedPosition = null;
    let controlExtensions = { top: 0, bottom: 0 };
    let suppressNextFocusPreview = false;
    let groupHoverTimer = 0;
    let pendingGroupLink = null;

    function citationGroupOf(link) {
      return link && link.closest("[data-citation-group]");
    }

    function cancelGroupHover() {
      if (groupHoverTimer) window.clearTimeout(groupHoverTimer);
      groupHoverTimer = 0;
      pendingGroupLink = null;
    }

    citationLinks.forEach(function (link) {
      link.setAttribute("aria-expanded", "false");
      link.setAttribute("aria-controls", popover.id);
      link.setAttribute("aria-haspopup", "dialog");
    });

    function closePopover(options) {
      const restoreFocus = Boolean(options && options.restoreFocus);
      cancelGroupHover();
      if (positionFrame) {
        window.cancelAnimationFrame(positionFrame);
        positionFrame = 0;
      }
      if (activeLink) {
        activeLink.removeAttribute("aria-describedby");
        activeLink.setAttribute("aria-expanded", "false");
        activeLink.classList.remove("is-active-citation");
      }
      popover.hidden = true;
      popover.dataset.state = "preview";
      popover.setAttribute("role", "tooltip");
      popover.removeAttribute("aria-modal");
      popover.removeAttribute("aria-label");
      closeButton.hidden = true;
      closeButton.tabIndex = -1;
      urlTray.hidden = true;
      urlTray.setAttribute("aria-hidden", "true");
      urlLink.tabIndex = -1;
      const linkToRestore = activeLink;
      activeLink = null;
      state = "closed";
      lockedPosition = null;
      if (restoreFocus && linkToRestore) {
        suppressNextFocusPreview = true;
        linkToRestore.focus();
      }
    }

    function populatePopover(link) {
      const referenceId = link.dataset.referenceId || link.getAttribute("href").replace(/^#/, "");
      const reference = citationReferenceCache.get(referenceId);
      if (!reference) return false;
      if (activeLink && activeLink !== link) {
        activeLink.removeAttribute("aria-describedby");
        activeLink.setAttribute("aria-expanded", "false");
        activeLink.classList.remove("is-active-citation");
      }
      activeLink = link;
      number.textContent = link.textContent;
      source.textContent = reference.source;
      title.textContent = reference.title;
      secondary.textContent = reference.secondary;
      urlLink.href = reference.url;
      urlLink.textContent = reference.url.replace(/^https?:\/\//, "");
      return true;
    }

    function measureControlExtensions() {
      const closeWasHidden = closeButton.hidden;
      const trayWasHidden = urlTray.hidden;
      closeButton.hidden = false;
      urlTray.hidden = false;
      controlExtensions = {
        top: Math.max(closeButton.offsetHeight - 1, 0),
        bottom: Math.max(urlTray.offsetHeight - 1, 0)
      };
      closeButton.hidden = closeWasHidden;
      urlTray.hidden = trayWasHidden;
    }

    function positionPopover() {
      positionFrame = 0;
      if (!activeLink || popover.hidden) return;
      const linkRect = activeLink.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();
      if (!controlExtensions.top && !controlExtensions.bottom) measureControlExtensions();
      const topExtension = controlExtensions.top;
      const bottomExtension = controlExtensions.bottom;
      const left = Math.max(12, Math.min(linkRect.left, window.innerWidth - popoverRect.width - 12));
      const belowTop = linkRect.bottom + 10 + topExtension;
      const belowBottom = belowTop + popoverRect.height + bottomExtension;
      const aboveTop = linkRect.top - 10 - bottomExtension - popoverRect.height;
      let top = belowBottom <= window.innerHeight - 12 ? belowTop : aboveTop;
      top = Math.max(12 + topExtension, Math.min(top, window.innerHeight - 12 - bottomExtension - popoverRect.height));
      popover.style.left = left + "px";
      popover.style.top = top + "px";
      popover.style.visibility = "visible";
      lockedPosition = { left: left, top: top, placement: belowBottom <= window.innerHeight - 12 ? "below" : "above" };
    }

    function requestPosition() {
      if (!positionFrame) positionFrame = window.requestAnimationFrame(positionPopover);
    }

    function showPreview(link) {
      if (activeLink && activeLink !== link) closePopover();
      else if (state === "pinned") return;
      if (!populatePopover(link)) return;
      state = "preview";
      popover.dataset.state = "preview";
      popover.setAttribute("role", "tooltip");
      popover.hidden = false;
      popover.style.visibility = "hidden";
      link.setAttribute("aria-describedby", popover.id);
      lockedPosition = null;
      measureControlExtensions();
      positionPopover();
    }

    function scheduleGroupedPreview(link) {
      cancelGroupHover();
      pendingGroupLink = link;
      groupHoverTimer = window.setTimeout(function () {
        groupHoverTimer = 0;
        pendingGroupLink = null;
        if (state !== "preview" || !activeLink) return;
        const previousGroup = citationGroupOf(activeLink);
        if (previousGroup && previousGroup === citationGroupOf(link) && populatePopover(link)) {
          link.setAttribute("aria-describedby", popover.id);
        }
      }, GROUP_CITATION_SWITCH_DELAY);
    }

    function pinPopover(link) {
      if (state === "pinned" && activeLink === link) {
        closePopover();
        return;
      }
      cancelGroupHover();
      const activeGroup = citationGroupOf(activeLink);
      const nextGroup = citationGroupOf(link);
      if (state === "pinned" && activeLink && activeGroup && activeGroup === nextGroup) {
        if (!populatePopover(link)) return;
        link.setAttribute("aria-expanded", "true");
        link.classList.add("is-active-citation");
        return;
      }
      const canReusePreviewPosition = state === "preview" && activeLink === link && lockedPosition;
      if (!populatePopover(link)) return;
      if (!canReusePreviewPosition) {
        state = "preview";
        popover.hidden = false;
        popover.style.visibility = "hidden";
        popover.dataset.state = "preview";
        lockedPosition = null;
        measureControlExtensions();
        positionPopover();
      }
      state = "pinned";
      popover.hidden = false;
      popover.dataset.state = "preview";
      popover.setAttribute("role", "dialog");
      popover.setAttribute("aria-modal", "false");
      popover.setAttribute("aria-label", "Citation details");
      closeButton.hidden = false;
      closeButton.tabIndex = 0;
      urlTray.hidden = false;
      urlTray.setAttribute("aria-hidden", "false");
      urlLink.tabIndex = 0;
      link.removeAttribute("aria-describedby");
      link.setAttribute("aria-expanded", "true");
      link.classList.add("is-active-citation");
      void popover.offsetWidth;
      popover.dataset.state = "pinned";
      popover.style.left = lockedPosition.left + "px";
      popover.style.top = lockedPosition.top + "px";
      popover.style.visibility = "visible";
    }

    citationLinks.forEach(function (link) {
      link.addEventListener("pointerenter", function (event) {
        if (event.pointerType === "touch") return;
        const activeGroup = citationGroupOf(activeLink);
        const nextGroup = citationGroupOf(link);
        const sameGroup = activeLink && activeGroup && activeGroup === nextGroup;
        if (state === "pinned" && sameGroup) return;
        if (state === "preview" && sameGroup && activeLink !== link) {
          scheduleGroupedPreview(link);
          return;
        }
        cancelGroupHover();
        showPreview(link);
      });
      link.addEventListener("pointerleave", function (event) {
        if (event.pointerType === "touch") return;
        if (pendingGroupLink === link) cancelGroupHover();
        if (!citationGroupOf(link) && state === "preview" && document.activeElement !== link) closePopover();
      });
      link.addEventListener("focus", function () {
        if (suppressNextFocusPreview) {
          suppressNextFocusPreview = false;
          return;
        }
        const activeGroup = citationGroupOf(activeLink);
        const nextGroup = citationGroupOf(link);
        if (state === "pinned" && activeLink && activeLink !== link && activeGroup && activeGroup === nextGroup) return;
        cancelGroupHover();
        showPreview(link);
      });
      link.addEventListener("blur", function () {
        if (!citationGroupOf(link) && state === "preview") closePopover();
      });
      link.addEventListener("click", function (event) {
        event.preventDefault();
        pinPopover(link);
      });
      link.addEventListener("keydown", function (event) {
        if (event.key === " ") {
          event.preventDefault();
          pinPopover(link);
        }
      });
    });

    citationGroups.forEach(function (group) {
      group.addEventListener("pointerleave", function (event) {
        if (event.pointerType === "touch") return;
        cancelGroupHover();
        if (state === "preview" && citationGroupOf(activeLink) === group && !group.contains(document.activeElement)) closePopover();
      });
      group.addEventListener("focusout", function (event) {
        if (state === "preview" && !group.contains(event.relatedTarget)) closePopover();
      });
    });

    closeButton.addEventListener("click", function () { closePopover({ restoreFocus: true }); });
    document.addEventListener("pointerdown", function (event) {
      if (state !== "pinned") return;
      const clickedActiveCitation = activeLink && activeLink.contains(event.target);
      const activeGroup = citationGroupOf(activeLink);
      const clickedActiveGroup = activeGroup && activeGroup.contains(event.target);
      if (popover.contains(event.target) || clickedActiveCitation || clickedActiveGroup) return;
      closePopover();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && state !== "closed") closePopover({ restoreFocus: state === "pinned" });
    });
    window.addEventListener("scroll", function () {
      if (activeLink) closePopover();
    }, { passive: true, capture: true });
    window.addEventListener("resize", requestPosition);
  }

  function markFirstArticleHeading(articleBody) {
    articleBody.querySelectorAll(".writing-article-body__first-heading").forEach(function (heading) {
      heading.classList.remove("writing-article-body__first-heading");
    });

    const firstHeading = articleBody.querySelector("h2, h3");
    if (firstHeading) firstHeading.classList.add("writing-article-body__first-heading");
  }

  function initializeReadingProgress(articleBody) {
    const bar = getElement("writing-progress-bar");
    if (!bar || !articleBody) return;
    let frame = 0;
    let start = 0;
    let distance = 1;

    function measure() {
      start = articleBody.getBoundingClientRect().top + window.scrollY;
      distance = Math.max(articleBody.offsetHeight - window.innerHeight + 120, 1);
      update();
    }

    function update() {
      frame = 0;
      const progress = Math.min(1, Math.max(0, (window.scrollY - start + 92) / distance));
      bar.style.transform = "scaleX(" + progress.toFixed(4) + ")";
    }

    function requestUpdate() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", function () {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(function () { frame = 0; measure(); });
    });
    measure();
  }

  async function loadArticleBySlug(records) {
    const slug = getRequestedSlug();
    if (!slug) {
      renderWritingError("The article address is missing or invalid.", true);
      return;
    }

    const publishedArticles = getPublishedArticles(records);
    const article = publishedArticles.find(function (record) { return record.slug === slug; });
    if (!article) {
      renderWritingError("No published article matches this address.", true);
      return;
    }

    const bodyHtml = await loadArticleBody(article);
    const body = getElement("article-body");
    const reader = getElement("writing-reader");
    const status = getElement("writing-status");
    if (!body || !reader || !status) return;
    renderArticleHeader(article);
    renderRelatedArticles(article, publishedArticles);
    renderArticleNavigation(article, publishedArticles);
    const articleTemplate = document.createElement("template");
    articleTemplate.innerHTML = bodyHtml;
    prepareArticleImageSources(articleTemplate.content);
    body.replaceChildren(articleTemplate.content.cloneNode(true));
    if (!body.querySelector("#article-overview")) {
      const overviewAnchor = document.createElement("span");
      overviewAnchor.id = "article-overview";
      overviewAnchor.className = "writing-article-overview-anchor";
      overviewAnchor.setAttribute("aria-hidden", "true");
      body.prepend(overviewAnchor);
    }
    markFirstArticleHeading(body);
    initializeArticleFigures(body);
    initializeCitationRibbon(body);
    buildTableOfContents(body);
    initializeReadingProgress(body);
    status.hidden = true;
    reader.hidden = false;
    initializeArticleBackNavigation();
    if (window.location.hash) {
      if (window.location.hash === "#article-overview") {
        window.requestAnimationFrame(function () { window.scrollTo({ top: 0, behavior: "auto" }); });
      } else {
        const target = body.querySelector(window.location.hash);
        if (target) window.requestAnimationFrame(function () { target.scrollIntoView({ behavior: "auto", block: "start" }); });
      }
    }
  }

  async function initializeWriting() {
    const view = document.body.dataset.writingView;
    try {
      const records = await loadWritingManifest();
      if (view === "archive") renderWritingArchive(getPublishedArticles(records));
      else if (view === "article") await loadArticleBySlug(records);
    } catch (error) {
      renderWritingError(
        view === "article" ? "This article could not be displayed. Please return to the archive and try again." : "The archive could not be loaded. Please try again later.",
        view === "article"
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeWriting, { once: true });
  } else {
    initializeWriting();
  }
}());
