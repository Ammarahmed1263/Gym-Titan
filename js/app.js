import { dbService } from "./db.js";

let currentUnit = "kg";

async function updateActiveUnit() {
  currentUnit = (await dbService.getSetting("unit")) || "kg";
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .then((reg) => console.log("service worker registered", reg))
      .catch((err) => console.log("worker registration failed", err));
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  const rmWorker = new Worker("js/worker.js");
  const rmForm = document.querySelector("#rm-form");
  const rmResult = document.querySelector("#rm-result");

  await updateActiveUnit();

  let lastResults = null;

  async function renderResults(result) {
    if (!result) return;
    lastResults = result;


    const percentages = [95, 90, 85, 80, 75, 70, 65, 60, 55, 50];
    const percentageRows = percentages
      .map((p) => {
        const pWeight = Math.round((result.average * p) / 100);
        return `
        <div class="percentage-row">
          <span class="label">${p}%</span>
          <span class="weight">${pWeight} ${currentUnit}</span>
        </div>
      `;
      })
      .join("");

    rmResult.innerHTML = `
    <div class="results-container">
      <div class="formula-cards">
        <div class="formula-card">
          <span class="name">EPLEY</span>
          <span class="value">${Math.round(result.epley)}</span>
        </div>
        <div class="formula-card">
          <span class="name">BRZYCKI</span>
          <span class="value">${Math.round(result.brzycki)}</span>
        </div>
        <div class="formula-card">
          <span class="name">LOMBARDI</span>
          <span class="value">${Math.round(result.lombardi)}</span>
        </div>
        <div class="formula-card">
          <span class="name">LANDER</span>
          <span class="value">${Math.round(result.lander)}</span>
        </div>
      </div>

      <div class="percentages-box">
        <div class="percentages-header">
          <h3>Training Percentages</h3>
          <p>Based on average 1RM: ${Math.round(result.average)} <span class="unit-label">${currentUnit}</span></p>
        </div>
        <div class="percentage-list">
          ${percentageRows}
        </div>
      </div>
    </div>
  `;
  }

  function convertResults(results, toUnit) {
    const factor = toUnit === "lbs" ? 2.205 : 1 / 2.205;
    const converted = {};
    for (const key in results) {
      if (typeof results[key] === "number") {
        converted[key] = results[key] * factor;
      } else {
        converted[key] = results[key];
      }
    }
    return converted;
  }


  window.addEventListener("unitChanged", (e) => {
    const oldUnit = currentUnit;
    currentUnit = e.detail.unit;

    if (lastResults && oldUnit !== currentUnit) {
      lastResults = convertResults(lastResults, currentUnit);
      renderResults(lastResults);
    }
  });

  rmForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const weightInput = document.querySelector("#weight-input");
    const repsInput = document.querySelector("#reps-input");

    const weight = parseFloat(weightInput.value);
    const reps = parseInt(repsInput.value);

    if (!weight || !reps) return;

    rmResult.innerHTML = '<div class="loading">Calculating...</div>';
    rmWorker.postMessage({ weight, reps });
  });

  rmWorker.onmessage = function (e) {
    renderResults(e.data);
  };
});
