# Activepieces (Workflow Engine) — self-hosted

Ver [ADR 0002](../../docs/architecture-decisions/0002-activepieces-como-workflow-engine.md) e [comparação técnica](../../docs/architecture/workflow-engine-decision.md) para o porquê da escolha (Activepieces em vez de Windmill/n8n/construção própria).

**Regra de arquitetura:** Activepieces executa scheduler/filas/retries/webhooks — nenhuma regra de negócio do CanalTopfy vive dentro de um flow do Activepieces. Regras de negócio ficam nos Workers TypeScript (`workers/`), que o Activepieces apenas invoca/agenda.

O Postgres deste compose é **interno ao Activepieces** (armazena definições de flow, histórico de execução do próprio motor) — não é o Supabase do CanalTopfy. Dados de negócio (agentes, campanhas, produtos) continuam exclusivamente no Supabase, schema `canaltopfy` (ver `supabase/`).

## Subir localmente

```bash
cd integrations/activepieces
cp .env.example .env
# gerar segredos fortes:
openssl rand -hex 32   # cole em AP_ENCRYPTION_KEY
openssl rand -hex 32   # cole em AP_JWT_SECRET
# defina AP_POSTGRES_PASSWORD também antes de subir
docker compose up -d
```

Acesse `http://localhost:8080` para o primeiro setup (criação do usuário admin).

## Pendências antes de usar em produção

- Definir hospedagem real (mesma VPS/host do OpenClaw? serviço gerenciado próprio?) — ver "Decisões em aberto" em `docs/ARCHITECTURE.md`.
- `AP_FRONTEND_URL` precisa apontar para a URL pública real quando não for `localhost`.
- Nenhum destes arquivos (`docker-compose.yml`, `.env.example`) foi testado neste ambiente (sem Docker disponível) — validar `docker compose config` e um `up` real antes de confiar no arquivo em produção.
