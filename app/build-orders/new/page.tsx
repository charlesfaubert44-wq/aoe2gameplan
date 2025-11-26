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
