import {
  DiagnosticAction,
  DiagnosticSession,
  Evidence,
  EvidenceStatus,
  Hypothesis,
  Question,
  ReasoningContext,
} from "../model";

export interface ReasoningContextSource {

  evidences?:
    Iterable<Evidence>;

  hypotheses?:
    Iterable<Hypothesis>;

  questions?:
    Iterable<Question>;

  actions?:
    Iterable<DiagnosticAction>;

  activeHypothesisIds?:
    Iterable<string>;

  eliminatedHypothesisIds?:
    Iterable<string>;

  confirmedEvidenceIds?:
    Iterable<string>;

  rejectedEvidenceIds?:
    Iterable<string>;

  completedQuestionIds?:
    Iterable<string>;

  metadata?:
    ReasoningContext["metadata"];

  progress?:
    ReasoningContext["progress"];

}

export interface ReasoningContextBuildOptions {

  inferEvidenceSetsFromStatus: boolean;

  inferHypothesisSets: boolean;

  eliminateHypothesesWithRejectedRequiredEvidence: boolean;

  excludeEliminatedHypothesesFromActiveSet: boolean;

  preserveExplicitEvidenceSets: boolean;

  preserveExplicitHypothesisSets: boolean;

  rejectUnknownReferences: boolean;

}

export interface ReasoningContextValidationIssue {

  type:
    | "duplicate_id"
    | "unknown_evidence_reference"
    | "unknown_hypothesis_reference"
    | "unknown_question_reference"
    | "invalid_evidence_state"
    | "invalid_hypothesis_state";

  entityId: string;

  relatedId?: string;

  message: string;

}

export interface ReasoningContextBuildResult {

  context: ReasoningContext;

  issues: ReasoningContextValidationIssue[];

}

const DEFAULT_OPTIONS:
  ReasoningContextBuildOptions = {

    inferEvidenceSetsFromStatus: true,

    inferHypothesisSets: true,

    eliminateHypothesesWithRejectedRequiredEvidence:
      true,

    excludeEliminatedHypothesesFromActiveSet:
      true,

    preserveExplicitEvidenceSets: true,

    preserveExplicitHypothesisSets: true,

    rejectUnknownReferences: false,

  };

/**
 * Construit un ReasoningContext cohérent à partir des données fournies.
 *
 * Le builder :
 * - déduplique les entités par identifiant ;
 * - initialise les ensembles de preuves et d'hypothèses ;
 * - détecte les références inconnues ;
 * - élimine les hypothèses impossibles lorsque configuré ;
 * - ne modifie jamais les objets fournis en entrée.
 */
export class ReasoningContextBuilder {

  private readonly evidences =
    new Map<string, Evidence>();

  private readonly hypotheses =
    new Map<string, Hypothesis>();

  private readonly questions =
    new Map<string, Question>();

  private readonly actions =
    new Map<string, DiagnosticAction>();

  private readonly activeHypothesisIds =
    new Set<string>();

  private readonly eliminatedHypothesisIds =
    new Set<string>();

  private readonly confirmedEvidenceIds =
    new Set<string>();

  private readonly rejectedEvidenceIds =
    new Set<string>();

  private readonly completedQuestionIds =
    new Set<string>();

  private metadata:
    ReasoningContext["metadata"];

  private progress:
    ReasoningContext["progress"];

  private readonly issues:
    ReasoningContextValidationIssue[] = [];

  private readonly options:
    ReasoningContextBuildOptions;

  public constructor(
    options:
      Partial<ReasoningContextBuildOptions> = {},
  ) {

    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    this.metadata = {};

    this.progress = {
      answeredQuestionCount: 0,
      currentQuestionId: null,
      failureBranch: "unknown",
      answeredQuestionFamilies:
        new Set<string>(),
      unavailableCapabilities:
        new Set<string>(),
    };

  }

  public static fromSession(
    session: DiagnosticSession,
    source: Omit<
      ReasoningContextSource,
      "evidences" |
      "hypotheses" |
      "actions"
    > = {},
    options:
      Partial<ReasoningContextBuildOptions> = {},
  ): ReasoningContextBuildResult {

    return new ReasoningContextBuilder(options)
      .addSession(session)
      .addSource(source)
      .build();

  }

