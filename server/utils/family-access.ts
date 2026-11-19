import type { H3Event } from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "~~/app/types/database.types";

export async function assertFamilyAdmin(
  event: H3Event,
  familyId: string,
  userId: string,
) {
  const admin = serverSupabaseServiceRole<Database>(event);
  const { data } = await admin
    .from("family_members")
    .select("id")
    .eq("family_id", familyId)
    .eq("user_id", userId)
    .eq("status", "active")
    .eq("role", "admin")
    .maybeSingle();

  if (!data) {
    throw createError({ statusCode: 403, statusMessage: "Accès refusé" });
  }
}
