import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { bodies } from '@/content/bodies.ts'
import { expectNoA11yViolations } from '@/test/a11y.ts'
import { renderWithProviders } from '@/test/utils.tsx'

import { CatalogPage } from './CatalogPage.tsx'

describe('CatalogPage', () => {
  it('lista todos os corpos celestes', () => {
    renderWithProviders(<CatalogPage />)
    const list = screen.getByRole('list')
    expect(within(list).getAllByRole('listitem')).toHaveLength(bodies.length)
  })

  it('dá a cada cartão um link com o nome do corpo celeste', () => {
    renderWithProviders(<CatalogPage />)
    // Nome acessível vindo do título, não de um genérico "saiba mais".
    expect(screen.getByRole('link', { name: /Saturno/ })).toHaveAttribute('href', '/corpo/saturno')
  })

  it('filtra por tipo', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CatalogPage />)

    await user.click(screen.getByRole('radio', { name: 'Gigante gasoso' }))

    const items = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(screen.getByRole('link', { name: /Júpiter/ })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Mercúrio/ })).not.toBeInTheDocument()
  })

  /*
   * O filtro muda a lista sem mover o foco. Sem uma região viva com a contagem,
   * quem usa leitor de tela não percebe que algo mudou.
   */
  it('anuncia quantos resultados sobraram após filtrar', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CatalogPage />)

    await user.click(screen.getByRole('radio', { name: 'Gigante de gelo' }))
    expect(screen.getByText('2 corpos celestes')).toBeInTheDocument()
  })

  it('usa o singular quando só há um resultado', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CatalogPage />)

    await user.click(screen.getByRole('radio', { name: 'Planeta rochoso' }))
    expect(screen.getByText(/^\d+ corpos? celestes?$/)).toHaveTextContent('4 corpos celestes')
  })

  it('tem um único h1', () => {
    renderWithProviders(<CatalogPage />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('não tem violações de acessibilidade', async () => {
    const { container } = renderWithProviders(<CatalogPage />)
    await expectNoA11yViolations(container)
  })
})
