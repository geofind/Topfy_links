import { describe, expect, it } from "vitest";

import { MockAuthClient } from "./mock-client";

describe("MockAuthClient", () => {
  it("keeps a session in memory until sign out", async () => {
    const client = new MockAuthClient();
    const session = await client.signIn("USER@example.com", "secret");

    expect(session.user.email).toBe("user@example.com");
    expect(await client.getSession()).toEqual(session);

    await client.signOut();
    expect(await client.getSession()).toBeNull();
  });

  it("rejects empty credentials", async () => {
    const client = new MockAuthClient();
    await expect(client.signIn("", "")).rejects.toThrow(
      "Informe email e senha."
    );
  });
});
