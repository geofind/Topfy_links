# OpenClaw — camada de execução de agentes

Ver `docs/ARCHITECTURE.md`, camada 5 (OpenClaw): responsável **exclusivamente** por execução de agentes, planejamento, Skills, MCPs, ferramentas e memória operacional. **Não** faz autenticação, banco principal, faturamento ou dashboards — isso é Supabase/Workers/frontend.

## O que é (confirmado na fonte oficial)

OpenClaw (`github.com/openclaw/openclaw`, docs em `docs.openclaw.ai`) é um agente de IA open-source, self-hosted, que roda como daemon Node.js e se conecta a canais de mensageria (WhatsApp, Telegram, Slack, Discord, etc.) e a um sistema de Skills.

**Diferente do Activepieces:** não é primariamente orquestrado via Docker Compose — é uma CLI/daemon Node.js instalado no host. Docker existe só como backend opcional de sandbox para sessões não-principais, não como forma padrão de deploy.

## Setup (conforme README oficial do projeto — reverificar contra `docs.openclaw.ai` antes de rodar de verdade, nada disto foi testado neste ambiente)

Requisitos: Node.js 22.22.3+, 24.15+ ou 25.9+ (npm, pnpm ou bun funcionam).

```bash
npm install -g openclaw@latest
openclaw onboard --install-daemon
```

Configuração mínima (modelo de IA a usar):

```json
{
  "agent": {
    "model": "<provider>/<model-id>"
  }
}
```

Skills ficam em `~/.openclaw/workspace/skills/<skill>/SKILL.md`, injetadas via arquivos de prompt (`AGENTS.md`, `SOUL.md`, `TOOLS.md` dentro do workspace do OpenClaw — não confundir com o `AGENTS.md` deste repo). Registro de skills adicionais via ClawHub.

## Como se encaixa no CanalTopfy

Os Workers TypeScript (`docs/ARCHITECTURE.md`, camada 4) invocam o OpenClaw quando uma tarefa exige raciocínio/linguagem natural (ver ordem de economia de tokens no charter — nunca para o que SQL/TypeScript resolvem). O OpenClaw nunca é chamado diretamente pelo frontend.

## Pendências

- **Hospedagem:** onde o daemon roda (mesma VPS do Activepieces? outra?) — ver "Decisões em aberto" em `docs/ARCHITECTURE.md`.
- **Modelo/provedor de IA:** quais chaves (Claude, GPT, Gemini) usar em `agent.model` — ainda não definido.
- **Skills do CanalTopfy:** ainda não escritas — vêm junto com os Workers de cada fase (ex.: Skills do ScoutWorker na Fase 2).
- Nenhum comando deste README foi executado neste ambiente — confirmar contra a documentação oficial atual antes de rodar em produção.
