import { Compass, DatabaseZap } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-2xl border bg-card p-7 md:p-10">
        <p className="font-mono text-[11px] uppercase tracking-[.2em] text-primary">
          Fase 0 / Shell autenticado
        </p>
        <h2 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight tracking-[-.035em]">
          Seu centro de operações está pronto para receber dados reais.
        </h2>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
          A estrutura de navegação e autenticação está ativa. Indicadores e
          atividades serão conectados ao Supabase na próxima etapa — nenhum dado
          operacional é simulado aqui.
        </p>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Compass className="size-5 text-primary" />
            <CardTitle>Explore as áreas</CardTitle>
            <CardDescription>
              A navegação lateral já organiza todo o fluxo de trabalho futuro.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <DatabaseZap className="size-5 text-primary" />
            <CardTitle>Fonte de dados pendente</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            Este estado vazio será substituído quando a integração oficial
            estiver disponível.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
