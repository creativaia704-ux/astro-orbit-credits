import { useEffect, useRef, useState } from "react";

/**
 * Persiste el borrador de un formulario de estudio en localStorage para que no
 * se pierdan los datos si la conexión se cae antes de enviar.
 * La clave es `draft_<code>` (ej. draft_carta_natal).
 */
export function useStudyDraft<T>(code: string) {
  const key = `draft_${code}`;
  const [draft, setDraft] = useState<T | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const keyRef = useRef(key);
  keyRef.current = key;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setDraft(JSON.parse(raw) as T);
    } catch {
      // Draft corrupto o storage no disponible: se ignora.
    }
    setHydrated(true);
  }, [key]);

  function saveDraft(value: T) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(keyRef.current, JSON.stringify(value));
    } catch {
      // Storage lleno o bloqueado: la UI sigue funcionando igual.
    }
  }

  function clearDraft() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(keyRef.current);
    } catch {
      // Sin efecto si el storage no está disponible.
    }
  }

  return { draft, hydrated, saveDraft, clearDraft };
}
