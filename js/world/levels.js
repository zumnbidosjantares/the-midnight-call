// levels.js — construcao dos cenarios.
//
// Cada fase e montada uma vez em canvas de camada (paralaxe, principal,
// primeiro plano) e depois so e deslocada. Sobre isso ficam as coisas que
// respiram: lampada que oscila, neon que zumbe, gota que cai.

import { VW, VH, makeBuffer, lerp, clamp, mulberry32 } from '../core/gfx.js';
import { PAL } from '../art/palette.js';
import { rect, grainRect, ditherV } from '../art/pixel.js';
import * as M from './materials.js';

export class Level {
  constructor(o) {
    Object.assign(this, o);
    this.t = 0;
    this.lightDefs = this.lightDefs || [];
    for (const f of this.lightDefs) { f.cur = f.i; f.tt = 0; f.k = 1; }
    this.interactables = this.interactables || [];
    this.props = this.props || {};
  }

  update(dt) {
    this.t += dt;
    for (const f of this.lightDefs) {
      if (f.flick === 'bulb') {
        f.tt -= dt;
        if (f.tt <= 0) {
          f.tt = 0.04 + Math.random() * 1.5;
          f.k = Math.random() < 0.20 ? 0.18 + Math.random() * 0.4 : 0.9 + Math.random() * 0.14;
        }
        f.cur = lerp(f.cur, f.i * f.k, 1 - Math.exp(-20 * dt));
      } else if (f.flick === 'neon') {
        const buzz = 0.86 + 0.14 * Math.sin(this.t * 47);
        const glitch = (Math.sin(this.t * 0.7) > 0.985) ? 0.15 : 1;
        f.cur = f.i * buzz * glitch;
      } else if (f.flick === 'swing') {
        f.cur = f.i * (0.94 + 0.06 * Math.sin(this.t * 1.7));
      } else {
        f.cur = f.i;
      }
    }
    if (this.onUpdate) this.onUpdate(dt, this.t);
  }

  _drawLayers(ctx, cam, arr) {
    if (!arr) return;
    for (const L of arr) {
      const ox = Math.round(-cam.x * L.par + (L.ox || 0));
      const oy = Math.round((L.oy || 0) - cam.y * (L.parY === undefined ? L.par : L.parY));
      ctx.drawImage(L.c, ox, oy);
    }
  }

  drawBack(ctx, cam) { this._drawLayers(ctx, cam, this.layers); }
  drawFore(ctx, cam) { this._drawLayers(ctx, cam, this.fores); }

  addLights(gfx, cam) {
    for (const f of this.lightDefs) {
      const sx = f.x - cam.ix, sy = f.y - cam.iy;
      if (f.cone) gfx.addCone(sx, sy, f.cone.a, f.cone.spread, f.cone.len, f.color, f.cur);
      gfx.addLight(sx, sy, f.r, f.color, f.cur, f.falloff || 1);
    }
  }

  nearest(px) {
    let best = null, bd = 1e9;
    for (const it of this.interactables) {
      if (it.disabled) continue;
      const cx = it.x + (it.w || 0) / 2;
      const d = Math.abs(px - cx);
      if (d < (it.range || 26) && d < bd) { bd = d; best = it; }
    }
    return best;
  }
}

// ---------------------------------------------------------------------------
// BECO — primeiro ambiente jogavel
// ---------------------------------------------------------------------------

