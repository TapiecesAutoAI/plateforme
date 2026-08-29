"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

type TicketStatus =
  | "waiting"
  | "called"
  | "in-service"
  | "completed"
  | "cancelled";

type Ticket = {

  id:
    string;

  number:
    string;

  createdAt:
    string;

  calledAt:
    string | null;

  startedAt:
    string | null;

  completedAt:
    string | null;

  status:
    TicketStatus;

  customer: {

    id:
      string;

    firstName:
      string;

    lastName:
      string;

    phone:
      string;

    email:
      string;
  };

  vehicle: {

    id:
      string;

    vin:
      string | null;

    brand:
      string;

    model:
      string;

    year:
      number | null;

    engine:
      string;

    label:
      string;
  };

  profile:
    string;

  reason:
    string;

  storeId:
    string;

  terminalId:
    string;

  sellerId:
    string | null;
};


function profileLabel(
  profile:
    string,
) {

  if (
    profile ===
    "particulier"
  ) {
    return "Particulier";
  }

  if (
    profile ===
    "bricoleur"
  ) {
    return "Bricoleur";
  }

  if (
    profile ===
    "mecanicien-garage"
  ) {
    return "Mécanicien / professionnel";
  }

  return profile;
}


function statusLabel(
  status:
    TicketStatus,
) {

  if (
    status ===
    "waiting"
  ) {
    return "En attente";
  }

  if (
    status ===
    "called"
  ) {
    return "Appelé";
  }

  if (
    status ===
    "in-service"
  ) {
    return "Pris en charge";
  }

  if (
    status ===
    "completed"
  ) {
    return "Terminé";
  }

  return "Annulé";
}


