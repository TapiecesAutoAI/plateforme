export type DiagnosticProfile =
  | "particulier"
  | "bricoleur"
  | "vendeur-pieces-auto"
  | "mecanicien-garage"
  | "depanneur";

export type DiagnosticTechnicalLevel =
  | "simple"
  | "intermediate"
  | "advanced"
  | "expert";

export interface ProfileStrategy {
  profile: DiagnosticProfile;

  maximumQuestions: number;

  maximumDurationSeconds: number;

  maximumTechnicalLevel: DiagnosticTechnicalLevel;

  allowMeasurements: boolean;

  allowTools: boolean;

  allowTechnicalVocabulary: boolean;

  allowProfessionalChecks: boolean;

  stopConfidence: number;

  sellConfidence: number;

  maximumAcceptedRisk: number;

  preferSimpleQuestions: boolean;

  preferFastQuestions: boolean;

  objective:
    | "rapid-part-recommendation"
    | "guided-confirmation"
    | "sales-assistance"
    | "complete-diagnosis"
    | "rapid-roadside-action";
}

export interface ProfileQuestionMetadata {
  technicalLevel?:
    DiagnosticTechnicalLevel;

  requiresTool?:
    boolean;

  requiresMeasurement?:
    boolean;

  estimatedTimeSeconds?:
    number;

  difficulty?:
    1 | 2 | 3 | 4 | 5;

  audiences?:
    DiagnosticProfile[];
}

export interface ProfileQuestionDecision {
  allowed: boolean;

  reason:
    | "allowed"
    | "audience-not-allowed"
    | "technical-level-too-high"
    | "tool-not-allowed"
    | "measurement-not-allowed"
    | "difficulty-too-high"
    | "duration-too-high";
}

const TECHNICAL_LEVEL_ORDER:
  Record<
    DiagnosticTechnicalLevel,
    number
  > = {
    simple: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
  };

const STRATEGIES:
  Record<
    DiagnosticProfile,
    ProfileStrategy
  > = {
    particulier: {
      profile:
        "particulier",

      maximumQuestions:
        5,

      maximumDurationSeconds:
        90,

      maximumTechnicalLevel:
        "simple",

      allowMeasurements:
        false,

      allowTools:
        false,

      allowTechnicalVocabulary:
        false,

      allowProfessionalChecks:
        false,

      stopConfidence:
        75,

      sellConfidence:
        90,

      maximumAcceptedRisk:
        10,

      preferSimpleQuestions:
        true,

      preferFastQuestions:
        true,

      objective:
        "rapid-part-recommendation",
    },

    bricoleur: {
      profile:
        "bricoleur",

      maximumQuestions:
        7,

      maximumDurationSeconds:
        180,

      maximumTechnicalLevel:
        "intermediate",

      allowMeasurements:
        true,

      allowTools:
        true,

      allowTechnicalVocabulary:
        true,

      allowProfessionalChecks:
        false,

      stopConfidence:
        82,

      sellConfidence:
        92,

      maximumAcceptedRisk:
        8,

      preferSimpleQuestions:
        true,

      preferFastQuestions:
        true,

      objective:
        "guided-confirmation",
    },

    "vendeur-pieces-auto": {
      profile:
        "vendeur-pieces-auto",

      maximumQuestions:
        8,

      maximumDurationSeconds:
        240,

      maximumTechnicalLevel:
        "advanced",

      allowMeasurements:
        true,

      allowTools:
        true,

      allowTechnicalVocabulary:
        true,

      allowProfessionalChecks:
        true,

      stopConfidence:
        85,

      sellConfidence:
        94,

      maximumAcceptedRisk:
        6,

      preferSimpleQuestions:
        false,

      preferFastQuestions:
        true,

      objective:
        "sales-assistance",
    },

    "mecanicien-garage": {
      profile:
        "mecanicien-garage",

      maximumQuestions:
        15,

      maximumDurationSeconds:
        900,

      maximumTechnicalLevel:
        "expert",

      allowMeasurements:
        true,

      allowTools:
        true,

      allowTechnicalVocabulary:
        true,

      allowProfessionalChecks:
        true,

      stopConfidence:
        92,

      sellConfidence:
        97,

      maximumAcceptedRisk:
        3,

      preferSimpleQuestions:
        false,

      preferFastQuestions:
        false,

      objective:
        "complete-diagnosis",
    },

    depanneur: {
      profile:
        "depanneur",

      maximumQuestions:
        6,

      maximumDurationSeconds:
        120,

      maximumTechnicalLevel:
        "advanced",

      allowMeasurements:
        true,

      allowTools:
        true,

      allowTechnicalVocabulary:
        true,

      allowProfessionalChecks:
        true,

      stopConfidence:
        80,

      sellConfidence:
        90,

      maximumAcceptedRisk:
        10,

      preferSimpleQuestions:
        true,

      preferFastQuestions:
        true,

      objective:
        "rapid-roadside-action",
    },
  };

