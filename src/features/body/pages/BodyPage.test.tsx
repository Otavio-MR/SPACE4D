import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Route, Routes } from 'react-router'

import { getBody } from '@/content/bodies.ts'
import { expectNoA11yViolations } from '@/test/a11y.ts'
import { renderWithProviders } from '@/test/utils.tsx'

import { BodyPage } from './BodyPage.tsx'

function renderBody(id: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/corpo/:id" element={<BodyPage />} />
    </Routes>,
    { route: `/corpo/${id}` },
  )
}

describe('BodyPage', () => {
  it('mostra o nome e o resumo do corpo celeste', () => {
    renderBody('marte')
    expect(screen.getByRole('heading', { level: 1, name: 'Marte' })).toBeInTheDocument()
    expect(screen.getByText(/mundo frio e desértico/)).toBeInTheDocument()
  })

  it('apresenta a ficha técnica como pares rótulo/valor', () => {
    const { container } = renderBody('marte')
    const facts = getBody('marte')!.facts

    // A busca é restrita à lista de descrição: alguns valores (o tipo do corpo,
    // por exemplo) também aparecem como etiqueta no cabeçalho da página.
    const list = within(container.querySelector('dl')!)
    for (const fact of facts) {
      expect(list.getByText(fact.label)).toBeInTheDocument()
      expect(list.getByText(fact.value)).toBeInTheDocument()
    }
  })

  it('lista as curiosidades', () => {
    renderBody('jupiter')
    for (const curiosity of getBody('jupiter')!.curiosities) {
      expect(screen.getByText(curiosity)).toBeInTheDocument()
    }
  })

  /*
   * O modelo 3D é a única informação puramente visual da página. A audiodescrição
   * no `role="img"` é o equivalente textual que a WCAG 1.1.1 exige.
   */
  it('descreve o modelo 3D em texto', () => {
    renderBody('saturno')
    const model = screen.getByRole('img', { name: /Modelo tridimensional de Saturno/ })
    expect(model).toHaveAccessibleName(new RegExp(getBody('saturno')!.appearance.slice(0, 40)))
  })

  it('oferece os controles de rotação como botões nomeados', () => {
    renderBody('terra')
    for (const name of [
      'Girar para a esquerda',
      'Girar para a direita',
      'Inclinar para cima',
      'Inclinar para baixo',
      'Voltar à posição inicial',
    ]) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    }
  })

  it('navega entre corpos vizinhos', () => {
    renderBody('terra')
    expect(screen.getByRole('link', { name: /Vênus/ })).toHaveAttribute('href', '/corpo/venus')
    expect(screen.getByRole('link', { name: /Lua/ })).toHaveAttribute('href', '/corpo/lua')
  })

  it('omite o link anterior no primeiro corpo', () => {
    renderBody('sol')
    expect(screen.queryByText('Anterior')).not.toBeInTheDocument()
    expect(screen.getByText('Próximo')).toBeInTheDocument()
  })

  it('mostra uma página de erro compreensível para um identificador desconhecido', () => {
    renderBody('plutao')
    expect(screen.getByRole('heading', { level: 1, name: /não encontrado/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /catálogo/i })).toBeInTheDocument()
  })

  it('não tem violações de acessibilidade', async () => {
    const { container } = renderBody('saturno')
    await expectNoA11yViolations(container)
  })
})
