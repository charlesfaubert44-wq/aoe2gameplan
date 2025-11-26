import { NextRequest } from 'next/server'
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export async function GET(req: NextRequest) {
  return await handler(req, {} as any)
}

export async function POST(req: NextRequest) {
  return await handler(req, {} as any)
}
