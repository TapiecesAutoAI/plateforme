import { createHmac } from "node:crypto";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as createRequest, GET as listRequests } from "../app/api/achat-rapide/counter-request/route";
import { proxy } from "../proxy";
import { POST as diagnostic } from "../app/api/diagnostic-v2/route";

function token(accessRole = "seller", organizationId = "org-test") {
  const payload = Buffer.from(JSON.stringify({ authenticated: true, role: accessRole === "seller" ? "seller" : "customer", channel: accessRole === "seller" ? "counter" : "customer-web", permissions: [], accessRole, customerId: "account-test", organizationId })).toString("base64url");
  return `${payload}.${createHmac("sha256", "test-secret").update(payload).digest("hex")}`;
}
function request(path: string, body?: unknown, cookie: string | null = token()) {
  return new NextRequest(`http://localhost${path}`, { method: body === undefined ? "GET" : "POST", headers: { ...(cookie ? { cookie: `tpa_session=${cookie}` } : {}), "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}
const basket = { type: "order", items: [{ productId: "p-test", supplierCode: "ref-test", name: "Produit test", unitPrice: 12, quantity: 2 }] };

beforeEach(() => {
  vi.stubEnv("TPA_SESSION_SECRET", "test-secret");
  vi.stubEnv("PRIVATE_ACCESS_TOKEN", "legacy-secret");
  globalThis.__tpaQuickPurchaseRequests = [];
});
afterEach(() => { vi.unstubAllEnvs(); globalThis.__tpaQuickPurchaseRequests = []; });

describe("Direct seller workflows without client selection or kiosk context", () => {
  it("starts and evaluates the existing diagnostic engine with the seller profile alone", async () => {
    const body = { command: "start", sessionId: "counter-direct-test", profile: "vendeur-pieces-auto", domain: "starting", message: "ma voiture ne démarre pas", originalMessage: "ma voiture ne démarre pas", deterministicMessage: "ma voiture ne démarre pas" };
    const started = await diagnostic(request("/api/diagnostic-v2", body));
    expect(started.status).toBe(201);
    expect((await started.json()).session.id).toBe(body.sessionId);
    const evaluated = await diagnostic(request("/api/diagnostic-v2", { command: "evaluate", sessionId: body.sessionId, domain: "starting" }));
    expect(evaluated.status).toBe(200);
    expect((await evaluated.json()).session.id).toBe(body.sessionId);
  });

  it.each(["/api/achat-rapide/interpret", "/api/fluids/vehicle-finder"])("allows a signed seller session at %s without private access", path => {
    expect(proxy(request(path)).headers.get("x-middleware-next")).toBe("1");
    expect(proxy(request(path, undefined, "forged")).status).toBe(307);
    expect(proxy(request(path, undefined, null)).status).toBe(307);
    expect(proxy(request(path, undefined, token("seller", ""))).status).toBe(307);
  });

  it.each(["order", "advice"])("records %s directly in the existing seller organization queue", async type => {
    const result = await createRequest(request("/api/achat-rapide/counter-request", { ...basket, type, customerId: "spoofed-client", organizationId: "spoofed-org" }));
    expect(result.status).toBe(200);
    expect((await result.json()).request).toMatchObject({ customerId: "account-test", organizationId: "org-test", total: 24, status: "waiting", type });
    expect(globalThis.__tpaQuickPurchaseRequests).toHaveLength(1);
    const own = await (await listRequests(request("/api/achat-rapide/counter-request"))).json();
    expect(own.requests).toHaveLength(1);
    const other = await (await listRequests(request("/api/achat-rapide/counter-request", undefined, token("seller", "other-org")))).json();
    expect(other.requests).toEqual([]);
  });

  it("preserves client identity in the existing client journey", async () => {
    const result = await createRequest(request("/api/achat-rapide/counter-request", { ...basket, customerId: "spoofed-client" }, token("client")));
    expect((await result.json()).request.customerId).toBe("account-test");
  });

  it.each([null, "forged", token("wholesaler_admin"), token("seller", "")])("rejects unauthorized basket creation", async cookie => {
    expect((await createRequest(request("/api/achat-rapide/counter-request", basket, cookie))).status).toBeGreaterThanOrEqual(401);
    expect(globalThis.__tpaQuickPurchaseRequests).toHaveLength(0);
  });
});
