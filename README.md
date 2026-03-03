# Gym Titan PWA 💪

A high-performance Progressive Web App (PWA) built with Vanilla JavaScript, HTML, and CSS. Gym Titan serves as a fitness dashboard, featuring a One-Rep Max (1RM) calculator, offline tracking, and body metric logging.

This project was developed with a strong emphasis on **advanced modern web concepts**, performance optimization, and architectural best practices, achieving perfect Lighthouse scores across the board.

<div align="center">
<img src="images/lighthouse-score.png" alt="Lighthouse Score" width="700">
</div>

---

## 🌟 Core Features

- **Advanced 1RM Calculator**: Estimates One-Rep Max using four established formulas (Epley, Brzycki, Lander, Lombardi) simultaneously and provides training percentages (50%-95%).
- **Interactive Exercise Logging**: Record details of your workouts (sets, reps, weight) with automatic date grouping and persistent history.
- **Comprehensive Profile Tracking**: Monitor your body weight over time, track height, and automatically compute your BMI and Weight/Height ratio. Includes visual indicators for weight changes (+/-).
- **Unit Hot-Swapping**: Instantly toggle between `kg` and `lbs` globally. The app recalculates and re-renders all saved logs, history, and active calculations instantly without page reloads.
- **100% Offline Capable**: Fully functional when disconnected from the internet. All data (logs, profile, settings) is reliably stored locally.
- **Installable PWA**: Feels like a native app. Add it to your home screen directly via the custom integrated "Install App" button in the sidebar menu.

---

## 🚀 Advanced Concepts Implemented

### 1. Custom Vanilla SPA Router

Instead of relying on heavy frameworks, this app features a custom built lightweight Single Page Application (SPA) router (`shared.js`).

- Intercepts navigation clicks and uses the HTML5 History API (`pushState`/`popstate`).
- Dynamically `fetch`es the requested page's HTML.
- Parses the response using `DOMParser` and seamlessly injects the new content into the `#app` container without a full page reload.
- **Dynamic Imports**: Leverages `await import()` to lazy-load specific JavaScript modules (`app.js`, `profile.js`, `exercises.js`) precisely only when that route is visited, drastically reducing the initial bundle execution time.

### 2. Service Workers & Offline Support

- Implements a robust **Cache-First strategy** for static assets to ensure blazing fast load times.
- Offline support: If the network fails, users are gracefully redirected to a custom `offline.html` fallback.
- Catch-all 404 handling: Invalid routes map to a cached `404.html` page.
- Handles the PWA `beforeinstallprompt` event to provide a custom "Install App" button within the app's UI.

### 3. Web Workers for Heavy Computations

- The 1RM calculations (Epley, Brzycki, Lander, Lombardi formulas) are offloaded to a dedicated background **Web Worker** (`worker.js`).
- This ensures the main UI thread is never blocked during complex mathematical operations, keeping animations and interactions buttery smooth.

### 4. Event Delegation & Bubbling

- Utilizes **Event Bubbling** to attach single event listeners to parent containers (e.g., the document body for the router links).
- This optimizes memory usage and ensures that dynamically injected DOM elements automatically inherit event behaviors without needing to re-bind listeners.

### 5. Custom Events for State Management

- Built a decoupled communication system using **CustomEvent**.
- When a user changes their preferred unit (kg vs. lbs) in the sidebar, a custom `unitChanged` event is dispatched globally.
- Listening components independently catch this event, convert their internal state math, and trigger UI re-renders without tightly coupled function calls.

### 6. IndexedDB for Persistent Storage

- Uses IndexedDB (via an `idb.js` wrapper) to robustly store user preferences (like chosen weight units) and fitness logs persistently across sessions, completely independent of network status.
- Extensively utilizes Asynchronous JavaScript (`async`/`await` and Promises) to ensure database queries don't block the UI thread.

### 7. Memory Management & AbortControllers

- To prevent memory leaks inherent in vanilla SPA routing, the codebase heavily uses `AbortController`.
- Event listeners specific to a route are registered with an `{ signal }` from an `AbortController`. When the route changes, `abort()` is called, instantly stripping away old listeners from global objects (like `window`) and ensuring no stacked ghost listeners or logic bugs occur.

### 8. Native ES6 Modules

- Clean, maintainable architecture built on native ES6 `import`/`export` module patterns, cleanly separating routing (`shared.js`), database (`db.js`), and page-specific logic without global scope pollution.

---

## 🛠️ Project Structure

```text
├── index.html          # Main Calculator Interface
├── manifest.json       # PWA Manifest (Icons, theme colors, standalone mode)
├── sw.js               # Service Worker logic (Caching, Offline, 404)
├── js/
│   ├── shared.js       # Core Router, Install Logic, Event Delegation
│   ├── app.js          # Main UI controller & Worker communication
│   ├── worker.js       # Background computation thread for 1RM
│   ├── db.js & idb.js  # IndexedDB wrapping and storage services
│   ├── profile.js      # Profile specific logic
│   └── exercises.js    # Exercise log logic
├── pages/              # SPA route HTML templates
└── css/                # Modular stylesheets
```

---

## 📈 Performance & Accessibility First

This PWA has been relentlessly audited to overcome render-blocking resources.

- Optimized CSS delivery: Specific stylesheets are loaded only when their corresponding pages are rendered.
- Legible scaling typography.
- WCAG-compliant color contrast ratios (4.5:1 on all interactive elements).
- Fully validated meta tags and semantic HTML for perfect SEO.

---

## 🏃 Setup & Run

To experience the PWA and Service Worker properly:

1. Clone the repository.
2. Serve the directory using a vital local web server (e.g., `npx http-server`).
3. Open on `http://localhost:<port>`.
4. Try operating it normally, then simulate an offline environment in DevTools (Network tab -> Offline) to test the robust fallback capabilities!
