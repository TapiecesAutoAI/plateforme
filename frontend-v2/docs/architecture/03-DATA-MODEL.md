# TaPiecesAuto AI

# 03 — DATA MODEL

**Version :** 1.0  
**Statut :** Spécification fondatrice  
**Projet :** TaPiecesAuto AI  
**Dernière mise à jour :** 30 juillet 2026  

---

# 1. Objet du document

Ce document définit le modèle métier officiel de TaPiecesAuto AI.

Il fixe le vocabulaire commun utilisé par :

- le moteur de diagnostic ;
- le moteur de raisonnement ;
- les Knowledge Packs ;
- le moteur de questions ;
- le moteur de scoring ;
- le moteur de recommandation ;
- le moteur commercial ;
- les routes API ;
- les interfaces utilisateur ;
- les tests automatisés.

L’objectif est d’éviter plusieurs définitions concurrentes pour un même concept.

À terme, chaque type TypeScript métier devra découler de ce document.

---

# 2. Principes du modèle de données

Le modèle doit être :

- déterministe ;
- explicable ;
- strictement typé ;
- indépendant de Next.js ;
- indépendant de l’interface utilisateur ;
- indépendant d’un domaine automobile particulier ;
- extensible ;
- testable ;
- sérialisable ;
- versionnable.

Les objets métier ne doivent pas contenir directement de logique d’affichage.

Les Knowledge Packs contiennent les connaissances automobiles.

Le moteur générique interprète ces connaissances.

---

# 3. Catégories de données

## 3.1 Données de référence

Données relativement stables :

- domaines ;
- hypothèses ;
- preuves possibles ;
- questions ;
- règles ;
- pièces ;
- actions ;
- workflows ;
- profils utilisateurs.

## 3.2 Données de session

Données créées pendant une conversation :

- véhicule ;
- problème principal ;
- réponses ;
- preuves observées ;
- hypothèses scorées ;
- questions posées ;
- décisions ;
- recommandations.

## 3.3 Données calculées

Données produites par le moteur :

- score ;
- probabilité ;
- confiance ;
- gain d’information ;
- niveau de risque ;
- classement ;
- décision commerciale.

## 3.4 Données linguistiques

Données utilisées pour comprendre l’utilisateur :

- synonymes ;
- expressions ;
- négations ;
- intensités ;
- unités ;
- variantes régionales ;
- formulations adaptées aux profils.

## 3.5 Données d’audit

Données permettant de reconstruire le raisonnement :

- règles appliquées ;
- changements de score ;
- preuves utilisées ;
- contradictions ;
- questions sélectionnées ;
- décisions prises ;
- version du Knowledge Pack ;
- version du moteur.

---

# 4. Identifiants métier

Tous les objets importants possèdent un identifiant stable.

Exemples :

```text
domain.starting
hypothesis.battery.discharged
evidence.engine.cranks_slowly
question.battery.headlights_strength
part.battery
rule.charging.low_voltage
action.request_voltage_test
```

Un identifiant :

- ne dépend pas du texte affiché ;
- ne contient pas d’accent ;
- n’est pas traduit ;
- n’est jamais réutilisé pour un autre concept ;
- reste stable entre les versions.

Convention recommandée :

```text
category.domain.concept
```

---

# 5. Valeurs fondamentales

## 5.1 Confidence

La confiance représente la solidité d’une conclusion.

```typescript
type Confidence = number;
```

Plage officielle :

```text
0 à 100
```

Interprétation indicative :

```text
0–24   : très faible
25–49  : faible
50–69  : moyenne
70–84  : élevée
85–94  : très élevée
95–100 : quasi certaine
```

La confiance dépend notamment :

- de la qualité des preuves ;
- du nombre de contradictions ;
- de la séparation entre les hypothèses ;
- des données manquantes ;
- de la fiabilité des réponses ;
- de la possibilité d’un test confirmatoire.

## 5.2 Score

Le score est une valeur interne utilisée pour classer les hypothèses.

```typescript
type HypothesisScore = number;
```

Il peut être positif ou négatif.

