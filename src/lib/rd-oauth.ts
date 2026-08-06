import { createHmac, timingSafeEqual } from "node:crypto";

const RD_AUTH_URL = "https://api.rd.services/auth/dialog";
const RD_TOKEN_URL = "https://api.rd.services/auth/token?token_by=code";
const RD_WEBHOOKS_URL = "https://api.rd.services/integrations/webhooks";

export const TOTEM_EVENT_IDENTIFIERS = [
  "[FORM] - Totem de Autoatendimento",
  "[LEADSTER] - LP Totem",
  "totem-de-autoatendimento",
];

type RdOAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  webhookSecret: string;
};

export function getRdOAuthConfig(): RdOAuthConfig {
  const clientId = process.env.RD_CLIENT_ID;
  const clientSecret = process.env.RD_CLIENT_SECRET;
  const redirectUri = process.env.RD_REDIRECT_URI;
  const webhookSecret = process.env.RD_WEBHOOK_SECRET;
  if (!clientId || !clientSecret || !redirectUri || !webhookSecret) {
    throw new Error("RD_CLIENT_ID, RD_CLIENT_SECRET, RD_REDIRECT_URI ou RD_WEBHOOK_SECRET não configurado.");
  }
  return { clientId, clientSecret, redirectUri, webhookSecret };
}

export function createOAuthState(secret: string, now = Date.now()): string {
  const timestamp = String(now);
  const signature = createHmac("sha256", secret).update(timestamp).digest("hex");
  return Buffer.from(`${timestamp}.${signature}`).toString("base64url");
}

export function verifyOAuthState(state: string, secret: string, now = Date.now()): boolean {
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    const [timestamp, signature] = decoded.split(".");
    if (!timestamp || !signature || now - Number(timestamp) > 15 * 60 * 1000 || Number(timestamp) > now + 60_000) return false;
    const expected = createHmac("sha256", secret).update(timestamp).digest("hex");
    return signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function buildRdAuthorizationUrl(config: RdOAuthConfig, state: string): string {
  const url = new URL(RD_AUTH_URL);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeCodeForAccessToken(code: string, config: RdOAuthConfig): Promise<string> {
  const response = await fetch(RD_TOKEN_URL, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: config.clientId, client_secret: config.clientSecret, code }),
    cache: "no-store",
  });
  const data = await safeJson(response);
  if (!response.ok) throw new Error(`RD recusou a troca do código (HTTP ${response.status}): ${errorMessage(data)}`);
  const accessToken = isRecord(data) ? data.access_token : undefined;
  if (typeof accessToken !== "string" || !accessToken) throw new Error("RD não retornou access_token.");
  return accessToken;
}

export async function createTotemWebhook(accessToken: string, config: RdOAuthConfig, appOrigin: string) {
  const webhookUrl = new URL("/api/webhooks/rd", appOrigin);
  webhookUrl.searchParams.set("secret", config.webhookSecret);
  const response = await fetch(RD_WEBHOOKS_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event_type: "WEBHOOK.CONVERTED",
      entity_type: "CONTACT",
      event_identifiers: TOTEM_EVENT_IDENTIFIERS,
      url: webhookUrl.toString(),
      http_method: "POST",
      include_relations: ["COMPANY", "CONTACT_FUNNEL"],
    }),
    cache: "no-store",
  });
  const data = await safeJson(response);
  if (!response.ok) throw new Error(`RD recusou a criação do webhook (HTTP ${response.status}): ${errorMessage(data)}`);
  return data;
}

async function safeJson(response: Response): Promise<unknown> {
  const text = await response.text();
  try { return text ? JSON.parse(text) : null; } catch { return text; }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function errorMessage(value: unknown): string {
  if (isRecord(value)) return String(value.error_message ?? value.error_description ?? value.error ?? "erro não detalhado");
  return typeof value === "string" && value ? value.slice(0, 300) : "erro não detalhado";
}
