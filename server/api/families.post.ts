import { z } from "zod";
import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "~~/app/types/database.types";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(80),
  accentColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const body = await readValidatedBody(event, bodySchema.parse);

  const admin = serverSupabaseServiceRole<Database>(event);
  const { data, error } = await admin.rpc("create_family_with_admin", {
    p_user_id: user.id,
    p_first_name: user.firstName,
    p_family_name: body.name,
    p_accent_color: body.accentColor,
  });

  if (error) {
    console.error("create_family_with_admin failed", error.code);
    throw createError({
      statusCode: 500,
      statusMessage: "Création de la famille impossible",
    });
  }
  return { id: data };
});
