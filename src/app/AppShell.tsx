import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'

import { SkipLink } from '@/components/SkipLink.tsx'
import { CameraIcon, GridIcon, PrinterIcon, SettingsIcon } from '@/components/icons.tsx'
import { TEXT_SCALE_VALUES, useSettings } from '@/features/settings/store.ts'
import { useMediaQuery } from '@/hooks/useMediaQuery.ts'
import { cn } from '@/lib/cn.ts'

const NAV_ITEMS = [
  { to: '/ar', label: 'Câmera', icon: CameraIcon },
  { to: '/catalogo', label: 'Catálogo', icon: GridIcon },
  { to: '/cartas', label: 'Cartas', icon: PrinterIcon },
  { to: '/preferencias', label: 'Preferências', icon: SettingsIcon },
] as const

export function AppShell() {
  const textScale = useSettings((state) => state.textScale)
  const location = useLocation()

  /*
   * A navegação existe em dois formatos: barra no topo (telas largas) e barra
   * inferior, ao alcance do polegar (celular). Apenas uma é renderizada.
   *
   * Esconder a outra com CSS deixaria as duas na árvore de acessibilidade: dois
   * landmarks com o mesmo rótulo e todos os links repetidos na ordem de tabulação.
   * O CSS sabe qual está visível, a ARIA não — então a escolha é feita aqui.
   * 40rem é o breakpoint `sm` do Tailwind.
   */
  const isWide = useMediaQuery('(min-width: 40rem)')

  // A escala é aplicada no `font-size` da raiz, então tudo que usa `rem`
  // acompanha — inclusive o espaçamento, que é o que mantém o layout coerente.
  useEffect(() => {
    document.documentElement.style.fontSize = TEXT_SCALE_VALUES[textScale]
  }, [textScale])

  // Numa SPA a rolagem não volta ao topo sozinha ao trocar de tela.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />

      <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <NavLink
            to="/"
            className="flex items-center gap-2.5 font-display text-lg font-semibold text-fg"
          >
            <span
              aria-hidden="true"
              className="size-7 rounded-full bg-[radial-gradient(circle_at_35%_30%,#9bd4ff,#1b3a6b_70%)] shadow-[0_0_20px_-4px_#9bd4ff]"
            />
            Órbita<span className="text-primary">AR</span>
          </NavLink>

          {isWide ? (
            <nav aria-label="Principal">
              <ul className="flex list-none items-center gap-1 p-0">
                {NAV_ITEMS.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'touch-target inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-surface-2 text-fg'
                            : 'text-fg-muted hover:bg-surface hover:text-fg',
                        )
                      }
                    >
                      <item.icon className="size-5" />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>
      </header>

      <main id="conteudo" tabIndex={-1} className="flex-1 focus-visible:outline-none">
        <Outlet />
      </main>

      {!isWide ? (
        <nav
          aria-label="Principal"
          className="sticky bottom-0 z-30 border-t border-border bg-bg/95 backdrop-blur-md"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <ul className="mx-auto flex list-none items-stretch justify-around p-0">
            {NAV_ITEMS.map((item) => (
              <li key={item.to} className="flex-1">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[0.7rem] font-medium transition-colors',
                      isActive ? 'text-primary' : 'text-fg-subtle hover:text-fg',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className="size-6" />
                      {item.label}
                      {isActive ? <span className="sr-only">(página atual)</span> : null}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  )
}