  public static fromSource(
    source: ReasoningContextSource,
    options:
      Partial<ReasoningContextBuildOptions> = {},
  ): ReasoningContextBuildResult {

    return new ReasoningContextBuilder(options)
      .addSource(source)
      .build();

  }

  public addSession(
    session: DiagnosticSession,
  ): this {

    this.addEvidences(
      session.evidences,
    );

    this.addHypotheses(
      session.hypotheses,
    );

    this.addActions(
      session.actions,
    );

    this.metadata = {
      ...this.metadata,
      sessionId:
        session.id,
      profileId:
        session.profileId as
          NonNullable<
            ReasoningContext["metadata"]
          >["profileId"],
    };

    this.progress = {
      answeredQuestionCount:
        this.completedQuestionIds.size,

      maximumQuestionCount:
        this.progress
          ?.maximumQuestionCount,

      currentQuestionId:
        this.progress
          ?.currentQuestionId ??
        null,

      failureBranch:
        this.progress
          ?.failureBranch ??
        "unknown",

      answeredQuestionFamilies:
        new Set(
          this.progress
            ?.answeredQuestionFamilies ??
          [],
        ),

      unavailableCapabilities:
        new Set(
          this.progress
            ?.unavailableCapabilities ??
          [],
        ),
    };

    return this;

  }

  public addSource(
    source: ReasoningContextSource,
  ): this {

    if (source.evidences) {
      this.addEvidences(
        source.evidences,
      );
    }

    if (source.hypotheses) {
      this.addHypotheses(
        source.hypotheses,
      );
    }

    if (source.questions) {
      this.addQuestions(
        source.questions,
      );
    }

    if (source.actions) {
      this.addActions(
        source.actions,
      );
    }

    if (source.activeHypothesisIds) {
      this.markHypothesesActive(
        source.activeHypothesisIds,
      );
    }

    if (source.eliminatedHypothesisIds) {
      this.markHypothesesEliminated(
        source.eliminatedHypothesisIds,
      );
    }

    if (source.confirmedEvidenceIds) {
      this.markEvidencesConfirmed(
        source.confirmedEvidenceIds,
      );
    }

    if (source.rejectedEvidenceIds) {
      this.markEvidencesRejected(
        source.rejectedEvidenceIds,
      );
    }

    if (source.completedQuestionIds) {
      for (
        const questionId
        of source.completedQuestionIds
      ) {
        this.completedQuestionIds.add(
          questionId,
        );
      }
    }

    if (source.metadata) {
      this.metadata = {
        ...this.metadata,
        ...source.metadata,
      };
    }

    if (source.progress) {
      this.progress = {
        ...this.progress,
        ...source.progress,

        answeredQuestionFamilies:
          new Set(
            source.progress
              .answeredQuestionFamilies ??
            this.progress
              ?.answeredQuestionFamilies ??
            [],
          ),

        unavailableCapabilities:
          new Set(
            source.progress
              .unavailableCapabilities ??
            this.progress
              ?.unavailableCapabilities ??
            [],
          ),
      };
    }

    return this;

  }

  public addEvidence(
    evidence: Evidence,
  ): this {

    this.addEntity(
      this.evidences,
      evidence.id,
      this.cloneEvidence(evidence),
      "evidence",
    );

    return this;

  }

  public addEvidences(
    evidences: Iterable<Evidence>,
  ): this {

    for (const evidence of evidences) {
      this.addEvidence(evidence);
    }

    return this;

  }

  public addHypothesis(
    hypothesis: Hypothesis,
  ): this {

    this.addEntity(
      this.hypotheses,
      hypothesis.id,
      this.cloneHypothesis(hypothesis),
      "hypothesis",
    );

    return this;

  }

  public addHypotheses(
    hypotheses: Iterable<Hypothesis>,
  ): this {

    for (const hypothesis of hypotheses) {
      this.addHypothesis(hypothesis);
    }

    return this;

  }

