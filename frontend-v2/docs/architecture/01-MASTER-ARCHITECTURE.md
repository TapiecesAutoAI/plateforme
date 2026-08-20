\# TaPiecesAuto AI



\## MASTER ARCHITECTURE DOCUMENT



\*\*Version :\*\* 0.1

\*\*Statut :\*\* Document fondateur

\*\*Projet :\*\* TaPiecesAuto AI

\*\*Architecture cible :\*\* Moteur expert automobile déterministe

\*\*Dernière mise à jour :\*\* 30 juillet 2026



\---



\# 1. Objet du document



Ce document constitue la référence architecturale officielle du projet TaPiecesAuto AI.



Il décrit :



\* la vision du produit ;

\* les principes fondamentaux ;

\* l’architecture technique ;

\* l’organisation du moteur de raisonnement ;

\* les responsabilités des différents composants ;

\* les décisions d’architecture ;

\* les règles de développement ;

\* les règles de migration de l’ancien système ;

\* les critères de qualité.



Toute évolution importante du projet doit respecter ce document ou faire l’objet d’une décision d’architecture formelle.



\---



\# 2. Vision



TaPiecesAuto AI n’est pas un simple chatbot.



TaPiecesAuto AI n’est pas un moteur de recherche généraliste.



TaPiecesAuto AI est un moteur de raisonnement automobile capable d’identifier la pièce probablement responsable d’un problème avec :



\* le minimum de questions ;

\* le niveau de confiance le plus élevé possible ;

\* le risque d’erreur le plus faible possible ;

\* une explication claire du raisonnement.



Le système doit reproduire et formaliser les meilleures pratiques de vendeurs expérimentés, de diagnosticiens automobiles et de techniciens.



Le moteur ne doit pas dépendre des intuitions variables d’un seul expert.



Il doit transformer l’expertise automobile en connaissances structurées, testables et reproductibles.



\---



\# 3. Objectif principal



> \*\*Identifier la bonne pièce avec le minimum de questions et le risque d’erreur le plus faible possible.\*\*



Chaque fonctionnalité doit être évaluée par rapport à cet objectif.



Une fonctionnalité qui ne contribue pas directement ou indirectement à cet objectif ne doit pas devenir prioritaire.



\---



\# 4. Priorités du projet



L’ordre de priorité officiel est :



1\. qualité du raisonnement ;

2\. sécurité de la recommandation ;

3\. exactitude de l’identification ;

4\. qualité des questions ;

5\. explicabilité ;

6\. couverture des scénarios ;

7\. maintenabilité ;

8\. expérience utilisateur ;

9\. esthétique de l’interface.



L’interface ne doit pas dicter l’architecture du moteur.



Le moteur doit pouvoir fonctionner indépendamment de l’interface graphique.



\---



\# 5. Principes fondamentaux



\## 5.1 Pas de remplacement au hasard



Le moteur ne doit jamais recommander une pièce uniquement parce qu’elle est souvent remplacée pour un symptôme donné.



Une recommandation doit être fondée sur :



\* les symptômes ;

\* les observations ;

\* les réponses de l’utilisateur ;

\* les tests disponibles ;

\* les contradictions ;

\* les relations entre les indices ;

\* la compatibilité avec le véhicule.



\---



\## 5.2 Une question doit avoir une utilité



Chaque question doit :



\* confirmer une hypothèse ;

\* éliminer une hypothèse ;

\* distinguer plusieurs hypothèses ;

\* détecter un risque ;

\* améliorer la confiance ;

\* déterminer la prochaine action.



Une question sans impact mesurable sur le raisonnement ne doit pas être posée.



\---



\## 5.3 Chaque réponse modifie le raisonnement



Une réponse utilisateur doit produire au moins l’une des conséquences suivantes :



\* ajout d’un indice ;

\* confirmation d’un indice ;

\* contradiction d’une hypothèse ;

\* augmentation d’un score ;

\* diminution d’un score ;

\* élimination d’une hypothèse ;

\* création d’une nouvelle hypothèse ;

\* déclenchement d’une action ;

