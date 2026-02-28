import { dbService } from "./db.js";

document.addEventListener("DOMContentLoaded", async () => {
  const weightForm = document.getElementById("weight-form");
  const weightInput = document.getElementById("weight-input");
  const dateInput = document.getElementById("date-input");
  const historyList = document.querySelector(".history-list");
  const heightInput = document.getElementById("height-input");
  const bmiValue = document.getElementById("bmi-value");
  const ratioValue = document.getElementById("ratio-value");

  const savedHeight = await dbService.getHeight();
  if (savedHeight) {
    heightInput.value = savedHeight;
  }

  async function updateStats() {
    const heightCm = parseFloat(heightInput.value);
    const latest = await dbService.getLatestWeight();

    if (!heightCm || !latest) {
      bmiValue.textContent = "--";
      ratioValue.textContent = "--";
      return;
    }

    const heightM = heightCm / 100;
    const bmi = (latest.weight / (heightM * heightM)).toFixed(1);
    const ratio = (latest.weight / heightCm).toFixed(2);

    bmiValue.textContent = bmi;
    ratioValue.textContent = ratio;

    await dbService.saveBMI(parseFloat(bmi), parseFloat(ratio));
  }

  let heightTimer;
  heightInput.addEventListener("input", () => {
    clearTimeout(heightTimer);
    heightTimer = setTimeout(async () => {
      const val = parseFloat(heightInput.value);
      if (val && val >= 100 && val <= 250) {
        await dbService.setHeight(val);
        await updateStats();
      }
    }, 500);
  });

  weightForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const weight = weightInput.value;
    const date = dateInput.value || new Date().toISOString().split("T")[0];
    await dbService.addWeight(weight, date);
    weightInput.value = "";
    loadHistory();
    await updateStats();
  });

  historyList.addEventListener("click", async (e) => {
    const deleteBtn = e.target.closest(".delete-entry-btn");
    if (!deleteBtn) return;

    const id = Number(deleteBtn.dataset.id);
    if (!id) return;

    await dbService.deleteWeight(id);
    loadHistory();
    await updateStats();
  });

  async function loadHistory() {
    const weights = await dbService.getWeights();
    historyList.innerHTML = "";

    if (weights.length === 0) {
      historyList.innerHTML =
        '<p class="empty-text">No weight entries yet. Start tracking!</p>';
      return;
    }

    weights.sort((a, b) => new Date(b.date) - new Date(a.date));

    weights.forEach((entry, index) => {
      const prevEntry = weights[index + 1];
      const change = prevEntry
        ? (entry.weight - prevEntry.weight).toFixed(1)
        : null;
      const changeSign = change > 0 ? "+" : "";
      const changeColor =
        change > 0 ? "#247c22" : change < 0 ? "#d32f2f" : "#9ca3af";

      const formattedDate = new Date(entry.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const article = document.createElement("article");
      article.classList.add("weight-record");
      article.innerHTML = `
        <div class="record-info">
          <div class="record-weight">
            <p>${entry.weight}</p>
            <span>kg</span>
          </div>
          <p class="record-date">${formattedDate}</p>
        </div>
        <div class="record-actions">
          ${change !== null ? `<span class="record-change" style="color: ${changeColor}">${changeSign}${change} kg</span>` : ""}
          <button type="button" class="delete-entry-btn" data-id="${entry.id}">
            <svg
              class="delete-entry-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.17065 4C9.58249 2.83481 10.6937 2 11.9999 2C13.3062 2 14.4174 2.83481 14.8292 4"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              ></path>
              <path
                d="M20.5 6H3.49988"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              ></path>
              <path
                d="M18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5M18.8334 8.5L18.6334 11.5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              ></path>
              <path
                d="M9.5 11L10 16"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              ></path>
              <path
                d="M14.5 11L14 16"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              ></path>
            </svg>
          </button>
        </div>
      `;
      historyList.appendChild(article);
    });
  }

  loadHistory();
  await updateStats();
});
