import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { listStudyTypes } from "@/lib/studies.functions";
import { useProfileCredits } from "@/hooks/useProfileCredits";

export const Route = createFileRoute("/_authenticated/estudios/")({
  head: () => ({
    meta: [
      { title: "Nuevo estudio · AstroCréditos" },
      {
        name: "description",
        content: "Elige el tipo de estudio astrológico que quieres generar con tus créditos.",
      },
      { property: "og:title", content: "Nuevo estudio · AstroCréditos" },
      {
        property: "og:description",
        content: "Carta astral, sinastría o revolución solar por 5 créditos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EstudiosPage,
});

const ROUTE_BY_CODE: Record<string, string> = {
  carta_natal: "/estudios/carta-natal",
  sinastria: "/estudios/sinastria",
  revolucion_solar: "/estudios/revolucion-solar",
};

const ORDER = ["carta_natal", "sinastria", "revolucion_solar"];

function EstudiosPage() {
  const { user } = Route.useRouteContext();
  const fetchTypes = useServerFn(listStudyTypes);
  const { balance, loading: creditsLoading } = useProfileCredits(user.id);

  const { data: types, isPending } = useQuery({
    queryKey: ["study-types"],
    queryFn: () => fetchTypes(),
  });

  const sorted = [...(types ?? [])].sort(
    (a, b) => ORDER.indexOf(a.code) - ORDER.indexOf(b.code),
  );

  const loading = isPending || creditsLoading;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="fade-in-up safe-bottom mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        <h1 className="text-3xl font-semibold sm:text-4xl">¿Qué quieres crear hoy?</h1>

        {loading ? (
          <div className="animate-pulse">
            <div className="mt-6 h-20 rounded-[16px] bg-surface" />
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="surface-card p-6">
                  <div className="h-5 w-32 rounded-[8px] bg-surface-elevated" />
                  <div className="mt-3 h-4 w-full rounded-[8px] bg-surface-elevated" />
                  <div className="mt-2 h-4 w-2/3 rounded-[8px] bg-surface-elevated" />
                  <div className="mt-5 h-4 w-24 rounded-[8px] bg-surface-elevated" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {balance !== null && balance < 5 && (
              <div
                role="alert"
                className="banner-slide-in mt-6 flex flex-col gap-4 rounded-[16px] border border-destructive/50 bg-destructive/10 p-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
              >
                <p className="text-destructive">
                  No tienes créditos suficientes para generar un estudio (necesitas 5).
                </p>
                <Link to="/paquetes" className="btn-primary w-full sm:w-auto">
                  Comprar créditos
                </Link>
              </div>
            )}

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {sorted.map((type) => (
                <Link
                  key={type.id}
                  to={ROUTE_BY_CODE[type.code] ?? "/estudios"}
                  className="surface-card surface-card-hover block p-6"
                >
                  <h2 className="font-heading text-lg font-semibold">{type.name}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{type.description}</p>
                  <p className="mt-4 text-sm text-primary">{type.credit_cost} créditos</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
