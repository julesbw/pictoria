import { getSupabaseBrowserClient } from "@/lib/supabase/client";

let userIdPromise: Promise<string | null> | null = null;

export async function getSupabaseUserId() {
  if (!userIdPromise) {
    userIdPromise = resolveSupabaseUserId();
  }

  return userIdPromise;
}

async function resolveSupabaseUserId() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user.id) {
    await ensureProfile(session.user.id);
    return session.user.id;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user?.id) return null;

  await ensureProfile(data.user.id);
  return data.user.id;
}

async function ensureProfile(userId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  await supabase.from("profiles").upsert({ id: userId }, { onConflict: "id" });
}
