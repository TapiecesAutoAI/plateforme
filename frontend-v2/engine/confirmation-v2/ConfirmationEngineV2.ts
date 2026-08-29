import type {
  ProbabilityResult,
  Question,
  ReasoningContext,
} from "../model";

import {
  DecisionPipeline,
  type DeveloperPipelineMetrics,
} from "./DecisionPipeline";

export interface ConfirmationV2Candidate {
  question:
    Question;

  score:
    number;

  informationGain:
    number;

  branchCompatible:
    boolean;
}

export interface ConfirmationV2Result {
  shouldConfirm:
    boolean;

  confidence:
    number;

  selectedCandidate:
    ConfirmationV2Candidate | null;

  candidates:
    ConfirmationV2Candidate[];

  metrics:
    DeveloperPipelineMetrics;

  reason:
    string;
}

type StartingBranch =
  | "single-click"
  | "rapid-clicks"
  | "slow-crank"
  | "no-sound"
  | "cranks-no-start"
  | "unknown";

const EMPTY_METRICS:
  DeveloperPipelineMetrics = {
  hypothesisCount: 0,
  evidenceCount: 0,
  questionCount: 0,
  averageScore: 0,
  bestScore: 0,
  informationGain: 0,
};

export class ConfirmationEngineV2 {
  private readonly pipeline =
    new DecisionPipeline();

  public evaluate(
    context:
      ReasoningContext,

    questions:
      readonly Question[],

    probabilities:
      readonly ProbabilityResult[],
  ): ConfirmationV2Result {
    const confidence =
      probabilities[0]
        ?.probability ??
      0;

    const answeredQuestionCount =
      context.completedQuestionIds.size;

    const maximumQuestionCount =
      context.progress
        ?.maximumQuestionCount ??
      5;

    const branch =
      this.detectBranch(
        context,
      );

    if (
      answeredQuestionCount >= maximumQuestionCount
    ) {
      return this.emptyResult(
        confidence,
        "Nombre maximal de questions atteint.",
        context,
        probabilities,
      );
    }

    if (
      branch === "single-click" &&
      answeredQuestionCount >= 3 &&
      confidence >= 0.80
    ) {
      return this.emptyResult(
        confidence,
        "Diagnostic suffisamment stable.",
        context,
        probabilities,
      );
    }

    if (confidence < 0.7) {
      return this.emptyResult(
        confidence,
        "Confiance insuffisante.",
        context,
        probabilities,
      );
    }


    const availableQuestions =
      questions.filter(
        question =>
          !context
            .completedQuestionIds
            .has(
              question.id,
            ) &&
          this.isCompatibleWithBranch(
            question,
            branch,
          ) &&
          !this.isSemanticallyCompleted(
            question,
            context,
          ),
      );

    const evidences =
      Array.from(
        context.evidences.values(),
      );

    const result =
      this.pipeline.execute(
        evidences,
        availableQuestions,
        probabilities,
      );

    if (
      confidence >= 0.95
    ) {
      return this.emptyResult(
        confidence,
        "Diagnostic confirmé.",
        context,
        probabilities,
      );
    }

    return {
      shouldConfirm:
        result.bestQuestion !==
        null,

      confidence,

      selectedCandidate:
        result.bestQuestion,

      candidates:
        result.rankedQuestions,

      metrics:
        result.metrics,

      reason:
        result.bestQuestion
          ? `Question optimale trouvée pour la branche ${branch}.`
          : `Aucune question utile pour la branche ${branch}.`,
    };
  }

  private detectBranch(
    context:
      ReasoningContext,
  ): StartingBranch {
    const ids =
      [
        ...context.confirmedEvidenceIds,
      ]
        .join(" ")
        .toLowerCase();

    if (
      this.containsAny(
        ids,
        [
          "single-click",
          "single_click",
          "one-click",
          "one_click",
          "clic-unique",
          "clic_unique",
          "un-seul-clic",
          "un_seul_clic",
        ],
      )
    ) {
      return "single-click";
    }

    if (
      this.containsAny(
        ids,
        [
          "rapid-click",
          "rapid_click",
          "multiple-click",
          "multiple_click",
          "clics-rapides",
          "clics_rapides",
        ],
      )
    ) {
      return "rapid-clicks";
    }

    if (
      this.containsAny(
        ids,
        [
          "slow-crank",
          "slow_crank",
          "crank-slow",
          "crank_slow",
          "tourne-lentement",
          "tourne_lentement",
        ],
      )
    ) {
      return "slow-crank";
    }

    if (
      this.containsAny(
        ids,
        [
          "no-sound",
          "no_sound",
          "silent",
          "aucun-bruit",
          "aucun_bruit",
        ],
      )
    ) {
      return "no-sound";
    }

    if (
      this.containsAny(
        ids,
        [
          "cranks-no-start",
          "cranks_no_start",
          "engine-cranks",
          "engine_cranks",
          "tourne-sans-demarrer",
          "tourne_sans_demarrer",
        ],
      )
    ) {
      return "cranks-no-start";
    }

    return "unknown";
  }

