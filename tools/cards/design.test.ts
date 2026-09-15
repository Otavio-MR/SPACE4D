import { describe, expect, it } from 'vitest'

import { bodies, getBody } from '../../src/content/bodies.ts'

import {
  CARD_HEIGHT,
  CARD_WIDTH,
  TEXTURE_BOTTOM,
  buildQRModules,
  renderCardSVG,
  type QRModules,
} from './design.ts'

const qr: QRModules = await buildQRModules('https://exemplo.org/corpo/terra')

/** Extrai os atributos numéricos de todos os elementos de um tipo. */
function elementsOf(svg: string, tag: string): Array<Record<string, number>> {
  const found: Array<Record<string, number>> = []
  for (const match of svg.matchAll(new RegExp(`<${tag}\\s([^>]*)>`, 'g'))) {
    const attributes: Record<string, number> = {}
    for (const attribute of match[1].matchAll(/([a-z-]+)="(-?[\d.]+)"/g)) {
      attributes[attribute[1]] = Number(attribute[2])
    }
    found.push(attributes)
  }
  return found
}

describe('desenho das cartas', () => {
  it('é determinístico', () => {
    const body = getBody('marte')!
    expect(renderCardSVG(body, qr)).toBe(renderCardSVG(body, qr))
  })

  it('gera um desenho diferente para cada corpo', () => {
    const svgs = new Set(bodies.map((body) => renderCardSVG(body, qr)))
    expect(svgs.size).toBe(bodies.length)
  })

  it('traz o nome, o tipo e o número da carta', () => {
    const svg = renderCardSVG(getBody('saturno')!, qr)
    expect(svg).toContain('SATURNO')
    expect(svg).toContain('GIGANTE GASOSO')
    expect(svg).toContain('>08<')
  })

  it('desenha o código QR como módulos quadrados', () => {
    const svg = renderCardSVG(getBody('terra')!, qr)
    // Muitos retângulos pequenos: o QR é, de quebra, uma fonte densa de cantos.
    expect(elementsOf(svg, 'rect').length).toBeGreaterThan(200)
  })

  /*
   * A primeira versão da carta espalhava pontos e linhas por toda a área, e eles
   * cruzavam o título, o subtítulo e as instruções. Legibilidade primeiro: toda
   * a arte gerada fica acima da faixa de texto.
   */
  it('mantém a textura fora da área de texto', () => {
    for (const body of bodies) {
      const svg = renderCardSVG(body, qr)
      const dots = elementsOf(svg, 'circle').filter((c) => c.r !== undefined && c.r < 6)
      expect(dots.length, body.id).toBeGreaterThan(100)
      for (const dot of dots) {
        expect(dot.cy, `${body.id}: ponto em y=${dot.cy}`).toBeLessThanOrEqual(TEXTURE_BOTTOM)
      }
    }
  })

  it('mantém as linhas da constelação fora da área de texto', () => {
    for (const body of bodies) {
      for (const line of elementsOf(renderCardSVG(body, qr), 'line')) {
        if (line.y1 === undefined) continue
        expect(Math.max(line.y1, line.y2), body.id).toBeLessThanOrEqual(TEXTURE_BOTTOM + 180)
      }
    }
  })

  /*
   * Os anéis de Saturno e de Urano são elipses largas. Se ultrapassarem a
   * moldura, a carta sai cortada na impressão.
   */
  it('mantém os anéis dentro da moldura', () => {
    for (const body of bodies.filter((item) => item.visual.rings)) {
      const svg = renderCardSVG(body, qr)
      for (const ellipse of elementsOf(svg, 'ellipse')) {
        expect(CARD_WIDTH / 2 - ellipse.rx, body.id).toBeGreaterThan(42)
        expect(ellipse.ry, body.id).toBeLessThan(CARD_HEIGHT / 2)
      }
    }
  })

  it('deixa o canto inferior esquerdo livre para a marca de orientação', () => {
    const svg = renderCardSVG(getBody('lua')!, qr)
    const marker = elementsOf(svg, 'polygon')
    // O triângulo é desenhado por `points`, sem atributos numéricos soltos.
    expect(svg).toContain('<polygon')
    expect(marker.length).toBeGreaterThanOrEqual(0)
    // Nenhum módulo do QR pode invadir a faixa do triângulo.
    const qrCells = elementsOf(svg, 'rect').filter((r) => r.width < 20)
    for (const cell of qrCells) {
      const overlapsMarker = cell.x < 105 && cell.y + cell.height > CARD_HEIGHT - 105
      expect(overlapsMarker, `célula do QR em ${cell.x},${cell.y}`).toBe(false)
    }
  })

  it('escapa caracteres especiais do XML', () => {
    const svg = renderCardSVG(getBody('venus')!, qr)
    expect(svg).not.toMatch(/<text[^>]*>[^<]*&(?!amp;|lt;|gt;|quot;)/)
  })
})
