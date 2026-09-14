import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/compras/estado")({
  head: () => ({
    meta: [
      { title: "Confirmando tu pago · AstroCréditos" },
      {
        name: "description",
        content:
          "Estamos confirmando tu pago de créditos. Tu saldo se actualizará en unos segundos.",
      },
      { property: "og:title", content: "Confirmando tu pago · AstroCréditos" },
      {
        property: "og:description",
        content: "Estamos confirmando tu pago de créditos en AstroCréditos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EstadoCompra,
});

function EstadoCompra() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="font-heading text-3xl font-bold">Estamos confirmando tu pago</h1>
        <p className="mt-4 text-muted-foreground">
          Si has completado el pago en Stripe, tus créditos aparecerán en tu saldo en unos
          segundos. Puedes volver a tu panel.
        </p>
        <div className="mt-8">
          <Link to="/dashboard" className="btn-primary">
            Ir al panel
          </Link>
        </div>
      </main>
    </div>
  );
}
