/**
 * Tipos do conteúdo educativo. Este módulo é compartilhado entre o app (React)
 * e as ferramentas de geração de cartas (Node), por isso não importa nada do DOM
 * e usa apenas sintaxe apagável (type stripping do Node).
 */

export type BodyKind =
  'estrela' | 'planeta-rochoso' | 'gigante-gasoso' | 'gigante-de-gelo' | 'satelite-natural'

export type SurfaceMode = 'rocky' | 'gas' | 'earth' | 'star'

export interface SurfaceSpec {
  mode: SurfaceMode
  /** 3 cores (4 no modo `earth`: oceano, terra, montanha, gelo), em hexadecimal. */
  colors: string[]
  /** Escala do ruído procedural; maior = detalhes menores. */
  noiseScale: number
  /** Semente para variar o padrão entre corpos com o mesmo modo. */
  seed: number
  /** Só no modo `gas`: quantidade de faixas ao longo da latitude. */
  bandFrequency?: number
  /** Só no modo `gas`: quanto as faixas ondulam (0 a 1). */
  warp?: number
  /** Só no modo `rocky`: intensidade das calotas polares (0 a 1). */
  polarCaps?: number
}

export interface RingsSpec {
  /** Raios relativos ao raio do planeta (= 1). */
  inner: number
  outer: number
  colors: [string, string]
  opacity: number
}

export interface BodyVisual {
  surface: SurfaceSpec
  atmosphere?: { color: string; intensity: number }
  rings?: RingsSpec
  /** Inclinação do eixo em graus. */
  axialTilt: number
  /** Velocidade de rotação (rad/s) quando o movimento está ativado. */
  rotationSpeed: number
  /** Tamanho relativo de exibição (1 = padrão). */
  displayScale: number
}

export interface Fact {
  label: string
  value: string
}

export interface CelestialBody {
  /** Slug estável usado em rotas, cartas e alvos de rastreamento. */
  id: string
  name: string
  kind: BodyKind
  /** Ordem de apresentação (e índice da carta). */
  order: number
  tagline: string
  summary: string
  /** Descrição visual — audiodescrição para quem não vê o modelo 3D. */
  appearance: string
  facts: Fact[]
  curiosities: string[]
  /** Cor de destaque usada na interface e na carta. */
  accent: string
  visual: BodyVisual
}
