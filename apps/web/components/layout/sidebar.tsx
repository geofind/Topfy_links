"use client";

import { LayoutDashboard, RadioTower } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const defaultItems: NavigationItem[] = [
  { label: "Visão geral", href: "/", icon: LayoutDashboard },
];

export function Sidebar({
  items = defaultItems,
  onNavigate,
}: {
  items?: NavigationItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <aside className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-5">
        <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_24px_rgba(8,145,178,.24)]">
          <RadioTower className="size-5" />
        </span>
        <div>
          <p className="font-display text-lg font-bold leading-none tracking-tight">
            CanalTopfy
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[.2em] text-sidebar-foreground/55">
            Operations OS
          </p>
        </div>
      </div>
      <nav aria-label="Navegação principal" className="flex-1 space-y-1 p-3">
        {items.map(item => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/65 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                active &&
                  "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
              )}
            >
              {Icon && <Icon className="size-[18px]" />}
              <span>{item.label}</span>
              {active && (
                <span className="ml-auto size-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[.16em] text-sidebar-foreground/50">
            Ambiente
          </p>
          <p className="mt-1 text-xs font-medium">Desenvolvimento local</p>
        </div>
      </div>
    </aside>
  );
}
