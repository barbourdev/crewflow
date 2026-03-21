import { WebSocketServer, WebSocket } from 'ws'
import type { IncomingMessage } from 'http'
import type { WSMessage, CheckpointResponsePayload, HumanInputResponsePayload, ReviewRejectResponsePayload } from './ws-events'
import { WS_EVENTS, WS_CLIENT_EVENTS } from './ws-events'

// ============================================================================
// WebSocket Server Singleton
// ============================================================================

interface ConnectedClient {
  ws: WebSocket
  subscribedRuns: Set<string>
}

class CrewFlowWSServer {
  private wss: WebSocketServer | null = null
  private clients: Map<string, ConnectedClient> = new Map()
  private checkpointResolvers: Map<string, (response: CheckpointResponsePayload) => void> = new Map()
  private humanInputResolvers: Map<string, (response: HumanInputResponsePayload) => void> = new Map()
  private reviewRejectResolvers: Map<string, (response: ReviewRejectResponsePayload) => void> = new Map()
  private pendingCheckpoints: Map<string, WSMessage> = new Map()
  private pendingHumanInputs: Map<string, WSMessage> = new Map()
  private pendingReviewRejects: Map<string, WSMessage> = new Map()
  private clientIdCounter = 0

  initialize(server: import('http').Server) {
    if (this.wss) return

    this.wss = new WebSocketServer({ server, path: '/ws' })

    this.wss.on('connection', (ws: WebSocket, _req: IncomingMessage) => {
      const clientId = `client_${++this.clientIdCounter}`
      this.clients.set(clientId, { ws, subscribedRuns: new Set() })
      console.log(`🔌 WS client connected: ${clientId} (total: ${this.clients.size})`)

      this.sendTo(ws, { event: WS_EVENTS.CONNECTED, payload: { clientId } })

      ws.on('message', (raw) => {
        try {
          const message = JSON.parse(raw.toString()) as WSMessage
          this.handleClientMessage(clientId, message)
        } catch {
          this.sendTo(ws, {
            event: WS_EVENTS.ERROR,
            payload: { message: 'Invalid message format' },
          })
        }
      })

      ws.on('close', () => {
        this.clients.delete(clientId)
      })

      ws.on('error', () => {
        this.clients.delete(clientId)
      })
    })

    console.log('🔌 WebSocket server initialized on /ws')
  }

  // ==========================================================================
  // Client Message Handling
  // ==========================================================================

  private handleClientMessage(clientId: string, message: WSMessage) {
    const client = this.clients.get(clientId)
    if (!client) return

    switch (message.event) {
      case WS_CLIENT_EVENTS.SUBSCRIBE_RUN: {
        const { runId } = message.payload as { runId: string }
        client.subscribedRuns.add(runId)
        // Enviar checkpoint pendente se existir
        // Enviar pendentes ao novo subscriber
        for (const pending of [this.pendingCheckpoints, this.pendingHumanInputs, this.pendingReviewRejects]) {
          const msg = pending.get(runId)
          if (msg && client.ws.readyState === WebSocket.OPEN) {
            console.log(`[WS] Resending pending ${msg.event} to client subscribing to ${runId}`)
            this.sendTo(client.ws, msg)
          }
        }
        break
      }
      case WS_CLIENT_EVENTS.UNSUBSCRIBE_RUN: {
        const { runId } = message.payload as { runId: string }
        client.subscribedRuns.delete(runId)
        break
      }
      case WS_CLIENT_EVENTS.CHECKPOINT_RESPONSE: {
        const payload = message.payload as CheckpointResponsePayload
        this.pendingCheckpoints.delete(payload.runId)
        const resolver = this.checkpointResolvers.get(payload.runStepId)
        if (resolver) {
          resolver(payload)
          this.checkpointResolvers.delete(payload.runStepId)
        }
        break
      }
      case WS_CLIENT_EVENTS.HUMAN_INPUT_RESPONSE: {
        const payload = message.payload as HumanInputResponsePayload
        this.pendingHumanInputs.delete(payload.runId)
        const resolver = this.humanInputResolvers.get(payload.runStepId)
        if (resolver) {
          resolver(payload)
          this.humanInputResolvers.delete(payload.runStepId)
        }
        break
      }
      case WS_CLIENT_EVENTS.REVIEW_REJECT_RESPONSE: {
        const payload = message.payload as ReviewRejectResponsePayload
        this.pendingReviewRejects.delete(payload.runId)
        const resolver = this.reviewRejectResolvers.get(payload.runStepId)
        if (resolver) {
          resolver(payload)
          this.reviewRejectResolvers.delete(payload.runStepId)
        }
        break
      }
    }
  }