Il ne doit pas être affiché directement comme une probabilité.

## 5.3 Probability

```typescript
type Probability = number;
```

Plage :

```text
0 à 1
```

Exemple :

```text
0.82 = 82 %
```

## 5.4 Reliability

```typescript
type Reliability = number;
```

Plage :

```text
0 à 1
```

Exemples :

```text
Mesure multimètre : 0.95
Observation visuelle claire : 0.85
Souvenir utilisateur : 0.60
Supposition utilisateur : 0.35
```

## 5.5 Severity

```typescript
type Severity =
  | "info"
  | "low"
  | "medium"
  | "high"
  | "critical";
```

La gravité ne représente pas la probabilité.

---

# 6. Domain

Un Domain représente un domaine fonctionnel automobile.

```typescript
type DomainId = string;

type DomainStatus =
  | "draft"
  | "experimental"
  | "validated"
  | "production"
  | "deprecated";

interface DiagnosticDomain {
  id: DomainId;
  name: string;
  description: string;
  version: string;
  status: DomainStatus;
  parentDomainId?: DomainId;
  relatedDomainIds: DomainId[];
  supportedVehicleTypes: VehicleType[];
  defaultWorkflowId: WorkflowId;
  metadata?: Record<string, unknown>;
}
```

---

# 7. Vehicle

Vehicle représente le véhicule concerné par le diagnostic.

```typescript
interface Vehicle {
  id?: string;
  vin?: string;

  make?: string;
  model?: string;
  generation?: string;
  variant?: string;

  registrationYear?: number;
  productionYear?: number;

  engineCode?: string;
  engineName?: string;
  displacementCc?: number;
  powerKw?: number;
  powerHp?: number;

  fuelType?: FuelType;
  transmissionType?: TransmissionType;
  driveType?: DriveType;

  mileageKm?: number;
  bodyType?: string;
  vehicleType?: VehicleType;

  registrationCountry?: string;
  equipmentCodes?: string[];

  identificationConfidence: Confidence;
  dataSources: VehicleDataSource[];
}
```

```typescript
type VehicleType =
  | "car"
  | "van"
  | "truck"
  | "motorcycle"
  | "other";

type FuelType =
  | "petrol"
  | "diesel"
  | "hybrid"
  | "plug_in_hybrid"
  | "electric"
  | "lpg"
  | "cng"
  | "hydrogen"
  | "other"
  | "unknown";

type TransmissionType =
  | "manual"
  | "automatic"
  | "robotized"
  | "cvt"
  | "dual_clutch"
  | "unknown";

type DriveType =
  | "front_wheel_drive"
  | "rear_wheel_drive"
  | "all_wheel_drive"
  | "four_wheel_drive"
  | "unknown";

type VehicleDataSource =
  | "user"
  | "vin"
  | "registration"
  | "catalog"
  | "manual"
  | "inferred";
```

Règle :

> Le diagnostic fonctionnel et la compatibilité exacte de la pièce sont deux étapes distinctes.

---

# 8. User Profile

Le profil adapte la communication sans modifier la vérité technique.

```typescript
type UserProfileId =
  | "particulier"
  | "bricoleur"
  | "vendeur-pieces-auto"
  | "mecanicien-garage"
  | "depanneur"
  | "etudiant-mecanique"
  | "autre-professionnel";

interface UserProfile {
  id: UserProfileId;
  label: string;

  technicalLevel:
    | "beginner"
    | "intermediate"
    | "advanced"
    | "expert";

  preferredVocabulary:
    | "simple"
    | "standard"
    | "technical";

  canPerformBasicChecks: boolean;
  canUseMultimeter: boolean;
  canAccessVehicleComponents: boolean;
  canInterpretTechnicalValues: boolean;

  questionStyle:
    | "guided"
    | "balanced"
    | "direct";
}
```

Le profil ne modifie jamais :

- les scores ;
- les règles ;
- la sécurité ;
- la probabilité ;
- la pièce réellement recommandée.

---

# 9. Chief Complaint

Le Chief Complaint représente le problème principal exprimé par l’utilisateur.

