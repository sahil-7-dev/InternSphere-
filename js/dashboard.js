// dashboard.js

import { requireAuth } from "./guard.js";
import { auth } from "../firebase/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

requireAuth("login.html");

document.addEventListener("DOMContentLoaded", () => {
  // ===== Theme toggle (remember choice) =====
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

  const savedTheme = localStorage.getItem(THEME_KEY);
  applyTheme(savedTheme === "light" ? "light" : "dark");

  themeToggle?.addEventListener("click", () => {
    const isDarkNow = document.body.classList.contains("theme-dark");
    const nextTheme = isDarkNow ? "light" : "dark";
    localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  });

  // ===== Sidebar mobile toggle =====
  const hamburger = document.getElementById("hamburger");
  const mobileSidebar = document.getElementById("sidebar");

  hamburger?.addEventListener("click", (e) => {
    e.stopPropagation();
    mobileSidebar?.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!mobileSidebar) return;

    const target = e.target;
    const insideSidebar =
      target.closest("#sidebar") || target.closest("#hamburger");

    if (!insideSidebar) {
      mobileSidebar.classList.remove("open");
    }
  });

  // ===== Sidebar collapse button =====
  const collapseBtn = document.querySelector(".collapse-btn");
  const sidebarPanel = document.querySelector(".sidebar");

  collapseBtn?.addEventListener("click", () => {
    sidebarPanel?.classList.toggle("collapsed");
  });

  // ===== Task data (dummy) =====
  const tasks = [
    {
      id: 1,
      title: "Submit API assignment",
      meta: "Orbit • Workroom",
      due: "Today",
      tag: "High",
      tagType: "warn",
      done: false,
      bucket: "today",
    },
    {
      id: 2,
      title: "Update resume with REST APIs",
      meta: "AI Analyzer",
      due: "Tomorrow",
      tag: "Medium",
      tagType: "ok",
      done: false,
      bucket: "week",
    },
    {
      id: 3,
      title: "Prepare interview notes",
      meta: "Nova • Interview",
      due: "Thu",
      tag: "Medium",
      tagType: "ok",
      done: false,
      bucket: "week",
    },
    {
      id: 4,
      title: "Upload project screenshots",
      meta: "Portfolio",
      due: "Sat",
      tag: "Low",
      tagType: "",
      done: true,
      bucket: "week",
    },
    {
      id: 5,
      title: "Request feedback from mentor",
      meta: "Feedback",
      due: "Sun",
      tag: "Low",
      tagType: "",
      done: false,
      bucket: "week",
    },
  ];

  const taskList = document.getElementById("taskList");
  const segBtns = document.querySelectorAll(".seg-btn");

  function renderTasks(filter = "all") {
    if (!taskList) return;

    taskList.innerHTML = "";

    const filteredTasks =
      filter === "all" ? tasks : tasks.filter((task) => task.bucket === filter);

    filteredTasks.forEach((task) => {
      const row = document.createElement("div");
      row.className = "task";

      row.innerHTML = `
        <div class="task-left">
          <button class="check ${task.done ? "done" : ""}" data-id="${task.id}" aria-label="Toggle task done">
            ${task.done ? "✓" : ""}
          </button>
          <div class="task-meta">
            <b>${task.title}</b>
            <small>${task.meta}</small>
          </div>
        </div>

        <div class="task-right">
          <span class="due">${task.due}</span>
          <span class="tag ${task.tagType || ""}">${task.tag}</span>
        </div>
      `;

      taskList.appendChild(row);
    });
  }

  taskList?.addEventListener("click", (e) => {
    const btn = e.target.closest(".check");
    if (!btn) return;

    const id = Number(btn.getAttribute("data-id"));
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    task.done = !task.done;

    const activeFilter =
      document.querySelector(".seg-btn.active")?.dataset.filter || "all";

    renderTasks(activeFilter);
  });

  segBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      segBtns.forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
      renderTasks(btn.dataset.filter || "all");
    });
  });

  renderTasks("all");

  // ===== Ctrl/Cmd + K focus search =====
  const searchInput = document.getElementById("searchInput");

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      searchInput?.focus();
    }
  });

  // ===== KPI counter animation =====
  function animateValue(el, start, end, duration) {
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);
      el.textContent = Math.floor(progress * (end - start) + start);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  document.querySelectorAll(".kpi-val").forEach((el) => {
    const finalValue = parseInt(el.textContent.replace(/\D/g, ""), 10) || 0;
    animateValue(el, 0, finalValue, 1200);
  });

  // ===== Reveal on scroll =====
  const reveals = document.querySelectorAll(".reveal");

  if (reveals.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      {
        threshold: 0.15,
      }
    );

    reveals.forEach((el) => observer.observe(el));
  }
});

// ===== Body loaded class =====
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

// ===== Optional auth log only =====
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Logged in as:", user.email);
  }
});