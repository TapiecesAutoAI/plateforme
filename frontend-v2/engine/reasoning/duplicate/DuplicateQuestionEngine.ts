import type {
  DiagnosticAction,
} from "../../core/actionTypes";

import {
  QuestionFamilyEngine,
} from "../family/QuestionFamilyEngine";

export interface DuplicateQuestionContext {
  completedActionIds:
    readonly string[];

  confirmedEvidenceIds:
    readonly string[];

  answeredFamilies:
    readonly string[];
}

type ActionMetadata =
  DiagnosticAction & {
    family?: string;
    stopIfKnown?: boolean;
  };

export class DuplicateQuestionEngine {
  private readonly questionFamilyEngine =
    new QuestionFamilyEngine();

  public isDuplicate(
    action:
      DiagnosticAction,

    context:
      DuplicateQuestionContext,
  ): boolean {
    if (
      context.completedActionIds.includes(
        action.id,
      )
    ) {
      return true;
    }

    const metadata =
      action as ActionMetadata;

    if (
      metadata.stopIfKnown ===
      false
    ) {
      return false;
    }

    const family =
      this.resolveFamily(
        action,
      );

    if (
      family !==
        "unknown" &&
      context.answeredFamilies.includes(
        family,
      )
    ) {
      return true;
    }

    return this.producesOnlyKnownEvidence(
      action,
      context.confirmedEvidenceIds,
    );
  }

  public collectAnsweredFamilies(
    actions:
      readonly DiagnosticAction[],

    completedActionIds:
      readonly string[],
  ): string[] {
    return [
      ...this
        .questionFamilyEngine
        .collectAnsweredFamilies(
          actions,
          completedActionIds,
        ),
    ];
  }
  public resolveFamily(
    action:
      DiagnosticAction,
  ): string {
    return this
      .questionFamilyEngine
      .resolve(
        action,
      );
  }
  private producesOnlyKnownEvidence(
    action:
      DiagnosticAction,

    confirmedEvidenceIds:
      readonly string[],
  ): boolean {
    const confirmed =
      new Set(
        confirmedEvidenceIds,
      );

    const producedEvidence =
      action.options?.flatMap(
        option => [
          ...(
            option.addsEvidence ??
            []
          ),

          ...(
            option.rejectsEvidence ??
            []
          ),
        ],
      ) ?? [];

    if (
      producedEvidence.length ===
      0
    ) {
      return false;
    }

    return producedEvidence.every(
      evidenceId =>
        confirmed.has(
          evidenceId,
        ),
    );
  }
}
