import { useEffect } from 'react'

const SUFFIX = 'Órbita AR'

/**
 * Define o título da página (WCAG 2.4.2). Numa SPA o título não muda sozinho ao
 * navegar, e é por ele que leitores de tela anunciam a nova tela.
 */
export function usePageTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} — ${SUFFIX}` : SUFFIX
  }, [title])
}
