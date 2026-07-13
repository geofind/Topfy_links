import { Construction } from "lucide-react";
import { notFound } from "next/navigation";

const sections: Record<string, { title: string; description: string }> = {
  agentes: {
    title: "Central de Agentes",
    description: "Acompanhamento de agentes, jobs e eventos em tempo real.",
  },
  radar: {
    title: "Radar de Produtos",
    description: "Descoberta, análise e ranking de oportunidades.",
  },
  conteudo: {
    title: "Estúdio de Conteúdo",
    description: "Criação, revisão e aprovação de conteúdo.",
  },
  publicacoes: {
    title: "Publicações",
    description: "Planejamento e acompanhamento dos canais de publicação.",
  },
  growth: {
    title: "Growth",
    description: "Campanhas, recomendações e automações de crescimento.",
  },
  analytics: {
    title: "Analytics",
    description: "Métricas de cliques, conversões, custos e ROI.",
  },
  configuracoes: {
    title: "Configurações",
    description: "Preferências do workspace e integrações disponíveis.",
  },
};

export function generateStaticParams() {
  return Object.keys(sections).map(section => ({ section }));
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const content = sections[section];
  if (!content) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <section className="grid min-h-[calc(100dvh-9.5rem)] place-items-center rounded-2xl border border-dashed bg-card/55 p-8 text-center">
        <div className="max-w-md">
          <span className="mx-auto grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <Construction className="size-5" />
          </span>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[.2em] text-primary">
            Área reservada
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">
            {content.title}
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            {content.description}
          </p>
          <p className="mt-6 text-xs text-muted-foreground">
            A interface será habilitada na fase correspondente, com dados da
            fonte oficial.
          </p>
        </div>
      </section>
    </div>
  );
}
