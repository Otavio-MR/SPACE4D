import { describe, expect, it } from 'vitest'
import * as THREE from 'three'

import { applyARProjection } from './camera-projection.ts'

/** Matriz de projeção plausível, no formato que o mind-ar devolve. */
function projectionMatrix(): number[] {
  const near = 10
  const far = 100000
  const matrix = new Array(16).fill(0)
  matrix[0] = 2.4
  matrix[5] = 2.4
  matrix[10] = -(far + near) / (far - near)
  matrix[11] = -1
  matrix[14] = -(2 * far * near) / (far - near)
  return matrix
}

describe('applyARProjection', () => {
  it('deriva o plano próximo e o distante da matriz do rastreador', () => {
    const camera = new THREE.PerspectiveCamera()
    applyARProjection(
      camera,
      projectionMatrix(),
      { width: 1280, height: 720 },
      { width: 390, height: 700 },
    )

    expect(camera.near).toBeCloseTo(10, 3)
    expect(camera.far).toBeCloseTo(100000, 0)
  })

  it('usa a proporção do container, não a do vídeo', () => {
    const camera = new THREE.PerspectiveCamera()
    applyARProjection(
      camera,
      projectionMatrix(),
      { width: 1280, height: 720 },
      { width: 390, height: 700 },
    )

    expect(camera.aspect).toBeCloseTo(390 / 700, 5)
  })

  /*
   * Com o vídeo mais largo que a tela, o recorte "cover" corta as laterais e a
   * altura visível é exatamente a do container: o campo de visão vertical é o da
   * própria matriz, sem correção.
   */
  it('não corrige o campo de visão quando o vídeo é mais largo que o container', () => {
    const camera = new THREE.PerspectiveCamera()
    const matrix = projectionMatrix()
    applyARProjection(camera, matrix, { width: 1280, height: 720 }, { width: 390, height: 700 })

    const expected = ((2 * Math.atan(1 / matrix[5])) / Math.PI) * 180
    expect(camera.fov).toBeCloseTo(expected, 4)
  })

  /*
   * Container mais largo em proporção que o vídeo: o "cover" amplia o vídeo até
   * cobrir a largura, e topo e base saem da tela. Vemos menos vídeo na vertical,
   * então o campo de visão vertical precisa FECHAR na mesma medida — senão o
   * modelo não cola na carta.
   */
  it('estreita o campo de visão quando o recorte corta o topo e a base do vídeo', () => {
    const camera = new THREE.PerspectiveCamera()
    const matrix = projectionMatrix()
    applyARProjection(camera, matrix, { width: 640, height: 480 }, { width: 900, height: 500 })

    const fittedHeight = (900 / 640) * 480
    const expected = ((2 * Math.atan((1 / matrix[5]) * (500 / fittedHeight))) / Math.PI) * 180
    expect(camera.fov).toBeCloseTo(expected, 4)
    expect(camera.fov).toBeLessThan(((2 * Math.atan(1 / matrix[5])) / Math.PI) * 180)
  })

  it('atualiza a matriz de projeção da câmera', () => {
    const camera = new THREE.PerspectiveCamera()
    const before = camera.projectionMatrix.elements.join(',')
    applyARProjection(
      camera,
      projectionMatrix(),
      { width: 1280, height: 720 },
      { width: 390, height: 700 },
    )

    expect(camera.projectionMatrix.elements.join(',')).not.toBe(before)
  })
})
