import type {
  DiagnosticAction,
  DiagnosticActionOption,
} from "../core/actionTypes";

import type {
  KnowledgeEvidence,
  KnowledgeHypothesis,
  KnowledgePackage,
  KnowledgeRule,
} from "./knowledgeTypes";

export type KnowledgeValidationSeverity =
  | "error"
  | "warning"
  | "info";

export type KnowledgeValidationCode =
  | "missing-domain"
  | "empty-actions"
  | "empty-evidences"
  | "empty-hypotheses"
  | "empty-rules"
  | "missing-workflow-entry"
  | "duplicate-action-id"
  | "duplicate-evidence-id"
  | "duplicate-hypothesis-id"
  | "duplicate-rule-id"
  | "unknown-entry-action"
  | "unknown-next-action"
  | "unknown-required-action"
  | "unknown-required-evidence"
  | "unknown-excluded-evidence"
  | "unknown-option-added-evidence"
  | "unknown-option-rejected-evidence"
  | "unknown-option-supported-hypothesis"
  | "unknown-option-rejected-hypothesis"
  | "unknown-diagnosis-hypothesis"
  | "unknown-rule-evidence"
  | "unknown-rule-hypothesis"
  | "invalid-rule-weight"
  | "invalid-evidence-confidence"
  | "invalid-action-priority"
  | "empty-action-text"
  | "empty-action-audiences"
  | "empty-option-list"
  | "empty-option-label"
  | "empty-option-value"
  | "duplicate-option-id"
  | "option-without-effect"
  | "conflicting-option-evidence"
  | "conflicting-option-hypothesis"
  | "unreachable-action"
  | "cyclic-action-path"
  | "orphan-evidence"
  | "orphan-hypothesis"
  | "orphan-rule"
  | "unused-part"
  | "unused-check"
  | "hypothesis-without-rules"
  | "evidence-without-rules"
  | "workflow-domain-mismatch"
  | "action-workflow-mismatch"
  | "invalid-workflow-id"
  | "invalid-workflow-title"
  | "completion-without-diagnosis"
  | "diagnosis-on-non-completion-action"
  | "invalid-option-next-action"
  | "missing-terminal-action";

export interface KnowledgeValidationIssue {

  code:
    KnowledgeValidationCode;

  severity:
    KnowledgeValidationSeverity;

  message:
    string;

  entityType?:
    "package"
    | "workflow"
    | "action"
    | "option"
    | "evidence"
    | "hypothesis"
    | "rule";

  entityId?:
    string;

  relatedId?:
    string;

}

export interface KnowledgeValidationStats {

  actionCount:
    number;

  optionCount:
    number;

  evidenceCount:
    number;

  hypothesisCount:
    number;

  ruleCount:
    number;

  reachableActionCount:
    number;

  unreachableActionCount:
    number;

  orphanEvidenceCount:
    number;

  orphanHypothesisCount:
    number;

  cycleCount:
    number;

}

export interface KnowledgeValidationResult {

  valid:
    boolean;

  errors:
    string[];

  warnings:
    string[];

  infos:
    string[];

  issues:
    KnowledgeValidationIssue[];

  stats:
    KnowledgeValidationStats;

}

interface ValidationIndex {

  actions:
    Map<string, DiagnosticAction>;

  evidences:
    Map<string, KnowledgeEvidence>;

  hypotheses:
    Map<string, KnowledgeHypothesis>;

  rules:
    Map<string, KnowledgeRule>;

}

/**
 * Validateur structurel et métier des Knowledge Packs.
 *
 * Il détecte les références cassées, les actions inaccessibles, les cycles,
 * les entités orphelines, les doublons et les incohérences de workflow.
 */
export class KnowledgeValidator {

