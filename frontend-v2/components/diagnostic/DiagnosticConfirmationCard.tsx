"use client";

type VerificationResult =
  | "positive"
  | "negative"
  | "not-tested"
  | null;

type Props = {
  confidence: number;

  verificationResult?:
    VerificationResult;

  onContinue?:
    () => void;

  partName?:
    string | null;
};

export default function DiagnosticConfirmationCard({
  confidence,
  verificationResult = null,
  onContinue,
  partName = null,
}: Props) {

  const verificationPerformed =
    verificationResult === "positive" ||
    verificationResult === "negative";

  const verificationUnavailable =
    verificationResult === "not-tested";

  function viewPartPrice() {

    const target =
      partName
        ? `/piece?part=${encodeURIComponent(
            partName,
          )}`
        : "/piece";

    window.location.href =
      target;
  }

  /*
   * =========================================================
   * VERIFICATION EFFECTUEE
   * =========================================================
   */

  if (
    verificationPerformed
  ) {

    return (
      <div className="mt-6 rounded-3xl border border-emerald-300 bg-emerald-50 p-6">

        <h3 className="text-lg font-bold text-emerald-900">
          Vérification complémentaire effectuée
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-700">
          Le contrôle demandé a été enregistré, mais aucune pièce précise n'est encore identifiée. Poursuivez le diagnostic avant toute commande.
        </p>

        <div className="mt-5 flex items-center justify-between rounded-xl bg-white p-4">

          <span className="font-semibold text-slate-700">
            Niveau obtenu
          </span>

          <span className="text-2xl font-bold text-emerald-700">
            {confidence}%
          </span>

        </div>

        {partName && (
          <button
            type="button"
            onClick={
              viewPartPrice
            }
            className="mt-5 w-full rounded-xl bg-blue-950 px-5 py-3 font-semibold text-white hover:bg-slate-950"
          >
            Voir le prix de la pièce
          </button>
        )}

        {!partName && onContinue && (
          <button
            type="button"
            onClick={
              onContinue
            }
            className="mt-5 w-full rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Continuer le diagnostic
          </button>
        )}

      </div>
    );
  }

  /*
   * =========================================================
   * VERIFICATION IMPOSSIBLE
   * =========================================================
   */

  if (
    verificationUnavailable
  ) {

    return (
      <div className="mt-6 rounded-3xl border border-amber-300 bg-amber-50 p-6">

        <h3 className="text-lg font-bold text-amber-900">
          Vérification non réalisée
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-700">
          Le contrôle conseillé n'a pas pu être effectué. Le diagnostic reste provisoire et devra être vérifié avant la vente définitive.
        </p>

        <div className="mt-5 flex items-center justify-between rounded-xl bg-white p-4">

          <span className="font-semibold text-slate-700">
            Niveau actuel
          </span>

          <span className="text-2xl font-bold text-slate-950">
            {confidence}%
          </span>

        </div>

        {partName && confidence >= 85 && (
          <button
            type="button"
            onClick={
              viewPartPrice
            }
            className="mt-5 w-full rounded-xl bg-blue-950 px-5 py-3 font-semibold text-white hover:bg-slate-950"
          >
            Voir le prix de la pièce
          </button>
        )}

      </div>
    );
  }

  /*
   * =========================================================
   * VERIFICATION CONSEILLEE
   * =========================================================
   */

  return (
    <div className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-6">

      <h3 className="text-lg font-bold text-blue-950">
        Vérification complémentaire à effectuer
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-700">
        Le niveau de confiance ne signifie pas que le contrôle final a été réalisé. Effectuez la vérification proposée avant toute commande.
      </p>

      <div className="mt-5 flex items-center justify-between rounded-xl bg-white p-4">

        <span className="font-semibold text-slate-700">
          Niveau actuel
        </span>

        <span className="text-2xl font-bold text-slate-950">
          {confidence}%
        </span>

      </div>

      {/*
       * Si le diagnostic possède déjà une pièce avec
       * une confiance élevée, on peut consulter
       * son prix.
       *
       * La vente définitive restera bloquée par
       * la compatibilité / le comptoir.
       */}

      {partName && confidence >= 85 && (
        <button
          type="button"
          onClick={
            viewPartPrice
          }
          className="mt-5 w-full rounded-xl bg-blue-950 px-5 py-3 font-semibold text-white hover:bg-slate-950"
        >
          Voir le prix de la pièce
        </button>
      )}

      {onContinue &&
        (
          confidence < 85 ||
          !partName
        ) && (
        <button
          type="button"
          onClick={
            onContinue
          }
          className="mt-5 w-full rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
        >
          Continuer le diagnostic
        </button>
      )}

    </div>
  );
}


