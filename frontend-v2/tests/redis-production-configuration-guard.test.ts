import {
  afterEach,
  describe,
  expect,
  it,
} from "vitest";

import {
  SessionStore,
} from "../engine/core/SessionStore";

import {
  PendingComplaintClarificationStore,
} from "../lib/ai/PendingComplaintClarificationStore";

const originalNodeEnv =
  process.env.NODE_ENV;

const originalRedisUrl =
  process.env.UPSTASH_REDIS_REST_URL;

const originalRedisToken =
  process.env.UPSTASH_REDIS_REST_TOKEN;

afterEach(
  () => {

    if (
      originalNodeEnv === undefined
    ) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV =
        originalNodeEnv;
    }

    if (
      originalRedisUrl === undefined
    ) {
      delete process.env.UPSTASH_REDIS_REST_URL;
    } else {
      process.env.UPSTASH_REDIS_REST_URL =
        originalRedisUrl;
    }

    if (
      originalRedisToken === undefined
    ) {
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
    } else {
      process.env.UPSTASH_REDIS_REST_TOKEN =
        originalRedisToken;
    }

  },
);

describe(
  "Redis production configuration guard",
  () => {

    it(
      "refuses diagnostic session memory fallback in production",
      async () => {

        process.env.NODE_ENV =
          "production";

        delete process.env.UPSTASH_REDIS_REST_URL;
        delete process.env.UPSTASH_REDIS_REST_TOKEN;

        const store =
          new SessionStore();

        await expect(
          store.get(
            "missing-session",
          ),
        ).rejects.toThrow(
          "TPA Redis persistence is not configured.",
        );
      },
    );

    it(
      "refuses clarification memory fallback in production",
      async () => {

        process.env.NODE_ENV =
          "production";

        delete process.env.UPSTASH_REDIS_REST_URL;
        delete process.env.UPSTASH_REDIS_REST_TOKEN;

        const store =
          new PendingComplaintClarificationStore();

        await expect(
          store.get(
            "missing-session",
          ),
        ).rejects.toThrow(
          "TPA Redis persistence is not configured.",
        );
      },
    );

  },
);