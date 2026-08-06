export type Source = "Site" | "Leadster" | "Landing Page";

export type ProductRoute = {
  product: string;
  source: Source;
  pipelineName: string;
  stageName: string;
  tags: string[];
};

const pipelineName = process.env.KOMMO_PIPELINE_NAME || "Funil Nextcard";
const stageName = process.env.KOMMO_ENTRY_STAGE_NAME || "ETAPA DE LEADS ENTRADA";

export const productRoutes: Record<string, ProductRoute> = {
  "[FORM] - Totem de Autoatendimento": {
    product: "Totem de Autoatendimento",
    source: "Site",
    pipelineName,
    stageName,
    tags: ["RD", "Totem", "Site"],
  },
  "[LEADSTER] - LP Totem": {
    product: "Totem de Autoatendimento",
    source: "Leadster",
    pipelineName,
    stageName,
    tags: ["RD", "Totem", "Leadster"],
  },
  "totem-de-autoatendimento": {
    product: "Totem de Autoatendimento",
    source: "Landing Page",
    pipelineName,
    stageName,
    tags: ["RD", "Totem", "LP"],
  },
};

export function routeForEvent(eventIdentifier: string): ProductRoute | undefined {
  return productRoutes[eventIdentifier.trim()];
}
