import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'

import { AnnouncerContext, type Politeness } from './announcer-context.ts'

/** Espaço estreito invisível, usado para forçar um novo anúncio de texto repetido. */
const INVISIBLE_MARKER = ' '

/**
 * Região viva global (WCAG 4.1.3). Mudanças que acontecem sem foco — uma carta
 * reconhecida, o rastreamento perdido — precisam ser anunciadas, senão só quem
 * está olhando para a tela percebe.
 */
export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const [polite, setPolite] = useState('')
  const [assertive, setAssertive] = useState('')
  const lastRef = useRef('')

  const announce = useCallback((message: string, politeness: Politeness = 'polite') => {
    // Reenviar texto idêntico não dispara novo anúncio; o marcador força a mudança.
    const text = message === lastRef.current ? message + INVISIBLE_MARKER : message
    lastRef.current = text
    if (politeness === 'assertive') setAssertive(text)
    else setPolite(text)
  }, [])

  const value = useMemo(() => ({ announce }), [announce])

  return (
    <AnnouncerContext value={value}>
      {children}
      <div className="sr-only">
        <p aria-live="polite" aria-atomic="true">
          {polite}
        </p>
        <p aria-live="assertive" aria-atomic="true">
          {assertive}
        </p>
      </div>
    </AnnouncerContext>
  )
}
