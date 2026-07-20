(function () {
  "use strict";

  const PRODUCTION_HOSTNAMES = new Set([
    "lawrencedinh.com",
    "www.lawrencedinh.com",
    "lawrencedinh.github.io"
  ]);
  const CLOUDFLARE_ANALYTICS_TOKEN = "6c67d7d2b3ef4d8aab4e048f68ed6679";
  const BEACON_ID = "cloudflare-web-analytics";
  const BEACON_SOURCE = "https://static.cloudflareinsights.com/beacon.min.js";

  if (!PRODUCTION_HOSTNAMES.has(window.location.hostname)) return;

  function initializeCloudflareAnalytics() {
    if (document.getElementById(BEACON_ID)) return;
    if (document.querySelector('script[src^="https://static.cloudflareinsights.com/beacon"]')) return;

    const beacon = document.createElement("script");
    beacon.id = BEACON_ID;
    beacon.type = "module";
    beacon.src = BEACON_SOURCE;
    beacon.dataset.cfBeacon = JSON.stringify({ token: CLOUDFLARE_ANALYTICS_TOKEN });
    document.body.appendChild(beacon);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeCloudflareAnalytics, { once: true });
  } else {
    initializeCloudflareAnalytics();
  }
}());
