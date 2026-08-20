export interface StopSuggestion {
  shouldStop: boolean;
  confidence: number;
  message: string;
  continueAvailable: boolean;
}

export function buildStopSuggestion(
  recommended: boolean,
  confidence: number,
): StopSuggestion {

  if (recommended) {
    return {
      shouldStop: true,
      confidence,
      continueAvailable: true,
      message:
        "Nous pensons avoir trouvé la panne. Vous pouvez commander la pièce maintenant ou continuer quelques vérifications."
    };
  }

  if (confidence >= 80) {
    return {
      shouldStop: true,
      confidence,
      continueAvailable: true,
      message:
        "Le diagnostic est déjà très probable. Vous pouvez continuer si vous souhaitez augmenter la certitude."
    };
  }

  return {
    shouldStop: false,
    confidence,
    continueAvailable: false,
    message: ""
  };
}
