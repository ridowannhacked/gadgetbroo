# Step-by-Step Implementation Guide for Coding LLMs (Claude Sonnet 4.6 / Antigravity)
**Project Architecture:** GadgetBroo (Next.js 16 App Router, Prisma, PostgreSQL, Better Auth, ImageKit, Zustand)  
**ImageKit Instance ID:** `rt9szzzbg`  
**ImageKit Base URL:** `https://ik.imagekit.io/rt9szzzbg`  
**ImageKit Dashboard:** `https://imagekit.io/dashboard/media-library/L2dhZGdldGJyb28`

---

## Purpose of this Document
This file contains the **precise, execution-ready architectural instructions** for an autonomous coding agent or LLM (such as Claude Sonnet 4.6 or Gemini 3.1 Pro) to implement the first critical phase of system transformations for GadgetBroo. 

Do **NOT** deviate from these patterns. Execute each step sequentially. Always verify compile-time TypeScript correctness and database migration success before moving to the next step.

---

## PART 1: Database & Prisma Schema Transformation (`prisma/schema.prisma`)

### Problem Statement
The current Prisma schema has critical architectural flaws:
1. Generated client code is outputting directly into `app/generated/prisma`, which violates Next.js App Router route compilation boundaries.
2. PostgreSQL foreign keys are unindexed, causing severe O(N) sequential full-table scan bottlenecks on relational joins and cascade deletions.
3. The `MediaFile` table lacks cryptographic hash columns necessary to execute zero-network deduplication.
4. E-commerce order items lack historical pricing/name snapshots and soft-delete safeguards, threatening financial auditing integrity if a product or variant is modified or deleted after a sale.

### Step 1.1: Fix Generated Prisma Client Path
Open `prisma/schema.prisma`. Modify the `generator client` block to remove the custom `output` directive pointing into `app/`, allowing Prisma to use standard node_modules or a safe project-root directory:
```prisma
generator client {
  provider = "prisma-client"
  // EITHER remove the `output` line entirely to use default `node_modules/@prisma/client`
  // OR output to a safe non-app location:
  output   = "../src/generated/prisma" 
}
```
*Note for LLM:* If you change the output path or revert to default node_modules, grep the entire codebase (`grep_search`) for `@/app/generated/prisma` or relative paths to `generated/prisma` and update all imports to standard `@prisma/client` (or the new clean path).

### Step 1.2: Add Explicit PostgreSQL Foreign Key Indexes
In PostgreSQL, `@relation` fields do **not** automatically index the underlying scalar foreign key column. You **MUST** add `@@index` directives to every table with a foreign key:

1. **User Model**:
   ```prisma
   // Inside model User:
   @@index([roleId])
   @@index([email, name]) // existing
   ```
2. **Session Model**:
   ```prisma
   // Inside model Session:
   @@index([userId])
   ```
3. **Account Model**:
   ```prisma
   // Inside model Account:
   @@index([userId])
   ```
4. **Permission Model**:
   ```prisma
   // Inside model Permission:
   @@index([roleId])
   @@unique([roleId, resource]) // existing
   ```
5. **ProductImage Model**:
   ```prisma
   // Inside model ProductImage:
   @@index([productId])
   @@index([mediaFileId])
   ```
6. **ProductVariant Model**:
   ```prisma
   // Inside model ProductVariant:
   @@index([productId])
   ```
7. **Address Model**:
   ```prisma
   // Inside model Address:
   @@index([userId])
   ```
8. **Order Model**:
   ```prisma
   // Inside model Order:
   @@index([userId])
   @@index([addressId])
   @@index([status, createdAt])
   ```
9. **OrderItem Model**:
   ```prisma
   // Inside model OrderItem:
   @@index([orderId])
   @@index([variantId])
   ```
10. **Review Model**:
    ```prisma
    // Inside model Review:
    @@index([productId])
    @@index([userId])
    ```

