import type {
  CustomerCompany,
  CustomerDiagnosticProfile,
} from "./CentralCustomerStore";

export type DiagnosticProfileAuthorizationInput = {
  requestedProfile:
    CustomerDiagnosticProfile;

  company?:
    CustomerCompany;

  sessionRole:
    | "kiosk"
    | "customer"
    | "professional"
    | "seller"
    | "administrator";
};

export type DiagnosticProfileAuthorizationResult =
  | {
      allowed: true;
      profile: CustomerDiagnosticProfile;
    }
  | {
      allowed: false;
      error:
        | "PROFILE_COMPANY_REQUIRED"
        | "PROFILE_COMPANY_DETAILS_REQUIRED"
        | "PROFILE_ADMIN_REQUIRED";
      message: string;
    };

function hasProfessionalCompanyDetails(
  company:
    CustomerCompany | undefined,
): boolean {

  if (
    company?.customerType !== "company"
  ) {
    return false;
  }

  const companyName =
    company.companyName?.trim();

  const professionalNumber =
    company.vatNumber?.trim() ||
    company.registrationNumber?.trim();

  return Boolean(
    companyName &&
    professionalNumber,
  );
}

export function authorizeDiagnosticProfile(
  input:
    DiagnosticProfileAuthorizationInput,
): DiagnosticProfileAuthorizationResult {

  switch (input.requestedProfile) {

    case "particulier":
    case "bricoleur":
      return {
        allowed: true,
        profile:
          input.requestedProfile,
      };

    case "mecanicien-garage":

      if (
        input.company?.customerType !==
        "company"
      ) {
        return {
          allowed: false,
          error:
            "PROFILE_COMPANY_REQUIRED",
          message:
            "Profil Mécanicien/Garage refusé : ce profil est réservé à une activité professionnelle.",
        };
      }

      if (
        !hasProfessionalCompanyDetails(
          input.company,
        )
      ) {
        return {
          allowed: false,
          error:
            "PROFILE_COMPANY_DETAILS_REQUIRED",
          message:
            "Profil Mécanicien/Garage refusé : renseigne le nom de l’entreprise et le numéro de TVA ou d’entreprise.",
        };
      }

      return {
        allowed: true,
        profile:
          input.requestedProfile,
      };

    case "vendeur-pieces-auto":

      if (
        input.sessionRole !==
        "administrator"
      ) {
        return {
          allowed: false,
          error:
            "PROFILE_ADMIN_REQUIRED",
          message:
            "Profil Vendeur pièces auto refusé : ce profil peut uniquement être attribué par un administrateur TPA.",
        };
      }

      return {
        allowed: true,
        profile:
          input.requestedProfile,
      };


  }
}