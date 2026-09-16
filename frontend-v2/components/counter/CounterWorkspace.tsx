"use client";

import { createContext, useContext, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const CounterWorkspaceContext = createContext(false);

export const useCounterWorkspace = () =>
  useContext(CounterWorkspaceContext);

export function CounterWorkspace({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  if (pathname === "/comptoir") return <CounterWorkspaceContext.Provider value={true}>{children}</CounterWorkspaceContext.Provider>;
  return (
    <CounterWorkspaceContext.Provider value={true}>
      <div className="bg-[#f4f8fc] px-4 py-5 sm:px-6">

        <nav
          aria-label="Outils vendeur"
          className="mx-auto flex max-w-7xl flex-wrap items-center gap-5 text-sm font-black text-blue-950"
        >
          <Link href="/comptoir">
            Comptoir
          </Link>

          <Link href="/comptoir/diagnostic">
            Diagnostic
          </Link>
        </nav>

        <section className="mx-auto mt-6 max-w-7xl">

          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-700">
                Achat rapide
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Je sais ce que je cherche
              </h2>
            </div>

            <p className="hidden text-sm font-bold text-slate-500 sm:block">
              Choisissez une catégorie
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">

            <Link
              href="/comptoir/accessoires"
              className="group relative min-h-[230px] overflow-hidden rounded-[24px] border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50 p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="absolute -right-5 -top-5 text-[95px] opacity-[0.06]">
                🧽
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-700 text-2xl shadow-sm">
                🧽
              </div>

              <h3 className="mt-6 text-[23px] font-black text-slate-950">
                Produits &amp; accessoires
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Nettoyage, pneu, entretien et accessoires universels.
              </p>

              <p className="mt-5 font-black text-blue-700">
                Ouvrir →
              </p>
            </Link>

            <Link
              href="/comptoir/huile"
              className="group relative min-h-[230px] overflow-hidden rounded-[24px] border-2 border-amber-200 bg-gradient-to-br from-white to-amber-50 p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="absolute -right-5 -top-5 text-[95px] opacity-[0.06]">
                🛢️
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-2xl shadow-sm">
                🛢️
              </div>

              <h3 className="mt-6 text-[23px] font-black text-slate-950">
                Lubrifiants &amp; fluides
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Huile, antigel, liquide de frein, AdBlue et lave-glace.
              </p>

              <p className="mt-5 font-black text-amber-700">
                Ouvrir →
              </p>
            </Link>

            <Link
              href="/comptoir/outillage"
              className="group relative min-h-[230px] overflow-hidden rounded-[24px] border-2 border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="absolute -right-5 -top-5 text-[95px] opacity-[0.06]">
                🔧
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-700 text-2xl shadow-sm">
                🔧
              </div>

              <h3 className="mt-6 text-[23px] font-black text-slate-950">
                Outillage
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Clés, douilles, pinces, crics et outils d’atelier.
              </p>

              <p className="mt-5 font-black text-emerald-700">
                Ouvrir →
              </p>
            </Link>

          </div>
        </section>

      </div>

      {children}
    </CounterWorkspaceContext.Provider>
  );
}