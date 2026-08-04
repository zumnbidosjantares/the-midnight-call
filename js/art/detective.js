// detective.js — o protagonista: pecas, esqueleto, animacoes e desenho.
//
// O personagem NAO e uma folha de sprites com quadros prontos. Ele e um
// boneco articulado: cada membro e um pedacinho de pixel art que gira em
// volta de uma junta. As animacoes sao poses-chave interpoladas, o que da
// movimento continuo (60 fps de verdade) mantendo a cara de pixel.
//
// Trocar isso por sprite sheet depois e barato: basta outra implementacao
// de _renderRig(). Todo o resto do jogo so chama play() e draw().

import { PAL } from './palette.js';
import { sprite, darken, stamp, rimPass, silhouettePass, DEG } from './pixel.js';
import { makeBuffer, lerp, clamp, easeInOut } from '../core/gfx.js';

// ---------------------------------------------------------------------------
// paleta de caracteres das grades
// ---------------------------------------------------------------------------

const MAP = {
  S: PAL.skin, s: PAL.skinSh, t: PAL.skinHi, q: PAL.skinDk,
  H: PAL.hairDk, h: PAL.hair, g: PAL.hairHi,
  W: PAL.shirtHi, w: PAL.shirt, x: PAL.shirtSh, X: PAL.shirtDk,
  V: PAL.vestHi, v: PAL.vest, u: PAL.vestDk,
  R: PAL.tieHi, r: PAL.tie, z: PAL.tieDk,
  P: PAL.pantHi, p: PAL.pant, d: PAL.pantDk,
  B: PAL.bootHi, b: PAL.boot, k: PAL.coatEdge,
  L: PAL.leather, l: PAL.leathDk,
  n: PAL.brass, e: PAL.eye, E: PAL.sclera, o: PAL.brow, K: '#7a3f36',
  C: PAL.coatHi, c: PAL.coat, j: PAL.coatDk, y: PAL.coatEdge,
  i: '#ded6c4', a: '#9d9484', N: '#ff6a2a',   // cigarro: papel, sombra, brasa
  F: '#ffb347', f: '#ff7a1a', Y: '#fff3c0',   // chama e fogo de boca
  M: '#727880', m: '#4b5158',                 // metal da arma
};

// Medidas do esqueleto, em pixels, a partir do chao. Proporcao puxada da
// referencia "Urban Detective": cabeca grande (quase 1/4 da altura), ombro
// largo, perna curta. Boneco realista fica ilegivel neste tamanho.
export const HIP_Y = -28;
export const SHOULDER_OFF = -20;   // do quadril ate a linha do ombro
export const THIGH_LEN = 13;
export const SHIN_LEN = 11;
export const UPPER_LEN = 10;
export const FORE_LEN = 9;
// O braco de tras fica mais afastado que o da frente. Com os dois no mesmo
// deslocamento ele desaparecia dentro da silhueta do tronco — parecia que o
// personagem so tinha um braco.
export const ARM_X = 6;
export const ARM_X_BACK = 7;
export const LEG_X = 3;
export const HEIGHT = 62;

// ---------------------------------------------------------------------------
// pecas
// ---------------------------------------------------------------------------

const P = {};

