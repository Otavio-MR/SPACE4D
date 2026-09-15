import type { ReactNode } from 'react'

/** Conteúdo lido por leitores de tela, invisível na tela (WCAG 1.3.1). */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>
}
