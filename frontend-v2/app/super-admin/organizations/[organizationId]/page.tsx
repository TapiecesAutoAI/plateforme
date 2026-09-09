import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { verifyTpaSessionToken } from "../../../../lib/session/TpaSessionToken";
import { getOrganization } from "../../../../lib/organization/OrganizationStore";

type PageProps = {
  params: Promise<{
    organizationId: string;
  }>;
};

export default async function OrganizationPage({ params }: PageProps) {
  const secret = process.env.TPA_SESSION_SECRET;

  if (!secret) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("tpa_session")?.value;

  if (!token) {
    redirect("/login");
  }

  const session = verifyTpaSessionToken(token, secret);

  if (!session || session.accessRole !== "super_admin") {
    redirect("/client");
  }

  const { organizationId } = await params;
  const organization = await getOrganization(organizationId);

  if (!organization) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-950 via-slate-950 to-[#E30A17] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">

        <a
          href="/super-admin"
          className="inline-flex rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/15"
        >
          ← Retour Super Admin
        </a>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur sm:p-8">

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-red-200">
                Organisation TPA
              </p>

              <h1 className="mt-1 text-3xl font-black">
                {organization.name}
              </h1>

              <p className="mt-2 text-sm text-red-200">
                {organization.organizationId}
              </p>
            </div>

            <span className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-black">
              {organization.status === "active" ? "ACTIF" : "DÉSACTIVÉ"}
            </span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
              <p className="text-sm font-bold text-red-200">TVA</p>
              <p className="mt-2 font-black">
                {organization.vatNumber || "—"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
              <p className="text-sm font-bold text-red-200">Téléphone</p>
              <p className="mt-2 font-black">
                {organization.phone || "—"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
              <p className="text-sm font-bold text-red-200">Email</p>
              <p className="mt-2 font-black">
                {organization.email || "—"}
              </p>
            </div>

          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/30 p-5">
            <h2 className="text-xl font-black">
              Siège
            </h2>

            <p className="mt-3 text-red-100">
              {[
                organization.headOffice?.street,
                organization.headOffice?.houseNumber,
                organization.headOffice?.postalCode,
                organization.headOffice?.city,
                organization.headOffice?.country,
              ]
                .filter(Boolean)
                .join(" ") || "Adresse non renseignée"}
            </p>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">
                Succursales
              </h2>

              <span className="rounded-full bg-[#E30A17] px-3 py-1 text-xs font-black">
                {organization.branches?.length ?? 0}
              </span>
            </div>

            {!organization.branches?.length ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-5 text-red-100">
                Aucune succursale.
              </div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {organization.branches.map((branch) => (
                  <div
                    key={branch.branchId}
                    className="rounded-2xl border border-white/10 bg-slate-950/30 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-black">
                        {branch.name}
                      </p>

                      <span className="text-xs font-bold text-red-200">
                        {branch.status === "active" ? "ACTIF" : "DÉSACTIVÉ"}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-red-100">
                      {[
                        branch.address?.street,
                        branch.address?.houseNumber,
                        branch.address?.postalCode,
                        branch.address?.city,
                      ]
                        .filter(Boolean)
                        .join(" ") || "Adresse non renseignée"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}