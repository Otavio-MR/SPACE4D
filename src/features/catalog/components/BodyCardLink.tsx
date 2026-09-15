import { Link } from 'react-router'

import { Chip } from '@/components/Chip.tsx'
import { KIND_LABELS } from '@/content/bodies.ts'
import type { CelestialBody } from '@/content/types.ts'

/**
 * Cartão do catálogo. O link envolve o cartão inteiro para dar um alvo grande
 * (WCAG 2.5.8), e o nome acessível vem do título — não de "saiba mais".
 */
export function BodyCardLink({ body }: { body: CelestialBody }) {
  return (
    <li>
      <Link
        to={`/corpo/${body.id}`}
        className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-border-strong hover:bg-surface-2"
      >
        <div
          aria-hidden="true"
          className="grid size-16 shrink-0 place-items-center rounded-full"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${body.accent}, ${body.accent}22 70%)`,
            boxShadow: `0 0 28px -6px ${body.accent}88`,
          }}
        />
        <div>
          <h2 className="font-display text-lg font-semibold text-fg">{body.name}</h2>
          <p className="mt-1 text-sm text-fg-muted">{body.tagline}</p>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          <Chip accent={body.accent}>{KIND_LABELS[body.kind]}</Chip>
          <Chip>Carta {String(body.order).padStart(2, '0')}</Chip>
        </div>
      </Link>
    </li>
  )
}