  public validate(
    knowledgePackage:
      KnowledgePackage,
  ): KnowledgeValidationResult {

    const issues:
      KnowledgeValidationIssue[] = [];

    const index =
      this.buildIndex(
        knowledgePackage,
        issues,
      );

    this.validatePackage(
      knowledgePackage,
      issues,
    );

    this.validateWorkflow(
      knowledgePackage,
      index,
      issues,
    );

    this.validateActions(
      knowledgePackage,
      index,
      issues,
    );

    this.validateRules(
      knowledgePackage,
      index,
      issues,
    );

    this.validateEvidenceUsage(
      knowledgePackage,
      index,
      issues,
    );

    this.validateHypothesisUsage(
      knowledgePackage,
      index,
      issues,
    );

    const reachableActionIds =
      this.findReachableActions(
        knowledgePackage,
        index,
      );

    this.validateReachability(
      knowledgePackage,
      reachableActionIds,
      issues,
    );

    const cycles =
      this.findCycles(
        knowledgePackage,
        index,
      );

    for (const cycle of cycles) {

      issues.push({

        code:
          "cyclic-action-path",

        severity:
          "warning",

        message:
          `Cycle détecté dans le workflow : ${cycle.join(" -> ")}.`,

        entityType:
          "workflow",

        entityId:
          knowledgePackage.workflow.id,

      });

    }

    this.validateTerminalActions(
      knowledgePackage,
      reachableActionIds,
      issues,
    );

    const sortedIssues =
      this.sortIssues(
        issues,
      );

    const errors =
      sortedIssues
        .filter(
          issue =>
            issue.severity === "error",
        )
        .map(
          issue =>
            issue.message,
        );

    const warnings =
      sortedIssues
        .filter(
          issue =>
            issue.severity === "warning",
        )
        .map(
          issue =>
            issue.message,
        );

    const infos =
      sortedIssues
        .filter(
          issue =>
            issue.severity === "info",
        )
        .map(
          issue =>
            issue.message,
        );

    const orphanEvidenceCount =
      sortedIssues.filter(
        issue =>
          issue.code === "orphan-evidence",
      ).length;

    const orphanHypothesisCount =
      sortedIssues.filter(
        issue =>
          issue.code === "orphan-hypothesis",
      ).length;

    return {

      valid:
        errors.length === 0,

      errors,

      warnings,

      infos,

      issues:
        sortedIssues,

      stats: {

        actionCount:
          knowledgePackage.actions.length,

        optionCount:
          knowledgePackage.actions.reduce(
            (total, action) =>
              total +
              (action.options?.length ?? 0),
            0,
          ),

        evidenceCount:
          knowledgePackage.evidences.length,

        hypothesisCount:
          knowledgePackage.hypotheses.length,

        ruleCount:
          knowledgePackage.rules.length,

        reachableActionCount:
          reachableActionIds.size,

        unreachableActionCount:
          Math.max(
            0,
            knowledgePackage.actions.length -
            reachableActionIds.size,
          ),

        orphanEvidenceCount,

        orphanHypothesisCount,

        cycleCount:
          cycles.length,

      },

    };

  }

  private buildIndex(
    knowledgePackage:
      KnowledgePackage,

    issues:
      KnowledgeValidationIssue[],
  ): ValidationIndex {

    return {

      actions:
        this.indexById(
          knowledgePackage.actions,
          "action",
          "duplicate-action-id",
          issues,
        ),

      evidences:
        this.indexById(
          knowledgePackage.evidences,
          "evidence",
          "duplicate-evidence-id",
          issues,
        ),

      hypotheses:
        this.indexById(
          knowledgePackage.hypotheses,
          "hypothesis",
          "duplicate-hypothesis-id",
          issues,
        ),

      rules:
        this.indexById(
          knowledgePackage.rules,
          "rule",
          "duplicate-rule-id",
          issues,
        ),

    };

  }

  private indexById<T extends { id: string }>(
    values:
      T[],

    entityType:
      "action"
      | "evidence"
      | "hypothesis"
      | "rule",

    code:
      KnowledgeValidationCode,

    issues:
      KnowledgeValidationIssue[],
  ): Map<string, T> {

    const map =
      new Map<string, T>();

    for (const value of values) {

      if (map.has(value.id)) {

        issues.push({

          code,

          severity:
            "error",

          message:
            `Identifiant dupliqué "${value.id}" pour ${entityType}.`,

          entityType,

          entityId:
            value.id,

        });

      }

      map.set(
        value.id,
        value,
      );

    }

    return map;

  }

  private validatePackage(
    knowledgePackage:
      KnowledgePackage,

    issues:
      KnowledgeValidationIssue[],
  ): void {

    if (!knowledgePackage.domain.trim()) {

      issues.push({

        code:
          "missing-domain",

        severity:
          "error",

        message:
          "Le domaine du Knowledge Pack est absent.",

        entityType:
          "package",

      });

    }

    if (
      knowledgePackage.actions.length === 0
    ) {

      issues.push({

        code:
          "empty-actions",

        severity:
          "error",

        message:
          "Aucune action définie.",

        entityType:
          "package",

      });

    }

    if (
      knowledgePackage.evidences.length === 0
    ) {

      issues.push({

        code:
          "empty-evidences",

        severity:
          "error",

        message:
          "Aucune preuve définie.",

        entityType:
          "package",

      });

    }

    if (
      knowledgePackage.hypotheses.length === 0
    ) {

      issues.push({

        code:
          "empty-hypotheses",

        severity:
          "error",

        message:
          "Aucune hypothèse définie.",

        entityType:
          "package",

      });

    }

    if (
      knowledgePackage.rules.length === 0
    ) {

      issues.push({

        code:
          "empty-rules",

        severity:
          "warning",

        message:
          "Aucune règle définie.",

        entityType:
          "package",

      });

    }

  }

