import { afterEach, describe, expect, it, vi } from 'vitest'

import { arUnavailableReason, detectARSupport, isARAvailable, type ARSupport } from './env.ts'

const FULL: ARSupport = {
  hasCamera: true,
  isSecureContext: true,
  hasWebAssembly: true,
  hasWorker: true,
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('detecção de suporte a AR', () => {
  it('considera disponível quando todos os recursos existem', () => {
    expect(isARAvailable(FULL)).toBe(true)
    expect(arUnavailableReason(FULL)).toBeNull()
  })

  /*
   * A ordem das mensagens importa: contexto inseguro é a causa mais comum (abrir
   * pelo IP da rede local sem HTTPS) e a que o usuário consegue resolver. Mostrar
   * "sem câmera" nesse caso mandaria a pessoa para o lugar errado.
   */
  it('explica primeiro o contexto inseguro', () => {
    const reason = arUnavailableReason({ ...FULL, isSecureContext: false, hasCamera: false })
    expect(reason).toMatch(/HTTPS/)
  })

  it('explica a falta de câmera', () => {
    expect(arUnavailableReason({ ...FULL, hasCamera: false })).toMatch(/câmera/i)
  })

  it('explica a falta de WebAssembly ou Worker', () => {
    expect(arUnavailableReason({ ...FULL, hasWebAssembly: false })).toMatch(/rastreamento/i)
    expect(arUnavailableReason({ ...FULL, hasWorker: false })).toMatch(/rastreamento/i)
  })

  it('lê os recursos reais do ambiente', () => {
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: () => Promise.resolve() } })
    vi.stubGlobal('isSecureContext', true)

    const support = detectARSupport()
    expect(support.hasCamera).toBe(true)
    expect(support.hasWebAssembly).toBe(true)
  })

  it('reconhece a ausência de getUserMedia', () => {
    vi.stubGlobal('navigator', {})
    expect(detectARSupport().hasCamera).toBe(false)
  })
})
