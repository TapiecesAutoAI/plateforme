export type DiagnosticPartSource = {
  partRecommendation?: {
    primaryPart?: {
      partName?: string | null;
    } | null;
  } | null;

  salesRecommendation?: {
    partName?: string | null;
  } | null;

  conclusion?: {
    possibleParts?: string[];
  } | null;
};

export type DiagnosticPartResolution = {
  partName: string | null;
  source:
    | "part-recommendation"
    | "sales-recommendation"
    | "conclusion"
    | "none";
};

export class DiagnosticPartResolver {
  public resolve(
    diagnostic: DiagnosticPartSource,
  ): DiagnosticPartResolution {
    const recommendedPart =
      diagnostic.partRecommendation
        ?.primaryPart
        ?.partName
        ?.trim();

    if (recommendedPart) {
      return {
        partName: recommendedPart,
        source: "part-recommendation",
      };
    }

    const salesPart =
      diagnostic.salesRecommendation
        ?.partName
        ?.trim();

    if (salesPart) {
      return {
        partName: salesPart,
        source: "sales-recommendation",
      };
    }

    const possiblePart =
      diagnostic.conclusion
        ?.possibleParts
        ?.find(
          part =>
            typeof part === "string" &&
            part.trim().length > 0,
        )
        ?.trim();

    if (possiblePart) {
      return {
        partName: possiblePart,
        source: "conclusion",
      };
    }

    return {
      partName: null,
      source: "none",
    };
  }
}
