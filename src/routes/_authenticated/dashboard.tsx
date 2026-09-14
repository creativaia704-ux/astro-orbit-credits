import { useEffect, useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { DangerZone } from "@/components/DangerZone";
import { supabase } from "@/integrations/supabase/client";

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
  component: DashboardPage,
});

type Profile = {
  id: string;
  full_name: string | null;
  email: string;
  birth_date: string | null;
  birth_time: string | null;
  birth_place: string | null;
  credits_balance: number;
  created_at: string;
};

type FormValues = {
  full_name: string;
  birth_date: string;
  birth_time: string;
  birth_place: string;
};

function toFormValues(p: Profile): FormValues {
  return {
    full_name: p.full_name ?? "",
    birth_date: p.birth_date ?? "",
    birth_time: p.birth_time ?? "",
    birth_place: p.birth_place ?? "",
  };
}

function formatMemberSince(iso: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function DashboardPage() {
  const { user } = Route.useRouteContext();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<FormValues | null>(null);
  const [values, setValues] = useState<FormValues>({
    full_name: "",
    birth_date: "",
    birth_time: "",
    birth_place: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (!err && data) {
          const p = data as Profile;
          setProfile(p);
          const v = toFormValues(p);
          setSaved(v);
          setValues(v);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const isDirty = useMemo(
    () =>
      saved !== null &&
      (values.full_name !== saved.full_name ||
        values.birth_date !== saved.birth_date ||
        values.birth_time !== saved.birth_time ||
        values.birth_place !== saved.birth_place),
    [values, saved],
  );

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function handleChange(field: keyof FormValues) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
      setError(null);
    };
  }

  function handleCancel() {
    if (saved) setValues(saved);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !saved) return;

    // Validaciones de cliente
    if (values.full_name.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    if (values.birth_date && values.birth_date > today) {
      setError("La fecha de nacimiento no puede ser futura.");
      return;
    }

    // Actualización optimista: persistimos en segundo plano
    const previous = saved;
    const optimistic: FormValues = { ...values, full_name: values.full_name.trim() };
    setSaved(optimistic);
    setError(null);

    const { error: err } = await supabase
      .from("profiles")
      .update({
        full_name: optimistic.full_name,
        birth_date: optimistic.birth_date || null,
        birth_time: optimistic.birth_time || null,
        birth_place: optimistic.birth_place || null,
      })
      .eq("id", profile.id);

    if (err) {
      // Revertir
      setSaved(previous);
      setValues(previous);
      setError("No se pudo guardar. Inténtalo de nuevo.");
      return;
    }

    setProfile({
      ...profile,
      full_name: optimistic.full_name,
      birth_date: optimistic.birth_date || null,
      birth_time: optimistic.birth_time || null,
      birth_place: optimistic.birth_place || null,
    });
    toast.success("Datos actualizados correctamente", { duration: 3000 });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-12">
        {loading ? (
          <DashboardSkeleton />
        ) : !profile ? (
          <p className="text-destructive">No se pudo cargar tu perfil. Recarga la página.</p>
        ) : (
          <>
            {/* Cabecera de bienvenida */}
            <header className="mb-10">
              <h1 className="text-4xl font-semibold">
                Hola, {profile.full_name?.trim() || profile.email}
              </h1>
              <p className="mt-2 text-muted-foreground">
                Miembro desde {formatMemberSince(profile.created_at)}
              </p>
            </header>

            {/* Tarjeta de saldo */}
            <section
              className="surface-card mb-10 p-8"
              style={{ boxShadow: "0 0 24px rgba(0, 229, 255, 0.15)" }}
            >
              <h2 className="text-lg text-muted-foreground">Tu saldo</h2>
              <p className="font-heading mt-2 text-[48px] font-bold leading-none text-primary">
                {profile.credits_balance} créditos
              </p>
              <p className="mt-2 text-muted-foreground">Cada estudio cuesta 5 créditos</p>
              <Link to="/paquetes" className="btn-primary mt-6 inline-block">
                Comprar créditos
              </Link>
              <div className="mt-5 flex flex-wrap gap-4 text-sm">
                <Link to="/compras" className="text-muted-foreground underline hover:text-primary">
                  Ver historial de compras
                </Link>
                <Link
                  to="/estudios/historial"
                  className="text-muted-foreground underline hover:text-primary"
                >
                  Ver mis estudios
                </Link>
              </div>
            </section>

            {/* Datos personales */}
            <section className="rounded-[20px] border border-border bg-surface-elevated p-8 shadow-[var(--shadow-card)]">
              <h2 className="text-2xl font-semibold">Datos personales</h2>
              <form onSubmit={handleSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="full_name" className="mb-1.5 block text-sm text-muted-foreground">
                    Nombre completo
                  </label>
                  <input
                    id="full_name"
                    type="text"
                    required
                    minLength={2}
                    placeholder="Tu nombre completo"
                    value={values.full_name}
                    onChange={handleChange("full_name")}
                    className="w-full rounded-[12px] border border-border bg-surface px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="email" className="mb-1.5 block text-sm text-muted-foreground">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full cursor-not-allowed rounded-[12px] border border-border bg-surface px-4 py-2.5 text-muted-foreground opacity-70"
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    El email no se puede modificar aquí
                  </p>
                </div>

                <div>
                  <label htmlFor="birth_date" className="mb-1.5 block text-sm text-muted-foreground">
                    Fecha de nacimiento
                  </label>
                  <input
                    id="birth_date"
                    type="date"
                    max={today}
                    value={values.birth_date}
                    onChange={handleChange("birth_date")}
                    className="w-full rounded-[12px] border border-border bg-surface px-4 py-2.5 text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="birth_time" className="mb-1.5 block text-sm text-muted-foreground">
                    Hora de nacimiento
                  </label>
                  <input
                    id="birth_time"
                    type="time"
                    placeholder="HH:MM"
                    value={values.birth_time}
                    onChange={handleChange("birth_time")}
                    className="w-full rounded-[12px] border border-border bg-surface px-4 py-2.5 text-foreground focus:border-primary focus:outline-none"
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Si no la conoces, déjala en blanco
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="birth_place" className="mb-1.5 block text-sm text-muted-foreground">
                    Lugar de nacimiento
                  </label>
                  <input
                    id="birth_place"
                    type="text"
                    maxLength={100}
                    placeholder="Ciudad, País (ej: Madrid, España)"
                    value={values.birth_place}
                    onChange={handleChange("birth_place")}
                    className="w-full rounded-[12px] border border-border bg-surface px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                {error && (
                  <p role="alert" className="sm:col-span-2 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <div className="flex gap-3 sm:col-span-2">
                  <button type="submit" disabled={!isDirty} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
                    Guardar cambios
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-[12px] border border-border px-5 py-2.5 text-foreground transition-colors hover:bg-surface"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </section>

            <DangerZone />
          </>
        )}
      </main>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-10">
        <div className="h-10 w-64 rounded-[12px] bg-surface" />
        <div className="mt-3 h-5 w-48 rounded-[8px] bg-surface" />
      </div>
      <div className="mb-10 rounded-[20px] bg-surface p-8">
        <div className="h-5 w-24 rounded-[8px] bg-surface-elevated" />
        <div className="mt-4 h-12 w-56 rounded-[12px] bg-surface-elevated" />
        <div className="mt-4 h-5 w-64 rounded-[8px] bg-surface-elevated" />
        <div className="mt-6 h-11 w-40 rounded-[12px] bg-surface-elevated" />
      </div>
      <div className="rounded-[20px] bg-surface p-8">
        <div className="h-7 w-44 rounded-[8px] bg-surface-elevated" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="h-11 rounded-[12px] bg-surface-elevated sm:col-span-2" />
          <div className="h-11 rounded-[12px] bg-surface-elevated sm:col-span-2" />
          <div className="h-11 rounded-[12px] bg-surface-elevated" />
          <div className="h-11 rounded-[12px] bg-surface-elevated" />
          <div className="h-11 rounded-[12px] bg-surface-elevated sm:col-span-2" />
        </div>
      </div>
    </div>
  );
}
