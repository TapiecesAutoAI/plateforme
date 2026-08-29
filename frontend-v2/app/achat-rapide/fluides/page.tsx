"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  resolveFluidIntent,
} from "../../../lib/fluids";

import {
  readStoredShowroomTechnicalVehicle,
} from "../../../lib/showroom/ShowroomVehicleTechnicalAdapter";

import {
  mergeTechnicalVehicle,
  parseVehicleFromText,
} from "../../../lib/vehicle/VehiclePhraseParser";

import {
  vehicleIdentityProvider,
} from "../../../lib/vehicle/vehicleIdentity";

import {
  fluidTechnicalService,
} from "../../../lib/fluids/technical";

import {
  TechnicalSourceBadge,
} from "../../../components/technical/TechnicalSourceBadge";

type MessageChoice = {
  id: string;
  label: string;
  prompt: string;
  icon?: string;
  subtitle?: string;
};

type Message = {
  role: "user" | "assistant";
  text: string;

  question?: string;

  secondaryQuestion?: string;

  sources?: string[];

  choices?: MessageChoice[];
};

type QuickAction = {
  id: string;
  icon: string;
  title: string;
  prompt: string;
  className: string;
  imageUrl: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "engine-oil",
    icon: "🛢️",
    title: "Huile moteur",
    prompt:
      "Je cherche une huile moteur",
    className:
      "from-amber-950/90 via-amber-700/60 to-slate-950/90",
    imageUrl:
      "https://images.unsplash.com/photo-1635773054018-43e7e16d8ab8?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "coolant",
    icon: "❄️",
    title: "Refroidissement",
    prompt:
      "Je cherche du liquide de refroidissement",
    className:
      "from-cyan-950/90 via-cyan-700/60 to-slate-950/90",
    imageUrl:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "brake-steering",
    icon: "🛑",
    title: "Freinage & direction",
    prompt:
      "Je cherche du liquide de frein",
    className:
      "from-red-950/90 via-red-700/60 to-slate-950/90",
    imageUrl:
      "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "other",
    icon: "💧",
    title: "Autres fluides",
    prompt:
      "Je cherche du lave-glace",
    className:
      "from-blue-950/90 via-blue-700/60 to-slate-950/90",
    imageUrl:
      "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=900&q=85",
  },
];

