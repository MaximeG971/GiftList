import { z } from "zod";
import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "~~/app/types/database.types";

const bodySchema = z.object({ role: z.enum(["admin", "member"]) });

export default defineEventHandler(async (event) => {
  const { id, memberId } = await getValidatedRouterParams(
    event,
    familyMemberParams.parse,
  );
  const user = await requireUser(event);
  const body = await readValidatedBody(event, bodySchema.parse);

  const admin = serverSupabaseServiceRole<Database>(event);
  const { error } = await admin.rpc("set_member_role", {
    p_actor: user.id,
    p_family: id,
    p_member: memberId,
    p_role: body.role,
  });
  if (error) throwRpcError(error);
  return { ok: true };
});
