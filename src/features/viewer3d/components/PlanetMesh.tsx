import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import type { BodyVisual, SurfaceMode } from '@/content/types.ts'

import {
  atmosphereFragmentShader,
  atmosphereVertexShader,
  planetFragmentShader,
  planetVertexShader,
} from '../shaders/planet.glsl.ts'

const MODE_INDEX: Record<SurfaceMode, number> = { rocky: 0, gas: 1, earth: 2, star: 3 }

function color(hex: string): THREE.Color {
  // A cor do conteúdo é escrita em sRGB; converter evita superfícies lavadas.
  return new THREE.Color().setStyle(hex, THREE.SRGBColorSpace)
}

export interface PlanetMeshProps {
  visual: BodyVisual
  /** Quando falso, a rotação para (respeita a preferência por menos movimento). */
  animated: boolean
  /**
   * Controle de vista do usuário, em radianos.
   * `x` inclina o corpo inteiro — anéis e atmosfera junto; `y` gira o corpo em
   * torno do próprio eixo, somando-se à rotação automática.
   */
  manualRotation?: { x: number; y: number }
}

/**
 * Corpo celeste procedural: esfera + shader de superfície, mais atmosfera e
 * anéis quando o corpo os tiver. Sem texturas externas — o app inteiro roda offline.
 */
export function PlanetMesh({ visual, animated, manualRotation }: PlanetMeshProps) {
  const tiltRef = useRef<THREE.Group>(null)
  const spinGroupRef = useRef<THREE.Group>(null)
  const spinRef = useRef(0)
  // Uniforms são estado mutável da GPU, atualizado a cada quadro: um ref deixa
  // isso explícito e mantém o valor memoizado intocado.
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const surfaceMaterial = useMemo(() => {
    const { surface } = visual
    const colors = surface.colors
    return new THREE.ShaderMaterial({
      vertexShader: planetVertexShader,
      fragmentShader: planetFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uNoiseScale: { value: surface.noiseScale },
        uSeed: { value: surface.seed },
        uMode: { value: MODE_INDEX[surface.mode] },
        uBandFrequency: { value: surface.bandFrequency ?? 6 },
        uWarp: { value: surface.warp ?? 0.3 },
        uPolarCaps: { value: surface.polarCaps ?? 0 },
        uColorA: { value: color(colors[0]) },
        uColorB: { value: color(colors[1] ?? colors[0]) },
        uColorC: { value: color(colors[2] ?? colors[0]) },
        uColorD: { value: color(colors[3] ?? colors[0]) },
        uLightDirection: { value: new THREE.Vector3(1, 0.45, 0.85).normalize() },
      },
    })
  }, [visual])

  const atmosphereMaterial = useMemo(() => {
    if (!visual.atmosphere) return null
    return new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      uniforms: {
        uColor: { value: color(visual.atmosphere.color) },
        uIntensity: { value: visual.atmosphere.intensity },
      },
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  }, [visual])

  const ringsTexture = useMemo(() => {
    if (!visual.rings) return null
    return createRingTexture(visual.rings.colors)
  }, [visual])

  const ringsGeometry = useMemo(() => {
    if (!visual.rings) return null
    return createRingGeometry(visual.rings.inner, visual.rings.outer)
  }, [visual])

  // Materiais e texturas alocam memória na GPU; liberamos ao trocar de corpo.
  useEffect(() => {
    return () => {
      surfaceMaterial.dispose()
      atmosphereMaterial?.dispose()
      ringsTexture?.dispose()
      ringsGeometry?.dispose()
    }
  }, [surfaceMaterial, atmosphereMaterial, ringsTexture, ringsGeometry])

  useFrame((_, delta) => {
    if (animated) {
      const material = materialRef.current
      if (material) material.uniforms.uTime.value += delta
      spinRef.current += delta * visual.rotationSpeed
    }
    if (spinGroupRef.current) {
      spinGroupRef.current.rotation.y = spinRef.current + (manualRotation?.y ?? 0)
    }
    if (tiltRef.current) {
      tiltRef.current.rotation.x = manualRotation?.x ?? 0
    }
  })

  const scale = visual.displayScale
  const tilt = (visual.axialTilt * Math.PI) / 180

  return (
    /* Três níveis, de fora para dentro: a vista do usuário inclina o conjunto
       todo; a inclinação do eixo é uma propriedade do corpo; e só a esfera gira
       em torno do próprio eixo — os anéis não acompanham a rotação do planeta. */
    <group scale={scale}>
      <group ref={tiltRef}>
        <group rotation={[0, 0, tilt]}>
          <group ref={spinGroupRef}>
            <mesh>
              <sphereGeometry args={[1, 96, 96]} />
              <primitive ref={materialRef} object={surfaceMaterial} attach="material" />
            </mesh>
          </group>

          {atmosphereMaterial ? (
            <mesh scale={1.035}>
              <sphereGeometry args={[1, 48, 48]} />
              <primitive object={atmosphereMaterial} attach="material" />
            </mesh>
          ) : null}

          {visual.rings && ringsTexture && ringsGeometry ? (
            <mesh rotation={[Math.PI / 2, 0, 0]} geometry={ringsGeometry}>
              <meshBasicMaterial
                map={ringsTexture}
                transparent
                opacity={visual.rings.opacity}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          ) : null}
        </group>
      </group>
    </group>
  )
}

/**
 * Anel com UVs RADIAIS.
 *
 * O `RingGeometry` do three.js projeta as UVs sobre a caixa que envolve o anel,
 * não ao longo do raio — a textura de faixas saía esticada e chapada. Aqui `u`
 * vai de 0 na borda interna a 1 na externa, que é o que a textura 1D espera.
 */
function createRingGeometry(inner: number, outer: number, segments = 160): THREE.BufferGeometry {
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    positions.push(inner * cos, inner * sin, 0)
    uvs.push(0, 0.5)
    positions.push(outer * cos, outer * sin, 0)
    uvs.push(1, 0.5)
  }

  for (let i = 0; i < segments; i++) {
    const base = i * 2
    indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  return geometry
}

/**
 * Gera a faixa de cores dos anéis como textura 1D: bandas claras e escuras
 * com algumas falhas, no espírito das divisões de Cassini.
 */
function createRingTexture([light, dark]: [string, string]): THREE.DataTexture {
  const width = 256
  const data = new Uint8Array(width * 4)
  const lightColor = color(light)
  const darkColor = color(dark)
  const mixed = new THREE.Color()

  for (let i = 0; i < width; i++) {
    const t = i / (width - 1)
    const bands = Math.sin(t * 34) * 0.5 + 0.5
    const fine = Math.sin(t * 127) * 0.5 + 0.5
    mixed.copy(darkColor).lerp(lightColor, bands * 0.75 + fine * 0.25)

    // Falhas: bordas suaves e uma divisão marcada no meio.
    const edge = Math.min(t, 1 - t) / 0.08
    const gap = Math.abs(t - 0.62) < 0.035 ? 0.15 : 1
    const alpha = Math.min(1, edge) * gap

    const offset = i * 4
    data[offset] = Math.round(mixed.r * 255)
    data[offset + 1] = Math.round(mixed.g * 255)
    data[offset + 2] = Math.round(mixed.b * 255)
    data[offset + 3] = Math.round(alpha * 255)
  }

  const texture = new THREE.DataTexture(data, width, 1, THREE.RGBAFormat)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.needsUpdate = true
  return texture
}
