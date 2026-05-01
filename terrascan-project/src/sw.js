// TerraScan Service Worker — cache tuiles, assets et API terrain
const CACHE = 'terrascan-v2';
const TILE_CACHE = 'terrascan-tiles-v1';
const API_CACHE = 'terrascan-api-v1';
const API_TTL = 30 * 60 * 1000; // 30 min

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
      keys.filter(k=>![CACHE,TILE_CACHE,API_CACHE].includes(k)).map(k=>caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Stale-while-revalidate pour les API terrain
async function apiCacheFirst(request){
  const cache = await caches.open(API_CACHE);
  const cached = await cache.match(request);
  if(cached){
    const ageHdr = cached.headers.get('x-sw-cached-at');
    if(ageHdr && Date.now()-parseInt(ageHdr) < API_TTL){
      return cached;
    }
  }
  try{
    const fresh = await fetch(request);
    if(fresh.ok){
      const copy = fresh.clone();
      const headers = new Headers(copy.headers);
      headers.set('x-sw-cached-at', Date.now().toString());
      const body = await copy.arrayBuffer();
      await cache.put(request, new Response(body, {status:fresh.status, headers}));
    }
    return fresh;
  }catch(e){
    if(cached) return cached; // fallback offline
    throw e;
  }
}

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
  // Cache API météo Open-Meteo (stale-while-revalidate)
  if(url.includes('api.open-meteo.com')||url.includes('archive-api.open-meteo.com')){
    e.respondWith(apiCacheFirst(e.request));
    return;
  }
  // Cache RPG WFS IGN (stale-while-revalidate)
  if(url.includes('wxs.ign.fr')&&url.includes('WFS')){
    e.respondWith(apiCacheFirst(e.request));
    return;
  }
  // Cache Nominatim géocodage (stale-while-revalidate)
  if(url.includes('nominatim.openstreetmap.org')){
    e.respondWith(apiCacheFirst(e.request));
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
