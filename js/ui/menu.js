// menu.js — tela de titulo.
//
// O menu e uma cena de jogo, nao um cartaz: chove, o poste zumbe, e o
// detetive esta ali parado embaixo da luz acendendo um cigarro que ele vai
// jogar fora. A intencao e que a primeira impressao do jogo seja o clima.
//
// O titulo e desenhado a partir de fonte do sistema e depois "corroido":
// pixels comidos na borda e escorridos para baixo, como tinta velha.

import { VW, VH, gfx, makeBuffer, clamp, lerp, mulberry32, rgba, easeOut } from '../core/gfx.js';
import { text, getGlyphs, clearTextCache } from '../core/text.js';
import { PAL } from '../art/palette.js';
import { rect, grainRect } from '../art/pixel.js';
import * as M from '../world/materials.js';
import { Detective } from '../art/detective.js';
import { Rain, Fog, Particles } from '../world/fx.js';
import { input } from '../core/input.js';
import { audio } from '../core/audio.js';
import { save } from '../core/save.js';
import { t as T } from '../i18n.js';

const TITLE_TEXT = 'THE MIDNIGHT CALL';
const DET_X = 112;          // onde o detetive fica parado, embaixo do poste
const COL_X = 302;          // eixo da coluna de titulo e menu

function makeTitle() {
  const g = getGlyphs(TITLE_TEXT, { font: 'title', size: 30, weight: 'normal', color: '#d2cabb', track: 3, threshold: 0.5 });
  const W = g.w + 10, H = g.h + 16;
  const b = makeBuffer(W, H);
  b.x.drawImage(g.c, 5, 4);

  const img = b.x.getImageData(0, 0, W, H);
  const d = img.data;
  const rnd = mulberry32(0x5EED);
  const at = (x, y) => (y * W + x) * 4;

  // corrosao: come pixels que tem vizinho vazio
  const copy = new Uint8ClampedArray(d);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = at(x, y);
      if (!copy[p + 3]) continue;
      let edge = false;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || !copy[at(nx, ny) + 3]) { edge = true; break; }
      }
      if (edge && rnd() < 0.30) d[p + 3] = 0;
      else if (rnd() < 0.05) { d[p] = 150; d[p + 1] = 140; d[p + 2] = 128; }
    }
  }

  // escorrido: algumas colunas pingam para baixo
  for (let x = 0; x < W; x++) {
    if (rnd() > 0.11) continue;
    let lastY = -1;
    for (let y = H - 1; y >= 0; y--) if (d[at(x, y) + 3]) { lastY = y; break; }
    if (lastY < 0) continue;
    const len = 2 + Math.floor(rnd() * 9);
    for (let k = 1; k <= len && lastY + k < H; k++) {
      const p = at(x, lastY + k);
      const fadeK = 1 - k / (len + 1);
      d[p] = Math.round(120 * fadeK + 60); d[p + 1] = Math.round(80 * fadeK + 30);
      d[p + 2] = Math.round(70 * fadeK + 28); d[p + 3] = Math.round(220 * fadeK);
    }
  }
  b.x.putImageData(img, 0, 0);

  // copia vermelha para o halo
  const glow = makeBuffer(W, H);
  glow.x.drawImage(b.c, 0, 0);
  glow.x.globalCompositeOperation = 'source-in';
  glow.x.fillStyle = '#c8392b';
  glow.x.fillRect(0, 0, W, H);

  return { c: b.c, glow: glow.c, w: W, h: H };
}

function buildBackdrop() {
  const b = makeBuffer(VW, VH);
  const g = b.x;
  const GY = 214, WALL_TOP = 34;

  rect(g, 0, 0, VW, VH, '#0a0e15');
  // fresta de ceu
  for (let i = 0; i < WALL_TOP; i++) {
    rect(g, 0, i, VW, 1, i < 12 ? '#080c13' : '#0d131c');
  }
  M.brickWall(g, 0, WALL_TOP, VW, GY - WALL_TOP, 3301, {
    base: '#312522', hi: '#3e2f2b', dk: '#231a18', mortar: '#1c1513',
  });
  for (let i = 0; i < 60; i++) {
    g.globalAlpha = 0.7 * (1 - i / 60);
    rect(g, 0, WALL_TOP + i, VW, 1, '#04060a');
  }
  g.globalAlpha = 1;

  rect(g, 0, GY - 14, VW, 14, '#292927');
  grainRect(g, 0, GY - 14, VW, 14, ['#1d1d1c', '#333331'], 0.09, 3311);
  M.asphalt(g, 0, GY, VW, VH - GY, 3321);
  rect(g, 0, GY, VW, 1, '#101218');

  // Nada claro entre x=210 e x=400 na metade de cima: e onde ficam o titulo
  // e os itens do menu, e qualquer mancha clara atras deles suja a leitura.
  M.drainPipe(g, 22, WALL_TOP, GY - WALL_TOP - 14, 3331);
  M.boardedWindow(g, 150, 78, 44, 36, 3341);
  M.poster(g, 126, 128, 3351);
  M.graffiti(g, 320, 186, 3361, '#4a1d1a');
  M.trashPile(g, 386, GY, 3371);
  M.crate(g, 420, GY, 1, 3381);
  M.puddle(g, 66, GY + 12, 96, 3391);
  M.puddle(g, 300, GY + 20, 60, 3401);

  const lamp = M.streetLampPost(g, 46, GY, 118);

  // primeiro plano: cano e beirada preta
  const f = makeBuffer(VW, VH);
  rect(f.x, 0, 0, VW, 10, '#04060a');
  rect(f.x, 440, 0, 8, VH, '#05070b');
  rect(f.x, 0, VH - 6, VW, 6, '#04060a');

  return { back: b.c, fore: f.c, lamp, GY };
}

