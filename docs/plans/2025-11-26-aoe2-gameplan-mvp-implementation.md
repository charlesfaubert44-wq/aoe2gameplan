# AoE2 Gameplan Maker MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a functional Next.js web application where AoE2 players can create, view, and share build orders with Steam authentication.

**Architecture:** Next.js 15 full-stack application with App Router, PostgreSQL database via Prisma ORM, NextAuth.js for Steam OAuth, and shadcn/ui components for UI.

**Tech Stack:** Next.js 15, React 18, TypeScript, Prisma, PostgreSQL, NextAuth.js, TailwindCSS, shadcn/ui, Zod validation

---

## Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `.env.local.example`

**Step 1: Create Next.js project with TypeScript**

Run:
```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

Expected: Prompts for configuration, creates project structure

When prompted:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: No
- App Router: Yes
- Import alias: Yes (@/*)

**Step 2: Verify project structure**

Run: `ls -la`

Expected: See `app/`, `public/`, `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`

**Step 3: Install additional dependencies**

Run:
```bash
npm install @prisma/client next-auth @auth/prisma-adapter zod react-hook-form @hookform/resolvers bcrypt
npm install -D prisma @types/bcrypt
```

Expected: Dependencies installed successfully

**Step 4: Create environment file example**

Create `.env.local.example`:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/aoe2gameplan"
NEXTAUTH_SECRET="your-secret-here-generate-with-openssl"
NEXTAUTH_URL="http://localhost:3000"
STEAM_API_KEY="your-steam-api-key"
```

**Step 5: Create actual .env.local**

Run: `cp .env.local.example .env.local`

Expected: `.env.local` created (git ignored)

**Step 6: Update .gitignore**

Add to `.gitignore`:
```
# Environment
.env.local
.env

# Prisma
prisma/migrations/
```

**Step 7: Commit initial setup**

Run:
```bash
git add .
git commit -m "feat: initialize Next.js project with TypeScript and dependencies"
```

Expected: Clean commit

---

## Task 2: Set Up Prisma and Database Schema

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/prisma.ts`

**Step 1: Initialize Prisma**

Run: `npx prisma init`

Expected: Creates `prisma/schema.prisma` and updates `.env`

**Step 2: Define database schema**

Replace content of `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String       @id @default(cuid())
  name          String?
  email         String?      @unique
  emailVerified DateTime?
  image         String?
  steamId       String?      @unique
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  accounts      Account[]
  sessions      Session[]
  buildOrders   BuildOrder[]
  strategies    Strategy[]
  playerStats   PlayerStats?
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model BuildOrder {
  id          String            @id @default(cuid())
  title       String
  description String            @db.Text
  civilization String
  mapType     String[]
  isPublic    Boolean           @default(false)
  views       Int               @default(0)
  likes       Int               @default(0)
  authorId    String
  author      User              @relation(fields: [authorId], references: [id], onDelete: Cascade)
  steps       BuildOrderStep[]
  strategies  Strategy[]
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  @@index([authorId])
  @@index([isPublic])
}

model BuildOrderStep {
  id            String     @id @default(cuid())
  order         Int
  timeMinutes   Int
  timeSeconds   Int
  villagerCount Int
  action        String
  description   String     @db.Text
  resources     Json       // {wood, food, gold, stone}
  buildOrderId  String
  buildOrder    BuildOrder @relation(fields: [buildOrderId], references: [id], onDelete: Cascade)

  @@index([buildOrderId])
}

model Strategy {
  id           String       @id @default(cuid())
  title        String
  description  String       @db.Text
  civilization String
  counters     String[]
  isPublic     Boolean      @default(false)
  tags         String[]
  authorId     String
  author       User         @relation(fields: [authorId], references: [id], onDelete: Cascade)
  buildOrders  BuildOrder[]
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@index([authorId])
  @@index([isPublic])
}

model PlayerStats {
  id                   String   @id @default(cuid())
  userId               String   @unique
  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  steamId              String
  rating               Int      @default(0)
  wins                 Int      @default(0)
  losses               Int      @default(0)
  favoriteCivilization String?
  lastSynced           DateTime @default(now())
}

model GameData {
  id            String   @id @default(cuid())
  version       String   @unique
  civilizations Json
  units         Json
  buildings     Json
  technologies  Json
  lastUpdated   DateTime @default(now())
}
```

**Step 3: Create Prisma client singleton**

Create `lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Step 4: Generate Prisma client**

Run: `npx prisma generate`

Expected: Prisma client generated successfully

**Step 5: Commit schema setup**

Run:
```bash
git add prisma/schema.prisma lib/prisma.ts
git commit -m "feat: add Prisma schema with User, BuildOrder, and Strategy models"
```

