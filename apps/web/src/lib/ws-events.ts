// ============================================================================
// WebSocket Event Types
// ============================================================================

// Server → Client
export const WS_EVENTS = {
  // Run lifecycle
  RUN_STATUS: 'run:status',
  RUN_METRICS: 'run:metrics',
  RUN_COMPLETE: 'run:complete',
  RUN_ERROR: 'run:error',

  // Step lifecycle
  STEP_START: 'step:start',
  STEP_OUTPUT: 'step:output',
  STEP_COMPLETE: 'step:complete',
  STEP_ERROR: 'step:error',

  // Agent status
  AGENT_STATUS: 'agent:status',

  // Handoff
  HANDOFF_START: 'handoff:start',
  HANDOFF_END: 'handoff:end',

  // Checkpoint
  CHECKPOINT_REQUEST: 'checkpoint:request',
  CHECKPOINT_RESPONSE: 'checkpoint:response',

  // Connection
  CONNECTED: 'connected',
  ERROR: 'error',
} as const

// Client → Server
export const WS_CLIENT_EVENTS = {
  SUBSCRIBE_RUN: 'subscribe:run',
  UNSUBSCRIBE_RUN: 'unsubscribe:run',
  CHECKPOINT_RESPONSE: 'checkpoint:response',
  RUN_PAUSE: 'run:pause',
  RUN_RESUME: 'run:resume',
  RUN_CANCEL: 'run:cancel',
} as const

// ============================================================================
// Event Payloads
// ============================================================================

export interface RunStatusPayload {
  runId: string
  status: string
  stepIndex?: number
  totalSteps?: number
}

export interface StepStartPayload {
  runId: string
  stepId: string
  runStepId: string
  agentName: string
  agentIcon: string
  label: string
  stepIndex: number
  totalSteps: number
}

export interface StepOutputPayload {
  runId: string
  runStepId: string
  chunk: string
}

export interface StepCompletePayload {
  runId: string
  runStepId: string
  output: string
  tokensUsed: number
  cost: number
  durationMs: number
}

export interface StepErrorPayload {
  runId: string
  runStepId: string
  error: string
}

export interface AgentStatusPayload {
  runId: string
  agentId: string
  agentName: string
  status: string
}

export interface HandoffPayload {
  runId: string
  fromAgent: { id: string; name: string; icon: string }
  toAgent: { id: string; name: string; icon: string }
  summary: string
}

export interface CheckpointRequestPayload {
  runId: string
  runStepId: string
  stepLabel: string
  previousOutput: string
}

export interface CheckpointResponsePayload {
  runId: string
  runStepId: string
  action: 'approve' | 'adjust' | 'redo'
  feedback?: string
}

export interface RunMetricsPayload {
  runId: string
  totalTokens: number
  totalCost: number
  elapsedMs: number
  estimatedRemainingMs?: number
}

export interface RunCompletePayload {
  runId: string
  status: 'completed' | 'failed' | 'cancelled'
  totalTokens: number
  totalCost: number
  durationMs: number
  finalOutput?: string
}

export interface WSMessage<T = unknown> {
  event: string
  payload: T
}
