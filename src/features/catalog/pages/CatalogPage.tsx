import { useMemo, useState } from 'react'

import { SegmentedControl } from '@/components/SegmentedControl.tsx'
import { KIND_LABELS, bodies } from '@/content/bodies.ts'
import type { BodyKind } from '@/content/types.ts'
import { usePageTitle } from '@/hooks/usePageTitle.ts'

import { BodyCardLink } from '../components/BodyCardLink.tsx'

type Filter = BodyKind | 'todos'

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'planeta-rochoso', label: KIND_LABELS['planeta-rochoso'] },
  { value: 'gigante-gasoso', label: KIND_LABELS['gigante-gasoso'] },
  { value: 'gigante-de-gelo', label: KIND_LABELS['gigante-de-gelo'] },
]

/**
 * Catálogo completo — o caminho equivalente sem AR.
 *
 * Tudo que existe nas cartas existe aqui: mesmos modelos 3D, mesmas fichas,
 * navegável por teclado e sem exigir câmera nem carta impressa (WCAG 1.1.1, 2.1.1).
 */
export function CatalogPage() {
  usePageTitle('Catálogo')
  const [filter, setFilter] = useState<Filter>('todos')

  const visible = useMemo(
    () => (filter === 'todos' ? bodies : bodies.filter((body) => body.kind === filter)),
    [filter],
  )

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <header>
        <h1 className="font-display text-3xl font-semibold">Catálogo</h1>
        <p className="mt-2 max-w-prose text-fg-muted">
          Os dez corpos celestes do baralho, com modelo em 3D e ficha completa. Funciona sem câmera
          e sem as cartas impressas.
        </p>
      </header>

      <SegmentedControl
        className="mt-4"
        legend="Filtrar por tipo"
        value={filter}
        onChange={setFilter}
        options={FILTERS}
      />

      {/* A contagem muda ao filtrar sem mover o foco: precisa ser anunciada. */}
      <p aria-live="polite" className="mt-2 text-sm text-fg-subtle">
        {visible.length} {visible.length === 1 ? 'corpo celeste' : 'corpos celestes'}
      </p>

      <ul className="mt-6 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((body) => (
          <BodyCardLink key={body.id} body={body} />
        ))}
      </ul>
    </div>
  )
}
