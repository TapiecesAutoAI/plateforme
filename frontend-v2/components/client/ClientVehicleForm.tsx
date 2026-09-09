"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  vehicleDataProvider,
  type VehicleEngineOption,
} from "../../lib/vehicle/VehicleDataProvider";


export type ClientVehicleFormValue = {
  vin: string;
  brand: string;
  model: string;
  year: string;
  fuel: string;
  engine: string;
  powerHp?: number;
  powerKw?: number;
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
    ) => void | Promise<void>;

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

  const [vin, setVin] =
    useState(
      initialValue?.vin ?? "",
    );

  const [brand, setBrand] =
    useState(
      initialValue?.brand ?? "",
    );

  const [model, setModel] =
    useState(
      initialValue?.model ?? "",
    );

  const [year, setYear] =
    useState(
      initialValue?.year ?? "",
    );

  const [fuel, setFuel] =
    useState(
      initialValue?.fuel ?? "",
    );

  const [engine, setEngine] =
    useState(
      initialValue?.engine ?? "",
    );

  const [powerHp, setPowerHp] =
    useState<number | undefined>(
      initialValue?.powerHp,
    );

  const [powerKw, setPowerKw] =
    useState<number | undefined>(
      initialValue?.powerKw,
    );

  const [brands, setBrands] =
    useState<string[]>([]);

  const [models, setModels] =
    useState<string[]>([]);

  const [brandQuery, setBrandQuery] =
    useState(
      initialValue?.brand ?? "",
    );

  const [modelQuery, setModelQuery] =
    useState(
      initialValue?.model ?? "",
    );

  const [brandOpen, setBrandOpen] =
    useState(false);

  const [modelOpen, setModelOpen] =
    useState(false);

  const [years, setYears] =
    useState<number[]>([]);

  const [fuels, setFuels] =
    useState<string[]>([]);

  const [engines, setEngines] =
    useState<VehicleEngineOption[]>([]);

  const [error, setError] =
    useState<string | null>(null);


  useEffect(
    () => {
      void vehicleDataProvider
        .getBrands()
        .then(setBrands);
    },
    [],
  );


  useEffect(
    () => {
      if (!brand || !year) {
        setModels([]);
        return;
      }

      void vehicleDataProvider
        .getModels(
          brand,
          year,
        )
        .then(setModels);
    },
    [
      brand,
      year,
    ],
  );


  useEffect(
    () => {
      if (!brand) {
        setYears([]);
        return;
      }

      void vehicleDataProvider
        .getYears(brand)
        .then(setYears);
    },
    [brand],
  );


  useEffect(
    () => {
      if (
        !brand ||
        !model ||
        !year
      ) {
        setFuels([]);
        return;
      }

      void vehicleDataProvider
        .getFuels(
          brand,
          model,
          year,
        )
        .then(setFuels);
    },
    [
      brand,
      model,
      year,
    ],
  );


  useEffect(
    () => {
      if (
        !brand ||
        !model ||
        !year
      ) {
        setEngines([]);
        return;
      }

      void vehicleDataProvider
        .getEngines(
          brand,
          model,
          year,
          fuel,
        )
        .then(setEngines);
    },
    [
      brand,
      model,
      year,
      fuel,
    ],
  );


  function changeBrand(
    value: string,
  ) {
    setBrand(value);
    setBrandQuery(value);
    setModel("");
    setModelQuery("");
    setYear("");
    setFuel("");
    setEngine("");
    setPowerHp(undefined);
    setPowerKw(undefined);
    setBrandOpen(false);
  }


  function changeModel(
    value: string,
  ) {
    setModel(value);
    setModelQuery(value);
    setModelOpen(false);
    setFuel("");
    setEngine("");
    setPowerHp(undefined);
    setPowerKw(undefined);
  }


  function changeYear(
    value: string,
  ) {
    setYear(value);
    setModel("");
    setModelQuery("");
    setFuel("");
    setEngine("");
    setPowerHp(undefined);
    setPowerKw(undefined);
  }


  function changeFuel(
    value: string,
  ) {
    setFuel(value);
    setEngine("");
    setPowerHp(undefined);
    setPowerKw(undefined);
  }


  async function changeEngine(
    value: string,
  ) {
    setEngine(value);
    setPowerHp(undefined);
    setPowerKw(undefined);

    if (!value) {
      return;
    }

    const details =
      await vehicleDataProvider
        .getEngineDetails(
          brand,
          model,
          value,
        );

    if (!details) {
      return;
    }

    setFuel(
      details.fuel,
    );

    setPowerHp(
      details.hp,
    );

    setPowerKw(
      details.kw,
    );
  }


  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !brand ||
      !model
    ) {
      setError(
        "La marque et le modele sont obligatoires.",
      );

      return;
    }

    setError(null);

    void onSubmit({
      vin:
        vin
          .trim()
          .toUpperCase(),

      brand,
      model,
      year,
      fuel,
      engine,
      powerHp,
      powerKw,
    });
  }


  function normalizeSearch(
    value: string,
  ) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleUpperCase();
  }

  const filteredBrands =
    brands.filter(item =>
      normalizeSearch(item).includes(
        normalizeSearch(brandQuery),
      ),
    );

  const filteredModels =
    models.filter(item =>
      normalizeSearch(item).includes(
        normalizeSearch(modelQuery),
      ),
    );

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold outline-none focus:border-blue-600";

  const labelClass =
    "mb-2 block text-sm font-black text-slate-700";


  return (
    <main className="min-h-screen bg-[#eef3f9] px-4 py-8 text-slate-950 sm:px-6">

      <div className="mx-auto max-w-[850px]">

        <button
          type="button"
          onClick={onCancel}
          className="mb-6 rounded-xl border border-slate-300 bg-white px-5 py-3 font-black shadow-sm"
        >
          Retour
        </button>

        <div className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">

          <h1 className="text-3xl font-black">
            {title}
          </h1>

          <p className="mt-2 text-slate-600">
            {subtitle}
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6"
          >

            <div>
              <label className={labelClass}>
                VIN
              </label>

              <input
                value={vin}
                onChange={
                  event =>
                    setVin(
                      event.target.value,
                    )
                }
                placeholder="Numero VIN (facultatif)"
                className={inputClass}
              />
            </div>


            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>
                <label className={labelClass}>
                  Marque
                </label>

                <div className="relative">
                  <input
                    value={brandQuery}
                    onFocus={() =>
                      setBrandOpen(true)
                    }
                    onChange={event => {
                      const value =
                        event.target.value;

                      setBrandQuery(value);
                      setBrandOpen(true);

                      if (
                        value !== brand
                      ) {
                        setBrand("");
                        setModel("");
                        setModelQuery("");
                        setYear("");
                        setFuel("");
                        setEngine("");
                        setPowerHp(undefined);
                        setPowerKw(undefined);
                      }
                    }}
                    onBlur={() => {
                      window.setTimeout(
                        () =>
                          setBrandOpen(false),
                        150,
                      );
                    }}
                    placeholder="Rechercher une marque"
                    autoComplete="off"
                    className={
                      inputClass +
                      " uppercase"
                    }
                  />

                  {brandOpen && (
                    <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                      {filteredBrands.length > 0 ? (
                        filteredBrands
                          .slice(0, 60)
                          .map(item => (
                            <button
                              key={item}
                              type="button"
                              onMouseDown={
                                event => {
                                  event.preventDefault();
                                  changeBrand(item);
                                }
                              }
                              className="block w-full border-b border-slate-100 px-4 py-3 text-left font-bold uppercase hover:bg-blue-50 last:border-b-0"
                            >
                              {item.toLocaleUpperCase()}
                            </button>
                          ))
                      ) : (
                        <div className="px-4 py-3 text-sm font-semibold text-slate-500">
                          Aucune marque trouvee
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>


              <div>
                <label className={labelClass}>
                  Annee
                </label>

                <select
                  value={year}
                  disabled={!brand}
                  onChange={
                    event =>
                      changeYear(
                        event.target.value,
                      )
                  }
                  className={inputClass}
                >
                  <option value="">
                    Selectionner
                  </option>

                  {years.map(
                    item => (
                      <option
                        key={item}
                        value={String(item)}
                      >
                        {item}
                      </option>
                    ),
                  )}
                </select>
              </div>


              <div>
                <label className={labelClass}>
                  Modele
                </label>

                <div className="relative">
                  <input
                    value={modelQuery}
                    disabled={!brand || !year}
                    onFocus={() =>
                      setModelOpen(true)
                    }
                    onChange={event => {
                      const value =
                        event.target.value;

                      setModelQuery(value);
                      setModelOpen(true);

                      if (
                        value !== model
                      ) {
                        setModel("");
                        setFuel("");
                        setEngine("");
                        setPowerHp(undefined);
                        setPowerKw(undefined);
                      }
                    }}
                    onBlur={() => {
                      window.setTimeout(
                        () =>
                          setModelOpen(false),
                        150,
                      );
                    }}
                    placeholder={
                      !brand
                        ? "Choisir d'abord la marque"
                        : !year
                          ? "Choisir d'abord l'annee"
                          : "Rechercher un modele"
                    }
                    autoComplete="off"
                    className={inputClass}
                  />

                  {modelOpen && brand && year && (
                    <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                      {filteredModels.length > 0 ? (
                        filteredModels
                          .slice(0, 80)
                          .map(item => (
                            <button
                              key={item}
                              type="button"
                              onMouseDown={
                                event => {
                                  event.preventDefault();
                                  changeModel(item);
                                }
                              }
                              className="block w-full border-b border-slate-100 px-4 py-3 text-left font-bold hover:bg-blue-50 last:border-b-0"
                            >
                              {item}
                            </button>
                          ))
                      ) : (
                        <div className="px-4 py-3 text-sm font-semibold text-slate-500">
                          Aucun modele trouve
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>


              <div>
                <label className={labelClass}>
                  Carburant
                </label>

                <select
                  value={fuel}
                  disabled={!year}
                  onChange={
                    event =>
                      changeFuel(
                        event.target.value,
                      )
                  }
                  className={inputClass}
                >
                  <option value="">
                    Tous
                  </option>

                  {fuels.map(
                    item => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ),
                  )}
                </select>
              </div>

            </div>


            <div>
              <label className={labelClass}>
                Motorisation
              </label>

              <select
                value={engine}
                disabled={!year}
                onChange={
                  event => {
                    void changeEngine(
                      event.target.value,
                    );
                  }
                }
                className={inputClass}
              >
                <option value="">
                  Selectionner
                </option>

                {engines.map(
                  item => (
                    <option
                      key={
                        `${item.label}-${item.fuel}-${item.hp}`
                      }
                      value={item.label}
                    >
                      {item.label}
                    </option>
                  ),
                )}
              </select>
            </div>


            {engine && (
              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-100 p-5">

                <div>
                  <div className="text-xs font-black uppercase text-slate-500">
                    Puissance
                  </div>

                  <div className="mt-1 text-xl font-black">
                    {powerHp ?? "-"} CV
                  </div>
                </div>

                <div>
                  <div className="text-xs font-black uppercase text-slate-500">
                    Puissance
                  </div>

                  <div className="mt-1 text-xl font-black">
                    {powerKw ?? "-"} kW
                  </div>
                </div>

              </div>
            )}


            {error && (
              <div className="rounded-xl bg-red-50 p-4 font-bold text-red-700">
                {error}
              </div>
            )}


            <div className="flex flex-col gap-3 pt-3 sm:flex-row">

              <button
                type="submit"
                className="flex-1 rounded-xl bg-blue-700 px-6 py-4 font-black text-white shadow-lg hover:bg-blue-800"
              >
                {submitLabel}
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl border border-slate-300 bg-white px-6 py-4 font-black"
              >
                Annuler
              </button>

            </div>

          </form>

        </div>

      </div>

    </main>
  );
}