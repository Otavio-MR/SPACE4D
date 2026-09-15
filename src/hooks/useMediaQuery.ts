import { useSyncExternalStore } from 'react'

/** Assina uma media query do CSS e devolve se ela casa no momento. */
export function useMediaQuery(query: string): boolean {
  const subscribe = (onChange: () => void) => {
    const list = window.matchMedia(query)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }
  const getSnapshot = () => window.matchMedia(query).matches
  // Sem SSR neste app; o fallback evita quebrar em ambientes sem `window`.
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
