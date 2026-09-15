import { createBrowserRouter } from 'react-router'

import { AppShell } from './AppShell.tsx'

/*
 * Cada rota é carregada sob demanda, então o pacote inicial não carrega o que a
 * tela atual não usa. Isso importa aqui mais que no app típico:
 *
 *   - `corpo/:id` puxa o three.js (centenas de KB) para o visualizador 3D;
 *   - `ar` puxa, além disso, o rastreador com TensorFlow.js (~1 MB), e este por
 *     uma importação dinâmica dentro da própria tela, só quando a câmera abre.
 *
 * Quem entra pelo início ou pelo catálogo não baixa nada disso. `AppShell` fica
 * fora do carregamento tardio: o cabeçalho e a navegação aparecem de imediato.
 */
export const router = createBrowserRouter(
  [
    {
      path: '/',
      Component: AppShell,
      children: [
        {
          index: true,
          lazy: async () => ({
            Component: (await import('@/features/home/pages/HomePage.tsx')).HomePage,
          }),
        },
        {
          path: 'ar',
          lazy: async () => ({
            Component: (await import('@/features/ar/components/ARView.tsx')).ARView,
          }),
        },
        {
          path: 'catalogo',
          lazy: async () => ({
            Component: (await import('@/features/catalog/pages/CatalogPage.tsx')).CatalogPage,
          }),
        },
        {
          path: 'corpo/:id',
          lazy: async () => ({
            Component: (await import('@/features/body/pages/BodyPage.tsx')).BodyPage,
          }),
        },
        {
          path: 'cartas',
          lazy: async () => ({
            Component: (await import('@/features/cards/pages/CardsPage.tsx')).CardsPage,
          }),
        },
        {
          path: 'preferencias',
          lazy: async () => ({
            Component: (await import('@/features/settings/pages/SettingsPage.tsx')).SettingsPage,
          }),
        },
        {
          path: '*',
          lazy: async () => ({ Component: (await import('./NotFoundPage.tsx')).NotFoundPage }),
        },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
)
