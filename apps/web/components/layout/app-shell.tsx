"use client";

import { useState } from "react";

import { Sidebar, type NavigationItem } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";

export function AppShell({
  children,
  navigation,
  title,
}: {
  children: React.ReactNode;
  navigation?: NavigationItem[];
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-dvh bg-muted/35">
      <div className="fixed inset-y-0 left-0 hidden w-64 md:block">
        <Sidebar items={navigation} />
      </div>
      <div className="md:pl-64">
        <Topbar title={title} onMenuClick={() => setOpen(true)} />
        <main className="p-4 md:p-7">{children}</main>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetTitle className="sr-only">Navegação</SheetTitle>
          <SheetDescription className="sr-only">
            Acesse as áreas do CanalTopfy.
          </SheetDescription>
          <Sidebar items={navigation} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
