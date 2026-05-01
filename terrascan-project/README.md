# TerraScan — Expert sinistre agricole

Outil cartographique d'expertise sinistre agricole pour inspecteurs et experts terrain.  
**Stack** : HTML/CSS/JS vanilla · Leaflet.js · Sentinel Hub · Open-Meteo · IGN Géoplateforme

---

## Structure du projet

```
terrascan-project/
├── src/                        ← Fichiers sources (modifier ici)
│   ├── terrascan_head.html     ← <head> HTML + imports scripts/fonts
│   ├── terrascan_body.html     ← HTML statique (header, panneaux, modales)
│   ├── terrascan.css           ← CSS complet (sans doublons)
│   └── terrascan.js            ← JS complet (sans doublons)
├── public/                     ← Fichiers déployables
│   ├── index.html              ← Build final (généré par rebuild.py)
│   ├── sw.js                   ← Service Worker (cache offline)
│   └── landing.html            ← Page marketing
├── docs/                       ← Documentation
│   └── FONCTIONNALITES.md
├── rebuild.py                  ← Script d'assemblage
└── README.md
```

## Démarrage rapide

```bash
# Reconstruire index.html depuis les sources
python3 rebuild.py

# Déployer sur Netlify
netlify deploy --dir=public --prod
```

## URL de production
https://relaxed-stroopwafel-c72189.netlify.app

## Codes d'accès
- `TERRA2026` — accès standard
- `EXPERT01` — accès expert  
- `DEMO2026` — mode démo (parcelle fictive Beauce)
- `ADMIN99` — accès admin

---

## Credentials Sentinel Hub
```
SH_INST = '348bc8f1-47e1-4ba5-86ec-4b3000eba6c9'
SH_ID   = 'sh-bc26554b-3618-4311-98ef-2b8240369846'
SH_SEC  = '6i6yE7WdQM7GbDFHmsyflkXbx55BFKdC'
```
⚠️ Token WMS valide 30 min — renouvelé automatiquement par `fetchTok()`

---

## Architecture layout

```
body (flex colonne)
  ├── .hdr (52px fixe, z-index:1000)
  └── .map-wrap (flex:1, flex colonne)
        ├── .map-zone (flex:1 — contient carte + tous les panels)
        │     ├── #map (inset:0 — carte Leaflet)
        │     ├── .sheet (absolute left:0, 60vw — fiche parcelle)
        │     ├── .gp-panel (absolute right:60px — panneaux GP)
        │     ├── .gp-toolbar (absolute right:12px — boutons)
        │     └── overlays (histoPanel, exportMenu, annotToolbar...)
        └── .ndvi-bar (flex-shrink:0 — barre NDVI dans le flux)
```

**Règle fondamentale** : `.map-wrap.sheet-is-open .ndvi-bar { max-height:0 }`  
Quand la fiche est ouverte, la barre NDVI est masquée via CSS.

---

## Fonctionnalités principales

### NDVI Satellite
- Couche NDVI Sentinel-2 (10m) via Sentinel Hub WMS
- Timeline 25+ dates sur 2 ans
- Indices : NDVI / EVI / NDWI
- Mode Simple / Avant-Après (split screen)
- Bascule NDVI heatmap ↔ Photo satellite

### Fiche parcelle (openSheet)
- Onglet **NDVI** : carte NDVI parcelle + split, stats, graphique évolution
- Onglet **Expert** : saisie visites, photos terrain géolocalisées
- Onglet **Sinistres** : score 0-100, gel/grêle/sécheresse, stades BBCH
- Onglet **Météo** : jauges vs normales ERA5, graphiques 7j/15j/30j
- Onglet **Infos** : rendements Agreste, zones AOC/IGP, LAI

### Couches cartographiques
| Couche | Source | Fonction |
|--------|--------|----------|
| NDVI végétation | Sentinel Hub | Indice végétation |
| Cadastre | IGN WMTS | Limites parcellaires |
| PAC/RPG 2023 | IGN/ASP WFS | Parcelles agricoles |
| Humidité sols | Sentinel-1 SAR | Radar 10m |
| CatNat & Risques | Géorisques WMS | Arrêtés catastrophes |
| Relief & Altitude | IGN WMTS | MNT + courbes niveau |
| Géologie BRGM | IGN WMTS | Carte géologique |
| Hydrographie | IGN WMTS | Réseau cours d'eau |
| Épisodes grêle | ERA5 Open-Meteo | WMO 96/99 sur 90j |
| AOC/AOP/IGP | INAO WMS | Appellations |

### Fonds de carte
- Photographies aériennes IGN (20cm)
- Plan IGN v2
- Satellite HD ESRI/Maxar (0.3m)
- Satellite ultra HD ESRI Clarity (×20)
- Sentinel-2 récent (10m)

### Export & Partage
- Rapport PDF terrain (photos + NDVI + météo + sinistres)
- Export JSON dossiers
- Export CSV récapitulatif
- URL partageable `?lat=X&lng=Y&z=Z&ndvi=1`
- Email rapport via mailto

### Outils
- GPS temps réel + heading + reverse geocoding
- Mesure distance et surface
- Photos historiques IGN (1985→2023)
- Détection IA anomalies NDVI
- Comparaison NDVI multi-parcelles
- Tableau de bord expertises

---

## Bugs connus / En cours

- [ ] Carte NDVI parcelle parfois vide au 1er chargement (race condition DOM)
- [ ] Split view Avant/Après : "Map data not yet available" sur certaines zones
- [ ] Menu fonds de carte : vignettes de prévisualisation à améliorer
- [ ] Couche grêle : lente à charger (9 requêtes parallèles Open-Meteo)

## Prochaines priorités

1. Stabilisation visuelle des menus et de la fiche parcelle
2. Tests sur smartphone iOS/Android
3. Mode hors-ligne partiel (tuiles en cache via SW)
4. Historique cloud synchronisé (Supabase)
5. Alertes automatiques sinistres sur parcelles suivies
