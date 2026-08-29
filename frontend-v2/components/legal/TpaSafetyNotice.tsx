type TpaSafetyNoticeProps = {
  context?: "diagnostic" | "purchase";
};

export function TpaSafetyNotice({
  context = "diagnostic",
}: TpaSafetyNoticeProps) {
  if (context === "purchase") {
    return (
      <aside
        aria-label="Vérification avant commande"
        className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left"
      >
        <p className="text-sm font-semibold text-slate-800">
          Vérification avant commande
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          La pièce proposée résulte du diagnostic et des informations
          disponibles sur le véhicule. Avant de commander, vérifiez la
          compatibilité de la pièce et, en cas de doute, faites confirmer
          le diagnostic et la référence par un professionnel qualifié.
        </p>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Information importante sur le diagnostic"
      className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left"
    >
      <p className="text-sm font-semibold text-slate-800">
        Important
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        TPA est un outil d&apos;aide au diagnostic et ne remplace pas
        le contrôle d&apos;un professionnel de l&apos;automobile.
        Avant toute réparation ou commande de pièce, nous vous
        recommandons de faire confirmer le diagnostic par un
        professionnel qualifié.
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        Le niveau de confiance affiché est une estimation basée sur
        les informations fournies et ne constitue pas une garantie
        de diagnostic.
      </p>
    </aside>
  );
}