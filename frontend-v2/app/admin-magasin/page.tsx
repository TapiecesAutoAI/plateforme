"use client";

import Link from "next/link";

export default function AdminMagasinPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#d9e3ec] via-[#8ea4b7] to-[#526b80] text-[#08233d]">

      <div className="flex min-h-screen">

        <aside className="w-[245px] shrink-0 bg-[#031d38] px-5 py-6 text-white">

          <div className="flex flex-col items-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-blue-300 bg-gradient-to-br from-blue-500 to-blue-800 text-4xl font-black shadow-[0_0_30px_rgba(30,120,255,.55)]">
              TPA
            </div>

            <div className="mt-5 text-2xl font-black">
              Ta Pièce Auto
            </div>
          </div>

          <nav className="mt-10 space-y-2">

            {[
              ["Accueil", "/admin-magasin"],
              ["Vendeurs", "/grossiste/vendeurs"],
              ["Stock", "/grossiste/organisation"],
              ["Commandes", "#"],
              ["Clients", "#"],
              ["Catalogue", "#"],
              ["Facturation", "#"],
              ["Statistiques", "#"],
              ["Paramètres", "#"],
            ].map(([label, href], index) => (
              <Link
                key={label}
                href={href}
                className={[
                  "flex items-center gap-4 rounded-xl px-4 py-3 text-base font-bold transition",
                  index === 0
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-white/90 hover:bg-white/10",
                ].join(" ")}
              >
                <span className="w-6 text-center">
                  {[
                    "⌂",
                    "♙",
                    "□",
                    "☷",
                    "♙",
                    "▤",
                    "▣",
                    "▥",
                    "⚙",
                  ][index]}
                </span>

                {label}
              </Link>
            ))}

          </nav>
        </aside>

        <section className="flex-1">

          <header className="flex items-center gap-5 bg-white/40 px-8 py-4 backdrop-blur-md">

            <div className="flex-1 rounded-full bg-white px-6 py-3 text-sm text-slate-500 shadow-sm">
              ⌕ Rechercher une pièce, une référence, un client...
            </div>

            <div className="font-black">
              G01
            </div>

            <div className="text-xl">
              ♧
            </div>

            <div className="rounded-full bg-white px-5 py-2 shadow-sm">
              <div className="font-black">
                JL
              </div>
              <div className="text-xs">
                Admin magasin
              </div>
            </div>

          </header>

          <div className="px-10 py-10">

            <div className="flex items-start justify-between">

              <div>
                <div className="text-sm font-black uppercase tracking-[0.25em] text-blue-900">
                  Admin magasin
                </div>

                <h1 className="mt-2 text-5xl font-black">
                  Bonjour <span className="text-blue-300">Jean</span>
                </h1>

                <p className="mt-3 text-2xl text-white">
                  Gérez votre magasin, simplement.
                </p>
              </div>

              <div className="text-right">
                <div className="font-black">
                  MAGASIN : LOBBES
                </div>

                <button className="mt-3 rounded-xl bg-white px-5 py-3 font-bold shadow">
                  Changer de magasin
                </button>

                <div className="mt-5 text-sm">
                  dimanche 13 septembre 2026
                </div>

                <div className="text-4xl font-black">
                  21:10:35
                </div>
              </div>

            </div>

            <div className="mt-12 grid grid-cols-3 gap-10">

              <DashboardWheel
                color="blue"
                title={
                  <>
                    Stock &<br />
                    produits
                  </>
                }
                description={
                  <>
                    Réception, stock, inventaire
                    <br />
                    et catalogue.
                  </>
                }
                icon="□"
                href="/grossiste/organisation"
              />

              <DashboardWheel
                color="orange"
                title={<>Personnel</>}
                description={
                  <>
                    Vendeurs, plannings,
                    <br />
                    droits et performances.
                  </>
                }
                icon="♙"
                href="/grossiste/vendeurs"
              />

              <DashboardWheel
                color="green"
                title={
                  <>
                    Ventes &<br />
                    clients
                  </>
                }
                description={
                  <>
                    Tickets, commandes,
                    <br />
                    clients et devis.
                  </>
                }
                icon="🛒"
                href="/comptoir"
              />

            </div>

            <section className="mt-12 rounded-3xl bg-white/65 p-6 shadow-xl backdrop-blur">

              <h2 className="text-2xl font-black">
                Activité du jour
              </h2>

              <div className="mt-5 grid grid-cols-4 gap-4">

                <Stat
                  icon="🛒"
                  value="12"
                  label="Ventes"
                  trend="+20%"
                />

                <Stat
                  icon="♙"
                  value="5"
                  label="Clients"
                  trend="+25%"
                />

                <Stat
                  icon="□"
                  value="28"
                  label="Pièces vendues"
                  trend="+12%"
                />

                <Stat
                  icon="◷"
                  value="3"
                  label="Commandes en cours"
                  trend="+1"
                />

              </div>

            </section>

          </div>

        </section>

      </div>

    </main>
  );
}

function DashboardWheel({
  color,
  title,
  description,
  icon,
  href,
}: {
  color: "blue" | "orange" | "green";
  title: React.ReactNode;
  description: React.ReactNode;
  icon: string;
  href: string;
}) {
  const styles = {
    blue: {
      border: "border-blue-500",
      bg: "from-blue-700 to-[#031d38]",
    },
    orange: {
      border: "border-orange-400",
      bg: "from-orange-500 to-[#1b2529]",
    },
    green: {
      border: "border-emerald-400",
      bg: "from-emerald-600 to-[#032c2b]",
    },
  };

  const style = styles[color];

  return (
    <div className="flex flex-col items-center">

      <Link
        href={href}
        className={`group flex h-[310px] w-[310px] items-center justify-center rounded-full border-[7px] ${style.border} bg-gradient-to-br ${style.bg} text-center shadow-[0_0_30px_rgba(255,255,255,.18)] transition duration-300 hover:scale-[1.04]`}
      >

        <div>

          <div className="text-5xl text-white">
            {icon}
          </div>

          <div className="mt-5 text-3xl font-black text-white">
            {title}
          </div>

          <div className="mx-auto mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl font-black text-[#08233d]">
            →
          </div>

        </div>

      </Link>

      <div className="mt-5 text-center text-lg font-bold text-white">
        {description}
      </div>

    </div>
  );
}

function Stat({
  icon,
  value,
  label,
  trend,
}: {
  icon: string;
  value: string;
  label: string;
  trend: string;
}) {
  return (
    <div className="rounded-2xl bg-white/75 p-5 shadow-sm">

      <div className="flex items-center gap-4">

        <div className="text-3xl">
          {icon}
        </div>

        <div>
          <div className="text-3xl font-black">
            {value}
          </div>

          <div className="font-medium">
            {label}
          </div>
        </div>

      </div>

      <div className="mt-3 font-black text-emerald-600">
        ↗ {trend}
      </div>

    </div>
  );
}
