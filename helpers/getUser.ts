import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "../lib/auth";

// cache function ta ay function ta k cache hisabe rakhe abong jdi same requst a onk bar o call kora hoi tao just first call er data e use korbe abong extra server call er theke bacabe 
export const getServerSessionUser = cache(async () => {

  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user
})