  public addQuestion(
    question: Question,
  ): this {

    this.addEntity(
      this.questions,
      question.id,
      this.cloneQuestion(question),
      "question",
    );

    return this;

  }

  public addQuestions(
    questions: Iterable<Question>,
  ): this {

    for (const question of questions) {
      this.addQuestion(question);
    }

    return this;

  }

  public addAction(
    action: DiagnosticAction,
  ): this {

    this.addEntity(
      this.actions,
      action.id,
      this.cloneAction(action),
      "action",
    );

    return this;

  }

  public addActions(
    actions: Iterable<DiagnosticAction>,
  ): this {

    for (const action of actions) {
      this.addAction(action);
    }

    return this;

  }

  public markEvidenceConfirmed(
    evidenceId: string,
  ): this {

    this.confirmedEvidenceIds.add(
      evidenceId,
    );

    if (
      !this.options
        .preserveExplicitEvidenceSets
    ) {
      this.rejectedEvidenceIds.delete(
        evidenceId,
      );
    }

    return this;

  }

  public markEvidencesConfirmed(
    evidenceIds: Iterable<string>,
  ): this {

    for (const evidenceId of evidenceIds) {
      this.markEvidenceConfirmed(
        evidenceId,
      );
    }

    return this;

  }

  public markEvidenceRejected(
    evidenceId: string,
  ): this {

    this.rejectedEvidenceIds.add(
      evidenceId,
    );

    if (
      !this.options
        .preserveExplicitEvidenceSets
    ) {
      this.confirmedEvidenceIds.delete(
        evidenceId,
      );
    }

    return this;

  }

  public markEvidencesRejected(
    evidenceIds: Iterable<string>,
  ): this {

    for (const evidenceId of evidenceIds) {
      this.markEvidenceRejected(
        evidenceId,
      );
    }

    return this;

  }

  public markHypothesisActive(
    hypothesisId: string,
  ): this {

    this.activeHypothesisIds.add(
      hypothesisId,
    );

    if (
      !this.options
        .preserveExplicitHypothesisSets
    ) {
      this.eliminatedHypothesisIds.delete(
        hypothesisId,
      );
    }

    return this;

  }

  public markHypothesesActive(
    hypothesisIds: Iterable<string>,
  ): this {

    for (const hypothesisId of hypothesisIds) {
      this.markHypothesisActive(
        hypothesisId,
      );
    }

    return this;

  }

  public markHypothesisEliminated(
    hypothesisId: string,
  ): this {

    this.eliminatedHypothesisIds.add(
      hypothesisId,
    );

    if (
      this.options
        .excludeEliminatedHypothesesFromActiveSet
    ) {
      this.activeHypothesisIds.delete(
        hypothesisId,
      );
    }

    return this;

  }

  public markHypothesesEliminated(
    hypothesisIds: Iterable<string>,
  ): this {

    for (const hypothesisId of hypothesisIds) {
      this.markHypothesisEliminated(
        hypothesisId,
      );
    }

    return this;

  }

