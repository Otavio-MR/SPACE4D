import { describe, expect, it, vi } from 'vitest'

import { TrackingStore } from './tracking-store.ts'

/** Matriz identidade em ordem de coluna, como o rastreador entrega. */
const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]

function storeWithTarget(dimensions: Array<[number, number]> = [[400, 600]]): TrackingStore {
  const store = new TrackingStore()
  store.setTargetDimensions(dimensions)
  return store
}

describe('TrackingStore', () => {
  it('começa sem nenhum alvo visível', () => {
    expect(storeWithTarget().getVisibleTargets()).toEqual([])
  })

  it('marca o alvo como visível ao receber uma matriz', () => {
    const store = storeWithTarget()
    store.handleUpdate({ type: 'updateMatrix', targetIndex: 0, worldMatrix: IDENTITY })

    expect(store.getVisibleTargets()).toEqual([0])
    expect(store.matrices.get(0)).toBeDefined()
  })

  it('remove o alvo quando a matriz vem nula', () => {
    const store = storeWithTarget()
    store.handleUpdate({ type: 'updateMatrix', targetIndex: 0, worldMatrix: IDENTITY })
    store.handleUpdate({ type: 'updateMatrix', targetIndex: 0, worldMatrix: null })

    expect(store.getVisibleTargets()).toEqual([])
    expect(store.matrices.get(0)).toBeUndefined()
  })

  it('aplica a correção do alvo à matriz recebida', () => {
    const store = storeWithTarget([[400, 600]])
    store.handleUpdate({ type: 'updateMatrix', targetIndex: 0, worldMatrix: IDENTITY })

    // A correção escala pela largura e centraliza a carta na origem.
    const elements = store.matrices.get(0)!.elements
    expect(elements[0]).toBe(400)
    expect(elements[12]).toBe(200)
    expect(elements[13]).toBe(300)
  })

  /*
   * O rastreador emite uma matriz por quadro. Se cada uma acordasse o React, a
   * interface re-renderizaria a 30 Hz sem necessidade — só as transições de
   * visibilidade interessam a quem assina.
   */
  it('só notifica quando a visibilidade muda, não a cada quadro', () => {
    const store = storeWithTarget()
    const listener = vi.fn()
    store.subscribe(listener)

    store.handleUpdate({ type: 'updateMatrix', targetIndex: 0, worldMatrix: IDENTITY })
    expect(listener).toHaveBeenCalledTimes(1)

    store.handleUpdate({ type: 'updateMatrix', targetIndex: 0, worldMatrix: IDENTITY })
    store.handleUpdate({ type: 'updateMatrix', targetIndex: 0, worldMatrix: IDENTITY })
    expect(listener).toHaveBeenCalledTimes(1)

    store.handleUpdate({ type: 'updateMatrix', targetIndex: 0, worldMatrix: null })
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('mantém a referência do instantâneo estável entre quadros', () => {
    const store = storeWithTarget()
    store.handleUpdate({ type: 'updateMatrix', targetIndex: 0, worldMatrix: IDENTITY })

    const first = store.getVisibleTargets()
    store.handleUpdate({ type: 'updateMatrix', targetIndex: 0, worldMatrix: IDENTITY })

    // `useSyncExternalStore` entra em laço infinito se a referência mudar sempre.
    expect(store.getVisibleTargets()).toBe(first)
  })

  it('reaproveita o mesmo objeto de matriz, sem alocar por quadro', () => {
    const store = storeWithTarget()
    store.handleUpdate({ type: 'updateMatrix', targetIndex: 0, worldMatrix: IDENTITY })
    const matrix = store.matrices.get(0)

    store.handleUpdate({ type: 'updateMatrix', targetIndex: 0, worldMatrix: IDENTITY })
    expect(store.matrices.get(0)).toBe(matrix)
  })

  it('rastreia vários alvos e os devolve ordenados', () => {
    const store = storeWithTarget([
      [400, 600],
      [400, 600],
      [400, 600],
    ])
    store.handleUpdate({ type: 'updateMatrix', targetIndex: 2, worldMatrix: IDENTITY })
    store.handleUpdate({ type: 'updateMatrix', targetIndex: 0, worldMatrix: IDENTITY })

    expect(store.getVisibleTargets()).toEqual([0, 2])
  })

  it('ignora eventos de outro tipo', () => {
    const store = storeWithTarget()
    store.handleUpdate({ type: 'outroEvento', targetIndex: 0, worldMatrix: IDENTITY })
    expect(store.getVisibleTargets()).toEqual([])
  })

  it('limpa tudo e avisa os assinantes', () => {
    const store = storeWithTarget()
    const listener = vi.fn()
    store.handleUpdate({ type: 'updateMatrix', targetIndex: 0, worldMatrix: IDENTITY })
    store.subscribe(listener)

    store.clear()
    expect(store.getVisibleTargets()).toEqual([])
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
