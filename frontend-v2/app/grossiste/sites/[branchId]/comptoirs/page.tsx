"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

type Counter = {
  counterId: string;
  number: number;
  name?: string;
  status: "active" | "disabled";
};

type Branch = {
  branchId: string;
  name: string;
  counters?: Counter[];
};

export default function GrossisteCountersPage() {
  const params = useParams();

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

  const [number, setNumber] =
    useState("");

  const [name, setName] =
    useState("");

  const loadBranch =
    useCallback(async () => {
      setLoading(true);

      try {
        const response =
          await fetch(
            "/api/grossiste/branches",
            {
              cache: "no-store",
            },
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ??
              "Chargement impossible.",
          );
        }

        const found =
          (data.branches ?? []).find(
            (item: Branch) =>
              item.branchId ===
              branchId,
          );

        setBranch(found ?? null);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Erreur de chargement.",
        );
      } finally {
        setLoading(false);
      }
    }, [branchId]);

  useEffect(() => {
    void loadBranch();
  }, [loadBranch]);

  async function createCounter() {
    const parsedNumber =
      Number(number);

    if (
      !Number.isInteger(parsedNumber) ||
      parsedNumber <= 0
    ) {
      setMessage(
        "Indique un numéro de comptoir valide.",
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response =
        await fetch(
          "/api/grossiste/branches/counters",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              branchId,
              number: parsedNumber,
              name,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ??
            "Création impossible.",
        );
      }

      setNumber("");
      setName("");
      setMessage(
        "Comptoir créé.",
      );

      await loadBranch();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Erreur.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateCounter(
    counter: Counter,
    changes: Partial<Counter>,
  ) {
    setSaving(true);
    setMessage("");

    try {
      const response =
        await fetch(
          "/api/grossiste/branches/counters",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              branchId,
              counterId:
                counter.counterId,
              number:
                changes.number ??
                counter.number,
              name:
                changes.name ??
                counter.name ??
                "",
              status:
                changes.status ??
                counter.status,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ??
            "Modification impossible.",
        );
      }

      setMessage(
        "Comptoir mis à jour.",
      );

      await loadBranch();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Erreur.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#061d35] p-8 text-white">
        Chargement...
      </main>
    );
  }

  if (!branch) {
    return (
      <main className="min-h-screen bg-[#061d35] p-8 text-white">
        Site introuvable.
      </main>
    );
  }

  const counters =
    [...(branch.counters ?? [])]
      .sort(
        (a, b) =>
          a.number - b.number,
      );

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#061b31] via-[#08233d] to-[#0b3153] px-5 py-8 text-white lg:px-10">
      <div className="mx-auto max-w-5xl">

        <div className="pr-40">
          <a
            href={`/grossiste/sites/${branch.branchId}`}
            className="inline-flex rounded-xl border border-blue-300/30 bg-white/5 px-4 py-2 font-bold text-blue-100 transition hover:bg-white/10"
          >
            ← Retour au site
          </a>

          <div className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-blue-300">
            Gestion des comptoirs
          </div>

          <h1 className="mt-1 text-3xl font-black lg:text-4xl">
            {branch.name}
          </h1>
        </div>

        <section className="mt-8 rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-6">
          <h2 className="text-xl font-black">
            Ajouter un comptoir
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-[180px_1fr_auto]">
            <label>
              <span className="text-sm font-bold text-cyan-100">
                Numéro
              </span>

              <input
                type="number"
                min="1"
                value={number}
                onChange={(event) =>
                  setNumber(
                    event.target.value,
                  )
                }
                placeholder="1"
                className="mt-2 w-full rounded-xl border border-cyan-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
              />
            </label>

            <label>
              <span className="text-sm font-bold text-cyan-100">
                Nom
              </span>

              <input
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                placeholder="Ex. Comptoir principal"
                className="mt-2 w-full rounded-xl border border-cyan-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
              />
            </label>

            <button
              type="button"
              onClick={createCounter}
              disabled={saving}
              className="self-end rounded-xl bg-cyan-500 px-6 py-3 font-black text-[#05213a] transition hover:bg-cyan-400 disabled:opacity-50"
            >
              + Ajouter
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-blue-400/30 bg-blue-500/10 p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black">
              Comptoirs du site
            </h2>

            <div className="rounded-xl bg-white/10 px-3 py-2 text-sm font-black">
              {counters.length} total
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {counters.map(
              (counter) => (
                <div
                  key={counter.counterId}
                  className="grid gap-3 rounded-2xl border border-white/10 bg-black/15 p-4 md:grid-cols-[90px_1fr_150px]"
                >
                  <div className="flex h-12 items-center justify-center rounded-xl bg-blue-500/20 text-xl font-black text-blue-200">
                    #{counter.number}
                  </div>

                  <input
                    value={
                      counter.name ?? ""
                    }
                    onChange={(event) => {
                      const nextName =
                        event.target.value;

                      setBranch({
                        ...branch,
                        counters:
                          (
                            branch.counters ??
                            []
                          ).map(
                            (item) =>
                              item.counterId ===
                              counter.counterId
                                ? {
                                    ...item,
                                    name:
                                      nextName,
                                  }
                                : item,
                          ),
                      });
                    }}
                    onBlur={() =>
                      void updateCounter(
                        counter,
                        {
                          name:
                            (
                              branch.counters ??
                              []
                            ).find(
                              (item) =>
                                item.counterId ===
                                counter.counterId,
                            )?.name ??
                            "",
                        },
                      )
                    }
                    className="rounded-xl border border-blue-300/20 bg-[#071d31] px-4 py-3 font-bold text-white"
                  />

                  <select
                    value={
                      counter.status
                    }
                    onChange={(event) =>
                      void updateCounter(
                        counter,
                        {
                          status:
                            event.target
                              .value as
                              | "active"
                              | "disabled",
                        },
                      )
                    }
                    className="rounded-xl border border-blue-300/20 bg-[#071d31] px-4 py-3 font-black text-white"
                  >
                    <option value="active">
                      Actif
                    </option>
                    <option value="disabled">
                      Inactif
                    </option>
                  </select>
                </div>
              ),
            )}

            {!counters.length ? (
              <div className="rounded-2xl border border-dashed border-blue-300/30 p-8 text-center text-blue-200">
                Aucun comptoir configuré.
              </div>
            ) : null}
          </div>
        </section>

        {message ? (
          <div className="mt-5 rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-bold text-emerald-300">
            {message}
          </div>
        ) : null}

      </div>
    </main>
  );
}