export function buildAlley() {
  const W = 1300, GY = 214;

  // --- ceu e horizonte distantes ---
  const skyW = Math.ceil(VW + (W - VW) * 0.14) + 8;
  const sky = makeBuffer(skyW, VH);
  ditherV(sky.x, 0, 0, skyW, 120, '#121a28', PAL.nightSky, 7);
  rect(sky.x, 0, 120, skyW, VH - 120, PAL.nightSky);
  {
    const rnd = mulberry32(4001);
    for (let i = 0; i < 70; i++) {
      const sx = rnd() * skyW, sy = rnd() * 70;
      sky.x.globalAlpha = 0.12 + rnd() * 0.3;
      rect(sky.x, sx, sy, 1, 1, '#c9d8f0');
    }
    sky.x.globalAlpha = 1;
    // predios bem distantes
    let x = -20;
    while (x < skyW) {
      const w = 26 + rnd() * 44, h = 40 + rnd() * 60;
      M.buildingSilhouette(sky.x, x, 118, w, h, '#111823', 5000 + x, true);
      x += w + 2 + rnd() * 10;
    }
  }

  // --- predio do outro lado da rua (visto pela fresta) ---
  const midW = Math.ceil(VW + (W - VW) * 0.42) + 8;
  const mid = makeBuffer(midW, VH);
  {
    const rnd = mulberry32(4111);
    let x = -30;
    while (x < midW) {
      const w = 44 + rnd() * 60, h = 96 + rnd() * 46;
      M.buildingSilhouette(mid.x, x, 124, w, h, '#0d131c', 6000 + x, true);
      x += w + 1;
    }
  }

  // --- camada principal: parede do beco, chao, objetos ---
  const main = makeBuffer(W, VH);
  const g = main.x;
  const WALL_TOP = 22;

  M.brickWall(g, 0, WALL_TOP, W, GY - WALL_TOP, 777);
  // Faixa de sombra colada no topo: o beco e fundo e nao pega luz la em cima.
  // Feita com retangulos translucidos, nao com ditherV — putImageData ignora
  // globalAlpha e apagaria o tijolo em vez de escurecer.
  for (let i = 0; i < 44; i++) {
    g.globalAlpha = 0.62 * (1 - i / 44);
    rect(g, 0, WALL_TOP + i, W, 1, '#04060a');
  }
  g.globalAlpha = 1;
  rect(g, 0, WALL_TOP, W, 2, '#0a0d11');

  // rodape de concreto
  rect(g, 0, GY - 16, W, 16, '#2a2a2c');
  grainRect(g, 0, GY - 16, W, 16, ['#1e1e20', '#343436', '#141416'], 0.09, 991);
  rect(g, 0, GY - 16, W, 1, '#3b3b3e');

  // chao
  M.asphalt(g, 0, GY, W, VH - GY, 555);
  rect(g, 0, GY, W, 1, '#12141a');

  const inter = [];
  const lights = [];

  // --- distribuicao dos objetos ---
  M.puddle(g, 30, GY + 10, 54, 12);
  M.trashPile(g, 74, GY, 21);
  M.drainPipe(g, 124, WALL_TOP, GY - WALL_TOP - 16, 31);

  const po = M.poster(g, 150, 96, 41);
  inter.push({ x: po.x, y: po.y, w: po.w, h: po.h, prompt: 'prompt_look', lines: 'alley_poster', range: 24 });

  M.graffiti(g, 210, 150, 51, '#7a2f2a');
  M.boardedWindow(g, 250, 58, 42, 36, 61);
  M.fireEscape(g, 330, 118, 74, 71);
  M.drainPipe(g, 300, WALL_TOP, 96, 81);

  const du = M.dumpster(g, 420, GY, 91);
  inter.push({ x: du.x, y: du.y, w: du.w, h: du.h, prompt: 'prompt_look', lines: 'alley_dumpster', range: 32 });

  // Luminaria gradeada de servico sobre a caçamba. O trecho do meio do beco
  // ficava sem nenhuma fonte de luz e o jogador perdia o personagem.
  rect(g, 466, 84, 3, 10, '#20252b');
  rect(g, 460, 94, 16, 4, '#2b3138');
  rect(g, 461, 98, 14, 4, '#e0b06a');
  rect(g, 462, 102, 12, 1, '#ffd79a');
  for (let i = 0; i < 4; i++) rect(g, 461 + i * 4, 94, 1, 9, '#171b20');
  lights.push({ x: 468, y: 102, r: 116, color: '#e8b878', i: 0.66, falloff: 0.95 });
  lights.push({ x: 468, y: 102, r: 20, color: '#fff0cc', i: 0.75 });

  M.crate(g, 496, GY, 1, 101);
  M.crate(g, 518, GY, 0, 111);
  M.crate(g, 500, GY - 17, 0, 121);

  const pu = M.puddle(g, 556, GY + 14, 76, 131);
  inter.push({ x: pu.x, y: GY - 20, w: pu.w, h: 20, prompt: 'prompt_look', lines: 'alley_puddle', range: 30 });

  M.drainPipe(g, 622, WALL_TOP, GY - WALL_TOP - 16, 141);
  M.manhole(g, 672, GY + 22);
  M.boardedWindow(g, 700, 62, 40, 34, 151);
  M.graffiti(g, 780, 140, 161, '#2f4a6a');

  // lampada nua piscando no meio do beco
  const bulb = M.bareBulb(g, 826, WALL_TOP + 8, 62);
  inter.push({ x: 818, y: bulb.bulbY, w: 16, h: 16, prompt: 'prompt_look', lines: 'alley_lamp', range: 26 });
  lights.push({ x: bulb.bulbX, y: bulb.bulbY, r: 96, color: '#f0c88c', i: 0.85, flick: 'bulb', falloff: 0.9 });
  lights.push({ x: bulb.bulbX, y: bulb.bulbY, r: 26, color: '#fff0cc', i: 0.9, flick: 'bulb' });

  M.puddle(g, 880, GY + 8, 48, 171);
  M.trashPile(g, 930, GY, 181);
  M.crate(g, 962, GY, 1, 191);
  M.drainPipe(g, 1010, WALL_TOP, GY - WALL_TOP - 16, 201);
  M.poster(g, 1044, 104, 211);

  // --- a porta do bar ---
  const DOOR_X = 1152;
  const dr = M.doorFrame(g, DOOR_X, GY, 221);
  inter.push({
    x: dr.x, y: dr.y, w: dr.w, h: dr.h, prompt: 'prompt_open',
    lines: 'alley_door', action: 'enter_bar', range: 30, isDoor: true,
  });
  // degrau
  rect(g, DOOR_X - 6, GY, 38, 3, '#33322f');
  rect(g, DOOR_X - 6, GY, 38, 1, '#45443f');

  const db = M.bareBulb(g, DOOR_X + 13, dr.y - 20, 12);
  lights.push({ x: db.bulbX, y: db.bulbY, r: 72, color: PAL.lampWarm, i: 0.62, flick: 'bulb' });

  // placa de neon apagada pela metade
  M.neonSign(g, DOOR_X - 44, dr.y - 46, 40, 16);
  lights.push({ x: DOOR_X - 24, y: dr.y - 38, r: 58, color: PAL.neonRed, i: 0.42, flick: 'neon' });

  // fim do beco: parede transversal e entulho
  rect(g, 1230, WALL_TOP, W - 1230, GY - WALL_TOP, '#1a1512');
  M.brickWall(g, 1230, WALL_TOP, W - 1230, GY - WALL_TOP, 231, { base: '#2c221f', hi: '#3a2c28', dk: '#1e1715' });
  M.trashPile(g, 1240, GY, 241);
  M.crate(g, 1264, GY, 1, 251);

  // Luz que vaza da boca do beco: o poste da rua fica fora da tela, a
  // esquerda. E a unica coisa que ilumina o inicio da fase.
  lights.push({ x: -34, y: 40, r: 300, color: PAL.lampWarm, i: 0.9, falloff: 1.25 });
  lights.push({ x: 40, y: GY - 40, r: 170, color: '#7d94c4', i: 0.34, falloff: 1.4 });
  // Janela acesa la em cima, no meio do beco. Serve de farol: o jogador
  // enxerga o caminho e sente que existe gente viva por perto.
  rect(g, 558, 38, 30, 24, '#241c18');
  rect(g, 560, 40, 26, 20, '#7a5f2c');
  rect(g, 561, 41, 24, 18, '#a07c3a');
  rect(g, 572, 40, 2, 20, '#241c18');
  rect(g, 560, 49, 26, 2, '#241c18');
  lights.push({ x: 573, y: 52, r: 96, color: '#e0b877', i: 0.55, falloff: 1.1 });

  // --- primeiro plano ---
  const fore = makeBuffer(Math.ceil(VW + (W - VW) * 1.18) + 8, VH);
  {
    const f = fore.x;
    // beirada do predio de cima, cortando o topo da tela
    rect(f, 0, 0, fore.c.width, 12, '#05070a');
    const rnd = mulberry32(4222);
    for (let x = 0; x < fore.c.width; x += 6) {
      rect(f, x, 12, 6, 1 + Math.floor(rnd() * 4), '#05070a');
    }
    // fios cruzando o beco
    for (let i = 0; i < 7; i++) {
      const bx = rnd() * fore.c.width;
      const sag = 10 + rnd() * 16;
      f.fillStyle = '#080a0d';
      for (let x = 0; x < 150; x++) {
        const t = x / 150;
        const y = 8 + Math.sin(t * Math.PI) * sag;
        f.fillRect(Math.round(bx + x), Math.round(y), 1, 1);
      }
    }
    // cano preto em primeiro plano na entrada
    rect(f, 40, 0, 7, VH, '#06080b');
    rect(f, 40, 0, 1, VH, '#0e1116');
  }

  return new Level({
    key: 'alley',
    nameKey: 'loc_alley',
    width: W, groundY: GY,
    ambient: '#313d54',
    layers: [
      { c: sky.c, par: 0.14 },
      { c: mid.c, par: 0.42 },
      { c: main.c, par: 1 },
    ],
    fores: [{ c: fore.c, par: 1.18 }],
    lightDefs: lights,
    interactables: inter,
    weather: 'rain',
    rainIntensity: 1,
    reflect: 0.20,
    minX: 24, maxX: W - 40,
    spawn: { x: 90, facing: 1 },
    doorX: DOOR_X + 13,
    bloom: 0.55,
  });
}

