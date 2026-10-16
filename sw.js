// POPortion service worker: keeps a copy of the app so it opens offline.
// Online, it always asks the network first, so updates show up right away;
// offline, it answers from the copy.
const CACHE = 'poportion-v1';
const FILES = [
  './',
  'index.html',
  'manifest.json',
  'fonts/inter-latin.woff2',
  'fonts/poppins-800-wordmark.woff2',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
  'favicon.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=> c.addAll(FILES)).then(()=> self.skipWaiting()));
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=> Promise.all(keys.filter(k=> k !== CACHE).map(k=> caches.delete(k))))
      .then(()=> self.clients.claim())
  );
});

self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res=>{
        if(res.ok){
          const copy = res.clone();
          caches.open(CACHE).then(c=> c.put(req, copy));
        }
        return res;
      })
      .catch(()=> caches.match(req, {ignoreSearch: true})
        .then(hit=> hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  );
});
