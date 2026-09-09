"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";


type Address = {
  street?: string;
  houseNumber?: string;
  box?: string;
  postalCode?: string;
  city?: string;
  country?: string;
};

type Company = {
  customerType?:
    | "individual"
    | "company";

  companyName?: string;
  vatNumber?: string;
  registrationNumber?: string;
};

type Preferences = {
  language?: string;

  preferredContactChannel?:
    | "email"
    | "sms"
    | "phone";
};

type DiagnosticProfile =
  | "particulier"
  | "bricoleur"
  | "mecanicien-garage"
  | "vendeur-pieces-auto";

type Profile = {
  customerId: string;
  diagnosticProfile?: DiagnosticProfile | null;

  firstName: string;
  lastName: string;
  phone: string;
  email: string;

  birthDate?: string;

  address: Address;
  billingAddress: Address;

  company: Company;

  preferences: Preferences;

  marketingEmail: boolean;
  marketingSms: boolean;

  createdAt?: string;
  updatedAt?: string;
};


const emptyAddress: Address = {
  street: "",
  houseNumber: "",
  box: "",
  postalCode: "",
  city: "",
  country: "",
};


function ProfileInfo({
  text,
}: {
  text: string;
}) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label="Informations sur ce profil"
        className="flex h-6 w-6 items-center justify-center rounded-full border border-blue-300 bg-blue-50 text-sm font-black text-[#1b4fd8] hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
        onClick={event => {
          event.stopPropagation();
        }}
      >
        i
      </button>

      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-8 z-30 hidden w-64 -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-3 text-left text-sm font-medium leading-5 text-white shadow-xl group-hover:block group-focus-within:block"
      >
        {text}
      </span>
    </span>
  );
}

