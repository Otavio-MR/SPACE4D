import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn.ts'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Obrigatório: um botão só de ícone precisa de nome acessível (WCAG 4.1.2). */
  label: string
  icon: ReactNode
  tone?: 'default' | 'onCamera'
}

/**
 * Botão apenas com ícone. `tone="onCamera"` adiciona fundo opaco e borda para
 * garantir contraste sobre a imagem da câmera, que é imprevisível (WCAG 1.4.11).
 */
export function IconButton({
  label,
  icon,
  tone = 'default',
  className,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'touch-target inline-flex items-center justify-center rounded-full transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        tone === 'onCamera'
          ? 'border border-white/25 bg-black/65 text-white backdrop-blur-md hover:bg-black/80'
          : 'border border-border-strong bg-surface text-fg-muted hover:bg-surface-2 hover:text-fg',
        className,
      )}
      {...props}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  )
}
