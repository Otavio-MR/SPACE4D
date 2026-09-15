import { LinkButton } from '@/components/LinkButton.tsx'
import { usePageTitle } from '@/hooks/usePageTitle.ts'

export function NotFoundPage() {
  usePageTitle('Página não encontrada')

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <p className="font-display text-6xl font-semibold text-primary">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold">Página não encontrada</h1>
      <p className="mt-3 text-fg-muted">O endereço que você abriu não existe neste app.</p>
      <div className="mt-6 flex justify-center gap-3">
        <LinkButton to="/">Ir para o início</LinkButton>
        <LinkButton variant="secondary" to="/catalogo">
          Ver o catálogo
        </LinkButton>
      </div>
    </div>
  )
}
