import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn.ts'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  /** Ícone decorativo à esquerda do rótulo. Marcado como `aria-hidden`. */
  icon?: ReactNode
}

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-strong active:bg-primary-strong',
  secondary: 'bg-surface text-fg border border-border-strong hover:bg-surface-2',
  ghost: 'bg-transparent text-fg-muted hover:bg-surface hover:text-fg',
  danger: 'bg-transparent text-danger border border-danger hover:bg-danger/10',
}

const sizes: Record<Size, string> = {
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'touch-target inline-flex items-center justify-center gap-2 rounded-xl font-semibold',
        'transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
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
    </button>
  )
}
