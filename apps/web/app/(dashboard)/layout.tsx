"use client";

import {
  BarChart3,
  Bot,
  FileText,
  LayoutDashboard,
  Megaphone,
  Radar,
  Settings,
  TrendingUp,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { AppShell } from "@/components/layout/app-shell";
import type { NavigationItem } from "@/components/layout/sidebar";
import { useAuth } from "@/lib/auth/context";

const navigation: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Central de Agentes", href: "/agentes", icon: Bot },
  { label: "Radar de Produtos", href: "/radar", icon: Radar },
  { label: "Estúdio de Conteúdo", href: "/conteudo", icon: FileText },
  { label: "Publicações", href: "/publicacoes", icon: Megaphone },
  { label: "Growth", href: "/growth", icon: TrendingUp },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];

const titles = new Map(navigation.map(item => [item.href, item.label]));

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [router, status]);

  if (status !== "authenticated") {
    return (
      <main className="grid min-h-dvh place-items-center bg-background">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="size-2 animate-pulse rounded-full bg-primary" />{" "}
          Verificando sessão…
        </div>
      </main>
    );
  }

  return (
    <AppShell
      navigation={navigation}
      title={titles.get(pathname) ?? "CanalTopfy"}
    >
      {children}
    </AppShell>
  );
}
