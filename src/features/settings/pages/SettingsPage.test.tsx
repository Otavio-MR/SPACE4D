import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { expectNoA11yViolations } from '@/test/a11y.ts'
import { renderWithProviders } from '@/test/utils.tsx'

import { useSettings } from '../store.ts'
import { SettingsPage } from './SettingsPage.tsx'

beforeEach(() => {
  useSettings.getState().reset()
})

describe('SettingsPage', () => {
  it('reflete o estado salvo nos controles', () => {
    useSettings.getState().setMotion('reduced')
    renderWithProviders(<SettingsPage />)

    expect(screen.getByRole('radio', { name: 'Sem animação' })).toBeChecked()
  })

  it('salva a mudança de preferência de movimento', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SettingsPage />)

    await user.click(screen.getByRole('radio', { name: 'Com animação' }))
    expect(useSettings.getState().motion).toBe('full')
  })

  it('alterna a narração por voz', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SettingsPage />)

    await user.click(screen.getByRole('switch', { name: 'Narração por voz' }))
    expect(useSettings.getState().speech).toBe(true)
  })

  it('restaura os padrões', async () => {
    const user = userEvent.setup()
    useSettings.getState().setTextScale('larger')
    useSettings.getState().setHaptics(false)
    renderWithProviders(<SettingsPage />)

    await user.click(screen.getByRole('button', { name: 'Restaurar padrões' }))
    expect(useSettings.getState().textScale).toBe('normal')
    expect(useSettings.getState().haptics).toBe(true)
  })

  it('dá a cada controle uma descrição associada', () => {
    renderWithProviders(<SettingsPage />)
    expect(
      screen.getByRole('switch', { name: 'Vibrar ao reconhecer' }),
    ).toHaveAccessibleDescription(/toque curto/)
  })

  it('não tem violações de acessibilidade', async () => {
    const { container } = renderWithProviders(<SettingsPage />)
    await expectNoA11yViolations(container)
  })
})
