import { useCallback, useEffect, useRef, useState } from 'react'

export interface Speech {
  supported: boolean
  speaking: boolean
  speak: (text: string) => void
  stop: () => void
}

/**
 * Narração por voz via Web Speech API.
 *
 * É um recurso de apoio à leitura — útil para crianças em alfabetização e para
 * quem prefere ouvir — e não substitui o leitor de tela, que continua lendo a
 * página normalmente.
 */
export function useSpeech(lang = 'pt-BR'): Speech {
  const [speaking, setSpeaking] = useState(false)
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const stop = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  const speak = useCallback(
    (text: string) => {
      if (!supported) return
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 0.95
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)
      utteranceRef.current = utterance

      setSpeaking(true)
      window.speechSynthesis.speak(utterance)
    },
    [supported, lang],
  )

  // Deixar a fala tocando depois que o componente sai da tela confunde o usuário.
  useEffect(() => stop, [stop])

  return { supported, speaking, speak, stop }
}