function buildParts() {
  // Cabeca em tres-quartos virada para a DIREITA. O que faz a direcao ser
  // lida sem duvida: um olho so (o de tras fica escondido pelo volume do
  // rosto), o nariz saindo da silhueta em x12, a orelha marcada em x3 e a
  // massa de cabelo empurrada para tras. Com dois olhos simetricos ele
  // parecia estar de frente — ou pior, de costas.
  // O olho tem quatro pixels com funcoes diferentes: sobrancelha (o),
  // esclera (E), pupila (e) e a sombra embaixo (q). Um ponto preto sozinho
  // nao e olho, e furo — e era exatamente essa a cara que ele tinha.
  P.head = sprite({
    pivot: [6, 14], map: MAP, rows: [
      '...HHHHHHH....',
      '..HHhhhhhhhH..',
      '.HHhhhgggggh..',
      '.HHhhgggggSSt.',
      '.HHhhgSSSSSSt.',
      '.HHhhqSSooSSt.',
      '.HHhhqSSEeSst.',
      '.HHhhqSSqSStS.',
      '.HHhhqSSSSSqS.',
      '.HHhhSSSSSSst.',
      '..hhqSSKKKSst.',
      '..shSSSSSSSs..',
      '...sSSSSSSs...',
      '....sSSSs.....',
      '....sSSSs.....',
    ]
  });

  // Gola levantada do sobretudo, desenhada ATRAS da cabeca. E ela que
  // costura o pescoco no corpo: antes a cabeca pousava em cima de um
  // pescoco de 2px e parecia recortada e colada.
  P.collar = sprite({
    pivot: [8, 9], map: MAP, rows: [
      '..yCy......yCy..',
      '..yCy......yCy..',
      '.yCCy......yCCy.',
      '.yCCy......yCCy.',
      'yCCCy......yCCCy',
      'yCCCyy....yyCCCy',
      'yCCCCy....yCCCCy',
      'yCCCCCyyyyCCCCCy',
      'yyCcccccccccCCyy',
    ]
  });

  // Aba do sobretudo, presa no quadril. Cai ate um pouco abaixo do joelho,
  // deixando canela e bota de fora para o ciclo de caminhada continuar
  // legivel.
  P.coatSkirt = sprite({
    pivot: [10, 0], map: MAP, rows: [
      '...yjCCCCCCjy.......',
      '..yjCCCCCCCCjy......',
      '..yjCCCCCCCCjy......',
      '.yjCCCCCCCCCCjy.....',
      '.yjCCCCCCCCCCjy.....',
      '.yjCCCcjCCCCCjy.....',
      '.yjCCCcjCCCCCjy.....',
      'yjCCCCcjCCCCCCjy....',
      'yjCCCCcjCCCCCCjy....',
      'yjCCCCcjCCCCCCjy....',
      'yjCcCCcjCcCCCCjy....',
      'yjCcCCcjCcCCCCjy....',
      'yjCcCCcjCcCCCjjy....',
      'yjjcccjjjcccjjy.....',
      '.yyjjjyyyjjjyy......',
    ]
  });

  // Tronco tambem em tres-quartos: o painel de camisa e gravata fica a
  // DIREITA do centro, o colete tem uma aba larga atras e uma estreita na
  // frente, e a alca do coldre passa so pelas costas. Antes era simetrico,
  // e simetria em vista lateral le como "de costas".
  // Tronco: sobretudo FECHADO.
  //
  // A versao anterior mostrava camisa e gravata descendo pelo meio do
  // peito — que e o que se ve de FRENTE. Num jogo lateral a camera olha o
  // costado do casaco, e ali nao ha abertura nenhuma: so pano, a lapela
  // dobrada perto do pescoco e a fileira de botoes na beirada da frente.
  // A unica camisa visivel e o triangulo do colarinho.
  P.torso = sprite({
    pivot: [9, 20], map: MAP, rows: [
      '...yjCCCCCCCjy....',
      '..yjCCCCCCCCCjy...',
      '.yjCCCCCCCCCWWjy..',
      '.yjCCCCCCCCcWCjy..',
      '.yjCCCCCCCCcjCjy..',
      '.yjCCcCCCCCcjCjy..',
      '.yjCCcCCCCCcjCjy..',
      '.yjCCcCCCCCcjnjy..',
      '.yjCCcCCCCCcjCjy..',
      '.yjCCcCCCCCcjCjy..',
      '.yjCCcCCCCCcjnjy..',
      '.yjCCcCCCCCcjCjy..',
      '.yjCCcCCCCCcjCjy..',
      '.yjCCcCCCCCcjnjy..',
      '.yjLLLLLLLLLLLjy..',
      '.yjllllllllllljy..',
      '.yjCCcCCCCCcjCjy..',
      '.yjCCcCCCCCcjCjy..',
      '..yjCCcCCCCcjCjy..',
      '..yjCCCCCCCCCjy...',
      '...yjCCCCCCCjy....',
    ]
  });

  // Coldre no quadril, do lado que a camera ve. Fica POR CIMA do casaco:
  // debaixo dele seria mais realista e completamente invisivel.
  P.holster = sprite({
    pivot: [3, 0], map: MAP, rows: [
      'lLLLLLl', 'lLLLLLl', 'lLLLLLl', 'lLLLLLl', 'lLLLLLl',
      'lLLLLLl', '.lLLLl.', '.lLLLl.', '..lLl..', '..lll..',
    ]
  });

  // cabo da arma saindo do coldre (some quando ela esta na mao)
  P.gunButt = sprite({
    pivot: [2, 5], map: MAP, rows: [
      '.mmm.', 'mMMmk', 'mMMmk', 'kmmkk', '.kk..',
    ]
  });

  P.gun = sprite({
    pivot: [1, 3], map: MAP, rows: [
      '...mMMMMMMm',
      '..mMMMMMMMm',
      '.mMMMmmmmmm',
      'mMMMm......',
      'kMMk.......',
      '.kk........',
    ]
  });

  P.muzzle = sprite({
    pivot: [0, 3], map: MAP, rows: [
      '..Y....', '.YFY...', 'YFFFY..', 'YFFFFYf', 'YFFFY..', '.YFY...', '..Y....',
    ]
  });

  // Mangas do sobretudo, com punho mais claro na ponta.
  P.upperArm = sprite({
    pivot: [2, 1], map: MAP, rows: [
      'yjCCcy', 'yjCCcy', 'yjCCcy', 'yjCCcy', 'yjCCcy', 'yjCCcy',
      'yjCCcy', 'yjCCcy', 'yjCCcy', '.yjCcy', '.yjccy',
    ]
  });

  P.forearm = sprite({
    pivot: [2, 1], map: MAP, rows: [
      'yjCCcy', 'yjCCcy', 'yjCCcy', 'yjCCcy', '.yjCcy', '.yjCcy',
      '.yjCcy', '.yjCcy', 'yCCCCy', '.yyyy.',
    ]
  });

  P.hand = sprite({
    pivot: [2, 0], map: MAP, rows: [
      '.sSs.', 'sSSSs', 'sSSSs', '.sSs.', '..q..',
    ]
  });

  P.thigh = sprite({
    pivot: [4, 1], map: MAP, rows: [
      'dpPPPPpd', 'dpPPPPpd', 'dpPPPPpd', 'dpPPPPpd',
      'dpPPPPpd', 'dpPPPPpd', 'dpPPPPpd', 'dpPPPPpd',
      '.dpPPPpd', '.dpPPPpd', '.dpPPPpd', '.dpPPPpd',
      '.dpPPPpd', '..dpPpd.',
    ]
  });

  P.shin = sprite({
    pivot: [3, 1], map: MAP, rows: [
      '.dpPPpd', '.dpPPpd', '.dpPPpd', '.dpPPpd', '.dpPPpd',
      'kbBBBBk', 'kbBBBBk', 'kbBBBBk', 'kbBBBBk', 'kbBBBBk',
      'kbBBBBk', 'kkbbbkk',
    ]
  });

  P.foot = sprite({
    pivot: [3, 0], map: MAP, rows: [
      '.kbBBBBk..', 'kbBBBBBBBk', 'kbbbbbbbbk', '.kkkkkkkk.',
    ]
  });

  P.cigLit = sprite({ pivot: [0, 0], map: MAP, rows: ['Niii'] });
  P.cigOff = sprite({ pivot: [0, 0], map: MAP, rows: ['aiii'] });

  P.lighter = sprite({
    pivot: [1, 0], map: MAP, rows: ['.nn.', 'nnnn', 'kkkk', 'kBBk', 'kkkk'],
  });

  P.flame = sprite({
    pivot: [2, 7], map: MAP, rows: [
      '..Y..', '.YFY.', '.YFY.', 'YFFFY', 'YFFFY', '.fFf.', '..f..',
    ]
  });

  // Membros do lado oposto a camera. O braco de tras precisa ficar CLARO o
  // bastante para ser visto (antes sumia dentro do tronco), mas a perna de
  // tras precisa ficar ESCURA o bastante para nao grudar na da frente — as
  // duas quase se encostam e viravam um bloco so. Por isso dois valores.
  const K_BRACO = 0.80, K_PERNA = 0.64, TINT = '#22304a';
  P.dUpperArm = darken(P.upperArm, K_BRACO, TINT);
  P.dForearm = darken(P.forearm, K_BRACO, TINT);
  P.dHand = darken(P.hand, K_BRACO, TINT);
  P.dThigh = darken(P.thigh, K_PERNA, TINT);
  P.dShin = darken(P.shin, K_PERNA, TINT);
  P.dFoot = darken(P.foot, K_PERNA, TINT);
}