// ---------------------------------------------------------------------------
// BAR — escuro, vazio, cadeiras empilhadas
// ---------------------------------------------------------------------------

export function buildBar() {
  const W = 1000, GY = 214;

  const back = makeBuffer(Math.ceil(VW + (W - VW) * 0.55) + 8, VH);
  {
    const b = back.x;
    rect(b, 0, 0, back.c.width, VH, '#080a0e');
    // vao dos fundos, corredor que some no preto
    ditherV(b, 0, 60, back.c.width, 120, '#12161d', '#07090c', 6);
  }

  const main = makeBuffer(W, VH);
  const g = main.x;

  // --- estrutura da parede: teto, gesso encardido, lambri, rodape ---
  const CEIL = 28, WAINSCOT = 118;

  // gesso encardido de fumaca de cigarro (o bar fumou por decadas)
  ditherV(g, 0, CEIL, W, WAINSCOT - CEIL, '#4a3d2c', '#382c1f', 6);
  grainRect(g, 0, CEIL, W, WAINSCOT - CEIL, ['#2a2016', '#54452f', '#1e1710'], 0.06, 1211);
  // manchas de infiltracao descendo do teto
  {
    const rnd = mulberry32(1215);
    for (let i = 0; i < 26; i++) {
      const sx = rnd() * W, sh = 14 + rnd() * 44;
      g.globalAlpha = 0.10 + rnd() * 0.14;
      rect(g, sx, CEIL, 2 + rnd() * 5, sh, '#140e08');
      g.globalAlpha = 1;
    }
  }

  // lambri de madeira
  M.woodPanel(g, 0, WAINSCOT, W, GY - WAINSCOT, 1201, { hi: '#5c4229', mid: '#43301e', dk: '#2a1c11' });
  rect(g, 0, WAINSCOT - 4, W, 4, '#6a4b2c');
  rect(g, 0, WAINSCOT - 4, W, 1, '#8a6238');
  rect(g, 0, WAINSCOT, W, 1, '#20140b');
  // rodape
  rect(g, 0, GY - 7, W, 7, '#4e3720');
  rect(g, 0, GY - 7, W, 1, '#6d4d2c');

  // teto de chapa estampada
  rect(g, 0, 0, W, CEIL, '#221a14');
  for (let x = 0; x < W; x += 16) {
    rect(g, x, 4, 1, CEIL - 6, '#2e2419');
    rect(g, x + 8, 4, 14, 1, '#2e2419');
    rect(g, x + 8, 16, 14, 1, '#2e2419');
  }
  rect(g, 0, CEIL - 3, W, 3, '#160f0a');
  rect(g, 0, CEIL - 4, W, 1, '#332619');
  grainRect(g, 0, 0, W, CEIL, ['#160f0a', '#3a2c1c'], 0.06, 1221);

  // piso de tabua
  M.woodPanel(g, 0, GY, W, VH - GY, 1231, { pw: 26, hi: '#4c3623', mid: '#382718', dk: '#21160e' });
  for (let x = 0; x < W; x += 26) rect(g, x, GY, 1, VH - GY, '#180f08');
  rect(g, 0, GY, W, 1, '#120b06');
  grainRect(g, 0, GY, W, VH - GY, ['#241809', '#42301e'], 0.06, 1241);

  const inter = [];
  const lights = [];

  // porta de saida (volta para o beco)
  const ex = M.doorFrame(g, 44, GY, 1251);
  inter.push({
    x: ex.x, y: ex.y, w: ex.w, h: ex.h, prompt: 'prompt_open',
    action: 'exit_bar', range: 30, isDoor: true,
  });

  // janela com persiana — a unica luz "natural"
  M.windowBlinds(g, 150, 52, 56, 50);
  lights.push({ x: 178, y: 78, r: 150, color: '#8fb4e8', i: 0.46, falloff: 1.25 });
  lights.push({ x: 178, y: 78, r: 34, color: '#c6dcff', i: 0.5 });

  // quadros tortos e uma placa de cerveja apagada
  rect(g, 250, 60, 34, 26, '#2c1e12');
  rect(g, 252, 62, 30, 22, '#4a3a26');
  rect(g, 256, 66, 22, 14, '#5e4c33');
  rect(g, 700, 56, 44, 20, '#241a12');
  rect(g, 702, 58, 40, 16, '#3d2f1e');
  rect(g, 706, 62, 32, 8, '#5c3a2a');
  rect(g, 300, 66, 26, 20, '#2c1e12');
  rect(g, 302, 68, 22, 16, '#453524');

  // mesas com cadeiras empilhadas
  const t1 = M.table(g, 258, GY, 46, 1261);
  M.chairStack(g, 268, t1.y - 3, 3, 1271);
  inter.push({ x: 258, y: t1.y - 30, w: 46, h: 50, prompt: 'prompt_look', lines: 'bar_chairs', range: 30 });

  const t2 = M.table(g, 372, GY, 42, 1281);
  M.chairStack(g, 380, t2.y - 3, 4, 1291);

  const t3 = M.table(g, 862, GY, 44, 1301);
  M.chairStack(g, 870, t3.y - 3, 2, 1311);
  M.chair(g, 920, GY, false, 1321);

  // balcao
  M.barCounter(g, 520, GY, 232, 1331);
  inter.push({ x: 560, y: GY - 30, w: 60, h: 30, prompt: 'prompt_look', lines: 'bar_counter', range: 30 });

  // prateleira e espelho atras
  M.crackedMirror(g, 596, 108, 92, 44, 1341);
  inter.push({ x: 596, y: 108, w: 92, h: 44, prompt: 'prompt_look', lines: 'bar_mirror', range: 30 });
  M.bottleShelf(g, 540, 140, 200, 1351);
  M.bottleShelf(g, 540, 116, 60, 1361);
  rect(g, 528, 156, 216, 2, '#2e2118');

  // telefone de parede com fio cortado
  M.wallPhone(g, 806, 120, 1371);
  inter.push({ x: 800, y: 118, w: 20, h: 26, prompt: 'prompt_look', lines: 'bar_phone', range: 26 });

  const lampGlow = { x: 430, y: 52, r: 210, color: '#e8b46a', i: 1.15, flick: 'swing', falloff: 0.8 };
  const lampCore = { x: 430, y: 52, r: 30, color: '#ffdca8', i: 1.0, flick: 'swing' };
  lights.push(lampGlow, lampCore);
  // luz batendo no assoalho embaixo de cada pendente
  lights.push({ x: 430, y: GY + 4, r: 140, color: '#c08a4e', i: 0.42, flick: 'swing', falloff: 1.3 });
  lights.push({ x: 660, y: GY + 4, r: 120, color: '#b07f48', i: 0.32, falloff: 1.3 });
  // segunda pendente, mais fraca, sobre o balcao
  lights.push({ x: 660, y: 60, r: 160, color: '#dba765', i: 0.75, falloff: 0.9 });
  lights.push({ x: 660, y: 60, r: 20, color: '#ffdca8', i: 0.8 });
  rect(g, 660, 0, 1, 44, '#0e0b08');
  rect(g, 653, 44, 15, 3, '#20252b');
  rect(g, 655, 47, 11, 3, '#20252b');
  rect(g, 657, 50, 7, 3, '#e8c88a');
  // luz vermelha de saida perto da porta
  lights.push({ x: 60, y: 150, r: 74, color: '#8c3226', i: 0.3 });

  const fore = makeBuffer(Math.ceil(VW + (W - VW) * 1.25) + 8, VH);
  {
    const f = fore.x;
    rect(f, 0, 0, fore.c.width, 8, '#040506');
    // mesa cortada em primeiro plano, bem escura
    rect(f, 120, VH - 42, 90, 6, '#0a0705');
    rect(f, 132, VH - 36, 5, 36, '#0a0705');
    rect(f, 194, VH - 36, 5, 36, '#0a0705');
    rect(f, 640, VH - 30, 120, 30, '#070504');
  }

  const lvl = new Level({
    key: 'bar',
    nameKey: 'loc_bar',
    width: W, groundY: GY,
    ambient: '#2b3648',
    layers: [
      { c: back.c, par: 0.55 },
      { c: main.c, par: 1 },
    ],
    fores: [{ c: fore.c, par: 1.25 }],
    lightDefs: lights,
    interactables: inter,
    weather: 'none',
    reflect: 0.07,
    minX: 24, maxX: W - 40,
    spawn: { x: 74, facing: 1 },
    doorX: 57,
    bloom: 0.42,
    indoor: true,
  });

  // lampada balancando: move a luz E o sprite, entao a sombra da sala anda
  lvl.lampSwing = 0;
  lvl.onUpdate = (dt, t) => {
    const a = Math.sin(t * 0.9) * 7 + Math.sin(t * 0.37) * 3;
    lvl.lampSwing = a;
    lampGlow.x = lampCore.x = 430 + a;
    lampGlow.y = lampCore.y = 52 + Math.abs(a) * 0.12;
  };
  lvl.drawProps = (ctx, cam) => {
    // corpo da lampada, desenhado por frame porque balanca
    const ax = 430 - cam.ix;                    // ponto fixo no teto
    const bx = 430 + lvl.lampSwing - cam.ix;    // ponta do fio
    const y = Math.round(44 - cam.iy);
    ctx.fillStyle = '#0e0b08';
    for (let i = 0; i <= 44; i++) {
      const t = i / 44;
      ctx.fillRect(Math.round(ax + (bx - ax) * t), Math.round(-cam.iy + i), 1, 1);
    }
    const x = Math.round(bx);
    ctx.fillStyle = '#20252b';
    ctx.fillRect(x - 7, y, 15, 3);
    ctx.fillRect(x - 5, y + 3, 11, 3);
    ctx.fillStyle = '#e8c88a';
    ctx.fillRect(x - 3, y + 6, 7, 3);
    ctx.fillStyle = '#fff0c8';
    ctx.fillRect(x - 2, y + 9, 5, 1);
  };

  return lvl;
}

