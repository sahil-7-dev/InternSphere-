// js/internship.js (COPY-PASTE WHOLE FILE)

import { requireAuth } from "./guard.js";
requireAuth("login.html");

import { db } from "../firebase/firebase.js";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
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
  applyTheme(saved === "dark" ? "dark" : "light");

  themeToggle?.addEventListener("click", () => {
    const isDarkNow = document.body.classList.contains("theme-dark");
    const next = isDarkNow ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });

  // Ctrl + K focus search
  const searchInput = document.getElementById("searchInput");
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      searchInput?.focus();
    }
  });

  // ===== UI elements =====
  const cards = document.getElementById("cards");
  const resultCount = document.getElementById("resultCount");

  const keyword = document.getElementById("keyword");
  const locationSel = document.getElementById("location");
  const sortBy = document.getElementById("sortBy");

  const applyBtn = document.getElementById("applyFilters");
  const resetBtn = document.getElementById("resetFilters");
  const clearBtn = document.getElementById("clearFilters");

  // ===== State =====
  let jobs = []; // <-- comes from Firestore (realtime)

  let state = {
    keyword: "",
    location: "",
    type: "",
    duration: "",
    skills: new Set(),
    sort: "latest",
  };

  // ===== Helpers =====
  function safe(str) {
    return String(str ?? "").replace(/[<>&"]/g, (c) => ({
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
    }[c]));
  }

  function durationLabel(d) {
    if (d === "1-2") return "1–2 mo";
    if (d === "3-4") return "3–4 mo";
    if (d === "6+") return "6+ mo";
    return d || "Any";
  }

  function mapDocToJob(id, d) {
    return {
      id,
      company: d.company || "Unknown",
      role: d.title || "Intern",
      location: d.location || "Remote",
      type: (d.type || "remote").toLowerCase(),        // remote/hybrid/onsite
      duration: d.durationKey || d.duration || "3-4",   // you can store durationKey as 1-2/3-4/6+
      match: typeof d.match === "number" ? d.match : 70,
      desc: d.desc || d.description || "No description provided.",
      skills: Array.isArray(d.skills) ? d.skills : ["HTML", "CSS", "JavaScript"],
      status: d.status || "active",
    };
  }

  // ===== Render =====
  function render(list) {
    if (!cards) return;
    cards.innerHTML = "";
    if (resultCount) resultCount.textContent = String(list.length);

 if (list.length === 0) {
  cards.innerHTML = "";
  return;
}

    list.forEach((j) => {
      const el = document.createElement("article");
      el.className = "job";
      el.innerHTML = `
        <div class="job-top">
          <div class="company">
            <div class="logo">${safe(j.company).slice(0, 1).toUpperCase()}</div>
            <div>
              <b>${safe(j.role)}</b>
              <small>${safe(j.company)} • ${safe(j.location)}</small>
            </div>
          </div>

          <div class="match">
            <b>${Number(j.match) || 0}%</b>
            <div class="muted">match</div>
          </div>
        </div>

        <div class="tags">
          <span class="tag ${j.type === "remote" ? "good" : j.type === "hybrid" ? "mid" : ""}">${safe(j.type).toUpperCase()}</span>
          <span class="tag">${safe(durationLabel(j.duration))}</span>
          <span class="tag">Apply in 1 click</span>
        </div>

        <p class="desc">${safe(j.desc)}</p>

        <div class="job-foot">
          <div class="skills">
            ${j.skills.slice(0, 3).map(s => `<span class="skill">${safe(s)}</span>`).join("")}
          </div>

          <div class="actions">
            <button class="icon" type="button" title="Save">☆</button>
            <a class="btn btn-primary" href="internship-detailss.html?id=${encodeURIComponent(j.id)}">View</a>
          </div>
        </div>
      `;
      cards.appendChild(el);
    });
  }

  // ===== Filtering =====
  function filterJobs() {
    let list = [...jobs];

    // quick search box (top search)
    const topSearch = (searchInput?.value || "").trim().toLowerCase();
    if (topSearch) {
      list = list.filter((j) =>
        `${j.role} ${j.company} ${j.location} ${j.desc} ${j.skills.join(" ")}`
          .toLowerCase()
          .includes(topSearch)
      );
    }

    // filters panel keyword
    if (state.keyword) {
      const k = state.keyword.toLowerCase();
      list = list.filter((j) =>
        `${j.role} ${j.company} ${j.desc} ${j.skills.join(" ")}`
          .toLowerCase()
          .includes(k)
      );
    }

    if (state.location) list = list.filter((j) => j.location === state.location);
    if (state.type) list = list.filter((j) => j.type === state.type);
   if (state.duration) {
  list = list.filter((j) => {
    const val = String(j.duration || "").toLowerCase();

    const num = parseInt(val.match(/\d+/)?.[0] || "0", 10);

    if (state.duration === "1-2") return num >= 1 && num <= 2;
    if (state.duration === "3-4") return num >= 3 && num <= 4;
    if (state.duration === "6+") return num >= 6;

    return true;
  });
}

    if (state.skills.size) {
      list = list.filter((j) => {
        const lower = j.skills.map((x) => String(x).toLowerCase());
        return [...state.skills].every((s) => lower.includes(s));
      });
    }

    if (state.sort === "match") list.sort((a, b) => (b.match || 0) - (a.match || 0));
    if (state.sort === "company") list.sort((a, b) => a.company.localeCompare(b.company));

    render(list);
  }

  // Chips (single select groups)
  function setupChipGroup(selector, key, attr) {
    const chips = document.querySelectorAll(selector);
    chips.forEach((c) => {
      c.addEventListener("click", () => {
        chips.forEach((x) => x.classList.remove("active"));
        c.classList.add("active");
        state[key] = c.getAttribute(attr) || "";
      });
    });
  }
  setupChipGroup(".chip[data-type]", "type", "data-type");
  setupChipGroup(".chip[data-duration]", "duration", "data-duration");

  // Skills (multi select)
  document.querySelectorAll(".chip[data-skill]").forEach((c) => {
    c.addEventListener("click", () => {
      const s = c.getAttribute("data-skill");
      if (!s) return;
      c.classList.toggle("active");
      if (state.skills.has(s)) state.skills.delete(s);
      else state.skills.add(s);
    });
  });

  // Apply/reset buttons
  applyBtn?.addEventListener("click", () => {
    state.keyword = keyword?.value.trim() || "";
    state.location = locationSel?.value || "";
    state.sort = sortBy?.value || "latest";
    filterJobs();
  });

  resetBtn?.addEventListener("click", () => {
    state = { keyword: "", location: "", type: "", duration: "", skills: new Set(), sort: "latest" };
    if (keyword) keyword.value = "";
    if (locationSel) locationSel.value = "";
    if (sortBy) sortBy.value = "latest";

    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    document.querySelectorAll('.chip[data-type=""], .chip[data-duration=""]').forEach((c) => c.classList.add("active"));

    filterJobs();
  });

  clearBtn?.addEventListener("click", () => resetBtn?.click());

  // Live search typing
  searchInput?.addEventListener("input", filterJobs);

  // ===== Firestore realtime =====
 const q = query(collection(db, "internships"));

    onSnapshot(
    q,
    (snap) => {
      jobs = snap.docs.map((doc) => mapDocToJob(doc.id, doc.data()));

      // Apply dashboard search automatically when page loads
      if (searchQuery && searchInput) {
        searchInput.value = searchQuery;
      }

      filterJobs();
    },
    (err) => {
      console.error("Firestore error:", err);
     if (cards) cards.innerHTML = `<div class="muted" style="padding:14px;">Error loading internships.</div>`; 
    }
  );

  // Initial placeholder
  render([]);
});

// Premium touch highlight for job cards (mobile-friendly)
document.addEventListener("click", (e) => {
  const card = e.target.closest?.(".job");
  if (!card) return;

  card.classList.add("tap-highlight");
  clearTimeout(card.__tapT);
  card.__tapT = setTimeout(() => card.classList.remove("tap-highlight"), 1800);
});