  private validateWorkflow(
    knowledgePackage:
      KnowledgePackage,

    index:
      ValidationIndex,

    issues:
      KnowledgeValidationIssue[],
  ): void {

    const workflow =
      knowledgePackage.workflow;

    if (!workflow.id.trim()) {

      issues.push({

        code:
          "invalid-workflow-id",

        severity:
          "error",

        message:
          "L'identifiant du workflow est absent.",

        entityType:
          "workflow",

      });

    }

    if (!workflow.title.trim()) {

      issues.push({

        code:
          "invalid-workflow-title",

        severity:
          "warning",

        message:
          `Le workflow "${workflow.id}" ne possède pas de titre.`,

        entityType:
          "workflow",

        entityId:
          workflow.id,

      });

    }

    if (!workflow.entryActionId.trim()) {

      issues.push({

        code:
          "missing-workflow-entry",

        severity:
          "error",

        message:
          "Aucune action d'entrée définie.",

        entityType:
          "workflow",

        entityId:
          workflow.id,

      });

    } else if (
      !index.actions.has(
        workflow.entryActionId,
      )
    ) {

      issues.push({

        code:
          "unknown-entry-action",

        severity:
          "error",

        message:
          `L'action d'entrée "${workflow.entryActionId}" n'existe pas.`,

        entityType:
          "workflow",

        entityId:
          workflow.id,

        relatedId:
          workflow.entryActionId,

      });

    }

    if (
      workflow.id &&
      knowledgePackage.domain &&
      workflow.id !==
        knowledgePackage.domain &&
      !workflow.id.startsWith(
        `${knowledgePackage.domain}-`,
      )
    ) {

      issues.push({

        code:
          "workflow-domain-mismatch",

        severity:
          "info",

        message:
          `Le workflow "${workflow.id}" ne correspond pas directement au domaine "${knowledgePackage.domain}".`,

        entityType:
          "workflow",

        entityId:
          workflow.id,

      });

    }

  }

  private validateActions(
    knowledgePackage:
      KnowledgePackage,

    index:
      ValidationIndex,

    issues:
      KnowledgeValidationIssue[],
  ): void {

    for (
      const action
      of knowledgePackage.actions
    ) {

      this.validateActionBasics(
        action,
        knowledgePackage,
        issues,
      );

      this.validateActionReferences(
        action,
        index,
        issues,
      );

      this.validateActionOptions(
        action,
        index,
        issues,
      );

      this.validateDiagnosisAction(
        action,
        index,
        issues,
      );

    }

  }

  private validateActionBasics(
    action:
      DiagnosticAction,

    knowledgePackage:
      KnowledgePackage,

    issues:
      KnowledgeValidationIssue[],
  ): void {

    if (!action.text.trim()) {

      issues.push({

        code:
          "empty-action-text",

        severity:
          "error",

        message:
          `L'action "${action.id}" ne contient aucun texte.`,

        entityType:
          "action",

        entityId:
          action.id,

      });

    }

    if (action.audiences.length === 0) {

      issues.push({

        code:
          "empty-action-audiences",

        severity:
          "warning",

        message:
          `L'action "${action.id}" ne cible aucun public.`,

        entityType:
          "action",

        entityId:
          action.id,

      });

    }

    if (
      !Number.isFinite(
        action.priority,
      ) ||
      action.priority < 0
    ) {

      issues.push({

        code:
          "invalid-action-priority",

        severity:
          "error",

        message:
          `La priorité de l'action "${action.id}" est invalide.`,

        entityType:
          "action",

        entityId:
          action.id,

      });

    }

    if (
      action.workflowId !==
        knowledgePackage.workflow.id &&
      action.workflowId !==
        knowledgePackage.domain
    ) {

      issues.push({

        code:
          "action-workflow-mismatch",

        severity:
          "warning",

        message:
          `L'action "${action.id}" référence le workflow "${action.workflowId}", différent de "${knowledgePackage.workflow.id}".`,

        entityType:
          "action",

        entityId:
          action.id,

        relatedId:
          action.workflowId,

      });

    }

    if (
      action.options &&
      action.options.length === 0
    ) {

      issues.push({

        code:
          "empty-option-list",

        severity:
          "warning",

        message:
          `L'action "${action.id}" possède une liste d'options vide.`,

        entityType:
          "action",

        entityId:
          action.id,

      });

    }

  }

