import { z } from "zod";
import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "~~/app/types/database.types";

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(
    event,
    z.object({ id: z.string().uuid() }).parse,
  );
  const user = await requireUser(event);
  await assertFamilyAdmin(event, id, user.id);

  const token = generateInviteToken();
  const admin = serverSupabaseServiceRole<Database>(event);
  const { data, error } = await admin
    .from("invitations")
    .insert({
      family_id: id,
      token_hash: hashToken(token),
      created_by: user.id,
    })
    .select("id, expires_at")
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Création de l'invitation impossible",
    });
  }

  const origin = getRequestURL(event, {
    xForwardedHost: true,
    xForwardedProto: true,
  }).origin;
  // Le jeton n'est renvoyé qu'ici, une seule fois, et jamais journalisé
  return {
    id: data.id,
    expiresAt: data.expires_at,
    link: `${origin}/join/${token}`,
  };
});
