import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { expectNoA11yViolations } from '@/test/a11y.ts'

import { Button } from './Button.tsx'
import { IconButton } from './IconButton.tsx'
import { SegmentedControl } from './SegmentedControl.tsx'
import { Spinner } from './Spinner.tsx'
import { Switch } from './Switch.tsx'
import { InfoIcon } from './icons.tsx'

describe('Button', () => {
  it('é do tipo "button" por padrão, para não enviar formulários sem querer', () => {
    render(<Button>Salvar</Button>)
    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveAttribute('type', 'button')
  })

  it('mantém o ícone fora da árvore de acessibilidade', () => {
    render(<Button icon={<InfoIcon />}>Detalhes</Button>)
    // O nome acessível vem só do texto: um ícone decorativo não deve poluí-lo.
    expect(screen.getByRole('button', { name: 'Detalhes' })).toBeInTheDocument()
  })

  it('não tem violações de acessibilidade', async () => {
    const { container } = render(<Button>Continuar</Button>)
    await expectNoA11yViolations(container)
  })
})

describe('IconButton', () => {
  it('expõe um nome acessível mesmo sem texto visível', () => {
    render(<IconButton label="Mais informações" icon={<InfoIcon />} />)
    expect(screen.getByRole('button', { name: 'Mais informações' })).toBeInTheDocument()
  })

  it('não tem violações de acessibilidade', async () => {
    const { container } = render(<IconButton label="Fechar" icon={<InfoIcon />} />)
    await expectNoA11yViolations(container)
  })
})

describe('Switch', () => {
  it('anuncia-se como interruptor e reflete o estado', () => {
    render(<Switch label="Narração" checked onChange={() => {}} />)
    expect(screen.getByRole('switch', { name: 'Narração' })).toBeChecked()
  })

  it('é acionável por teclado', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Switch label="Vibrar" checked={false} onChange={onChange} />)

    await user.tab()
    await user.keyboard(' ')
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('associa a descrição ao controle', () => {
    render(
      <Switch label="Vibrar" description="Um toque curto confirma." checked onChange={() => {}} />,
    )
    expect(screen.getByRole('switch', { name: 'Vibrar' })).toHaveAccessibleDescription(
      'Um toque curto confirma.',
    )
  })

  it('não tem violações de acessibilidade', async () => {
    const { container } = render(
      <Switch label="Narração" description="Lê em voz alta." checked onChange={() => {}} />,
    )
    await expectNoA11yViolations(container)
  })
})

function MotionControl() {
  const [value, setValue] = useState('system')
  return (
    <SegmentedControl
      legend="Movimento"
      value={value}
      onChange={setValue}
      options={[
        { value: 'system', label: 'Sistema' },
        { value: 'full', label: 'Com animação' },
        { value: 'reduced', label: 'Sem animação' },
      ]}
    />
  )
}

describe('SegmentedControl', () => {
  it('agrupa as opções sob a legenda', () => {
    render(<MotionControl />)
    expect(screen.getByRole('group', { name: /Movimento/ })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })

  it('troca a seleção ao clicar', async () => {
    const user = userEvent.setup()
    render(<MotionControl />)

    await user.click(screen.getByRole('radio', { name: 'Sem animação' }))
    expect(screen.getByRole('radio', { name: 'Sem animação' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Sistema' })).not.toBeChecked()
  })

  it('não tem violações de acessibilidade', async () => {
    const { container } = render(<MotionControl />)
    await expectNoA11yViolations(container)
  })
})

describe('Spinner', () => {
  it('expõe o estado como texto, não só como animação', () => {
    render(<Spinner label="Carregando o rastreamento…" />)
    expect(screen.getByRole('status')).toHaveTextContent('Carregando o rastreamento…')
  })
})