  private validateActionReferences(
    action:
      DiagnosticAction,

    index:
      ValidationIndex,

    issues:
      KnowledgeValidationIssue[],
  ): void {

    if (
      action.nextActionId &&
      !index.actions.has(
        action.nextActionId,
      )
    ) {

      issues.push({

        code:
          "unknown-next-action",

        severity:
          "error",

        message:
          `L'action "${action.id}" pointe vers l'action inexistante "${action.nextActionId}".`,

        entityType:
          "action",

        entityId:
          action.id,

        relatedId:
          action.nextActionId,

      });

    }

    for (
      const actionId
      of action.requiredActions ?? []
    ) {

      if (index.actions.has(actionId)) {
        continue;
      }

      issues.push({

        code:
          "unknown-required-action",

        severity:
          "error",

        message:
          `L'action "${action.id}" exige l'action inexistante "${actionId}".`,

        entityType:
          "action",

        entityId:
          action.id,

        relatedId:
          actionId,

      });

    }

    for (
      const evidenceId
      of action.requiredEvidence ?? []
    ) {

      if (index.evidences.has(evidenceId)) {
        continue;
      }

      issues.push({

        code:
          "unknown-required-evidence",

        severity:
          "error",

        message:
          `L'action "${action.id}" exige la preuve inexistante "${evidenceId}".`,

        entityType:
          "action",

        entityId:
          action.id,

        relatedId:
          evidenceId,

      });

    }

    for (
      const evidenceId
      of action.excludedByEvidence ?? []
    ) {

      if (index.evidences.has(evidenceId)) {
        continue;
      }

      issues.push({

        code:
          "unknown-excluded-evidence",

        severity:
          "error",

        message:
          `L'action "${action.id}" est exclue par la preuve inexistante "${evidenceId}".`,

        entityType:
          "action",

        entityId:
          action.id,

        relatedId:
          evidenceId,

      });

    }

  }

  private validateActionOptions(
    action:
      DiagnosticAction,

    index:
      ValidationIndex,

    issues:
      KnowledgeValidationIssue[],
  ): void {

    const optionIds =
      new Set<string>();

    for (
      const option
      of action.options ?? []
    ) {

      if (optionIds.has(option.id)) {

        issues.push({

          code:
            "duplicate-option-id",

          severity:
            "error",

          message:
            `L'option "${option.id}" est dupliquée dans l'action "${action.id}".`,

          entityType:
            "option",

          entityId:
            option.id,

          relatedId:
            action.id,

        });

      }

      optionIds.add(option.id);

      this.validateOptionBasics(
        action,
        option,
        issues,
      );

      this.validateOptionReferences(
        action,
        option,
        index,
        issues,
      );

      this.validateOptionConflicts(
        action,
        option,
        issues,
      );

    }

  }

  private validateOptionBasics(
    action:
      DiagnosticAction,

    option:
      DiagnosticActionOption,

    issues:
      KnowledgeValidationIssue[],
  ): void {

    if (!option.label.trim()) {

      issues.push({

        code:
          "empty-option-label",

        severity:
          "error",

        message:
          `L'option "${option.id}" de l'action "${action.id}" ne possède pas de libellé.`,

        entityType:
          "option",

        entityId:
          option.id,

        relatedId:
          action.id,

      });

    }

    if (!option.value.trim()) {

      issues.push({

        code:
          "empty-option-value",

        severity:
          "warning",

        message:
          `L'option "${option.id}" de l'action "${action.id}" ne possède pas de valeur.`,

        entityType:
          "option",

        entityId:
          option.id,

        relatedId:
          action.id,

      });

    }

    const hasEffect =
      Boolean(option.nextActionId) ||
      (option.addsEvidence?.length ?? 0) > 0 ||
      (option.rejectsEvidence?.length ?? 0) > 0 ||
      (option.supportsHypotheses?.length ?? 0) > 0 ||
      (option.rejectsHypotheses?.length ?? 0) > 0;

    if (!hasEffect) {

      issues.push({

        code:
          "option-without-effect",

        severity:
          "warning",

        message:
          `L'option "${option.id}" de l'action "${action.id}" ne produit aucun effet.`,

        entityType:
          "option",

        entityId:
          option.id,

        relatedId:
          action.id,

      });

    }

  }

