# ARCHITECTURE

## Question

Comment la plateforme TapiecesAuto est-elle construite ?

---

# Objectif

Construire une plateforme évolutive, modulaire et indépendante de l'interface utilisateur.

Chaque composant possède une responsabilité précise.

---

# Architecture générale

La plateforme est composée de cinq éléments principaux :

- Frontend
- Backend
- Moteur IA
- Base de données
- Services externes

---

# Frontend

Le Frontend est l'interface visible par le client.

Il permet :

- d'identifier le véhicule ;
- de rechercher une pièce ;
- de dialoguer avec l'assistant IA ;
- de consulter les résultats ;
- de réserver une pièce.

Le Frontend ne prend jamais de décision métier.

---

# Backend

Le Backend centralise les traitements.

Il gère :

- les utilisateurs ;
- les réservations ;
- les magasins ;
- les stocks ;
- les communications avec les autres services.

---

# Moteur IA

Le moteur IA analyse la demande.

Il est responsable de :

- comprendre le besoin du client ;
- identifier le véhicule ;
- déterminer les pièces compatibles ;
- expliquer son raisonnement ;
- calculer un niveau de confiance.

Le moteur IA reste indépendant du site web.

---

# Base de données

La base de données stocke :

- les véhicules ;
- les pièces ;
- les compatibilités ;
- les utilisateurs ;
- les réservations ;
- les historiques.

Elle ne prend aucune décision.

---

# Services externes

La plateforme pourra communiquer avec :

- TecDoc ;
- fournisseurs de données véhicules ;
- fournisseurs de stocks ;
- services de paiement ;
- services de messagerie.

---

# Principe fondamental

Chaque composant possède une seule responsabilité.

Les composants communiquent uniquement par des API.

Aucun composant ne doit dépendre directement d'un autre.

---

# Évolutions futures

L'architecture doit permettre d'ajouter facilement :

- une application mobile ;
- une borne interactive ;
- une API publique ;
- des partenaires distributeurs ;
- de nouveaux moteurs IA.

---

# Objectif final

Créer une plateforme capable d'évoluer pendant de nombreuses années sans devoir être reconstruite.
