import type {
  ReasoningProfileId,
} from "../../model";

import type {
  PredictionSummary,
} from "../prediction/PredictionEngine";

import type {
  DiagnosticDecision,
} from "../DecisionEngineV3";

export interface ExplanationInput {
  prediction:
    PredictionSummary;

  decision:
    DiagnosticDecision;

  similarCaseCount:
    number;

  confirmedRepairs:
    number;
}

export type ExplanationDetailLevel =
  | "simple"
  | "guided"
  | "commercial"
  | "technical"
  | "intervention";

export type ExplanationRiskLabel =
  | "faible"
  | "moyen"
  | "élevé";

export interface CustomerExplanation {
  title:
    string;

  headline:
    string;

  confidence:
    number;

  stars:
    number;

  why:
    string[];

  nextAction:
    string;

  detailLevel:
    ExplanationDetailLevel;

  riskLabel:
    ExplanationRiskLabel;

  verificationMessage:
    string | null;
}

interface ProfileExplanationStrategy {
  detailLevel:
    ExplanationDetailLevel;

  highConfidenceMessage:
    string;

  mediumConfidenceMessage:
    string;

  lowConfidenceMessage:
    string;

  similarCasesLabel:
    (
      count:
        number,
    ) => string;

  confirmedRepairsLabel:
    (
      count:
        number,
    ) => string;

  askAction:
    string;

  testAction:
    string;

  concludeAction:
    string;

  sellAction:
    string;

  manualReviewAction:
    string;
}

