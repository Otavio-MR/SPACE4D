import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config.ts'

// `vite.config.ts` agora exporta uma função (o modo decide se o HTTPS entra),
// então a resolvemos aqui antes de mesclar. Modo `test`: nada de certificado.
export default mergeConfig(
  viteConfig({ command: 'serve', mode: 'test' }),
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}', 'tools/**/*.test.ts'],
      css: false,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/vendor/**', 'src/**/*.test.*', 'src/test/**', 'src/main.tsx'],
      },
    },
  }),
)
