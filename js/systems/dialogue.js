// dialogue.js — caixa de dialogo, legendas e o balaozinho de interagir.
//
// Ja esta pronto para NPC (nome do falante, fila de falas, escolhas) mesmo
// sem existir NPC nenhum ainda. Nesta versao ele e testado pelos monologos
// de "olhar" espalhados pelo beco e pelo bar.

import { VW, VH, clamp, rgba } from '../core/gfx.js';
import { text, wrap, measure } from '../core/text.js';
import { PAL } from '../art/palette.js';
import { input } from '../core/input.js';
import { audio } from '../core/audio.js';
import { t as T } from '../i18n.js';

const BOX_X = 34, BOX_W = VW - 68, BOX_H = 54;
const BOX_Y = VH - BOX_H - 16;
const CPS = 44;

export class Dialogue {
  constructor() {
    this.lines = [];
    this.idx = 0;
    this.reveal = 0;
    this.active = false;
    this.fade = 0;
    this.blipT = 0;
    this.onDone = null;
    this.closing = false;
  }

  start(lines, opts = {}) {
    if (!lines || !lines.length) return;
    this.lines = lines;
    this.idx = 0;
    this.reveal = 0;
    this.active = true;
    this.closing = false;
    this.onDone = opts.onDone || null;
    this._wrapCur();
  }

  _wrapCur() {
    const l = this.lines[this.idx];
    this.wrapped = wrap(l.text, BOX_W - 24, { size: 10, font: 'ui' });
    this.total = l.text.length;
  }

  stop() {
    this.closing = true;
  }

  update(dt) {
    if (!this.active) { this.fade = Math.max(0, this.fade - dt * 6); return; }
    this.fade = Math.min(1, this.fade + dt * 7);

    if (this.closing) {
      this.fade -= dt * 8;
      if (this.fade <= 0) { this.active = false; this.closing = false; if (this.onDone) this.onDone(); }
      return;
    }

    const done = this.reveal >= this.total;
    if (!done) {
      const before = Math.floor(this.reveal);
      this.reveal = Math.min(this.total, this.reveal + CPS * dt);
      if (Math.floor(this.reveal) > before) {
        this.blipT += dt;
        if (this.blipT > 0.045) { this.blipT = 0; audio.blip(0.85 + Math.random() * 0.3); }
      }
    }

    if (input.pressed('confirm') || input.pressed('attack')) {
      if (!done) this.reveal = this.total;
      else this._next();
    } else if (input.pressed('cancel')) {
      this._next(true);
    }
  }

  _next(skipAll) {
    if (skipAll || this.idx >= this.lines.length - 1) {
      this.closing = true;
      audio.uiBack();
    } else {
      this.idx++;
      this.reveal = 0;
      this._wrapCur();
      audio.uiMove();
    }
  }

