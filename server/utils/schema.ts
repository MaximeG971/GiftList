import { z } from "zod";

export const idParams = z.object({ id: z.string().uuid() });
export const familyMemberParams = z.object({
  id: z.string().uuid(),
  memberId: z.string().uuid(),
});
