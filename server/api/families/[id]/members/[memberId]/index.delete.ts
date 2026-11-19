import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "~~/app/types/database.types";

export default defineEventHandler(async (event) => {
  const { id, memberId } = await getValidatedRouterParams(
    event,
    familyMemberParams.parse,
  );
  const user = await requireUser(event);

  const admin = serverSupabaseServiceRole<Database>(event);
  const { error } = await admin.rpc("remove_member", {
    p_actor: user.id,
    p_family: id,
    p_member: memberId,
  });
  if (error) throwRpcError(error);
  return { ok: true };
});
