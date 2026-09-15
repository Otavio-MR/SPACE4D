import { use } from 'react'

import { AnnouncerContext, type AnnouncerApi } from './announcer-context.ts'

export function useAnnouncer(): AnnouncerApi {
  const context = use(AnnouncerContext)
  if (!context) throw new Error('useAnnouncer precisa estar dentro de <AnnouncerProvider>')
  return context
}
