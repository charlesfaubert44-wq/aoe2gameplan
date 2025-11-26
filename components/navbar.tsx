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