// ---------------------------------------------------------------------------
// poses e animacoes
// ---------------------------------------------------------------------------

const FIELDS = ['hx', 'hy', 'torso', 'head', 'aBu', 'aBf', 'aFu', 'aFf',
  'lBt', 'lBs', 'lBf', 'lFt', 'lFs', 'lFf'];

const REST = {
  hx: 0, hy: 0, torso: -2, head: 1,
  aBu: 3, aBf: 7, aFu: -4, aFf: 9,
  // pernas levemente abertas: paradas em paralelo elas viram um bloco so
  lBt: 4, lBs: -3, lBf: 0, lFt: -4, lFs: -2, lFf: 0,
};

function pose(o) { return Object.assign({}, REST, o); }

export const ANIM = {
  idle: {
    dur: 4.2, loop: true,
    keys: [
      { t: 0.00, p: pose({}) },
      { t: 0.28, p: pose({ hy: -0.6, torso: -3.2, head: 0, aFu: -5, aFf: 11, aBu: 4, aBf: 8 }) },
      { t: 0.55, p: pose({ hy: -0.9, torso: -3.6, head: 0.5, aFu: -5.5, aFf: 11.5, aBu: 4.5, aBf: 8.5 }) },
      { t: 0.80, p: pose({ hy: -0.2, torso: -2.4, head: 1.4, aFu: -4, aFf: 9.5, aBu: 3, aBf: 7.5 }) },
      { t: 1.00, p: pose({}) },
    ],
  },

  // Andar: o cotovelo quase nao dobra (aXf entre 8 e 14). Braco que dobra
  // muito enquanto anda parece desarticulado — o balanco tem que vir do
  // OMBRO, com o antebraco praticamente travado.
  walk: {
    dur: 0.76, loop: true, ease: 'linear',
    keys: [
      { t: 0.00, p: pose({ torso: -5, head: 3, hy: 0, lFt: 24, lFs: -5, lFf: 9, lBt: -22, lBs: -24, lBf: -25, aFu: -20, aFf: 10, aBu: 20, aBf: 12 }) },
      { t: 0.25, p: pose({ torso: -5, head: 3, hy: -1.6, lFt: 6, lFs: -3, lFf: 0, lBt: 4, lBs: -48, lBf: -14, aFu: -7, aFf: 9, aBu: 7, aBf: 13 }) },
      { t: 0.50, p: pose({ torso: -5, head: 3, hy: 0, lFt: -22, lFs: -24, lFf: -25, lBt: 24, lBs: -5, lBf: 9, aFu: 20, aFf: 12, aBu: -20, aBf: 10 }) },
      { t: 0.75, p: pose({ torso: -5, head: 3, hy: -1.6, lFt: 4, lFs: -48, lFf: -14, lBt: 6, lBs: -3, lBf: 0, aFu: 7, aFf: 13, aBu: -7, aBf: 9 }) },
      { t: 1.00, p: pose({ torso: -5, head: 3, hy: 0, lFt: 24, lFs: -5, lFf: 9, lBt: -22, lBs: -24, lBf: -25, aFu: -20, aFf: 10, aBu: 20, aBf: 12 }) },
    ],
    events: [{ t: 0.02, ev: 'step' }, { t: 0.52, ev: 'step' }],
  },

  // Correr: aí sim o cotovelo trava dobrado (~55 graus) e QUASE NAO MUDA.
  // Quem corre nao abre e fecha o braco, leva ele preso perto do corpo.
  run: {
    dur: 0.50, loop: true, ease: 'linear',
    keys: [
      { t: 0.00, p: pose({ torso: -13, head: 9, hx: 1, hy: -1, lFt: 40, lFs: -22, lFf: 6, lBt: -34, lBs: -52, lBf: -30, aFu: -40, aFf: 56, aBu: 38, aBf: 58 }) },
      { t: 0.25, p: pose({ torso: -13, head: 9, hx: 1, hy: -3.2, lFt: 10, lFs: -14, lFf: -4, lBt: 12, lBs: -92, lBf: -18, aFu: -14, aFf: 58, aBu: 14, aBf: 60 }) },
      { t: 0.50, p: pose({ torso: -13, head: 9, hx: 1, hy: -1, lFt: -34, lFs: -52, lFf: -30, lBt: 40, lBs: -22, lBf: 6, aFu: 38, aFf: 58, aBu: -40, aBf: 56 }) },
      { t: 0.75, p: pose({ torso: -13, head: 9, hx: 1, hy: -3.2, lFt: 12, lFs: -92, lFf: -18, lBt: 10, lBs: -14, lBf: -4, aFu: 14, aFf: 60, aBu: -14, aBf: 58 }) },
      { t: 1.00, p: pose({ torso: -13, head: 9, hx: 1, hy: -1, lFt: 40, lFs: -22, lFf: 6, lBt: -34, lBs: -52, lBf: -30, aFu: -40, aFf: 56, aBu: 38, aBf: 58 }) },
    ],
    events: [{ t: 0.02, ev: 'step' }, { t: 0.52, ev: 'step' }],
  },

  // Soco: recuo curto, extensao rapida, PARADA no impacto e recolhimento.
  // A pose 0.60 quase igual a 0.52 e o "hold" — sem ele o braco volta
  // deslizando e o golpe nao tem peso nenhum.
  punch1: {
    dur: 0.38, loop: false, ease: 'linear',
    keys: [
      { t: 0.00, p: pose({}) },
      { t: 0.26, p: pose({ torso: -12, head: 6, hx: -1.5, aFu: -26, aFf: -78, aBu: 10, aBf: -22, lFt: -6, lBt: 6 }) },
      { t: 0.46, p: pose({ torso: 8, head: 3, hx: 3.5, aFu: 76, aFf: -4, aBu: -16, aBf: -38, lFt: 8, lBt: -8 }) },
      { t: 0.60, p: pose({ torso: 8, head: 3, hx: 3.2, aFu: 74, aFf: -5, aBu: -15, aBf: -36, lFt: 8, lBt: -8 }) },
      { t: 1.00, p: pose({}) },
    ],
    events: [{ t: 0.28, ev: 'whoosh' }, { t: 0.46, ev: 'hit' }],
  },

  punch2: {
    dur: 0.46, loop: false, ease: 'linear',
    keys: [
      { t: 0.00, p: pose({}) },
      { t: 0.24, p: pose({ torso: 10, head: -5, hx: -2, aBu: -32, aBf: -86, aFu: 14, aFf: -26, lFt: -8, lBt: 8 }) },
      { t: 0.46, p: pose({ torso: -11, head: 5, hx: 5, aBu: 84, aBf: -2, aFu: -20, aFf: -44, lFt: 12, lBt: -12 }) },
      { t: 0.62, p: pose({ torso: -11, head: 5, hx: 4.6, aBu: 82, aBf: -3, aFu: -19, aFf: -42, lFt: 11, lBt: -11 }) },
      { t: 1.00, p: pose({}) },
    ],
    events: [{ t: 0.26, ev: 'whoosh' }, { t: 0.46, ev: 'hit' }],
  },

  interact: {
    dur: 0.60, loop: false,
    keys: [
      { t: 0.00, p: pose({}) },
      { t: 0.35, p: pose({ torso: 3, head: 6, aFu: 56, aFf: -32, aBu: -4, aBf: 10 }) },
      { t: 0.60, p: pose({ torso: 3, head: 6, aFu: 58, aFf: -30, aBu: -4, aBf: 10 }) },
      { t: 1.00, p: pose({}) },
    ],
    events: [{ t: 0.38, ev: 'reach' }],
  },

  // A animacao que da nome ao personagem: ele pega o cigarro, olha para
  // ele, e joga fora. Nao acende.
  //
  // Antes ele acendia com a mao de tras enquanto o cigarro estava na mao da
  // frente — duas maos fazendo coisas que nao combinavam. Agora e uma mao
  // so, do inicio ao fim, e a decisao esta na pausa em que ele fica
  // olhando, nao no isqueiro.
  smoke: {
    dur: 7.2, loop: false,
    keys: [
      { t: 0.000, p: pose({}) },
      { t: 0.100, p: pose({ head: 8, torso: -4, hy: -0.5 }) },
      { t: 0.220, p: pose({ head: 7, torso: -1, aFu: 30, aFf: -72 }) },
      { t: 0.300, p: pose({ head: 7, torso: -1, aFu: 27, aFf: -68 }) },
      { t: 0.420, p: pose({ head: 12, torso: 2, aFu: 22, aFf: -125 }) },
      { t: 0.560, p: pose({ head: 13, torso: 2, aFu: 21, aFf: -127 }) },
      { t: 0.660, p: pose({ head: 12, torso: 1, aFu: 22, aFf: -124 }) },
      { t: 0.760, p: pose({ head: -4, torso: -6, aFu: 20, aFf: -120 }) },
      { t: 0.820, p: pose({ head: 2, torso: 4, aFu: 50, aFf: 20, hx: 1 }) },
      { t: 0.880, p: pose({ head: 4, torso: 2, aFu: 30, aFf: 14 }) },
      { t: 1.000, p: pose({ head: 5 }) },
    ],
    events: [
      { t: 0.300, ev: 'cig_grab' },
      { t: 0.560, ev: 'hesitate' },
      { t: 0.700, ev: 'say_not_today' },
      { t: 0.820, ev: 'cig_toss' },
      { t: 0.960, ev: 'sigh' },
    ],
  },

  // Guardada: a versao com isqueiro, caso volte a ser util mais para a
  // frente (a chama e uma fonte de luz de verdade).
  smokeLighter: {
    dur: 10.2, loop: false,
    keys: [
      // Os angulos de "mao no rosto" sao contra-intuitivos: o braco sobe
      // POUCO (aXu perto de 10..16) e o cotovelo dobra quase 180 graus.
      // Levantar o ombro joga a mao para longe da cabeca, nao para perto.
      { t: 0.000, p: pose({}) },
      { t: 0.098, p: pose({ head: 7, torso: -4, hy: -0.5 }) },
      { t: 0.196, p: pose({ head: 6, torso: -1, aFu: 34, aFf: -78, aBu: 4, aBf: 8 }) },
      { t: 0.255, p: pose({ head: 6, torso: -1, aFu: 30, aFf: -74, aBu: 4, aBf: 8 }) },
      { t: 0.333, p: pose({ head: 2, torso: -3, aFu: 10, aFf: -175, aBu: 4, aBf: 8 }) },
      { t: 0.392, p: pose({ head: 2, torso: -3, aFu: 12, aFf: -178, aBu: 4, aBf: 8 }) },
      { t: 0.451, p: pose({ head: 1, torso: -3, aFu: -6, aFf: 10, aBu: 4, aBf: 8 }) },
      { t: 0.510, p: pose({ head: 1, torso: -1, aFu: -6, aFf: 10, aBu: 30, aBf: -70 }) },
      { t: 0.588, p: pose({ head: 0, torso: -3, aFu: -6, aFf: 10, aBu: 16, aBf: -172 }) },
      { t: 0.637, p: pose({ head: 0, torso: -3, aFu: -6, aFf: 10, aBu: 18, aBf: -174 }) },
      { t: 0.676, p: pose({ head: -1, torso: -3, aFu: -6, aFf: 10, aBu: 16, aBf: -172 }) },
      { t: 0.745, p: pose({ head: -9, torso: -7, aFu: -6, aFf: 10, aBu: 14, aBf: -168 }) },
      { t: 0.804, p: pose({ head: -6, torso: -6, aFu: -6, aFf: 10, aBu: 20, aBf: -150 }) },
      { t: 0.853, p: pose({ head: 2, torso: -3, aFu: 10, aFf: -174, aBu: 2, aBf: 8 }) },
      { t: 0.902, p: pose({ head: 2, torso: -3, aFu: 12, aFf: -176, aBu: 2, aBf: 8 }) },
      { t: 0.941, p: pose({ head: 4, torso: 3, aFu: 44, aFf: 26, aBu: 2, aBf: 8 }) },
      { t: 0.970, p: pose({ head: 6, torso: 1, aFu: 20, aFf: 16, aBu: 2, aBf: 8 }) },
      { t: 1.000, p: pose({ head: 4 }) },
    ],
    events: [
      { t: 0.255, ev: 'cig_grab' },
      { t: 0.392, ev: 'cig_mouth' },
      { t: 0.510, ev: 'lighter_grab' },
      { t: 0.637, ev: 'lighter_flick' },
      { t: 0.676, ev: 'flame_on' },
      { t: 0.745, ev: 'hesitate' },
      { t: 0.804, ev: 'flame_off' },
      { t: 0.902, ev: 'cig_hand' },
      { t: 0.941, ev: 'cig_toss' },
      { t: 0.985, ev: 'sigh' },
    ],
  },

  // Sair do carro. Uma subida so, sem contorcao: os angulos caem de forma
  // monotona do agachado ate de pe. A versao anterior tinha o joelho a 104
  // graus e o tronco a 26 ao mesmo tempo, e no meio da interpolacao ele
  // passava por poses que corpo nenhum faz — dava aquele efeito de boneco
  // se desenrolando.
  getout: {
    dur: 1.40, loop: false,
    keys: [
      { t: 0.00, p: pose({ hy: 15, torso: 20, head: -5, lFt: 58, lFs: -74, lFf: -6, lBt: 44, lBs: -70, lBf: -6, aFu: 24, aFf: -36, aBu: 14, aBf: -22 }) },
      { t: 0.35, p: pose({ hy: 9, torso: 14, head: -2, lFt: 38, lFs: -50, lFf: -4, lBt: 28, lBs: -48, lBf: -4, aFu: 17, aFf: -27, aBu: 10, aBf: -14 }) },
      { t: 0.70, p: pose({ hy: 2, torso: 6, head: 1, lFt: 16, lFs: -22, lFf: -2, lBt: 10, lBs: -20, lBf: -2, aFu: 7, aFf: -11, aBu: 5, aBf: -3 }) },
      { t: 0.88, p: pose({ hy: -1, torso: -4, head: 3, lFt: 4, lFs: -7, lFf: 0, lBt: 2, lBs: -6, lBf: 0, aFu: -5, aFf: 7, aBu: 3, aBf: 7 }) },
      { t: 1.00, p: pose({}) },
    ],
    events: [{ t: 0.62, ev: 'step' }],
  },

  // Agachado lendo. Ele fica de costas para a porta — de proposito.
  read: {
    dur: 3.4, loop: true,
    keys: [
      { t: 0.00, p: pose({ hy: 15, torso: 20, head: 16, lFt: 72, lFs: -104, lFf: -8, lBt: 22, lBs: -112, lBf: -18, aFu: 42, aFf: -64, aBu: 30, aBf: -52 }) },
      { t: 0.50, p: pose({ hy: 15.9, torso: 21.5, head: 17, lFt: 72, lFs: -104, lFf: -8, lBt: 22, lBs: -112, lBf: -18, aFu: 43, aFf: -65, aBu: 31, aBf: -53 }) },
      { t: 1.00, p: pose({ hy: 15, torso: 20, head: 16, lFt: 72, lFs: -104, lFf: -8, lBt: 22, lBs: -112, lBf: -18, aFu: 42, aFf: -64, aBu: 30, aBf: -52 }) },
    ],
  },

  // Sentado no chao, pulsos algemados num cano acima da cabeca.
  cuffed: {
    dur: 4.6, loop: true,
    keys: [
      { t: 0.00, p: pose({ hy: 20, torso: -6, head: 10, lFt: 76, lFs: -26, lFf: 6, lBt: 67, lBs: -22, lBf: 6, aFu: -158, aFf: 12, aBu: -163, aBf: 10 }) },
      { t: 0.50, p: pose({ hy: 20.8, torso: -7.5, head: 11, lFt: 76, lFs: -26, lFf: 6, lBt: 67, lBs: -22, lBf: 6, aFu: -157, aFf: 13, aBu: -162, aBf: 11 }) },
      { t: 1.00, p: pose({ hy: 20, torso: -6, head: 10, lFt: 76, lFs: -26, lFf: 6, lBt: 67, lBs: -22, lBf: 6, aFu: -158, aFf: 12, aBu: -163, aBf: 10 }) },
    ],
  },

  // Sentado no chao, impaciente: joelhos dobrados, bracos apoiados neles,
  // e a perna batendo. Sem cigarro para ocupar a mao, so resta o pe.
  sitImpatient: {
    dur: 2.6, loop: true,
    keys: [
      { t: 0.00, p: pose({ hy: 20, torso: 9, head: 4, lFt: 62, lFs: -96, lFf: 12, lBt: 54, lBs: -88, lBf: 10, aFu: 46, aFf: -62, aBu: 40, aBf: -56 }) },
      { t: 0.18, p: pose({ hy: 20, torso: 9, head: 4, lFt: 62, lFs: -104, lFf: 20, lBt: 54, lBs: -88, lBf: 10, aFu: 46, aFf: -62, aBu: 40, aBf: -56 }) },
      { t: 0.34, p: pose({ hy: 20, torso: 9, head: 4, lFt: 62, lFs: -96, lFf: 12, lBt: 54, lBs: -88, lBf: 10, aFu: 46, aFf: -62, aBu: 40, aBf: -56 }) },
      { t: 0.52, p: pose({ hy: 20, torso: 9, head: 4, lFt: 62, lFs: -104, lFf: 20, lBt: 54, lBs: -88, lBf: 10, aFu: 46, aFf: -62, aBu: 40, aBf: -56 }) },
      { t: 0.66, p: pose({ hy: 19.4, torso: 7, head: -9, lFt: 62, lFs: -96, lFf: 12, lBt: 54, lBs: -88, lBf: 10, aFu: 44, aFf: -60, aBu: 39, aBf: -55 }) },
      { t: 0.86, p: pose({ hy: 19.4, torso: 8, head: 9, lFt: 62, lFs: -96, lFf: 12, lBt: 54, lBs: -88, lBf: 10, aFu: 45, aFf: -61, aBu: 39, aBf: -55 }) },
      { t: 1.00, p: pose({ hy: 20, torso: 9, head: 4, lFt: 62, lFs: -96, lFf: 12, lBt: 54, lBs: -88, lBf: 10, aFu: 46, aFf: -62, aBu: 40, aBf: -56 }) },
    ],
  },

  // puxando as algemas contra o cano — o QTE de escapar
  strainCuffs: {
    dur: 0.44, loop: true, ease: 'linear',
    keys: [
      { t: 0.00, p: pose({ hy: 20, torso: -6, head: 10, lFt: 76, lFs: -26, lFf: 6, lBt: 67, lBs: -22, lBf: 6, aFu: -158, aFf: 12, aBu: -163, aBf: 10 }) },
      { t: 0.45, p: pose({ hy: 17, torso: -16, head: -2, lFt: 66, lFs: -44, lFf: 6, lBt: 58, lBs: -40, lBf: 6, aFu: -150, aFf: 6, aBu: -155, aBf: 5 }) },
      { t: 1.00, p: pose({ hy: 20, torso: -6, head: 10, lFt: 76, lFs: -26, lFf: 6, lBt: 67, lBs: -22, lBf: 6, aFu: -158, aFf: 12, aBu: -163, aBf: 10 }) },
    ],
  },

  // parado olhando para tras — reservado para os sustos
  lookback: {
    dur: 1.60, loop: false,
    keys: [
      { t: 0.00, p: pose({}) },
      { t: 0.35, p: pose({ head: -26, torso: -6 }) },
      { t: 0.70, p: pose({ head: -30, torso: -8 }) },
      { t: 1.00, p: pose({}) },
    ],
  },
};

