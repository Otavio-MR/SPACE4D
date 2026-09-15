/**
 * Link "pular para o conteúdo" (WCAG 2.4.1). Fica oculto até receber foco pelo
 * teclado, quando aparece fixo no topo da tela.
 */
export function SkipLink({ targetId = 'conteudo' }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only-focusable z-50 focus-visible:top-3 focus-visible:left-3 focus-visible:rounded-lg focus-visible:bg-accent focus-visible:px-4 focus-visible:py-3 focus-visible:font-semibold focus-visible:text-on-primary"
    >
      Pular para o conteúdo
    </a>
  )
}