const PROFILE_STRATEGIES:
  Record<
    ReasoningProfileId,
    ProfileExplanationStrategy
  > = {
    particulier: {
      detailLevel:
        "simple",

      highConfidenceMessage:
        "Vos réponses correspondent fortement à cette panne.",

      mediumConfidenceMessage:
        "Cette panne est actuellement la plus probable.",

      lowConfidenceMessage:
        "Les informations disponibles ne permettent pas encore d’être suffisamment certain.",

      similarCasesLabel:
        count =>
          `${count} situations similaires ont été observées.`,

      confirmedRepairsLabel:
        count =>
          `${count} réparations similaires ont confirmé ce diagnostic.`,

      askAction:
        "Répondez à une dernière question simple pour préciser le diagnostic.",

      testAction:
        "Effectuez le contrôle simple proposé avant d’acheter une pièce.",

      concludeAction:
        "Le diagnostic est suffisamment avancé. Vérifiez néanmoins la compatibilité de la pièce avec votre véhicule.",

      sellAction:
        "La pièce peut être recherchée, après vérification de sa compatibilité avec votre véhicule.",

      manualReviewAction:
        "Les réponses ne permettent pas une conclusion sûre. Faites contrôler le véhicule.",
    },

    bricoleur: {
      detailLevel:
        "guided",

      highConfidenceMessage:
        "Les symptômes et les contrôles réalisés convergent fortement vers cette panne.",

      mediumConfidenceMessage:
        "Cette hypothèse est la mieux soutenue par les contrôles réalisés.",

      lowConfidenceMessage:
        "Des contrôles complémentaires sont nécessaires avant de remplacer une pièce.",

      similarCasesLabel:
        count =>
          `${count} cas comparables sont disponibles.`,

      confirmedRepairsLabel:
        count =>
          `${count} réparations confirmées soutiennent cette hypothèse.`,

      askAction:
        "Poursuivez avec la question suivante.",

      testAction:
        "Effectuez le contrôle proposé avant le remplacement de la pièce.",

      concludeAction:
        "Le diagnostic est suffisamment précis pour orienter le contrôle final.",

      sellAction:
        "La pièce est probablement en cause. Confirmez son identification avant la commande.",

      manualReviewAction:
        "Les résultats sont contradictoires. Reprenez les contrôles ou demandez un avis professionnel.",
    },

    "vendeur-pieces-auto": {
      detailLevel:
        "commercial",

      highConfidenceMessage:
        "La probabilité de panne est élevée et le risque de retour paraît limité.",

      mediumConfidenceMessage:
        "Cette pièce est la meilleure piste, mais une confirmation est encore recommandée.",

      lowConfidenceMessage:
        "Le risque de vendre une pièce incorrecte reste trop élevé.",

      similarCasesLabel:
        count =>
          `${count} cas clients similaires recensés.`,

      confirmedRepairsLabel:
        count =>
          `${count} ventes ou réparations confirmées pour cette hypothèse.`,

      askAction:
        "Poser la prochaine question discriminante au client.",

      testAction:
        "Demander un contrôle complémentaire avant de confirmer la vente.",

      concludeAction:
        "Le diagnostic est exploitable, mais la compatibilité véhicule doit être confirmée.",

      sellAction:
        "Identifier la référence exacte par VIN ou référence constructeur avant la vente.",

      manualReviewAction:
        "Ne pas vendre la pièce pour le moment. Transmettre le dossier à un vendeur expérimenté ou à un garage.",
    },

    "mecanicien-garage": {
      detailLevel:
        "technical",

      highConfidenceMessage:
        "Les preuves disponibles soutiennent fortement cette hypothèse technique.",

      mediumConfidenceMessage:
        "Cette hypothèse domine, mais une validation technique ciblée reste nécessaire.",

      lowConfidenceMessage:
        "Le niveau de discrimination est insuffisant pour justifier un remplacement.",

      similarCasesLabel:
        count =>
          `${count} cas techniques comparables disponibles.`,

      confirmedRepairsLabel:
        count =>
          `${count} réparations validées soutiennent cette conclusion.`,

      askAction:
        "Poursuivre avec la mesure ou l’observation la plus discriminante.",

      testAction:
        "Effectuer le test technique recommandé avant remplacement.",

      concludeAction:
        "Le diagnostic est exploitable pour orienter la procédure de confirmation.",

      sellAction:
        "Confirmer la panne par mesure ou contrôle fonctionnel avant remplacement définitif.",

      manualReviewAction:
        "Les preuves sont contradictoires. Reprendre les mesures et contrôler les conditions du test.",
    },

    depanneur: {
      detailLevel:
        "intervention",

      highConfidenceMessage:
        "Cette panne est la cause la plus probable de l’immobilisation.",

      mediumConfidenceMessage:
        "Cette piste est prioritaire pour tenter une remise en route.",

      lowConfidenceMessage:
        "La cause reste incertaine. Évitez un remplacement de pièce sur place.",

      similarCasesLabel:
        count =>
          `${count} interventions similaires recensées.`,

      confirmedRepairsLabel:
        count =>
          `${count} remises en route confirmées dans des cas comparables.`,

      askAction:
        "Poser uniquement la question utile à l’intervention immédiate.",

      testAction:
        "Effectuer le contrôle rapide proposé pour tenter la remise en route.",

      concludeAction:
        "Orienter le véhicule vers l’atelier avec cette hypothèse prioritaire.",

      sellAction:
        "La pièce est probablement en cause, mais privilégier la remise en route ou le remorquage.",

      manualReviewAction:
        "La situation nécessite un contrôle sur place plus approfondi ou un remorquage.",
    },
  };

export class CustomerExplanationEngine {
  public build(
    input:
      ExplanationInput,
  ): CustomerExplanation {
    const profileId =
      input.decision.profileId ??
      "particulier";

    const strategy =
      PROFILE_STRATEGIES[
        profileId
      ];

    const confidence =
      this.normalizeConfidence(
        input.prediction.best.probability,
      );

    const why:
      string[] = [];

    if (
      confidence >=
      90
    ) {
      why.push(
        strategy.highConfidenceMessage,
      );
    }

    else if (
      confidence >=
      65
    ) {
      why.push(
        strategy.mediumConfidenceMessage,
      );
    }

    else {
      why.push(
        strategy.lowConfidenceMessage,
      );
    }

    if (
      input.similarCaseCount >
      0
    ) {
      why.push(
        strategy.similarCasesLabel(
          input.similarCaseCount,
        ),
      );
    }

    if (
      input.confirmedRepairs >
      0
    ) {
      why.push(
        strategy.confirmedRepairsLabel(
          input.confirmedRepairs,
        ),
      );
    }

    why.push(
      ...input.decision.explanation
        .filter(
          message =>
            message.trim().length >
            0,
        )
        .slice(
          0,
          profileId ===
            "particulier"
            ? 2
            : 4,
        ),
    );

    const nextAction =
      this.resolveNextAction(
        input.decision,
        strategy,
      );

    const riskLabel =
      this.resolveRiskLabel(
        confidence,
        input.decision,
      );

    return {
      title:
        input.prediction.best.hypothesisId,

      headline:
        this.resolveHeadline(
          profileId,
          confidence,
          input.decision,
        ),

      confidence,

      stars:
        this.computeStars(
          confidence,
        ),

      why:
        this.uniqueMessages(
          why,
        ),

      nextAction,

      detailLevel:
        strategy.detailLevel,

      riskLabel,

      verificationMessage:
        this.resolveVerificationMessage(
          profileId,
          riskLabel,
          input.decision,
        ),
    };
  }

