"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import ChangePasswordButton from "../ChangePasswordButton";

type SellerProfile = {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  organizationId: string;
  organizationName: string;
  logoUrl: string | null;
};

export default function SellerProfilePage() {
  const [profile, setProfile] =
    useState<SellerProfile | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] =
    useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await fetch(
          "/api/comptoir/profile",
          {
            cache: "no-store",
            credentials: "include",
          },
        );

        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error("PROFILE_LOAD_FAILED");
        }

        if (!active) {
          return;
        }

        setProfile(data.profile);
        setFirstName(data.profile.firstName);
        setLastName(data.profile.lastName);
        setPhone(data.profile.phone);
      } catch {
        if (active) {
          setMessage(
            "Impossible de charger le profil vendeur.",
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
  }, []);

  async function saveProfile(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage(null);
    setSaving(true);

    try {
      const response = await fetch(
        "/api/comptoir/profile",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName,
            lastName,
            phone,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        if (data.error === "PHONE_ALREADY_EXISTS") {
          setMessage(
            "Ce numéro de téléphone est déjà utilisé par un autre compte.",
          );
        } else {
          setMessage(
            "Impossible d'enregistrer les modifications.",
          );
        }

        return;
      }

      setProfile((current) =>
        current
          ? {
              ...current,
              firstName: data.profile.firstName,
              lastName: data.profile.lastName,
              phone: data.profile.phone,
            }
          : current,
      );

      setFirstName(data.profile.firstName);
      setLastName(data.profile.lastName);
      setPhone(data.profile.phone);

      setMessage("Profil enregistré.");
    } catch {
      setMessage("Erreur de connexion.");
    } finally {
      setSaving(false);
    }
  }

  const initials =
    profile?.organizationName
      ?.split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "TP";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <a
          href="/comptoir"
          className="text-sm font-bold text-blue-700 hover:underline"
        >
          ← Retour au comptoir
        </a>

        <div className="mt-5 rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 font-black text-slate-700">
              {profile?.logoUrl ? (
                <img
                  src={profile.logoUrl}
                  alt=""
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                initials
              )}
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.15em] text-blue-700">
                Profil vendeur
              </p>

              <h1 className="mt-1 text-3xl font-black text-slate-950">
                {loading
                  ? "Chargement..."
                  : `${firstName} ${lastName}`.trim()}
              </h1>

              <p className="mt-1 font-semibold text-slate-500">
                {profile?.organizationName ?? ""}
              </p>
            </div>
          </div>

          <form
            onSubmit={saveProfile}
            className="mt-8 border-t border-slate-200 pt-6"
          >
            <h2 className="text-lg font-black text-slate-900">
              Mes informations
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Prénom
                </span>

                <input
                  type="text"
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(event.target.value)
                  }
                  disabled={loading}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Nom
                </span>

                <input
                  type="text"
                  value={lastName}
                  onChange={(event) =>
                    setLastName(event.target.value)
                  }
                  disabled={loading}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Téléphone
                </span>

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  disabled={loading}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Email
                </span>

                <input
                  type="email"
                  value={profile?.email ?? ""}
                  disabled
                  className="mt-1 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
                />

                <span className="mt-1 block text-xs text-slate-500">
                  Identifiant de connexion — non modifiable.
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Grossiste
                </span>

                <input
                  type="text"
                  value={profile?.organizationName ?? ""}
                  disabled
                  className="mt-1 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Rôle
                </span>

                <input
                  type="text"
                  value="Vendeur"
                  disabled
                  className="mt-1 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
                />
              </label>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <button
                type="submit"
                disabled={saving || loading}
                className="rounded-xl bg-blue-700 px-5 py-3 font-black text-white disabled:opacity-50"
              >
                {saving
                  ? "Enregistrement..."
                  : "Enregistrer mes modifications"}
              </button>

              {message && (
                <p className="text-sm font-semibold text-slate-600">
                  {message}
                </p>
              )}
            </div>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <h2 className="text-lg font-black text-slate-900">
              Compte et sécurité
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Le mot de passe peut être changé à tout moment.
            </p>

            <ChangePasswordButton />
          </div>
        </div>
      </div>
    </main>
  );
}