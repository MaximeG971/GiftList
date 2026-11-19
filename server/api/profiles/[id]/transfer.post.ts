import { z } from "zod";
import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "~~/app/types/database.types";

const bodySchema = z.object({ toMemberId: z.string().uuid() });

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, idParams.parse);
  const user = await requireUser(event);
  const body = await readValidatedBody(event, bodySchema.parse);

  const admin = serverSupabaseServiceRole<Database>(event);
  const { error } = await admin.rpc("transfer_adult_profile", {
    p_actor: user.id,
    p_profile: id,
    p_to_member: body.toMemberId,
  });
  if (error) throwRpcError(error);
  return { ok: true };
});
