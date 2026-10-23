# Simulateur d'interfaces auto

Banc d'essai web **non officiel** pour tester des interfaces multimédia de voitures dans un navigateur. Une page d'accueil permet de choisir la marque, puis le modèle : **Hyundai Ioniq 3** (Pleos Connect), **Tesla Model 3**, **Volkswagen ID.3** (2024) et **Škoda Enyaq** (2024).

Site : https://nitocode.github.io/pleos-simulator/

> Projet sans lien avec Hyundai ni avec les autres constructeurs. Graphismes, données et textes d'aide sont des reconstitutions de démonstration.

## Tesla Model 3

Reconstitution d'après le manuel du conducteur du Model 3 (2024+) :

- **Écran tactile** : barre d'état, zone d'état du véhicule (rapport, vitesse, coffres, trappe de recharge), carte et navigation, barre inférieure (climatisation, Mes applis, lanceur d'applications, volume).
- **Contrôles** avec recherche : Rapide, Dynamique, Recharge, Éclairage, Affichage, Sécurité, Navigation, Entretien, Logiciel.
- **Disposition** calquée sur les captures annotées du manuel : zone d'état du véhicule pleine hauteur (P R N D, batterie, témoins, bande des modes de conduite à glisser, repères Coffre avant / Coffre arrière), carte avec barre d'état et colonne de boutons, barre inférieure sombre.
- **Visualisation 3D** (three.js) : Model 3 vue de trois quarts à l'arrêt ; en conduite, la caméra tourne autour de la voiture jusqu'à la vue à la troisième personne, avec la route, les marquages, les véhicules voisins et la trajectoire bleue sous régulateur. Sans WebGL, un dessin de profil prend le relais.
- **Climatisation** : fenêtre rapide (< >) et écran principal avec l'habitacle, Auto, A/C, sièges chauffants à 3 niveaux, volant, dégivreurs, ventilation, air recyclé, Séparer ; Maintien de la climatisation, Mode Animaux (écran de température) et Mode Camping.
- **Apps** : Multimédia, Téléphone, Recharge (courbe de charge), Énergie, Caméra de recul, Météo.
- **Commandes du volant** : bouton de défilement gauche (volume, morceau, appels), redémarrage de l'écran par appui long.

## Volkswagen ID.3 (2024)

D'après le communiqué Volkswagen 49/2024 et les photos officielles de l'écran (`docs/models/vw-id3.md`) :

- **Écran 12,9″** : barre supérieure (menu principal, favoris assignables, température extérieure, heure), menu des applis (Téléphone, Radio/Médias, Navigation, Véhicule, App-Connect, Parking, Recharge, Clim. à l'arrêt, Assistants, Réglages, IDA, Wellness), barre de climatisation toujours visible avec le bouton Accueil.
- **Climatisation** AirCare bizone et Smart Climate (« Pieds chauds », « Vue dégagée »), **recharge** avec niveau cible, courbe et préconditionnement manuel de la batterie, **assistant IDA**, app **Wellness** (Fresh Up, Calm Down, Power Break).
- **Commandes physiques** : curseurs tactiles rétroéclairés (température, volume), commodo de marche séparé (D/B, N, R, P), volant multifonction ; **ID. Light** et Digital Cockpit.

## Škoda Enyaq (2024)

D'après le dossier de presse et les infographies « Explore Enyaq 2024 » (`docs/models/skoda-enyaq.md`) :

- **Écran 13″** : trois boutons de base (Paramètres du véhicule, Accueil, Apps), jusqu'à cinq raccourcis véhicule en haut et trois raccourcis d'apps en bas, accueil avec **Laura** et la carte.
- **Paramètres du véhicule** en tuiles et édition des favoris, **climatisation** (AUTO et son intensité, flux d'air, « Air frais », « Pieds chauds », « Mains chaudes »), **recharge** avec optimisation de la recharge rapide (capacité actuelle selon la température, chauffage de la batterie), lieux et réglages.
- Les commandes physiques sont une reconstitution (non vérifiées sur une source 2024).

Les deux interfaces partagent `src/brands/meb/` (plateforme MEB du groupe Volkswagen) : carte, médias, téléphone, courbe de charge, curseur tactile, écran conducteur, commandes vocales.

## Ce que contient Pleos

- **Écran central** (12,9″ ou 14,6″) :
  - zone de conduite et widgets utilitaires, barre d'état ;
  - politique de fenêtres Pleos : 1:1, 2:0, 3:0 caméra, échange et redimensionnement animés ;
  - zone de contrôle (GNB) : favoris modifiables par appui long, bibliothèque d'apps, apps récentes.
- **Panneaux** : climatisation, Paramètres du véhicule (20 catégories du manuel), notifications, profil, volume, recherche.
- **Apps** : Navigation, Bluetooth Audio, Radio, Appel/message, Gleo AI, Vue de la caméra, Rapport énergie, App Market, Manuel, projection, Bluelink.
- **Écran plat conducteur** avec widgets configurables.
- **Commandes physiques**, plus un **panneau de simulation** : contact, rapport, vitesse, batterie, clignotants, régulateur, borne de recharge, appel entrant, jour/nuit.

## Simulation de la charge

Chaque modèle déclare sa batterie, son autonomie par % et sa **courbe de charge rapide** (`VehicleSpec`). La puissance suit la courbe selon l'état de charge, la température de la batterie (froide = plus lent) et la puissance de la borne (50, 150 ou 350 kW) ; la charge CA suit le courant choisi. Repères : Ioniq 3 61 kWh, pic 110 kW, 10→80 % en ≈ 30 min (fiche Hyundai) ; Model 3 ≈ 75 kWh, pic 250 kW, 10→80 % en ≈ 27 min (relevés publics, estimation).

## Stack

| Rôle | Outil |
|---|---|
| Framework | Vue 3 (`<script setup>`, TypeScript) |
| Build | Vite |
| Style | Tailwind CSS 4, avec des jetons de thème sémantiques |
| État | Pinia |
| 3D (Tesla) | three.js, chargé avec l'interface Tesla uniquement |
| Routage | vue-router, en mode hash pour GitHub Pages |
| Tests | Vitest et jsdom |

```bash
npm install
npm run dev        # http://localhost:5173/#/pleos
npm test           # tests unitaires
npm run typecheck
npm run build      # produit dist/
npm run preview
```

Node 20.19 ou plus récent est requis.

## Architecture

```
src/
├─ core/                    # indépendant de toute marque
│  ├─ vehicle/              # véhicule simulé : types, store Pinia, simulation, données démo
│  ├─ bench/                # BenchShell (en-tête, vues, tailles) + SimulationPanel
│  │                        # (aussi : MapCanvas, la carte partagée, dans ui/)
│  ├─ ui/                   # Icon.vue + icons.ts (SVG 24×24), ScaledScreen.vue
│  ├─ composables/          # horloge, appui long, tick de simulation
│  ├─ brands.ts             # contrat BrandDefinition
│  └─ format.ts
├─ brands/
│  ├─ index.ts              # registre des marques
│  ├─ tesla/                # Model 3 : TeslaCockpit, store, components/, apps/, three/, theme.css
│  ├─ meb/                  # socle commun ID.3 / Enyaq (store, voix, composants partagés)
│  ├─ vw-id3/               # ID.3 : VwId3Cockpit, store, catalog, components/
│  ├─ skoda-enyaq/          # Enyaq : SkodaEnyaqCockpit, store, catalog, components/
│  └─ pleos/
│     ├─ index.ts           # BrandDefinition (tailles d'écran, cockpit chargé à la demande)
│     ├─ theme.css          # valeurs des jetons --ui-* jour / nuit
│     ├─ PleosCockpit.vue   # assemble écrans, commandes et événements
│     ├─ store/             # état propre à l'interface (fenêtres, panneaux, favoris…)
│     ├─ windows/policy.ts  # politique de fenêtres (fonctions pures, testées)
│     ├─ gleo/              # intentions de l'assistant vocal (testées)
│     ├─ components/        # ui/ (switch, slider…), screen/, overlays/, hardware/
│     ├─ apps/              # une app = un composant, déclaré dans registry.ts
│     └─ data/              # paramètres, manuel, recherche
├─ styles/main.css          # Tailwind, jetons sémantiques, transitions partagées
├─ HomePage.vue             # accueil : choix de la marque puis du modèle
├─ BrandHost.vue            # route #/:brand → cockpit de la marque
└─ router.ts
```

Trois principes :

- **Le véhicule est commun.** `useVehicleStore` simule vitesse, batterie, climatisation, médias, navigation, appels et carrosserie. Chaque interface lit ce store et agit dessus, sans dupliquer la logique.
- **Les couleurs passent par des jetons.** Les composants utilisent `bg-surface`, `text-ink-2`, `bg-accent`, etc. Ces classes pointent vers des variables `--ui-*` que chaque marque définit dans son `theme.css`. La variante `night:` cible le mode nuit.
- **Une marque est chargée à la demande.** Son code n'est téléchargé qu'à l'ouverture de `#/<id>`.

## Ajouter une marque

Le dépôt fournit deux skills Claude Code dans `.claude/skills/` : `car-model-research` (manuels, captures officielles, caractéristiques de recharge, fiche `docs/models/<id>.md`) et `add-car-model` (procédure complète, avec `scripts/new_brand.py` pour le squelette et `scripts/calibrate_curve.py` pour caler la courbe de charge). La procédure manuelle :


1. Créer `src/brands/<id>/theme.css` :

   ```css
   .tesla { --ui-bg: #fff; --ui-surface: #f4f4f4; --ui-ink: #111; --ui-accent: #3e6ae1; /* … */ }
   .tesla.night { --ui-bg: #000; /* … */ }
   ```

   La liste complète des jetons est dans `src/styles/main.css` (`@theme inline`).

2. Créer `src/brands/<id>/<Id>Cockpit.vue`. Ce composant :
   - utilise `BenchShell` avec les slots `driver`, `central`, `hardware` et `sim-events` ;
   - pose la classe racine de la marque (`class="tesla"`) ;
   - appelle `useSimulationClock()` ;
   - lit `useVehicleStore()`.

3. Créer `src/brands/<id>/index.ts` :

   ```ts
   import type { BrandDefinition } from '@/core/brands'
   export default {
     id: 'exemple',
     maker: 'Marque',
     system: 'Interface',
     model: 'Modèle',
     summary: '…',
     tagline: 'Accroche de la page d’accueil.',
     year: '2026',
     screenLabel: '15,4″',
     accent: '#3e6ae1',
     vehicle: { batteryKwh: 70, kmPerPercent: 5, acKw: 11, dcCurve: [[0, 100], [10, 150], [80, 60], [100, 5]] },
     driverDisplay: false,
     sizes: [{ id: '15.4', label: '15,4″', width: 1280, height: 800 }],
     defaultSize: '15.4',
     cockpit: () => import('./ExempleCockpit.vue'),
   } satisfies BrandDefinition
   ```

4. L'ajouter à `BRANDS` dans `src/brands/index.ts`. Le sélecteur de marque apparaît dans l'en-tête dès qu'il y en a deux.

Les composants de `brands/pleos/components/ui` servent de modèle, mais chaque marque garde les siens : les interfaces ont des gestes et des styles trop différents pour partager des widgets.

## Déploiement

Le workflow `.github/workflows/pages.yml` s'exécute à chaque push sur `main` :

1. `npm ci` ;
2. `npm test` ;
3. `npm run build` ;
4. publication de `dist/` sur GitHub Pages.

Dans les réglages du dépôt, choisir **Settings → Pages → Source : GitHub Actions**.

## Sources

- Manuel en ligne Pleos Connect (Ioniq 3, français) : ownersmanual.hyundai.com
- Guide de design Pleos Playground : document.pleos.ai (zones d'écran, politique de fenêtres, zone de contrôle, bibliothèque d'apps)
- Visuels de presse Hyundai Motor Group
- Manuel du conducteur du Model 3 (français, 2024+) : tesla.com/ownersmanual/model3
- Fiches techniques Hyundai et relevés publics (ev-database) pour la batterie et la courbe de charge
- Volkswagen Newsroom (communiqué 49/2024) et volkswagen.fr (fiche infodivertissement de l'ID.3)
- Škoda Storyboard (dossier de presse et infographies « Explore Enyaq 2024 »)
- Détail des sources par modèle : `docs/models/`
