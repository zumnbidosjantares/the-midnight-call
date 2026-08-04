// inventory.js — o inventario E O SOBRETUDO dele.
//
// A tela mostra o casaco aberto, visto por dentro, como se ele estivesse
// segurando as abas. Os bolsos sao os espacos. Cada item ocupa um formato,
// o espaco e limitado, e o jogador organiza como quiser.
//
// DUAS REGRAS QUE VALEM MAIS QUE O SISTEMA:
//
//  1. Abrir NAO pausa o jogo. E enquanto esta aberto, o casaco tapa parte
//     da tela — voce fica cego para o que esta atras dele. Mexer na mochila
//     no meio do galpao tem que custar alguma coisa.
//
//  2. O porrete nao cabe em bolso nenhum. Ele fica na MAO ou fica para
//     tras. E isso que transforma achar a pistola numa decisao de verdade.

import { VW, VH, gfx, clamp } from '../core/gfx.js';
import { text } from '../core/text.js';
import { PAL } from '../art/palette.js';
import { input } from '../core/input.js';
import { audio } from '../core/audio.js';
import { t as T } from '../i18n.js';

const CELL = 13;

// zonas do casaco: bolso interno esquerdo, direito, peito e cinto
const ZONES = [
  { id: 'pl', w: 3, h: 4, x: 0, y: 0, label: 'inv_pocket_l' },
  { id: 'pr', w: 3, h: 4, x: 0, y: 0, label: 'inv_pocket_r' },
  { id: 'ch', w: 2, h: 2, x: 0, y: 0, label: 'inv_chest' },
  { id: 'bt', w: 5, h: 1, x: 0, y: 0, label: 'inv_belt' },
];

// Formato de cada item, e como ele e desenhado. Nada aqui e sprite: sao
// quatro ou cinco retangulos, que a esta escala e mais legivel do que
// pixel art detalhada dentro de uma celula de 13px.
export const ITEMS = {
  ammo:    { w: 2, h: 2, name: 'it_ammo',    desc: 'it_ammo_d',    color: '#5d4a2c', edge: '#8a6a38' },
  cigs:    { w: 1, h: 1, name: 'it_cigs',    desc: 'it_cigs_d',    color: '#8d3128', edge: '#c0c0b4' },
  lighter: { w: 1, h: 1, name: 'it_lighter', desc: 'it_lighter_d', color: '#4a4a52', edge: '#b09258' },
  gun:     { w: 2, h: 1, name: 'it_gun',     desc: 'it_gun_d',     color: '#3f444b', edge: '#727880' },
  map:     { w: 2, h: 1, name: 'it_map',     desc: 'it_map_d',     color: '#8f8770', edge: '#5e5848' },
  note:    { w: 1, h: 1, name: 'it_note',    desc: 'it_note_d',    color: '#b3ac97', edge: '#8b1a14' },
};

export class Inventory {
  constructor() {
    this.items = [];        // { key, zone, cx, cy, rot }
    this.hand = null;       // 'club' — o que nao cabe em bolso nenhum
    this.clubHp = 1;        // 1 = inteira, 0 = quebrou
    this.open = false;
    this.fade = 0;
    this.drag = null;
    this.hover = null;
    this.toast = 0;
    this.toastKey = null;
    this.onUse = null;
    this._layout();
  }

  reset() {
    this.items.length = 0;
    this.hand = null;
    this.clubHp = 1;
    this.open = false;
    this.fade = 0;
    this.drag = null;
    this.toast = 0;
  }

