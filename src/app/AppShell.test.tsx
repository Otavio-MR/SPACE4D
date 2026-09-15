import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { Route, Routes } from 'react-router'

import { useSettings } from '@/features/settings/store.ts'
import { expectNoA11yViolations } from '@/test/a11y.ts'
import { renderWithProviders } from '@/test/utils.tsx'

import { AppShell } from './AppShell.tsx'

function renderShell(route = '/catalogo') {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route path="catalogo" element={<h1>Catálogo</h1>} />
        <Route path="ar" element={<h1>Câmera</h1>} />
      </Route>
    </Routes>,
    { route },
  )
}

beforeEach(() => {
  useSettings.getState().reset()
})

describe('AppShell', () => {
  it('oferece o link de pular para o conteúdo', () => {
    renderShell()
    const skip = screen.getByRole('link', { name: 'Pular para o conteúdo' })
    expect(skip).toHaveAttribute('href', '#conteudo')
    expect(document.getElementById('conteudo')).toBeInTheDocument()
  })

  it('coloca o link de pular como primeiro elemento focável', async () => {
    const user = userEvent.setup()
    renderShell()

    await user.tab()
    expect(screen.getByRole('link', { name: 'Pular para o conteúdo' })).toHaveFocus()
  })

  it('marca a rota atual para leitores de tela', () => {
    renderShell('/catalogo')
    const links = screen.getAllByRole('link', { name: /Catálogo/ })
    expect(links.some((link) => link.getAttribute('aria-current') === 'page')).toBe(true)
  })

  it('renderiza o conteúdo da rota dentro do main', () => {
    renderShell('/catalogo')
    expect(within(screen.getByRole('main')).getByRole('heading', { level: 1 })).toHaveTextContent(
      'Catálogo',
    )
  })

  /*
   * A escala vai no `font-size` da raiz para que o espaçamento em `rem` acompanhe
   * o texto — aumentar só a fonte estoura os layouts.
   */
  it('aplica a escala de texto escolhida na raiz do documento', () => {
    renderShell()
    expect(document.documentElement.style.fontSize).toBe('100%')

    useSettings.getState().setTextScale('larger')
    renderShell()
    expect(document.documentElement.style.fontSize).toBe('130%')
  })

  it('não tem violações de acessibilidade', async () => {
    const { container } = renderShell()
    await expectNoA11yViolations(container)
  })
})
