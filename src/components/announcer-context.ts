import { createContext } from 'react'

export type Politeness = 'polite' | 'assertive'

export interface AnnouncerApi {
  /** Envia uma mensagem para a região viva, lida por leitores de tela. */
  announce: (message: string, politeness?: Politeness) => void
}

export const AnnouncerContext = createContext<AnnouncerApi | null>(null)
