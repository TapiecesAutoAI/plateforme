import {
  randomUUID,
} from "node:crypto";

import { NextResponse } from "next/server";

import {
  findCentralCustomerByEmail,
  findCentralCustomerByPhone,
  saveCentralCustomer,
  type CustomerMarketingConsent,
} from "../../../../../lib/client/CentralCustomerStore";

import {
  findClientAccountByEmail,
  hashClientPassword,
  saveClientAccount,
} from "../../../../../lib/client/ClientAccountStore";

import {
  findVatOwner,
  isBelgianVatFormatValid,
  isTpaFallbackVatNumber,
  normalizeVatNumber,
  registerVatNumber,
  releaseVatNumber,
} from "../../../../../lib/organization/VatRegistry";

const PRIVACY_VERSION =
  "privacy-v1";

function normalizeEmail(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase();
}

function createConsent(
  channel: "email" | "sms",
  granted: boolean,
  recordedAt: string,
): CustomerMarketingConsent {
  return {
    channel,
    granted,
    recordedAt,
    source: "web",
    privacyVersion:
      PRIVACY_VERSION,
  };
}

export async function POST(
  request: Request,
) {
  try {
    const body =
      (await request.json()) as Record<
        string,
        unknown
      >;

    const firstName =
      typeof body.firstName === "string"
        ? body.firstName.trim()
        : "";

    const lastName =
      typeof body.lastName === "string"
        ? body.lastName.trim()
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? normalizeEmail(body.email)
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const marketingEmail =
      body.marketingEmail === true;

    const marketingSms =
      body.marketingSms === true;

    const customerType =
      body.customerType === "company"
        ? "company"
        : "individual";

    const companyName =
      typeof body.companyName === "string"
        ? body.companyName.trim()
        : "";

    const vatNumber =
      typeof body.vatNumber === "string"
        ? body.vatNumber.trim()
        : "";

    const registrationNumber =
      typeof body.registrationNumber === "string"
        ? body.registrationNumber.trim()
        : "";

    const normalizedVatNumber =
      vatNumber
        ? normalizeVatNumber(vatNumber)
        : "";

    if (
      !firstName ||
      !lastName ||
      !phone ||
      !email ||
      !password
    ) {
      return NextResponse.json(
        {
          error:
            "Les champs obligatoires sont incomplets.",
        },
        {
          status: 400,
        },
      );
    }

    if (customerType === "company") {
      if (!companyName) {
        return NextResponse.json(
          {
            error:
              "Le nom de la societe est obligatoire.",
          },
          {
            status: 400,
          },
        );
      }

      if (!normalizedVatNumber) {
        return NextResponse.json(
          {
            error:
              "Le numero de TVA est obligatoire pour une societe.",
          },
          {
            status: 400,
          },
        );
      }

      if (
        !isTpaFallbackVatNumber(
          normalizedVatNumber,
        ) &&
        !isBelgianVatFormatValid(
          normalizedVatNumber,
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Le numero de TVA belge est invalide.",
          },
          {
            status: 400,
          },
        );
      }
    }

    if (
      !email.includes("@") ||
      email.length > 254
    ) {
      return NextResponse.json(
        {
          error:
            "Adresse e-mail invalide.",
        },
        {
          status: 400,
        },
      );
    }

    if (password.length < 10) {
      return NextResponse.json(
        {
          error:
            "Le mot de passe doit contenir au moins 10 caracteres.",
        },
        {
          status: 400,
        },
      );
    }

    const [
      existingAccount,
      existingCustomer,
      existingPhoneCustomer,
    ] = await Promise.all([
      findClientAccountByEmail(email),
      findCentralCustomerByEmail(email),
      findCentralCustomerByPhone(phone),
    ]);

    if (
      existingAccount ||
      existingCustomer
    ) {
      return NextResponse.json(
        {
          error:
            "Cette adresse e-mail est deja associee a un compte TPA.",
        },
        {
          status: 409,
        },
      );
    }

    if (existingPhoneCustomer) {
      return NextResponse.json(
        {
          error:
            "Ce numero de telephone est deja associe a un compte TPA.",
        },
        {
          status: 409,
        },
      );
    }

    if (
      customerType === "company" &&
      normalizedVatNumber &&
      !isTpaFallbackVatNumber(
        normalizedVatNumber,
      )
    ) {
      const existingVatOwner =
        await findVatOwner(
          normalizedVatNumber,
        );

      if (existingVatOwner) {
        return NextResponse.json(
          {
            error:
              "Ce numero de TVA est deja associe a une societe TPA.",
          },
          {
            status: 409,
          },
        );
      }
    }

    const customerId =
      `C-${randomUUID()}`;

    const now =
      new Date().toISOString();

    const passwordData =
      await hashClientPassword(
        password,
      );

    if (
      customerType === "company" &&
      normalizedVatNumber &&
      !isTpaFallbackVatNumber(
        normalizedVatNumber,
      )
    ) {
      try {
        await registerVatNumber(
          normalizedVatNumber,
          "customer",
          customerId,
        );
      } catch (error) {
        if (
          error instanceof Error &&
          error.message ===
            "TPA_VAT_ALREADY_EXISTS"
        ) {
          return NextResponse.json(
            {
              error:
                "Ce numero de TVA est deja associe a une societe TPA.",
            },
            {
              status: 409,
            },
          );
        }

        throw error;
      }
    }

    try {
      await saveCentralCustomer({
      customerId,
      firstName,
      lastName,
      phone,
      email,

      profile:
        customerType === "company"
          ? {
              company: {
                customerType: "company",
                companyName,
                vatNumber:
                  normalizedVatNumber,
                registrationNumber:
                  registrationNumber ||
                  undefined,
              },
            }
          : {
              company: {
                customerType:
                  "individual",
              },
            },

      marketingConsents: {
        email: createConsent(
          "email",
          marketingEmail,
          now,
        ),

        sms: createConsent(
          "sms",
          marketingSms,
          now,
        ),
      },

      createdAt: now,
      updatedAt: now,
    });
    } catch (error) {
      if (
        customerType === "company" &&
        normalizedVatNumber &&
        !isTpaFallbackVatNumber(
          normalizedVatNumber,
        )
      ) {
        await releaseVatNumber(
          normalizedVatNumber,
          "customer",
          customerId,
        );
      }

      throw error;
    }

    await saveClientAccount({
      customerId,
      loginEmail: email,

      passwordHash:
        passwordData.hash,

      passwordSalt:
        passwordData.salt,

      passwordAlgorithm:
        "scrypt-v1",

      status: "active",

      verificationStatus:
        "pending_verification",

      verificationSource:
        "web",

      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      {
        success: true,
        customerId,
      },
      {
        status: 201,
      },
    );
  } catch (error) {

    if (
      error instanceof Error &&
      error.message ===
        "CUSTOMER_EMAIL_ALREADY_EXISTS"
    ) {
      return NextResponse.json(
        {
          error:
            "Cette adresse e-mail est deja associee a un compte TPA.",
        },
        {
          status: 409,
        },
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "CUSTOMER_PHONE_ALREADY_EXISTS"
    ) {
      return NextResponse.json(
        {
          error:
            "Ce numero de telephone est deja associe a un compte TPA.",
        },
        {
          status: 409,
        },
      );
    }

    return NextResponse.json(
      {
        error:
          "Impossible de creer le compte pour le moment.",
      },
      {
        status: 500,
      },
    );
  }
}