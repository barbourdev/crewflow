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

export interface TaskDefinition {
  id: string
  agentId: string
  name: string
  description: string
  order: number
  skills: string[]
  inputSource?: string
  outputTarget?: string
  objective?: string
  process?: string
  outputFormat?: string
  outputExample?: string
  qualityCriteria: string[]
  vetoConditions: string[]
}

export interface AgentDefinition {
  id: string
  name: string
  title?: string
  icon: string
  role: string
  execution: 'inline' | 'subagent'
  persona: AgentPersona
  voiceGuidance?: AgentVoiceGuidance
  principles?: string
  operationalFramework?: string
  outputExamples?: string[]
  antiPatterns?: string[]
  qualityCriteria?: string[]
  integration?: { readsFrom: string[]; writesTo: string[] }
  skills: string[]
  tasks: TaskDefinition[]
  position: { col: number; row: number }
}

export interface StepDefinition {
  id: string
  agentId: string
  order: number
  label: string
  execution: StepExecution
  instructions?: string
  contextLoading?: string[]
  outputExample?: string
  formatRef?: string
  skillRefs?: string[]
  modelTier?: string
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