### Step 1.3: Upgrade `MediaFile` Model for Automatic Deduplication
Replace the existing `MediaFile` model with this enterprise schema featuring SHA-256 hashing and MIME metadata:

```prisma
model MediaFile {
  id          String         @id @default(cuid())
  url         String         // Full ImageKit CDN URL (https://ik.imagekit.io/rt9szzzbg/...)
  fileId      String         @unique // ImageKit unique identifier
  name        String         // Original file name
  filePath    String         @default("/gadgetbroo/products") // ImageKit folder hierarchy
  fileType    String         @default("image") // "image" | "video"
  mimeType    String?        // Exact MIME (e.g., "image/webp", "video/mp4")
  size        Int            @default(0) // Size in bytes
  width       Int?
  height      Int?
  hash        String?        @unique // SHA-256 cryptographic hash of raw file buffer for deduplication
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  images      ProductImage[] // Many-to-many link to products via ProductImage junction

  @@index([fileType, createdAt])
  @@map("media_files")
}
```

### Step 1.4: Secure Order Immutability & Add Soft-Deletes
To prevent historical accounting corruption, add soft-delete fields to products and snapshot fields to order items:

```prisma
// Add to model Product:
isDeleted     Boolean          @default(false)
deletedAt     DateTime?

// Add to model ProductVariant:
isDeleted     Boolean          @default(false)
deletedAt     DateTime?

// Upgrade model OrderItem to capture snapshots at checkout time:
model OrderItem {
  id            String         @id @default(cuid())
  orderId       String
  order         Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  variantId     String
  variant       ProductVariant @relation(fields: [variantId], references: [id])
  quantity      Int
  priceAtOrder  Decimal        @db.Decimal(10, 2)
  
  // IMMUTABLE CHECKOUT SNAPSHOTS:
  productName   String         // Exact Product.name at time of order
  variantName   String         // Exact Variant details (e.g. "Color: Blue, 256GB") at time of order
  skuAtOrder    String         // SKU code at time of order
  imageSnapshot String?        // CDN URL of primary image at checkout

  @@index([orderId])
  @@index([variantId])
  @@map("order_items")
}
```

### Step 1.5: Add Enterprise Audit Log Table
Insert this model at the end of `prisma/schema.prisma` for high-security operation tracking:
```prisma
model AuditLog {
  id          String   @id @default(cuid())
  actorId     String
  actor       User     @relation(fields: [actorId], references: [id])
  action      String   // e.g., "PRODUCT_CREATED", "MEDIA_DELETED", "MEDIA_REUSED", "ROLE_UPDATED"
  entity      String   // e.g., "Product", "MediaFile", "User"
  entityId    String
  metadata    Json?    // Before/after modification state snapshots
  ipAddress   String?
  createdAt   DateTime @default(now())

  @@index([actorId])
  @@index([entity, entityId, createdAt])
  @@map("audit_logs")
}
```

### Step 1.6: Run Migration & Verification
Execute the terminal commands in sequence:
1. `npx prisma format` (validates syntax).
2. `npx prisma generate` (builds typescript client).
3. `npx prisma migrate dev --name phase1_enterprise_schema_and_indexes` (applies SQL schema changes to Postgres).

---

## PART 2: State Management & User State (Big Tech Next.js 16 Pattern)

### Problem Statement & Enterprise Philosophy
In intermediate Next.js applications, developers often replicate authentication sessions inside client-side state stores like Zustand (`useUserStore.ts` + `UserStoreHydrator.tsx`). 
**Why Big Tech avoids this in Next.js App Router:**
1. **Hydration Flickers:** On initial page load, the server renders HTML assuming the session exists. The client loads with `user: null` in Zustand, hydrating to a logged-out UI for 400ms before `UserStoreHydrator` updates, causing visual jarring.
2. **Security & State Desync:** Cryptographic session cookies managed by Better Auth (`better-auth.session_token`) are the single source of truth. If a token expires or an admin revokes permissions via API, a persistent client-side Zustand store remains unaware, displaying unauthorized UI states.

