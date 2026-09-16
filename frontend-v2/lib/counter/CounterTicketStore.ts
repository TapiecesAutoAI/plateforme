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
  branchCode?: string | null;
  terminalId: string;
  terminalCode?: string | null;

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
    await redis.mget<(CounterTicket | null)[]>(
      ...ids.map((id) => ticketKey(id)),
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

export type CounterPresence = {
  status: "available" | "pause" | "mission" | "offline";
  since: string;
  reason: string;
};
function presenceKey(organizationId: string, sellerId: string) {
  return `tpa:counter-presence:${organizationId}:${sellerId}`;
}
export async function getCounterPresence(organizationId: string, sellerId: string): Promise<CounterPresence> {
  return (await getRedis().get<CounterPresence>(presenceKey(organizationId, sellerId))) ?? { status: "available", since: "", reason: "" };
}

// Conditional writes fence out an expired lock holder. All seller state changes
// use the same existing organization assignment lock, including logout.
export async function saveCounterPresenceLocked(organizationId: string, sellerId: string, lockToken: string, presence: CounterPresence) {
  const result = await getRedis().eval(
    'if redis.call("GET",KEYS[1]) ~= ARGV[1] then return 0 end redis.call("SET",KEYS[2],ARGV[2]) return 1',
    [`tpa:counter-assignment-lock:${organizationId}`, presenceKey(organizationId, sellerId)],
    [lockToken, JSON.stringify(presence)],
  );
  if (result !== 1) throw new Error("COUNTER_LOCK_EXPIRED");
}
export async function saveCounterTicketLocked(organizationId: string, lockToken: string, ticket: CounterTicket) {
  const result = await getRedis().eval(
    'if redis.call("GET",KEYS[1]) ~= ARGV[1] then return 0 end redis.call("SET",KEYS[2],ARGV[2]) redis.call("SADD",KEYS[3],ARGV[3]) return 1',
    [`tpa:counter-assignment-lock:${organizationId}`, ticketKey(ticket.id), ticketIndexKey()],
    [lockToken, JSON.stringify(ticket), ticket.id],
  );
  if (result !== 1) throw new Error("COUNTER_LOCK_EXPIRED");
}

export async function changeCounterPresence(organizationId: string, sellerId: string, status: CounterPresence["status"], reason = "", login = false) {
  const token = await acquireCounterAssignmentLock(organizationId);
  if (!token) throw new Error("COUNTER_BUSY_RETRY");
  try {
    const tickets = await listCounterTickets();
    if (status !== "available" && tickets.some(t => t.storeId === organizationId && t.sellerId === sellerId && (t.status === "called" || t.status === "in-service"))) {
      throw new Error("ACTIVE_TICKET_BLOCKS_PRESENCE");
    }
    const current = await getCounterPresence(organizationId, sellerId);
    if (current.status === "offline" && status !== "offline" && !login) throw new Error("LOGIN_REQUIRED");
    const presence: CounterPresence = { status, reason: status === "mission" ? reason.trim().slice(0, 120) : "", since: current.status === status && current.since ? current.since : new Date().toISOString() };
    await saveCounterPresenceLocked(organizationId, sellerId, token, presence);
    return presence;
  } finally { await releaseCounterAssignmentLock(organizationId, token); }
}
