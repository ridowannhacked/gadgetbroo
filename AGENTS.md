<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# The error while signup new user

@L ~/N/c/r/gadgetbroo (main)> npm run dev
npm notice run gadgetbroo@0.1.0 dev
npm notice run next dev
▲ Next.js 16.2.10 (Turbopack)

- Local:         <http://localhost:3000>
- Network:       <http://192.168.0.120:3000>
- Environments: .env
✓ Ready in 676ms
- Experiments (use with caution):
  ✓ authInterrupts

 GET /sign-up 200 in 1227ms (next.js: 696ms, application-code: 530ms)
2026-07-28T12:05:42.935Z ERROR [Better Auth]: Failed to create user Error [PrismaClientKnownRequestError]:
Invalid `db[model].create()` invocation in
/home/l/NOTHING/code/ridowan/gadgetbroo/.next/dev/server/chunks/[root-of-the-server]__0r7h06o._.js:7667:44

  7664 return {
  7665     async create ({ model, data: values, select }) {
  7666         if (!db[model]) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["BetterAuthError"](`Model ${model} does not exist in the database. If you haven't generated the Prisma client, you need to run 'npx prisma generate'`);
→ 7667         return await db[model].create(
Null constraint violation on the (not available)
    at ignore-listed frames {
  code: 'P2011',
  meta: {
    modelName: 'User',
    driverAdapterError: Error [DriverAdapterError]: NullConstraintViolation
        at ignore-listed frames {
      [cause]: [Object]
    }
  },
  clientVersion: '7.8.0'
}
2026-07-28T12:05:43.361Z ERROR [Better Auth]: Failed to create user Error [PrismaClientKnownRequestError]:
Invalid `db[model].create()` invocation in
/home/l/NOTHING/code/ridowan/gadgetbroo/.next/dev/server/chunks/[root-of-the-server]__0r7h06o._.js:7667:44

  7664 return {
  7665     async create ({ model, data: values, select }) {
  7666         if (!db[model]) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["BetterAuthError"](`Model ${model} does not exist in the database. If you haven't generated the Prisma client, you need to run 'npx prisma generate'`);
→ 7667         return await db[model].create(
Null constraint violation on the (not available)
    at ignore-listed frames {
  code: 'P2011',
  meta: {
    modelName: 'User',
    driverAdapterError: Error [DriverAdapterError]: NullConstraintViolation
        at ignore-listed frames {
      [cause]: [Object]
    }
  },
  clientVersion: '7.8.0'
}
 POST /api/auth/sign-up/email 422 in 1929ms (next.js: 991ms, application-code: 938ms)

# This is the schmea

// This is your Prisma schema file,
// learn more about it in the docs: <https://pris.ly/d/prisma-schema>

// Get a free hosted Postgres database in seconds: `npx create-db`

generator client {
  provider = "prisma-client"
  output   = "../app/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id            String   @id
  name          String
  email         String
  emailVerified Boolean
  image         String?
  createdAt     DateTime
  updatedAt     DateTime

  roleId   String
  role     Role      @relation(fields: [roleId], references: [id])
  sessions Session[]
  accounts Account[]

  @@unique([email])
  @@map("user")
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String
  createdAt DateTime
  updatedAt DateTime
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([token])
  @@map("session")
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime
  updatedAt             DateTime

  @@map("account")
}

model Verification {
  id         String    @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime?
  updatedAt  DateTime?

  @@map("verification")
}

model Role {
  id          String       @id @default(cuid())
  name        String       @unique // "admin", "customer", "manager"
  description String       @default("")
  users       User[]
  permissions Permission[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@map("roles")
}

model Permission {
  id        String  @id @default(cuid())
  resource  String // "products", "orders", "users", etc.
  canView   Boolean @default(false)
  canCreate Boolean @default(false)
  canUpdate Boolean @default(false)
  canDelete Boolean @default(false)
  roleId    String
  role      Role    @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@unique([roleId, resource])
  @@map("permissions")
}

# This is the signupform.tsx

"use client";

import { LoadingButton } from "../../../components/ui/loading-button";
import { PasswordInput } from "../../../components/password-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { passwordSchema } from "../../../zodSchemas/passwordSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signUpSchema } from "../../../zodSchemas/signUpSchema";
import { authClient } from "../../../lib/auth-client";
import { toast } from "sonner";

type errorTypes = { message: string }
type SignUpValues = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  async function onSubmit({ email, password, name }: SignUpValues) {

    setError(null);

    const { error } = await authClient.signUp.email(

      {
        email,
        password,
        name,
        callbackURL: "/email-verified"
      })
    if (error) {
      setError(error.message || "Failed to Create user")
      return;
    } else {
      toast.success("Account Creaated Successfully")
      router.push('/')
    }
  }

  const loading = form.formState.isSubmitting;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Sign Up</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      placeholder="Password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passwordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      placeholder="Confirm password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div role="alert" className="text-sm text-red-600">
                {error}
              </div>
            )}

            <LoadingButton type="submit" className="w-full" loading={loading}>
              Create an account
            </LoadingButton>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="flex w-full justify-center border-t pt-4">
          <p className="text-muted-foreground text-center text-xs">
            Already have an account?{" "}
            <Link href="/sign-in" className="underline">
              Sign in
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}

Now the problem Is I can't signup new user. Why

# main schema

```prissma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Get a free hosted Postgres database in seconds: `npx create-db`

generator client {
  provider = "prisma-client"
  output   = "../app/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id            String   @id
  name          String
  email         String
  emailVerified Boolean
  image         String?
  createdAt     DateTime
  updatedAt     DateTime

  roleId   String
  role     Role      @relation(fields: [roleId], references: [id])
  sessions Session[]
  accounts Account[]

  @@unique([email])
  @@map("user")
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String
  createdAt DateTime
  updatedAt DateTime
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([token])
  @@map("session")
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime
  updatedAt             DateTime

  @@map("account")
}

model Verification {
  id         String    @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime?
  updatedAt  DateTime?

  @@map("verification")
}

model Role {
  id          String       @id @default(cuid())
  name        String       @unique // "admin", "customer", "manager"
  description String       @default("")
  users       User[]
  permissions Permission[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@map("roles")
}

model Permission {
  id        String  @id @default(cuid())
  resource  String // "products", "orders", "users", etc.
  canView   Boolean @default(false)
  canCreate Boolean @default(false)
  canUpdate Boolean @default(false)
  canDelete Boolean @default(false)
  roleId    String
  role      Role    @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@unique([roleId, resource])
  @@map("permissions")
}

```
