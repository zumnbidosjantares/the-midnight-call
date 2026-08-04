// text.js — texto com cara de pixel art sem depender de arquivo de fonte.
//
// O truque: desenha a frase com uma fonte do sistema num buffer minusculo,
// le os pixels e joga fora toda a suavizacao (alpha vira 0 ou 255). O que
// sobra tem borda dura igual fonte bitmap, mas com acento, cedilha e til
// funcionando — o que importa muito num jogo que vai ser PT e EN.
//
// Cada frase renderizada fica em cache. Diálogo com efeito de maquina de
// escrever chama isto 40x por segundo; sem cache o jogo derreteria.

import { makeBuffer } from './gfx.js';

const FONTS = {
  ui:     '"Tahoma","Verdana","DejaVu Sans",sans-serif',
  uiB:    '"Tahoma","Verdana","DejaVu Sans",sans-serif',
  serif:  'Georgia,"Times New Roman",serif',
  title:  'Impact,Haettenschweiler,"Arial Black","Franklin Gothic Heavy",sans-serif',
  mono:   'Consolas,"Courier New",monospace',
};

const cache = new Map();
const CACHE_MAX = 600;

function key(str, o) {
  return `${o.font}|${o.size}|${o.weight}|${o.color}|${o.track}|${str}`;
}

// Renderiza a frase e devolve {c,w,h} — canvas ja tingido e sem anti-alias.
function bake(str, o) {
  const size = o.size;
  const pad = Math.ceil(size * 0.6) + 4;
  const probe = makeBuffer(8, 8);
  probe.x.font = `${o.weight} ${size}px ${FONTS[o.font] || FONTS.ui}`;
  const chars = [...str];
  let w = 0;
  const advances = [];
  for (const ch of chars) {
    const a = probe.x.measureText(ch).width;
    advances.push(a);
    w += a + o.track;
  }
  w = Math.ceil(w) + pad * 2;
  const h = Math.ceil(size * 1.5) + pad;

  const b = makeBuffer(Math.max(1, w), Math.max(1, h));
  const x = b.x;
  x.font = `${o.weight} ${size}px ${FONTS[o.font] || FONTS.ui}`;
  x.textBaseline = 'alphabetic';
  x.fillStyle = '#ffffff';
  let cx = pad;
  const baseline = Math.round(size * 1.05);
  for (let i = 0; i < chars.length; i++) {
    x.fillText(chars[i], Math.round(cx), baseline);
    cx += advances[i] + o.track;
  }

  // corte duro do alpha + tinta
  const img = x.getImageData(0, 0, b.c.width, b.c.height);
  const d = img.data;
  const rgb = hex2rgb(o.color);
  const thr = o.threshold * 255;
  let minX = b.c.width, maxX = 0, minY = b.c.height, maxY = 0;
  for (let p = 0; p < d.length; p += 4) {
    if (d[p + 3] >= thr) {
      d[p] = rgb[0]; d[p + 1] = rgb[1]; d[p + 2] = rgb[2]; d[p + 3] = 255;
      const idx = p >> 2;
      const px = idx % b.c.width, py = (idx / b.c.width) | 0;
      if (px < minX) minX = px; if (px > maxX) maxX = px;
      if (py < minY) minY = py; if (py > maxY) maxY = py;
    } else { d[p + 3] = 0; }
  }
  x.putImageData(img, 0, 0);

  if (maxX < minX) { minX = 0; maxX = 0; minY = 0; maxY = 0; }
  // recorta so o que tem tinta, mas guarda a linha de base para as frases
  // se alinharem entre si (senao "gato" e "gaTO" ficam em alturas diferentes)
  const cw = maxX - minX + 1, ch = maxY - minY + 1;
  const out = makeBuffer(Math.max(1, cw), Math.max(1, ch));
  out.x.drawImage(b.c, minX, minY, cw, ch, 0, 0, cw, ch);

  return { c: out.c, w: cw, h: ch, top: minY - baseline, asc: baseline - minY };
}

function hex2rgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function opts(o = {}) {
  return {
    font: o.font || 'ui',
    size: o.size || 10,
    weight: o.weight || 'normal',
    color: o.color || '#cfc6b8',
    track: o.track === undefined ? 0 : o.track,
    threshold: o.threshold === undefined ? 0.52 : o.threshold,
  };
}

export function getGlyphs(str, o) {
  const oo = opts(o);
  const k = key(str, oo);
  let e = cache.get(k);
  if (!e) {
    e = bake(str, oo);
    if (cache.size > CACHE_MAX) {
      // descarta o mais antigo — Map preserva ordem de insercao
      cache.delete(cache.keys().next().value);
    }
    cache.set(k, e);
  }
  return e;
}

export function measure(str, o) {
  const g = getGlyphs(str, o);
  return { w: g.w, h: g.h, asc: g.asc };
}

// x,y sao o canto superior-esquerdo por padrao. align: 'left'|'center'|'right'.
export function text(ctx, str, x, y, o = {}) {
  if (str === '' || str == null) return 0;
  const g = getGlyphs(String(str), o);
  let dx = Math.round(x);
  if (o.align === 'center') dx = Math.round(x - g.w / 2);
  else if (o.align === 'right') dx = Math.round(x - g.w);
  const dy = Math.round(y);

  const a = ctx.globalAlpha;
  if (o.alpha !== undefined) ctx.globalAlpha = a * o.alpha;

  if (o.shadow) {
    const sg = getGlyphs(String(str), { ...o, color: o.shadowColor || '#000000' });
    const so = o.shadowOffset === undefined ? 1 : o.shadowOffset;
    ctx.globalAlpha = (o.alpha === undefined ? a : a * o.alpha) * (o.shadowAlpha || 0.85);
    ctx.drawImage(sg.c, dx + so, dy + so);
    ctx.globalAlpha = o.alpha === undefined ? a : a * o.alpha;
  }
  if (o.outline) {
    const og = getGlyphs(String(str), { ...o, color: o.outlineColor || '#000000' });
    const oa = (o.alpha === undefined ? a : a * o.alpha) * (o.outlineAlpha || 1);
    ctx.globalAlpha = oa;
    for (let i = 0; i < 4; i++) {
      const ox = [1, -1, 0, 0][i], oy = [0, 0, 1, -1][i];
      ctx.drawImage(og.c, dx + ox, dy + oy);
    }
    ctx.globalAlpha = o.alpha === undefined ? a : a * o.alpha;
  }

  ctx.drawImage(g.c, dx, dy);
  ctx.globalAlpha = a;
  return g.w;
}

// Quebra por largura respeitando palavras. Devolve array de linhas.
export function wrap(str, maxW, o = {}) {
  const words = String(str).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (measure(test, o).w > maxW && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

export function textBlock(ctx, str, x, y, maxW, lineH, o = {}) {
  const lines = Array.isArray(str) ? str : wrap(str, maxW, o);
  for (let i = 0; i < lines.length; i++) text(ctx, lines[i], x, y + i * lineH, o);
  return lines.length * lineH;
}

export function clearTextCache() { cache.clear(); }