\* arrêt sécurisé du diagnostic.



\---



\## 5.4 Le raisonnement doit être explicable



Pour chaque diagnostic, le moteur doit pouvoir expliquer :



\* les indices retenus ;

\* les hypothèses envisagées ;

\* les hypothèses éliminées ;

\* les contradictions rencontrées ;

\* les raisons du classement ;

\* la raison de la dernière question ;

\* la raison de la recommandation ;

\* les limites du diagnostic.



\---



\# 6. Séparation entre langage et raisonnement



Le système distingue strictement deux responsabilités.



\## 6.1 Compréhension du langage



Le système linguistique peut être utilisé pour :



\* comprendre une phrase libre ;

\* normaliser les expressions ;

\* reconnaître des synonymes ;

\* détecter des symptômes ;

\* identifier des observations ;

\* reformuler une question ;

\* adapter le langage au profil utilisateur.



\## 6.2 Raisonnement métier



Le système linguistique ne doit pas :



\* choisir seul une panne ;

\* inventer une hypothèse ;

\* modifier arbitrairement une probabilité ;

\* recommander seul une pièce ;

\* prendre une décision commerciale ;

\* ignorer une règle de sécurité.



Le raisonnement automobile appartient exclusivement au moteur métier déterministe.



\---



\# 7. Architecture générale cible



```text

Utilisateur

&#x20;   ↓

Interface Next.js

&#x20;   ↓

API TaPiecesAuto

&#x20;   ↓

Conversation Adapter

&#x20;   ↓

Diagnostic Engine

&#x20;   ├── Evidence Extractor

&#x20;   ├── Hypothesis Scorer

&#x20;   ├── Rule Engine

&#x20;   ├── Question Selector

&#x20;   ├── Confidence Calculator

&#x20;   ├── Action Selector

&#x20;   └── Explanation Builder

&#x20;   ↓

Knowledge Registry

&#x20;   ↓

Knowledge Packs automobiles

&#x20;   ↓

Part Recommendation Engine

&#x20;   ↓

Sales Engine

&#x20;   ↓

Réponse utilisateur

```



\---



\# 8. Architecture officielle du moteur



Le dossier cible principal est :



```text

engine/

```



Le dossier `engine` doit progressivement devenir le seul emplacement du moteur métier officiel.



Organisation actuelle identifiée :



```text

engine/

├── core/

├── demo/

├── knowledge/

├── parts/

├── profiles/

├── question-selector/

├── reasoning/

├── sales/

└── workflows/

```



Cette organisation constitue la base de l’architecture cible.



Elle pourra évoluer, mais aucune nouvelle génération parallèle du moteur ne devra être créée.



\---



\# 9. Responsabilités des composants



\## 9.1 Core Engine



Le Core Engine orchestre une session de diagnostic.



Responsabilités :



\* créer une session ;

\* charger un workflow ;

\* conserver l’état ;

\* exécuter les étapes ;

\* transmettre les preuves ;

\* demander une décision au moteur de raisonnement ;

\* retourner la prochaine action.



Le Core Engine ne doit pas contenir de connaissances spécifiques à une panne automobile.



\---



\## 9.2 Knowledge Engine



Le Knowledge Engine charge et valide les connaissances automobiles.



Responsabilités :



\* enregistrer les domaines ;

\* charger les hypothèses ;

\* charger les preuves ;

\* charger les règles ;

\* charger les questions ;

\* charger les pièces ;

\* vérifier la cohérence des données ;

\* gérer les versions.



Le Knowledge Engine ne doit pas gérer directement l’interface utilisateur.



\---



\## 9.3 Evidence Extractor



L’Evidence Extractor transforme les informations utilisateur en preuves structurées.



Exemple :



```text

Phrase utilisateur :

« Le voyant batterie reste allumé lorsque le moteur tourne. »



Preuve structurée :

battery\_warning\_light\_engine\_running = true

```



Il ne doit pas établir seul le diagnostic final.



\---



\## 9.4 Hypothesis Scorer



Le Hypothesis Scorer calcule le score des hypothèses.



Il prend en compte :



