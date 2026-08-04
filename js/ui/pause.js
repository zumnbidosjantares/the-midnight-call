// pause.js — menu de pausa. E daqui que sai o salvamento padrao do jogo:
// pausou, "SALVAR", escolhe um dos 3 arquivos.

import { VW, VH, clamp } from '../core/gfx.js';
import { text } from '../core/text.js';
import { PAL } from '../art/palette.js';
import { input } from '../core/input.js';
import { audio } from '../core/audio.js';
import { t as T } from '../i18n.js';
import { SlotPicker, OptionsPanel, panelBox, screenDim } from './panels.js';

export class PauseMenu {
  constructor(settings, hooks) {
    this.s = settings;
    this.hooks = hooks;       // { onSave, onLoad, onQuit, onSettings }
    this.active = false;
    this.sel = 0;
    this.anim = 0;
    this.slots = new SlotPicker();
    this.options = new OptionsPanel(settings, hooks.onSettings);
    this.confirmQuit = false;
    this.confirmSel = 1;
    this.items = [
      { k: 'pause_resume', a: 'resume' },
      { k: 'pause_save', a: 'save' },
      { k: 'pause_load', a: 'load' },
      { k: 'pause_options', a: 'options' },
      { k: 'pause_quit', a: 'quit' },
    ];
  }

  open() {
    this.active = true;
    this.sel = 0;
    this.anim = 0;
    this.confirmQuit = false;
    // A mesma tecla abre e fecha a pausa. Sem esta trava, o ESC que abriu
    // ainda esta em pressedFrame quando update() roda no MESMO quadro, e o
    // menu fecha sozinho na hora.
    this.justOpened = true;
    audio.uiConfirm();
  }

  close() {
    this.active = false;
    this.slots.open = false;
    this.options.open = false;
    audio.uiBack();
  }

  get blocking() { return this.slots.open || this.options.open || this.confirmQuit; }

  update(dt) {
    if (!this.active) { this.anim = Math.max(0, this.anim - dt * 8); return; }
    this.anim = Math.min(1, this.anim + dt * 8);
    if (this.justOpened) { this.justOpened = false; return; }

    if (this.slots.open) { this.slots.update(dt); return; }
    if (this.options.open) { this.options.update(dt); return; }

    if (this.confirmQuit) {
      if (input.pressed('menuLeft') || input.pressed('menuRight')) {
        this.confirmSel = this.confirmSel ? 0 : 1; audio.uiMove();
      }
      if (input.pressed('confirm')) {
        audio.uiConfirm();
        const yes = this.confirmSel === 0;
        this.confirmQuit = false;
        if (yes) { this.active = false; this.hooks.onQuit(); }
      } else if (input.pressed('cancel')) { this.confirmQuit = false; audio.uiBack(); }
      return;
    }

    const n = this.items.length;
    if (input.pressed('menuDown')) { this.sel = (this.sel + 1) % n; audio.uiMove(); }
    if (input.pressed('menuUp')) { this.sel = (this.sel + n - 1) % n; audio.uiMove(); }

    if (input.pressed('pause')) { this.close(); return; }

    if (input.pressed('confirm')) {
      const a = this.items[this.sel].a;
      audio.uiConfirm();
      if (a === 'resume') this.close();
      else if (a === 'save') this.slots.show('save', (i, done) => { this.hooks.onSave(i); done(); }, () => {});
      else if (a === 'load') this.slots.show('load', (i) => { this.active = false; this.hooks.onLoad(i); }, () => {});
      else if (a === 'options') this.options.show(() => {});
      else if (a === 'quit') { this.confirmQuit = true; this.confirmSel = 1; }
    }
  }

  draw(ctx) {
    if (this.anim <= 0) return;
    const a = this.anim;
    screenDim(ctx, 0.66 * a);

    const w = 190, h = this.items.length * 20 + 40;
    const x = (VW - w) / 2, y = (VH - h) / 2 - 6;
    panelBox(ctx, x, y, w, h, a);

    text(ctx, T('paused'), VW / 2, y + 10, {
      size: 13, font: 'serif', color: PAL.uiText, align: 'center', track: 4, alpha: a, shadow: true,
    });
    ctx.save();
    ctx.globalAlpha = a * 0.5;
    ctx.fillStyle = PAL.uiFaint;
    ctx.fillRect(x + 28, y + 28, w - 56, 1);
    ctx.restore();

    for (let i = 0; i < this.items.length; i++) {
      const on = i === this.sel;
      const iy = y + 36 + i * 20;
      if (on) {
        ctx.save();
        ctx.globalAlpha = a * 0.20;
        ctx.fillStyle = PAL.uiAccent;
        ctx.fillRect(x + 8, iy - 3, w - 16, 17);
        ctx.restore();
        ctx.fillStyle = PAL.uiAccent;
        ctx.fillRect(x + 8, iy - 3, 2, 17);
      }
      text(ctx, T(this.items[i].k), VW / 2 + (on ? 2 : 0), iy, {
        size: 10, font: 'ui', weight: on ? 'bold' : 'normal', track: 2,
        color: on ? '#e8e0d2' : PAL.uiDim, align: 'center', alpha: a,
      });
    }

    if (this.confirmQuit) {
      screenDim(ctx, 0.5);
      const cw = 280, ch = 62, cx = (VW - cw) / 2, cy = (VH - ch) / 2;
      panelBox(ctx, cx, cy, cw, ch, 1, true);
      text(ctx, T('pause_quit_ask'), VW / 2, cy + 12, {
        size: 9, font: 'ui', color: PAL.uiText, align: 'center',
      });
      const opts = [T('yes'), T('no')];
      for (let i = 0; i < 2; i++) {
        const ox = VW / 2 + (i === 0 ? -52 : 22);
        const on = this.confirmSel === i;
        text(ctx, opts[i], ox, cy + 38, {
          size: 11, font: 'ui', weight: 'bold', track: 2,
          color: on ? PAL.uiAccent : PAL.uiDim,
        });
        if (on) { ctx.fillStyle = PAL.uiAccent; ctx.fillRect(ox - 9, cy + 42, 5, 1); }
      }
    }

    this.slots.draw(ctx);
    this.options.draw(ctx);
  }
}
