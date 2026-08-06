import { NextRequest, NextResponse } from "next/server";
import { parseRdWebhook, sanitizedReceipt } from "@/lib/rd";
import { syncConversion } from "@/lib/sync";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const configuredSecret = process.env.RD_WEBHOOK_SECRET;
  const suppliedSecret = request.nextUrl.searchParams.get("secret") || request.headers.get("x-webhook-secret");
  if (configuredSecret && suppliedSecret !== configuredSecret) {
    return NextResponse.json({ ok: false, error: "Webhook não autorizado." }, { status: 401 });
  }

  try {
    const conversion = parseRdWebhook(await request.json());
    const receipt = sanitizedReceipt(conversion);

    if (process.env.KOMMO_SYNC_ENABLED !== "true") {
      console.info("RD webhook capturado (modo seguro)", receipt);
      return NextResponse.json({ ok: true, mode: "capture", receipt });
    }

    const result = await syncConversion(conversion);
    console.info("RD webhook processado", { eventIdentifier: conversion.eventIdentifier, ...result });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Falha ao processar webhook RD", { message });
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
