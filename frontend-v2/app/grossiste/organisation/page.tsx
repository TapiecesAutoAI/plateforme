import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  verifyTpaSessionToken,
} from "../../../lib/session/TpaSessionToken";

import {
  getOrganization,
} from "../../../lib/organization/OrganizationStore";

import GrossisteOrganizationView
  from "./GrossisteOrganizationView";

export default async function GrossisteOrganisationPage() {
  const secret =
    process.env.TPA_SESSION_SECRET;

  if (!secret) {
    redirect("/login");
  }

  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      "tpa_session",
    )?.value;

  if (!token) {
    redirect("/login");
  }

  const session =
    verifyTpaSessionToken(
      token,
      secret,
    );

  if (!session) {
    redirect("/login");
  }

  if (
    session.accessRole ===
    "super_admin"
  ) {
    redirect("/super-admin");
  }

  if (session.accessRole === "seller") {
    redirect("/comptoir");
  }

  if (session.accessRole === "client") {
    redirect("/client");
  }

  if (
    session.accessRole !==
      "wholesaler_admin" ||
    !session.organizationId
  ) {
    redirect("/login");
  }

  const organization =
    await getOrganization(
      session.organizationId,
    );

  if (!organization) {
    redirect("/login");
  }

  return (
    <GrossisteOrganizationView />
  );
}