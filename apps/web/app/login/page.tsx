"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, RadioTower } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/context";

const loginSchema = z.object({
  email: z.email("Informe um email válido."),
  password: z.string().min(1, "Informe sua senha."),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { signIn, status } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [router, status]);

  async function onSubmit(values: LoginValues) {
    setAuthError(null);
    try {
      await signIn(values.email, values.password);
      router.replace("/dashboard");
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "Não foi possível entrar. Tente novamente."
      );
    }
  }

  return (
    <main className="relative grid min-h-dvh bg-background lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,.92fr)]">
      <div className="relative hidden overflow-hidden bg-sidebar p-12 text-sidebar-foreground lg:flex lg:flex-col">
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="relative z-10 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_30px_rgba(34,211,238,.3)]">
            <RadioTower className="size-5" />
          </span>
          <div>
            <p className="font-display text-xl font-bold tracking-tight">
              CanalTopfy
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[.22em] text-sidebar-foreground/55">
              Operations OS
            </p>
          </div>
        </div>
        <div className="relative z-10 my-auto max-w-xl">
          <p className="font-mono text-[11px] uppercase tracking-[.22em] text-cyan-300">
            Marketing em movimento
          </p>
          <h1 className="mt-5 font-display text-6xl font-bold leading-[.95] tracking-[-.045em]">
            Do sinal à ação, em uma única mesa.
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-sidebar-foreground/65">
            Descubra oportunidades, coordene conteúdo e acompanhe cada operação
            sem expor a complexidade da infraestrutura.
          </p>
        </div>
        <div className="relative z-10 h-24" aria-hidden="true">
          <div className="absolute left-0 top-1/2 h-px w-full bg-cyan-200/25">
            <span className="absolute -top-1.5 left-[8%] size-3 rounded-full border-2 border-cyan-200 bg-sidebar" />
            <span className="absolute -top-1.5 left-[42%] size-3 rounded-full border-2 border-cyan-200 bg-sidebar" />
            <span className="absolute -top-2 right-[8%] size-4 rounded-full bg-cyan-300 shadow-[0_0_26px_rgba(103,232,249,.85)]" />
          </div>
          <span className="absolute bottom-0 left-0 font-mono text-[10px] uppercase tracking-[.18em] text-sidebar-foreground/40">
            Descobrir · Criar · Publicar · Aprender
          </span>
        </div>
      </div>
      <section className="flex min-h-dvh flex-col px-5 py-5 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between lg:justify-end">
          <div className="flex items-center gap-2 lg:hidden">
            <RadioTower className="size-5 text-primary" />
            <span className="font-display font-bold">CanalTopfy</span>
          </div>
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <p className="font-mono text-[11px] uppercase tracking-[.2em] text-primary">
            Acesso ao workspace
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-[-.035em]">
            Entre para continuar.
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Use suas credenciais para acessar o centro de operações.
          </p>
          <form
            className="mt-9 space-y-5"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="voce@empresa.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="password">
                Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="pr-11"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  {...register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0.5 top-0.5"
                  onClick={() => setShowPassword(value => !value)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            {authError && (
              <p
                role="alert"
                className="rounded-lg border border-destructive/25 bg-destructive/8 px-3 py-2.5 text-sm text-destructive"
              >
                {authError}
              </p>
            )}
            <Button
              className="w-full"
              size="lg"
              type="submit"
              disabled={isSubmitting || status === "loading"}
            >
              {isSubmitting ? (
                "Entrando…"
              ) : (
                <>
                  Entrar no workspace <ArrowRight />
                </>
              )}
            </Button>
          </form>
          <p className="mt-7 text-center text-xs leading-5 text-muted-foreground">
            Ambiente de interface: a sessão atual é temporária e não persiste ao
            recarregar.
          </p>
        </div>
      </section>
    </main>
  );
}
