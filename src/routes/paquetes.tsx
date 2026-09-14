import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";

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
  component: PaquetesPlaceholder,
});

function PaquetesPlaceholder() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-2xl font-semibold">
          Paquetes de créditos — próximamente en Fase 4
        </h1>
      </main>
    </div>
  );
}
