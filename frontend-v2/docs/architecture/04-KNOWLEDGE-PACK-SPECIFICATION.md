# TaPiecesAuto AI

# 04 — KNOWLEDGE PACK SPECIFICATION

**Version :** 1.0
**Statut :** Spécification officielle

---

# 1. Objectif

Un Knowledge Pack contient toutes les connaissances d'un domaine automobile.

Le moteur est totalement générique.

Toute connaissance métier appartient exclusivement au Knowledge Pack.

---

# 2. Structure officielle

```text
engine/
└── knowledge/
    └── <domain>/
        index.ts
        types.ts
        hypotheses.ts
        evidences.ts
        questions.ts
        rules.ts
        actions.ts
        workflow.ts
        parts.ts
        tests/
```

---

# 3. index.ts

Point d'entrée unique du domaine.

Exporte :
- types
- hypothèses
- preuves
- questions
- règles
- actions
- workflow
- pièces

---

# 4. types.ts

Déclare les types propres au domaine.

Aucune logique métier.

---

# 5. hypotheses.ts

Déclare toutes les hypothèses.

- id
- nom
- description
- gravité
- poids initial
- pièces possibles
- tests recommandés

---

# 6. evidences.ts

Déclare toutes les preuves.

- id
- type
- valeurs possibles
- fiabilité

---

# 7. questions.ts

Déclare toutes les questions.

- id
- texte
- objectif
- coût
- preuves générées
- hypothèses ciblées

---

# 8. rules.ts

Déclare toutes les règles.

- conditions
- actions
- priorité
- explication

---

# 9. actions.ts

Déclare les actions du moteur.

---

# 10. workflow.ts

Décrit le déroulement général.

Jamais un questionnaire fixe.

---

# 11. parts.ts

Déclare les familles de pièces.

Jamais les références constructeur.

---

# 12. Validation

Un Knowledge Pack est invalide si :
- identifiant dupliqué
- hypothèse orpheline
- preuve inexistante
- règle invalide
- question invalide
- pièce orpheline

---

# 13. Version

Chaque domaine possède sa propre version.

---

# 14. Règle absolue

Aucune connaissance automobile ne doit être codée dans le moteur.

Toute connaissance appartient exclusivement au Knowledge Pack.

---

# 15. Prochaine étape

05-REASONING-ENGINE.md
