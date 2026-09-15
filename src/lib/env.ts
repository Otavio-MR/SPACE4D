/** Recursos do navegador de que a experiência em AR depende. */
export interface ARSupport {
  /** `navigator.mediaDevices.getUserMedia` existe. */
  hasCamera: boolean
  /** A página está em contexto seguro (HTTPS ou localhost) — exigido por getUserMedia. */
  isSecureContext: boolean
  /** WebAssembly, usado pelo motor de rastreamento. */
  hasWebAssembly: boolean
  /** Suporte a Web Workers, usado pelo detector de features. */
  hasWorker: boolean
}

export function detectARSupport(): ARSupport {
  return {
    hasCamera:
      typeof navigator !== 'undefined' &&
      typeof navigator.mediaDevices?.getUserMedia === 'function',
    isSecureContext: typeof window !== 'undefined' && window.isSecureContext,
    hasWebAssembly: typeof WebAssembly === 'object',
    hasWorker: typeof Worker === 'function',
  }
}

export function isARAvailable(support: ARSupport = detectARSupport()): boolean {
  return support.hasCamera && support.isSecureContext && support.hasWebAssembly && support.hasWorker
}

/** Mensagem explicando, em linguagem simples, por que o AR não está disponível. */
export function arUnavailableReason(support: ARSupport = detectARSupport()): string | null {
  if (!support.isSecureContext) {
    return 'A câmera só funciona em páginas seguras (HTTPS). Abra o app por um endereço https:// ou localhost.'
  }
  if (!support.hasCamera) {
    return 'Este navegador não oferece acesso à câmera. Tente o Chrome ou o Safari atualizados.'
  }
  if (!support.hasWebAssembly || !support.hasWorker) {
    return 'Este navegador não tem os recursos necessários para o rastreamento das cartas.'
  }
  return null
}
