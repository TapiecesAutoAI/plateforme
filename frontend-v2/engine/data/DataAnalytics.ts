import type {
  TaPiecesAutoDataSnapshot,
} from "./TaPiecesAutoDataStore";

export type ResolutionStats = {
  totalFeedback: number;
  resolved: number;
  partiallyResolved: number;
  notResolved: number;
  unknown: number;
  resolutionRate: number;
};

export function calculateResolutionStats(
  data: TaPiecesAutoDataSnapshot,
): ResolutionStats {

  const feedback =
    data.installationFeedback;

  const resolved =
    feedback.filter(
      item =>
        item.result ===
        "resolved",
    ).length;

  const partiallyResolved =
    feedback.filter(
      item =>
        item.result ===
        "partially-resolved",
    ).length;

  const notResolved =
    feedback.filter(
      item =>
        item.result ===
        "not-resolved",
    ).length;

  const unknown =
    feedback.length -
    resolved -
    partiallyResolved -
    notResolved;

  const measurable =
    resolved +
    partiallyResolved +
    notResolved;

  const resolutionRate =
    measurable === 0
      ? 0
      : resolved / measurable;

  return {
    totalFeedback:
      feedback.length,

    resolved,

    partiallyResolved,

    notResolved,

    unknown,

    resolutionRate,
  };
}

export function getTopSoldParts(
  data: TaPiecesAutoDataSnapshot,
) {

  const counts =
    new Map<
      string,
      number
    >();

  for (
    const order
    of data.orders
  ) {

    if (
      order.status ===
      "cancelled"
    ) {
      continue;
    }

    for (
      const line
      of order.lines
    ) {

      counts.set(
        line.partId,
        (
          counts.get(
            line.partId,
          ) ?? 0
        ) +
        line.quantity,
      );
    }
  }

  return [
    ...counts.entries(),
  ]
    .map(
      ([partId, quantity]) => ({
        partId,
        quantity,
      }),
    )
    .sort(
      (a, b) =>
        b.quantity -
        a.quantity,
    );
}

export function getDiagnosticConversionRate(
  data: TaPiecesAutoDataSnapshot,
) {

  const completed =
    data.diagnostics.filter(
      diagnostic =>
        Boolean(
          diagnostic.completedAt,
        ),
    );

  if (
    completed.length === 0
  ) {
    return 0;
  }

  const converted =
    completed.filter(
      diagnostic =>
        diagnostic.convertedToOrder,
    ).length;

  return (
    converted /
    completed.length
  );
}
