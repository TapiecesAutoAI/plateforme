"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

type Branch = {
  branchId: string;
  branchCode?: string;
  name: string;
  photoUrl?: string;
  status: "active" | "disabled";
  phone?: string;
  email?: string;
  address?: {
    street?: string;
    houseNumber?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
  counters?: {
    counterId: string;
    number: number;
    name?: string;
    status: "active" | "disabled";
  }[];
  terminals?: {
    terminalId: string;
    name: string;
    status: "active" | "disabled";
  }[];

  staff?: {
    staffId: string;
    firstName: string;
    lastName: string;
    role:
      | "secretary"
      | "sales_representative"
      | "driver"
      | "custom";
    customRoleLabel?: string;
    photoUrl?: string;
    phone?: string;
    email?: string;
    status: "active" | "disabled";
  }[];
};

type Seller = {
  customerId: string;
  photoUrl?: string;
  firstName?: string;
  lastName?: string;
  loginEmail: string;
  userCode?: string;
  status: "active" | "disabled";

  sellerBranchAssignment?: {
    primaryBranchId?: string;
    allowedBranchIds: string[];
  };

  sellerCounterSettings?: {
    capabilities: {
      generalAdvice: boolean;
      partsOrder: boolean;
      quickPurchase: boolean;
      pickup: boolean;
      merchandiseReturn: boolean;
      refund: boolean;
      diagnostic: boolean;
      professionalCustomer: boolean;
    };

    permissions: {
      manualTicketSelection: boolean;
      viewFullQueue: boolean;
      counterSupervisor: boolean;
      deputySupervisor: boolean;
    };
  };
};

type BranchResponse = {
  ok: boolean;
  organizationId?: string;

  organizationName?: string;
  storePhotoUrl?: string | null;
  branches?: Branch[];
};

type SellerResponse = {
  ok: boolean;
  sellers?: Seller[];
};

type ViewMode =
  | "organigramme"
  | "tableau";

const SITE_PHOTOS = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=700&q=85",
];

const SELLER_PHOTOS = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=85",
  "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=250&q=85",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=85",
  "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?auto=format&fit=crop&w=250&q=85",
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=250&q=85",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=85",
];

const STAFF_PHOTOS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=85",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=85",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=85",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=85",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=85",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=85",
];

function staffRoleLabel(
  role:
    | "secretary"
    | "sales_representative"
    | "driver"
    | "custom",
  customRoleLabel?: string,
) {
  if (role === "custom") {
  return (
      customRoleLabel?.trim() ||
      "Autre fonction"
    );
  }

  if (role === "secretary") {
    return "Secrétaire";
  }

  if (role === "sales_representative") {
    return "Commercial";
  }

  return "Livreur";
}

