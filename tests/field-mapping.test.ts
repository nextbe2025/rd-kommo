import { describe, expect, it } from "vitest";
import { buildLeadCustomFields } from "../src/lib/field-mapping";

describe("mapeamento dos campos da oportunidade", () => {
  it("mapeia Foco do Cliente para uma opção da Kommo", () => {
    const result = buildLeadCustomFields([
      {
        id: 123,
        name: "Foco do Cliente",
        type: "select",
        enums: [
          { id: 1, value: "Totem" },
          { id: 2, value: "Comanda" },
          { id: 3, value: "Catraca" },
        ],
      },
    ], {
      product: "Catracas Expedidoras de Comandas",
      focus: "Catraca",
      source: "RD Station",
      event: "catracas-geral",
      custom: {},
    });

    expect(result.fields).toContainEqual({
      field_id: 123,
      values: [{ value: "Catraca", enum_id: 3 }],
    });
  });

  it("mapeia Teloos no campo Foco do Cliente", () => {
    const result = buildLeadCustomFields([
      {
        id: 123,
        name: "Foco do Cliente",
        type: "select",
        enums: [
          { id: 1, value: "Totem" },
          { id: 2, value: "Comanda" },
          { id: 3, value: "Catraca" },
          { id: 4, value: "Teloos" },
        ],
      },
    ], {
      product: "Teloos",
      focus: "Teloos",
      source: "RD Station",
      event: "teloos-geral",
      custom: {},
    });

    expect(result.fields).toContainEqual({
      field_id: 123,
      values: [{ value: "Teloos", enum_id: 4 }],
    });
  });

  it("compatibiliza as variações do campo de Estado da RD e da Kommo", () => {
    const result = buildLeadCustomFields([
      { id: 456, name: "De qual Estado você fala?", type: "text" },
      { id: 789, name: "Mensagem", type: "textarea" },
    ], {
      product: "Teloos",
      focus: "Teloos",
      source: "Site",
      event: "teloos-site",
      custom: {
        "De qual Estado você é?": "SC",
        "Mensagem": "Quero conhecer a solução",
      },
    });

    expect(result.fields).toContainEqual({ field_id: 456, values: [{ value: "SC" }] });
    expect(result.fields).toContainEqual({
      field_id: 789,
      values: [{ value: "Quero conhecer a solução" }],
    });
  });
});