### Step 2.1: Purge Auth Sync from Zustand
1. Keep Zustand exclusively for **transient client-side interaction UI** (e.g., shopping cart items before login, mobile navigation drawer state, active filter toggles).
2. Refactor or deprecate `lib/stores/useUserStore.ts`. Do **not** use `useEffect` on the client to continuously fetch or store Better Auth user tokens in Zustand.

### Step 2.2: Implement Server-to-Client Session Hydration via React Context
Instead of Zustand store replication, implement the standard enterprise **React Server Component (RSC) → Client Provider pattern**:

1. Create a lightweight Client Context Provider in `components/auth/AuthSessionProvider.tsx`:
```tsx
'use client';
import React, { createContext, useContext } from 'react';
import type { Session, User } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, session: null });

export function AuthSessionProvider({ 
  children, 
  user, 
  session 
}: { 
  children: React.ReactNode; 
  user: User | null; 
  session: Session | null; 
}) {
  return (
    <AuthContext.Provider value={{ user, session }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthSession = () => useContext(AuthContext);
```

2. In your top-level layout (`app/layout.tsx` or `app/(admin)/admin/layout.tsx`), fetch the session **once on the server** and wrap the children:
```tsx
// Inside Server Component layout:
import { getServerSession } from '@/helpers/get-servesession';
import { AuthSessionProvider } from '@/components/auth/AuthSessionProvider';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  
  return (
    <AuthSessionProvider user={session?.user || null} session={session || null}>
      {children}
    </AuthSessionProvider>
  );
}
```

3. Anywhere in a Client Component (like `user-avatar.tsx` or admin header) where user data is needed, simply invoke:
```tsx
const { user } = useAuthSession(); // Immediate, zero-flicker, perfectly synced server state
```

---

## PART 3: Media Route & Universal "Add Media" Modal Component

### Problem Statement
1. Existing `/api/(admin)/media/route.ts` runs a slow external network HTTP request (`imagekit.listFiles()`) on every single media library page load. This induces severe dashboard lag and risks API throttling.
2. There is no mechanism to prevent duplicate file uploads to ImageKit (`https://ik.imagekit.io/rt9szzzbg`).
3. Admin interfaces need a **Universal Polymorphic Media Picker**—a single modal component that functions identically whether clicking "Add Media" on `/admin/media` or "Add Images/Videos" inside `/admin/products/new`.

### Step 3.1: Build Zero-Network Cryptographic Hash Deduplication API
We will calculate a SHA-256 hash of the binary file buffer directly inside the browser before transmitting payload bytes over the internet.

1. **Create API check route:** `app/api/(admin)/media/check-duplicate/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/helpers/get-servesession";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { hash } = await request.json();
    if (!hash) return NextResponse.json({ error: "Hash required" }, { status: 400 });

    const existingFile = await prisma.mediaFile.findUnique({
      where: { hash },
      include: {
        images: {
          select: { product: { select: { id: true, name: true } } }
        }
      }
    });

    if (existingFile) {
      // DEDUPLICATION HIT! Return existing asset immediately
      return NextResponse.json({ duplicate: true, file: existingFile });
    }

    return NextResponse.json({ duplicate: false });
  } catch (error) {
    return NextResponse.json({ error: "Failed to verify duplicity" }, { status: 500 });
  }
}
```

### Step 3.2: Refactor `/api/(admin)/media/route.ts` to Database-Only Reads
Modify `app/api/(admin)/media/route.ts` so that `GET` reads **exclusively from PostgreSQL** instead of querying ImageKit SDK:

```typescript
// Refactored GET handler inside app/api/(admin)/media/route.ts
export async function GET(request: NextRequest) {
  try {
    const session = await checkAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type"); // "image" | "video" | null
    const limit = Math.min(Number(searchParams.get("limit") || 60), 100);
    const skip = Number(searchParams.get("skip") || 0);

    // ZERO EXTERNAL NETWORK CALLS -> 5ms Postgres query
    const files = await prisma.mediaFile.findMany({
      where: {
        AND: [
          search ? { name: { contains: search, mode: "insensitive" } } : {},
          type ? { fileType: type } : {}
        ]
      },
      take: limit,
      skip: skip,
      orderBy: { createdAt: "desc" },
      include: {
        images: {
          select: {
            isPrimary: true,
            product: { select: { id: true, name: true, slug: true } }
          }
        }
      }
    });

    const totalCount = await prisma.mediaFile.count({
      where: {
        AND: [
          search ? { name: { contains: search, mode: "insensitive" } } : {},
          type ? { fileType: type } : {}
        ]
      }
    });

    const formattedFiles = files.map((f) => ({
      fileId: f.fileId,
      name: f.name,
      url: f.url, // e.g., https://ik.imagekit.io/rt9szzzbg/gadgetbroo/products/...
      filePath: f.filePath,
      fileType: f.fileType,
      mimeType: f.mimeType,
      size: f.size,
      width: f.width,
      height: f.height,
      hash: f.hash,
      createdAt: f.createdAt,
      products: f.images.map((img) => ({
        id: img.product.id,
        name: img.product.name,
        slug: img.product.slug,
        isPrimary: img.isPrimary
      }))
    }));

    return NextResponse.json({ files: formattedFiles, total: totalCount });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load media database" }, { status: 500 });
  }
}

// Ensure POST handler registers uploaded assets with their SHA-256 hash:
export async function POST(request: NextRequest) {
  try {
    const session = await checkAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const data = await request.json();
    
    // Insert asset metadata into Postgres after ImageKit upload succeeds
    const newMedia = await prisma.mediaFile.create({
      data: {
        url: data.url,
        fileId: data.fileId,
        name: data.name,
        filePath: data.filePath || "/gadgetbroo/products",
        fileType: data.fileType || "image",
        mimeType: data.mimeType || null,
        size: data.size || 0,
        width: data.width || null,
        height: data.height || null,
        hash: data.hash || null,
      }
    });

    return NextResponse.json({ success: true, file: newMedia }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to register media" }, { status: 500 });
  }
}
```

### Step 3.3: Build Universal `<MediaPickerDialog />` Component
Create the reusable UI dialog at `components/admin/media/MediaPickerDialog.tsx`. This component must be designed with **rich modern aesthetics** (dark mode glassmorphism, subtle borders, high visual contrast).

#### Specification:
* **Props Interface:**
  ```tsx
  export interface MediaPickerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (selected: MediaFileRecord | MediaFileRecord[]) => void;
    multiple?: boolean; // false for category banner, true for product gallery
    allowedTypes?: "all" | "image" | "video";
    defaultTab?: "library" | "upload";
  }
  ```