```typescript
interface ChiefComplaint {
  rawText: string;
  normalizedText: string;

  detectedDomainIds: DomainId[];

  primarySymptomIds: SymptomId[];
  secondarySymptomIds: SymptomId[];

  detectedVehicleState?: VehicleState;

  language: string;
  extractionConfidence: Confidence;

  createdAt: string;
}
```

---

# 10. Symptom

```typescript
type SymptomId = string;

interface SymptomDefinition {
  id: SymptomId;
  domainId: DomainId;

  name: string;
  description: string;

  synonyms: string[];
  examplePhrases: string[];

  severity: Severity;

  compatibleVehicleStates: VehicleState[];

  relatedEvidenceIds: EvidenceId[];

  metadata?: Record<string, unknown>;
}
```

Un symptôme n’est pas une preuve confirmée tant qu’il n’a pas été interprété et enregistré dans la session.

---

# 11. Observation

```typescript
type ObservationId = string;

interface Observation {
  id: ObservationId;

  source:
    | "user_statement"
    | "question_answer"
    | "visual_check"
    | "sound"
    | "smell"
    | "measurement"
    | "vehicle_system"
    | "external_data";

  rawValue: unknown;
  normalizedValue: EvidenceValue;

  reliability: Reliability;

  timestamp: string;

  relatedQuestionId?: QuestionId;
  relatedEvidenceId?: EvidenceId;

  notes?: string;
}
```

---

# 12. Evidence Definition

```typescript
type EvidenceId = string;

interface EvidenceDefinition {
  id: EvidenceId;
  domainId: DomainId;

  name: string;
  description: string;

  valueType: EvidenceValueType;
  allowedValues?: EvidenceValue[];

  defaultReliability: Reliability;

  sourceTypes: EvidenceSourceType[];

  relatedHypothesisIds: HypothesisId[];

  contradictionGroupId?: string;
  unit?: string;

  metadata?: Record<string, unknown>;
}
```

```typescript
type EvidenceValueType =
  | "boolean"
  | "number"
  | "string"
  | "enum"
  | "range"
  | "unknown";
```

---

# 13. Evidence Instance

```typescript
interface Evidence {
  id: EvidenceId;

  value: EvidenceValue;

  status:
    | "confirmed"
    | "rejected"
    | "unknown"
    | "uncertain";

  reliability: Reliability;

  source: EvidenceSourceType;

  observationId?: ObservationId;
  questionId?: QuestionId;

  createdAt: string;
  updatedAt?: string;
}
```

```typescript
type EvidenceValue =
  | boolean
  | number
  | string
  | null
  | {
      min?: number;
      max?: number;
      unit?: string;
    };

type EvidenceSourceType =
  | "initial_message"
  | "user_answer"
  | "manual_test"
  | "automatic_test"
  | "vehicle_data"
  | "inference"
  | "external_catalog";
```

Règle :

> Une inférence ne doit jamais être présentée comme une observation directe.

---

# 14. Hypothesis Definition

```typescript
type HypothesisId = string;

interface HypothesisDefinition {
  id: HypothesisId;
  domainId: DomainId;

  name: string;
  description: string;

  severity: Severity;
  baseWeight: number;

  supportingEvidence: EvidenceImpact[];
  contradictingEvidence: EvidenceImpact[];
  excludingEvidence: EvidenceImpact[];

  requiredEvidenceIds?: EvidenceId[];

  recommendedTestIds?: TestId[];

  possiblePartIds?: PartId[];

  safetyFlags?: SafetyFlag[];

  metadata?: Record<string, unknown>;
}
```

---

# 15. Evidence Impact

```typescript
interface EvidenceImpact {
  evidenceId: EvidenceId;

  expectedValue?: EvidenceValue;

  impact: number;

  relationship:
    | "supports"
    | "contradicts"
    | "excludes"
    | "required"
    | "neutral";

  explanation: string;

  reliabilityMultiplier?: number;
}
```

---

# 16. Scored Hypothesis

