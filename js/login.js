// js/login.js (COPY-PASTE WHOLE FILE)
import { setRemember, signupEmail, loginEmail, resetPassword, getUserRole } from "./auth.js";

function redirectAfterLogin(fallback = "dashboard.html") {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");
  if (next) {
    window.location.href = decodeURIComponent(next);
  } else {
    window.location.href = fallback;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // ========= Rotating headline =========
  const wordEl = document.getElementById("rotatingWord");
  const rotator = wordEl?.parentElement;

  const words = [
    { text: "find internships", c1: "#22d3ee", c2: "#7c3aed" },
    { text: "match skills", c1: "#ec4899", c2: "#22d3ee" },
    { text: "join workrooms", c1: "#7c3aed", c2: "#ec4899" },
    { text: "get AI guidance", c1: "#a3ff78", c2: "#22d3ee" },
    { text: "InternSphere", c1: "#2a8af1", c2: "#f90505" },
  ];

  let wi = 0;

  function setWord(item) {
    if (!wordEl || !rotator) return;

    try {
      wordEl.animate(
        [
          { opacity: 0, transform: "translateY(10px)", filter: "blur(8px)" },
          { opacity: 1, transform: "translateY(0px)", filter: "blur(0px)" },
        ],
        { duration: 320, easing: "cubic-bezier(.2,.9,.2,1)" }
      );
    } catch (_) {}

    wordEl.textContent = item.text;
    rotator.style.setProperty("--wcol", item.c1);
    rotator.style.setProperty("--wcol2", item.c2);
  }

  setWord(words[wi]);
  setInterval(() => {
    wi = (wi + 1) % words.length;
    setWord(words[wi]);
  }, 2000);

  // ========= DOM refs =========
  const form = document.getElementById("authForm");
  const emailEl = document.getElementById("email");
  const passEl = document.getElementById("password");
  const rememberEl = document.getElementById("remember");

  const companyNameField = document.getElementById("companyNameField");
  const companyNameEl = document.getElementById("companyName");

  const submitBtn = document.getElementById("submitBtn");
  const switchBtn = document.getElementById("switchBtn");
  const forgotBtn = document.getElementById("forgotBtn");
  const googleBtn = document.getElementById("googleBtn"); // we'll disable it safely

  const panelTitle = document.getElementById("panelTitle");
  const panelDesc = document.getElementById("panelDesc");

  const roleTabs = document.querySelectorAll(".role-tab");
  const modeBtns = document.querySelectorAll(".mode-btn");

  // ========= state =========
  let role = "student"; // student | company | admin
  let mode = "login";   // login | signup

  function render() {
    const roleLabel = role === "student" ? "Student" : role === "company" ? "Company" : "Admin";
    const modeLabel = mode === "login" ? "Login" : "Sign up";

    if (panelTitle) panelTitle.textContent = `${modeLabel} • ${roleLabel}`;

    if (panelDesc) {
      if (role === "admin") panelDesc.textContent = "Admin panel access.";
      else if (role === "company") panelDesc.textContent = "Manage internships and applicants.";
      else panelDesc.textContent = "Access your internship dashboard.";
    }

    const showCompanyName = role === "company" && mode === "signup";
    if (companyNameField) companyNameField.classList.toggle("is-hidden", !showCompanyName);
    if (companyNameEl) companyNameEl.required = showCompanyName;

    if (submitBtn) submitBtn.textContent = mode === "login" ? "Login" : "Create account";
    if (switchBtn) switchBtn.textContent = mode === "login" ? "Create an account" : "I already have an account";
    if (forgotBtn) forgotBtn.style.display = mode === "login" ? "inline-block" : "none";

    roleTabs.forEach((btn) => {
      const active = btn.dataset.role === role;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });

    modeBtns.forEach((btn) => {
      const active = btn.dataset.mode === mode;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function redirectByRole(finalRole) {
    // You currently have one dashboard.html, keep it simple.
    // Later you can redirect to separate dashboards.
    redirectAfterLogin("dashboard.html");
  }

  // ========= events: role tabs =========
  roleTabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      role = btn.dataset.role || "student";
      render();
    });
  });

  // ========= events: mode buttons =========
  modeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      mode = btn.dataset.mode || "login";
      render();
    });
  });

  // Toggle mode
  if (switchBtn) {
    switchBtn.addEventListener("click", () => {
      mode = mode === "login" ? "signup" : "login";
      render();
    });
  }

  // Forgot password
  if (forgotBtn) {
    forgotBtn.addEventListener("click", async () => {
      const email = emailEl?.value?.trim();
      if (!email) return alert("Enter your email first.");

      try {
        await resetPassword(email);
        alert("Password reset email sent.");
      } catch (e) {
        alert(e?.message || "Password reset failed.");
      }
    });
  }

  // Disable Google button safely (so it won't break your flow)
  if (googleBtn) {
    googleBtn.addEventListener("click", () => {
      alert("Google login is disabled for now. We'll enable it after Email/Password works.");
    });
  }

  // ========= form submit: REAL Firebase =========
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = emailEl?.value?.trim();
      const password = passEl?.value;
      const companyName = companyNameEl?.value?.trim() || "";

      if (!email || !password) return alert("Please enter email and password.");

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Please wait...";
        }

        await setRemember(Boolean(rememberEl?.checked));

        if (mode === "signup") {
          const nameToSave = role === "company" ? companyName : "";
          await signupEmail({ email, password, role, name: nameToSave });
          redirectByRole(role);
          return;
        }

        const user = await loginEmail({ email, password });
        const savedRole = await getUserRole(user.uid);
        redirectByRole(savedRole || role);
      } catch (e) {
        alert(e?.message || "Auth failed.");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = mode === "login" ? "Login" : "Create account";
        }
      }
    });
  }

  render();
});