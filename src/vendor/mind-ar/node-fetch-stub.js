/**
 * Substituto de `node-fetch` para o bundle do navegador.
 *
 * O TensorFlow.js empacotado dentro do mind-ar carrega `require("node-fetch")`
 * na sua camada de plataforma para Node. No navegador esse caminho nunca é
 * executado — o TF.js usa o `fetch` nativo —, mas o bundler ainda precisa
 * resolver o especificador. Este stub o satisfaz sem puxar nada, e falha alto
 * caso algum dia seja realmente chamado.
 *
 * Ligado em `vite.config.ts` por um alias de resolução.
 */
export default function nodeFetchUnavailable() {
  throw new Error(
    'node-fetch não existe no navegador. O TensorFlow.js deveria usar o fetch nativo aqui.',
  )
}
