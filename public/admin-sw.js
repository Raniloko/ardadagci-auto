// ARDADAGCI admin – minimal service worker so the dashboard can be installed as an app.
// It deliberately caches nothing: admin data must always be live. Navigations go straight to the
// network; only when the phone is offline a short notice is shown instead of the browser error.
const OFFLINE_PAGE = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>ARDADAGCI Admin</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f2f2f7;color:#0b0b0c;font:16px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;text-align:center;padding:24px}@media(prefers-color-scheme:dark){body{background:#000;color:#f5f5f7}}img{width:72px;height:72px;border-radius:17px}h1{font-size:22px;margin:18px 0 6px}p{margin:0 0 22px;color:#6b6b70}button{border:0;border-radius:14px;padding:14px 26px;background:#0a7aff;color:#fff;font:600 17px inherit}</style></head>
<body><main><img src="/admin-icon-192.png" alt=""><h1>Keine Internetverbindung</h1><p>Das Dashboard braucht eine Verbindung, damit alle Daten aktuell sind.</p><button onclick="location.reload()">Erneut versuchen</button></main></body></html>`;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(() => new Response(OFFLINE_PAGE, { headers: { "Content-Type": "text/html; charset=utf-8" } })),
  );
});
