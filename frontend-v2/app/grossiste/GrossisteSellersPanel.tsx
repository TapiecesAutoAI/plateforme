"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

type Seller = {
  customerId: string;
  loginEmail: string;
  status: "active" | "disabled";
  createdAt: string;
  lastLoginAt?: string;
  sellerBranchAssignment: {
    primaryBranchId?: string;
    allowedBranchIds: string[];
  };

  sellerCounterSettings: {
    capabilities: {
      generalAdvice: boolean;
      partsOrder: boolean;
      quickPurchase: boolean;
      pickup: boolean;
      merchandiseReturn: boolean;
      refund: boolean;
      diagnostic: boolean;
      professionalCustomer: boolean;
    };
    permissions: {
      manualTicketSelection: boolean;
      viewFullQueue: boolean;
      counterSupervisor: boolean;
      deputySupervisor: boolean;
    };
  };
};

type Branch = {
  branchId: string;
  name: string;
  status: "active" | "disabled";
};

type BranchesResponse = {
  ok: boolean;
  branches?: Branch[];
};

type SellersResponse = {
  ok: boolean;
  sellers?: Seller[];
};

type CreateSellerResponse = {
  ok: boolean;
  temporaryPassword?: string;
  seller?: {
    customerId: string;
    loginEmail: string;
    organizationId: string;
    role: "seller";
  };
  error?: string;
};