  draw(ctx) {
    if (this.fade <= 0) return;
    const a = clamp(this.fade, 0, 1);
    const l = this.lines[this.idx];
    const y = BOX_Y + (1 - a) * 6;

    ctx.save();
    ctx.globalAlpha = a * 0.92;
    // corpo da caixa
    ctx.fillStyle = PAL.uiBox;
    ctx.fillRect(BOX_X, y, BOX_W, BOX_H);
    const g = ctx.createLinearGradient(0, y, 0, y + BOX_H);
    g.addColorStop(0, rgba('#1a1518', 0.9));
    g.addColorStop(1, rgba('#08070a', 0.95));
    ctx.fillStyle = g;
    ctx.fillRect(BOX_X, y, BOX_W, BOX_H);
    // moldura
    ctx.globalAlpha = a;
    ctx.fillStyle = PAL.uiBoxEdge;
    ctx.fillRect(BOX_X, y, BOX_W, 1);
    ctx.fillRect(BOX_X, y + BOX_H - 1, BOX_W, 1);
    ctx.fillRect(BOX_X, y, 1, BOX_H);
    ctx.fillRect(BOX_X + BOX_W - 1, y, 1, BOX_H);
    // fio de destaque no canto
    ctx.fillStyle = PAL.uiAccent;
    ctx.fillRect(BOX_X, y, 14, 1);
    ctx.fillRect(BOX_X + BOX_W - 14, y + BOX_H - 1, 14, 1);

    let ty = y + 10;
    if (l.name) {
      text(ctx, l.name, BOX_X + 12, y - 12, {
        size: 10, font: 'ui', weight: 'bold', color: PAL.uiAccent, track: 1,
        shadow: true, alpha: a,
      });
    }

    // texto com maquina de escrever
    let shown = Math.floor(this.reveal);
    for (const ln of this.wrapped) {
      if (shown <= 0) break;
      const part = ln.length <= shown ? ln : ln.slice(0, shown);
      text(ctx, part, BOX_X + 12, ty, {
        size: 10, font: l.name ? 'ui' : 'ui', color: l.name ? PAL.uiText : '#b9b0a2',
        shadow: true, shadowColor: '#000', alpha: a,
      });
      shown -= ln.length;
      ty += 13;
    }

    // seta de continuar
    if (this.reveal >= this.total) {
      const bl = (Math.sin(performance.now() * 0.006) > 0) ? 1 : 0.35;
      ctx.globalAlpha = a * bl;
      ctx.fillStyle = PAL.uiDim;
      const ax = BOX_X + BOX_W - 14, ay = y + BOX_H - 10;
      ctx.fillRect(ax, ay, 5, 1);
      ctx.fillRect(ax + 1, ay + 1, 3, 1);
      ctx.fillRect(ax + 2, ay + 2, 1, 1);
    }
    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// legendas da cutscene
// ---------------------------------------------------------------------------

export function drawSubtitle(ctx, str, alpha, yOff = 0) {
  if (!str || alpha <= 0) return;
  const lines = wrap(str, VW - 80, { size: 12, font: 'serif' });
  const lh = 15;
  const baseY = VH - 42 - (lines.length - 1) * lh + yOff;
  ctx.save();
  for (let i = 0; i < lines.length; i++) {
    text(ctx, lines[i], VW / 2, baseY + i * lh, {
      size: 12, font: 'serif', color: '#e6dfd0', align: 'center',
      outline: true, outlineColor: '#000000', outlineAlpha: 0.85, alpha,
    });
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// balao de interacao
// ---------------------------------------------------------------------------

export function drawPrompt(ctx, sx, sy, promptKey, alpha, tsec) {
  if (alpha <= 0) return;
  const label = T(promptKey);
  const kw = 9;
  const lw = measure(label, { size: 8, font: 'ui', weight: 'bold', track: 1 }).w;
  const w = kw + 6 + lw + 10;
  const h = 13;
  const bob = Math.sin(tsec * 3.4) * 1.2;
  const x = Math.round(sx - w / 2);
  const y = Math.round(sy - h - 6 + bob);

  ctx.save();
  ctx.globalAlpha = alpha * 0.9;
  ctx.fillStyle = '#0a0809';
  ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = PAL.uiBoxEdge;
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y + h - 1, w, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.fillRect(x + w - 1, y, 1, h);

  // tecla
  ctx.fillStyle = PAL.uiAccent;
  ctx.fillRect(x + 4, y + 3, kw, 7);
  text(ctx, 'E', x + 4 + kw / 2, y + 2, {
    size: 8, font: 'ui', weight: 'bold', color: '#120c0b', align: 'center', alpha,
  });
  text(ctx, label, x + 4 + kw + 5, y + 2, {
    size: 8, font: 'ui', weight: 'bold', color: PAL.uiText, track: 1, alpha,
  });

  // pontinha
  ctx.fillStyle = '#0a0809';
  ctx.fillRect(x + w / 2 - 2, y + h, 4, 1);
  ctx.fillRect(x + w / 2 - 1, y + h + 1, 2, 1);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// cartao de capitulo / nome do local
// ---------------------------------------------------------------------------

export function drawLocationCard(ctx, titleKey, subKey, alpha) {
  if (alpha <= 0) return;
  const x = 26, y = 34;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = PAL.uiAccent;
  ctx.fillRect(x, y, 1, 18);
  if (subKey) {
    text(ctx, T(subKey), x + 8, y - 1, {
      size: 8, font: 'ui', weight: 'bold', color: PAL.uiDim, track: 2, alpha, shadow: true,
    });
  }
  text(ctx, T(titleKey), x + 8, y + 8, {
    size: 13, font: 'serif', color: PAL.uiText, track: 1, alpha, shadow: true,
  });
  ctx.restore();
}
