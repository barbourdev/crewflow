import type {
  AGENT_STATUS,
  RUN_STATUS,
  STEP_EXECUTION,
  SKILL_TYPE,
  AI_PROVIDER,
  SUPPORTED_LOCALES,
} from './constants'

export type AgentStatus = (typeof AGENT_STATUS)[keyof typeof AGENT_STATUS]
export type RunStatus = (typeof RUN_STATUS)[keyof typeof RUN_STATUS]
export type StepExecution = (typeof STEP_EXECUTION)[keyof typeof STEP_EXECUTION]
export type SkillType = (typeof SKILL_TYPE)[keyof typeof SKILL_TYPE]
export type AIProvider = (typeof AI_PROVIDER)[keyof typeof AI_PROVIDER]
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export interface AgentPersona {
  role: string
  identity: string
  communicationStyle: string
  principles: string[]
}

export interface AgentVoiceGuidance {
  alwaysUse: string[]
  neverUse: string[]
  toneRules: string[]
}

export interface AgentDefinition {
  id: string
  name: string
  icon: string
  role: string
  persona: AgentPersona
  voiceGuidance?: AgentVoiceGuidance
  operationalFramework?: string
  outputExamples?: string[]
  antiPatterns?: string[]
  qualityCriteria?: string[]
  skills: string[]
  position: { col: number; row: number }
}

export interface StepDefinition {
  id: string
  agentId: string
  order: number
  label: string
  execution: StepExecution
  inputConfig?: Record<string, unknown>
  outputConfig?: Record<string, unknown>
  vetoConditions?: string[]
  format?: string
  onReject?: string
}

export interface PipelineDefinition {
  id: string
  squadId: string
  steps: StepDefinition[]
}

export interface SquadConfig {
  agents: AgentDefinition[]
  pipeline: PipelineDefinition
}

export interface RunMetrics {
  totalTokens: number
  totalCost: number
  durationMs: number
}

export interface WebSocketEvent<T = unknown> {
  type: string
  payload: T
}
