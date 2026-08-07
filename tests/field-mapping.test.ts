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
});
