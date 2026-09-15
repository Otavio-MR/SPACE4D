import { render, type RenderResult } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router'

import { AnnouncerProvider } from '@/components/Announcer.tsx'

/** Renderiza com os provedores que o app sempre tem em volta das telas. */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/' }: { route?: string } = {},
): RenderResult {
  return render(
    <AnnouncerProvider>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </AnnouncerProvider>,
  )
}
