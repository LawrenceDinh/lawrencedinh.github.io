(function () {
  "use strict";

  const MANIFEST_PATH = "writing-data.json";
  const ARTICLE_PATH_PATTERN = /^writing\/articles\/[a-z0-9]+(?:-[a-z0-9]+)*\.html$/;
  const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
    document.title = article.title + " | Lawrence Dinh";
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = article.summary;
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

  function setActiveTocLink(links, id) {
    links.forEach(function (link) {
      if (link.getAttribute("href") === "#" + id) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  function buildTableOfContents(articleBody) {
    const list = getElement("writing-toc-list");
    if (!list || !articleBody) return;
    const headings = Array.from(articleBody.querySelectorAll("h2"));
    const usedIds = new Set(Array.from(articleBody.querySelectorAll("[id]")).map(function (element) { return element.id; }));
    list.replaceChildren();

    const links = headings.map(function (heading) {
      if (!heading.id) heading.id = headingId(heading.textContent, usedIds);
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = "#" + heading.id;
      link.textContent = heading.textContent;
      link.addEventListener("click", function (event) {
        event.preventDefault();
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        heading.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
        window.history.pushState(null, "", "#" + heading.id);
        setActiveTocLink(links, heading.id);
      });
      item.appendChild(link);
      list.appendChild(item);
      return link;
    });

    if (!links.length) return;
    setActiveTocLink(links, headings[0].id);

    if (!("IntersectionObserver" in window)) return;
    const visible = new Map();
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { visible.set(entry.target.id, entry.isIntersecting); });
      const current = headings.find(function (heading) { return visible.get(heading.id); });
      if (current) setActiveTocLink(links, current.id);
    }, { rootMargin: "-96px 0px -62% 0px", threshold: [0, 1] });
    headings.forEach(function (heading) { observer.observe(heading); });
  }

  function initializeOptionalFigures(articleBody) {
    articleBody.querySelectorAll(".writing-article-figure--optional").forEach(function (figure) {
      const image = figure.querySelector("img");
      if (!image) return;

      const reveal = function () { figure.hidden = false; };
      const hide = function () { figure.hidden = true; };
      const probe = new Image();
      probe.addEventListener("load", reveal, { once: true });
      probe.addEventListener("error", hide, { once: true });
      probe.src = image.src;
    });
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

    const article = getPublishedArticles(records).find(function (record) { return record.slug === slug; });
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
    const articleTemplate = document.createElement("template");
    articleTemplate.innerHTML = bodyHtml;
    body.replaceChildren(articleTemplate.content.cloneNode(true));
    markFirstArticleHeading(body);
    initializeOptionalFigures(body);
    buildTableOfContents(body);
    initializeReadingProgress(body);
    status.hidden = true;
    reader.hidden = false;
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
