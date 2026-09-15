import QRCode from 'qrcode'

import type { CelestialBody } from '../../src/content/types.ts'
import { KIND_LABELS } from '../../src/content/bodies.ts'
import { createRandom } from '../lib/random.ts'

/** 63,5 × 88,9 mm (carta padrão) a 300 dpi. */
export const CARD_WIDTH = 750
export const CARD_HEIGHT = 1050

const INK = '#12151f'
const PAPER = '#fbfaf6'

/*
 * Ritmo vertical da carta. A metade de cima concentra a textura que alimenta o
 * rastreamento; a de baixo é reservada ao texto e ao QR — que já são, por si,
 * densos em cantos detectáveis. Nada de pontilhado ou linha cruzando tipografia:
 * legibilidade primeiro, e o rastreamento não perde nada com isso.
 */
export const TYPE_LABEL_Y = 150
export const EMBLEM_CY = 418
export const EMBLEM_R = 168
export const TITLE_Y = 706
const TAGLINE_Y = 750
const DIVIDER_Y = 792
export const QR_SIZE = 130
/* O QR começa em x=110 para deixar o canto inferior esquerdo livre à marca de
   orientação: um triângulo por cima do código o tornaria ilegível. */
export const QR_X = 110
export const QR_Y = 812
/** Toda a arte gerada aleatoriamente fica acima desta linha. */
export const TEXTURE_BOTTOM = 624

/** Nomes longos diminuem para nunca encostar na moldura. */
function titleFontSize(name: string): number {
  if (name.length >= 9) return 62
  if (name.length >= 7) return 72
  return 82
}

/**
 * Regras de desenho para que a carta rastreie bem:
 *
 * - detalhe fino e irregular espalhado por toda a área (pontos de interesse);
 * - alto contraste local em vez de grandes áreas chapadas;
 * - assimetria entre os quatro cantos, para a orientação nunca ser ambígua;
 * - o código QR é, de quebra, uma fonte excelente de cantos detectáveis.
 *
 * O desenho é determinístico: a mesma semente gera sempre a mesma carta, então o
 * `.mind` compilado continua casando com o PDF já impresso.
 */
export function renderCardSVG(body: CelestialBody, qrModules: QRModules): string {
  const random = createRandom(body.visual.surface.seed * 7919 + body.order)
  const number = String(body.order).padStart(2, '0')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" role="img" aria-label="Carta ${number}: ${body.name}">
  <style>
    @font-face { font-family: 'Space Grotesk'; src: url('/src/assets/fonts/space-grotesk-latin.woff2') format('woff2'); font-weight: 300 700; }
    @font-face { font-family: 'Inter'; src: url('/src/assets/fonts/inter-latin.woff2') format('woff2'); font-weight: 100 900; }
    .display { font-family: 'Space Grotesk', sans-serif; }
    .body-text { font-family: 'Inter', sans-serif; }
  </style>

  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${PAPER}"/>

  ${starField(random)}
  ${constellation(random, body.accent)}

  <rect x="26" y="26" width="${CARD_WIDTH - 52}" height="${CARD_HEIGHT - 52}" fill="none" stroke="${INK}" stroke-width="6"/>
  <rect x="42" y="42" width="${CARD_WIDTH - 84}" height="${CARD_HEIGHT - 84}" fill="none" stroke="${INK}" stroke-width="1.5" opacity="0.5"/>

  ${orientationMarks(number)}

  <text class="display" x="${CARD_WIDTH / 2}" y="${TYPE_LABEL_Y}" text-anchor="middle" font-size="25" font-weight="500" letter-spacing="7" fill="${INK}" opacity="0.75">${escapeXML(KIND_LABELS[body.kind].toUpperCase())}</text>

  ${emblem(body, random)}

  <text class="display" x="${CARD_WIDTH / 2}" y="${TITLE_Y}" text-anchor="middle" font-size="${titleFontSize(body.name)}" font-weight="700" fill="${INK}">${escapeXML(body.name.toUpperCase())}</text>
  <text class="body-text" x="${CARD_WIDTH / 2}" y="${TAGLINE_Y}" text-anchor="middle" font-size="26" fill="${INK}" opacity="0.8">${escapeXML(body.tagline)}</text>

  <line x1="90" y1="${DIVIDER_Y}" x2="${CARD_WIDTH - 90}" y2="${DIVIDER_Y}" stroke="${INK}" stroke-width="2" opacity="0.35"/>

  ${qrBlock(qrModules, body)}
</svg>`
}

/** Pontos irregulares por toda a carta: a principal fonte de features. */
function starField(random: () => number): string {
  const dots: string[] = []
  for (let i = 0; i < 240; i++) {
    const x = 34 + random() * (CARD_WIDTH - 68)
    const y = 34 + random() * (TEXTURE_BOTTOM - 34)
    const r = 1.2 + random() * 3.6
    const opacity = (0.35 + random() * 0.5).toFixed(2)
    // Faixa reservada ao rótulo do tipo: pontilhado sobre texto pequeno o torna ilegível.
    if (y > TYPE_LABEL_Y - 32 && y < TYPE_LABEL_Y + 14 && x > 120 && x < CARD_WIDTH - 120) continue
    dots.push(
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${INK}" opacity="${opacity}"/>`,
    )
  }
  return `<g>${dots.join('')}</g>`
}

