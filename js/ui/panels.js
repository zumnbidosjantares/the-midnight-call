// panels.js — pecas de interface usadas pelo menu principal E pela pausa:
// a escolha de arquivo de save e o painel de opcoes.
//
// Uma implementacao so nos dois lugares. Se o desenho da caixa mudar, muda
// nos dois de graca.

import { VW, VH, clamp, lerp, rgba } from '../core/gfx.js';
import { text, measure } from '../core/text.js';
import { PAL } from '../art/palette.js';
import { input } from '../core/input.js';
import { audio } from '../core/audio.js';
import { save, SLOTS, formatPlaytime, formatDate } from '../core/save.js';
import { t as T, getLang, setLang, LANGS } from '../i18n.js';
import { clearTextCache } from '../core/text.js';

export function panelBox(ctx, x, y, w, h, alpha = 1, accent = false) {
  ctx.save();
  ctx.globalAlpha = alpha * 0.93;
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, rgba('#151013', 0.96));
  g.addColorStop(1, rgba('#070608', 0.98));
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = accent ? PAL.uiAccent : PAL.uiBoxEdge;
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y + h - 1, w, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.fillRect(x + w - 1, y, 1, h);
  ctx.restore();
}

export function screenDim(ctx, a) {
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = '#040305';
  ctx.fillRect(0, 0, VW, VH);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// escolha de arquivo
// ---------------------------------------------------------------------------

const ROW_H = 46, ROW_X = 46, ROW_W = VW - 92, ROW_Y0 = 76, ROW_GAP = 8;

export class SlotPicker {
  constructor() {
    this.open = false;
    this.mode = 'load';
    this.sel = 0;
    this.confirm = null;   // 'over' | 'erase'
    this.confirmSel = 1;
    this.thumbs = [null, null, null];
    this.anim = 0;
    this.flash = 0;
  }

  show(mode, onPick, onCancel) {
    this.open = true;
    this.mode = mode;
    this.onPick = onPick;
    this.onCancel = onCancel;
    this.data = save.list();
    this.confirm = null;
    this.anim = 0;
    if (mode === 'load') {
      const r = save.mostRecent();
      this.sel = r >= 0 ? r : 0;
    }
    this._loadThumbs();
  }

  _loadThumbs() {
    for (let i = 0; i < SLOTS; i++) {
      this.thumbs[i] = null;
      const d = this.data[i];
      if (d && d.thumb) {
        const im = new Image();
        im.onload = () => { this.thumbs[i] = im; };
        im.src = d.thumb;
      }
    }
  }

  close() { this.open = false; }

  update(dt) {
    if (!this.open) return;
    this.anim = Math.min(1, this.anim + dt * 7);
    if (this.flash > 0) this.flash -= dt;

    if (this.confirm) {
      if (input.pressed('menuLeft') || input.pressed('menuRight')) {
        this.confirmSel = this.confirmSel ? 0 : 1; audio.uiMove();
      }
      if (input.pressed('confirm')) {
        audio.uiConfirm();
        const yes = this.confirmSel === 0;
        const kind = this.confirm;
        this.confirm = null;
        if (yes && kind === 'erase') {
          save.erase(this.sel);
          this.data = save.list();
          this._loadThumbs();
        } else if (yes && kind === 'over') {
          this._pick();
        }
      } else if (input.pressed('cancel')) {
        this.confirm = null; audio.uiBack();
      }
      return;
    }

    if (input.pressed('menuDown')) { this.sel = (this.sel + 1) % SLOTS; audio.uiMove(); }
    if (input.pressed('menuUp')) { this.sel = (this.sel + SLOTS - 1) % SLOTS; audio.uiMove(); }

    if (input.pressedFrame.has('Delete') && this.data[this.sel]) {
      this.confirm = 'erase'; this.confirmSel = 1; audio.uiMove();
      return;
    }

    if (input.pressed('confirm')) {
      const d = this.data[this.sel];
      if (this.mode === 'load') {
        if (d) { audio.uiConfirm(); this._pick(); }
        else audio.uiBack();
      } else {
        if (d) { this.confirm = 'over'; this.confirmSel = 1; audio.uiMove(); }
        else { audio.uiConfirm(); this._pick(); }
      }
    } else if (input.pressed('cancel')) {
      audio.uiBack();
      this.open = false;
      if (this.onCancel) this.onCancel();
    }
  }

  _pick() {
    const i = this.sel;
    if (this.onPick) this.onPick(i, () => {
      // callback de "salvou" — atualiza a lista sem fechar
      this.data = save.list();
      this._loadThumbs();
      this.flash = 1.4;
    });
    if (this.mode === 'load') this.open = false;
  }

  draw(ctx) {
    if (!this.open) return;
    const a = this.anim;
    screenDim(ctx, 0.90 * a);
    text(ctx, T(this.mode === 'save' ? 'slots_title_save' : 'slots_title_load'), VW / 2, 42, {
      size: 15, font: 'serif', color: PAL.uiText, align: 'center', track: 2, shadow: true, alpha: a,
    });

    for (let i = 0; i < SLOTS; i++) {
      const y = ROW_Y0 + i * (ROW_H + ROW_GAP);
      const on = i === this.sel;
      const ox = on ? 3 : 0;
      panelBox(ctx, ROW_X + ox, y, ROW_W, ROW_H, a, on);

      // miniatura
      const tw = 66, th = 37;
      const tx = ROW_X + ox + 6, ty = y + (ROW_H - th) / 2;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = '#000';
      ctx.fillRect(tx, ty, tw, th);
      if (this.thumbs[i]) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.thumbs[i], tx, ty, tw, th);
      }
      ctx.fillStyle = on ? PAL.uiAccent : '#241d1c';
      ctx.fillRect(tx, ty, tw, 1);
      ctx.fillRect(tx, ty + th - 1, tw, 1);
      ctx.restore();

      const lx = tx + tw + 10;
      const d = this.data[i];
      text(ctx, `${T('slot')} ${i + 1}`, lx, y + 7, {
        size: 9, font: 'ui', weight: 'bold', color: on ? PAL.uiText : PAL.uiDim, track: 2, alpha: a,
      });

      if (d) {
        text(ctx, d.locationName || '—', lx, y + 20, {
          size: 10, font: 'serif', color: on ? '#e0d8c8' : '#8d8478', alpha: a,
        });
        text(ctx, `${T('playtime')} ${formatPlaytime(d.playtime || 0)}`, lx, y + 33, {
          size: 8, font: 'ui', color: PAL.uiFaint, track: 1, alpha: a,
        });
        text(ctx, formatDate(d.savedAt, getLang()), ROW_X + ox + ROW_W - 8, y + 33, {
          size: 8, font: 'ui', color: PAL.uiFaint, align: 'right', track: 1, alpha: a,
        });
      } else {
        text(ctx, T('slot_empty'), lx, y + 21, {
          size: 10, font: 'serif', color: '#4a423a', alpha: a,
        });
      }
    }

    let hint = T('menu_hint');
    if (this.data[this.sel]) hint += '      ' + T('slot_erase');
    text(ctx, hint, VW / 2, VH - 16, {
      size: 8, font: 'ui', color: PAL.uiFaint, align: 'center', track: 2, alpha: a,
    });

    if (this.flash > 0) {
      text(ctx, T('saved'), VW / 2, 58, {
        size: 10, font: 'ui', weight: 'bold', color: PAL.uiAccent, align: 'center',
        track: 3, alpha: clamp(this.flash, 0, 1),
      });
    }

    if (this.confirm) this._drawConfirm(ctx);
  }

  _drawConfirm(ctx) {
    screenDim(ctx, 0.6);
    const w = 260, h = 62, x = (VW - w) / 2, y = (VH - h) / 2;
    panelBox(ctx, x, y, w, h, 1, true);
    text(ctx, T(this.confirm === 'erase' ? 'slot_erase_ask' : 'slot_overwrite'), VW / 2, y + 14, {
      size: 10, font: 'ui', color: PAL.uiText, align: 'center',
    });
    const opts = [T('yes'), T('no')];
    for (let i = 0; i < 2; i++) {
      const ox = VW / 2 + (i === 0 ? -52 : 22);
      const on = this.confirmSel === i;
      text(ctx, opts[i], ox, y + 38, {
        size: 11, font: 'ui', weight: 'bold', track: 2,
        color: on ? PAL.uiAccent : PAL.uiDim,
      });
      if (on) { ctx.fillStyle = PAL.uiAccent; ctx.fillRect(ox - 9, y + 42, 5, 1); }
    }
  }
}