export class TitleMenu {
  constructor(game) {
    this.game = game;
    this.t = 0;
    this.sel = 0;
    this.intro = 0;
    this.flicker = 1;
    this.flickT = 2;
    this.ready = false;
  }

  build() {
    if (this.ready) return;
    this.title = makeTitle();
    this.bd = buildBackdrop();
    this.det = new Detective();
    this.det.rimColor = '#e8b06a';
    this.det.rimDX = 1; this.det.rimDY = -1;
    this.det.rimAlpha = 0.6;
    this.det.reflect = 0.18;
    this.det.facing = 1;
    this.det.play('idle', { blend: 0 });
    this.det.onEvent = (ev) => this._detEvent(ev);
    this.rain = new Rain({ count: 190, groundY: this.bd.GY + 2, wind: -30 });
    this.fog = new Fog({ y: this.bd.GY - 22, alpha: 0.13, count: 5 });
    this.fx = new Particles(200);
    this.smokeT = 4;
    this.ready = true;
  }

  _detEvent(ev) {
    if (ev === 'lighter_flick') audio.lighterFlick();
    else if (ev === 'flame_on') { audio.flameWhoosh(0.7); gfx.flash = 0.08; }
    else if (ev === 'cig_toss') {
      this.fx.spawn({
        x: 110, y: 172, vx: 70, vy: -26, ay: 240,
        life: 1.4, size: 1, color: '#ded6c4', a: 0.9, fade: 0.4,
      });
    }
  }

  enter() {
    this.build();
    this.t = 0;
    this.intro = 0;
    this.sel = 0;
    this.items = this._items();
    audio.ensure();
    audio.startMusic('menu');
    audio.startLoop('rain', { gain: 0.13, fade: 2.5 });
    audio.startLoop('wind', { gain: 0.035, fade: 3 });
    gfx.fade = 1;
  }

  _items() {
    const has = save.mostRecent() >= 0;
    const list = [];
    if (has) list.push({ k: 'menu_continue', a: 'continue' });
    list.push({ k: 'menu_new', a: 'new' });
    if (has) list.push({ k: 'menu_load', a: 'load' });
    list.push({ k: 'menu_options', a: 'options' });
    list.push({ k: 'menu_extras', a: 'lab' });
    return list;
  }

  refresh() { this.items = this._items(); this.sel = Math.min(this.sel, this.items.length - 1); }

  update(dt, blocked) {
    this.t += dt;
    this.intro = Math.min(1, this.intro + dt * 0.55);
    gfx.fade = Math.max(0, gfx.fade - dt * 0.9);

    this.rain.update(dt, 0);
    this.fog.update(dt, this.t);
    this.fx.update(dt);

    // o detetive fuma de tempos em tempos, sozinho
    this.smokeT -= dt;
    if (this.smokeT <= 0 && this.det.anim === 'idle') {
      this.det.play('smoke', { restart: true, blend: 0.3 });
      this.smokeT = 26;
    }
    if (this.det.anim === 'smoke' && this.det.done) this.det.play('idle', { blend: 0.3 });
    this.det.update(dt);

    // piscada do titulo, como neon com mau contato
    this.flickT -= dt;
    if (this.flickT <= 0) {
      this.flickT = 2.4 + Math.random() * 6;
      this.flickN = 3 + Math.floor(Math.random() * 4);
    }
    if (this.flickN > 0) {
      this.flicker = Math.random() < 0.5 ? 0.35 : 1;
      this.flickN -= dt * 40;
    } else this.flicker = lerp(this.flicker, 1, 1 - Math.exp(-12 * dt));

    if (blocked) return null;

    const n = this.items.length;
    if (input.pressed('menuDown')) { this.sel = (this.sel + 1) % n; audio.uiMove(); }
    if (input.pressed('menuUp')) { this.sel = (this.sel + n - 1) % n; audio.uiMove(); }
    if (input.pressed('confirm')) { audio.uiConfirm(); return this.items[this.sel].a; }
    return null;
  }

