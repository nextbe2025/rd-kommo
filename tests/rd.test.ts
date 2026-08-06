import { describe, expect, it } from "vitest";
import { parseRdWebhook, sanitizedReceipt } from "../src/lib/rd";

describe("payload do RD", () => {
  it("extrai contato e campos personalizados sem expor valores no recibo", () => {
    const parsed = parseRdWebhook({
      event_type: "WEBHOOK.CONVERTED",
      event_identifier: "[LEADSTER] - LP Totem",
      event_timestamp: "2026-08-06T14:16:00-03:00",
      contact: {
        uuid: "uuid-teste",
        name: "Contato Teste",
        email: "TESTE@EXEMPLO.COM",
        mobile_phone: "(41) 98879-7301",
        cf_quantas_unidades_possui: "4 a 10",
      },
    });

    expect(parsed.email).toBe("teste@exemplo.com");
    expect(parsed.phone).toBe("+5541988797301");
    expect(parsed.customFields.cf_quantas_unidades_possui).toBe("4 a 10");
    expect(sanitizedReceipt(parsed)).not.toHaveProperty("email");
  });
});
