import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { GoogleButton } from "@/components/GoogleButton";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: "Crea tu cuenta · AstroCréditos" },
      {
        name: "description",
        content: "Regístrate en AstroCréditos y empieza a generar tus estudios astrológicos.",
      },
      { property: "og:title", content: "Crea tu cuenta · AstroCréditos" },
      {
        property: "og:description",
        content: "Regístrate en AstroCréditos y empieza a generar tus estudios astrológicos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegistroPage,
});

function RegistroPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    // La confirmación de email está desactivada por ahora para agilizar las
    // pruebas en preview. TODO (Fase 7 / GDPR): revisar y reactivar.
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (signUpError) {
      setError(
        signUpError.message.toLowerCase().includes("already")
          ? "Ya existe una cuenta con este email"
          : "No hemos podido crear tu cuenta. Revisa los datos e inténtalo de nuevo.",
      );
      return;
    }
    if (!data.session) {
      setError("Revisa tu correo para confirmar la cuenta antes de entrar.");
      return;
    }
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md px-6 py-10">
        <div className="surface-card p-8">
          <h1 className="text-2xl font-semibold">Crea tu cuenta en AstroCréditos</h1>

          <div className="mt-6">
            <GoogleButton onError={setError} />
          </div>

          <div className="my-6 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="text-sm text-muted-foreground">
                Nombre completo
              </label>
              <input
                id="fullName"
                type="text"
                required
                placeholder="Tu nombre"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-2 w-full rounded-md border border-border bg-surface-elevated px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="email" className="text-sm text-muted-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-md border border-border bg-surface-elevated px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm text-muted-foreground">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-md border border-border bg-surface-elevated px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? "Creando cuenta…" : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
