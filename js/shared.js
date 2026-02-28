import { dbService } from "./db.js";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .then((reg) => console.log("service worker registered", reg))
      .catch((err) => console.log("worker registration failed", err));
  });
}

const BASE_PATH = window.location.pathname.includes("/Gym-Titan")
  ? "/Gym-Titan"
  : "";

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

      let url = link.getAttribute("href");

      if (!url.startsWith("/")) {
        url = "/" + url;
      }

      navigateTo(BASE_PATH + url);
    }
  });

  window.addEventListener("popstate", () => {
    navigateTo(window.location.pathname, false);
  });
}

async function navigateTo(url, addHistory = true) {
  const appContainer = document.querySelector("#app");

  try {
    let fetchUrl = url.startsWith(BASE_PATH) ? url : BASE_PATH + url;

    if (BASE_PATH && fetchUrl.startsWith(BASE_PATH + BASE_PATH)) {
      fetchUrl = fetchUrl.replace(BASE_PATH + BASE_PATH, BASE_PATH);
    }

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

    await initPageModule(fetchUrl);
  } catch (error) {
    console.log("Navigation failed: ", error);
  }
}

async function initPageModule(url) {
  const routeMap = {
    profile: "./profile.js",
    exercises: "./exercises.js",
  };

  let modulePath = "./app.js"; // default = home page
  for (const [key, path] of Object.entries(routeMap)) {
    if (url.includes(key)) {
      modulePath = path;
      break;
    }
  }

  try {
    const module = await import(modulePath);
    if (module.init) {
      await module.init();
    }
  } catch (err) {
    console.log("Module init failed: ", err);
  }
}

function updateActiveLink(url) {
  const links = document.querySelectorAll("[data-nav-link]");
  const currentPath = url.split("?")[0];

  links.forEach((link) => {
    let linkPath = link.getAttribute("href");
    if (!linkPath.startsWith("/")) linkPath = "/" + linkPath;

    const fullLinkPath = BASE_PATH + linkPath;

    const isActive =
      currentPath === fullLinkPath ||
      (currentPath === BASE_PATH + "/" && linkPath === "/index.html") ||
      (currentPath === BASE_PATH + "/index.html" && linkPath === "/");

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
