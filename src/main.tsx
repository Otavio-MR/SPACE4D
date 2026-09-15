import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'

import { AnnouncerProvider } from '@/components/Announcer.tsx'

import { router } from './app/routes.ts'
import './styles/globals.css'

const container = document.getElementById('root')
if (!container) throw new Error('Elemento #root não encontrado em index.html')

createRoot(container).render(
  <StrictMode>
    <AnnouncerProvider>
      <RouterProvider router={router} />
    </AnnouncerProvider>
  </StrictMode>,
)
