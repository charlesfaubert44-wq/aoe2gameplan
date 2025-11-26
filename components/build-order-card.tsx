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
