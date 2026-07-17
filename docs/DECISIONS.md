# DECISIONS

## Décision 001
Titre : Séparer le moteur IA de l'interface

Décision
Le moteur d'intelligence artificielle sera développé indépendamment du site web.

Pourquoi ?
- Pouvoir utiliser le même moteur sur le site web.
- Pouvoir créer une application mobile sans tout refaire.
- Pouvoir créer une borne interactive.
- Pouvoir proposer une API à d'autres distributeurs.

Impact
Toute nouvelle fonctionnalité devra d'abord être développée dans le moteur IA avant d'être affichée sur le site.
