import type { BodyVisual } from '@/content/types.ts'

/** Folga da atmosfera em relação à esfera (ver `PlanetMesh`). */
const ATMOSPHERE_RADIUS = 1.05

/**
 * Raio da FORMA do corpo, sem `displayScale`: 1 para uma esfera nua, mais que
 * isso quando há anéis. Saturno chega a 2,3 — mais que o dobro da esfera —, e é
 * por ignorar isso que os anéis apareciam cortados.
 */
function shapeRadius(visual: BodyVisual): number {
  return Math.max(ATMOSPHERE_RADIUS, visual.rings?.outer ?? 0)
}

/** Raio total ocupado pelo corpo, já com `displayScale`. */
export function boundingRadius(visual: BodyVisual): number {
  return visual.displayScale * shapeRadius(visual)
}

/**
 * Distância de câmera que faz o corpo caber no quadro.
 *
 * No visualizador sem AR cada corpo aparece sozinho, então preenchemos o quadro
 * da mesma forma para todos — comparar tamanhos entre páginas diferentes não é
 * possível de qualquer modo.
 */
export function cameraDistance(visual: BodyVisual, fovDegrees: number, margin = 1.14): number {
  const halfFov = (fovDegrees / 2) * (Math.PI / 180)
  return (boundingRadius(visual) / Math.tan(halfFov)) * margin
}

/**
 * Maior meia-extensão permitida sobre a carta, em unidades de largura de carta.
 * Abaixo de 0,5 para o corpo não encostar nas bordas.
 */
const AR_MAX_HALF_EXTENT = 0.46

/**
 * Escala do corpo sobre a carta, em AR.
 *
 * `displayScale` é preservado de propósito: as cartas ficam lado a lado na mesa,
 * então a diferença de tamanho entre a Lua e Júpiter é informação útil.
 * `fraction` é a fatia da largura da carta ocupada por um corpo de referência
 * (`displayScale` igual a 1).
 *
 * O limite final existe porque as duas variações se acumulam: Júpiter tem
 * `displayScale` 1,25 e, sem o corte, transbordaria a carta.
 */
export function arScale(visual: BodyVisual, fraction = 0.8): number {
  const preferred = fraction / 2 / shapeRadius(visual)
  const maximum = AR_MAX_HALF_EXTENT / boundingRadius(visual)
  return Math.min(preferred, maximum)
}
