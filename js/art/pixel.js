// pixel.js — ferramentas de arte em pixel.
//
// Um sprite aqui e uma grade de caracteres virando canvas. Escrever asa,
// bota e gravata como texto e mais facil de ajustar do que codigo de
// desenho, e o resultado e pixel exato, sem anti-alias em lugar nenhum.
//
// A rotacao de membro usa drawImage com imageSmoothingEnabled = false:
// o navegador reamostra por vizinho mais proximo e o braco continua com
// cara de pixel art mesmo girando em qualquer angulo. E isso que da
// fluidez sem precisar de 30 quadros desenhados a mao por animacao.

import { makeBuffer, mulberry32 } from '../core/gfx.js';

export const DEG = Math.PI / 180;

// def = { rows:[...], map:{char:'#rrggbb'}, pivot:[x,y] }
export function sprite(def) {
  const rows = def.rows;
  const h = rows.length;
  const w = Math.max(...rows.map(r => r.length));
  const b = makeBuffer(w, h);
  const img = b.x.createImageData(w, h);
  const d = img.data;
  const cache = {};
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      let c = cache[ch];
      if (!c) {
        const hex = def.map[ch];
        if (!hex) continue;
        c = cache[ch] = parseHex(hex);
      }
      const p = (y * w + x) * 4;
      d[p] = c[0]; d[p + 1] = c[1]; d[p + 2] = c[2]; d[p + 3] = c[3];
    }
  }
  b.x.putImageData(img, 0, 0);
  return { c: b.c, w, h, px: def.pivot ? def.pivot[0] : 0, py: def.pivot ? def.pivot[1] : 0 };
}

function parseHex(hex) {
  if (Array.isArray(hex)) return hex;
  let h = hex.replace('#', '');
  let a = 255;
  if (h.length === 8) { a = parseInt(h.slice(6, 8), 16); h = h.slice(0, 6); }
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, a];
}

// Copia do sprite multiplicada por k — membros de tras ficam mais escuros
// e a silhueta ganha profundidade sem custo nenhum em tempo de jogo.
export function darken(spr, k, tint) {
  const b = makeBuffer(spr.w, spr.h);
  b.x.drawImage(spr.c, 0, 0);
  const img = b.x.getImageData(0, 0, spr.w, spr.h);
  const d = img.data;
  const tc = tint ? parseHex(tint) : null;
  for (let p = 0; p < d.length; p += 4) {
    if (!d[p + 3]) continue;
    d[p] = Math.round(d[p] * k);
    d[p + 1] = Math.round(d[p + 1] * k);
    d[p + 2] = Math.round(d[p + 2] * k);
    if (tc) {
      d[p] = Math.round(d[p] * 0.72 + tc[0] * 0.28);
      d[p + 1] = Math.round(d[p + 1] * 0.72 + tc[1] * 0.28);
      d[p + 2] = Math.round(d[p + 2] * 0.72 + tc[2] * 0.28);
    }
  }
  b.x.putImageData(img, 0, 0);
  return { c: b.c, w: spr.w, h: spr.h, px: spr.px, py: spr.py };
}

export function flipH(spr) {
  const b = makeBuffer(spr.w, spr.h);
  b.x.translate(spr.w, 0);
  b.x.scale(-1, 1);
  b.x.imageSmoothingEnabled = false;
  b.x.drawImage(spr.c, 0, 0);
  return { c: b.c, w: spr.w, h: spr.h, px: spr.w - 1 - spr.px, py: spr.py };
}

// Desenha respeitando o pivo, com posicao arredondada. Arredondar importa:
// meio pixel de deslocamento faz o sprite inteiro tremer.
export function drawSpr(ctx, spr, x, y, rot, flip, alpha) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(Math.round(x), Math.round(y));
  if (flip === -1) ctx.scale(-1, 1);
  if (rot) ctx.rotate(rot);
  if (alpha !== undefined && alpha !== 1) ctx.globalAlpha *= alpha;
  ctx.drawImage(spr.c, -spr.px, -spr.py);
  ctx.restore();
}

