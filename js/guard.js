// js/guard.js
import { auth } from "../firebase/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

export function requireAuth(redirectTo = "login.html") {
  onAuthStateChanged(auth, (user) => {
    if (user) return;

    // Use pathname, not full URL (clean)
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `${redirectTo}?next=${next}`;
  });
}