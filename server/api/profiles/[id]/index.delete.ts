import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "~~/app/types/database.types";

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, idParams.parse);
  const user = await requireUser(event);

  const admin = serverSupabaseServiceRole<Database>(event);
  const { error } = await admin.rpc("delete_profile", {
    p_actor: user.id,
    p_profile: id,
  });
  if (error) throwRpcError(error);
  return { ok: true };
});
