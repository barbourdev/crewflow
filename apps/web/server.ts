import { createServer } from 'http'
import next from 'next'
import { wsServer } from './src/lib/ws-server'

const dev = process.env.NODE_ENV !== 'production'
const port = parseInt(process.env.PORT ?? '3000', 10)

const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res)
  })

  // Initialize WebSocket on the same HTTP server
  wsServer.initialize(server)

  server.listen(port, () => {
    console.log(`🚀 CrewFlow running on http://localhost:${port}`)
    console.log(`🔌 WebSocket available on ws://localhost:${port}/ws`)
  })
})
