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
});
