# Liréo - Gestion de bibliothèque mobile

Ce dépôt héberge le projet "Liréo", réalisé dans le cadre de l’évaluation du module React Native du Mastère Développement Full-Stack 1re Année (Sup de Vinci) dirigé par Monsieur DESCHAMPS. L’application permet de gérer une bibliothèque personnelle depuis un terminal mobile avec synchronisation distante et mode dégradé hors ligne.

## Contexte pédagogique
- Sujet d’évaluation pour valider les compétences du cours sur React Native et l’écosystème Expo.
- Mise en situation professionnelle : conception d’une application React Native (front Expo / back REST distant).

## Aperçu fonctionnel
- Consultation d’une liste de livres avec recherche textuelle, filtres (lus, favoris, thème) et tri multi-critères.
- Création et édition de fiches de lecture (titre, auteur, éditeur, année, lecture, favori, note sur 5, visuel de couverture).
- Consultation détaillée avec gestion des favoris, notes personnelles, états de lecture et suppression.
- Tableau de bord statistiques (répartition lus/non lus/favoris, note moyenne).
- Récupération contextuelle du nombre d’éditions via l’API publique OpenLibrary.
- Mode hors ligne : lecture du cache local lorsque l’API n’est pas disponible et synchronisation lors du retour réseau.

## Architecture et choix techniques
- Expo Router pour une navigation stack basée sur la structure du dossier `app/`.
- Séparation claire entre UI (screens et components), logique métier (services) et stockage (AsyncStorage).
- Services TypeScript (`BooksService.ts`, `OpenLibraryService.ts`) centralisant les requêtes API, la construction d’URL et la gestion des erreurs.
- Cache local `AsyncStorage` (`OfflineStorage.ts`) pour gérer les données hors ligne et activer un mode dégradé clair pour l’utilisateur.
- Utilisation de `expo-network` pour détecter la connectivité au réseau.
- Composants réutilisables (`BookForm.tsx`) pour uniformiser les formulaires et limiter la duplication de la logique de validation.
- Visualisations de statistiques via des librairies de graphiques avec `react-native-chart-kit` et `react-native-svg`.

## Langages / outils / frameworks
- TypeScript
- Expo
- AsyncStorage pour le cache local
- Expo Image Picker pour la sélection de couverture
- React Native Chart Kit pour la visualisation des statistiques via des graphiques
- OpenLibrary API (consultation publique) et API Back-End DIstant (`https://api-books-kycs.onrender.com`) hébergée sur `https://render.com`.

## Prérequis
- Node.js
- npm
- Expo CLI (`npx expo`)
- Application Expo Go

## Installation
```bash
git clone https://github.com/nhumeau/eval-react-native
cd eval-react-native-nathan-humeau
npm install
```

## Démarrage
```bash
npx expo start
```
- Accès via le web sur l'URL : `http://localhost:8081`
- Scanner le QR code via l'application Expo Go pour un test sur mobile physique.

## Normes et bonnes pratiques adoptées
- Convention de nommage en anglais côté code.
- Gestion des effets via `useCallback`, `useMemo` et `useFocusEffect` pour optimiser les re-render et recharger les données au moment voulu.
- Retours utilisateur systématiques: loaders, bannière d'information, alertes, messages visuels sur les boutons.
- Architecture modulaire permettant de faire évoluer l'application (ajout d'autres modules ou services) sans refonte majeure.

---

Projet réalisé par Nathan HUMEAU dans le cadre du Mastère Développement Full-Stack 1ère Annee - Sup de Vinci.
