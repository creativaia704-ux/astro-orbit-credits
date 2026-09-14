import { createFileRoute } from "@tanstack/react-router";

// Webhook público de Stripe. En TanStack Start no se usan Edge Functions:
// este server route cumple la misma función (endpoint público verificado por
// firma). Nunca confía en el cliente: valida amount_total contra la fila
// pending de purchases referenciada por client_reference_id.

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacHex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyStripeSignature(
  rawBody: string,
  header: string | null,
  secret: string,
): Promise<boolean> {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const [k, ...rest] = p.trim().split("=");
      return [k, rest.join("=")];
    }),
  ) as Record<string, string>;
  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return false;

  // Rechaza eventos con más de 5 minutos de antigüedad (replay protection).
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;

  const expected = await hmacHex(secret, `${timestamp}.${rawBody}`);
  return timingSafeEqual(expected, signature);
}

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["STRIPE_WEBHOOK_SECRET"];
        if (!secret) {
          console.error("[stripe-webhook] Falta STRIPE_WEBHOOK_SECRET");
          return new Response("Server misconfigured", { status: 500 });
        }

        const rawBody = await request.text();
        const ok = await verifyStripeSignature(
          rawBody,
          request.headers.get("stripe-signature"),
          secret,
        );
        if (!ok) return new Response("Invalid signature", { status: 400 });

        let event: any;
        try {
          event = JSON.parse(rawBody);
        } catch {
          return new Response("Invalid payload", { status: 400 });
        }

        if (event?.type !== "checkout.session.completed") {
          return new Response("ok", { status: 200 });
        }

        const session = event.data?.object ?? {};
        const purchaseId: string | undefined = session.client_reference_id ?? undefined;
        const amountTotal: number | undefined = session.amount_total ?? undefined;

        if (!purchaseId || typeof amountTotal !== "number") {
          console.error("[stripe-webhook] Evento sin client_reference_id o amount_total");
          return new Response("ok", { status: 200 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: purchase, error } = await supabaseAdmin
          .from("purchases")
          .select("id, user_id, amount_usd, credits_purchased, status")
          .eq("id", purchaseId)
          .maybeSingle();

        if (error) {
          console.error("[stripe-webhook] Error leyendo purchases:", error.message);
          return new Response("error", { status: 500 });
        }
        if (!purchase || purchase.status !== "pending") {
          // Idempotencia: ya procesada o inexistente.
          return new Response("ok", { status: 200 });
        }

        const paid = amountTotal / 100;
        if (Number(paid) !== Number(purchase.amount_usd)) {
          console.error(
            `[stripe-webhook] Importe no coincide para ${purchaseId}: pagado ${paid} vs esperado ${purchase.amount_usd}`,
          );
          await supabaseAdmin
            .from("purchases")
            .update({ status: "failed", stripe_session_id: session.id ?? null })
            .eq("id", purchaseId);
          return new Response("ok", { status: 200 });
        }

        const { data: completed, error: updateError } = await supabaseAdmin
          .from("purchases")
          .update({ status: "completed", stripe_session_id: session.id ?? null })
          .eq("id", purchaseId)
          .eq("status", "pending")
          .select("id")
          .maybeSingle();

        if (updateError) {
          console.error("[stripe-webhook] Error actualizando compra:", updateError.message);
          return new Response("error", { status: 500 });
        }
        if (!completed) return new Response("ok", { status: 200 });

        const { error: txError } = await supabaseAdmin.from("credit_transactions").insert({
          user_id: purchase.user_id,
          type: "purchase",
          amount: purchase.credits_purchased,
          reference_id: purchase.id,
          description: `Compra de ${purchase.credits_purchased} créditos`,
        });
        if (txError) console.error("[stripe-webhook] Error insertando transacción:", txError.message);

        if (purchase.user_id) {
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("credits_balance")
            .eq("id", purchase.user_id)
            .maybeSingle();

          if (profile) {
            const { error: balanceError } = await supabaseAdmin
              .from("profiles")
              .update({ credits_balance: profile.credits_balance + purchase.credits_purchased })
              .eq("id", purchase.user_id);
            if (balanceError)
              console.error("[stripe-webhook] Error actualizando saldo:", balanceError.message);
          }
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
