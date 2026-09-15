/**
 * Gera as cartas imprimíveis.
 *
 * Saídas:
 *   public/cards/<id>.png        — uma imagem por carta, usada para compilar os alvos
 *   public/cards/orbita-cartas.pdf — folhas A4 prontas para imprimir
 *
 * Uso: npm run cards:generate
 *
 * A URL do QR vem de CARDS_BASE_URL (padrão: http://localhost:5173). Aponte-a para
 * o endereço onde o app está publicado antes de gerar as cartas definitivas.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { chromium, type Browser } from 'playwright'

import { bodies } from '../../src/content/bodies.ts'
import { startStaticServer } from '../lib/static-server.ts'
import { CARD_HEIGHT, CARD_WIDTH, buildQRModules, renderCardSVG } from './design.ts'

const ROOT = resolve(import.meta.dirname, '../..')
const OUT_DIR = resolve(ROOT, 'public/cards')
const BASE_URL = process.env.CARDS_BASE_URL ?? 'http://localhost:5173'

/** Carta padrão, em milímetros: 9 cabem numa folha A4 com margem de 10 mm. */
const CARD_MM = { width: 63.5, height: 88.9 }
const PER_SHEET = 9

async function renderCardPNG(browser: Browser, origin: string, svg: string): Promise<Buffer> {
  const page = await browser.newPage({
    viewport: { width: CARD_WIDTH, height: CARD_HEIGHT },
    deviceScaleFactor: 1,
  })
  try {
    // A página precisa vir da origem servida para que as fontes carreguem.
    await page.goto(`${origin}/`, { waitUntil: 'domcontentloaded' })
    await page.setContent(
      `<!doctype html><html><head><meta charset="utf-8"><style>
         html,body{margin:0;padding:0;width:${CARD_WIDTH}px;height:${CARD_HEIGHT}px;overflow:hidden}
       </style></head><body>${svg}</body></html>`,
      { waitUntil: 'load' },
    )
    await page.evaluate(() => document.fonts.ready)
    return await page.screenshot({ type: 'png' })
  } finally {
    await page.close()
  }
}

function sheetHTML(svgs: string[]): string {
  const pages: string[] = []
  for (let start = 0; start < svgs.length; start += PER_SHEET) {
    const cards = svgs.slice(start, start + PER_SHEET)
    pages.push(
      `<section class="sheet">${cards.map((svg) => `<div class="slot">${svg}</div>`).join('')}</section>`,
    )
  }

  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  .sheet {
    width: 210mm; height: 297mm; padding: 10mm 9.75mm;
    display: grid; grid-template-columns: repeat(3, ${CARD_MM.width}mm);
    grid-auto-rows: ${CARD_MM.height}mm; justify-content: center; align-content: start;
    page-break-after: always; break-after: page;
  }
  .sheet:last-child { page-break-after: auto; break-after: auto; }
  /* A guia de corte fica FORA da arte: nada de linha tracejada sobre a carta,
     que atrapalharia o rastreamento. */
  .slot { position: relative; outline: 0.2mm dashed rgba(0,0,0,0.35); outline-offset: 0; }
  .slot svg { display: block; width: 100%; height: 100%; }
</style></head>
<body>${pages.join('')}</body></html>`
}

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true })
  const server = await startStaticServer(ROOT)
  const browser = await chromium.launch()

  try {
    const svgs: string[] = []

    for (const body of bodies) {
      const url = new URL(`/corpo/${body.id}`, BASE_URL).toString()
      const qr = await buildQRModules(url)
      const svg = renderCardSVG(body, qr)
      svgs.push(svg)

      const png = await renderCardPNG(browser, server.origin, svg)
      await writeFile(resolve(OUT_DIR, `${body.id}.png`), png)
      console.log(
        `carta ${String(body.order).padStart(2, '0')} ${body.name.padEnd(10)} → ${body.id}.png  (QR: ${url})`,
      )
    }

    const page = await browser.newPage()
    await page.goto(`${server.origin}/`, { waitUntil: 'domcontentloaded' })
    await page.setContent(sheetHTML(svgs), { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    const pdf = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true })
    await page.close()
    await writeFile(resolve(OUT_DIR, 'orbita-cartas.pdf'), pdf)

    console.log(`\n${bodies.length} cartas geradas em public/cards/`)
    console.log(
      `PDF com ${Math.ceil(bodies.length / PER_SHEET)} folha(s) A4: public/cards/orbita-cartas.pdf`,
    )
  } finally {
    await browser.close()
    await server.close()
  }
}

await main()
