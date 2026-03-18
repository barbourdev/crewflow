'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import type { WSMessage } from '@/lib/ws-events'
import { WS_CLIENT_EVENTS } from '@/lib/ws-events'

type EventHandler = (payload: unknown) => void

interface UseWebSocketOptions {
  autoConnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

interface UseWebSocketReturn {
  isConnected: boolean
  send: (message: WSMessage) => void
  subscribe: (event: string, handler: EventHandler) => () => void
  subscribeToRun: (runId: string) => void
  unsubscribeFromRun: (runId: string) => void
  sendCheckpointResponse: (
    runId: string,
    runStepId: string,
    action: 'approve' | 'adjust' | 'redo',
    feedback?: string,
  ) => void
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { autoConnect = true, reconnectInterval = 3000, maxReconnectAttempts = 10 } = options

  const wsRef = useRef<WebSocket | null>(null)
  const handlersRef = useRef<Map<string, Set<EventHandler>>>(new Map())
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const [isConnected, setIsConnected] = useState(false)

  const getWsUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${window.location.host}/ws`
  }, [])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(getWsUrl())

    ws.onopen = () => {
      setIsConnected(true)
      reconnectAttemptsRef.current = 0
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WSMessage
        const handlers = handlersRef.current.get(message.event)
        if (handlers) {
          handlers.forEach((handler) => handler(message.payload))
        }
      } catch {
        // ignore malformed messages
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
      wsRef.current = null

      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectTimerRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++
          connect()
        }, reconnectInterval * Math.min(reconnectAttemptsRef.current + 1, 5))
      }
    }

    ws.onerror = () => {
      ws.close()
    }

    wsRef.current = ws
  }, [getWsUrl, reconnectInterval, maxReconnectAttempts])

  useEffect(() => {
    if (autoConnect) connect()

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      wsRef.current?.close()
    }
  }, [autoConnect, connect])

  const send = useCallback((message: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  const subscribe = useCallback((event: string, handler: EventHandler) => {
    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, new Set())
    }
    handlersRef.current.get(event)!.add(handler)

    return () => {
      handlersRef.current.get(event)?.delete(handler)
    }
  }, [])

  const subscribeToRun = useCallback(
    (runId: string) => {
      send({ event: WS_CLIENT_EVENTS.SUBSCRIBE_RUN, payload: { runId } })
    },
    [send],
  )

  const unsubscribeFromRun = useCallback(
    (runId: string) => {
      send({ event: WS_CLIENT_EVENTS.UNSUBSCRIBE_RUN, payload: { runId } })
    },
    [send],
  )

  const sendCheckpointResponse = useCallback(
    (runId: string, runStepId: string, action: 'approve' | 'adjust' | 'redo', feedback?: string) => {
      send({
        event: WS_CLIENT_EVENTS.CHECKPOINT_RESPONSE,
        payload: { runId, runStepId, action, feedback },
      })
    },
    [send],
  )

  return {
    isConnected,
    send,
    subscribe,
    subscribeToRun,
    unsubscribeFromRun,
    sendCheckpointResponse,
  }
}
