"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  getClientWorkspaceByCustomerId,
  prepareClientDiagnostic,
  prepareClientKnownPart,
  type ClientWorkspace,
} from "../../lib/client";


function IconProblem() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-14 w-14"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path d="M10 39h34l-4-12H18l-8 12Z" />
      <path d="M18 27l4-8h14l4 8" />
      <circle cx="18" cy="45" r="4" />
      <circle cx="38" cy="45" r="4" />
      <circle cx="48" cy="42" r="9" />
      <path d="M54 48l7 7" />
    </svg>
  );
}


function IconCart() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-14 w-14"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path d="M8 12h8l5 28h26l5-20H18" />
      <circle cx="25" cy="49" r="3" />
      <circle cx="45" cy="49" r="3" />
    </svg>
  );
}




function IconGarage() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-8 w-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path d="M10 39h42l-4-12H16l-6 12Z" />
      <circle cx="20" cy="45" r="4" />
      <circle cx="42" cy="45" r="4" />
    </svg>
  );
}


function IconHistory() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-12 w-12"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path d="M12 24a22 22 0 1 1-2 18" />
      <path d="M12 24H3v-9" />
      <path d="M32 18v16l10 6" />
    </svg>
  );
}


function IconBox() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-12 w-12"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path d="M10 20l22-12 22 12-22 12Z" />
      <path d="M10 20v24l22 12 22-12V20" />
      <path d="M32 32v24" />
    </svg>
  );
}


function IconStar() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-12 w-12"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path d="M32 8l7 15 17 2-12 12 3 17-15-8-15 8 3-17L8 25l17-2Z" />
    </svg>
  );
}


function IconTool() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-12 w-12"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path d="M42 10a14 14 0 0 0-14 17L10 45a6 6 0 0 0 9 9l18-18a14 14 0 0 0 17-14l-9 9-8-2-2-8Z" />
    </svg>
  );
}


