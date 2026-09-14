import { Link, createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: "Política de privacidad · AstroCréditos" },
      {
        name: "description",
        content:
          "Qué datos guarda AstroCréditos, por qué los guarda, con quién los comparte y cómo ejercer tus derechos.",
      },
      { property: "og:title", content: "Política de privacidad · AstroCréditos" },
      {
        property: "og:description",
        content: "Transparencia sobre los datos personales y de nacimiento que trata AstroCréditos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacidadPage,
});

function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-semibold sm:text-4xl">Política de privacidad de AstroCréditos</h1>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Qué datos guardamos</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Tu nombre y tu email.</li>
            <li>Tu fecha, hora y lugar de nacimiento, solo si tú los introduces.</li>
            <li>Tu historial de compras y los estudios que has generado.</li>
            <li>Tu saldo de créditos.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">Por qué los guardamos</h2>
          <p className="mt-3 text-muted-foreground">
            Para generar los estudios astrológicos que nos pides, gestionar tu saldo de créditos y
            mostrarte tu historial de compras y de estudios.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">Con quién los compartimos</h2>
          <p className="mt-3 text-muted-foreground">
            Solo con Stripe, y únicamente para procesar el pago de tus créditos. No compartimos con
            Stripe tus datos de nacimiento.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">Tus derechos</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Acceso: puedes consultar tus datos en tu panel en cualquier momento.</li>
            <li>
              Rectificación: puedes editar tu nombre y tus datos de nacimiento en{" "}
              <Link to="/dashboard" className="text-primary underline">
                tu panel
              </Link>
              .
            </li>
            <li>
              Eliminación: en tu panel, en la sección «Zona de peligro», puedes eliminar tu cuenta y
              todos los datos asociados (perfil, historial de compras y estudios). La acción es
              irreversible.
            </li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">Contacto</h2>
          <p className="mt-3 text-muted-foreground">
            Para cualquier duda sobre tus datos, escribe a privacidad@astrocreditos.test
          </p>
        </section>
      </main>
    </div>
  );
}
