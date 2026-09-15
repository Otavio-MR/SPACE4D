import type { ReactNode } from 'react'

import { cn } from '@/lib/cn.ts'

/** Etiqueta não interativa (tipo do corpo celeste, número da carta etc.). */
export function Chip({
  children,
  className,
  accent,
}: {
  children: ReactNode
  className?: string
  accent?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-border bg-surface px-3 py-1',
        'font-display text-xs font-medium tracking-wide text-fg-muted uppercase',
        className,
      )}
      style={accent ? { borderColor: `${accent}55`, color: accent } : undefined}
    >
      {children}
    </span>
  )
}
