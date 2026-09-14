import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import {
  listActivePackages,
  createPendingPurchase,
  type CreditPackage,
} from "@/lib/purchases.functions";

export const Route = createFileRoute("/paquetes")({
  head: () => ({
    meta: [
      { title: "Paquetes de créditos · AstroCréditos" },
      {
        name: "description",
        content: "Compra créditos para generar tus estudios astrológicos en AstroCréditos.",
      },
      { property: "og:title", content: "Paquetes de créditos · AstroCréditos" },
      {
        property: "og:description",
        content: "Compra créditos para generar tus estudios astrológicos en AstroCréditos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaquetesPage,
});

function PaquetesPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const fetchPackages = useServerFn(listActivePackages);
  const startPurchase = useServerFn(createPendingPurchase);

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: packages, isPending } = useQuery({
    queryKey: ["credit-packages"],
    queryFn: () => fetchPackages(),
  });

  async function handleBuy(pack: CreditPackage) {
    setError(null);
    if (!loading && !user) {
      navigate({ to: "/login" });
      return;
    }
    setPendingId(pack.id);
    try {
      const { checkoutUrl } = await startPurchase({ data: { packageId: pack.id } });
      window.location.href = checkoutUrl;
    } catch {
      setPendingId(null);
      setError("No se pudo iniciar la compra. Inténtalo de nuevo.");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="fade-in-up safe-bottom mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">
          Elige tu paquete de créditos
        </h1>
        <p className="mt-3 text-muted-foreground">Cada estudio cuesta 5 créditos</p>

        {error && (
          <p
            className="banner-slide-in mt-6 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {isPending
            ? [0, 1, 2].map((i) => (
                <div key={i} className="surface-card animate-pulse p-6">
                  <div className="mx-auto h-5 w-24 rounded-[8px] bg-surface-elevated" />
                  <div className="mx-auto mt-5 h-10 w-32 rounded-[12px] bg-surface-elevated" />
                  <div className="mx-auto mt-4 h-4 w-28 rounded-[8px] bg-surface-elevated" />
                  <div className="mt-6 h-11 w-full rounded-full bg-surface-elevated" />
                </div>
              ))
            : (packages ?? []).map((pack) => (
                <article key={pack.id} className="surface-card surface-card-hover p-6 text-center">
                  <h2 className="font-heading text-lg font-semibold">{pack.name}</h2>
                  <p className="mt-4 text-4xl font-bold text-gradient">{pack.price_usd} US$</p>
                  <p className="mt-2 text-sm text-muted-foreground">{pack.credits} créditos</p>
                  <button
                    type="button"
                    className="btn-primary mt-6 w-full disabled:opacity-60"
                    disabled={pendingId === pack.id}
                    onClick={() => handleBuy(pack)}
                  >
                    {pendingId === pack.id ? "Redirigiendo a Stripe…" : "Comprar"}
                  </button>
                </article>
              ))}
        </div>
      </main>
    </div>
  );
}
