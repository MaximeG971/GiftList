import { z } from "zod";
import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "~~/app/types/database.types";

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(
    event,
    z.object({ id: z.string().uuid() }).parse,
  );
  const user = await requireUser(event);
  const admin = serverSupabaseServiceRole<Database>(event);

  const { data: inv } = await admin
    .from("invitations")
    .select("family_id")
    .eq("id", id)
    .maybeSingle();
  if (!inv)
    throw createError({ statusCode: 404, statusMessage: "Introuvable" });

  await assertFamilyAdmin(event, inv.family_id, user.id);

  const { error } = await admin
    .from("invitations")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending");
  if (error)
    throw createError({
      statusCode: 500,
      statusMessage: "Révocation impossible",
    });

  return { ok: true };
});