export default function FluidsPage() {

  const [
    input,
    setInput,
  ] = useState("");

  const [
    pendingFluidId,
    setPendingFluidId,
  ] = useState<string | null>(
    null,
  );

  const [
    pendingVehicleText,
    setPendingVehicleText,
  ] = useState("");

  const [
    messages,
    setMessages,
  ] = useState<Message[]>([
    {
      role: "assistant",
      text:
        "Bonjour. Dites-moi simplement quel fluide ou lubrifiant vous recherchez. J'identifierai le vehicule uniquement lorsque c'est necessaire.",
    },
  ]);

  function extractVin(
    value: string,
  ): string | undefined {

    const match =
      value
        .toUpperCase()
        .match(
          /\b[A-HJ-NPR-Z0-9]{17}\b/,
        );

    return match?.[0];
  }

  function buildTechnicalVehicle(
    value: string,
  ) {

    const stored =
      readStoredShowroomTechnicalVehicle();

    const parsed =
      parseVehicleFromText(
        value,
      );

    const merged =
      mergeTechnicalVehicle(
        stored,
        parsed,
      );

    const vin =
      extractVin(
        value,
      ) ??
      stored?.vin;

    return {
      ...merged,
      vin,
    };
  }

  function hasUsefulVehicleData(
    value: ReturnType<typeof buildTechnicalVehicle>,
  ): boolean {

    return Boolean(
      value.vin ||
      value.make ||
      value.model ||
      value.generation ||
      value.year ||
      value.engineName
    );
  }

  async function resolveTechnicalFluid(
    fluidId: string,
    vehicle:
      ReturnType<typeof buildTechnicalVehicle>,
  ) {

    return fluidTechnicalService.resolve({
      fluidId,
      vehicle,
    });
  }

  function assistant(
    text: string,
    sources?: string[],
    choices?: MessageChoice[],
    question?: string,
    secondaryQuestion?: string,
  ) {

    setMessages(
      previous => [
        ...previous,
        {
          role: "assistant",
          text,
          question,
          secondaryQuestion,
          sources,
          choices,
        },
      ],
    );
  }

  async function send(
    raw?: string,
  ) {

    const value =
      (raw ?? input).trim();

    if (!value) {
      return;
    }

    setInput("");

    setMessages(
      previous => [
        ...previous,
        {
          role: "user",
          text: value,
        },
      ],
    );

    const result =
      resolveFluidIntent(
        value,
      );

    if (
      result.status === "needs-clarification"
    ) {

      /*
       * Le client peut donner le véhicule AVANT de choisir
       * la famille d'huile.
       *
       * Exemple :
       * "Je veux de l'huile pour ma Golf 7 1.6 TDI"
       *
       * On conserve donc le texte complet afin que le clic
       * suivant sur "Huile moteur", "Huile DSG", etc.
       * ne perde pas l'identification du véhicule.
       */
      const clarificationVehicle =
        buildTechnicalVehicle(
          value,
        );

      if (
        hasUsefulVehicleData(
          clarificationVehicle,
        )
      ) {

        setPendingVehicleText(
          value,
        );
      }

      assistant(
        "Plusieurs familles de lubrifiants sont disponibles.",
        undefined,
        result.options.map(
          option => {

            const presentation:
              Record<
                string,
                {
                  icon: string;
                  subtitle: string;
                }
              > = {

                "engine-oil": {
                  icon: "🛢️",
                  subtitle:
                    "Lubrification moteur",
                },

                "manual-transmission-fluid": {
                  icon: "⚙️",
                  subtitle:
                    "Boite manuelle",
                },

                "automatic-transmission-fluid": {
                  icon: "🔁",
                  subtitle:
                    "Boite automatique / ATF",
                },

                "dct-fluid": {
                  icon: "⚙️",
                  subtitle:
                    "DSG / double embrayage",
                },

                "cvt-fluid": {
                  icon: "🔄",
                  subtitle:
                    "Transmission CVT",
                },

                "differential-fluid": {
                  icon: "🛞",
                  subtitle:
                    "Pont / differentiel",
                },

                "power-steering-fluid": {
                  icon: "🧭",
                  subtitle:
                    "Direction assistee",
                },

                "brake-fluid": {
                  icon: "🛑",
                  subtitle:
                    "Circuit de freinage",
                },
              };

            const display =
              presentation[
                option.id
              ];

            return {
              id:
                option.id,

              label:
                option.label,

              prompt:
                option.label,

              icon:
                display?.icon,

              subtitle:
                display?.subtitle,
            };
          },
        ),
        "Quel type d'huile recherchez-vous ?",
      );

      return;
    }

    if (
      pendingFluidId &&
      result.status === "unknown"
    ) {

      const combined =
        `${pendingVehicleText} ${value}`.trim();

      const vehicle =
        buildTechnicalVehicle(
          combined,
        );

      if (
        vehicle.vin
      ) {

        const vinResult =
          await vehicleIdentityProvider.resolveVin(
            vehicle.vin,
          );

        if (
          vinResult.status === "found"
        ) {

          Object.assign(
            vehicle,
            vinResult.vehicle,
          );
        }

        if (
          vinResult.status === "provider-unavailable"
        ) {

          setPendingVehicleText(
            combined,
          );

          assistant(
            "VIN bien recu. Le decodage automatique VIN n'est pas encore connecte a TecDoc. Je conserve le VIN.",
          );

          return;
        }
      }

      const technicalResult =
        await resolveTechnicalFluid(
          pendingFluidId,
          vehicle,
        );

      if (
        technicalResult.status === "vehicle-required"
      ) {

        setPendingVehicleText(
          combined,
        );

        assistant(
          `J’ai déjà une partie des informations du véhicule. Information manquante : ${technicalResult.missing.join(", ")}.`,
          undefined,
          undefined,
          technicalResult.missing.includes("annee exacte ou VIN")
            ? "Quelle est l’année exacte du véhicule ?"
            : "Pouvez-vous me donner l’information manquante ?",
          "Ou indiquez directement le numéro VIN.",
        );

        return;
      }

      if (
        technicalResult.status === "provider-unavailable"
      ) {

        setPendingVehicleText(
          combined,
        );

        assistant(
          "Le vehicule est suffisamment identifie, mais les sources techniques externes ne sont pas encore connectees. Je conserve les informations et je n'inventerai aucune specification.",
        );

        return;
      }

      if (
        technicalResult.status === "not-found"
      ) {

        setPendingVehicleText(
          combined,
        );

        assistant(
          "Le vehicule est suffisamment identifie, mais aucune specification technique verifiee n'est encore disponible dans la base locale. Je ne proposerai ni viscosite, ni norme, ni quantite au hasard.",
        );

        return;
      }

      if (
        technicalResult.status === "conflict"
      ) {

        assistant(
          `Les sources techniques ne sont pas concordantes sur : ${technicalResult.conflictingFields.join(", ")}. TPA bloque la recommandation jusqu'a verification.`,
        );

        return;
      }

      if (
        technicalResult.status === "single-source"
      ) {

        const spec =
          technicalResult.specification;

        const details = [
          spec.viscosity
            ? `Viscosite : ${spec.viscosity}`
            : null,

          spec.manufacturerSpecification?.length
            ? `Normes constructeur : ${spec.manufacturerSpecification.join(" / ")}`
            : null,

          spec.capacityLitres !== undefined
            ? `Capacite : ${spec.capacityLitres} L`
            : null,

          `Source : ${spec.sourceName}`,

          "Fiabilite : 1 source technique - a confirmer par une seconde source.",
        ]
          .filter(Boolean)
          .join("\n");

        assistant(
          `${details}`,
        );

        return;
      }

      if (
        technicalResult.status === "consensus"
      ) {

        const spec =
          technicalResult.specification;

        const details = [
          spec.viscosity
            ? `viscosite ${spec.viscosity}`
            : null,

          spec.alternativeViscosities?.length
            ? `autres viscosites compatibles ${spec.alternativeViscosities.join(" / ")}`
            : null,

          spec.manufacturerSpecification?.length
            ? `norme ${spec.manufacturerSpecification.join(" / ")}`
            : null,

          spec.capacityLitres !== undefined
            ? `capacite ${spec.capacityLitres} L`
            : null,
        ]
          .filter(Boolean)
          .join(", ");

        assistant(
          [
            "HUILE MOTEUR",
            "",
            `Viscosite principale : ${spec.viscosity ?? "Non disponible"}`,
            spec.alternativeViscosities?.length
              ? `Autre viscosite compatible : ${spec.alternativeViscosities.join(" / ")}`
              : null,
            spec.manufacturerSpecification?.length
              ? `Normes constructeur : ${spec.manufacturerSpecification.join(" / ")}`
              : null,
            spec.capacityLitres !== undefined
              ? `Capacite : ${spec.capacityLitres} L`
              : null,
            "",
            `Fiabilite : specification verifiee par ${technicalResult.sourceCount} sources`,
          ]
            .filter(
              (
                line,
              ): line is string =>
                line !== null,
            )
            .join("\n"),
        );

        return;
      }
    }

    if (
      result.status === "unknown"
    ) {

      assistant(
        "Je n'ai pas encore identifie precisement le fluide. Dites-moi par exemple : huile moteur, liquide de refroidissement, liquide de frein, direction assistee, AdBlue ou lave-glace.",
      );

      return;
    }

    const {
      record,
    } = result;

    setPendingFluidId(
      null,
    );

    setPendingVehicleText(
      "",
    );

    if (
      record.vehicleRequirement ===
      "universal"
    ) {

      assistant(
        `${record.title} : aucune identification du vehicule n'est necessaire. Je peux passer directement au choix du produit.`,
      );

      return;
    }

    const vehicleInput =
      pendingVehicleText
        ? `${pendingVehicleText} ${value}`.trim()
        : value;

    const vehicle =
      buildTechnicalVehicle(
        vehicleInput,
      );

    if (
      vehicle.vin
    ) {

      const vinResult =
        await vehicleIdentityProvider.resolveVin(
          vehicle.vin,
        );

      if (
        vinResult.status === "found"
      ) {

        Object.assign(
          vehicle,
          vinResult.vehicle,
        );
      }

      if (
        vinResult.status === "provider-unavailable"
      ) {

        setPendingFluidId(
          record.id,
        );

        setPendingVehicleText(
          value,
        );

        assistant(
          `${record.title} : VIN bien recu. Le decodage automatique VIN n'est pas encore connecte a TecDoc. Je conserve le VIN.`,
        );

        return;
      }
    }

    const technicalResult =
      await resolveTechnicalFluid(
        record.id,
        vehicle,
      );

    if (
      technicalResult.status === "vehicle-required"
    ) {

      setPendingFluidId(
        record.id,
      );

      setPendingVehicleText(
        value,
      );

      assistant(
        `${record.title} : il me manque encore ${technicalResult.missing.join(", ")}.`,
        undefined,
        undefined,
        technicalResult.missing.includes("annee exacte ou VIN")
          ? "Quelle est l’année exacte du véhicule ?"
          : technicalResult.missing.includes("boite / transmission exacte ou VIN")
            ? "Quelle boîte ou transmission équipe le véhicule ?"
            : technicalResult.missing.includes("motorisation ou VIN")
              ? "Quelle est la motorisation du véhicule ?"
              : "Pouvez-vous me donner l’information véhicule manquante ?",
        "Ou indiquez directement le numéro VIN.",
      );

      return;
    }

    if (
      technicalResult.status === "provider-unavailable"
    ) {

      setPendingFluidId(
        record.id,
      );

      setPendingVehicleText(
        value,
      );

      assistant(
        `${record.title} : le vehicule est suffisamment identifie, mais les sources techniques externes ne sont pas encore connectees. Je ne proposerai aucune specification au hasard.`,
      );

      return;
    }

    if (
      technicalResult.status === "not-found"
    ) {

      setPendingFluidId(
        record.id,
      );

      setPendingVehicleText(
        value,
      );

      assistant(
        `${record.title} : le vehicule est suffisamment identifie, mais aucune specification verifiee n'est encore disponible dans notre base locale.`,
      );

      return;
    }

    if (
      technicalResult.status === "conflict"
    ) {

      assistant(
        `${record.title} : les sources techniques sont en conflit sur ${technicalResult.conflictingFields.join(", ")}. TPA bloque la recommandation.`,
      );

      return;
    }

    if (
      technicalResult.status === "single-source"
    ) {

      const spec =
        technicalResult.specification;

      const details = [
        record.title,

        spec.viscosity
          ? `Viscosite : ${spec.viscosity}`
          : null,

        spec.manufacturerSpecification?.length
          ? `Normes constructeur : ${spec.manufacturerSpecification.join(" / ")}`
          : null,

        spec.capacityLitres !== undefined
          ? `Capacite : ${spec.capacityLitres} L`
          : null,

        `Source : ${spec.sourceName}`,

        "Fiabilite : 1 source technique - a confirmer par une seconde source.",
      ]
        .filter(Boolean)
        .join("\n");

      assistant(
        details,
      );

      return;
    }

    if (
      technicalResult.status === "consensus"
    ) {

      const spec =
        technicalResult.specification;

      const details = [
        spec.viscosity
          ? `viscosite ${spec.viscosity}`
          : null,

        spec.alternativeViscosities?.length
          ? `autres viscosites compatibles ${spec.alternativeViscosities.join(" / ")}`
          : null,

        spec.manufacturerSpecification?.length
          ? `norme ${spec.manufacturerSpecification.join(" / ")}`
          : null,

        spec.capacityLitres !== undefined
          ? `capacite ${spec.capacityLitres} L`
          : null,
      ]
        .filter(Boolean)
        .join(", ");

      assistant(
        [
          record.title.toUpperCase(),
          "",
          spec.viscosity
            ? `Viscosite principale : ${spec.viscosity}`
            : null,
          spec.alternativeViscosities?.length
            ? `Autre viscosite compatible : ${spec.alternativeViscosities.join(" / ")}`
            : null,
          spec.manufacturerSpecification?.length
            ? `Normes constructeur : ${spec.manufacturerSpecification.join(" / ")}`
            : null,
          spec.capacityLitres !== undefined
            ? `Capacite : ${spec.capacityLitres} L`
            : null,
          "",
          `Fiabilite : specification verifiee par ${technicalResult.sourceCount} sources`,
        ]
          .filter(
            (
              line,
            ): line is string =>
              line !== null,
          )
          .join("\n"),
        technicalResult.sources,
      );

      return;
    }
  }

  return (
    <main className="h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 text-slate-950 w-full min-w-0 overflow-x-hidden">

      <div className="mx-auto flex h-full max-w-7xl flex-col px-5 py-5">

        <header className="flex shrink-0 items-center justify-between gap-5">

          <div>

            <div className="text-sm font-bold text-blue-700">
              Ta Pieces Auto AI
            </div>

            <h1 className="text-2xl font-black">
              Fluides & lubrifiants
            </h1>

          </div>

          <Link
            href="/showroom"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold shadow-sm"
          >
            Retour
          </Link>

        </header>

        <div className="mt-5 grid min-h-0 flex-1 gap-5 lg:grid-cols-[330px_1fr]">

          <aside className="hidden min-h-0 flex-col lg:flex">

            <div className="mb-3">

              <h2 className="font-black">
                Que recherchez-vous ?
              </h2>

              <p className="text-sm text-slate-500">
                Choisissez une categorie ou expliquez votre besoin.
              </p>

            </div>

            <div className="grid flex-1 grid-cols-2 gap-3">

              {
                QUICK_ACTIONS.map(
                  item => (

                    <button
                      key={item.id}
                      type="button"
                      onClick={
                        () =>
                          void send(
                            item.prompt,
                          )
                      }
                      className="group relative min-h-[150px] overflow-hidden rounded-2xl text-left text-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >

                      <img
                        src={item.imageUrl}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />

                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${item.className}`}
                      />

                      <div className="absolute inset-0 bg-black/10 transition group-hover:bg-black/0" />

                      <div className="relative flex h-full min-h-[150px] flex-col justify-end p-5">

                        <div className="mb-auto text-3xl drop-shadow">
                          {item.icon}
                        </div>

                        <div className="text-xl font-black drop-shadow-md">
                          {item.title}
                        </div>

                        <div className="mt-1 text-xs font-semibold text-white/80">
                          Touchez pour commencer
                        </div>

                      </div>

                    </button>

                  ),
                )
              }

            </div>

            <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-100/80 p-4 text-sm font-semibold text-blue-950 shadow-sm">
              Pas besoin d'identifier le vehicule pour un produit universel. Pour une specification constructeur, TPA utilisera le VIN ou les donnees vehicule necessaires.
            </div>

          </aside>

          <section className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-xl">

            <div className="border-b border-blue-100 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-700 px-6 py-4 text-white">

              <h2 className="font-black">
                Assistant Ta Pieces Auto
              </h2>

              <p className="text-sm text-blue-100">
                Expliquez simplement le fluide que vous recherchez.
              </p>

            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">

              <div className="space-y-4">

                {
                  messages.map(
                    (
                      message,
                      index,
                    ) => (

                      <div
                        key={`${message.role}-${index}`}
                        className={
                          message.role === "user"
                            ? "flex justify-end"
                            : "flex justify-start"
                        }
                      >

                        <div
                          className={
                            message.role === "user"
                              ? "max-w-[75%] rounded-2xl rounded-br-md bg-blue-700 px-5 py-3 text-white"
                              : "max-w-[82%] rounded-2xl rounded-bl-md bg-slate-100 px-5 py-3 leading-6 text-slate-800"
                          }
                        >
                          <div className="whitespace-pre-line">
                            {message.text}
                          </div>

                          {
                            message.question && (

                              <div className="mt-4 border-t border-slate-200 pt-3 text-[15px] font-black leading-snug text-slate-950">
                                {message.question}
                              </div>

                            )
                          }

                          {
                            message.secondaryQuestion && (

                              <div className="mt-2 text-[15px] font-black leading-snug text-slate-950">
                                {message.secondaryQuestion}
                              </div>

                            )
                          }

                          {
                            message.sources &&
                            message.sources.length > 0 && (

                              <div className="mt-4">

                                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                                  Sources techniques
                                </div>

                                <div className="flex flex-wrap gap-2">

                                  {
                                    message.sources.map(
                                      source => (

                                        <TechnicalSourceBadge
                                          key={source}
                                          sourceName={source}
                                        />

                                      ),
                                    )
                                  }

                                </div>

                              </div>

                            )
                          }

                          {
                            message.choices &&
                            message.choices.length > 0 && (

                              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

                                {
                                  message.choices.map(
                                    choice => (

                                      <button
                                        key={choice.id}
                                        type="button"
                                        onClick={
                                          () =>
                                            void send(
                                              choice.prompt,
                                            )
                                        }
                                        className="group flex min-h-[92px] w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-md active:translate-y-0"
                                      >

                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-3xl shadow-sm transition group-hover:bg-white">
                                          {
                                            choice.icon ??
                                            "🛢️"
                                          }
                                        </div>

                                        <div className="min-w-0 flex-1">

                                          <div className="text-[15px] font-black leading-tight text-slate-900">
                                            {choice.label}
                                          </div>

                                          {
                                            choice.subtitle && (

                                              <div className="mt-1.5 text-xs font-medium leading-snug text-slate-500">
                                                {
                                                  choice.subtitle
                                                }
                                              </div>

                                            )
                                          }

                                        </div>

                                        <div className="shrink-0 text-xl font-bold text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500">
                                          ›
                                        </div>

                                      </button>

                                    ),
                                  )
                                }

                              </div>

                            )
                          }
                        </div>

                      </div>

                    ),
                  )
                }

              </div>

            </div>

            <div className="shrink-0 border-t border-blue-100 bg-slate-50 p-4">

              <div className="flex gap-3">

                <input
                  value={input}
                  onChange={
                    event =>
                      setInput(
                        event.target.value,
                      )
                  }
                  onKeyDown={
                    event => {

                      if (
                        event.key === "Enter"
                      ) {
                        void send();
                      }
                    }
                  }
                  placeholder="Exemple : huile moteur pour ma Golf 7 1.6 TDI..."
                  className="min-w-0 flex-1 rounded-2xl border border-slate-300 px-5 py-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={
                    () =>
                      void send()
                  }
                  className="rounded-2xl bg-gradient-to-r from-blue-800 to-blue-600 px-7 font-black text-white shadow-md transition hover:from-blue-900 hover:to-blue-700"
                >
                  Envoyer
                </button>

              </div>

            </div>

          </section>

        </div>

      </div>

    </main>
  );
}