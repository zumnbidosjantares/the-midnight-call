// fx.js — chuva, neblina, particulas.
//
// Tudo aqui e barato de proposito: sao centenas de retangulos de 1px por
// frame, nao sprites. A chuva e o que mais vende a atmosfera do jogo, entao
// ela tem tres camadas com velocidade e brilho diferentes (profundidade).

import { VW, VH, rgba, clamp } from '../core/gfx.js';

export class Rain {
  constructor(opts = {}) {
    this.drops = [];
    this.splashes = [];
    this.count = opts.count || 220;
    this.wind = opts.wind === undefined ? -34 : opts.wind;
    this.groundY = opts.groundY || VH - 30;
    this.color = opts.color || '#9fc0e8';
    this.intensity = opts.intensity === undefined ? 1 : opts.intensity;
    this.on = true;
    for (let i = 0; i < this.count; i++) this.drops.push(this._mk(true));
  }

  _mk(spread) {
    const layer = Math.random();
    const depth = 0.45 + layer * 0.85;
    return {
      x: Math.random() * (VW + 220) - 110,
      y: spread ? Math.random() * (VH + 60) - 30 : -Math.random() * 40 - 4,
      v: (150 + Math.random() * 130) * depth,
      len: 4 + Math.random() * 8 * depth,
      a: 0.10 + layer * 0.30,
      d: depth,
    };
  }

  update(dt, camX) {
    if (!this.on) { this.splashes.length = 0; return; }
    const n = Math.floor(this.count * this.intensity);
    while (this.drops.length < n) this.drops.push(this._mk(false));
    while (this.drops.length > n) this.drops.pop();

    for (const p of this.drops) {
      p.y += p.v * dt;
      p.x += this.wind * p.d * dt;
      if (p.y > this.groundY) {
        if (Math.random() < 0.30) {
          this.splashes.push({ x: p.x, y: this.groundY, life: 0.24, r: 0, a: p.a * 1.9, d: p.d });
        }
        Object.assign(p, this._mk(false));
        p.x = Math.random() * (VW + 220) - 110;
      } else if (p.x < -120) p.x += VW + 240;
      else if (p.x > VW + 120) p.x -= VW + 240;
    }

    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const s = this.splashes[i];
      s.life -= dt;
      s.r += dt * 26;
      if (s.life <= 0) this.splashes.splice(i, 1);
    }
  }

  draw(ctx) {
    if (!this.on) return;
    ctx.save();
    for (const p of this.drops) {
      ctx.globalAlpha = p.a;
      ctx.fillStyle = this.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, Math.round(p.len));
    }
    for (const s of this.splashes) {
      ctx.globalAlpha = clamp(s.a * (s.life / 0.24), 0, 1) * 0.7;
      ctx.fillStyle = this.color;
      const r = Math.round(s.r);
      ctx.fillRect(Math.round(s.x - r), Math.round(s.y), 1, 1);
      ctx.fillRect(Math.round(s.x + r), Math.round(s.y), 1, 1);
    }
    ctx.restore();
  }
}

export class Fog {
  constructor(opts = {}) {
    this.banks = [];
    this.color = opts.color || '#3a4658';
    this.alpha = opts.alpha === undefined ? 0.16 : opts.alpha;
    this.y = opts.y || VH - 60;
    const n = opts.count || 6;
    for (let i = 0; i < n; i++) {
      this.banks.push({
        x: Math.random() * (VW + 200) - 100,
        y: this.y + Math.random() * 34 - 12,
        w: 90 + Math.random() * 150,
        h: 16 + Math.random() * 26,
        v: 3 + Math.random() * 8,
        a: 0.4 + Math.random() * 0.6,
        ph: Math.random() * 6.28,
      });
    }
  }

  update(dt, t) {
    for (const b of this.banks) {
      b.x += b.v * dt;
      if (b.x - b.w > VW + 60) b.x = -b.w - 40;
      b.yy = b.y + Math.sin(t * 0.3 + b.ph) * 3;
    }
  }

