import { dbService } from "./db.js";

const KG_TO_LBS = 2.205;
const LBS_TO_KG = 1 / KG_TO_LBS;

let unitListener = null;

export async function init() {
  const exerciseForm = document.getElementById("exercise-form");
  const exerciseLog = document.getElementById("exercise-log");
  const emptyText = document.querySelector(".empty-text");

  if (!exerciseForm || !exerciseLog) return;

  let currentUnit = (await dbService.getSetting("unit")) || "kg";

  function toDisplayWeight(kg) {
    return currentUnit === "lbs"
      ? (kg * KG_TO_LBS).toFixed(1)
      : parseFloat(kg).toFixed(1);
  }

  function toKg(value) {
    return currentUnit === "lbs"
      ? parseFloat(value) * LBS_TO_KG
      : parseFloat(value);
  }

  exerciseForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("exercise-name").value;
    const sets = document.getElementById("exercise-sets").value;
    const reps = document.getElementById("exercise-reps").value;
    const rawWeight = parseFloat(
      document.getElementById("exercise-weight").value,
    );
    const date =
      document.getElementById("exercise-date").value ||
      new Date().toISOString().split("T")[0];

    const weightInKg = toKg(rawWeight);
    await dbService.addExercise(name, sets, reps, weightInKg, date);
    exerciseForm.reset();
    renderExercises();
  });

  if (unitListener) window.removeEventListener("unitChanged", unitListener);
  unitListener = (e) => {
    currentUnit = e.detail.unit;
    renderExercises();
  };
  window.addEventListener("unitChanged", unitListener);

  async function renderExercises() {
    const exercises = await dbService.getExercises();

    if (exercises.length === 0) {
      emptyText.style.display = "block";
      exerciseLog.innerHTML = `<p class="empty-text">
          No exercises logged yet. Time to lift some weights!
        </p>`;
      return;
    }

    emptyText.style.display = "none";

    exercises.sort((a, b) => {
      const dateDiff = new Date(b.date) - new Date(a.date);
      return dateDiff !== 0 ? dateDiff : b.timestamp - a.timestamp;
    });

    const grouped = exercises.reduce((acc, exercise) => {
      const dateKey = new Date(exercise.date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(exercise);
      return acc;
    }, {});

    exerciseLog.innerHTML = Object.entries(grouped)
      .map(
        ([date, items]) => `
        <div class="exercise-date-group">
          <h3 class="exercise-date-header">
            <svg class="date-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14V12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12V14C22 17.7712 22 19.6569 20.8284 20.8284C20.1752 21.4816 19.3001 21.7706 18 21.8985" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path><path d="M7 4V2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path><path d="M17 4V2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path><path d="M21.5 9H16.625H10.75M2 9H5.875" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path><path d="M18 17C18 17.5523 17.5523 18 17 18C16.4477 18 16 17.5523 16 17C16 16.4477 16.4477 16 17 16C17.5523 16 18 16.4477 18 17Z" fill="currentColor"></path><path d="M18 13C18 13.5523 17.5523 14 17 14C16.4477 14 16 13.5523 16 13C16 12.4477 16.4477 12 17 12C17.5523 12 18 12.4477 18 13Z" fill="currentColor"></path><path d="M13 17C13 17.5523 12.5523 18 12 18C11.4477 18 11 17.5523 11 17C11 16.4477 11.4477 16 12 16C12.5523 16 13 16.4477 13 17Z" fill="currentColor"></path><path d="M13 13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13C11 12.4477 11.4477 12 12 12C12.5523 12 13 12.4477 13 13Z" fill="currentColor"></path><path d="M8 17C8 17.5523 7.55228 18 7 18C6.44772 18 6 17.5523 6 17C6 16.4477 6.44772 16 7 16C7.55228 16 8 16.4477 8 17Z" fill="currentColor"></path><path d="M8 13C8 13.5523 7.55228 14 7 14C6.44772 14 6 13.5523 6 13C6 12.4477 6.44772 12 7 12C7.55228 12 8 12.4477 8 13Z" fill="currentColor"></path></svg>
            ${date}
          </h3>
          ${items
            .map(
              (exercise) => `
            <article class="exercise-record">
              <div class="exercise-info">
                <p class="exercise-name">${exercise.name}</p>
                <p class="exercise-details"><span class="exercise-sets">${exercise.sets}</span> sets x <span class="exercise-reps">${exercise.reps}</span> reps @ <span class="exercise-weight">${toDisplayWeight(exercise.weight)}</span> ${currentUnit}</p>
              </div>
              <div class="exercise-actions">
                <button class="delete-exercise-btn" data-id="${exercise.id}">
                  <svg class="delete-exercise-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.17065 4C9.58249 2.83481 10.6937 2 11.9999 2C13.3062 2 14.4174 2.83481 14.8292 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                    <path d="M20.5 6H3.49988" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                    <path d="M18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5M18.8334 8.5L18.6334 11.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                    <path d="M9.5 11L10 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                    <path d="M14.5 11L14 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                  </svg>
                </button>
              </div>
            </article>
          `,
            )
            .join("")}
        </div>
      `,
      )
      .join("");
  }

  exerciseLog.addEventListener("click", async (e) => {
    if (e.target.closest(".delete-exercise-btn")) {
      const btn = e.target.closest(".delete-exercise-btn");
      const id = Number(btn.dataset.id);
      await dbService.deleteExercise(id);
      renderExercises();
    }
  });

  renderExercises();
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("exercise-form")) {
    init();
  }
});
