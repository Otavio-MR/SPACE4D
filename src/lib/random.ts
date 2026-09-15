/**
 * Gerador pseudoaleatório com semente (mulberry32).
 *
 * Usamos isto em vez de `Math.random()` em qualquer cálculo feito durante o
 * render: a mesma semente sempre produz o mesmo resultado, então o campo de
 * estrelas não "pula" quando o componente re-renderiza, e o resultado é testável.
 */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
