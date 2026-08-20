import type {
  ReasoningExplanation,
} from "../reasoning";

export class CustomerMessageBuilder {
  public buildReasons(
    explanation:
      ReasoningExplanation | null,
  ): string[] {
    if (
      !explanation
    ) {
      return [];
    }

    return explanation
      .supportingEvidence
      .slice(
        -3,
      );
  }
}
