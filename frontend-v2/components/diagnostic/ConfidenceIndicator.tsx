export interface ConfidenceIndicatorProps {
  confidence: number;
}

export default function ConfidenceIndicator({
  confidence,
}: ConfidenceIndicatorProps) {

  const activeDots =
    confidence >= 97 ? 5 :
    confidence >= 90 ? 4 :
    confidence >= 75 ? 3 :
    confidence >= 55 ? 2 : 1;

  const label =
    confidence >= 97
      ? "Quasi certain"
      : confidence >= 90
      ? "Très forte probabilité"
      : confidence >= 75
      ? "Probabilité élevée"
      : confidence >= 55
      ? "À confirmer"
      : "Diagnostic insuffisant";

  return (

    <div className="flex flex-col items-center gap-3">

      <div className="flex gap-3">

        {Array.from({ length: 5 }).map((_, i) => (

          <div
            key={i}
            className={
              i < activeDots
                ? "h-5 w-5 rounded-full bg-green-500"
                : "h-5 w-5 rounded-full bg-gray-300"
            }
          />

        ))}

      </div>

      <span className="text-lg font-semibold">

        {label}

      </span>

    </div>

  );

}
