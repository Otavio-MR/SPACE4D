import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'

import { bodies } from '@/content/bodies.ts'
import { useMotionEnabled } from '@/features/settings/useMotionEnabled.ts'
import { PlanetMesh } from '@/features/viewer3d/components/PlanetMesh.tsx'
import { arScale } from '@/features/viewer3d/lib/framing.ts'

import { applyARProjection } from '../lib/camera-projection.ts'
import type { TrackingStore } from '../lib/tracking-store.ts'

interface ARSceneProps {
  store: TrackingStore
  projectionMatrix: number[]
  inputSize: { width: number; height: number }
}

/** Mantém a câmera do three.js alinhada à imagem da câmera do aparelho. */
function ARCamera({
  projectionMatrix,
  inputSize,
}: {
  projectionMatrix: number[]
  inputSize: { width: number; height: number }
}) {
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)

  useLayoutEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return
    applyARProjection(camera, projectionMatrix, inputSize, {
      width: size.width,
      height: size.height,
    })
  }, [camera, projectionMatrix, inputSize, size.width, size.height])

  return null
}

/**
 * Âncora de um alvo. A matriz vem do rastreador a cada quadro; por isso o grupo
 * tem `matrixAutoUpdate` desligado e recebe a matriz diretamente, sem passar
 * pelo estado do React.
 */
function TargetAnchor({
  store,
  targetIndex,
  children,
}: {
  store: TrackingStore
  targetIndex: number
  children: React.ReactNode
}) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    const group = groupRef.current
    if (!group) return
    const matrix = store.matrices.get(targetIndex)
    group.visible = matrix !== undefined
    if (matrix) group.matrix.copy(matrix)
  })

  return (
    <group ref={groupRef} matrixAutoUpdate={false} visible={false}>
      {children}
    </group>
  )
}

/**
 * Cena 3D sobreposta à câmera. O canvas é transparente e fica marcado como
 * decorativo: quem usa leitor de tela recebe a informação pela região viva e
 * pelo painel de conteúdo, não por aqui.
 */
export function ARScene({ store, projectionMatrix, inputSize }: ARSceneProps) {
  const animated = useMotionEnabled()

  return (
    <Canvas
      aria-hidden="true"
      className="absolute inset-0"
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      camera={{ fov: 45, near: 0.1, far: 10000 }}
    >
      <ARCamera projectionMatrix={projectionMatrix} inputSize={inputSize} />

      {bodies.map((body, index) => (
        <TargetAnchor key={body.id} store={store} targetIndex={index}>
          {/* No espaço do alvo, 1 unidade é a LARGURA da carta. A escala vem de
              `arScale` para que os anéis de Saturno caibam como qualquer esfera. */}
          <group scale={arScale(body.visual)} position={[0, 0, 0.4]}>
            <PlanetMesh visual={body.visual} animated={animated} />
          </group>
        </TargetAnchor>
      ))}
    </Canvas>
  )
}
