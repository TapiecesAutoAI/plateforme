"use client";

import {
  useEffect,
  useState,
} from "react";

type Identification = {
  status: string;

  readyForCompatibilityCheck:
    boolean;

  message:
    string;

  vehicle: {
    vin:
      string | null;

    brand:
      string | null;

    model:
      string | null;

    year:
      number | null;

    engine:
      string | null;
  };
};

type Offer = {
  diagnosticPartName:
    string | null;

  salePriceIncVat:
    number | null;

  canOrder:
    boolean;

  offer: {
    reference:
      string;

    manufacturer:
      string;

    genericPartName:
      string;

    salePriceExVat:
      number | null;

    stockStatus:
      string;

    stockQuantity:
      number | null;

    deliveryDays:
      number | null;
  } | null;
};

type CounterHandoff = {
  id: string;

  status: string;

  genericPartName:
    string;

  reference:
    string;

  manufacturer:
    string;

  quantity:
    number;

  totalIncVat:
    number;

  vehicleDescription:
    string | null;

  vin:
    string | null;
};

export default function PiecePage() {

  const [
    partName,
    setPartName,
  ] =
    useState("");

  const [
    vin,
    setVin,
  ] =
    useState("");

  const [
    brand,
    setBrand,
  ] =
    useState("");

  const [
    model,
    setModel,
  ] =
    useState("");

  const [
    year,
    setYear,
  ] =
    useState("");

  const [
    engine,
    setEngine,
  ] =
    useState("");

  const [
    identification,
    setIdentification,
  ] =
    useState<
      Identification |
      null
    >(null);

  const [
    offer,
    setOffer,
  ] =
    useState<
      Offer |
      null
    >(null);

  const [
    quantity,
    setQuantity,
  ] =
    useState(1);

  const [
    counter,
    setCounter,
  ] =
    useState<
      CounterHandoff |
      null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string |
      null
    >(null);

  const [
    knownPartMode,
    setKnownPartMode,
  ] =
    useState(false);

  /*
   * =========================================================
   * RECUPERATION DE LA PIECE ISSUE DU DIAGNOSTIC
   * =========================================================
   */

  useEffect(
    () => {

      const params =
        new URLSearchParams(
          window.location.search,
        );

      const diagnosticPart =
        params.get(
          "part",
        );

      const mode =
        params.get(
          "mode",
        );

      const source =
        params.get(
          "source",
        );

      const isKnownPart =
        mode === "known-part" &&
        source === "showroom";

      setKnownPartMode(
        isKnownPart,
      );

      if (diagnosticPart) {

        setPartName(
          diagnosticPart,
        );

      }

      if (isKnownPart) {

        const rawVehicle =
          window.sessionStorage.getItem(
            "tapiecesauto-showroom-vehicle",
          );

        if (rawVehicle) {

          try {

            const vehicle =
              JSON.parse(
                rawVehicle,
              );

            setVin(
              vehicle.vin ?? "",
            );

            setBrand(
              vehicle.brand ?? "",
            );

            setModel(
              vehicle.model ?? "",
            );

            setYear(
              vehicle.year
                ? String(vehicle.year)
                : "",
            );

            setEngine(
              vehicle.engine ?? "",
            );

          }
          catch {

            setError(
              "Impossible de récupérer le véhicule sélectionné.",
            );
          }
        }

        return;
      }

      if (!diagnosticPart) {

        setError(
          "Aucune pièce n'a été transmise par le diagnostic.",
        );
      }

    },
    [],
  );

  const vehiclePayload = {
    vin,
    brand,
    model,
    year,
    engine,
  };

  /*
   * =========================================================
   * IDENTIFIER VEHICULE
   * =========================================================
   */

  async function identifyVehicle() {

    setLoading(true);
    setError(null);
    setOffer(null);
    setCounter(null);

    try {

      const response =
        await fetch(
          "/api/showroom/particulier",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                command:
                  "identify-vehicle",

                ...vehiclePayload,
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
          data.identification
            ?.message ??
          "Identification du véhicule impossible.",
        );
      }

      setIdentification(
        data.identification,
      );

    } catch (
      exception
    ) {

      setError(
        exception instanceof Error
          ? exception.message
          : "Erreur d'identification.",
      );

    } finally {

      setLoading(false);

    }
  }

  /*
   * =========================================================
   * RECHERCHER REFERENCE
   * =========================================================
   */

  async function findOffer() {

    if (!partName) {

      setError(
        "Aucune pièce diagnostiquée.",
      );

      return;
    }

    setLoading(true);
    setError(null);

    try {

      const response =
        await fetch(
          "/api/showroom/particulier",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                command:
                  "find-offer",

                partName,

                ...vehiclePayload,
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
          "Aucune référence commerciale disponible.",
        );
      }

      setIdentification(
        data.identification,
      );

      setOffer(
        data.offer,
      );

      if (
        !data.offer?.offer
      ) {

        setError(
          "La pièce a bien été identifiée, mais aucune référence commerciale n'est encore disponible dans le catalogue MVP.",
        );
      }

    } catch (
      exception
    ) {

      setError(
        exception instanceof Error
          ? exception.message
          : "Recherche impossible.",
      );

    } finally {

      setLoading(false);

    }
  }

  /*
   * =========================================================
   * ENVOYER AU COMPTOIR
   * =========================================================
   */

  async function sendToCounter() {

    if (
      !partName ||
      !offer?.offer
    ) {

      setError(
        "La référence doit être trouvée avant l'envoi au comptoir.",
      );

      return;
    }

    setLoading(true);
    setError(null);

    try {

      const response =
        await fetch(
          "/api/showroom/particulier",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                command:
                  "send-to-counter",

                partName,

                quantity,

                storeId:
                  "GROSSISTE-DEMO",

                terminalId:
                  "BORNE-01",

                ...vehiclePayload,
              }),
          },
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.ok ||
        !data.handoff
      ) {

        throw new Error(
          data.error ??
          "Envoi au comptoir impossible.",
        );
      }

      setCounter(
        data.handoff,
      );

    } catch (
      exception
    ) {

      setError(
        exception instanceof Error
          ? exception.message
          : "Erreur d'envoi au comptoir.",
      );

    } finally {

      setLoading(false);

    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-5 md:p-10">

      <div className="mx-auto max-w-4xl">

        <div className="flex items-start justify-between gap-6">

          <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
            TaPiecesAuto AI
          </p>

          <button
            type="button"
            onClick={
              () => {

                if (
                  window.history.length >
                  1
                ) {

                  window.history.back();

                  return;
                }

                window.location.href =
                  "/showroom";
              }
            }
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-800 shadow-sm hover:bg-slate-50"
          >
            ← Retour
          </button>

        </div>

        <h1 className="mt-2 text-4xl font-bold text-slate-900">
          {knownPartMode
            ? "Rechercher une pièce"
            : "Identifier votre véhicule"}
        </h1>

        {
          partName &&
          (
            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">

              <p className="text-sm font-semibold uppercase text-blue-700">
                Pièce déterminée par le diagnostic
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                {partName}
              </p>

            </div>
          )
        }

        {knownPartMode && (
          <section className="mt-6 rounded-3xl bg-white p-7 shadow-xl">

            <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
              Véhicule sélectionné
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              {[brand, model, year, engine]
                .filter(Boolean)
                .join(" ")}
            </h2>

            {vin && (
              <p className="mt-2 font-mono text-sm text-slate-500">
                VIN : {vin}
              </p>
            )}

            <div className="mt-7 border-t border-slate-200 pt-6">

              <label className="text-xl font-bold text-slate-950">
                Quelle pièce recherchez-vous ?
              </label>

              <p className="mt-2 text-sm text-slate-600">
                Introduisez le nom de la pièce ou sa référence.
              </p>

              <input
                value={partName}
                onChange={
                  event =>
                    setPartName(
                      event.target.value,
                    )
                }
                placeholder="Ex. démarreur, alternateur, plaquettes, référence..."
                className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-4 text-lg"
              />

              <button
                type="button"
                disabled={
                  loading ||
                  !partName.trim()
                }
                onClick={
                  findOffer
                }
                className="mt-5 w-full rounded-xl bg-blue-950 px-6 py-4 font-bold text-white disabled:bg-slate-400"
              >
                Rechercher la pièce compatible
              </button>

            </div>

          </section>
        )}

        {!knownPartMode && (
          <>
            <section className="mt-6 rounded-3xl bg-white p-7 shadow-xl">

              <h2 className="text-xl font-bold">
                Numéro VIN
              </h2>

          <p className="mt-2 text-sm text-slate-600">
            Utilisez de préférence le VIN pour identifier précisément le véhicule.
          </p>

          <input
            value={vin}
            onChange={
              event =>
                setVin(
                  event.target.value
                    .toUpperCase(),
                )
            }
            placeholder="VIN"
            className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 font-mono"
          />

          <div className="my-7 flex items-center gap-4">

            <div className="h-px flex-1 bg-slate-200" />

            <span className="text-sm text-slate-400">
              ou
            </span>

            <div className="h-px flex-1 bg-slate-200" />

          </div>

          <div className="grid gap-4 md:grid-cols-2">

            <input
              value={brand}
              onChange={
                event =>
                  setBrand(
                    event.target.value,
                  )
              }
              placeholder="Marque"
              className="rounded-xl border border-slate-300 px-4 py-3"
            />

            <input
              value={model}
              onChange={
                event =>
                  setModel(
                    event.target.value,
                  )
              }
              placeholder="Modèle"
              className="rounded-xl border border-slate-300 px-4 py-3"
            />

            <input
              type="number"
              value={year}
              onChange={
                event =>
                  setYear(
                    event.target.value,
                  )
              }
              placeholder="Année"
              className="rounded-xl border border-slate-300 px-4 py-3"
            />

            <input
              value={engine}
              onChange={
                event =>
                  setEngine(
                    event.target.value,
                  )
              }
              placeholder="Motorisation"
              className="rounded-xl border border-slate-300 px-4 py-3"
            />

          </div>

          <button
            type="button"
            disabled={
              loading
            }
            onClick={
              identifyVehicle
            }
            className="mt-6 w-full rounded-xl bg-blue-950 px-6 py-3 font-semibold text-white disabled:bg-slate-400"
          >
            {
              loading
                ? "Identification..."
                : "Identifier le véhicule"
            }
          </button>

        </section>
          </>
        )}

        {
          identification
            ?.readyForCompatibilityCheck &&
          (
            <section className="mt-6 rounded-3xl bg-white p-7 shadow-xl">

              <p className="font-semibold text-emerald-700">
                Véhicule identifié
              </p>

              <p className="mt-2 text-sm text-slate-600">
                {identification.message}
              </p>

              <button
                type="button"
                disabled={
                  loading
                }
                onClick={
                  findOffer
                }
                className="mt-5 w-full rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white"
              >
                Rechercher la référence compatible
              </button>

            </section>
          )
        }

        {
          offer?.offer &&
          (
            <section className="mt-6 rounded-3xl bg-white p-7 shadow-xl">

              <p className="text-sm font-semibold uppercase text-emerald-700">
                Référence proposée
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {
                  offer
                    .offer
                    .genericPartName
                }
              </h2>

              <p className="mt-2 text-xl font-semibold">
                {
                  offer
                    .offer
                    .manufacturer
                }
              </p>

              <p className="mt-1 font-mono text-slate-500">
                Réf.{" "}
                {
                  offer
                    .offer
                    .reference
                }
              </p>

              <div className="mt-5 rounded-2xl bg-slate-50 p-5">

                <p className="text-sm text-slate-500">
                  Prix TTC
                </p>

                <p className="text-3xl font-bold">
                  {
                    offer
                      .salePriceIncVat
                      ?.toFixed(
                        2,
                      )
                  } €
                </p>

                <p className="mt-2 text-sm text-emerald-700">
                  {
                    offer
                      .offer
                      .stockStatus ===
                    "in-stock"
                      ? "En stock"
                      : offer
                          .offer
                          .stockStatus
                  }
                </p>

              </div>

              <div className="mt-5 flex items-center gap-4">

                <label className="font-semibold">
                  Quantité
                </label>

                <input
                  type="number"
                  min={1}
                  max={10}
                  value={quantity}
                  onChange={
                    event =>
                      setQuantity(
                        Math.max(
                          1,
                          Number(
                            event.target.value,
                          ),
                        ),
                      )
                  }
                  className="w-24 rounded-xl border border-slate-300 px-4 py-3"
                />

              </div>

              <button
                type="button"
                disabled={
                  loading
                }
                onClick={
                  sendToCounter
                }
                className="mt-6 w-full rounded-2xl bg-blue-700 px-6 py-4 text-lg font-bold text-white"
              >
                Envoyer la demande au comptoir
              </button>

            </section>
          )
        }

        {
          counter &&
          (
            <section className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-7">

              <p className="text-sm font-bold uppercase text-emerald-700">
                Dossier envoyé au comptoir
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {counter.id}
              </h2>

              <div className="mt-5 space-y-2">

                <p>
                  Véhicule :{" "}
                  <strong>
                    {counter.vehicleDescription}
                  </strong>
                </p>

                <p>
                  Pièce :{" "}
                  <strong>
                    {counter.genericPartName}
                  </strong>
                </p>

                <p>
                  Référence :{" "}
                  <strong>
                    {counter.manufacturer}{" "}
                    {counter.reference}
                  </strong>
                </p>

                <p>
                  Quantité :{" "}
                  <strong>
                    {counter.quantity}
                  </strong>
                </p>

                <p>
                  Total proposé :{" "}
                  <strong>
                    {counter.totalIncVat.toFixed(
                      2,
                    )} €
                  </strong>
                </p>

              </div>

              <p className="mt-6 rounded-xl bg-white p-4 font-semibold text-emerald-800">
                Présentez ce numéro au vendeur du comptoir.
              </p>

            </section>
          )
        }

        {
          error &&
          (
            <div className="mt-6 rounded-2xl bg-red-50 p-5 text-red-700">
              {error}
            </div>
          )
        }

      </div>

    </main>
  );
}


