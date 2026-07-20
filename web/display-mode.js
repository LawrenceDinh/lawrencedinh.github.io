(function () {
  "use strict";

  var PRESENTATION_MODE_TOGGLE_ENABLED = false;
  var storageKey = "portfolio-display-mode";
  var modes = { simple: true, enhanced: true };
  var legacyModes = { standard: "simple", dev: "enhanced" };

  function normalizeMode(mode) {
    if (modes[mode]) return mode;
    if (legacyModes[mode]) return legacyModes[mode];
    return "enhanced";
  }

  function readMode() {
    if (!PRESENTATION_MODE_TOGGLE_ENABLED) return "enhanced";
    try {
      var stored = window.localStorage.getItem(storageKey);
      var normalized = normalizeMode(stored);

      if (stored !== normalized) {
        window.localStorage.setItem(storageKey, normalized);
      }

      return normalized;
    } catch (error) {
      return "enhanced";
    }
  }

  function applyMode(mode) {
    var nextMode = PRESENTATION_MODE_TOGGLE_ENABLED ? normalizeMode(mode) : "enhanced";
    document.documentElement.setAttribute("data-portfolio-mode", nextMode);
    return nextMode;
  }

  function syncControls(mode) {
    document.querySelectorAll("[data-presentation-mode-toggle]").forEach(function (control) {
      control.dataset.currentMode = mode;
    });

    document.querySelectorAll("[data-portfolio-mode-value]").forEach(function (option) {
      var selected = option.dataset.portfolioModeValue === mode;
      option.setAttribute("aria-pressed", String(selected));
      option.setAttribute("aria-label", (selected ? "Selected: " : "Switch to ") + option.textContent.trim() + " presentation");
    });
  }

  function setMode(mode, persist) {
    var appliedMode = applyMode(mode);

    if (persist) {
      try {
        window.localStorage.setItem(storageKey, appliedMode);
      } catch (error) {
        // The presentation preference remains usable when storage is unavailable.
      }
    }

    syncControls(appliedMode);
  }

  document.documentElement.setAttribute("data-presentation-mode-toggle-enabled", String(PRESENTATION_MODE_TOGGLE_ENABLED));

  // Apply the forced or saved presentation before the page body is parsed to avoid a visual flash.
  applyMode(readMode());

  function initializeControls() {
    if (!PRESENTATION_MODE_TOGGLE_ENABLED) {
      document.querySelectorAll("[data-presentation-mode-toggle]").forEach(function (control) {
        control.hidden = true;
        control.setAttribute("aria-hidden", "true");
      });
      return;
    }

    document.querySelectorAll("[data-presentation-mode-toggle]").forEach(function (control) {
      control.hidden = false;
      control.removeAttribute("aria-hidden");
    });

    var mode = applyMode(readMode());
    syncControls(mode);

    document.querySelectorAll("[data-portfolio-mode-value]").forEach(function (option) {
      if (option.dataset.presentationModeBound) return;
      option.dataset.presentationModeBound = "true";
      option.addEventListener("click", function () {
        setMode(option.dataset.portfolioModeValue, true);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeControls, { once: true });
  } else {
    initializeControls();
  }
}());
