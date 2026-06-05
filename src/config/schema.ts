import { z } from 'zod'

export const TriggerSpecSchema = z.object({
  type: z.enum(['tool', 'message', 'state']),
  pattern: z.string(),
  count: z.number().optional(),
  requireSource: z.boolean().optional(),
})

export const StructuralCouplingContractSchema = z.object({
  id: z.string().min(1),
  mode: z.enum(['BLOCK', 'WARN']),
  description: z.string(),
  anchorRefs: z.array(z.string()).optional(),
  triggers: z.array(TriggerSpecSchema).min(1),
  maxOverrides: z.number().default(3),
})

export const ConfigSchema = z.object({
  version: z.string().default('1'),
  profiles: z.array(z.string()).optional(),
  roleProfiles: z.record(z.array(z.string())).optional(),
  contracts: z.array(StructuralCouplingContractSchema),
  presets: z.record(z.array(z.string())).optional(),
  settings: z.object({
    maxOverrides: z.number().default(3),
    stepConfirmationInterval: z.number().default(3),
  }).default({}),
})

export type StructuralCouplingContract = z.infer<typeof StructuralCouplingContractSchema>
export type TriggerSpec = z.infer<typeof TriggerSpecSchema>
export type Config = z.infer<typeof ConfigSchema>
