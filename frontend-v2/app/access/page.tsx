"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";


export default function AccessPage() {

  const router =
    useRouter();


  const [
    password,
    setPassword,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);


  async function submit(
    event:
      FormEvent<HTMLFormElement>,
  ) {

    event.preventDefault();

    setError("");
    setLoading(true);

    try {

      const response =
        await fetch(
          "/api/access",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                password,
              }),
          },
        );


      if (!response.ok) {

        setError(
          "Mot de passe incorrect.",
        );

        return;
      }


      const params =
        new URLSearchParams(
          window.location.search,
        );

      const next =
        params.get(
          "next",
        ) || "/showroom";

      router.replace(
        next,
      );

      router.refresh();

    } catch {

      setError(
        "Impossible de vérifier l'accès.",
      );

    } finally {

      setLoading(false);

    }
  }


  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-950 via-slate-950 to-blue-800 px-6 text-white">

      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">

        <div className="text-center">

          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-4xl font-black shadow-xl">
            TPA
          </div>

          <h1 className="mt-6 text-3xl font-black">
            TaPiecesAuto
          </h1>

          <p className="mt-3 text-blue-200">
            Site actuellement en développement.
          </p>

          <p className="mt-1 text-sm text-slate-300">
            Accès privé uniquement.
          </p>

        </div>


        <form
          onSubmit={submit}
          className="mt-8"
        >

          <label className="mb-2 block text-sm font-bold">
            Mot de passe
          </label>

          <input
            type="password"
            value={password}
            onChange={
              event =>
                setPassword(
                  event.target.value,
                )
            }
            autoFocus
            autoComplete="current-password"
            className="w-full rounded-2xl border border-white/20 bg-white px-5 py-4 text-lg text-slate-950 outline-none focus:ring-4 focus:ring-blue-400/30"
            placeholder="Mot de passe d'accès"
          />


          {
            error && (

              <div className="mt-4 rounded-xl bg-red-500/20 px-4 py-3 text-sm font-semibold text-red-100">
                {error}
              </div>

            )
          }


          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-blue-600 px-6 py-4 text-lg font-black text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {
              loading
                ? "Vérification..."
                : "Accéder à TaPiecesAuto"
            }
          </button>

        </form>

      </div>

    </main>
  );
}
