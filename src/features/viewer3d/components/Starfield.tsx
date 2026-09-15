import { useMemo } from 'react'
import * as THREE from 'three'

import { createRandom } from '@/lib/random.ts'

/**
 * Campo de estrelas de fundo para o modo sem AR. Pontos distribuídos numa
 * casca esférica, com brilho variado para dar profundidade.
 */
export function Starfield({
  count = 1600,
  radius = 16,
  seed = 20250915,
}: {
  count?: number
  radius?: number
  seed?: number
}) {
  const geometry = useMemo(() => {
    const random = createRandom(seed)
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const tint = new THREE.Color()

    for (let i = 0; i < count; i++) {
      // Distribuição uniforme na esfera (evita acúmulo nos polos).
      const u = random()
      const v = random()
      const theta = 2 * Math.PI * u
      const phi = Math.acos(2 * v - 1)
      const r = radius * (0.85 + random() * 0.15)

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)

      const brightness = 0.45 + random() * 0.55
      tint.setHSL(0.55 + random() * 0.12, 0.25, brightness)
      colors[i * 3] = tint.r
      colors[i * 3 + 1] = tint.g
      colors[i * 3 + 2] = tint.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [count, radius, seed])

  return (
    <points geometry={geometry}>
      <pointsMaterial size={0.11} sizeAttenuation vertexColors transparent opacity={0.95} />
    </points>
  )
}
