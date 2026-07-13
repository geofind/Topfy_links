export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthSession {
  user: AuthUser;
  expiresAt: string;
}

export interface AuthClient {
  signIn(email: string, password: string): Promise<AuthSession>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
}
