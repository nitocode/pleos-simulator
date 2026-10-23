---
name: add-car-model
description: Ajoute un nouveau modèle de voiture (une nouvelle interface de marque) au simulateur : recherche documentaire, caractéristiques de charge calibrées, dossier src/brands/<id>/, enregistrement sur la page d'accueil, vérification dans le navigateur et commit. À utiliser quand l'utilisateur demande « ajoute l'interface de la <marque> <modèle> » ou veut un nouveau véhicule dans le banc d'essai.
---

# Ajouter un modèle au simulateur

Le projet est un simulateur Vue 3 + Vite + Tailwind 4 + Pinia (voir `README.md`, section « Ajouter une marque »). Chaque interface vit dans `src/brands/<id>/` et s'appuie sur le véhicule simulé commun (`src/core/vehicle/store.ts`).

## Étapes

1. **Recherche** — applique la skill `car-model-research` et écris `docs/models/<id>.md`. Ne commence pas le code sans captures de l'écran (au moins une) ni chiffres de recharge sourcés.

2. **Caractéristiques du véhicule** — un `VehicleSpec` (`src/core/vehicle/simulation.ts`) : `batteryKwh` (net), `kmPerPercent` (autonomie WLTP / 100), `acKw`, `dcCurve` (points [état de charge %, kW] de 0 à 100, batterie chaude).
   - Calibre la courbe pour retrouver la durée 10→80 % sourcée :
     `python .claude/skills/add-car-model/scripts/calibrate_curve.py --kwh 77 --target 28 --curve "0:100,5:170,10:175,30:155,50:118,70:84,80:68,90:45,100:8"`
     Le script affiche la durée obtenue et une courbe mise à l'échelle si l'écart dépasse 0,5 min.
   - Ajoute un test dans `src/core/vehicle/simulation.spec.ts` (durée 10→80 % dans une fourchette autour de la valeur sourcée).

3. **Squelette** — `python .claude/skills/add-car-model/scripts/new_brand.py <id> "<Marque>" "<Système>" "<Modèle>"` crée `index.ts`, `theme.css`, `<Id>Cockpit.vue` et un écran minimal, puis rappelle d'ajouter la marque à `BRANDS` (`src/brands/index.ts`). Les champs à compléter sont marqués `TODO`.
   - Si la marque partage la plateforme d'une marque existante (ex. groupe Volkswagen, plateforme MEB/MIB), réutilise `src/brands/meb/` pour les apps communes et ne garde dans la marque que l'habillage et la disposition.

4. **Interface** — reproduis la disposition des captures : barres, accueil, menus, climatisation, recharge, assistant vocal, commandes physiques (slot `hardware`), écran conducteur (slot `driver`, sinon `driverDisplay: false`).
   - Couleurs uniquement via les jetons `--ui-*` de `theme.css` (jour et `.night`), et `--map-*` pour la carte partagée `src/core/ui/MapCanvas.vue`.
   - Libellés en français, ceux du manuel quand ils existent. Commente l'origine des choix (« capture du manuel », « dossier de presse ») dans les docstrings des composants.
   - Le cockpit appelle `vehicle.setSpec(brand.vehicle)` et `useSimulationClock()`, et affiche les événements du véhicule (`arrived`, `charge-complete`, `gear-refused`, `power-refused`, `power`).
   - Contact (`vehicle.ready`) : écran éteint quand le véhicule est éteint ; la charge continue.

5. **Page d'accueil** — renseigne `tagline`, `year`, `screenLabel`, `accent` dans `index.ts` ; ajoute un aperçu de l'écran dans `src/HomePage.vue` (bloc `v-if="b.id === …"`).

6. **Vérification**
   - `npm run typecheck`, `npm test`, `npm run build`.
   - Lance le serveur (`.claude/launch.json`, configuration `pleos-dev`) et ouvre `http://localhost:5173/#/<id>` dans le navigateur intégré. Vérifie : accueil, chaque menu/app, climatisation, recharge (brancher une borne CC dans le panneau de simulation et regarder la puissance), conduite (passer en D, vitesse), mode nuit, véhicule éteint. Compare avec les captures relevées dans la fiche.
   - Pour inspecter l'état : `document.querySelector('#app').__vue_app__.config.globalProperties.$pinia._s.get('vehicle')`.

7. **Livraison** — mets à jour `README.md` (section du modèle + sources), commit en français, push si l'utilisateur l'a demandé. Dans la réponse : ce qui suit la documentation, ce qui est estimé, ce qui n'a pas été vérifié.
