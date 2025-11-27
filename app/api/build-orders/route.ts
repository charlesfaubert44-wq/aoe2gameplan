import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { createBuildOrderSchema } from '@/lib/validations/build-order'

// Disable static optimization for this route
export const dynamic = 'force-dynamic'

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