  // Posicao das zonas na tela. Calculada uma vez; o casaco nao se mexe.
  _layout() {
    // Cada bolso fica dentro da aba do casaco a que ele pertence, e o cinto
    // atravessa o meio la embaixo — porque cinto atravessa o meio. Na
    // primeira versao o cinto cortava o vao central e a tela parecia um
    // painel flutuando, nao um casaco aberto.
    const cx = VW / 2;
    const z = this._z = {};
    for (const Z of ZONES) z[Z.id] = Object.assign({}, Z);
    z.pl.x = Math.round(cx - 100); z.pl.y = 62;
    z.ch.x = Math.round(cx - 100); z.ch.y = 128;
    z.pr.x = Math.round(cx + 61);  z.pr.y = 62;
    z.bt.x = Math.round(cx - 33);  z.bt.y = 196;
  }

  has(key) { return this.items.some(i => i.key === key); }
  count(key) { return this.items.filter(i => i.key === key).length; }

  // Procura o primeiro lugar onde o item cabe, testando tambem de lado.
  // Se nao couber em canto nenhum, devolve false e quem chamou avisa o
  // jogador — ficar sem espaco e uma resposta valida, nao um erro.
  add(key) {
    const d = ITEMS[key];
    if (!d) return false;
    for (const Z of [this._z.bt, this._z.pl, this._z.pr, this._z.ch]) {
      for (let rot = 0; rot < 2; rot++) {
        const w = rot ? d.h : d.w, h = rot ? d.w : d.h;
        if (w > Z.w || h > Z.h) continue;
        for (let y = 0; y <= Z.h - h; y++) {
          for (let x = 0; x <= Z.w - w; x++) {
            if (this._livre(Z.id, x, y, w, h, null)) {
              this.items.push({ key, zone: Z.id, cx: x, cy: y, rot });
              this.toast = 2.6; this.toastKey = key;
              audio.leather(0.5);
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  remove(key) {
    const i = this.items.findIndex(it => it.key === key);
    if (i < 0) return false;
    this.items.splice(i, 1);
    return true;
  }

  _size(it) {
    const d = ITEMS[it.key];
    return it.rot ? { w: d.h, h: d.w } : { w: d.w, h: d.h };
  }

  _livre(zone, x, y, w, h, ignorar) {
    for (const it of this.items) {
      if (it === ignorar || it.zone !== zone) continue;
      const s = this._size(it);
      if (x < it.cx + s.w && x + w > it.cx && y < it.cy + s.h && y + h > it.cy) return false;
    }
    return true;
  }

  toggle() {
    this.open = !this.open;
    this.drag = null;
    audio.leather(this.open ? 0.8 : 0.5);
    return this.open;
  }

  update(dt) {
    this.fade = clamp(this.fade + (this.open ? dt * 8 : -dt * 9), 0, 1);
    if (this.toast > 0) this.toast -= dt;
    if (!this.open) { this.drag = null; return; }

    // Se o mouse ainda nao se moveu nesta sessao, comeca no meio da tela
    // em vez de no canto — abrir o casaco e nao achar o cursor era metade
    // do problema.
    if (input.mouse.cx === undefined) {
      const r = gfx.out ? gfx.out.getBoundingClientRect() : null;
      if (r) { input.mouse.cx = r.left + r.width / 2; input.mouse.cy = r.top + r.height / 2; }
    }
    const m = gfx.toVirtual(input.mouse.cx || 0, input.mouse.cy || 0);
    this.mx = clamp(m.x, 0, VW); this.my = clamp(m.y, 0, VH);
    this.hover = this._itemEm(this.mx, this.my);

    if (input.mouse.pressed && !this.drag && this.hover) {
      this.drag = this.hover;
      this.dragDX = m.x - this._telaX(this.drag);
      this.dragDY = m.y - this._telaY(this.drag);
      audio.uiMove();
    }
    // Usar o item com o cursor em cima dele. E assim que o jogador tenta
    // fumar — e e assim que ele descobre, tentativa apos tentativa, que a
    // recusa esta mudando.
    if (this.hover && !this.drag && input.pressed('interact') && this.onUse) {
      this.onUse(this.hover.key);
    }
    if (this.drag && input.pressedFrame.has('KeyR')) {
      const d = ITEMS[this.drag.key];
      if (d.w !== d.h) { this.drag.rot = this.drag.rot ? 0 : 1; audio.uiMove(); }
    }
    if (this.drag && !input.mouse.down) this._soltar(m.x, m.y);
  }

  _soltar(mx, my) {
    const it = this.drag;
    this.drag = null;
    const s = this._size(it);
    // solta pelo canto superior esquerdo do item, nao pelo cursor: pegar
    // pelo meio e soltar pelo meio e o que a mao espera
    const px = mx - this.dragDX, py = my - this.dragDY;
    for (const Z of Object.values(this._z)) {
      const gx = Math.round((px - Z.x) / CELL);
      const gy = Math.round((py - Z.y) / CELL);
      if (gx < 0 || gy < 0 || gx + s.w > Z.w || gy + s.h > Z.h) continue;
      if (!this._livre(Z.id, gx, gy, s.w, s.h, it)) continue;
      it.zone = Z.id; it.cx = gx; it.cy = gy;
      audio.leather(0.4);
      return;
    }
    audio.uiBack();   // nao coube: volta para onde estava
  }

  _telaX(it) { return this._z[it.zone].x + it.cx * CELL; }
  _telaY(it) { return this._z[it.zone].y + it.cy * CELL; }

  _itemEm(x, y) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i], s = this._size(it);
      const ix = this._telaX(it), iy = this._telaY(it);
      if (x >= ix && x < ix + s.w * CELL && y >= iy && y < iy + s.h * CELL) return it;
    }
    return null;
  }

  // Aviso curto no canto quando alguma coisa entra no casaco.
  drawToast(ctx) {
    if (this.toast <= 0 || this.open) return;
    const a = clamp(Math.min(this.toast, 2.6 - this.toast + 2.0), 0, 1) * 0.9;
    const d = ITEMS[this.toastKey];
    if (!d) return;
    text(ctx, T('inv_got') + '  ' + T(d.name), VW - 14, VH - 56, {
      size: 8, font: 'ui', weight: 'bold', align: 'right', track: 1,
      color: PAL.uiDim, alpha: a, shadow: true,
    });
  }

  draw(ctx) {
    if (this.fade <= 0) return;
    const a = this.fade;

    // O casaco tapa a tela. Nao e um painel flutuando: e pano na sua frente.
    ctx.save();
    ctx.globalAlpha = a * 0.55;
    ctx.fillStyle = '#05040a';
    ctx.fillRect(0, 0, VW, VH);
    ctx.restore();

    const cx = VW / 2;
    ctx.save();
    ctx.globalAlpha = a;
    // forro do casaco — duas abas grandes, uma de cada lado
    // Forro do casaco, MUITO mais escuro do que o casaco por fora: e o
    // avesso do pano, e nao pode competir com os itens em cima dele.
    for (const s of [-1, 1]) {
      const x0 = cx + s * 12;
      const px = Math.min(x0, x0 + s * 128);
      ctx.fillStyle = '#2b1d12';
      ctx.fillRect(px, 44, 128, 190);
      ctx.fillStyle = '#332315';
      ctx.fillRect(px, 44, 128, 3);
      // costura da lapela, virada para dentro
      ctx.fillStyle = '#5c4128';
      ctx.fillRect(x0 - (s < 0 ? 3 : 0), 44, 3, 190);
    }
    // vao do meio: o corpo dele por tras do casaco
    ctx.fillStyle = '#120c08';
    ctx.fillRect(cx - 12, 44, 24, 190);
    ctx.fillStyle = PAL.tieDk;
    ctx.fillRect(cx - 3, 48, 6, 34);
    ctx.restore();

    text(ctx, T('inv_title'), cx, 30, {
      size: 11, font: 'serif', color: PAL.uiText, align: 'center', track: 3, alpha: a, shadow: true,
    });

    for (const Z of Object.values(this._z)) this._drawZona(ctx, Z, a);
    for (const it of this.items) if (it !== this.drag) this._drawItem(ctx, it, a, this._telaX(it), this._telaY(it));

    // a mao: o que nao cabe em bolso nenhum
    this._drawMao(ctx, a);

    if (this.drag) {
      this._drawItem(ctx, this.drag, a * 0.9, this.mx - this.dragDX, this.my - this.dragDY, true);
    } else if (this.hover) {
      const d = ITEMS[this.hover.key];
      text(ctx, T(d.name), cx, VH - 40, {
        size: 9, font: 'ui', weight: 'bold', color: PAL.uiAccent, align: 'center', track: 1, alpha: a,
      });
      text(ctx, T(d.desc), cx, VH - 28, {
        size: 8, font: 'ui', color: PAL.uiDim, align: 'center', alpha: a,
      });
    }

    text(ctx, T('inv_hint'), cx, VH - 14, {
      size: 7, font: 'type', weight: 'bold', color: '#6a6156',
      align: 'center', track: 1, alpha: a, shadow: true,
    });

    // O CURSOR. A pagina esconde o ponteiro do sistema (`cursor: none`, para
    // o jogo nao ter uma seta branca de escritorio no meio do terror), e o
    // resultado era um inventario de arrastar em que ninguem via o que
    // estava arrastando. Este e desenhado dentro do jogo, no mesmo pixel
    // que todo o resto.
    if (this.mx !== undefined) this._cursor(ctx, this.mx, this.my, a);
  }

  _cursor(ctx, x, y, a) {
    x = Math.round(x); y = Math.round(y);
    ctx.save();
    ctx.globalAlpha = a;
    // sombra dura por baixo, para o cursor nunca sumir num fundo claro
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 8; i++) ctx.fillRect(x + 1, y + 1 + i, Math.max(1, 6 - i), 1);
    ctx.fillStyle = this.drag ? PAL.uiAccent : '#e8e0d2';
    for (let i = 0; i < 8; i++) ctx.fillRect(x, y + i, Math.max(1, 6 - i), 1);
    ctx.fillStyle = '#3a332c';
    ctx.fillRect(x, y, 1, 8);
    ctx.restore();
  }

  _drawZona(ctx, Z, a) {
    ctx.save();
    ctx.globalAlpha = a;
    const w = Z.w * CELL, h = Z.h * CELL;
    ctx.fillStyle = '#1d130c';
    ctx.fillRect(Z.x - 2, Z.y - 2, w + 4, h + 4);
    ctx.fillStyle = '#120c07';
    ctx.fillRect(Z.x, Z.y, w, h);
    // costura pontilhada em volta do bolso
    ctx.fillStyle = '#5a4028';
    for (let x = 0; x < w + 4; x += 3) {
      ctx.fillRect(Z.x - 2 + x, Z.y - 2, 2, 1);
      ctx.fillRect(Z.x - 2 + x, Z.y + h + 1, 2, 1);
    }
    for (let y = 0; y < h + 4; y += 3) {
      ctx.fillRect(Z.x - 2, Z.y - 2 + y, 1, 2);
      ctx.fillRect(Z.x + w + 1, Z.y - 2 + y, 1, 2);
    }
    // grade
    ctx.globalAlpha = a * 0.35;
    ctx.fillStyle = '#2e2118';
    for (let i = 1; i < Z.w; i++) ctx.fillRect(Z.x + i * CELL, Z.y, 1, h);
    for (let j = 1; j < Z.h; j++) ctx.fillRect(Z.x, Z.y + j * CELL, w, 1);
    ctx.restore();
    text(ctx, T(Z.label), Z.x, Z.y - 10, {
      size: 6, font: 'ui', color: PAL.uiFaint, track: 1, alpha: a * 0.85,
    });
  }

  _drawItem(ctx, it, a, x, y, levantado) {
    const d = ITEMS[it.key], s = this._size(it);
    const w = s.w * CELL, h = s.h * CELL;
    x = Math.round(x); y = Math.round(y);
    ctx.save();
    ctx.globalAlpha = a;
    if (levantado) { ctx.globalAlpha = a * 0.4; ctx.fillStyle = '#000'; ctx.fillRect(x + 2, y + 2, w, h); ctx.globalAlpha = a; }
    ctx.fillStyle = d.color;
    ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
    ctx.fillStyle = d.edge;
    ctx.fillRect(x + 1, y + 1, w - 2, 1);
    ctx.fillRect(x + 1, y + 1, 1, h - 2);
    ctx.fillStyle = '#08060a';
    ctx.fillRect(x + 1, y + h - 2, w - 2, 1);
    ctx.fillRect(x + w - 2, y + 1, 1, h - 2);
    // uma marca por item, so para nao serem todos o mesmo tijolo
    ctx.fillStyle = d.edge;
    if (it.key === 'ammo') for (let i = 0; i < 4; i++) ctx.fillRect(x + 4 + (i % 2) * 8, y + 5 + ((i / 2) | 0) * 9, 3, 5);
    else if (it.key === 'gun') ctx.fillRect(x + 3, y + h / 2 - 1, w - 9, 2);
    else if (it.key === 'map') for (let i = 0; i < 3; i++) ctx.fillRect(x + 3, y + 4 + i * 3, w - 6, 1);
    else if (it.key === 'cigs') ctx.fillRect(x + 3, y + 3, w - 6, 3);
    else if (it.key === 'note') ctx.fillRect(x + w - 5, y + h - 5, 3, 3);
    else ctx.fillRect(x + 4, y + 3, w - 8, 2);
    ctx.restore();
  }

  // O porrete. Fica de fora dos bolsos de proposito, e a barra embaixo dele
  // e o quanto de madeira ainda sobrou.
  _drawMao(ctx, a) {
    const x = 26, y = 110;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = '#120c07';
    ctx.fillRect(x - 2, y - 2, CELL + 4, CELL * 4 + 4);
    ctx.fillStyle = '#5a4028';
    ctx.fillRect(x - 2, y - 2, CELL + 4, 1);
    ctx.fillRect(x - 2, y + CELL * 4 + 1, CELL + 4, 1);
    if (this.hand === 'club') {
      ctx.fillStyle = PAL.wood;
      ctx.fillRect(x + 3, y + 2, 7, CELL * 4 - 6);
      ctx.fillStyle = PAL.woodHi;
      ctx.fillRect(x + 4, y + 2, 2, CELL * 4 - 6);
      ctx.fillStyle = '#8f959e';
      ctx.fillRect(x + 6, y + CELL * 4 - 6, 1, 4);
      // quanto de ripa ainda sobrou
      ctx.fillStyle = '#2a2320';
      ctx.fillRect(x, y + CELL * 4 + 5, CELL, 2);
      ctx.fillStyle = this.clubHp > 0.35 ? '#7a5a30' : PAL.uiAccent;
      ctx.fillRect(x, y + CELL * 4 + 5, Math.round(CELL * clamp(this.clubHp, 0, 1)), 2);
    }
    ctx.restore();
    text(ctx, this.hand === 'club' ? T('it_club') : '—', x + CELL / 2, y - 12, {
      size: 7, font: 'ui', color: this.hand ? PAL.uiDim : PAL.uiFaint,
      align: 'center', track: 1, alpha: a,
    });
  }

  save() {
    return { items: this.items.map(i => ({ k: i.key, z: i.zone, x: i.cx, y: i.cy, r: i.rot })),
             hand: this.hand, hp: this.clubHp };
  }

  load(d) {
    this.reset();
    if (!d) return;
    for (const i of (d.items || [])) {
      if (ITEMS[i.k]) this.items.push({ key: i.k, zone: i.z, cx: i.x, cy: i.y, rot: i.r });
    }
    this.hand = d.hand || null;
    this.clubHp = typeof d.hp === 'number' ? d.hp : 1;
  }
}
