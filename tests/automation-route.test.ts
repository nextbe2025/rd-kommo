import { describe, expect, it } from "vitest";
import { routeForEvent } from "../src/config/products";

describe("rotas dos fluxos de automação RD", () => {
  it("separa as três origens do Totem", () => {
    expect(routeForEvent("totem-site")?.source).toBe("Site");
    expect(routeForEvent("totem-leadster")?.source).toBe("Leadster");
    expect(routeForEvent("totem-lp")?.source).toBe("Landing Page");
  });

  it("aceita uma rota geral para qualquer entrada do Totem", () => {
    expect(routeForEvent("totem-geral")).toMatchObject({
      product: "Totem de Autoatendimento",
      source: "RD Station",
    });
  });

  it("mapeia as três entradas de Catracas", () => {
    expect(routeForEvent("[FORM] - Catracas Expedidoras de Comandas")).toMatchObject({
      product: "Catracas Expedidoras de Comandas",
      source: "Site",
      tags: ["RD", "Catracas", "Site"],
    });
    expect(routeForEvent("[LEADSTER] - LP Catracas Expedidoras")?.source).toBe("Leadster");
    expect(routeForEvent("catracas-expedidoras-de-comandas")?.source).toBe("Landing Page");
  });

  it("aceita uma rota geral para qualquer entrada de Catracas", () => {
    expect(routeForEvent("catracas-geral")).toMatchObject({
      product: "Catracas Expedidoras de Comandas",
      source: "RD Station",
      tags: ["RD", "Catracas"],
    });
  });

  it("mapeia as três entradas de Comandas Eletrônicas", () => {
    expect(routeForEvent("[FORM] - Comandas Eletrônicas Site")).toMatchObject({
      product: "Comandas Eletrônicas",
      source: "Site",
      tags: ["RD", "Comandas", "Site"],
    });
    expect(routeForEvent("[LEADSTER] - LP Comandas Eletrônicas")?.source).toBe("Leadster");
    expect(routeForEvent("comandas-eletronicas-google")?.source).toBe("Landing Page");
  });

  it("aceita uma rota geral para qualquer entrada de Comandas", () => {
    expect(routeForEvent("comandas-geral")).toMatchObject({
      product: "Comandas Eletrônicas",
      source: "RD Station",
      tags: ["RD", "Comandas"],
    });
  });

  it("mapeia as duas entradas da Teloos para seu próprio funil", () => {
    expect(routeForEvent("Formulário de Contato - Site Teloos")).toMatchObject({
      product: "Teloos",
      source: "Site",
      pipelineName: "Funil Teloos",
      stageName: "NOVOS LEADS RD",
      tags: ["RD", "Teloos", "Site"],
    });
    expect(routeForEvent("[LEADSTER] - Site Teloos")).toMatchObject({
      product: "Teloos",
      source: "Leadster",
      pipelineName: "Funil Teloos",
      stageName: "NOVOS LEADS RD",
      tags: ["RD", "Teloos", "Leadster"],
    });
  });

  it("aceita uma rota geral para qualquer entrada da Teloos", () => {
    expect(routeForEvent("teloos-geral")).toMatchObject({
      product: "Teloos",
      source: "RD Station",
      pipelineName: "Funil Teloos",
      stageName: "NOVOS LEADS RD",
      tags: ["RD", "Teloos"],
    });
  });
});
