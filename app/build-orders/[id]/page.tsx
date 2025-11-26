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
