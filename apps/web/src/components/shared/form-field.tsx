import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

/**
 * Label + input wrapper padronizado estilo Stitch.
 */
export function FormField({ label, required, children, className }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

/**
 * Input padrao Stitch: rounded-xl, py-3, focus ring azul.
 */
export function FormInput({
  className,
  ...props
}: React.ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:border-[#0066ff] focus:ring-4 focus:ring-[#0066ff]/10 transition-all outline-none text-sm',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Textarea padrao Stitch.
 */
export function FormTextarea({
  className,
  ...props
}: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:border-[#0066ff] focus:ring-4 focus:ring-[#0066ff]/10 transition-all outline-none resize-none text-sm',
        className,
      )}
      {...props}
    />
  )
}
