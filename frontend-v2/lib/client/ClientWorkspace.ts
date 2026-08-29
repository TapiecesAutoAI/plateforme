"use client";

import {
  DEMO_CUSTOMERS,
  type DemoCustomerRecord,
} from "../showroom/demoCustomers";

import {
  seedShowroomDemoData,
} from "../showroom/demoDataSeeder";

import {
  getVehicleHistory,
  type VehicleHistoryEntry,
} from "../showroom/demoVehicleHistory";


export type ClientVehicleWorkspace = {
  vehicle:
    DemoCustomerRecord["vehicles"][number];

  history:
    VehicleHistoryEntry[];
};


export type ClientWorkspace = {
  customer:
    DemoCustomerRecord["customer"];

  vehicles:
    ClientVehicleWorkspace[];
};


export function getClientWorkspaceByCustomerId(
  customerId:
    string,
): ClientWorkspace | null {

  const records =
    seedShowroomDemoData(
      DEMO_CUSTOMERS,
    );

  const record =
    records.find(
      item =>
        item.customer.id ===
        customerId,
    );

  if (!record) {
    return null;
  }

  return {
    customer:
      record.customer,

    vehicles:
      record.vehicles.map(
        vehicle => ({
          vehicle,

          history:
            getVehicleHistory(
              vehicle.id,
            ),
        }),
      ),
  };
}


export function getClientWorkspaceByEmail(
  email:
    string,
): ClientWorkspace | null {

  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  const records =
    seedShowroomDemoData(
      DEMO_CUSTOMERS,
    );

  const record =
    records.find(
      item =>
        item.customer.email
          .trim()
          .toLowerCase() ===
        normalizedEmail,
    );

  if (!record) {
    return null;
  }

  return {
    customer:
      record.customer,

    vehicles:
      record.vehicles.map(
        vehicle => ({
          vehicle,

          history:
            getVehicleHistory(
              vehicle.id,
            ),
        }),
      ),
  };
}