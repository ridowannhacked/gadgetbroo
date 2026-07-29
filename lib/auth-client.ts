import { nextCookies } from "better-auth/next-js";
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { auth } from "./auth";
import { toast } from "sonner";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(), // ayta add kora lagce karon ami extra field add korci user model a  https://better-auth.com/docs/concepts/typescript#inferring-additional-fields-on-client
    nextCookies()
  ],

  fetchOptions: {
    onError: async (ctx) => {
      if (ctx.response.status === 429) {
        const retryAfter = ctx.response.headers.get("X-Retry-After");
        toast.error(`Too many attempts. Try again in ${retryAfter}s`);
      }
    },
  },

});
