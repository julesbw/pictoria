import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

let anonymousSessionPromise: Promise<User> | null = null;

export async function getSupabaseUserId() {
  try {
    const user = await ensureAnonymousSession();
    return user.id;
  } catch {
    return null;
  }
}

export async function ensureAnonymousSession() {
  if (!anonymousSessionPromise) {
    anonymousSessionPromise = resolveAnonymousSession().catch((error) => {
      anonymousSessionPromise = null;
      throw error;
    });
  }

  return anonymousSessionPromise;
}

async function resolveAnonymousSession() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase no está configurado.");
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error("No se pudo revisar la sesión de Supabase.");
  }

  if (session?.user) {
    await ensureProfile(session.user.id);
    return session.user;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    throw new Error("No se pudo iniciar sesión anónima. Recarga e intenta de nuevo.");
  }

  await ensureProfile(data.user.id);
  return data.user;
}

async function ensureProfile(userId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  await supabase.from("profiles").upsert({ id: userId }, { onConflict: "id" });
}
