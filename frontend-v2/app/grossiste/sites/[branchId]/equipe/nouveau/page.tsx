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

type Branch = {
  branchId: string;
  name: string;
};

function roleLabel(
  role: StaffRole,
): string {
  if (role === "secretary") {
    return "Secrétaire";
  }

  if (
    role ===
    "sales_representative"
  ) {
    return "Commercial";
  }

  if (role === "driver") {
    return "Chauffeur";
  }

  return "Autre fonction";
}

export default function NewStaffPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId") ?? "";
  const interventionQuery = organizationId ? `?organizationId=${encodeURIComponent(organizationId)}&mode=super-admin` : "";

  const branchId =
    typeof params.branchId ===
    "string"
      ? params.branchId
      : "";

  const [branch, setBranch] =
    useState<Branch | null>(null);

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

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

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

        setBranch(
          found ?? null,
        );
      } catch {
        setMessage(
          "Impossible de charger le site.",
        );
      }
    }

    if (branchId) {
      void loadBranch();
    }
  }, [branchId]);

  async function createMember() {
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
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              branchId,
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
            "Création impossible.",
        );
      }

      if (photoFile && data.staff?.staffId) {
        const formData = new FormData();
        formData.append("file", photoFile);
        formData.append("branchId", branchId);
        formData.append("staffId", data.staff.staffId);
        if (organizationId) formData.append("organizationId", organizationId);

        const uploadResponse = await fetch("/api/grossiste/staff-photo", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadData.ok || !uploadData.url) {
          throw new Error(uploadData.error || "Membre créé, mais upload de la photo impossible.");
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
              staffId: data.staff.staffId,
              photoUrl: uploadData.url,
            }),
          },
        );
        const patchData = await patchResponse.json();

        if (!patchResponse.ok || !patchData.ok) {
          throw new Error(patchData.error || "Membre créé, mais enregistrement de la photo impossible.");
        }
      }

      window.location.href =
        `/grossiste/organisation${interventionQuery}`;
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#061b31] via-[#08233d] to-[#0b3153] px-5 py-8 text-white lg:px-10">

      <div className="mx-auto max-w-4xl">

        <div className="pr-40">

          <a
            href={`/grossiste/organisation${interventionQuery}`}
            className="inline-flex rounded-xl border border-blue-300/30 bg-white/5 px-4 py-2 font-bold text-blue-100 transition hover:bg-white/10"
          >
            ← Organisation
          </a>

          <div className="mt-6">
            <div className="text-sm font-black uppercase tracking-[0.18em] text-blue-300">
              Équipe du site
            </div>

            <h1 className="mt-1 text-3xl font-black">
              Ajouter un membre
            </h1>

            <p className="mt-2 text-blue-200">
              {branch?.name ??
                "Chargement du site..."}
            </p>
          </div>

        </div>

        <details className="group mt-8 rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-6 shadow-xl">

          <summary className="flex cursor-pointer list-none items-center justify-between select-none">
            <div className="text-sm font-black uppercase tracking-wider text-cyan-300">Profil du personnel</div>
            <span className="text-2xl font-black text-cyan-300 transition-transform group-open:rotate-180">⌄</span>
          </summary>

          <div className="mt-5 flex items-center gap-5">
            <label className="flex h-28 w-28 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 border-white/80 bg-[#071d31]">
              {photoPreview ? (
                <img src={photoPreview} alt="Aperçu photo" className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-cyan-200">
                  {(firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || "?"}
                </span>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                    setMessage("Format non compatible. Utilisez JPG, PNG ou WebP.");
                    return;
                  }
                  if (file.size > 8 * 1024 * 1024) {
                    setMessage("La photo ne peut pas dépasser 8 Mo.");
                    return;
                  }
                  setPhotoFile(file);
                  setPhotoPreview(URL.createObjectURL(file));
                  setMessage("");
                }}
              />
            </label>
            <div className="text-sm text-cyan-100">
              <div className="font-black">Photo du personnel</div>
              <div className="mt-1 text-cyan-200">
                Clique pour choisir la photo · JPG, PNG ou WebP · 8 Mo maximum
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
          </label>

          {role === "custom" ? (
            <label className="mt-4 block">
              <span className="text-sm font-bold text-cyan-100">
                Fonction libre
              </span>

              <input
                value={customRoleLabel}
                onChange={(event) =>
                  setCustomRoleLabel(
                    event.target.value,
                  )
                }
                placeholder="Ex. Magasinier, Comptable, Responsable logistique..."
                className="mt-2 w-full rounded-xl border border-cyan-300/30 bg-[#071d31] px-4 py-3 font-bold text-white"
              />
            </label>
          ) : null}

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

        </details>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-5">

          <div className="font-bold text-amber-200">
            {message}
          </div>

          <button
            type="button"
            onClick={createMember}
            disabled={
              saving ||
              !branchId
            }
            className="rounded-xl bg-blue-600 px-7 py-3 font-black text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {saving
              ? "Création..."
              : "Créer le membre"}
          </button>

        </div>

      </div>
    </main>
  );
}