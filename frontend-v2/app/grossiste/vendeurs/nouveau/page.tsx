"use client";

import {
  useEffect,
  useState,
} from "react";

type Branch = {
  branchId: string;
  name: string;
  status: "active" | "disabled";
};

type Capabilities = {
  generalAdvice: boolean;
  partsOrder: boolean;
  quickPurchase: boolean;
  pickup: boolean;
  merchandiseReturn: boolean;
  refund: boolean;
  diagnostic: boolean;
  professionalCustomer: boolean;
};

type Permissions = {
  manualTicketSelection: boolean;
  viewFullQueue: boolean;
  counterSupervisor: boolean;
      deputySupervisor: boolean;
};

const capabilityLabels: Array<
  [keyof Capabilities, string]
> = [
  ["generalAdvice", "Conseil client"],
  ["partsOrder", "Commande de pièces"],
  ["quickPurchase", "Achat rapide"],
  ["pickup", "Retrait commande"],
  ["merchandiseReturn", "Retour marchandise"],
  ["refund", "Remboursement"],
  ["diagnostic", "Diagnostic"],
  ["professionalCustomer", "Client professionnel"],
];

const permissionLabels: Array<
  [keyof Permissions, string]
> = [
  [
    "manualTicketSelection",
    "Choisir manuellement un ticket",
  ],
  [
    "viewFullQueue",
    "Voir toute la file d'attente",
  ],
  [
    "counterSupervisor",
    "Responsable / superviseur",
  ],
];

const defaultCapabilities: Capabilities = {
  generalAdvice: true,
  partsOrder: true,
  quickPurchase: true,
  pickup: false,
  merchandiseReturn: false,
  refund: false,
  diagnostic: true,
  professionalCustomer: false,
};

const defaultPermissions: Permissions = {
  manualTicketSelection: false,
  viewFullQueue: false,
  counterSupervisor: false,
        deputySupervisor: false,
};

