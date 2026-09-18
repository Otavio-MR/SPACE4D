# Órbita AR

Cartas de realidade aumentada sobre o Sistema Solar. Aponte a câmera para uma
carta impressa e o corpo celeste aparece em 3D sobre ela, com ficha completa e
narração. Sem carta, sem câmera ou sem vontade de apontar o celular, **o mesmo
conteúdo está no catálogo** — essa equivalência é um requisito do projeto, não
um plano B.

Inspirado nas cartas 4D+ da Octagon Studio, mas com arte, conteúdo e código
próprios: nenhum material de terceiros é usado ou redistribuído.

## Sumário

- [O que funciona hoje](#o-que-funciona-hoje)
- [Rodando o projeto](#rodando-o-projeto)
- [Testando no celular](#testando-no-celular)
- [As cartas](#as-cartas)
- [Acessibilidade](#acessibilidade)
- [Arquitetura](#arquitetura)
- [Testes](#testes)
- [Limitações conhecidas](#limitações-conhecidas)

## O que funciona hoje

| Área                               | Estado                                                        |
| ---------------------------------- | ------------------------------------------------------------- |
| Catálogo, fichas e visualizador 3D | Funcionando, verificado em navegador                          |
| Geração das cartas (PNG + PDF A4)  | Funcionando, 10 cartas                                        |
| Compilação dos alvos (`.mind`)     | Funcionando, arquivo validado                                 |
| Tela de AR: câmera, motor, alvos   | Inicializa corretamente                                       |
| Detecção da carta em AR            | **Não verificada** — ver [Limitações](#limitações-conhecidas) |
| PWA, offline, instalável           | Funcionando                                                   |
| Lint, tipos, 100 testes, build     | Passando                                                      |

## Rodando o projeto

Requer **Node 22.22+** (ver `.nvmrc`).

```sh
npm install
npm run dev
```

Scripts principais:

| Comando             | O que faz                                                           |
| ------------------- | ------------------------------------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento                                         |
| `npm run dev:https` | Idem, com HTTPS — necessário para usar a câmera fora de `localhost` |
| `npm run build`     | Build de produção                                                   |
| `npm run check`     | Lint + tipos + testes + formatação (o que o CI roda)                |
| `npm run cards`     | Regera as cartas e recompila os alvos                               |
| `npm run icons`     | Regera os ícones do PWA                                             |

## Testando no celular

A API de câmera (`getUserMedia`) só funciona em **contexto seguro**. `localhost`
conta; o IP da sua máquina na rede local, não. Por isso existe o `dev:https`:

```sh
npm run dev:https
```

O Vite imprime dois endereços; use o **Network** (`https://192.168.x.x:5173`) no
celular, com o aparelho na mesma rede Wi-Fi.

O navegador vai avisar que o certificado é autoassinado — é esperado, aceite o
aviso. O app detecta a ausência de contexto seguro e explica isso na tela, em vez
de apenas falhar.

Os scripts funcionam igual no Windows, macOS e Linux: o HTTPS é ligado por
`vite --mode https`, e não por uma variável de ambiente embutida no comando
(`HTTPS=1 vite` é sintaxe de shell POSIX e quebra no `cmd.exe`).

## As cartas

As cartas são **nossas**, desenhadas para este app, e ficam em
`public/cards/orbita-cartas.pdf` (2 folhas A4, 10 cartas).

### Por que cartas próprias

Além da questão óbvia de direito autoral sobre a arte de outro produto, há três
razões práticas:

1. **Qualquer pessoa pode testar.** Imprimir um PDF leva dois minutos; comprar um
   baralho, não. Para avaliação com usuários, isso é decisivo.
2. **O desenho é otimizado para o rastreamento.** Textura irregular e densa,
   alto contraste local, quatro cantos distintos entre si.
3. **A carta é interface.** É o primeiro contato do usuário com o produto.

### Regras de desenho

Estão codificadas em `tools/cards/design.ts` e verificadas em
`tools/cards/design.test.ts`:

- toda a arte gerada aleatoriamente fica **acima** da faixa de texto — a primeira
  versão espalhava pontos e linhas por toda a carta, cruzando o título e as
  instruções;
- os anéis ficam dentro da moldura;
- nenhum módulo do QR invade a marca de orientação do canto inferior esquerdo;
- o desenho é determinístico: mesma semente, mesma carta.

### Imprimindo

- **Papel fosco.** Brilhante ou plastificado reflete e arruína o rastreamento.
- **Tamanho real (100%).** Desative o ajuste automático à página.
- **Papel mais grosso** evita ondulação, que deforma a imagem.

### Regerando

```sh
npm run cards -- --base-url=https://seu-dominio.exemplo
```

`--base-url` define o endereço que o QR de cada carta abre (padrão:
`http://localhost:5173`). **Aponte-o para o endereço real antes de gerar as
cartas definitivas** — o QR impresso não muda depois.

O argumento funciona em qualquer shell. Em Linux e macOS a variável de ambiente
`CARDS_BASE_URL` também serve; no Windows, prefira o argumento.

`npm run cards` faz duas coisas em sequência:

1. `cards:generate` — renderiza os SVGs em PNG e monta o PDF (via Chromium);
2. `cards:compile` — extrai as features de cada PNG e grava
   `public/targets/orbita.mind`.

> **A ordem dos alvos importa.** O índice de cada alvo no `.mind` é a posição do
> corpo em `src/content/bodies.ts` — é assim que `ARScene` sabe qual modelo 3D
> colocar sobre qual carta. Mexeu na lista, recompile. Há um teste que protege
> essa invariante (`src/content/bodies.test.ts`).

## Acessibilidade

O objetivo é **WCAG 2.2 nível AA**. O que já está implementado e verificado:

### Caminho equivalente sem AR

Conteúdo em AR é intrinsecamente visual e exige motricidade — segurar o aparelho,
apontar, estabilizar. Por isso o catálogo não é um modo degradado: ele entrega o
mesmo conteúdo, navegável por teclado, sem câmera e sem carta impressa
(1.1.1, 2.1.1). Cada carta impressa traz ainda o nome em tipografia grande e um
QR que abre a ficha direto no modo sem AR.

### Detalhes

- **Contraste** — paleta com texto principal a 7:1 (AAA) e bordas de componentes
  interativos a 3:1 (1.4.11). Verificado em `src/styles/contrast.test.ts`.
- **Foco visível** — anel de 3px em âmbar, com 3:1 contra qualquer superfície.
- **Movimento** — respeita `prefers-reduced-motion` e oferece controle explícito
  nas preferências (2.3.3); sem animação, o laço de render do 3D para.
- **Modelo 3D** — audiodescrição no `role="img"` e rotação por **botões de
  verdade**, não por teclas capturadas num elemento não interativo.
- **Mudanças sem foco** — carta reconhecida, carta perdida e contagem de filtros
  passam por região viva (4.1.3).
- **Interface sobre a câmera** — fundo opaco e borda, porque a imagem da câmera
  é imprevisível e cor sozinha não garante contraste.
- **Alvos de toque** — mínimo de 44px (2.5.8).
- **Texto** — escala ajustável até 130% no `font-size` da raiz, de modo que o
  espaçamento em `rem` acompanhe.
- **Navegação única** — só uma barra de navegação é renderizada por vez; esconder
  a outra com CSS deixaria dois landmarks idênticos na árvore de acessibilidade.
- **`prefers-contrast: more`** — reforça bordas e texto secundário.

### O que ainda falta

Conformidade não se prova só com ferramenta automatizada. Falta:

- teste com leitor de tela real (NVDA, VoiceOver, TalkBack);
- teste com usuários, inclusive com deficiência;
- revisão de navegação por teclado em aparelho físico;
- avaliação da carga cognitiva do conteúdo com o público-alvo.

## Arquitetura

```
src/
  app/              Composição: shell, rotas, 404
  components/       Design system (Button, Switch, Dialog, ícones…)
  content/          Catálogo do Sistema Solar — compartilhado com as ferramentas
  features/
    ar/             Sessão de câmera, rastreamento, cena sobreposta
      lib/          TrackingStore, projeção da câmera
      hooks/        Ciclo de vida da sessão
    viewer3d/       Corpos procedurais, shaders, enquadramento
    catalog/ body/ cards/ settings/ home/
  hooks/ lib/ styles/ test/
  vendor/mind-ar/   Build de navegador do mind-ar (ver o README de lá)
tools/
  cards/            Desenho, geração e compilação das cartas
  icons/            Ícones do PWA
```

### Decisões que merecem explicação

**Web, não APK.** WCAG é norma web: DOM semântico, ARIA, leitor de tela, axe,
Lighthouse. Em Unity/nativo, acessibilidade de canvas 3D é território hostil.
O PWA é instalável, e um APK sai do mesmo código via Capacitor ou Bubblewrap.

**Corpos procedurais, sem texturas.** Os planetas são gerados em shader (ruído
simplex + fbm). Nenhuma imagem para baixar, tudo funciona offline, e o bundle não
carrega dezenas de megabytes de mapas.

**Matrizes de rastreamento fora do React.** O rastreador emite uma pose por
quadro (~30 Hz). Elas ficam num objeto mutável lido pelo `useFrame`; só as
transições discretas — carta encontrada, carta perdida — atravessam o React.

**mind-ar vendorizado.** O pacote npm declara `canvas` (binding nativo do Cairo)
como dependência direta, usado só pelo compilador em Node. Instalá-lo obrigaria
todo mundo a compilar um módulo nativo pesado. Copiamos os três arquivos do build
de navegador — detalhes e procedimento de atualização em
`src/vendor/mind-ar/README.md`.

**Carregamento por rota.** Quem entra pelo início ou pelo catálogo baixa ~93 kB
(gzip). O three.js (240 kB) só vem na ficha de um corpo; o rastreador com
TensorFlow.js (276 kB) só quando a câmera abre.

## Testes

```sh
npm run test           # 100 testes
npm run test:coverage
```

Cobrem, entre outras coisas:

- **acessibilidade** — axe-core nas telas e nos componentes;
- **contraste** — calculado direto nos tokens, porque o axe no jsdom **não
  consegue** avaliar contraste (depende de renderização real);
- **matemática do AR** — projeção da câmera e transformação das poses;
- **enquadramento** — todo corpo cabe no quadro, anéis inclusive;
- **invariantes das cartas** — textura fora do texto, anéis dentro da moldura;
- **integridade do catálogo** — inclusive o vínculo entre índice de alvo e
  posição na lista.

## Limitações conhecidas

**A detecção da carta em AR ainda não foi verificada em aparelho real.**

Foi verificado, em ambiente headless: a câmera abre, o motor carrega, o `.mind`
é lido com os 10 alvos corretos (750×1050 cada) e o rastreador processa os
quadros normalmente (~800 quadros em 60s). O arquivo de alvos foi decodificado e
tem perfil saudável — cerca de 380 pontos de interesse por alvo na escala mais
fina.

O que **não** foi possível verificar é o reconhecimento em si: o ambiente de
build não tem GPU, e o WebGL por software (SwiftShader) não produz resultados
corretos nos kernels de extração de features do TensorFlow.js. Mesmo alimentando
a câmera com a imagem exata de uma carta compilada, em escala 1:1, o matcher não
casa — o que não acontece com um detector funcionando.

Ou seja: a cadeia toda está montada e o artefato está íntegro, mas **o primeiro
teste em celular é o passo que falta.** Se a detecção falhar lá, os suspeitos,
em ordem: iluminação e reflexo no papel, proporção de impressão, e os parâmetros
`warmupTolerance` / `missTolerance` em `src/features/ar/hooks/useARSession.ts`.

### Outras

- Apenas português do Brasil; não há infraestrutura de i18n ainda.
- Sem tema claro — o tema escuro é decisão de produto, mas quem precisa de fundo
  claro não tem alternativa hoje.
- A narração usa a Web Speech API, cuja qualidade de voz varia muito entre
  aparelhos.

## Licença e créditos

Código e arte das cartas são deste projeto. O rastreamento usa
[mind-ar](https://github.com/hiukim/mind-ar-js) (MIT). As fontes Inter e Space
Grotesk são distribuídas sob a SIL Open Font License.
