"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import ClientVehicleForm, {
  type ClientVehicleFormValue,
} from "../../../../components/client/ClientVehicleForm";

import {
  addClientGarageVehicle,
} from "../../../../lib/client";


export default function NewClientVehiclePage() {

  const router =
    useRouter();

  const [
    customerId,
    setCustomerId,
  ] =
    useState<string | null>(
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

      async function loadSession() {

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
            setCustomerId(
              session.customerId,
            );

            setLoading(
              false,
            );
          }
        }
        catch {
          router.push(
            "/login",
          );
        }
      }

      void loadSession();

      return () => {
        active =
          false;
      };
    },
    [
      router,
    ],
  );


  function saveVehicle(
    value:
      ClientVehicleFormValue,
  ) {

    if (!customerId) {
      return;
    }

    const id =
      `VEH-${Date.now()}`;

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
      addClientGarageVehicle(
        customerId,
        {
          id,

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
        "Impossible d'ajouter le véhicule.",
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


  return (
    <ClientVehicleForm
      title="Ajouter un véhicule"
      subtitle="Ajoutez un véhicule à votre garage TaPiecesAuto."
      submitLabel="Ajouter au garage"
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