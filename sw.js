const VERSION = "20261028-2111";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"];
const CDN = ["https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js", "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"];
self.addEventListener("install", (e) => { e.waitUntil((async () => { const c = await caches.open("shell-" + VERSION); await c.addAll(SHELL); for (const u of CDN) { try { const r = await fetch(u, {mode: "cors"}); if (r.ok) await c.put(u, r); } catch (err) {} } self.skipWaiting(); })()); });
self.addEventListener("activate", (e) => { e.waitUntil((async () => { for (const k of await caches.keys()) if (!k.endsWith(VERSION)) await caches.delete(k); self.clients.claim(); })()); });
self.addEventListener("fetch", (e) => { const req = e.request; if (req.method !== "GET") return; const url = new URL(req.url);
  const isShell = url.origin === location.origin; const isLib = CDN.includes(req.url) || url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!isShell && !isLib) return;
  e.respondWith((async () => { const c = await caches.open("shell-" + VERSION); const hit = await c.match(req, {ignoreSearch: isShell}); const net = fetch(req).then(r => { if (r && (r.ok || r.type === "opaque")) c.put(req, r.clone()); return r; }).catch(() => null);
    if (isShell) { const r = await net; return r || hit || Response.error(); } // 앱 본체: 네트워크 우선(최신), 실패 시 캐시
    return hit || (await net) || Response.error(); })()); });
