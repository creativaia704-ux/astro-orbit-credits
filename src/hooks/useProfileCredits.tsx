import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ProfileCredits = {
  full_name: string | null;
  birth_date: string | null;
  birth_time: string | null;
  birth_place: string | null;
  credits_balance: number;
};

/** Carga el perfil del usuario y expone el saldo con descuento optimista. */
export function useProfileCredits(userId: string) {
  const [profile, setProfile] = useState<ProfileCredits | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("profiles")
      .select("full_name, birth_date, birth_time, birth_place, credits_balance")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (cancelled) return;
        if (data) {
          setProfile(data as ProfileCredits);
          setBalance(data.credits_balance);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { profile, balance, setBalance, loading };
}