\* les preuves positives ;

\* les preuves négatives ;

\* les contradictions ;

\* les exclusions ;

\* la force des relations ;

\* les tests réalisés ;

\* la fiabilité de la réponse ;

\* les dépendances entre indices.



\---



\## 9.5 Rule Engine



Le Rule Engine applique les règles métier.



Exemples :



\* une courroie absente rend l’alternateur incapable de charger ;

\* une tension moteur tournant proche de 12 volts indique une charge insuffisante ;

\* une batterie neuve qui se vide peut orienter vers un défaut de charge ou une consommation parasite ;

\* certaines contradictions doivent bloquer une vente immédiate.



\---



\## 9.6 Question Selector



Le Question Selector choisit la meilleure question suivante.



Il ne doit pas simplement sélectionner la première question disponible.



La question doit être évaluée selon :



\* sa capacité à différencier les hypothèses ;

\* la réduction attendue de l’incertitude ;

\* son coût pour l’utilisateur ;

\* sa difficulté ;

\* sa pertinence ;

\* sa sécurité ;

\* les informations déjà connues ;

\* le profil utilisateur.



\---



\## 9.7 Confidence Calculator



Le Confidence Calculator produit un niveau de confiance.



La confiance ne doit pas être une simple transformation esthétique du score.



Elle doit tenir compte :



\* du nombre de preuves ;

\* de la qualité des preuves ;

\* des contradictions ;

\* de la différence entre les premières hypothèses ;

\* des données manquantes ;

\* de la fiabilité des réponses ;

\* de la possibilité de confirmer par un test.



\---



\## 9.8 Part Recommendation Engine



Le Part Recommendation Engine transforme une hypothèse suffisamment fiable en recommandation de pièce.



Il doit distinguer :



\* la pièce principale ;

\* les pièces secondaires ;

\* les kits ;

\* les accessoires ;

\* les consommables ;

\* les éléments à contrôler ;

\* les éléments qui ne doivent pas encore être vendus.



\---



\## 9.9 Sales Engine



Le Sales Engine détermine l’action commerciale sûre.



Décisions possibles :



```text

SELL

VERIFY

CONTINUE\_DIAGNOSIS

REQUEST\_TEST

REFER\_TO\_GARAGE

DO\_NOT\_SELL

SAFETY\_STOP

```



Le moteur de vente ne doit pas chercher uniquement à maximiser la vente.



Il doit minimiser :



\* les erreurs de pièce ;

\* les retours ;

\* les réclamations ;

\* les diagnostics dangereux ;

\* les dépenses inutiles du client.



\---



\## 9.10 Explanation Engine



L’Explanation Engine produit une explication compréhensible.



Il peut adapter la formulation selon le profil :



\* particulier ;

\* bricoleur ;

\* vendeur ;

\* garage ;

\* dépanneur ;

\* étudiant ;

\* professionnel.



Le contenu technique du raisonnement doit rester identique.



\---



\# 10. Domaines automobiles



Le moteur sera développé domaine par domaine.



Premiers domaines prioritaires :



```text

Starting

Battery

Charging

Alternator

Starter

```



Domaines futurs :



```text

Fuel

Ignition

Cooling

Engine

Turbo

Exhaust

Sensors

Transmission

Clutch

CV Joint

Wheel Bearing

Brake

ABS

Steering

Suspension

Lighting

Electrical

Air Conditioning

Body

```



Chaque domaine doit utiliser la même structure conceptuelle.



\---



\# 11. Structure d’un Knowledge Pack



Chaque domaine doit pouvoir fournir :



```text

hypotheses

evidences

questions

rules

actions

parts

workflow

tests

metadata

```



Structure cible :



```text

engine/knowledge/<domain>/

├── actions.ts

├── evidences.ts

├── hypotheses.ts

├── questions.ts

├── rules.ts

├── parts.ts

├── workflow.ts

├── types.ts

├── index.ts

└── tests/

```



Les domaines ne doivent pas dupliquer le moteur de raisonnement.



Ils doivent uniquement fournir les connaissances nécessaires au moteur générique.