* **Internal Tabs Implementation (`library` vs `upload`):**
  1. **Tab 1: Library Browse (Default when picking for a product):**
     * Displays a debounced search input and filter buttons (All, Images, Videos).
     * Renders a responsive grid (`grid-cols-2 sm:grid-cols-3 md:grid-cols-4 sm:gap-4`) of thumbnail cards.
     * Clicking a thumbnail toggles selection state. If `multiple={false}`, clicking replaces current selection; if `multiple={true}`, clicking toggles item in array.
     * Selected cards show a brilliant blue ring (`ring-2 ring-blue-500`) and a checkmark badge in the top-right corner.
     * Bottom footer features a primary button: **"Select Media ({count})"** that calls `onSelect(selectedItems)` and closes the modal.
  2. **Tab 2: Upload New (Default when clicking 'Add Media' in Media Library):**
     * Contains a dropzone box supporting file drag-and-drop or manual click file browser.
     * **The Deduplication Upload Engine (Execute in order for every selected file):**
       ```typescript
       // 1. Calculate SHA-256 Cryptographic Hash in Browser:
       const buffer = await file.arrayBuffer();
       const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
       const hashArray = Array.from(new Uint8Array(hashBuffer));
       const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

       // 2. Query Postgres deduplication endpoint:
       const checkRes = await fetch("/api/media/check-duplicate", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ hash: hashHex }),
       });
       const checkData = await checkRes.json();

       if (checkData.duplicate) {
         // REUSE EXISTING ASSET! Zero upload bandwidth wasted!
         toast.success(`"${file.name}" matches an existing asset in library! Reusing file.`);
         addFileToSelection(checkData.file); // Select the reused record
         continue;
       }

       // 3. Asset is unique: Fetch ImageKit Auth & execute Direct Upload:
       const authRes = await fetch(`/api/imagekit-upload-auth?type=${file.type.startsWith("video/") ? "video" : "image"}`);
       const authParams = await authRes.json();
       
       // Perform FormData POST to ImageKit API endpoint
       const formData = new FormData();
       formData.append("file", file);
       formData.append("publicKey", authParams.publicKey);
       formData.append("signature", authParams.signature);
       formData.append("expire", authParams.expire);
       formData.append("token", authParams.token);
       formData.append("fileName", file.name);
       formData.append("folder", authParams.folder); // "/gadgetbroo/products"

       const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
         method: "POST",
         body: formData,
       });
       const ikData = await uploadRes.json();

       // 4. Register newly uploaded asset in Postgres Database:
       const regRes = await fetch("/api/media", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           url: ikData.url, // Contains ID: rt9szzzbg
           fileId: ikData.fileId,
           name: ikData.name,
           filePath: ikData.filePath,
           fileType: file.type.startsWith("video/") ? "video" : "image",
           mimeType: file.type,
           size: ikData.size,
           width: ikData.width,
           height: ikData.height,
           hash: hashHex,
         }),
       });
       const regData = await regRes.json();
       toast.success("Successfully uploaded & indexed in DB!");
       ```
     * After uploading all dropped items, automatically switch modal view back to **Tab 1 ("Library")** with the newly uploaded or deduplicated files selected!

### Step 3.4: Connect Modal to Admin Pages
1. **On `/admin/media` (Main Admin Media Page):**
   * Add button in header: `<Button onClick={() => setModalOpen(true)}>Add Media</Button>`.
   * Mount modal: 
     ```tsx
     <MediaPickerDialog 
       open={modalOpen} 
       onOpenChange={setModalOpen} 
       defaultTab="upload" 
       multiple={true}
       onSelect={(files) => {
         // Refresh list or directly push new files into state table
         fetchMedia();
         toast.success("Media library updated");
       }} 
     />
     ```
2. **On `/admin/products/new` (Add New Product Form):**
   * Add button inside media section: `<Button type="button" variant="outline" onClick={() => setMediaPickerOpen(true)}>Add Product Image / Video</Button>`.
   * Mount modal:
     ```tsx
     <MediaPickerDialog
       open={mediaPickerOpen}
       onOpenChange={setMediaPickerOpen}
       defaultTab="library"
       multiple={true}
       allowedTypes="all"
       onSelect={(selectedFiles) => {
         const filesArray = Array.isArray(selectedFiles) ? selectedFiles : [selectedFiles];
         // Append URLs & fileIds into React Hook Form or state array for product submission
         setValue("images", [...currentImages, ...filesArray.map(f => ({ mediaFileId: f.fileId, url: f.url, isPrimary: false }))]);
       }}
     />
     ```

---

## Section 4: Staged Media Upload & Unselection Workflow (UX Refinement)

### Context, Problem Statement & Architectural Justification
#### What Was the Issue?
In the initial design of the universal `<MediaPickerDialog />` component, when an administrator selected files via the device file browser or dragged and dropped files into the dropzone, the system immediately triggered `processFiles()`—initiating immediate background SHA-256 computation, cloud uploading to ImageKit, and PostgreSQL indexing.

