import { describe, expect, it } from "vitest";
import { createOAuthState, verifyOAuthState } from "../src/lib/rd-oauth";

describe("estado OAuth do RD", () => {
  it("aceita um estado autêntico e recente", () => {
    const now = 1_800_000_000_000;
    const state = createOAuthState("segredo-de-teste", now);
    expect(verifyOAuthState(state, "segredo-de-teste", now + 60_000)).toBe(true);
  });

  it("rejeita estado adulterado, expirado ou com outro segredo", () => {
    const now = 1_800_000_000_000;
    const state = createOAuthState("segredo-de-teste", now);
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    const tampered = Buffer.from(`${decoded.slice(0, -1)}0`).toString("base64url");
    expect(verifyOAuthState(tampered, "segredo-de-teste", now)).toBe(false);
    expect(verifyOAuthState(state, "outro-segredo", now)).toBe(false);
    expect(verifyOAuthState(state, "segredo-de-teste", now + 16 * 60_000)).toBe(false);
  });
});
