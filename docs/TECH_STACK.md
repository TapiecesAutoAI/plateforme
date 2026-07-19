# TECH STACK

## Question

Quelles technologies utilisons-nous pour construire TapiecesAuto ?

---

# Objectif

Choisir une stack moderne, fiable et suffisamment simple pour être gérée par une petite équipe.

Nous sommes actuellement deux sur le projet :

- le fondateur ;
- l'assistant IA chargé de l'architecture, du produit et de l'accompagnement technique.

La stack doit donc limiter la complexité inutile.

---

# Frontend

## Technologie

Next.js avec TypeScript.

## Rôle

Le frontend gère :

- la page d'accueil ;
- l'identification du véhicule ;
- la recherche de pièces ;
- la conversation avec l'assistant IA ;
- l'affichage des recommandations ;
- la réservation.

## Principe

Le frontend affiche les informations mais ne décide jamais seul de la compatibilité d'une pièce.

---

# Backend

## Technologie

FastAPI avec Python.

## Rôle

Le backend gère :

- les API ;
- les véhicules ;
- les pièces ;
- les compatibilités ;
- les magasins ;
- les stocks ;
- les réservations ;
- la communication avec le moteur IA.

## Principe

Le backend contient la logique métier principale.

---

# Moteur IA

## Technologie

Python.

## Rôle

Le moteur IA gère :

- la compréhension de la demande ;
- les questions complémentaires ;
- l'analyse du problème ;
- le niveau de confiance ;
- la justification des recommandations.

## Principe

Le moteur IA reste séparé du frontend et du backend.

Il communique avec les autres composants par API.

---

# Base de données

## Technologie

PostgreSQL.

## Rôle

La base de données stocke :

- les véhicules ;
- les pièces ;
- les compatibilités ;
- les magasins ;
- les stocks ;
- les utilisateurs ;
- les réservations ;
- les historiques de conversation.

---

# Environnement local

## Technologie

Docker Compose.

## Rôle

Docker Compose permettra de lancer ensemble :

- le frontend ;
- le backend ;
- le moteur IA ;
- la base de données.

Cela évitera les différences de configuration entre les ordinateurs et les futurs serveurs.

---

# Principes techniques

1. Commencer simplement.
2. Éviter les technologies inutiles.
3. Séparer clairement les responsabilités.
4. Utiliser des API entre les composants.
5. Ajouter de la complexité uniquement lorsqu'elle devient nécessaire.
6. Ne pas utiliser de microservices prématurément.

---

# Décision

La première version de TapiecesAuto utilisera :

- Next.js et TypeScript pour le frontend ;
- FastAPI et Python pour le backend ;
- Python pour le moteur IA ;
- PostgreSQL pour la base de données ;
- Docker Compose pour l'environnement local.

Cette décision pourra évoluer si les besoins réels du produit le justifient.
