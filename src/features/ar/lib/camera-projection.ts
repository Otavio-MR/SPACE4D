import type * as THREE from 'three'

/**
 * Ajusta a câmera do three.js para casar exatamente com a imagem da câmera do
 * aparelho. Sem isso, o modelo "desliza" em relação à carta.
 *
 * O cálculo vem do `MindARThree` do mind-ar e assume que o vídeo cobre o
 * container (`object-fit: cover`), que é como o `<video>` é estilizado aqui.
 */
export function applyARProjection(
  camera: THREE.PerspectiveCamera,
  projectionMatrix: number[],
  input: { width: number; height: number },
  container: { width: number; height: number },
): void {
  const inputAspect = input.width / input.height
  const containerAspect = container.width / container.height

  // Altura que o vídeo ocupa depois do recorte "cover".
  const fittedHeight =
    inputAspect > containerAspect
      ? container.height
      : (container.width / input.width) * input.height

  const scale = container.height / fittedHeight

  camera.fov = ((2 * Math.atan((1 / projectionMatrix[5]) * scale)) / Math.PI) * 180
  camera.near = projectionMatrix[14] / (projectionMatrix[10] - 1)
  camera.far = projectionMatrix[14] / (projectionMatrix[10] + 1)
  camera.aspect = containerAspect
  camera.updateProjectionMatrix()
}
