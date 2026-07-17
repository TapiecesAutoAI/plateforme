# CUSTOMER JOURNEY

## Question

Que vit le client depuis son arrivée sur la plateforme jusqu'à la récupération de sa pièce ?

## Objectif

Permettre à chaque utilisateur de trouver une pièce compatible rapidement, même s'il ne connaît pas sa référence.

La plateforme doit vendre une solution fiable, pas simplement afficher un catalogue.

---

## 1. Arrivée sur la plateforme

Le client arrive sur tapiecesauto.be.

Il voit immédiatement deux parcours.

### Parcours A — Je sais quelle pièce je cherche

Ce parcours est destiné aux utilisateurs qui connaissent déjà leur besoin.

Exemples :

* Filtre à huile
* Plaquettes de frein
* Alternateur
* Batterie
* Référence constructeur

Le client peut saisir :

* le nom de la pièce ;
* une référence ;
* son numéro de plaque ;
* son numéro VIN.

### Parcours B — J'ai un problème avec mon véhicule

Ce parcours est destiné aux utilisateurs qui ne savent pas exactement quelle pièce remplacer.

Exemples :

* La voiture ne démarre plus.
* Un voyant est allumé.
* Le véhicule fait un bruit au freinage.
* Le moteur manque de puissance.
* Une fuite est visible sous la voiture.

Le client commence une conversation avec l'assistant IA.

---

## 2. Identification du véhicule

Avant de recommander une pièce, la plateforme doit identifier précisément le véhicule.

Les méthodes possibles sont :

* numéro de plaque ;
* numéro VIN ;
* photographie du certificat d'immatriculation ;
* sélection manuelle de la marque, du modèle, de l'année et du moteur.

Les informations importantes sont :

* marque ;
* modèle ;
* année ;
* motorisation ;
* puissance ;
* carburant ;
* boîte de vitesses ;
* version ;
* numéro VIN.

Si les informations sont insuffisantes, la plateforme demande une précision.

---

## 3. Compréhension du besoin

L'assistant doit déterminer ce que le client cherche réellement.

Il distingue notamment :

* une recherche directe de pièce ;
* un problème mécanique ;
* une opération d'entretien ;
* une panne ;
* une demande de compatibilité ;
* une demande de prix ou de disponibilité.

L'assistant pose uniquement les questions nécessaires.

Il ne doit pas transformer la conversation en questionnaire inutile.

---

## 4. Analyse et niveau de confiance

L'assistant analyse les informations disponibles.

Il doit séparer clairement :

* les faits confirmés ;
* les hypothèses ;
* les informations manquantes ;
* les risques d'erreur.

La plateforme ne doit jamais présenter une hypothèse comme une certitude.

Un niveau de confiance peut être affiché :

* confiance élevée ;
* confiance moyenne ;
* vérification nécessaire.

Si le niveau de confiance est insuffisant, aucune recommandation définitive ne doit être faite.

---

## 5. Proposition de solution

La plateforme présente une solution compréhensible.

Elle peut inclure :

* la cause probable du problème ;
* les vérifications recommandées ;
* la pièce probablement nécessaire ;
* les pièces associées à contrôler ;
* les précautions à prendre.

La formulation doit rester simple et accessible.

L'assistant ne remplace pas un diagnostic mécanique physique lorsqu'une inspection est nécessaire.

---

## 6. Sélection des pièces

Les pièces proposées doivent être compatibles avec le véhicule identifié.

Chaque résultat affiche :

* le nom de la pièce ;
* la marque ;
* la référence ;
* le prix ;
* la disponibilité ;
* le délai ;
* le lieu de retrait ;
* le niveau de compatibilité ;
* la raison de la recommandation.

La plateforme peut proposer plusieurs niveaux :

* économique ;
* meilleur rapport qualité-prix ;
* premium.

La recommandation principale doit être justifiée.

---

## 7. Vérification avant réservation

Avant la confirmation, la plateforme récapitule :

* le véhicule ;
* la pièce sélectionnée ;
* la compatibilité ;
* la quantité ;
* le prix ;
* le magasin ;
* le délai de disponibilité.

Le client doit pouvoir corriger facilement une information.

Aucune réservation ne doit être confirmée tant qu'une ambiguïté importante subsiste.

---

## 8. Réservation

Le client réserve la pièce dans un magasin partenaire.

Il fournit uniquement les informations nécessaires :

* nom ;
* numéro de téléphone ;
* adresse e-mail si nécessaire.

Le client reçoit :

* un numéro de réservation ;
* l'adresse du magasin ;
* les horaires ;
* le prix confirmé ;
* le délai de retrait ;
* les instructions de récupération.

---

## 9. Retrait en magasin

Le magasin reçoit la réservation avec :

* l'identification du véhicule ;
* la pièce réservée ;
* les informations de compatibilité ;
* les coordonnées du client ;
* les éventuelles remarques de l'assistant.

Le vendeur peut effectuer une dernière vérification avant de remettre la pièce.

---

## 10. Après le retrait

La plateforme peut demander au client :

* si la pièce était correcte ;
* si le problème a été résolu ;
* si une assistance supplémentaire est nécessaire.

Ces informations servent à améliorer :

* la qualité des recommandations ;
* les règles de compatibilité ;
* l'expérience utilisateur ;
* le moteur IA.

---

## Principes obligatoires

1. Identifier le véhicule avant de recommander.
2. Ne jamais masquer une incertitude.
3. Poser le minimum de questions nécessaires.
4. Justifier chaque recommandation.
5. Vérifier la compatibilité avant la réservation.
6. Permettre une correction à chaque étape.
7. Privilégier la fiabilité à la vitesse.
8. Ne jamais pousser une vente lorsqu'une vérification mécanique est nécessaire.

---

## Critère de réussite

Le parcours est réussi lorsque le client peut répondre oui à ces trois questions :

1. La plateforme a-t-elle compris mon véhicule ?
2. Ai-je compris pourquoi cette pièce est proposée ?
3. Ai-je confiance dans sa compatibilité ?
