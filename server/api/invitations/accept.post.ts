import { z } from "zod";
import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "~~/app/types/database.types";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const { token } = await readValidatedBody(
    event,
    z.object({ token: z.string().min(20).max(100) }).parse,
  );

  const admin = serverSupabaseServiceRole<Database>(event);
  const { data, error } = await admin.rpc("accept_invitation", {
    p_token_hash: hashToken(token),
    p_user_id: user.id,
    p_first_name: user.firstName,
  });

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Adhésion impossible",
    });
  }
  return data as {
    status: "joined" | "already_member" | "invalid";
    family_id?: string;
  };
});