export const ANIM_NAMES = Object.keys(ANIM);

// Interpolacao entre poses-chave.
//
// `ease: 'linear'` importa mais do que parece. Suavizar a entrada E a saida
// de CADA pose faz o membro desacelerar em todo quadro-chave, e o resultado
// e aquele balanco mole de boneco de pano. Andar, correr e socar usam
// interpolacao reta: o movimento tem direcao e para onde o animador mandou,
// nao onde a curva deixou. So parado e fumando usam curva suave.
function sampleAnim(anim, tn, out) {
  const keys = anim.keys;
  let i = 0;
  while (i < keys.length - 2 && keys[i + 1].t <= tn) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
  const span = Math.max(1e-6, b.t - a.t);
  let k = clamp((tn - a.t) / span, 0, 1);
  if (anim.ease !== 'linear') k = easeInOut(k);
  for (const f of FIELDS) out[f] = lerp(a.p[f], b.p[f], k);
  return out;
}

// ---------------------------------------------------------------------------
// o boneco
// ---------------------------------------------------------------------------

const BW = 120, BH = 120, ORX = 60, ORY = 100;

export class Detective {
  constructor() {
    if (!P.head) buildParts();
    this.buf = makeBuffer(BW, BH);
    this.rimBuf = makeBuffer(BW, BH);
    this.anim = 'idle';
    this.time = 0;
    this.speed = 1;
    this.facing = 1;
    this.flipT = 1;          // 1 = estavel; cai para 0 no meio da virada
    this.pose = Object.assign({}, REST);
    this.blendFrom = null;
    this.blendT = 0;
    this.blendDur = 0.14;
    this.done = false;
    this.onEvent = null;
    this.props = { cig: 'none', lighter: 'none', flame: 0, gun: 'holstered' };
    // Mira: sobrescreve os angulos do braco da frente depois da animacao.
    // Nao da para keyframar isto — o angulo vem do mouse do jogador.
    this.aim = { on: false, angle: 0, recoil: 0 };
    this.muzzleT = 0;
    this._muzzleLocal = null;
    this.rimColor = '#7fa5d8';
    this.rimDX = -1; this.rimDY = -1;
    // 0.55 deixava um contorno azul em volta do corpo inteiro e ele parecia
    // vestido de neon. O contorno tem que sugerir a luz, nao desenhar o
    // personagem.
    this.rimAlpha = 0.30;
    this.reflect = 0;
    this.alpha = 1;
    this.skirt = 0;      // inclinacao da aba do sobretudo (segue o corpo com atraso)
    this._firedIdx = -1;
    this._lightLocal = null;
    this._cigWorld = null;
    this.visible = true;
    this.showSkeleton = false;
    // Silhueta: se tiver cor, o corpo inteiro e pintado com ela e a luz de
    // contorno some. E assim que a figura negra e feita — o mesmo boneco
    // articulado, sem nenhuma informacao dentro.
    this.silhouette = null;
    this.scaleX = 1;
    this.scaleY = 1;
  }