// ---------------------------------------------------------------------------
// opcoes
// ---------------------------------------------------------------------------

export class OptionsPanel {
  constructor(settings, onChange) {
    this.s = settings;
    this.onChange = onChange;
    this.open = false;
    this.sel = 0;
    this.anim = 0;
    this.rows = [
      { key: 'opt_lang', type: 'lang' },
      { key: 'opt_master', type: 'range', f: 'master' },
      { key: 'opt_music', type: 'range', f: 'music' },
      { key: 'opt_sfx', type: 'range', f: 'sfx' },
      { key: 'opt_voice', type: 'range', f: 'voice' },
      { key: 'opt_subs', type: 'bool', f: 'subs' },
      { key: 'opt_scan', type: 'range', f: 'scanlines', max: 0.18 },
      { key: 'opt_grain', type: 'range', f: 'grain', max: 0.06 },
      { key: 'opt_shake', type: 'bool', f: 'shake' },
      { key: 'opt_pixel', type: 'bool', f: 'pixelPerfect' },
    ];
  }

  show(onClose) { this.open = true; this.onClose = onClose; this.anim = 0; this.sel = 0; }

  update(dt) {
    if (!this.open) return;
    this.anim = Math.min(1, this.anim + dt * 7);
    const n = this.rows.length;
    if (input.pressed('menuDown')) { this.sel = (this.sel + 1) % n; audio.uiMove(); }
    if (input.pressed('menuUp')) { this.sel = (this.sel + n - 1) % n; audio.uiMove(); }

    const r = this.rows[this.sel];
    const dir = (input.pressed('menuRight') ? 1 : 0) - (input.pressed('menuLeft') ? 1 : 0);
    if (dir !== 0) {
      if (r.type === 'range') {
        const max = r.max === undefined ? 1 : r.max;
        this.s[r.f] = clamp(+(this.s[r.f] + dir * max / 10).toFixed(3), 0, max);
      } else if (r.type === 'bool') {
        this.s[r.f] = !this.s[r.f];
      } else if (r.type === 'lang') {
        const i = LANGS.indexOf(getLang());
        setLang(LANGS[(i + dir + LANGS.length) % LANGS.length]);
        this.s.lang = getLang();
        clearTextCache();
      }
      audio.uiMove();
      if (this.onChange) this.onChange();
    }

    if (input.pressed('cancel') || (input.pressed('confirm') && r.type === 'bool')) {
      if (input.pressed('confirm')) {
        this.s[r.f] = !this.s[r.f];
        if (this.onChange) this.onChange();
        audio.uiConfirm();
      } else {
        audio.uiBack();
        this.open = false;
        if (this.onClose) this.onClose();
      }
    }
  }

