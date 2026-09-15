import type { BodyKind, CelestialBody } from './types.ts'

export const KIND_LABELS: Record<BodyKind, string> = {
  estrela: 'Estrela',
  'planeta-rochoso': 'Planeta rochoso',
  'gigante-gasoso': 'Gigante gasoso',
  'gigante-de-gelo': 'Gigante de gelo',
  'satelite-natural': 'Satélite natural',
}

/**
 * Catálogo do Sistema Solar. A ordem define a numeração das cartas e o índice
 * dos alvos de rastreamento (targets) compilados em `public/targets/orbita.mind`.
 */
export const bodies: CelestialBody[] = [
  {
    id: 'sol',
    name: 'Sol',
    kind: 'estrela',
    order: 1,
    tagline: 'A estrela do nosso sistema',
    summary:
      'O Sol é uma estrela de tamanho médio, mas contém 99,8% de toda a massa do Sistema Solar. Sua gravidade mantém os planetas em órbita, e sua luz e calor tornam a vida possível na Terra.',
    appearance:
      'Uma esfera brilhante, amarelo-alaranjada, com a superfície em constante movimento: regiões mais claras e mais escuras se misturam como um líquido fervente. Ao redor, um halo suave de luz dourada.',
    facts: [
      { label: 'Tipo', value: 'Estrela anã amarela (G2V)' },
      { label: 'Diâmetro', value: '1.392.700 km (109 Terras lado a lado)' },
      { label: 'Temperatura na superfície', value: 'cerca de 5.500 °C' },
      { label: 'Distância da Terra', value: '149,6 milhões de km (1 UA)' },
      { label: 'Idade', value: 'cerca de 4,6 bilhões de anos' },
      { label: 'Rotação', value: 'cerca de 25 dias no equador' },
    ],
    curiosities: [
      'A luz do Sol leva cerca de 8 minutos e 20 segundos para chegar à Terra.',
      'Cabem mais de 1 milhão de Terras dentro do Sol.',
      'O Sol não é sólido: é feito principalmente de hidrogênio e hélio em estado de plasma.',
    ],
    accent: '#ffb347',
    visual: {
      surface: {
        mode: 'star',
        colors: ['#ff8c1a', '#ffd166', '#fff4cc'],
        noiseScale: 2.2,
        seed: 1,
      },
      atmosphere: { color: '#ff9a1f', intensity: 1 },
      axialTilt: 7,
      rotationSpeed: 0.05,
      displayScale: 1.15,
    },
  },
  {
    id: 'mercurio',
    name: 'Mercúrio',
    kind: 'planeta-rochoso',
    order: 2,
    tagline: 'O menor e mais veloz',
    summary:
      'Mercúrio é o planeta mais próximo do Sol e o menor do Sistema Solar. Sem atmosfera para reter calor, ele oscila entre extremos: escaldante de dia e gelado à noite.',
    appearance:
      'Uma esfera cinza, coberta de crateras de todos os tamanhos, parecida com a Lua. A superfície tem tons que vão do cinza-claro ao grafite.',
    facts: [
      { label: 'Tipo', value: 'Planeta rochoso' },
      { label: 'Diâmetro', value: '4.879 km' },
      { label: 'Distância do Sol', value: '57,9 milhões de km' },
      { label: 'Duração do dia', value: '59 dias terrestres' },
      { label: 'Duração do ano', value: '88 dias terrestres' },
      { label: 'Luas', value: 'nenhuma' },
      { label: 'Temperatura', value: 'de −180 °C a 430 °C' },
    ],
    curiosities: [
      'Um dia solar em Mercúrio (de um nascer do Sol ao próximo) dura 176 dias terrestres — dois anos mercurianos!',
      'Apesar de ser o mais próximo do Sol, não é o planeta mais quente: Vênus é.',
      'Tem um núcleo de ferro enorme, que ocupa cerca de 85% do seu raio.',
    ],
    accent: '#c2bcb2',
    visual: {
      surface: {
        mode: 'rocky',
        colors: ['#6f6b67', '#a8a39c', '#3b3836'],
        noiseScale: 3.6,
        seed: 2,
        polarCaps: 0,
      },
      axialTilt: 0,
      rotationSpeed: 0.08,
      displayScale: 0.7,
    },
  },
  {
    id: 'venus',
    name: 'Vênus',
    kind: 'planeta-rochoso',
    order: 3,
    tagline: 'O planeta mais quente',
    summary:
      'Vênus tem quase o mesmo tamanho da Terra, mas uma atmosfera densa de dióxido de carbono provoca um efeito estufa descontrolado. O resultado é a superfície mais quente entre todos os planetas.',
    appearance:
      'Uma esfera amarelo-creme, totalmente coberta por nuvens espessas que escondem a superfície. As nuvens formam faixas suaves e levemente onduladas.',
    facts: [
      { label: 'Tipo', value: 'Planeta rochoso' },
      { label: 'Diâmetro', value: '12.104 km' },
      { label: 'Distância do Sol', value: '108,2 milhões de km' },
      { label: 'Duração do dia', value: '243 dias terrestres' },
      { label: 'Duração do ano', value: '225 dias terrestres' },
      { label: 'Luas', value: 'nenhuma' },
      { label: 'Temperatura média', value: '465 °C' },
    ],
    curiosities: [
      'Vênus gira ao contrário: lá, o Sol nasce no oeste e se põe no leste.',
      'Sua pressão atmosférica é 90 vezes maior que a da Terra — como estar a 900 metros de profundidade no oceano.',
      "É o objeto mais brilhante do céu noturno depois da Lua, por isso é chamado de 'estrela d'alva'.",
    ],
    accent: '#ebc77f',
    visual: {
      surface: {
        mode: 'gas',
        colors: ['#d8b06a', '#f3dfa8', '#b5884a'],
        noiseScale: 2.4,
        seed: 3,
        bandFrequency: 3,
        warp: 0.55,
      },
      atmosphere: { color: '#f3dfa8', intensity: 0.55 },
      axialTilt: 177,
      rotationSpeed: -0.03,
      displayScale: 0.95,
    },
  },
  {
    id: 'terra',
    name: 'Terra',
    kind: 'planeta-rochoso',
    order: 4,
    tagline: 'Nosso lar no cosmos',
    summary:
      'A Terra é o único lugar conhecido com vida. Água líquida em abundância, uma atmosfera protetora e a distância certa do Sol fazem dela um planeta singular.',
    appearance:
      'Uma esfera azul, com continentes verdes e marrons e calotas brancas nos polos. Faixas de nuvens brancas cobrem partes da superfície, e um brilho azul-claro contorna o planeta.',
    facts: [
      { label: 'Tipo', value: 'Planeta rochoso' },
      { label: 'Diâmetro', value: '12.742 km' },
      { label: 'Distância do Sol', value: '149,6 milhões de km (1 UA)' },
      { label: 'Duração do dia', value: '24 horas' },
      { label: 'Duração do ano', value: '365,25 dias' },
      { label: 'Luas', value: '1 (a Lua)' },
      { label: 'Temperatura média', value: '15 °C' },
    ],
    curiosities: [
      'Cerca de 71% da superfície é coberta por água — por isso, vista do espaço, a Terra parece azul.',
      'A Terra não é uma esfera perfeita: é levemente achatada nos polos.',
      'A atmosfera protege a vida contra radiação e queima a maioria dos meteoros antes que atinjam o solo.',
    ],
    accent: '#5eaeff',
    visual: {
      surface: {
        mode: 'earth',
        colors: ['#1b4f9e', '#3d8c48', '#8b7a4e', '#f4f8ff'],
        noiseScale: 2.2,
        seed: 4,
      },
      atmosphere: { color: '#6ab7ff', intensity: 0.7 },
      axialTilt: 23.4,
      rotationSpeed: 0.1,
      displayScale: 1,
    },
  },
  {
    id: 'lua',
    name: 'Lua',
    kind: 'satelite-natural',
    order: 5,
    tagline: 'A companheira da Terra',
    summary:
      'A Lua é o único satélite natural da Terra e o único outro mundo que humanos já visitaram. Ela influencia as marés e estabiliza a inclinação do nosso planeta.',
    appearance:
      "Uma esfera cinza-clara com manchas mais escuras, chamadas 'mares', e crateras arredondadas espalhadas pela superfície. Não tem nuvens nem cor além de tons de cinza.",
    facts: [
      { label: 'Tipo', value: 'Satélite natural' },
      { label: 'Diâmetro', value: '3.474 km' },
      { label: 'Distância da Terra', value: '384.400 km' },
      { label: 'Rotação', value: '27,3 dias' },
      { label: 'Órbita ao redor da Terra', value: '27,3 dias' },
      { label: 'Gravidade', value: 'cerca de 1/6 da terrestre' },
      { label: 'Temperatura', value: 'de −173 °C a 127 °C' },
    ],
    curiosities: [
      'Vemos sempre a mesma face da Lua, porque ela leva o mesmo tempo para girar e para orbitar a Terra.',
      'Doze pessoas já caminharam na Lua, entre 1969 e 1972.',
      'A Lua se afasta da Terra cerca de 3,8 cm por ano.',
    ],
    accent: '#dcdcdc',
    visual: {
      surface: {
        mode: 'rocky',
        colors: ['#8f8f8f', '#cfcfcf', '#474747'],
        noiseScale: 4.2,
        seed: 5,
        polarCaps: 0,
      },
      axialTilt: 6.7,
      rotationSpeed: 0.06,
      displayScale: 0.6,
    },
  },
  {
    id: 'marte',
    name: 'Marte',
    kind: 'planeta-rochoso',
    order: 6,
    tagline: 'O planeta vermelho',
    summary:
      'Marte é um mundo frio e desértico, com o maior vulcão e o maior cânion do Sistema Solar. Robôs exploram sua superfície em busca de sinais de água e vida no passado.',
    appearance:
      'Uma esfera vermelho-alaranjada com regiões mais escuras e calotas polares brancas. A superfície lembra um deserto de ferrugem.',
    facts: [
      { label: 'Tipo', value: 'Planeta rochoso' },
      { label: 'Diâmetro', value: '6.779 km' },
      { label: 'Distância do Sol', value: '227,9 milhões de km' },
      { label: 'Duração do dia', value: '24 h 37 min' },
      { label: 'Duração do ano', value: '687 dias terrestres' },
      { label: 'Luas', value: '2 (Fobos e Deimos)' },
      { label: 'Temperatura média', value: '−63 °C' },
    ],
    curiosities: [
      'A cor vermelha vem do óxido de ferro — ferrugem — no solo.',
      'O Monte Olimpo tem cerca de 22 km de altura, quase três vezes o Everest.',
      'Marte tem estações do ano, assim como a Terra, porque seu eixo também é inclinado.',
    ],
    accent: '#ff7f4d',
    visual: {
      surface: {
        mode: 'rocky',
        colors: ['#a34a2b', '#dd8d5c', '#5c2b1b'],
        noiseScale: 2.8,
        seed: 6,
        polarCaps: 0.75,
      },
      atmosphere: { color: '#ffb08a', intensity: 0.25 },
      axialTilt: 25.2,
      rotationSpeed: 0.1,
      displayScale: 0.8,
    },
  },
  {
    id: 'jupiter',
    name: 'Júpiter',
    kind: 'gigante-gasoso',
    order: 7,
    tagline: 'O gigante do Sistema Solar',
    summary:
      'Júpiter é o maior planeta: cabem mais de 1.300 Terras dentro dele. É um gigante gasoso, sem superfície sólida, com faixas de nuvens e uma tempestade maior que a Terra.',
    appearance:
      'Uma esfera enorme com faixas horizontais em tons de creme, bege e marrom-avermelhado. Uma grande mancha oval, a Grande Mancha Vermelha, se destaca no hemisfério sul.',
    facts: [
      { label: 'Tipo', value: 'Gigante gasoso' },
      { label: 'Diâmetro', value: '139.820 km (11 Terras)' },
      { label: 'Distância do Sol', value: '778,5 milhões de km' },
      { label: 'Duração do dia', value: '9 h 56 min' },
      { label: 'Duração do ano', value: '11,9 anos terrestres' },
      { label: 'Luas', value: 'mais de 90 conhecidas' },
      { label: 'Temperatura média', value: '−110 °C' },
    ],
    curiosities: [
      'A Grande Mancha Vermelha é uma tempestade que dura há pelo menos 300 anos.',
      'É o planeta que gira mais rápido: um dia dura menos de 10 horas.',
      'Sua gravidade funciona como um escudo, desviando cometas e asteroides que poderiam atingir a Terra.',
    ],
    accent: '#e6bc8e',
    visual: {
      surface: {
        mode: 'gas',
        colors: ['#c9a276', '#f4dfc4', '#a35f3d'],
        noiseScale: 2.6,
        seed: 7,
        bandFrequency: 9,
        warp: 0.35,
      },
      axialTilt: 3.1,
      rotationSpeed: 0.16,
      displayScale: 1.25,
    },
  },
  {
    id: 'saturno',
    name: 'Saturno',
    kind: 'gigante-gasoso',
    order: 8,
    tagline: 'O senhor dos anéis',
    summary:
      'Saturno é famoso por seus anéis, feitos de bilhões de pedaços de gelo e rocha. É o segundo maior planeta e tão leve que flutuaria em água — se existisse uma banheira grande o bastante.',
    appearance:
      'Uma esfera dourada com faixas suaves, cercada por anéis largos e finos, em tons de bege e creme, com falhas escuras entre eles.',
    facts: [
      { label: 'Tipo', value: 'Gigante gasoso' },
      { label: 'Diâmetro', value: '116.460 km' },
      { label: 'Distância do Sol', value: '1,43 bilhão de km' },
      { label: 'Duração do dia', value: '10 h 33 min' },
      { label: 'Duração do ano', value: '29,4 anos terrestres' },
      { label: 'Luas', value: 'mais de 270 conhecidas' },
      { label: 'Temperatura média', value: '−140 °C' },
    ],
    curiosities: [
      'Os anéis têm cerca de 280.000 km de largura, mas, em geral, menos de 1 km de espessura.',
      'Titã, sua maior lua, tem atmosfera densa e lagos de metano líquido.',
      'É o planeta menos denso: sua densidade é menor que a da água.',
    ],
    accent: '#f2d58f',
    visual: {
      surface: {
        mode: 'gas',
        colors: ['#d9b978', '#f6e8c2', '#b7944f'],
        noiseScale: 2.4,
        seed: 8,
        bandFrequency: 7,
        warp: 0.2,
      },
      rings: { inner: 1.35, outer: 2.3, colors: ['#e8d7aa', '#a08a5e'], opacity: 0.9 },
      axialTilt: 26.7,
      rotationSpeed: 0.15,
      displayScale: 1.1,
    },
  },
  {
    id: 'urano',
    name: 'Urano',
    kind: 'gigante-de-gelo',
    order: 9,
    tagline: 'O planeta deitado',
    summary:
      'Urano gira praticamente de lado, com o eixo inclinado quase 98 graus. É um gigante de gelo, com cor azul-esverdeada causada pelo metano em sua atmosfera.',
    appearance:
      'Uma esfera azul-esverdeada, quase uniforme e lisa, com anéis finos e escuros que a cercam na vertical, como um alvo visto de lado.',
    facts: [
      { label: 'Tipo', value: 'Gigante de gelo' },
      { label: 'Diâmetro', value: '50.724 km' },
      { label: 'Distância do Sol', value: '2,87 bilhões de km' },
      { label: 'Duração do dia', value: '17 h 14 min' },
      { label: 'Duração do ano', value: '84 anos terrestres' },
      { label: 'Luas', value: '28 conhecidas' },
      { label: 'Temperatura média', value: '−195 °C' },
    ],
    curiosities: [
      'Por causa da inclinação, cada polo tem 42 anos de luz seguidos por 42 anos de escuridão.',
      'Foi o primeiro planeta descoberto com telescópio, em 1781, por William Herschel.',
      'Suas luas têm nomes de personagens de Shakespeare e Alexander Pope.',
    ],
    accent: '#93e6ea',
    visual: {
      surface: {
        mode: 'gas',
        colors: ['#8fd9dd', '#caf2f4', '#5fb8be'],
        noiseScale: 2,
        seed: 9,
        bandFrequency: 3,
        warp: 0.1,
      },
      rings: { inner: 1.6, outer: 1.95, colors: ['#b9d8dc', '#5f7f84'], opacity: 0.4 },
      atmosphere: { color: '#b7f0f3', intensity: 0.4 },
      axialTilt: 97.8,
      rotationSpeed: -0.12,
      displayScale: 1,
    },
  },
  {
    id: 'netuno',
    name: 'Netuno',
    kind: 'gigante-de-gelo',
    order: 10,
    tagline: 'O mundo dos ventos',
    summary:
      'Netuno é o planeta mais distante do Sol. Azul intenso e frio, abriga os ventos mais rápidos do Sistema Solar, que passam de 2.000 km/h.',
    appearance:
      'Uma esfera azul-escura e vibrante, com faixas sutis e algumas manchas mais escuras. Nuvens brancas e finas cruzam o planeta.',
    facts: [
      { label: 'Tipo', value: 'Gigante de gelo' },
      { label: 'Diâmetro', value: '49.244 km' },
      { label: 'Distância do Sol', value: '4,5 bilhões de km' },
      { label: 'Duração do dia', value: '16 horas' },
      { label: 'Duração do ano', value: '165 anos terrestres' },
      { label: 'Luas', value: '16 conhecidas' },
      { label: 'Temperatura média', value: '−200 °C' },
    ],
    curiosities: [
      'Foi descoberto pela matemática antes de ser visto: cálculos previram sua posição em 1846.',
      'Desde a descoberta, completou apenas uma volta ao redor do Sol, em 2011.',
      'Sua lua Tritão orbita ao contrário e pode ser um objeto capturado do Cinturão de Kuiper.',
    ],
    accent: '#6f8cff',
    visual: {
      surface: {
        mode: 'gas',
        colors: ['#2b4fd8', '#5d7dff', '#1a2f8a'],
        noiseScale: 2.3,
        seed: 10,
        bandFrequency: 5,
        warp: 0.3,
      },
      atmosphere: { color: '#7f9bff', intensity: 0.5 },
      axialTilt: 28.3,
      rotationSpeed: 0.13,
      displayScale: 1,
    },
  },
]

export const bodiesById: ReadonlyMap<string, CelestialBody> = new Map(bodies.map((b) => [b.id, b]))

export function getBody(id: string): CelestialBody | undefined {
  return bodiesById.get(id)
}

/** Índice do alvo de rastreamento (0-based) = posição na lista ordenada. */
export function targetIndexOf(id: string): number {
  return bodies.findIndex((b) => b.id === id)
}