  // ==========================================================================
  // Broadcasting
  // ==========================================================================

  broadcastToRun(runId: string, message: WSMessage) {
    for (const client of this.clients.values()) {
      if (client.subscribedRuns.has(runId) && client.ws.readyState === WebSocket.OPEN) {
        this.sendTo(client.ws, message)
      }
    }
  }

  broadcastToAll(message: WSMessage) {
    for (const client of this.clients.values()) {
      if (client.ws.readyState === WebSocket.OPEN) {
        this.sendTo(client.ws, message)
      }
    }
  }

  private sendTo(ws: WebSocket, message: WSMessage) {
    ws.send(JSON.stringify(message))
  }

  // ==========================================================================
  // Checkpoint Handling
  // ==========================================================================

  waitForCheckpoint(runStepId: string): Promise<CheckpointResponsePayload> {
    return new Promise((resolve) => {
      this.checkpointResolvers.set(runStepId, resolve)
    })
  }

  /**
   * Cancela todas as promises pendentes de um run (checkpoint, human input, review reject).
   * Chamado quando o run termina (completed/failed/cancelled).
   */
  cancelPendingWaiters(runId: string) {
    // Limpar pendentes
    this.pendingCheckpoints.delete(runId)
    this.pendingHumanInputs.delete(runId)
    this.pendingReviewRejects.delete(runId)

    // Resolver checkpoints com 'approve' (nao bloquear)
    for (const [key, resolver] of this.checkpointResolvers) {
      resolver({ runId, runStepId: key, action: 'approve' })
    }
    this.checkpointResolvers.clear()

    // Resolver human inputs com mensagem vazia (skip)
    for (const [key, resolver] of this.humanInputResolvers) {
      resolver({ runId, runStepId: key, message: '' })
    }
    this.humanInputResolvers.clear()

    // Resolver review rejects com 'approve' (nao bloquear)
    for (const [key, resolver] of this.reviewRejectResolvers) {
      resolver({ runId, runStepId: key, action: 'approve' })
    }
    this.reviewRejectResolvers.clear()
  }

  resolveCheckpoint(runStepId: string, response: CheckpointResponsePayload): boolean {
    // Limpar checkpoint pendente
    this.pendingCheckpoints.delete(response.runId)
    const resolver = this.checkpointResolvers.get(runStepId)
    if (resolver) {
      resolver(response)
      this.checkpointResolvers.delete(runStepId)
      return true
    }
    return false
  }

  // ==========================================================================
  // Convenience Emitters (used by Pipeline Engine)
  // ==========================================================================

  emitRunStatus(runId: string, status: string, stepIndex?: number, totalSteps?: number) {
    this.broadcastToRun(runId, {
      event: WS_EVENTS.RUN_STATUS,
      payload: { runId, status, stepIndex, totalSteps },
    })
  }

  emitStepStart(
    runId: string,
    stepId: string,
    runStepId: string,
    agentName: string,
    agentIcon: string,
    label: string,
    stepIndex: number,
    totalSteps: number,
  ) {
    this.broadcastToRun(runId, {
      event: WS_EVENTS.STEP_START,
      payload: { runId, stepId, runStepId, agentName, agentIcon, label, stepIndex, totalSteps },
    })
  }

  emitStepOutput(runId: string, runStepId: string, chunk: string) {
    this.broadcastToRun(runId, {
      event: WS_EVENTS.STEP_OUTPUT,
      payload: { runId, runStepId, chunk },
    })
  }

  emitStepComplete(
    runId: string,
    runStepId: string,
    output: string,
    tokensUsed: number,
    cost: number,
    durationMs: number,
  ) {
    this.broadcastToRun(runId, {
      event: WS_EVENTS.STEP_COMPLETE,
      payload: { runId, runStepId, output, tokensUsed, cost, durationMs },
    })
  }

  emitStepError(runId: string, runStepId: string, error: string) {
    this.broadcastToRun(runId, {
      event: WS_EVENTS.STEP_ERROR,
      payload: { runId, runStepId, error },
    })
  }

  emitAgentStatus(runId: string, agentId: string, agentName: string, status: string) {
    this.broadcastToRun(runId, {
      event: WS_EVENTS.AGENT_STATUS,
      payload: { runId, agentId, agentName, status },
    })
  }

