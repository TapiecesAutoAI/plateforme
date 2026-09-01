import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const redisMock =
  vi.hoisted(
    () => ({
      set:
        vi.fn(),
      get:
        vi.fn(),
      exists:
        vi.fn(),
      del:
        vi.fn(),
    }),
  );

vi.mock(
  "@upstash/redis",
  () => ({
    Redis: {
      fromEnv:
        vi.fn(
          () =>
            redisMock,
        ),
    },
  }),
);

import {
  SessionStore,
} from "../engine/core/SessionStore";

import type {
  DiagnosticSession,
} from "../engine/core/sessionTypes";

import {
  PendingComplaintClarificationStore,
} from "../lib/ai/PendingComplaintClarificationStore";

const originalNodeEnv =
  process.env.NODE_ENV;

const originalRedisUrl =
  process.env.UPSTASH_REDIS_REST_URL;

const originalRedisToken =
  process.env.UPSTASH_REDIS_REST_TOKEN;

beforeEach(
  () => {

    vi.clearAllMocks();

    process.env.NODE_ENV =
      "production";

    process.env.UPSTASH_REDIS_REST_URL =
      "https://example.upstash.test";

    process.env.UPSTASH_REDIS_REST_TOKEN =
      "test-token";

    redisMock.set.mockResolvedValue(
      "OK",
    );

    redisMock.get.mockResolvedValue(
      null,
    );

    redisMock.exists.mockResolvedValue(
      0,
    );

    redisMock.del.mockResolvedValue(
      0,
    );
  },
);

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
  "Redis production persistence",
  () => {

    it(
      "stores diagnostic sessions with namespaced key and 24h TTL",
      async () => {

        const store =
          new SessionStore();

        const session = {
          id:
            "session-redis-test",

          createdAt:
            new Date().toISOString(),

          updatedAt:
            new Date().toISOString(),
        } as DiagnosticSession;

        await store.save(
          session,
        );

        expect(
          redisMock.set,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          redisMock.set,
        ).toHaveBeenCalledWith(
          "tpa:diagnostic-session:session-redis-test",
          session,
          {
            ex:
              86_400,
          },
        );
      },
    );

    it(
      "stores pending clarification with namespaced key and 24h TTL",
      async () => {

        const store =
          new PendingComplaintClarificationStore();

        await store.save(
          "clarification-redis-test",
          {
            required:
              true,

            items: [
              {
                kind:
                  "evidence-confirmation",

                evidenceIds: [
                  "symptom-single-click",
                ],

                reason:
                  "test",
              },
            ],
          },
        );

        expect(
          redisMock.set,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          redisMock.set,
        ).toHaveBeenCalledWith(
          "tpa:clarification:clarification-redis-test",
          expect.objectContaining({
            sessionId:
              "clarification-redis-test",

            clarification:
              expect.objectContaining({
                required:
                  true,
              }),

            createdAt:
              expect.any(Number),

            clarificationToken:
              expect.any(String),
          }),
          {
            ex:
              86_400,
          },
        );
      },
    );

  },
);