// ---------------------------------------------------------------------------
// CARRO — usado na cutscene de abertura
// ---------------------------------------------------------------------------

export function buildCar() {
  const W = 134, H = 50;
  const b = makeBuffer(W, H);
  const g = b.x;
  // Carro claro de proposito. A cena e multiplicada pela luz ambiente da
  // noite; pintado na cor "real" ele sumiria dentro do proprio asfalto.
  // O comprimento (134px contra 62px de personagem) e o que da a escala
  // certa — carro curto faz o detetive parecer gigante.
  const body = '#4a3b42', hi = '#63505a', dk = '#2a2126', chrome = '#8f959e';

  // corpo
  rect(g, 10, 24, 114, 15, body);
  rect(g, 5, 29, 124, 10, body);
  rect(g, 10, 24, 114, 1, hi);
  rect(g, 5, 38, 124, 3, dk);
  // capo e porta-malas
  rect(g, 88, 21, 34, 5, body);
  rect(g, 13, 21, 28, 5, body);
  rect(g, 88, 21, 34, 1, hi);
  rect(g, 13, 21, 28, 1, hi);
  // cabine
  rect(g, 39, 8, 54, 16, body);
  rect(g, 41, 6, 50, 3, hi);
  // vidros
  rect(g, 44, 10, 19, 12, '#1d2833');
  rect(g, 66, 10, 23, 12, '#1d2833');
  rect(g, 44, 10, 19, 3, '#40566d');
  rect(g, 66, 10, 23, 3, '#40566d');
  rect(g, 63, 9, 3, 14, body);
  // cromados — e a linha clara que desenha a silhueta do carro no escuro
  rect(g, 8, 31, 118, 1, '#c2c8d2');
  rect(g, 39, 24, 54, 1, chrome);
  rect(g, 10, 24, 114, 1, '#7d8592');
  rect(g, 41, 6, 50, 1, '#9aa2ae');
  // para-choques
  rect(g, 2, 33, 8, 5, chrome);
  rect(g, 124, 33, 8, 5, chrome);
  rect(g, 2, 33, 8, 1, '#c2c8d2');
  rect(g, 124, 33, 8, 1, '#c2c8d2');
  // farol e lanterna
  rect(g, 122, 26, 7, 6, '#ffe0a8');
  rect(g, 123, 27, 5, 4, '#fff6d8');
  rect(g, 4, 26, 5, 5, '#8c2a22');
  rect(g, 4, 27, 4, 3, '#d8392c');
  // vinco da porta e macaneta
  rect(g, 58, 26, 1, 13, dk);
  rect(g, 52, 29, 5, 1, chrome);
  rect(g, 93, 26, 1, 13, dk);
  // caixa de rodas
  rect(g, 18, 37, 22, 5, dk);
  rect(g, 94, 37, 22, 5, dk);
  grainRect(g, 3, 6, 128, 36, ['#1a1418', '#3a2f36', '#40301f'], 0.03, 1401);

  // roda separada, para girar
  const wr = 10;
  const w = makeBuffer(wr * 2 + 1, wr * 2 + 1);
  const wg = w.x;
  for (let y = -wr; y <= wr; y++) {
    for (let x = -wr; x <= wr; x++) {
      const d = Math.sqrt(x * x + y * y);
      if (d <= wr) {
        let c = '#1c1a1e';
        if (d > wr - 1.4) c = '#0d0c0f';
        else if (d < 5) c = '#5a606a';
        else if (d < 6.2) c = '#33383f';
        rect(wg, x + wr, y + wr, 1, 1, c);
      }
    }
  }
  rect(wg, wr - 1, wr - 6, 2, 12, '#6e747e');
  rect(wg, wr - 6, wr - 1, 12, 2, '#6e747e');

  return { body: b.c, wheel: w.c, w: W, h: H, wr, wheels: [[29, 37], [105, 37]] };
}

