import { dbService } from "./db.js";

function addInstallLogic() {
  let installPrompt = null;
  const installButton = document.querySelector("#install");

  if (!installButton) return;

  installButton.addEventListener("click", async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();

    installPrompt = null;
    installButton.style.display = "none";
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    installButton.style.display = "flex";
  });
}

function initRouter() {
  document.body.addEventListener("click", (event) => {
    const link = event.target.closest("[data-nav-link]");

    if (link) {
      event.preventDefault();

      const url = link.getAttribute("href");
      navigateTo(url);
    }
  });

  window.addEventListener("popstate", () => {
    navigateTo(window.location.pathname);
  });
}

async function navigateTo(url, addHistory = true) {
  const appContainer = document.querySelector("#app");

  try {
    const fetchUrl = url.startsWith("/") ? url : "/" + url;
    const response = await fetch(fetchUrl);
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    let newContent;
    const targetApp = doc.querySelector("#app");
    if (targetApp) {
      newContent = targetApp.innerHTML;
    } else {
      newContent = doc.querySelector("body").innerHTML;
    }

    appContainer.innerHTML = newContent;

    if (addHistory) {
      history.pushState(null, null, fetchUrl);
    }

    updateActiveLink(fetchUrl);

    await updateUnitUI();
    initDefaultDates();
  } catch (error) {
    console.log("Navigation failed: ", error);
  }
}

function updateActiveLink(url) {
  const links = document.querySelectorAll("[data-nav-link]");
  const currentPath = url.split("?")[0];

  links.forEach((link) => {
    const linkPath = link.getAttribute("href");

    const isActive =
      currentPath === linkPath ||
      (currentPath === "/" && linkPath === "/index.html") ||
      (currentPath === "/index.html" && linkPath === "/");

    link.classList.toggle("active", isActive);
  });
}

async function updateUnitUI() {
  const unit = (await dbService.getSetting("unit")) || "kg";
  const buttons = document.querySelectorAll(".toggle-buttons button");

  buttons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.unit === unit);
  });

  const weightInputs = document.querySelectorAll('[data-input-type="weight"]');
  weightInputs.forEach((input) => {
    input.placeholder = `Weight (${unit})`;
  });

  window.dispatchEvent(new CustomEvent("unitChanged", { detail: { unit } }));
}

async function initUnitToggle() {
  const buttons = document.querySelectorAll(".toggle-buttons button");

  buttons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const unit = btn.dataset.unit;
      await dbService.setSetting("unit", unit);
      await updateUnitUI();
    });
  });

  await updateUnitUI();
}

function initDefaultDates() {
  const dateInputs = document.querySelectorAll("input[type='date']");
  const today = new Date().toISOString().split("T")[0];

  dateInputs.forEach((input) => {
    if (!input.value) {
      input.value = today;
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  initRouter();
  addInstallLogic();
  updateActiveLink(window.location.pathname);
  await initUnitToggle();
  initDefaultDates();
});
