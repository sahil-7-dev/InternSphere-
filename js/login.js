import { setRemember, signupEmail, loginEmail, resetPassword, getUserRole, loginWithGoogle } from "./auth.js";

function redirectAfterLogin(fallback = "dashboard.html") {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");

  if (next) {
    window.location.href = decodeURIComponent(next);
    return;
  }

  window.location.href = fallback;
}

document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // Rotating headline
  // =========================
  const wordEl = document.getElementById("rotatingWord");
  const rotator = wordEl?.parentElement;

  const words = [
    { text: "find internships", c1: "#22d3ee", c2: "#7c3aed" },
    { text: "match skills", c1: "#ec4899", c2: "#22d3ee" },
    { text: "join workrooms", c1: "#7c3aed", c2: "#ec4899" },
    { text: "get AI guidance", c1: "#a3ff78", c2: "#22d3ee" },
    { text: "build your future", c1: "#60a5fa", c2: "#ec4899" }
  ];

  let wordIndex = 0;
  let wordInterval = null;

  function setWord(item) {
    if (!wordEl || !rotator) return;

    wordEl.textContent = item.text;
    rotator.style.setProperty("--wcol", item.c1);
    rotator.style.setProperty("--wcol2", item.c2);

    try {
      wordEl.animate(
        [
          { opacity: 0, transform: "translateY(10px)", filter: "blur(6px)" },
          { opacity: 1, transform: "translateY(0)", filter: "blur(0)" }
        ],
        {
          duration: 320,
          easing: "cubic-bezier(.2,.9,.2,1)"
        }
      );
    } catch (_) {
      // Ignore animation support errors
    }
  }

  function startRotation() {
    if (!wordEl) return;
    setWord(words[wordIndex]);

    wordInterval = setInterval(() => {
      wordIndex = (wordIndex + 1) % words.length;
      setWord(words[wordIndex]);
    }, 2200);
  }

  startRotation();

  // =========================
  // DOM refs
  // =========================
  const form = document.getElementById("authForm");
  const emailEl = document.getElementById("email");
  const passEl = document.getElementById("password");
  const rememberEl = document.getElementById("remember");

  const companyNameField = document.getElementById("companyNameField");
  const companyNameEl = document.getElementById("companyName");

  const submitBtn = document.getElementById("submitBtn");
  const switchBtn = document.getElementById("switchBtn");
  const forgotBtn = document.getElementById("forgotBtn");
  const googleBtn = document.getElementById("googleBtn");

  const panelTitle = document.getElementById("panelTitle");
  const panelDesc = document.getElementById("panelDesc");

  const roleTabs = document.querySelectorAll(".role-tab");
  const modeBtns = document.querySelectorAll(".mode-btn");

  // =========================
  // State
  // =========================
  let role = "student";
  let mode = "login";

  function render() {
    const roleLabel =
      role === "student" ? "Student" :
        role === "company" ? "Company" :
          "Admin";

    const modeLabel = mode === "login" ? "Login" : "Sign up";

    if (panelTitle) {
      panelTitle.textContent = `${modeLabel} • ${roleLabel}`;
    }

    if (panelDesc) {
      if (role === "company") {
        panelDesc.textContent = mode === "login"
          ? "Access your company dashboard and manage internships."
          : "Create your company account to post and manage internships.";
      } else {
        panelDesc.textContent = mode === "login"
          ? "Access your internship dashboard."
          : "Create your student account and get started.";
      }
    }

    const showCompanyName = role === "company" && mode === "signup";

    if (companyNameField) {
      companyNameField.classList.toggle("is-hidden", !showCompanyName);
    }

    if (companyNameEl) {
      companyNameEl.required = showCompanyName;
    }

    if (submitBtn) {
      submitBtn.textContent = mode === "login" ? "Login" : "Create account";
    }

    if (switchBtn) {
      switchBtn.textContent =
        mode === "login" ? "Create an account" : "I already have an account";
    }

    if (forgotBtn) {
      forgotBtn.style.display = mode === "login" ? "inline-block" : "none";
    }

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

  function setLoading(isLoading) {
    if (!submitBtn) return;

    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading
      ? "Please wait..."
      : mode === "login"
        ? "Login"
        : "Create account";
  }

  function redirectByRole(finalRole) {
    // Keep simple for now
    redirectAfterLogin("dashboard.html");
  }

  // =========================
  // Events
  // =========================
  roleTabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      role = btn.dataset.role || "student";
      render();
    });
  });

  modeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      mode = btn.dataset.mode || "login";
      render();
    });
  });

  if (switchBtn) {
    switchBtn.addEventListener("click", () => {
      mode = mode === "login" ? "signup" : "login";
      render();
    });
  }

  if (forgotBtn) {
    forgotBtn.addEventListener("click", async () => {
      const email = emailEl?.value?.trim();

      if (!email) {
        alert("Enter your email first.");
        return;
      }

      try {
        await resetPassword(email);
        alert("Password reset email sent.");
      } catch (error) {
        alert(error?.message || "Password reset failed.");
      }
    });
  }

  if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
      try {
        await setRemember(Boolean(rememberEl?.checked));

        const user = await loginWithGoogle(role);
        const savedRole = await getUserRole(user.uid);

        redirectByRole(savedRole || role);
      } catch (e) {
        console.error("Google login error:", e);
        alert(`${e.code || "error"}: ${e.message || "Google login failed."}`);
      }
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = emailEl?.value?.trim();
      const password = passEl?.value;
      const companyName = companyNameEl?.value?.trim() || "";

      if (!email || !password) {
        alert("Please enter email and password.");
        return;
      }

      if (role === "company" && mode === "signup" && !companyName) {
        alert("Please enter company name.");
        return;
      }

      try {
        setLoading(true);
        await setRemember(Boolean(rememberEl?.checked));

        if (mode === "signup") {
          const nameToSave = role === "company" ? companyName : "";
          await signupEmail({
            email,
            password,
            role,
            name: nameToSave
          });

          redirectByRole(role);
          return;
        }

        const user = await loginEmail({ email, password });
        const savedRole = await getUserRole(user.uid);
        redirectByRole(savedRole || role);
      } catch (error) {
        alert(error?.message || "Authentication failed.");
      } finally {
        setLoading(false);
      }
    });
  }

  render();
});