  private isCompatibleWithBranch(
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

    const source =
      `${question.id} ${question.text}`
        .toLowerCase()
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          "",
        );

    const branchMarkers:
      Record<
        Exclude<
          StartingBranch,
          "unknown"
        >,
        string[]
      > = {
      "single-click": [
        "single-click",
        "single_click",
        "clic unique",
        "un seul clic",
      ],

      "rapid-clicks": [
        "rapid-click",
        "rapid_click",
        "clics rapides",
        "plusieurs clics",
      ],

      "slow-crank": [
        "slow-crank",
        "slow_crank",
        "tourne lentement",
        "demarrage lent",
      ],

      "no-sound": [
        "no-sound",
        "no_sound",
        "aucun bruit",
        "silence",
      ],

      "cranks-no-start": [
        "cranks-no-start",
        "cranks_no_start",
        "tourne sans demarrer",
        "moteur tourne",
      ],
    };

    for (
      const [
        candidateBranch,
        markers,
      ]
      of Object.entries(
        branchMarkers,
      )
    ) {
      if (
        candidateBranch !==
          branch &&
        this.containsAny(
          source,
          markers,
        )
      ) {
        return false;
      }
    }

    return true;
  }

  private isSemanticallyCompleted(
  question: Question,
  context: ReasoningContext,
): boolean {
  const completed =
    context.completedQuestionIds;

  const id =
    question.id.toLowerCase();

  /*
   * BOOSTER / JUMP-START SEMANTIC FAMILY
   *
   * Une fois qu'une question booster a été répondue,
   * les autres variantes de la même vérification
   * ne doivent plus consommer une question.
   */
  const boosterQuestionIds =
    new Set<string>([
      "starting-jump-test",
      "starting-booster-sound",
      "starting-booster-availability",
      "starting-booster-test",
      "starting-booster-retest",
    ]);

  const boosterAlreadyAnswered =
    [...boosterQuestionIds].some(
      completedQuestionId =>
        completed.has(
          completedQuestionId,
        ),
    );

  if (
    boosterAlreadyAnswered &&
    (
      boosterQuestionIds.has(
        question.id,
      ) ||
      id.includes("booster") ||
      id.includes("jump")
    )
  ) {
    return true;
  }
  /*
   * IMMOBILIZER SEMANTIC FAMILY
   *
   * If immobilizer evidence is already known, another
   * immobilizer/key/lock question must not consume
   * an additional diagnostic question.
   */
  const immobilizerAlreadyKnown =
    context.confirmedEvidenceIds.has(
      "observation-immobilizer-warning",
    ) ||
    context.rejectedEvidenceIds.has(
      "observation-immobilizer-warning",
    ) ||
    context.progress
      ?.answeredQuestionFamilies
      ?.has("immobilizer") === true;

  const normalizedQuestionText =
    question.text
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      );

  if (
    immobilizerAlreadyKnown &&
    (
      id.includes("immobilizer") ||
      id.includes("antivol") ||
      id.includes("antidemarrage") ||
      normalizedQuestionText.includes(
        "antidemarrage",
      ) ||
      normalizedQuestionText.includes(
        "antivol",
      ) ||
      normalizedQuestionText.includes(
        "voyant de cle",
      ) ||
      normalizedQuestionText.includes(
        "cadenas",
      )
    )
  ) {
    return true;
  }

  if (
    completed.has("starting-lights") &&
    (
      id.includes("lights") ||
      id.includes("general-lights")
    )
  ) {
    return true;
  }

  if (
    completed.has("starting-jump-test") &&
    (
      id.includes("jump") ||
      id.includes("booster")
    )
  ) {
    return true;
  }

  if (
    completed.has("starting-battery-voltage") &&
    (
      id.includes("battery") ||
      id.includes("voltage")
    )
  ) {
    return true;
  }

  if (
    completed.has("starting-starter-command-check") &&
    id.includes("control-voltage")
  ) {
    return true;
  }

  if (
    completed.has("starting-hot-engine") &&
    id.includes("hot-engine")
  ) {
    return true;
  }

  if (
    completed.has("starting-intermittent") &&
    id.includes("intermittent")
  ) {
    return true;
  }

  return false;
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

  private emptyResult(
    confidence:
      number,

    reason:
      string,

    context:
      ReasoningContext,

    probabilities:
      readonly ProbabilityResult[],
  ): ConfirmationV2Result {
    const metrics:
      DeveloperPipelineMetrics = {
      hypothesisCount:
        probabilities.length,

      evidenceCount:
        context.evidences.size,

      questionCount:
        context.completedQuestionIds.size,

      averageScore:
        0,

      bestScore:
        0,

      informationGain:
        0,
    };

    return {
      shouldConfirm:
        false,

      confidence,

      selectedCandidate:
        null,

      candidates:
        [],

      metrics,

      reason,
    };
  }
}

