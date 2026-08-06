import { normalizeBrazilPhone, normalizeEmail } from "@/lib/normalize";

export type RdWebhook = {
  event_type?: string;
  entity_type?: string;
  event_identifier?: string;
  timestamp?: string;
  event_timestamp?: string;
  contact?: Record<string, unknown>;
  [key: string]: unknown;
};

export type ParsedRdConversion = {
  eventIdentifier: string;
  eventTimestamp?: string;
  rdContactUuid?: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  origin?: unknown;
  customFields: Record<string, unknown>;
  rawKeys: string[];
};

const standardContactKeys = new Set([
  "uuid", "email", "name", "job_title", "bio", "website", "personal_phone",
  "mobile_phone", "city", "state", "facebook", "linkedin", "twitter", "tags",
  "company", "lifecycle_stage", "opportunity", "contact_owner_email", "interest",
  "fit", "origin", "legal_bases",
]);

export function parseRdWebhook(body: unknown): ParsedRdConversion {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Payload do RD deve ser um objeto JSON.");
  }

  const payload = body as RdWebhook;
  const contact = payload.contact;
  if (!contact || typeof contact !== "object" || Array.isArray(contact)) {
    throw new Error("Payload do RD sem o objeto contact.");
  }

  const eventIdentifier = String(payload.event_identifier ?? "").trim();
  if (!eventIdentifier) throw new Error("Payload do RD sem event_identifier.");

  const customFields = Object.fromEntries(
    Object.entries(contact).filter(([key, value]) =>
      value !== null && value !== "" && (key.startsWith("cf_") || !standardContactKeys.has(key)),
    ),
  );

  return {
    eventIdentifier,
    eventTimestamp: String(payload.event_timestamp ?? payload.timestamp ?? "") || undefined,
    rdContactUuid: String(contact.uuid ?? "") || undefined,
    name: String(contact.name ?? "Contato RD").trim() || "Contato RD",
    email: normalizeEmail(contact.email),
    phone: normalizeBrazilPhone(contact.mobile_phone ?? contact.personal_phone),
    company: String(contact.company ?? "").trim() || undefined,
    origin: contact.origin,
    customFields,
    rawKeys: Object.keys(contact).sort(),
  };
}

export function sanitizedReceipt(conversion: ParsedRdConversion) {
  return {
    eventIdentifier: conversion.eventIdentifier,
    hasName: Boolean(conversion.name),
    hasEmail: Boolean(conversion.email),
    hasPhone: Boolean(conversion.phone),
    contactKeys: conversion.rawKeys,
    customFieldKeys: Object.keys(conversion.customFields).sort(),
  };
}
