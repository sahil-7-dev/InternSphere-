// js/internship-details.js
import { requireAuth } from "./guard.js";
requireAuth();

import { db } from "../firebase/firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// ---- helpers ----
const $ = (sel) => document.querySelector(sel);

function safeText(str) {
  return String(str ?? "");
}

function escapeHTML(str) {
  return String(str ?? "").replace(/[&<>"']/g, (ch) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[ch];
  });
}

function setText(sel, text) {
  const el = $(sel);
  if (el) el.textContent = safeText(text);
}

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
  window.location.href = "internshipdetails.html";
} else {
  loadInternship().catch((e) => {
    console.error(e);
    alert(e.message || "Failed to load internship details.");
  });
}

// ---- load internship ----
async function loadInternship() {
  const ref = doc(db, "internships", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    alert("Internship not found.");
    window.location.href = "internshipdetails.html";
    return;
  }

  const d = snap.data();

  const title = d.title || "Internship";
  const company = d.company || "Company";
  const location = d.location || "Remote";
  const type = d.type || "remote";
  const duration = d.durationKey || d.duration || "—";
  const desc = d.desc || d.description || "No description provided.";
  const department = d.department || "Internship";
  const stipend = d.stipend || d.salary || "—";

  const skills = Array.isArray(d.skills)
    ? d.skills
    : typeof d.skills === "string"
      ? d.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  // ---- hero ----
  setText(".hero-title", title);
  setText(".hero-subtitle", desc);
  setText(".breadcrumb .current", title);

  const metaValues = document.querySelectorAll(".hero-meta .meta-value");
  if (metaValues[0]) metaValues[0].textContent = department;
  if (metaValues[1]) metaValues[1].textContent = location;
  if (metaValues[2]) metaValues[2].textContent = stipend;

  // ---- middle section ----
  const miniValues = document.querySelectorAll(".mini-grid .mini-value");
  if (miniValues[0]) miniValues[0].textContent = title;
  if (miniValues[1]) miniValues[1].textContent = `${type} • ${duration}`;

  // ---- optional skills ----
  const acc = $(".info-accordion");
  if (acc) {
    const skillsHTML = skills.length
      ? `
        <h4 class="h4">Skills</h4>
        <ul class="bullets">
          ${skills.map((s) => `<li>${escapeHTML(s)}</li>`).join("")}
        </ul>
      `
      : "";

    acc.innerHTML = skillsHTML;
  }

  const brand = $(".brand");
  if (brand) brand.setAttribute("href", "internshipdetails.html");
}

// ---- tabs ----
document.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof Element)) return;

  const btn = target.closest(".tab");
  if (!btn) return;

  const tabsBar = btn.closest(".tabs");
  if (!tabsBar) return;

  tabsBar.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  btn.classList.add("active");
});
