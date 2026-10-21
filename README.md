# Pleos Simulator

Simulateur web **non officiel** de l’interface Pleos Connect de la Hyundai Ioniq 3, pour tester les écrans et les menus dans un navigateur.

Site : https://nitocode.github.io/pleos-simulator/

## Contenu

- **Écran tactile central** (12,9″ ou 14,6″) : zone d’informations de conduite et widgets utilitaires, barre d’état, carte de base, apps en plein écran ou en écran partagé, zone de contrôle avec favoris, bibliothèque d’apps et apps récentes.
- **Panneau de climatisation**, **Paramètres du véhicule** (20 catégories), Radio, Bluetooth Audio, Appel/message, Vue de la caméra, Rapport énergie, Pleos App Market, Manuel.
- **Gleo AI** : commandes en texte libre (climatisation, navigation, appels, médias, questions sur le manuel).
- **Écran plat conducteur** avec widgets configurables.
- **Commandes physiques** et **panneau de simulation** : rapport, vitesse, clignotants, régulateur, recharge, appel entrant.

La structure suit le manuel en ligne Pleos Connect de l’Ioniq 3. Graphismes, données et textes d’aide sont des reconstitutions de démonstration. Projet sans lien avec Hyundai.

## Lancer en local

Fichier unique, sans build :

```bash
open index.html
```

## Déploiement

Chaque push sur `main` publie le site via le workflow `.github/workflows/pages.yml`.
Une seule fois : **Settings › Pages › Build and deployment › Source : GitHub Actions**.
