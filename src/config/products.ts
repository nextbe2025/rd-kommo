export type Source = "Site" | "Leadster" | "Landing Page" | "RD Station";

export type ProductRoute = {
  product: string;
  source: Source;
  pipelineName: string;
  stageName: string;
  tags: string[];
};

const pipelineName = process.env.KOMMO_PIPELINE_NAME || "Funil Nextcard";
const stageName = process.env.KOMMO_ENTRY_STAGE_NAME || "NOVOS LEADS RD";
const teloosPipelineName = process.env.KOMMO_TELOOS_PIPELINE_NAME || "Funil Teloos";
const teloosStageName = process.env.KOMMO_TELOOS_ENTRY_STAGE_NAME || "NOVOS LEADS RD";

export const productRoutes: Record<string, ProductRoute> = {
  "totem-geral": {
    product: "Totem de Autoatendimento",
    source: "RD Station",
    pipelineName,
    stageName,
    tags: ["RD", "Totem"],
  },
  "totem-site": {
    product: "Totem de Autoatendimento",
    source: "Site",
    pipelineName,
    stageName,
    tags: ["RD", "Totem", "Site"],
  },
  "totem-leadster": {
    product: "Totem de Autoatendimento",
    source: "Leadster",
    pipelineName,
    stageName,
    tags: ["RD", "Totem", "Leadster"],
  },
  "totem-lp": {
    product: "Totem de Autoatendimento",
    source: "Landing Page",
    pipelineName,
    stageName,
    tags: ["RD", "Totem", "LP"],
  },
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
  "catracas-geral": {
    product: "Catracas Expedidoras de Comandas",
    source: "RD Station",
    pipelineName,
    stageName,
    tags: ["RD", "Catracas"],
  },
  "catracas-site": {
    product: "Catracas Expedidoras de Comandas",
    source: "Site",
    pipelineName,
    stageName,
    tags: ["RD", "Catracas", "Site"],
  },
  "catracas-leadster": {
    product: "Catracas Expedidoras de Comandas",
    source: "Leadster",
    pipelineName,
    stageName,
    tags: ["RD", "Catracas", "Leadster"],
  },
  "catracas-lp": {
    product: "Catracas Expedidoras de Comandas",
    source: "Landing Page",
    pipelineName,
    stageName,
    tags: ["RD", "Catracas", "LP"],
  },
  "[FORM] - Catracas Expedidoras de Comandas": {
    product: "Catracas Expedidoras de Comandas",
    source: "Site",
    pipelineName,
    stageName,
    tags: ["RD", "Catracas", "Site"],
  },
  "[LEADSTER] - LP Catracas Expedidoras": {
    product: "Catracas Expedidoras de Comandas",
    source: "Leadster",
    pipelineName,
    stageName,
    tags: ["RD", "Catracas", "Leadster"],
  },
  "catracas-expedidoras-de-comandas": {
    product: "Catracas Expedidoras de Comandas",
    source: "Landing Page",
    pipelineName,
    stageName,
    tags: ["RD", "Catracas", "LP"],
  },
  "comandas-geral": {
    product: "Comandas Eletrônicas",
    source: "RD Station",
    pipelineName,
    stageName,
    tags: ["RD", "Comandas"],
  },
  "comandas-site": {
    product: "Comandas Eletrônicas",
    source: "Site",
    pipelineName,
    stageName,
    tags: ["RD", "Comandas", "Site"],
  },
  "comandas-leadster": {
    product: "Comandas Eletrônicas",
    source: "Leadster",
    pipelineName,
    stageName,
    tags: ["RD", "Comandas", "Leadster"],
  },
  "comandas-lp": {
    product: "Comandas Eletrônicas",
    source: "Landing Page",
    pipelineName,
    stageName,
    tags: ["RD", "Comandas", "LP"],
  },
  "[FORM] - Comandas Eletrônicas Site": {
    product: "Comandas Eletrônicas",
    source: "Site",
    pipelineName,
    stageName,
    tags: ["RD", "Comandas", "Site"],
  },
  "[LEADSTER] - LP Comandas Eletrônicas": {
    product: "Comandas Eletrônicas",
    source: "Leadster",
    pipelineName,
    stageName,
    tags: ["RD", "Comandas", "Leadster"],
  },
  "comandas-eletronicas-google": {
    product: "Comandas Eletrônicas",
    source: "Landing Page",
    pipelineName,
    stageName,
    tags: ["RD", "Comandas", "LP"],
  },
  "teloos-geral": {
    product: "Teloos",
    source: "RD Station",
    pipelineName: teloosPipelineName,
    stageName: teloosStageName,
    tags: ["RD", "Teloos"],
  },
  "teloos-site": {
    product: "Teloos",
    source: "Site",
    pipelineName: teloosPipelineName,
    stageName: teloosStageName,
    tags: ["RD", "Teloos", "Site"],
  },
  "teloos-leadster": {
    product: "Teloos",
    source: "Leadster",
    pipelineName: teloosPipelineName,
    stageName: teloosStageName,
    tags: ["RD", "Teloos", "Leadster"],
  },
  "Formulário de Contato - Site Teloos": {
    product: "Teloos",
    source: "Site",
    pipelineName: teloosPipelineName,
    stageName: teloosStageName,
    tags: ["RD", "Teloos", "Site"],
  },
  "[LEADSTER] - Site Teloos": {
    product: "Teloos",
    source: "Leadster",
    pipelineName: teloosPipelineName,
    stageName: teloosStageName,
    tags: ["RD", "Teloos", "Leadster"],
  },
};

export function routeForEvent(eventIdentifier: string): ProductRoute | undefined {
  return productRoutes[eventIdentifier.trim()];
}
