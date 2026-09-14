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

export const Route = createFileRoute("/_authenticated/estudios/carta-natal")({
  head: () => ({
    meta: [
      { title: "Carta astral · AstroCréditos" },
      { name: "description", content: "Genera tu carta astral con 5 créditos en AstroCréditos." },
      { property: "og:title", content: "Carta astral · AstroCréditos" },
      { property: "og:description", content: "Genera tu carta astral con 5 créditos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartaNatalPage,
});

function CartaNatalPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const submit = useServerFn(createStudy);
  const { profile, balance, setBalance } = useProfileCredits(user.id);
  const online = useOnlineStatus();
  const { draft, hydrated, saveDraft, clearDraft } = useStudyDraft<PersonValues>("carta_natal");

  const [person, setPerson] = useState<PersonValues>(emptyPerson);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // El borrador guardado tiene prioridad sobre los datos del perfil.
  useEffect(() => {
    if (!hydrated) return;
    if (draft) {
      setPerson(draft);
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
    saveDraft(next);
  }

  const canSubmit = isPersonValid(person, today) && (balance ?? 0) >= 5 && !busy && online;

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
          study_type_code: "carta_natal",
          person1: {
            name: person.name.trim(),
            birth_date: person.birth_date,
            birth_time: person.birth_time || null,
            birth_place: person.birth_place.trim(),
          },
        },
      });
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
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-semibold">Carta astral</h1>
        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-[20px] border border-border bg-surface-elevated p-8"
        >
          <PersonFields idPrefix="p1" values={person} onChange={setPerson} today={today} />
          {error && (
            <p role="alert" className="mt-5 text-sm text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-primary mt-6 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Calculando tu estudio…" : "Generar estudio (5 créditos)"}
          </button>
        </form>
      </main>
    </div>
  );
}
