import * as THREE from 'three'

import type { ControllerUpdateEvent } from '@/vendor/mind-ar/mindar-image.prod.js'

/**
 * Guarda a pose de cada alvo rastreado.
 *
 * As matrizes chegam a cada quadro (~30 Hz). Colocá-las no estado do React
 * causaria uma re-renderização por quadro, então elas ficam num objeto mutável
 * lido pelo `useFrame`. Só as transições discretas — alvo encontrado e alvo
 * perdido — atravessam o React, que é o que a interface precisa saber.
 */
export class TrackingStore {
  /** Matriz final por índice de alvo (já com a correção de escala aplicada). */
  readonly matrices = new Map<number, THREE.Matrix4>()

  private readonly postMatrices = new Map<number, THREE.Matrix4>()
  private readonly visible = new Set<number>()
  private readonly listeners = new Set<() => void>()
  private snapshot: readonly number[] = []

  /**
   * Define a correção que leva do espaço do alvo (origem num canto, unidades em
   * pixels da imagem) para o espaço do three.js (origem no centro, altura 1).
   * Replica o cálculo do `MindARThree`.
   */
  setTargetDimensions(dimensions: Array<[number, number]>): void {
    this.postMatrices.clear()
    dimensions.forEach(([width, height], index) => {
      const position = new THREE.Vector3(width / 2, width / 2 + (height - width) / 2, 0)
      const scale = new THREE.Vector3(width, width, width)
      const matrix = new THREE.Matrix4().compose(position, new THREE.Quaternion(), scale)
      this.postMatrices.set(index, matrix)
    })
  }

  handleUpdate(event: ControllerUpdateEvent): void {
    if (event.type !== 'updateMatrix') return
    const { targetIndex, worldMatrix } = event

    if (worldMatrix === null) {
      if (this.visible.delete(targetIndex)) {
        this.matrices.delete(targetIndex)
        this.emit()
      }
      return
    }

    const matrix = this.matrices.get(targetIndex) ?? new THREE.Matrix4()
    matrix.fromArray(worldMatrix)
    const post = this.postMatrices.get(targetIndex)
    if (post) matrix.multiply(post)
    this.matrices.set(targetIndex, matrix)

    if (!this.visible.has(targetIndex)) {
      this.visible.add(targetIndex)
      this.emit()
    }
  }

  clear(): void {
    const had = this.visible.size > 0
    this.visible.clear()
    this.matrices.clear()
    if (had) this.emit()
  }

  /* --- interface de `useSyncExternalStore` --- */

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /** Índices visíveis. A referência só muda quando o conjunto muda. */
  getVisibleTargets = (): readonly number[] => this.snapshot

  private emit(): void {
    this.snapshot = [...this.visible].sort((a, b) => a - b)
    for (const listener of this.listeners) listener()
  }
}
