import { Chip } from '@/components/Chip.tsx'
import { LinkButton } from '@/components/LinkButton.tsx'
import { PrinterIcon } from '@/components/icons.tsx'
import { bodies } from '@/content/bodies.ts'
import { usePageTitle } from '@/hooks/usePageTitle.ts'

const CARDS_PDF = `${import.meta.env.BASE_URL}cards/orbita-cartas.pdf`

/**
 * Página das cartas imprimíveis.
 *
 * As cartas são nossas, desenhadas para este app: ninguém precisa comprar um
 * baralho para usar o projeto, e o desenho é otimizado para o rastreamento.
 */
export function CardsPage() {
  usePageTitle('Cartas para imprimir')

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="font-display text-3xl font-semibold">Cartas para imprimir</h1>
      <p className="mt-2 max-w-prose text-fg-muted">
        Dez cartas em uma folha A4. Imprima, recorte e aponte a câmera. O arquivo é gratuito e as
        cartas foram desenhadas especialmente para este app.
      </p>

      <div className="mt-6">
        <LinkButton
          to={CARDS_PDF}
          reloadDocument
          target="_blank"
          rel="noopener"
          icon={<PrinterIcon className="size-5" />}
        >
          Baixar o PDF das cartas (abre em nova aba)
        </LinkButton>
      </div>

      <section className="mt-10" aria-labelledby="dicas-impressao">
        <h2 id="dicas-impressao" className="font-display text-xl font-semibold">
          Dicas de impressão
        </h2>
        <ul className="mt-3 space-y-3 pl-5 text-fg-muted">
          <li>
            <strong className="text-fg">Use papel fosco.</strong> Papel brilhante ou plastificado
            reflete a luz e atrapalha o reconhecimento.
          </li>
          <li>
            <strong className="text-fg">Imprima em tamanho real (100%).</strong> Desative o ajuste
            automático à página: a proporção da carta é o que o rastreador espera.
          </li>
          <li>
            <strong className="text-fg">Papel mais grosso ajuda.</strong> Cartas onduladas deformam
            a imagem. Colar em papel-cartão resolve.
          </li>
          <li>
            <strong className="text-fg">Evite sombra dura sobre a carta.</strong> Luz difusa e
            uniforme dá o rastreamento mais estável.
          </li>
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="o-que-vem">
        <h2 id="o-que-vem" className="font-display text-xl font-semibold">
          O que vem no baralho
        </h2>
        <p className="mt-2 text-fg-muted">
          Cada carta traz o nome em tipografia grande e um código QR que abre a ficha do corpo
          celeste direto no modo sem AR — assim a carta também funciona para quem não vai usar a
          câmera.
        </p>
        <ul className="mt-4 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3">
          {bodies.map((body) => (
            <li
              key={body.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3"
            >
              <span
                aria-hidden="true"
                className="size-8 shrink-0 rounded-full"
                style={{
                  background: `radial-gradient(circle at 35% 30%, ${body.accent}, ${body.accent}22 70%)`,
                }}
              />
              <span className="min-w-0">
                <span className="block truncate font-medium text-fg">{body.name}</span>
                <Chip className="mt-1">{String(body.order).padStart(2, '0')}</Chip>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