  emitHandoffStart(
    runId: string,
    fromAgent: { id: string; name: string; icon: string },
    toAgent: { id: string; name: string; icon: string },
    summary: string,
  ) {
    this.broadcastToRun(runId, {
      event: WS_EVENTS.HANDOFF_START,
      payload: { runId, fromAgent, toAgent, summary },
    })
  }

  emitHandoffEnd(runId: string) {
    this.broadcastToRun(runId, {
      event: WS_EVENTS.HANDOFF_END,
      payload: { runId },
    })
  }

  emitCheckpointRequest(
    runId: string,
    runStepId: string,
    stepLabel: string,
    previousOutput: string,
    checkpointType: 'approval' | 'selection' | 'input' = 'approval',
    question?: string,
    options?: string[],
    instructions?: string,
  ) {
    const message: WSMessage = {
      event: WS_EVENTS.CHECKPOINT_REQUEST,
      payload: { runId, runStepId, stepLabel, previousOutput, checkpointType, question, options, instructions },
    }
    // Guardar como pendente para enviar a novos subscribers
    this.pendingCheckpoints.set(runId, message)
    this.broadcastToRun(runId, message)
  }

  // Human Input
  emitHumanInputRequest(runId: string, runStepId: string, agentName: string, output: string) {
    const message: WSMessage = {
      event: WS_EVENTS.HUMAN_INPUT_REQUEST,
      payload: { runId, runStepId, agentName, output },
    }
    this.pendingHumanInputs.set(runId, message)
    this.broadcastToRun(runId, message)
  }

  waitForHumanInput(runStepId: string): Promise<HumanInputResponsePayload> {
    return new Promise((resolve) => {
      this.humanInputResolvers.set(runStepId, resolve)
    })
  }

  // Review Reject
  emitReviewRejectRequest(runId: string, runStepId: string, agentName: string, output: string, reason: string) {
    const message: WSMessage = {
      event: WS_EVENTS.REVIEW_REJECT_REQUEST,
      payload: { runId, runStepId, agentName, output, reason },
    }
    this.pendingReviewRejects.set(runId, message)
    this.broadcastToRun(runId, message)
  }

  waitForReviewRejectResponse(runStepId: string): Promise<ReviewRejectResponsePayload> {
    return new Promise((resolve) => {
      this.reviewRejectResolvers.set(runStepId, resolve)
    })
  }

  emitRunMetrics(
    runId: string,
    totalTokens: number,
    totalCost: number,
    elapsedMs: number,
    estimatedRemainingMs?: number,
  ) {
    this.broadcastToRun(runId, {
      event: WS_EVENTS.RUN_METRICS,
      payload: { runId, totalTokens, totalCost, elapsedMs, estimatedRemainingMs },
    })
  }

  emitRunComplete(
    runId: string,
    status: 'completed' | 'failed' | 'cancelled',
    totalTokens: number,
    totalCost: number,
    durationMs: number,
    finalOutput?: string,
  ) {
    this.broadcastToRun(runId, {
      event: WS_EVENTS.RUN_COMPLETE,
      payload: { runId, status, totalTokens, totalCost, durationMs, finalOutput },
    })
  }

  // ==========================================================================
  // Verbose Logging
  // ==========================================================================

  emitVerboseLog(
    runId: string,
    type: 'prompt' | 'tokens' | 'model' | 'timing' | 'retry' | 'veto' | 'context',
    message: string,
    runStepId?: string,
    metadata?: Record<string, unknown>,
  ) {
    this.broadcastToRun(runId, {
      event: WS_EVENTS.VERBOSE_LOG,
      payload: { runId, runStepId, type, message, metadata },
    })
  }

  // ==========================================================================
  // Status
  // ==========================================================================

  getConnectedClientsCount(): number {
    return this.clients.size
  }

  getRunSubscriberCount(runId: string): number {
    let count = 0
    for (const client of this.clients.values()) {
      if (client.subscribedRuns.has(runId)) count++
    }
    return count
  }

  isInitialized(): boolean {
    return this.wss !== null
  }
}

// Singleton via globalThis (evita instâncias duplicadas no Next.js dev mode)
const globalForWs = globalThis as unknown as {
  wsServer: CrewFlowWSServer | undefined
}

export const wsServer = globalForWs.wsServer ?? new CrewFlowWSServer()

if (process.env.NODE_ENV !== 'production') {
  globalForWs.wsServer = wsServer
}