\---



\# 12. État actuel du projet



L’inventaire du 30 juillet 2026 montre plusieurs architectures parallèles.



\## Architecture récente



```text

engine/

```



Cette architecture est retenue comme base du futur moteur officiel.



\## Architectures anciennes ou intermédiaires



```text

lib/ai/

lib/ai/V2/

lib/ai/workflows/

lib/ai/knowledge/

knowledge/

```



Ces dossiers contiennent des travaux utiles, mais leurs responsabilités se chevauchent.



Ils sont désormais classés provisoirement comme :



```text

LEGACY

MIGRATION\_REQUIRED

DO\_NOT\_EXTEND

```



Cela ne signifie pas qu’ils doivent être supprimés immédiatement.



Ils doivent d’abord être :



1\. analysés ;

2\. reliés aux routes réellement utilisées ;

3\. comparés au moteur `engine` ;

4\. migrés si nécessaire ;

5\. couverts par des tests ;

6\. désactivés ;

7\. supprimés uniquement après validation.



\---



\# 13. Risques architecturaux actuels



\## 13.1 Plusieurs moteurs concurrents



Le projet contient plusieurs implémentations de :



\* moteurs de conversation ;

\* moteurs de questions ;

\* moteurs de workflows ;

\* moteurs de scoring ;

\* modèles de données ;

\* bases de connaissances.



Risque :



Une correction peut être effectuée dans un fichier qui n’est pas utilisé par l’application réelle.



\---



\## 13.2 Sélecteurs de questions multiples



Les fichiers suivants semblent couvrir des responsabilités proches :



```text

engine/question-selector/QuestionSelectorV2.ts

engine/question-selector/QuestionSelectorV3.ts

engine/reasoning/QuestionSelector.ts

lib/ai/questionEngine.ts

lib/ai/V2/questionRegistry.ts

```



Une implémentation officielle devra être désignée après analyse des imports et des tests.



\---



\## 13.3 Workflows dupliqués



Plusieurs workflows de démarrage existent :



```text

engine/workflows/starting/

knowledge/starting/

lib/ai/workflows/

lib/ai/V2/workflows/

```



Ils peuvent produire des comportements différents pour le même scénario.



\---



\## 13.4 Modèles de données multiples



Plusieurs fichiers définissent potentiellement des types proches :



```text

engine/core/sessionTypes.ts

engine/core/workflowTypes.ts

engine/knowledge/knowledgeTypes.ts

engine/knowledge/charging/types.ts

engine/knowledge/charging/reasoningTypes.ts

engine/sales/salesTypes.ts

lib/ai/types.ts

lib/ai/diagnostic/types.ts

lib/ai/knowledge/types.ts

lib/ai/language/types.ts

lib/ai/V2/types.ts

lib/ai/workflows/workflowTypes.ts

```



Une cartographie précise devra être réalisée avant toute fusion.



\---



\# 14. Décision architecturale principale



\## ADR-001 — Le dossier `engine` devient le moteur métier officiel



\*\*Statut :\*\* Accepté

\*\*Date :\*\* 30 juillet 2026



\### Contexte



Le projet contient plusieurs générations du moteur automobile.



Cette duplication crée :



\* des ambiguïtés ;

\* des risques de divergence ;

\* des difficultés de maintenance ;

\* des corrections appliquées au mauvais moteur ;

\* des tests qui ne couvrent pas nécessairement le moteur utilisé.



\### Décision



Le dossier :



```text

engine/

```



devient la base officielle du futur moteur métier.



\### Conséquences



\* aucun nouveau moteur parallèle ne doit être créé ;

\* les nouvelles fonctionnalités métier doivent cibler `engine` ;

\* les anciens composants doivent être analysés avant migration ;

\* les routes API doivent progressivement utiliser le moteur officiel ;

\* les anciens fichiers ne doivent pas être supprimés sans tests de non-régression.



\---



\# 15. Décision sur le LLM



\## ADR-002 — Le LLM ne prend pas les décisions métier



\*\*Statut :\*\* Accepté



Le LLM peut comprendre et reformuler le langage.



