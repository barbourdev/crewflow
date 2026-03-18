import { APP_NAME, APP_VERSION } from '@crewflow/shared'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          {APP_NAME}
        </h1>
        <p className="mt-2 text-zinc-400">
          Framework de orquestração multi-agente
        </p>
        <p className="mt-1 text-xs text-zinc-600">v{APP_VERSION}</p>
      </div>
    </div>
  )
}
