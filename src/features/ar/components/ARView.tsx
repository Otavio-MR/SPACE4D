import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import { Link } from 'react-router'

import { useAnnouncer } from '@/components/useAnnouncer.ts'
import { Button } from '@/components/Button.tsx'
import { IconButton } from '@/components/IconButton.tsx'
import { LinkButton } from '@/components/LinkButton.tsx'
import { Spinner } from '@/components/Spinner.tsx'
import { GridIcon, InfoIcon, SpeakerIcon, StopIcon } from '@/components/icons.tsx'
import { bodies } from '@/content/bodies.ts'
import { useSettings } from '@/features/settings/store.ts'
import { useSpeech } from '@/hooks/useSpeech.ts'
import { arUnavailableReason, isARAvailable } from '@/lib/env.ts'

import { useARSession } from '../hooks/useARSession.ts'
import { ARScene } from './ARScene.tsx'
import { ScanGuide } from './ScanGuide.tsx'

const TARGET_SRC = `${import.meta.env.BASE_URL}targets/orbita.mind`

/**
 * Tela de realidade aumentada.
 *
 * O painel inferior é HTML comum sobre o canvas — não texto desenhado em 3D —
 * para que seja selecionável, aumentável e legível por leitor de tela.
 */
export function ARView() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const session = useARSession({ videoRef, targetSrc: TARGET_SRC })
  const { announce } = useAnnouncer()
  const speech = useSpeech()
  const { haptics, speech: speechEnabled, arLabels } = useSettings()

  const visibleTargets = useSyncExternalStore(
    session.store.subscribe,
    session.store.getVisibleTargets,
  )
  const activeBody = visibleTargets.length > 0 ? bodies[visibleTargets[0]] : null
  const previousBodyId = useRef<string | null>(null)

  const unavailableReason = useMemo(() => (isARAvailable() ? null : arUnavailableReason()), [])

  // Reconhecer uma carta é uma mudança de contexto que acontece sem foco:
  // precisa ser anunciada, vibrar e (se pedido) ser narrada.
  useEffect(() => {
    const currentId = activeBody?.id ?? null
    if (currentId === previousBodyId.current) return
    previousBodyId.current = currentId

    if (activeBody) {
      announce(`Carta reconhecida: ${activeBody.name}. ${activeBody.tagline}.`)
      if (haptics && typeof navigator.vibrate === 'function') navigator.vibrate(40)
      if (speechEnabled) speech.speak(`${activeBody.name}. ${activeBody.summary}`)
    } else {
      announce('Nenhuma carta à vista. Aponte a câmera para uma carta.')
      speech.stop()
    }
  }, [activeBody, announce, haptics, speechEnabled, speech])

  if (unavailableReason) {
    return <ARUnavailable reason={unavailableReason} />
  }

  return (
    <div className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="absolute inset-0 size-full object-cover"
        playsInline
        muted
        // Um leitor de tela não tem o que fazer com a imagem crua da câmera.
        aria-hidden="true"
        tabIndex={-1}
      />

      {session.status === 'ready' && session.projectionMatrix && session.inputSize ? (
        <ARScene
          store={session.store}
          projectionMatrix={session.projectionMatrix}
          inputSize={session.inputSize}
        />
      ) : null}

      <ScanGuide active={Boolean(activeBody)} />

      {session.status !== 'ready' ? (
        <div className="absolute inset-0 grid place-items-center bg-black/70 p-6 text-center">
          {session.status === 'denied' || session.status === 'error' ? (
            <div className="max-w-sm">
              <h2 className="font-display text-xl font-semibold text-fg">
                Não deu para abrir a câmera
              </h2>
              <p className="mt-2 text-fg-muted">{session.message}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button onClick={session.retry}>Tentar de novo</Button>
                <LinkButton variant="secondary" to="/catalogo">
                  Ver sem AR
                </LinkButton>
              </div>
            </div>
          ) : (
            <Spinner
              label={
                session.status === 'requesting-camera'
                  ? 'Pedindo acesso à câmera…'
                  : 'Preparando o rastreamento das cartas…'
              }
            />
          )}
        </div>
      ) : null}

      {/* Painel de informação da carta reconhecida. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
        {activeBody ? (
          <article className="pointer-events-auto mx-auto max-w-md rounded-2xl border border-white/15 bg-black/75 p-4 text-white backdrop-blur-md">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2
                  className="font-display text-2xl font-semibold"
                  style={{ color: activeBody.accent }}
                >
                  {activeBody.name}
                </h2>
                <p className="text-sm text-white/80">{activeBody.tagline}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {speech.supported ? (
                  <IconButton
                    tone="onCamera"
                    label={speech.speaking ? 'Parar narração' : `Ouvir sobre ${activeBody.name}`}
                    icon={speech.speaking ? <StopIcon /> : <SpeakerIcon />}
                    onClick={() =>
                      speech.speaking
                        ? speech.stop()
                        : speech.speak(`${activeBody.name}. ${activeBody.summary}`)
                    }
                  />
                ) : null}
                <Link
                  to={`/corpo/${activeBody.id}`}
                  aria-label={`Abrir a ficha completa de ${activeBody.name}`}
                  className="touch-target inline-flex items-center justify-center rounded-full border border-white/25 bg-black/65 text-white hover:bg-black/80"
                >
                  <InfoIcon aria-hidden="true" />
                </Link>
              </div>
            </div>
            <p className="mt-3 line-clamp-3 text-sm text-white/90">{activeBody.summary}</p>
          </article>
        ) : session.status === 'ready' ? (
          <p className="pointer-events-auto mx-auto max-w-md rounded-2xl border border-white/15 bg-black/70 px-4 py-3 text-center text-sm text-white backdrop-blur-md">
            Aponte a câmera para uma carta do baralho.{' '}
            <Link to="/cartas" className="font-semibold underline underline-offset-2">
              Não tem as cartas?
            </Link>
          </p>
        ) : null}
      </div>

      {arLabels && activeBody ? (
        <p
          className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-black/70 px-4 py-1.5 font-display text-sm font-semibold text-white backdrop-blur-md"
          aria-hidden="true"
        >
          {activeBody.name}
        </p>
      ) : null}
    </div>
  )
}

function ARUnavailable({ reason }: { reason: string }) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="font-display text-2xl font-semibold">Realidade aumentada indisponível</h1>
      <p className="mt-3 text-fg-muted">{reason}</p>
      <p className="mt-6 text-fg-muted">
        Todo o conteúdo das cartas também está disponível sem a câmera, com os modelos em 3D e as
        fichas completas.
      </p>
      <div className="mt-6 flex justify-center">
        <LinkButton to="/catalogo" icon={<GridIcon className="size-5" />}>
          Explorar sem AR
        </LinkButton>
      </div>
    </div>
  )
}
