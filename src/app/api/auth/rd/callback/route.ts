import { NextRequest, NextResponse } from "next/server";
import { createTotemWebhook, exchangeCodeForAccessToken, getRdOAuthConfig, verifyOAuthState } from "@/lib/rd-oauth";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  try {
    const config = getRdOAuthConfig();
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    if (!code || !state || !verifyOAuthState(state, config.webhookSecret)) {
      return NextResponse.json({ ok: false, error: "Autorização inválida ou expirada." }, { status: 400 });
    }

    const accessToken = await exchangeCodeForAccessToken(code, config);
    const webhook = await createTotemWebhook(accessToken, config, request.nextUrl.origin);
    console.info("Webhook do Totem criado no RD via OAuth");
    return NextResponse.json({
      ok: true,
      message: "Conta RD conectada e webhook do Totem criado com sucesso.",
      eventIdentifiers: [
        "[FORM] - Totem de Autoatendimento",
        "[LEADSTER] - LP Totem",
        "totem-de-autoatendimento",
      ],
      webhookCreated: Boolean(webhook),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Falha ao conectar RD", { message });
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
