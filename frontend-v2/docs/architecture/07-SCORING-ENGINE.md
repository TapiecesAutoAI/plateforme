# TaPiecesAuto AI

# 07 — SCORING ENGINE

**Version :** 1.0
**Statut :** Spécification officielle

---

# 1. Objectif

Attribuer un score à chaque hypothèse.

---

# 2. Sources du score

- poids initial
- preuves
- règles
- contradictions
- fiabilité
- tests

---

# 3. Facteurs

Le score augmente avec :

- preuves compatibles
- mesures fiables
- règles validées

Le score diminue avec :

- contradictions
- preuves incompatibles
- données invalides

---

# 4. Confiance

Le score ne représente pas la confiance.

La confiance dépend également :

- qualité des preuves
- quantité des preuves
- contradictions
- informations manquantes

---

# 5. Classement

Les hypothèses sont triées par score.

---

# 6. Règle absolue

Chaque variation de score doit être explicable.
