"use client";

import Image from "next/image";

export type UserProfileType =
  | "particulier"
  | "bricoleur"
  | "vendeur-pieces-auto"
  | "mecanicien-garage"
  | "depanneur"
  | "etudiant-mecanique"
  | "autre-professionnel";

type UserProfileSelectorProps = {
  onSelect:
    (profile: UserProfileType) => void;
};

type ProfileCard = {
  id: UserProfileType;
  title: string;
  description: string;
  symbol: string;
};

const profiles:
  ProfileCard[] = [
    {
      id:
        "particulier",

      title:
        "Particulier",

      description:
        "Je ne connais pas ou peu la mécanique.",

      symbol:
        "P",
    },

    {
      id:
        "bricoleur",

      title:
        "Bricoleur",

      description:
        "Je réalise moi-même certains contrôles ou entretiens.",

      symbol:
        "B",
    },

    {
      id:
        "vendeur-pieces-auto",

      title:
        "Vendeur de pièces auto",

      description:
        "Je conseille un client et je recherche la pièce probablement concernée.",

      symbol:
        "V",
    },

    {
      id:
        "mecanicien-garage",

      title:
        "Mécanicien / Garage",

      description:
        "Je peux effectuer des contrôles et des mesures techniques avancées.",

      symbol:
        "M",
    },

    {
      id:
        "depanneur",

      title:
        "Dépanneur",

      description:
        "Je dois identifier rapidement la panne sur place.",

      symbol:
        "D",
    },

    {
      id:
        "etudiant-mecanique",

      title:
        "Étudiant en mécanique",

      description:
        "Je connais les bases et je souhaite comprendre le raisonnement.",

      symbol:
        "E",
    },

    {
      id:
        "autre-professionnel",

      title:
        "Autre professionnel",

      description:
        "Je travaille dans l’automobile sans être nécessairement mécanicien.",

      symbol:
        "A",
    },
  ];

export default function UserProfileSelector({
  onSelect,
}: UserProfileSelectorProps) {
  return (
    <section className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-6 py-10 text-center text-white sm:px-10">
        <div className="mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-3xl border border-amber-300/30 bg-black shadow-2xl sm:h-44 sm:w-44">
          <Image
            src="/zt-consult-logo.png"
            alt="Logo ZT Consult"
            width={512}
            height={512}
            priority
            className="h-full w-full object-cover"
          />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
          Ta Pièces Auto AI
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-blue-100">
  "Identifier la bonne pièce avec le minimum de questions et le risque d'erreur",
              <br />
              le plus faible possible.
</p>

<p className="mx-auto mt-3 max-w-3xl text-base text-blue-200">
  "L'IA qui raisonne comme un vendeur expert en pièces automobiles,",
  "adaptée à votre niveau et à votre métier.",
</p>
            
      </div>

      <div className="px-6 py-8 sm:px-10 sm:py-10">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-950">
            Quel profil vous correspond le mieux ?
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Les questions seront automatiquement adaptées au profil sélectionné.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {profiles.map(
            (profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() =>
                  onSelect(
                    profile.id,
                  )
                }
                className="group flex min-h-28 w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-blue-700 hover:bg-blue-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-950 text-lg font-bold text-amber-300 transition group-hover:bg-blue-800">
                  {profile.symbol}
                </span>

                <span>
                  <span className="block text-base font-semibold text-slate-950">
                    {profile.title}
                  </span>

                  <span className="mt-1 block text-sm leading-5 text-slate-600">
                    {profile.description}
                  </span>
                </span>
              </button>
            ),
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-blue-100 bg-slate-50 px-5 py-4">
          <p className="text-sm leading-6 text-gray-600">
            Le profil pourra être changé plus tard. Le diagnostic reste une orientation et ne remplace pas les contrôles réalisés sur le véhicule.
          </p>
        </div>
      </div>
    </section>
  );
}



