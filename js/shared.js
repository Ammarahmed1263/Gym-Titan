function addBarLogic() {
  let installPrompt = null;
  const installButton = document.querySelector("#install");
  if (installButton) {
    installButton.style.display = "none";
    installButton.addEventListener("click", async () => {
      if (!installPrompt) return;
      const result = await installPrompt.prompt();
      console.log(`Install prompt was: ${result.outcome}`);
      installPrompt = null;
      installButton.style.display = "none";
    });

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      installPrompt = event;
      installButton.style.display = "block";
    });
  }
}

const injectSideBar = () => {
  const isInPages = window.location.pathname.includes("/pages/");
  const rel = isInPages ? "../" : "";

  const navHTML = `      <aside class="sidebar">
        <div class="logo">
          <img src="${rel}images/icons/icon-72x72.png" alt="Gym Titan Logo" />
        </div>
        <nav class="nav-wrapper">
          <ul class="main-nav">
            <li><a href="${rel}index.html">Home</a></li>
            <li><a href="${rel}pages/exercises.html">Exercises</a></li>
            <li><a href="${rel}pages/profile.html">Profile</a></li>
          </ul>
        </nav>
        <button type="button" id="install">Secure App</button>
      </aside>`;

  document.body.insertAdjacentHTML("afterbegin", navHTML);
};

document.addEventListener("DOMContentLoaded", () => {
  injectSideBar();
  addBarLogic();
});
