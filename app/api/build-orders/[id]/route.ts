import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { updateBuildOrderSchema } from '@/lib/validations/build-order'

// Disable static optimization for this route
export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const buildOrder = await prisma.buildOrder.findUnique({
      where: { id },
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
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const buildOrder = await prisma.buildOrder.findUnique({
      where: { id },
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
      where: { id },
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
