// journal.js — o caderno.
//
// Referencia: Red Dead Redemption 2 e The Last of Us. Ele anota SOZINHO; o
// jogador nunca digita. Escrever restaura um pouco de sanidade, porque
// escrever e organizar a cabeca — e essa e a unica forma de se recuperar
// ate o cigarro destravar, la no Capitulo 3.
//
// A ideia que sustenta o jogo inteiro esta aqui: conforme a sanidade cai,
// aparecem paginas que ELE NAO ESCREVEU. Letra diferente, mais firme,
// dizendo coisas que ele nao sabia. Elas nao sao comentadas por ninguem.

import { VW, VH, clamp } from '../core/gfx.js';
import { text, wrap } from '../core/text.js';
import { PAL } from '../art/palette.js';
import { input } from '../core/input.js';
import { audio } from '../core/audio.js';
import { t as T, tx, JOURNAL } from '../i18n.js';

const CAT_KEY = {
  clue: 'jr_cat_clue', people: 'jr_cat_people',
  place: 'jr_cat_place', self: 'jr_cat_self', other: 'jr_cat_other',
};

export class Journal {
  constructor() {
    this.pages = [];        // chaves na ordem em que foram anotadas
    this.open = false;
    this.idx = 0;
    this.fade = 0;
    // aviso de "anotado" que aparece no canto sem abrir o caderno
    this.toast = 0;
    this.toastKey = null;
    // animacao de escrita a mao da pagina que esta sendo lida
    this.write = 1;
    this.writeT = 0;
  }

  reset() {
    this.pages.length = 0;
    this.open = false;
    this.idx = 0;
    this.fade = 0;
    this.toast = 0;
  }

  has(key) { return this.pages.indexOf(key) >= 0; }

  // Devolve true se a pagina e nova. Quem chama decide se devolve sanidade —
  // as paginas alheias NAO devolvem nada, pelo contrario.
  add(key) {
    if (!JOURNAL[key] || this.has(key)) return false;
    this.pages.push(key);
    this.toast = 3.2;
    this.toastKey = key;
    audio.writing(0.9);
    return true;
  }

  toggle() {
    if (!this.pages.length) return false;
    this.open = !this.open;
    if (this.open) {
      this.idx = this.pages.length - 1;   // abre na ultima anotacao
      this._startWrite();
      audio.pageTurn(0.8);
    } else audio.uiBack();
    return true;
  }

  _startWrite() {
    const k = this.pages[this.idx];
    const e = JOURNAL[k];
    this.write = 0;
    this.writeT = 0;
    this.total = e ? tx(e).length : 0;
  }

  update(dt) {
    this.fade = clamp(this.fade + (this.open ? dt * 7 : -dt * 8), 0, 1);
    if (this.toast > 0) this.toast -= dt;
    if (!this.open) return;

    if (this.write < 1) {
      this.write = Math.min(1, this.write + dt * (1 / Math.max(0.6, this.total / 34)));
      this.writeT += dt;
      if (this.writeT > 0.07) { this.writeT = 0; audio.writing(0.5); }
    }

    const n = this.pages.length;
    if (input.pressed('menuLeft') || input.pressed('menuUp')) {
      this.idx = (this.idx + n - 1) % n; this._startWrite(); audio.pageTurn(0.7);
    } else if (input.pressed('menuRight') || input.pressed('menuDown')) {
      this.idx = (this.idx + 1) % n; this._startWrite(); audio.pageTurn(0.7);
    }
  }

  // Aviso discreto no canto. Nao para o jogo, nao pede nada.
  drawToast(ctx) {
    if (this.toast <= 0) return;
    const a = clamp(Math.min(this.toast, 3.2 - this.toast + 2.6), 0, 1) * 0.9;
    const e = JOURNAL[this.toastKey];
    const alheia = e && e.alheia;
    text(ctx, T('jr_new'), VW - 14, VH - 44, {
      size: 8, font: 'ui', weight: 'bold', align: 'right', track: 2,
      color: alheia ? PAL.uiAccent : PAL.uiDim, alpha: a, shadow: true,
    });
    text(ctx, 'Q', VW - 14, VH - 34, {
      size: 8, font: 'ui', weight: 'bold', align: 'right', track: 1,
      color: PAL.uiFaint, alpha: a, shadow: true,
    });
  }

  draw(ctx) {
    if (this.fade <= 0) return;
    const a = this.fade;
    const key = this.pages[this.idx];
    const e = JOURNAL[key];
    if (!e) return;

    // fundo: a tela nao apaga, so escurece. O jogo continua atras.
    ctx.save();
    ctx.globalAlpha = a * 0.72;
    ctx.fillStyle = '#05040a';
    ctx.fillRect(0, 0, VW, VH);
    ctx.restore();

    const w = 268, h = 168;
    const x = Math.round((VW - w) / 2), y = Math.round((VH - h) / 2) + 4;

    ctx.save();
    ctx.globalAlpha = a;
    // capa de couro aparecendo nas bordas
    ctx.fillStyle = '#2a1c12';
    ctx.fillRect(x - 5, y - 5, w + 10, h + 10);
    ctx.fillStyle = '#3a2718';
    ctx.fillRect(x - 5, y - 5, w + 10, 2);
    // papel encardido
    ctx.fillStyle = '#c9c1a8';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#bdb49a';
    ctx.fillRect(x, y + h - 6, w, 6);
    // vinco do meio do caderno
    ctx.fillStyle = '#b0a68d';
    ctx.fillRect(x + Math.round(w / 2), y, 1, h);
    // pauta
    ctx.globalAlpha = a * 0.35;
    ctx.fillStyle = '#9a917a';
    for (let ly = y + 34; ly < y + h - 12; ly += 12) ctx.fillRect(x + 12, ly, w - 24, 1);
    ctx.restore();

    // cabecalho: categoria e numero da pagina
    text(ctx, T(CAT_KEY[e.cat] || 'jr_cat_clue'), x + 12, y + 10, {
      size: 8, font: 'ui', weight: 'bold', color: e.alheia ? '#7a2018' : '#5c503c',
      track: 2, alpha: a,
    });
    text(ctx, `${T('jr_page')} ${this.idx + 1}/${this.pages.length}`, x + w - 12, y + 10, {
      size: 8, font: 'ui', color: '#6d6250', align: 'right', track: 1, alpha: a,
    });
    ctx.save();
    ctx.globalAlpha = a * 0.5;
    ctx.fillStyle = '#8b8069';
    ctx.fillRect(x + 12, y + 24, w - 24, 1);
    ctx.restore();

    // O texto aparece letra por letra, como mao escrevendo. Pagina alheia
    // sai em vermelho seco e em caixa alta — a letra e outra, e o jogo nunca
    // diz de quem e.
    const corpo = tx(e);
    const mostrado = corpo.slice(0, Math.ceil(corpo.length * this.write));
    const linhas = wrap(mostrado, w - 28, { size: 11, font: 'serif' });
    for (let i = 0; i < linhas.length; i++) {
      text(ctx, linhas[i], x + 14, y + 36 + i * 12, {
        size: 11, font: 'serif', color: e.alheia ? '#7e211a' : '#2e2620', alpha: a,
      });
    }

    text(ctx, T('jr_hint'), VW / 2, y + h + 12, {
      size: 7, font: 'ui', color: '#5a5249', align: 'center', track: 1, alpha: a, shadow: true,
    });
  }

  save() { return this.pages.slice(); }
  load(arr) {
    this.reset();
    if (Array.isArray(arr)) for (const k of arr) if (JOURNAL[k]) this.pages.push(k);
  }
}
