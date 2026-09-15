# Notas para quem for mexer neste repositório

Complementa o `README.md`, que cobre o que o projeto é e como rodá-lo. Aqui ficam
as armadilhas.

## Antes de abrir um PR

```sh
npm run check   # lint + tipos + testes + formatação
```

## Invariantes que quebram o app silenciosamente

**A ordem em `src/content/bodies.ts` é um contrato.** O índice de cada corpo na
lista é o índice do alvo dentro de `public/targets/orbita.mind`, e é assim que
`ARScene` decide qual modelo colocar sobre qual carta. Inserir um corpo no meio
da lista sem rodar `npm run cards` faz aparecer o planeta errado sobre a carta —
sem nenhum erro no console. Há um teste que protege isso.

**O QR impresso é imutável.** `CARDS_BASE_URL` é lido em tempo de geração. Gerar
as cartas com o padrão (`http://localhost:5173`) e imprimi-las produz um baralho
com QRs inúteis.

**Recompile os alvos junto com as cartas.** `npm run cards` roda as duas etapas.
Regerar só o PNG deixa o `.mind` descrevendo um desenho que não existe mais.

## TypeScript: quatro projetos

| Arquivo               | Cobre                           | Particularidade      |
| --------------------- | ------------------------------- | -------------------- |
| `tsconfig.app.json`   | `src`, exceto testes e `vendor` | Só tipos de browser  |
| `tsconfig.test.json`  | Testes e utilitários de teste   | Inclui tipos do Node |
| `tsconfig.tools.json` | `tools`, `src/content`          | `erasableSyntaxOnly` |
| `tsconfig.node.json`  | Arquivos de config              | —                    |

`tools/` roda direto no Node, por type stripping — nada de `enum`, propriedades
de parâmetro em construtor ou `namespace`. `erasableSyntaxOnly` reprova isso na
verificação de tipos, antes de virar erro em execução.

`src/content/` aparece em dois projetos porque é compartilhado entre o app e as
ferramentas. Ele não pode importar nada do DOM.

## Coisas que já deram errado

**Shaders são template literals.** Uma crase num comentário GLSL termina a string
e produz um erro de sintaxe do TypeScript em outro ponto do arquivo. Use aspas
simples nos comentários dos shaders.

**Não misture a direção na esfera com a posição de amostragem do ruído.** Houve um
bug em que `normalize(p)` era calculado sobre a posição já deslocada pela semente.
Com deslocamento grande, todos os pontos apontam quase para a mesma direção: a
latitude vira constante, e as faixas dos gigantes gasosos, o gelo polar e as
calotas simplesmente somem. `dir` vem de `vObjectPosition`; `p` só desloca o ruído.

**Não é possível validar a detecção em AR neste ambiente de build.** Sem GPU, o
WebGL por software corrompe os kernels do TensorFlow.js e o matcher nunca casa,
mesmo com a imagem exata do alvo. Não tente "consertar" a detecção a partir de
um teste headless — o teste é que não vale. Veja "Limitações conhecidas" no
README.

**O axe no jsdom não avalia contraste.** Ele precisa de `canvas.getContext`, que
o jsdom não implementa, e pula a regra em silêncio. Contraste é testado
separadamente, nos tokens, em `src/styles/contrast.test.ts`. Ao acrescentar uma
cor nova à paleta, acrescente também o par correspondente nesse teste.

**Não esconda navegação duplicada só com CSS.** Duas `<nav>` com o mesmo rótulo,
uma com `hidden sm:block` e outra com `sm:hidden`, continuam as duas na árvore de
acessibilidade: dois landmarks idênticos e todos os links repetidos na tabulação.
`AppShell` escolhe uma via `useMediaQuery`.

**Link é `<a>`, ação é `<button>`.** Aninhar um no outro é HTML inválido e quebra
teclado e leitor de tela. Use `LinkButton` para um link com cara de botão.

## Acessibilidade: o mínimo ao acrescentar uma tela

1. `usePageTitle` — numa SPA o título não muda sozinho, e é por ele que o leitor
   de tela anuncia a nova tela.
2. Um único `h1`, sem pular níveis. O axe pega, mas só se houver teste.
3. Botão só com ícone precisa de `label` (use `IconButton`).
4. Mudança de conteúdo sem movimentação de foco precisa de região viva.
5. Um teste com `expectNoA11yViolations`.

## mind-ar

O build vendorizado está em `src/vendor/mind-ar/`, com o porquê e o procedimento
de atualização no README de lá. Dois pontos:

- os nomes dos chunks têm hash e mudam a cada versão — confira os `import` no
  topo de `mindar-image.prod.js`;
- `mindar-image.prod.d.ts` é escrito à mão e cobre só o que usamos. Ao usar uma
  API nova do mind-ar, declare-a lá.

O alias `node-fetch` em `vite.config.ts` existe porque o TensorFlow.js empacotado
referencia `node-fetch` no seu caminho de Node. É código morto no navegador, mas
o bundler precisa resolver o especificador.
