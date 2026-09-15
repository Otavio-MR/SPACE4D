/**
 * Compila as imagens das cartas no arquivo de alvos do mind-ar.
 *
 * Saída: public/targets/orbita.mind
 * Uso:   npm run cards:compile   (rode `npm run cards:generate` antes)
 *
 * O compilador do mind-ar só existe para o navegador — extrai features com
 * TensorFlow.js e WebGL. Por isso abrimos um Chromium headless, servimos o
 * projeto por HTTP (os módulos ESM vendorizados usam importações relativas) e
 * trazemos o resultado de volta para o Node.
 *
 * A ORDEM DOS ALVOS IMPORTA: o índice de cada alvo no arquivo é o índice do
 * corpo em `src/content/bodies.ts`, que é como `ARScene` associa cada âncora ao
 * seu modelo 3D. Recompile sempre que a lista mudar.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { chromium } from 'playwright'

import { bodies } from '../../src/content/bodies.ts'
import { startStaticServer } from '../lib/static-server.ts'

const ROOT = resolve(import.meta.dirname, '../..')
const OUT_FILE = resolve(ROOT, 'public/targets/orbita.mind')

interface EvaluateInput {
  urls: string[]
  modulePath: string
}

interface MindARCompiler {
  compileImageTargets(
    images: HTMLImageElement[],
    onProgress: (percent: number) => void,
  ): Promise<unknown>
  exportData(): Promise<ArrayBuffer>
}

async function main(): Promise<void> {
  const server = await startStaticServer(ROOT)
  // O rastreador do mind-ar registra kernels do TensorFlow.js só para o backend
  // WebGL. Sem GPU, o Chromium headless cai no backend `cpu` e a compilação
  // falha com "Kernel 'BinomialFilter' not registered"; o SwiftShader dá a ele
  // uma implementação de WebGL por software.
  const browser = await chromium.launch({
    args: [
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
    ],
  })

  try {
    const page = await browser.newPage()
    page.on('console', (message) => {
      const type = message.type()
      if (type === 'error' || type === 'log') console.log(`[navegador:${type}]`, message.text())
    })
    page.on('pageerror', (error) => console.error('[navegador:exceção]', error.message))
    page.on('crash', () => console.error('[navegador] a aba travou'))
    await page.goto(`${server.origin}/`, { waitUntil: 'domcontentloaded' })

    // O servidor expõe a raiz do repositório, então o caminho inclui `public/`
    // (em produção o Vite serve essa pasta na raiz do site).
    const imageUrls = bodies.map((body) => `/public/cards/${body.id}.png`)
    console.log(`Compilando ${imageUrls.length} alvos…`)

    const base64 = await page.evaluate(
      async ({ urls, modulePath }: EvaluateInput) => {
        // O caminho vem como dado, não como literal: o TypeScript do Node não deve
        // tentar resolver uma URL que só existe dentro da página.
        const module = (await import(modulePath)) as { Compiler: new () => MindARCompiler }
        const compiler = new module.Compiler()

        const images = await Promise.all(
          urls.map(
            (url) =>
              new Promise<HTMLImageElement>((done, fail) => {
                const image = new Image()
                image.onload = () => done(image)
                image.onerror = () => fail(new Error(`falha ao carregar ${url}`))
                image.src = url
              }),
          ),
        )

        let lastReported = -1
        await compiler.compileImageTargets(images, (percent: number) => {
          const step = Math.floor(percent / 10) * 10
          if (step > lastReported) {
            lastReported = step
            console.log(`progresso ${step}%`)
          }
        })

        const exported = await compiler.exportData()
        const bytes = new Uint8Array(exported as ArrayBuffer)

        // Transferir o binário como base64 evita que o bridge o converta em um
        // objeto com milhares de chaves numéricas.
        let binary = ''
        const CHUNK = 0x8000
        for (let i = 0; i < bytes.length; i += CHUNK) {
          binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
        }
        return btoa(binary)
      },
      { urls: imageUrls, modulePath: '/src/vendor/mind-ar/mindar-image.prod.js' },
    )

    const buffer = Buffer.from(base64, 'base64')
    await mkdir(resolve(ROOT, 'public/targets'), { recursive: true })
    await writeFile(OUT_FILE, buffer)

    console.log('\nAlvos compilados em public/targets/orbita.mind')
    console.log(`${(buffer.byteLength / 1024 / 1024).toFixed(2)} MB — índices:`)
    bodies.forEach((body, index) => console.log(`  ${index}  ${body.name}`))
  } finally {
    await browser.close()
    await server.close()
  }
}

await main()
