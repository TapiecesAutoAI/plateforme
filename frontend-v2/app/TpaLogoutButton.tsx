"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

type SessionIdentity = {
  displayName: string;
  role: string;
};

function roleLabel(
  role: string,
): string {
  if (role === "seller") {
    return "Vendeur";
  }

  if (
    role === "wholesaler_admin"
  ) {
    return "Admin Grossiste";
  }

  if (
    role === "super_admin"
  ) {
    return "Super Admin TPA";
  }

  if (role === "client") {
    return "Client";
  }

  return role || "Compte TPA";
}

function initials(
  displayName: string,
): string {
  const parts =
    displayName
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (parts.length === 0) {
    return "TP";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

export default function TpaLogoutButton() {
  const pathname =
    usePathname();

  const searchParams = useSearchParams();

  const router =
    useRouter();

    const isSuperAdminMode = searchParams.get("mode") === "super-admin";

const menuRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const [
    identity,
    setIdentity,
  ] =
    useState<SessionIdentity | null>(
      null,
    );

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [
    confirmOpen,
    setConfirmOpen,
  ] =
    useState(false);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const response =
          await fetch(
            "/api/auth/session",
            {
              method: "GET",
              cache: "no-store",
            },
          );

        if (
          !active ||
          !response.ok
        ) {
          if (active) {
            setIdentity(null);
          }

          return;
        }

        const data =
          await response.json();

        if (!active) {
          return;
        }

        setIdentity({
          displayName:
            typeof data.displayName ===
            "string"
              ? data.displayName
              : "Compte TPA",

          role:
            typeof data.accessRole ===
            "string"
              ? data.accessRole
              : typeof data.role ===
                  "string"
                ? data.role
                : "",
        });
      } catch {
        if (active) {
          setIdentity(null);
        }
      }
    }

    void checkSession();

    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function closeMenu(
      event: MouseEvent,
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node,
        )
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      closeMenu,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        closeMenu,
      );
    };
  }, [menuOpen]);

  if (
    pathname === "/comptoir" ||
    pathname === "/login" ||
    pathname.startsWith(
      "/login/",
    ) ||
    pathname === "/achat-rapide" ||
    pathname.startsWith(
      "/achat-rapide/",
    ) ||
    pathname === "/showroom" ||
    pathname.startsWith(
      "/showroom/",
    ) ||
    !identity
  ) {
    return null;
  }

  async function logout() {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        const data = await response.json();
        window.alert(data.error === "ACTIVE_TICKET_BLOCKS_PRESENCE" ? "Traitez d’abord le ticket appelé ou en cours avant de quitter le poste." : "Sortie non confirmée. Réessayez.");
        return;
      }
      setIdentity(null); setMenuOpen(false); setConfirmOpen(false);
      window.location.replace("/login");
    } catch { window.alert("Sortie non confirmée. Vérifiez la connexion."); }
    finally { setLoading(false); }
  }

  function openProfile() {
    if (isSuperAdminMode) {
      setMenuOpen(false);
      router.push("/super-admin");
      return;
    }
    setMenuOpen(false);

    if (!identity) {
      return;
    }

    if (
      identity.role === "seller"
    ) {
      router.push(
        "/comptoir/profil",
      );

      return;
    }

    if (
      identity.role ===
      "wholesaler_admin"
    ) {
      router.push(
        "/grossiste/organisation",
      );

      return;
    }

    if (
      identity.role ===
      "super_admin"
    ) {
      router.push(
        "/super-admin",
      );

      return;
    }

    router.push("/client");
  }

  return (
    <>
      <div
        ref={menuRef}
        className="fixed right-5 top-5 z-[100]"
      >
        <button
          type="button"
          onClick={() =>
            setMenuOpen(
              (current) => !current,
            )
          }
          aria-expanded={menuOpen}
          aria-label="Menu du compte"
          className="flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-slate-950 px-4 text-sm font-black text-white shadow-xl backdrop-blur transition hover:bg-slate-800"
        >
          <span>
  {isSuperAdminMode
    ? "ZT"
    : initials(identity.displayName)}
</span>

          <span
            aria-hidden="true"
            className={`text-xs transition-transform duration-200 ${
              menuOpen
                ? "rotate-180"
                : ""
            }`}
          >
            ▼
          </span>
        </button>

        {menuOpen ? (
          <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

            <div className="border-b border-slate-200 px-5 py-4">
              <p className="truncate font-black text-slate-950">
                {isSuperAdminMode ? "Zeki TURKKAN" : identity.displayName}
              </p>

              <p className="mt-1 text-sm font-bold text-blue-700">
                {isSuperAdminMode ? "Super Admin TPA" : roleLabel(identity.role)}
              </p>
            </div>

            <div className="p-2">

              <button
                type="button"
                onClick={openProfile}
                className="flex w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-800 transition hover:bg-slate-100"
              >
                Mon profil
              </button>

              {identity.role === "seller" ? (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/comptoir/rh");
                  }}
                  className="flex w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-800 transition hover:bg-slate-100"
                >
                  Mon espace RH
                </button>
              ) : null}

              {isSuperAdminMode ? (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/super-admin");
                  }}
                  className="flex w-full rounded-xl px-4 py-3 text-left text-sm font-black text-red-700 transition hover:bg-red-50"
                >
                  Quitter Admin Magasin et revenir au Super Admin TPA
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                }}
                className="flex w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-800 transition hover:bg-slate-100"
              >
                Paramètres du compte
              </button>

            </div>

            <div className="border-t border-slate-200 p-2">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmOpen(true);
                }}
                className="flex w-full rounded-xl px-4 py-3 text-left text-sm font-black text-red-700 transition hover:bg-red-50"
              >
                Déconnexion
              </button>
            </div>

          </div>
        ) : null}
      </div>

      {confirmOpen ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={() =>
            !loading &&
            setConfirmOpen(false)
          }
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tpa-logout-title"
            className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-950 p-7 text-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-lg font-black">
              {initials(
                identity.displayName,
              )}
            </div>

            <h2
              id="tpa-logout-title"
              className="mt-5 text-center text-2xl font-black"
            >
              Se déconnecter ?
            </h2>

            <p className="mt-3 text-center text-sm leading-6 text-slate-300">
              Voulez-vous vraiment quitter votre espace TaPieceAuto ?
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setConfirmOpen(false)
                }
                disabled={loading}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-black text-white transition hover:bg-white/10 disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={logout}
                disabled={loading}
                className="rounded-xl bg-blue-600 px-4 py-3 font-black text-white transition hover:bg-blue-500 disabled:opacity-50"
              >
                {loading
                  ? "Déconnexion..."
                  : "Se déconnecter"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}