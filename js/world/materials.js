// materials.js — pinceis de cenario.
//
// Tudo aqui roda UMA vez, na construcao da fase, escrevendo em canvas de
// camada. Em tempo de jogo o unico custo e um drawImage por camada.
// Por isso cada funcao pode gastar milhares de retangulos de 1px sem dor.

import { mulberry32 } from '../core/gfx.js';
import { PAL } from '../art/palette.js';
import { rect, line, grainRect, ditherV } from '../art/pixel.js';

// ---------------------------------------------------------------------------
// superficies
// ---------------------------------------------------------------------------

export function brickWall(ctx, x, y, w, h, seed, opt = {}) {
  const rnd = mulberry32(seed);
  const bw = 13, bh = 6;
  const base = opt.base || PAL.brick;
  const hi = opt.hi || PAL.brickHi;
  const dk = opt.dk || PAL.brickDk;
  const mortar = opt.mortar || PAL.mortar;

  rect(ctx, x, y, w, h, mortar);

  for (let row = 0; row * bh < h; row++) {
    const oy = y + row * bh;
    const stagger = (row % 2) * (bw >> 1);
    for (let col = -1; col * bw < w + bw; col++) {
      const ox = x + col * bw + stagger;
      if (ox + bw < x || ox > x + w) continue;
      const r = rnd();
      let c = base;
      if (r > 0.86) c = hi;
      else if (r < 0.24) c = dk;
      const bx = Math.max(x, ox), bx2 = Math.min(x + w, ox + bw - 1);
      const by = oy, by2 = Math.min(y + h, oy + bh - 1);
      if (bx2 <= bx || by2 <= by) continue;
      rect(ctx, bx, by, bx2 - bx, by2 - by, c);
      // brilho de topo em alguns tijolos: relevo sem precisar de normal map
      if (r > 0.55) rect(ctx, bx, by, bx2 - bx, 1, shade(c, 1.16));
    }
  }

  // sujeira escorrida, mancha de umidade, musgo no pe da parede
  grainRect(ctx, x, y, w, h, [dk, mortar, shade(base, 0.8)], 0.05, seed + 7);
  const streaks = Math.floor(w / 34);
  for (let i = 0; i < streaks; i++) {
    const sx = x + Math.floor(rnd() * w);
    const sh = 14 + rnd() * (h * 0.5);
    ctx.globalAlpha = 0.14 + rnd() * 0.16;
    rect(ctx, sx, y, 1 + Math.floor(rnd() * 2), sh, '#0a0708');
    ctx.globalAlpha = 1;
  }
  if (opt.moss !== false) {
    ctx.globalAlpha = 0.30;
    grainRect(ctx, x, y + h - 22, w, 22, ['#2b3a24', '#1f2c1a'], 0.10, seed + 31);
    ctx.globalAlpha = 1;
  }
}

export function asphalt(ctx, x, y, w, h, seed, opt = {}) {
  const hi = opt.hi || PAL.asphaltHi;
  const mid = opt.mid || PAL.asphalt;
  const dk = opt.dk || PAL.asphaltDk;
  ditherV(ctx, x, y, w, h, hi, dk, 7);
  grainRect(ctx, x, y, w, h, [hi, mid, dk, '#15171a'], 0.10, seed);
  // rachaduras
  const rnd = mulberry32(seed + 99);
  const cracks = Math.floor(w / 90);
  for (let i = 0; i < cracks; i++) {
    let cx = x + rnd() * w, cy = y + 3 + rnd() * (h - 6);
    for (let s = 0; s < 20 + rnd() * 30; s++) {
      rect(ctx, cx, cy, 1, 1, '#101215');
      cx += rnd() * 3 - 1.2;
      cy += rnd() * 1.6 - 0.7;
      if (cy < y || cy > y + h) break;
    }
  }
}

