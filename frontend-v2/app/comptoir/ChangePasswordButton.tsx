"use client";

import { FormEvent, useState } from "react";

export default function ChangePasswordButton() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function closeModal() {
    if (saving) return;

    setOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmation("");
    setMessage(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (newPassword !== confirmation) {
      setMessage("Les deux nouveaux mots de passe sont différents.");
      return;
    }

    if (newPassword.length < 10) {
      setMessage("Le nouveau mot de passe doit contenir au moins 10 caractères.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/comptoir/password", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        if (data.error === "CURRENT_PASSWORD_INVALID") {
          setMessage("L'ancien mot de passe est incorrect.");
        } else if (data.error === "PASSWORD_TOO_SHORT") {
          setMessage("Le nouveau mot de passe doit contenir au moins 10 caractères.");
        } else {
          setMessage("Modification impossible.");
        }

        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmation("");
      setMessage("Mot de passe modifié.");
    } catch {
      setMessage("Erreur de connexion.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
      >
        Changer mon mot de passe
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.15em] text-blue-700">
                  TaPieceAuto
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  Changer mon mot de passe
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl px-3 py-2 font-black text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Ancien mot de passe
                </span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) =>
                    setCurrentPassword(event.target.value)
                  }
                  required
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Nouveau mot de passe
                </span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                  required
                  minLength={10}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Confirmer le nouveau mot de passe
                </span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmation}
                  onChange={(event) =>
                    setConfirmation(event.target.value)
                  }
                  required
                  minLength={10}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </label>

              {message && (
                <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
                  {message}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-bold"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-blue-700 px-4 py-3 font-black text-white disabled:opacity-50"
                >
                  {saving ? "Enregistrement..." : "Modifier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}