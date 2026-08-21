"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";


type QuickNeed = {
  id: string;
  icon: string;
  title: string;
  example: string;
};


const QUICK_NEEDS: QuickNeed[] = [
  {
    id: "clean",
    icon: "🧽",
    title: "Nettoyer mon véhicule",
    example: "Je veux nettoyer mon véhicule",
  },
  {
    id: "tyre",
    icon: "🛞",
    title: "Mon pneu est crevé",
    example: "Mon pneu est crevé",
  },
  {
    id: "brake-fluid",
    icon: "🟡",
    title: "Liquide de frein",
    example: "Je veux faire l'appoint de mon liquide de frein",
  },
  {
    id: "coolant",
    icon: "💧",
    title: "Antigel / refroidissement",
    example: "Il me faut de l'antigel",
  },
  {
    id: "bulb",
    icon: "💡",
    title: "Une ampoule ne va plus",
    example: "Mon phare ne s'allume plus",
  },
  {
    id: "wipers",
    icon: "🌧️",
    title: "Changer mes essuie-glaces",
    example: "Je veux changer mes essuie-glaces",
  },
  {
    id: "battery",
    icon: "🔋",
    title: "Ma batterie est faible",
    example: "Ma batterie semble faible",
  },
  {
    id: "other",
    icon: "•••",
    title: "Autre besoin",
    example: "",
  },
];


function firstAnswer(
  value: string,
): string {

  const text =
    value
      .trim()
      .toLowerCase();


  // ----------------------------------------------------------
  // NETTOYAGE PNEU / JANTE
  // ----------------------------------------------------------

  if (
    (
      text.includes("nettoy") ||
      text.includes("lav")
    ) &&
    (
      text.includes("pneu") ||
      text.includes("jante") ||
      text.includes("roue")
    )
  ) {
    return "Très bien. Voulez-vous nettoyer la jante, le flanc du pneu, ou les deux ? Aucun besoin d'identifier le véhicule pour cela.";
  }


  // ----------------------------------------------------------
  // NETTOYAGE VITRES
  // ----------------------------------------------------------

  if (
    (
      text.includes("nettoy") ||
      text.includes("lav")
    ) &&
    (
      text.includes("vitre") ||
      text.includes("pare-brise") ||
      text.includes("parebrise")
    )
  ) {
    return "Très bien. Est-ce pour nettoyer l'extérieur des vitres, l'intérieur, ou enlever des traces tenaces ?";
  }


  // ----------------------------------------------------------
  // NETTOYAGE INTERIEUR
  // ----------------------------------------------------------

  if (
    (
      text.includes("nettoy") ||
      text.includes("lav")
    ) &&
    (
      text.includes("siege") ||
      text.includes("siège") ||
      text.includes("interieur") ||
      text.includes("intérieur") ||
      text.includes("tableau de bord")
    )
  ) {
    return "Très bien. Que souhaitez-vous nettoyer : sièges, plastiques, tapis ou tout l'intérieur ?";
  }


  // ----------------------------------------------------------
  // NETTOYAGE GENERAL
  // ----------------------------------------------------------

  if (
    text.includes("nettoy") ||
    text.includes("lav")
  ) {
    return "Très bien. Que souhaitez-vous nettoyer : carrosserie, jantes et pneus, vitres ou intérieur ?";
  }


  // ----------------------------------------------------------
  // PNEU CREVE
  // ----------------------------------------------------------

  if (
    text.includes("pneu") &&
    (
      text.includes("crev") ||
      text.includes("perc") ||
      text.includes("plat")
    )
  ) {
    return "D'accord. Le pneu est-il simplement dégonflé, percé par un objet, ou visiblement déchiré ? Je vous proposerai la solution adaptée.";
  }


  // ----------------------------------------------------------
  // LIQUIDE DE FREIN
  // ----------------------------------------------------------

  if (
    text.includes("frein") &&
    (
      text.includes("liquide") ||
      text.includes("appoint") ||
      text.includes("niveau")
    )
  ) {
    return "Je peux vous aider. Avant de choisir le liquide, il faut vérifier le véhicule et comprendre pourquoi le niveau est bas. Un niveau anormalement bas peut signaler de l'usure ou une fuite.";
  }


  // ----------------------------------------------------------
  // ANTIGEL / REFROIDISSEMENT
  // ----------------------------------------------------------

  if (
    text.includes("antigel") ||
    text.includes("refroid")
  ) {
    return "D'accord. Est-ce pour faire un simple appoint ou pour remplacer complètement le liquide ? Pour choisir la bonne spécification, nous identifierons ensuite le véhicule.";
  }


  // ----------------------------------------------------------
  // ECLAIRAGE
  // ----------------------------------------------------------

  if (
    text.includes("phare") ||
    text.includes("ampoule") ||
    text.includes("feu")
  ) {
    return "D'accord. Quel éclairage ne fonctionne plus : feu de croisement, feu de route, position, stop, clignotant ou autre ?";
  }


  // ----------------------------------------------------------
  // ESSUIE-GLACES
  // ----------------------------------------------------------

  if (
    text.includes("essuie")
  ) {
    return "Très bien. Pour trouver les bonnes dimensions et les bons adaptateurs, nous devrons identifier le véhicule.";
  }


  // ----------------------------------------------------------
  // BATTERIE
  // ----------------------------------------------------------

  if (
    text.includes("batter")
  ) {
    return "D'accord. Voulez-vous remplacer la batterie ou vérifier d'abord si elle est réellement en cause ?";
  }


  return "Expliquez-moi votre besoin en quelques mots. Je vais déterminer si un produit universel suffit ou si votre véhicule doit être identifié.";
}

