import { AlertCircle } from 'lucide-react'

interface ErrorBannerProps {
  message: string
  className?: string
}

/**
 * Banner de erro padronizado estilo Stitch.
 * Reutilizavel em todas as paginas do app.
 */
export function ErrorBanner({ message, className }: ErrorBannerProps) {
  return (
    <div className={`flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 ${className ?? ''}`}>
      <AlertCircle className="size-4 shrink-0" />
      {message}
    </div>
  )
}
