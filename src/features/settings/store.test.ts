import { beforeEach, describe, expect, it } from 'vitest'

import { TEXT_SCALE_VALUES, useSettings } from './store.ts'

beforeEach(() => {
  useSettings.getState().reset()
})

describe('preferências', () => {
  it('começa em valores neutros, seguindo o sistema', () => {
    const state = useSettings.getState()
    expect(state.motion).toBe('system')
    expect(state.textScale).toBe('normal')
    // Narração em voz alta é intrusiva: quem quiser, liga.
    expect(state.speech).toBe(false)
  })

  it('atualiza cada preferência', () => {
    useSettings.getState().setMotion('reduced')
    useSettings.getState().setTextScale('larger')
    useSettings.getState().setSpeech(true)
    useSettings.getState().setHaptics(false)
    useSettings.getState().setArLabels(false)

    const state = useSettings.getState()
    expect(state.motion).toBe('reduced')
    expect(state.textScale).toBe('larger')
    expect(state.speech).toBe(true)
    expect(state.haptics).toBe(false)
    expect(state.arLabels).toBe(false)
  })

  it('volta aos padrões', () => {
    useSettings.getState().setMotion('full')
    useSettings.getState().setSpeech(true)
    useSettings.getState().reset()

    expect(useSettings.getState().motion).toBe('system')
    expect(useSettings.getState().speech).toBe(false)
  })

  it('salva no armazenamento local para persistir entre sessões', () => {
    useSettings.getState().setTextScale('large')
    expect(localStorage.getItem('orbita:settings')).toContain('large')
  })

  it('define uma escala de texto para cada opção', () => {
    expect(Object.keys(TEXT_SCALE_VALUES).sort()).toEqual(['large', 'larger', 'normal'])
    for (const value of Object.values(TEXT_SCALE_VALUES)) {
      expect(value).toMatch(/^\d+%$/)
    }
  })
})
