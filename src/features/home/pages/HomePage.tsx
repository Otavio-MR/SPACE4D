import { LinkButton } from '@/components/LinkButton.tsx'
import { CameraIcon, GridIcon, PrinterIcon } from '@/components/icons.tsx'
import { bodies } from '@/content/bodies.ts'
import { usePageTitle } from '@/hooks/usePageTitle.ts'

export function HomePage() {
  usePageTitle()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <section className="text-center">
        <p className="font-display text-sm font-medium tracking-[0.2em] text-primary uppercase">
          Cartas de realidade aumentada
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-balance sm:text-5xl">
          O Sistema Solar na palma da mão
        </h1>
        <p className="mx-auto mt-4 max-w-prose text-lg text-fg-muted text-pretty">
          Aponte a câmera para uma carta impressa e veja o corpo celeste surgir em 3D. Sem carta,
          sem câmera ou sem vontade de apontar o celular? O mesmo conteúdo está no catálogo.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton to="/ar" icon={<CameraIcon className="size-5" />}>
            Abrir a câmera
          </LinkButton>
          <LinkButton variant="secondary" to="/catalogo" icon={<GridIcon className="size-5" />}>
            Explorar sem AR
          </LinkButton>
        </div>
      </section>

      <section className="mt-16" aria-labelledby="como-funciona">
        <h2 id="como-funciona" className="font-display text-2xl font-semibold">
          Como funciona
        </h2>
        <ol className="mt-5 grid list-none gap-4 p-0 sm:grid-cols-3">
          {[
            {
              title: 'Imprima as cartas',
              text: 'Baixe o PDF e imprima em papel fosco. São dez cartas, uma para cada corpo celeste.',
            },
            {
              title: 'Aponte a câmera',
              text: 'Abra a câmera no app e enquadre uma carta. O reconhecimento acontece no próprio aparelho.',
            },
            {
              title: 'Explore',
              text: 'Gire o modelo, ouça a narração e leia a ficha completa com dados e curiosidades.',
            },
          ].map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-border bg-surface p-5">
              <span
                aria-hidden="true"
                className="grid size-9 place-items-center rounded-full bg-primary font-display font-bold text-on-primary"
              >
                {index + 1}
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-fg-muted">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6">
          <LinkButton variant="secondary" to="/cartas" icon={<PrinterIcon className="size-5" />}>
            Baixar e imprimir as cartas
          </LinkButton>
        </div>
      </section>

      <section className="mt-16" aria-labelledby="no-baralho">
        <h2 id="no-baralho" className="font-display text-2xl font-semibold">
          No baralho
        </h2>
        <ul className="mt-5 flex list-none flex-wrap gap-3 p-0">
          {bodies.map((body) => (
            <li key={body.id}>
              <a
                href={`/corpo/${body.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface py-2 pr-4 pl-2 text-sm font-medium text-fg-muted transition-colors hover:border-border-strong hover:text-fg"
              >
                <span
                  aria-hidden="true"
                  className="size-6 rounded-full"
                  style={{
                    background: `radial-gradient(circle at 35% 30%, ${body.accent}, ${body.accent}22 70%)`,
                  }}
                />
                {body.name}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
