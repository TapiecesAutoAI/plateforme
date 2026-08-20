export type ExtractedEvidence = {
  id: string;
  confidence: number;
};

type Pattern = {
  evidenceId: string;
  confidence: number;
  keywords: string[];
};

const PATTERNS: Pattern[] = [
  {
    evidenceId: "symptom-no-crank",
    confidence: 0.95,
    keywords: [
      "ne démarre pas",
      "ne demarre pas",
      "moteur ne tourne pas",
      "pas de démarrage",
      "pas de demarrage",
    ],
  },

  {
    evidenceId: "symptom-rapid-clicking",
    confidence: 0.96,
    keywords: [
      "clics rapides",
      "plusieurs clics",
      "cliquetis rapides",
    ],
  },

  {
    evidenceId: "symptom-single-click",
    confidence: 0.94,
    keywords: [
      "un clic",
      "un seul clic",
      "clic unique",
    ],
  },

  {
    evidenceId: "observation-lights-dim",
    confidence: 0.90,
    keywords: [
      "phares faibles",
      "phares baissent",
      "les phares baissent",
      "voyants faibles",
      "les lumières baissent",
      "les lumieres baissent",
    ],
  },

  {
    evidenceId: "observation-new-battery",
    confidence: 0.92,
    keywords: [
      "batterie neuve",
      "batterie récente",
      "batterie remplacée",
      "batterie remplacee",
    ],
  },
];

export class EvidenceExtractor {
  public extract(
    text: string,
  ): ExtractedEvidence[] {

    const normalized =
      text
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          "",
        )
        .toLowerCase();

    const evidences =
      new Map<
        string,
        ExtractedEvidence
      >();

    for (
      const pattern
      of PATTERNS
    ) {
      if (
        pattern.keywords.some(
          (keyword) =>
            normalized.includes(
              keyword
                .normalize("NFD")
                .replace(
                  /[\u0300-\u036f]/g,
                  "",
                )
                .toLowerCase(),
            ),
        )
      ) {
        evidences.set(
          pattern.evidenceId,
          {
            id:
              pattern.evidenceId,

            confidence:
              pattern.confidence,
          },
        );
      }
    }

    return [
      ...evidences.values(),
    ];
  }
}


