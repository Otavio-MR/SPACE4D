import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Verifica o contraste da paleta segundo a WCAG 2.2.
 *
 * Este teste existe porque o axe-core, rodando no jsdom, NÃO consegue avaliar
 * contraste: o cálculo depende de renderização real, e o jsdom não implementa
 * `canvas.getContext`. As demais regras do axe são checadas nos testes de tela;
 * cor é checada aqui, direto nos tokens, que é a fonte da verdade.
 */

const CSS = readFileSync(resolve(import.meta.dirname, 'globals.css'), 'utf8')

/** Lê só o bloco `@theme` — os overrides de `prefers-contrast` só aumentam o contraste. */
function readBaseTokens(): Record<string, string> {
  const theme = CSS.match(/@theme \{([\s\S]*?)\n\}/)
  if (!theme) throw new Error('Bloco @theme não encontrado em globals.css')

  const tokens: Record<string, string> = {}
  for (const match of theme[1].matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)) {
    tokens[match[1]] = match[2]
  }
  return tokens
}

function channelLuminance(value: number): number {
  const channel = value / 255
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
}

function relativeLuminance(hex: string): number {
  const red = channelLuminance(parseInt(hex.slice(1, 3), 16))
  const green = channelLuminance(parseInt(hex.slice(3, 5), 16))
  const blue = channelLuminance(parseInt(hex.slice(5, 7), 16))
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground)
  const b = relativeLuminance(background)
  const [lighter, darker] = a > b ? [a, b] : [b, a]
  return (lighter + 0.05) / (darker + 0.05)
}

const tokens = readBaseTokens()

function check(foreground: string, background: string, minimum: number): void {
  const ratio = contrastRatio(tokens[foreground], tokens[background])
  expect(
    ratio,
    `${foreground} (${tokens[foreground]}) sobre ${background} (${tokens[background]}) = ${ratio.toFixed(2)}:1, mínimo ${minimum}:1`,
  ).toBeGreaterThanOrEqual(minimum)
}

/** Superfícies sobre as quais texto e componentes aparecem. */
const SURFACES = ['bg', 'bg-elevated', 'surface', 'surface-2'] as const

describe('contraste da paleta (WCAG 2.2)', () => {
  it('define todos os tokens usados nos testes', () => {
    for (const name of [...SURFACES, 'fg', 'fg-muted', 'fg-subtle', 'border-strong']) {
      expect(tokens[name], name).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('texto principal atinge 7:1 em todas as superfícies (1.4.6, AAA)', () => {
    for (const surface of SURFACES) check('fg', surface, 7)
  })

  it('texto secundário atinge 4.5:1 em todas as superfícies (1.4.3, AA)', () => {
    for (const surface of SURFACES) {
      check('fg-muted', surface, 4.5)
      check('fg-subtle', surface, 4.5)
    }
  })

  it('cores de destaque e estado atingem 4.5:1 sobre o fundo', () => {
    for (const color of ['primary', 'primary-strong', 'accent', 'danger', 'success'] as const) {
      check(color, 'bg', 4.5)
      check(color, 'surface', 4.5)
    }
  })

  it('texto sobre os fundos de ação atinge 4.5:1', () => {
    expect(contrastRatio(tokens['on-primary'], tokens.primary)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(tokens['on-primary'], tokens['primary-strong'])).toBeGreaterThanOrEqual(
      4.5,
    )
    expect(contrastRatio(tokens['on-primary'], tokens.accent)).toBeGreaterThanOrEqual(4.5)
  })

  /*
   * 1.4.11 exige 3:1 para o que identifica um componente de interface. A borda
   * de botões, interruptores e opções usa `border-strong`, então ela precisa se
   * destacar de qualquer superfície em que o componente possa estar.
   */
  it('a borda de componentes interativos atinge 3:1 em todas as superfícies (1.4.11)', () => {
    for (const surface of SURFACES) check('border-strong', surface, 3)
  })

  it('o anel de foco atinge 3:1 em todas as superfícies (1.4.11, 2.4.11)', () => {
    for (const surface of SURFACES) check('accent', surface, 3)
  })

  it('os overrides de prefers-contrast só aumentam o contraste', () => {
    const block = CSS.match(/@media \(prefers-contrast: more\) \{([\s\S]*?)\n {2}\}/)
    expect(block, 'bloco prefers-contrast: more não encontrado').not.toBeNull()

    for (const match of block![1].matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)) {
      const [, name, override] = match
      const base = tokens[name]
      if (!base) continue
      expect(
        contrastRatio(override, tokens.bg),
        `${name}: ${override} deveria contrastar mais que o padrão ${base}`,
      ).toBeGreaterThanOrEqual(contrastRatio(base, tokens.bg))
    }
  })
})