  private validateOptionReferences(
    action:
      DiagnosticAction,

    option:
      DiagnosticActionOption,

    index:
      ValidationIndex,

    issues:
      KnowledgeValidationIssue[],
  ): void {

    if (
      option.nextActionId &&
      !index.actions.has(
        option.nextActionId,
      )
    ) {

      issues.push({

        code:
          "invalid-option-next-action",

        severity:
          "error",

        message:
          `L'option "${option.id}" de l'action "${action.id}" pointe vers l'action inexistante "${option.nextActionId}".`,

        entityType:
          "option",

        entityId:
          option.id,

        relatedId:
          option.nextActionId,

      });

    }

    this.validateIds(
      action,
      option,
      option.addsEvidence ?? [],
      index.evidences,
      "unknown-option-added-evidence",
      "preuve ajoutée",
      issues,
    );

    this.validateIds(
      action,
      option,
      option.rejectsEvidence ?? [],
      index.evidences,
      "unknown-option-rejected-evidence",
      "preuve rejetée",
      issues,
    );

    this.validateIds(
      action,
      option,
      option.supportsHypotheses ?? [],
      index.hypotheses,
      "unknown-option-supported-hypothesis",
      "hypothèse soutenue",
      issues,
    );

    this.validateIds(
      action,
      option,
      option.rejectsHypotheses ?? [],
      index.hypotheses,
      "unknown-option-rejected-hypothesis",
      "hypothèse rejetée",
      issues,
    );

  }

  private validateIds<T>(
    action:
      DiagnosticAction,

    option:
      DiagnosticActionOption,

    ids:
      string[],

    target:
      Map<string, T>,

    code:
      KnowledgeValidationCode,

    label:
      string,

    issues:
      KnowledgeValidationIssue[],
  ): void {

    for (const id of ids) {

      if (target.has(id)) {
        continue;
      }

      issues.push({

        code,

        severity:
          "error",

        message:
          `L'option "${option.id}" de l'action "${action.id}" référence la ${label} inexistante "${id}".`,

        entityType:
          "option",

        entityId:
          option.id,

        relatedId:
          id,

      });

    }

  }

  private validateOptionConflicts(
    action:
      DiagnosticAction,

    option:
      DiagnosticActionOption,

    issues:
      KnowledgeValidationIssue[],
  ): void {

    const addedEvidenceIds =
      new Set(
        option.addsEvidence ?? [],
      );

    for (
      const evidenceId
      of option.rejectsEvidence ?? []
    ) {

      if (!addedEvidenceIds.has(evidenceId)) {
        continue;
      }

      issues.push({

        code:
          "conflicting-option-evidence",

        severity:
          "error",

        message:
          `L'option "${option.id}" de l'action "${action.id}" ajoute et rejette simultanément la preuve "${evidenceId}".`,

        entityType:
          "option",

        entityId:
          option.id,

        relatedId:
          evidenceId,

      });

    }

    const supportedHypothesisIds =
      new Set(
        option.supportsHypotheses ?? [],
      );

    for (
      const hypothesisId
      of option.rejectsHypotheses ?? []
    ) {

      if (
        !supportedHypothesisIds.has(
          hypothesisId,
        )
      ) {
        continue;
      }

      issues.push({

        code:
          "conflicting-option-hypothesis",

        severity:
          "error",

        message:
          `L'option "${option.id}" de l'action "${action.id}" soutient et rejette simultanément l'hypothèse "${hypothesisId}".`,

        entityType:
          "option",

        entityId:
          option.id,

        relatedId:
          hypothesisId,

      });

    }

  }

  private validateDiagnosisAction(
    action:
      DiagnosticAction,

    index:
      ValidationIndex,

    issues:
      KnowledgeValidationIssue[],
  ): void {

    if (
      action.type ===
        "complete-diagnosis"
    ) {

      if (!action.diagnosisId) {

        issues.push({

          code:
            "completion-without-diagnosis",

          severity:
            "error",

          message:
            `L'action de conclusion "${action.id}" ne possède aucun diagnostic.`,

          entityType:
            "action",

          entityId:
            action.id,

        });

      } else if (
        !index.hypotheses.has(
          action.diagnosisId,
        )
      ) {

        issues.push({

          code:
            "unknown-diagnosis-hypothesis",

          severity:
            "error",

          message:
            `L'action "${action.id}" référence l'hypothèse de diagnostic inexistante "${action.diagnosisId}".`,

          entityType:
            "action",

          entityId:
            action.id,

          relatedId:
            action.diagnosisId,

        });

      }

      return;

    }

    if (action.diagnosisId) {

      issues.push({

        code:
          "diagnosis-on-non-completion-action",

        severity:
          "warning",

        message:
          `L'action "${action.id}" possède diagnosisId sans être de type "complete-diagnosis".`,

        entityType:
          "action",

        entityId:
          action.id,

        relatedId:
          action.diagnosisId,

      });

    }

  }

