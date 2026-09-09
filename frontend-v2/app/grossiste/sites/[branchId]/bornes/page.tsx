"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

type DetectedPrinter = {
  Name: string;
  PortName: string;
  PrinterStatus: number;
  Type: number;
};

type Terminal = {
  terminalId: string;
  deviceCode?: string;
  printerName?: string;
  printerPath?: string;
  name: string;
  status: "active" | "disabled";
};

type Branch = {
  branchId: string;
  name: string;
  terminals?: Terminal[];
};

type BranchesResponse = {
  ok?: boolean;
  organizationId?: string;
  branches?: Branch[];
  error?: string;
};

export default function BornesPage() {
  const params = useParams<{
    branchId: string;
  }>();

  const branchId =
    params.branchId;

  const [
    branch,
    setBranch,
  ] =
    useState<Branch | null>(
      null,
    );

  const [
    organizationId,
    setOrganizationId,
  ] =
    useState("");

  const [
    origin,
    setOrigin,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    printerName,
    setPrinterName,
  ] =
    useState("");

  const [
    printerPath,
    setPrinterPath,
  ] =
    useState("");

  const [printerDrafts, setPrinterDrafts] = useState<Record<string, { printerName: string; printerPath: string }>>({});

  const [detectedPrinters, setDetectedPrinters] = useState<DetectedPrinter[]>([]);
  const [openTerminalDetails, setOpenTerminalDetails] = useState<Record<string, boolean>>({});

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    copiedTerminalId,
    setCopiedTerminalId,
  ] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    setOrigin(
      window.location.origin,
    );
  }, []);

  const loadBranch =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const response =
            await fetch(
              "/api/grossiste/branches",
              {
                method: "GET",
                cache: "no-store",
              },
            );

          const data:
            BranchesResponse =
              await response.json();

          if (!response.ok) {
            throw new Error(
              data.error ??
                "Impossible de charger les sites.",
            );
          }

          const currentBranch =
            (
              data.branches ?? []
            ).find(
              (item) =>
                item.branchId ===
                branchId,
            );

          if (!currentBranch) {
            throw new Error(
              "Site introuvable.",
            );
          }

          setOrganizationId(
            data.organizationId ?? "",
          );

          setPrinterDrafts(
            Object.fromEntries(
              (currentBranch.terminals ?? []).map((terminal) => [
                terminal.terminalId,
                { printerName: terminal.printerName ?? "", printerPath: terminal.printerPath ?? "" },
              ]),
            ),
          );

          setBranch(
            currentBranch,
          );
        }
        catch (caught) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Erreur de chargement.",
          );
        }
        finally {
          setLoading(false);
        }
      },
      [
        branchId,
      ],
    );

  useEffect(() => {
    void loadBranch();
  }, [
    loadBranch,
  ]);

  async function createTerminal() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response =
        await fetch(
          "/api/grossiste/branches/terminals",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              branchId,
              printerName,
              printerPath,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Création impossible.",
        );
      }

      setMessage(
        `Borne ${data.terminal?.deviceCode ?? ""} créée.`,
      );

      await loadBranch();
    }
    catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Création impossible.",
      );
    }
    finally {
      setSaving(false);
    }
  }

  async function updateStatus(
    terminal: Terminal,
    status:
      | "active"
      | "disabled",
  ) {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response =
        await fetch(
          "/api/grossiste/branches/terminals",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              branchId,
              terminalId:
                terminal.terminalId,
              status,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Modification impossible.",
        );
      }

      setMessage(
        `Borne ${
          terminal.deviceCode ??
          terminal.name
        } mise à jour.`,
      );

      await loadBranch();
    }
    catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Modification impossible.",
      );
    }
    finally {
      setSaving(false);
    }
  }

  async function savePrinter(terminal: Terminal) {
    const draft = printerDrafts[terminal.terminalId] ?? { printerName: "", printerPath: "" };
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/grossiste/branches/terminals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchId, terminalId: terminal.terminalId, printerName: draft.printerName, printerPath: draft.printerPath }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Configuration imprimante impossible.");
      setMessage(`Imprimante de ${terminal.deviceCode ?? terminal.name} enregistrée.`);
      await loadBranch();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Configuration imprimante impossible.");
    } finally {
      setSaving(false);
    }
  }

  async function detectPrinters() {
    setMessage("");
    setError("");
    try {
      const response = await fetch("http://127.0.0.1:4317/printers");
      const data = await response.json();
      if (!response.ok || !data.ok || !Array.isArray(data.printers)) {
        throw new Error("Détection des imprimantes impossible.");
      }
      setDetectedPrinters(data.printers);
      setMessage(`${data.printers.length} imprimante(s) détectée(s).`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "TPA Print Agent inaccessible.");
    }
  }

  async function verifyPrinter(terminal: Terminal) {
    const draft = printerDrafts[terminal.terminalId] ?? { printerName: "", printerPath: "" };
    setMessage("");
    setError("");
    if (!draft.printerName.trim()) {
      setError("Sélectionne une imprimante avant la vérification.");
      return;
    }
    try {
      const response = await fetch(`http://127.0.0.1:4317/verify?name=${encodeURIComponent(draft.printerName.trim())}`);
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error("Imprimante introuvable sur ce poste.");
      setMessage(`Connexion imprimante OK : ${draft.printerName.trim()}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "TPA Print Agent inaccessible.");
    }
  }

  function installationUrl(
    terminal: Terminal,
  ): string {
    if (
      !origin ||
      !organizationId ||
      !terminal.deviceCode
    ) {
      return "";
    }

    return (
      `${origin}/showroom` +
      `?organizationId=${encodeURIComponent(
        organizationId,
      )}` +
      `&branchId=${encodeURIComponent(
        branchId,
      )}` +
      `&terminalCode=${encodeURIComponent(
        terminal.deviceCode,
      )}`
    );
  }

  async function copyAddress(
    terminal: Terminal,
  ) {
    const url =
      installationUrl(
        terminal,
      );

    if (!url) {
      setError(
        "Adresse d'installation indisponible pour cette ancienne borne.",
      );
      return;
    }

    try {
      await navigator.clipboard
        .writeText(url);

      setCopiedTerminalId(
        terminal.terminalId,
      );

      setMessage(
        "Adresse d'installation copiée.",
      );

      window.setTimeout(
        () => {
          setCopiedTerminalId(
            null,
          );
        },
        2000,
      );
    }
    catch {
      setError(
        "Impossible de copier automatiquement l'adresse.",
      );
    }
  }

  const terminals =
    branch?.terminals ?? [];

  const activeCount =
    terminals.filter(
      (terminal) =>
        terminal.status ===
        "active",
    ).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          Chargement des bornes...
        </div>
      </main>
    );
  }

  if (!branch) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-red-200">
            {error ||
              "Site introuvable."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl pr-40 lg:pr-44">
        <div className="mb-8">
          <Link
            href={`/grossiste/sites/${encodeURIComponent(
              branchId,
            )}`}
            className="text-sm font-semibold text-violet-300 hover:text-violet-200"
          >
            ← Retour au site
          </Link>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.18em] text-violet-300">
                Configuration TPA
              </div>

              <h1 className="mt-2 text-3xl font-black">
                Bornes — {branch.name}
              </h1>

              <p className="mt-2 max-w-3xl text-sm text-slate-300">
                TPA attribue automatiquement
                le code du site et le numéro
                de chaque borne.
              </p>
            </div>


            <button
              type="button"
              onClick={
                createTerminal
              }
              disabled={saving}
              className="rounded-xl bg-violet-500 px-5 py-3 font-black text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Traitement..."
                : "+ Ajouter une borne"}
            </button>
          </div>
        </div>

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Site
            </div>

            <div className="mt-2 text-xl font-black">
              {branch.name}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Bornes
            </div>

            <div className="mt-2 text-xl font-black">
              {terminals.length}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Actives
            </div>

            <div className="mt-2 text-xl font-black text-emerald-300">
              {activeCount}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-5">
            <h2 className="text-xl font-black">
              Bornes du site
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Le code TPA est permanent et n'est jamais réattribué.
              Une borne retirée passe Inactive et reste conservée dans l'historique.
            </p>
          </div>

          <div className="space-y-5">
            {terminals.map(
              (terminal) => {
                const code =
                  terminal.deviceCode ??
                  terminal.name;

                const url =
                  installationUrl(
                    terminal,
                  );

                const legacy =
                  !terminal.deviceCode;

                return (
                  <article
                    key={
                      terminal.terminalId
                    }
                    className="rounded-2xl border border-white/10 bg-slate-900/70 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="text-2xl font-black">
                            {code}
                          </div>

                          {legacy ? (
                            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300">
                              Ancienne borne
                            </span>
                          ) : null}

                          <span
                            className={
                              terminal.status ===
                              "active"
                                ? "rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300"
                                : "rounded-full bg-slate-500/20 px-3 py-1 text-xs font-bold text-slate-300"
                            }
                          >
                            {terminal.status ===
                            "active"
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>

                        <div className="mt-2 text-xs text-slate-500">
                          ID technique :{" "}
                          {
                            terminal.terminalId
                          }
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <select
                          value={
                            terminal.status
                          }
                          disabled={
                            saving
                          }
                          onChange={(
                            event,
                          ) => {
                            void updateStatus(
                              terminal,
                              event.target
                                .value as
                                | "active"
                                | "disabled",
                            );
                          }}
                          className="rounded-xl border border-white/10 bg-slate-950 px-4 py-2 font-bold text-white disabled:opacity-50"
                        >
                          <option value="active">
                            Active
                          </option>

                          <option value="disabled">
                            Inactive
                          </option>
                        </select>

                        <button
                          type="button"
                          onClick={() => setOpenTerminalDetails((current) => ({ ...current, [terminal.terminalId]: !current[terminal.terminalId] }))}
                          className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 font-bold text-white transition hover:bg-white/[0.08]"
                        >
                          {openTerminalDetails[terminal.terminalId] ? "Fermer" : "Configurer"}
                        </button>


                      </div>
                    </div>

                    {openTerminalDetails[terminal.terminalId] ? (
                      <>
                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-xs font-black uppercase tracking-wider text-slate-300">
                        Configuration imprimante
                      </div>

                      <div className="mt-3 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => { void detectPrinters(); }}
                          className="rounded-xl border border-sky-400/40 px-4 py-2 text-sm font-black text-sky-200 transition hover:bg-sky-500/10"
                        >
                          Détecter les imprimantes
                        </button>
                      </div>

                      <div className="mt-3 grid gap-3 lg:grid-cols-2">
                        <label>
                          <span className="mb-1 block text-xs font-bold text-slate-400">Imprimante ticket</span>
                          <select
                            value={printerDrafts[terminal.terminalId]?.printerName ?? ""}
                            onChange={(event) => {
                              const selected = detectedPrinters.find((printer) => printer.Name === event.target.value);
                              setPrinterDrafts((current) => ({
                                ...current,
                                [terminal.terminalId]: {
                                  printerName: selected?.Name ?? "",
                                  printerPath: selected?.PortName ?? "",
                                },
                              }));
                            }}
                            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-violet-400"
                          >
                            <option value="">Sélectionner une imprimante</option>
                            {detectedPrinters.map((printer) => (
                              <option key={`${printer.Name}-${printer.PortName}`} value={printer.Name}>
                                {printer.Name}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label>
                          <span className="mb-1 block text-xs font-bold text-slate-400">Chemin détecté automatiquement</span>
                          <input
                            type="text"
                            readOnly
                            value={printerDrafts[terminal.terminalId]?.printerPath ?? ""}
                            placeholder="Détecté automatiquement par TPA Print Agent"
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-400 outline-none"
                          />
                        </label>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-3">
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => { void savePrinter(terminal); }}
                          className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-black text-white transition hover:bg-violet-400 disabled:opacity-50"
                        >
                          Enregistrer l&apos;imprimante
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => { void verifyPrinter(terminal); }}
                          className="rounded-xl border border-violet-400/40 px-4 py-2 text-sm font-black text-violet-200 transition hover:bg-violet-500/10 disabled:opacity-50"
                        >
                          Vérifier la connexion
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-violet-400/20 bg-violet-500/[0.06] p-4">
                      <div className="text-xs font-black uppercase tracking-wider text-violet-300">
                        Adresse
                        d&apos;installation
                      </div>

                      {url ? (
                        <>
                          <div className="mt-3 break-all rounded-xl bg-black/30 px-4 py-3 font-mono text-sm text-slate-200">
                            {url}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                void copyAddress(
                                  terminal,
                                );
                              }}
                              className="rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-slate-200"
                            >
                              {copiedTerminalId ===
                              terminal.terminalId
                                ? "Copiée ✓"
                                : "Copier l'adresse"}
                            </button>

                            <a
                              href={
                                url
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
                            >
                              Ouvrir la borne
                            </a>
                          </div>
                        </>
                      ) : (
                        <div className="mt-3 text-sm font-semibold text-amber-300">
                          Cette ancienne borne
                          n&apos;a pas encore de
                          code TPA. Supprime-la
                          puis recrée-la.
                        </div>
                      )}
                    </div>
                      </>
                    ) : null}
                  </article>
                );
              },
            )}

            {!terminals.length ? (
              <div className="rounded-2xl border border-dashed border-violet-300/30 p-10 text-center">
                <div className="text-lg font-black text-violet-200">
                  Aucune borne configurée
                </div>

                <div className="mt-2 text-sm text-slate-400">
                  Clique sur
                  « Ajouter une borne ».
                  TPA créera automatiquement
                  son identifiant.
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {message ? (
          <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 font-bold text-emerald-300">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 font-bold text-red-300">
            {error}
          </div>
        ) : null}
      </div>
    </main>
  );
}