export function woodPanel(ctx, x, y, w, h, seed, opt = {}) {
  const rnd = mulberry32(seed);
  const hi = opt.hi || PAL.woodHi;
  const mid = opt.mid || PAL.wood;
  const dk = opt.dk || PAL.woodDk;
  rect(ctx, x, y, w, h, mid);
  const pw = opt.pw || 11;
  for (let i = 0; i * pw < w; i++) {
    const px = x + i * pw;
    const r = rnd();
    rect(ctx, px, y, pw - 1, h, r > 0.6 ? hi : r < 0.28 ? dk : mid);
    rect(ctx, px + pw - 1, y, 1, h, '#150e09');
    // veio da madeira
    for (let k = 0; k < 4; k++) {
      const ly = y + Math.floor(rnd() * h);
      ctx.globalAlpha = 0.22;
      rect(ctx, px, ly, pw - 1, 1, dk);
      ctx.globalAlpha = 1;
    }
  }
  grainRect(ctx, x, y, w, h, [dk, '#1a120c'], 0.05, seed + 3);
}

export function metalPanel(ctx, x, y, w, h, seed, opt = {}) {
  const hi = opt.hi || PAL.metalHi;
  const mid = opt.mid || PAL.metal;
  const dk = opt.dk || PAL.metalDk;
  rect(ctx, x, y, w, h, mid);
  rect(ctx, x, y, w, 1, hi);
  rect(ctx, x, y + h - 1, w, 1, dk);
  const rnd = mulberry32(seed);
  for (let i = 0; i * 9 < w; i++) rect(ctx, x + i * 9, y, 1, h, dk);
  grainRect(ctx, x, y, w, h, [PAL.rust, dk, '#3a2418'], 0.045, seed + 5);
}

