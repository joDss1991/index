# TerraScan — Documentation technique

## Fonctions JS critiques

### Authentification
```js
initAuth()          // Appelé en fin de script — vérifie token localStorage
checkAuth()         // Valide le code saisi — stocke token 30j
VALID_CODES = ['TERRA2026','EXPERT01','DEMO2026','ADMIN99']
AUTH_KEY = 'ts_auth_v1'
```

### NDVI Global
```js
toggleNdvi()            // Active/désactive couche NDVI + barre
toggleNdviLayer()       // Alias — appelé depuis panneau Couches
fetchDates()            // Charge les dates Sentinel-2 disponibles
loadNdvi(date, source)  // Charge une tuile NDVI WMS
updateNdviTimeline()    // Met à jour les chips de dates
setVegIndex(idx, btn)   // Switch NDVI/EVI/NDWI
setGlobalLayerMode(mode)// Switch NDVI heatmap / Photo satellite
```

### Fiche parcelle
```js
openSheet(lat, lng)         // Ouvre la fiche — charge données async
closeSheet()                // Ferme + retire sheet-is-open
shTab(name, el)             // Navigation onglets (ndvi/expert/sin/wx/info)
initNdviParcelMap(feat,lat,lng) // Initialise carte Leaflet parcelle
loadNdviOnParcel()          // Charge tuile NDVI sur la carte parcelle
```

### Couches
```js
togOv(name)         // Toggle couches génériques (cad/pac/sar/catnat)
togRelief()         // Relief + courbes de niveau IGN
togGrele()          // Épisodes grêle ERA5 (async)
togPedol()          // Géologie BRGM + CLC
togHydro()          // Hydrographie IGN
togAOC()            // Périmètres AOC/IGP INAO
setBase(name)       // Change le fond de carte
```

### Export
```js
exportPDF()             // Rapport PDF multi-parcelles
exportJSON()            // Export JSON dossiers
exportHistoryCSV()      // Export CSV
sendReportByEmail()     // Ouvre mailto avec rapport
openExportMenu()        // Toggle menu dropdown export
```

### Photos & Annotations
```js
handlePhotoUpload(input)    // Upload photos terrain
renderPhotoGallery(lat,lng) // Affiche galerie dans fiche
addPhotoMarkers(lat,lng)    // Marqueurs miniatures carte
openPhotoViewer(id,lat,lng) // Visionneuse plein écran
restorePhotoMarkers()       // Restaure au chargement
setAnnotMode(mode)          // Mode annotation (zone/cercle/fleche/texte)
restoreAnnotations()        // Restaure au chargement
```

### GPS
```js
startGPS()          // Lance watchPosition
toggleGpsPanel()    // Affiche/masque panneau GPS
headingToCardinal() // Convertit degrés en N/NE/E...
```

### Données métier
```js
getBBCHStade(codeRpg, date)     // Calcule stade phénologique
buildBBCHHtml(bbch)             // HTML stade BBCH
fetchRendement(lat,lng,codeRpg) // Rendement Agreste
buildRendementHtml(rend,surface)// HTML rendements
fetchAOC(lat,lng)               // Périmètres AOC INAO
buildLAIHtml(codeRpg)           // Référence LAI
```

## Variables globales importantes

```js
// NDVI
let tok = ''            // Token Sentinel Hub (renouvelé auto)
let dates = []          // Dates disponibles Sentinel-2
let curIdx = 0          // Index date courante
let ndviOpen = false    // Barre NDVI ouverte
let ndviLyr = null      // Layer Leaflet NDVI actif
let baseLyr = null      // Layer fond de carte
let currentBase = 'ign' // Fond actif

// Parcelle active
window._shLat           // Lat fiche ouverte
window._shLng           // Lng fiche ouverte
window._ndviParcelLat   // Lat carte NDVI parcelle
window._ndviParcelLng   // Lng carte NDVI parcelle
window._currentRpgFeature // Feature GeoJSON RPG

// Cartes Leaflet
let map                 // Carte principale
let _ndviParcelMap      // Carte NDVI onglet parcelle
let _splitMapL          // Carte gauche split
let _splitMapR          // Carte droite split

// Stockage
const STORE_KEY = 'ts_store_v1'       // Visites/observations
const PHOTO_STORE_KEY = 'ts_photos_v1' // Photos terrain
const ANNOT_STORE_KEY = 'ts_annotations_v1' // Annotations
```

## URLs APIs

```
Sentinel Hub WMS:
https://sh.dataspace.copernicus.eu/ogc/wms/{INST}?access_token={tok}&...

Token:
https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token

Météo (Open-Meteo):
https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&...
https://archive-api.open-meteo.com/v1/archive?...

IGN WMTS (toutes les couches):
https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0
  &LAYER={LAYER}&STYLE=normal&FORMAT=image/png
  &TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}

Couches IGN disponibles:
- ORTHOIMAGERY.ORTHOPHOTOS          (orthophotos aériennes)
- GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2 (plan IGN)
- ELEVATION.SLOPES                  (ombrage relief)
- ELEVATION.CONTOUR.LINE            (courbes niveau)
- HYDROGRAPHY.HYDROGRAPHY           (réseau hydro)
- GEOLOGIE                          (géologie BRGM)
- LANDCOVER.CLC18                   (Corine Land Cover)

RPG PAC (WFS):
https://data.geopf.fr/wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature
  &TYPENAMES=LANDUSE.AGRICULTURE2023:rpg-2023
  &outputFormat=application/json
  &BBOX={bbox}&count=200

Géorisques CatNat:
https://georisques.gouv.fr/api/v1/gaspar/catnat
  ?latmin={}&lonmin={}&latmax={}&lonmax={}

Nominatim (reverse geocoding):
https://nominatim.openstreetmap.org/reverse?lat={}&lon={}&format=json

Geo API (département depuis coords):
https://geo.api.gouv.fr/communes?lat={}&lon={}&fields=codeDepartement
```

## Points d'attention pour Claude Code

### Bugs prioritaires
1. **Carte NDVI parcelle vide** — race condition entre `openSheet()` et `initNdviParcelMap()`. Le div `#ndviParcelMap` doit avoir `offsetHeight > 0` avant l'init Leaflet.

2. **Split view "Map data not available"** — Leaflet s'initialise avant que les divs `ndviSplitMapLeft/Right` aient leurs dimensions CSS. `initSplitMaps()` doit vérifier `wrap.offsetHeight > 0`.

3. **Régression CSS** — le script de nettoyage des doublons CSS a plusieurs fois gardé la mauvaise version d'une règle. Toujours vérifier la règle `.gp-panel` qui doit avoir `position:absolute; transform:translateX(calc(100% + 60px))`.

4. **tok null** — si `fetchTok()` est appelé avant que les credentials Sentinel Hub soient disponibles, `tok` reste vide et les tuiles NDVI ne chargent pas.

### Règles CSS critiques à ne jamais casser
```css
/* Panneau GP — doit être hors écran par défaut */
.gp-panel {
  position: absolute;
  transform: translateX(calc(100% + 60px)); /* CACHÉ */
}
.gp-panel.open { transform: translateX(0); } /* VISIBLE */

/* Barre NDVI dans le flux — pas superposée */
.ndvi-bar { max-height: 0; overflow: hidden; }
.ndvi-bar.open { max-height: 260px; }

/* Fiche ouverte → barre NDVI cachée */
.map-wrap.sheet-is-open .ndvi-bar { max-height: 0 !important; }

/* Carte Leaflet parcelle — dimensions garanties */
.ndvi-map-wrap { height: 200px !important; }
#ndviParcelMap { position: absolute !important; inset: 0 !important; }
```
