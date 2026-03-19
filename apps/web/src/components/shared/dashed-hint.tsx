import Link from 'next/link'

interface DashedHintProps {
  text: string
  linkText: string
  href: string
}

/**
 * Card dashed com hint e link. Estilo Stitch.
 * Ex: "Looking for workspace settings? Click here"
 */
export function DashedHint({ text, linkText, href }: DashedHintProps) {
  return (
    <div className="flex items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-white/20">
      <p className="text-sm text-slate-400">
        {text}{' '}
        <Link href={href} className="text-[#0066ff] hover:underline font-medium">
          {linkText}
        </Link>
      </p>
    </div>
  )
}
