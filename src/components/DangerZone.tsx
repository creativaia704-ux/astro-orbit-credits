import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { deleteAccount } from "@/lib/account.functions";

export function DangerZone() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const runDelete = useServerFn(deleteAccount);

  async function handleDelete() {
    setBusy(true);
    setError(null);
    try {
      await runDelete();
      await supabase.auth.signOut();
      toast.success("Tu cuenta ha sido eliminada.");
      await navigate({ to: "/" });
    } catch {
      setError(
        "No se pudo eliminar la cuenta. Inténtalo de nuevo o escribe a privacidad@astrocreditos.test",
      );
      setBusy(false);
    }
  }

  return (
    <section className="mt-10 rounded-[20px] border border-destructive/40 p-6">
      <h2 className="text-lg font-semibold text-destructive">Zona de peligro</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Elimina tu cuenta y todos los datos asociados.
      </p>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setConfirm("");
          setError(null);
        }}
        className="mt-4 rounded-[12px] border border-destructive px-5 py-2.5 text-destructive transition-colors hover:bg-destructive/10"
      >
        Eliminar mi cuenta
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar eliminación de cuenta"
          className="safe-y fade-in-up fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 sm:p-6"
        >
          <div className="w-full max-w-md rounded-[20px] border border-border bg-surface-elevated p-6">
            <h3 className="text-lg font-semibold">Eliminar mi cuenta</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Esta acción es irreversible. Se eliminarán tu perfil, historial de compras y estudios.
              Escribe ELIMINAR para confirmar.
            </p>
            <input
              type="text"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="ELIMINAR"
              aria-label="Escribe ELIMINAR para confirmar"
              className="mt-4 w-full rounded-[12px] border border-border bg-surface px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            {error && (
              <p role="alert" className="mt-3 text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                disabled={confirm !== "ELIMINAR" || busy}
                onClick={handleDelete}
                className="rounded-[12px] bg-destructive px-5 py-2.5 text-[var(--color-destructive-foreground)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              >
                Eliminar definitivamente
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setOpen(false)}
                className="rounded-[12px] border border-border px-5 py-2.5 transition-colors hover:bg-surface"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