function peoplePhotoSrc(photoUrl: string | undefined, organizationId: string | undefined) {
  if (!photoUrl) return "";
  if (!photoUrl.startsWith("tpa/organizations/")) return photoUrl;

  return `/api/grossiste/private-photo?organizationId=${encodeURIComponent(
    organizationId ?? "",
  )}&pathname=${encodeURIComponent(photoUrl)}`;
}
function sellerName(
  seller: Seller,
) {
  const centralName =
    [
      seller.firstName,
      seller.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

  if (centralName) {
    return centralName;
  }

  const emailName =
    seller.loginEmail
      .split("@")[0]
      ?.replace(/[._-]+/g, " ")
      .trim();

  if (!emailName) {
    return seller.userCode ??
      "Vendeur";
  }

  return emailName
    .split(" ")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}

function sellerSkills(
  seller: Seller,
) {
  const capabilities =
    seller.sellerCounterSettings
      ?.capabilities;

  if (!capabilities) {
    return "Conseil";
  }

  const labels: string[] = [];

  if (capabilities.generalAdvice) {
    labels.push("Conseil");
  }

  if (capabilities.partsOrder) {
    labels.push("Commande");
  }

  if (capabilities.diagnostic) {
    labels.push("Diagnostic");
  }

  if (capabilities.merchandiseReturn) {
    labels.push("Retours");
  }

  if (capabilities.refund) {
    labels.push("Remboursement");
  }

  if (capabilities.professionalCustomer) {
    labels.push("Client pro");
  }

  return labels.slice(0, 3).join(" · ") ||
    "Vendeur";
}

function addressText(
  branch: Branch,
) {
  const address =
    branch.address;

  if (!address) {
    return "Adresse du site";
  }

  const firstLine =
    [
      address.street,
      address.houseNumber,
    ]
      .filter(Boolean)
      .join(" ");

  const secondLine =
    [
      address.postalCode,
      address.city,
    ]
      .filter(Boolean)
      .join(" ");

  return [
    firstLine,
    secondLine,
  ]
    .filter(Boolean)
    .join(" · ") ||
    "Adresse du site";
}

function NavIcon({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="flex h-7 w-7 items-center justify-center text-xl">
      {children}
    </span>
  );
}

function BranchAddress({
  branch,
}: {
  branch: Branch;
}) {
  const streetLine = [
    branch.address?.street,
    branch.address?.houseNumber,
  ]
    .filter(Boolean)
    .join(" ");

  const cityLine = [
    branch.address?.postalCode,
    branch.address?.city,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <span className="block truncate">
        {streetLine || "Adresse non renseignée"}
      </span>

      {cityLine ? (
        <span className="block truncate">
          {cityLine}
        </span>
      ) : null}
    </>
  );
}

function branchDisplayName(
  name: string,
): string {
  const match =
    name.match(
      /\bsuccursale\b[\s:-]*(.+)$/i,
    );

  if (!match?.[1]?.trim()) {
    return name;
  }

  return `Succursale de ${match[1].trim()}`;
}

export default function GrossisteOrganizationView({ organizationId }: { organizationId?: string }) {
  const searchParams = useSearchParams();
  const isSuperAdminMode = searchParams.get("mode") === "super-admin";
  const interventionQuery = organizationId && isSuperAdminMode
    ? `?organizationId=${encodeURIComponent(organizationId)}&mode=super-admin`
    : "";
  const [mode, setMode] =
    useState<ViewMode>(
      "organigramme",
    );

  const [organizationName, setOrganizationName] =
    useState("GROSSISTE");


  const [storePhotoUrl, setStorePhotoUrl] = useState<string | null>(null);

  const [branches, setBranches] =
    useState<Branch[]>([]);

  const [sellers, setSellers] =
    useState<Seller[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [expandedBranches, setExpandedBranches] =
    useState<Record<string, boolean>>({});

  const [error, setError] =
    useState("");

  const loadData =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const [
          branchResponse,
          sellerResponse,
        ] = await Promise.all([
          fetch(
            organizationId ? `/api/grossiste/branches?organizationId=${encodeURIComponent(organizationId)}` : "/api/grossiste/branches",
            {
              method: "GET",
              cache: "no-store",
            },
          ),
          fetch(
            organizationId ? `/api/grossiste/sellers?organizationId=${encodeURIComponent(organizationId)}` : "/api/grossiste/sellers",
            {
              method: "GET",
              cache: "no-store",
            },
          ),
        ]);

        if (
          !branchResponse.ok ||
          !sellerResponse.ok
        ) {
          throw new Error(
            "Impossible de charger l'organisation.",
          );
        }

        const branchData =
          await branchResponse.json() as BranchResponse;

        const sellerData =
          await sellerResponse.json() as SellerResponse;

        setOrganizationName(
          branchData.organizationName ||
          "GROSSISTE",
        );


        setStorePhotoUrl(branchData.storePhotoUrl ?? null);

        setBranches(
          branchData.branches ?? [],
        );

        setSellers(
          (sellerData.sellers ?? [])
            .filter(
              (seller) =>
                seller.status === "active",
            ),
        );
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Chargement impossible.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const savedMode =
      window.localStorage.getItem(
        "tpa:grossiste:organisation:view",
      );

    if (
      savedMode === "organigramme" ||
      savedMode === "tableau"
    ) {
      setMode(savedMode);
    }
  }, []);



  const uploadOrganizationPhoto = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        throw new Error("Veuillez sélectionner une image.");
      }
      if (file.size > 8 * 1024 * 1024) {
        throw new Error("La photo ne peut pas dépasser 8 Mo.");
      }

      const formData = new FormData();
      formData.append("file", file);
      if (organizationId) {
        formData.append("organizationId", organizationId);
      }

      const response = await fetch(
        "/api/grossiste/organization-photo",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok || !data.ok || !data.url) {
        throw new Error(
          data.error || "Upload de la photo impossible.",
        );
      }

      setStorePhotoUrl(data.url);
    },
    [organizationId],
  );

  const uploadBranchPhoto = useCallback(
    async (
      branchId: string,
      file: File,
    ) => {
      if (!file.type.startsWith("image/")) {
        throw new Error(
          "Veuillez sélectionner une image.",
        );
      }
      if (file.size > 8 * 1024 * 1024) {
        throw new Error(
          "La photo ne peut pas dépasser 8 Mo.",
        );
      }
      const formData = new FormData();
      formData.append(
        "file",
        file,
      );
      formData.append(
        "branchId",
        branchId,
      );
      if (organizationId) {
        formData.append(
          "organizationId",
          organizationId,
        );
      }
      const uploadResponse =
        await fetch(
          "/api/grossiste/branch-photo",
          {
            method: "POST",
            body: formData,
          },
        );
      const uploadData =
        await uploadResponse.json();
      if (
        !uploadResponse.ok ||
        !uploadData.ok ||
        !uploadData.url
      ) {
        throw new Error(
          uploadData.error ||
          "Upload de la photo impossible.",
        );
      }
      const patchResponse =
        await fetch(
          organizationId
            ? `/api/grossiste/branches?organizationId=${encodeURIComponent(organizationId)}`
            : "/api/grossiste/branches",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              branchId,
              photoUrl:
                uploadData.url,
            }),
          },
        );
      const patchData =
        await patchResponse.json();
      if (
        !patchResponse.ok ||
        !patchData.ok
      ) {
        throw new Error(
          patchData.error ||
          "Enregistrement de la photo impossible.",
        );
      }
      setBranches(
        (currentBranches) =>
          currentBranches.map(
            (branch) =>
              branch.branchId === branchId
                ? {
                    ...branch,
                    photoUrl:
                      uploadData.url,
                  }
                : branch,
          ),
      );
    },
    [organizationId],
  );
  const activeCounters =
    useMemo(
      () =>
        branches.reduce(
          (total, branch) =>
            total +
            (
              branch.counters ?? []
            ).filter(
              (counter) =>
                counter.status === "active",
            ).length,
          0,
        ),
      [branches],
    );

  const activeTerminals =
    useMemo(
      () =>
        branches.reduce(
          (total, branch) =>
            total +
            (
              branch.terminals ?? []
            ).filter(
              (terminal) =>
                terminal.status === "active",
            ).length,
          0,
        ),
      [branches],
    );

  function changeMode(
    nextMode: ViewMode,
  ) {
    setMode(nextMode);

    window.localStorage.setItem(
      "tpa:grossiste:organisation:view",
      nextMode,
    );
  }

  function toggleBranch(
    branchId: string,
  ) {
    setExpandedBranches(
      (current) => ({
        ...current,
        [branchId]:
          !current[branchId],
      }),
    );
  }

  function sellersForBranch(
    branchId: string,
  ) {
    return sellers.filter(
      (seller) => {
        const assignment =
          seller.sellerBranchAssignment;

        if (!assignment) {
          return false;
        }

        return (
          assignment.primaryBranchId ===
            branchId ||
          assignment.allowedBranchIds
            ?.includes(branchId)
        );
      },
    );
  }



  return (
    <main
      className={
        isSuperAdminMode
          ? "min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-red-700 text-white"
          : "min-h-screen bg-[#061d35] text-white"
      }
    >
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden w-[255px] shrink-0 border-r border-blue-300/10 bg-[#092440] xl:flex xl:flex-col">

          <div className="flex h-[84px] items-center border-b border-white/10 px-7">
            <div>
              <div className="text-3xl font-black tracking-tight text-white">
                TPA
              </div>
              <div className="text-[9px] font-black tracking-[0.38em] text-blue-200">
                PIÈCES AUTO
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-7 text-[15px] font-semibold text-blue-100">

            <a
              href={`/grossiste${interventionQuery}`}
              className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/5"
            >
              <NavIcon>⌂</NavIcon>
              Tableau de bord
            </a>

            <a
              href={`/grossiste/organisation${interventionQuery}`}
              aria-current="page"
              className="flex items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-white shadow-lg shadow-blue-950/40"
            >
              <NavIcon>⌘</NavIcon>
              Organisation
            </a>

            <span
              aria-disabled="true"
              title="Fonction en préparation"
              className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-blue-200/45"
            >
              <NavIcon>⌖</NavIcon>
              Sites / Succursales
            </span>

            <span
              aria-disabled="true"
              title="Fonction en préparation"
              className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-blue-200/45"
            >
              <NavIcon>♙</NavIcon>
              Vendeurs
            </span>

            <span
              aria-disabled="true"
              title="Fonction en préparation"
              className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-blue-200/45"
            >
              <NavIcon>▣</NavIcon>
              Comptoirs
            </span>

            <span
              aria-disabled="true"
              title="Fonction en préparation"
              className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-blue-200/45"
            >
              <NavIcon>▥</NavIcon>
              Bornes
            </span>

            <span
              aria-disabled="true"
              title="Fonction en préparation"
              className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-blue-200/45"
            >
              <NavIcon>☷</NavIcon>
              File d'attente
            </span>

            <span
              aria-disabled="true"
              title="Fonction en préparation"
              className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-blue-200/45"
            >
              <NavIcon>♧</NavIcon>
              Clients
            </span>

            <span
              aria-disabled="true"
              title="Fonction en préparation"
              className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-blue-200/45"
            >
              <NavIcon>▥</NavIcon>
              Statistiques
            </span>

            <span
              aria-disabled="true"
              title="Fonction en préparation"
              className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-blue-200/45"
            >
              <NavIcon>⚙</NavIcon>
              Paramètres
            </span>
          </nav>

          <div className="m-4 rounded-2xl border border-blue-400/30 bg-blue-400/5 p-5">
            <div className="font-black">
              ? &nbsp; Besoin d'aide ?
            </div>

            <p className="mt-3 text-sm leading-5 text-blue-200">
              Une question ? Notre équipe est là pour vous accompagner.
            </p>

            <button
              type="button"
              className="mt-4 w-full rounded-xl border border-blue-400/50 px-4 py-2 text-sm font-bold text-blue-200"
            >
              Nous contacter
            </button>
          </div>

        </aside>

        {/* CONTENT */}
        <section className="min-w-0 flex-1">

          {/* TOPBAR */}
          <header className="flex h-[84px] items-center justify-between border-b border-white/10 bg-[#061b31] px-7 pr-40 lg:pl-10 lg:pr-44">

            <div>
              <div className="text-[22px] font-black">
                {organizationName}
              </div>

              <div className="text-sm text-blue-200">
                Administration
              </div>
            </div>

            <div className="flex items-center gap-6">

              <div className="text-xl">
                ♧
              </div>

              <div className="flex items-center gap-3 border-l border-white/10 pl-6">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500 font-black">
                  AD
                </div>

                <div className="hidden sm:block">
                  <div className="font-black">
                    Admin Grossiste
                  </div>

                  <div className="text-xs font-bold text-blue-300">
                    {organizationName}
                  </div>
                </div>

                <div className="text-blue-200">
                  ⌄
                </div>
              </div>
            </div>

          </header>

          <div className="px-5 py-8 lg:px-8 xl:px-10">

            {/* TITLE */}
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">

              <div>
                <h1 className="text-4xl font-black tracking-tight">
                  Organisation
                </h1>

                <p className="mt-1 text-lg text-blue-200">
                  Visualisez et gérez l'ensemble de vos sites, vendeurs, comptoirs et bornes.
                </p>
              </div>

              <div className="flex overflow-hidden rounded-xl border border-blue-400/40 bg-[#071b30]">

                <button
                  type="button"
                  onClick={() =>
                    changeMode("organigramme")
                  }
                  className={
                    "px-6 py-3 font-black transition " +
                    (
                      mode === "organigramme"
                        ? "bg-blue-600 text-white"
                        : "bg-[#071b30] text-blue-200"
                    )
                  }
                >
                  ⌘ &nbsp; Organigramme
                </button>

                <button
                  type="button"
                  onClick={() =>
                    changeMode("tableau")
                  }
                  className={
                    "px-6 py-3 font-black transition " +
                    (
                      mode === "tableau"
                        ? "bg-blue-600 text-white"
                        : "bg-[#071b30] text-blue-200"
                    )
                  }
                >
                  ☷ &nbsp; Tableau
                </button>

              </div>
            </div>

            {error ? (
              <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-red-200">
                {error}
              </div>
            ) : null}

            {loading ? (
              <div className="py-24 text-center text-blue-200">
                Chargement de l'organisation...
              </div>
            ) : null}

            {!loading && mode === "organigramme" ? (
              <div className="mt-8">

                {/* GROSSISTE */}
                <div className="mx-auto max-w-[470px] rounded-2xl border border-blue-400/50 bg-[#0b2b49] p-5 shadow-2xl shadow-slate-950/30">

                  <div className="flex items-center gap-5">
                    <label className="group relative h-24 w-24 shrink-0 cursor-pointer" title={storePhotoUrl ? "Changer la photo du grossiste" : "Ajouter une photo au grossiste"}>
                      <img src={storePhotoUrl || SITE_PHOTOS[0]} alt={`Photo de ${organizationName}`} className="h-24 w-24 rounded-full border-4 border-white object-cover" />
                      <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-xl opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">📷</span>
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={async (event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (!file) return;
                        try {
                          setError("");
                          await uploadOrganizationPhoto(file);
                        } catch (caught) {
                          setError(caught instanceof Error ? caught.message : "Upload de la photo impossible.");
                        }
                      }} />
                    </label>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="truncate text-2xl font-black">
                          {organizationName}
                        </div>

                      </div>

                      <div className="mt-1 text-sm text-blue-100">
                        Organisation grossiste
                      </div>

                      <div className="mt-4 grid grid-cols-4 overflow-hidden rounded-xl bg-blue-300/10 text-center">
                        <div className="p-2">
                          <div className="text-xl font-black">
                            {sellers.length}
                          </div>
                          <div className="text-[10px] text-blue-200">
                            Vendeurs
                          </div>
                        </div>

                        <div className="p-2">
                          <div className="text-xl font-black">
                            {branches.length}
                          </div>
                          <div className="text-[10px] text-blue-200">
                            Sites
                          </div>
                        </div>

                        <div className="p-2">
                          <div className="text-xl font-black">
                            {activeCounters}
                          </div>
                          <div className="text-[10px] text-blue-200">
                            Comptoirs
                          </div>
                        </div>

                        <div className="p-2">
                          <div className="text-xl font-black">
                            {activeTerminals}
                          </div>
                          <div className="text-[10px] text-blue-200">
                            Bornes
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LIAISON GROSSISTE -> SITES */}
                {branches.length ? (
                  <div className="mx-auto h-10 w-px bg-blue-300/70" />
                ) : null}

                {branches.length > 1 ? (
                  <div
                    className="mx-auto h-px bg-blue-300/70"
                    style={{
                      width: `${Math.max(
                        0,
                        100 -
                          100 /
                            branches.length,
                      )}%`,
                    }}
                  />
                ) : null}

                {/* SITES */}
                <div
                  className="grid gap-6"
                  style={{
                    gridTemplateColumns:
                      branches.length
                        ? `repeat(${branches.length}, minmax(300px, 1fr))`
                        : undefined,
                  }}
                >
                  {branches.map(
                    (branch, branchIndex) => {
                      const branchSellers =
                        sellersForBranch(
                          branch.branchId,
                        );

                      const supervisor =
                        branchSellers.find(
                          (seller) =>
                            seller
                              .sellerCounterSettings
                              ?.permissions
                              .counterSupervisor ===
                            true,
                        );

                      const deputy =
                        branchSellers.find(
                          (seller) =>
                            seller
                              .sellerCounterSettings
                              ?.permissions
                              .deputySupervisor ===
                            true,
                        );

                      const regularSellers =
                        branchSellers.filter(
                          (seller) =>
                            seller.customerId !==
                              supervisor?.customerId &&
                            seller.customerId !==
                              deputy?.customerId,
                        );

                      const orderedSellers = [
                        ...(supervisor
                          ? [supervisor]
                          : []),
                        ...(deputy
                          ? [deputy]
                          : []),
                        ...regularSellers,
                      ];

                      const activeStaff =
                        (branch.staff ?? [])
                          .filter(
                            (staff) =>
                              staff.status ===
                              "active",
                          );

                      const counters =
                        (branch.counters ?? [])
                          .filter(
                            (counter) =>
                              counter.status ===
                              "active",
                          ).length;

                      const terminals =
                        (branch.terminals ?? [])
                          .filter(
                            (terminal) =>
                              terminal.status ===
                              "active",
                          ).length;

                      return (
                        <div
                          key={branch.branchId}
                          className="min-w-0"
                        >

                          {/* DESCENTE VERS SITE */}
                          <div className="mx-auto h-8 w-px bg-blue-300/70" />

                          {/* SITE */}
                          <article
                            className={
                              branch.status ===
                              "active"
                                ? "rounded-2xl border border-blue-400/40 bg-[#0b2a47] p-4 shadow-xl shadow-slate-950/20"
                                : "rounded-2xl border border-slate-500/40 bg-[#10283d] p-4 opacity-75 shadow-xl shadow-slate-950/20"
                            }
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex shrink-0 flex-col items-center gap-2">
                                <label
                                  className="group relative block cursor-pointer"
                                  title={branch.photoUrl ? "Changer la photo du magasin" : "Ajouter une photo au magasin"}
                                >
                                <img
                                  src={
                                    branch.photoUrl ||
                                    SITE_PHOTOS[
                                      branchIndex %
                                        SITE_PHOTOS.length
                                    ]
                                  }
                                  alt=""
                                  className="h-20 w-20 rounded-full border-2 border-white object-cover"
                                />


  <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-lg opacity-0 transition group-hover:opacity-100">

    📷

  </span>


  <input

    type="file"

    accept="image/jpeg,image/png,image/webp"

    className="hidden"

    onChange={

      async (event) => {

        const file = event.target.files?.[0];



        event.target.value = '';



        if (!file) return;



        try {

          setError('');

          await uploadBranchPhoto(branch.branchId, file);

        } catch (caught) {

          setError(

            caught instanceof Error

              ? caught.message

              : "Upload de la photo impossible.",

          );

        }

      }

    }

  />

</label>

                                {branch.branchCode ? (
                                  <span className="rounded-lg bg-cyan-400/15 px-2 py-1 text-xs font-black tracking-wider text-cyan-200">
                                    {branch.branchCode}
                                  </span>
                                ) : null}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg font-black">
                                      {branchDisplayName(branch.name)}
                                    </h2>
                                  </div>

                                  <span
                                    className={
                                      branch.status ===
                                      "active"
                                        ? "rounded-lg bg-emerald-500/20 px-2 py-1 text-[10px] font-black text-emerald-300"
                                        : "rounded-lg bg-slate-500/30 px-2 py-1 text-[10px] font-black text-slate-300"
                                    }
                                  >
                                    {branch.status ===
                                    "active"
                                      ? "Actif"
                                      : "Inactif"}
                                  </span>
                                </div>

                                <div className="mt-1 text-xs leading-5 text-blue-100">
                                  ⌖{" "}
                                  <BranchAddress branch={branch} />
                                </div>

                                <div className="text-xs font-bold text-cyan-200">
                                  ☎{" "}
                                  {branch.phone ||
                                    "Téléphone non renseigné"}
                                </div>
                              </div>

                              <a
                                href={`/grossiste/sites/${branch.branchId}${interventionQuery}`}
                                title="Gérer le site"
                                aria-label="Gérer le site"
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 font-black transition hover:bg-white/20"
                              >
                                •••
                              </a>
                            </div>

                            <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-xl bg-blue-300/10 text-center">
                              <div className="px-2 py-2">
                                <div className="font-black">
                                  {
                                    branchSellers.length
                                  }
                                </div>
                                <div className="text-[10px] text-blue-200">
                                  Vendeurs
                                </div>
                              </div>

                              <div className="px-2 py-2">
                                <div className="font-black">
                                  {counters}
                                </div>
                                <div className="text-[10px] text-blue-200">
                                  Comptoirs
                                </div>
                              </div>

                              <div className="px-2 py-2">
                                <div className="font-black">
                                  {terminals}
                                </div>
                                <div className="text-[10px] text-blue-200">
                                  Bornes
                                </div>
                              </div>
                            </div>
                          </article>

                          {/* SITE -> RESPONSABLE */}
                          <div className="mx-auto h-6 w-px bg-blue-300/60" />

                          <div className="mx-auto max-w-[280px]">
                            <div className="mb-2 text-center text-[10px] font-black uppercase tracking-[0.18em] text-blue-300">
                              Responsable du site
                            </div>

                            {supervisor ? (
                              <a
                                href={`/grossiste/vendeurs/${supervisor.customerId}${interventionQuery}`}
                                className="flex items-center gap-3 rounded-xl border border-blue-400/40 bg-[#eef6fb] p-3 text-slate-900 transition hover:bg-white"
                              >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                                  {supervisor.photoUrl ? (<img src={peoplePhotoSrc(supervisor.photoUrl, organizationId)} alt={sellerName(supervisor)} className="h-full w-full rounded-full object-cover" />) : (`${supervisor.firstName?.charAt(0) ?? ""}${supervisor.lastName?.charAt(0) ?? ""}` || "?")}
                                </div>

                                <div className="min-w-0">
                                  <div className="truncate font-black">
                                    {sellerName(
                                      supervisor,
                                    )}
                                  </div>
                                  <div className="text-xs font-bold text-blue-700">
                                    Responsable
                                  </div>
                                </div>
                              </a>
                            ) : (
                              <div className="rounded-xl border border-dashed border-blue-300/30 p-3 text-center text-xs text-blue-200">
                                Aucun responsable
                              </div>
                            )}
                          </div>

                          {/* RESPONSABLE -> PERSONNEL */}
                          {(deputy ||
                            regularSellers.length ||
                            activeStaff.length) ? (
                            <>
                              <div className="mx-auto h-6 w-px bg-blue-300/60" />

                              <div className="mx-auto h-px w-1/2 bg-blue-300/60" />

                              <div className="grid grid-cols-2 gap-3">

                                {/* VENDEURS */}
                                <div>
                                  <div className="mx-auto h-5 w-px bg-blue-300/60" />

                                  <div className="mb-2 text-center text-[10px] font-black uppercase tracking-[0.16em] text-blue-300">
                                    Vendeurs
                                  </div>

                                  <div className="space-y-2">
                                    {deputy ? (
                                      <a
                                        href={`/grossiste/vendeurs/${deputy.customerId}${interventionQuery}`}
                                        className="flex items-center gap-2 rounded-xl border border-sky-300 bg-sky-100 p-2 text-slate-900 transition hover:bg-sky-50"
                                      >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500 text-[10px] font-black text-white">
                                          {deputy.photoUrl ? (<img src={peoplePhotoSrc(deputy.photoUrl, organizationId)} alt={sellerName(deputy)} className="h-full w-full rounded-full object-cover" />) : (`${deputy.firstName?.charAt(0) ?? ""}${deputy.lastName?.charAt(0) ?? ""}` || "?")}
                                        </div>

                                        <div className="min-w-0">
                                          <div className="truncate text-xs font-black">
                                            {sellerName(
                                              deputy,
                                            )}
                                          </div>

                                          <div className="text-[10px] font-black text-sky-700">
                                            Adjoint
                                          </div>
                                        </div>
                                      </a>
                                    ) : null}

                                    {regularSellers.map(
                                      (seller) => (
                                        <a
                                          key={
                                            seller.customerId
                                          }
                                          href={`/grossiste/vendeurs/${seller.customerId}${interventionQuery}`}
                                          className="flex items-center gap-2 rounded-xl bg-[#eef6fb] p-2 text-slate-900 transition hover:bg-white"
                                        >
                                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-black text-slate-600">
                                            {seller.photoUrl ? (
                                              <img src={peoplePhotoSrc(seller.photoUrl, organizationId)} alt={sellerName(seller)} className="h-full w-full rounded-full object-cover" />
                                            ) : (
                                              `${seller.firstName?.charAt(0) ?? ""}${seller.lastName?.charAt(0) ?? ""}` || "?"
                                            )}
                                          </div>

                                          <div className="min-w-0">
                                            <div className="truncate text-xs font-black">
                                              {sellerName(
                                                seller,
                                              )}
                                            </div>
                                            <div className="text-[10px] font-semibold text-slate-500">
                                              {seller.userCode ??
                                                "Vendeur"}
                                            </div>
                                          </div>
                                        </a>
                                      ),
                                    )}

                                    {!deputy &&
                                    !regularSellers.length ? (
                                      <div className="rounded-xl border border-dashed border-blue-300/20 p-3 text-center text-xs text-blue-200">
                                        Aucun vendeur
                                      </div>
                                    ) : null}
</div>
                                </div>

                                {/* EQUIPE */}
                                <div>
                                  <div className="mx-auto h-5 w-px bg-blue-300/60" />

                                  <div className="mb-2 text-center text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300">
                                    Équipe
                                  </div>

                                  <div className="space-y-2">
                                    {activeStaff.map(
                                      (staff) => (
                                        <a
                                          key={
                                            staff.staffId
                                          }
                                          href={`/grossiste/sites/${branch.branchId}/equipe/${staff.staffId}${interventionQuery}`}
                                          className="flex items-center gap-2 rounded-xl bg-white p-2 text-slate-900 transition hover:bg-slate-100"
                                        >
                                          {staff.photoUrl ? (
                                            <img
                                              src={peoplePhotoSrc(staff.photoUrl, organizationId)}
                                              alt=""
                                              className="h-9 w-9 shrink-0 rounded-full object-cover"
                                            />
                                          ) : (
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-black text-slate-600">
                                              {`${staff.firstName?.charAt(0) ?? ""}${staff.lastName?.charAt(0) ?? ""}` ||
                                                "?"}
                                            </div>
                                          )}

                                          <div className="min-w-0">
                                            <div className="truncate text-xs font-black">
                                              {
                                                staff.firstName
                                              }{" "}
                                              {
                                                staff.lastName
                                              }
                                            </div>

                                            <div className="text-[10px] font-semibold text-slate-500">
                                              {staffRoleLabel(
                                                staff.role,
                                                staff.customRoleLabel,
                                              )}
                                            </div>
                                          </div>
                                        </a>
                                      ),
                                    )}

                                    {!activeStaff.length ? (
                                      <div className="rounded-xl border border-dashed border-cyan-300/20 p-3 text-center text-xs text-blue-200">
                                        Aucun membre
                                      </div>
                                    ) : null}
</div>
                                </div>

                              </div>
                            </>
                          ) : null}

                        </div>
                      );
                    },
                  )}
                </div>

                {!branches.length ? (
                  <div className="mt-8 rounded-2xl border border-dashed border-blue-300/30 p-10 text-center text-blue-200">
                    Aucun site configuré.
                  </div>
                ) : null}

              </div>
            ) : null}
            {!loading && mode === "tableau" ? (
              <div className="mt-8 space-y-3">

                {branches.map(
                  (branch, branchIndex) => {
                    const branchSellers =
                      sellersForBranch(
                        branch.branchId,
                      );

                    const activeStaff =
                      (branch.staff ?? [])
                        .filter(
                          (staff) =>
                            staff.status ===
                            "active",
                        );

                    const counters =
                      (branch.counters ?? [])
                        .filter(
                          (counter) =>
                            counter.status ===
                            "active",
                        ).length;

                    const terminals =
                      (branch.terminals ?? [])
                        .filter(
                          (terminal) =>
                            terminal.status ===
                            "active",
                        ).length;

                    const expanded =
                      expandedBranches[
                        branch.branchId
                      ] === true;

                    return (
                      <section
                        key={branch.branchId}
                        className="overflow-hidden rounded-2xl border border-blue-400/30 bg-[#0b2a47]"
                      >

                        <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">

                          <button
                            type="button"
                            onClick={() =>
                              toggleBranch(
                                branch.branchId,
                              )
                            }
                            aria-expanded={expanded}
                            className="flex min-w-0 flex-1 items-center gap-4 text-left"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-lg font-black text-blue-200">
                              {expanded
                                ? "▾"
                                : "▸"}
                            </div>

                            <img
                              src={
                                SITE_PHOTOS[
                                  branchIndex %
                                    SITE_PHOTOS.length
                                ]
                              }
                              alt=""
                              className="h-14 w-14 shrink-0 rounded-full border-2 border-white object-cover"
                            />

                            <div className="min-w-0">
                              <div className="flex min-w-0 flex-wrap items-center gap-2">
                                {branch.branchCode ? (
                                  <span className="shrink-0 rounded-lg bg-cyan-400/15 px-2 py-1 text-xs font-black tracking-wider text-cyan-200">
                                    {branch.branchCode}
                                  </span>
                                ) : null}

                                <div className="truncate text-lg font-black">
                                  {branchDisplayName(branch.name)}
                                </div>
                              </div>

                              <div className="mt-1 text-sm leading-5 text-blue-100">
                                <BranchAddress branch={branch} />
                              </div>

                              <div className="mt-1 text-sm font-semibold text-cyan-200">
                                ☎{" "}
                                {branch.phone ||
                                  "Téléphone non renseigné"}
                              </div>
                            </div>
                          </button>

                          <div className="grid shrink-0 grid-cols-3 gap-2 text-center sm:grid-cols-6">

                            <div className="rounded-xl bg-white/5 px-3 py-2">
                              <div className="font-black">
                                {
                                  branchSellers.length
                                }
                              </div>
                              <div className="text-[10px] text-blue-200">
                                Vendeurs
                              </div>
                            </div>

                            <div className="rounded-xl bg-white/5 px-3 py-2">
                              <div className="font-black">
                                {
                                  activeStaff.length
                                }
                              </div>
                              <div className="text-[10px] text-blue-200">
                                Équipe
                              </div>
                            </div>

                            <div className="rounded-xl bg-white/5 px-3 py-2">
                              <div className="font-black">
                                {counters}
                              </div>
                              <div className="text-[10px] text-blue-200">
                                Comptoirs
                              </div>
                            </div>

                            <div className="rounded-xl bg-white/5 px-3 py-2">
                              <div className="font-black">
                                {terminals}
                              </div>
                              <div className="text-[10px] text-blue-200">
                                Bornes
                              </div>
                            </div>

                            <div className="flex items-center justify-center rounded-xl bg-white/5 px-3 py-2">
                              <span
                                className={
                                  branch.status ===
                                  "active"
                                    ? "rounded-lg bg-emerald-500/20 px-2 py-1 text-[10px] font-black text-emerald-300"
                                    : "rounded-lg bg-slate-500/30 px-2 py-1 text-[10px] font-black text-slate-300"
                                }
                              >
                                {branch.status ===
                                "active"
                                  ? "Actif"
                                  : "Inactif"}
                              </span>
                            </div>

                            <a
                              href={`/grossiste/sites/${branch.branchId}${interventionQuery}`}
                              className="flex items-center justify-center rounded-xl bg-amber-500 px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-amber-400"
                            >
                              Gérer
                            </a>

                          </div>
                        </div>

                        {expanded ? (
                          <div className="border-t border-white/10 bg-[#071d31] p-5">

                            <div className="grid gap-6 xl:grid-cols-2">

                              <div>
                                <div className="mb-3 flex items-center justify-between">
                                  <h3 className="text-lg font-black">
                                    Vendeurs
                                  </h3>

                                  <a
                                    href={`/grossiste/vendeurs/nouveau${interventionQuery}`}
                                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-dashed border-blue-300/50 bg-blue-500/10 px-2.5 text-center text-[10px] font-black text-blue-200 hover:bg-blue-500/20"
                                  >
                                    <span className="text-base">+</span>
                                    AJOUTER UN VENDEUR
                                  </a>
                                </div>

                                <div className="space-y-2">

                                  {[...branchSellers]
                                    .sort(
                                      (left, right) => {
                                        const roleRank = (
                                          seller: Seller,
                                        ) => {
                                          if (
                                            seller
                                              .sellerCounterSettings
                                              ?.permissions
                                              .counterSupervisor ===
                                            true
                                          ) {
                                            return 0;
                                          }

                                          if (
                                            seller
                                              .sellerCounterSettings
                                              ?.permissions
                                              .deputySupervisor ===
                                            true
                                          ) {
                                            return 1;
                                          }

                                          return 2;
                                        };

                                        return (
                                          roleRank(left) -
                                          roleRank(right)
                                        );
                                      },
                                    )
                                    .map((seller) => {
                                      const isSupervisor =
                                        seller
                                          .sellerCounterSettings
                                          ?.permissions
                                          .counterSupervisor ===
                                        true;

                                      const isDeputy =
                                        seller
                                          .sellerCounterSettings
                                          ?.permissions
                                          .deputySupervisor ===
                                        true;

                                      return (
                                        <div
                                          key={
                                            seller.customerId
                                          }
                                          className="relative flex min-h-[64px] items-center gap-3 rounded-xl bg-[#eef6fb] px-3 py-2 text-slate-900"
                                        >
                                          <div
                                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-200 text-xs font-black text-slate-600"
                                            aria-label="Aucune photo vendeur"
                                          >
                                            {seller.photoUrl ? (
                                              <img src={peoplePhotoSrc(seller.photoUrl, organizationId)} alt={sellerName(seller)} className="h-full w-full rounded-full object-cover" />
                                            ) : (
                                              `${seller.firstName?.charAt(0) ?? ""}${seller.lastName?.charAt(0) ?? ""}` || "?"
                                            )}
                                          </div>

                                          <div className="min-w-0 flex-1">
                                            <div className="truncate font-black">
                                              {sellerName(
                                                seller,
                                              )}
                                            </div>

                                            <div className="text-xs font-semibold text-slate-600">
                                              {seller.userCode ??
                                                "—"}
                                            </div>
                                          </div>

                                          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2">
                                            <span
                                              className={
                                                isSupervisor
                                                  ? "rounded-lg bg-blue-600 px-3 py-1.5 text-[10px] font-black text-white"
                                                  : isDeputy
                                                    ? "rounded-lg bg-sky-200 px-3 py-1.5 text-[10px] font-black text-sky-900"
                                                    : "rounded-lg bg-slate-700 px-3 py-1.5 text-[10px] font-black text-white"
                                              }
                                            >
                                              {isSupervisor
                                                ? "Responsable"
                                                : isDeputy
                                                  ? "Adjoint"
                                                  : "Vendeur"}
                                            </span>
                                          </div>

                                          <a
                                            href={`/grossiste/vendeurs/${seller.customerId}${interventionQuery}`}
                                            className="ml-auto shrink-0 rounded-lg bg-amber-500 px-3 py-2 text-[10px] font-black text-slate-950 hover:bg-amber-400"
                                          >
                                            Modifier
                                          </a>
                                        </div>
                                      );
                                    },
                                  )}

                                  {!branchSellers.length ? (
                                    <div className="rounded-xl border border-dashed border-blue-300/30 p-5 text-center text-sm text-blue-200">
                                      Aucun vendeur.
                                    </div>
                                  ) : null}

                                </div>
                              </div>

                              <div>
                                <div className="mb-3 flex items-center justify-between">
                                  <h3 className="text-lg font-black">
                                    Équipe
                                  </h3>

                                  <a
                                    href={`/grossiste/sites/${branch.branchId}/equipe/nouveau${interventionQuery}`}
                                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-dashed border-cyan-300/50 bg-cyan-500/10 px-2.5 text-center text-[10px] font-black text-cyan-200 hover:bg-cyan-500/20"
                                  >
                                    <span className="text-base">+</span>
                                    AJOUTER DU PERSONNEL
                                  </a>
                                </div>

                                <div className="space-y-2">

                                  {activeStaff.map(
                                    (staff) => (
                                      <div
                                        key={
                                          staff.staffId
                                        }
                                        className="relative flex min-h-[64px] items-center gap-3 rounded-xl bg-white px-3 py-2 text-slate-900"
                                      >
                                        {staff.photoUrl ? (
                                          <img
                                            src={peoplePhotoSrc(staff.photoUrl, organizationId)}
                                            alt=""
                                            className="h-11 w-11 shrink-0 rounded-full object-cover"
                                          />
                                        ) : (
                                          <div
                                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-200 text-xs font-black text-slate-600"
                                            aria-label="Aucune photo membre"
                                          >
                                            {`${staff.firstName?.charAt(0) ?? ""}${staff.lastName?.charAt(0) ?? ""}` ||
                                              "?"}
                                          </div>
                                        )}

                                        <div className="min-w-0 flex-1">
                                          <div className="truncate font-black">
                                            {
                                              staff.firstName
                                            }{" "}
                                            {
                                              staff.lastName
                                            }
                                          </div>

                                          {staff.phone ? (
                                            <div className="text-xs text-slate-600">
                                              ☎{" "}
                                              {
                                                staff.phone
                                              }
                                            </div>
                                          ) : null}
                                        </div>

                                        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2">
                                          <span className="rounded-lg bg-slate-800 px-3 py-1.5 text-[10px] font-black text-white">
                                            {staffRoleLabel(
                                              staff.role,
                                              staff.customRoleLabel,
                                            )}
                                          </span>
                                        </div>

                                        <a
                                          href={`/grossiste/sites/${branch.branchId}/equipe/${staff.staffId}${interventionQuery}`}
                                          className="ml-auto shrink-0 rounded-lg bg-amber-500 px-3 py-2 text-[10px] font-black text-slate-950 hover:bg-amber-400"
                                        >
                                          Modifier
                                        </a>
                                      </div>
                                    ),
                                  )}

                                  {!activeStaff.length ? (
                                    <div className="rounded-xl border border-dashed border-cyan-300/30 p-5 text-center text-sm text-cyan-200">
                                      Aucun membre d'équipe.
                                    </div>
                                  ) : null}

                                </div>
                              </div>

                            </div>

                          </div>
                        ) : null}

                      </section>
                    );
                  },
                )}

                {!branches.length ? (
                  <div className="rounded-2xl border border-dashed border-blue-300/30 p-10 text-center text-blue-200">
                    Aucun site configuré.
                  </div>
                ) : null}

              </div>
            ) : null}
            {mode === "organigramme" && branches.length ? (
              <div className="mt-8 grid grid-cols-6 gap-2">
                {branches.map((branch) => (
                  <div key={branch.branchId} className="contents">
                    <a
                      href={`/grossiste/vendeurs/nouveau${interventionQuery}`}
                      className="flex h-11 items-center justify-center gap-2 rounded-lg border border-dashed border-blue-300/50 bg-blue-500/10 px-3 text-center text-[11px] font-black text-blue-200 hover:bg-blue-500/20"
                    >
                      <span className="text-base">+</span>
                      AJOUTER UN VENDEUR
                    </a>

                    <a
                      href={`/grossiste/sites/${branch.branchId}/equipe/nouveau${interventionQuery}`}
                      className="flex h-11 items-center justify-center gap-2 rounded-lg border border-dashed border-cyan-300/50 bg-cyan-500/10 px-3 text-center text-[11px] font-black text-cyan-200 hover:bg-cyan-500/20"
                    >
                      <span className="text-base">+</span>
                      AJOUTER DU PERSONNEL
                    </a>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="mt-6 flex items-center justify-between rounded-xl bg-blue-300/10 px-6 py-4 text-sm font-semibold text-blue-100">
              <div>
                ♟ &nbsp;
                Une organisation claire pour un service plus rapide et plus proche de vos clients.
              </div>

              <div className="hidden italic text-blue-200 lg:block">
                Ensemble, faisons avancer la pièce auto.
              </div>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}
