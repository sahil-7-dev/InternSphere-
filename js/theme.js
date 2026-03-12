const toggleBtn = document.getElementById("themeToggle");


function applyTheme(theme){
  if(theme === "dark"){
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
}

// Load saved theme
const savedTheme = localStorage.getItem("theme") || "dark";
applyTheme(savedTheme);

// Toggle theme when button is clicked
if(toggleBtn){
  toggleBtn.addEventListener("click", () => {

    const isDark = document.body.classList.contains("dark");
    const newTheme = isDark ? "light" : "dark";

    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);

  });
}