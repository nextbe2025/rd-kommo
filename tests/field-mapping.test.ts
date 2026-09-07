import { describe, expect, it } from "vitest";
import { buildLeadCustomFields, buildNamedCustomFields } from "../src/lib/field-mapping";

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
      product: "Contato Site Nextcard",
      source: "Site",
      event: "Formulário Contato Site",
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

  it("mapeia CNPJ, cidade e estado nos campos da entidade", () => {
    const result = buildNamedCustomFields([
      { id: 1, name: "CNPJ", type: "text" },
      { id: 2, name: "Cidade", type: "text" },
      { id: 3, name: "Estado", type: "text" },
    ], [
      { names: ["CNPJ"], value: "30119930000120" },
      { names: ["Cidade"], value: "Curitiba" },
      { names: ["Estado"], value: "PR" },
    ]);

    expect(result.fields).toEqual([
      { field_id: 1, values: [{ value: "30119930000120" }] },
      { field_id: 2, values: [{ value: "Curitiba" }] },
      { field_id: 3, values: [{ value: "PR" }] },
    ]);
  });
});
