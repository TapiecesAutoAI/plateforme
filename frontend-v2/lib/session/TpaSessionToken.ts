import {
  createHmac,
  timingSafeEqual,
} from "crypto";

import type {
  TpaSession,
} from "./TpaSession";

function sign(
  value: string,
  secret: string,
): string {
  return createHmac(
    "sha256",
    secret,
  )
    .update(value)
    .digest("hex");
}

export function verifyTpaSessionToken(
  token: string,
  secret: string,
): TpaSession | null {
  try {
    const parts =
      token.split(".");

    if (parts.length !== 2) {
      return null;
    }

    const payload =
      parts[0];

    const signature =
      parts[1];

    if (
      !payload ||
      !signature
    ) {
      return null;
    }

    const expectedSignature =
      sign(
        payload,
        secret,
      );

    const supplied =
      Buffer.from(
        signature,
        "hex",
      );

    const expected =
      Buffer.from(
        expectedSignature,
        "hex",
      );

    if (
      supplied.length !==
      expected.length
    ) {
      return null;
    }

    if (
      !timingSafeEqual(
        supplied,
        expected,
      )
    ) {
      return null;
    }

    const json =
      Buffer
        .from(
          payload,
          "base64url",
        )
        .toString(
          "utf8",
        );

    const parsed =
      JSON.parse(
        json,
      ) as Partial<TpaSession>;

    if (
      parsed.authenticated !== true ||
      typeof parsed.channel !== "string" ||
      typeof parsed.role !== "string" ||
      !Array.isArray(
        parsed.permissions,
      )
    ) {
      return null;
    }

    return parsed as TpaSession;
  } catch {
    return null;
  }
}