```typescript
interface ScoredHypothesis {
  hypothesisId: HypothesisId;

  score: HypothesisScore;
  probability?: Probability;
  confidence: Confidence;

  rank: number;

  status:
    | "candidate"
    | "leading"
    | "confirmed"
    | "weakened"
    | "excluded"
    | "unresolved";

  supportingEvidenceIds: EvidenceId[];
  contradictingEvidenceIds: EvidenceId[];
  missingEvidenceIds: EvidenceId[];

  appliedRuleIds: RuleId[];

  scoreBreakdown: ScoreContribution[];

  explanation: string;
}
```

---

# 17. Score Contribution

```typescript
interface ScoreContribution {
  sourceType:
    | "base_weight"
    | "evidence"
    | "rule"
    | "contradiction"
    | "missing_data"
    | "safety"
    | "test";

  sourceId: string;

  value: number;
  reliabilityMultiplier: number;
  finalContribution: number;

  explanation: string;
}
```

---

# 18. Contradiction

```typescript
interface Contradiction {
  id: string;

  evidenceIds: EvidenceId[];

  affectedHypothesisIds: HypothesisId[];

  severity:
    | "minor"
    | "moderate"
    | "major"
    | "blocking";

  resolutionStatus:
    | "unresolved"
    | "clarified"
    | "accepted"
    | "invalidated";

  explanation: string;
  createdAt: string;
}
```

Une contradiction majeure doit provoquer une clarification ou bloquer la conclusion.

---

# 19. Question Definition

```typescript
type QuestionId = string;

interface QuestionDefinition {
  id: QuestionId;
  domainId: DomainId;

  text: string;
  purpose: string;

  answerType:
    | "single_choice"
    | "multiple_choice"
    | "boolean"
    | "number"
    | "text"
    | "measurement";

  options?: QuestionOption[];

  targetHypothesisIds: HypothesisId[];
  targetEvidenceIds: EvidenceId[];

  prerequisiteEvidenceIds?: EvidenceId[];
  forbiddenEvidenceIds?: EvidenceId[];

  cost: QuestionCost;

  safetyPriority?: number;

  profileVariants?: Partial<
    Record<UserProfileId, string>
  >;

  metadata?: Record<string, unknown>;
}
```

---

# 20. Question Option

```typescript
interface QuestionOption {
  id: string;
  label: string;
  value: EvidenceValue;

  resultingEvidence: EvidenceMutation[];

  explanation?: string;
}

interface EvidenceMutation {
  evidenceId: EvidenceId;
  value: EvidenceValue;

  status:
    | "confirmed"
    | "rejected"
    | "unknown"
    | "uncertain";

  reliability?: Reliability;
}
```

---

# 21. Question Cost

```typescript
interface QuestionCost {
  cognitive: number;
  physical: number;
  time: number;
  equipment: number;
  risk: number;
}
```

Plage recommandée :

```text
0 à 10
```

---

# 22. Information Gain

```typescript
interface InformationGain {
  questionId: QuestionId;

  expectedValue: number;

  hypothesisSeparation: number;
  uncertaintyReduction: number;
  safetyValue: number;
  evidenceCoverage: number;

  userCostPenalty: number;
  redundancyPenalty: number;

  finalUtility: number;
}
```

Formule conceptuelle :

```text
Utilité finale =
réduction d’incertitude
+ séparation des hypothèses
+ valeur de sécurité
+ couverture de preuves
- coût utilisateur
- redondance
```

Le moteur choisit la meilleure utilité globale, pas seulement le gain statistique brut.

---

# 23. Asked Question

```typescript
interface AskedQuestion {
  questionId: QuestionId;

  displayedText: string;

  askedAt: string;

  selectedBecause: string;

  expectedInformationGain: number;

  answer?: Answer;

  status:
    | "asked"
    | "answered"
    | "skipped"
    | "expired";
}
```

---

# 24. Answer

```typescript
interface Answer {
  questionId: QuestionId;

  rawText?: string;

  selectedOptionIds?: string[];

  normalizedValue?: EvidenceValue;

  confidence: Confidence;

  interpretedEvidence: Evidence[];

  answeredAt: string;
}
```

