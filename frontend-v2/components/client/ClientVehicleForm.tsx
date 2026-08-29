"use client";

import {
  FormEvent,
  useState,
} from "react";


export type ClientVehicleFormValue = {
  vin: string;
  brand: string;
  model: string;
  year: string;
  engine: string;
};


type ClientVehicleFormProps = {
  title: string;

  subtitle: string;

  submitLabel: string;

  initialValue?: Partial<
    ClientVehicleFormValue
  >;

  onSubmit:
    (
      value:
        ClientVehicleFormValue,
    ) => void;

  onCancel:
    () => void;
};


export default function ClientVehicleForm({
  title,
  subtitle,
  submitLabel,
  initialValue,
  onSubmit,
  onCancel,
}: ClientVehicleFormProps) {

  const [
    vin,
    setVin,
  ] =
    useState(
      initialValue?.vin ??
      "",
    );

  const [
    brand,
    setBrand,
  ] =
    useState(
      initialValue?.brand ??
      "",
    );

  const [
    model,
    setModel,
  ] =
    useState(
      initialValue?.model ??
      "",
    );

  const [
    year,
    setYear,
  ] =
    useState(
      initialValue?.year ??
      "",
    );

  const [
    engine,
    setEngine,
  ] =
    useState(
      initialValue?.engine ??
      "",
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );


  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedBrand =
      brand.trim();

    const normalizedModel =
      model.trim();

    if (
      !normalizedBrand ||
      !normalizedModel
    ) {
      setError(
        "La marque et le modèle sont obligatoires.",
      );

      return;
    }

    if (
      year.trim() &&
      (
        !/^\d{4}$/.test(
          year.trim(),
        ) ||
        Number(
          year,
        ) < 1900 ||
        Number(
          year,
        ) > 2100
      )
    ) {
      setError(
        "L'année du véhicule est invalide.",
      );

      return;
    }

    setError(
      null,
    );

    onSubmit({
      vin:
        vin
          .trim()
          .toUpperCase(),

      brand:
        normalizedBrand,

      model:
        normalizedModel,

      year:
        year.trim(),

      engine:
        engine.trim(),
    });
  }


  return (
    <main className="min-h-screen bg-[#eef3f9] px-6 py-8 text-slate-950">

      <div className="mx-auto max-w-[850px]">

        <button
          type="button"
          onClick={
            onCancel
          }
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-black shadow-sm"
        >
          ← Mon garage
        </button>


        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-8 shadow-lg">

          <p className="text-sm font-black uppercase tracking-wide text-blue-700">
            Espace client
          </p>

          <h1 className="mt-2 text-4xl font-black">
            {title}
          </h1>

          <p className="mt-3 text-slate-600">
            {subtitle}
          </p>


          <form
            onSubmit={
              handleSubmit
            }
            className="mt-8 space-y-6"
          >

            <div>
              <label
                htmlFor="vin"
                className="block text-sm font-black"
              >
                VIN
              </label>

              <input
                id="vin"
                value={
                  vin
                }
                onChange={
                  event =>
                    setVin(
                      event.target.value,
                    )
                }
                maxLength={
                  17
                }
                placeholder="Ex. WVWZZZAUZKP000002"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-4 font-semibold outline-none focus:border-[#10265f]"
              />

              <p className="mt-2 text-xs text-slate-500">
                Facultatif pour l'instant. 17 caractères maximum.
              </p>
            </div>


            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label
                  htmlFor="brand"
                  className="block text-sm font-black"
                >
                  Marque *
                </label>

                <input
                  id="brand"
                  value={
                    brand
                  }
                  onChange={
                    event =>
                      setBrand(
                        event.target.value,
                      )
                  }
                  placeholder="Volkswagen"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-4 font-semibold outline-none focus:border-[#10265f]"
                />
              </div>


              <div>
                <label
                  htmlFor="model"
                  className="block text-sm font-black"
                >
                  Modèle *
                </label>

                <input
                  id="model"
                  value={
                    model
                  }
                  onChange={
                    event =>
                      setModel(
                        event.target.value,
                      )
                  }
                  placeholder="Golf"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-4 font-semibold outline-none focus:border-[#10265f]"
                />
              </div>

            </div>


            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label
                  htmlFor="year"
                  className="block text-sm font-black"
                >
                  Année
                </label>

                <input
                  id="year"
                  inputMode="numeric"
                  value={
                    year
                  }
                  onChange={
                    event =>
                      setYear(
                        event.target.value,
                      )
                  }
                  placeholder="2019"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-4 font-semibold outline-none focus:border-[#10265f]"
                />
              </div>


              <div>
                <label
                  htmlFor="engine"
                  className="block text-sm font-black"
                >
                  Motorisation
                </label>

                <input
                  id="engine"
                  value={
                    engine
                  }
                  onChange={
                    event =>
                      setEngine(
                        event.target.value,
                      )
                  }
                  placeholder="2.0 TDI 150"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-4 font-semibold outline-none focus:border-[#10265f]"
                />
              </div>

            </div>


            {
              error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 font-bold text-red-700">
                  {error}
                </div>
              )
            }


            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-6">

              <button
                type="button"
                onClick={
                  onCancel
                }
                className="rounded-xl border border-slate-300 px-6 py-3 font-black"
              >
                Annuler
              </button>

              <button
                type="submit"
                className="rounded-xl bg-[#10265f] px-7 py-3 font-black text-white"
              >
                {submitLabel}
              </button>

            </div>

          </form>

        </section>

      </div>

    </main>
  );
}