export default function GrossisteSellersPanel() {
  const [sellers, setSellers] =
    useState<Seller[]>([]);

  const [branches, setBranches] =
    useState<Branch[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [open, setOpen] =
    useState(false);

  const [error, setError] =
    useState("");

  const [temporaryPassword, setTemporaryPassword] =
    useState("");

  const [createdEmail, setCreatedEmail] =
    useState("");

  const [editingSellerId, setEditingSellerId] =
    useState<string | null>(null);

  const [savingSettingsId, setSavingSettingsId] =
    useState<string | null>(null);

  const [resetPasswordSellerId, setResetPasswordSellerId] =
    useState<string | null>(null);

  const [resetPassword, setResetPassword] =
    useState("");

  const [resetPasswordConfirm, setResetPasswordConfirm] =
    useState("");

  const [resetPasswordSaving, setResetPasswordSaving] =
    useState(false);

  const [resetPasswordMessage, setResetPasswordMessage] =
    useState("");

  function toggleSellerSetting(
    customerId: string,
    group: "capabilities" | "permissions",
    key: string,
  ) {
    setSellers((current) =>
      current.map((seller) => {
        if (seller.customerId !== customerId) {
          return seller;
        }

        return {
          ...seller,
          sellerCounterSettings: {
            ...seller.sellerCounterSettings,
            [group]: {
              ...seller.sellerCounterSettings[group],
              [key]:
                !seller.sellerCounterSettings[group][
                  key as keyof typeof seller.sellerCounterSettings[
                    typeof group
                  ]
                ],
            },
          },
        };
      }),
    );
  }

  function setPrimaryBranch(
    customerId: string,
    branchId: string,
  ) {
    setSellers((current) =>
      current.map((seller) => {
        if (seller.customerId !== customerId) {
          return seller;
        }

        const allowedBranchIds =
          branchId
            ? Array.from(
                new Set([
                  ...seller.sellerBranchAssignment.allowedBranchIds,
                  branchId,
                ]),
              )
            : seller.sellerBranchAssignment.allowedBranchIds;

        return {
          ...seller,
          sellerBranchAssignment: {
            primaryBranchId:
              branchId || undefined,
            allowedBranchIds,
          },
        };
      }),
    );
  }

  function toggleAllowedBranch(
    customerId: string,
    branchId: string,
  ) {
    setSellers((current) =>
      current.map((seller) => {
        if (seller.customerId !== customerId) {
          return seller;
        }

        const assignment =
          seller.sellerBranchAssignment;

        const exists =
          assignment.allowedBranchIds.includes(
            branchId,
          );

        if (
          exists &&
          assignment.primaryBranchId === branchId
        ) {
          return seller;
        }

        return {
          ...seller,
          sellerBranchAssignment: {
            ...assignment,
            allowedBranchIds: exists
              ? assignment.allowedBranchIds.filter(
                  (id) => id !== branchId,
                )
              : [
                  ...assignment.allowedBranchIds,
                  branchId,
                ],
          },
        };
      }),
    );
  }
  async function resetSellerPassword(
    customerId: string,
  ) {
    setResetPasswordMessage("");
    setError("");

    if (resetPassword.length < 8) {
      setResetPasswordMessage(
        "Le mot de passe doit contenir au moins 8 caractères.",
      );
      return;
    }

    if (resetPassword !== resetPasswordConfirm) {
      setResetPasswordMessage(
        "Les deux mots de passe ne correspondent pas.",
      );
      return;
    }

    setResetPasswordSaving(true);

    try {
      const response =
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
              newPassword:
                resetPassword,
            }),
          },
        );

      const data =
        await response.json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error === "PASSWORD_TOO_SHORT"
            ? "Mot de passe trop court."
            : "Réinitialisation impossible.",
        );
      }

      setResetPassword("");
      setResetPasswordConfirm("");
      setResetPasswordSellerId(null);
      setResetPasswordMessage("");

      alert(
        "Mot de passe réinitialisé avec succès.",
      );
    } catch (resetError) {
      setResetPasswordMessage(
        resetError instanceof Error
          ? resetError.message
          : "Réinitialisation impossible.",
      );
    } finally {
      setResetPasswordSaving(false);
    }
  }

  async function saveSellerSettings(
    seller: Seller,
  ) {
    setSavingSettingsId(
      seller.customerId,
    );
    setError("");

    try {
      const response =
        await fetch(
          "/api/grossiste/sellers",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              customerId:
                seller.customerId,
              sellerCounterSettings:
                seller.sellerCounterSettings,
              sellerBranchAssignment:
                seller.sellerBranchAssignment,
            }),
          },
        );

      if (!response.ok) {
        throw new Error(
          "Enregistrement des compétences impossible.",
        );
      }

      await loadSellers();

      setEditingSellerId(null);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Enregistrement impossible.",
      );
    } finally {
      setSavingSettingsId(null);
    }
  }

  const loadBranches =
    useCallback(async () => {
      try {
        const response =
          await fetch(
            "/api/grossiste/branches",
            {
              method: "GET",
              cache: "no-store",
            },
          );

        if (!response.ok) {
          throw new Error(
            "Impossible de charger les sites.",
          );
        }

        const data =
          await response.json() as BranchesResponse;

        setBranches(
          (data.branches ?? []).filter(
            (branch) =>
              branch.status === "active",
          ),
        );
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Chargement des sites impossible.",
        );
      }
    }, []);
  const loadSellers =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await fetch(
            "/api/grossiste/sellers",
            {
              method: "GET",
              cache: "no-store",
            },
          );

        if (!response.ok) {
          throw new Error(
            "Impossible de charger les vendeurs.",
          );
        }

        const data =
          (await response.json()) as SellersResponse;

        setSellers(
          Array.isArray(data.sellers)
            ? data.sellers
            : [],
        );
      } catch {
        setError(
          "Impossible de charger les vendeurs.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadSellers();
    void loadBranches();
  }, [loadSellers]);

  async function submitSeller(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setTemporaryPassword("");
    setCreatedEmail("");

    const formElement =
      event.currentTarget;

    const form =
      new FormData(
        formElement,
      );

    const payload = {
      firstName:
        String(
          form.get("firstName") ?? "",
        ).trim(),

      lastName:
        String(
          form.get("lastName") ?? "",
        ).trim(),

      email:
        String(
          form.get("email") ?? "",
        ).trim(),

      phone:
        String(
          form.get("phone") ?? "",
        ).trim(),
    };

    try {
      const response =
        await fetch(
          "/api/grossiste/sellers",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload,
              ),
          },
        );

      const data =
        (await response.json()) as CreateSellerResponse;

      if (!response.ok) {
        if (
          data.error ===
          "EMAIL_ALREADY_EXISTS"
        ) {
          throw new Error(
            "Cette adresse e-mail est déjà utilisée.",
          );
        }

        if (
          data.error ===
          "PHONE_ALREADY_EXISTS"
        ) {
          throw new Error(
            "Ce numéro de téléphone est déjà utilisé.",
          );
        }

        throw new Error(
          "Création du vendeur impossible.",
        );
      }

      setTemporaryPassword(
        data.temporaryPassword ?? "",
      );

      setCreatedEmail(
        data.seller?.loginEmail ??
          payload.email,
      );

      formElement.reset();

      await loadSellers();

    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Création du vendeur impossible.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-8 rounded-3xl border border-blue-300/20 bg-blue-950/25 p-5 sm:p-6">

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-blue-200">
            Personnel
          </p>

          <h3 className="mt-1 text-xl font-black">
            <span id="vendeurs">Mes vendeurs</span>
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black">
            {sellers.length}
          </span>

          <button
            type="button"
            onClick={() =>
              setOpen(
                (value) => !value,
              )
            }
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white transition hover:bg-blue-500"
          >
            {open
              ? "Fermer"
              : "+ Nouveau vendeur"}
          </button>
        </div>
      </div>

      {open ? (
        <form
          onSubmit={submitSeller}
          className="mt-5 rounded-2xl border border-blue-300/20 bg-slate-950/35 p-5"
        >
          <div className="grid gap-4 md:grid-cols-2">

            <label className="text-sm font-bold text-blue-100">
              Prénom

              <input
                name="firstName"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-blue-400"
              />
            </label>

            <label className="text-sm font-bold text-blue-100">
              Nom

              <input
                name="lastName"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-blue-400"
              />
            </label>

            <label className="text-sm font-bold text-blue-100">
              E-mail

              <input
                name="email"
                type="email"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-blue-400"
              />
            </label>

            <label className="text-sm font-bold text-blue-100">
              Téléphone

              <input
                name="phone"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-blue-400"
              />
            </label>

          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-black text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {saving
              ? "Création..."
              : "Créer le vendeur"}
          </button>
        </form>
      ) : null}

      {temporaryPassword ? (
        <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-500/10 p-5">
          <p className="font-black text-amber-100">
            Vendeur créé
          </p>

          <p className="mt-3 text-sm text-amber-50">
            Login :{" "}
            <strong>
              {createdEmail}
            </strong>
          </p>

          <p className="mt-2 text-sm text-amber-50">
            Mot de passe temporaire :
          </p>

          <div className="mt-2 break-all rounded-xl bg-slate-950/60 px-4 py-3 font-mono font-black text-white">
            {temporaryPassword}
          </div>

          <p className="mt-3 text-xs text-amber-100">
            À transmettre au vendeur. Ce mot de passe n'est affiché ici qu'après sa création.
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="mt-5 text-sm text-blue-100">
          Chargement des vendeurs...
        </p>
      ) : sellers.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/30 p-5 text-blue-100">
          Aucun vendeur pour le moment.
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sellers.map(
            (seller) => (
              <div
                key={
                  seller.customerId
                }
                className="rounded-2xl border border-white/10 bg-slate-950/30 p-5"
              >
                <div className="flex items-start justify-between gap-3">

                  <p className="break-all font-black">
                    {seller.loginEmail}
                  </p>

                  <span className="text-xs font-bold text-blue-200">
                    {seller.status ===
                    "active"
                      ? "ACTIF"
                      : "DÉSACTIVÉ"}
                  </span>

                </div>

                <p className="mt-3 text-xs text-blue-200">
                  {seller.customerId}
                </p>

                <p className="mt-3 text-sm text-blue-100">
                  Dernière connexion :{" "}
                  {seller.lastLoginAt
                    ? new Date(
                        seller.lastLoginAt,
                      ).toLocaleString(
                        "fr-BE",
                      )
                    : "Jamais"}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setEditingSellerId(
                      editingSellerId === seller.customerId
                        ? null
                        : seller.customerId,
                    )
                  }
                  className="mt-4 w-full rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-black text-blue-100 transition hover:bg-blue-500/20"
                >
                  Compétences & autorisations
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (resetPasswordSellerId === seller.customerId) {
                      setResetPasswordSellerId(null);
                      setResetPassword("");
                      setResetPasswordConfirm("");
                      setResetPasswordMessage("");
                    } else {
                      setResetPasswordSellerId(seller.customerId);
                      setResetPassword("");
                      setResetPasswordConfirm("");
                      setResetPasswordMessage("");
                    }
                  }}
                  className="mt-2 w-full rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-sm font-black text-amber-100 transition hover:bg-amber-500/20"
                >
                  Réinitialiser le mot de passe
                </button>

                {resetPasswordSellerId === seller.customerId ? (
                  <div className="mt-3 rounded-xl border border-amber-400/20 bg-slate-950/50 p-4">
                    <p className="text-sm font-black text-white">
                      Nouveau mot de passe
                    </p>

                    <input
                      type="password"
                      value={resetPassword}
                      onChange={(event) =>
                        setResetPassword(event.target.value)
                      }
                      autoComplete="new-password"
                      placeholder="Minimum 8 caractères"
                      className="mt-3 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none focus:border-amber-400/50"
                    />

                    <input
                      type="password"
                      value={resetPasswordConfirm}
                      onChange={(event) =>
                        setResetPasswordConfirm(event.target.value)
                      }
                      autoComplete="new-password"
                      placeholder="Confirmer le mot de passe"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none focus:border-amber-400/50"
                    />

                    {resetPasswordMessage ? (
                      <p className="mt-2 text-sm font-bold text-red-300">
                        {resetPasswordMessage}
                      </p>
                    ) : null}

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        disabled={resetPasswordSaving}
                        onClick={() =>
                          void resetSellerPassword(seller.customerId)
                        }
                        className="flex-1 rounded-xl bg-amber-500 px-3 py-2 text-sm font-black text-slate-950 transition hover:bg-amber-400 disabled:opacity-50"
                      >
                        {resetPasswordSaving
                          ? "Réinitialisation..."
                          : "Confirmer"}
                      </button>

                      <button
                        type="button"
                        disabled={resetPasswordSaving}
                        onClick={() => {
                          setResetPasswordSellerId(null);
                          setResetPassword("");
                          setResetPasswordConfirm("");
                          setResetPasswordMessage("");
                        }}
                        className="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold text-blue-100"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : null}

                {editingSellerId === seller.customerId ? (
                  <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/50 p-4">

                    <p className="text-sm font-black text-white">
                      Affectation aux sites
                    </p>

                    {!branches.length ? (
                      <p className="mt-3 text-sm text-blue-200">
                        Aucun site actif configuré.
                      </p>
                    ) : (
                      <>
                        <label className="mt-3 block text-sm text-blue-100">
                          <span className="font-bold">
                            Site principal
                          </span>

                          <select
                            value={
                              seller.sellerBranchAssignment.primaryBranchId ??
                              ""
                            }
                            onChange={(event) =>
                              setPrimaryBranch(
                                seller.customerId,
                                event.target.value,
                              )
                            }
                            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white"
                          >
                            <option value="">
                              Aucun site principal
                            </option>

                            {branches.map((branch) => (
                              <option
                                key={branch.branchId}
                                value={branch.branchId}
                              >
                                {branch.name}
                              </option>
                            ))}
                          </select>
                        </label>

                        <p className="mt-4 text-sm font-bold text-blue-100">
                          Sites autorisés
                        </p>

                        <div className="mt-2 grid gap-2 text-sm text-blue-100">
                          {branches.map((branch) => (
                            <label
                              key={branch.branchId}
                              className="flex cursor-pointer items-center gap-3"
                            >
                              <input
                                type="checkbox"
                                checked={
                                  seller.sellerBranchAssignment.allowedBranchIds.includes(
                                    branch.branchId,
                                  )
                                }
                                onChange={() =>
                                  toggleAllowedBranch(
                                    seller.customerId,
                                    branch.branchId,
                                  )
                                }
                              />

                              {branch.name}

                              {seller.sellerBranchAssignment.primaryBranchId ===
                              branch.branchId
                                ? " (principal)"
                                : ""}
                            </label>
                          ))}
                        </div>
                      </>
                    )}

                    <div className="my-4 border-t border-white/10" />

                    <p className="text-sm font-black text-white">
                      Compétences comptoir
                    </p>

                    <div className="mt-3 grid gap-2 text-sm text-blue-100">
                      {[
                        ["generalAdvice", "Conseil / parler à un vendeur"],
                        ["partsOrder", "Commande de pièces"],
                        ["quickPurchase", "Achat rapide"],
                        ["pickup", "Enlèvement commande"],
                        ["merchandiseReturn", "Retour marchandise"],
                        ["refund", "Remboursement"],
                        ["diagnostic", "Diagnostic"],
                        ["professionalCustomer", "Client professionnel"],
                      ].map(([key, label]) => (
                        <label
                          key={key}
                          className="flex cursor-pointer items-center gap-3"
                        >
                          <input
                            type="checkbox"
                            checked={
                              seller.sellerCounterSettings.capabilities[
                                key as keyof typeof seller.sellerCounterSettings.capabilities
                              ]
                            }
                            onChange={() =>
                              toggleSellerSetting(
                                seller.customerId,
                                "capabilities",
                                key,
                              )
                            }
                          />
                          {label}
                        </label>
                      ))}
                    </div>

                    <div className="my-4 border-t border-white/10" />

                    <p className="text-sm font-black text-white">
                      Autorisations
                    </p>

                    <div className="mt-3 grid gap-2 text-sm text-amber-100">
                      {[
                        ["manualTicketSelection", "Peut choisir manuellement un ticket"],
                        ["viewFullQueue", "Peut voir toute la file"],
                        ["counterSupervisor", "Responsable comptoir"],
    ["deputySupervisor", "Adjoint / responsable bis"],
                      ].map(([key, label]) => (
                        <label
                          key={key}
                          className="flex cursor-pointer items-center gap-3"
                        >
                          <input
                            type="checkbox"
                            checked={
                              seller.sellerCounterSettings.permissions[
                                key as keyof typeof seller.sellerCounterSettings.permissions
                              ]
                            }
                            onChange={() =>
                              toggleSellerSetting(
                                seller.customerId,
                                "permissions",
                                key,
                              )
                            }
                          />
                          {label}
                        </label>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={
                        savingSettingsId === seller.customerId
                      }
                      onClick={() =>
                        void saveSellerSettings(seller)
                      }
                      className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-500 disabled:opacity-50"
                    >
                      {savingSettingsId === seller.customerId
                        ? "Enregistrement..."
                        : "Enregistrer"}
                    </button>

                  </div>
                ) : null}
              </div>
            ),
          )}
        </div>
      )}
    </section>
  );
}
