import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Tu panel · AstroCréditos" },
      {
        name: "description",
        content: "Panel privado de AstroCréditos: tus créditos y tus estudios astrológicos.",
      },
      { property: "og:title", content: "Tu panel · AstroCréditos" },
      {
        property: "og:description",
        content: "Panel privado de AstroCréditos: tus créditos y tus estudios astrológicos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPlaceholder,
});

function DashboardPlaceholder() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Dashboard — próximamente</h1>
      </main>
    </div>
  );
}
