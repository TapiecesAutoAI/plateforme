"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { CounterPresence, CounterTicket } from "../../lib/counter/CounterTicketStore";
import { counterTicketCards } from "../../lib/counter/CounterTicketPresentation";
import styles from "./LiveCounter.module.css";

type Identity = { customerId: string; firstName: string; displayName: string; userCode: string | null; branchCode: string | null; permissions: { manualTicketSelection: boolean; viewFullQueue: boolean; counterSupervisor: boolean; deputySupervisor: boolean } | null };
type CounterTicketView = CounterTicket & { branchCode?: string | null; terminalCode?: string | null };
type QuickRequest = { id: string; type: string; items: { productId: string; name: string; quantity: number; supplierCode: string; unitPrice: number | null }[] };
const labels = { available: "DISPONIBLE AU COMPTOIR", pause: "EN PAUSE", mission: "EN MISSION", offline: "POSTE QUITTÉ" };
const errors: Record<string,string> = { ACTIVE_TICKET_BLOCKS_PRESENCE: "Traitez d’abord le client appelé ou en cours avant de quitter le comptoir.", COUNTER_BUSY_RETRY: "Une attribution est en cours. Réessayez dans un instant.", COUNTER_LOCK_EXPIRED: "L’opération a expiré. Actualisez puis réessayez.", COUNTER_UNAVAILABLE: "Le comptoir ne répond pas. Aucune modification confirmée.", SELLER_ALREADY_BUSY: "Vous avez déjà un client appelé ou en cours.", SELLER_UNAVAILABLE: "Revenez au comptoir avant de reprendre ce ticket.", AUTOMATIC_ASSIGNMENT_REQUIRED: "Le prochain client est attribué automatiquement.", INVALID_TICKET_TRANSITION: "L’état du ticket a changé. Actualisez le comptoir." };
function Icon({ kind }: { kind: string }) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{kind === "box" ? <path d="m3 7 9-5 9 5v11l-9 5-9-5Z M3 7l9 5 9-5 M12 12v11 M8 4l9 5v5"/> : kind === "drop" ? <path d="M12 2S4 11 4 16a8 8 0 0 0 16 0c0-5-8-14-8-14Z"/> : kind === "tool" ? <path d="M21 3a6 6 0 0 1-7.6 7.6L5 21a2.8 2.8 0 0 1-4-4l10.4-8.4A6 6 0 0 1 19 1l-4 4 4 2Z"/> : kind === "arrow" ? <path d="M4 12h15m-6-6 6 6-6 6"/> : kind === "bell" ? <path d="M5 17h14l-2-4V9a5 5 0 0 0-10 0v4Zm5 4h4"/> : kind === "user" ? <><circle cx="12" cy="7" r="4"/><path d="M3 22v-4a9 9 0 0 1 18 0v4Z"/></> : kind === "home" ? <path d="m3 10 9-7 9 7v10h-6v-7H9v7H3Z"/> : <path d="M8 4H4v18h16V4h-4 M8 2h8v5H8Z M8 12h8 M8 17h6"/>}</svg>; }

