import type { SupabaseClient } from "@supabase/supabase-js";

export type InvokeEdgeFunctionOptions = {
  method?: "POST" | "GET" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
};

export type InvokeEdgeFunctionResult<T> = {
  data: T | null;
  error: unknown;
};

/** Invoke a Supabase Edge Function via the injected client (no env or import.meta). */
export async function invokeEdgeFunction<T>(
  client: SupabaseClient,
  functionName: string,
  body?: unknown,
  options?: InvokeEdgeFunctionOptions,
): Promise<InvokeEdgeFunctionResult<T>> {
  const { data, error } = await client.functions.invoke<T>(functionName, {
    body: body as Record<string, unknown> | undefined,
    method: options?.method,
    headers: options?.headers,
  });

  return {
    data: data ?? null,
    error: error ?? null,
  };
}
