// camera.js — camera lateral.
//
// Comportamento pensado para jogo de terror: ela demora a alcancar o
// personagem e olha um pouco a frente do movimento. Isso deixa o cenario
// "chegando" antes dele, que e exatamente a sensacao que o jogo quer.

import { VW, VH, clamp, lerp } from '../core/gfx.js';

export class Camera {
  constructor() {
    this.x = 0; this.y = 0;
    this.targetX = 0; this.targetY = 0;
    this.minX = 0; this.maxX = 0;
    this.lookAhead = 46;
    this.smooth = 4.2;
    this.deadzone = 10;
    this.offsetY = 0;
    this.free = false;      // modo de teste: setas movem a camera
    this.zoom = 1;
  }

  setBounds(minX, maxX) {
    this.minX = minX;
    this.maxX = Math.max(minX, maxX - VW);
  }

  snapTo(x, y) {
    this.targetX = x - VW / 2;
    this.x = clamp(this.targetX, this.minX, this.maxX);
    this.y = y || 0;
  }

  follow(px, py, facing, dt, moving) {
    if (this.free) return;
    const ahead = moving ? this.lookAhead * facing : this.lookAhead * 0.25 * facing;
    let want = px + ahead - VW / 2;
    want = clamp(want, this.minX, this.maxX);
    const d = want - this.x;
    if (Math.abs(d) > this.deadzone || !moving) {
      this.x = lerp(this.x, want, 1 - Math.exp(-this.smooth * dt));
    }
    const wantY = clamp((py || 0) - VH * 0.62, -40, 40) + this.offsetY;
    this.y = lerp(this.y, wantY, 1 - Math.exp(-2.4 * dt));
  }

  // arredondar aqui evita que o cenario inteiro trema em subpixel
  get ix() { return Math.round(this.x); }
  get iy() { return Math.round(this.y); }

  visible(x, w) {
    return x + w > this.x - 8 && x < this.x + VW + 8;
  }
}
