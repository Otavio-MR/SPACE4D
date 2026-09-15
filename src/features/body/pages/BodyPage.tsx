import { Link, useParams } from 'react-router'

import { Button } from '@/components/Button.tsx'
import { Chip } from '@/components/Chip.tsx'
import { LinkButton } from '@/components/LinkButton.tsx'
import { ArrowLeftIcon, CameraIcon, SpeakerIcon, StopIcon } from '@/components/icons.tsx'
import { KIND_LABELS, bodies, getBody } from '@/content/bodies.ts'
import { BodyViewer } from '@/features/viewer3d/components/BodyViewer.tsx'
import { usePageTitle } from '@/hooks/usePageTitle.ts'
import { useSpeech } from '@/hooks/useSpeech.ts'

import { FactList } from '../components/FactList.tsx'

export function BodyPage() {
  const { id } = useParams()
  const body = id ? getBody(id) : undefined
  usePageTitle(body?.name ?? 'Corpo não encontrado')
  const speech = useSpeech()

  if (!body) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold">Corpo celeste não encontrado</h1>
        <p className="mt-3 text-fg-muted">
          O endereço acessado não corresponde a nenhuma carta do baralho.
        </p>
        <div className="mt-6 flex justify-center">
          <LinkButton to="/catalogo">Ver o catálogo</LinkButton>
        </div>
      </div>
    )
  }

  const index = bodies.findIndex((item) => item.id === body.id)
  const previous = bodies[index - 1]
  const next = bodies[index + 1]
  const narration = `${body.name}. ${body.tagline}. ${body.summary}`

  return (
    <article className="mx-auto w-full max-w-5xl px-4 py-8">
      <Link
        to="/catalogo"
        className="inline-flex items-center gap-2 text-sm font-medium text-fg-muted hover:text-fg"
      >
        <ArrowLeftIcon className="size-5" aria-hidden="true" />
        Voltar ao catálogo
      </Link>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <Chip accent={body.accent}>{KIND_LABELS[body.kind]}</Chip>
          <Chip>Carta {String(body.order).padStart(2, '0')}</Chip>
        </div>
        <h1 className="mt-3 font-display text-4xl font-semibold" style={{ color: body.accent }}>
          {body.name}
        </h1>
        <p className="mt-1 text-lg text-fg-muted">{body.tagline}</p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
        <BodyViewer body={body} />

        <div className="min-w-0">
          <p className="max-w-prose text-lg leading-relaxed text-fg">{body.summary}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            {speech.supported ? (
              <Button
                variant="secondary"
                icon={
                  speech.speaking ? (
                    <StopIcon className="size-5" />
                  ) : (
                    <SpeakerIcon className="size-5" />
                  )
                }
                onClick={() => (speech.speaking ? speech.stop() : speech.speak(narration))}
              >
                {speech.speaking ? 'Parar narração' : 'Ouvir'}
              </Button>
            ) : null}
            <LinkButton variant="secondary" to="/ar" icon={<CameraIcon className="size-5" />}>
              Ver em AR
            </LinkButton>
          </div>

          <section className="mt-8" aria-labelledby="ficha-tecnica">
            <h2 id="ficha-tecnica" className="font-display text-xl font-semibold">
              Ficha técnica
            </h2>
            <div className="mt-2">
              <FactList facts={body.facts} />
            </div>
          </section>

          <section className="mt-8" aria-labelledby="curiosidades">
            <h2 id="curiosidades" className="font-display text-xl font-semibold">
              Curiosidades
            </h2>
            <ul className="mt-3 space-y-3 pl-5">
              {body.curiosities.map((curiosity) => (
                <li key={curiosity} className="text-fg-muted marker:text-primary">
                  {curiosity}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <nav
        aria-label="Navegar entre os corpos celestes"
        className="mt-12 flex justify-between gap-4 border-t border-border pt-6"
      >
        {previous ? (
          <Link to={`/corpo/${previous.id}`} className="group max-w-[45%] text-left">
            <span className="block text-xs text-fg-subtle">Anterior</span>
            <span className="font-display font-semibold text-fg-muted group-hover:text-fg">
              {previous.name}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/corpo/${next.id}`} className="group max-w-[45%] text-right">
            <span className="block text-xs text-fg-subtle">Próximo</span>
            <span className="font-display font-semibold text-fg-muted group-hover:text-fg">
              {next.name}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  )
}
