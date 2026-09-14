import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Defensa en profundidad: RLS sigue desactivada (TODO Fase 7), por eso estas
// lecturas filtran siempre por el user_id obtenido del JWT verificado en
// servidor, nunca de un parámetro enviado por el cliente.

const PAGE_SIZE = 10;

const purchasesInput = z.object({
  status: z.enum(["all", "pending", "completed", "failed"]).default("all"),
  page: z.number().int().min(1).default(1),
});

const studiesInput = z.object({
  type: z.enum(["all", "carta_natal", "sinastria", "revolucion_solar"]).default("all"),
  page: z.number().int().min(1).default(1),
});

export type PurchaseRow = {
  id: string;
  created_at: string;
  package_name: string;
  amount_usd: number;
  credits_purchased: number;
  status: string;
};

export type StudyRow = {
  id: string;
  created_at: string;
  type_name: string;
  title: string;
  credits_spent: number;
  status: string;
};

export const listPurchases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => purchasesInput.parse(data ?? {}))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const from = (data.page - 1) * PAGE_SIZE;

    let query = supabaseAdmin
      .from("purchases")
      .select("id, created_at, amount_usd, credits_purchased, status, credit_packages(name)", {
        count: "exact",
      })
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (data.status !== "all") query = query.eq("status", data.status);

    const { data: rows, error, count } = await query;
    if (error) throw new Error(error.message);

    const items: PurchaseRow[] = (rows ?? []).map((r) => ({
      id: r.id,
      created_at: r.created_at,
      package_name:
        (r as unknown as { credit_packages: { name: string } | null }).credit_packages?.name ??
        "Paquete",
      amount_usd: Number(r.amount_usd),
      credits_purchased: r.credits_purchased,
      status: r.status,
    }));

    return { items, total: count ?? 0, pageSize: PAGE_SIZE, page: data.page };
  });

export const listStudies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => studiesInput.parse(data ?? {}))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const from = (data.page - 1) * PAGE_SIZE;

    let typeId: string | null = null;
    if (data.type !== "all") {
      const { data: t, error: tErr } = await supabaseAdmin
        .from("study_types")
        .select("id")
        .eq("code", data.type)
        .maybeSingle();
      if (tErr) throw new Error(tErr.message);
      if (!t) return { items: [], total: 0, pageSize: PAGE_SIZE, page: data.page };
      typeId = t.id;
    }

    let query = supabaseAdmin
      .from("studies")
      .select("id, created_at, title, credits_spent, status, study_types(name)", {
        count: "exact",
      })
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (typeId) query = query.eq("study_type_id", typeId);

    const { data: rows, error, count } = await query;
    if (error) throw new Error(error.message);

    const items: StudyRow[] = (rows ?? []).map((r) => ({
      id: r.id,
      created_at: r.created_at,
      type_name:
        (r as unknown as { study_types: { name: string } | null }).study_types?.name ?? "Estudio",
      title: r.title,
      credits_spent: r.credits_spent,
      status: r.status,
    }));

    return { items, total: count ?? 0, pageSize: PAGE_SIZE, page: data.page };
  });
