"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { AuthClient, AuthSession } from "@/lib/auth/types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  session: AuthSession | null;
  status: AuthStatus;
  signIn(email: string, password: string): Promise<AuthSession>;
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  client,
  children,
}: {
  client: AuthClient;
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let active = true;

    void client.getSession().then(currentSession => {
      if (!active) return;
      setSession(currentSession);
      setStatus(currentSession ? "authenticated" : "unauthenticated");
    });

    return () => {
      active = false;
    };
  }, [client]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const nextSession = await client.signIn(email, password);
      setSession(nextSession);
      setStatus("authenticated");
      return nextSession;
    },
    [client]
  );

  const signOut = useCallback(async () => {
    await client.signOut();
    setSession(null);
    setStatus("unauthenticated");
  }, [client]);

  const value = useMemo(
    () => ({ session, status, signIn, signOut }),
    [session, status, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return context;
}