// Desenha assumindo que a transformacao ja esta no lugar (usado pelo rig).
export function stamp(ctx, spr) {
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(spr.c, -spr.px, -spr.py);
}

// Luz de contorno: copia a silhueta, apaga ela mesma deslocada, e o que
// sobra e uma casquinha de 1px na borda voltada para a luz.
export function rimPass(srcCanvas, dstBuf, color, dx, dy) {
  const x = dstBuf.x, w = dstBuf.c.width, h = dstBuf.c.height;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.globalCompositeOperation = 'source-over';
  x.globalAlpha = 1;
  x.clearRect(0, 0, w, h);
  x.drawImage(srcCanvas, 0, 0);
  x.globalCompositeOperation = 'destination-out';
  x.drawImage(srcCanvas, dx, dy);
  x.globalCompositeOperation = 'source-in';
  x.fillStyle = color;
  x.fillRect(0, 0, w, h);
  x.globalCompositeOperation = 'source-over';
}

// Silhueta cheia — usado em sustos, flashes e no efeito de "sombra que
// nao e sua" mais para a frente.
export function silhouettePass(srcCanvas, dstBuf, color) {
  const x = dstBuf.x, w = dstBuf.c.width, h = dstBuf.c.height;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.globalCompositeOperation = 'source-over';
  x.globalAlpha = 1;
  x.clearRect(0, 0, w, h);
  x.drawImage(srcCanvas, 0, 0);
  x.globalCompositeOperation = 'source-in';
  x.fillStyle = color;
  x.fillRect(0, 0, w, h);
  x.globalCompositeOperation = 'source-over';
}

// ---------------------------------------------------------------------------
// Pinceis para cenario. Tudo desenhado uma vez em canvas de camada, nunca
// por frame.
// ---------------------------------------------------------------------------

export function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function line(ctx, x1, y1, x2, y2, color) {
  // Bresenham — line() do canvas tem anti-alias e suja a arte.
  ctx.fillStyle = color;
  let x0 = Math.round(x1), y0 = Math.round(y1);
  const xf = Math.round(x2), yf = Math.round(y2);
  const dx = Math.abs(xf - x0), sx = x0 < xf ? 1 : -1;
  const dy = -Math.abs(yf - y0), sy = y0 < yf ? 1 : -1;
  let err = dx + dy;
  for (let i = 0; i < 4000; i++) {
    ctx.fillRect(x0, y0, 1, 1);
    if (x0 === xf && y0 === yf) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}

// Textura granulada: sujeira, ferrugem, poeira. seed fixa = mesmo resultado.
export function grainRect(ctx, x, y, w, h, colors, density, seed) {
  const rnd = mulberry32(seed);
  const n = Math.floor(w * h * density);
  for (let i = 0; i < n; i++) {
    const px = x + Math.floor(rnd() * w);
    const py = y + Math.floor(rnd() * h);
    ctx.fillStyle = colors[Math.floor(rnd() * colors.length)];
    ctx.fillRect(px, py, 1, 1);
  }
}

// Gradiente vertical em degraus (dither ordenado). Gradiente liso do canvas
// destroi a estetica; isto mantem a paleta limitada.
export function ditherV(ctx, x, y, w, h, top, bottom, steps = 6) {
  const bayer = [
    [0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5],
  ];
  const A = parseHex(top), B = parseHex(bottom);
  const img = ctx.createImageData(w, h);
  const d = img.data;
  for (let yy = 0; yy < h; yy++) {
    const tRaw = yy / Math.max(1, h - 1);
    for (let xx = 0; xx < w; xx++) {
      const th = bayer[yy & 3][xx & 3] / 16;
      const t = Math.min(1, Math.max(0, Math.round((tRaw * steps) + (th - 0.5)) / steps));
      const p = (yy * w + xx) * 4;
      d[p] = Math.round(A[0] + (B[0] - A[0]) * t);
      d[p + 1] = Math.round(A[1] + (B[1] - A[1]) * t);
      d[p + 2] = Math.round(A[2] + (B[2] - A[2]) * t);
      d[p + 3] = 255;
    }
  }
  ctx.putImageData(img, Math.round(x), Math.round(y));
}
