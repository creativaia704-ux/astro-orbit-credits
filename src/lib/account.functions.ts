import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Borrado de cuenta (GDPR). El user_id se toma del JWT verificado en servidor,
// nunca de un parámetro del cliente. Usa el rol de servicio porque la Auth
// Admin API y el borrado en cascada no son accesibles al cliente con RLS.

export const deleteAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(context.userId);
    if (error) {
      console.error("[deleteAccount]", error.message);
      throw new Error("delete_failed");
    }
    return { ok: true };
  });
