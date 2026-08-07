import type { KommoCustomField, KommoFieldValue } from "@/lib/kommo-types";
import { normalizeText } from "@/lib/normalize";

const aliases: Record<string, string[]> = {
  product: ["Produto", "Produto de interesse"],
  focus: ["Foco do Cliente"],
  source: ["Canal de entrada", "Origem da conversão", "Fonte do lead"],
  rdOrigin: ["Origem RD", "Origem de marketing"],
  event: ["Evento RD", "Converteu no evento", "Identificador do evento"],
  eventId: ["ID da Conversão", "ID da Conversão RD"],
  eventDate: ["Data da conversão", "Data da última conversão"],
  rdUuid: ["UUID do contato RD", "RD Contact UUID", "UUID RD"],
  utmSource: ["UTM_SOURCE", "UTM Source"],
  utmMedium: ["UTM_MEDIUM", "UTM Medium"],
  utmCampaign: ["UTM_CAMPAIGN", "UTM Campaign"],
  utmContent: ["UTM_CONTENT", "UTM Content"],
  utmTerm: ["UTM_TERM", "UTM Term"],
};

export type SemanticLeadData = {
  product: unknown;
  focus?: unknown;
  source: unknown;
  rdOrigin?: unknown;
  event: unknown;
  eventId?: unknown;
  eventDate?: unknown;
  rdUuid?: unknown;
  utmSource?: unknown;
  utmMedium?: unknown;
  utmCampaign?: unknown;
  utmContent?: unknown;
  utmTerm?: unknown;
  custom: Record<string, unknown>;
};

export function buildLeadCustomFields(fields: KommoCustomField[], data: SemanticLeadData) {
  const warnings: string[] = [];
  const output: KommoFieldValue[] = [];
  const mappedFields: Array<{ id: number; name: string; type: string }> = [];
  const claimed = new Set<number>();

  for (const [semantic, names] of Object.entries(aliases)) {
    const value = data[semantic as keyof Omit<SemanticLeadData, "custom">];
    if (value === undefined || value === null || value === "") continue;
    const field = findField(fields, names);
    if (!field) {
      warnings.push(`Campo opcional não encontrado na Kommo: ${names[0]}`);
      continue;
    }
    const mapped = toFieldValue(field, value);
    if (mapped) {
      output.push(mapped);
      mappedFields.push({ id: field.id, name: field.name, type: field.type });
      claimed.add(field.id);
    }
    else warnings.push(`Valor não compatível com ${field.name}: ${String(value)}`);
  }

  for (const [rdKey, value] of Object.entries(data.custom)) {
    const candidateNames = [rdKey.replace(/^cf_/, "").replace(/_/g, " "), rdKey];
    const field = findField(fields, candidateNames);
    if (!field || claimed.has(field.id)) {
      if (!field) warnings.push(`Campo RD sem correspondente na Kommo: ${rdKey}`);
      continue;
    }
    const mapped = toFieldValue(field, value);
    if (mapped) {
      output.push(mapped);
      mappedFields.push({ id: field.id, name: field.name, type: field.type });
      claimed.add(field.id);
    }
    else warnings.push(`Valor não compatível com ${field.name}: ${String(value)}`);
  }

  return { fields: output, mappedFields, warnings };
}

function findField(fields: KommoCustomField[], names: string[]): KommoCustomField | undefined {
  const normalized = names.map(normalizeText);
  return fields.find((field) => normalized.includes(normalizeText(field.name)) || (field.code && normalized.includes(normalizeText(field.code))));
}

function toFieldValue(field: KommoCustomField, rawValue: unknown): KommoFieldValue | undefined {
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
  if (value === undefined || value === null || value === "") return undefined;

  if (["select", "radiobutton", "multiselect"].includes(field.type)) {
    const enumValue = field.enums?.find((item) => normalizeText(item.value) === normalizeText(value));
    if (!enumValue) return undefined;
    return { field_id: field.id, values: [{ value: enumValue.value, enum_id: enumValue.id }] };
  }
  if (field.type === "numeric") {
    const number = Number(String(value).replace(",", "."));
    if (!Number.isFinite(number)) return undefined;
    return { field_id: field.id, values: [{ value: number }] };
  }
  if (field.type === "checkbox") {
    const checked = ["true", "1", "sim", "yes", "granted"].includes(normalizeText(value));
    return { field_id: field.id, values: [{ value: checked }] };
  }
  if (field.type === "date" || field.type === "date_time") {
    const timestamp = Math.floor(new Date(String(value)).getTime() / 1000);
    if (!Number.isFinite(timestamp)) return undefined;
    return { field_id: field.id, values: [{ value: timestamp }] };
  }
  return { field_id: field.id, values: [{ value: String(value) }] };
}
