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
import { sprite, darken, stamp, rimPass, DEG } from './pixel.js';
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
  B: PAL.bootHi, b: PAL.boot, k: PAL.bootDk,
  L: PAL.leather, l: PAL.leathDk,
  n: PAL.brass, e: PAL.eye,
  C: '#ded6c4', c: '#9d9484', E: '#ff6a2a',
  F: '#ffb347', f: '#ff7a1a', Y: '#fff3c0',
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
export const ARM_X = 5;            // afastamento do ombro em relacao ao centro
export const LEG_X = 3;
export const HEIGHT = 62;

// ---------------------------------------------------------------------------
// pecas
// ---------------------------------------------------------------------------

const P = {};

function buildParts() {
  P.head = sprite({
    pivot: [6, 14], map: MAP, rows: [
      '....HHHHHH....',
      '..HHhhhhhhHH..',
      '.HHhgggggghhH.',
      '.HHhggggggggh.',
      '.HHhgSSSSSSt..',
      '.HHhSSSSSSSt..',
      '.HhSSeSSSeSt..',
      '.HhSSSSSSSSt..',
      '.HhSSSSSSSqt..',
      '..hSSSSSSSqt..',
      '..qSSqqqSSst..',
      '..sSSSSSSSs...',
      '...sSSSSSs....',
      '.....SSS......',
      '.....sSs......',
    ]
  });

  P.torso = sprite({
    pivot: [9, 20], map: MAP, rows: [
      '...uvVVVVVVVVvu...',
      '..uvVVVVVVVVVVvu..',
      '.uvVVVWWWWWWVVVvu.',
      '.uvVVVWWRRWWVVVvu.',
      '.uvVVVWWRRWWVVVvu.',
      '.uvVVLVWWRRWWVVvu.',
      '.uvVVLVWWRRWWVVvu.',
      '.uvVLVVWWRRWWVVvu.',
      '.uvVLVVWWRrWWVVvu.',
      '.uvLVVVWWRrWWVVvu.',
      '.uvLVVVWWrrWWVVvu.',
      '.uvLVVVWWrrWWVVvu.',
      '.uvVVVnWWrrWWVVvu.',
      '.uvVVVVWWrzWWVVvu.',
      '.uvVVVnWWrzWWVVvu.',
      '.uvVVVVWWzzWWVVvu.',
      '.uvVVVnWWWzWWVVvu.',
      '.uvVVVVWWWWWWVVvu.',
      '..uvVVVVWWWWVVVvu.',
      '..uuvvVVVVVVvvuu..',
      '...uuvvvvvvvvuu...',
    ]
  });

  P.upperArm = sprite({
    pivot: [2, 1], map: MAP, rows: [
      'XwWWWx', 'XwWWWx', 'XwWWWx', 'XwWWWx', 'XwWWWx', 'XwWWWx',
      'XwWWWx', 'XwWWWx', 'XwWWWx', '.XwWWx', '.XwwWx',
    ]
  });

  P.forearm = sprite({
    pivot: [2, 1], map: MAP, rows: [
      'XwWWWx', 'XwWWWx', 'XwWWWx', 'XwWWWx', '.XwWWx', '.XwWWx',
      '.XwWWx', '.XwWWx', '.XwwWx', '..Xxx.',
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

  P.cigLit = sprite({ pivot: [0, 0], map: MAP, rows: ['ECCC'] });
  P.cigOff = sprite({ pivot: [0, 0], map: MAP, rows: ['cCCC'] });

  P.lighter = sprite({
    pivot: [1, 0], map: MAP, rows: ['.nn.', 'nnnn', 'kkkk', 'kBBk', 'kkkk'],
  });

  P.flame = sprite({
    pivot: [2, 7], map: MAP, rows: [
      '..Y..', '.YFY.', '.YFY.', 'YFFFY', 'YFFFY', '.fFf.', '..f..',
    ]
  });

  // versoes escuras: membros do lado oposto a camera
  const K = 0.62, TINT = '#1a2230';
  P.dUpperArm = darken(P.upperArm, K, TINT);
  P.dForearm = darken(P.forearm, K, TINT);
  P.dHand = darken(P.hand, K, TINT);
  P.dThigh = darken(P.thigh, K, TINT);
  P.dShin = darken(P.shin, K, TINT);
  P.dFoot = darken(P.foot, K, TINT);
}

// ---------------------------------------------------------------------------
// poses e animacoes
// ---------------------------------------------------------------------------

const FIELDS = ['hx', 'hy', 'torso', 'head', 'aBu', 'aBf', 'aFu', 'aFf',
  'lBt', 'lBs', 'lBf', 'lFt', 'lFs', 'lFf'];

const REST = {
  hx: 0, hy: 0, torso: -2, head: 1,
  aBu: 3, aBf: 7, aFu: -4, aFf: 9,
  lBt: 2, lBs: -3, lBf: 0, lFt: -2, lFs: -2, lFf: 0,
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

  walk: {
    dur: 0.78, loop: true,
    keys: [
      { t: 0.00, p: pose({ torso: -5, head: 3, hy: 0, lFt: 24, lFs: -5, lFf: 9, lBt: -22, lBs: -24, lBf: -25, aFu: -22, aFf: 16, aBu: 22, aBf: 20 }) },
      { t: 0.25, p: pose({ torso: -5, head: 3, hy: -1.6, lFt: 6, lFs: -3, lFf: 0, lBt: 4, lBs: -48, lBf: -14, aFu: -8, aFf: 13, aBu: 9, aBf: 22 }) },
      { t: 0.50, p: pose({ torso: -5, head: 3, hy: 0, lFt: -22, lFs: -24, lFf: -25, lBt: 24, lBs: -5, lBf: 9, aFu: 22, aFf: 20, aBu: -22, aBf: 16 }) },
      { t: 0.75, p: pose({ torso: -5, head: 3, hy: -1.6, lFt: 4, lFs: -48, lFf: -14, lBt: 6, lBs: -3, lBf: 0, aFu: 9, aFf: 22, aBu: -8, aBf: 13 }) },
      { t: 1.00, p: pose({ torso: -5, head: 3, hy: 0, lFt: 24, lFs: -5, lFf: 9, lBt: -22, lBs: -24, lBf: -25, aFu: -22, aFf: 16, aBu: 22, aBf: 20 }) },
    ],
    events: [{ t: 0.02, ev: 'step' }, { t: 0.52, ev: 'step' }],
  },

  run: {
    dur: 0.50, loop: true,
    keys: [
      { t: 0.00, p: pose({ torso: -14, head: 9, hx: 1, hy: -1, lFt: 40, lFs: -22, lFf: 6, lBt: -34, lBs: -52, lBf: -30, aFu: -46, aFf: 74, aBu: 44, aBf: 72 }) },
      { t: 0.25, p: pose({ torso: -14, head: 9, hx: 1, hy: -3.4, lFt: 10, lFs: -14, lFf: -4, lBt: 12, lBs: -96, lBf: -18, aFu: -16, aFf: 78, aBu: 16, aBf: 80 }) },
      { t: 0.50, p: pose({ torso: -14, head: 9, hx: 1, hy: -1, lFt: -34, lFs: -52, lFf: -30, lBt: 40, lBs: -22, lBf: 6, aFu: 44, aFf: 72, aBu: -46, aBf: 74 }) },
      { t: 0.75, p: pose({ torso: -14, head: 9, hx: 1, hy: -3.4, lFt: 12, lFs: -96, lFf: -18, lBt: 10, lBs: -14, lBf: -4, aFu: 16, aFf: 80, aBu: -16, aBf: 78 }) },
      { t: 1.00, p: pose({ torso: -14, head: 9, hx: 1, hy: -1, lFt: 40, lFs: -22, lFf: 6, lBt: -34, lBs: -52, lBf: -30, aFu: -46, aFf: 74, aBu: 44, aBf: 72 }) },
    ],
    events: [{ t: 0.02, ev: 'step' }, { t: 0.52, ev: 'step' }],
  },

  punch1: {
    dur: 0.40, loop: false,
    keys: [
      { t: 0.00, p: pose({}) },
      { t: 0.28, p: pose({ torso: -13, head: 6, hx: -1.5, aFu: -32, aFf: -92, aBu: 12, aBf: -30, lFt: -6, lBt: 6 }) },
      { t: 0.52, p: pose({ torso: 9, head: 3, hx: 3.5, aFu: 80, aFf: -6, aBu: -18, aBf: -46, lFt: 8, lBt: -8 }) },
      { t: 0.70, p: pose({ torso: 6, head: 3, hx: 2.5, aFu: 72, aFf: -12, aBu: -14, aBf: -40, lFt: 6, lBt: -6 }) },
      { t: 1.00, p: pose({}) },
    ],
    events: [{ t: 0.30, ev: 'whoosh' }, { t: 0.52, ev: 'hit' }],
  },

  punch2: {
    dur: 0.48, loop: false,
    keys: [
      { t: 0.00, p: pose({}) },
      { t: 0.26, p: pose({ torso: 11, head: -5, hx: -2, aBu: -38, aBf: -100, aFu: 16, aFf: -34, lFt: -8, lBt: 8 }) },
      { t: 0.50, p: pose({ torso: -12, head: 5, hx: 5, aBu: 88, aBf: -4, aFu: -22, aFf: -52, lFt: 12, lBt: -12 }) },
      { t: 0.72, p: pose({ torso: -9, head: 5, hx: 4, aBu: 78, aBf: -10, aFu: -18, aFf: -46, lFt: 9, lBt: -9 }) },
      { t: 1.00, p: pose({}) },
    ],
    events: [{ t: 0.28, ev: 'whoosh' }, { t: 0.50, ev: 'hit' }],
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

  // A animacao que da nome ao personagem: ele quer o cigarro, acende, e
  // desiste. Dez segundos de nada acontecendo — e e o ponto.
  smoke: {
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

  // sair do carro: comeca dobrado no banco, termina de pe
  getout: {
    dur: 1.70, loop: false,
    keys: [
      { t: 0.00, p: pose({ hy: 19, torso: 26, head: -12, lFt: 74, lFs: -104, lFf: -14, lBt: 58, lBs: -96, lBf: -12, aFu: 34, aFf: -54, aBu: 20, aBf: -40 }) },
      { t: 0.30, p: pose({ hy: 13, torso: 20, head: -7, lFt: 52, lFs: -74, lFf: -8, lBt: 40, lBs: -70, lBf: -8, aFu: 26, aFf: -44, aBu: 14, aBf: -28 }) },
      { t: 0.62, p: pose({ hy: 5, torso: 11, head: -2, lFt: 24, lFs: -36, lFf: -4, lBt: 16, lBs: -30, lBf: -3, aFu: 12, aFf: -20, aBu: 8, aBf: -8 }) },
      { t: 0.85, p: pose({ hy: -1, torso: -5, head: 4, lFt: 2, lFs: -6, lFf: 0, lBt: 2, lBs: -5, lBf: 0, aFu: -6, aFf: 6, aBu: 2, aBf: 6 }) },
      { t: 1.00, p: pose({}) },
    ],
    events: [{ t: 0.66, ev: 'step' }],
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

function sampleAnim(anim, tn, out) {
  const keys = anim.keys;
  let i = 0;
  while (i < keys.length - 2 && keys[i + 1].t <= tn) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
  const span = Math.max(1e-6, b.t - a.t);
  const k = easeInOut(clamp((tn - a.t) / span, 0, 1));
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
    this.props = { cig: 'none', lighter: 'none', flame: 0 };
    this.rimColor = '#7fa5d8';
    this.rimDX = -1; this.rimDY = -1;
    this.rimAlpha = 0.55;
    this.reflect = 0;
    this.alpha = 1;
    this._firedIdx = -1;
    this._lightLocal = null;
    this._cigWorld = null;
    this.visible = true;
    this.showSkeleton = false;
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

    if (this.blendFrom && this.blendT < this.blendDur) {
      this.blendT += dt;
      const k = clamp(this.blendT / this.blendDur, 0, 1);
      for (const f of FIELDS) this.pose[f] = lerp(this.blendFrom[f], this.pose[f], k);
      if (k >= 1) this.blendFrom = null;
    }

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

    // reflexo no chao molhado
    if (this.reflect > 0) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = this.reflect * this.alpha;
      ctx.translate(px, py + 1);
      ctx.scale(this.facing * sq, -0.82);
      ctx.drawImage(b.c, -ORX, -ORY);
      ctx.restore();
    }

    // luz de contorno
    if (this.rimAlpha > 0) {
      rimPass(b.c, this.rimBuf, this.rimColor, this.rimDX * this.facing, this.rimDY);
    }

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = this.alpha;
    ctx.translate(px, py);
    ctx.scale(this.facing * sq, 1);
    ctx.drawImage(b.c, -ORX, -ORY);
    if (this.rimAlpha > 0) {
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

    // ---- tronco ----
    g.save();
    g.translate(0, HIP_Y);
    g.rotate(R(p.torso));
    stamp(g, P.torso);
    g.restore();

    // ---- perna da frente ----
    g.save();
    g.translate(LEG_X, HIP_Y);
    g.rotate(R(p.lFt)); stamp(g, P.thigh);
    g.translate(0, THIGH_LEN);
    g.rotate(R(p.lFs)); stamp(g, P.shin);
    g.translate(0, SHIN_LEN);
    g.rotate(R(p.lFf - p.lFt - p.lFs)); stamp(g, P.foot);
    g.restore();

    // ---- cabeca ----
    g.save();
    g.translate(0, HIP_Y);
    g.rotate(R(p.torso));
    g.translate(0, SHOULDER_OFF);
    g.rotate(R(p.head));
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
    g.translate(front ? ARM_X : -ARM_X, 2);
    g.rotate(R(up)); stamp(g, sUp);
    g.translate(0, UPPER_LEN);
    g.rotate(R(fo)); stamp(g, sFo);
    g.translate(0, FORE_LEN);
    stamp(g, sHa);

    // objetos presos a mao
    if (front && this.props.cig === 'hand') {
      g.save(); g.translate(1, 2); stamp(g, P.cigOff); g.restore();
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
