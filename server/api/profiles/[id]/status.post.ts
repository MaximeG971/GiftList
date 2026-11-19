import { z } from "zod";
import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "~~/app/types/database.types";

const bodySchema = z.object({ status: z.enum(["active", "archived"]) });

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, idParams.parse);
  const user = await requireUser(event);
  const body = await readValidatedBody(event, bodySchema.parse);

  const admin = serverSupabaseServiceRole<Database>(event);
  const { error } = await admin.rpc("set_child_status", {
    p_actor: user.id,
    p_profile: id,
    p_status: body.status,
  });
  if (error) throwRpcError(error);
  return { ok: true };
});