export class ProfileStrategyEngine {
  public getStrategy(
    profile:
      DiagnosticProfile,
  ): ProfileStrategy {
    return {
      ...STRATEGIES[
        profile
      ],
    };
  }

  public canAskQuestion(
    profile:
      DiagnosticProfile,

    question:
      ProfileQuestionMetadata,
  ): ProfileQuestionDecision {
    const strategy =
      this.getStrategy(
        profile,
      );

    if (
      question.audiences &&
      !question.audiences.includes(
        profile,
      )
    ) {
      return {
        allowed:
          false,

        reason:
          "audience-not-allowed",
      };
    }

    const technicalLevel =
      question.technicalLevel ??
      this.inferTechnicalLevel(
        question,
      );

    if (
      TECHNICAL_LEVEL_ORDER[
        technicalLevel
      ] >
      TECHNICAL_LEVEL_ORDER[
        strategy.maximumTechnicalLevel
      ]
    ) {
      return {
        allowed:
          false,

        reason:
          "technical-level-too-high",
      };
    }

    if (
      question.requiresTool ===
        true &&
      !strategy.allowTools
    ) {
      return {
        allowed:
          false,

        reason:
          "tool-not-allowed",
      };
    }

    if (
      question.requiresMeasurement ===
        true &&
      !strategy.allowMeasurements
    ) {
      return {
        allowed:
          false,

        reason:
          "measurement-not-allowed",
      };
    }

    const difficulty =
      question.difficulty ??
      1;

    if (
      profile ===
        "particulier" &&
      difficulty > 2
    ) {
      return {
        allowed:
          false,

        reason:
          "difficulty-too-high",
      };
    }

    if (
      profile ===
        "depanneur" &&
      (
        question
          .estimatedTimeSeconds ??
        15
      ) > 60
    ) {
      return {
        allowed:
          false,

        reason:
          "duration-too-high",
      };
    }

    return {
      allowed:
        true,

      reason:
        "allowed",
    };
  }

  public shouldStop(
    profile:
      DiagnosticProfile,

    questionCount:
      number,

    elapsedSeconds:
      number,

    confidence:
      number,

    risk:
      number,
  ): boolean {
    const strategy =
      this.getStrategy(
        profile,
      );

    if (
      questionCount >=
      strategy.maximumQuestions
    ) {
      return true;
    }

    if (
      elapsedSeconds >=
      strategy
        .maximumDurationSeconds
    ) {
      return true;
    }

    if (
      confidence >=
        strategy.stopConfidence &&
      risk <=
        strategy
          .maximumAcceptedRisk
    ) {
      return true;
    }

    return false;
  }

  public canSell(
    profile:
      DiagnosticProfile,

    confidence:
      number,

    risk:
      number,
  ): boolean {
    const strategy =
      this.getStrategy(
        profile,
      );

    return (
      confidence >=
        strategy.sellConfidence &&
      risk <=
        strategy
          .maximumAcceptedRisk
    );
  }

  private inferTechnicalLevel(
    question:
      ProfileQuestionMetadata,
  ): DiagnosticTechnicalLevel {
    if (
      question.requiresMeasurement
    ) {
      return "advanced";
    }

    if (
      question.requiresTool
    ) {
      return "intermediate";
    }

    if (
      (
        question.difficulty ??
        1
      ) >= 5
    ) {
      return "expert";
    }

    if (
      (
        question.difficulty ??
        1
      ) >= 3
    ) {
      return "intermediate";
    }

    return "simple";
  }
}