export default function ClientProfilePage() {
  const router = useRouter();

  const [
    profile,
    setProfile,
  ] = useState<Profile | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    saved,
    setSaved,
  ] = useState(false);


  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response =
          await fetch(
            "/api/client/profile",
            {
              method: "GET",
              cache: "no-store",
            },
          );

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            "PROFILE_LOAD_FAILED",
          );
        }

        const data =
          await response.json();

        if (
          active &&
          data?.customer
        ) {
          setProfile({
            ...data.customer,

            birthDate:
              data.customer.birthDate ?? "",

            address: {
              ...emptyAddress,
              ...(data.customer.address ?? {}),
            },

            billingAddress: {
              ...emptyAddress,
              ...(data.customer.billingAddress ?? {}),
            },

            company:
              data.customer.company ?? {},

            preferences:
              data.customer.preferences ?? {},
          });
        }
      } catch {
        if (active) {
          setError(
            "Impossible de charger votre profil.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [router]);


  function resetMessages() {
    setSaved(false);
    setError("");
  }


  function updateMain<K extends keyof Profile>(
    key: K,
    value: Profile[K],
  ) {
    setProfile(current =>
      current
        ? {
            ...current,
            [key]: value,
          }
        : current,
    );

    resetMessages();
  }


  function updateAddress(
    field: keyof Address,
    value: string,
  ) {
    setProfile(current =>
      current
        ? {
            ...current,

            address: {
              ...current.address,
              [field]: value,
            },
          }
        : current,
    );

    resetMessages();
  }


  function updateBillingAddress(
    field: keyof Address,
    value: string,
  ) {
    setProfile(current =>
      current
        ? {
            ...current,

            billingAddress: {
              ...current.billingAddress,
              [field]: value,
            },
          }
        : current,
    );

    resetMessages();
  }


  function updateCompany(
    field: keyof Company,
    value: string,
  ) {
    setProfile(current =>
      current
        ? {
            ...current,

            company: {
              ...current.company,
              [field]:
                value || undefined,
            },
          }
        : current,
    );

    resetMessages();
  }


  function updatePreferences(
    field: keyof Preferences,
    value: string,
  ) {
    setProfile(current =>
      current
        ? {
            ...current,

            preferences: {
              ...current.preferences,
              [field]:
                value || undefined,
            },
          }
        : current,
    );

    resetMessages();
  }


  async function saveProfile() {
    if (!profile || saving) {
      return;
    }

    if (
      !profile.firstName.trim() ||
      !profile.lastName.trim() ||
      !profile.phone.trim() ||
      !profile.email.trim()
    ) {
      setError(
        "Les champs marqués d'un * sont obligatoires.",
      );

      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const response =
        await fetch(
          "/api/client/profile",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              diagnosticProfile:
                profile.diagnosticProfile,

              firstName:
                profile.firstName,

              lastName:
                profile.lastName,

              phone:
                profile.phone,

              birthDate:
                profile.birthDate,

              address:
                profile.address,

              billingAddress:
                profile.billingAddress,

              company:
                profile.company,

              preferences:
                profile.preferences,

              marketingEmail:
                profile.marketingEmail,

              marketingSms:
                profile.marketingSms,
            }),
          },
        );

      const data =
        await response.json();

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        if (
          data?.error ===
          "PHONE_ALREADY_USED"
        ) {
          setError(
            "Ce numéro de téléphone est déjà utilisé par un autre compte.",
          );

          return;
        }

        if (
          data?.error ===
          "PROFILE_FIELDS_REQUIRED"
        ) {
          setError(
            "Les champs marqués d'un * sont obligatoires.",
          );

          return;
        }

        throw new Error(
          "PROFILE_UPDATE_FAILED",
        );
      }

      if (data?.customer) {
        setProfile({
          ...data.customer,

          birthDate:
            data.customer.birthDate ?? "",

          address: {
            ...emptyAddress,
            ...(data.customer.address ?? {}),
          },

          billingAddress: {
            ...emptyAddress,
            ...(data.customer.billingAddress ?? {}),
          },

          company:
            data.customer.company ?? {},

          preferences:
            data.customer.preferences ?? {},
        });
      }

      setSaved(true);
    } catch {
      setError(
        "La modification du profil n'a pas pu être enregistrée.",
      );
    } finally {
      setSaving(false);
    }
  }


  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-12">
        <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          Chargement du profil...
        </div>
      </main>
    );
  }


  if (!profile) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-12">
        <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">

          <p className="font-semibold text-red-700">
            {error || "Profil indisponible."}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/client")
            }
            className="mt-6 font-bold text-[#1b4fd8]"
          >
            Retour à mon espace
          </button>

        </div>
      </main>
    );
  }


  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-900 outline-none transition focus:border-[#1b4fd8] focus:ring-2 focus:ring-blue-100";

  const labelClass =
    "text-sm font-bold text-slate-700";

  const sectionClass =
    "mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6";

  const customerType =
    profile.company.customerType ?? "";


  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">

      <div className="mx-auto max-w-4xl">

        <button
          type="button"
          onClick={() =>
            router.push("/client")
          }
          className="mb-6 font-bold text-[#1b4fd8]"
        >
          ← Retour à mon espace
        </button>


        <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm sm:p-9">

          <div className="border-b border-slate-200 pb-6">

            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1b4fd8]">
              Compte TaPieceAuto
            </p>

            <h1 className="mt-2 text-3xl font-black text-[#10265f]">
              Mon profil
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Complétez uniquement les informations que vous souhaitez partager.
              Les champs marqués d'un * sont obligatoires.
            </p>

          </div>


          <div className={sectionClass}>

            <h2 className="text-xl font-black text-[#10265f]">
              Identité
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>
                <label className={labelClass}>
                  Prénom *
                </label>

                <input
                  value={profile.firstName}
                  onChange={event =>
                    updateMain(
                      "firstName",
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </div>


              <div>
                <label className={labelClass}>
                  Nom *
                </label>

                <input
                  value={profile.lastName}
                  onChange={event =>
                    updateMain(
                      "lastName",
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </div>


              <div>
                <label className={labelClass}>
                  Date de naissance
                </label>

                <input
                  type="date"
                  value={profile.birthDate ?? ""}
                  onChange={event =>
                    updateMain(
                      "birthDate",
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </div>


              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Je suis
                </label>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">

                  <button
                    type="button"
                    onClick={() =>
                      updateCompany(
                        "customerType",
                        "individual",
                      )
                    }
                    className={
                      "rounded-xl border px-5 py-4 text-left font-black transition " +
                      (
                        customerType === "individual"
                          ? "border-[#1b4fd8] bg-blue-50 text-[#10265f] ring-2 ring-blue-100"
                          : "border-slate-300 bg-white text-slate-700"
                      )
                    }
                  >
                    Particulier
                    <span className="mt-1 block text-sm font-medium text-slate-500">
                      Achat pour mon usage personnel
                    </span>
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      updateCompany(
                        "customerType",
                        "company",
                      )
                    }
                    className={
                      "rounded-xl border px-5 py-4 text-left font-black transition " +
                      (
                        customerType === "company"
                          ? "border-[#1b4fd8] bg-blue-50 text-[#10265f] ring-2 ring-blue-100"
                          : "border-slate-300 bg-white text-slate-700"
                      )
                    }
                  >
                    Société
                    <span className="mt-1 block text-sm font-medium text-slate-500">
                      Achat professionnel ou facturation société
                    </span>
                  </button>

                </div>

                {!customerType && (
                  <p className="mt-2 text-xs text-slate-500">
                    Facultatif. Vous pouvez choisir plus tard.
                  </p>
                )}
              </div>

            </div>
          </div>


          <div className={sectionClass}>
            <h2 className="text-xl font-black text-[#10265f]">
              Niveau de diagnostic
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Choisis le niveau qui correspond à tes connaissances mécaniques.
              TPA adaptera automatiquement ses questions et contrôles.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

              {[
                {
                  id: "particulier" as const,
                  label: "Particulier",
                  subtitle: "Connaissances mécaniques minimales",
                  info: "Pour une personne ayant peu ou pas de connaissances mécaniques. TPA privilégie des questions simples et évite les contrôles techniques complexes.",
                  disabled: false,
                },
                {
                  id: "bricoleur" as const,
                  label: "Particulier +",
                  subtitle: "Connaissances mécaniques de base",
                  info: "Pour une personne qui connaît les bases de la mécanique et peut effectuer des contrôles simples lorsque TPA le demande.",
                  disabled: false,
                },
                {
                  id: "mecanicien-garage" as const,
                  label: "Mécanicien PRO",
                  subtitle: "Diagnostic professionnel",
                  info: "Pour un mécanicien ou un garage professionnel. TPA peut demander des mesures et contrôles techniques avancés. Les coordonnées professionnelles sont obligatoires.",
                  disabled: false,
                },
                {
                  id: "vendeur-pieces-auto" as const,
                  label: "Vendeur comptoir",
                  subtitle: "Diagnostic accompagné au comptoir",
                  info: "Mode destiné au vendeur TPA qui accompagne directement un client au comptoir. Ce profil est attribué uniquement par un administrateur TPA.",
                  disabled: true,
                },
              ].map(option => {

                const selected =
                  profile.diagnosticProfile === option.id;

                return (
                  <div
                    key={option.id}
                    className={
                      "relative rounded-xl border p-4 transition " +
                      (
                        selected
                          ? "border-[#1b4fd8] bg-blue-50 ring-2 ring-blue-100"
                          : option.disabled
                            ? "border-slate-200 bg-slate-50"
                            : "border-slate-300 bg-white"
                      )
                    }
                  >
                    <div className="flex items-start justify-between gap-3">

                      <button
                        type="button"
                        disabled={option.disabled}
                        onClick={() =>
                          updateMain(
                            "diagnosticProfile",
                            option.id,
                          )
                        }
                        className={
                          "min-w-0 flex-1 text-left " +
                          (
                            option.disabled
                              ? "cursor-not-allowed opacity-60"
                              : ""
                          )
                        }
                      >
                        <span className="block font-black text-[#10265f]">
                          {option.label}
                        </span>

                        <span className="mt-1 block text-sm font-medium text-slate-500">
                          {option.subtitle}
                        </span>
                      </button>

                      <ProfileInfo
                        text={option.info}
                      />
                    </div>

                    {option.disabled && (
                      <p className="mt-3 text-xs font-bold text-slate-500">
                        Attribution ADMIN uniquement
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={sectionClass}>

            <h2 className="text-xl font-black text-[#10265f]">
              Coordonnées
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>
                <label className={labelClass}>
                  Téléphone *
                </label>

                <input
                  type="tel"
                  value={profile.phone}
                  onChange={event =>
                    updateMain(
                      "phone",
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </div>


              <div>
                <label className={labelClass}>
                  Email *
                </label>

                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className={
                    inputClass +
                    " cursor-not-allowed bg-slate-100 text-slate-500"
                  }
                />

                <p className="mt-2 text-xs text-slate-500">
                  L'adresse email sert actuellement d'identifiant de connexion.
                </p>
              </div>

            </div>
          </div>


          <div className={sectionClass}>

            <h2 className="text-xl font-black text-[#10265f]">
              Adresse
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Rue
                </label>

                <input
                  value={profile.address.street ?? ""}
                  onChange={event =>
                    updateAddress(
                      "street",
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </div>


              <div>
                <label className={labelClass}>
                  Numéro
                </label>

                <input
                  value={profile.address.houseNumber ?? ""}
                  onChange={event =>
                    updateAddress(
                      "houseNumber",
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </div>


              <div>
                <label className={labelClass}>
                  Boîte
                </label>

                <input
                  value={profile.address.box ?? ""}
                  onChange={event =>
                    updateAddress(
                      "box",
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </div>


              <div>
                <label className={labelClass}>
                  Code postal
                </label>

                <input
                  value={profile.address.postalCode ?? ""}
                  onChange={event =>
                    updateAddress(
                      "postalCode",
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </div>


              <div>
                <label className={labelClass}>
                  Ville
                </label>

                <input
                  value={profile.address.city ?? ""}
                  onChange={event =>
                    updateAddress(
                      "city",
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </div>


              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Pays
                </label>

                <input
                  value={profile.address.country ?? ""}
                  onChange={event =>
                    updateAddress(
                      "country",
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </div>

            </div>
          </div>


          {customerType === "company" && (
          <div className={sectionClass}>

            <h2 className="text-xl font-black text-[#10265f]">
              Société et facturation
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Nom de société
                </label>

                <input
                  value={profile.company.companyName ?? ""}
                  onChange={event =>
                    updateCompany(
                      "companyName",
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </div>


              <div>
                <label className={labelClass}>
                  Numéro TVA
                </label>

                <input
                  value={profile.company.vatNumber ?? ""}
                  onChange={event =>
                    updateCompany(
                      "vatNumber",
                      event.target.value,
                    )
                  }
                  placeholder="BE..."
                  className={inputClass}
                />
              </div>


              <div>
                <label className={labelClass}>
                  Numéro d'entreprise
                </label>

                <input
                  value={
                    profile.company.registrationNumber ??
                    ""
                  }
                  onChange={event =>
                    updateCompany(
                      "registrationNumber",
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </div>


              <div className="sm:col-span-2 border-t border-slate-200 pt-5">
                <p className="font-bold text-slate-700">
                  Adresse de facturation
                </p>
              </div>


              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Rue
                </label>

                <input
                  value={
                    profile.billingAddress.street ??
                    ""
                  }
                  onChange={event =>
                    updateBillingAddress(
                      "street",
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </div>


              <div>
                <label className={labelClass}>
                  Numéro
                </label>

                <input
                  value={
                    profile.billingAddress.houseNumber ??
                    ""
                  }
                  onChange={event =>
                    updateBillingAddress(
                      "houseNumber",
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </div>


              <div>
                <label className={labelClass}>
                  Boîte
                </label>

                <input
                  value={
                    profile.billingAddress.box ??
                    ""
                  }
                  onChange={event =>
                    updateBillingAddress(
                      "box",
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </div>


              <div>
                <label className={labelClass}>
                  Code postal
                </label>

                <input
                  value={
                    profile.billingAddress.postalCode ??
                    ""
                  }
                  onChange={event =>
                    updateBillingAddress(
                      "postalCode",
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </div>


              <div>
                <label className={labelClass}>
                  Ville
                </label>

                <input
                  value={
                    profile.billingAddress.city ??
                    ""
                  }
                  onChange={event =>
                    updateBillingAddress(
                      "city",
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </div>


              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Pays
                </label>

                <input
                  value={
                    profile.billingAddress.country ??
                    ""
                  }
                  onChange={event =>
                    updateBillingAddress(
                      "country",
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </div>

            </div>
          </div>

          )}

          <div className={sectionClass}>

            <h2 className="text-xl font-black text-[#10265f]">
              Préférences
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>
                <label className={labelClass}>
                  Langue préférée
                </label>

                <select
                  value={
                    profile.preferences.language ??
                    ""
                  }
                  onChange={event =>
                    updatePreferences(
                      "language",
                      event.target.value,
                    )
                  }
                  className={inputClass}
                >
                  <option value="">
                    Non renseignée
                  </option>

                  <option value="fr">
                    Français
                  </option>

                  <option value="nl">
                    Nederlands
                  </option>

                  <option value="en">
                    English
                  </option>

                  <option value="tr">
                    Türkçe
                  </option>
                </select>
              </div>


              <div>
                <label className={labelClass}>
                  Contact préféré
                </label>

                <select
                  value={
                    profile.preferences
                      .preferredContactChannel ??
                    ""
                  }
                  onChange={event =>
                    updatePreferences(
                      "preferredContactChannel",
                      event.target.value,
                    )
                  }
                  className={inputClass}
                >
                  <option value="">
                    Non renseigné
                  </option>

                  <option value="email">
                    Email
                  </option>

                  <option value="sms">
                    SMS
                  </option>

                  <option value="phone">
                    Téléphone
                  </option>
                </select>
              </div>

            </div>
          </div>


          <div className={sectionClass}>

            <h2 className="text-xl font-black text-[#10265f]">
              Communications commerciales
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Ces autorisations sont facultatives et peuvent être retirées à tout moment.
            </p>


            <label className="mt-5 flex cursor-pointer items-start gap-3">

              <input
                type="checkbox"
                checked={
                  profile.marketingEmail
                }
                onChange={event =>
                  updateMain(
                    "marketingEmail",
                    event.target.checked,
                  )
                }
                className="mt-1 h-5 w-5"
              />

              <span>
                <span className="font-bold text-slate-900">
                  Marketing par email
                </span>

                <span className="block text-sm text-slate-600">
                  Recevoir les offres et actualités TaPieceAuto par email.
                </span>
              </span>

            </label>


            <label className="mt-5 flex cursor-pointer items-start gap-3">

              <input
                type="checkbox"
                checked={
                  profile.marketingSms
                }
                onChange={event =>
                  updateMain(
                    "marketingSms",
                    event.target.checked,
                  )
                }
                className="mt-1 h-5 w-5"
              />

              <span>
                <span className="font-bold text-slate-900">
                  Marketing par SMS
                </span>

                <span className="block text-sm text-slate-600">
                  Recevoir les offres TaPieceAuto par SMS.
                </span>
              </span>

            </label>

          </div>


          {error && (
            <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 font-semibold text-red-700">
              {error}
            </div>
          )}


          {saved && (
            <div className="mt-6 rounded-xl bg-green-50 px-4 py-3 font-semibold text-green-800">
              Profil enregistré.
            </div>
          )}


          <div className="mt-8 flex flex-wrap gap-3">

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                void saveProfile()
              }
              className="rounded-xl bg-[#1b4fd8] px-6 py-3 font-black text-white shadow-sm disabled:opacity-50"
            >
              {saving
                ? "Enregistrement..."
                : "Enregistrer les modifications"}
            </button>


            <button
              type="button"
              onClick={() =>
                router.push("/client")
              }
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700"
            >
              Annuler
            </button>

          </div>

        </section>
      </div>
    </main>
  );
}