« Je ne sais pas » est une réponse valide et ne doit pas être convertie en oui ou non.

---

# 25. Rule

```typescript
type RuleId = string;

interface DiagnosticRule {
  id: RuleId;
  domainId: DomainId;

  name: string;
  description: string;

  priority: number;

  conditions: RuleCondition[];

  operator:
    | "all"
    | "any"
    | "none";

  actions: RuleAction[];

  explanation: string;

  enabled: boolean;
  version: string;
}
```

---

# 26. Rule Condition

```typescript
interface RuleCondition {
  type:
    | "evidence"
    | "hypothesis"
    | "vehicle"
    | "session"
    | "score"
    | "question"
    | "safety";

  targetId: string;

  operator:
    | "equals"
    | "not_equals"
    | "greater_than"
    | "greater_or_equal"
    | "less_than"
    | "less_or_equal"
    | "contains"
    | "exists"
    | "not_exists"
    | "in";

  expectedValue?: unknown;
}
```

---

# 27. Rule Action

```typescript
interface RuleAction {
  type:
    | "add_score"
    | "subtract_score"
    | "exclude_hypothesis"
    | "confirm_hypothesis"
    | "add_evidence"
    | "request_question"
    | "request_test"
    | "set_safety_flag"
    | "set_decision"
    | "stop_workflow";

  targetId?: string;
  value?: unknown;

  explanation: string;
}
```

---

# 28. Diagnostic Test

```typescript
type TestId = string;

interface DiagnosticTest {
  id: TestId;
  domainId: DomainId;

  name: string;
  description: string;

  instructions: string[];

  requiredTools: string[];

  difficulty:
    | "easy"
    | "moderate"
    | "advanced"
    | "professional";

  riskLevel:
    | "none"
    | "low"
    | "medium"
    | "high";

  possibleResults: TestResultDefinition[];

  targetEvidenceIds: EvidenceId[];
  targetHypothesisIds: HypothesisId[];
}
```

---

# 29. Test Result

```typescript
interface TestResultDefinition {
  id: string;

  label: string;

  value: EvidenceValue;

  resultingEvidence: EvidenceMutation[];

  interpretation: string;
}
```

---

# 30. Action

```typescript
type ActionId = string;

type DiagnosticActionType =
  | "ASK_QUESTION"
  | "REQUEST_TEST"
  | "CONTINUE_REASONING"
  | "PROVIDE_DIAGNOSIS"
  | "REQUEST_VEHICLE_DATA"
  | "REFER_TO_GARAGE"
  | "SAFETY_STOP"
  | "DO_NOT_SELL"
  | "SELL"
  | "VERIFY_PART_COMPATIBILITY";

interface DiagnosticAction {
  id: ActionId;

  type: DiagnosticActionType;

  priority: number;

  reason: string;

  questionId?: QuestionId;
  testId?: TestId;
  hypothesisId?: HypothesisId;

  blocking: boolean;
}
```

---

# 31. Workflow

```typescript
type WorkflowId = string;

interface DiagnosticWorkflow {
  id: WorkflowId;
  domainId: DomainId;

  name: string;
  version: string;

  entryConditions: RuleCondition[];

  allowedActionTypes: DiagnosticActionType[];

  completionCriteria: CompletionCriterion[];

  safetyRules: RuleId[];

  fallbackActionId?: ActionId;
}
```

Le workflow encadre le raisonnement, mais ne doit pas devenir un questionnaire rigide.

---

# 32. Completion Criterion

```typescript
interface CompletionCriterion {
  type:
    | "confidence_threshold"
    | "single_hypothesis_remaining"
    | "required_evidence_present"
    | "safety_stop"
    | "maximum_questions"
    | "no_useful_question"
    | "manual_confirmation";

  threshold?: number;
  targetId?: string;

  explanation: string;
}
```

---

# 33. Part