export default function ClientPage() {

  const router =
    useRouter();

  const [
    workspace,
    setWorkspace,
  ] = useState<ClientWorkspace | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(
    true,
  );

  const [
    selectedVehicleId,
    setSelectedVehicleId,
  ] = useState<string | null>(
    null,
  );





  useEffect(
    () => {
      let active =
        true;

      async function loadWorkspace() {
        try {
          const response =
            await fetch(
              "/api/auth/session",
              {
                method: "GET",
                credentials: "include",
                cache: "no-store",
              },
            );

          if (!response.ok) {
            if (active) {
              setWorkspace(null);
              setLoading(false);
            }

            return;
          }

          const session =
            await response.json();

          if (
            session?.authenticated !== true ||
            typeof session.customerId !== "string"
          ) {
            if (active) {
              setWorkspace(null);
              setLoading(false);
            }

            return;
          }

          const result =
            getClientWorkspaceByCustomerId(
              session.customerId,
            );

          if (active) {
            setWorkspace(result);
            setLoading(false);
          }
        } catch {
          if (active) {
            setWorkspace(null);
            setLoading(false);
          }
        }
      }

      void loadWorkspace();

      return () => {
        active =
          false;
      };
    },
    [],
  );


  useEffect(
    () => {
      if (
        !selectedVehicleId &&
        workspace?.vehicles?.[0]?.vehicle.id
      ) {
        setSelectedVehicleId(
          workspace.vehicles[0].vehicle.id,
        );
      }
    },
    [
      workspace,
      selectedVehicleId,
    ],
  );


  function getSelectedVehicle() {
    if (!workspace) {
      return null;
    }

    return (
      workspace.vehicles.find(
        item =>
          item.vehicle.id ===
          selectedVehicleId,
      ) ??
      workspace.vehicles[0] ??
      null
    );
  }


  function startClientDiagnostic() {
    if (!workspace) {
      return;
    }

    const selected =
      getSelectedVehicle();

    if (!selected) {
      return;
    }

    prepareClientDiagnostic(
      workspace.customer,
      selected.vehicle,
    );

    router.push(
      "/showroom/particulier",
    );
  }


  function startClientKnownPart() {
    if (!workspace) {
      return;
    }

    const selected =
      getSelectedVehicle();

    if (!selected) {
      return;
    }

    prepareClientKnownPart(
      workspace.customer,
      selected.vehicle,
    );

    router.push(
      "/piece?source=showroom&mode=known-part",
    );
  }


  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3f9] text-slate-950 w-full min-w-0 overflow-x-hidden">
        <p className="text-xl font-black">
          Chargement du dossier TPA...
        </p>
      </main>
    );
  }


  if (!workspace) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3f9] px-6 text-slate-950 w-full min-w-0 overflow-x-hidden">

        <div className="rounded-3xl bg-white p-10 text-center shadow-xl">

          <h1 className="text-3xl font-black">
            Dossier client introuvable
          </h1>

          <button
            type="button"
            onClick={
              () =>
                router.push(
                  "/login",
                )
            }
            className="mt-6 rounded-xl bg-[#10265f] px-6 py-3 font-black text-white"
          >
            Retour au login
          </button>

        </div>

      </main>
    );
  }


  const firstVehicle =
    workspace.vehicles[0]
      ?.vehicle ??
    null;

  const initials =
    `${workspace.customer.firstName.charAt(0)}${workspace.customer.lastName.charAt(0)}`;


  return (

    <main className="min-h-screen bg-[#eef3f9] px-6 py-5 text-slate-950 w-full min-w-0 overflow-x-hidden">

      <div className="mx-auto max-w-[1480px]">


        {/* TOPBAR */}
        <header className="flex items-start justify-between">

          <div>

            <div className="text-[20px] font-black leading-none text-[#1c4fe0]">
              TaPiecesAuto
            </div>

            <div className="mt-2 text-[14px] text-slate-600">
              Espace client
            </div>

          </div>


          <div className="flex gap-4">

            <button
              type="button"
              onClick={
                () =>
                  router.push(
                    "/login",
                  )
              }
              className="rounded-xl border border-slate-300 bg-white px-7 py-4 text-[16px] font-black shadow-sm"
            >
              ← Sortie
            </button>

            <button
              type="button"
              className="rounded-xl bg-[#10265f] px-7 py-4 text-[16px] font-black text-white shadow-sm"
            >
              ⌂ Accueil
            </button>

          </div>

        </header>


        {/* PROFIL */}
        <section className="mt-8 flex items-center justify-between rounded-[28px] border border-slate-200 bg-white px-8 py-7 shadow-sm">

          <div className="flex items-center gap-7">

            <div className="flex h-[84px] w-[84px] items-center justify-center rounded-full bg-[#10265f] text-[28px] font-black text-white">
              {initials}
            </div>

            <div>

              <h1 className="text-[28px] font-black leading-tight">
                {workspace.customer.firstName}{" "}
                {workspace.customer.lastName}
              </h1>

              {
                firstVehicle && (
                  <p className="mt-2 text-[16px] text-slate-800">
                    {firstVehicle.brand}{" "}
                    {firstVehicle.model}{" "}
                    {firstVehicle.year}{" "}
                    {firstVehicle.engine}
                  </p>
                )
              }

              <span className="mt-3 inline-block rounded-full bg-[#d9e7ff] px-3 py-1 text-[13px] font-bold text-[#1b4fd8]">
                {
                  workspace.customer.profile ===
                  "bricoleur"
                    ? "Bricoleur"
                    : workspace.customer.profile ===
                      "mecanicien-garage"
                      ? "Mécanicien / professionnel"
                      : "Particulier"
                }
              </span>

            </div>

          </div>


          <div className="flex items-center gap-8 text-[15px] text-slate-700">

            <div>
              ☎ {workspace.customer.phone}
            </div>

            <div>
              ✉ {workspace.customer.email}
            </div>

            <button
              type="button"
              className="font-semibold text-[#1b4fd8]"
            >
              ♙ Mon profil
            </button>

          </div>

        </section>


        {/* TITRE */}
        <section className="mt-8 text-center">

          <h2 className="text-[40px] font-black leading-tight">
            Que souhaitez-vous faire ?
          </h2>

          <p className="mt-3 text-[18px] text-slate-600">
            Accédez rapidement à tous les services TaPiecesAuto.
          </p>

        </section>


        {/* 3 ACTIONS */}
        <section className="mt-8 grid grid-cols-3 gap-7">

          <button
            type="button"
            onClick={startClientDiagnostic}
            className="group min-h-[285px] rounded-[28px] bg-[#10265f] p-8 text-left text-white shadow-lg transition hover:-translate-y-1"
          >

            <IconProblem />

            <h3 className="mt-8 text-[31px] font-black">
              J&apos;ai un problème
            </h3>

            <p className="mt-4 max-w-[360px] text-[17px] leading-7 text-blue-100">
              Lancer le diagnostic TaPiecesAuto
              <br />
              avec mon véhicule.
            </p>

            <div className="mt-7 flex justify-end">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-2xl">
                →
              </div>
            </div>

          </button>


          <button
            type="button"
            onClick={startClientKnownPart}
            className="group min-h-[285px] rounded-[28px] border border-slate-200 bg-white p-8 text-left shadow-lg transition hover:-translate-y-1"
          >

            <div className="text-[#10265f]">
              <IconCart />
            </div>

            <h3 className="mt-8 text-[31px] font-black">
              Je connais ma pièce
            </h3>

            <p className="mt-4 max-w-[360px] text-[17px] leading-7 text-slate-600">
              Recherche directe par référence,
              <br />
              marque, modèle ou catégorie.
            </p>

            <div className="mt-7 flex justify-end">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 text-2xl">
                →
              </div>
            </div>

          </button>


          

        </section>


        {/* GARAGE */}
        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">

          <div className="grid grid-cols-[285px_1fr] gap-6">

            <div>

              <div className="flex items-center gap-3 text-[#10265f]">
                <IconGarage />

                <h2 className="text-[24px] font-black text-slate-950">
                  Mon garage
                </h2>
              </div>

              <p className="mt-3 text-[16px] font-bold">
                Vos véhicules enregistrés
              </p>

              <p className="mt-2 text-[14px] leading-6 text-slate-600">
                Accédez rapidement à vos véhicules, à leur historique et à vos recherches.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/client/vehicles",
                  )
                }
                className="mt-5 rounded-xl bg-[#10265f] px-5 py-3 text-[14px] font-black text-white"
              >
                🚗 Voir mes véhicules →
              </button>

            </div>


            <div className="grid grid-cols-[1fr_1fr_180px] gap-4">

              {
                workspace.vehicles
                  .slice(
                    0,
                    2,
                  )
                  .map(
                    item => (

                      <article
                        key={
                          item.vehicle.id
                        }
                        onClick={() =>
                          setSelectedVehicleId(
                            item.vehicle.id,
                          )
                        }
                        className={`relative flex min-h-[190px] cursor-pointer items-center rounded-2xl border px-5 py-5 transition ${
                          selectedVehicleId ===
                          item.vehicle.id
                            ? "border-[#10265f] ring-2 ring-[#10265f]/20"
                            : "border-slate-200"
                        }`}
                      >

                        <button
                          type="button"
                          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-black"
                        >
                          ···
                        </button>


                        <div className="mr-5 flex h-[95px] w-[150px] items-center justify-center rounded-xl bg-slate-100 text-[12px] font-bold text-slate-400">
                          Photo véhicule
                        </div>


                        <div className="pr-5">

                          <h3 className="text-[20px] font-black leading-tight">
                            {item.vehicle.brand}{" "}
                            {item.vehicle.model}
                          </h3>

                          <p className="mt-1 text-[14px] font-bold">
                            {item.vehicle.year}{" "}
                            {item.vehicle.engine}
                          </p>

                          {
                            item.vehicle.vin && (
                              <>
                                <p className="mt-4 text-[12px] text-slate-500">
                                  VIN
                                </p>

                                <p className="text-[12px] font-semibold text-slate-700">
                                  {item.vehicle.vin}
                                </p>
                              </>
                            )
                          }

                        </div>

                      </article>

                    ),
                  )
              }


              <button
                type="button"
                className="flex min-h-[190px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/20 text-[#1b4fd8]"
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1b5de8] text-3xl font-black text-white">
                  +
                </div>

                <p className="mt-3 text-[16px] font-black">
                  Ajouter
                </p>

                <p className="text-[14px]">
                  un véhicule
                </p>

              </button>

            </div>

          </div>

        </section>


        {/* BAS */}
        <section className="mt-7 grid grid-cols-4 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">

          <button
            type="button"
            onClick={() =>
              router.push(
                "/client/history",
              )
            }
            className="flex min-h-[120px] items-center gap-6 border-r border-slate-200 px-7 text-left"
          >
            <div className="text-[#10265f]">
              <IconHistory />
            </div>

            <div>
              <h3 className="text-[17px] font-black">
                Historique
              </h3>

              <p className="mt-1 text-[13px] leading-5 text-slate-600">
                Vos recherches, diagnostics
                <br />
                et pièces consultées.
              </p>
            </div>
          </button>


          <button
            type="button"
            onClick={() =>
              router.push(
                "/client/orders",
              )
            }
            className="flex min-h-[120px] items-center gap-6 border-r border-slate-200 px-7 text-left"
          >
            <div className="text-[#10265f]">
              <IconBox />
            </div>

            <div>
              <h3 className="text-[17px] font-black">
                Commandes
              </h3>

              <p className="mt-1 text-[13px] leading-5 text-slate-600">
                Suivre vos commandes
                <br />
                et factures.
              </p>
            </div>
          </button>


          <button
            type="button"
            className="flex min-h-[120px] items-center gap-6 border-r border-slate-200 px-7 text-left"
          >
            <div className="text-[#10265f]">
              <IconStar />
            </div>

            <div>
              <h3 className="text-[17px] font-black">
                Favoris
              </h3>

              <p className="mt-1 text-[13px] leading-5 text-slate-600">
                Vos pièces et véhicules
                <br />
                enregistrés.
              </p>
            </div>
          </button>


          <button
            type="button"
            className="flex min-h-[120px] items-center gap-6 px-7 text-left"
          >
            <div className="text-[#10265f]">
              <IconTool />
            </div>

            <div>
              <h3 className="text-[17px] font-black">
                Outillage
              </h3>

              <p className="mt-1 text-[13px] leading-5 text-slate-600">
                Vos outils et équipements
                <br />
                associés.
              </p>
            </div>
          </button>

        </section>


        <footer className="py-7 text-center text-[13px] text-slate-500">
          TaPiecesAuto © 2026 — Tous droits réservés
        </footer>

      </div>

    </main>
  );
}