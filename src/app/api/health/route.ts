import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "nextcard-rd-kommo",
    kommoConfigured: Boolean(process.env.KOMMO_SUBDOMAIN && process.env.KOMMO_LONG_LIVED_TOKEN),
    rdOAuthConfigured: Boolean(process.env.RD_CLIENT_ID && process.env.RD_CLIENT_SECRET && process.env.RD_REDIRECT_URI),
    syncEnabled: process.env.KOMMO_SYNC_ENABLED === "true",
  });
}
