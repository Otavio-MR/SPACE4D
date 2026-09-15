import { usePrefersReducedMotion } from '@/hooks/useMediaQuery.ts'

import { useSettings } from './store.ts'

/**
 * Decide se animações devem rodar: a escolha explícita do usuário vence;
 * sem escolha, seguimos a preferência do sistema.
 */
export function useMotionEnabled(): boolean {
  const motion = useSettings((s) => s.motion)
  const systemReduced = usePrefersReducedMotion()
  if (motion === 'full') return true
  if (motion === 'reduced') return false
  return !systemReduced
}
