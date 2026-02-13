# Getting Started - Titan Gym PWA

A starter Progressive Web App (PWA) for a gym dashboard. It includes a 1RM calculator, install prompt handling, offline/404 fallbacks, and a cache-first service worker.

---

## What It Does
- Provides a simple UI for estimating 1RM (one-rep max) values.
- Uses a Web Worker to calculate multiple 1RM formulas without blocking the UI.
- Registers a service worker for offline support and asset caching.
- Adds an install button triggered by the `beforeinstallprompt` event.

---

## Key Features
- **PWA manifest** with icons, theme colors, and standalone display.
- **Cache-first strategy** with runtime caching and offline/404 pages.
- **Web Worker** math calculations for Brzycki, Epley, Lander, and Lombardi formulas.
- **Confidence indicator** based on formula variation.

---

## How It Works
1. The service worker caches static assets on install.
2. Fetch requests are served from cache first, then the network.
3. 404 navigation requests show a custom 404 page.
4. Failed navigation requests return the offline page.
5. The form posts data to `worker.js` and receives computed results.

---

## Project Structure
- `index.html` - Main UI layout and form.
- `manifest.json` - PWA metadata and icon setup.
- `sw.js` - Service worker caching and routing logic.
- `js/app.js` - App logic, install prompt, and worker integration.
- `js/worker.js` - 1RM calculation engine.
- `pages/` - Offline, 404, profile, and exercises pages.
- `css/` - Styling for main and auxiliary pages.

---

## Run It
Open `index.html` using a local server (recommended for service worker support). Then try:
- Submitting the 1RM form
- Installing the app
- Switching to offline mode to see the offline page

---

## Learning Points
- Service worker lifecycle (install, activate, fetch)
- Cache storage and fallback pages
- PWA install prompt handling
- Web Worker messaging