Expected: Clean commit

---

## Task 3: Set Up NextAuth with Steam OAuth

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `types/next-auth.d.ts`

**Step 1: Install Steam OpenID dependency**

Run: `npm install openid`

Expected: openid package installed

**Step 2: Create NextAuth configuration**

Create `lib/auth.ts`:
```typescript
import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import SteamProvider from 'next-auth/providers/steam'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    SteamProvider({
      clientSecret: process.env.STEAM_API_KEY!,
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback/steam`,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { steamId: true },
        })
        session.user.steamId = dbUser?.steamId || null
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
```

**Step 3: Create NextAuth route handler**

Create `app/api/auth/[...nextauth]/route.ts`:
```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

**Step 4: Add TypeScript types for NextAuth**

Create `types/next-auth.d.ts`:
```typescript
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      steamId?: string | null
    }
  }
}
```

**Step 5: Update tsconfig.json**

Modify `tsconfig.json` to include types directory:
```json
{
  "compilerOptions": {
    // ... existing config
    "typeRoots": ["./node_modules/@types", "./types"]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", "types/**/*.ts"]
}
```

**Step 6: Commit authentication setup**

Run:
```bash
git add lib/auth.ts app/api/auth/[...nextauth]/route.ts types/next-auth.d.ts tsconfig.json
git commit -m "feat: add NextAuth with Steam OAuth provider"
```

Expected: Clean commit

---

## Task 4: Initialize shadcn/ui Components

**Files:**
- Create: `components.json`
- Create: `lib/utils.ts`
- Create: `components/ui/button.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/card.tsx`

**Step 1: Initialize shadcn/ui**

Run: `npx shadcn-ui@latest init`

Expected: Prompts for configuration

When prompted:
- Style: Default
- Base color: Slate
- CSS variables: Yes

**Step 2: Install base components**

Run: `npx shadcn-ui@latest add button input card label textarea select dropdown-menu`

Expected: Components added to `components/ui/`

**Step 3: Verify components installed**

Run: `ls components/ui/`

Expected: See `button.tsx`, `input.tsx`, `card.tsx`, etc.

**Step 4: Commit UI components**

Run:
```bash
git add components/ lib/utils.ts components.json
git commit -m "feat: initialize shadcn/ui with base components"
```

Expected: Clean commit

---

## Task 5: Create Home Page Layout

**Files:**
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `components/navbar.tsx`
- Create: `components/footer.tsx`

**Step 1: Create root layout with Navbar**

Replace `app/layout.tsx`:
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AoE2 Gameplan Maker',
  description: 'Create and share Age of Empires 2 build orders and strategies',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
```

**Step 2: Create Navbar component**

Create `components/navbar.tsx`:
```typescript
'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            AoE2 Gameplan
          </Link>
          <div className="hidden gap-4 md:flex">
            <Link href="/build-orders" className="text-sm hover:underline">
              Build Orders
            </Link>
            <Link href="/strategies" className="text-sm hover:underline">
              Strategies
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => signIn('steam')}>
              Sign In with Steam
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
```

**Step 3: Create Footer component**

Create `components/footer.tsx`:
```typescript
export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>AoE2 Gameplan Maker - Built for the Age of Empires 2 community</p>
      </div>
    </footer>
  )
}
```

**Step 4: Create home page**

Replace `app/page.tsx`:
```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="mb-6 text-5xl font-bold">
          Master Your AoE2 Build Orders
        </h1>
        <p className="mb-8 text-xl text-muted-foreground">
          Create, share, and follow interactive build orders and strategies for Age of Empires 2: Definitive Edition
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/build-orders">
            <Button size="lg">Browse Build Orders</Button>
          </Link>
          <Link href="/build-orders/new">
            <Button size="lg" variant="outline">
              Create Build Order
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-20 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Interactive Editor</CardTitle>
            <CardDescription>
              Create build orders with our drag-and-drop editor and automatic timing calculations
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Live Player Stats</CardTitle>
            <CardDescription>
              Connect your Steam account to sync your AoE2.net stats and get personalized recommendations
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Community Library</CardTitle>
            <CardDescription>
              Discover and share build orders with the global AoE2 community
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
```

**Step 5: Wrap app with SessionProvider**

Create `app/providers.tsx`:
```typescript
'use client'

import { SessionProvider } from 'next-auth/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

Update `app/layout.tsx` to wrap children with Providers:
```typescript
import { Providers } from './providers'

// ... in return statement
<body className={inter.className}>
  <Providers>
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  </Providers>
</body>
```

**Step 6: Test development server**

Run: `npm run dev`

Expected: Server starts on http://localhost:3000

Open browser to http://localhost:3000 and verify home page renders

