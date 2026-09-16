"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams, useSearchParams } from "next/navigation";

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

type SellerHrProfile = {
  jobTitle?: string;
  employmentStartDate?: string;
  iban?: string;
  bankAccountHolder?: string;
  familyStatus?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
};
type Seller = {
  customerId: string;
  photoUrl?: string;
  firstName?: string;
  lastName?: string;

  phone?: string;
  personalEmail?: string;
  birthDate?: string;

  address?: {
    street?: string;
    houseNumber?: string;
    box?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };

  sellerHrProfile?: SellerHrProfile;

  loginEmail: string;
  userCode?: string;
  status: "active" | "disabled";

  sellerBranchAssignment: {
    primaryBranchId?: string;
    allowedBranchIds: string[];
  };

  sellerCounterSettings: {
    capabilities: Capabilities;
    permissions: Permissions;
  };
}
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
  [
    "deputySupervisor",
    "Adjoint / responsable bis",
  ],
];

export default function SellerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId") ?? "";
  const interventionQuery = organizationId ? `?organizationId=${encodeURIComponent(organizationId)}&mode=super-admin` : "";

  const customerId =
    typeof params.customerId === "string"
      ? params.customerId
      : "";

  const [seller, setSeller] =
    useState<Seller | null>(null);

  const [branches, setBranches] =
    useState<Branch[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [tpaPopup, setTpaPopup] =
    useState("");

  const [showPasswordReset, setShowPasswordReset] =
    useState(false);

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [resettingPassword, setResettingPassword] =
    useState(false);

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [photoOrganizationId, setPhotoOrganizationId] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [
          sellersResponse,
          branchesResponse,
        ] = await Promise.all([
          fetch(organizationId ? `/api/grossiste/sellers?organizationId=${encodeURIComponent(organizationId)}` : "/api/grossiste/sellers", {
            cache: "no-store",
          }),
          fetch(organizationId ? `/api/grossiste/branches?organizationId=${encodeURIComponent(organizationId)}` : "/api/grossiste/branches", {
            cache: "no-store",
          }),
        ]);

        const sellersData =
          await sellersResponse.json();

        const branchesData =
          await branchesResponse.json();

        if (
          !sellersResponse.ok ||
          !sellersData.ok
        ) {
          throw new Error(
            "Chargement vendeur impossible",
          );
        }

        const found =
          (sellersData.sellers as Seller[])
            .find(
              (item) =>
                item.customerId ===
                customerId,
            );

        if (!found) {
          throw new Error(
            "Vendeur introuvable",
          );
        }

        setSeller({
          ...found,
          sellerCounterSettings: {
            ...found.sellerCounterSettings,
            permissions: {
              manualTicketSelection:
                found
                  .sellerCounterSettings
                  .permissions
                  .manualTicketSelection ===
                true,

              viewFullQueue:
                found
                  .sellerCounterSettings
                  .permissions
                  .viewFullQueue ===
                true,

              counterSupervisor:
                found
                  .sellerCounterSettings
                  .permissions
                  .counterSupervisor ===
                true,

              deputySupervisor:
                found
                  .sellerCounterSettings
                  .permissions
                  .deputySupervisor ===
                true,
            },
          },
        });

        setPhotoOrganizationId(branchesData.organizationId ?? sellersData.organizationId ?? organizationId);

        setBranches(
          branchesResponse.ok &&
          branchesData.ok
            ? branchesData.branches ?? []
            : [],
        );
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Erreur de chargement",
        );
      } finally {
        setLoading(false);
      }
    }

    if (customerId) {
      void load();
    }
  }, [customerId]);

  const sellerName = useMemo(() => {
    if (!seller) {
      return "";
    }

    const centralName = [
      seller.firstName,
      seller.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return centralName ||
      seller.userCode ||
      "Vendeur";
  }, [seller]);

  function toggleCapability(
    key: keyof Capabilities,
  ) {
    setSeller((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        sellerCounterSettings: {
          ...current.sellerCounterSettings,
          capabilities: {
            ...current
              .sellerCounterSettings
              .capabilities,
            [key]:
              !current
                .sellerCounterSettings
                .capabilities[key],
          },
        },
      };
    });
  }

  function togglePermission(
    key: keyof Permissions,
  ) {
    setSeller((current) => {
      if (!current) {
        return current;
      }

      const permissions =
        current.sellerCounterSettings
          .permissions;

      const nextValue =
        !permissions[key];

      if (
        nextValue &&
        key === "counterSupervisor" &&
        permissions.deputySupervisor
      ) {
        setTpaPopup(
          "Un vendeur ne peut pas être à la fois Responsable et Adjoint.",
        );
        return current;
      }

      if (
        nextValue &&
        key === "deputySupervisor" &&
        permissions.counterSupervisor
      ) {
        setTpaPopup(
          "Un vendeur ne peut pas être à la fois Responsable et Adjoint.",
        );
        return current;
      }

      setMessage("");

      return {
        ...current,
        sellerCounterSettings: {
          ...current.sellerCounterSettings,
          permissions: {
            ...permissions,
            [key]: nextValue,
          },
        },
      };
    });
  }

  function setPrimaryBranch(
    branchId: string,
  ) {
    setSeller((current) => {
      if (!current) {
        return current;
      }

      const allowed =
        new Set(
          current
            .sellerBranchAssignment
            .allowedBranchIds,
        );

      if (branchId) {
        allowed.add(branchId);
      }

      return {
        ...current,
        sellerBranchAssignment: {
          primaryBranchId:
            branchId || undefined,
          allowedBranchIds:
            Array.from(allowed),
        },
      };
    });
  }

  function toggleAllowedBranch(
    branchId: string,
  ) {
    setSeller((current) => {
      if (!current) {
        return current;
      }

      const primary =
        current
          .sellerBranchAssignment
          .primaryBranchId;

      const allowed =
        new Set(
          current
            .sellerBranchAssignment
            .allowedBranchIds,
        );

      if (allowed.has(branchId)) {
        if (branchId !== primary) {
          allowed.delete(branchId);
        }
      } else {
        allowed.add(branchId);
      }

      return {
        ...current,
        sellerBranchAssignment: {
          ...current.sellerBranchAssignment,
          allowedBranchIds:
            Array.from(allowed),
        },
      };
    });
  }

  async function resetSellerPassword() {
    if (!seller) {
      return;
    }

    setPasswordMessage("");

    if (newPassword.length < 8) {
      setPasswordMessage(
        "Minimum 8 caractères.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage(
        "Les deux mots de passe ne correspondent pas.",
      );
      return;
    }

    setResettingPassword(true);

    try {
      const response = await fetch(
        organizationId ? `/api/grossiste/sellers?organizationId=${encodeURIComponent(organizationId)}` : "/api/grossiste/sellers",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerId: seller.customerId,
            newPassword,
          }),
        },
      );

      const data = await response.json()
        .catch(() => null);

      if (!response.ok || !data?.ok) {
        throw new Error(
          data?.error === "PASSWORD_TOO_SHORT"
            ? "Mot de passe trop court."
            : "Réinitialisation impossible.",
        );
      }

      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordReset(false);
      setPasswordMessage(
        "Mot de passe réinitialisé.",
      );
    } catch (error) {
      setPasswordMessage(
        error instanceof Error
          ? error.message
          : "Réinitialisation impossible.",
      );
    } finally {
      setResettingPassword(false);
    }
  }

  function sellerPhotoSrc(photoUrl?: string) {
    if (!photoUrl) {
      return "";
    }

    if (!photoUrl.startsWith("tpa/organizations/")) {
      return photoUrl;
    }

    return `/api/grossiste/private-photo?organizationId=${encodeURIComponent(
      photoOrganizationId || organizationId,
    )}&pathname=${encodeURIComponent(photoUrl)}`;
  }
  async function uploadSellerPhoto(file: File) {
    if (!seller) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      throw new Error("Format non compatible. Utilisez JPG, PNG ou WebP.");
    }

    if (file.size > 8 * 1024 * 1024) {
      throw new Error("La photo ne peut pas dépasser 8 Mo.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("customerId", seller.customerId);

    if (organizationId) {
      formData.append("organizationId", organizationId);
    }

    const uploadResponse = await fetch("/api/grossiste/seller-photo", {
      method: "POST",
      body: formData,
    });

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok || !uploadData.ok || !uploadData.url) {
      throw new Error(uploadData.error || "Upload de la photo impossible.");
    }

    const patchResponse = await fetch(
      organizationId
        ? `/api/grossiste/sellers?organizationId=${encodeURIComponent(organizationId)}`
        : "/api/grossiste/sellers",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: seller.customerId,
          identity: { photoUrl: uploadData.url },
        }),
      },
    );

    const patchData = await patchResponse.json();

    if (!patchResponse.ok || !patchData.ok) {
      throw new Error(patchData.error || "Enregistrement de la photo impossible.");
    }

    setSeller((current) =>
      current ? { ...current, photoUrl: uploadData.url } : current,
    );
  }

  async function save() {
    if (!seller) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response =
        await fetch(
          organizationId ? `/api/grossiste/sellers?organizationId=${encodeURIComponent(organizationId)}` : "/api/grossiste/sellers",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              customerId:
                seller.customerId,
              identity: {
                firstName:
                  seller.firstName ?? "",
                lastName:
                  seller.lastName ?? "",
              },
              sellerCounterSettings:
                seller
                  .sellerCounterSettings,
              sellerBranchAssignment:
                seller
                  .sellerBranchAssignment,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok || !data.ok) {
        const roleErrors: Record<
          string,
          string
        > = {
          SELLER_ROLE_CONFLICT:
            "Un vendeur ne peut pas être à la fois Responsable et Adjoint.",

          BRANCH_SUPERVISOR_ALREADY_ASSIGNED:
            "Ce magasin possède déjà un Responsable.",

          BRANCH_DEPUTY_ALREADY_ASSIGNED:
            "Ce magasin possède déjà un Adjoint.",
        };

        const roleMessage =
          roleErrors[
            String(data.error ?? "")
          ];

        if (roleMessage) {
          setTpaPopup(roleMessage);
          return;
        }

        throw new Error(
          data.message ||
            data.error ||
            "Sauvegarde impossible",
        );
      }

      setMessage(
        "Modifications enregistrées.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Erreur de sauvegarde",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#061b31] p-10 text-white">
        Chargement de la fiche vendeur...
      </main>
    );
  }

  if (!seller) {
    return (
      <main className="min-h-screen bg-[#061b31] p-10 text-white">
        <a
          href={`/grossiste/organisation${interventionQuery}`}
          className="font-bold text-blue-300"
        >
          ← Organisation
        </a>

        <div className="mt-8 text-xl font-black">
          {message ||
            "Vendeur introuvable"}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#061b31] via-[#08233d] to-[#0b3153] px-5 py-8 text-white lg:px-10">

      <div className="mx-auto max-w-6xl">

        <div className="pr-40">

          <a
            href={`/grossiste/organisation${interventionQuery}`}
            className="inline-flex rounded-xl border border-blue-300/30 bg-white/5 px-4 py-2 font-bold text-blue-100 transition hover:bg-white/10"
          >
            ← Organisation
          </a>

          <div className="mt-6 flex flex-wrap items-center gap-5">

            <label className="group relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-blue-500 text-2xl font-black shadow-xl">
              {seller.photoUrl ? (
                <img src={sellerPhotoSrc(seller.photoUrl)} alt={`Photo de ${sellerName}`} className="h-full w-full object-cover" />
              ) : (
                <>
                  {seller.firstName?.[0] ?? seller.userCode?.[0] ?? "V"}
                  {seller.lastName?.[0] ?? ""}
                </>
              )}
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 text-lg opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">📷</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  try {
                    setMessage("");
                    await uploadSellerPhoto(file);
                    setMessage("Photo vendeur enregistrée.");
                  } catch (error) {
                    setMessage(error instanceof Error ? error.message : "Upload de la photo impossible.");
                  }
                }}
              />
            </label>
            <div>
              <div className="text-sm font-black uppercase tracking-[0.18em] text-blue-300">
                Fiche vendeur
              </div>

              <h1 className="mt-1 text-3xl font-black lg:text-4xl">
                {sellerName}
              </h1>

              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-500/20 px-3 py-1 text-sm font-black text-blue-200">
                  {seller.userCode ?? "Sans code"}
                </span>

                <span
                  className={
                    seller.status === "active"
                      ? "rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-black text-emerald-300"
                      : "rounded-full bg-red-500/20 px-3 py-1 text-sm font-black text-red-300"
                  }
                >
                  {seller.status === "active"
                    ? "ACTIF"
                    : "DÉSACTIVÉ"}
                </span>
              </div>
            </div>

          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          <section className="rounded-3xl border border-blue-400/30 bg-blue-500/10 p-6 shadow-xl">
            <div className="text-sm font-black uppercase tracking-wider text-blue-300">
              Identité & informations personnelles
            </div>

            <h2 className="mt-1 text-2xl font-black">
              Fiche du vendeur
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              <label className="rounded-2xl bg-black/15 p-4">
                <div className="text-xs font-bold text-blue-300">
                  Prénom
                </div>
                <input
                  value={seller.firstName ?? ""}
                  onChange={(event) =>
                    setSeller((current) =>
                      current
                        ? { ...current, firstName: event.target.value }
                        : current,
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 font-semibold outline-none"
                />
              </label>

              <label className="rounded-2xl bg-black/15 p-4">
                <div className="text-xs font-bold text-blue-300">
                  Nom
                </div>
                <input
                  value={seller.lastName ?? ""}
                  onChange={(event) =>
                    setSeller((current) =>
                      current
                        ? { ...current, lastName: event.target.value }
                        : current,
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 font-semibold outline-none"
                />
              </label>

              <div className="rounded-2xl bg-black/15 p-4">
                <div className="text-xs font-bold text-blue-300">
                  Téléphone
                </div>
                <div className="mt-2 font-semibold">
                  {seller.phone || "Non renseigné"}
                </div>
              </div>

              <div className="rounded-2xl bg-black/15 p-4">
                <div className="text-xs font-bold text-blue-300">
                  Email personnel
                </div>
                <div className="mt-2 break-all font-semibold">
                  {seller.personalEmail || "Non renseigné"}
                </div>
              </div>

              <div className="rounded-2xl bg-black/15 p-4">
                <div className="text-xs font-bold text-blue-300">
                  Date de naissance
                </div>
                <div className="mt-2 font-semibold">
                  {seller.birthDate || "Non renseignée"}
                </div>
              </div>

              <div className="rounded-2xl bg-black/15 p-4">
                <div className="text-xs font-bold text-blue-300">
                  Email de connexion
                </div>
                <div className="mt-2 break-all font-semibold">
                  {seller.loginEmail}
                </div>
              </div>

              <div className="rounded-2xl bg-black/15 p-4 sm:col-span-2">
                <div className="text-xs font-bold text-blue-300">
                  Adresse
                </div>
                <div className="mt-2 font-semibold">
                  {[
                    seller.address?.street,
                    seller.address?.houseNumber,
                    seller.address?.box
                      ? `boîte ${seller.address.box}`
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ") || "Non renseignée"}
                  <br />
                  {[
                    seller.address?.postalCode,
                    seller.address?.city,
                  ]
                    .filter(Boolean)
                    .join(" ") || ""}
                  {seller.address?.country
                    ? ` — ${seller.address.country}`
                    : ""}
                </div>
              </div>
            </div>

                        <details className="group mt-6 border-t border-white/10 pt-6">
              <summary className="flex cursor-pointer list-none items-center justify-between select-none">
                <div className="text-sm font-black uppercase tracking-wider text-blue-300">Informations RH</div>
                <span className="text-xl font-black text-blue-300 transition-transform group-open:rotate-180">⌄</span>
              </summary>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">

                <label className="rounded-2xl bg-black/15 p-4">
                  <div className="text-xs font-bold text-blue-300">
                    Fonction
                  </div>
                  <input
                    value={seller.sellerHrProfile?.jobTitle ?? ""}
                    onChange={(event) =>
                      setSeller((current) =>
                        current
                          ? {
                              ...current,
                              sellerHrProfile: {
                                ...current.sellerHrProfile,
                                jobTitle: event.target.value,
                              },
                            }
                          : current,
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 font-semibold outline-none"
                  />
                </label>

                <label className="rounded-2xl bg-black/15 p-4">
                  <div className="text-xs font-bold text-blue-300">
                    Date d'engagement
                  </div>
                  <input
                    type="date"
                    value={seller.sellerHrProfile?.employmentStartDate ?? ""}
                    onChange={(event) =>
                      setSeller((current) =>
                        current
                          ? {
                              ...current,
                              sellerHrProfile: {
                                ...current.sellerHrProfile,
                                employmentStartDate: event.target.value,
                              },
                            }
                          : current,
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 font-semibold outline-none"
                  />
                </label>

                <label className="rounded-2xl bg-black/15 p-4">
                  <div className="text-xs font-bold text-blue-300">
                    Situation familiale
                  </div>
                  <input
                    value={seller.sellerHrProfile?.familyStatus ?? ""}
                    onChange={(event) =>
                      setSeller((current) =>
                        current
                          ? {
                              ...current,
                              sellerHrProfile: {
                                ...current.sellerHrProfile,
                                familyStatus: event.target.value,
                              },
                            }
                          : current,
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 font-semibold outline-none"
                  />
                </label>

                <label className="rounded-2xl bg-black/15 p-4">
                  <div className="text-xs font-bold text-blue-300">
                    Titulaire du compte bancaire
                  </div>
                  <input
                    value={seller.sellerHrProfile?.bankAccountHolder ?? ""}
                    onChange={(event) =>
                      setSeller((current) =>
                        current
                          ? {
                              ...current,
                              sellerHrProfile: {
                                ...current.sellerHrProfile,
                                bankAccountHolder: event.target.value,
                              },
                            }
                          : current,
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 font-semibold outline-none"
                  />
                </label>

                <label className="rounded-2xl bg-black/15 p-4 sm:col-span-2">
                  <div className="text-xs font-bold text-blue-300">
                    IBAN
                  </div>
                  <input
                    value={seller.sellerHrProfile?.iban ?? ""}
                    onChange={(event) =>
                      setSeller((current) =>
                        current
                          ? {
                              ...current,
                              sellerHrProfile: {
                                ...current.sellerHrProfile,
                                iban: event.target.value,
                              },
                            }
                          : current,
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 font-semibold outline-none"
                  />
                </label>

                <label className="rounded-2xl bg-black/15 p-4">
                  <div className="text-xs font-bold text-blue-300">
                    Contact d'urgence
                  </div>
                  <input
                    value={seller.sellerHrProfile?.emergencyContactName ?? ""}
                    onChange={(event) =>
                      setSeller((current) =>
                        current
                          ? {
                              ...current,
                              sellerHrProfile: {
                                ...current.sellerHrProfile,
                                emergencyContactName: event.target.value,
                              },
                            }
                          : current,
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 font-semibold outline-none"
                  />
                </label>

                <label className="rounded-2xl bg-black/15 p-4">
                  <div className="text-xs font-bold text-blue-300">
                    Téléphone d'urgence
                  </div>
                  <input
                    value={seller.sellerHrProfile?.emergencyContactPhone ?? ""}
                    onChange={(event) =>
                      setSeller((current) =>
                        current
                          ? {
                              ...current,
                              sellerHrProfile: {
                                ...current.sellerHrProfile,
                                emergencyContactPhone: event.target.value,
                              },
                            }
                          : current,
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 font-semibold outline-none"
                  />
                </label>

              </div>
            </details>

            <div className="mt-6 border-t border-white/10 pt-6">
              <div className="text-sm font-black uppercase tracking-wider text-blue-300">
                Sécurité
              </div>

              <div className="mt-1 font-black text-white">
                Mot de passe
              </div>

              {!showPasswordReset ? (
                <button
                  type="button"
                  onClick={() => setShowPasswordReset(true)}
                  className="mt-3 rounded-xl bg-amber-500 px-4 py-2 text-sm font-black text-[#061b31] transition hover:bg-amber-400"
                >
                  Réinitialiser le mot de passe
                </button>
              ) : (
                <div className="mt-3 space-y-3">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(event.target.value)
                    }
                    placeholder="Nouveau mot de passe"
                    className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2"
                  />

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Confirmer le mot de passe"
                    className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2"
                  />

                  <button
                    type="button"
                    onClick={() => void resetSellerPassword()}
                    disabled={resettingPassword}
                    className="rounded-xl bg-amber-500 px-4 py-2 font-black text-[#061b31]"
                  >
                    {resettingPassword
                      ? "Réinitialisation..."
                      : "Confirmer la réinitialisation"}
                  </button>
                </div>
              )}

              {passwordMessage ? (
                <div className="mt-3 text-sm font-bold">
                  {passwordMessage}
                </div>
              ) : null}
            </div>
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

            <div className="mt-2 rounded-xl border border-emerald-300/30 bg-[#071d31] px-4 py-3">
              <div className="font-black text-white">
                {branches.find(
                  (branch) =>
                    branch.branchId ===
                    seller
                      .sellerBranchAssignment
                      .primaryBranchId,
                )?.name ??
                  "Aucun site principal"}
              </div>

              <div className="mt-1 text-xs font-bold text-emerald-300">
                Site principal verrouillé
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Le site principal détermine la position du vendeur dans l'organisation.
              Un transfert définitif sera nécessaire pour le modifier.
            </div>

            <div className="mt-5 space-y-2">
              {branches
                .filter(
                  (branch) =>
                    branch.status ===
                    "active",
                )
                .map((branch) => {
                  const checked =
                    seller
                      .sellerBranchAssignment
                      .allowedBranchIds
                      .includes(
                        branch.branchId,
                      );

                  const primary =
                    seller
                      .sellerBranchAssignment
                      .primaryBranchId ===
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
                          toggleAllowedBranch(
                            branch.branchId,
                          )
                        }
                        className="h-5 w-5 accent-emerald-500"
                      />
                    </label>
                  );
                })}
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
                        seller
                          .sellerCounterSettings
                          .capabilities[key]
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
                        seller
                          .sellerCounterSettings
                          .permissions[key]
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
              message.includes("enregistrées")
                ? "font-bold text-emerald-300"
                : "font-bold text-amber-200"
            }
          >
            {message ||
              "Les modifications seront appliquées après enregistrement."}
          </div>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-xl bg-blue-600 px-7 py-3 font-black text-white shadow-lg transition hover:bg-blue-500 disabled:opacity-50"
          >
            {saving
              ? "Enregistrement..."
              : "Enregistrer les modifications"}
          </button>

        </div>

      </div>

      {tpaPopup ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Alerte TPA"
        >
          <div className="w-full max-w-md rounded-2xl border border-cyan-300/30 bg-[#071d31] p-6 shadow-2xl">
            <div className="text-lg font-black text-white">
              TPA
            </div>

            <p className="mt-3 text-sm font-semibold leading-6 text-blue-100">
              {tpaPopup}
            </p>

            <button
              type="button"
              onClick={() =>
                setTpaPopup("")
              }
              className="mt-6 w-full rounded-xl bg-cyan-400 px-4 py-3 font-black text-slate-950 transition hover:bg-cyan-300"
            >
              Compris
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
