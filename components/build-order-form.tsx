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
