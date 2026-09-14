import { useState } from "react";
import { lovable } from "@/integrations/lovable/index";

export function GoogleButton({ onError }: { onError: (msg: string) => void }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setLoading(false);
      onError("No hemos podido continuar con Google. Inténtalo de nuevo.");
      return;
    }
    if (result.redirected) return;
    window.location.href = "/dashboard";
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-full border border-border bg-surface-elevated px-4 py-3 text-sm font-medium transition-colors hover:border-primary disabled:opacity-60"
    >
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
        <path
          fill="#4285F4"
          d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.8Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.96-1.08 7.94-2.93l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.29 14.27a7.2 7.2 0 0 1 0-4.54v-3.1H1.28a12 12 0 0 0 0 10.74l4.01-3.1Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.43-3.43C17.95 1.19 15.23 0 12 0A12 12 0 0 0 1.28 6.63l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77Z"
        />
      </svg>
      Continuar con Google
    </button>
  );
}
