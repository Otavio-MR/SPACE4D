import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// `VITE_BASE_PATH` permite publicar em subcaminho (ex.: GitHub Pages usa "/SPACE4D/").
const base = process.env.VITE_BASE_PATH ?? '/'

export default defineConfig(({ mode }) => ({
  base,
  plugins: [
    react(),
    tailwindcss(),
    /*
     * `npm run dev:https` — a câmera (getUserMedia) só funciona em contexto
     * seguro, então testar no celular pela rede local exige HTTPS.
     *
     * O gatilho é o MODO do Vite, não uma variável de ambiente: `HTTPS=1 vite`
     * é sintaxe de shell POSIX e falha no cmd.exe do Windows com "não é
     * reconhecido como um comando interno ou externo". `--mode` é um argumento
     * do próprio Vite e funciona igual nos três sistemas.
     */
    ...(mode === 'https' ? [basicSsl()] : []),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.svg', 'icons/*.png'],
      manifest: {
        name: 'Órbita AR',
        short_name: 'Órbita',
        description:
          'Explore o Sistema Solar em realidade aumentada com cartas impressas — ou sem AR, com o mesmo conteúdo.',
        lang: 'pt-BR',
        theme_color: '#0b0f1a',
        background_color: '#0b0f1a',
        display: 'standalone',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,mind}'],
        // O motor de rastreamento (mind-ar + tfjs) é um chunk grande, mas essencial offline.
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Ver src/vendor/mind-ar/node-fetch-stub.js: caminho de Node do TF.js,
      // morto no navegador, mas que o bundler precisa resolver.
      'node-fetch': fileURLToPath(
        new URL('./src/vendor/mind-ar/node-fetch-stub.js', import.meta.url),
      ),
    },
  },
  server: { host: true },
  build: { target: 'es2022' },
}))