export default function QuickPurchasePage() {

  const [
    request,
    setRequest,
  ] = useState("");

  const [
    submittedRequest,
    setSubmittedRequest,
  ] = useState("");

  const [
    answer,
    setAnswer,
  ] = useState("");


  function submit(
    event:
      FormEvent<HTMLFormElement>,
  ) {

    event.preventDefault();

    const value =
      request.trim();

    if (!value) {
      return;
    }

    setSubmittedRequest(
      value,
    );

    setAnswer(
      firstAnswer(
        value,
      ),
    );
  }


  function chooseNeed(
    need:
      QuickNeed,
  ) {

    if (!need.example) {
      setRequest("");
      setSubmittedRequest("");
      setAnswer(
        "Décrivez simplement ce que vous voulez faire ou le produit que vous recherchez.",
      );
      return;
    }

    setRequest(
      need.example,
    );

    setSubmittedRequest(
      need.example,
    );

    setAnswer(
      firstAnswer(
        need.example,
      ),
    );
  }


  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">

      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">

        <div className="mb-8 flex items-center justify-between gap-4">

          <div>
            <div className="text-sm font-semibold text-blue-700">
              Ta Pièces Auto AI
            </div>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              J&apos;ai besoin d&apos;un produit
            </h1>

            <p className="mt-2 text-slate-600">
              Dites simplement ce que vous voulez faire.
              Nous vous guidons vers le bon produit.
            </p>
          </div>

          <Link
            href="/showroom"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold shadow-sm hover:bg-slate-50"
          >
            Retour
          </Link>

        </div>


        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">

          <form
            onSubmit={submit}
            className="flex flex-col gap-3 md:flex-row"
          >

            <input
              value={request}
              onChange={
                event =>
                  setRequest(
                    event.target.value,
                  )
              }
              placeholder="Ex. Je veux nettoyer mon véhicule..."
              autoFocus
              className="min-h-14 flex-1 rounded-2xl border border-slate-300 bg-white px-5 text-base outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />

            <button
              type="submit"
              className="min-h-14 rounded-2xl bg-blue-700 px-7 font-bold text-white transition hover:bg-blue-800"
            >
              Continuer
            </button>

          </form>


          <div className="mt-8">

            <div className="mb-4 text-sm font-semibold text-slate-600">
              Ou choisissez un besoin courant
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

              {
                QUICK_NEEDS.map(
                  need => (

                    <button
                      key={need.id}
                      type="button"
                      onClick={
                        () =>
                          chooseNeed(
                            need,
                          )
                      }
                      className="group min-h-28 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                    >

                      <div className="text-2xl">
                        {need.icon}
                      </div>

                      <div className="mt-3 font-semibold leading-tight group-hover:text-blue-800">
                        {need.title}
                      </div>

                    </button>

                  ),
                )
              }

            </div>

          </div>

        </section>


        {
          answer && (

            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">

              {
                submittedRequest && (

                  <div className="mb-5 flex justify-end">

                    <div className="max-w-2xl rounded-2xl rounded-br-md bg-blue-700 px-5 py-4 text-white">
                      {submittedRequest}
                    </div>

                  </div>

                )
              }

              <div className="flex gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500 font-bold text-white">
                  AI
                </div>

                <div className="max-w-3xl rounded-2xl rounded-tl-md bg-slate-100 px-5 py-4">

                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Assistant Ta Pièces Auto
                  </div>

                  <p className="mt-2 leading-7 text-slate-800">
                    {answer}
                  </p>

                </div>

              </div>

            </section>

          )
        }


        <div className="mt-8 text-center text-sm text-slate-500">
          Le véhicule ne sera demandé que lorsque la compatibilité du produit l&apos;exige.
        </div>

      </div>

    </main>
  );
}
