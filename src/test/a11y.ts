import { axe } from 'vitest-axe'
import { expect } from 'vitest'

/**
 * Roda o axe-core no container e falha o teste listando as violações encontradas.
 *
 * Preferimos esta função ao matcher `toHaveNoViolations` do vitest-axe porque o
 * matcher depende de uma augmentação global (`namespace Vi`) que não acompanha as
 * versões recentes do Vitest.
 */
export async function expectNoA11yViolations(container: Element): Promise<void> {
  const results = await axe(container)
  const messages = results.violations.map(
    (v) => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.map((n) => n.html).join('\n  ')}`,
  )
  expect(messages, `Violações de acessibilidade encontradas:\n\n${messages.join('\n\n')}`).toEqual(
    [],
  )
}
