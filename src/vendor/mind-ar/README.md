# mind-ar (build de navegador, vendorizado)

Arquivos copiados de [`mind-ar@1.2.5`](https://github.com/hiukim/mind-ar-js) (MIT, ver `LICENSE`).

## Por que está aqui em vez de `node_modules`

O pacote `mind-ar` declara `canvas` (binding nativo do Cairo) como dependência
direta. O `canvas` só é usado pelo compilador quando ele roda em Node; o build de
navegador não o toca. Instalar o pacote inteiro obrigaria toda pessoa que clona o
repositório a compilar um módulo nativo pesado — e a instalação falha em ambientes
sem as bibliotecas de sistema do Cairo.

Copiamos apenas os três arquivos do build ESM de navegador:

- `mindar-image.prod.js` — exporta `Controller`, `Compiler` e `UI`
- `controller-mGt1s8dJ.js` — o rastreador (inclui TensorFlow.js e o worker)
- `ui-fBadYuor.js` — a interface embutida do mind-ar, que não usamos

`mindar-image.prod.d.ts` é uma declaração de tipos escrita por nós, cobrindo só a
parte da API que o app consome.

## O que verificamos neste build

- O worker é criado a partir de um blob embutido em base64 — não há `new Worker(new URL(...))`
  para o bundler resolver, nem arquivo solto a publicar.
- Não há nenhuma URL `https://` no código: nenhum modelo ou wasm é buscado em
  tempo de execução. O rastreamento funciona totalmente offline.

## Como atualizar

```sh
npm pack mind-ar@<versão>
tar -xzf mind-ar-<versão>.tgz
cp package/dist/mindar-image.prod.js package/dist/controller-*.js package/dist/ui-*.js src/vendor/mind-ar/
cp package/LICENSE src/vendor/mind-ar/
```

Os nomes dos chunks têm hash e mudam entre versões: confira os `import` no topo de
`mindar-image.prod.js` e renomeie os arquivos, ou ajuste as importações.
