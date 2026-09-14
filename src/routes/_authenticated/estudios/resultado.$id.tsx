import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { getStudy } from "@/lib/studies.functions";
import { PositionsGrid, type Positions } from "@/components/estudios/PositionsGrid";

export const Route = createFileRoute("/_authenticated/estudios/resultado/$id")({
  head: () => ({
    meta: [
      { title: "Resultado del estudio · AstroCréditos" },
      { name: "description", content: "Resultado de tu estudio astrológico en AstroCréditos." },
      { property: "og:title", content: "Resultado del estudio · AstroCréditos" },
      { property: "og:description", content: "Resultado de tu estudio astrológico." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResultadoPage,
});

type ResultData = {
  positions?: Positions;
  summary?: string;
  theme?: string;
  compatibility_score?: number;
  person1?: { subject_name: string; positions: Positions };
  person2?: { subject_name: string; positions: Positions };
};

function ResultadoPage() {
  const { id } = Route.useParams();
  const fetchStudy = useServerFn(getStudy);
  const { data, isPending, isError } = useQuery({
    queryKey: ["study", id],
    queryFn: () => fetchStudy({ data: { id } }),
  });

  const result = (data?.result_data ?? {}) as ResultData;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="safe-bottom mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        {isPending ? (
          <div className="animate-pulse">
            <div className="h-9 w-72 max-w-full rounded-[12px] bg-surface" />
            <div className="mt-3 h-5 w-56 max-w-full rounded-[8px] bg-surface" />
            <div className="mt-8 h-24 rounded-[20px] bg-surface" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 rounded-[12px] bg-surface" />
              ))}
            </div>
          </div>
        ) : isError || !data ? (
          <p className="text-destructive">No se pudo cargar este estudio.</p>
        ) : (
          <div className="fade-in-up">
            <header className="mb-8">
              <h1 className="text-3xl font-semibold">{data.title}</h1>
              <p className="mt-2 text-muted-foreground">
                {data.type_name} ·{" "}
                {new Intl.DateTimeFormat("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(new Date(data.created_at))}
              </p>
            </header>

            {result.compatibility_score !== undefined ? (
              <>
                <div
                  className="surface-card mb-8 p-6 text-center"
                  style={{ boxShadow: "0 0 24px rgba(0, 229, 255, 0.15)" }}
                >
                  <p className="font-heading text-3xl font-bold text-primary">
                    Compatibilidad: {result.compatibility_score}%
                  </p>
                </div>
                <div className="grid gap-8 lg:grid-cols-2">
                  <section>
                    <h2 className="mb-4 text-xl font-semibold">
                      {result.person1?.subject_name ?? "Persona 1"}
                    </h2>
                    {result.person1 && <PositionsGrid positions={result.person1.positions} />}
                  </section>
                  <section>
                    <h2 className="mb-4 text-xl font-semibold">
                      {result.person2?.subject_name ?? "Persona 2"}
                    </h2>
                    {result.person2 && <PositionsGrid positions={result.person2.positions} />}
                  </section>
                </div>
              </>
            ) : (
              <>
                {result.theme && (
                  <div
                    className="surface-card mb-8 p-6 text-center"
                    style={{ boxShadow: "0 0 24px rgba(0, 229, 255, 0.15)" }}
                  >
                    <p className="font-heading text-2xl font-semibold text-primary">
                      {result.theme}
                    </p>
                  </div>
                )}
                {result.positions && <PositionsGrid positions={result.positions} />}
              </>
            )}

            {result.summary && (
              <p className="mt-8 text-muted-foreground">{result.summary}</p>
            )}

            <Link
              to="/estudios"
              className="mt-8 inline-block rounded-[12px] border border-border px-5 py-2.5 text-foreground transition-colors hover:bg-surface"
            >
              Volver a mis estudios
            </Link>
          </>
        )}
      </main>
    </div>
  );
}
