# TaPiecesAuto AI

# 06 — QUESTION SELECTION ALGORITHM

**Version :** 1.0
**Statut :** Spécification officielle

---

# 1. Objectif

Sélectionner la meilleure question à poser.

---

# 2. Critères

- Information Gain
- Sécurité
- Coût utilisateur
- Redondance
- Qualité des preuves
- Séparation des hypothèses

---

# 3. Questions interdites

Ne jamais :

- reposer une question déjà répondue
- poser une question inutile
- poser une question sans impact

---

# 4. Priorités

1. Sécurité
2. Information Gain
3. Réduction d'incertitude
4. Coût minimal

---

# 5. Résultat

Le moteur retourne :

- question choisie
- justification
- gain attendu

---

# 6. Règle absolue

Chaque question doit augmenter la qualité du diagnostic.
