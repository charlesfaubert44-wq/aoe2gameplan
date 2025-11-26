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
