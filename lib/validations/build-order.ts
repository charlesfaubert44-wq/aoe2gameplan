import { z } from 'zod'

export const buildOrderStepSchema = z.object({
  order: z.number().int().min(0),
  timeMinutes: z.number().int().min(0).max(60),
  timeSeconds: z.number().int().min(0).max(59),
  villagerCount: z.number().int().min(0).max(200),
  action: z.string().min(1).max(200),
  description: z.string().max(1000),
  resources: z.object({
    wood: z.number().int().min(0),
    food: z.number().int().min(0),
    gold: z.number().int().min(0),
    stone: z.number().int().min(0),
  }),
})

export const createBuildOrderSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(2000),
  civilization: z.string().min(1),
  mapType: z.array(z.string()),
  isPublic: z.boolean().default(false),
  steps: z.array(buildOrderStepSchema),
})

export const updateBuildOrderSchema = createBuildOrderSchema.partial()

export type CreateBuildOrderInput = z.infer<typeof createBuildOrderSchema>
export type UpdateBuildOrderInput = z.infer<typeof updateBuildOrderSchema>