**Step 7: Commit layout and home page**

Run:
```bash
git add app/ components/navbar.tsx components/footer.tsx
git commit -m "feat: add home page layout with navbar and footer"
```

Expected: Clean commit

---

## Task 6: Create Build Order API Routes

**Files:**
- Create: `app/api/build-orders/route.ts`
- Create: `app/api/build-orders/[id]/route.ts`
- Create: `lib/validations/build-order.ts`

**Step 1: Write failing test for GET /api/build-orders**

Create `__tests__/api/build-orders.test.ts`:
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'

describe('GET /api/build-orders', () => {
  beforeAll(async () => {
    // Clean up test data
    await prisma.buildOrder.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('returns empty array when no build orders exist', async () => {
    const res = await fetch('http://localhost:3000/api/build-orders')
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data).toEqual([])
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- __tests__/api/build-orders.test.ts`

Expected: FAIL with "fetch is not defined" or API route not found

**Step 3: Create Zod validation schemas**

Create `lib/validations/build-order.ts`:
```typescript
import { z } from 'zod'

export const buildOrderStepSchema = z.object({
  order: z.number().int().min(0),
  timeMinutes: z.number().int().min(0).max(60),
  timeSeconds: z.number().int().min(0).max(59),
  villagerCount: z.number().int().min(0).max(200),
  action: z.string().min(1).max(200),
  description: z.string().max(1000),
  resources: z.object({
    wood: z.number().int().min(0),
    food: z.number().int().min(0),
    gold: z.number().int().min(0),
    stone: z.number().int().min(0),
  }),
})

export const createBuildOrderSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(2000),
  civilization: z.string().min(1),
  mapType: z.array(z.string()),
  isPublic: z.boolean().default(false),
  steps: z.array(buildOrderStepSchema),
})

export const updateBuildOrderSchema = createBuildOrderSchema.partial()

export type CreateBuildOrderInput = z.infer<typeof createBuildOrderSchema>
export type UpdateBuildOrderInput = z.infer<typeof updateBuildOrderSchema>
```

**Step 4: Create GET /api/build-orders route**

Create `app/api/build-orders/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { createBuildOrderSchema } from '@/lib/validations/build-order'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const isPublic = searchParams.get('public') === 'true'
    const userId = searchParams.get('userId')

    const where: any = {}
    if (isPublic) {
      where.isPublic = true
    }
    if (userId) {
      where.authorId = userId
    }

    const buildOrders = await prisma.buildOrder.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        steps: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(buildOrders)
  } catch (error) {
    console.error('Error fetching build orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch build orders' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = createBuildOrderSchema.parse(body)

    const buildOrder = await prisma.buildOrder.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        civilization: validatedData.civilization,
        mapType: validatedData.mapType,
        isPublic: validatedData.isPublic,
        authorId: session.user.id,
        steps: {
          create: validatedData.steps,
        },
      },
      include: {
        steps: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    return NextResponse.json(buildOrder, { status: 201 })
  } catch (error) {
    console.error('Error creating build order:', error)
    return NextResponse.json(
      { error: 'Failed to create build order' },
      { status: 500 }
    )
  }
}
```

**Step 5: Create GET/PUT/DELETE /api/build-orders/[id] route**

Create `app/api/build-orders/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { updateBuildOrderSchema } from '@/lib/validations/build-order'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const buildOrder = await prisma.buildOrder.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        steps: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    if (!buildOrder) {
      return NextResponse.json(
        { error: 'Build order not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.buildOrder.update({
      where: { id: params.id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json(buildOrder)
  } catch (error) {
    console.error('Error fetching build order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch build order' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const buildOrder = await prisma.buildOrder.findUnique({
      where: { id: params.id },
    })

    if (!buildOrder) {
      return NextResponse.json(
        { error: 'Build order not found' },
        { status: 404 }
      )
    }

    if (buildOrder.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = updateBuildOrderSchema.parse(body)

    const updated = await prisma.buildOrder.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        steps: validatedData.steps
          ? {
              deleteMany: {},
              create: validatedData.steps,
            }
          : undefined,
      },
      include: {
        steps: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating build order:', error)
    return NextResponse.json(
      { error: 'Failed to update build order' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const buildOrder = await prisma.buildOrder.findUnique({
      where: { id: params.id },
    })

    if (!buildOrder) {
      return NextResponse.json(
        { error: 'Build order not found' },
        { status: 404 }
      )
    }

    if (buildOrder.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.buildOrder.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting build order:', error)
    return NextResponse.json(
      { error: 'Failed to delete build order' },
      { status: 500 }
    )
  }
}
```

**Step 6: Commit API routes**

Run:
```bash
git add app/api/build-orders/ lib/validations/
git commit -m "feat: add build order CRUD API routes with validation"
```

Expected: Clean commit

---

## Task 7: Create Build Order List Page

**Files:**
- Create: `app/build-orders/page.tsx`
- Create: `components/build-order-card.tsx`

**Step 1: Create build order list page**

Create `app/build-orders/page.tsx`:
```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { BuildOrderCard } from '@/components/build-order-card'

async function getBuildOrders() {
  const buildOrders = await prisma.buildOrder.findMany({
    where: { isPublic: true },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: { steps: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return buildOrders
}

export default async function BuildOrdersPage() {
  const buildOrders = await getBuildOrders()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Build Orders</h1>
          <p className="text-muted-foreground">
            Discover and follow community build orders
          </p>
        </div>
        <Link href="/build-orders/new">
          <Button>Create Build Order</Button>
        </Link>
      </div>

      {buildOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No build orders yet. Be the first to create one!
          </p>
          <Link href="/build-orders/new">
            <Button>Create Build Order</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {buildOrders.map((buildOrder) => (
            <BuildOrderCard key={buildOrder.id} buildOrder={buildOrder} />
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Create build order card component**

Create `components/build-order-card.tsx`:
```typescript
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, Heart } from 'lucide-react'

interface BuildOrderCardProps {
  buildOrder: {
    id: string
    title: string
    description: string
    civilization: string
    views: number
    likes: number
    author: {
      name: string | null
      image: string | null
    }
    _count?: {
      steps: number
    }
  }
}

export function BuildOrderCard({ buildOrder }: BuildOrderCardProps) {
  return (
    <Link href={`/build-orders/${buildOrder.id}`}>
      <Card className="h-full transition-shadow hover:shadow-lg">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="secondary">{buildOrder.civilization}</Badge>
            {buildOrder._count && (
              <span className="text-sm text-muted-foreground">
                {buildOrder._count.steps} steps
              </span>
            )}
          </div>
          <CardTitle>{buildOrder.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {buildOrder.description}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
          <span>by {buildOrder.author.name || 'Anonymous'}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {buildOrder.views}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {buildOrder.likes}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
```

**Step 3: Install lucide-react icons**

Run: `npm install lucide-react`

Expected: lucide-react installed

**Step 4: Add badge component**

Run: `npx shadcn-ui@latest add badge`

Expected: Badge component added

**Step 5: Test build orders page**

Run: `npm run dev`

Navigate to http://localhost:3000/build-orders

Expected: Page renders with "No build orders yet" message

**Step 6: Commit build order list page**

Run:
```bash
git add app/build-orders/page.tsx components/build-order-card.tsx package.json package-lock.json
git commit -m "feat: add build orders list page with card component"
```

Expected: Clean commit

---

## Task 8: Create Build Order Detail/View Page

**Files:**
- Create: `app/build-orders/[id]/page.tsx`
- Create: `components/build-order-viewer.tsx`

**Step 1: Create build order detail page**

Create `app/build-orders/[id]/page.tsx`:
```typescript
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BuildOrderViewer } from '@/components/build-order-viewer'
import { Badge } from '@/components/ui/badge'
import { Eye, Heart } from 'lucide-react'

async function getBuildOrder(id: string) {
  const buildOrder = await prisma.buildOrder.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      steps: {
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!buildOrder) {
    notFound()
  }

  return buildOrder
}

export default async function BuildOrderPage({
  params,
}: {
  params: { id: string }
}) {
  const buildOrder = await getBuildOrder(params.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <Badge variant="secondary" className="text-base">
            {buildOrder.civilization}
          </Badge>
          {buildOrder.mapType.map((map) => (
            <Badge key={map} variant="outline">
              {map}
            </Badge>
          ))}
        </div>
        <h1 className="mb-2 text-4xl font-bold">{buildOrder.title}</h1>
        <p className="mb-4 text-muted-foreground">{buildOrder.description}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>by {buildOrder.author.name || 'Anonymous'}</span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {buildOrder.views} views
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {buildOrder.likes} likes
          </span>
        </div>
      </div>

      <BuildOrderViewer steps={buildOrder.steps} />
    </div>
  )
}
```

**Step 2: Create build order viewer component**

Create `components/build-order-viewer.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'

interface BuildOrderStep {
  id: string
  order: number
  timeMinutes: number
  timeSeconds: number
  villagerCount: number
  action: string
  description: string
  resources: {
    wood: number
    food: number
    gold: number
    stone: number
  }
}

interface BuildOrderViewerProps {
  steps: BuildOrderStep[]
}

export function BuildOrderViewer({ steps }: BuildOrderViewerProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [timerMode, setTimerMode] = useState(false)

  const step = steps[currentStep]

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTimerMode(!timerMode)}
        >
          {timerMode ? (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Exit Timer Mode
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Timer Mode
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{step.action}</CardTitle>
            <div className="text-xl font-mono">
              {step.timeMinutes}:{step.timeSeconds.toString().padStart(2, '0')}
            </div>
          </div>
          <div className="text-muted-foreground">
            Villagers: {step.villagerCount}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>{step.description}</p>

          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-lg border p-3">
              <div className="text-sm text-muted-foreground">Wood</div>
              <div className="text-2xl font-bold">{step.resources.wood}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm text-muted-foreground">Food</div>
              <div className="text-2xl font-bold">{step.resources.food}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm text-muted-foreground">Gold</div>
              <div className="text-2xl font-bold">{step.resources.gold}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm text-muted-foreground">Stone</div>
              <div className="text-2xl font-bold">{step.resources.stone}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="mb-3 font-semibold">All Steps</h3>
        <div className="space-y-2">
          {steps.map((s, index) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(index)}
              className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted ${
                index === currentStep ? 'border-primary bg-muted' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{s.action}</span>
                <span className="text-sm text-muted-foreground">
                  {s.timeMinutes}:{s.timeSeconds.toString().padStart(2, '0')}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Test build order viewer**

Run: `npm run dev`

Expected: Development server running

**Step 4: Commit build order viewer**

Run:
```bash
git add app/build-orders/[id]/ components/build-order-viewer.tsx
git commit -m "feat: add build order detail page with interactive viewer"
```

Expected: Clean commit

---

## Task 9: Create Build Order Editor/New Page

**Files:**
- Create: `app/build-orders/new/page.tsx`
- Create: `components/build-order-form.tsx`

**Step 1: Create new build order page**

Create `app/build-orders/new/page.tsx`:
```typescript
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { BuildOrderForm } from '@/components/build-order-form'

export default async function NewBuildOrderPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/api/auth/signin')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Create Build Order</h1>
        <p className="text-muted-foreground">
          Design your perfect Age of Empires 2 build order
        </p>
      </div>

      <BuildOrderForm />
    </div>
  )
}
```

**Step 2: Create build order form component (Part 1 - Setup)**

Create `components/build-order-form.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import { createBuildOrderSchema, CreateBuildOrderInput } from '@/lib/validations/build-order'

const civilizations = [
  'Aztecs', 'Berbers', 'Britons', 'Bulgarians', 'Burmese', 'Byzantines',
  'Celts', 'Chinese', 'Cumans', 'Ethiopians', 'Franks', 'Goths',
  'Huns', 'Incas', 'Indians', 'Italians', 'Japanese', 'Khmer',
  'Koreans', 'Lithuanians', 'Magyars', 'Malay', 'Malians', 'Mayans',
  'Mongols', 'Persians', 'Portuguese', 'Saracens', 'Slavs', 'Spanish',
  'Tatars', 'Teutons', 'Turks', 'Vietnamese', 'Vikings'
]

const mapTypes = ['Arabia', 'Arena', 'Black Forest', 'Nomad', 'Islands']

export function BuildOrderForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBuildOrderInput>({
    resolver: zodResolver(createBuildOrderSchema),
    defaultValues: {
      title: '',
      description: '',
      civilization: 'Britons',
      mapType: ['Arabia'],
      isPublic: false,
      steps: [
        {
          order: 0,
          timeMinutes: 0,
          timeSeconds: 0,
          villagerCount: 3,
          action: 'Build houses and scout',
          description: 'Send 3 starting villagers to sheep, build 2 houses, scout for resources',
          resources: { wood: 200, food: 0, gold: 0, stone: 0 },
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'steps',
  })

  const onSubmit = async (data: CreateBuildOrderInput) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/build-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        throw new Error('Failed to create build order')
      }

      const buildOrder = await res.json()
      router.push(`/build-orders/${buildOrder.id}`)
    } catch (error) {
      console.error(error)
      alert('Failed to create build order')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., 22 Pop Scouts into Archers"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your build order strategy..."
              rows={4}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="civilization">Civilization</Label>
            <select
              id="civilization"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              {...register('civilization')}
            >
              {civilizations.map((civ) => (
                <option key={civ} value={civ}>
                  {civ}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Map Types</Label>
            <div className="space-y-2">
              {mapTypes.map((map) => (
                <label key={map} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={map}
                    {...register('mapType')}
                  />
                  {map}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              {...register('isPublic')}
            />
            <Label htmlFor="isPublic">Make public (visible to everyone)</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Build Order Steps</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  order: fields.length,
                  timeMinutes: 0,
                  timeSeconds: 0,
                  villagerCount: 0,
                  action: '',
                  description: '',
                  resources: { wood: 0, food: 0, gold: 0, stone: 0 },
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Step
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-semibold">Step {index + 1}</h4>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Time (minutes)</Label>
                      <Input
                        type="number"
                        {...register(`steps.${index}.timeMinutes` as const, {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                    <div>
                      <Label>Time (seconds)</Label>
                      <Input
                        type="number"
                        {...register(`steps.${index}.timeSeconds` as const, {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Villager Count</Label>
                    <Input
                      type="number"
                      {...register(`steps.${index}.villagerCount` as const, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>

                  <div>
                    <Label>Action</Label>
                    <Input
                      placeholder="e.g., Build Lumber Camp"
                      {...register(`steps.${index}.action` as const)}
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Detailed instructions..."
                      rows={3}
                      {...register(`steps.${index}.description` as const)}
                    />
                  </div>

                  <div>
                    <Label>Resources</Label>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs">Wood</Label>
                        <Input
                          type="number"
                          {...register(`steps.${index}.resources.wood` as const, {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Food</Label>
                        <Input
                          type="number"
                          {...register(`steps.${index}.resources.food` as const, {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Gold</Label>
                        <Input
                          type="number"
                          {...register(`steps.${index}.resources.gold` as const, {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Stone</Label>
                        <Input
                          type="number"
                          {...register(`steps.${index}.resources.stone` as const, {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Build Order'}
        </Button>
      </div>
    </form>
  )
}
```

**Step 3: Install required dependencies**

Run: `npx shadcn-ui@latest add label textarea select`

Expected: Components added

**Step 4: Test build order form**

Run: `npm run dev`

Navigate to http://localhost:3000/build-orders/new

Expected: Form renders with all fields

**Step 5: Commit build order form**

Run:
```bash
git add app/build-orders/new/ components/build-order-form.tsx components/ui/
git commit -m "feat: add build order creation form with step builder"
```

Expected: Clean commit

---

## Task 10: Set Up Database and Run Migrations

**Files:**
- No new files (database setup)

**Step 1: Ensure PostgreSQL is running**

Run: `pg_isready` or check Coolify PostgreSQL service status

Expected: PostgreSQL is accessible

**Step 2: Update .env.local with database URL**

Manually update `.env.local`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/aoe2gameplan"
```

Replace with your actual database credentials

**Step 3: Create database migration**

Run: `npx prisma migrate dev --name init`

Expected: Migration created and applied successfully

**Step 4: Verify database tables**

Run: `npx prisma studio`

Expected: Prisma Studio opens in browser, shows all tables

**Step 5: Generate Prisma Client**

Run: `npx prisma generate`

Expected: Prisma Client generated

**Step 6: Seed database with sample data (optional)**

Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a test user
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
    },
  })

  // Create a sample build order
  await prisma.buildOrder.create({
    data: {
      title: '22 Pop Scouts',
      description: 'Fast scouts rush build order for Arabia',
      civilization: 'Mongols',
      mapType: ['Arabia'],
      isPublic: true,
      authorId: user.id,
      steps: {
        create: [
          {
            order: 0,
            timeMinutes: 0,
            timeSeconds: 0,
            villagerCount: 3,
            action: 'Initial setup',
            description: '3 villagers to sheep, build 2 houses',
            resources: { wood: 200, food: 0, gold: 0, stone: 0 },
          },
          {
            order: 1,
            timeMinutes: 1,
            timeSeconds: 30,
            villagerCount: 6,
            action: 'Build Barracks',
            description: 'Send 3 villagers to wood, build barracks',
            resources: { wood: 175, food: 150, gold: 0, stone: 0 },
          },
        ],
      },
    },
  })

  console.log('Database seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Add to `package.json`:
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

Run: `npm install -D ts-node && npx prisma db seed`

Expected: Sample data created

**Step 7: Verify application works end-to-end**

Run: `npm run dev`

Navigate to http://localhost:3000/build-orders

Expected: Sample build order appears in list

**Step 8: Commit database setup**

Run:
```bash
git add prisma/ package.json
git commit -m "feat: add database migrations and seed data"
```

Expected: Clean commit

---

## Task 11: Create Docker Configuration for Deployment

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `.dockerignore`

**Step 1: Create Dockerfile**

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

**Step 2: Update next.config.ts for standalone output**

Modify `next.config.ts`:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
};

export default nextConfig;
```

**Step 3: Create .dockerignore**

Create `.dockerignore`:
```
node_modules
.next
.git
.env.local
.env
*.md
.vscode
.idea
dist
build
coverage
```

**Step 4: Create docker-compose.yml for local testing**

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: aoe2user
      POSTGRES_PASSWORD: aoe2password
      POSTGRES_DB: aoe2gameplan
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "postgresql://aoe2user:aoe2password@postgres:5432/aoe2gameplan"
      NEXTAUTH_SECRET: "your-secret-change-in-production"
      NEXTAUTH_URL: "http://localhost:3000"
    depends_on:
      - postgres
    command: sh -c "npx prisma migrate deploy && node server.js"

volumes:
  postgres_data:
```

**Step 5: Test Docker build**

Run: `docker build -t aoe2gameplan .`

Expected: Docker image builds successfully

**Step 6: Create Coolify deployment README**

Create `DEPLOYMENT.md`:
```markdown
# Deployment to Coolify

## Prerequisites
- Coolify instance with PostgreSQL service
- Steam API key

## Steps

1. **Create PostgreSQL Database in Coolify**
   - Service name: `aoe2-postgres`
   - Database: `aoe2gameplan`
   - Note the connection URL

2. **Create Application in Coolify**
   - Type: Docker
   - Repository: (your git repo URL)
   - Build method: Dockerfile
   - Port: 3000

3. **Set Environment Variables**
   ```
   DATABASE_URL=postgresql://user:password@aoe2-postgres:5432/aoe2gameplan
   NEXTAUTH_SECRET=(generate with: openssl rand -base64 32)
   NEXTAUTH_URL=https://your-domain.com
   STEAM_API_KEY=your_steam_api_key
   ```

4. **Deploy**
   - Coolify will build and deploy automatically
   - Run migrations: `npx prisma migrate deploy`
   - Verify deployment at your domain

## Post-Deployment

- Test authentication with Steam
- Create a test build order
- Verify public build orders are visible

## Troubleshooting

- Check logs: Coolify dashboard → Application → Logs
- Database connection: Verify DATABASE_URL is correct
- Prisma Client: Ensure `npx prisma generate` ran during build
```

**Step 7: Commit Docker configuration**

Run:
```bash
git add Dockerfile docker-compose.yml .dockerignore DEPLOYMENT.md next.config.ts
git commit -m "feat: add Docker configuration and deployment docs"
```

Expected: Clean commit

---

## Task 12: Add Environment Variable Validation

**Files:**
- Create: `lib/env.ts`

**Step 1: Install zod for validation**

Already installed from Task 1

**Step 2: Create environment validation**

Create `lib/env.ts`:
```typescript
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  STEAM_API_KEY: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  STEAM_API_KEY: process.env.STEAM_API_KEY,
  NODE_ENV: process.env.NODE_ENV,
})
```

**Step 3: Use env validation in auth config**

Update `lib/auth.ts` to import from `lib/env.ts`:
```typescript
import { env } from '@/lib/env'

// Replace process.env references with env
export const authOptions: NextAuthOptions = {
  // ...
  providers: [
    SteamProvider({
      clientSecret: env.STEAM_API_KEY || '',
      // ...
    }),
  ],
  secret: env.NEXTAUTH_SECRET,
}
```

**Step 4: Test environment validation**

Run: `npm run dev`

Expected: If env vars missing, clear error message

**Step 5: Commit environment validation**

Run:
```bash
git add lib/env.ts lib/auth.ts
git commit -m "feat: add environment variable validation with Zod"
```

Expected: Clean commit

---

## Task 13: Add README and Documentation

**Files:**
- Create: `README.md`
- Update: `.env.local.example`

**Step 1: Create comprehensive README**

Create `README.md`:
```markdown
# AoE2 Gameplan Maker

An interactive web application for creating, sharing, and following Age of Empires 2: Definitive Edition build orders and strategies.

## Features

- 🏗️ **Interactive Build Order Creator** - Design build orders with step-by-step timing and resource tracking
- 👀 **Build Order Viewer** - Follow build orders with timer mode and step navigation
- 🔐 **Steam Authentication** - Sign in with your Steam account
- 📚 **Community Library** - Browse and share public build orders
- 📊 **Player Stats Integration** (Coming Soon) - Sync your AoE2.net stats
- 🎯 **Strategy Library** (Coming Soon) - Link build orders into comprehensive strategies

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Steam OAuth
- **UI**: TailwindCSS + shadcn/ui
- **Validation**: Zod
- **Deployment**: Docker + Coolify

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Steam API Key (optional, for authentication)

### Installation

1. Clone the repository
   ```bash
   git clone <your-repo-url>
   cd aoe2gameplan
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` with your database credentials and API keys

4. Set up database
   ```bash
   npx prisma migrate dev
   npx prisma db seed  # Optional: add sample data
   ```

5. Run development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Development

### Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio (GUI for database)
npx prisma studio
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- path/to/test.test.ts
```

### Build

```bash
npm run build
npm start
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions using Coolify.

### Quick Deploy with Docker

```bash
docker build -t aoe2gameplan .
docker run -p 3000:3000 --env-file .env.local aoe2gameplan
```

## Project Structure

```
aoe2gameplan/
├── app/                      # Next.js app router pages
│   ├── api/                  # API routes
│   ├── build-orders/         # Build order pages
│   └── layout.tsx            # Root layout
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   ├── navbar.tsx
│   └── build-order-form.tsx
├── lib/                      # Utility functions
│   ├── prisma.ts             # Prisma client
│   ├── auth.ts               # NextAuth config
│   └── validations/          # Zod schemas
├── prisma/                   # Database schema and migrations
│   ├── schema.prisma
│   └── seed.ts
├── docs/                     # Documentation
│   └── plans/                # Design and implementation plans
└── public/                   # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [x] Phase 1: MVP (Build order CRUD, viewer, basic editor)
- [ ] Phase 2: Data Integration (AoE2.net API, player stats)
- [ ] Phase 3: Interactive Features (Drag-and-drop, resource calculations)
- [ ] Phase 4: Community Features (Strategies, search, ratings)
- [ ] Phase 5: Polish (Mobile optimization, performance tuning)

## License

MIT

## Acknowledgments

- Age of Empires 2 community
- [AoE2.net](https://aoe2.net) for player statistics API
- [Siege Engineers](https://github.com/SiegeEngineers) for game data
```

**Step 2: Update .env.local.example with better documentation**

Update `.env.local.example`:
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/aoe2gameplan"

# NextAuth
# Generate secret: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-here-min-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# Steam API (Optional)
# Get your Steam API key: https://steamcommunity.com/dev/apikey
STEAM_API_KEY="your_steam_api_key_here"

# Node Environment
NODE_ENV="development"
```

**Step 3: Commit README**

Run:
```bash
git add README.md .env.local.example
git commit -m "docs: add comprehensive README and env documentation"
```

Expected: Clean commit

---

## Task 14: Final Testing and Verification

**Files:**
- No new files (testing only)

**Step 1: Clean install test**

Run:
```bash
rm -rf node_modules .next
npm install
npm run build
```

Expected: Build completes without errors

**Step 2: Run development server**

Run: `npm run dev`

Expected: Server starts successfully at http://localhost:3000

**Step 3: Test user flows manually**

Navigate through:
1. Home page → Should render with features
2. Build Orders list → Should show sample build order (if seeded)
3. Build Order detail → Should show steps with viewer
4. Create Build Order → Should require login
5. Sign in → Should redirect to Steam (or show error if STEAM_API_KEY not set)

**Step 4: Verify database schema**

Run: `npx prisma studio`

Expected: All tables visible with correct relationships

**Step 5: Test Docker build**

Run: `docker build -t aoe2gameplan-test .`

Expected: Docker build succeeds

**Step 6: Create git tag for v1.0.0**

Run:
```bash
git tag -a v1.0.0 -m "MVP Release - Build order creator and viewer"
git push origin v1.0.0
```

Expected: Tag created

---

## Next Steps After MVP

Once this plan is complete, the MVP is ready for deployment. Here are the immediate next steps:

1. **Deploy to Coolify**
   - Follow DEPLOYMENT.md
   - Set up PostgreSQL service
   - Configure environment variables
   - Deploy application
   - Run migrations

2. **Phase 2: Data Integration**
   - Integrate AoE2.net API client
   - Build player stats sync system
   - Fetch and cache game data (civilizations, units)
   - Add background jobs for data refresh

3. **Phase 3: Interactive Features**
   - Implement drag-and-drop for build order steps
   - Add resource calculation engine
   - Build timing validation system
   - Create template library

4. **Phase 4: Community Features**
   - Strategy creation and linking
   - Search and filtering system
   - Like/bookmark functionality
   - User profiles and leaderboards

5. **Phase 5: Polish**
   - Mobile responsiveness optimization
   - Performance tuning
   - User testing with AoE2 community
   - Bug fixes and refinements

---

## Success Criteria

This MVP is complete when:

- ✅ User can sign in with Steam
- ✅ User can create a build order with multiple steps
- ✅ Build order is saved to database
- ✅ Public build orders appear in list
- ✅ Build order detail page shows all steps
- ✅ Interactive viewer allows step navigation
- ✅ Application deploys to Coolify successfully
- ✅ All git commits are clean and atomic
- ✅ README and deployment docs are complete

---

**Total estimated time: 16-20 hours for experienced developer**

**Recommended execution: Use superpowers:subagent-driven-development for task-by-task implementation with code review between tasks**