/** Linhas que ligam alguns pontos, criando bordas longas e direcionais. */
function constellation(random: () => number, accent: string): string {
  const points: Array<[number, number]> = []
  for (let i = 0; i < 9; i++) {
    points.push([70 + random() * (CARD_WIDTH - 140), 176 + random() * (TEXTURE_BOTTOM - 196)])
  }
  const segments = points
    .slice(1)
    .map((point, index) => {
      const [x1, y1] = points[index]
      const [x2, y2] = point
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${INK}" stroke-width="1.6" opacity="0.28"/>`
    })
    .join('')
  const nodes = points
    .map(
      ([x, y]) =>
        `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="${accent}" stroke="${INK}" stroke-width="1.6"/>`,
    )
    .join('')
  return `<g>${segments}${nodes}</g>`
}

/** Quatro cantos diferentes entre si: a orientação da carta nunca é ambígua. */
function orientationMarks(number: string): string {
  return `<g fill="${INK}">
    <rect x="58" y="58" width="42" height="42"/>
    <circle cx="${CARD_WIDTH - 79}" cy="79" r="21" fill="none" stroke="${INK}" stroke-width="7"/>
    <polygon points="58,${CARD_HEIGHT - 58} 100,${CARD_HEIGHT - 58} 58,${CARD_HEIGHT - 100}"/>
    <text class="display" x="${CARD_WIDTH - 62}" y="${CARD_HEIGHT - 58}" text-anchor="end" font-size="50" font-weight="700">${number}</text>
  </g>`
}

/** Disco do corpo celeste, com textura pontilhada e anéis quando houver. */
function emblem(body: CelestialBody, random: () => number): string {
  const cx = CARD_WIDTH / 2
  const cy = EMBLEM_CY
  const r = EMBLEM_R

  const stipple: string[] = []
  for (let i = 0; i < 520; i++) {
    // Amostragem uniforme dentro do círculo (sqrt evita acúmulo no centro).
    const angle = random() * Math.PI * 2
    const distance = Math.sqrt(random()) * r * 0.97
    const size = 1 + random() * 4.4
    stipple.push(
      `<circle cx="${(cx + Math.cos(angle) * distance).toFixed(1)}" cy="${(cy + Math.sin(angle) * distance).toFixed(1)}" r="${size.toFixed(1)}" fill="${INK}" opacity="${(0.18 + random() * 0.5).toFixed(2)}"/>`,
    )
  }

  const rings = body.visual.rings
    ? `<g transform="translate(${cx} ${cy}) rotate(-17)">
        <ellipse rx="${r * 1.46}" ry="${r * 0.38}" fill="none" stroke="${INK}" stroke-width="9" opacity="0.85"/>
        <ellipse rx="${r * 1.32}" ry="${r * 0.34}" fill="none" stroke="${INK}" stroke-width="4" opacity="0.6"/>
        <ellipse rx="${r * 1.19}" ry="${r * 0.3}" fill="none" stroke="${INK}" stroke-width="6" opacity="0.75"/>
      </g>`
    : ''

  return `<g>
    ${rings}
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${body.accent}" stroke="${INK}" stroke-width="7"/>
    <clipPath id="disc-${body.id}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>
    <g clip-path="url(#disc-${body.id})">${stipple.join('')}</g>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${INK}" stroke-width="7"/>
  </g>`
}

export interface QRModules {
  size: number
  data: ArrayLike<number>
  url: string
}

/**
 * O QR abre a ficha do corpo celeste no modo sem AR. Assim a carta impressa
 * funciona também para quem não vai usar a câmera.
 */
function qrBlock({ size, data }: QRModules, body: CelestialBody): string {
  const box = QR_SIZE
  const x = QR_X
  const y = QR_Y
  const cell = box / size

  const cells: string[] = []
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      if (!data[row * size + column]) continue
      cells.push(
        `<rect x="${(x + column * cell).toFixed(2)}" y="${(y + row * cell).toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}"/>`,
      )
    }
  }

  const textX = x + box + 30

  return `<g>
    <g fill="${INK}">${cells.join('')}</g>
    <text class="body-text" x="${textX}" y="${y + 36}" font-size="24" font-weight="600" fill="${INK}">Aponte a câmera</text>
    <text class="body-text" x="${textX}" y="${y + 66}" font-size="24" font-weight="600" fill="${INK}">do app para a carta.</text>
    <text class="body-text" x="${textX}" y="${y + 106}" font-size="19" fill="${INK}" opacity="0.62">Ou leia o QR para abrir a</text>
    <text class="body-text" x="${textX}" y="${y + 130}" font-size="19" fill="${INK}" opacity="0.62">ficha de ${escapeXML(body.name)} sem AR.</text>
  </g>`
}

export async function buildQRModules(url: string): Promise<QRModules> {
  const qr = QRCode.create(url, { errorCorrectionLevel: 'M' })
  return { size: qr.modules.size, data: qr.modules.data, url }
}

function escapeXML(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
