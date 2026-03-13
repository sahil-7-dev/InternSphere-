const toggleBtn = document.getElementById("themeToggle");

function applyTheme(theme) {
  const isDark = theme === "dark";

  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.classList.toggle("light", !isDark);

  document.body.classList.toggle("dark", isDark);
  document.body.classList.toggle("light", !isDark);

  localStorage.setItem("theme", isDark ? "dark" : "light");
  localStorage.setItem("internsphere_theme", isDark ? "dark" : "light");

  if (toggleBtn) {
    toggleBtn.textContent = isDark ? "🌙" : "☀️";
  }
}

const savedTheme =
  localStorage.getItem("theme") ||
  localStorage.getItem("internsphere_theme") ||
  "dark";

applyTheme(savedTheme);

toggleBtn?.addEventListener("click", () => {
  const isDark =
    document.documentElement.classList.contains("dark") ||
    document.body.classList.contains("dark");

  applyTheme(isDark ? "light" : "dark");
});
