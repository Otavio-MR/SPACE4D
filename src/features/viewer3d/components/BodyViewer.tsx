import { Canvas } from '@react-three/fiber'
import { useCallback, useState } from 'react'

import { IconButton } from '@/components/IconButton.tsx'
import { ArrowLeftIcon, RotateIcon } from '@/components/icons.tsx'
import type { CelestialBody } from '@/content/types.ts'
import { useMotionEnabled } from '@/features/settings/useMotionEnabled.ts'

import { cameraDistance } from '../lib/framing.ts'
import { PlanetMesh } from './PlanetMesh.tsx'
import { Starfield } from './Starfield.tsx'

const FOV = 45
const ROTATION_STEP = Math.PI / 12
const MAX_TILT = Math.PI / 2.4

/*
 * A vista inicial fica um pouco acima do equador. Exatamente no plano equatorial
 * os anéis de Saturno e de Urano ficam de perfil e somem — tecnicamente correto,
 * visualmente inútil. Um leve mergulho mostra a forma dos anéis e dá volume à
 * esfera.
 */
const INITIAL_VIEW = { x: -0.34, y: 0 }

/**
 * Visualizador 3D do corpo celeste no modo sem AR.
 *
 * O canvas é uma imagem descrita (`role="img"` com audiodescrição) e os controles
 * são botões de verdade, e não teclas capturadas num elemento não interativo.
 * Botões nativos já trazem foco, papel, nome e ativação por Enter/Espaço — que é
 * exatamente o que a WCAG 2.1.1 pede, sem reimplementar nada.
 */
export function BodyViewer({ body }: { body: CelestialBody }) {
  const animated = useMotionEnabled()
  const [rotation, setRotation] = useState(INITIAL_VIEW)

  const nudge = useCallback((dx: number, dy: number) => {
    setRotation((current) => ({
      x: Math.max(-MAX_TILT, Math.min(MAX_TILT, current.x + dx)),
      y: current.y + dy,
    }))
  }, [])

  return (
    <figure className="m-0">
      <div
        role="img"
        aria-label={`Modelo tridimensional de ${body.name}. ${body.appearance}`}
        className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-black/40"
      >
        <Canvas
          // A distância acompanha o tamanho do corpo: os anéis de Saturno ocupam
          // mais que o dobro do raio da esfera e ficariam fora do quadro.
          camera={{ position: [0, 0, cameraDistance(body.visual, FOV)], fov: FOV }}
          // Sem animação o laço de render para: economiza bateria e processamento.
          frameloop={animated ? 'always' : 'demand'}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
        >
          <color attach="background" args={['#05070f']} />
          <Starfield />
          <PlanetMesh visual={body.visual} animated={animated} manualRotation={rotation} />
        </Canvas>
      </div>

      <div
        role="group"
        aria-label={`Girar o modelo de ${body.name}`}
        className="mt-3 flex flex-wrap items-center gap-2"
      >
        <IconButton
          label="Girar para a esquerda"
          icon={<ArrowLeftIcon className="size-5" />}
          onClick={() => nudge(0, -ROTATION_STEP)}
        />
        <IconButton
          label="Girar para a direita"
          icon={<ArrowLeftIcon className="size-5 -scale-x-100" />}
          onClick={() => nudge(0, ROTATION_STEP)}
        />
        <IconButton
          label="Inclinar para cima"
          icon={<ArrowLeftIcon className="size-5 rotate-90" />}
          onClick={() => nudge(-ROTATION_STEP, 0)}
        />
        <IconButton
          label="Inclinar para baixo"
          icon={<ArrowLeftIcon className="size-5 -rotate-90" />}
          onClick={() => nudge(ROTATION_STEP, 0)}
        />
        <IconButton
          label="Voltar à posição inicial"
          icon={<RotateIcon className="size-5" />}
          onClick={() => setRotation(INITIAL_VIEW)}
        />
      </div>

      <figcaption className="mt-3 text-sm text-fg-muted">{body.appearance}</figcaption>
    </figure>
  )
}
