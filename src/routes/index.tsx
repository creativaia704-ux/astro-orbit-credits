import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, HeartHandshake, Sun } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";


// TODO (Fase 7): RLS aún no está activada en la base de datos; las tablas no
// tienen políticas y solo son accesibles desde backend/desarrollo.
// Esta landing es 100% estática: no consulta la base de datos todavía.

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AstroCréditos · Cartas astrales, sinastrías y revolución solar" },
      {
        name: "description",
        content:
          "Compra créditos y genera tu carta astral, sinastría o revolución solar en minutos. Cada estudio cuesta 5 créditos.",
      },
      { property: "og:title", content: "AstroCréditos · Estudios astrológicos con créditos" },
      {
        property: "og:description",
        content:
          "Genera tu carta astral, tu sinastría o tu revolución solar en minutos con paquetes de créditos desde 10 $.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const studies = [
  {
    icon: Sparkles,
    name: "Carta astral",
    description: "Conoce el mapa natal de una persona",
  },
  {
    icon: HeartHandshake,
    name: "Sinastría",
    description: "Explora la conexión entre dos personas",
  },
  {
    icon: Sun,
    name: "Revolución solar",
    description: "Descubre la energía de un nuevo ciclo solar",
  },
];

const packages = [
  { name: "Iniciación", credits: 10, price: 10 },
  { name: "Estándar", credits: 20, price: 20, featured: true },
  { name: "Premium", credits: 50, price: 50 },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />


      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-6 py-16 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 50%, var(--color-primary), transparent 65%)",
            }}
          />
          <div className="relative mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
              Descubre lo que el cosmos{" "}
              <span className="text-gradient">tiene para ti</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Genera tu carta astral, tu sinastría o tu revolución solar en minutos
            </p>
            <div className="mt-8">
              <Link to="/registro" className="btn-primary">
                Crear cuenta gratis
              </Link>
            </div>

          </div>
        </section>

        {/* Estudios */}
        <section className="mx-auto max-w-5xl px-6 py-12">
          <h2 className="text-2xl font-semibold sm:text-4xl">¿Qué quieres crear hoy?</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {studies.map((study) => (
              <article
                key={study.name}
                className="surface-card surface-card-hover p-6"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-md bg-surface-elevated text-primary">
                  <study.icon className="size-6" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{study.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{study.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Paquetes */}
        <section className="mx-auto max-w-5xl px-6 py-12">
          <h2 className="text-2xl font-semibold sm:text-4xl">Paquetes de créditos</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {packages.map((pack) => (
              <article
                key={pack.name}
                className="surface-card surface-card-hover p-6 text-center"
                style={
                  pack.featured
                    ? { boxShadow: "var(--shadow-glow), var(--shadow-card)" }
                    : undefined
                }
              >
                <h3 className="font-heading text-lg font-semibold">{pack.name}</h3>
                <p className="mt-4 text-4xl font-bold text-gradient">{pack.price} $</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {pack.credits} créditos por {pack.price} $
                </p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Cada estudio cuesta 5 créditos
          </p>
        </section>
      </main>

      <footer className="mt-12 border-t border-border py-8 text-center text-sm text-muted-foreground">
        AstroCréditos © 2024 · España
      </footer>
    </div>
  );
}
