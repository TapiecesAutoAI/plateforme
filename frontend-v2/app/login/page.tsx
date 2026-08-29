"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import styles from "./ClientLogin.module.css";


type Brand = {
  id: string;
  name: string;
  src: string;
};


const BRANDS: Brand[] = [
  {
    id: "castrol",
    name: "CASTROL",
    src: "/brands/showroom/castrol.svg",
  },
  {
    id: "ardeca",
    name: "ARDECA",
    src: "/brands/showroom/ardeca.svg",
  },
  {
    id: "bardahl",
    name: "BARDAHL",
    src: "/brands/showroom/bardahl.png",
  },
  {
    id: "varta",
    name: "VARTA",
    src: "/brands/showroom/varta.jpg",
  },
  {
    id: "knecht",
    name: "KNECHT",
    src: "/brands/showroom/knecht.jpg",
  },
  {
    id: "facom",
    name: "FACOM",
    src: "/brands/showroom/facom.jpg",
  },
  {
    id: "beta",
    name: "BETA",
    src: "/brands/showroom/beta.jpg",
  },
];


function BrandLogo({
  brand,
}: {
  brand: Brand;
}) {

  const logoClass =
    brand.name === "BARDAHL"
      ? "h-[88px] w-[215px] object-contain scale-[2.15]"
      : brand.name === "FACOM"
        ? "h-[88px] w-[215px] object-contain scale-[2.25]"
        : "h-[88px] w-[215px] object-contain scale-[1.10]";

  return (

    <div className="flex h-28 min-w-[250px] items-center justify-center px-5">

      <div className="flex h-24 w-[225px] items-center justify-center overflow-hidden rounded-2xl bg-white px-2 py-2 shadow-xl ring-1 ring-black/10">

        <img
          src={brand.src}
          alt={brand.name}
          draggable={false}
          className={logoClass}
          onError={
            event => {

              event.currentTarget.style.display =
                "none";

              const fallback =
                event.currentTarget
                  .nextElementSibling as HTMLElement | null;

              if (fallback) {
                fallback.style.display =
                  "block";
              }
            }
          }
        />

        <span className="hidden whitespace-nowrap text-xl font-black tracking-wide text-slate-900">
          {brand.name}
        </span>

      </div>

    </div>
  );
}


function BrandMarquee() {

  const brands = [
    ...BRANDS,
    ...BRANDS,
  ];

  return (

    <div className="relative w-full overflow-hidden border-y border-white/10 bg-slate-950/30 py-5 backdrop-blur-sm">

      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-slate-950 to-transparent" />

      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-blue-950 to-transparent" />

      <div className={`${styles.marquee} flex w-max items-center`}>

        {
          brands.map(
            (
              brand,
              index,
            ) => (

              <BrandLogo
                key={`${brand.id}-${index}`}
                brand={brand}
              />

            ),
          )
        }

      </div>

    </div>
  );
}


export default function ClientLoginPage() {

  const router =
    useRouter();

  const [
    email,
    setEmail,
  ] = useState("");

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
          "/api/auth/client/login",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                email,
                password,
              }),
          },
        );

      if (!response.ok) {

        setError(
          "E-mail ou mot de passe incorrect.",
        );

        return;
      }

      router.replace(
        "/client",
      );

      router.refresh();

    } catch {

      setError(
        "Impossible de se connecter pour le moment.",
      );

    } finally {

      setLoading(false);
    }
  }


  return (

    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-950 via-slate-950 to-blue-800 px-6 pb-40 text-white w-full min-w-0 overflow-x-hidden">

      {/* LOGO ZT */}
      <div className="absolute left-6 top-6">

        <img
          src="/zt-consult-logo.png"
          alt="ZT Consult"
          className="h-16 w-16 rounded-2xl object-contain shadow-xl"
        />

      </div>



      {/* LOGIN */}
      <div className="w-full max-w-md">

        <div className="text-center">

          <div className="relative mx-auto h-24 w-24">

            <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/20" />

            <div className="absolute inset-1 rounded-full bg-blue-500/20 blur-xl" />

            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-blue-300/30 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 text-3xl font-black text-white shadow-[0_0_35px_rgba(37,99,235,0.55)]">

              <div className="absolute inset-[5px] rounded-full border border-white/15" />

              <span className="relative z-10">
                TPA
              </span>

            </div>

          </div>

          <h1 className="mt-5 text-4xl font-black">
            TaPieceAuto
          </h1>

          <p className="mt-2 text-blue-200">
            Espace client
          </p>

        </div>


        <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">

          <form
            onSubmit={submit}
          >

            <label className="mb-2 block text-sm font-bold">
              Adresse e-mail
            </label>

            <input
              type="email"
              value={email}
              onChange={
                event =>
                  setEmail(
                    event.target.value,
                  )
              }
              autoComplete="email"
              required
              className="w-full rounded-2xl border border-white/20 bg-white px-5 py-4 text-lg text-slate-950 outline-none focus:ring-4 focus:ring-blue-400/30"
              placeholder="vous@exemple.be"
            />


            <label className="mb-2 mt-5 block text-sm font-bold">
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
              autoComplete="current-password"
              required
              className="w-full rounded-2xl border border-white/20 bg-white px-5 py-4 text-lg text-slate-950 outline-none focus:ring-4 focus:ring-blue-400/30"
              placeholder="Votre mot de passe"
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
              className="mt-6 w-full rounded-2xl bg-blue-600 px-6 py-4 text-lg font-black transition hover:bg-blue-500 disabled:opacity-50"
            >

              {
                loading
                  ? "Connexion..."
                  : "Se connecter"
              }

            </button>

          </form>


          <button
            type="button"
            className="mt-5 w-full text-center text-sm font-semibold text-blue-200 hover:text-white"
          >
            Mot de passe oublié ?
          </button>


          <div className="mt-7 border-t border-white/10 pt-6 text-center">

            <p className="text-sm text-slate-300">
              Pas encore de compte ?
            </p>

            <button
              type="button"
              className="mt-2 font-black text-blue-300 hover:text-white"
            >
              Créer mon compte TPA
            </button>

          </div>

        </div>

      </div>


      {/* BANDEAU MARQUES */}
      <div className="absolute bottom-[3vh] left-0 z-20 w-full">

        <BrandMarquee />

      </div>

    </main>
  );
}