"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import ChangePasswordButton from "./ChangePasswordButton";

type TicketStatus =
  | "waiting"
  | "called"
  | "in-service"
  | "completed"
  | "cancelled"
  | "no-show";

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

  noShowAt?:
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

  branchCode?:
    string | null;

  terminalCode?:
    string | null;

  sellerId:
    string | null;

  sellerName:
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

  const [sellerIdentity, setSellerIdentity] = useState<{
    customerId: string;
    displayName: string;
    branchCode: string | null;
    organizationId: string;
    organizationName: string;
    logoUrl: string | null;
  } | null>(null);

  const [
    tickets,
    setTickets,
  ] =
    useState<
      Ticket[]
    >([]);

  const [
    quickRequests,
    setQuickRequests,
  ] = useState<any[]>([]);

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


  useEffect(() => {
    let active = true;

    async function loadSellerIdentity() {
      const response = await fetch("/api/comptoir/context", {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) return;

      const data = await response.json();

      if (
        active &&
        data.ok === true &&
        typeof data.seller?.customerId === "string" &&
        typeof data.organization?.organizationId === "string"
      ) {
        setSellerIdentity({
          customerId: data.seller.customerId,
          displayName:
            typeof data.seller.displayName === "string"
              ? data.seller.displayName
              : "Vendeur",
          branchCode:
            typeof data.seller.branchCode === "string"
              ? data.seller.branchCode
              : null,
          organizationId: data.organization.organizationId,
          organizationName:
            typeof data.organization.name === "string"
              ? data.organization.name
              : "Magasin",
          logoUrl:
            typeof data.organization.logoUrl === "string"
              ? data.organization.logoUrl
              : null,
        });
      }
    }

    void loadSellerIdentity();

    const refreshSellerIdentity = () => {
      void loadSellerIdentity();
    };

    const refreshSellerIdentityWhenVisible = () => {
      if (document.visibilityState === "visible") {
        void loadSellerIdentity();
      }
    };

    window.addEventListener("focus", refreshSellerIdentity);
    document.addEventListener(
      "visibilitychange",
      refreshSellerIdentityWhenVisible,
    );

    return () => {
      active = false;

      window.removeEventListener(
        "focus",
        refreshSellerIdentity,
      );

      document.removeEventListener(
        "visibilitychange",
        refreshSellerIdentityWhenVisible,
      );
    };
  }, []);

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

          const quickResponse =
            await fetch(
              "/api/achat-rapide/counter-request",
              {
                cache: "no-store",
                credentials: "include",
              },
            );

          const quickData =
            await quickResponse.json();

          if (
            quickResponse.ok &&
            quickData.ok === true &&
            Array.isArray(quickData.requests)
          ) {
            setQuickRequests(
              quickData.requests,
            );
          }

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
                  sellerIdentity?.customerId ?? "",
              }),
          },
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.ok
      ) {

        if (
          data.error ===
          "TICKET_ALREADY_CLAIMED"
        ) {
          throw new Error(
            data.sellerName
              ? `Client déjà pris par ${data.sellerName}.`
              : "Client déjà pris par un autre vendeur.",
          );
        }

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
        ticket.sellerId === sellerIdentity?.customerId &&
        (ticket.status === "called" ||
          ticket.status === "in-service" ||
          (ticket.status === "no-show" &&
            !!ticket.noShowAt &&
            Date.now() - new Date(ticket.noShowAt).getTime() <
              5 * 60 * 1000)),
    );


  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10 w-full min-w-0 overflow-x-hidden">

      <div className="mx-auto max-w-7xl">

        <header className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>



            <h1 className="mt-2 text-4xl font-black text-slate-950">
              Comptoir vendeur
            </h1>

            <div className="mt-4 flex items-center gap-4">

              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow ring-1 ring-slate-200">

                {sellerIdentity?.logoUrl ? (
                  <img
                    src={sellerIdentity.logoUrl}
                    alt={sellerIdentity.organizationName}
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <span className="text-lg font-black text-blue-800">
                    {sellerIdentity?.organizationName
                      ?.slice(0, 2)
                      .toUpperCase() ?? "TP"}
                  </span>
                )}

              </div>

              <div>
                <p className="text-xl font-black text-slate-950">
                  {sellerIdentity?.displayName ?? "Vendeur"}
                  {sellerIdentity?.branchCode
                    ? ` · ${sellerIdentity.branchCode}`
                    : ""}
                </p>

                <p className="font-bold text-blue-700">
                  {sellerIdentity?.organizationName ?? "Chargement du magasin..."}
                </p>

                <a
                  href="/comptoir/profil"
                  className="mt-3 inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Mon profil
                </a>
              </div>

            </div>

            <p className="mt-4 text-slate-600">
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


        {quickRequests.length > 0 && (
          <section className="mt-8">
            <div className="mb-4">
              <h2 className="text-2xl font-black text-slate-950">
                Demandes Achat rapide
              </h2>
              <p className="text-sm text-slate-500">
                Commandes et demandes d'explications envoyées par les clients.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {quickRequests.map(request => (
                <article
                  key={request.id}
                  className="overflow-hidden rounded-3xl bg-white shadow-xl"
                >
                  <div className="flex items-center justify-between border-b p-6">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                        {request.type === "order"
                          ? "Commande"
                          : "Demande d'explications"}
                      </p>

                      <p className="mt-1 font-black text-slate-950">
                        {request.id}
                      </p>
                    </div>

                    <p className="text-xl font-black text-blue-950">
                      {Number(request.total).toFixed(2)} €
                    </p>
                  </div>

                  <div className="space-y-4 p-6">
                    {Array.isArray(request.items) &&
                      request.items.map((item: any) => (
                        <div
                          key={`${request.id}-${item.productId}`}
                          className="flex justify-between gap-4 border-b border-slate-100 pb-3 last:border-0"
                        >
                          <div>
                            <p className="font-bold text-slate-950">
                              {item.name}
                            </p>
                            <p className="text-sm text-slate-500">
                              Réf. {item.supplierCode}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-bold">
                              Qté {item.quantity}
                            </p>
                            <p className="text-sm text-slate-500">
                              {item.unitPrice == null
                                ? "Prix à confirmer"
                                : `${Number(item.unitPrice).toFixed(2)} €`}
                            </p>
                          </div>
                        </div>
                      ))}

                    <p className="text-xs text-slate-400">
                      Client : {request.customerId}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          {active.map(
            ticket => (

              <article
                key={
                  ticket.id
                }
                className={ticket.status === "no-show" ? "overflow-hidden rounded-3xl bg-amber-200 shadow-xl ring-2 ring-amber-400" : "overflow-hidden rounded-3xl bg-white shadow-xl"}
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
                          .toLocaleString(
                            "fr-BE",
                            {
                              day:
                                "2-digit",
                              month:
                                "2-digit",
                              year:
                                "numeric",
                              hour:
                                "2-digit",
                              minute:
                                "2-digit",
                            },
                          )
                          .replace(",", " ·")
                      }
                    </p>

                    {
                      (
                        ticket.branchCode ||
                        ticket.terminalCode
                      ) && (
                        <p className="mt-1 text-sm font-medium text-slate-600">
                          {
                            ticket.terminalCode
                              ? `Borne ${ticket.terminalCode}`
                              : ""
                          }
                        </p>
                      )
                    }

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

                      ticket.sellerId ===
                      sellerIdentity?.customerId ? (

                        <>
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

                        <button
                          type="button"
                          onClick={() => void updateStatus(ticket, "no-show")}
                          className="mt-3 w-full rounded-2xl bg-amber-200 px-6 py-4 text-lg font-black text-amber-900"
                        >
                          Client plus là
                        </button>
                        </>

                      ) : (

                        <div className="mb-3 rounded-xl bg-amber-50 px-4 py-3 text-center font-black text-amber-800">
                          Appelé par{" "}
                          {ticket.sellerName ??
                            "un autre vendeur"}
                        </div>

                      )

                    )}


                    {ticket.status ===
                      "in-service" &&
                      ticket.sellerName && (

                      <div className="mb-3 rounded-xl bg-blue-50 px-4 py-3 text-center font-black text-blue-800">
                        Pris par {ticket.sellerName}
                      </div>

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

                    {ticket.status === "no-show" && (
                      <button type="button" onClick={() => void updateStatus(ticket, "called")} className="w-full rounded-2xl bg-amber-600 px-6 py-4 text-lg font-black text-white">
                        Reprendre
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
