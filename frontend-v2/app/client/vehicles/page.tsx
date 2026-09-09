"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {

  prepareClientDiagnostic,
  prepareClientKnownPart,
  type ClientWorkspace,
  type ClientGarageVehicle,
} from "../../../lib/client";

import {
  getVehicleHistory,
  type VehicleHistoryEntry,
} from "../../../lib/showroom/demoVehicleHistory";


export default function ClientVehiclesPage() {

  const router =
    useRouter();

  const [
    workspace,
    setWorkspace,
  ] =
    useState<ClientWorkspace | null>(
      null,
    );

  const [
    vehicles,
    setVehicles,
  ] =
    useState<ClientGarageVehicle[]>(
      [],
    );

  const [
    selectedVehicleId,
    setSelectedVehicleId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    historyVehicleId,
    setHistoryVehicleId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    history,
    setHistory,
  ] =
    useState<VehicleHistoryEntry[]>(
      [],
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );


  useEffect(
    () => {
      let active =
        true;

      async function load() {
        try {
          const response =
            await fetch(
              "/api/auth/session",
              {
                method:
                  "GET",

                credentials:
                  "include",

                cache:
                  "no-store",
              },
            );

          if (!response.ok) {
            router.push(
              "/login",
            );

            return;
          }

          const session =
            await response.json();

          if (
            session?.authenticated !==
              true ||
            typeof session.customerId !==
              "string"
          ) {
            router.push(
              "/login",
            );

            return;
          }

          const workspaceResponse =
            await fetch(
              "/api/client/workspace",
              {
                method:
                  "GET",

                credentials:
                  "include",

                cache:
                  "no-store",
              },
            );

          if (!workspaceResponse.ok) {

            if (active) {
              setWorkspace(
                null,
              );

              setLoading(
                false,
              );
            }

            return;
          }

          const workspacePayload =
            await workspaceResponse.json();

          const clientWorkspace =
            workspacePayload?.ok === true
              ? workspacePayload.workspace ?? null
              : null;

          if (!clientWorkspace) {
            if (active) {
              setWorkspace(
                null,
              );

              setLoading(
                false,
              );
            }

            return;
          }

          const vehiclesResponse =
            await fetch(
              "/api/client/vehicles",
              {
                method:
                  "GET",

                credentials:
                  "include",

                cache:
                  "no-store",
              },
            );

          if (!vehiclesResponse.ok) {
            throw new Error(
              "VEHICLES_LOAD_FAILED",
            );
          }

          const vehiclesPayload =
            await vehiclesResponse.json();

          const garageVehicles =
            vehiclesPayload?.ok === true &&
            Array.isArray(
              vehiclesPayload.vehicles,
            )
              ? vehiclesPayload.vehicles
              : [];

          if (active) {
            setWorkspace(
              clientWorkspace,
            );

            setVehicles(
              garageVehicles,
            );

            setSelectedVehicleId(
              garageVehicles[0]?.id ??
              null,
            );

            setLoading(
              false,
            );
          }
        }
        catch {
          if (active) {
            setWorkspace(
              null,
            );

            setLoading(
              false,
            );
          }
        }
      }

      void load();

      return () => {
        active =
          false;
      };
    },
    [
      router,
    ],
  );


  async function refreshGarage() {
    if (!workspace) {
      return;
    }

    const response =
      await fetch(
        "/api/client/vehicles",
        {
          method:
            "GET",

          credentials:
            "include",

          cache:
            "no-store",
        },
      );

    if (!response.ok) {
      return;
    }

    const payload =
      await response.json();

    const next =
      payload?.ok === true &&
      Array.isArray(
        payload.vehicles,
      )
        ? payload.vehicles
        : [];

    setVehicles(
      next,
    );

    if (
      selectedVehicleId &&
      !next.some(
        (
          vehicle:
            ClientGarageVehicle,
        ) =>
          vehicle.id ===
            selectedVehicleId,
      )
    ) {
      setSelectedVehicleId(
        next[0]?.id ??
        null,
      );
    }
  }


  function selectVehicle(
    vehicleId:
      string,
  ) {
    setSelectedVehicleId(
      vehicleId,
    );

    setHistoryVehicleId(
      null,
    );

    setHistory(
      [],
    );
  }


  function showHistory(
    vehicleId:
      string,
  ) {
    setHistoryVehicleId(
      vehicleId,
    );

    setHistory(
      getVehicleHistory(
        vehicleId,
      ),
    );
  }


  function startDiagnostic(
    vehicle:
      ClientGarageVehicle,
  ) {
    if (!workspace) {
      return;
    }

    prepareClientDiagnostic(
      workspace.customer,
      vehicle as any,
    );

    router.push(
      "/showroom/particulier",
    );
  }


  function startKnownPart(
    vehicle:
      ClientGarageVehicle,
  ) {
    if (!workspace) {
      return;
    }

    prepareClientKnownPart(
      workspace.customer,
      vehicle as any,
    );

    router.push(
      "/piece?source=showroom&mode=known-part",
    );
  }


  const [
    vehiclePendingDelete,
    setVehiclePendingDelete,
  ] =
    useState<ClientGarageVehicle | null>(
      null,
    );

  const [
    deletingVehicle,
    setDeletingVehicle,
  ] =
    useState(false);

  const [
    deleteVehicleError,
    setDeleteVehicleError,
  ] =
    useState<string | null>(null);

  async function deleteVehicle(
    vehicle:
      ClientGarageVehicle,
  ) {
    if (!workspace) {
      return;
    }
    setDeletingVehicle(true);
    setDeleteVehicleError(null);

    const response =
      await fetch(
        `/api/client/vehicles?id=${
          encodeURIComponent(
            vehicle.id,
          )
        }`,
        {
          method:
            "DELETE",

          credentials:
            "include",
        },
      );

    if (!response.ok) {
      setDeleteVehicleError(
        "Impossible de supprimer le vehicule.",
      );
      setDeletingVehicle(false);
      return;
    }

    await refreshGarage();

    setDeletingVehicle(false);
    setVehiclePendingDelete(null);
    setDeleteVehicleError(null);
  }


  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3f9] w-full min-w-0 overflow-x-hidden">
        <p className="text-xl font-black">
          Chargement de votre garage...
        </p>
      </main>
    );
  }


  if (!workspace) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3f9] w-full min-w-0 overflow-x-hidden">
        <div className="rounded-3xl bg-white p-10 shadow-xl">
          <h1 className="text-2xl font-black">
            Garage introuvable
          </h1>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/client",
              )
            }
            className="mt-6 rounded-xl bg-[#10265f] px-6 py-3 font-black text-white"
          >
            Retour
          </button>
        </div>
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-[#eef3f9] px-6 py-6 text-slate-950 w-full min-w-0 overflow-x-hidden">

      <div className="mx-auto max-w-[1300px]">

        <header className="flex items-center justify-between">

          <div>
            <p className="text-sm font-black uppercase tracking-wide text-blue-700">
              Espace client
            </p>

            <h1 className="mt-1 text-4xl font-black">
              Mon garage
            </h1>

            <p className="mt-2 text-slate-600">
              {workspace.customer.firstName}{" "}
              {workspace.customer.lastName}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/client",
              )
            }
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-black shadow-sm"
          >
            ← Retour
          </button>

        </header>


        <section className="mt-8">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-2xl font-black">
                Vos véhicules
              </h2>

              <p className="mt-1 text-slate-600">
                {vehicles.length} véhicule
                {vehicles.length > 1
                  ? "s"
                  : ""}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/client/vehicles/new",
                )
              }
              className="rounded-xl bg-[#10265f] px-6 py-3 font-black text-white"
            >
              + Ajouter un véhicule
            </button>

          </div>


          <div className="mt-6 grid gap-5 md:grid-cols-2">

            {
              vehicles.map(
                vehicle => {

                  const selected =
                    selectedVehicleId ===
                    vehicle.id;

                  return (
                    <article
                      key={
                        vehicle.id
                      }
                      onClick={() =>
                        selectVehicle(
                          vehicle.id,
                        )
                      }
                      className={`cursor-pointer rounded-[24px] border bg-white p-6 shadow-sm transition ${
                        selected
                          ? "border-[#10265f] ring-2 ring-[#10265f]/20"
                          : "border-slate-200"
                      }`}
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div>
                          <p className="text-sm font-black uppercase text-blue-700">
                            {
                              selected
                                ? "Véhicule sélectionné"
                                : "Véhicule"
                            }
                          </p>

                          <h3 className="mt-2 text-2xl font-black">
                            {
                              vehicle.label ??
                              `${vehicle.brand ?? ""} ${vehicle.model ?? ""}`.trim()
                            }
                          </h3>

                          {
                            vehicle.vin && (
                              <p className="mt-2 text-sm text-slate-500">
                                VIN : {vehicle.vin}
                              </p>
                            )
                          }

                        </div>

                        <button
                          type="button"
                          onClick={
                            event => {
                              event.stopPropagation();

                              router.push(
                                `/client/vehicles/${vehicle.id}/edit`,
                              );
                            }
                          }
                          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-black"
                        >
                          Modifier
                        </button>

                      </div>


                      <div className="mt-6 grid gap-3 sm:grid-cols-2">

                        <button
                          type="button"
                          onClick={
                            event => {
                              event.stopPropagation();

                              startDiagnostic(
                                vehicle,
                              );
                            }
                          }
                          className="rounded-xl bg-[#10265f] px-4 py-3 font-black text-white"
                        >
                          Diagnostic
                        </button>

                        <button
                          type="button"
                          onClick={
                            event => {
                              event.stopPropagation();

                              startKnownPart(
                                vehicle,
                              );
                            }
                          }
                          className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-black"
                        >
                          Je connais ma pièce
                        </button>

                        <button
                          type="button"
                          onClick={
                            event => {
                              event.stopPropagation();

                              showHistory(
                                vehicle.id,
                              );
                            }
                          }
                          className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 font-black text-blue-950"
                        >
                          Historique
                        </button>

                        <button
                          type="button"
                          onClick={
                            event => {
                              event.stopPropagation();

                              setDeleteVehicleError(
                                null,
                              );
                              setVehiclePendingDelete(
                                vehicle,
                              );
                            }
                          }
                          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-black text-red-700"
                        >
                          Supprimer
                        </button>

                      </div>

                    </article>
                  );
                },
              )
            }

          </div>

        </section>


        {
          historyVehicleId && (
            <section className="mt-8 rounded-[24px] border border-slate-200 bg-white p-7 shadow-sm">

              <div className="flex items-center justify-between">

                <h2 className="text-2xl font-black">
                  Historique
                </h2>

                <button
                  type="button"
                  onClick={() => {
                    setHistoryVehicleId(
                      null,
                    );

                    setHistory(
                      [],
                    );
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-black"
                >
                  Fermer
                </button>

              </div>


              {
                history.length === 0
                  ? (
                    <p className="mt-5 text-slate-600">
                      Aucun historique pour ce véhicule.
                    </p>
                  )
                  : (
                    <div className="mt-5 space-y-3">

                      {
                        [...history]
                          .sort(
                            (
                              a,
                              b,
                            ) =>
                              new Date(
                                b.searchedAt,
                              ).getTime() -
                              new Date(
                                a.searchedAt,
                              ).getTime(),
                          )
                          .map(
                            entry => (
                              <div
                                key={
                                  entry.id
                                }
                                className="rounded-xl border border-slate-200 p-4"
                              >

                                <div className="flex items-start justify-between gap-4">

                                  <div>
                                    <p className="font-black">
                                      {entry.determinedPart}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                      {
                                        new Date(
                                          entry.searchedAt,
                                        ).toLocaleDateString(
                                          "fr-BE",
                                        )
                                      }
                                    </p>
                                  </div>

                                  <div className="text-right">

                                    <p className="font-black">
                                      {
                                        entry.purchased
                                          ? "Acheté"
                                          : "Non acheté"
                                      }
                                    </p>

                                    {
                                      entry.amount !==
                                        null && (
                                        <p className="mt-1 text-sm text-slate-600">
                                          {
                                            entry.amount.toFixed(
                                              2,
                                            )
                                          } €
                                        </p>
                                      )
                                    }

                                  </div>

                                </div>

                              </div>
                            ),
                          )
                      }

                    </div>
                  )
              }

            </section>
          )
        }

      </div>


      {vehiclePendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-vehicle-title"
          onMouseDown={event => {
            if (
              event.target ===
                event.currentTarget &&
              !deletingVehicle
            ) {
              setVehiclePendingDelete(
                null,
              );
              setDeleteVehicleError(
                null,
              );
            }
          }}
        >
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-2xl font-black text-red-600">
              !
            </div>

            <h2
              id="delete-vehicle-title"
              className="text-2xl font-black text-slate-950"
            >
              Supprimer ce vehicule ?
            </h2>

            <p className="mt-3 text-base font-semibold leading-6 text-slate-600">
              Vous allez retirer
              {" "}
              <strong className="text-slate-950">
                {vehiclePendingDelete.label ??
                  `${
                    vehiclePendingDelete.brand ??
                    ""
                  } ${
                    vehiclePendingDelete.model ??
                    ""
                  }`.trim()}
              </strong>
              {" "}
              de votre garage.
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-500">
              Cette action retire le vehicule de votre compte TPA.
            </p>

            {deleteVehicleError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700">
                {deleteVehicleError}
              </div>
            )}

            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={deletingVehicle}
                onClick={() => {
                  setVehiclePendingDelete(
                    null,
                  );
                  setDeleteVehicleError(
                    null,
                  );
                }}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-black text-slate-900 disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="button"
                disabled={deletingVehicle}
                onClick={() => {
                  void deleteVehicle(
                    vehiclePendingDelete,
                  );
                }}
                className="rounded-xl bg-red-600 px-4 py-3 font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingVehicle
                  ? "Suppression..."
                  : "Oui, supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

</main>
  );
}