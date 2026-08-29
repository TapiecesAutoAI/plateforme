"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  getClientWorkspaceByCustomerId,
  type ClientWorkspace,
} from "../../../lib/client";

type FlatHistoryEntry = {
  id: string;
  vehicleId: string;
  vehicleLabel: string;
  vehicleBrand: string;
  vehicleModel: string;
  searchedAt: string;
  determinedPart: string;
  purchased: boolean;
  amount: number | null;
};

export default function ClientHistoryPage() {

  const [
    workspace,
    setWorkspace,
  ] =
    useState<ClientWorkspace | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

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
                method:
                  "GET",

                credentials:
                  "include",

                cache:
                  "no-store",
              },
            );

          if (!response.ok) {

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

          const session =
            await response.json();

          if (
            session?.authenticated !==
              true ||
            typeof session.customerId !==
              "string"
          ) {

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

          const currentWorkspace =
            getClientWorkspaceByCustomerId(
              session.customerId,
            );

          if (active) {

            setWorkspace(
              currentWorkspace,
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

      void loadWorkspace();

      return () => {

        active =
          false;
      };

    },
    [],
  );

  const history =
    useMemo<FlatHistoryEntry[]>(
      () => {

        if (!workspace) {
          return [];
        }

        return workspace.vehicles
          .flatMap(
            item =>
              item.history.map(
                entry => ({
                  id:
                    entry.id,

                  vehicleId:
                    item.vehicle.id,

                  vehicleLabel:
                    item.vehicle.label,

                  vehicleBrand:
                    item.vehicle.brand,

                  vehicleModel:
                    item.vehicle.model,

                  searchedAt:
                    entry.searchedAt,

                  determinedPart:
                    entry.determinedPart,

                  purchased:
                    entry.purchased,

                  amount:
                    entry.amount,
                }),
              ),
          )
          .sort(
            (a, b) =>
              new Date(
                b.searchedAt,
              ).getTime() -
              new Date(
                a.searchedAt,
              ).getTime(),
          );

      },
      [workspace],
    );

  const purchased =
    history.filter(
      entry =>
        entry.purchased,
    );

  const totalPurchased =
    purchased.reduce(
      (
        total,
        entry,
      ) =>
        total +
        (
          entry.amount ??
          0
        ),
      0,
    );

  if (loading) {

    return (
      <main className="min-h-screen bg-slate-50 p-6 w-full min-w-0 overflow-x-hidden">
        <div className="mx-auto max-w-5xl">
          <p className="text-slate-600">
            Chargement de votre historique...
          </p>
        </div>
      </main>
    );

  }

  if (!workspace) {

    return (
      <main className="min-h-screen bg-slate-50 p-6 w-full min-w-0 overflow-x-hidden">

        <div className="mx-auto max-w-3xl">

          <Link
            href="/client"
            className="font-semibold text-blue-950"
          >
            ← Retour
          </Link>

          <div className="mt-6 rounded-2xl bg-white p-8 shadow-sm">

            <h1 className="text-2xl font-black text-slate-950">
              Historique
            </h1>

            <p className="mt-3 text-slate-600">
              Impossible de charger votre espace client.
            </p>

          </div>

        </div>

      </main>
    );

  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 w-full min-w-0 overflow-x-hidden">

      <div className="mx-auto max-w-5xl">

        <div className="mb-6">

          <Link
            href="/client"
            className="inline-flex items-center font-bold text-blue-950 hover:underline"
          >
            ← Retour à mon espace
          </Link>

        </div>


        <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

            <div>

              <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
                TaPiecesAuto AI
              </p>

              <h1 className="mt-1 text-3xl font-black text-slate-950">
                Mon historique
              </h1>

              <p className="mt-2 text-slate-600">
                Retrouvez les pièces recherchées pour vos véhicules.
              </p>

            </div>

            <Link
              href="/client/vehicles"
              className="rounded-xl border border-slate-200 px-5 py-3 text-center font-bold text-slate-800 hover:bg-slate-50"
            >
              Mes véhicules
            </Link>

          </div>


          <div className="mt-8 grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-sm font-semibold text-slate-500">
                Recherches
              </p>

              <p className="mt-1 text-3xl font-black text-slate-950">
                {history.length}
              </p>

            </div>


            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-sm font-semibold text-slate-500">
                Pièces achetées
              </p>

              <p className="mt-1 text-3xl font-black text-slate-950">
                {purchased.length}
              </p>

            </div>


            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-sm font-semibold text-slate-500">
                Total achats
              </p>

              <p className="mt-1 text-3xl font-black text-slate-950">
                {
                  totalPurchased.toLocaleString(
                    "fr-BE",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    },
                  )
                } €
              </p>

            </div>

          </div>


          {
            history.length === 0 ? (

              <div className="mt-8 rounded-2xl bg-slate-50 p-8 text-center">

                <h2 className="text-xl font-black text-slate-950">
                  Aucun historique
                </h2>

                <p className="mt-2 text-slate-600">
                  Vos recherches de pièces apparaîtront ici.
                </p>

                <Link
                  href="/client/vehicles"
                  className="mt-5 inline-block rounded-xl bg-blue-950 px-6 py-3 font-bold text-white hover:bg-slate-950"
                >
                  Choisir un véhicule
                </Link>

              </div>

            ) : (

              <div className="mt-8 space-y-4">

                {
                  history.map(
                    entry => (

                      <article
                        key={
                          `${entry.vehicleId}-${entry.id}`
                        }
                        className="rounded-2xl border border-slate-200 p-5"
                      >

                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                          <div>

                            <p className="text-sm font-bold text-slate-400">
                              {
                                new Date(
                                  entry.searchedAt,
                                ).toLocaleDateString(
                                  "fr-BE",
                                  {
                                    day:
                                      "2-digit",
                                    month:
                                      "2-digit",
                                    year:
                                      "numeric",
                                  },
                                )
                              }
                            </p>

                            <h2 className="mt-1 text-xl font-black text-slate-950">
                              {entry.determinedPart}
                            </h2>

                            <p className="mt-2 text-sm font-semibold text-slate-600">
                              {entry.vehicleLabel}
                            </p>

                          </div>


                          <div className="sm:text-right">

                            <span
                              className={
                                entry.purchased
                                  ? "inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700"
                                  : "inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600"
                              }
                            >
                              {
                                entry.purchased
                                  ? "Achetée"
                                  : "Non achetée"
                              }
                            </span>

                            {
                              entry.amount !==
                                null && (

                                <p className="mt-3 text-xl font-black text-slate-950">
                                  {
                                    entry.amount.toLocaleString(
                                      "fr-BE",
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      },
                                    )
                                  } €
                                </p>

                              )
                            }

                          </div>

                        </div>


                        <div className="mt-5 border-t border-slate-100 pt-4">

                          <Link
                            href="/client/vehicles"
                            className="text-sm font-bold text-blue-950 hover:underline"
                          >
                            Voir ce véhicule
                          </Link>

                        </div>

                      </article>

                    ),
                  )
                }

              </div>

            )
          }

        </section>

      </div>

    </main>
  );
}
