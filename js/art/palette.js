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

  // cabelo
  hairDk:  '#241a17',
  hair:    '#382a24',
  hairHi:  '#503a2d',

  // camisa
  shirtHi: '#ece7da',
  shirt:   '#d2ccbe',
  shirtSh: '#a49d90',
  shirtDk: '#736d63',

  // colete
  vestHi:  '#4b5567',
  vest:    '#374050',
  vestDk:  '#232a36',

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
