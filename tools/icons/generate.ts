/**
 * Gera os ícones do PWA a partir de um SVG único.
 *
 * Saída: public/icons/{icon-192,icon-512,icon-512-maskable}.png e favicon.svg
 * Uso:   npm run icons
 *
 * A versão `maskable` mantém a arte dentro da zona segura (80% do quadro), que é
 * o que o Android recorta ao aplicar a máscara do sistema.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { chromium } from 'playwright'

const ROOT = resolve(import.meta.dirname, '../..')
const OUT_DIR = resolve(ROOT, 'public/icons')

const BG = '#0b0f1a'

function iconSVG({ maskable }: { maskable: boolean }): string {
  // Sem máscara o planeta ocupa mais espaço; com máscara, encolhe para a zona segura.
  const scale = maskable ? 0.62 : 0.78
  const cx = 256
  const cy = 256
  const r = 150 * scale * (maskable ? 1.28 : 1)

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="planeta" cx="35%" cy="30%">
      <stop offset="0%" stop-color="#e3f3ff"/>
      <stop offset="45%" stop-color="#9bd4ff"/>
      <stop offset="100%" stop-color="#1b3a6b"/>
    </radialGradient>
    <linearGradient id="anel" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffd166" stop-opacity="0.25"/>
      <stop offset="50%" stop-color="#ffd166"/>
      <stop offset="100%" stop-color="#ffd166" stop-opacity="0.25"/>
    </linearGradient>
  </defs>

  <rect width="512" height="512" fill="${BG}"/>
  <g transform="translate(${cx} ${cy})">
    <g transform="rotate(-22)">
      <ellipse rx="${r * 1.62}" ry="${r * 0.42}" fill="none" stroke="url(#anel)" stroke-width="${r * 0.16}"/>
    </g>
    <circle r="${r}" fill="url(#planeta)"/>
  </g>
</svg>`
}

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch()

  try {
    const variants = [
      { file: 'icon-512.png', size: 512, maskable: false },
      { file: 'icon-192.png', size: 192, maskable: false },
      { file: 'icon-512-maskable.png', size: 512, maskable: true },
    ]

    for (const variant of variants) {
      const page = await browser.newPage({
        viewport: { width: variant.size, height: variant.size },
      })
      await page.setContent(
        `<!doctype html><html><head><meta charset="utf-8"><style>
           html,body{margin:0;padding:0;width:${variant.size}px;height:${variant.size}px;overflow:hidden}
           svg{display:block;width:100%;height:100%}
         </style></head><body>${iconSVG({ maskable: variant.maskable })}</body></html>`,
        { waitUntil: 'load' },
      )
      await writeFile(resolve(OUT_DIR, variant.file), await page.screenshot({ type: 'png' }))
      await page.close()
      console.log(`${variant.file} (${variant.size}×${variant.size})`)
    }

    await writeFile(resolve(OUT_DIR, 'favicon.svg'), iconSVG({ maskable: false }))
    console.log('favicon.svg')
  } finally {
    await browser.close()
  }
}

await main()
