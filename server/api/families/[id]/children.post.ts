import { z } from "zod";
import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "~~/app/types/database.types";

const bodySchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  managerMemberIds: z.array(z.string().uuid()).max(20).default([]),
});

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, idParams.parse);
  const user = await requireUser(event);
  const body = await readValidatedBody(event, bodySchema.parse);

  const admin = serverSupabaseServiceRole<Database>(event);
  const { data, error } = await admin.rpc("create_child_profile", {
    p_actor: user.id,
    p_family: id,
    p_first_name: body.firstName,
    p_manager_member_ids: body.managerMemberIds,
  });
  if (error) throwRpcError(error);
  return { id: data };
});