```typescript
type PartId = string;

interface PartDefinition {
  id: PartId;

  name: string;
  description: string;

  category: string;
  subcategory?: string;

  relatedHypothesisIds: HypothesisId[];

  requiredVehicleAttributes: string[];

  compatibilitySource:
    | "catalog"
    | "tecdoc"
    | "manufacturer"
    | "manual"
    | "unknown";

  saleRestrictions?: string[];

  metadata?: Record<string, unknown>;
}
```

Une famille de pièces ne correspond pas encore à une référence commerciale exacte.

---

# 34. Part Candidate

```typescript
interface PartCandidate {
  partId: PartId;

  catalogReference?: string;
  manufacturer?: string;

  compatibilityStatus:
    | "unknown"
    | "possible"
    | "compatible"
    | "incompatible"
    | "requires_verification";

  compatibilityConfidence: Confidence;

  diagnosticRelevance: number;

  reasons: string[];
  warnings: string[];
}
```

---

# 35. Part Recommendation

```typescript
interface PartRecommendation {
  primaryPart?: PartCandidate;

  secondaryParts: PartCandidate[];

  kits: PartCandidate[];

  consumables: PartCandidate[];

  requiredChecks: string[];

  confidence: Confidence;

  status:
    | "not_ready"
    | "diagnostic_only"
    | "verification_required"
    | "ready_to_sell"
    | "do_not_sell";

  explanation: string;
}
```

Règle :

> Une hypothèse probable ne signifie pas automatiquement qu’une pièce précise peut être vendue.

---

# 36. Sales Decision

```typescript
type SalesDecisionType =
  | "SELL"
  | "VERIFY"
  | "CONTINUE_DIAGNOSIS"
  | "REQUEST_TEST"
  | "REFER_TO_GARAGE"
  | "DO_NOT_SELL"
  | "SAFETY_STOP";

interface SalesDecision {
  type: SalesDecisionType;

  confidence: Confidence;

  diagnosticRisk: number;
  compatibilityRisk: number;
  returnRisk: number;
  safetyRisk: number;

  reasons: string[];
  requiredActions: string[];

  partRecommendation?: PartRecommendation;
}
```

---

# 37. Safety Flag

```typescript
type SafetyFlag =
  | "FIRE_RISK"
  | "ELECTRICAL_RISK"
  | "BRAKING_RISK"
  | "STEERING_RISK"
  | "ENGINE_DAMAGE_RISK"
  | "OVERHEATING_RISK"
  | "VEHICLE_IMMOBILIZATION_RISK"
  | "TOWING_RECOMMENDED"
  | "PROFESSIONAL_INSPECTION_REQUIRED";
```

Une règle de sécurité peut interrompre le diagnostic commercial.

---

# 38. Diagnostic Result

```typescript
interface DiagnosticResult {
  status:
    | "in_progress"
    | "insufficient_information"
    | "probable"
    | "confirmed"
    | "contradictory"
    | "safety_stop";

  leadingHypothesis?: ScoredHypothesis;

  alternativeHypotheses: ScoredHypothesis[];

  confidence: Confidence;

  evidenceSummary: Evidence[];

  contradictions: Contradiction[];

  recommendedTests: DiagnosticTest[];

  partRecommendation?: PartRecommendation;

  salesDecision?: SalesDecision;

  explanation: DiagnosticExplanation;
}
```

---

# 39. Diagnostic Explanation

```typescript
interface DiagnosticExplanation {
  summary: string;

  whyThisHypothesis: string[];

  supportingEvidence: string[];

  contradictingEvidence: string[];

  rejectedHypotheses: RejectedHypothesisExplanation[];

  missingInformation: string[];

  limitations: string[];

  nextSteps: string[];
}

interface RejectedHypothesisExplanation {
  hypothesisId: HypothesisId;
  reason: string;
}
```

---

# 40. Diagnostic Session