  draw(ctx) {
    if (!this.open) return;
    const a = this.anim;
    screenDim(ctx, 0.90 * a);
    text(ctx, T('opt_title'), VW / 2, 26, {
      size: 15, font: 'serif', color: PAL.uiText, align: 'center', track: 2, shadow: true, alpha: a,
    });

    const x = 88, w = 304;
    const y0 = 54, rh = 18;
    panelBox(ctx, x - 14, y0 - 8, w + 28, this.rows.length * rh + 16, a);

    for (let i = 0; i < this.rows.length; i++) {
      const r = this.rows[i];
      const y = y0 + i * rh;
      const on = i === this.sel;
      if (on) {
        ctx.save();
        ctx.globalAlpha = a * 0.22;
        ctx.fillStyle = PAL.uiAccent;
        ctx.fillRect(x - 10, y - 2, w + 20, rh - 2);
        ctx.restore();
        ctx.fillStyle = PAL.uiAccent;
        ctx.fillRect(x - 10, y - 2, 2, rh - 2);
      }
      text(ctx, T(r.key), x, y, {
        size: 9, font: 'ui', weight: on ? 'bold' : 'normal',
        color: on ? PAL.uiText : PAL.uiDim, track: 1, alpha: a,
      });

      const vx = x + w - 4;
      if (r.type === 'lang') {
        text(ctx, getLang() === 'pt' ? 'PORTUGUES' : 'ENGLISH', vx, y, {
          size: 9, font: 'ui', weight: 'bold', color: on ? PAL.uiAccent : PAL.uiDim,
          align: 'right', track: 1, alpha: a,
        });
      } else if (r.type === 'bool') {
        text(ctx, this.s[r.f] ? T('on') : T('off'), vx, y, {
          size: 9, font: 'ui', weight: 'bold',
          color: this.s[r.f] ? (on ? PAL.uiAccent : PAL.uiText) : PAL.uiFaint,
          align: 'right', track: 1, alpha: a,
        });
      } else {
        const max = r.max === undefined ? 1 : r.max;
        const k = clamp(this.s[r.f] / max, 0, 1);
        const bw = 78, bx = vx - bw;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = '#241d1c';
        ctx.fillRect(bx, y + 3, bw, 4);
        ctx.fillStyle = on ? PAL.uiAccent : '#5c534a';
        ctx.fillRect(bx, y + 3, Math.round(bw * k), 4);
        ctx.restore();
      }
    }

    text(ctx, T('menu_hint'), VW / 2, VH - 16, {
      size: 8, font: 'ui', color: PAL.uiFaint, align: 'center', track: 2, alpha: a,
    });
  }
}
