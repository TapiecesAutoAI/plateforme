import type {
  InformationGain,
  Question,
  ReasoningContext,
} from "../../model";
import {
  QuestionFamilyEngine,
} from "../family/QuestionFamilyEngine";

import type {
  QuestionFamilyId,
} from "../family/QuestionFamilyEngine";

export interface NextQuestionSelectorOptions {
  minimumGain:
    number;
}

const DEFAULT_OPTIONS:
  NextQuestionSelectorOptions = {
    minimumGain:
      0.01,
  };

type StartingBranch =
  | "unknown"
  | "single-click"
  | "rapid-clicks"
  | "no-sound"
  | "starter-spins"
  | "engine-cranks";

export class NextQuestionSelector {
  private readonly questionFamilyEngine =
    new QuestionFamilyEngine();

  private readonly options:
    NextQuestionSelectorOptions;

  public constructor(
    options:
      Partial<NextQuestionSelectorOptions> = {},
  ) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
  }

  public select(
    gains:
      readonly InformationGain[],

    context:
      ReasoningContext,
  ): Question | null {
    const answeredFamilies =
      this.collectAnsweredFamilies(
        context,
      );

    const branch =
      this.detectStartingBranch(
        context,
      );

    const candidates =
      gains
        .filter(
          item =>
            Number.isFinite(
              item.gain,
            ),
        )
        .filter(
          item =>
            item.gain >=
            this.options.minimumGain,
        )
        .filter(
          item =>
            !context.completedQuestionIds.has(
              item.question.id,
            ),
        )
        // CHAT13: skip questions whose target evidence is already known
        .filter(
          item =>
            item.question.targetEvidenceIds.length === 0 ||
            !item.question.targetEvidenceIds.some(
              evidenceId =>
                context.confirmedEvidenceIds.has(
                  evidenceId,
                ),
            ),
        )
        .filter(
          item =>
            !answeredFamilies.has(
              this.resolveFamily(
                item.question,
              ),
            ),
        )
        .filter(
          item =>
            this.isAllowedForBranch(
              item.question,
              branch,
            ),
        )
        .sort(
          (
            left,
            right,
          ) => {
            const leftFamily =
              this.resolveFamily(
                left.question,
              );

            const rightFamily =
              this.resolveFamily(
                right.question,
              );

            if (
              branch ===
              "engine-cranks"
            ) {
              const priorityFamily = (
                family: QuestionFamilyId,
              ) =>
                family === "fuel-level" ||
                family === "fuel-pump" ||
                family === "engine-start-intent"
                  ? 0
                  : 1;

              const leftPriority =
                priorityFamily(
                  leftFamily,
                );

              const rightPriority =
                priorityFamily(
                  rightFamily,
                );

              if (
                leftPriority !==
                rightPriority
              ) {
                return (
                  leftPriority -
                  rightPriority
                );
              }
            }

            if (
              right.gain !==
              left.gain
            ) {
              return (
                right.gain -
                left.gain
              );
            }

            if (
              left.question.cost !==
              right.question.cost
            ) {
              return (
                left.question.cost -
                right.question.cost
              );
            }

            return left.question.text
              .localeCompare(
                right.question.text,
              );
          },

        );
    return (
      candidates[0]
        ?.question ??
      null
    );
  }

  private collectAnsweredFamilies(
    context:
      ReasoningContext,
  ): Set<QuestionFamilyId> {
    const result =
      new Set<QuestionFamilyId>();

    for (
      const questionId
      of context.completedQuestionIds
    ) {
      const question =
        context.questions.get(
          questionId,
        );

      if (!question) {
        continue;
      }

      result.add(
        this.resolveFamily(
          question,
        ),
      );
    }

    return result;
  }

  private detectStartingBranch(
    context:
      ReasoningContext,
  ): StartingBranch {
    const source =
      [
        ...context.confirmedEvidenceIds,
      ]
        .join(" ")
        .toLowerCase()
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          "",
        );

    if (
      this.containsAny(
        source,
        [
          "single-click",
          "single_click",
          "clic-unique",
          "un-seul-clic",
        ],
      )
    ) {
      return "single-click";
    }

    if (
      this.containsAny(
        source,
        [
          "rapid-click",
          "rapid_click",
          "multiple-click",
          "clics-rapides",
        ],
      )
    ) {
      return "rapid-clicks";
    }

    if (
      this.containsAny(
        source,
        [
          "starter-spins",
          "spins-free",
          "tourne-dans-le-vide",
        ],
      )
    ) {
      return "starter-spins";
    }

    if (
      this.containsAny(
        source,
        [
          "engine-cranks",
          "engine-turns",
          "moteur-tourne",
        ],
      )
    ) {
      return "engine-cranks";
    }

    if (
      this.containsAny(
        source,
        [
          "no-sound",
          "aucun-bruit",
          "silent",
        ],
      )
    ) {
      return "no-sound";
    }

    return "unknown";
  }

  private isAllowedForBranch(
    question:
      Question,

    branch:
      StartingBranch,
  ): boolean {
    if (
      branch ===
      "unknown"
    ) {
      return true;
    }

    const family =
      this.resolveFamily(
        question,
      );
    if (
      branch ===
        "no-sound"
    ) {
      return ![
        "fuel-level",
        "fuel-pump",
        "engine-start-intent",
      ].includes(
        family,
      );
    }

    if (
      branch ===
        "single-click" ||
      branch ===
        "rapid-clicks"
    ) {
      return ![
        "fuel-level",
        "fuel-pump",
        "immobilizer",
        "engine-start-intent",
      ].includes(
        family,
      );
    }

    if (
      branch ===
      "starter-spins"
    ) {
      return [
        "starter-rotation",
        "engine-start-intent",
        "starting-behaviour",
      ].includes(
        family,
      );
    }

    if (
      branch ===
      "engine-cranks"
    ) {
      return ![
        "booster-result",
        "battery-terminals",
        "battery-voltage",
        "starter-rotation",
      ].includes(
        family,
      );
    }

    return true;
  }

  private resolveFamily(
    question:
      Question,
  ): QuestionFamilyId {
    return this
      .questionFamilyEngine
      .resolve(
        question as any,
      );
  }
  private containsAny(
    source:
      string,

    values:
      readonly string[],
  ): boolean {
    return values.some(
      value =>
        source.includes(
          value,
        ),
    );
  }
}
