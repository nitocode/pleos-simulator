---
name: car-model-research
description: Rassemble la documentation d'un modèle de voiture pour le simulateur (manuel d'utilisation, captures officielles de l'écran, caractéristiques de batterie et de recharge) et la consigne dans docs/models/<id>.md. À utiliser avant de créer ou d'améliorer une interface de marque, ou quand l'utilisateur demande « cherche le mode d'emploi / des captures / les specs » d'un véhicule.
---

# Recherche documentaire d'un modèle

Objectif : réunir des sources **officielles et vérifiables** pour reconstituer l'interface d'un véhicule, puis les consigner dans `docs/models/<id>.md` (modèle de fiche plus bas). Le code ne doit rien affirmer que cette fiche ne source pas ; ce qui est estimé est écrit comme tel.

## 1. Ordre des sources (de la plus fiable à la moins fiable)

1. **Manuel d'utilisation en ligne du constructeur** (texte + illustrations annotées).
2. **Dossiers et infographies de presse officiels** (newsroom, storyboard, press kits PDF).
3. **Pages modèle et « layers » du configurateur officiel** (photos de l'écran, textes d'équipement).
4. **Bases de données de caractéristiques** (ev-database.org) pour les courbes de charge réelles — toujours marquées « relevés publics, estimation ».
5. Jamais : PDF de manuels hébergés par des sites tiers, captures de forums, vidéos YouTube comme source unique. Ne télécharge aucun fichier d'un site tiers.

## 2. Méthodes qui fonctionnent (par constructeur)

Le navigateur intégré (`mcp__Claude_Browser__*`) lit les pages rendues en JavaScript ; `WebFetch` ne voit souvent qu'une coquille vide. Refuse les cookies non essentiels quand une bannière apparaît.

- **Hyundai (ownersmanual.hyundai.com)** : la page charge le manuel dans un iframe. Lire `document.querySelectorAll('iframe')[0].src` (ex. `.../ivi/Connect-S/AVNT/EUR/German/index.html`), ouvrir cette URL, puis récupérer les chapitres avec `fetch(href)` + `DOMParser` depuis la page (même origine). Les chapitres sont découpés en `001_Screencontrols_1.html`, `_2`, etc.
- **Tesla (tesla.com/ownersmanual/<modèle>/fr_fr/)** : le sommaire est dans les liens `GUID-….html`. Récupérer les pages par `fetch` dans la page. Les illustrations sont des `img` dont le `src` contient `-online-en-US.png` : les lister avec leur `alt`, puis ouvrir l'URL de l'image pour la regarder (les captures annotées de l'écran sont là).
- **Škoda (skoda-storyboard.com)** : chercher « Explore <Modèle> <année> infotainment ». Les infographies existent en JPG (`cdn.skoda-storyboard.com/...-1440x810.jpg`) et en PDF ; un PDF récupéré par `WebFetch` est enregistré dans `tool-results/` et se lit ensuite avec `Read` (le texte et l'image de la page sont rendus).
- **Volkswagen** : le manuel numérique officiel exige un VIN (inutilisable). Utiliser le communiqué du Newsroom (`volkswagen-newsroom.com/.../download` → PDF lisible avec `Read` comme ci-dessus) et les « layers » du configurateur `volkswagen.fr/fr/modeles-et-configurateur/<modèle>.html/__layer/layers/models/<id>/infodivertissement-2/master.layer` : la galerie contient des photos de l'écran ; les regarder en faisant défiler la page puis `computer zoom` sur l'écran.
- **Cas général** : `WebSearch` avec `allowed_domains` limité aux domaines du constructeur, puis navigateur. Pour une image : l'ouvrir et faire une capture/zoom ; ne pas la recopier dans le dépôt (droits d'auteur) — on la décrit dans la fiche et on redessine.

## 3. Ce qu'il faut relever

- **Écran** : taille, format, zones (barres haute/basse, accueil, menus), libellés exacts (en français si disponible), couleurs dominantes et accent, mode jour/nuit.
- **Interactions** : favoris/raccourcis, climatisation (où, quels préréglages), assistant vocal (nom, écran d'accueil), écran de recharge, changement de rapport, commandes physiques (curseurs, molettes, boutons au volant, sélecteur de rapport).
- **Écran conducteur** : existe-t-il, que montre-t-il.
- **Batterie et recharge** : capacité nette (kWh), autonomie WLTP, puissance CC max, durée 10→80 % (source + version/millésime), CA max. Si plusieurs versions : choisir une version de référence et la nommer.

## 4. Fiche `docs/models/<id>.md`

```markdown
# <Marque> <Modèle> (<millésime>) — <nom du système>

Version de référence : <finition, batterie>

## Sources
- [Titre](URL) — ce qu'on y a pris (date)

## Écran
- Taille / format :
- Barre supérieure :
- Barre inférieure :
- Accueil :
- Menus / apps (libellés) :
- Climatisation :
- Assistant vocal :
- Recharge :
- Couleurs :

## Commandes physiques et écran conducteur

## Batterie et recharge
| Donnée | Valeur | Source |
|---|---|---|

## Ce qui est estimé ou inventé
```

Termine en signalant à l'utilisateur ce qui n'a pas pu être vérifié.