  public build():
    ReasoningContextBuildResult {

    this.issues.length = 0;

    if (
      this.options
        .inferEvidenceSetsFromStatus
    ) {
      this.inferEvidenceSets();
    }

    if (
      this.options
        .inferHypothesisSets
    ) {
      this.inferHypothesisSets();
    }

    if (
      this.options
        .eliminateHypothesesWithRejectedRequiredEvidence
    ) {
      this.eliminateImpossibleHypotheses();
    }

    if (
      this.options
        .excludeEliminatedHypothesesFromActiveSet
    ) {
      this.removeEliminatedFromActive();
    }

    this.validateEvidenceStates();
    this.validateHypothesisStates();
    this.validateHypothesisReferences();
    this.validateQuestionReferences();
    this.validateActionReferences();

    if (
      this.options
        .rejectUnknownReferences &&
      this.issues.some(
        issue =>
          issue.type ===
            "unknown_evidence_reference" ||
          issue.type ===
            "unknown_hypothesis_reference" ||
          issue.type ===
            "unknown_question_reference",
      )
    ) {

      throw new Error(
        this.createValidationErrorMessage(),
      );

    }

    return {

      context: {

        evidences:
          new Map(this.evidences),

        hypotheses:
          new Map(this.hypotheses),

        questions:
          new Map(this.questions),

        actions:
          new Map(this.actions),

        activeHypothesisIds:
          new Set(
            this.activeHypothesisIds,
          ),

        eliminatedHypothesisIds:
          new Set(
            this.eliminatedHypothesisIds,
          ),

        confirmedEvidenceIds:
          new Set(
            this.confirmedEvidenceIds,
          ),

        rejectedEvidenceIds:
          new Set(
            this.rejectedEvidenceIds,
          ),

        completedQuestionIds:
          new Set(
            this.completedQuestionIds,
          ),

        metadata: {
          ...this.metadata,
        },

        progress: {
          answeredQuestionCount:
            this.completedQuestionIds.size,

          maximumQuestionCount:
            this.progress
              ?.maximumQuestionCount,

          currentQuestionId:
            this.progress
              ?.currentQuestionId ??
            null,

          failureBranch:
            this.progress
              ?.failureBranch ??
            "unknown",

          answeredQuestionFamilies:
            new Set(
              this.progress
                ?.answeredQuestionFamilies ??
              [],
            ),

          unavailableCapabilities:
            new Set(
              this.progress
                ?.unavailableCapabilities ??
              [],
            ),
        },

      },

      issues:
        this.getSortedIssues(),

    };

  }

  public reset(): this {

    this.evidences.clear();
    this.hypotheses.clear();
    this.questions.clear();
    this.actions.clear();

    this.activeHypothesisIds.clear();
    this.eliminatedHypothesisIds.clear();
    this.confirmedEvidenceIds.clear();
    this.rejectedEvidenceIds.clear();
    this.completedQuestionIds.clear();

    this.metadata = {};

    this.progress = {
      answeredQuestionCount: 0,
      currentQuestionId: null,
      failureBranch: "unknown",
      answeredQuestionFamilies:
        new Set<string>(),
      unavailableCapabilities:
        new Set<string>(),
    };

    this.issues.length = 0;

    return this;

  }

  private inferEvidenceSets(): void {

    for (
      const evidence
      of this.evidences.values()
    ) {

      switch (evidence.status) {

        case "confirmed":

          this.confirmedEvidenceIds.add(
            evidence.id,
          );

          if (
            !this.options
              .preserveExplicitEvidenceSets
          ) {
            this.rejectedEvidenceIds.delete(
              evidence.id,
            );
          }

          break;

        case "rejected":

          this.rejectedEvidenceIds.add(
            evidence.id,
          );

          if (
            !this.options
              .preserveExplicitEvidenceSets
          ) {
            this.confirmedEvidenceIds.delete(
              evidence.id,
            );
          }

          break;

        case "unknown":
        case "uncertain":
          break;

      }

    }

  }

  private inferHypothesisSets(): void {

    if (
      this.activeHypothesisIds.size === 0
    ) {

      for (
        const hypothesisId
        of this.hypotheses.keys()
      ) {

        if (
          !this.eliminatedHypothesisIds.has(
            hypothesisId,
          )
        ) {
          this.activeHypothesisIds.add(
            hypothesisId,
          );
        }

      }

    }

  }

  private eliminateImpossibleHypotheses():
    void {

    for (
      const hypothesis
      of this.hypotheses.values()
    ) {

      const rejectedRequirement =
        hypothesis.requiredEvidenceIds.some(
          evidenceId =>
            this.rejectedEvidenceIds.has(
              evidenceId,
            ),
        );

      if (!rejectedRequirement) {
        continue;
      }

      this.eliminatedHypothesisIds.add(
        hypothesis.id,
      );

    }

  }

  private removeEliminatedFromActive():
    void {

    for (
      const hypothesisId
      of this.eliminatedHypothesisIds
    ) {

      this.activeHypothesisIds.delete(
        hypothesisId,
      );

    }

  }

