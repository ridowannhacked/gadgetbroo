import { betterAuth } from "better-auth";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";
import { passwordSchema } from "../zodSchemas/passwordSchema";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // This ensures ANY new user (Email OR Google) gets the customer role automatically
          const customerRole = await prisma.role.findUnique({
            where: { name: "customer" },
          });
          if (customerRole && !user.roleId) {
            await prisma.user.update({
              where: { id: user.id },
              data: { roleId: customerRole.id },
            });
          }
        }
      }
    }
  },

  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    ipAddress: {
      trustedProxies: ["127.0.0.1", "::1", "0.0.0.0"],
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    },
  },

  trustedOrigins: [
    "http://localhost:3000",
    "https://dev.gadgetbroo.com",
    "http://dev.gadgetbroo.com"
  ],
  // backend zod validation on hooks
  // hooks er kahini hocce backend a check korar jonno mane zod schema backend a use korar jonno hooks abong safeParse use kora lage

  rateLimit: {
    enabled: true,              // false by default in dev
    window: 60,                 // seconds
    max: 100,                   // requests per window
    customRules: {
      "/sign-in/email": { window: 10, max: 3 },   // strict
      "/sign-up/email": { window: 60, max: 5 },    // strict
      "/get-session": false,   // no limit on reads
    },

    storage: "database",          // stores in a `rateLimit` table
    modelName: "rateLimit",    // default table name

  },
  hooks: {

    before: createAuthMiddleware(async (ctx) => {
      if (
        ctx.path === "/sign-up/email" ||
        ctx.path === "/reset-password" ||
        ctx.path === "/change-password"
      ) {
        const password = ctx.body.password || ctx.body.newPassword;

        const result = passwordSchema.safeParse(password);

        if (!result.success) {
          throw new APIError("BAD_REQUEST", {
            message: "Password is not strong enough",
          });
        }
      }
    }),

  }
});

// type define kore dea laglo jate kore akhn ay type gulo use kora jai j gula role k indicate kore 
export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;

