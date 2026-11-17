import type { H3Event } from "h3";
import { serverSupabaseUser } from "#supabase/server";

export async function requireUser(event: H3Event) {
  const user = (await serverSupabaseUser(event)) as {
    id?: string;
    sub?: string;
    user_metadata?: { first_name?: string };
  } | null;

  const id = user?.id ?? user?.sub;
  if (!id) {
    throw createError({ statusCode: 401, statusMessage: "Non authentifié" });
  }
  return { id, firstName: user?.user_metadata?.first_name?.trim() || "Membre" };
}
