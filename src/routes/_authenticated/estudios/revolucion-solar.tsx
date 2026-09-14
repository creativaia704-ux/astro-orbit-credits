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

type RevolucionDraft = { person: PersonValues; year: string };

export const Route = createFileRoute("/_authenticated/estudios/revolucion-solar")({
  head: () => ({
    meta: [
      { title: "Revolución solar · AstroCréditos" },
      {
        name: "description",
        content: "Descubre la energía de tu nuevo ciclo solar por 5 créditos.",
      },
      { property: "og:title", content: "Revolución solar · AstroCréditos" },
      { property: "og:description", content: "Tu ciclo solar del año por 5 créditos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RevolucionSolarPage,
});

function RevolucionSolarPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const submit = useServerFn(createStudy);
  const { profile, balance, setBalance } = useProfileCredits(user.id);

  const currentYear = new Date().getFullYear();
  const [person, setPerson] = useState<PersonValues>(emptyPerson);
  const [year, setYear] = useState<string>(String(currentYear));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const online = useOnlineStatus();
  const { draft, hydrated, saveDraft, clearDraft } =
    useStudyDraft<RevolucionDraft>("revolucion_solar");

  // El borrador guardado tiene prioridad sobre los datos del perfil.
  useEffect(() => {
    if (!hydrated) return;
    if (draft) {
      setPerson(draft.person);
      setYear(draft.year);
      return;
    }
    if (!profile) return;
    setPerson({
      name: profile.full_name ?? "",
      birth_date: profile.birth_date ?? "",
      birth_time: profile.birth_time ?? "",
      birth_place: profile.birth_place ?? "",
    });
  }, [profile, draft, hydrated]);

  function updatePerson(next: PersonValues) {
    setPerson(next);
    saveDraft({ person: next, year });
  }

  function updateYear(next: string) {
    setYear(next);
    saveDraft({ person, year: next });
  }

  const minYear = person.birth_date ? Number(person.birth_date.slice(0, 4)) + 1 : 1900;
  const maxYear = currentYear + 1;
  const yearNumber = Number(year);
  const yearValid =
    Number.isInteger(yearNumber) && yearNumber >= minYear && yearNumber <= maxYear;

  const canSubmit =
    isPersonValid(person, today) && yearValid && (balance ?? 0) >= 5 && !busy && online;

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
          study_type_code: "revolucion_solar",
          person1: {
            name: person.name.trim(),
            birth_date: person.birth_date,
            birth_time: person.birth_time || null,
            birth_place: person.birth_place.trim(),
          },
          year: yearNumber,
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
        <h1 className="text-3xl font-semibold">Revolución solar</h1>
        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-[20px] border border-border bg-surface-elevated p-6 sm:p-8"
        >
          <PersonFields idPrefix="p1" values={person} onChange={updatePerson} today={today} />

          <div className="mt-5">
            <label htmlFor="year" className="mb-1.5 block text-sm text-muted-foreground">
              Año de la revolución solar
            </label>
            <input
              id="year"
              type="number"
              required
              min={minYear}
              max={maxYear}
              placeholder="2025"
              value={year}
              onChange={(e) => updateYear(e.target.value)}
              className="w-full rounded-[12px] border border-border bg-surface px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {error && (
            <p role="alert" className="banner-slide-in mt-5 text-sm text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {busy ? "Calculando tu estudio…" : "Generar estudio (5 créditos)"}
          </button>
        </form>
      </main>
    </div>
  );
}