export default function NewSellerPage() {
  const [branches, setBranches] =
    useState<Branch[]>([]);

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [primaryBranchId, setPrimaryBranchId] =
    useState("");

  const [allowedBranchIds, setAllowedBranchIds] =
    useState<string[]>([]);

  const [capabilities, setCapabilities] =
    useState<Capabilities>({
      ...defaultCapabilities,
    });

  const [permissions, setPermissions] =
    useState<Permissions>({
      ...defaultPermissions,
    });

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [created, setCreated] =
    useState<{
      customerId: string;
      userCode: string;
      loginEmail: string;
      temporaryPassword: string;
    } | null>(null);

  useEffect(() => {
    async function loadBranches() {
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

        if (
          response.ok &&
          data.ok
        ) {
          setBranches(
            (data.branches ?? [])
              .filter(
                (branch: Branch) =>
                  branch.status ===
                  "active",
              ),
          );
        }
      } catch {
        setMessage(
          "Impossible de charger les sites.",
        );
      }
    }

    void loadBranches();
  }, []);

  function changePrimaryBranch(
    branchId: string,
  ) {
    setPrimaryBranchId(branchId);

    if (
      branchId &&
      !allowedBranchIds.includes(
        branchId,
      )
    ) {
      setAllowedBranchIds(
        (current) => [
          ...current,
          branchId,
        ],
      );
    }
  }

  function toggleBranch(
    branchId: string,
  ) {
    setAllowedBranchIds(
      (current) => {
        if (
          current.includes(
            branchId,
          )
        ) {
          if (
            branchId ===
            primaryBranchId
          ) {
            return current;
          }

          return current.filter(
            (id) =>
              id !== branchId,
          );
        }

        return [
          ...current,
          branchId,
        ];
      },
    );
  }

  function toggleCapability(
    key: keyof Capabilities,
  ) {
    setCapabilities(
      (current) => ({
        ...current,
        [key]:
          !current[key],
      }),
    );
  }

  function togglePermission(
    key: keyof Permissions,
  ) {
    setPermissions(
      (current) => ({
        ...current,
        [key]:
          !current[key],
      }),
    );
  }

  async function createSeller() {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !phone.trim()
    ) {
      setMessage(
        "Nom, prénom, email et téléphone sont obligatoires.",
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const createResponse =
        await fetch(
          "/api/grossiste/sellers",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              firstName:
                firstName.trim(),
              lastName:
                lastName.trim(),
              email:
                email.trim(),
              phone:
                phone.trim(),
            }),
          },
        );

      const createData =
        await createResponse.json();

      if (
        !createResponse.ok ||
        !createData.ok
      ) {
        const error =
          createData.error;

        if (
          error ===
          "EMAIL_ALREADY_EXISTS"
        ) {
          throw new Error(
            "Cet email est déjà utilisé.",
          );
        }

        if (
          error ===
          "PHONE_ALREADY_EXISTS"
        ) {
          throw new Error(
            "Ce numéro de téléphone est déjà utilisé.",
          );
        }

        throw new Error(
          error ||
            "Création impossible.",
        );
      }

      const customerId =
        createData.seller.customerId;

      const patchResponse =
        await fetch(
          "/api/grossiste/sellers",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              customerId,
              sellerBranchAssignment: {
                primaryBranchId:
                  primaryBranchId ||
                  undefined,
                allowedBranchIds,
              },
              sellerCounterSettings: {
                capabilities,
                permissions,
              },
            }),
          },
        );

      const patchData =
        await patchResponse.json();

      if (
        !patchResponse.ok ||
        !patchData.ok
      ) {
        throw new Error(
          "Vendeur créé, mais affectation incomplète. Ouvre sa fiche pour terminer.",
        );
      }

      setCreated({
        customerId,
        userCode:
          createData.seller.userCode,
        loginEmail:
          createData.seller.loginEmail,
        temporaryPassword:
          createData.temporaryPassword,
      });

      setMessage(
        "Vendeur créé avec succès.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Erreur de création.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (created) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#061b31] via-[#08233d] to-[#0b3153] px-5 py-8 text-white lg:px-10">
        <div className="mx-auto max-w-4xl">

          <div className="pr-40">
            <a
              href="/grossiste/organisation"
              className="inline-flex rounded-xl border border-blue-300/30 bg-white/5 px-4 py-2 font-bold text-blue-100 transition hover:bg-white/10"
            >
              ← Organisation
            </a>
          </div>

          <section className="mt-8 rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-7 shadow-xl">

            <div className="text-sm font-black uppercase tracking-[0.18em] text-emerald-300">
              Création réussie
            </div>

            <h1 className="mt-2 text-3xl font-black">
              {firstName} {lastName}
            </h1>

            <p className="mt-2 text-emerald-100">
              Le compte vendeur est actif.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">

              <div className="rounded-2xl bg-black/20 p-5">
                <div className="text-xs font-bold uppercase text-emerald-300">
                  Code vendeur
                </div>
                <div className="mt-2 text-2xl font-black">
                  {created.userCode}
                </div>
              </div>

              <div className="rounded-2xl bg-black/20 p-5">
                <div className="text-xs font-bold uppercase text-emerald-300">
                  Email
                </div>
                <div className="mt-2 break-all font-black">
                  {created.loginEmail}
                </div>
              </div>

            </div>

            <div className="mt-4 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-5">

              <div className="text-xs font-black uppercase tracking-wider text-amber-300">
                Mot de passe temporaire
              </div>

              <div className="mt-2 break-all font-mono text-xl font-black text-white">
                {created.temporaryPassword}
              </div>

              <div className="mt-3 text-sm font-semibold text-amber-100">
                À transmettre au vendeur de manière sécurisée.
              </div>

            </div>

            <div className="mt-7 flex flex-wrap gap-3">

              <a
                href={`/grossiste/vendeurs/${created.customerId}`}
                className="rounded-xl bg-blue-600 px-6 py-3 font-black text-white transition hover:bg-blue-500"
              >
                Ouvrir la fiche vendeur
              </a>

              <a
                href="/grossiste/organisation"
                className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-black text-white transition hover:bg-white/10"
              >
                Retour Organisation
              </a>

            </div>

          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#061b31] via-[#08233d] to-[#0b3153] px-5 py-8 text-white lg:px-10">

      <div className="mx-auto max-w-6xl">

        <div className="pr-40">

          <a
            href="/grossiste/organisation"
            className="inline-flex rounded-xl border border-blue-300/30 bg-white/5 px-4 py-2 font-bold text-blue-100 transition hover:bg-white/10"
          >
            ← Organisation
          </a>

          <div className="mt-6">
            <div className="text-sm font-black uppercase tracking-[0.18em] text-blue-300">
              Nouveau vendeur
            </div>

            <h1 className="mt-1 text-3xl font-black lg:text-4xl">
              Créer une fiche vendeur
            </h1>

            <p className="mt-2 text-blue-200">
              Identité, sites, compétences et autorisations.
            </p>
          </div>

        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          <section className="rounded-3xl border border-blue-400/30 bg-blue-500/10 p-6 shadow-xl">

            <div className="text-sm font-black uppercase tracking-wider text-blue-300">
              Identité
            </div>

            <h2 className="mt-1 text-2xl font-black">
              Informations vendeur
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              <label className="block">
                <span className="text-sm font-bold text-blue-200">
                  Prénom
                </span>
                <input
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(
                      event.target.value,
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-blue-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-blue-200">
                  Nom
                </span>
                <input
                  value={lastName}
                  onChange={(event) =>
                    setLastName(
                      event.target.value,
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-blue-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
                />
              </label>

            </div>

            <label className="mt-4 block">
              <span className="text-sm font-bold text-blue-200">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
                className="mt-2 w-full rounded-xl border border-blue-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-bold text-blue-200">
                Téléphone
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(
                    event.target.value,
                  )
                }
                className="mt-2 w-full rounded-xl border border-blue-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
              />
            </label>

          </section>

          <section className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-6 shadow-xl">

            <div className="text-sm font-black uppercase tracking-wider text-emerald-300">
              Affectation
            </div>

            <h2 className="mt-1 text-2xl font-black">
              Sites
            </h2>

            <label className="mt-5 block text-sm font-bold text-emerald-200">
              Site principal
            </label>

            <select
              value={primaryBranchId}
              onChange={(event) =>
                changePrimaryBranch(
                  event.target.value,
                )
              }
              className="mt-2 w-full rounded-xl border border-emerald-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
            >
              <option value="">
                Aucun site principal
              </option>

              {branches.map(
                (branch) => (
                  <option
                    key={branch.branchId}
                    value={branch.branchId}
                  >
                    {branch.name}
                  </option>
                ),
              )}
            </select>

            <div className="mt-5 space-y-2">

              {branches.map(
                (branch) => {
                  const checked =
                    allowedBranchIds.includes(
                      branch.branchId,
                    );

                  const primary =
                    primaryBranchId ===
                    branch.branchId;

                  return (
                    <label
                      key={branch.branchId}
                      className="flex cursor-pointer items-center justify-between rounded-xl bg-black/15 px-4 py-3"
                    >
                      <span className="font-bold">
                        {branch.name}
                        {primary
                          ? " — Principal"
                          : ""}
                      </span>

                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          toggleBranch(
                            branch.branchId,
                          )
                        }
                        className="h-5 w-5 accent-emerald-500"
                      />
                    </label>
                  );
                },
              )}

            </div>

          </section>

          <section className="rounded-3xl border border-violet-400/30 bg-violet-500/10 p-6 shadow-xl">

            <div className="text-sm font-black uppercase tracking-wider text-violet-300">
              Compétences
            </div>

            <h2 className="mt-1 text-2xl font-black">
              Services autorisés
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">

              {capabilityLabels.map(
                ([key, label]) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center justify-between rounded-xl bg-black/15 px-4 py-3"
                  >
                    <span className="font-bold">
                      {label}
                    </span>

                    <input
                      type="checkbox"
                      checked={
                        capabilities[key]
                      }
                      onChange={() =>
                        toggleCapability(key)
                      }
                      className="h-5 w-5 accent-violet-500"
                    />
                  </label>
                ),
              )}

            </div>

          </section>

          <section className="rounded-3xl border border-amber-400/30 bg-amber-500/10 p-6 shadow-xl">

            <div className="text-sm font-black uppercase tracking-wider text-amber-300">
              Autorisations
            </div>

            <h2 className="mt-1 text-2xl font-black">
              Responsabilités
            </h2>

            <div className="mt-5 space-y-3">

              {permissionLabels.map(
                ([key, label]) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center justify-between rounded-xl bg-black/15 px-4 py-3"
                  >
                    <span className="font-bold">
                      {label}
                    </span>

                    <input
                      type="checkbox"
                      checked={
                        permissions[key]
                      }
                      onChange={() =>
                        togglePermission(key)
                      }
                      className="h-5 w-5 accent-amber-500"
                    />
                  </label>
                ),
              )}

            </div>

          </section>

        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-5">

          <div
            className={
              message
                ? "font-bold text-amber-200"
                : "font-bold text-blue-200"
            }
          >
            {message ||
              "Le code vendeur sera généré automatiquement."}
          </div>

          <button
            type="button"
            onClick={createSeller}
            disabled={saving}
            className="rounded-xl bg-blue-600 px-7 py-3 font-black text-white shadow-lg transition hover:bg-blue-500 disabled:opacity-50"
          >
            {saving
              ? "Création..."
              : "Créer le vendeur"}
          </button>

        </div>

      </div>
    </main>
  );
}