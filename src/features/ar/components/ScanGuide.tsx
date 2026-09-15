import { cn } from '@/lib/cn.ts'

/**
 * Moldura que indica onde posicionar a carta.
 *
 * Os cantos têm contorno escuro além do traço claro: sobre a imagem da câmera,
 * que pode ser de qualquer cor, só uma cor não garante contraste (WCAG 1.4.11).
 */
export function ScanGuide({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 grid place-items-center"
    >
      <div
        className={cn(
          'relative aspect-[3/4] w-[68%] max-w-xs transition-opacity duration-300',
          active ? 'opacity-0' : 'opacity-100',
        )}
      >
        {(
          [
            'top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl',
            'top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl',
            'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl',
            'bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl',
          ] as const
        ).map((corner) => (
          <span
            key={corner}
            className={cn(
              'absolute size-12 border-white',
              '[filter:drop-shadow(0_0_3px_rgb(0_0_0/0.9))]',
              corner,
            )}
          />
        ))}
      </div>
    </div>
  )
}