  private validateRules(
    knowledgePackage:
      KnowledgePackage,

    index:
      ValidationIndex,

    issues:
      KnowledgeValidationIssue[],
  ): void {

    for (
      const rule
      of knowledgePackage.rules
    ) {

      let hasUnknownReference =
        false;

      if (
        !index.evidences.has(
          rule.evidenceId,
        )
      ) {

        hasUnknownReference =
          true;

        issues.push({

          code:
            "unknown-rule-evidence",

          severity:
            "error",

          message:
            `La règle "${rule.id}" référence la preuve inexistante "${rule.evidenceId}".`,

          entityType:
            "rule",

          entityId:
            rule.id,

          relatedId:
            rule.evidenceId,

        });

      }

      if (
        !index.hypotheses.has(
          rule.hypothesisId,
        )
      ) {

        hasUnknownReference =
          true;

        issues.push({

          code:
            "unknown-rule-hypothesis",

          severity:
            "error",

          message:
            `La règle "${rule.id}" référence l'hypothèse inexistante "${rule.hypothesisId}".`,

          entityType:
            "rule",

          entityId:
            rule.id,

          relatedId:
            rule.hypothesisId,

        });

      }

      if (
        !Number.isFinite(rule.weight) ||
        rule.weight <= 0
      ) {

        issues.push({

          code:
            "invalid-rule-weight",

          severity:
            "error",

          message:
            `La règle "${rule.id}" possède un poids invalide (${rule.weight}).`,

          entityType:
            "rule",

          entityId:
            rule.id,

        });

      }

      if (hasUnknownReference) {

        issues.push({

          code:
            "orphan-rule",

          severity:
            "warning",

          message:
            `La règle "${rule.id}" est inutilisable car une référence est absente.`,

          entityType:
            "rule",

          entityId:
            rule.id,

        });

      }

    }

    for (
      const evidence
      of knowledgePackage.evidences
    ) {

      if (
        !Number.isFinite(
          evidence.defaultConfidence,
        ) ||
        evidence.defaultConfidence < 0 ||
        evidence.defaultConfidence > 1
      ) {

        issues.push({

          code:
            "invalid-evidence-confidence",

          severity:
            "error",

          message:
            `La preuve "${evidence.id}" possède une confiance par défaut invalide (${evidence.defaultConfidence}).`,

          entityType:
            "evidence",

          entityId:
            evidence.id,

        });

      }

    }

  }

  private validateEvidenceUsage(
    knowledgePackage:
      KnowledgePackage,

    index:
      ValidationIndex,

    issues:
      KnowledgeValidationIssue[],
  ): void {

    const referencedEvidenceIds =
      new Set<string>();

    for (
      const action
      of knowledgePackage.actions
    ) {

      for (
        const evidenceId
        of action.requiredEvidence ?? []
      ) {
        referencedEvidenceIds.add(
          evidenceId,
        );
      }

      for (
        const evidenceId
        of action.excludedByEvidence ?? []
      ) {
        referencedEvidenceIds.add(
          evidenceId,
        );
      }

      for (
        const option
        of action.options ?? []
      ) {

        for (
          const evidenceId
          of option.addsEvidence ?? []
        ) {
          referencedEvidenceIds.add(
            evidenceId,
          );
        }

        for (
          const evidenceId
          of option.rejectsEvidence ?? []
        ) {
          referencedEvidenceIds.add(
            evidenceId,
          );
        }

      }

    }

    for (
      const rule
      of knowledgePackage.rules
    ) {

      referencedEvidenceIds.add(
        rule.evidenceId,
      );

    }

    for (
      const evidence
      of index.evidences.values()
    ) {

      if (
        referencedEvidenceIds.has(
          evidence.id,
        )
      ) {
        continue;
      }

      issues.push({

        code:
          "orphan-evidence",

        severity:
          "warning",

        message:
          `La preuve "${evidence.id}" n'est utilisée par aucune action ni règle.`,

        entityType:
          "evidence",

        entityId:
          evidence.id,

      });

    }

  }

