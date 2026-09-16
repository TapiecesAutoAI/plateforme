"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useSearchParams,
} from "next/navigation";

type StaffRole =
  | "secretary"
  | "sales_representative"
  | "driver"
  | "custom";

type StaffStatus =
  | "active"
  | "disabled";

type Staff = {
  staffId: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  customRoleLabel?: string;
  photoUrl?: string;
  phone?: string;
  email?: string;
  status: StaffStatus;
};

type Branch = {
  branchId: string;
  name: string;
  staff?: Staff[];
};

function roleLabel(
  role: StaffRole,
): string {
  if (role === "custom") {
    return "Autre fonction";
  }

  if (role === "secretary") {
    return "Secrétaire";
  }

  if (
    role ===
    "sales_representative"
  ) {
    return "Commercial";
  }

  return "Chauffeur";
}

export default function StaffPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId") ?? "";
  const interventionQuery = organizationId ? `?organizationId=${encodeURIComponent(organizationId)}&mode=super-admin` : "";

  const branchId =
    typeof params.branchId ===
    "string"
      ? params.branchId
      : "";

  const staffId =
    typeof params.staffId ===
    "string"
      ? params.staffId
      : "";

  const [branchName, setBranchName] =
    useState("");

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [role, setRole] =
    useState<StaffRole>(
      "secretary",
    );

  const [customRoleLabel, setCustomRoleLabel] =
    useState("");

  const [photoUrl, setPhotoUrl] = useState("");
  const [photoOrganizationId, setPhotoOrganizationId] = useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [status, setStatus] =
    useState<StaffStatus>(
      "active",
    );
  const [hrProfile, setHrProfile] = useState({
    jobTitle: "",
    employmentStartDate: "",
    familyStatus: "",
    bankAccountHolder: "",
    iban: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  const [assignments, setAssignments] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    async function loadMember() {
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

        const branch =
          (data.branches ?? [])
            .find(
              (item: Branch) =>
                item.branchId ===
                branchId,
            );

        if (!branch) {
          throw new Error(
            "Site introuvable.",
          );
        }

        const member =
          (branch.staff ?? [])
            .find(
              (item: Staff) =>
                item.staffId ===
                staffId,
            );

        if (!member) {
          throw new Error(
            "Membre introuvable.",
          );
        }

        setBranchName(
          branch.name,
        );

        setFirstName(
          member.firstName,
        );

        setLastName(
          member.lastName,
        );

        setRole(
          member.role,
        );

        setCustomRoleLabel(
          member.customRoleLabel ?? "",
        );

        setPhotoUrl(member.photoUrl ?? "");
        setPhotoOrganizationId(data.organizationId ?? organizationId);

        setPhone(
          member.phone ?? "",
        );

        setEmail(
          member.email ?? "",
        );

        setStatus(
          member.status,
        );

         setHrProfile({
           jobTitle: member.hrProfile?.jobTitle ?? "",
           employmentStartDate: member.hrProfile?.employmentStartDate ?? "",
           familyStatus: member.hrProfile?.familyStatus ?? "",
           bankAccountHolder: member.hrProfile?.bankAccountHolder ?? "",
           iban: member.hrProfile?.iban ?? "",
           emergencyContactName: member.hrProfile?.emergencyContactName ?? "",
           emergencyContactPhone: member.hrProfile?.emergencyContactPhone ?? "",
         });

         setAssignments(
           member.assignments ?? [],
         );
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

    if (
      branchId &&
      staffId
    ) {
      void loadMember();
    }
  }, [
    branchId,
    staffId,
  ]);

  async function uploadStaffPhoto(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      throw new Error("Format non compatible. Utilisez JPG, PNG ou WebP.");
    }

    if (file.size > 8 * 1024 * 1024) {
      throw new Error("La photo ne peut pas dépasser 8 Mo.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("branchId", branchId);
    formData.append("staffId", staffId);

    if (organizationId) {
      formData.append("organizationId", organizationId);
    }

    const uploadResponse = await fetch("/api/grossiste/staff-photo", {
      method: "POST",
      body: formData,
    });

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok || !uploadData.ok || !uploadData.url) {
      throw new Error(uploadData.error || "Upload de la photo impossible.");
    }

    const patchResponse = await fetch(
      organizationId
        ? `/api/grossiste/branches/staff?organizationId=${encodeURIComponent(organizationId)}`
        : "/api/grossiste/branches/staff",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId,
          staffId,
          photoUrl: uploadData.url,
        }),
      },
    );

    const patchData = await patchResponse.json();

    if (!patchResponse.ok || !patchData.ok) {
      throw new Error(patchData.error || "Enregistrement de la photo impossible.");
    }

    setPhotoUrl(uploadData.url);
  }

  async function saveMember() {
    if (
      !firstName.trim() ||
      !lastName.trim()
    ) {
      setMessage(
        "Prénom et nom obligatoires.",
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response =
        await fetch(
          organizationId ? `/api/grossiste/branches/staff?organizationId=${encodeURIComponent(organizationId)}` : "/api/grossiste/branches/staff",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              branchId,
              staffId,
              firstName:
                firstName.trim(),
              lastName:
                lastName.trim(),
              role,
              customRoleLabel:
                role === "custom"
                  ? customRoleLabel.trim()
                  : undefined,
              phone:
                phone.trim(),
              email:
                email.trim(),
              status,
               jobTitle: hrProfile.jobTitle.trim(),
               employmentStartDate: hrProfile.employmentStartDate,
               familyStatus: hrProfile.familyStatus.trim(),
               bankAccountHolder: hrProfile.bankAccountHolder.trim(),
               iban: hrProfile.iban.trim(),
               emergencyContactName: hrProfile.emergencyContactName.trim(),
               emergencyContactPhone: hrProfile.emergencyContactPhone.trim(),
               assignments,
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
        "Modifications enregistrées.",
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#061b31] via-[#08233d] to-[#0b3153] px-5 py-8 text-white lg:px-10">

      <div className="mx-auto max-w-4xl">

        <div className="pr-40">

          <a
            href={`/grossiste/organisation${interventionQuery}`}
            className="inline-flex rounded-xl border border-blue-300/30 bg-white/5 px-4 py-2 font-bold text-blue-100 transition hover:bg-white/10"
          >
            ← Retour
          </a>

          <div className="mt-6">

            <div className="text-sm font-black uppercase tracking-[0.18em] text-blue-300">
              Équipe du site
            </div>

            <h1 className="mt-1 text-3xl font-black">
              Modifier un membre
            </h1>

            <p className="mt-2 text-blue-200">
              {branchName}
            </p>

          </div>

        </div>

        <section className="mt-8 rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-6 shadow-xl">

          <div className="text-sm font-black uppercase tracking-wider text-cyan-300">Profil du personnel</div>
          <div className="mt-5 flex items-center gap-5">
            <label className="group relative flex h-28 w-28 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 border-white/80 bg-[#071d31]">
              {photoUrl ? (
                <img
                  src={photoUrl.startsWith("tpa/organizations/") ? `/api/grossiste/private-photo?organizationId=${encodeURIComponent(photoOrganizationId || organizationId)}&pathname=${encodeURIComponent(photoUrl)}` : photoUrl}
                  alt={`Photo de ${firstName} ${lastName}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-black text-cyan-200">
                  {(firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || "?"}
                </span>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-xl opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                📷
              </span>
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
                    await uploadStaffPhoto(file);
                    setMessage("Photo enregistrée.");
                  } catch (error) {
                    setMessage(
                      error instanceof Error
                        ? error.message
                        : "Upload de la photo impossible.",
                    );
                  }
                }}
              />
            </label>

            <div className="text-sm text-cyan-100">
              <div className="font-black">Photo du personnel</div>
              <div className="mt-1 text-cyan-200">
                Clique sur la photo pour la modifier · JPG, PNG ou WebP · 8 Mo maximum
              </div>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            <label>
              <span className="text-sm font-bold text-cyan-100">
                Prénom
              </span>

              <input
                value={firstName}
                onChange={(event) =>
                  setFirstName(
                    event.target.value,
                  )
                }
                className="mt-2 w-full rounded-xl border border-cyan-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
              />
            </label>

            <label>
              <span className="text-sm font-bold text-cyan-100">
                Nom
              </span>

              <input
                value={lastName}
                onChange={(event) =>
                  setLastName(
                    event.target.value,
                  )
                }
                className="mt-2 w-full rounded-xl border border-cyan-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
              />
            </label>

          </div>

          <label className="mt-4 block">

            <span className="text-sm font-bold text-cyan-100">
              Fonction
            </span>

            <select
              value={role}
              onChange={(event) =>
                setRole(
                  event.target
                    .value as StaffRole,
                )
              }
              className="mt-2 w-full rounded-xl border border-cyan-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
            >
              {(
                [
                  "secretary",
                  "sales_representative",
                  "driver",
                  "custom",
                ] as StaffRole[]
              ).map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {roleLabel(item)}
                  </option>
                ),
              )}
            </select>

            {role === "custom" ? (
              <input
                value={customRoleLabel}
                onChange={(event) =>
                  setCustomRoleLabel(
                    event.target.value,
                  )
                }
                placeholder="Ex. Nettoyeur, Comptable, Magasinier..."
                className="mt-4 w-full rounded-xl border border-cyan-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
              />
            ) : null}

          </label>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">

            <label>
              <span className="text-sm font-bold text-cyan-100">
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
                className="mt-2 w-full rounded-xl border border-cyan-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
              />
            </label>

            <label>
              <span className="text-sm font-bold text-cyan-100">
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
                className="mt-2 w-full rounded-xl border border-cyan-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
              />
            </label>

          </div>

        </section>

                <details className="mt-5 group rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-6 shadow-xl">
          <summary className="flex cursor-pointer list-none items-center justify-between select-none">
            <div>
              <div className="text-sm font-black uppercase tracking-wider text-cyan-300">
                Données RH
              </div>
              <div className="mt-1 text-lg font-black text-white">
                Informations personnelles et administratives
              </div>
            </div>
            <span className="text-2xl font-black text-cyan-300 transition-transform group-open:rotate-180">
              ⌄
            </span>
          </summary>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            <label>
              <span className="text-sm font-bold text-cyan-100">
                Fonction
              </span>
              <input
                value={hrProfile.jobTitle}
                onChange={(event) =>
                  setHrProfile((current) => ({
                    ...current,
                    jobTitle: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-cyan-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
              />
            </label>

            <label>
              <span className="text-sm font-bold text-cyan-100">
                Date d'engagement
              </span>
              <input
                type="date"
                value={hrProfile.employmentStartDate}
                onChange={(event) =>
                  setHrProfile((current) => ({
                    ...current,
                    employmentStartDate: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-cyan-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
              />
            </label>

            <label>
              <span className="text-sm font-bold text-cyan-100">
                Situation familiale
              </span>
              <input
                value={hrProfile.familyStatus}
                onChange={(event) =>
                  setHrProfile((current) => ({
                    ...current,
                    familyStatus: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-cyan-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
              />
            </label>

            <label>
              <span className="text-sm font-bold text-cyan-100">
                Titulaire du compte bancaire
              </span>
              <input
                value={hrProfile.bankAccountHolder}
                onChange={(event) =>
                  setHrProfile((current) => ({
                    ...current,
                    bankAccountHolder: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-cyan-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="text-sm font-bold text-cyan-100">
                IBAN
              </span>
              <input
                value={hrProfile.iban}
                onChange={(event) =>
                  setHrProfile((current) => ({
                    ...current,
                    iban: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-cyan-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
              />
            </label>

            <label>
              <span className="text-sm font-bold text-cyan-100">
                Contact d'urgence
              </span>
              <input
                value={hrProfile.emergencyContactName}
                onChange={(event) =>
                  setHrProfile((current) => ({
                    ...current,
                    emergencyContactName: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-cyan-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
              />
            </label>

            <label>
              <span className="text-sm font-bold text-cyan-100">
                Téléphone d'urgence
              </span>
              <input
                type="tel"
                value={hrProfile.emergencyContactPhone}
                onChange={(event) =>
                  setHrProfile((current) => ({
                    ...current,
                    emergencyContactPhone: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-cyan-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
              />
            </label>

          </div>
        </details>

        <details className="mt-5 group rounded-3xl border border-violet-400/30 bg-violet-500/10 p-6 shadow-xl">
          <summary className="flex cursor-pointer list-none items-center justify-between select-none">
            <div>
              <div className="text-sm font-black uppercase tracking-wider text-violet-300">
                Attributions
              </div>
              <div className="mt-1 text-lg font-black text-white">
                Droits et responsabilités du membre
              </div>
            </div>
            <span className="text-2xl font-black text-violet-300 transition-transform group-open:rotate-180">
              ⌄
            </span>
          </summary>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">

            {[
              ["generalAdvice", "Conseil client"],
              ["partsOrder", "Commande de pièces"],
              ["quickPurchase", "Achat rapide"],
              ["pickup", "Retrait commande"],
              ["merchandiseReturn", "Retour marchandise"],
              ["refund", "Remboursement"],
              ["diagnostic", "Diagnostic"],
              ["professionalCustomer", "Client professionnel"],
              ["manualTicketSelection", "Choisir manuellement un ticket"],
              ["viewFullQueue", "Voir toute la file d'attente"],
              ["counterSupervisor", "Responsable / superviseur"],
              ["deputySupervisor", "Adjoint superviseur"],
            ].map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-black/15 p-4 transition hover:bg-white/10"
              >
                <input
                  type="checkbox"
                  checked={assignments.includes(key)}
                  onChange={(event) =>
                    setAssignments((current) =>
                      event.target.checked
                        ? current.includes(key)
                          ? current
                          : [...current, key]
                        : current.filter((item) => item !== key),
                    )
                  }
                  className="h-5 w-5 accent-violet-500"
                />
                <span className="font-bold text-white">
                  {label}
                </span>
              </label>
            ))}

          </div>
        </details>
<section className="mt-5 rounded-3xl border border-amber-400/30 bg-amber-500/10 p-6">

          <div className="text-sm font-black uppercase tracking-wider text-amber-300">
            Statut
          </div>

          <select
            value={status}
            onChange={(event) =>
               setStatus(
                 event.target.value as StaffStatus,
               )
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

          <p className="mt-3 text-sm text-amber-100">
            Un membre inactif reste enregistré mais n'apparaît plus dans l'équipe active du site.
          </p>

        </section>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-5">

          <div className="font-bold text-emerald-300">
            {message}
          </div>

          <button
            type="button"
            onClick={saveMember}
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