This instant auto-upload behavior introduced significant UX deficiencies for administrators:
1. **No Error Correction:** If an admin selected the wrong image or accidentally dropped a large video folder (videos can be up to 100MB), bandwidth, ImageKit CDN storage, and transformation quotas were instantaneously consumed before the action could be aborted.
2. **Lack of Visual Verification (No Staging Area):** Admins frequently select assets with generic camera or system filenames (e.g., `IMG_20260330_831.jpg`). Without a local staging area displaying browser-generated visual previews, admins could not inspect or verify their selections prior to cloud commitment.
3. **Missing Unselection & Explicit Execution Controls:** There was no intuitive way to unselect or discard an mistakenly added item from the uploading queue before upload began. Furthermore, when selecting library items or preparing new uploads, administrators require explicit action buttons ("Upload Media" vs. "Select Media") to clearly separate staging actions from confirmation actions.

#### Why We Took This Architectural Approach
To solve these issues without causing regressions or breaking surrounding system designs, we adopted an enterprise-grade **Staged Media Workflow** (patterned after modern media managers in Shopify, Cloudinary, and WordPress):
* **In-Memory Staging State (`useState<File[]>`) with Object URLs:** By intercepting selected files into local React state and rendering previews using `URL.createObjectURL(file)`, admins obtain an interactive visual review area with zero network latency or server load.
* **Granular Removal Controls (Top-Right Close `X` Button):** Every staged asset is rendered with an overlay close (`X`) button. Clicking it removes the file from local state immediately and cleanly revokes the object URL without touching the backend, database, or ImageKit CDN.
* **Tab-Specific Action Trigger ("Upload Media" Button):** An explicit **"Upload Media"** execution button is rendered strictly inside the "Upload New" tab. Uploads to ImageKit and PostgreSQL occur *only* when the admin explicitly clicks this button after verifying their staged preview queue.
* **Zero Breaking Changes to Site Architecture:** Because `<MediaPickerDialog />` operates as a polymorphic, encapsulated black-box dialog that communicates with parent forms (`/admin/products/new`, `/admin/media`) exclusively via the `onSelect(selected: MediaFileRecord[])` contract, altering its internal upload flow from auto-upload to staged-upload causes zero breaking changes to parent form integrations or backend integrations.

---

## PART 5: Phase 1 & Phase 2 (Roles, Users, & BetterAuth Admin API)

### Step 5.1: Roles & Permissions Engine (Phase 1 Implementation)
To make roles fully configurable:
1. **API Route / Server Action (`PATCH /api/roles/[id]`):** Create an endpoint to update the `name` and `description` of a role.
2. **Permissions Matrix UX:** On the `/admin/roles/[id]` (or Edit Modal) page, beneath the role details, render a grid/table of checkboxes. Each row represents a resource (e.g., `Products`, `Orders`, `Users`, `Media`). Each column is a permission boolean (`canView`, `canCreate`, `canUpdate`, `canDelete`).
3. **Save Permissions:** When a checkbox is toggled, call an endpoint (`PATCH /api/permissions`) to dynamically update the `Permission` table in Prisma.

### Step 5.2: User Management (Phase 2 Implementation)
1. **"Make Admin" Assignment:** When creating a new user, fetch all roles (`prisma.role.findMany()`). Display a dropdown to select a role. If a checkbox labelled *"Make Admin (Give full access)"* is checked, dynamically set the role to the database's root "admin" role.
2. **User Editing UX:** On the `/admin/users` page, add a "..." dropdown menu for each user row with two options: 
   * **"Edit Role & Email"** (Opens a modal to change email and role via standard Prisma/BetterAuth updates)
   * **"Change Password"** (Opens a modal prompting the admin for a new password).

---

## PART 6: Architectural Bug Fixes (Admin Roles & Password Overrides)

### Issue 6.1: BetterAuth Admin Plugin Password Error (`FORBIDDEN`)
**The Bug:** When calling BetterAuth's built-in `auth.api.admin.setUserPassword()` method, it returns a 403 FORBIDDEN error (`"You are not allowed to set users password"`).
**The Cause:** BetterAuth's internal `admin()` plugin only works if the user object has a flat string field `role` (e.g. `role: "admin"`). Because GadgetBroo uses a **Custom RBAC System** (where `User` has `roleId` linking to a `Role` table with custom granular permissions), BetterAuth's simplistic plugin cannot detect that the user is an admin, so it blocks the request automatically.

