import { routeForEvent } from "@/config/products";
import { buildLeadCustomFields, buildNamedCustomFields } from "@/lib/field-mapping";
import { KommoClient } from "@/lib/kommo";
import type { ParsedRdConversion } from "@/lib/rd";

export async function syncConversion(conversion: ParsedRdConversion) {
  const route = routeForEvent(conversion.eventIdentifier);
  if (!route) return { status: "ignored" as const, reason: "Evento não mapeado" };
  if (!conversion.phone && !conversion.email) {
    throw new Error("Conversão sem telefone e sem e-mail; não é possível identificar o contato.");
  }

  const subdomain = process.env.KOMMO_SUBDOMAIN;
  const token = process.env.KOMMO_LONG_LIVED_TOKEN;
  if (!subdomain || !token) throw new Error("KOMMO_SUBDOMAIN ou KOMMO_LONG_LIVED_TOKEN não configurado.");

  const kommo = new KommoClient(token, subdomain);
  const [{ pipelineId, statusId }, leadFields, contactFields, companyFields] = await Promise.all([
    kommo.resolvePipeline(route.pipelineName, route.stageName),
    kommo.getCustomFields("leads"),
    route.mapPartnerFields ? kommo.getCustomFields("contacts") : Promise.resolve([]),
    route.mapPartnerFields ? kommo.getCustomFields("companies") : Promise.resolve([]),
  ]);

  const responsibleUserId = route.responsibleUserId;

  const origin = readableOrigin(conversion.origin);
  const utms = originFields(conversion.origin);
  const idFromCustomFields = findCustomValue(conversion.customFields, ["id da conversao", "conversion id", "id conversao"]);
  const cnpj = findCustomValue(conversion.customFields, ["cnpj"]);
  const contactMapped = route.mapPartnerFields
    ? buildNamedCustomFields(contactFields, [
      { names: ["CNPJ"], value: cnpj },
    ])
    : emptyFieldMapping();
  const companyMapped = route.mapPartnerFields
    ? buildNamedCustomFields(companyFields, [
      { names: ["CNPJ"], value: cnpj },
      { names: ["Cidade"], value: conversion.city },
      { names: ["Estado"], value: conversion.state },
    ])
    : emptyFieldMapping();
  const mapped = buildLeadCustomFields(leadFields, {
    product: route.product,
    focus: customerFocus(route.product),
    source: route.source,
    rdOrigin: origin,
    event: conversion.eventIdentifier,
    eventId: idFromCustomFields,
    eventDate: conversion.eventTimestamp,
    rdUuid: conversion.rdContactUuid,
    ...utms,
    custom: conversion.customFields,
  });

  let contact = await kommo.findContact(conversion.phone, conversion.email);
  if (contact) {
    await kommo.updateContact(
      contact.id,
      conversion.name,
      conversion.phone,
      conversion.email,
      contactMapped.fields,
    );
  }
  else contact = await kommo.createContact(
    conversion.name,
    conversion.phone,
    conversion.email,
    responsibleUserId,
    contactMapped.fields,
  );

  const company = conversion.company
    ? await kommo.findOrCreateCompany(conversion.company, companyMapped.fields)
    : undefined;
  if (company) await kommo.ensureCompanyLink("contacts", contact.id, company.id);

  const existing = await kommo.findOpenProductLead(contact, pipelineId, route.product);
  if (existing) {
    await kommo.updateLead(existing.id, statusId, mapped.fields, route.tags);
    if (company) await kommo.ensureCompanyLink("leads", existing.id, company.id);
    return {
      status: "updated" as const,
      contactId: contact.id,
      leadId: existing.id,
      companyId: company?.id,
      mappedFields: mapped.mappedFields,
      mappedContactFields: contactMapped.mappedFields,
      mappedCompanyFields: companyMapped.mappedFields,
      warnings: [...mapped.warnings, ...contactMapped.warnings, ...companyMapped.warnings],
    };
  }

  const lead = await kommo.createLead({
    name: `${route.product} | ${conversion.name}`,
    pipelineId,
    statusId,
    contactId: contact.id,
    companyId: company?.id,
    responsibleUserId,
    tags: route.tags,
    customFields: mapped.fields,
  });
  return {
    status: "created" as const,
    contactId: contact.id,
    leadId: lead.id,
    companyId: company?.id,
    mappedFields: mapped.mappedFields,
    mappedContactFields: contactMapped.mappedFields,
    mappedCompanyFields: companyMapped.mappedFields,
    warnings: [...mapped.warnings, ...contactMapped.warnings, ...companyMapped.warnings],
  };
}

function customerFocus(product: string): "Totem" | "Comanda" | "Catraca" | "Teloos" | undefined {
  const normalized = product.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (normalized.includes("totem")) return "Totem";
  if (normalized.includes("catraca")) return "Catraca";
  if (normalized.includes("comanda")) return "Comanda";
  if (normalized.includes("teloos")) return "Teloos";
  return undefined;
}

function readableOrigin(origin: unknown): string | undefined {
  if (!origin) return undefined;
  if (typeof origin === "string") return origin;
  if (typeof origin === "object") {
    const values = Object.entries(origin as Record<string, unknown>)
      .filter(([, value]) => value !== null && value !== "")
      .map(([key, value]) => `${key}: ${String(value)}`);
    return values.join(" | ") || undefined;
  }
  return String(origin);
}

function originFields(origin: unknown) {
  if (!origin || typeof origin !== "object") return {};
  const data = origin as Record<string, unknown>;
  const pick = (...keys: string[]) => keys.map((key) => data[key]).find((value) => value !== undefined && value !== null && value !== "");
  return {
    utmSource: pick("utm_source", "source"),
    utmMedium: pick("utm_medium", "medium"),
    utmCampaign: pick("utm_campaign", "campaign"),
    utmContent: pick("utm_content", "content", "value"),
    utmTerm: pick("utm_term", "term"),
  };
}

function findCustomValue(fields: Record<string, unknown>, aliases: string[]): unknown {
  for (const [key, value] of Object.entries(fields)) {
    const normalized = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/^cf_/, "").replace(/_/g, " ").toLowerCase();
    if (aliases.some((alias) => normalized.includes(alias))) return value;
  }
  return undefined;
}

function emptyFieldMapping() {
  return {
    fields: [],
    mappedFields: [],
    warnings: [],
  };
}
