"use client";

import { useRouter } from "next/navigation";

const modules = [
  {
    title: "Mon planning",
    description:
      "Consulter mes horaires et mon planning de travail.",
    status: "À connecter",
  },
  {
    title: "Congés",
    description:
      "Introduire une demande et suivre mes congés.",
    status: "À connecter",
  },
  {
    title: "Absence ou retard",
    description:
      "Prévenir rapidement mon responsable ou la direction.",
    status: "À connecter",
  },
  {
    title: "Certificat médical",
    description:
      "Transmettre un certificat de manière confidentielle.",
    status: "À connecter",
  },
  {
    title: "Documents RH",
    description:
      "Retrouver mes documents personnels liés au travail.",
    status: "À connecter",
  },
  {
    title: "Messages",
    description:
      "Communiquer avec mon responsable, les RH ou la direction.",
    status: "À connecter",
  },
];

export default function EmployeeHrPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-950">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() =>
            router.push("/comptoir")
          }
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold shadow-sm transition hover:bg-slate-50"
        >
          ← Retour
        </button>

        <div className="mt-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">
            Personnel
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Mon espace RH
          </h1>

          <p className="mt-3 max-w-3xl text-slate-600">
            Planning, congés, absences, documents et échanges avec votre hiérarchie.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {modules.map(
            (module) => (
              <section
                key={module.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-black">
                    {module.title}
                  </h2>

                  <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
                    {module.status}
                  </span>
                </div>

                <p className="mt-3 leading-6 text-slate-600">
                  {module.description}
                </p>
              </section>
            ),
          )}
        </div>

        <div className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-6">
          <p className="font-black text-blue-950">
            Confidentialité RH
          </p>

          <p className="mt-2 text-sm leading-6 text-blue-900">
            Les informations personnelles et médicales seront protégées par des droits d'accès spécifiques. Les autres employés ne pourront pas consulter vos documents confidentiels.
          </p>
        </div>
      </div>
    </main>
  );
}