**The Fix (Custom Server Action Override):**
We must bypass the BetterAuth `admin` plugin entirely for password resets. Instead, Claude must build a **Custom Server Action** (or custom API route) that:
1. Verifies the executing user is an admin by checking the custom `Permission` table via Prisma (`user.role.permissions.some(p => p.resource === 'users' && p.canUpdate)`).
2. Uses standard `bcryptjs` (or Better Auth's password hashing utility) to securely hash the new password.
3. Updates the `password` field directly inside the `Account` table via Prisma.

*Instructions for Claude (The Code Fix):*
```typescript
import bcrypt from "bcryptjs"; // npm install bcryptjs @types/bcryptjs

// Inside your custom Server Action for Password Reset:
export async function adminResetUserPassword(targetUserId: string, newPassword: string) {
  // 1. Verify caller has custom 'users' update permission
  const callerSession = await getServerSession();
  const caller = await prisma.user.findUnique({ 
     where: { id: callerSession.user.id }, include: { role: { include: { permissions: true } } } 
  });
  
  const canUpdateUsers = caller.role.permissions.some(p => p.resource === 'users' && p.canUpdate === true);
  if (!canUpdateUsers) throw new Error("Forbidden: You lack permission to update users.");

  // 2. Hash new password securely
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // 3. Update the credential Account directly, bypassing BetterAuth's internal role block
  await prisma.account.updateMany({
    where: { userId: targetUserId, providerId: 'credential' },
    data: { password: hashedPassword }
  });

  return { success: true };
}
```

### Issue 6.2: Moderators Blocked from Admin Panel
**The Bug:** In `app/(admin)/admin/layout.tsx`, there is a hardcoded string check: 
`if (fullUser?.role?.name !== 'admin') redirect('/forbidden');`
This blocks anyone who is not strictly named "admin", preventing moderators or editors from accessing the panel entirely.

**The Fix (Granular Route Checkpoints):**
1. **Outer Gate (`layout.tsx`):** We must let *any* staff member into the admin shell. Change the check in `app/(admin)/admin/layout.tsx` to simply verify they have *any* assigned role:
   ```typescript
   // Change from: if (fullUser?.role?.name !== 'admin') redirect('/forbidden');
   // To:
   if (!fullUser?.role) redirect('/forbidden'); 
   ```
2. **Visual Gate (`Sidebar.tsx`):** The Sidebar must only render navigation links if the user has `canView` permission for that specific resource.
   ```tsx
   // Example Sidebar logic:
   const hasProductAccess = user.role.permissions.some(p => p.resource === 'products' && p.canView);
   {hasProductAccess && <Link href="/admin/products">Products</Link>}
   ```
3. **Resource Gate (Pages & API):** Inside each specific page (e.g., `app/(admin)/admin/category/page.tsx`) and its API routes, verify the specific permission string before loading data or executing mutations.

---

## Verification Checklist for Coding Agent / LLM
Before finishing your execution of these tasks, confirm:
- [ ] No database client generated files remain inside `app/`.
- [ ] All Prisma tables with foreign keys have explicit `@index([...])` annotations.
- [ ] `check-duplicate` endpoint accurately calculates SHA-256 hashes and prevents redundant uploads.
- [ ] The universal `<MediaPickerDialog />` utilizes staging with explicit "Upload Media" buttons.
- [ ] The Roles Edit page allows toggling of `canView/canCreate/canUpdate/canDelete` per resource.
- [ ] Admin password overrides use a custom Prisma update with `bcryptjs` to bypass Better Auth's `FORBIDDEN` error.
- [ ] The hardcoded `'admin'` check in `layout.tsx` is removed, allowing moderators with valid roles to enter the panel.