  draw(ctx) {
    const bd = this.bd;
    ctx.drawImage(bd.back, 0, 0);
    this.fog.draw(ctx);
    this.det.draw(ctx, DET_X, bd.GY);
    this.fx.draw(ctx, 0, 0);
    this.rain.draw(ctx);
    ctx.drawImage(bd.fore, 0, 0);
  }

  addLights() {
    const bd = this.bd;
    const buzz = 0.9 + 0.1 * Math.sin(this.t * 41);
    gfx.addLight(bd.lamp.bulbX, bd.lamp.bulbY, 190, PAL.lampWarm, 0.95 * buzz, 0.8);
    gfx.addCone(bd.lamp.bulbX, bd.lamp.bulbY + 2, Math.PI / 2, 1.3, 150, PAL.lampWarm, 0.44 * buzz);
    gfx.addLight(bd.lamp.bulbX, bd.lamp.bulbY, 24, '#fff0cc', 1.0 * buzz);
    // preenchimento fraco em volta do personagem, so para ele nao virar borrao
    gfx.addLight(DET_X + 2, bd.GY - 34, 74, '#c89a68', 0.32 * buzz, 1.2);
    for (const L of this.det.lights(DET_X, bd.GY)) gfx.addLight(L.x, L.y, L.r, L.color, L.i);
    // luar frio caindo do alto
    gfx.addLight(VW * 0.70, -40, 300, '#547aa8', 0.30, 1.5);
  }

  drawUI(ctx) {
    const t = this.title;
    const tx = Math.round(COL_X - t.w / 2);
    const ty = 40;
    const rev = easeOut(clamp(this.intro * 1.7, 0, 1));

    // Sombra suave atras da coluna de texto. Sem ela, tijolo iluminado por
    // tras de letra fina destroi a leitura em qualquer tela pequena.
    ctx.save();
    const sg = ctx.createRadialGradient(COL_X, 118, 20, COL_X, 118, 168);
    sg.addColorStop(0, 'rgba(4,4,7,0.72)');
    sg.addColorStop(1, 'rgba(4,4,7,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(COL_X - 180, 0, 360, 250);
    ctx.restore();

    ctx.save();
    // halo vermelho
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.20 * this.flicker * rev;
    for (const [ox, oy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [-3, 2], [3, 2]]) {
      ctx.drawImage(t.glow, tx + ox, ty + oy);
    }
    ctx.globalCompositeOperation = 'source-over';

    // revelacao por varredura
    ctx.globalAlpha = this.flicker;
    const cut = Math.round(t.w * rev);
    ctx.drawImage(t.c, 0, 0, cut, t.h, tx, ty, cut, t.h);
    if (rev < 1 && rev > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#e8dcc8';
      ctx.fillRect(tx + cut - 2, ty, 2, t.h);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    text(ctx, T('tagline'), COL_X, ty + t.h + 2, {
      size: 9, font: 'serif', color: PAL.uiDim, align: 'center', track: 4,
      alpha: clamp((this.intro - 0.5) * 3, 0, 1), shadow: true,
    });

    // linha divisoria
    const la = clamp((this.intro - 0.55) * 3, 0, 1);
    ctx.save();
    ctx.globalAlpha = la * 0.6;
    ctx.fillStyle = PAL.uiFaint;
    ctx.fillRect(COL_X - 70, ty + t.h + 16, 140, 1);
    ctx.restore();

    // itens
    const ia = clamp((this.intro - 0.62) * 3.2, 0, 1);
    const y0 = ty + t.h + 30;
    for (let i = 0; i < this.items.length; i++) {
      const on = i === this.sel;
      const y = y0 + i * 19;
      const x = COL_X + (on ? 4 : 0);
      if (on) {
        ctx.save();
        ctx.globalAlpha = ia * (0.5 + 0.25 * Math.sin(this.t * 3));
        ctx.fillStyle = PAL.uiAccent;
        ctx.fillRect(x - 78, y + 4, 5, 5);
        ctx.restore();
      }
      text(ctx, T(this.items[i].k), x, y, {
        size: 11, font: 'ui', weight: on ? 'bold' : 'normal', track: 3,
        color: on ? '#e8e0d2' : PAL.uiDim, align: 'center',
        alpha: ia, shadow: true, shadowColor: '#000',
      });
    }

    text(ctx, T('build_tag'), 8, VH - 14, {
      size: 7, font: 'ui', color: '#3a342e', track: 1, alpha: ia,
    });
    text(ctx, T('menu_hint'), VW - 8, VH - 14, {
      size: 7, font: 'ui', color: '#3a342e', track: 1, align: 'right', alpha: ia,
    });
  }
}