  private validateHypothesisUsage(
    knowledgePackage:
      KnowledgePackage,

    index:
      ValidationIndex,

    issues:
      KnowledgeValidationIssue[],
  ): void {

    const referencedHypothesisIds =
      new Set<string>();

    const ruledHypothesisIds =
      new Set<string>();

    for (
      const action
      of knowledgePackage.actions
    ) {

      if (action.diagnosisId) {
        referencedHypothesisIds.add(
          action.diagnosisId,
        );
      }

      for (
        const option
        of action.options ?? []
      ) {

        for (
          const hypothesisId
          of option.supportsHypotheses ?? []
        ) {
          referencedHypothesisIds.add(
            hypothesisId,
          );
        }

        for (
          const hypothesisId
          of option.rejectsHypotheses ?? []
        ) {
          referencedHypothesisIds.add(
            hypothesisId,
          );
        }

      }

    }

    for (
      const rule
      of knowledgePackage.rules
    ) {

      referencedHypothesisIds.add(
        rule.hypothesisId,
      );

      ruledHypothesisIds.add(
        rule.hypothesisId,
      );

    }

    for (
      const hypothesis
      of index.hypotheses.values()
    ) {

      if (
        !referencedHypothesisIds.has(
          hypothesis.id,
        )
      ) {

        issues.push({

          code:
            "orphan-hypothesis",

          severity:
            "warning",

          message:
            `L'hypothèse "${hypothesis.id}" n'est utilisée par aucune action ni règle.`,

          entityType:
            "hypothesis",

          entityId:
            hypothesis.id,

        });

      }

      if (
        !ruledHypothesisIds.has(
          hypothesis.id,
        )
      ) {

        issues.push({

          code:
            "hypothesis-without-rules",

          severity:
            "warning",

          message:
            `L'hypothèse "${hypothesis.id}" ne possède aucune règle de support ou de contradiction.`,

          entityType:
            "hypothesis",

          entityId:
            hypothesis.id,

        });

      }

      if (
        hypothesis.possibleParts.length === 0
      ) {

        issues.push({

          code:
            "unused-part",

          severity:
            "info",

          message:
            `L'hypothèse "${hypothesis.id}" ne référence aucune pièce possible.`,

          entityType:
            "hypothesis",

          entityId:
            hypothesis.id,

        });

      }

      if (
        hypothesis.recommendedChecks.length === 0
      ) {

        issues.push({

          code:
            "unused-check",

          severity:
            "info",

          message:
            `L'hypothèse "${hypothesis.id}" ne propose aucun contrôle recommandé.`,

          entityType:
            "hypothesis",

          entityId:
            hypothesis.id,

        });

      }

    }

    const ruledEvidenceIds =
      new Set(
        knowledgePackage.rules.map(
          rule =>
            rule.evidenceId,
        ),
      );

    for (
      const evidence
      of index.evidences.values()
    ) {

      if (
        ruledEvidenceIds.has(
          evidence.id,
        )
      ) {
        continue;
      }

      issues.push({

        code:
          "evidence-without-rules",

        severity:
          "info",

        message:
          `La preuve "${evidence.id}" n'est utilisée par aucune règle.`,

        entityType:
          "evidence",

        entityId:
          evidence.id,

      });

    }

  }

  private findReachableActions(
    knowledgePackage:
      KnowledgePackage,

    index:
      ValidationIndex,
  ): Set<string> {

    const reachable =
      new Set<string>();

    const entryActionId =
      knowledgePackage.workflow
        .entryActionId;

    if (
      !entryActionId ||
      !index.actions.has(entryActionId)
    ) {
      return reachable;
    }

    const queue:
      string[] = [entryActionId];

    while (queue.length > 0) {

      const actionId =
        queue.shift();

      if (
        !actionId ||
        reachable.has(actionId)
      ) {
        continue;
      }

      reachable.add(actionId);

      const action =
        index.actions.get(actionId);

      if (!action) {
        continue;
      }

      const nextIds =
        this.getActionNextIds(
          action,
        );

      for (
        const nextId
        of nextIds
      ) {

        if (
          index.actions.has(nextId) &&
          !reachable.has(nextId)
        ) {
          queue.push(nextId);
        }

      }

    }

    return reachable;

  }

  private validateReachability(
    knowledgePackage:
      KnowledgePackage,

    reachableActionIds:
      ReadonlySet<string>,

    issues:
      KnowledgeValidationIssue[],
  ): void {

    for (
      const action
      of knowledgePackage.actions
    ) {

      if (
        reachableActionIds.has(
          action.id,
        )
      ) {
        continue;
      }

      issues.push({

        code:
          "unreachable-action",

        severity:
          "warning",

        message:
          `L'action "${action.id}" est inaccessible depuis l'entrée du workflow.`,

        entityType:
          "action",

        entityId:
          action.id,

      });

    }

  }

