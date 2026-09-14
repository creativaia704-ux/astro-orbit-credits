export function formatFecha(iso: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

const STATUS_LABEL: Record<string, string> = {
  completed: "Completada",
  pending: "Pendiente",
  failed: "Fallida",
};

export function StatusBadge({ status }: { status: string }) {
  const style =
    status === "completed"
      ? "border-[var(--color-success)]/50 bg-[var(--color-success)]/10 text-[var(--color-success)]"
      : status === "failed"
        ? "border-destructive/50 bg-destructive/10 text-destructive"
        : "border-border bg-surface-elevated text-muted-foreground";

  return (
    <span className={`inline-block rounded-full border px-3 py-1 text-xs ${style}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function RowsSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 rounded-[12px] bg-surface" />
      ))}
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-between gap-4">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-[12px] border border-border px-4 py-2 text-sm transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
      >
        Anterior
      </button>
      <p className="text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </p>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-[12px] border border-border px-4 py-2 text-sm transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
      >
        Siguiente
      </button>
    </div>
  );
}

export const selectClass =
  "w-full rounded-[12px] border border-border bg-surface px-4 py-2.5 text-foreground focus:border-primary focus:outline-none sm:w-auto";

/**
 * Celda de una fila de historial. En móvil se muestra como par
 * etiqueta-valor apilado; a partir de 640px vuelve a ser una columna.
 */
export function Cell({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-3 border-b border-border/60 py-2 last:border-b-0 sm:block sm:border-b-0 sm:py-0 ${className ?? ""}`}
    >
      <span className="shrink-0 text-xs text-muted-foreground sm:hidden">{label}</span>
      <span className="min-w-0 text-right sm:text-left">{children}</span>
    </div>
  );
}
