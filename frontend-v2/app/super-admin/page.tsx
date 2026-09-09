import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyTpaSessionToken } from "../../lib/session/TpaSessionToken";
import { listOrganizations } from "../../lib/organization/OrganizationStore";
import CreateOrganizationForm from "./CreateOrganizationForm";

export default async function SuperAdminPage() {
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

  if (!session) {
    redirect("/login");
  }

  if (session.accessRole === "client") {
    redirect("/client");
  }

  if (session.accessRole === "seller") {
    redirect("/comptoir");
  }

  if (session.accessRole === "wholesaler_admin") {
    redirect("/grossiste");
  }

  if (session.accessRole !== "super_admin") {
    redirect("/login");
  }

  const organizations =
    await listOrganizations();

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-red-950 via-slate-950 to-[#E30A17] px-6 py-10 text-white">

      <div className="absolute left-6 top-6">
        <img
          src="/zt-consult-logo.png"
          alt="ZT Consult"
          className="h-16 w-16 rounded-2xl object-contain shadow-xl"
        />
      </div>

      <div className="mx-auto w-full max-w-6xl pt-20">

        <div className="text-center">
          <div className="relative mx-auto h-24 w-24">
            <div className="absolute inset-0 animate-ping rounded-full bg-red-500/20" />
            <div className="absolute inset-1 rounded-full bg-red-500/20 blur-xl" />

            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-red-300/30 bg-gradient-to-br from-[#E30A17] via-red-700 to-red-950 text-3xl font-black text-white shadow-[0_0_35px_rgba(227,10,23,0.55)]">
              <div className="absolute inset-[5px] rounded-full border border-white/15" />
              <span className="relative z-10">TPA</span>
            </div>
          </div>

          <h1 className="mt-5 text-4xl font-black">
            TaPieceAuto
          </h1>

          <p className="mt-2 text-red-200">
            Espace Super Administrateur
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur sm:p-8">
          <h2 className="text-2xl font-black">
            Super Admin TPA
          </h2>

          <p className="mt-3 text-red-100">
            Accès Super Administrateur actif.
          </p>

          <CreateOrganizationForm />

          <section className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black">
                  Grossistes TPA
                </h3>
                <p className="mt-1 text-sm text-red-200">
                  {organizations.length} grossiste{organizations.length === 1 ? "" : "s"} enregistré{organizations.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            {organizations.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
                Aucun grossiste enregistré.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {organizations.map((organization) => (
                  <article
                    key={organization.organizationId}
                    className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-lg font-black">
                          {organization.name}
                        </h4>
                        <p className="mt-1 text-xs text-red-200">
                          {organization.organizationId}
                        </p>
                      </div>

                      <span className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-xs font-black text-red-100">
                        {organization.status === "active" ? "ACTIF" : "DÉSACTIVÉ"}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <p>
                        <span className="font-bold text-red-200">TVA :</span>{" "}
                        {organization.vatNumber || "—"}
                      </p>

                      <p>
                        <span className="font-bold text-red-200">Siège :</span>{" "}
                        {organization.headOffice?.city || "—"}
                      </p>

                      <p>
                        <span className="font-bold text-red-200">Succursales :</span>{" "}
                        {organization.branches?.length ?? 0}
                      </p>
                    </div>

                    <a
                      href={`/super-admin/organizations/${organization.organizationId}`}
                      className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#E30A17] px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-700"
                    >
                      GÉRER
                    </a>
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
              <p className="text-sm font-bold text-red-200">Rôle</p>
              <p className="mt-2 text-lg font-black">Super Admin TPA</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
              <p className="text-sm font-bold text-red-200">Organisation</p>
              <p className="mt-2 text-lg font-black">Accès global</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black">
                Feuille de route TPA
              </h2>
              <p className="mt-1 text-sm text-red-200">
                Les prochaines étapes du Super Admin
              </p>
            </div>

            <div className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-200">
              EN COURS
            </div>
          </div>

          <div className="mt-6 space-y-3">

            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-black">1. OrganizationStore</p>
                  <p className="mt-1 text-sm text-red-100">
                    Créer la base centrale des grossistes dans Redis.
                  </p>
                </div>
                <span className="whitespace-nowrap rounded-full bg-[#E30A17] px-3 py-1 text-xs font-black">
                  PROCHAINE ÉTAPE
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <p className="font-black">2. Gestion des grossistes</p>
              <p className="mt-1 text-sm text-red-100">
                Créer, modifier, consulter et désactiver un grossiste.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <p className="font-black">3. Administrateurs grossistes</p>
              <p className="mt-1 text-sm text-red-100">
                Créer et gérer les administrateurs de chaque organisation.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <p className="font-black">4. Vendeurs</p>
              <p className="mt-1 text-sm text-red-100">
                Créer les vendeurs et les rattacher à leur grossiste.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <p className="font-black">5. Statistiques TPA</p>
              <p className="mt-1 text-sm text-red-100">
                Clients, diagnostics, commandes et activité globale.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <p className="font-black">6. Sécurité et accès</p>
              <p className="mt-1 text-sm text-red-100">
                Permissions, organisations et accès Seller / Admin Grossiste.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4">
              <p className="font-black">7. Récupération compte Super Admin</p>
              <p className="mt-1 text-sm text-red-100">
                Mot de passe oublié, lien sécurisé par email, expiration, invalidation des sessions et 2FA.
              </p>
              <p className="mt-2 text-xs font-bold text-amber-200">
                SÉCURITÉ IMPORTANTE
              </p>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}