  private validateEvidenceStates(): void {

    for (
      const evidenceId
      of this.confirmedEvidenceIds
    ) {

      if (
        this.rejectedEvidenceIds.has(
          evidenceId,
        )
      ) {

        this.issues.push({

          type:
            "invalid_evidence_state",

          entityId:
            evidenceId,

          message:
            `La preuve "${evidenceId}" est simultanément confirmée et rejetée.`,

        });

      }

      if (!this.evidences.has(evidenceId)) {

        this.issues.push({

          type:
            "unknown_evidence_reference",

          entityId:
            evidenceId,

          message:
            `La preuve confirmée "${evidenceId}" n'existe pas dans le catalogue des preuves.`,

        });

      }

    }

    for (
      const evidenceId
      of this.rejectedEvidenceIds
    ) {

      if (!this.evidences.has(evidenceId)) {

        this.issues.push({

          type:
            "unknown_evidence_reference",

          entityId:
            evidenceId,

          message:
            `La preuve rejetée "${evidenceId}" n'existe pas dans le catalogue des preuves.`,

        });

      }

    }

    for (
      const evidence
      of this.evidences.values()
    ) {

      this.validateEvidenceStatus(
        evidence,
      );

    }

  }

  private validateEvidenceStatus(
    evidence: Evidence,
  ): void {

    const confirmed =
      this.confirmedEvidenceIds.has(
        evidence.id,
      );

    const rejected =
      this.rejectedEvidenceIds.has(
        evidence.id,
      );

    if (
      evidence.status === "confirmed" &&
      !confirmed
    ) {

      this.issues.push({

        type:
          "invalid_evidence_state",

        entityId:
          evidence.id,

        message:
          `La preuve "${evidence.id}" porte le statut "confirmed" mais ne figure pas dans les preuves confirmées.`,

      });

    }

    if (
      evidence.status === "rejected" &&
      !rejected
    ) {

      this.issues.push({

        type:
          "invalid_evidence_state",

        entityId:
          evidence.id,

        message:
          `La preuve "${evidence.id}" porte le statut "rejected" mais ne figure pas dans les preuves rejetées.`,

      });

    }

  }

  private validateHypothesisStates(): void {

    for (
      const hypothesisId
      of this.activeHypothesisIds
    ) {

      if (
        this.eliminatedHypothesisIds.has(
          hypothesisId,
        )
      ) {

        this.issues.push({

          type:
            "invalid_hypothesis_state",

          entityId:
            hypothesisId,

          message:
            `L'hypothèse "${hypothesisId}" est simultanément active et éliminée.`,

        });

      }

      if (!this.hypotheses.has(hypothesisId)) {

        this.issues.push({

          type:
            "unknown_hypothesis_reference",

          entityId:
            hypothesisId,

          message:
            `L'hypothèse active "${hypothesisId}" n'existe pas dans le catalogue des hypothèses.`,

        });

      }

    }

    for (
      const hypothesisId
      of this.eliminatedHypothesisIds
    ) {

      if (!this.hypotheses.has(hypothesisId)) {

        this.issues.push({

          type:
            "unknown_hypothesis_reference",

          entityId:
            hypothesisId,

          message:
            `L'hypothèse éliminée "${hypothesisId}" n'existe pas dans le catalogue des hypothèses.`,

        });

      }

    }

  }

  private validateHypothesisReferences():
    void {

    for (
      const hypothesis
      of this.hypotheses.values()
    ) {

      const evidenceIds = [
        ...hypothesis
          .supportingEvidenceIds,
        ...hypothesis
          .contradictingEvidenceIds,
        ...hypothesis
          .requiredEvidenceIds,
      ];

      for (
        const evidenceId
        of new Set(evidenceIds)
      ) {

        if (this.evidences.has(evidenceId)) {
          continue;
        }

        this.issues.push({

          type:
            "unknown_evidence_reference",

          entityId:
            hypothesis.id,

          relatedId:
            evidenceId,

          message:
            `L'hypothèse "${hypothesis.id}" référence une preuve inconnue.`,

        });

      }

    }

  }

