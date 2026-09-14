import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// TODO (Fase 7): RLS sigue desactivada. Mientras tanto las tablas no tienen
// GRANTs para anon/authenticated, así que toda lectura/escritura pasa por
// estas server functions con el cliente de servicio.

export type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  price_usd: number;
  stripe_payment_link: string | null;
};

export const listActivePackages = createServerFn({ method: "GET" }).handler(
  async (): Promise<CreditPackage[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("credit_packages")
      .select("id, name, credits, price_usd, stripe_payment_link")
      .eq("active", true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((p) => ({ ...p, price_usd: Number(p.price_usd) }));
  },
);

export const createPendingPurchase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ packageId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: pack, error: packError } = await supabaseAdmin
      .from("credit_packages")
      .select("id, credits, price_usd, stripe_payment_link, active")
      .eq("id", data.packageId)
      .maybeSingle();

    if (packError) throw new Error(packError.message);
    if (!pack || !pack.active) throw new Error("Paquete no disponible");

    const { data: purchase, error } = await supabaseAdmin
      .from("purchases")
      .insert({
        user_id: context.userId,
        package_id: pack.id,
        amount_usd: pack.price_usd,
        credits_purchased: pack.credits,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    const link = pack.stripe_payment_link;
    if (!link) throw new Error("El paquete no tiene enlace de pago configurado");

    return {
      purchaseId: purchase.id,
      checkoutUrl: `${link}?client_reference_id=${purchase.id}`,
    };
  });
