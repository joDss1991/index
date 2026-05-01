// TerraScan Service Worker — cache tuiles et assets
const CACHE = 'terrascan-v1';
const TILE_CACHE = 'terrascan-tiles-v1';

const PRECACHE = [
  '/',
  '/index.html',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap',
];

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(PRECACHE.filter(u=>!u.startsWith('http')||u.includes('unpkg')||u.includes('fonts'))))
      .catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE&&k!==TILE_CACHE).map(k=>caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  const url = e.request.url;
  // Cache tuiles cartographiques
  if(url.includes('/MapServer/tile/') || url.includes('wmts') || url.includes('geopf.fr')){
    e.respondWith(
      caches.open(TILE_CACHE).then(cache=>
        cache.match(e.request).then(cached=>{
          if(cached) return cached;
          return fetch(e.request).then(resp=>{
            if(resp.ok) cache.put(e.request, resp.clone());
            return resp;
          }).catch(()=>cached);
        })
      )
    );
    return;
  }
  // Cache assets statiques
  if(url.includes('unpkg.com')||url.includes('cdnjs')||url.includes('fonts.g')){
    e.respondWith(
      caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{
        caches.open(CACHE).then(cache=>cache.put(e.request,r.clone()));
        return r;
      }))
    );
    return;
  }
});