// ---------------------------------------------------------------------------
// RUA — cenario rolante da cutscene de abertura
// ---------------------------------------------------------------------------

export function buildRoad() {
  const TILE = 480;
  const WALK_Y = 214;   // calcada — mesmo chao das outras fases
  const CURB_Y = 222;   // onde comeca o asfalto
  const ROAD_Y = 252;   // onde as rodas encostam (bem a frente da calcada)

  const sky = makeBuffer(VW, VH);
  ditherV(sky.x, 0, 0, VW, VH, '#0b1018', '#1a2130', 8);
  {
    const rnd = mulberry32(7001);
    for (let i = 0; i < 40; i++) {
      sky.x.globalAlpha = 0.10 + rnd() * 0.2;
      rect(sky.x, rnd() * VW, rnd() * 90, 1, 1, '#b8cbe8');
    }
    sky.x.globalAlpha = 1;
  }

  const far = makeBuffer(TILE, VH);
  {
    const rnd = mulberry32(7101);
    let x = -20;
    while (x < TILE + 20) {
      const w = 30 + rnd() * 50, h = 50 + rnd() * 70;
      M.buildingSilhouette(far.x, x, 168, w, h, '#0f1621', 7200 + x, true);
      x += w + 2;
    }
  }

  const mid = makeBuffer(TILE, VH);
  {
    const rnd = mulberry32(7301);
    let x = -30;
    while (x < TILE + 30) {
      const w = 46 + rnd() * 56, h = 90 + rnd() * 60;
      M.buildingSilhouette(mid.x, x, 196, w, h, '#131b26', 7400 + x, true);
      x += w + 1;
    }
  }

  const near = makeBuffer(TILE, VH);
  {
    const n = near.x;
    const rnd = mulberry32(7501);
    let x = -40;
    while (x < TILE + 40) {
      const w = 60 + rnd() * 70, h = 96 + rnd() * 46;
      const y = WALK_Y - h;
      rect(n, x, y, w, h, '#232c38');
      M.brickWall(n, x, y, w, h, 7600 + x, { base: '#2e3844', hi: '#3a4655', dk: '#232a34', mortar: '#1a212a', moss: false });
      rect(n, x, y, w, 2, '#414f60');
      // janelas dos andares de cima
      for (let wy = y + 10; wy < 160; wy += 22) {
        for (let wx = x + 9; wx < x + w - 14; wx += 20) {
          const r = rnd();
          rect(n, wx, wy, 12, 15, r > 0.86 ? '#6a5228' : r > 0.78 ? '#2b3b52' : '#0e131a');
          if (r > 0.86) rect(n, wx + 1, wy + 1, 10, 5, '#8f6c33');
          rect(n, wx - 1, wy - 1, 14, 1, '#3c4756');
        }
      }
      // vitrines, quase todas apagadas
      for (let wx = x + 8; wx < x + w - 16; wx += 22) {
        const lit = rnd() > 0.72;
        rect(n, wx, 180, 14, 24, lit ? '#6a5230' : '#0d1218');
        if (lit) rect(n, wx + 1, 181, 12, 9, '#8f6c38');
        rect(n, wx - 1, 179, 16, 1, '#3a4552');
      }
      // escada de incendio de vez em quando
      if (rnd() > 0.55) M.fireEscape(n, x + 12, y + 46, 40, 7650 + x);
      // beco preto entre predios
      if (rnd() > 0.6) rect(n, x + w - 10, y + 20, 10, h - 20, '#05070a');
      x += w;
    }
    // calcada
    rect(n, 0, WALK_Y, TILE, 7, '#2b2d31');
    rect(n, 0, WALK_Y, TILE, 1, '#3c3f45');
    rect(n, 0, CURB_Y, TILE, 3, '#1b1d20');
    // postes
    for (let px = 40; px < TILE; px += 190) M.streetLampPost(n, px, WALK_Y, 92);
  }

  const road = makeBuffer(TILE, VH);
  {
    const r = road.x;
    M.asphalt(r, 0, CURB_Y + 3, TILE, VH - CURB_Y - 3, 7701);
    rect(r, 0, CURB_Y + 3, TILE, 1, '#3a3d43');
    // faixa central
    for (let x = 8; x < TILE; x += 46) {
      r.globalAlpha = 0.5;
      rect(r, x, 256, 22, 2, '#9a9686');
      r.globalAlpha = 1;
    }
    M.manhole(r, 300, 250);
  }

  const foreStrip = makeBuffer(TILE, VH);
  {
    const f = foreStrip.x;
    rect(f, 0, 0, TILE, 10, '#04060a');
    for (let x = 30; x < TILE; x += 240) {
      rect(f, x, 0, 9, VH, '#05070b');
    }
  }

  // Bloco de destino: a boca do beco. Ele nao esta na fita repetida — e
  // posicionado na hora, para que o carro pare exatamente na frente dele
  // independente de quanto tempo a narracao durou.
  const dest = makeBuffer(360, VH);
  {
    const d = dest.x;
    rect(d, 0, 48, 150, WALK_Y - 48, '#1a222d');
    M.brickWall(d, 0, 48, 150, WALK_Y - 48, 7801, { base: '#252d38', hi: '#2f3947', dk: '#1b222b', mortar: '#151b23', moss: false });
    // a boca do beco
    rect(d, 150, 34, 74, WALK_Y + 7 - 34, '#05070a');
    ditherV(d, 150, 34, 74, 96, '#080b10', '#05070a', 4);
    rect(d, 148, 34, 3, WALK_Y - 34, '#101620');
    rect(d, 222, 34, 3, WALK_Y - 34, '#101620');
    // predio do outro lado da boca
    rect(d, 225, 30, 135, WALK_Y - 30, '#1c242f');
    M.brickWall(d, 225, 30, 135, WALK_Y - 30, 7811, { base: '#252d38', hi: '#2f3947', dk: '#1b222b', mortar: '#151b23', moss: false });
    for (let wx = 236; wx < 350; wx += 26) {
      rect(d, wx, 68, 16, 24, '#0b1016');
      rect(d, wx - 1, 67, 18, 1, '#333d49');
    }
    M.boardedWindow(d, 40, 84, 40, 34, 7821);
    M.trashPile(d, 162, WALK_Y, 7831);
    // calcada continua
    rect(d, 0, WALK_Y, 360, 7, '#2b2d31');
    rect(d, 0, WALK_Y, 360, 1, '#3c3f45');
    rect(d, 0, CURB_Y, 360, 3, '#1b1d20');
    rect(d, 150, WALK_Y, 74, 7, '#232529');
    // dois postes: um na esquina do beco, outro onde o carro para
    M.streetLampPost(d, 268, WALK_Y, 98);
    M.streetLampPost(d, 56, WALK_Y, 94);
  }

  return {
    TILE, WALK_Y, CURB_Y, ROAD_Y,
    sky: sky.c, far: far.c, mid: mid.c, near: near.c,
    road: road.c, fore: foreStrip.c, dest: dest.c, destW: 360,
    destLampX: 288, destLampY: WALK_Y - 98 + 11,
    destLamp2X: 76, destLamp2Y: WALK_Y - 94 + 11,
    destAlleyX: 187,
  };
}