  draw(ctx) {
    ctx.save();
    for (const b of this.banks) {
      const g = ctx.createRadialGradient(b.x, b.yy || b.y, 0, b.x, b.yy || b.y, b.w / 2);
      g.addColorStop(0, rgba(this.color, this.alpha * b.a));
      g.addColorStop(1, rgba(this.color, 0));
      ctx.fillStyle = g;
      ctx.fillRect(b.x - b.w / 2, (b.yy || b.y) - b.h, b.w, b.h * 2);
    }
    ctx.restore();
  }
}

// Sistema de particulas de uso geral: fumaca do cigarro, poeira, faisca,
// respingo, cinza. Cada particula e um pixel (ou 2x2) com vida propria.
export class Particles {
  constructor(max = 420) {
    this.list = [];
    this.max = max;
  }

  spawn(o) {
    if (this.list.length >= this.max) this.list.shift();
    this.list.push({
      x: o.x, y: o.y,
      vx: o.vx || 0, vy: o.vy || 0,
      ax: o.ax || 0, ay: o.ay || 0,
      life: o.life || 1, max: o.life || 1,
      size: o.size || 1,
      color: o.color || '#ffffff',
      a: o.a === undefined ? 1 : o.a,
      fade: o.fade === undefined ? 1 : o.fade,
      drag: o.drag === undefined ? 0 : o.drag,
      glow: o.glow || false,
      wobble: o.wobble || 0,
      ph: Math.random() * 6.28,
      grow: o.grow || 0,
    });
  }

  burst(n, o) { for (let i = 0; i < n; i++) this.spawn(typeof o === 'function' ? o(i) : o); }

  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.life -= dt;
      if (p.life <= 0) { this.list.splice(i, 1); continue; }
      p.vx += p.ax * dt; p.vy += p.ay * dt;
      if (p.drag) { p.vx -= p.vx * p.drag * dt; p.vy -= p.vy * p.drag * dt; }
      p.x += p.vx * dt + (p.wobble ? Math.sin(p.ph + p.life * 3) * p.wobble * dt : 0);
      p.y += p.vy * dt;
      if (p.grow) p.size += p.grow * dt;
    }
  }

  draw(ctx, camX, camY) {
    ctx.save();
    for (const p of this.list) {
      const k = p.life / p.max;
      ctx.globalAlpha = clamp(p.a * Math.pow(k, p.fade), 0, 1);
      ctx.globalCompositeOperation = p.glow ? 'lighter' : 'source-over';
      ctx.fillStyle = p.color;
      const s = Math.max(1, Math.round(p.size));
      ctx.fillRect(Math.round(p.x - camX), Math.round(p.y - camY), s, s);
    }
    ctx.restore();
  }

  clear() { this.list.length = 0; }
}

// Poeira suspensa em interiores. Anda devagar, brilha so quando cruza luz.
export class DustMotes {
  constructor(n = 60) {
    this.m = [];
    for (let i = 0; i < n; i++) {
      this.m.push({
        x: Math.random() * VW, y: Math.random() * VH,
        vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 3.5 - 1.2,
        a: 0.06 + Math.random() * 0.20, ph: Math.random() * 6.28,
      });
    }
  }

  update(dt, t) {
    for (const p of this.m) {
      p.x += p.vx * dt + Math.sin(t * 0.5 + p.ph) * 3 * dt;
      p.y += p.vy * dt;
      if (p.y < -4) { p.y = VH + 4; p.x = Math.random() * VW; }
      if (p.y > VH + 4) p.y = -4;
      if (p.x < -4) p.x = VW + 4;
      if (p.x > VW + 4) p.x = -4;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = '#cfd8e8';
    for (const p of this.m) {
      ctx.globalAlpha = p.a * (0.6 + 0.4 * Math.sin(p.ph * 3 + p.x * 0.05));
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
    }
    ctx.restore();
  }
}
