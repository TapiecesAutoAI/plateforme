# TaPiecesAuto AI

# 02 — RUNTIME MAP

**Version :** 1.0
**Statut :** Référence d'exécution
**Projet :** TaPiecesAuto AI
**Dernière mise à jour :** 30 juillet 2026

---

# 1. Objectif

Ce document décrit l'architecture réellement exécutée.

Il ne décrit pas l'architecture idéale.

Il décrit uniquement ce qui est utilisé aujourd'hui.

---

# 2. Vue générale

```text
Utilisateur
        │
        ▼
Page Next.js
        │
        ▼
Composant React
        │
        ▼
Route API
        │
        ▼
Moteur
        │
        ▼
Knowledge
        │
        ▼
Réponse@'
# TaPiecesAuto AI

# 02 — RUNTIME MAP

**Version :** 1.0
**Statut :** Référence d'exécution
**Projet :** TaPiecesAuto AI

---

# 1. Objectif

Décrire uniquement l'architecture réellement exécutée aujourd'hui.

---

# 2. Pages

| URL | Fichier | Statut |
|------|----------|---------|
| / | app/page.tsx | OK |
| /piece | app/piece/page.tsx | OK |
| /probleme | app/probleme/page.tsx | OK |
| /diagnostic-demo | app/diagnostic-demo/page.tsx | OK |
| /diagnostic-v2 | app/diagnostic-v2/page.tsx | OK |

---

# 3. API

## /api/chat

ChatInterface
→ /api/chat
→ lib/ai/chatEngine.ts
→ Conversation Engine
→ Knowledge
→ Réponse

Statut : Production.

---

## /api/diagnostic

Diagnostic Interface
→ /api/diagnostic
→ engine/core/DiagnosticEngine
→ KnowledgeLoader
→ Reasoning Engine
→ PartRecommendationEngine
→ SalesEngine

Statut : Nouvelle architecture.

---

# 4. Architecture actuelle

Production :

lib/ai/

Nouvelle génération :

engine/

---

# 5. Décision

Le moteur officiel devient progressivement :

engine/

Les nouvelles fonctionnalités sont développées uniquement dans engine/.