  play(name, opts = {}) {
    if (this.anim === name && !opts.restart) return;
    if (!ANIM[name]) return;
    this.blendFrom = Object.assign({}, this.pose);
    this.blendT = 0;
    this.blendDur = opts.blend === undefined ? 0.14 : opts.blend;
    this.anim = name;
    this.time = 0;
    this.done = false;
    this._firedIdx = -1;
    if (name !== 'smoke') this._clearProps();
  }

  _clearProps() {
    this.props.cig = 'none';
    this.props.lighter = 'none';
    this.props.flame = 0;
  }

  setFacing(f) {
    if (f === this.facing || f === 0) return;
    this.facing = f;
    this.flipT = 0;   // dispara o achatamento horizontal da virada
  }

  update(dt) {
    const a = ANIM[this.anim];
    if (!a) return;
    this.time += dt * this.speed;
    let tn;
    if (a.loop) {
      tn = (this.time % a.dur) / a.dur;
      // eventos ciclicos: detecta a volta do laco
      if (a.events) {
        const prev = ((this.time - dt * this.speed) % a.dur) / a.dur;
        for (const e of a.events) {
          const crossed = prev <= tn ? (e.t > prev && e.t <= tn)
                                     : (e.t > prev || e.t <= tn);
          if (crossed) this._fire(e.ev);
        }
      }
    } else {
      tn = clamp(this.time / a.dur, 0, 1);
      if (a.events) {
        for (let i = 0; i < a.events.length; i++) {
          if (i > this._firedIdx && tn >= a.events[i].t) {
            this._firedIdx = i;
            this._fire(a.events[i].ev);
          }
        }
      }
      if (this.time >= a.dur) this.done = true;
    }

    sampleAnim(a, tn, this.pose);

    // A mira entra DEPOIS da animacao e por cima dela: o corpo continua
    // respirando e andando, so o braco da frente obedece ao mouse.
    if (this.aim.on) {
      const ang = this.aim.angle;
      const kick = this.aim.recoil;
      this.pose.aFu = 90 + ang - kick * 16;
      this.pose.aFf = -7 - kick * 10;
      this.pose.aBu = 20;
      this.pose.aBf = -34;
      this.pose.torso = -4 - kick * 5;
      this.pose.head = clamp(ang * 0.32, -12, 14);
      this.pose.hx = -kick * 2;
    }
    if (this.aim.recoil > 0) this.aim.recoil = Math.max(0, this.aim.recoil - dt * 6);
    if (this.muzzleT > 0) this.muzzleT -= dt;

    if (this.blendFrom && this.blendT < this.blendDur) {
      this.blendT += dt;
      const k = clamp(this.blendT / this.blendDur, 0, 1);
      for (const f of FIELDS) this.pose[f] = lerp(this.blendFrom[f], this.pose[f], k);
      if (k >= 1) this.blendFrom = null;
    }

    // A aba do sobretudo persegue a inclinacao do corpo com atraso, e
    // balanca a cada passo. E o unico lugar do personagem onde "mole" e o
    // efeito certo: pano nao acompanha osso.
    const andando = this.anim === 'walk' || this.anim === 'run';
    const alvo = -this.pose.torso * 0.45
      + (andando ? Math.sin(this.time * (this.anim === 'run' ? 13 : 8)) * (this.anim === 'run' ? 6 : 3.4) : 0);
    this.skirt = lerp(this.skirt, alvo, 1 - Math.exp(-9 * dt));

    if (this.flipT < 1) this.flipT = Math.min(1, this.flipT + dt * 9);
    if (this.props.flame > 0 && this.props.flame < 1) this.props.flame = Math.min(1, this.props.flame + dt * 5);
  }

