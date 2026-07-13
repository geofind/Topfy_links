import type { AuthClient, AuthSession } from "./types";

const MOCK_DELAY_MS = 300;

function wait() {
  return new Promise<void>(resolve => setTimeout(resolve, MOCK_DELAY_MS));
}

export class MockAuthClient implements AuthClient {
  private session: AuthSession | null = null;

  async signIn(email: string, password: string): Promise<AuthSession> {
    await wait();

    if (!email.trim() || !password.trim()) {
      throw new Error("Informe email e senha.");
    }

    this.session = {
      user: {
        id: "mock-user",
        email: email.trim().toLowerCase(),
        name: null,
      },
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    return this.session;
  }

  async signOut(): Promise<void> {
    await wait();
    this.session = null;
  }

  async getSession(): Promise<AuthSession | null> {
    await wait();
    return this.session;
  }
}
