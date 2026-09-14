import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { listStudies } from "@/lib/history.functions";
import {
  Cell,
  Pagination,
  RowsSkeleton,
  StatusBadge,
  formatFecha,
  selectClass,
} from "@/components/historial/HistorialUI";

export const Route = createFileRoute("/_authenticated/estudios/historial")({
  head: () => ({
    meta: [
      { title: "Estudios realizados · AstroCréditos" },
      {
        name: "description",
        content: "Historial de los estudios astrológicos que has generado en AstroCréditos.",
      },
      { property: "og:title", content: "Estudios realizados · AstroCréditos" },
      {
        property: "og:description",
        content: "Consulta tus cartas astrales, sinastrías y revoluciones solares.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistorialEstudiosPage,
});

type TypeFilter = "all" | "carta_natal" | "sinastria" | "revolucion_solar";

function HistorialEstudiosPage() {
  const [type, setType] = useState<TypeFilter>("all");
  const [page, setPage] = useState(1);
  const fetchStudies = useServerFn(listStudies);

  const { data, isPending } = useQuery({
    queryKey: ["studies-history", type, page],
    queryFn: () => fetchStudies({ data: { type, page } }),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="fade-in-up safe-bottom mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        <h1 className="text-3xl font-semibold sm:text-4xl">Estudios realizados</h1>

        <div className="mt-6">
          <label htmlFor="type" className="mb-1.5 block text-sm text-muted-foreground">
            Tipo
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => {
              setType(e.target.value as TypeFilter);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="all">Todos los tipos</option>
            <option value="carta_natal">Carta astral</option>
            <option value="sinastria">Sinastría</option>
            <option value="revolucion_solar">Revolución solar</option>
          </select>
        </div>

        <div className="mt-8">
          {isPending ? (
            <RowsSkeleton />
          ) : !data || data.items.length === 0 ? (
            <div className="surface-card p-10 text-center">
              <div className="mx-auto mb-4 h-14 w-14 rounded-full border border-border bg-surface-elevated" />
              <p className="text-muted-foreground">Todavía no has generado ningún estudio.</p>
              <Link to="/estudios" className="btn-primary mt-6 w-full sm:w-auto">
                Crear mi primer estudio
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {data.items.map((s) => (
                <li
                  key={s.id}
                  className="surface-card grid grid-cols-1 gap-0 p-5 sm:grid-cols-[1.2fr_0.9fr_1.4fr_0.5fr_auto_auto] sm:items-center sm:gap-2"
                >
                  <Cell label="Fecha">
                    <span className="text-sm text-muted-foreground">
                      {formatFecha(s.created_at)}
                    </span>
                  </Cell>
                  <Cell label="Tipo">
                    <span className="text-sm">{s.type_name}</span>
                  </Cell>
                  <Cell label="Título">
                    <span className="font-medium">{s.title}</span>
                  </Cell>
                  <Cell label="Créditos">
                    <span className="text-sm text-primary">-{s.credits_spent}</span>
                  </Cell>
                  <Cell label="Estado">
                    <StatusBadge status={s.status} />
                  </Cell>
                  {s.status === "completed" ? (
                    <Link
                      to="/estudios/resultado/$id"
                      params={{ id: s.id }}
                      className="mt-3 block w-full rounded-[12px] border border-border px-4 py-2 text-center text-sm transition-colors hover:bg-surface sm:mt-0 sm:w-auto"
                    >
                      Ver resultado
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="mt-3 w-full cursor-not-allowed rounded-[12px] border border-border px-4 py-2 text-sm opacity-40 sm:mt-0 sm:w-auto"
                    >
                      No disponible
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </main>
    </div>
  );
}
