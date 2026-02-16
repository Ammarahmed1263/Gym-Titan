const reloadBtn = document.querySelector(".reload");

reloadBtn.addEventListener("click", () => {
  window.location.reload();
});

window.addEventListener("online", () => {
  window.location.href = "/index.html";
});
