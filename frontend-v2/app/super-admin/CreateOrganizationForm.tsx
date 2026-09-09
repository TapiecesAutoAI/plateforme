"use client";

import {
  FormEvent,
  useState,
} from "react";

type BranchForm = {
  name: string;
  phone: string;
  email: string;
  street: string;
  houseNumber: string;
  box: string;
  postalCode: string;
  city: string;
  country: string;
};

const emptyBranch = (): BranchForm => ({
  name: "",
  phone: "",
  email: "",
  street: "",
  houseNumber: "",
  box: "",
  postalCode: "",
  city: "",
  country: "Belgique",
});

export default function CreateOrganizationForm() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");

  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [box, setBox] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Belgique");

  const [branches, setBranches] = useState<BranchForm[]>([]);

  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminLastName, setAdminLastName] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  const [createdLogin, setCreatedLogin] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");

  function addBranch() {
    setBranches((current) => [
      ...current,
      emptyBranch(),
    ]);
  }

  function removeBranch(index: number) {
    setBranches((current) =>
      current.filter((_, i) => i !== index),
    );
  }

  function updateBranch(
    index: number,
    field: keyof BranchForm,
    value: string,
  ) {
    setBranches((current) =>
      current.map((branch, i) =>
        i === index
          ? {
              ...branch,
              [field]: value,
            }
          : branch,
      ),
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setCreatedLogin("");
    setTemporaryPassword("");

    try {
      const response = await fetch(
        "/api/admin/organizations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            legalName,
            vatNumber,
            registrationNumber,
            phone,
            email,
            website,

            headOffice: {
              street,
              houseNumber,
              box,
              postalCode,
              city,
              country,
            },

            branches: branches.map((branch) => ({
              name: branch.name,
              phone: branch.phone,
              email: branch.email,
              address: {
                street: branch.street,
                houseNumber: branch.houseNumber,
                box: branch.box,
                postalCode: branch.postalCode,
                city: branch.city,
                country: branch.country,
              },
            })),

            adminFirstName,
            adminLastName,
            adminPhone,
            adminEmail,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.ok) {
        setMessage(
          result.error
            ? `Erreur : ${result.error}`
            : "Création impossible.",
        );
        return;
      }

      setCreatedLogin(
        result.administrator.loginEmail,
      );

      setTemporaryPassword(
        result.temporaryPassword,
      );

      setMessage(
        `Grossiste créé : ${result.organization.name}`,
      );
    } catch {
      setMessage(
        "Erreur de communication avec TPA.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6">

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="w-full rounded-2xl border border-red-400/30 bg-[#E30A17] px-5 py-4 text-left font-black text-white shadow-lg transition hover:bg-[#c80914]"
      >
        {open
          ? "Fermer le formulaire grossiste"
          : "+ Nouveau grossiste"}
      </button>

      {open ? (
        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-6 rounded-3xl border border-red-400/30 bg-red-950/20 p-5 shadow-2xl backdrop-blur sm:p-7"
        >

          <section>
            <h3 className="text-xl font-black text-red-200">
              1. Société
            </h3>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom commercial *"
                className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-red-400"
              />

              <input
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="Raison sociale"
                className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-red-400"
              />

              <input
                value={vatNumber}
                onChange={(e) => setVatNumber(e.target.value)}
                placeholder="N° TVA"
                className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-red-400"
              />

              <input
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="N° entreprise / registre"
                className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-red-400"
              />
            </div>
          </section>

          <section>
            <h3 className="text-xl font-black text-red-200">
              2. Coordonnées
            </h3>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Téléphone"
                className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-red-400"
              />

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email société"
                className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-red-400"
              />

              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="Site web"
                className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-red-400"
              />
            </div>
          </section>

          <section>
            <h3 className="text-xl font-black text-red-200">
              3. Siège principal
            </h3>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <input
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Rue"
                className="md:col-span-2 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-red-400"
              />

              <input
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder="N°"
                className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-red-400"
              />

              <input
                value={box}
                onChange={(e) => setBox(e.target.value)}
                placeholder="Boîte"
                className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-red-400"
              />

              <input
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Code postal"
                className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-red-400"
              />

              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ville"
                className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-red-400"
              />

              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Pays"
                className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-red-400"
              />
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-red-200">
                  4. Succursales
                </h3>
                <p className="mt-1 text-sm text-red-100/80">
                  Ajoute uniquement les points de vente supplémentaires.
                </p>
              </div>

              <button
                type="button"
                onClick={addBranch}
                className="rounded-xl border border-red-400/30 bg-red-500/20 px-4 py-2 font-bold text-red-100 hover:bg-red-500/30"
              >
                + Ajouter
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {branches.map((branch, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-red-400/20 bg-slate-950/30 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-black">
                      Succursale {index + 1}
                    </p>

                    <button
                      type="button"
                      onClick={() => removeBranch(index)}
                      className="text-sm font-bold text-red-300"
                    >
                      Supprimer
                    </button>
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    {(
                      [
                        ["name", "Nom de la succursale"],
                        ["phone", "Téléphone"],
                        ["email", "Email"],
                        ["street", "Rue"],
                        ["houseNumber", "N°"],
                        ["box", "Boîte"],
                        ["postalCode", "Code postal"],
                        ["city", "Ville"],
                        ["country", "Pays"],
                      ] as const
                    ).map(([field, placeholder]) => (
                      <input
                        key={field}
                        value={branch[field]}
                        onChange={(e) =>
                          updateBranch(
                            index,
                            field,
                            e.target.value,
                          )
                        }
                        placeholder={placeholder}
                        className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-red-400"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-black text-red-200">
              5. Administrateur du grossiste
            </h3>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input
                value={adminFirstName}
                onChange={(e) => setAdminFirstName(e.target.value)}
                placeholder="Prénom *"
                className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-red-400"
              />

              <input
                value={adminLastName}
                onChange={(e) => setAdminLastName(e.target.value)}
                placeholder="Nom *"
                className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-red-400"
              />

              <input
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                placeholder="Téléphone *"
                className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-red-400"
              />

              <input
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="Email / login *"
                className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-red-400"
              />
            </div>
          </section>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-[#E30A17] px-5 py-4 font-black text-white shadow-lg transition hover:bg-[#c80914] disabled:opacity-50"
          >
            {saving
              ? "Création en cours..."
              : "Créer le grossiste et son administrateur"}
          </button>

          {message ? (
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="font-bold">
                {message}
              </p>

              {createdLogin && temporaryPassword ? (
                <div className="mt-4 space-y-2">
                  <p>
                    <span className="text-red-200">
                      Login :
                    </span>{" "}
                    <strong>{createdLogin}</strong>
                  </p>

                  <p>
                    <span className="text-red-200">
                      Mot de passe temporaire :
                    </span>{" "}
                    <strong>{temporaryPassword}</strong>
                  </p>

                  <p className="text-xs text-red-200">
                    À conserver immédiatement. Le mot de passe n'est pas stocké en clair.
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

        </form>
      ) : null}

    </div>
  );
}