  private resolveNextAction(
    decision:
      DiagnosticDecision,

    strategy:
      ProfileExplanationStrategy,
  ): string {
    switch (
      decision.type
    ) {
      case "sell-part":
        return strategy.sellAction;

      case "recommend-test":
        return strategy.testAction;

      case "conclude":
        return strategy.concludeAction;

      case "manual-review":
        return strategy.manualReviewAction;

      case "ask-question":
      default:
        return strategy.askAction;
    }
  }

  private resolveHeadline(
    profileId:
      ReasoningProfileId,

    confidence:
      number,

    decision:
      DiagnosticDecision,
  ): string {
    if (
      decision.type ===
      "manual-review"
    ) {
      return "Vérification professionnelle nécessaire";
    }

    if (
      profileId ===
      "vendeur-pieces-auto"
    ) {
      return confidence >=
        90
        ? "Vente possible après identification du véhicule"
        : "Contrôle supplémentaire avant la vente";
    }

    if (
      profileId ===
      "mecanicien-garage"
    ) {
      return confidence >=
        85
        ? "Hypothèse technique principale"
        : "Diagnostic à confirmer";
    }

    if (
      profileId ===
      "depanneur"
    ) {
      return "Priorité d’intervention";
    }

    return confidence >=
      85
      ? "Panne très probable"
      : confidence >=
          60
        ? "Panne probable"
        : "Diagnostic encore incertain";
  }

  private resolveRiskLabel(
    confidence:
      number,

    decision:
      DiagnosticDecision,
  ): ExplanationRiskLabel {
    if (
      decision.type ===
        "manual-review" ||
      confidence <
        55
    ) {
      return "élevé";
    }

    if (
      confidence <
        82 ||
      decision.shouldTest
    ) {
      return "moyen";
    }

    return "faible";
  }

  private resolveVerificationMessage(
    profileId:
      ReasoningProfileId,

    riskLabel:
      ExplanationRiskLabel,

    decision:
      DiagnosticDecision,
  ): string | null {
    if (
      riskLabel ===
      "faible" &&
      decision.type ===
      "sell-part"
    ) {
      return profileId ===
        "vendeur-pieces-auto"
        ? "Vérifier le VIN, la motorisation et la référence constructeur avant de valider la vente."
        : "Vérifiez la compatibilité exacte de la pièce avec votre véhicule.";
    }

    if (
      riskLabel ===
      "moyen"
    ) {
      return "Une vérification supplémentaire est recommandée avant tout achat ou remplacement.";
    }

    if (
      riskLabel ===
      "élevé"
    ) {
      return "Ne remplacez pas de pièce sur cette seule conclusion.";
    }

    return null;
  }

  private computeStars(
    confidence:
      number,
  ): number {
    if (
      confidence >=
      95
    ) {
      return 5;
    }

    if (
      confidence >=
      85
    ) {
      return 4;
    }

    if (
      confidence >=
      70
    ) {
      return 3;
    }

    if (
      confidence >=
      50
    ) {
      return 2;
    }

    return 1;
  }

  private normalizeConfidence(
    value:
      number,
  ): number {
    const percentage =
      value <=
      1
        ? value *
          100
        : value;

    return Math.min(
      100,
      Math.max(
        0,
        Math.round(
          percentage,
        ),
      ),
    );
  }

  private uniqueMessages(
    messages:
      readonly string[],
  ): string[] {
    return [
      ...new Set(
        messages
          .map(
            message =>
              message.trim(),
          )
          .filter(
            message =>
              message.length >
              0,
          ),
      ),
    ];
  }
}