```typescript
type SessionId = string;

interface DiagnosticSession {
  id: SessionId;

  status:
    | "created"
    | "active"
    | "waiting_for_answer"
    | "waiting_for_test"
    | "completed"
    | "aborted"
    | "expired";

  profileId: UserProfileId;

  vehicle?: Vehicle;

  chiefComplaint?: ChiefComplaint;

  activeDomainIds: DomainId[];

  observations: Observation[];

  evidences: Evidence[];

  hypotheses: ScoredHypothesis[];

  contradictions: Contradiction[];

  askedQuestions: AskedQuestion[];

  actions: DiagnosticAction[];

  diagnosticResult?: DiagnosticResult;

  knowledgeVersions: KnowledgeVersionReference[];

  engineVersion: string;

  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
```

---

# 41. Knowledge Pack

```typescript
interface KnowledgePack {
  id: string;

  domain: DiagnosticDomain;

  version: string;

  hypotheses: HypothesisDefinition[];

  evidences: EvidenceDefinition[];

  questions: QuestionDefinition[];

  rules: DiagnosticRule[];

  tests: DiagnosticTest[];

  actions: DiagnosticAction[];

  parts: PartDefinition[];

  workflows: DiagnosticWorkflow[];

  metadata: KnowledgePackMetadata;
}
```

---

# 42. Knowledge Pack Metadata

```typescript
interface KnowledgePackMetadata {
  author: string;

  createdAt: string;
  updatedAt: string;

  status:
    | "draft"
    | "review"
    | "validated"
    | "production"
    | "deprecated";

  supportedLanguages: string[];

  reviewedBy: string[];

  sourceReferences: KnowledgeSource[];

  changelog: KnowledgeChange[];
}
```

---

# 43. Knowledge Source

```typescript
interface KnowledgeSource {
  type:
    | "expert"
    | "manufacturer_documentation"
    | "technical_manual"
    | "catalog"
    | "test_data"
    | "field_feedback"
    | "other";

  reference: string;

  reliability: Reliability;

  notes?: string;
}
```

---

# 44. Versioning

```typescript
interface KnowledgeVersionReference {
  knowledgePackId: string;
  version: string;
}
```

Une session conserve les versions utilisées afin que son raisonnement puisse être reproduit.

---

# 45. Reasoning Trace

```typescript
interface ReasoningTrace {
  sessionId: SessionId;
  steps: ReasoningStep[];
}

interface ReasoningStep {
  id: string;

  sequence: number;

  type:
    | "evidence_added"
    | "evidence_updated"
    | "score_changed"
    | "rule_applied"
    | "question_evaluated"
    | "question_selected"
    | "hypothesis_excluded"
    | "confidence_changed"
    | "action_selected"
    | "diagnosis_completed"
    | "sales_decision_created";

  timestamp: string;

  sourceId?: string;
  targetId?: string;

  before?: unknown;
  after?: unknown;

  explanation: string;
}
```

---

# 46. API Contract

Les routes API ne doivent pas exposer directement tous les objets internes.

```typescript
interface DiagnosticApiResponse {
  sessionId: string;

  message: string;

  status:
    | "question"
    | "test"
    | "diagnosis"
    | "safety_stop"
    | "error";

  nextQuestion?: PublicQuestion;

  diagnostic?: PublicDiagnosticResult;

  salesRecommendation?: PublicSalesRecommendation;
}
```

Les objets publics restent plus simples et plus stables que les objets internes.

---

# 47. Valeurs inconnues

Le système distingue obligatoirement :

```text
false
unknown
not_asked
not_applicable
```

Ces valeurs ne sont pas équivalentes.

Une information absente ne doit jamais être interprétée comme négative.

---

# 48. Données manquantes

Interdit :

```text
Aucune réponse sur l’odeur de brûlé
→ donc pas d’odeur de brûlé
```

Correct :

```text
Aucune réponse sur l’odeur de brûlé
→ information inconnue
```

---

# 49. Immutabilité et historique

Lorsqu’une preuve change, le système doit pouvoir retrouver :

- l’ancienne valeur ;
- la nouvelle valeur ;
- la raison ;
- l’heure ;
- la source.

---

# 50. Validation des données

Avant d’être chargé, un Knowledge Pack doit être validé.

Contrôles minimums :

