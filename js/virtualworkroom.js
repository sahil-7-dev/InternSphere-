// virtual-workroom.js

document.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.querySelector(".submit-btn");
  const chatBtn = document.querySelector(".chat-input button");
  const chatInput = document.querySelector(".chat-input input");

  submitBtn?.addEventListener("click", () => {
    alert("Task Submitted!");
  });

  chatBtn?.addEventListener("click", () => {
    if (!chatInput) return;

    const message = chatInput.value.trim();
    if (message !== "") {
      alert("Message sent: " + message);
      chatInput.value = "";
    }
  });
});