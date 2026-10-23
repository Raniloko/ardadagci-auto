// ARDADAGCI admin – minimal service worker so the dashboard can be installed as an app.
// It deliberately caches nothing: admin data must always be live.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
