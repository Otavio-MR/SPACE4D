import type { ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'

import { cn } from '@/lib/cn.ts'

type Variant = 'primary' | 'secondary' | 'onCamera'

export interface LinkButtonProps extends Omit<LinkProps, 'className'> {
  variant?: Variant
  icon?: ReactNode
  className?: string
}

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-strong',
  secondary:
    'bg-surface text-fg border border-border hover:bg-surface-2 hover:border-border-strong',
  onCamera: 'border border-white/25 bg-black/65 text-white backdrop-blur-md hover:bg-black/80',
}

/**
 * Um link com aparência de botão.
 *
 * Existe para que navegação seja sempre `<a>` e ação seja sempre `<button>`:
 * aninhar um dentro do outro é HTML inválido e quebra teclado e leitores de tela.
 */
export function LinkButton({
  variant = 'primary',
  icon,
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cn(
        'touch-target inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3',
        'text-sm font-semibold transition-colors',
        variants[variant],
        className,
      )}
      {...props}
    >
      {icon ? (
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
      ) : null}
      {children}
    </Link>
  )
}