Le LLM ne doit pas décider seul :



\* de la panne ;

\* de la probabilité ;

\* de la pièce ;

\* de la vente ;

\* de la sécurité.



Toutes les décisions métier doivent être issues du moteur déterministe.



\---



\# 16. Décision sur les domaines



\## ADR-003 — Les connaissances sont séparées du moteur



\*\*Statut :\*\* Accepté



Le moteur de raisonnement doit rester générique.



Les connaissances spécifiques doivent être contenues dans des Knowledge Packs.



Le moteur ne doit pas contenir directement des conditions comme :



```text

if alternator...

if battery...

if starter...

```



Ces connaissances doivent être décrites par :



\* des hypothèses ;

\* des preuves ;

\* des règles ;

\* des relations ;

\* des actions ;

\* des workflows.



\---



\# 17. Règles de développement



Le développement suit obligatoirement ce cycle :



```text

1\. Analyse

2\. Un fichier complet

3\. Build

4\. Tests

5\. Correction

6\. Validation

7\. Fichier suivant

```



Aucun chantier massif ne doit modifier simultanément une grande quantité de fichiers sans nécessité.



Pour chaque étape, les instructions doivent être adaptées à un utilisateur non-développeur :



\* chemin exact ;

\* fichier complet ;

\* commande PowerShell prête à copier ;

\* commande de build ;

\* commande de test ;

\* résultat attendu ;

\* aucune recherche manuelle inutile.



\---



\# 18. Règles TypeScript



Les règles cibles sont :



\* éviter `any` ;

\* utiliser des types explicites ;

\* limiter les conversions forcées ;

\* favoriser les fonctions pures ;

\* éviter les effets de bord ;

\* éviter les dépendances circulaires ;

\* une responsabilité principale par module ;

\* aucune connaissance métier dans les composants React ;

\* aucune logique commerciale dans les routes API ;

\* aucune dépendance du moteur envers Next.js ;

\* validation systématique des données externes.



\---



\# 19. Règles de test



Chaque domaine doit être testé avec :



\* cas nominal ;

\* variantes linguistiques ;

\* preuves positives ;

\* preuves négatives ;

\* contradictions ;

\* réponses inconnues ;

\* données insuffisantes ;

\* scénarios dangereux ;

\* erreurs utilisateur ;

\* cas proches entre plusieurs hypothèses ;

\* recommandation de vente ;

\* refus de vente.



Les tests doivent vérifier non seulement le diagnostic final, mais également :



\* l’ordre des questions ;

\* les hypothèses intermédiaires ;

\* les scores ;

\* les contradictions ;

\* la confiance ;

\* la décision commerciale ;

\* l’explication.



\---



\# 20. Critères de réussite



Le projet ne sera pas jugé uniquement sur le nombre de domaines disponibles.



Les indicateurs principaux seront :



```text

Taux de bonne identification

Taux de mauvaise recommandation

Nombre moyen de questions

Taux de diagnostics insuffisants

Taux de contradictions détectées

Taux de ventes bloquées correctement

Taux de scénarios reproductibles

Taux de couverture des tests

```



La réduction du nombre de questions ne doit jamais détériorer la sécurité du diagnostic.



\---



\# 21. Prochaine étape officielle



La prochaine étape consiste à cartographier les chemins d’exécution réels.



Nous devons déterminer :



1\. quelle route API est utilisée par chaque interface ;

2\. quel moteur est importé par chaque route ;

3\. quels fichiers sont réellement exécutés ;

4\. quels moteurs sont uniquement expérimentaux ;

5\. quelles parties de `lib/ai` doivent être migrées ;

6\. quels tests couvrent `engine` ;

7\. quel Question Selector doit devenir officiel.



Cette cartographie sera documentée dans :



```text

docs/architecture/01-RUNTIME-MAP.md

```



\---



\# 22. Règle absolue



> Une seule architecture officielle.



Les expériences sont autorisées dans des branches ou des modules explicitement identifiés.



Elles ne doivent pas créer une nouvelle architecture parallèle dans le projet principal.



