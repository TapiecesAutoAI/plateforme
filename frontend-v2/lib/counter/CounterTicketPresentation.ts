import type { CounterTicket } from "./CounterTicketStore";

export function counterTicketCards(tickets: CounterTicket[], sellerId: string, now = Date.now()) {
  const relevant = tickets.filter(t => t.sellerId === sellerId && (
    t.status === "called" || t.status === "in-service" ||
    (t.status === "no-show" && !!t.noShowAt && now - Date.parse(t.noShowAt) < 5 * 60_000)
  )).sort((a, b) => Number(a.status === "no-show") - Number(b.status === "no-show") || a.createdAt.localeCompare(b.createdAt));
  return { cards: relevant.slice(0, 2), additional: Math.max(0, relevant.length - 2) };
}
