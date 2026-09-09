import { Redis } from "@upstash/redis";

export type CounterTicketStatus =
  | "waiting"
  | "called"
  | "in-service"
  | "completed"
  | "cancelled"
  | "no-show";


export type CounterTicket = {
  id: string;
  number: string;

  createdAt: string;
  calledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  noShowAt?: string | null;

  status: CounterTicketStatus;

  customer: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };

  vehicle: {
    id: string;
    vin: string | null;
    brand: string;
    model: string;
    year: number | null;
    engine: string;
    label: string;
  };

  profile: string;
  reason: string;

  storeId: string;
  branchId?: string;
  terminalId: string;

  sellerId: string | null;
  sellerName: string | null;
};
let redisInstance: Redis | null = null;

function getRedis(): Redis {
  if (redisInstance) return redisInstance;

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token) {
    throw new Error("TPA Redis counter ticket persistence is not configured.");
  }

  redisInstance = new Redis({ url, token });
  return redisInstance;
}

function ticketKey(ticketId: string): string {
  return `tpa:counter-ticket:${ticketId}`;
}

function ticketIndexKey(): string {
  return "tpa:counter-tickets";
}

export async function acquireCounterAssignmentLock(
  scope: string,
): Promise<string | null> {
  const redis = getRedis();
  const token = crypto.randomUUID();
  const key = `tpa:counter-assignment-lock:${scope}`;

  const result = await redis.set(
    key,
    token,
    { nx: true, ex: 5 },
  );

  return result === "OK" ? token : null;
}

export async function releaseCounterAssignmentLock(
  scope: string,
  token: string,
): Promise<void> {
  const redis = getRedis();
  const key = `tpa:counter-assignment-lock:${scope}`;

  await redis.eval(
    'if redis.call("GET", KEYS[1]) == ARGV[1] then return redis.call("DEL", KEYS[1]) else return 0 end',
    [key],
    [token],
  );
}

export async function saveCounterTicket(
  ticket: CounterTicket,
): Promise<CounterTicket> {
  const redis = getRedis();

  await Promise.all([
    redis.set(ticketKey(ticket.id), ticket),
    redis.sadd(ticketIndexKey(), ticket.id),
  ]);

  return ticket;
}

export async function getCounterTicket(
  ticketId: string,
): Promise<CounterTicket | null> {
  return getRedis().get<CounterTicket>(
    ticketKey(ticketId),
  );
}

export async function listCounterTickets():
  Promise<CounterTicket[]> {
  const redis = getRedis();
  const ids =
    await redis.smembers<string[]>(
      ticketIndexKey(),
    );

  if (!ids.length) return [];

  const tickets =
    await Promise.all(
      ids.map((id) =>
        redis.get<CounterTicket>(
          ticketKey(id),
        ),
      ),
    );

  return tickets
    .filter(
      (ticket): ticket is CounterTicket =>
        ticket !== null,
    )
    .sort(
      (a, b) =>
        a.createdAt.localeCompare(
          b.createdAt,
        ),
    );
}
