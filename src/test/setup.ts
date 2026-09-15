import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, vi } from 'vitest'

/*
 * jsdom não tem WebGL, então o react-three-fiber não roda nos testes. O canvas é
 * substituído por um marcador: o que testamos aqui é a camada acessível em volta
 * dele — rótulos, controles, texto alternativo —, que é justamente a parte que
 * precisa funcionar sem o 3D.
 */
vi.mock('@react-three/fiber', () => ({
  Canvas: () => createElement('div', { 'data-testid': 'canvas-3d' }),
  useFrame: () => undefined,
  useThree: () => ({}),
}))

afterEach(() => {
  cleanup()
  localStorage.clear()
})

// jsdom não implementa matchMedia; os hooks de preferência dependem dele.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

// Usado pelo carrossel/foco do catálogo.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn()
}
