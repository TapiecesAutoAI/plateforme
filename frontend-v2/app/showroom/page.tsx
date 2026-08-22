"use client";

import AnimatedTpaLogo from "../../components/branding/AnimatedTpaLogo";




import {
  getBrandOptions,
  getModelOptions,
  getYearOptions,
  getEngineOptions,
  getFuelOptions,
  getFilteredEngineOptions,
  getEngineDetails,
} from "../../lib/showroom/vehicleAssist";

import {
  vehicleDataProvider,
  type VehicleEngineOption,
} from "../../lib/vehicle/VehicleDataProvider";
import {
  seedShowroomDemoData,
} from "../../lib/showroom/demoDataSeeder";
import {
  getVehicleHistory,
} from "../../lib/showroom/demoVehicleHistory";
import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";
import {
  DEMO_CUSTOMERS,
} from "../../lib/showroom/demoCustomers";
import {
  collectData,
} from "../../lib/data/collectData";

type Screen =
  | "attract"
  | "identity"
  | "existing"
  | "new"
  | "vehicle"
  | "profile"
  | "action"
  | "pickup"
  | "accessories"
  | "ticket";

type Profile =
  | "particulier"
  | "bricoleur"
  | "mecanicien-garage";

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;

  marketingEmail:
    boolean;

  marketingSms:
    boolean;

  profile?:
    Profile;
};

type Vehicle = {
  id: string;
  vin: string | null;
  plate?: string | null;
  brand: string;
  model: string;
  year: number | null;
  engine: string;
  fuel?: string | null;
  powerHp?: number | null;
  powerKw?: number | null;
  label: string;
};

type CustomerRecord = {
  customer: Customer;
  vehicles: Vehicle[];
};

const STORAGE_KEY =
  "tapiecesauto-showroom-customers";

function loadCustomers():
  CustomerRecord[] {

  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  try {

    const raw =
      localStorage.getItem(
        STORAGE_KEY,
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(
        raw,
      );

    return Array.isArray(
      parsed,
    )
      ? parsed
      : [];

  } catch {

    return [];
  }
}

function saveCustomers(
  records:
    CustomerRecord[],
) {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      records,
    ),
  );
}

function getNextCustomerId(
  records: Array<{
    customer: {
      id: string;
    };
  }>,
): string {

  let highest = 20;

  for (
    const record
    of records
  ) {

    const match =
      /^C(\d+)$/i.exec(
        record.customer.id.trim(),
      );

    if (!match) {
      continue;
    }

    const number =
      Number(
        match[1],
      );

    if (
      Number.isFinite(number) &&
      number > highest
    ) {
      highest = number;
    }
  }

  return `C${highest + 1}`;
}

