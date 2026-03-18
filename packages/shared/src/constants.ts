export const APP_NAME = 'CrewFlow'
export const APP_VERSION = '0.1.0'
export const DEFAULT_PORT = 3000

export const AGENT_STATUS = {
  IDLE: 'idle',
  WORKING: 'working',
  DELIVERING: 'delivering',
  DONE: 'done',
  ERROR: 'error',
} as const

export const RUN_STATUS = {
  QUEUED: 'queued',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const

export const STEP_EXECUTION = {
  INLINE: 'inline',
  SUBAGENT: 'subagent',
  CHECKPOINT: 'checkpoint',
} as const

export const SKILL_TYPE = {
  MCP: 'mcp',
  SCRIPT: 'script',
  PROMPT: 'prompt',
  HYBRID: 'hybrid',
} as const

export const AI_PROVIDER = {
  ANTHROPIC: 'anthropic',
  OPENAI: 'openai',
} as const

export const SUPPORTED_LOCALES = ['pt-BR', 'en', 'es'] as const
export const DEFAULT_LOCALE = 'pt-BR' as const
