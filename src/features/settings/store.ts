import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Preferências do usuário.
 *
 * `motion: 'system'` (padrão) segue `prefers-reduced-motion`. As opções explícitas
 * existem porque a preferência do sistema nem sempre reflete a vontade do usuário
 * naquele contexto — WCAG 2.3.3 pede o controle, não só o respeito ao sistema.
 */
export type MotionPreference = 'system' | 'full' | 'reduced'
export type TextScale = 'normal' | 'large' | 'larger'

export interface SettingsState {
  motion: MotionPreference
  textScale: TextScale
  /** Narração por voz (Web Speech API) das fichas dos corpos celestes. */
  speech: boolean
  /** Vibração ao reconhecer uma carta, quando o aparelho suportar. */
  haptics: boolean
  /** Mostra os nomes dos corpos flutuando sobre o modelo em AR. */
  arLabels: boolean
  setMotion: (value: MotionPreference) => void
  setTextScale: (value: TextScale) => void
  setSpeech: (value: boolean) => void
  setHaptics: (value: boolean) => void
  setArLabels: (value: boolean) => void
  reset: () => void
}

const defaults = {
  motion: 'system' as MotionPreference,
  textScale: 'normal' as TextScale,
  speech: false,
  haptics: true,
  arLabels: true,
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      setMotion: (motion) => set({ motion }),
      setTextScale: (textScale) => set({ textScale }),
      setSpeech: (speech) => set({ speech }),
      setHaptics: (haptics) => set({ haptics }),
      setArLabels: (arLabels) => set({ arLabels }),
      reset: () => set(defaults),
    }),
    { name: 'orbita:settings', version: 1 },
  ),
)

export const TEXT_SCALE_VALUES: Record<TextScale, string> = {
  normal: '100%',
  large: '115%',
  larger: '130%',
}
