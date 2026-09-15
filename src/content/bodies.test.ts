import { describe, expect, it } from 'vitest'

import { KIND_LABELS, bodies, getBody, targetIndexOf } from './bodies.ts'

describe('catálogo de corpos celestes', () => {
  it('não tem identificadores repetidos', () => {
    const ids = bodies.map((body) => body.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('usa identificadores válidos para URL', () => {
    for (const body of bodies) {
      expect(body.id).toMatch(/^[a-z][a-z0-9-]*$/)
    }
  })

  it('numera as cartas em sequência, a partir de 1', () => {
    expect(bodies.map((body) => body.order)).toEqual(bodies.map((_, index) => index + 1))
  })

  /*
   * Esta é a invariante que mais importa: `ARScene` associa a âncora do alvo N ao
   * corpo na posição N da lista, e o arquivo `.mind` é compilado nessa mesma ordem.
   * Se ela quebrar, o modelo errado aparece sobre a carta.
   */
  it('mantém o índice do alvo igual à posição na lista', () => {
    bodies.forEach((body, index) => {
      expect(targetIndexOf(body.id)).toBe(index)
    })
  })

  it('tem conteúdo completo para cada corpo', () => {
    for (const body of bodies) {
      expect(body.name.length, body.id).toBeGreaterThan(0)
      expect(body.summary.length, body.id).toBeGreaterThan(60)
      // A audiodescrição é o equivalente textual do modelo 3D: não pode faltar.
      expect(body.appearance.length, body.id).toBeGreaterThan(40)
      expect(body.facts.length, body.id).toBeGreaterThanOrEqual(4)
      expect(body.curiosities.length, body.id).toBeGreaterThanOrEqual(2)
      expect(KIND_LABELS[body.kind], body.id).toBeTruthy()
      expect(body.accent, body.id).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('declara cores suficientes para o modo de superfície escolhido', () => {
    for (const body of bodies) {
      const { mode, colors } = body.visual.surface
      const required = mode === 'earth' ? 4 : 3
      expect(colors.length, `${body.id} (${mode})`).toBeGreaterThanOrEqual(required)
    }
  })

  it('encontra corpos pelo identificador e ignora os desconhecidos', () => {
    expect(getBody('terra')?.name).toBe('Terra')
    expect(getBody('plutao')).toBeUndefined()
  })
})
