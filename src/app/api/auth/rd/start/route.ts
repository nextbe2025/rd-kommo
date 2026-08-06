import { NextRequest, NextResponse } from "next/server";
import { buildRdAuthorizationUrl, createOAuthState, getRdOAuthConfig } from "@/lib/rd-oauth";

export const runtime = "nodejs";

export function GET(request: NextRequest) {
  try {
    const config = getRdOAuthConfig();
    if (request.nextUrl.searchParams.get("secret") !== config.webhookSecret) {
      return NextResponse.json({ ok: false, error: "Acesso não autorizado." }, { status: 401 });
    }
    const state = createOAuthState(config.webhookSecret);
    return NextResponse.redirect(buildRdAuthorizationUrl(config, state));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
