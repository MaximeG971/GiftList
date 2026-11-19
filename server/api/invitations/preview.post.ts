import { z } from "zod";
import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "~~/app/types/database.types";

export default defineEventHandler(async (event) => {
  await requireUser(event);
  const { token } = await readValidatedBody(
    event,
    z.object({ token: z.string().min(20).max(100) }).parse,
  );

  const admin = serverSupabaseServiceRole<Database>(event);
  const { data } = await admin
    .from("invitations")
    .select("status, expires_at, family:families(name)")
    .eq("token_hash", hashToken(token))
    .maybeSingle();

  const valid =
    !!data &&
    data.status === "pending" &&
    new Date(data.expires_at) > new Date();
  return {
    valid,
    familyName: valid
      ? ((data.family as { name: string } | null)?.name ?? null)
      : null,
  };
});
