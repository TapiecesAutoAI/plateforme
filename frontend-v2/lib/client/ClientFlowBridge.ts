export type ClientFlowProfile =
  | "particulier"
  | "bricoleur"
  | "mecanicien-garage";

export type ClientFlowCustomer = {
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
    ClientFlowProfile;
};

export type ClientFlowVehicle = {
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

export type ClientFlowContext = {
  customer:
    ClientFlowCustomer;

  vehicle:
    ClientFlowVehicle;

  profile:
    ClientFlowProfile;
};

const CONTEXT_KEY =
  "tapiecesauto-showroom-context";

const CUSTOMER_KEY =
  "tapiecesauto-showroom-customer";

const VEHICLE_KEY =
  "tapiecesauto-showroom-vehicle";

const PROFILE_KEY =
  "tapiecesauto-showroom-profile";

const PIECE_FLOW_KEY =
  "tapiecesauto-piece-flow";


function resolveProfile(
  customer:
    ClientFlowCustomer,
): ClientFlowProfile {

  if (
    customer.profile ===
      "bricoleur" ||
    customer.profile ===
      "mecanicien-garage"
  ) {
    return customer.profile;
  }

  return "particulier";
}


export function saveClientFlowContext(
  customer:
    ClientFlowCustomer,

  vehicle:
    ClientFlowVehicle,
): ClientFlowContext {

  const profile =
    resolveProfile(
      customer,
    );

  const context:
    ClientFlowContext = {
      customer,
      vehicle,
      profile,
    };

  window.sessionStorage.setItem(
    CONTEXT_KEY,
    JSON.stringify(
      context,
    ),
  );

  window.sessionStorage.setItem(
    CUSTOMER_KEY,
    JSON.stringify(
      customer,
    ),
  );

  window.sessionStorage.setItem(
    VEHICLE_KEY,
    JSON.stringify(
      vehicle,
    ),
  );

  window.sessionStorage.setItem(
    PROFILE_KEY,
    profile,
  );

  return context;
}


export function prepareClientDiagnostic(
  customer:
    ClientFlowCustomer,

  vehicle:
    ClientFlowVehicle,
): ClientFlowContext {

  window.sessionStorage.removeItem(
    PIECE_FLOW_KEY,
  );

  return saveClientFlowContext(
    customer,
    vehicle,
  );
}


export function prepareClientKnownPart(
  customer:
    ClientFlowCustomer,

  vehicle:
    ClientFlowVehicle,
): ClientFlowContext {

  const context =
    saveClientFlowContext(
      customer,
      vehicle,
    );

  window.sessionStorage.setItem(
    PIECE_FLOW_KEY,
    "known-part",
  );

  return context;
}