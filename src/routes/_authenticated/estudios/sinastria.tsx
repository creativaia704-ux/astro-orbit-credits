import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { createStudy } from "@/lib/studies.functions";
import { useProfileCredits } from "@/hooks/useProfileCredits";
import {
  PersonFields,
  emptyPerson,
  isPersonValid,
  type PersonValues,
} from "@/components/estudios/StudyFormFields";
import { OfflineBanner } from "@/components/OfflineBanner";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useStudyDraft } from "@/hooks/useStudyDraft";

type SinastriaDraft = { p1: PersonValues; p2: PersonValues };

export const Route = createFileRoute("/_authenticated/estudios/sinastria")({
  head: () => ({
    meta: [
      { title: "Sinastría · AstroCréditos" },
      {
        name: "description",
        content: "Compara dos cartas y descubre vuestra compatibilidad por 5 créditos.",
      },
      { property: "og:title", content: "Sinastría · AstroCréditos" },
      { property: "og:description", content: "Compara dos cartas por 5 créditos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SinastriaPage,
});

function SinastriaPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const submit = useServerFn(createStudy);
  const { profile, balance, setBalance } = useProfileCredits(user.id);
  const online = useOnlineStatus();
  const { draft, hydrated, saveDraft, clearDraft } = useStudyDraft<SinastriaDraft>("sinastria");

  const [p1, setP1] = useState<PersonValues>(emptyPerson);
  const [p2, setP2] = useState<PersonValues>(emptyPerson);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // El borrador guardado tiene prioridad sobre los datos del perfil.
  useEffect(() => {
    if (!hydrated) return;
    if (draft) {
      setP1(draft.p1);
      setP2(draft.p2);
      return;
    }
    if (!profile) return;
    setP1({
      name: profile.full_name ?? "",
      birth_date: profile.birth_date ?? "",
      birth_time: profile.birth_time ?? "",
      birth_place: profile.birth_place ?? "",
    });
  }, [profile, draft, hydrated]);

  function updateP1(next: PersonValues) {
    setP1(next);
    saveDraft({ p1: next, p2 });
  }

  function updateP2(next: PersonValues) {
    setP2(next);
    saveDraft({ p1, p2: next });
  }

  const canSubmit =
    isPersonValid(p1, today) &&
    isPersonValid(p2, today) &&
    (balance ?? 0) >= 5 &&
    !busy &&
    online;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setBusy(true);
    const previous = balance;
    setBalance((b) => (b === null ? b : b - 5));

    try {
      const res = await submit({
        data: {
          study_type_code: "sinastria",
          person1: {
            name: p1.name.trim(),
            birth_date: p1.birth_date,
            birth_time: p1.birth_time || null,
            birth_place: p1.birth_place.trim(),
          },
          person2: {
            name: p2.name.trim(),
            birth_date: p2.birth_date,
            birth_time: p2.birth_time || null,
            birth_place: p2.birth_place.trim(),
          },
        },
      });
      clearDraft();
      navigate({ to: "/estudios/resultado/$id", params: { id: res.study_id } });
    } catch (err) {
      setBalance(previous ?? null);
      setBusy(false);
      setError(
        err instanceof Error && err.message.includes("insufficient_credits")
          ? "No tienes créditos suficientes."
          : "No se pudo generar el estudio. Inténtalo de nuevo.",
      );
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {!online && <OfflineBanner />}
      <SiteHeader />
      <main className="fade-in-up safe-bottom mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <h1 className="text-3xl font-semibold">Sinastría</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <section className="rounded-[20px] border border-border bg-surface-elevated p-6 sm:p-8">
            <h2 className="mb-5 text-xl font-semibold">Persona 1</h2>
            <PersonFields idPrefix="p1" values={p1} onChange={updateP1} today={today} />
          </section>
          <section className="rounded-[20px] border border-border bg-surface-elevated p-6 sm:p-8">
            <h2 className="mb-5 text-xl font-semibold">Persona 2</h2>
            <PersonFields
              idPrefix="p2"
              values={p2}
              onChange={updateP2}
              today={today}
              namePlaceholder="Nombre de la otra persona"
            />
          </section>

          {error && (
            <p role="alert" className="banner-slide-in text-sm text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {busy ? "Calculando tu estudio…" : "Generar estudio (5 créditos)"}
          </button>
        </form>
      </main>
    </div>
  );
}
