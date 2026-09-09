import {
  Redis,
} from "@upstash/redis";


export type CentralVehicle = {
  id: string;
  customerId: string;

  vin?: string;
  brand: string;
  model: string;
  year?: number;
  fuel?: string;
  engine?: string;
  powerHp?: number;
  powerKw?: number;
  label: string;

  createdAt: string;
  updatedAt: string;
};


let redis:
  Redis | null =
    null;


function getRedis(): Redis {

  if (redis) {
    return redis;
  }


  const url =
    process.env.UPSTASH_REDIS_REST_URL;

  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN;


  if (
    !url ||
    !token
  ) {
    throw new Error(
      "REDIS_NOT_CONFIGURED",
    );
  }


  redis =
    new Redis({
      url,
      token,
    });


  return redis;
}


function vehicleKey(
  vehicleId: string,
): string {
  return `tpa:vehicle:${vehicleId}`;
}


function customerVehiclesKey(
  customerId: string,
): string {
  return `tpa:customer:${customerId}:vehicles`;
}


export async function saveCentralVehicle(
  vehicle: CentralVehicle,
): Promise<CentralVehicle> {

  const client =
    getRedis();


  await client.set(
    vehicleKey(
      vehicle.id,
    ),
    vehicle,
  );


  await client.sadd(
    customerVehiclesKey(
      vehicle.customerId,
    ),
    vehicle.id,
  );


  return vehicle;
}


export async function getCentralVehicle(
  vehicleId: string,
): Promise<CentralVehicle | null> {

  return getRedis()
    .get<CentralVehicle>(
      vehicleKey(
        vehicleId,
      ),
    );
}


export async function getCentralVehiclesByCustomerId(
  customerId: string,
): Promise<CentralVehicle[]> {

  const client =
    getRedis();


  const ids =
    await client.smembers<string[]>(
      customerVehiclesKey(
        customerId,
      ),
    );


  if (
    !ids ||
    ids.length === 0
  ) {
    return [];
  }


  const vehicles =
    await Promise.all(
      ids.map(
        id =>
          getCentralVehicle(
            id,
          ),
      ),
    );


  return vehicles.filter(
    (
      vehicle,
    ): vehicle is CentralVehicle =>
      vehicle !== null,
  );
}

export async function deleteCentralVehicle(
  customerId: string,
  vehicleId: string,
): Promise<boolean> {

  const client =
    getRedis();

  const vehicle =
    await getCentralVehicle(
      vehicleId,
    );

  if (
    !vehicle ||
    vehicle.customerId !==
      customerId
  ) {
    return false;
  }

  await client.del(
    vehicleKey(
      vehicleId,
    ),
  );

  await client.srem(
    customerVehiclesKey(
      customerId,
    ),
    vehicleId,
  );

  return true;
}