  private findCycles(
    knowledgePackage:
      KnowledgePackage,

    index:
      ValidationIndex,
  ): string[][] {

    const cycles:
      string[][] = [];

    const visited =
      new Set<string>();

    const stack =
      new Set<string>();

    const path:
      string[] = [];

    const visit = (
      actionId:
        string,
    ): void => {

      if (stack.has(actionId)) {

        const cycleStart =
          path.indexOf(actionId);

        if (cycleStart >= 0) {

          cycles.push([
            ...path.slice(cycleStart),
            actionId,
          ]);

        }

        return;

      }

      if (visited.has(actionId)) {
        return;
      }

      visited.add(actionId);
      stack.add(actionId);
      path.push(actionId);

      const action =
        index.actions.get(actionId);

      if (action) {

        for (
          const nextId
          of this.getActionNextIds(action)
        ) {

          if (index.actions.has(nextId)) {
            visit(nextId);
          }

        }

      }

      path.pop();
      stack.delete(actionId);

    };

    for (
      const action
      of knowledgePackage.actions
    ) {

      visit(action.id);

    }

    return this.uniqueCycles(
      cycles,
    );

  }

  private validateTerminalActions(
    knowledgePackage:
      KnowledgePackage,

    reachableActionIds:
      ReadonlySet<string>,

    issues:
      KnowledgeValidationIssue[],
  ): void {

    let terminalCount = 0;

    for (
      const action
      of knowledgePackage.actions
    ) {

      if (
        !reachableActionIds.has(
          action.id,
        )
      ) {
        continue;
      }

      if (
        this.getActionNextIds(action)
          .length > 0
      ) {
        continue;
      }

      terminalCount++;

    }

    if (terminalCount === 0) {

      issues.push({

        code:
          "missing-terminal-action",

        severity:
          "warning",

        message:
          "Le workflow ne possède aucune action terminale accessible.",

        entityType:
          "workflow",

        entityId:
          knowledgePackage.workflow.id,

      });

    }

  }

  private getActionNextIds(
    action:
      DiagnosticAction,
  ): string[] {

    const ids:
      string[] = [];

    if (action.nextActionId) {
      ids.push(action.nextActionId);
    }

    for (
      const option
      of action.options ?? []
    ) {

      if (option.nextActionId) {
        ids.push(option.nextActionId);
      }

    }

    return [
      ...new Set(ids),
    ];

  }

  private uniqueCycles(
    cycles:
      string[][],
  ): string[][] {

    const unique =
      new Map<string, string[]>();

    for (
      const cycle
      of cycles
    ) {

      const normalized =
        this.normalizeCycle(cycle);

      unique.set(
        normalized.join("|"),
        normalized,
      );

    }

    return [
      ...unique.values(),
    ];

  }

  private normalizeCycle(
    cycle:
      string[],
  ): string[] {

    const withoutDuplicateEnd =
      cycle.length > 1 &&
      cycle[0] ===
        cycle[cycle.length - 1]
        ? cycle.slice(0, -1)
        : [...cycle];

    if (
      withoutDuplicateEnd.length === 0
    ) {
      return [];
    }

    let best =
      [...withoutDuplicateEnd];

    for (
      let index = 1;
      index < withoutDuplicateEnd.length;
      index++
    ) {

      const rotated = [
        ...withoutDuplicateEnd.slice(index),
        ...withoutDuplicateEnd.slice(0, index),
      ];

      if (
        rotated.join("|") <
        best.join("|")
      ) {
        best = rotated;
      }

    }

    return [
      ...best,
      best[0],
    ];

  }

  private sortIssues(
    issues:
      KnowledgeValidationIssue[],
  ): KnowledgeValidationIssue[] {

    const severityRank:
      Record<
        KnowledgeValidationSeverity,
        number
      > = {

        error:
          0,

        warning:
          1,

        info:
          2,

      };

    return [...issues]
      .sort(
        (
          left,
          right,
        ) => {

          const severityComparison =
            severityRank[left.severity] -
            severityRank[right.severity];

          if (
            severityComparison !== 0
          ) {
            return severityComparison;
          }

          const codeComparison =
            left.code.localeCompare(
              right.code,
            );

          if (
            codeComparison !== 0
          ) {
            return codeComparison;
          }

          const entityComparison =
            (
              left.entityId ?? ""
            ).localeCompare(
              right.entityId ?? "",
            );

          if (
            entityComparison !== 0
          ) {
            return entityComparison;
          }

          return (
            left.relatedId ?? ""
          ).localeCompare(
            right.relatedId ?? "",
          );

        },
      );

  }

}
