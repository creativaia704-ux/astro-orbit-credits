import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function SiteHeader() {
  const { user, displayName, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="safe-top mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-5 sm:flex sm:flex-wrap sm:justify-between sm:px-6 sm:py-6">
      <Link to="/" className="font-heading min-w-0 truncate text-lg font-bold tracking-tight">
        Astro<span className="text-gradient">Créditos</span>
      </Link>

      {loading ? null : user ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{displayName}</span>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
          >
            Cerrar sesión
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
          >
            Iniciar sesión
          </Link>
          <Link to="/registro" className="btn-primary px-4 py-2 text-sm">
            Crear cuenta
          </Link>
        </div>
      )}
    </header>
  );
}