  private validateQuestionReferences():
    void {

    for (
      const question
      of this.questions.values()
    ) {

      for (
        const evidenceId
        of question.targetEvidenceIds
      ) {

        if (this.evidences.has(evidenceId)) {
          continue;
        }

        this.issues.push({

          type:
            "unknown_evidence_reference",

          entityId:
            question.id,

          relatedId:
            evidenceId,

          message:
            `La question "${question.id}" cible la preuve inconnue "${evidenceId}".`,

        });

      }

      for (
        const hypothesisId
        of question.targetHypothesisIds
      ) {

        if (
          this.hypotheses.has(
            hypothesisId,
          )
        ) {
          continue;
        }

        this.issues.push({

          type:
            "unknown_hypothesis_reference",

          entityId:
            question.id,

          relatedId:
            hypothesisId,

          message:
            `La question "${question.id}" cible une ou plusieurs hypothèses inconnues : ${question.targetHypothesisIds.join(", ")}.`,

        });

      }

    }

  }

  private validateActionReferences():
    void {

    for (
      const action
      of this.actions.values()
    ) {

      if (
        action.questionId &&
        !this.questions.has(
          action.questionId,
        )
      ) {

        this.issues.push({

          type:
            "unknown_question_reference",

          entityId:
            action.id,

          relatedId:
            action.questionId,

          message:
            `L'action "${action.id}" référence la question inconnue "${action.questionId}".`,

        });

      }

      if (
        action.hypothesisId &&
        !this.hypotheses.has(
          action.hypothesisId,
        )
      ) {

        this.issues.push({

          type:
            "unknown_hypothesis_reference",

          entityId:
            action.id,

          relatedId:
            action.hypothesisId,

          message:
            `L'action "${action.id}" référence l'hypothèse inconnue "${action.hypothesisId}".`,

        });

      }

    }

  }

  private addEntity<T>(
    target: Map<string, T>,
    id: string,
    value: T,
    entityType: string,
  ): void {

    if (target.has(id)) {

      this.issues.push({

        type:
          "duplicate_id",

        entityId:
          id,

        message:
          `Identifiant ${entityType} dupliqué : "${id}". La première occurrence est conservée.`,

      });

    }

    target.set(
      id,
      value,
    );

  }

  private cloneEvidence(
    evidence: Evidence,
  ): Evidence {

    return {
      ...evidence,
    };

  }

  private cloneHypothesis(
    hypothesis: Hypothesis,
  ): Hypothesis {

    return {

      ...hypothesis,

      supportingEvidenceIds: [
        ...hypothesis
          .supportingEvidenceIds,
      ],

      contradictingEvidenceIds: [
        ...hypothesis
          .contradictingEvidenceIds,
      ],

      requiredEvidenceIds: [
        ...hypothesis
          .requiredEvidenceIds,
      ],

      possiblePartIds: [
        ...hypothesis
          .possiblePartIds,
      ],

      recommendedTestIds: [
        ...hypothesis
          .recommendedTestIds,
      ],

    };

  }

  private cloneQuestion(
    question: Question,
  ): Question {

    return {

      ...question,

      targetHypothesisIds: [
        ...question
          .targetHypothesisIds,
      ],

      targetEvidenceIds: [
        ...question
          .targetEvidenceIds,
      ],

      options:
        question.options.map(
          option => ({
            ...option,
          }),
        ),

    };

  }

  private cloneAction(
    action: DiagnosticAction,
  ): DiagnosticAction {

    return {
      ...action,
    };

  }

  private getSortedIssues():
    ReasoningContextValidationIssue[] {

    return [...this.issues]
      .sort((left, right) => {

        const typeComparison =
          left.type.localeCompare(
            right.type,
          );

        if (typeComparison !== 0) {
          return typeComparison;
        }

        const entityComparison =
          left.entityId.localeCompare(
            right.entityId,
          );

        if (entityComparison !== 0) {
          return entityComparison;
        }

        return (
          left.relatedId ?? ""
        ).localeCompare(
          right.relatedId ?? "",
        );

      });

  }

  private createValidationErrorMessage():
    string {

    return this.getSortedIssues()
      .filter(
        issue =>
          issue.type ===
            "unknown_evidence_reference" ||
          issue.type ===
            "unknown_hypothesis_reference" ||
          issue.type ===
            "unknown_question_reference",
      )
      .map(issue => issue.message)
      .join(" ");

  }

}