  _fire(ev) {
    // estado dos objetos na mao vive aqui; som e particula vao pro jogo
    if (ev === 'cig_grab') this.props.cig = 'hand';
    else if (ev === 'cig_mouth') this.props.cig = 'mouth';
    else if (ev === 'lighter_grab') this.props.lighter = 'hand';
    else if (ev === 'flame_on') this.props.flame = 0.01;
    else if (ev === 'flame_off') { this.props.flame = 0; this.props.lighter = 'none'; }
    else if (ev === 'cig_hand') this.props.cig = 'hand';
    else if (ev === 'cig_toss') this.props.cig = 'none';
    if (this.onEvent) this.onEvent(ev, this);
  }

  // Luzes que o personagem emite (isqueiro, cigarro aceso). Coordenadas
  // ja em mundo, dado o pe em (x,y).
  lights(x, y) {
    const out = [];
    if (this.muzzleT > 0 && this._muzzleLocal) {
      const mx = x + (this._muzzleLocal.x - ORX) * this.facing;
      const my = y + (this._muzzleLocal.y - ORY);
      out.push({ x: mx, y: my, r: 104, color: '#ffd08a', i: 0.95 });
      out.push({ x: mx, y: my, r: 26, color: '#fff4d8', i: 1.1 });
    }
    if (this.props.flame > 0 && this._lightLocal) {
      const fx = x + (this._lightLocal.x - ORX) * this.facing;
      const fy = y + (this._lightLocal.y - ORY);
      const flick = 0.82 + Math.sin(performance.now() * 0.023) * 0.09 + Math.random() * 0.09;
      out.push({ x: fx, y: fy, r: 34 * this.props.flame, color: PAL.flame, i: 0.95 * this.props.flame * flick });
      out.push({ x: fx, y: fy, r: 10, color: '#fff0c0', i: 0.9 * this.props.flame });
    }
    return out;
  }