export default function ShowroomPage() {

  const router =
    useRouter();

  const [
    screen,
    setScreen,
  ] =
    useState<Screen>(
      "attract",
    );

  const [
    records,
    setRecords,
  ] =
    useState<
      CustomerRecord[]
    >([]);

  const [
    customer,
    setCustomer,
  ] =
    useState<
      Customer |
      null
    >(null);

  const [
    vehicles,
    setVehicles,
  ] =
    useState<
      Vehicle[]
    >([]);

  const [
    vehicle,
    setVehicle,
  ] =
    useState<
      Vehicle |
      null
    >(null);

  const [
    profile,
    setProfile,
  ] =
    useState<
      Profile |
      null
    >(null);

  const [
    existingLogin,
    setExistingLogin,
  ] =
    useState("");

  const [
    firstName,
    setFirstName,
  ] =
    useState("");

  const [
    lastName,
    setLastName,
  ] =
    useState("");

  const [
    phone,
    setPhone,
  ] =
    useState("");

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    marketingEmail,
    setMarketingEmail,
  ] =
    useState(false);

  const [
    marketingSms,
    setMarketingSms,
  ] =
    useState(false);

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
    plate,
    setPlate,
  ] =
    useState("");

  const [
    fuel,
    setFuel,
  ] =
    useState("");

  const [
    powerHp,
    setPowerHp,
  ] =
    useState("");

  const [
    powerKw,
    setPowerKw,
  ] =
    useState("");

  const [
    vehicleBrandOptions,
    setVehicleBrandOptions,
  ] =
    useState<string[]>([]);

  const [
    vehicleModelOptions,
    setVehicleModelOptions,
  ] =
    useState<string[]>([]);

  const [
    vehicleYearOptions,
    setVehicleYearOptions,
  ] =
    useState<number[]>([]);

  const [
    vehicleFuelOptions,
    setVehicleFuelOptions,
  ] =
    useState<string[]>([]);

  const [
    vehicleEngineOptions,
    setVehicleEngineOptions,
  ] =
    useState<VehicleEngineOption[]>([]);

  const [
    editingVehicleId,
    setEditingVehicleId,
  ] =
    useState<
      string |
      null
    >(null);

  const [
    vehicleFormOpen,
    setVehicleFormOpen,
  ] =
    useState(false);

  const [
    historyVehicleId,
    setHistoryVehicleId,
  ] =
    useState<
      string |
      null
    >(null);

  const [
    exitAccountConfirmOpen,
    setExitAccountConfirmOpen,
  ] =
    useState(false);

  const [
    pickupCode,
    setPickupCode,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState<
      string |
      null
    >(null);

  const [
    ticketNumber,
    setTicketNumber,
  ] =
    useState<
      string |
      null
    >(null);

  useEffect(
    () => {

      const existing =
        loadCustomers();

      const merged = [
        ...existing,
      ];

      for (
        const demo
        of DEMO_CUSTOMERS
      ) {

        const alreadyExists =
          merged.some(
            record =>
              record.customer.id ===
              demo.customer.id,
          );

        if (
          !alreadyExists
        ) {

          merged.push(
            demo,
          );
        }
      }

      saveCustomers(
        merged,
      );

      setRecords(
        merged,
      );

    },
    [],
  );

  /*
   * CHAT10_DEMO_DATABASE_SEED
   *
   * Migration non destructive :
   * - complète les champs vides ;
   * - conserve les données utilisateur ;
   * - ajoute les véhicules démo C1-C5 ;
   * - ajoute les historiques fictifs.
   */
  useEffect(
    () => {

      const seeded =
        seedShowroomDemoData(
          DEMO_CUSTOMERS,
        );

      setRecords(
        seeded,
      );

    },
    [],
  );

  /*
   * LOAD_VEHICLE_BRANDS
   */
  useEffect(
    () => {

      void vehicleDataProvider
        .getBrands()
        .then(
          setVehicleBrandOptions,
        );

    },
    [],
  );


  useEffect(
    () => {

      if (!brand) {

        setVehicleModelOptions(
          [],
        );

        return;
      }

      void vehicleDataProvider
        .getModels(
          brand,
        )
        .then(
          setVehicleModelOptions,
        );

    },
    [
      brand,
    ],
  );


  useEffect(
    () => {

      if (
        !brand ||
        !model
      ) {

        setVehicleYearOptions(
          [],
        );

        return;
      }

      void vehicleDataProvider
        .getYears(
          brand,
          model,
        )
        .then(
          setVehicleYearOptions,
        );

    },
    [
      brand,
      model,
    ],
  );


  useEffect(
    () => {

      if (
        !brand ||
        !model ||
        !year
      ) {

        setVehicleFuelOptions(
          [],
        );

        return;
      }

      void vehicleDataProvider
        .getFuels(
          brand,
          model,
          year,
        )
        .then(
          setVehicleFuelOptions,
        );

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
        !year ||
        !fuel
      ) {

        setVehicleEngineOptions(
          [],
        );

        return;
      }

      void vehicleDataProvider
        .getEngines(
          brand,
          model,
          year,
          fuel,
        )
        .then(
          setVehicleEngineOptions,
        );

    },
    [
      brand,
      model,
      year,
      fuel,
    ],
  );

  function resetError() {
    setError(null);
  }

  function goBack() {

    if (
      historyVehicleId
    ) {

      setHistoryVehicleId(
        null,
      );

      setScreen(
        "vehicle",
      );

      return;
    }
    setError(
      null,
    );

    if (
      screen ===
      "identity"
    ) {
      setScreen(
        "attract",
      );
      return;
    }

    if (
      screen ===
        "existing" ||
      screen ===
        "new" ||
      screen ===
        "pickup" ||
      screen ===
        "accessories"
    ) {
      setScreen(
        "identity",
      );
      return;
    }

    if (
      screen ===
      "vehicle"
    ) {

      setExitAccountConfirmOpen(
        true,
      );

      return;
    }

    if (
      screen ===
      "profile"
    ) {
      setScreen(
        "vehicle",
      );
      return;
    }

    if (
      screen ===
      "action"
    ) {
      setScreen(
        "vehicle",
      );
      return;
    }

    if (
      screen ===
      "ticket"
    ) {
      setScreen(
        "action",
      );
      return;
    }

    setScreen(
      "identity",
    );
  }


  function confirmExitAccount() {

    setExitAccountConfirmOpen(
      false,
    );

    setCustomer(
      null,
    );

    setVehicle(
      null,
    );

    setVehicles(
      [],
    );

    setProfile(
      null,
    );

    setHistoryVehicleId(
      null,
    );

    window.sessionStorage.removeItem(
      "tapiecesauto-showroom-customer",
    );

    window.sessionStorage.removeItem(
      "tapiecesauto-showroom-vehicle",
    );

    window.sessionStorage.removeItem(
      "tapiecesauto-showroom-profile",
    );

    window.sessionStorage.removeItem(
      "tapiecesauto-piece-flow",
    );

    setScreen(
      "attract",
    );
  }

  function home() {

    setScreen(
      "attract",
    );

    setCustomer(null);
    setVehicles([]);
    setVehicle(null);
    setProfile(null);
    setTicketNumber(null);
    setError(null);
  }

  function createCustomer() {

    resetError();

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !phone.trim()
    ) {

      setError(
        "Prénom, nom et téléphone sont obligatoires.",
      );

      return;
    }

    const newCustomer:
      Customer = {

      id: getNextCustomerId(records),

      firstName:
        firstName.trim(),

      lastName:
        lastName.trim(),

      phone:
        phone.trim(),

      email:
        email.trim(),

      marketingEmail,

      marketingSms,
    };

    const record:
      CustomerRecord = {

      customer:
        newCustomer,

      vehicles: [],
    };

    const nextRecords = [
      ...records,
      record,
    ];

    saveCustomers(
      nextRecords,
    );

    setRecords(
      nextRecords,
    );

    setCustomer(
      newCustomer,
    );

    setVehicles([]);

    void collectData({
      action:
        "save-customer",

      customer:
        newCustomer,

      storeId:
        "GROSSISTE-DEMO",

      terminalId:
        "BORNE-01",
    });

    setScreen(
      "vehicle",
    );
  }

  function loginExisting() {

    resetError();

    const search =
      existingLogin
        .trim()
        .toLowerCase();

    if (!search) {

      setError(
        "Introduisez votre code ID, téléphone, email ou nom.",
      );

      return;
    }

    const normalizedSearch =
      search
        .replace(
          /\s+/g,
          " ",
        );

    const matches =
      records.filter(
        record => {

          const id =
            record.customer.id
              .trim()
              .toLowerCase();

          const phone =
            record.customer.phone
              .trim()
              .toLowerCase();

          const email =
            record.customer.email
              .trim()
              .toLowerCase();

          const firstName =
            record.customer.firstName
              .trim()
              .toLowerCase();

          const lastName =
            record.customer.lastName
              .trim()
              .toLowerCase();

          const fullName =
            (
              firstName +
              " " +
              lastName
            )
              .replace(
                /\s+/g,
                " ",
              );

          const reverseName =
            (
              lastName +
              " " +
              firstName
            )
              .replace(
                /\s+/g,
                " ",
              );

          return (
            id ===
              normalizedSearch ||
            phone ===
              normalizedSearch ||
            email ===
              normalizedSearch ||
            firstName ===
              normalizedSearch ||
            lastName ===
              normalizedSearch ||
            fullName ===
              normalizedSearch ||
            reverseName ===
              normalizedSearch
          );
        },
      );

    if (
      matches.length ===
      0
    ) {

      setError(
        "Client introuvable.",
      );

      return;
    }

    if (
      matches.length >
      1
    ) {

      setError(
        "Plusieurs clients portent ce nom. Utilisez le prénom + nom, le téléphone ou le code ID.",
      );

      return;
    }

    const match =
      matches[0];

    if (!match) {
      return;
    }

    setCustomer(
      match.customer,
    );

    setVehicles(
      match.vehicles,
    );

    setProfile(
      match.customer.profile ??
      null,
    );

    void collectData({
      action:
        "save-customer",

      customer:
        match.customer,

      profile:
        match.customer.profile,

      storeId:
        "GROSSISTE-DEMO",

      terminalId:
        "BORNE-01",
    });

    void collectData({
      action:
        "event",

      eventType:
        "customer-login",

      customerId:
        match.customer.id,

      channel:
        "showroom",

      storeId:
        "GROSSISTE-DEMO",

      terminalId:
        "BORNE-01",

      metadata: {
        loginMethod:
          "id-phone-email-name",
      },
    });

    setScreen(
      "vehicle",
    );
  }

  function resetVehicleForm() {

    setVin("");
    setPlate("");
    setBrand("");
    setModel("");
    setYear("");
    setEngine("");
    setFuel("");
    setPowerHp("");
    setPowerKw("");
    setEditingVehicleId(null);
  }


  function openNewVehicleForm() {

    resetError();
    resetVehicleForm();
    setVehicleFormOpen(true);
  }


  function editVehicle(
    selected: Vehicle,
  ) {

    resetError();

    setEditingVehicleId(
      selected.id,
    );

    setVin(
      selected.vin ?? "",
    );

    setPlate(
      selected.plate ?? "",
    );

    setBrand(
      selected.brand,
    );

    setModel(
      selected.model,
    );

    setYear(
      selected.year
        ? String(selected.year)
        : "",
    );

    setEngine(
      selected.engine,
    );

    setFuel(
      selected.fuel ?? "",
    );

    setPowerHp(
      selected.powerHp
        ? String(selected.powerHp)
        : "",
    );

    setPowerKw(
      selected.powerKw
        ? String(selected.powerKw)
        : "",
    );

    setVehicleFormOpen(true);
  }


  function deleteVehicle(
    selected: Vehicle,
  ) {

    resetError();

    const confirmed =
      window.confirm(
        `Supprimer ${selected.label} de votre compte ?`,
      );

    if (!confirmed) {
      return;
    }

    const nextVehicles =
      vehicles.filter(
        item =>
          item.id !==
          selected.id,
      );

    setVehicles(
      nextVehicles,
    );

    if (
      vehicle?.id ===
      selected.id
    ) {
      setVehicle(null);
    }

    if (customer) {

      const nextRecords =
        records.map(
          record =>
            record.customer.id ===
            customer.id
              ? {
                  ...record,
                  vehicles:
                    nextVehicles,
                }
              : record,
        );

      saveCustomers(
        nextRecords,
      );

      setRecords(
        nextRecords,
      );
    }

    void collectData({
      action:
        "event",

      eventType:
        "vehicle-deleted",

      customerId:
        customer?.id,

      vehicleId:
        selected.id,

      channel:
        "showroom",

      storeId:
        "GROSSISTE-DEMO",

      terminalId:
        "BORNE-01",
    });

    if (
      editingVehicleId ===
      selected.id
    ) {
      resetVehicleForm();
      setVehicleFormOpen(false);
    }
  }


  function handlePowerHp(
    value: string,
  ) {

    setPowerHp(
      value,
    );

    const hp =
      Number(value);

    if (
      value &&
      Number.isFinite(hp)
    ) {
      setPowerKw(
        String(
          Math.round(
            hp * 0.735499,
          ),
        ),
      );
    }
  }


  function handlePowerKw(
    value: string,
  ) {

    setPowerKw(
      value,
    );

    const kw =
      Number(value);

    if (
      value &&
      Number.isFinite(kw)
    ) {
      setPowerHp(
        String(
          Math.round(
            kw / 0.735499,
          ),
        ),
      );
    }
  }


  function createVehicle() {

    resetError();

    const cleanVin =
      vin.trim()
        .toUpperCase();

    const cleanPlate =
      plate.trim()
        .toUpperCase();

    const minimumManualVehicle =
      brand.trim() &&
      model.trim();

    const usableVin =
      cleanVin.length >= 11;

    if (
      !usableVin &&
      !minimumManualVehicle
    ) {

      setError(
        "Indiquez au minimum la marque et le modèle, ou introduisez le VIN.",
      );

      return;
    }

    const parsedYear =
      year
        ? Number(year)
        : null;

    const parsedPowerHp =
      powerHp
        ? Number(powerHp)
        : null;

    const parsedPowerKw =
      powerKw
        ? Number(powerKw)
        : null;

    const label =
      [
        brand.trim(),
        model.trim(),
        year.trim(),
        engine.trim(),
      ]
        .filter(Boolean)
        .join(" ");

    const vehicleId =
      editingVehicleId ??
      (
        "VEH-" +
        Date.now()
          .toString(36)
          .toUpperCase()
      );

    const savedVehicle:
      Vehicle = {

      id:
        vehicleId,

      vin:
        cleanVin ||
        null,

      plate:
        cleanPlate ||
        null,

      brand:
        brand.trim(),

      model:
        model.trim(),

      year:
        parsedYear,

      engine:
        engine.trim(),

      fuel:
        fuel.trim() ||
        null,

      powerHp:
        parsedPowerHp,

      powerKw:
        parsedPowerKw,

      label:
        label ||
        "Véhicule identifié par VIN",
    };

    const nextVehicles =
      editingVehicleId
        ? vehicles.map(
            item =>
              item.id ===
              editingVehicleId
                ? savedVehicle
                : item,
          )
        : [
            ...vehicles,
            savedVehicle,
          ];

    setVehicles(
      nextVehicles,
    );

    setVehicle(
      savedVehicle,
    );

    void collectData({
      action:
        "save-vehicle",

      customerId:
        customer?.id,

      vehicle:
        savedVehicle,

      storeId:
        "GROSSISTE-DEMO",

      terminalId:
        "BORNE-01",
    });

    if (customer) {

      const nextRecords =
        records.map(
          record =>
            record.customer.id ===
            customer.id
              ? {
                  ...record,
                  vehicles:
                    nextVehicles,
                }
              : record,
        );

      saveCustomers(
        nextRecords,
      );

      setRecords(
        nextRecords,
      );
    }

    resetVehicleForm();

    setVehicleFormOpen(
      false,
    );

    /*
     * Après création ou modification,
     * on reste sur la liste des véhicules.
     *
     * Le client choisit explicitement
     * le véhicule qu'il souhaite utiliser.
     */
    setScreen(
      "vehicle",
    );
  }

  function chooseVehicle(
    selected:
      Vehicle,
  ) {

    setVehicle(
      selected,
    );

    void collectData({
      action:
        "event",

      eventType:
        "vehicle-selected",

      customerId:
        customer?.id,

      vehicleId:
        selected.id,

      channel:
        "showroom",

      storeId:
        "GROSSISTE-DEMO",

      terminalId:
        "BORNE-01",
    });

    if (
      customer?.profile
    ) {

      setProfile(
        customer.profile,
      );

      setScreen(
        "action",
      );

      return;
    }

    setScreen(
      "profile",
    );
  }

  function chooseProfile(
    selected:
      Profile,
  ) {

    setProfile(
      selected,
    );

    if (
      customer
    ) {

      const updatedCustomer = {
        ...customer,
        profile:
          selected,
      };

      setCustomer(
        updatedCustomer,
      );

      const nextRecords =
        records.map(
          record =>
            record.customer.id ===
            customer.id
              ? {
                  ...record,
                  customer:
                    updatedCustomer,
                }
              : record,
        );

      saveCustomers(
        nextRecords,
      );

      setRecords(
        nextRecords,
      );

      void collectData({
        action:
          "save-customer",

        customer:
          updatedCustomer,

        profile:
          selected,

        storeId:
          "GROSSISTE-DEMO",

        terminalId:
          "BORNE-01",
      });
    }

    void collectData({
      action:
        "event",

      eventType:
        "profile-selected",

      customerId:
        customer?.id,

      vehicleId:
        vehicle?.id,

      channel:
        "showroom",

      storeId:
        "GROSSISTE-DEMO",

      terminalId:
        "BORNE-01",

      metadata: {
        profile:
          selected,
      },
    });

    setScreen(
      "action",
    );
  }

  function saveContext() {

    if (
      !customer ||
      !vehicle ||
      !profile
    ) {
      return;
    }

    sessionStorage.setItem(
      "tapiecesauto-showroom-context",
      JSON.stringify({
        customer,
        vehicle,
        profile,
      }),
    );
  }

  function startDiagnostic() {

    saveContext();

    void collectData({
      action:
        "event",

      eventType:
        "diagnostic-start-requested",

      customerId:
        customer?.id,

      vehicleId:
        vehicle?.id,

      channel:
        "showroom",

      storeId:
        "GROSSISTE-DEMO",

      terminalId:
        "BORNE-01",

      metadata: {
        profile:
          profile ?? "unknown",
      },
    });

    
    if (profile) {
      window.sessionStorage.setItem(
        "tapiecesauto-showroom-profile",
        profile,
      );
    }

    if (customer) {
      window.sessionStorage.setItem(
        "tapiecesauto-showroom-customer",
        JSON.stringify(customer),
      );
    }

    if (vehicle) {
      window.sessionStorage.setItem(
        "tapiecesauto-showroom-vehicle",
        JSON.stringify(vehicle),
      );
    }

    router.push(
      "/showroom/particulier",
    );
  }

  function knownPart() {

    resetError();

    if (!customer) {

      setError(
        "Client non identifié.",
      );

      return;
    }

    if (!vehicle) {

      setError(
        "Choisissez d'abord un véhicule.",
      );

      return;
    }

    /*
     * Le client, son véhicule et son profil
     * sont déjà connus dans le showroom.
     *
     * La page pièce ne doit donc PAS
     * recommencer l'identification véhicule.
     */

    window.sessionStorage.setItem(
      "tapiecesauto-showroom-customer",
      JSON.stringify(customer),
    );

    window.sessionStorage.setItem(
      "tapiecesauto-showroom-vehicle",
      JSON.stringify(vehicle),
    );

    if (profile) {

      window.sessionStorage.setItem(
        "tapiecesauto-showroom-profile",
        profile,
      );
    }

    window.sessionStorage.setItem(
      "tapiecesauto-piece-flow",
      "known-part",
    );

    void collectData({
      action:
        "event",

      eventType:
        "known-part-started",

      customerId:
        customer.id,

      vehicleId:
        vehicle.id,

      channel:
        "showroom",

      storeId:
        "GROSSISTE-DEMO",

      terminalId:
        "BORNE-01",

      metadata: {
        profile,
        vehicleLabel:
          vehicle.label,
      },
    });

    router.push(
      "/piece?source=showroom&mode=known-part",
    );
  }
  async function counterTicket() {

    if (
      !customer ||
      !vehicle ||
      !profile
    ) {

      setError(
        "Client, véhicule ou profil manquant.",
      );

      return;
    }

    setError(null);

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
                  "create",

                customer,

                vehicle,

                profile,

                storeId:
                  "GROSSISTE-DEMO",

                terminalId:
                  "BORNE-01",

                reason:
                  "counter-request",
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
          "Impossible de créer le ticket.",
        );
      }

      setTicketNumber(
        data.ticket.number,
      );

      void collectData({
        action:
          "event",

        eventType:
          "counter-ticket-created",

        customerId:
          customer.id,

        vehicleId:
          vehicle.id,

        channel:
          "showroom",

        storeId:
          "GROSSISTE-DEMO",

        terminalId:
          "BORNE-01",

        metadata: {
          ticketNumber:
            data.ticket.number,

          ticketId:
            data.ticket.id,

          profile,
        },
      });

      setScreen(
        "ticket",
      );

    } catch (
      exception
    ) {

      setError(
        exception instanceof Error
          ? exception.message
          : "Erreur lors de la création du ticket.",
      );
    }
  }

  function profileLabel(
    value:
      Profile,
  ) {

    if (
      value ===
      "particulier"
    ) {
      return "Particulier";
    }

    if (
      value ===
      "bricoleur"
    ) {
      return "Bricoleur";
    }

    return "Mécanicien / professionnel";
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">

      {screen === "attract" && (

        <button
          type="button"
          onClick={
            () =>
              setScreen(
                "identity",
              )
          }
          className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-blue-950 via-slate-950 to-blue-800 text-white"
        >

          {/* CONTENU PRINCIPAL CENTRE */}
          <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center text-center">

            {/* LOGO TPA VERS LE HAUT */}
            <div className="flex w-full justify-center pt-[17vh]">
              <AnimatedTpaLogo />
            </div>

            <h1 className="mt-7 w-full text-center text-6xl font-black tracking-tight">
              TaPiecesAuto
            </h1>

            <p className="mt-4 w-full text-center text-2xl text-blue-200">
              Votre véhicule. Votre diagnostic. Votre pièce.
            </p>


            {/* ESPACE FLEXIBLE */}
            <div className="flex-1" />


            {/* BOUTON EN BAS ET CENTRE */}
            <div className="flex w-full justify-center px-6 pb-[7vh]">

              <div className="w-full max-w-xl rounded-full bg-white px-10 py-5 text-center text-2xl font-bold text-blue-950 shadow-2xl transition duration-300 hover:scale-[1.03]">

                Touchez l&apos;écran pour commencer

              </div>

            </div>

          </div>


          {/* LOGO PERSONNEL - UNIQUEMENT PAGE D'ACCUEIL */}
          <div className="absolute bottom-6 right-6">

            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-black shadow-xl ring-1 ring-white/20">

              <img
                src="/zt-consult-logo.png"
                alt="ZT Consult"
                className="h-full w-full object-contain"
              />

            </div>

          </div>

        </button>

      )}

      {screen !== "attract" && (

        <div className="min-h-screen p-8">

          <div className="mx-auto max-w-6xl">

            <header className="mb-8 flex items-center justify-between">

              <div>

                <p className="font-black text-blue-700">
                  TaPiecesAuto
                </p>

                <p className="text-sm text-slate-500">
                  Borne showroom
                </p>

              </div>

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold"
                >
                  ← Retour
                </button>

                <button
                  type="button"
                  onClick={home}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold"
                >
                  Accueil
                </button>

              </div>

            </header>


            {screen === "identity" && (

              <section>

                <h1 className="text-center text-5xl font-black">
                  Bienvenue
                </h1>

                <p className="mt-3 text-center text-xl text-slate-600">
                  Choisissez votre situation.
                </p>

                <div className="mt-10 grid gap-6 md:grid-cols-2">

                  <button
                    type="button"
                    onClick={
                      () =>
                        setScreen(
                          "existing",
                        )
                    }
                    className="rounded-3xl border-2 border-blue-200 bg-white p-10 text-left shadow-xl hover:border-blue-700"
                  >

                    <p className="text-sm font-bold uppercase text-blue-700">
                      Déjà client
                    </p>

                    <h2 className="mt-4 text-3xl font-black">
                      J'ai déjà un compte
                    </h2>

                    <p className="mt-4 text-slate-600">
                      Code ID, téléphone ou email.
                    </p>

                  </button>


                  <button
                    type="button"
                    onClick={
                      () =>
                        setScreen(
                          "new",
                        )
                    }
                    className="rounded-3xl border-2 border-emerald-200 bg-white p-10 text-left shadow-xl hover:border-emerald-700"
                  >

                    <p className="text-sm font-bold uppercase text-emerald-700">
                      Nouveau client
                    </p>

                    <h2 className="mt-4 text-3xl font-black">
                      Créer mon compte
                    </h2>

                    <p className="mt-4 text-slate-600">
                      Coordonnées et véhicule.
                    </p>

                  </button>

                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">

                                    <div className="md:col-span-2">

                    <div className="mb-4 flex items-end justify-between gap-4">

                      <div>

                        <p className="text-sm font-black uppercase tracking-widest text-amber-700">
                          Achat rapide
                        </p>

                        <h2 className="mt-1 text-2xl font-black text-slate-950">
                          Je sais ce que je cherche
                        </h2>

                      </div>

                      <p className="hidden text-sm font-semibold text-slate-500 lg:block">
                        Choisissez une catégorie
                      </p>

                    </div>


                    <div className="grid gap-4 md:grid-cols-3">

                      <button
                        type="button"
                        onClick={
                          () =>
                            router.push(
                              "/achat-rapide",
                            )
                        }
                        className="group relative min-h-[185px] overflow-hidden rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6 text-left shadow transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl"
                      >

                        <div className="absolute -right-5 -top-6 text-8xl opacity-[0.07]">
                          🧽
                        </div>

                        <div className="relative">

                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-700 text-2xl shadow">
                            🧽
                          </div>

                          <h3 className="mt-5 text-xl font-black text-slate-950">
                            Produits &amp; accessoires
                          </h3>

                          <p className="mt-2 text-sm leading-5 text-slate-600">
                            Nettoyage, pneu, entretien et accessoires universels.
                          </p>

                          <div className="mt-4 text-sm font-black text-blue-700">
                            Ouvrir →
                          </div>

                        </div>

                      </button>


                      <button
                        type="button"
                        onClick={
                          () =>
                            router.push(
                              "/achat-rapide/fluides",
                            )
                        }
                        className="group relative min-h-[185px] overflow-hidden rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-100 p-6 text-left shadow transition hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl"
                      >

                        <div className="absolute -right-5 -top-6 text-8xl opacity-[0.07]">
                          🛢️
                        </div>

                        <div className="relative">

                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-2xl shadow">
                            🛢️
                          </div>

                          <h3 className="mt-5 text-xl font-black text-slate-950">
                            Lubrifiants &amp; fluides
                          </h3>

                          <p className="mt-2 text-sm leading-5 text-slate-600">
                            Huile, antigel, liquide de frein, AdBlue et lave-glace.
                          </p>

                          <div className="mt-4 text-sm font-black text-amber-700">
                            Ouvrir →
                          </div>

                        </div>

                      </button>


                      <button
                        type="button"
                        onClick={
                          () =>
                            router.push(
                              "/achat-rapide/outillage",
                            )
                        }
                        className="group relative min-h-[185px] overflow-hidden rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-6 text-left shadow transition hover:-translate-y-1 hover:border-emerald-400 hover:shadow-xl"
                      >

                        <div className="absolute -right-5 -top-6 text-8xl opacity-[0.07]">
                          🔧
                        </div>

                        <div className="relative">

                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-2xl shadow">
                            🔧
                          </div>

                          <h3 className="mt-5 text-xl font-black text-slate-950">
                            Outillage
                          </h3>

                          <p className="mt-2 text-sm leading-5 text-slate-600">
                            Clés, douilles, pinces, crics et outils d&apos;atelier.
                          </p>

                          <div className="mt-4 text-sm font-black text-emerald-700">
                            Ouvrir →
                          </div>

                        </div>

                      </button>

                    </div>

                  </div>


                                    <div className="md:col-span-2 mt-16 flex justify-center">

                    <button
                      type="button"
                      onClick={
                        () =>
                          setScreen(
                            "pickup",
                          )
                      }
                      className="group w-full max-w-xl rounded-3xl border-2 border-violet-200 bg-white px-8 py-6 text-center shadow transition hover:-translate-y-1 hover:border-violet-400 hover:shadow-xl"
                    >

                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-2xl">
                        📦
                      </div>

                      <p className="mt-4 text-xs font-black uppercase tracking-widest text-violet-700">
                        Commande existante
                      </p>

                      <h2 className="mt-2 text-2xl font-black text-slate-950">
                        Retirer une commande
                      </h2>

                      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                        J&apos;ai déjà commandé et je viens récupérer ma commande.
                      </p>

                    </button>

                  </div>

                </div>

              </section>
            )}


            {screen === "existing" && (

              <section className="mx-auto max-w-2xl rounded-3xl bg-white p-9 shadow-xl">

                <h1 className="text-4xl font-black">
                  Retrouvez votre compte
                </h1>

                <input
                  value={
                    existingLogin
                  }
                  onChange={
                    event =>
                      setExistingLogin(
                        event.target.value,
                      )
                  }
                  placeholder="Code client (ex. C7), téléphone, email ou nom"
                  className="mt-7 w-full rounded-2xl border border-slate-300 px-5 py-4 text-xl"
                />

                <button
                  type="button"
                  onClick={loginExisting}
                  className="mt-5 w-full rounded-2xl bg-blue-950 px-6 py-4 text-xl font-bold text-white"
                >
                  Continuer
                </button>

              </section>
            )}


            {screen === "new" && (

              <section className="mx-auto max-w-3xl rounded-3xl bg-white p-9 shadow-xl">

                <h1 className="text-4xl font-black">
                  Créer votre compte
                </h1>

                <div className="mt-8 grid gap-4 md:grid-cols-2">

                  <input
                    value={firstName}
                    onChange={
                      event =>
                        setFirstName(
                          event.target.value,
                        )
                    }
                    placeholder="Prénom"
                    className="rounded-xl border border-slate-300 px-5 py-4"
                  />

                  <input
                    value={lastName}
                    onChange={
                      event =>
                        setLastName(
                          event.target.value,
                        )
                    }
                    placeholder="Nom"
                    className="rounded-xl border border-slate-300 px-5 py-4"
                  />

                  <input
                    value={phone}
                    onChange={
                      event =>
                        setPhone(
                          event.target.value,
                        )
                    }
                    placeholder="Téléphone"
                    className="rounded-xl border border-slate-300 px-5 py-4"
                  />

                  <input
                    value={email}
                    onChange={
                      event =>
                        setEmail(
                          event.target.value,
                        )
                    }
                    placeholder="Email"
                    className="rounded-xl border border-slate-300 px-5 py-4"
                  />

                </div>

                <div className="mt-7 rounded-2xl bg-slate-50 p-5">

                  <label className="flex gap-3">

                    <input
                      type="checkbox"
                      checked={
                        marketingEmail
                      }
                      onChange={
                        event =>
                          setMarketingEmail(
                            event.target.checked,
                          )
                      }
                    />

                    Promotions par email

                  </label>

                  <label className="mt-4 flex gap-3">

                    <input
                      type="checkbox"
                      checked={
                        marketingSms
                      }
                      onChange={
                        event =>
                          setMarketingSms(
                            event.target.checked,
                          )
                      }
                    />

                    Promotions par SMS

                  </label>

                </div>

                <button
                  type="button"
                  onClick={createCustomer}
                  className="mt-7 w-full rounded-2xl bg-emerald-700 px-6 py-4 text-xl font-bold text-white"
                >
                  Créer mon compte
                </button>

              </section>
            )}


            {screen === "vehicle" && customer && (

              <section>

                <h1 className="text-4xl font-black">
                  Bonjour {customer.firstName}
                </h1>

                <p className="mt-3 text-xl text-slate-600">
                  Choisissez le véhicule concerné.
                </p>


                {historyVehicleId && (() => {

                  const historyVehicle =
                    vehicles.find(
                      item =>
                        item.id ===
                        historyVehicleId,
                    );

                  if (!historyVehicle) {
                    return null;
                  }

                  const history =
                    [...getVehicleHistory(
                      historyVehicle.id,
                    )]
                      .sort(
                        (a, b) =>
                          new Date(
                            b.searchedAt,
                          ).getTime() -
                          new Date(
                            a.searchedAt,
                          ).getTime(),
                      );

                  const totalPurchased =
                    history
                      .filter(
                        entry =>
                          entry.purchased,
                      )
                      .reduce(
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

                  return (

                    <section className="mt-8">
<div className="mt-6 rounded-3xl bg-white p-7 shadow-xl">

                        <p className="text-sm font-black uppercase tracking-wide text-blue-700">
                          Historique du véhicule
                        </p>

                        <h2 className="mt-2 text-3xl font-black text-slate-950">
                          {historyVehicle.label}
                        </h2>

                        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">

                          {historyVehicle.plate && (
                            <span>
                              Plaque : {historyVehicle.plate}
                            </span>
                          )}

                          {historyVehicle.vin && (
                            <span className="font-mono">
                              VIN {historyVehicle.vin}
                            </span>
                          )}

                        </div>


                        <div className="mt-7 grid gap-4 sm:grid-cols-3">

                          <div className="rounded-2xl bg-slate-50 p-5">

                            <p className="text-sm text-slate-500">
                              Recherches
                            </p>

                            <p className="mt-1 text-3xl font-black">
                              {history.length}
                            </p>

                          </div>


                          <div className="rounded-2xl bg-slate-50 p-5">

                            <p className="text-sm text-slate-500">
                              Achats
                            </p>

                            <p className="mt-1 text-3xl font-black">
                              {
                                history.filter(
                                  entry =>
                                    entry.purchased,
                                ).length
                              }
                            </p>

                          </div>


                          <div className="rounded-2xl bg-slate-50 p-5">

                            <p className="text-sm text-slate-500">
                              Montant total
                            </p>

                            <p className="mt-1 text-3xl font-black">
                              {totalPurchased.toFixed(2)} €
                            </p>

                          </div>

                        </div>


                        {history.length === 0 && (

                          <div className="mt-8 rounded-2xl bg-slate-50 p-8 text-center">

                            <p className="font-bold text-slate-700">
                              Aucun historique pour ce véhicule.
                            </p>

                          </div>

                        )}


                        {history.length > 0 && (

                          <div className="mt-8 space-y-4">

                            {history.map(
                              entry => (

                                <article
                                  key={
                                    entry.id
                                  }
                                  className="rounded-2xl border border-slate-200 p-6"
                                >

                                  <div className="flex flex-col justify-between gap-3 md:flex-row">

                                    <div>

                                      <p className="text-sm font-bold text-slate-400">
                                        {
                                          new Date(
                                            entry.searchedAt,
                                          )
                                            .toLocaleDateString(
                                              "fr-BE",
                                            )
                                        }
                                      </p>

                                      <h3 className="mt-1 text-xl font-black text-slate-950">
                                        {entry.determinedPart}
                                      </h3>

                                    </div>


                                    <div className="text-left md:text-right">

                                      <p className="font-bold">

                                        {
                                          entry.purchased
                                            ? "Achetée"
                                            : "Non achetée"
                                        }

                                      </p>

                                      {entry.amount !== null && (

                                        <p className="mt-1 text-lg font-black">
                                          {entry.amount.toFixed(2)} €
                                        </p>

                                      )}

                                    </div>

                                  </div>


                                  <div className="mt-5 border-t border-slate-200 pt-4">

                                    <p className="text-sm text-slate-500">
                                      Validation après achat
                                    </p>

                                    <p className="mt-1 font-bold">

                                      {
                                        entry.emailValidation ===
                                        "confirmed-correct"
                                          ? "✓ Client confirme que la pièce était correcte"
                                          : entry.emailValidation ===
                                            "reported-incorrect"
                                            ? "✕ Client signale que la pièce était incorrecte"
                                            : entry.emailValidation ===
                                              "pending"
                                              ? "Email envoyé — réponse en attente"
                                              : "Validation non demandée"
                                      }

                                    </p>

                                    {entry.emailValidatedAt && (

                                      <p className="mt-1 text-sm text-slate-500">

                                        Réponse reçue le{" "}
                                        {
                                          new Date(
                                            entry.emailValidatedAt,
                                          )
                                            .toLocaleDateString(
                                              "fr-BE",
                                            )
                                        }

                                      </p>

                                    )}

                                  </div>

                                </article>

                              ),
                            )}

                          </div>

                        )}

                      </div>

                    </section>

                  );

                })()}


                {!historyVehicleId && vehicles.length > 0 && (

                  <div className="mt-8">

                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow">

                      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">

                        <h2 className="text-xl font-black text-slate-950">
                          Vos véhicules enregistrés
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Sélectionnez un véhicule pour le modifier ou le supprimer.
                        </p>

                      </div>


                      <div className="divide-y divide-slate-200">

                        {vehicles.map(
                          item => {

                            const history =
                              getVehicleHistory(
                                item.id,
                              );

                            const latest =
                              [...history]
                                .sort(
                                  (a, b) =>
                                    new Date(
                                      b.searchedAt,
                                    ).getTime() -
                                    new Date(
                                      a.searchedAt,
                                    ).getTime(),
                                )[0] ??
                              null;

                            const selected =
                              vehicle?.id ===
                              item.id;

                            return (

                              <div
                                key={
                                  item.id
                                }
                                className={
                                  selected
                                    ? "bg-blue-50 p-6"
                                    : "bg-white p-6"
                                }
                              >

                                <div className="flex flex-col gap-5 xl:flex-row xl:items-start">

                                  <label className="flex min-w-0 flex-1 cursor-pointer gap-4">

                                    <input
                                      type="radio"
                                      name="selectedVehicle"
                                      checked={
                                        selected
                                      }
                                      onChange={
                                        () =>
                                          setVehicle(
                                            item,
                                          )
                                      }
                                      className="mt-2 h-5 w-5 shrink-0 accent-blue-950"
                                    />

                                    <div className="min-w-0 flex-1">

                                      <p className="text-2xl font-black text-slate-950">
                                        {item.label}
                                      </p>

                                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">

                                        {item.plate && (
                                          <span>
                                            Plaque : {item.plate}
                                          </span>
                                        )}

                                        {item.vin && (
                                          <span className="font-mono">
                                            VIN {item.vin}
                                          </span>
                                        )}

                                        {item.fuel && (
                                          <span>
                                            {item.fuel}
                                          </span>
                                        )}

                                        {item.powerHp && (
                                          <span>
                                            {item.powerHp} ch
                                          </span>
                                        )}

                                        {item.powerKw && (
                                          <span>
                                            {item.powerKw} kW
                                          </span>
                                        )}

                                      </div>

                                    </div>

                                  </label>


                                  <div className="flex shrink-0 flex-col gap-3 sm:flex-row">

                                    <button
                                      type="button"
                                      onClick={
                                        () =>
                                          chooseVehicle(
                                            item,
                                          )
                                      }
                                      className="rounded-2xl bg-blue-950 px-7 py-4 font-black text-white"
                                    >
                                      Utiliser ce véhicule
                                    </button>

                                    <button
                                      type="button"
                                      onClick={
                                        () => {

                                          setVehicle(
                                            item,
                                          );

                                          setHistoryVehicleId(
                                            item.id,
                                          );
                                        }
                                      }
                                      className="rounded-2xl border-2 border-blue-200 bg-blue-50 px-7 py-4 font-black text-blue-950"
                                    >
                                      Historique
                                    </button>

                                  </div>

                                </div>


                                <div className="hidden">

                                  <div className="flex flex-col justify-between gap-2 sm:flex-row">

                                    <p className="font-black text-slate-800">
                                      Historique TaPiecesAuto
                                    </p>

                                    <p className="text-sm text-slate-500">
                                      {
                                        history.length
                                      } recherche{
                                        history.length > 1
                                          ? "s"
                                          : ""
                                      }
                                    </p>

                                  </div>


                                  {!latest && (

                                    <p className="mt-3 text-sm text-slate-500">
                                      Aucune recherche enregistrée pour ce véhicule.
                                    </p>

                                  )}


                                  {latest && (

                                    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">

                                      <div>

                                        <p className="text-xs font-bold uppercase text-slate-400">
                                          Dernière recherche
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-800">
                                          {
                                            new Date(
                                              latest.searchedAt,
                                            )
                                              .toLocaleDateString(
                                                "fr-BE",
                                              )
                                          }
                                        </p>

                                      </div>


                                      <div>

                                        <p className="text-xs font-bold uppercase text-slate-400">
                                          Pièce déterminée
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-800">
                                          {latest.determinedPart}
                                        </p>

                                      </div>


                                      <div>

                                        <p className="text-xs font-bold uppercase text-slate-400">
                                          Achat
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-800">
                                          {
                                            latest.purchased
                                              ? "Oui"
                                              : "Non"
                                          }
                                        </p>

                                      </div>


                                      <div>

                                        <p className="text-xs font-bold uppercase text-slate-400">
                                          Montant
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-800">

                                          {
                                            latest.amount !==
                                            null
                                              ? `${latest.amount.toFixed(2)} €`
                                              : "—"
                                          }

                                        </p>

                                      </div>


                                      <div>

                                        <p className="text-xs font-bold uppercase text-slate-400">
                                          Validation email
                                        </p>

                                        <p className="mt-1 font-semibold">

                                          {
                                            latest.emailValidation ===
                                            "confirmed-correct"
                                              ? "✓ Pièce correcte"
                                              : latest.emailValidation ===
                                                "reported-incorrect"
                                                ? "✕ Pièce incorrecte"
                                                : latest.emailValidation ===
                                                  "pending"
                                                  ? "En attente"
                                                  : "Non demandée"
                                          }

                                        </p>

                                      </div>

                                    </div>

                                  )}


                                  {history.length > 1 && (

                                    <details className="mt-5">

                                      <summary className="cursor-pointer font-bold text-blue-800">
                                        Voir tout l'historique
                                      </summary>

                                      <div className="mt-4 space-y-3">

                                        {
                                          [...history]
                                            .sort(
                                              (a, b) =>
                                                new Date(
                                                  b.searchedAt,
                                                ).getTime() -
                                                new Date(
                                                  a.searchedAt,
                                                ).getTime(),
                                            )
                                            .map(
                                              entry => (

                                                <div
                                                  key={
                                                    entry.id
                                                  }
                                                  className="rounded-xl bg-white p-4 text-sm"
                                                >

                                                  <div className="flex flex-col justify-between gap-2 sm:flex-row">

                                                    <strong>
                                                      {entry.determinedPart}
                                                    </strong>

                                                    <span className="text-slate-500">
                                                      {
                                                        new Date(
                                                          entry.searchedAt,
                                                        )
                                                          .toLocaleDateString(
                                                            "fr-BE",
                                                          )
                                                      }
                                                    </span>

                                                  </div>

                                                  <p className="mt-2 text-slate-600">

                                                    Achat :
                                                    {" "}
                                                    {
                                                      entry.purchased
                                                        ? "oui"
                                                        : "non"
                                                    }

                                                    {
                                                      entry.amount !==
                                                      null
                                                        ? ` • ${entry.amount.toFixed(2)} €`
                                                        : ""
                                                    }

                                                  </p>

                                                </div>

                                              ),
                                            )
                                        }

                                      </div>

                                    </details>

                                  )}

                                </div>

                              </div>

                            );
                          },
                        )}

                      </div>

                    </div>

                  </div>

                )}


                {!historyVehicleId && !vehicleFormOpen && (

                  <div className="mt-8 grid gap-4 md:grid-cols-3">

                    <button
                      type="button"
                      onClick={
                        openNewVehicleForm
                      }
                      className="rounded-2xl border-2 border-blue-300 bg-blue-50 px-6 py-5 text-lg font-black text-blue-950"
                    >
                      + Ajouter un véhicule
                    </button>


                    <button
                      type="button"
                      disabled={
                        !vehicle
                      }
                      onClick={
                        () => {

                          if (
                            vehicle
                          ) {

                            editVehicle(
                              vehicle,
                            );
                          }
                        }
                      }
                      className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-6 py-5 text-lg font-black text-amber-900 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Modifier le véhicule
                    </button>


                    <button
                      type="button"
                      disabled={
                        !vehicle
                      }
                      onClick={
                        () => {

                          if (
                            vehicle
                          ) {

                            deleteVehicle(
                              vehicle,
                            );
                          }
                        }
                      }
                      className="rounded-2xl border-2 border-red-300 bg-red-50 px-6 py-5 text-lg font-black text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Supprimer le véhicule
                    </button>

                  </div>

                )}

                {vehicleFormOpen && (

                  <div className="mt-8 rounded-3xl bg-white p-8 shadow-xl">

                    <div className="flex items-center justify-between gap-4">

                      <h2 className="text-2xl font-black">
                        {editingVehicleId
                          ? "Modifier le véhicule"
                          : vehicles.length > 0
                            ? "Ajouter un nouveau véhicule"
                            : "Ajouter un véhicule"}
                      </h2>

                      <button
                        type="button"
                        onClick={
                          () => {
                            resetVehicleForm();
                            setVehicleFormOpen(false);
                          }
                        }
                        className="rounded-xl border border-slate-300 px-4 py-2 font-semibold"
                      >
                        Annuler
                      </button>

                    </div>


                    <div className="mt-6 rounded-2xl bg-blue-50 p-5">

                      <p className="font-black text-blue-950">
                        Identification par VIN
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Introduisez le VIN. Le décodage automatique des caractéristiques sera connecté au fournisseur de données véhicule.
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
                        placeholder="Numéro VIN"
                        className="mt-4 w-full rounded-xl border border-slate-300 px-5 py-4 font-mono"
                      />

                      <button
                        type="button"
                        onClick={
                          () =>
                            setError(
                              "Décodage VIN automatique : connexion au fournisseur véhicule à installer.",
                            )
                        }
                        className="mt-3 w-full rounded-xl bg-blue-950 px-5 py-3 font-bold text-white"
                      >
                        Identifier par VIN
                      </button>

                    </div>


                    <div className="my-6 text-center font-semibold text-slate-400">
                      ou compléter manuellement
                    </div>


                    <div className="grid gap-4 md:grid-cols-2">

                      <input
                        value={plate}
                        onChange={
                          event =>
                            setPlate(
                              event.target.value
                                .toUpperCase(),
                            )
                        }
                        placeholder="Plaque d'immatriculation (facultatif)"
                        className="rounded-xl border border-slate-300 px-5 py-4"
                      />

                      <div>

  <label className="mb-2 block text-sm font-bold text-slate-700">
    Marque
  </label>

  <input
    value={brand}
    list="vehicle-brand-options"
    autoComplete="off"
    onChange={
      event => {

        setBrand(
          event.target.value,
        );

        setModel(
          "",
        );

        setYear(
          "",
        );

        setFuel(
          "",
        );

        setEngine(
          "",
        );

        setPowerHp(
          "",
        );

        setPowerKw(
          "",
        );
      }
    }
    placeholder="Commencez à écrire : Audi, BMW..."
    className="w-full rounded-xl border border-slate-300 px-5 py-4"
  />

  <datalist id="vehicle-brand-options">

    {vehicleBrandOptions.map(
      option => (
        <option
          key={option}
          value={option}
        />
      ),
    )}

  </datalist>

</div>

                      <div>

  <label className="mb-2 block text-sm font-bold text-slate-700">
    Modèle
  </label>

  <input
    value={model}
    list="vehicle-model-options"
    autoComplete="off"
    onChange={
      event => {

        setModel(
          event.target.value,
        );

        setYear(
          "",
        );

        setFuel(
          "",
        );

        setEngine(
          "",
        );

        setPowerHp(
          "",
        );

        setPowerKw(
          "",
        );
      }
    }
    placeholder={
      brand
        ? "Choisissez ou écrivez le modèle"
        : "Choisissez d'abord la marque"
    }
    className="w-full rounded-xl border border-slate-300 px-5 py-4"
  />

  <datalist id="vehicle-model-options">

    {vehicleModelOptions.map(
      option => (
        <option
          key={option}
          value={option}
        />
      ),
    )}

  </datalist>

</div>

                      <div>

  <label className="mb-2 block text-sm font-bold text-slate-700">
    Année
    <span className="ml-2 font-normal text-slate-400">
      facultatif
    </span>
  </label>

  <input
    value={year}
    list="vehicle-year-options"
    inputMode="numeric"
    autoComplete="off"
    onChange={
      event => {

        setYear(
          event.target.value,
        );

        setFuel(
          "",
        );

        setEngine(
          "",
        );

        setPowerHp(
          "",
        );

        setPowerKw(
          "",
        );
      }
    }
    placeholder={
      model
        ? "Choisissez l'année"
        : "Année"
    }
    className="w-full rounded-xl border border-slate-300 px-5 py-4"
  />

  <datalist id="vehicle-year-options">

    {vehicleYearOptions.map(
      option => (
        <option
          key={option}
          value={String(option)}
        />
      ),
    )}

  </datalist>

</div>

                      <div>

  <label className="mb-2 block text-sm font-bold text-slate-700">
    Carburant
    <span className="ml-2 font-normal text-slate-400">
      facultatif
    </span>
  </label>

  <select
    value={fuel}
    onChange={
      event => {

        setFuel(
          event.target.value,
        );

        setEngine(
          "",
        );

        setPowerHp(
          "",
        );

        setPowerKw(
          "",
        );
      }
    }
    className="w-full rounded-xl border border-slate-300 px-5 py-4"
  >

    <option value="">
      {
        year
          ? "Choisissez le carburant"
          : "Choisissez d'abord l'année"
      }
    </option>

    {vehicleFuelOptions.map(
      option => (

        <option
          key={option}
          value={option}
        >
          {option}
        </option>

      ),
    )}

  </select>

</div>

<div>

  <label className="mb-2 block text-sm font-bold text-slate-700">
    Motorisation
    <span className="ml-2 font-normal text-slate-400">
      facultatif
    </span>
  </label>

  <input
    value={engine}
    list="vehicle-engine-options"
    autoComplete="off"
    onChange={
      event => {

        const nextEngine =
          event.target.value;

        setEngine(
          nextEngine,
        );

        void vehicleDataProvider
          .getEngineDetails(
            brand,
            model,
            nextEngine,
          )
          .then(
            details => {

              if (details) {

          setFuel(
            details.fuel,
          );

          setPowerHp(
            String(
              details.hp,
            ),
          );

          setPowerKw(
            String(
              details.kw,
            ),
          );

              } else {

                setPowerHp(
                  "",
                );

                setPowerKw(
                  "",
                );
              }

            },
          );
      }
    }
    placeholder={
      model
        ? "Choisissez ou écrivez la motorisation"
        : "Motorisation"
    }
    className="w-full rounded-xl border border-slate-300 px-5 py-4"
  />

  <datalist id="vehicle-engine-options">

    {vehicleEngineOptions.map(
      option => (
        <option
          key={option.label}
          value={option.label}
        >
          {option.fuel} - {option.hp} ch - {option.kw} kW
        </option>
      ),
    )}

  </datalist>

</div>


                      <input
                        value={powerHp}
                        onChange={
                          event =>
                            handlePowerHp(
                              event.target.value,
                            )
                        }
                        inputMode="numeric"
                        placeholder="Puissance (ch)"
                        className="rounded-xl border border-slate-300 px-5 py-4"
                      />

                      <input
                        value={powerKw}
                        onChange={
                          event =>
                            handlePowerKw(
                              event.target.value,
                            )
                        }
                        inputMode="numeric"
                        placeholder="Puissance (kW)"
                        className="rounded-xl border border-slate-300 px-5 py-4"
                      />

                    </div>


                    <button
                      type="button"
                      onClick={createVehicle}
                      className="mt-6 w-full rounded-2xl bg-blue-950 px-6 py-4 text-xl font-bold text-white"
                    >
                      {editingVehicleId
                        ? "Enregistrer les modifications"
                        : "Enregistrer ce véhicule"}
                    </button>

                  </div>

                )}

              </section>
            )}

            {screen === "profile" && vehicle && (

              <section>

                <div className="rounded-2xl bg-white p-5 shadow">

                  <p className="text-sm text-slate-500">
                    Véhicule
                  </p>

                  <p className="mt-1 text-xl font-black">
                    {vehicle.label}
                  </p>

                </div>

                <h1 className="mt-9 text-center text-4xl font-black">
                  Quel est votre profil ?
                </h1>

                <div className="mt-8 grid gap-5 md:grid-cols-3">

                  {(
                    [
                      "particulier",
                      "bricoleur",
                      "mecanicien-garage",
                    ] as Profile[]
                  ).map(
                    item => (

                      <button
                        key={item}
                        type="button"
                        onClick={
                          () =>
                            chooseProfile(
                              item,
                            )
                        }
                        className="rounded-3xl bg-white p-8 text-left shadow-xl hover:ring-2 hover:ring-blue-700"
                      >
                        <p className="text-2xl font-black">
                          {profileLabel(item)}
                        </p>
                      </button>

                    ),
                  )}

                </div>

              </section>
            )}


            {screen === "action" &&
              customer &&
              vehicle &&
              profile && (

              <section>

                <div className="rounded-3xl bg-white p-6 shadow">

                  <p className="font-black">
                    {customer.firstName} {customer.lastName}
                  </p>

                  <p className="mt-1">
                    {vehicle.label}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {profileLabel(profile)}
                  </p>

                </div>

                <h1 className="mt-9 text-center text-4xl font-black">
                  Que souhaitez-vous faire ?
                </h1>

                <div className="mt-8 grid gap-6 md:grid-cols-3">

                  <button
                    type="button"
                    onClick={startDiagnostic}
                    className="rounded-3xl bg-blue-950 p-8 text-left text-white shadow-xl"
                  >
                    <h2 className="text-3xl font-black">
                      J'ai un problème
                    </h2>

                    <p className="mt-4 text-blue-100">
                      Lancer le diagnostic TaPiecesAuto.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={knownPart}
                    className="rounded-3xl bg-white p-8 text-left shadow-xl"
                  >
                    <h2 className="text-3xl font-black">
                      Je connais ma pièce
                    </h2>

                    <p className="mt-4 text-slate-600">
                      Recherche directe.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={counterTicket}
                    className="rounded-3xl bg-amber-400 p-8 text-left shadow-xl"
                  >
                    <h2 className="text-3xl font-black">
                      Aller au comptoir
                    </h2>

                    <p className="mt-4">
                      Prendre un ticket avec les données du véhicule déjà transmises.
                    </p>
                  </button>

                </div>

              </section>
            )}


            {screen === "ticket" &&
              customer &&
              vehicle &&
              ticketNumber && (

              <section className="mx-auto max-w-3xl rounded-3xl bg-white p-10 text-center shadow-2xl">

                <p className="text-sm font-black uppercase text-amber-700">
                  Votre numéro
                </p>

                <p className="mt-5 text-8xl font-black">
                  {ticketNumber}
                </p>

                <p className="mt-6 text-xl">
                  Le vendeur possède déjà les informations suivantes :
                </p>

                <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-left">

                  <p>
                    <strong>Client :</strong>{" "}
                    {customer.firstName}{" "}
                    {customer.lastName}
                  </p>

                  <p className="mt-2">
                    <strong>Véhicule :</strong>{" "}
                    {vehicle.label}
                  </p>

                  {vehicle.vin && (
                    <p className="mt-2">
                      <strong>VIN :</strong>{" "}
                      {vehicle.vin}
                    </p>
                  )}

                </div>

              </section>
            )}


            {screen === "accessories" && (

              <section className="mx-auto max-w-5xl">

                <div className="text-center">

                  <p className="text-sm font-black uppercase tracking-widest text-amber-700">
                    Achat rapide
                  </p>

                  <h1 className="mt-3 text-4xl font-black text-slate-950">
                    Accessoires et produits courants
                  </h1>

                  <p className="mt-3 text-xl text-slate-600">
                    Pas besoin de compte ni d'identifier votre véhicule pour les produits que vous connaissez déjà.
                  </p>

                </div>


                <div className="mt-10 grid gap-6 md:grid-cols-2">

                  <button
                    type="button"
                    className="rounded-3xl border-2 border-slate-200 bg-white p-8 text-left shadow hover:border-blue-300"
                  >

                    <p className="text-sm font-black uppercase text-blue-700">
                      Éclairage
                    </p>

                    <h2 className="mt-3 text-2xl font-black">
                      Ampoules
                    </h2>

                    <p className="mt-3 text-slate-600">
                      H7, H4, W5W et autres références courantes.
                    </p>

                  </button>


                  <button
                    type="button"
                    className="rounded-3xl border-2 border-slate-200 bg-white p-8 text-left shadow hover:border-blue-300"
                  >

                    <p className="text-sm font-black uppercase text-emerald-700">
                      Liquides
                    </p>

                    <h2 className="mt-3 text-2xl font-black">
                      Liquides automobiles
                    </h2>

                    <p className="mt-3 text-slate-600">
                      Antigel, liquide de frein, lave-glace, AdBlue.
                    </p>

                  </button>


                  <button
                    type="button"
                    className="rounded-3xl border-2 border-slate-200 bg-white p-8 text-left shadow hover:border-blue-300"
                  >

                    <p className="text-sm font-black uppercase text-orange-700">
                      Entretien
                    </p>

                    <h2 className="mt-3 text-2xl font-black">
                      Entretien et nettoyage
                    </h2>

                    <p className="mt-3 text-slate-600">
                      Nettoyants, additifs et produits d'entretien.
                    </p>

                  </button>


                  <button
                    type="button"
                    className="rounded-3xl border-2 border-slate-200 bg-white p-8 text-left shadow hover:border-blue-300"
                  >

                    <p className="text-sm font-black uppercase text-violet-700">
                      Accessoires
                    </p>

                    <h2 className="mt-3 text-2xl font-black">
                      Accessoires divers
                    </h2>

                    <p className="mt-3 text-slate-600">
                      Désodorisants, fusibles, chiffons, raclettes et petits équipements.
                    </p>

                  </button>

                </div>


                <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-center text-sm font-semibold text-blue-950">
                  Pour un produit dépendant du véhicule, TaPiecesAuto pourra proposer une vérification de compatibilité avant l'achat.
                </div>

              </section>

            )}

            {screen === "pickup" && (

              <section className="mx-auto max-w-2xl rounded-3xl bg-white p-9 shadow-xl">

                <h1 className="text-4xl font-black">
                  Retirer une commande
                </h1>

                <input
                  value={pickupCode}
                  onChange={
                    event =>
                      setPickupCode(
                        event.target.value,
                      )
                  }
                  placeholder="Numéro de commande"
                  className="mt-7 w-full rounded-2xl border border-slate-300 px-5 py-4 text-xl"
                />

              </section>
            )}


            {exitAccountConfirmOpen && (

              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-6">

                <div className="w-full max-w-xl rounded-3xl border border-blue-200 bg-white p-8 shadow-2xl">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl font-black text-blue-950">
                    ?
                  </div>

                  <h2 className="mt-5 text-center text-3xl font-black text-slate-950">
                    Quitter le compte
                    {customer?.firstName
                      ? ` de ${customer.firstName}`
                      : ""} ?
                  </h2>

                  <p className="mx-auto mt-4 max-w-md text-center text-lg leading-7 text-slate-600">
                    Vous allez fermer cette session client et revenir à l'accueil de TaPiecesAuto.
                  </p>

                  <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-center text-sm font-semibold text-blue-950">
                    Les véhicules, recherches et historiques restent enregistrés.
                  </div>

                  <div className="mt-7 grid gap-4 sm:grid-cols-2">

                    <button
                      type="button"
                      onClick={
                        () =>
                          setExitAccountConfirmOpen(
                            false,
                          )
                      }
                      className="rounded-2xl border-2 border-slate-300 bg-white px-6 py-4 text-lg font-black text-slate-800"
                    >
                      Rester sur ce compte
                    </button>

                    <button
                      type="button"
                      onClick={
                        confirmExitAccount
                      }
                      className="rounded-2xl bg-blue-950 px-6 py-4 text-lg font-black text-white"
                    >
                      Quitter le compte
                    </button>

                  </div>

                </div>

              </div>

            )}

            {error && (
              <div className="mx-auto mt-6 max-w-3xl rounded-2xl bg-red-50 p-5 font-semibold text-red-700">
                {error}
              </div>
            )}

          </div>

        </div>

      )}

    </main>
  );
}
























