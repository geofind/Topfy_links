"use client";

import { LogOut, Menu, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth/context";

export function Topbar({
  title = "Visão geral",
  onMenuClick,
}: {
  title?: string;
  onMenuClick?: () => void;
}) {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const initials =
    session?.user.name
      ?.split(" ")
      .map(part => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ??
    session?.user.email.slice(0, 2).toUpperCase() ??
    "CT";

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <header className="flex h-20 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur md:px-7">
      <Button
        className="md:hidden"
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        aria-label="Abrir navegação"
      >
        <Menu />
      </Button>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
          Workspace / CanalTopfy
        </p>
        <h1 className="truncate font-display text-xl font-bold tracking-tight">
          {title}
        </h1>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="hidden sm:inline-flex"
        aria-label="Pesquisar"
        disabled
      >
        <Search />
      </Button>
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="size-10 rounded-full p-0"
            aria-label="Abrir menu da conta"
          >
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="max-w-56 truncate">
            {session?.user.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => void handleSignOut()}
            className="text-destructive focus:text-destructive"
          >
            <LogOut /> Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
