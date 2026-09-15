import type { Fact } from '@/content/types.ts'

/**
 * Ficha técnica como lista de descrição: o par rótulo/valor fica explícito na
 * semântica, e não apenas no layout visual (WCAG 1.3.1).
 */
export function FactList({ facts }: { facts: Fact[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-0 sm:grid-cols-2">
      {facts.map((fact) => (
        <div
          key={fact.label}
          className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border py-3"
        >
          <dt className="text-sm text-fg-subtle">{fact.label}</dt>
          <dd className="m-0 text-right font-medium text-fg">{fact.value}</dd>
        </div>
      ))}
    </dl>
  )
}
