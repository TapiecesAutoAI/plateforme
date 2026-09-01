import {
  Redis,
} from "@upstash/redis";

import type {
  ComplaintClarificationResult,
} from "./ComplaintClarificationBuilder";

export type PendingComplaintClarification = {
  sessionId:
    string;

  clarification:
    ComplaintClarificationResult;

  createdAt:
    number;

  clarificationToken:
    string;
};

const CLARIFICATION_TTL_SECONDS =
  24 * 60 * 60;

const CLARIFICATION_KEY_PREFIX =
  "tpa:clarification:";

function usePersistentStore():
  boolean {
  return (
    process.env.NODE_ENV ===
      "production"
  );
}

function getRedis():
  Redis {

  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    throw new Error(
      "TPA Redis persistence is not configured.",
    );
  }

  return Redis.fromEnv();
}

export class PendingComplaintClarificationStore {

  private readonly records =
    new Map<
      string,
      PendingComplaintClarification
    >();

  async save(
    sessionId:
      string,
    clarification:
      ComplaintClarificationResult,
  ): Promise<void> {

    if (
      !clarification.required ||
      clarification.items.length === 0
    ) {
      await this.clear(
        sessionId,
      );

      return;
    }

    const record:
      PendingComplaintClarification =
        {
          sessionId,

          clarification,

          createdAt:
            Date.now(),

          clarificationToken:
            crypto.randomUUID(),
        };

    if (!usePersistentStore()) {
      this.records.set(
        sessionId,
        record,
      );

      return;
    }

    await getRedis().set(
      `${CLARIFICATION_KEY_PREFIX}${sessionId}`,
      record,
      {
        ex:
          CLARIFICATION_TTL_SECONDS,
      },
    );
  }

  async update(
    sessionId:
      string,

    clarification:
      ComplaintClarificationResult,
  ): Promise<boolean> {

    const existing =
      await this.get(
        sessionId,
      );

    if (!existing) {
      return false;
    }

    if (
      !clarification.required ||
      clarification.items.length === 0
    ) {
      await this.clear(
        sessionId,
      );

      return true;
    }

    const record:
      PendingComplaintClarification =
        {
          ...existing,

          clarification,

          clarificationToken:
            crypto.randomUUID(),
        };

    if (!usePersistentStore()) {
      this.records.set(
        sessionId,
        record,
      );

      return true;
    }

    await getRedis().set(
      `${CLARIFICATION_KEY_PREFIX}${sessionId}`,
      record,
      {
        ex:
          CLARIFICATION_TTL_SECONDS,
      },
    );

    return true;
  }

  async get(
    sessionId:
      string,
  ): Promise<
    PendingComplaintClarification | null
  > {

    if (!usePersistentStore()) {
      return (
        this.records.get(
          sessionId,
        ) ?? null
      );
    }

    return await getRedis().get<
      PendingComplaintClarification
    >(
      `${CLARIFICATION_KEY_PREFIX}${sessionId}`,
    );
  }

  async has(
    sessionId:
      string,
  ): Promise<boolean> {

    if (!usePersistentStore()) {
      return this.records.has(
        sessionId,
      );
    }

    const exists =
      await getRedis().exists(
        `${CLARIFICATION_KEY_PREFIX}${sessionId}`,
      );

    return exists > 0;
  }

  async clear(
    sessionId:
      string,
  ): Promise<void> {

    if (!usePersistentStore()) {
      this.records.delete(
        sessionId,
      );

      return;
    }

    await getRedis().del(
      `${CLARIFICATION_KEY_PREFIX}${sessionId}`,
    );
  }
}

export const pendingComplaintClarificationStore =
  new PendingComplaintClarificationStore();