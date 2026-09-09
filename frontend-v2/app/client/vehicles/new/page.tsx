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


  async function saveVehicle(
    value:
      ClientVehicleFormValue,
  ) {

    if (!customerId) {
      return;
    }

    const year =
      value.year
        ? Number(
            value.year,
          )
        : undefined;

    try {
      const response =
        await fetch(
          "/api/client/vehicles",
          {
            method:
              "POST",

            credentials:
              "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
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
              }),
          },
        );

      if (!response.ok) {
        window.alert(
          "Impossible d'ajouter le véhicule.",
        );

        return;
      }

      router.push(
        "/client/vehicles",
      );
    }
    catch {
      window.alert(
        "Impossible d'ajouter le véhicule.",
      );
    }
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
      subtitle="Ajoutez un véhicule à votre garage TaPieceAuto."
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
