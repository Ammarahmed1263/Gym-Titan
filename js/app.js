if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("service worker registered", reg))
      .catch((err) => console.log("worker registration failed", err));
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const rmWorker = new Worker("js/worker.js");
  const rmForm = document.querySelector("#rm-form");
  const rmResult = document.querySelector("#rm-result");

  rmForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const weight = document.querySelector("#weight-input").value;
    const reps = document.querySelector("#reps-input").value;

    rmWorker.postMessage({ weight, reps });
  });

  rmWorker.onmessage = function (e) {
    const result = e.data;

    const confidenceColors = {
      "very-high": "#22c55e",
      high: "#3b82f6",
      moderate: "#f59e0b",
      low: "#ef4444",
    };

    const confidenceColor = confidenceColors[result.confidence] || "#6b7280";

    rmResult.innerHTML = `
    <div class="result-header">
      <div class="main-result">
        <span class="result-label">Estimated 1RM</span>
        <span class="result-value">${result.average} kg</span>
      </div>
      <div class="confidence-badge" style="background-color: ${confidenceColor}">
        ${result.confidence.replace("-", " ")} confidence
      </div>
    </div>

    <div class="result-range">
      <span class="range-label">Range:</span>
      <span class="range-values">${result.min} - ${result.max} kg</span>
      <span class="range-spread">(±${(result.range / 2).toFixed(1)} kg)</span>
    </div>

    <div class="formula-breakdown">
      <h3>Formula Breakdown</h3>
      <div class="formula-grid">
        <div class="formula-item">
          <span class="formula-name">Brzycki</span>
          <span class="formula-value">${result.brzycki} kg</span>
        </div>
        <div class="formula-item">
          <span class="formula-name">Epley</span>
          <span class="formula-value">${result.epley} kg</span>
        </div>
        <div class="formula-item">
          <span class="formula-name">Lander</span>
          <span class="formula-value">${result.lander} kg</span>
        </div>
        <div class="formula-item">
          <span class="formula-name">Lombardi</span>
          <span class="formula-value">${result.lombardi} kg</span>
        </div>
      </div>
    </div>

    ${
      result.variationPercent > 5
        ? `
      <div class="accuracy-note">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 1L1 15H15L8 1Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M8 6V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="8" cy="12" r="0.5" fill="currentColor"/>
        </svg>
        <span>Formula variation is ${result.variationPercent}%. Consider testing with fewer reps for more accuracy.</span>
      </div>
    `
        : ""
    }
  `;
  };
});