  // ---------------------------------------------------------------------
  // desenho
  // ---------------------------------------------------------------------

  draw(ctx, x, y) {
    if (!this.visible) return;
    const b = this.buf;
    b.x.setTransform(1, 0, 0, 1, 0, 0);
    b.x.globalCompositeOperation = 'source-over';
    b.x.globalAlpha = 1;
    b.x.clearRect(0, 0, BW, BH);
    this._lightLocal = null;
    this._renderRig(b.x);

    const px = Math.round(x), py = Math.round(y);
    // achatamento da virada: o sprite "gira" comprimindo em X
    const sq = 0.3 + 0.7 * Math.sin(clamp(this.flipT, 0, 1) * Math.PI / 2);

    let src = b.c;
    if (this.silhouette) {
      silhouettePass(b.c, this.rimBuf, this.silhouette);
      src = this.rimBuf.c;
    }

    // reflexo no chao molhado
    if (this.reflect > 0) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = this.reflect * this.alpha;
      ctx.translate(px, py + 1);
      ctx.scale(this.facing * sq * this.scaleX, -0.82 * this.scaleY);
      ctx.drawImage(src, -ORX, -ORY);
      ctx.restore();
    }

    // luz de contorno (silhueta nao tem: ela nao reflete nada)
    const comRim = this.rimAlpha > 0 && !this.silhouette;
    if (comRim) rimPass(b.c, this.rimBuf, this.rimColor, this.rimDX * this.facing, this.rimDY);

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = this.alpha;
    ctx.translate(px, py);
    ctx.scale(this.facing * sq * this.scaleX, this.scaleY);
    ctx.drawImage(src, -ORX, -ORY);
    if (comRim) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = this.alpha * this.rimAlpha;
      ctx.drawImage(this.rimBuf.c, -ORX, -ORY);
    }
    ctx.restore();
  }

  _renderRig(g) {
    const p = this.pose;
    const R = a => -a * DEG;

    g.save();
    g.translate(ORX + p.hx, ORY + p.hy);

    // ---- perna de tras ----
    g.save();
    g.translate(-LEG_X, HIP_Y);
    g.rotate(R(p.lBt)); stamp(g, P.dThigh);
    g.translate(0, THIGH_LEN);
    g.rotate(R(p.lBs)); stamp(g, P.dShin);
    g.translate(0, SHIN_LEN);
    g.rotate(R(p.lBf - p.lBt - p.lBs)); stamp(g, P.dFoot);
    g.restore();

    const backArmFront = p.aBu > 42;   // soco de reverso passa para a frente

    // ---- braco de tras (atras do tronco) ----
    if (!backArmFront) this._arm(g, p, false, true);

    // ---- perna da frente ----
    g.save();
    g.translate(LEG_X, HIP_Y);
    g.rotate(R(p.lFt)); stamp(g, P.thigh);
    g.translate(0, THIGH_LEN);
    g.rotate(R(p.lFs)); stamp(g, P.shin);
    g.translate(0, SHIN_LEN);
    g.rotate(R(p.lFf - p.lFt - p.lFs)); stamp(g, P.foot);
    g.restore();

    // ---- aba do sobretudo (por cima das pernas, por baixo do tronco) ----
    g.save();
    g.translate(0, HIP_Y);
    g.rotate(R(this.skirt));
    stamp(g, P.coatSkirt);
    g.restore();

    // ---- coldre no quadril ----
    g.save();
    g.translate(6, HIP_Y + 1);
    stamp(g, P.holster);
    if (this.props.gun === 'holstered') { g.translate(1, 0); stamp(g, P.gunButt); }
    g.restore();

    // ---- tronco ----
    g.save();
    g.translate(0, HIP_Y);
    g.rotate(R(p.torso));
    stamp(g, P.torso);
    g.restore();

    // ---- cabeca (com a gola atras dela) ----
    g.save();
    g.translate(0, HIP_Y);
    g.rotate(R(p.torso));
    g.translate(0, SHOULDER_OFF);
    g.save();
    g.translate(0, 4);
    stamp(g, P.collar);
    g.restore();
    // A cabeca so gira em passos de 7 graus e no maximo 14. Girar um sprite
    // de 14px em angulo qualquer reamostra o rosto e deforma olho e nariz —
    // era isso que "desmanchava a cara do nada".
    g.rotate(R(Math.round(clamp(p.head, -14, 14) / 7) * 7));
    g.translate(1, -1);
    stamp(g, P.head);
    if (this.props.cig === 'mouth') {
      g.save();
      g.translate(7, -5);
      stamp(g, this.props.flame > 0 ? P.cigLit : P.cigOff);
      g.restore();
    }
    g.restore();

    // ---- braco da frente ----
    this._arm(g, p, true, false);
    if (backArmFront) this._arm(g, p, false, false);

    g.restore();
  }

  _arm(g, p, front, dark) {
    const up = front ? p.aFu : p.aBu;
    const fo = front ? p.aFf : p.aBf;
    const R = a => -a * DEG;
    const sUp = dark ? P.dUpperArm : P.upperArm;
    const sFo = dark ? P.dForearm : P.forearm;
    const sHa = dark ? P.dHand : P.hand;

    g.save();
    g.translate(0, HIP_Y);
    g.rotate(R(p.torso));
    g.translate(0, SHOULDER_OFF);
    g.translate(front ? ARM_X : -ARM_X_BACK, 2);
    g.rotate(R(up)); stamp(g, sUp);
    g.translate(0, UPPER_LEN);
    g.rotate(R(fo)); stamp(g, sFo);
    g.translate(0, FORE_LEN);

    // A arma vem ANTES da mao, para os dedos ficarem por cima do cabo. E
    // girada 90 graus porque dentro da cadeia do braco o eixo "para frente"
    // e o +y local — sem isso o cano aponta para o lado e a arma aparece
    // deitada.
    if (front && this.props.gun === 'hand') {
      g.save();
      g.translate(0, 1);
      g.rotate(Math.PI / 2);
      stamp(g, P.gun);
      g.restore();
    }

    stamp(g, sHa);

    // objetos presos a mao
    if (front && this.props.cig === 'hand') {
      g.save(); g.translate(1, 2); stamp(g, P.cigOff); g.restore();
    }
    if (front && this.props.gun === 'hand') {
      g.save();
      g.translate(0, 11);          // boca do cano, na direcao do braco
      const m = g.getTransform ? g.getTransform() : null;
      if (m) this._muzzleLocal = { x: m.e, y: m.f };
      if (this.muzzleT > 0) { g.rotate(Math.PI / 2); stamp(g, P.muzzle); }
      g.restore();
    }
    if (!front && this.props.lighter === 'hand') {
      g.save();
      g.translate(-1, 1);
      stamp(g, P.lighter);
      if (this.props.flame > 0) {
        g.save();
        g.translate(1, 0);
        const m = g.getTransform ? g.getTransform() : null;
        if (m) this._lightLocal = { x: m.e, y: m.f };
        const s = 0.6 + 0.4 * this.props.flame;
        g.scale(1, s);
        stamp(g, P.flame);
        g.restore();
      }
      g.restore();
    }
    g.restore();
  }
}

export { P as PARTS };
