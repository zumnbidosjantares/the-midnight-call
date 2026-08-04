// palette.js — a paleta fechada do jogo.
//
// Vinda das referencias: 2Dark (preto esmagado, ambar sujo, vermelho seco)
// e do figurino do Sebastian (camisa branca encardida, colete azul-chumbo,
// gravata vinho). Tudo dessaturado. A unica cor que tem permissao de
// gritar e o vermelho — e ela e reservada para sangue e para o titulo.

export const PAL = {
  // Pele e roupa sao MAIS claras do que a logica pediria. O jogo inteiro
  // roda com luz ambiente muito baixa (a cena e multiplicada pela luz), e
  // um figurino "realista" viraria uma silhueta preta ilegivel.

  // pele
  skinHi:  '#e0ad82',
  skin:    '#cd936c',
  skinSh:  '#a5704f',
  skinDk:  '#7f5339',

  // Cabelo bem escuro. Com o sobretudo marrom, cabelo castanho claro fazia
  // a cabeca derreter dentro do casaco — precisa de contraste, nao de
  // realismo.
  hairDk:  '#140e0d',
  hair:    '#221917',
  hairHi:  '#34251f',

  // camisa
  shirtHi: '#ece7da',
  shirt:   '#d2ccbe',
  shirtSh: '#a49d90',
  shirtDk: '#736d63',

  // Sobretudo marrom. E ele que da a silhueta do personagem: ombro largo,
  // gola levantada, aba caindo ate o joelho. Colete e camisa sozinhos nao
  // formavam forma nenhuma a 62 pixels de altura.
  coatHi:  '#8a6440',
  coat:    '#6d4c2e',
  coatDk:  '#4a3320',
  coatEdge:'#2b1d12',

  // colete, ainda visivel na abertura do sobretudo
  vestHi:  '#414b5e',
  vest:    '#2e3644',
  vestDk:  '#1c222c',

  // olho: esclera, pupila e sobrancelha separadas
  sclera:  '#ddd4c6',
  brow:    '#2a1e1a',

  // gravata
  tieHi:   '#a53c33',
  tie:     '#7e2a22',
  tieDk:   '#571a16',

  // calca
  pantHi:  '#666c76',
  pant:    '#515760',
  pantDk:  '#393e45',

  // bota e couro
  bootHi:  '#4a403a',
  boot:    '#302825',
  bootDk:  '#1b1614',
  leather: '#6b4a2e',
  leathDk: '#48311d',

  // detalhes
  brass:   '#b09258',
  eye:     '#141013',
  bloodHi: '#a02a22',
  blood:   '#6d1a15',

  // ambiente / noite
  nightSky:   '#0c1018',
  nightSky2:  '#151b26',
  fogCol:     '#2a3242',
  brickHi:    '#5d4a43',
  brick:      '#493833',
  brickDk:    '#352825',
  mortar:     '#2b2220',
  asphaltHi:  '#41454c',
  asphalt:    '#31343a',
  asphaltDk:  '#22252a',
  metalHi:    '#5c626b',
  metal:      '#454a52',
  metalDk:    '#2c3036',
  woodHi:     '#5e4634',
  wood:       '#453124',
  woodDk:     '#2c1e16',
  rust:       '#6e4728',

  // luz
  lampWarm:   '#ffbb63',
  lampCold:   '#8fb4e8',
  neonRed:    '#ff3b2e',
  neonPink:   '#ff5f8a',
  moon:       '#9fc0e8',
  flame:      '#ffb347',

  // interface
  uiText:     '#cfc6b8',
  uiDim:      '#7d7468',
  uiFaint:    '#4b453d',
  uiAccent:   '#a8382c',
  uiBox:      '#0d0b0c',
  uiBoxEdge:  '#2a2320',
};

export default PAL;
