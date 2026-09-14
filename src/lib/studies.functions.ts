import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// TODO (Fase 7): RLS sigue desactivada; toda la escritura pasa por estas
// server functions con el cliente de servicio y el user_id verificado del JWT.

const personSchema = z.object({
  name: z.string().min(2).max(100),
  birth_date: z.string().min(4),
  birth_time: z.string().nullable().optional(),
  birth_place: z.string().min(1).max(100),
});

const inputSchema = z.discriminatedUnion("study_type_code", [
  z.object({ study_type_code: z.literal("carta_natal"), person1: personSchema }),
  z.object({
    study_type_code: z.literal("sinastria"),
    person1: personSchema,
    person2: personSchema,
  }),
  z.object({
    study_type_code: z.literal("revolucion_solar"),
    person1: personSchema,
    year: z.number().int().min(1900).max(2200),
  }),
]);

export type CreateStudyInput = z.infer<typeof inputSchema>;

export const createStudy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const astro = await import("@/lib/astro.server");

    let title: string;
    let result: unknown;

    if (data.study_type_code === "carta_natal") {
      title = `Carta astral de ${data.person1.name}`;
      result = astro.generateCartaNatal(data.person1);
    } else if (data.study_type_code === "sinastria") {
      title = `Sinastría: ${data.person1.name} y ${data.person2.name}`;
      result = astro.generateSinastria(data.person1, data.person2);
    } else {
      title = `Revolución solar ${data.year} de ${data.person1.name}`;
      result = astro.generateRevolucionSolar(data.person1, data.year);
    }

    const { data: rpcData, error } = await supabaseAdmin.rpc("create_study_tx" as never, {
      _user_id: context.userId,
      _type_code: data.study_type_code,
      _title: title,
      _input: data as never,
      _result: result as never,
    } as never);

    if (error) {
      if (error.message.includes("insufficient_credits")) {
        throw new Error("insufficient_credits");
      }
      console.error("[createStudy]", error.message);
      throw new Error("study_failed");
    }

    const payload = rpcData as unknown as {
      study_id: string;
      credits_spent: number;
      new_credits_balance: number;
    };

    return {
      study_id: payload.study_id,
      result_data: result,
      new_credits_balance: payload.new_credits_balance,
      credits_spent: payload.credits_spent,
    };
  });

export const getStudy = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: study, error } = await supabaseAdmin
      .from("studies")
      .select("id, title, status, created_at, result_data, user_id, study_types(code, name)")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!study) throw new Error("not_found");

    return {
      id: study.id,
      title: study.title,
      status: study.status,
      created_at: study.created_at,
      result_data: study.result_data,
      type_code: (study as unknown as { study_types: { code: string; name: string } | null })
        .study_types?.code ?? "",
      type_name: (study as unknown as { study_types: { code: string; name: string } | null })
        .study_types?.name ?? "",
    };
  });

export const listStudyTypes = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("study_types")
    .select("id, code, name, description, credit_cost")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});
