// script.js
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const navLinksUL = document.getElementById("navLinks");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section[id]");
  const indicator = document.querySelector(".nav-indicator");

  // ===== Theme Toggle =====
  const themeToggle = document.getElementById("themeToggle");
  const THEME_KEY = "internsphere_theme";

  function setToggleUI(mode) {
    if (!themeToggle) return;

    const ico = themeToggle.querySelector(".toggle-ico");
    const label = themeToggle.querySelector(".toggle-label");
    const isDark = mode === "dark";

    themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
    if (ico) ico.textContent = isDark ? "🌙" : "☀️";
    if (label) label.textContent = isDark ? "Dark" : "Light";
  }

  function applyTheme(mode) {
    const isDark = mode === "dark";
    document.body.classList.toggle("theme-dark", isDark);
    document.body.classList.toggle("theme-light", !isDark);
    setToggleUI(mode);
  }

  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved === "light" ? "light" : "dark");

  themeToggle?.addEventListener("click", () => {
    const isDarkNow = document.body.classList.contains("theme-dark");
    const next = isDarkNow ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });

  // ===== Mobile menu =====
  function setMenu(open) {
    if (!navLinksUL) return;
    navLinksUL.classList.toggle("active", open);
    hamburger?.setAttribute("aria-expanded", open ? "true" : "false");
  }

  hamburger?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!navLinksUL) return;
    setMenu(!navLinksUL.classList.contains("active"));
  });

  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;

    const insideNav = target.closest(".nav");
    if (!insideNav) setMenu(false);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  // ===== Indicator =====
  function moveIndicator(link) {
    if (!indicator || !link || !navLinksUL) return;

    const li = link.parentElement;
    if (!li) return;

    const ulRect = navLinksUL.getBoundingClientRect();
    const liRect = li.getBoundingClientRect();

    indicator.style.width = liRect.width + "px";
    indicator.style.left = liRect.left - ulRect.left + "px";
  }

  // ===== Active link =====
  function updateActiveLink() {
    let current = "hero";

    sections.forEach((section) => {
      const top = section.offsetTop - 140;
      if (window.scrollY >= top) current = section.id;
    });

    navLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${current}`;
      link.classList.toggle("active", active);
      if (active) moveIndicator(link);
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("mouseenter", () => moveIndicator(link));
    link.addEventListener("mouseleave", () => {
      const active = document.querySelector(".nav-link.active");
      if (active instanceof HTMLElement) moveIndicator(active);
    });
  });

  window.addEventListener("scroll", updateActiveLink, { passive: true });
  window.addEventListener("load", updateActiveLink);

  setTimeout(updateActiveLink, 50);
  setTimeout(updateActiveLink, 250);
  updateActiveLink();

  // ===== Rotating text =====
  const rotators = document.querySelectorAll(".rotator[data-words]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  rotators.forEach((el) => {
    let words;
    try {
      words = JSON.parse(el.getAttribute("data-words") || "[]");
    } catch {
      words = [el.textContent.trim()];
    }

    if (!Array.isArray(words) || words.length < 2) return;

    const cs = window.getComputedStyle(el);
    const font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.font = font;

    let maxW = 0;
    for (const w of words) {
      maxW = Math.max(maxW, ctx.measureText(w).width);
    }

    el.style.setProperty("--rotator-w", `${Math.ceil(maxW) + 8}px`);

    let idx = 0;
    el.classList.add("is-in");

    const change = () => {
      if (reduceMotion) {
        idx = (idx + 1) % words.length;
        el.textContent = words[idx];
        return;
      }

      el.classList.remove("is-in");
      el.classList.add("is-out");

      setTimeout(() => {
        idx = (idx + 1) % words.length;
        el.textContent = words[idx];
        el.classList.remove("is-out");
        el.classList.add("is-in");
      }, 240);
    };

    setInterval(change, 2000);
  });
});

(() => {
  const el = document.querySelector(".ai-rotate");
  if (!el) return;

  const words = ["AI Mentor", "Smart Workroom", "Resume Analyzer", "Progress Tracker"];
  let i = 0;

  setInterval(() => {
    el.classList.add("is-fade");
    setTimeout(() => {
      i = (i + 1) % words.length;
      el.textContent = words[i];
      el.classList.remove("is-fade");
    }, 180);
  }, 2400);
})();

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".ai-dyn[data-words]").forEach((el) => {
    const raw = el.getAttribute("data-words") || "";
    const items = raw.split("|").map((s) => s.trim()).filter(Boolean);
    if (!items.length) return;

    let i = 0;
    el.textContent = items[i];
    el.style.opacity = "1";

    setInterval(() => {
      i = (i + 1) % items.length;
      el.style.opacity = "0";

      setTimeout(() => {
        el.textContent = items[i];
        el.style.opacity = "1";
      }, 200);
    }, 3200);
  });
});