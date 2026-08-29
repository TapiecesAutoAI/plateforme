"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import ClientVehicleForm, {
  type ClientVehicleFormValue,
} from "../../../../../components/client/ClientVehicleForm";

import {
  getClientGarageVehicles,
  updateClientGarageVehicle,
  type ClientGarageVehicle,
} from "../../../../../lib/client";


export default function EditClientVehiclePage() {

  const router =
    useRouter();

  const params =
    useParams();

  const vehicleId =
    typeof params.id ===
      "string"
      ? params.id
      : "";

  const [
    customerId,
    setCustomerId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    vehicle,
    setVehicle,
  ] =
    useState<ClientGarageVehicle | null>(
      null,
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

          const found =
            getClientGarageVehicles(
              session.customerId,
            )
              .find(
                item =>
                  item.id ===
                  vehicleId,
              ) ??
            null;

          if (active) {
            setCustomerId(
              session.customerId,
            );

            setVehicle(
              found,
            );

            setLoading(
              false,
            );
          }
        }
        catch {
          router.push(
            "/client/vehicles",
          );
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
      vehicleId,
    ],
  );


  function saveVehicle(
    value:
      ClientVehicleFormValue,
  ) {

    if (
      !customerId ||
      !vehicle
    ) {
      return;
    }

    const year =
      value.year
        ? Number(
            value.year,
          )
        : undefined;

    const label =
      [
        value.brand,
        value.model,
        value.year,
        value.engine,
      ]
        .filter(
          Boolean,
        )
        .join(
          " ",
        );

    const result =
      updateClientGarageVehicle(
        customerId,
        vehicle.id,
        {
          vin:
            value.vin ||
            undefined,

          brand:
            value.brand,

          model:
            value.model,

          year,

          engine:
            value.engine ||
            undefined,

          label,
        },
      );

    if (!result) {
      window.alert(
        "Impossible de modifier le véhicule.",
      );

      return;
    }

    router.push(
      "/client/vehicles",
    );
  }


  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3f9] w-full min-w-0 overflow-x-hidden">
        <p className="text-xl font-black">
          Chargement...
        </p>
      </main>
    );
  }


  if (!vehicle) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3f9] w-full min-w-0 overflow-x-hidden">

        <section className="rounded-3xl bg-white p-10 shadow-lg">

          <h1 className="text-2xl font-black">
            Véhicule introuvable
          </h1>

          <p className="mt-3 text-slate-600">
            Ce véhicule n'appartient pas à votre garage.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/client/vehicles",
              )
            }
            className="mt-6 rounded-xl bg-[#10265f] px-6 py-3 font-black text-white"
          >
            Retour au garage
          </button>

        </section>

      </main>
    );
  }


  return (
    <ClientVehicleForm
      title="Modifier mon véhicule"
      subtitle="Mettez à jour les informations enregistrées pour ce véhicule."
      submitLabel="Enregistrer"
      initialValue={{
        vin:
          typeof vehicle.vin ===
            "string"
            ? vehicle.vin
            : "",

        brand:
          typeof vehicle.brand ===
            "string"
            ? vehicle.brand
            : "",

        model:
          typeof vehicle.model ===
            "string"
            ? vehicle.model
            : "",

        year:
          typeof vehicle.year ===
            "number"
            ? String(
                vehicle.year,
              )
            : "",

        engine:
          typeof vehicle.engine ===
            "string"
            ? vehicle.engine
            : "",
      }}
      onSubmit={
        saveVehicle
      }
      onCancel={() =>
        router.push(
          "/client/vehicles",
        )
      }
    />
  );
}