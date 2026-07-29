// lib/types.ts

import { Prisma } from "../app/generated/prisma/client";

// This type exactly matches what prisma.user.findUnique({ include: { role: true } }) returns
export type FullUser = Prisma.UserGetPayload<{
  include: { role: true };
}>;
