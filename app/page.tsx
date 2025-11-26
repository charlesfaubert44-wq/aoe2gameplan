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
