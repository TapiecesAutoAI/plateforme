"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useSearchParams,
} from "next/navigation";

type Branch = {
  branchId: string;
  branchCode?: string;
  name: string;
  phone?: string;
  email?: string;
  status: "active" | "disabled";

  address?: {
    street?: string;
    houseNumber?: string;
    box?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };

  counters?: {
    counterId: string;
    number: number;
    name?: string;
    status: "active" | "disabled";
  }[];

  terminals?: {
    terminalId: string;
    name: string;
    status: "active" | "disabled";
  }[];

  staff?: {
    staffId: string;
    firstName: string;
    lastName: string;
    status: "active" | "disabled";
  }[];
};

export default function BranchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId") ?? "";
  const interventionQuery = organizationId ? `?organizationId=${encodeURIComponent(organizationId)}&mode=super-admin` : "";

  const branchId =
    typeof params.branchId === "string"
      ? params.branchId
      : "";

  const [branch, setBranch] =
    useState<Branch | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    async function loadBranch() {
      try {
        const response =
          await fetch(
            organizationId ? `/api/grossiste/branches?organizationId=${encodeURIComponent(organizationId)}` : "/api/grossiste/branches",
            {
              cache: "no-store",
            },
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.ok
        ) {
          throw new Error(
            "Chargement impossible.",
          );
        }

        const found =
          (data.branches ?? [])
            .find(
              (item: Branch) =>
                item.branchId ===
                branchId,
            );

        if (!found) {
          throw new Error(
            "Site introuvable.",
          );
        }

        setBranch(found);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Erreur de chargement.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (branchId) {
      void loadBranch();
    }
  }, [branchId]);

  function updateAddress(
    key:
      | "street"
      | "houseNumber"
      | "box"
      | "postalCode"
      | "city"
      | "country",
    value: string,
  ) {
    setBranch((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        address: {
          ...current.address,
          [key]: value,
        },
      };
    });
  }

  async function saveBranch() {
    if (!branch) {
      return;
    }

    if (!branch.name.trim()) {
      setMessage(
        "Le nom du site est obligatoire.",
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response =
        await fetch(
          "/api/grossiste/branches",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              branchId:
                branch.branchId,
              name:
                branch.name.trim(),
              phone:
                branch.phone ?? "",
              email:
                branch.email ?? "",
              status:
                branch.status,
              address: {
                street:
                  branch.address
                    ?.street ?? "",
                houseNumber:
                  branch.address
                    ?.houseNumber ?? "",
                box:
                  branch.address
                    ?.box ?? "",
                postalCode:
                  branch.address
                    ?.postalCode ?? "",
                city:
                  branch.address
                    ?.city ?? "",
                country:
                  branch.address
                    ?.country ?? "",
              },
            }),
          },
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.ok
      ) {
        throw new Error(
          data.error ||
            "Enregistrement impossible.",
        );
      }

      setMessage(
        "Site mis à jour.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Erreur d'enregistrement.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#061b31] px-6 py-10 text-white">
        Chargement...
      </main>
    );
  }

  if (!branch) {
    return (
      <main className="min-h-screen bg-[#061b31] px-6 py-10 text-white">
        <a
          href={`/grossiste/organisation${interventionQuery}`}
          className="font-bold text-blue-300"
        >
          ← Retour
        </a>

        <div className="mt-8 text-xl font-black">
          {message || "Site introuvable"}
        </div>
      </main>
    );
  }

  const activeCounters =
    (branch.counters ?? [])
      .filter(
        (item) =>
          item.status === "active",
      ).length;

  const activeTerminals =
    (branch.terminals ?? [])
      .filter(
        (item) =>
          item.status === "active",
      ).length;

  const activeStaff =
    (branch.staff ?? [])
      .filter(
        (item) =>
          item.status === "active",
      ).length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#061b31] via-[#08233d] to-[#0b3153] px-5 py-8 text-white lg:px-10">

      <div className="mx-auto max-w-6xl">

        <div className="pr-40">

          <a
            href={`/grossiste/organisation${interventionQuery}`}
            className="inline-flex rounded-xl border border-blue-300/30 bg-white/5 px-4 py-2 font-bold text-blue-100 transition hover:bg-white/10"
          >
            ← Retour
          </a>

          <div className="mt-6">

            <div className="text-sm font-black uppercase tracking-[0.18em] text-blue-300">
              Gestion du site
            </div>

            <h1 className="mt-1 text-3xl font-black lg:text-4xl">
              {branch.name}
            </h1>

            {branch.branchCode ? (
              <div className="mt-3">
                <span className="rounded-xl bg-cyan-400/15 px-4 py-2 text-sm font-black tracking-wider text-cyan-200">
                  Site {branch.branchCode}
                </span>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-3">

              <span className="rounded-xl bg-blue-500/20 px-4 py-2 font-black text-blue-200">
                {activeStaff} équipe
              </span>

              <span className="rounded-xl bg-cyan-500/20 px-4 py-2 font-black text-cyan-200">
                {activeCounters} comptoirs
              </span>

              <span className="rounded-xl bg-violet-500/20 px-4 py-2 font-black text-violet-200">
                {activeTerminals} bornes
              </span>

            </div>

          </div>

        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          <section className="rounded-3xl border border-blue-400/30 bg-blue-500/10 p-6 shadow-xl">

            <div className="text-sm font-black uppercase tracking-wider text-blue-300">
              Informations
            </div>

            <h2 className="mt-1 text-2xl font-black">
              Identité du site
            </h2>

            <label className="mt-5 block">
              <span className="text-sm font-bold text-blue-100">
                Nom du site
              </span>

              <input
                value={branch.name}
                onChange={(event) =>
                  setBranch({
                    ...branch,
                    name:
                      event.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border border-blue-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
              />
            </label>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">

              <label>
                <span className="text-sm font-bold text-blue-100">
                  Téléphone
                </span>

                <input
                  value={
                    branch.phone ?? ""
                  }
                  onChange={(event) =>
                    setBranch({
                      ...branch,
                      phone:
                        event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-blue-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
                />
              </label>

              <label>
                <span className="text-sm font-bold text-blue-100">
                  Email
                </span>

                <input
                  type="email"
                  value={
                    branch.email ?? ""
                  }
                  onChange={(event) =>
                    setBranch({
                      ...branch,
                      email:
                        event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-blue-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
                />
              </label>

            </div>

          </section>

          <section className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-6 shadow-xl">

            <div className="text-sm font-black uppercase tracking-wider text-cyan-300">
              Adresse
            </div>

            <h2 className="mt-1 text-2xl font-black">
              Localisation
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">

              <label className="sm:col-span-2">
                <span className="text-sm font-bold text-cyan-100">
                  Rue
                </span>

                <input
                  value={
                    branch.address
                      ?.street ?? ""
                  }
                  onChange={(event) =>
                    updateAddress(
                      "street",
                      event.target.value,
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-cyan-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
                />
              </label>

              <label>
                <span className="text-sm font-bold text-cyan-100">
                  Numéro
                </span>

                <input
                  value={
                    branch.address
                      ?.houseNumber ?? ""
                  }
                  onChange={(event) =>
                    updateAddress(
                      "houseNumber",
                      event.target.value,
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-cyan-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
                />
              </label>

            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">

              <label>
                <span className="text-sm font-bold text-cyan-100">
                  Boîte
                </span>

                <input
                  value={
                    branch.address
                      ?.box ?? ""
                  }
                  onChange={(event) =>
                    updateAddress(
                      "box",
                      event.target.value,
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-cyan-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
                />
              </label>

              <label>
                <span className="text-sm font-bold text-cyan-100">
                  Code postal
                </span>

                <input
                  value={
                    branch.address
                      ?.postalCode ?? ""
                  }
                  onChange={(event) =>
                    updateAddress(
                      "postalCode",
                      event.target.value,
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-cyan-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
                />
              </label>

              <label>
                <span className="text-sm font-bold text-cyan-100">
                  Ville
                </span>

                <input
                  value={
                    branch.address
                      ?.city ?? ""
                  }
                  onChange={(event) =>
                    updateAddress(
                      "city",
                      event.target.value,
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-cyan-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
                />
              </label>

            </div>

            <label className="mt-4 block">
              <span className="text-sm font-bold text-cyan-100">
                Pays
              </span>

              <input
                value={
                  branch.address
                    ?.country ?? ""
                }
                onChange={(event) =>
                  updateAddress(
                    "country",
                    event.target.value,
                  )
                }
                className="mt-2 w-full rounded-xl border border-cyan-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
              />
            </label>

          </section>

        </div>

        <section className="mt-6 rounded-3xl border border-violet-400/30 bg-violet-500/10 p-6">

          <div className="text-sm font-black uppercase tracking-wider text-violet-300">
            Gestion opérationnelle
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">

            <a
              href={`/grossiste/sites/${branch.branchId}/equipe/nouveau${interventionQuery}`}
              className="rounded-2xl border border-cyan-400/40 bg-cyan-500/10 p-5 transition hover:bg-cyan-500/20"
            >
              <div className="text-lg font-black">
                Équipe
              </div>

              <div className="mt-1 text-sm text-cyan-100">
                Ajouter un membre du personnel
              </div>
            </a>

            <a
              href={`/grossiste/sites/${branch.branchId}/comptoirs${interventionQuery}`}
              className="rounded-2xl border border-blue-400/40 bg-blue-500/10 p-5 transition hover:bg-blue-500/20"
            >
              <div className="text-lg font-black">
                Comptoirs
              </div>

              <div className="mt-1 text-sm text-blue-200">
                {activeCounters} actif(s)
              </div>

              <div className="mt-3 text-xs font-black text-blue-300">
                Gérer les comptoirs →
              </div>
            </a>

            <a
              href={`/grossiste/sites/${branch.branchId}/bornes${interventionQuery}`}
              className="rounded-2xl border border-violet-400/40 bg-violet-500/10 p-5 transition hover:bg-violet-500/20"
            >
              <div className="text-lg font-black">
                Bornes
              </div>

              <div className="mt-1 text-sm text-violet-200">
                {activeTerminals} active(s)
              </div>

              <div className="mt-3 text-xs font-black text-violet-300">
                Gérer les bornes →
              </div>
            </a>

          </div>

        </section>

        <section className="mt-6 rounded-3xl border border-amber-400/30 bg-amber-500/10 p-6">

          <div className="text-sm font-black uppercase tracking-wider text-amber-300">
            Statut du site
          </div>

          <select
            value={branch.status}
            onChange={(event) =>
              setBranch({
                ...branch,
                status:
                  event.target.value as
                    | "active"
                    | "disabled",
              })
            }
            className="mt-4 w-full rounded-xl border border-amber-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
          >
            <option value="active">
              Actif
            </option>

            <option value="disabled">
              Inactif
            </option>
          </select>

        </section>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-5">

          <div className="font-bold text-emerald-300">
            {message}
          </div>

          <button
            type="button"
            onClick={saveBranch}
            disabled={saving}
            className="rounded-xl bg-blue-600 px-7 py-3 font-black text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {saving
              ? "Enregistrement..."
              : "Enregistrer"}
          </button>

        </div>

      </div>
    </main>
  );
}