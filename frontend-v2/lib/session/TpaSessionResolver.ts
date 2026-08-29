import {
  permissionsForRole,
} from "./TpaRolePolicy";

import type {
  TpaChannel,
  TpaRole,
  TpaSession,
} from "./TpaSession";

export type TpaAccountType =
  | "customer"
  | "professional"
  | "seller"
  | "administrator";

export type AuthenticatedSessionInput = {
  userId: string;

  customerId?:
    string;



  accountType:
    TpaAccountType;

  displayName?: string;

  storeId?: string;
};

function channelForAccount(
  accountType:
    TpaAccountType,
): TpaChannel {

  switch (
    accountType
  ) {

    case "customer":
      return "customer-web";

    case "professional":
      return "professional";

    case "seller":
      return "counter";

    case "administrator":
      return "admin";
  }
}

function roleForAccount(
  accountType:
    TpaAccountType,
): TpaRole {

  switch (
    accountType
  ) {

    case "customer":
      return "customer";

    case "professional":
      return "professional";

    case "seller":
      return "seller";

    case "administrator":
      return "administrator";
  }
}

export function resolveAuthenticatedTpaSession(
  input:
    AuthenticatedSessionInput,
): TpaSession {

  const role =
    roleForAccount(
      input.accountType,
    );

  return {
    userId:
      input.userId,

    customerId:
      input.customerId,

    channel:
      channelForAccount(
        input.accountType,
      ),

    role,

    permissions:
      permissionsForRole(
        role,
      ),

    displayName:
      input.displayName,

    storeId:
      input.storeId,

    authenticated:
      true,
  };
}

export function createShowroomKioskSession(
  input?: {
    deviceId?: string;
    storeId?: string;
  },
): TpaSession {

  const role:
    TpaRole =
      "kiosk";

  return {
    userId:
      null,

    channel:
      "showroom-kiosk",

    role,

    permissions:
      permissionsForRole(
        role,
      ),

    deviceId:
      input?.deviceId ??
      "SHOWROOM-KIOSK",

    storeId:
      input?.storeId,

    authenticated:
      false,
  };
}