import { WebSocketServer, WebSocket } from 'ws'
import type { IncomingMessage } from 'http'
import type { WSMessage, CheckpointResponsePayload } from './ws-events'
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
  private checkpointResolvers: Map<string, (response: CheckpointResponsePayload) => void> =
    new Map()
  private clientIdCounter = 0

  initialize(server: import('http').Server) {
    if (this.wss) return

    this.wss = new WebSocketServer({ server, path: '/ws' })

    this.wss.on('connection', (ws: WebSocket, _req: IncomingMessage) => {
      const clientId = `client_${++this.clientIdCounter}`
      this.clients.set(clientId, { ws, subscribedRuns: new Set() })

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
        break
      }
      case WS_CLIENT_EVENTS.UNSUBSCRIBE_RUN: {
        const { runId } = message.payload as { runId: string }
        client.subscribedRuns.delete(runId)
        break
      }
      case WS_CLIENT_EVENTS.CHECKPOINT_RESPONSE: {
        const payload = message.payload as CheckpointResponsePayload
        const resolver = this.checkpointResolvers.get(payload.runStepId)
        if (resolver) {
          resolver(payload)
          this.checkpointResolvers.delete(payload.runStepId)
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
  ) {
    this.broadcastToRun(runId, {
      event: WS_EVENTS.CHECKPOINT_REQUEST,
      payload: { runId, runStepId, stepLabel, previousOutput },
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
  // Status
  // ==========================================================================

  getConnectedClientsCount(): number {
    return this.clients.size
  }

  isInitialized(): boolean {
    return this.wss !== null
  }
}

// Singleton
export const wsServer = new CrewFlowWSServer()
