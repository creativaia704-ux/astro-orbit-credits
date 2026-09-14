/** Banner fijo superior que avisa de la falta de conexión en los formularios. */
export function OfflineBanner() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="banner-slide-in safe-top fixed inset-x-0 top-0 z-50 px-4 py-3 text-center text-sm font-medium text-[var(--color-destructive-foreground)] backdrop-blur"
      style={{ backgroundColor: "color-mix(in oklch, var(--destructive) 85%, transparent)" }}
    >
      Sin conexión a internet. No podrás generar el estudio hasta reconectar.
    </div>
  );
}
