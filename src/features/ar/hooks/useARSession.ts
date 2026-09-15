import { useCallback, useEffect, useMemo, useState, type RefObject } from 'react'

import { TrackingStore } from '../lib/tracking-store.ts'

export type ARStatus =
  'idle' | 'requesting-camera' | 'loading-engine' | 'ready' | 'denied' | 'error'

export interface ARSession {
  status: ARStatus
  /** Mensagem pronta para exibir quando `status` é 'denied' ou 'error'. */
  message: string | null
  store: TrackingStore
  /** Matriz de projeção do rastreador; disponível a partir de 'ready'. */
  projectionMatrix: number[] | null
  inputSize: { width: number; height: number } | null
  retry: () => void
}

export interface UseARSessionOptions {
  /**
   * Ref do `<video>` que receberá o fluxo da câmera. É o componente que cria o
   * elemento; o hook só o opera. Assim o objeto devolvido não carrega nenhum ref,
   * e lê-lo durante o render continua seguro.
   */
  videoRef: RefObject<HTMLVideoElement | null>
  /** URL do arquivo `.mind` com os alvos compilados. */
  targetSrc: string
  /** Quantos alvos podem ser rastreados ao mesmo tempo. */
  maxTrack?: number
  /** Quando falso, a sessão não inicia (usado para pausar ao sair da tela). */
  enabled?: boolean
}

const PERMISSION_MESSAGE =
  'Não foi possível acessar a câmera. Autorize o uso da câmera nas permissões do navegador e tente de novo.'

/**
 * Ciclo de vida da sessão de AR: pede a câmera, carrega o rastreador sob demanda
 * e o encerra ao desmontar.
 *
 * O motor (mind-ar + TensorFlow.js) é importado dinamicamente para não entrar no
 * pacote inicial: quem só usa o modo sem AR nunca baixa esses megabytes.
 */
export function useARSession({
  videoRef,
  targetSrc,
  maxTrack = 1,
  enabled = true,
}: UseARSessionOptions): ARSession {
  const store = useMemo(() => new TrackingStore(), [])

  const [status, setStatus] = useState<ARStatus>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [projectionMatrix, setProjectionMatrix] = useState<number[] | null>(null)
  const [inputSize, setInputSize] = useState<{ width: number; height: number } | null>(null)
  const [attempt, setAttempt] = useState(0)

  const retry = useCallback(() => {
    setStatus('idle')
    setMessage(null)
    setAttempt((value) => value + 1)
  }, [])

  useEffect(() => {
    if (!enabled) return

    // `cancelled` cobre o desmonte no meio de um await; os recursos criados
    // depois disso precisam ser liberados na hora.
    let cancelled = false
    let stream: MediaStream | null = null
    let controller: { stopProcessVideo: () => void; dispose: () => void } | null = null

    async function start(): Promise<void> {
      const video = videoRef.current
      if (!video) return

      try {
        setStatus('requesting-camera')
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: 'environment' },
        })
        if (cancelled) return

        video.srcObject = stream
        await new Promise<void>((resolve, reject) => {
          video.addEventListener('loadedmetadata', () => resolve(), { once: true })
          video.addEventListener('error', () => reject(new Error('video')), { once: true })
        })
        if (cancelled) return
        await video.play()
        if (cancelled) return

        const width = video.videoWidth
        const height = video.videoHeight

        setStatus('loading-engine')
        const { Controller } = await import('@/vendor/mind-ar/mindar-image.prod.js')
        if (cancelled) return

        const instance = new Controller({
          inputWidth: width,
          inputHeight: height,
          maxTrack,
          // Filtro mais suave que o padrão: a carta na mão treme, e o modelo
          // tremendo junto cansa a vista e atrapalha a leitura.
          filterMinCF: 0.0005,
          filterBeta: 0.005,
          onUpdate: (event) => store.handleUpdate(event),
        })
        controller = instance

        const { dimensions } = await instance.addImageTargets(targetSrc)
        if (cancelled) return
        store.setTargetDimensions(dimensions)

        await instance.dummyRun(video)
        if (cancelled) return

        setProjectionMatrix(instance.getProjectionMatrix())
        setInputSize({ width, height })
        instance.processVideo(video)
        setStatus('ready')
      } catch (error) {
        if (cancelled) return
        const isPermission =
          error instanceof DOMException &&
          (error.name === 'NotAllowedError' || error.name === 'SecurityError')
        setStatus(isPermission ? 'denied' : 'error')
        setMessage(
          isPermission
            ? PERMISSION_MESSAGE
            : 'Algo deu errado ao preparar a realidade aumentada. Tente novamente ou use o modo sem AR.',
        )
      }
    }

    void start()

    return () => {
      cancelled = true
      controller?.stopProcessVideo()
      controller?.dispose()
      stream?.getTracks().forEach((track) => track.stop())
      store.clear()
    }
  }, [enabled, targetSrc, maxTrack, store, videoRef, attempt])

  return { status, message, store, projectionMatrix, inputSize, retry }
}
