# TaPiecesAuto AI

# 05 — REASONING ENGINE

**Version :** 1.0
**Statut :** Spécification officielle

---

# 1. Objectif

Transformer des preuves en diagnostic explicable.

---

# 2. Entrées

- Knowledge Pack
- DiagnosticSession
- Vehicle
- Evidences
- UserProfile

---

# 3. Sorties

- Hypothèses classées
- Confiance
- Question suivante
- Explication
- Recommandation

---

# 4. Étapes

1. Charger le Knowledge Pack
2. Lire les preuves
3. Appliquer les règles
4. Calculer les scores
5. Éliminer les hypothèses
6. Calculer la confiance
7. Choisir la meilleure action

---

# 5. Règles

Le moteur est déterministe.

Même entrée = même résultat.

---

# 6. Priorités

1. Sécurité
2. Contradictions
3. Qualité des preuves
4. Information Gain
5. Score

---

# 7. Arrêt

Le moteur s'arrête si :

- sécurité
- confiance suffisante
- aucune question utile
- intervention humaine

---

# 8. Règle absolue

Le moteur ne contient aucune connaissance automobile.

Toute connaissance provient des Knowledge Packs.
