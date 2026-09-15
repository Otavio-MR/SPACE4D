import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer, type Server } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.mind': 'application/octet-stream',
}

export interface StaticServer {
  origin: string
  close: () => Promise<void>
}

/**
 * Servidor estático mínimo usado pelas ferramentas de build.
 *
 * O compilador do mind-ar só roda no navegador, e o build vendorizado usa
 * importações relativas entre módulos ESM — o que exige uma origem HTTP de
 * verdade, não `file://`.
 */
export async function startStaticServer(rootDir: string): Promise<StaticServer> {
  const root = resolve(rootDir)

  const server: Server = createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost')

    // Página vazia na raiz: as ferramentas precisam de um documento real na
    // origem servida antes de importar módulos ou injetar conteúdo.
    if (url.pathname === '/') {
      const html =
        '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>build</title></head><body></body></html>'
      response.writeHead(200, { 'content-type': MIME['.html'] }).end(html)
      return
    }

    // `normalize` + verificação de prefixo impedem sair da raiz servida.
    const filePath = join(root, normalize(decodeURIComponent(url.pathname)))
    if (!filePath.startsWith(root)) {
      response.writeHead(403).end('Forbidden')
      return
    }

    stat(filePath)
      .then((stats) => {
        if (!stats.isFile()) throw new Error('not a file')
        response.writeHead(200, {
          'content-type': MIME[extname(filePath)] ?? 'application/octet-stream',
          'content-length': stats.size,
        })
        createReadStream(filePath).pipe(response)
      })
      .catch(() => {
        response.writeHead(404).end('Not found')
      })
  })

  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done))
  const address = server.address()
  if (address === null || typeof address === 'string') {
    throw new Error('Não foi possível determinar a porta do servidor estático')
  }

  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () => new Promise<void>((done) => server.close(() => done())),
  }
}
