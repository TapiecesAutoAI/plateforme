"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  getClientOrders,
  type ClientOrder,
} from "../../../lib/client";


function statusLabel(
  status:
    ClientOrder["status"],
): string {

  switch (status) {

    case "confirmed":
      return "Confirmée";

    case "processing":
      return "En préparation";

    case "ready":
      return "Prête";

    case "shipped":
      return "Expédiée";

    case "completed":
      return "Terminée";

    case "cancelled":
      return "Annulée";
  }
}


export default function ClientOrdersPage() {

  const router =
    useRouter();

  const [
    orders,
    setOrders,
  ] =
    useState<ClientOrder[]>(
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

          if (active) {

            setOrders(
              getClientOrders(
                session.customerId,
              ),
            );

            setLoading(
              false,
            );
          }

        }
        catch {

          if (active) {
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


  const total =
    useMemo(
      () =>
        orders
          .filter(
            order =>
              order.status !==
              "cancelled",
          )
          .reduce(
            (
              sum,
              order,
            ) =>
              sum +
              order.totalIncVat,
            0,
          ),
      [orders],
    );


  if (loading) {

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3f9] w-full min-w-0 overflow-x-hidden">
        <p className="text-xl font-black">
          Chargement des commandes...
        </p>
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-[#eef3f9] px-6 py-8 text-slate-950 w-full min-w-0 overflow-x-hidden">

      <div className="mx-auto max-w-[1100px]">

        <header className="flex items-center justify-between">

          <div>

            <p className="text-sm font-black uppercase tracking-wide text-blue-700">
              Espace client
            </p>

            <h1 className="mt-1 text-4xl font-black">
              Mes commandes
            </h1>

            <p className="mt-2 text-slate-600">
              Suivi des commandes et factures.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/client",
              )
            }
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-black"
          >
            ← Retour
          </button>

        </header>


        <section className="mt-8 grid gap-4 sm:grid-cols-2">

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <p className="text-sm font-bold text-slate-500">
              Commandes
            </p>

            <p className="mt-1 text-3xl font-black">
              {orders.length}
            </p>

          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <p className="text-sm font-bold text-slate-500">
              Total
            </p>

            <p className="mt-1 text-3xl font-black">
              {
                total.toLocaleString(
                  "fr-BE",
                  {
                    minimumFractionDigits:
                      2,

                    maximumFractionDigits:
                      2,
                  },
                )
              } €
            </p>

          </div>

        </section>


        {
          orders.length ===
          0 ? (

            <section className="mt-6 rounded-[28px] bg-white p-10 text-center shadow-sm">

              <h2 className="text-2xl font-black">
                Aucune commande
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-slate-600">
                Vos futures commandes TaPiecesAuto apparaîtront ici dès qu'un achat sera confirmé.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/client",
                  )
                }
                className="mt-6 rounded-xl bg-[#10265f] px-6 py-3 font-black text-white"
              >
                Retour à mon espace
              </button>

            </section>

          ) : (

            <section className="mt-6 space-y-4">

              {
                orders.map(
                  order => (

                    <article
                      key={
                        order.id
                      }
                      className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
                    >

                      <div className="flex flex-col justify-between gap-4 sm:flex-row">

                        <div>

                          <p className="text-sm font-black uppercase text-blue-700">
                            {statusLabel(order.status)}
                          </p>

                          <h2 className="mt-1 text-xl font-black">
                            {order.id}
                          </h2>

                          <p className="mt-1 text-sm text-slate-500">
                            {
                              new Date(
                                order.createdAt,
                              ).toLocaleString(
                                "fr-BE",
                              )
                            }
                          </p>

                        </div>


                        <div className="sm:text-right">

                          <p className="text-2xl font-black">
                            {
                              order.totalIncVat.toLocaleString(
                                "fr-BE",
                                {
                                  minimumFractionDigits:
                                    2,

                                  maximumFractionDigits:
                                    2,
                                },
                              )
                            } €
                          </p>

                          {
                            order.invoiceNumber && (

                              <p className="mt-1 text-sm text-slate-500">
                                Facture : {order.invoiceNumber}
                              </p>

                            )
                          }

                        </div>

                      </div>


                      <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">

                        {
                          order.items.map(
                            (
                              item,
                              index,
                            ) => (

                              <div
                                key={
                                  `${order.id}-${item.reference}-${index}`
                                }
                                className="flex justify-between gap-4"
                              >

                                <div>

                                  <p className="font-black">
                                    {item.label}
                                  </p>

                                  <p className="text-sm text-slate-500">
                                    {
                                      item.brand
                                        ? `${item.brand} • `
                                        : ""
                                    }
                                    {item.reference}
                                  </p>

                                  <p className="text-sm text-slate-500">
                                    Quantité : {item.quantity}
                                  </p>

                                </div>

                                <p className="font-black">
                                  {
                                    item.totalIncVat.toLocaleString(
                                      "fr-BE",
                                      {
                                        minimumFractionDigits:
                                          2,

                                        maximumFractionDigits:
                                          2,
                                      },
                                    )
                                  } €
                                </p>

                              </div>

                            ),
                          )
                        }

                      </div>

                    </article>

                  ),
                )
              }

            </section>

          )
        }

      </div>

    </main>
  );
}