- identifiants uniques ;
- références existantes ;
- aucune hypothèse sans domaine ;
- aucune question sans objectif ;
- aucune option sans preuve résultante ;
- aucune règle avec cible inexistante ;
- aucune pièce liée à une hypothèse inexistante ;
- aucun workflow sans critère de fin ;
- aucune dépendance circulaire non autorisée ;
- aucune valeur numérique hors limites ;
- aucune règle contradictoire de même priorité.

---

# 51. Invariants métier

## Invariant 1

Une hypothèse exclue ne redevient pas première sans nouvelle preuve ou règle explicite.

## Invariant 2

Une question déjà répondue ne doit pas être reposée sans justification.

## Invariant 3

Une réponse inconnue ne confirme ni ne rejette une preuve.

## Invariant 4

Une vente ne peut pas être recommandée si la compatibilité véhicule indispensable est inconnue.

## Invariant 5

Une décision de sécurité est prioritaire sur une décision commerciale.

## Invariant 6

Chaque modification de score possède une origine explicable.

## Invariant 7

Chaque diagnostic final conserve au moins une preuve de support.

## Invariant 8

La confiance n’augmente pas lorsqu’une contradiction majeure non résolue apparaît.

## Invariant 9

Le profil utilisateur ne modifie pas la vérité technique.

## Invariant 10

Le moteur ne doit jamais inventer une information absente.

---

# 52. Modèle minimal obligatoire pour la V1

Objets obligatoires :

```text
DiagnosticSession
DiagnosticDomain
KnowledgePack
EvidenceDefinition
Evidence
HypothesisDefinition
ScoredHypothesis
QuestionDefinition
QuestionOption
Answer
DiagnosticRule
DiagnosticAction
DiagnosticResult
PartRecommendation
SalesDecision
ReasoningTrace
```

---

# 53. Migration depuis les types actuels

Types actuellement dispersés :

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

Ordre de migration :

1. cartographier les types existants ;
2. identifier les concepts identiques ;
3. identifier les différences fonctionnelles ;
4. définir les types canoniques dans `engine` ;
5. créer des adaptateurs temporaires ;
6. migrer les composants un par un ;
7. supprimer les types Legacy uniquement lorsque plus aucun import ne les utilise.

---

# 54. Emplacement cible TypeScript

```text
engine/model/
├── identifiers.ts
├── values.ts
├── vehicle.ts
├── profiles.ts
├── symptoms.ts
├── evidences.ts
├── hypotheses.ts
├── questions.ts
├── rules.ts
├── tests.ts
├── actions.ts
├── workflows.ts
├── parts.ts
├── sales.ts
├── diagnostics.ts
├── sessions.ts
├── knowledge.ts
├── reasoningTrace.ts
└── index.ts
```

Cette structure constitue une cible architecturale, pas encore une instruction de modification du code.

---

# 55. ADR-004 — Un modèle métier canonique unique

**Statut :** Accepté  
**Date :** 30 juillet 2026  

## Contexte

Le projet contient plusieurs générations de types TypeScript et plusieurs définitions proches des mêmes concepts.

## Décision

Le nouveau moteur utilisera progressivement un modèle métier canonique unique, indépendant de Next.js et des composants React.

## Conséquences

- les nouveaux composants métier utilisent les types canoniques ;
- les Knowledge Packs respectent ce modèle ;
- les anciennes structures sont adaptées temporairement ;
- aucune suppression n’est effectuée sans tests ;
- les contrats API peuvent utiliser des représentations publiques simplifiées.

---

# 56. Règle absolue

> Un concept métier possède une seule définition officielle.

Si deux composants utilisent des représentations différentes, la conversion doit être explicite au moyen d’un adaptateur.

Il est interdit de créer silencieusement une nouvelle définition concurrente.

---

# 57. Prochaine étape

Le prochain document sera :

```text
04-KNOWLEDGE-PACK-SPECIFICATION.md
```

Il définira :

- comment créer un domaine ;
- comment définir les hypothèses ;
- comment définir les preuves ;
- comment écrire les questions ;
- comment écrire les règles ;
- comment associer les pièces ;
- comment valider un pack ;
- comment tester un nouveau domaine ;
- comment versionner les connaissances.
