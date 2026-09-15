import { cn } from '@/lib/cn.ts'

/**
 * Indicador de carregamento. O rótulo textual acompanha o gráfico porque
 * animação sozinha não comunica estado a quem usa leitor de tela.
 */
export function Spinner({
  label = 'Carregando…',
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <div role="status" className={cn('flex items-center gap-3 text-fg-muted', className)}>
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-border-strong border-t-primary"
      />
      <span className="text-sm">{label}</span>
    </div>
  )
}