export default function CounterPage() {

  const [
    tickets,
    setTickets,
  ] =
    useState<
      Ticket[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  const [
    error,
    setError,
  ] =
    useState<
      string |
      null
    >(null);


  const loadTickets =
    useCallback(
      async () => {

        try {

          const response =
            await fetch(
              "/api/showroom/counter",
              {
                cache:
                  "no-store",
              },
            );

          const data =
            await response.json();

          if (
            !response.ok ||
            !data.ok
          ) {

            throw new Error(
              data.error ??
              "Chargement impossible.",
            );
          }

          setTickets(
            data.tickets,
          );

          setError(
            null,
          );

        } catch (
          exception
        ) {

          setError(
            exception instanceof Error
              ? exception.message
              : "Erreur comptoir.",
          );
        }

        setLoading(
          false,
        );
      },
      [],
    );


  useEffect(
    () => {

      void loadTickets();

      const interval =
        window.setInterval(
          () => {

            void loadTickets();

          },
          2000,
        );

      return () => {

        window.clearInterval(
          interval,
        );
      };

    },
    [
      loadTickets,
    ],
  );


  async function updateStatus(
    ticket:
      Ticket,

    status:
      TicketStatus,
  ) {

    try {

      const response =
        await fetch(
          "/api/showroom/counter",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                action:
                  "status",

                ticketId:
                  ticket.id,

                status,

                sellerId:
                  "VENDEUR-DEMO-01",
              }),
          },
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.ok
      ) {

        throw new Error(
          data.error ??
          "Modification impossible.",
        );
      }

      await loadTickets();

    } catch (
      exception
    ) {

      setError(
        exception instanceof Error
          ? exception.message
          : "Erreur.",
      );
    }
  }


  const waiting =
    tickets.filter(
      ticket =>
        ticket.status ===
        "waiting",
    );


  const active =
    tickets.filter(
      ticket =>
        ticket.status ===
          "waiting" ||
        ticket.status ===
          "called" ||
        ticket.status ===
          "in-service",
    );


  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10 w-full min-w-0 overflow-x-hidden">

      <div className="mx-auto max-w-7xl">

        <header className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>

            <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-700">
              TaPiecesAuto
            </p>

            <h1 className="mt-2 text-4xl font-black text-slate-950">
              Comptoir vendeur
            </h1>

            <p className="mt-2 text-slate-600">
              Les clients envoyés depuis la borne apparaissent automatiquement.
            </p>

          </div>


          <div className="rounded-2xl bg-white px-7 py-5 shadow">

            <p className="text-sm text-slate-500">
              En attente
            </p>

            <p className="text-4xl font-black text-blue-950">
              {waiting.length}
            </p>

          </div>

        </header>


        {error && (

          <div className="mt-6 rounded-2xl bg-red-50 p-5 font-semibold text-red-700">
            {error}
          </div>

        )}


        {loading && (

          <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow">
            Chargement...
          </div>

        )}


        {!loading &&
          active.length === 0 && (

          <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow">

            <p className="text-2xl font-black">
              Aucun client en attente
            </p>

            <p className="mt-2 text-slate-500">
              Les tickets créés sur la borne apparaîtront ici automatiquement.
            </p>

          </div>

        )}


        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          {active.map(
            ticket => (

              <article
                key={
                  ticket.id
                }
                className="overflow-hidden rounded-3xl bg-white shadow-xl"
              >

                <div className="flex items-center justify-between border-b p-6">

                  <div>

                    <p className="text-xs font-black uppercase text-slate-400">
                      Ticket
                    </p>

                    <p className="text-5xl font-black text-blue-950">
                      {ticket.number}
                    </p>

                  </div>


                  <div className="text-right">

                    <p className="font-black">
                      {
                        statusLabel(
                          ticket.status,
                        )
                      }
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {
                        new Date(
                          ticket.createdAt,
                        )
                          .toLocaleTimeString(
                            "fr-BE",
                            {
                              hour:
                                "2-digit",

                              minute:
                                "2-digit",
                            },
                          )
                      }
                    </p>

                  </div>

                </div>


                <div className="p-6">

                  <div className="grid gap-6 md:grid-cols-2">

                    <div>

                      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                        Client
                      </p>

                      <p className="mt-1 text-xl font-black">
                        {ticket.customer.firstName}{" "}
                        {ticket.customer.lastName}
                      </p>

                      <p className="mt-2 font-semibold">
                        {ticket.customer.phone}
                      </p>

                      {ticket.customer.email && (

                        <p className="mt-1 text-sm text-slate-500">
                          {ticket.customer.email}
                        </p>

                      )}

                      <p className="mt-4 inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-800">
                        {
                          profileLabel(
                            ticket.profile,
                          )
                        }
                      </p>

                    </div>


                    <div>

                      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                        Véhicule
                      </p>

                      <p className="mt-1 text-xl font-black">
                        {ticket.vehicle.label}
                      </p>

                      {ticket.vehicle.vin && (

                        <p className="mt-2 break-all font-mono text-sm text-slate-500">
                          VIN {ticket.vehicle.vin}
                        </p>

                      )}

                    </div>

                  </div>


                  <div className="mt-7">

                    {ticket.status ===
                      "waiting" && (

                      <button
                        type="button"
                        onClick={
                          () =>
                            void updateStatus(
                              ticket,
                              "called",
                            )
                        }
                        className="w-full rounded-2xl bg-amber-400 px-6 py-4 text-lg font-black text-amber-950"
                      >
                        Appeler {ticket.number}
                      </button>

                    )}


                    {ticket.status ===
                      "called" && (

                      <button
                        type="button"
                        onClick={
                          () =>
                            void updateStatus(
                              ticket,
                              "in-service",
                            )
                        }
                        className="w-full rounded-2xl bg-blue-700 px-6 py-4 text-lg font-black text-white"
                      >
                        Prendre en charge
                      </button>

                    )}


                    {ticket.status ===
                      "in-service" && (

                      <button
                        type="button"
                        onClick={
                          () =>
                            void updateStatus(
                              ticket,
                              "completed",
                            )
                        }
                        className="w-full rounded-2xl bg-emerald-700 px-6 py-4 text-lg font-black text-white"
                      >
                        Terminer
                      </button>

                    )}

                  </div>

                </div>

              </article>

            ),
          )}

        </div>

      </div>

    </main>
  );
}
