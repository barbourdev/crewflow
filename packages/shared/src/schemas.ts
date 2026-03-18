import { z } from 'zod'
import { AGENT_STATUS, RUN_STATUS, STEP_EXECUTION, SKILL_TYPE, AI_PROVIDER } from './constants'

export const agentStatusSchema = z.enum([
  AGENT_STATUS.IDLE,
  AGENT_STATUS.WORKING,
  AGENT_STATUS.DELIVERING,
  AGENT_STATUS.DONE,
  AGENT_STATUS.ERROR,
])

export const runStatusSchema = z.enum([
  RUN_STATUS.QUEUED,
  RUN_STATUS.RUNNING,
  RUN_STATUS.PAUSED,
  RUN_STATUS.COMPLETED,
  RUN_STATUS.FAILED,
])

export const stepExecutionSchema = z.enum([
  STEP_EXECUTION.INLINE,
  STEP_EXECUTION.SUBAGENT,
  STEP_EXECUTION.CHECKPOINT,
])

export const skillTypeSchema = z.enum([
  SKILL_TYPE.MCP,
  SKILL_TYPE.SCRIPT,
  SKILL_TYPE.PROMPT,
  SKILL_TYPE.HYBRID,
])

export const aiProviderSchema = z.enum([AI_PROVIDER.ANTHROPIC, AI_PROVIDER.OPENAI])

export const createSquadSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  icon: z.string().max(10).optional(),
})

export const updateSquadSchema = createSquadSchema.partial()

export const createRunSchema = z.object({
  squadId: z.string(),
  input: z.record(z.unknown()).optional(),
})

export const checkpointResponseSchema = z.object({
  runId: z.string(),
  stepId: z.string(),
  action: z.enum(['approve', 'adjust', 'redo']),
  feedback: z.string().optional(),
})

export const updateSettingsSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  language: z.enum(['pt-BR', 'en', 'es']).optional(),
  currency: z.enum(['BRL', 'USD', 'EUR']).optional(),
  anthropicApiKey: z.string().optional(),
  openaiApiKey: z.string().optional(),
})

export const validateApiKeySchema = z.object({
  provider: aiProviderSchema,
  apiKey: z.string().min(1),
})