export default function LiveCounter() {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [tickets, setTickets] = useState<CounterTicketView[]>([]);
  const [presence, setPresence] = useState<CounterPresence | null>(null);
  const [waiting, setWaiting] = useState<number | null>(null);
  const [quick, setQuick] = useState<QuickRequest[]>([]);
  const [theme, setTheme] = useState("1");
  const [clock, setClock] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState("home"); const [ticketFilter, setTicketFilter] = useState<string[]>(["waiting","called","in-service"]);
  const [menu, setMenu] = useState(false); useEffect(()=>{try{window.localStorage.setItem("tpa-ticket-filters",JSON.stringify(ticketFilter));}catch{}},[ticketFilter]);
  const [demo, setDemo] = useState("");
  const [today, setToday] = useState(false);
  const [statusChoice, setStatusChoice] = useState("available");
  const [reason, setReason] = useState("");
  const statusDialog = useRef<HTMLDialogElement>(null);
  const profile = useRef<HTMLDivElement>(null);
  const loading = useRef(false);
  const stopped = useRef(false);
  const userId = useRef("");
  const generation = useRef(0);

  const requireLogin = useCallback(() => { stopped.current = true; generation.current++; setIdentity(null); setTickets([]); setQuick([]); window.location.replace("/login"); }, []);
  const loadIdentity = useCallback(async () => {
    try {
      const context = await fetch("/api/comptoir/context", { cache: "no-store", credentials: "include" });
      if (context.status === 401 || context.status === 403) { requireLogin(); return; }
      const data = await context.json();
      if (!context.ok || !data.ok) throw new Error(data.error);
      if (stopped.current) return;
      if (userId.current && userId.current !== data.seller.customerId) { window.location.reload(); return; }
      userId.current = data.seller.customerId;
      setIdentity(data.seller);
      try {
        window.sessionStorage.setItem("tpa.counter.identity", JSON.stringify(data.seller));
      } catch {}
    } catch (e) {
      if (!stopped.current) setError(errors[e instanceof Error ? e.message : ""] ?? "");
    }
  }, [requireLogin]);

  const load = useCallback(async () => {
    if (loading.current || stopped.current || document.visibilityState !== "visible") return;
    loading.current = true;
    const version = generation.current;
    try {
      const response = await fetch("/api/showroom/counter", { cache: "no-store", credentials: "include" });
      if (response.status === 401 || response.status === 403) { requireLogin(); return; }
      const queue = await response.json();
      if (!response.ok || !queue.ok) throw new Error(queue.error);
      if (stopped.current || version !== generation.current) return;

      setTickets(queue.tickets);
      setPresence(queue.presence);
      setWaiting(queue.waitingCount ?? null);
      setReady(true);
      setError("");

      const purchase = await fetch("/api/achat-rapide/counter-request", { cache: "no-store", credentials: "include" });
      if (purchase.ok) {
        const payload = await purchase.json();
        if (!stopped.current && version === generation.current && Array.isArray(payload.requests)) {
          setQuick(payload.requests);
        }
      }
    } catch (e) {
      if (!stopped.current) setError(errors[e instanceof Error ? e.message : ""] ?? "");
    } finally {
      loading.current = false;
    }
  }, [requireLogin]);

  useEffect(() => {
    stopped.current = false;
    void loadIdentity();
    void load();

    const timer = window.setInterval(() => {
      void load();
    }, 15000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void load();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stopped.current = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [load, loadIdentity]);
  useEffect(() => {
    try {
      const cached = window.sessionStorage.getItem("tpa.counter.identity");
      if (!cached) return;
      const seller = JSON.parse(cached) as Identity;
      if (seller?.customerId) {
        userId.current = seller.customerId;
        setIdentity(seller);
      }
    } catch {}
  }, []);  useEffect(() => {
    try {
      const cached = window.sessionStorage.getItem("tpa.counter.identity");
      if (!cached) return;
      const seller = JSON.parse(cached) as Identity;
      if (seller?.customerId) {
        userId.current = seller.customerId;
        setIdentity(seller);
      }
    } catch {}
  }, []);  useEffect(() => { setClock(new Date()); const timer = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => { if (identity?.customerId) { try { setTheme(localStorage.getItem(`tpa.counter.theme.${identity.customerId}`) === "2" ? "2" : "1"); } catch {} } }, [identity?.customerId]);
  useEffect(() => { function close(e: MouseEvent) { if (!profile.current?.contains(e.target as Node)) setMenu(false); } document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }, []);
  function chooseTheme(value: string) { setTheme(value); if (identity) try { localStorage.setItem(`tpa.counter.theme.${identity.customerId}`, value); } catch {} }
  async function mutate(url: string, body: unknown) {
    if (busy || !identity || !ready) return false;
    setBusy(true); setError(""); generation.current++;
    try {
      const response = await fetch(url, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (response.status === 401) { requireLogin(); return false; }
      if (!response.ok || !data.ok) throw new Error(data.error);
      if (data.presence) setPresence(data.presence);
      if (url === "/api/auth/logout") { requireLogin(); return true; }
      await load(); return true;
    } catch (e) { setError(errors[e instanceof Error ? e.message : ""] ?? "Action refusée. Actualisez le comptoir."); return false; }
    finally { setBusy(false); }
  }
  const cards = counterTicketCards(tickets, identity?.customerId ?? "", clock?.getTime());
  const active = tickets.some(t => t.sellerId === identity?.customerId && (t.status === "called" || t.status === "in-service"));
  function openStatus() { setStatusChoice(presence?.status === "mission" ? "mission" : presence?.status === "pause" ? "pause" : "available"); setReason(presence?.reason ?? ""); setMenu(false); statusDialog.current?.showModal(); }

  return <div className={styles.workspace} data-theme={theme}>
    <aside className={styles.sidebar}><div className={styles.brand}><div>TPA</div><strong>Ta Pièce Auto</strong></div><nav aria-label="Navigation vendeur">{["Comptoir", "Diagnostic", "Tickets", "Clients", "Commandes", "Catalogue", "Paramètres", "Planning"].map((label, i) => label === "Tickets" && identity?.permissions?.viewFullQueue !== true ? null : label === "Diagnostic" ? <Link key={label} href="/comptoir/diagnostic"><Icon kind="tool"/>{label}</Link> : <button key={label} className={(page === "home" && i === 0) || (page === "planning" && i === 7) ? styles.selected : ""} onClick={() => { setMenu(false); if (i === 0) setPage("home"); else if (i === 2) setPage("tickets"); else if (i === 7) setPage("planning"); else setDemo(label); }}><Icon kind={i === 0 ? "home" : "list"}/>{label}</button>)}</nav><small>{identity?.branchCode ?? "Site vendeur"} · Comptoir</small></aside>
    <div className={styles.content}><header className={styles.topbar}><button className={styles.search} onClick={() => setDemo("Recherche")}>⌕ Rechercher une pièce, une référence, un client…</button><span className={styles.site}>{identity?.branchCode ?? "…"}</span><button title="Messagerie de démonstration" aria-label="Notifications, démonstration" onClick={() => setDemo("Messagerie — démonstration")}><Icon kind="bell"/></button><button className={styles.badge} aria-label="Tâches, 4 fictives" onClick={() => setDemo("Tâches — démonstration")}><Icon kind="list"/><b>4</b></button><div ref={profile} className={styles.profile} onKeyDown={e => { if (e.key === "Escape") setMenu(false); }}><button aria-expanded={menu} onClick={() => setMenu(!menu)}><Icon kind="user"/><span><strong>{identity?.userCode ?? "…"}</strong><small>Vendeur comptoir</small></span><span>⌄</span></button>{menu && <div className={styles.profileMenu}><Link href="/comptoir/profil">Mon profil</Link><fieldset><legend>Préférences d’affichage</legend>{["Clair et moderne", "Dynamique et professionnel"].map((label, i) => <label key={label}><input type="radio" name="theme" checked={theme === String(i + 1)} onChange={() => chooseTheme(String(i + 1))}/>Design {i + 1} — {label}</label>)}</fieldset><button onClick={openStatus}>Changer mon statut</button><button onClick={() => setDemo("Mes documents — démonstration")}>Mes documents</button><button disabled={busy || !ready} onClick={() => void mutate("/api/auth/logout", {})}>Quitter le poste</button></div>}</div></header>
    <main><div className={styles.statusRow}><span>{presence ? labels[presence.status] : "Connexion au comptoir…"}</span><button onClick={openStatus} disabled={!ready || busy}>Changer mon statut</button></div>
    {error && <div role="alert" className={styles.error}>{error} <button onClick={() => void load()}>Actualiser</button></div>}
    {presence && (presence.status === "pause" || presence.status === "mission") && <section className={styles.presenceBanner}><strong>{presence.status === "pause" ? "PAUSE EN COURS" : "MISSION EN COURS"}</strong><span>{presence.reason}{presence.since ? ` · Depuis ${new Date(presence.since).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : ""}</span><button disabled={busy || !ready} onClick={() => void mutate("/api/comptoir/presence", { status: "available" })}>Revenir au comptoir</button></section>}
    {page === "home" ? <><div className={styles.heading}><div><p>COMPTOIR VENDEUR</p><h1>Bonjour <span>{identity?.firstName ?? "…"}</span></h1><h2>Votre comptoir, tout simplement.</h2></div><div className={styles.clock}><span>{clock?.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span><strong>{clock?.toLocaleTimeString("fr-FR")}</strong></div></div><section className={styles.universes} aria-label="Univers du comptoir">{[{title:"Produits & accessoires",text:"Nettoyage, pneu, entretien et accessoires universels.",icon:"box",url:"accessoires"},{title:"Lubrifiants & fluides",text:"Huile, antigel, liquide de frein, AdBlue et lave-glace.",icon:"drop",url:"huile"},{title:"Outillage",text:"Clés, douilles, pinces, crics et outils d’atelier.",icon:"tool",url:"outillage"}].map((item,i)=><article key={item.url} data-color={i}><Link className={styles.orb} href={`/comptoir/${item.url}`}><span><Icon kind={item.icon}/><strong>{item.title}</strong><i><Icon kind="arrow"/></i></span></Link><p>{item.text}</p></article>)}<div className={styles.signature}>Rapide<br/>Efficace<br/>Au comptoir</div></section>
    <section aria-label="Tickets attribués" className={styles.ticketSection}><header><h2>Vos clients</h2>{waiting !== null && <span>{waiting > 0 ? `+ ${waiting} clients en attente` : "Aucun autre client en attente"}</span>}</header>{!ready && <p>Actualisation du ticketing…</p>}{ready && cards.cards.length === 0 && <div className={styles.empty}>Aucun client en attente pour vous{presence?.status !== "available" && <small>Vous êtes temporairement indisponible pour l’attribution.</small>}</div>}<div className={styles.ticketGrid}>{cards.cards.map(ticket=><article key={ticket.id} data-ticket-card data-status={ticket.status} className={styles.ticket}><header><strong>{ticket.number}</strong><span>{ticket.status === "called" ? "Appelé" : ticket.status === "in-service" ? "En cours" : "Client absent"}</span></header><h3>{[ticket.customer.firstName,ticket.customer.lastName].filter(Boolean).join(" ") || "Demande de renseignements"}</h3><p>{ticket.vehicle.label}</p><small>{ticket.customer.phone} {ticket.reason}</small><div className={styles.actions}>{ticket.status === "called" && <><button disabled={busy || !ready} onClick={()=>void mutate("/api/showroom/counter",{action:"status",ticketId:ticket.id,status:"in-service"})}>Prendre en charge</button><button disabled={busy || !ready} onClick={()=>void mutate("/api/showroom/counter",{action:"status",ticketId:ticket.id,status:"no-show"})}>Client plus là</button></>}{ticket.status === "in-service" && <button disabled={busy || !ready} onClick={()=>void mutate("/api/showroom/counter",{action:"status",ticketId:ticket.id,status:"completed"})}>Terminer</button>}{ticket.status === "no-show" && <button disabled={busy || !ready || active || presence?.status !== "available"} onClick={()=>void mutate("/api/showroom/counter",{action:"status",ticketId:ticket.id,status:"called"})}>Reprendre</button>}</div></article>)}</div>{cards.additional > 0 && <p>+ {cards.additional} tickets attribués supplémentaires</p>}</section>
    {quick.length > 0 && <details className={styles.quick}><summary>Demandes d’achat rapide existantes ({quick.length})</summary>{quick.map(request=><div key={request.id}><strong>{request.id}</strong>{request.items?.map(item=><p key={item.productId}>{item.name} · {item.supplierCode} · Qté {item.quantity} · {item.unitPrice == null ? "Prix à confirmer" : `${item.unitPrice.toFixed(2)} €`}</p>)}</div>)}</details>}</> : page === "tickets" && identity?.permissions?.viewFullQueue === true ? <section className={styles.ticketSection}><header><h2>File complète des tickets</h2><span>Termin&eacute;s aujourd&apos;hui : {tickets.filter(ticket=>ticket.status==="completed" && ticket.completedAt && new Date(ticket.completedAt).toDateString()===new Date().toDateString()).length}</span><div className={styles.actions}>{[["all","Tous"],["waiting","En attente"],["called","Appelés"],["in-service","En cours"],["no-show","Client absent"],["completed","Terminés"]].map(([value,label])=><button key={value} aria-pressed={value==="all" ? ticketFilter.length===0 : ticketFilter.includes(value)} onClick={()=>value==="all" ? setTicketFilter([]) : setTicketFilter(current=>current.includes(value) ? current.filter(item=>item!==value) : [...current,value])}>{label}</button>)}</div></header><div className={styles.ticketGrid}>{tickets.filter(ticket=>ticketFilter.length===0 || ticketFilter.includes(ticket.status)).map(ticket=><article key={ticket.id} className={styles.ticket} data-status={ticket.status}><header><strong>{ticket.number}</strong><span>{ticket.status === "waiting" ? "En attente" : ticket.status === "called" ? "Appelé" : ticket.status === "in-service" ? "En cours" : ticket.status === "no-show" ? "Client absent" : ticket.status === "completed" ? "Terminé" : ticket.status === "cancelled" ? "Annulé" : ticket.status}</span></header><h3>{[ticket.customer.firstName,ticket.customer.lastName].filter(Boolean).join(" ") || "Client"}</h3><p>{ticket.vehicle.label || "Vehicule non renseigne"}</p><small>{new Date(ticket.createdAt).toLocaleDateString("fr-BE")} · {new Date(ticket.createdAt).toLocaleTimeString("fr-BE",{hour:"2-digit",minute:"2-digit"})} · {ticket.branchCode ?? ticket.storeId} · {ticket.terminalCode ?? ticket.terminalId}</small><small className={styles.ticketSeller}>{ticket.sellerName ?? "Non attribue"}</small></article>)}</div>{tickets.length === 0 && <div className={styles.empty}>Aucun ticket dans la file.</div>}<div className={styles.actions}><button onClick={()=>setPage("home")}>Retour au comptoir</button></div></section> : <section className={styles.planning}><h1>Planning de ma semaine</h1><p>Démonstration — aucun planning réel connecté.</p><div><button onClick={()=>setToday(true)} aria-pressed={today}>Aujourd’hui</button><button onClick={()=>setToday(false)} aria-pressed={!today}>Semaine</button><button onClick={()=>setPage("home")}>Retour au comptoir</button></div><div className={styles.planningGrid}>{["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"].filter((_,i)=>!today||i===((clock?.getDay()??1)+6)%7).map(day=><article key={day}><h2>{day}</h2><strong>{day === "Samedi" || day === "Dimanche" ? "Repos" : "08:00 → 17:00"}</strong><p>{day === "Mercredi" ? "Exemple : déplacement vers un autre site, 09:00–17:30" : `Site principal ${identity?.branchCode ?? ""}`}</p><small>Pause 10:15–10:30 · Repas 12:00–12:45</small></article>)}</div></section>}
    </main></div>
    <dialog ref={statusDialog} className={styles.dialog}><h2>Changer mon statut</h2><form onSubmit={async e=>{e.preventDefault();if(await mutate("/api/comptoir/presence",{status:statusChoice,reason}))statusDialog.current?.close();}}>{[["available","Disponible au comptoir","Je peux recevoir des clients."],["pause","En pause","Aucun nouveau client ne m’est attribué."],["mission","En mission","Je travaille temporairement hors comptoir."]].map(([value,label,description])=><label key={value}><input type="radio" name="presence" checked={statusChoice===value} onChange={()=>setStatusChoice(value)}/><span><strong>{label}</strong><small>{description}</small></span></label>)}{statusChoice === "mission" && <label>Mission / motif<input maxLength={120} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Rangement réception"/></label>}{active && statusChoice!=="available" && <p role="alert">Traitez d’abord le ticket appelé ou en cours.</p>}{error && <p role="alert">{error}</p>}<div className={styles.actions}><button type="button" onClick={()=>statusDialog.current?.close()}>Annuler</button><button disabled={busy || !ready || (active && statusChoice!=="available")}>Confirmer</button></div></form></dialog>
    {demo && <div className={styles.demoPanel} role="dialog" aria-label={demo}><button onClick={()=>setDemo("")}>Fermer</button><h2>{demo}</h2><p>Cette partie reste en démonstration, sans connexion métier.</p>{demo.startsWith("Tâches") && <ul><li>Ranger arrivage filtres</li><li>Contrôler rayon huiles</li><li>Déballer commande fournisseur</li><li>Nettoyer zone comptoir</li></ul>}</div>}
  </div>;
}
