import {
  Redis,
} from "@upstash/redis";

import type {
  DiagnosticSession,
} from "./sessionTypes";

const SESSION_TTL_SECONDS =
  24 * 60 * 60;

const SESSION_KEY_PREFIX =
  "tpa:diagnostic-session:";

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

export class SessionStore {
  private readonly sessions =
    new Map<
      string,
      DiagnosticSession
    >();

  public async save(
    session: DiagnosticSession,
  ): Promise<void> {

    if (!usePersistentStore()) {
      this.sessions.set(
        session.id,
        session,
      );

      return;
    }

    await getRedis().set(
      `${SESSION_KEY_PREFIX}${session.id}`,
      session,
      {
        ex:
          SESSION_TTL_SECONDS,
      },
    );
  }

  public async get(
    sessionId: string,
  ): Promise<DiagnosticSession | null> {

    if (!usePersistentStore()) {
      return (
        this.sessions.get(
          sessionId,
        ) ?? null
      );
    }

    return await getRedis().get<
      DiagnosticSession
    >(
      `${SESSION_KEY_PREFIX}${sessionId}`,
    );
  }

  public async has(
    sessionId: string,
  ): Promise<boolean> {

    if (!usePersistentStore()) {
      return this.sessions.has(
        sessionId,
      );
    }

    const exists =
      await getRedis().exists(
        `${SESSION_KEY_PREFIX}${sessionId}`,
      );

    return exists > 0;
  }

  public async delete(
    sessionId: string,
  ): Promise<boolean> {

    if (!usePersistentStore()) {
      return this.sessions.delete(
        sessionId,
      );
    }

    const deleted =
      await getRedis().del(
        `${SESSION_KEY_PREFIX}${sessionId}`,
      );

    return deleted > 0;
  }

  public async clear():
    Promise<void> {

    if (usePersistentStore()) {
      throw new Error(
        "SessionStore.clear is disabled in production.",
      );
    }

    this.sessions.clear();
  }
}

export const diagnosticSessionStore =
  new SessionStore();