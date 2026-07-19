# SHARED

## Rôle

Le dossier **shared** contient tous les éléments communs utilisés par plusieurs composants de la plateforme.

Il évite la duplication du code.

## Contenu

À terme, il contiendra notamment :

- Types communs
- Modèles de données
- Constantes
- Fonctions utilitaires
- Validation des données
- Gestion des erreurs
- Configuration commune

## Principe

Le code présent dans **shared** doit pouvoir être utilisé aussi bien par :

- le frontend ;
- le backend ;
- le moteur IA.

Il ne doit contenir aucune logique métier spécifique.

## Objectif

Centraliser tout ce qui est partagé afin de faciliter la maintenance et l'évolution de la plateforme.
