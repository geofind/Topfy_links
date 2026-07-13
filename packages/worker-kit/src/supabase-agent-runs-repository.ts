import type { SupabaseClient } from "@supabase/supabase-js";

import type { AgentRunRecord, AgentRunsRepository } from "./types";

/**
 * Implementação real sobre o schema `canaltopfy` (ver
 * supabase/migrations/20260713120000_create_canaltopfy_schema.sql).
 *
 * Usa a service role key (bypassa RLS por padrão) — nunca instanciar isto
 * no frontend. O client Supabase deve ser criado com
 * `createClient(url, serviceRoleKey, { db: { schema: "canaltopfy" } })`
 * ou equivalente `.schema("canaltopfy")` por chamada, como abaixo.
 *
 * NÃO TESTADO contra um projeto Supabase real neste ambiente (sem
 * credenciais) — ver packages/worker-kit/README.md.
 */
export class SupabaseAgentRunsRepository implements AgentRunsRepository {
  constructor(private readonly client: SupabaseClient) {}

  async create(input: { userId: string; agentName: string }): Promise<AgentRunRecord> {
    const { data, error } = await this.client
      .schema("canaltopfy")
      .from("agent_runs")
      .insert({ user_id: input.userId, agent_name: input.agentName, status: "queued" })
      .select()
      .single();

    if (error) throw error;
    return fromRow(data);
  }

  async update(id: string, patch: Partial<AgentRunRecord>): Promise<void> {
    const { error } = await this.client
      .schema("canaltopfy")
      .from("agent_runs")
      .update(toRow(patch))
      .eq("id", id);

    if (error) throw error;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- shape vem do PostgREST, sem tipos gerados ainda
function fromRow(row: any): AgentRunRecord {
  return {
    id: row.id,
    userId: row.user_id,
    agentName: row.agent_name,
    status: row.status,
    progress: row.progress,
    tokensInput: row.tokens_input,
    tokensOutput: row.tokens_output,
    costUsd: Number(row.cost_usd),
    messages: row.messages ?? [],
    error: row.error,
    result: row.result,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    createdAt: row.created_at,
  };
}

function toRow(patch: Partial<AgentRunRecord>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.progress !== undefined) row.progress = patch.progress;
  if (patch.tokensInput !== undefined) row.tokens_input = patch.tokensInput;
  if (patch.tokensOutput !== undefined) row.tokens_output = patch.tokensOutput;
  if (patch.costUsd !== undefined) row.cost_usd = patch.costUsd;
  if (patch.messages !== undefined) row.messages = patch.messages;
  if (patch.error !== undefined) row.error = patch.error;
  if (patch.result !== undefined) row.result = patch.result;
  if (patch.startedAt !== undefined) row.started_at = patch.startedAt;
  if (patch.finishedAt !== undefined) row.finished_at = patch.finishedAt;
  return row;
}
