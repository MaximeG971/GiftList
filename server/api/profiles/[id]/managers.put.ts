import { z } from "zod";
import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "~~/app/types/database.types";

const bodySchema = z.object({ memberIds: z.array(z.string().uuid()).max(20) });

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, idParams.parse);
  const user = await requireUser(event);
  const body = await readValidatedBody(event, bodySchema.parse);

  const admin = serverSupabaseServiceRole<Database>(event);
  const { error } = await admin.rpc("set_profile_managers", {
    p_actor: user.id,
    p_profile: id,
    p_member_ids: body.memberIds,
  });
  if (error) throwRpcError(error);
  return { ok: true };
});
