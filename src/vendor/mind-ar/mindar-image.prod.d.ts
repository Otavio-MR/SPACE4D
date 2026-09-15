/**
 * Tipos para a parte da API do mind-ar que este app usa.
 * Escrito à mão: o pacote não publica declarações.
 */

/** Matriz 4x4 em ordem de coluna (column-major), como o three.js espera. */
export type WorldMatrix = number[]

export interface ControllerUpdateEvent {
  type: 'updateMatrix' | string
  targetIndex: number
  /** `null` quando o alvo deixou de ser rastreado. */
  worldMatrix: WorldMatrix | null
}

export interface ControllerOptions {
  inputWidth: number
  inputHeight: number
  maxTrack?: number
  debugMode?: boolean
  /** Corte de frequência do filtro One-Euro: menor = mais suave, mais latência. */
  filterMinCF?: number | null
  /** Ganho de velocidade do filtro One-Euro. */
  filterBeta?: number | null
  /** Quantos quadros consecutivos confirmam a detecção. */
  warmupTolerance?: number | null
  /** Quantos quadros sem detecção até considerar o alvo perdido. */
  missTolerance?: number | null
  onUpdate?: (event: ControllerUpdateEvent) => void
}

export interface AddTargetsResult {
  /** Para cada alvo: `[largura, altura]` da imagem original, em pixels. */
  dimensions: Array<[number, number]>
}

export declare class Controller {
  constructor(options: ControllerOptions)
  inputWidth: number
  inputHeight: number
  /** Matriz de projeção OpenGL derivada da geometria da câmera. */
  getProjectionMatrix(): number[]
  addImageTargets(url: string): Promise<AddTargetsResult>
  addImageTargetsFromBuffer(buffer: ArrayBuffer): AddTargetsResult
  /** Aquece os kernels da GPU antes do primeiro quadro real. */
  dummyRun(video: HTMLVideoElement): Promise<void>
  processVideo(video: HTMLVideoElement): void
  stopProcessVideo(): void
  dispose(): void
}

export declare class Compiler {
  compileImageTargets(
    images: Array<HTMLImageElement | HTMLCanvasElement | ImageBitmap>,
    onProgress: (percent: number) => void,
  ): Promise<unknown>
  /** Serializa os alvos compilados no formato `.mind`. */
  exportData(): Promise<ArrayBuffer>
  importData(buffer: ArrayBuffer): unknown
}

export declare class UI {
  constructor(options: { uiLoading?: string; uiScanning?: string; uiError?: string })
}