export function shade(hex, k) {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  const r = Math.min(255, Math.round(((n >> 16) & 255) * k));
  const g = Math.min(255, Math.round(((n >> 8) & 255) * k));
  const b = Math.min(255, Math.round((n & 255) * k));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// ---------------------------------------------------------------------------
// objetos de cenario
// ---------------------------------------------------------------------------

export function dumpster(ctx, x, gy, seed) {
  const w = 62, h = 34;
  const y = gy - h;
  const body = '#2f4038', bodyHi = '#3d5145', bodyDk = '#1c2822';
  rect(ctx, x, y + 4, w, h - 4, body);
  rect(ctx, x, y + 4, w, 2, bodyHi);
  rect(ctx, x, y + h - 4, w, 4, bodyDk);
  // tampa levemente aberta
  rect(ctx, x - 2, y, w + 4, 5, bodyHi);
  rect(ctx, x - 2, y + 5, w + 4, 1, bodyDk);
  // nervuras
  for (let i = 1; i < 5; i++) rect(ctx, x + i * 12, y + 7, 2, h - 13, bodyDk);
  grainRect(ctx, x, y, w, h, [PAL.rust, '#243029', '#4a2f1c'], 0.07, seed);
  // rodinhas
  rect(ctx, x + 6, gy - 4, 5, 4, '#141414');
  rect(ctx, x + w - 11, gy - 4, 5, 4, '#141414');
  // saco de lixo pendurado
  rect(ctx, x + w - 14, y + 2, 10, 6, '#14161a');
  return { x, y, w, h };
}

export function crate(ctx, x, gy, s, seed) {
  const w = 18 + s * 4, h = 14 + s * 3;
  const y = gy - h;
  woodPanel(ctx, x, y, w, h, seed, { pw: 6 });
  rect(ctx, x, y, w, 1, PAL.woodHi);
  rect(ctx, x, y + h - 1, w, 1, '#120c07');
  rect(ctx, x, y, 1, h, '#120c07');
  rect(ctx, x + w - 1, y, 1, h, '#120c07');
  return { x, y, w, h };
}

export function fireEscape(ctx, x, y, w, seed) {
  const m = '#22262b', mh = '#333941', md = '#14171b';
  // plataforma
  rect(ctx, x, y, w, 2, mh);
  rect(ctx, x, y + 2, w, 2, m);
  for (let i = 0; i < w; i += 4) rect(ctx, x + i, y + 1, 1, 3, md);
  // guarda-corpo
  rect(ctx, x, y - 14, 1, 14, m);
  rect(ctx, x + w - 1, y - 14, 1, 14, m);
  rect(ctx, x, y - 14, w, 1, mh);
  rect(ctx, x, y - 8, w, 1, m);
  for (let i = 4; i < w; i += 6) rect(ctx, x + i, y - 14, 1, 14, md);
  // escada diagonal
  for (let i = 0; i < 16; i++) {
    rect(ctx, x + 4 + i, y + 4 + i, 6, 1, m);
  }
  grainRect(ctx, x, y - 14, w, 22, [PAL.rust], 0.06, seed);
}

export function drainPipe(ctx, x, y, h, seed) {
  rect(ctx, x, y, 5, h, '#2b2f34');
  rect(ctx, x, y, 1, h, '#41474f');
  rect(ctx, x + 4, y, 1, h, '#15181b');
  for (let i = 0; i < h; i += 26) rect(ctx, x - 1, y + i, 7, 3, '#373c43');
  grainRect(ctx, x, y, 5, h, [PAL.rust, '#20241f'], 0.10, seed);
}

export function poster(ctx, x, y, seed) {
  const w = 20, h = 27;
  rect(ctx, x, y, w, h, '#b8b09c');
  rect(ctx, x, y, w, 1, '#d6cfba');
  rect(ctx, x, y + h - 1, w, 1, '#7a7364');
  // "foto"
  rect(ctx, x + 4, y + 4, 12, 13, '#5c5648');
  rect(ctx, x + 7, y + 6, 6, 6, '#8b8271');
  rect(ctx, x + 6, y + 12, 8, 5, '#6e6757');
  // linhas de texto
  for (let i = 0; i < 4; i++) rect(ctx, x + 3, y + 19 + i * 2, 14 - i * 3, 1, '#4a4438');
  // rasgado e molhado
  grainRect(ctx, x, y, w, h, ['#8f8878', '#6a6456'], 0.13, seed);
  const rnd = mulberry32(seed + 4);
  for (let i = 0; i < 5; i++) {
    // cantos rasgados: sombra do papel faltando (nao pode ser clearRect,
    // isso abriria um buraco ate a camada de paralaxe)
    rect(ctx, x + rnd() * w, y + h - rnd() * 10, 2 + rnd() * 4, 1 + rnd() * 3, '#221a17');
  }
  return { x, y, w, h };
}

export function graffiti(ctx, x, y, seed, color) {
  const rnd = mulberry32(seed);
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = color;
  let cx = x, cy = y;
  for (let s = 0; s < 90; s++) {
    ctx.fillRect(Math.round(cx), Math.round(cy), 2, 2);
    cx += rnd() * 5 - 1.4;
    cy += rnd() * 5 - 2.5;
    if (cy < y - 12) cy = y - 12;
    if (cy > y + 12) cy = y + 12;
  }
  ctx.globalAlpha = 1;
}

export function boardedWindow(ctx, x, y, w, h, seed) {
  rect(ctx, x - 2, y - 2, w + 4, h + 4, '#1a1512');
  rect(ctx, x, y, w, h, '#0a0c10');
  const rnd = mulberry32(seed);
  for (let i = 0; i < 4; i++) {
    const by = y + 3 + i * (h / 4.4);
    const skew = Math.floor(rnd() * 3) - 1;
    woodPanel(ctx, x - 3, by + skew, w + 6, 5, seed + i * 3, { pw: 14 });
  }
  rect(ctx, x - 2, y - 2, w + 4, 1, '#2b2320');
}

// Porta de tamanho gente. O detetive tem 62px; uma porta real e uns 15%
// mais alta que um homem, entao 74. A versao antiga tinha 46 e ele parecia
// ter que entrar de quatro.
export function doorFrame(ctx, x, gy, seed, opt = {}) {
  const w = 32, h = 74;
  const y = gy - h;
  // batente
  rect(ctx, x - 4, y - 4, w + 8, h + 4, '#1d1815');
  rect(ctx, x - 4, y - 4, w + 8, 2, '#2e2620');
  rect(ctx, x - 4, y - 4, 2, h + 4, '#251e19');
  // vao escuro
  rect(ctx, x, y, w, h, '#07080a');
  if (!opt.open) {
    woodPanel(ctx, x, y, w, h, seed, { pw: 11, hi: '#43301f', mid: '#31220f', dk: '#1e1409' });
    // almofadas
    rect(ctx, x + 4, y + 6, w - 8, 26, '#241806');
    rect(ctx, x + 5, y + 7, w - 10, 24, '#3a2712');
    rect(ctx, x + 4, y + 40, w - 8, 28, '#241806');
    rect(ctx, x + 5, y + 41, w - 10, 26, '#3a2712');
    // macaneta na altura da mao
    rect(ctx, x + w - 8, y + 36, 4, 4, PAL.brass);
    rect(ctx, x + w - 8, y + 36, 3, 1, '#d9c07a');
    rect(ctx, x + w - 9, y + 34, 6, 1, '#2a2018');
    grainRect(ctx, x, y, w, h, ['#1a1108', PAL.rust], 0.05, seed + 2);
  }
  return { x, y, w, h };
}

export function streetLampPost(ctx, x, gy, hgt) {
  const y = gy - hgt;
  rect(ctx, x, y, 4, hgt, '#1b1e22');
  rect(ctx, x, y, 1, hgt, '#2e343a');
  rect(ctx, x - 3, gy - 4, 10, 4, '#15181b');
  // braco curvo
  for (let i = 0; i < 12; i++) {
    rect(ctx, x + 4 + i, y + Math.round(Math.pow(i / 12, 2) * 6) - 0, 2, 2, '#1b1e22');
  }
  // luminaria
  rect(ctx, x + 13, y + 5, 14, 3, '#22272c');
  rect(ctx, x + 14, y + 8, 12, 3, '#d9b070');
  rect(ctx, x + 15, y + 11, 10, 1, '#ffd79a');
  return { bulbX: x + 20, bulbY: y + 11 };
}

export function bareBulb(ctx, x, y, len) {
  rect(ctx, x, y, 1, len, '#15181b');
  rect(ctx, x - 2, y + len, 5, 3, '#232a30');
  rect(ctx, x - 2, y + len + 3, 5, 3, '#e8c88a');
  rect(ctx, x - 1, y + len + 6, 3, 1, '#ffe6b0');
  return { bulbX: x, bulbY: y + len + 4 };
}

export function neonSign(ctx, x, y, w, h) {
  // caixa da placa; o tubo aceso e desenhado por frame (pisca)
  rect(ctx, x - 2, y - 2, w + 4, h + 4, '#101215');
  rect(ctx, x - 2, y - 2, w + 4, 1, '#22262b');
  rect(ctx, x + w / 2 - 1, y - 12, 2, 10, '#191c20');
}

export function barCounter(ctx, x, gy, w, seed) {
  const h = 30, y = gy - h;
  woodPanel(ctx, x, y + 5, w, h - 5, seed, { pw: 13, hi: '#63472e', mid: '#472f21', dk: '#2b1a10' });
  // tampo encerado
  rect(ctx, x - 3, y, w + 6, 5, '#7a5535');
  rect(ctx, x - 3, y, w + 6, 1, '#a0764a');
  rect(ctx, x - 3, y + 5, w + 6, 1, '#2a1a0c');
  // rodape de metal
  rect(ctx, x, gy - 6, w, 2, '#59493a');
  rect(ctx, x, gy - 6, w, 1, '#75604a');
  grainRect(ctx, x, y, w, h, ['#24160b', '#63472e'], 0.05, seed + 9);
}

export function bottleShelf(ctx, x, y, w, seed) {
  const rnd = mulberry32(seed);
  rect(ctx, x, y + 16, w, 2, '#2e2118');
  rect(ctx, x, y + 16, w, 1, '#452f21');
  const cols = ['#2b4a3a', '#4a3a1e', '#3a2030', '#233848', '#4a2418'];
  for (let i = 0; i < w - 6; i += 5 + Math.floor(rnd() * 3)) {
    if (rnd() < 0.22) continue;
    const bh = 9 + Math.floor(rnd() * 6);
    const c = cols[Math.floor(rnd() * cols.length)];
    rect(ctx, x + i + 1, y + 16 - bh, 3, bh, c);
    rect(ctx, x + i + 1, y + 16 - bh, 1, bh, shade(c, 1.5));
    rect(ctx, x + i + 2, y + 16 - bh - 2, 1, 2, shade(c, 0.7));
  }
}

export function crackedMirror(ctx, x, y, w, h, seed) {
  rect(ctx, x - 2, y - 2, w + 4, h + 4, '#2a1d14');
  rect(ctx, x - 2, y - 2, w + 4, 1, '#43301f');
  ditherV(ctx, x, y, w, h, '#39434f', '#1e2630', 5);
  grainRect(ctx, x, y, w, h, ['#48535f', '#161b21'], 0.05, seed);
  // trinca central com estilhacos
  const rnd = mulberry32(seed + 11);
  const cx = x + w * 0.42, cy = y + h * 0.4;
  for (let a = 0; a < 9; a++) {
    let px = cx, py = cy;
    const ang = rnd() * 6.28;
    const len = 8 + rnd() * Math.max(w, h) * 0.7;
    for (let s = 0; s < len; s++) {
      px += Math.cos(ang) + (rnd() - 0.5) * 0.7;
      py += Math.sin(ang) + (rnd() - 0.5) * 0.7;
      if (px < x || px > x + w || py < y || py > y + h) break;
      rect(ctx, px, py, 1, 1, '#5b6a78');
      if (rnd() < 0.25) rect(ctx, px + 1, py, 1, 1, '#0c1014');
    }
  }
}

export function table(ctx, x, gy, w, seed) {
  const h = 22, y = gy - h;
  rect(ctx, x, y, w, 4, '#57402b');
  rect(ctx, x, y, w, 1, '#7a5c3c');
  rect(ctx, x, y + 4, w, 1, '#241609');
  rect(ctx, x + 3, y + 4, 4, h - 4, '#3d2a1c');
  rect(ctx, x + w - 7, y + 4, 4, h - 4, '#3d2a1c');
  rect(ctx, x + 3, y + 4, 1, h - 4, '#513a26');
  grainRect(ctx, x, y, w, 4, ['#241609'], 0.08, seed);
  return { x, y, w, h };
}

// Cadeiras empilhadas de cabeca para baixo em cima da mesa — a imagem de
// bar fechado. `n` = quantas.
export function chairStack(ctx, x, topY, n, seed) {
  const rnd = mulberry32(seed);
  for (let i = 0; i < n; i++) {
    const y = topY - i * 10;
    const jx = Math.round((rnd() - 0.5) * 2);
    // assento (invertido)
    rect(ctx, x + jx, y, 18, 4, '#543b25');
    rect(ctx, x + jx, y, 18, 1, '#7a5836');
    rect(ctx, x + jx, y + 4, 18, 1, '#22150c');
    // pernas apontando pra cima
    rect(ctx, x + jx + 1, y - 8, 3, 8, '#43301e');
    rect(ctx, x + jx + 14, y - 8, 3, 8, '#43301e');
    rect(ctx, x + jx + 1, y - 8, 1, 8, '#5e452c');
    rect(ctx, x + jx + 14, y - 8, 1, 8, '#5e452c');
    // encosto pendurado para o lado
    rect(ctx, x + jx + (i % 2 ? -4 : 18), y + 1, 4, 11, '#43301e');
  }
}

export function chair(ctx, x, gy, flip, seed) {
  const y = gy - 22;
  rect(ctx, x, y + 10, 14, 3, '#3a2718');
  rect(ctx, x, y + 10, 14, 1, '#523a25');
  rect(ctx, x + 1, y + 13, 2, 9, '#2c1d12');
  rect(ctx, x + 11, y + 13, 2, 9, '#2c1d12');
  const bx = flip ? x + 11 : x + 1;
  rect(ctx, bx, y, 2, 11, '#2c1d12');
  rect(ctx, bx - (flip ? 2 : 0), y, 4, 2, '#3a2718');
}

// ---------------------------------------------------------------------------
// destroco — o bar nao esta fechado, esta arrebentado
// ---------------------------------------------------------------------------

export function brokenChair(ctx, x, gy, seed) {
  const rnd = mulberry32(seed);
  // assento caido de lado
  rect(ctx, x, gy - 7, 15, 4, '#4a3320');
  rect(ctx, x, gy - 7, 15, 1, '#6b4b2e');
  rect(ctx, x, gy - 3, 15, 1, '#20140b');
  // pernas quebradas apontando para fora
  rect(ctx, x + 2, gy - 16, 2, 9, '#3d2a1a');
  rect(ctx, x + 11, gy - 13, 2, 6, '#3d2a1a');
  rect(ctx, x + 16, gy - 5, 7, 2, '#3d2a1a');
  // encosto solto no chao
  rect(ctx, x - 9, gy - 2, 11, 2, '#43301e');
  for (let i = 0; i < 8; i++) {
    rect(ctx, x - 12 + rnd() * 30, gy - rnd() * 4, 1 + rnd() * 2, 1, '#2a1c11');
  }
}

export function debris(ctx, x, gy, w, seed) {
  const rnd = mulberry32(seed);
  const cores = ['#3d2a1a', '#2a1c11', '#4a3626', '#1c120a', '#514032'];
  for (let i = 0; i < w * 2.2; i++) {
    const px = x + rnd() * w;
    const py = gy - rnd() * 7;
    rect(ctx, px, py, 1 + rnd() * 3, 1 + rnd() * 1.6, cores[Math.floor(rnd() * cores.length)]);
  }
  // algumas ripas maiores atravessadas
  for (let i = 0; i < 3; i++) {
    const px = x + rnd() * (w - 12);
    rect(ctx, px, gy - 2 - rnd() * 3, 9 + rnd() * 8, 2, '#43301e');
  }
}

export function glassShards(ctx, x, gy, w, seed) {
  const rnd = mulberry32(seed);
  for (let i = 0; i < w * 0.9; i++) {
    const px = x + rnd() * w, py = gy - rnd() * 4;
    const c = rnd() > 0.55 ? '#5c6f74' : (rnd() > 0.5 ? '#3f5257' : '#7a8f92');
    rect(ctx, px, py, 1, 1, c);
    if (rnd() > 0.8) rect(ctx, px + 1, py, 1, 1, '#94a9ab');
  }
}

// Buraco no lambri: tabua arrebentada mostrando o escuro atras.
export function wallHole(ctx, x, y, w, h, seed) {
  const rnd = mulberry32(seed);
  rect(ctx, x, y, w, h, '#0a0705');
  for (let i = 0; i < w; i++) {
    const t = Math.abs(i - w / 2) / (w / 2);
    const rec = Math.round((1 - t) * h * 0.35 * rnd());
    rect(ctx, x + i, y, 1, rec, '#2a1c11');
    rect(ctx, x + i, y + h - rec, 1, rec, '#2a1c11');
  }
  // farpas apontando para dentro
  for (let i = 0; i < 10; i++) {
    const px = x + rnd() * w, py = y + rnd() * h;
    rect(ctx, px, py, 1, 2 + rnd() * 4, '#43301e');
  }
  rect(ctx, x - 1, y - 1, w + 2, 1, '#5c452c');
}

// ---------------------------------------------------------------------------
// sangue
// ---------------------------------------------------------------------------

// Pingos espalhados numa faixa. Poucos e pequenos: uma trilha de sangue
// convence pelo espacamento, nao pela quantidade.
export function bloodDrops(ctx, x, gy, w, n, seed) {
  const rnd = mulberry32(seed);
  for (let i = 0; i < n; i++) {
    const px = x + rnd() * w;
    const py = gy + 2 + rnd() * 8;
    const r = rnd();
    const c = r > 0.6 ? '#8a1c16' : (r > 0.25 ? '#6b1310' : '#4a0d0b');
    const s = 1 + Math.floor(rnd() * 2);
    rect(ctx, px, py, s, s, c);
    if (rnd() > 0.7) rect(ctx, px + 1, py + 1, 1, 1, '#a8241c');
    // respingo satelite
    if (rnd() > 0.75) rect(ctx, px + 2 + rnd() * 3, py + rnd() * 2, 1, 1, '#5c110e');
  }
}

export function bloodPool(ctx, x, gy, w, seed) {
  const rnd = mulberry32(seed);
  const h = 7;
  for (let i = 0; i < w; i++) {
    const t = i / w;
    const hh = Math.max(1, Math.round(Math.sin(t * Math.PI) * h * (0.7 + rnd() * 0.5)));
    rect(ctx, x + i, gy + 8 - hh, 1, hh, '#5e100d');
  }
  // miolo mais escuro e brilho da borda molhada
  for (let i = 2; i < w - 2; i++) {
    const t = i / w;
    const hh = Math.max(1, Math.round(Math.sin(t * Math.PI) * (h - 3)));
    rect(ctx, x + i, gy + 8 - hh, 1, hh, '#430907');
  }
  for (let i = 0; i < w; i += 2) {
    if (rnd() > 0.5) rect(ctx, x + i, gy + 7, 1, 1, '#93211a');
  }
  // arrasto saindo da poca
  for (let i = 0; i < 14; i++) {
    rect(ctx, x - 4 - rnd() * 12, gy + 4 + rnd() * 5, 1 + rnd() * 2, 1, '#4a0d0b');
  }
}

// Papel dobrado caido no chao. Claro de proposito: e o unico ponto claro
// da sala, e e para onde o olho tem que ir.
export function note(ctx, x, gy) {
  rect(ctx, x, gy + 2, 11, 7, '#0f0a08');
  rect(ctx, x, gy + 1, 11, 7, '#c9c2ad');
  rect(ctx, x, gy + 1, 11, 1, '#e2dcc6');
  rect(ctx, x + 1, gy + 3, 8, 1, '#8b8471');
  rect(ctx, x + 1, gy + 5, 6, 1, '#8b8471');
  rect(ctx, x + 7, gy + 1, 4, 4, '#b3ac97');   // dobra
  rect(ctx, x + 9, gy + 5, 2, 3, '#7d1712');   // canto encharcado
  return { x, y: gy + 1, w: 11, h: 8 };
}

// Cano de parede — o que prende as algemas na sala do fim.
export function wallPipe(ctx, x, y, len, seed) {
  rect(ctx, x, y, len, 5, '#3c3f45');
  rect(ctx, x, y, len, 1, '#5a5f68');
  rect(ctx, x, y + 4, len, 1, '#1e2126');
  for (let i = 0; i < len; i += 34) {
    rect(ctx, x + i, y - 1, 4, 7, '#4a4e56');
    rect(ctx, x + i, y - 1, 4, 1, '#666c76');
  }
  grainRect(ctx, x, y, len, 5, [PAL.rust, '#2a2016'], 0.12, seed);
}

export function wallPhone(ctx, x, y, seed) {
  rect(ctx, x, y, 12, 18, '#1c1f24');
  rect(ctx, x, y, 12, 1, '#2f343b');
  rect(ctx, x + 2, y + 3, 8, 6, '#0e1114');
  rect(ctx, x + 3, y + 4, 6, 4, '#242a30');
  // fone
  rect(ctx, x - 3, y + 2, 4, 12, '#141619');
  rect(ctx, x - 4, y + 1, 6, 3, '#1d2126');
  rect(ctx, x - 4, y + 12, 6, 3, '#1d2126');
  // fio cortado
  const rnd = mulberry32(seed);
  let px = x + 6, py = y + 18;
  for (let i = 0; i < 12; i++) {
    rect(ctx, px, py, 1, 1, '#101214');
    px += rnd() * 2 - 1; py += 1;
  }
  rect(ctx, px - 1, py, 3, 1, '#3a2a1a');
}

export function windowBlinds(ctx, x, y, w, h) {
  rect(ctx, x - 2, y - 2, w + 4, h + 4, '#191410');
  ditherV(ctx, x, y, w, h, '#2b3a52', '#141d2b', 5);
  for (let i = 0; i < h; i += 3) {
    rect(ctx, x, y + i, w, 1, '#0d1118');
    rect(ctx, x, y + i + 1, w, 1, '#1c2634');
  }
  rect(ctx, x - 2, y - 2, w + 4, 2, '#241c16');
}

export function puddle(ctx, x, gy, w, seed) {
  const rnd = mulberry32(seed);
  const h = 4 + Math.floor(rnd() * 3);
  for (let i = 0; i < w; i++) {
    const t = i / w;
    const hh = Math.max(1, Math.round(Math.sin(t * Math.PI) * h));
    ctx.globalAlpha = 0.5;
    rect(ctx, x + i, gy - hh + 1, 1, hh, '#1a2029');
    ctx.globalAlpha = 1;
  }
  ctx.globalAlpha = 0.35;
  rect(ctx, x + 2, gy - 1, w - 4, 1, '#39485c');
  ctx.globalAlpha = 1;
  return { x, y: gy - h, w, h };
}

export function trashPile(ctx, x, gy, seed) {
  const rnd = mulberry32(seed);
  const cols = ['#2a2620', '#3a3228', '#1e1a16', '#4a3c28', '#28323a'];
  for (let i = 0; i < 40; i++) {
    const px = x + rnd() * 26;
    const py = gy - rnd() * 9;
    rect(ctx, px, py, 1 + rnd() * 3, 1 + rnd() * 2, cols[Math.floor(rnd() * cols.length)]);
  }
  rect(ctx, x + 4, gy - 8, 9, 8, '#191d21');
  rect(ctx, x + 4, gy - 8, 9, 1, '#262c31');
}

export function manhole(ctx, x, gy) {
  rect(ctx, x, gy - 2, 22, 2, '#1a1d20');
  rect(ctx, x + 1, gy - 3, 20, 1, '#2b3036');
  for (let i = 0; i < 5; i++) rect(ctx, x + 3 + i * 4, gy - 2, 2, 1, '#12161a');
}

// Silhueta de predio para camadas de fundo. Devolve o topo, para empilhar.
export function buildingSilhouette(ctx, x, gy, w, h, color, seed, litWindows) {
  const y = gy - h;
  rect(ctx, x, y, w, h, color);
  const rnd = mulberry32(seed);
  // topo com caixa d'agua ou antena
  if (rnd() > 0.5) { rect(ctx, x + w * 0.3, y - 6, 8, 6, color); rect(ctx, x + w * 0.3 + 3, y - 12, 1, 6, color); }
  if (litWindows) {
    for (let wy = y + 6; wy < gy - 8; wy += 9) {
      for (let wx = x + 4; wx < x + w - 6; wx += 8) {
        const r = rnd();
        if (r > 0.80) rect(ctx, wx, wy, 3, 4, '#c8a05a');
        else if (r > 0.72) rect(ctx, wx, wy, 3, 4, '#5a7ba8');
        else if (r > 0.58) rect(ctx, wx, wy, 3, 4, shade(color, 1.35));
      }
    }
  }
  return y;
}
