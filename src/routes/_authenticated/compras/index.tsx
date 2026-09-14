import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { listPurchases } from "@/lib/history.functions";
import {
  Pagination,
  RowsSkeleton,
  StatusBadge,
  formatFecha,
  selectClass,
} from "@/components/historial/HistorialUI";

export const Route = createFileRoute("/_authenticated/compras/")({
  head: () => ({
    meta: [
      { title: "Compras realizadas · AstroCréditos" },
      {
        name: "description",
        content: "Historial de tus compras de créditos en AstroCréditos con estado e importe.",
      },
      { property: "og:title", content: "Compras realizadas · AstroCréditos" },
      {
        property: "og:description",
        content: "Consulta todas tus compras de créditos y su estado.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComprasPage,
});

type Status = "all" | "pending" | "completed" | "failed";

function ComprasPage() {
  const [status, setStatus] = useState<Status>("all");
  const [page, setPage] = useState(1);
  const fetchPurchases = useServerFn(listPurchases);

  const { data, isPending } = useQuery({
    queryKey: ["purchases", status, page],
    queryFn: () => fetchPurchases({ data: { status, page } }),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-semibold sm:text-4xl">Compras realizadas</h1>

        <div className="mt-6">
          <label htmlFor="status" className="mb-1.5 block text-sm text-muted-foreground">
            Estado
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as Status);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="completed">Completada</option>
            <option value="failed">Fallida</option>
          </select>
        </div>

        <div className="mt-8">
          {isPending ? (
            <RowsSkeleton />
          ) : !data || data.items.length === 0 ? (
            <div className="surface-card p-10 text-center">
              <div className="mx-auto mb-4 h-14 w-14 rounded-full border border-border bg-surface-elevated" />
              <p className="text-muted-foreground">Todavía no has hecho ninguna compra.</p>
              <Link to="/paquetes" className="btn-primary mt-6 inline-block">
                Comprar créditos
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {data.items.map((p) => (
                <li
                  key={p.id}
                  className="surface-card grid gap-2 p-5 sm:grid-cols-[1.4fr_1fr_0.7fr_0.6fr_auto] sm:items-center"
                >
                  <span className="text-sm text-muted-foreground">{formatFecha(p.created_at)}</span>
                  <span className="font-medium">{p.package_name}</span>
                  <span className="text-sm">{p.amount_usd} US$</span>
                  <span className="text-sm text-primary">+{p.credits_purchased}</span>
                  <StatusBadge status={p.status} />
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
