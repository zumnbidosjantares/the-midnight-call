// player.js — o detetive controlavel.
//
// So existe eixo X: andar, correr, socar, interagir. E de proposito — o
// jogo e um corredor lateral e a tensao vem de nao poder desviar.
//
// A regra de ouro do controle: o jogador nunca fica preso numa animacao
// sem saber por que. Soco e interacao travam o movimento por menos de meio
// segundo; a animacao do cigarro e cancelada por QUALQUER tecla.

import { Detective } from '../art/detective.js';
import { clamp } from '../core/gfx.js';
import { input } from '../core/input.js';
import { audio } from '../core/audio.js';

const ACC = 620;
const FRICTION = 1000;
const SPEED_WALK = 48;
const SPEED_RUN = 104;
const IDLE_TO_SMOKE = 7.0;

export class Player {
  constructor(fx) {
    this.det = new Detective();
    this.fx = fx;
    this.x = 100; this.y = 214;
    this.vx = 0;
    this.facing = 1;
    this.state = 'idle';
    this.idleTime = 0;
    this.lockTime = 0;
    this.comboWindow = 0;
    this.comboNext = false;
    this.wet = true;
    this.onInteract = null;
    this.onAnimEvent = null;
    this.controllable = true;
    this.floatText = null;
    this.det.onEvent = (ev) => this._animEvent(ev);
  }

  spawn(x, facing, y) {
    this.x = x; this.facing = facing || 1;
    if (y !== undefined) this.y = y;
    this.vx = 0;
    this.state = 'idle';
    this.idleTime = 0;
    this.lockTime = 0;
    this.det.facing = this.facing;
    this.det.flipT = 1;
    this.det.play('idle', { restart: true, blend: 0 });
  }

  _animEvent(ev) {
    switch (ev) {
      case 'step': {
        const running = this.state === 'run';
        audio.step(this.wet, running ? 1.15 : 0.85);
        if (this.wet && this.fx) {
          const bx = this.x - this.facing * 4;
          this.fx.burst(4 + (running ? 4 : 0), () => ({
            x: bx + (Math.random() - 0.5) * 6, y: this.y - 1,
            vx: (Math.random() - 0.5) * 46 - this.facing * 18,
            vy: -24 - Math.random() * 34, ay: 210,
            life: 0.24 + Math.random() * 0.18, size: 1,
            color: '#7f9cc4', a: 0.5, fade: 1.4,
          }));
        }
        break;
      }
      case 'whoosh': audio.whoosh(1); break;
      case 'hit': audio.punchHit(0.7); break;
      case 'lighter_flick': audio.lighterFlick(); break;
      case 'flame_on': audio.flameWhoosh(0.8); break;
      case 'say_not_today':
        // A unica fala do jogo que nao passa pela caixa de dialogo: sai
        // curta, em cima da cabeca, e ninguem responde.
        this.floatText = { key: 'not_today', t: 0, dur: 2.6 };
        break;
      case 'cig_toss':
        if (this.fx) {
          this.fx.spawn({
            x: this.x + this.facing * 12, y: this.y - 42,
            vx: this.facing * 60 + 10, vy: -30, ay: 260,
            life: 1.6, size: 1, color: '#ded6c4', a: 0.9, fade: 0.4,
          });
        }
        break;
      case 'sigh': audio.blip(0.4); break;
    }
    if (this.onAnimEvent) this.onAnimEvent(ev);
  }

  cancelIdleAnim() {
    if (this.state === 'smoke') {
      this.state = 'idle';
      this.idleTime = 0;
      this.floatText = null;
      this.det.play('idle', { blend: 0.22 });
    }
  }

  update(dt, level, allow = true) {
    const d = this.det;
    const canAct = allow && this.controllable;

    if (this.lockTime > 0) this.lockTime -= dt;
    if (this.comboWindow > 0) this.comboWindow -= dt;

    let ax = 0;
    const wantRun = input.isDown('run');
    const dir = canAct && this.lockTime <= 0 ? input.axisX() : 0;

    if (canAct && (input.axisX() !== 0 || input.pressed('attack') || input.pressed('interact'))) {
      this.cancelIdleAnim();
    }

    // ---- ataque ----
    if (canAct && input.pressed('attack')) {
      if (this.state === 'punch' && this.comboWindow > 0 && !this.comboNext) {
        this.comboNext = true;
      } else if (this.state !== 'punch') {
        this._startPunch(1);
      }
    }

    // ---- interagir ----
    if (canAct && input.pressed('interact') && this.lockTime <= 0 && this.state !== 'punch') {
      const it = level && level.nearest(this.x);
      if (it) {
        this.state = 'interact';
        this.lockTime = 0.34;
        this.vx = 0;
        d.play('interact', { restart: true });
        this._pending = it;
      }
    }

    // ---- movimento ----
    if (dir !== 0 && this.state !== 'punch' && this.state !== 'interact') {
      ax = dir * ACC;
      this.facing = dir;
      d.setFacing(dir);
      this.state = wantRun ? 'run' : 'walk';
      this.idleTime = 0;
    } else if (this.state === 'walk' || this.state === 'run') {
      this.state = 'idle';
    }

    const maxV = wantRun ? SPEED_RUN : SPEED_WALK;
    this.vx += ax * dt;
    if (ax === 0) {
      const f = FRICTION * dt;
      if (Math.abs(this.vx) <= f) this.vx = 0; else this.vx -= Math.sign(this.vx) * f;
    }
    this.vx = clamp(this.vx, -maxV, maxV);
    this.x += this.vx * dt;

    if (level) this.x = clamp(this.x, level.minX, level.maxX);

    // ---- estados de animacao ----
    if (this.state === 'punch') {
      if (d.done) {
        if (this.comboNext) { this.comboNext = false; this._startPunch(2); }
        else { this.state = 'idle'; this.lockTime = 0; }
      }
    } else if (this.state === 'interact') {
      if (d.done) {
        this.state = 'idle';
        if (this._pending) { const it = this._pending; this._pending = null; if (this.onInteract) this.onInteract(it); }
      }
    } else if (this.state === 'smoke') {
      if (d.done) { this.state = 'idle'; this.idleTime = 0; }
    } else {
      const sp = Math.abs(this.vx);
      if (sp > SPEED_WALK + 6) { if (d.anim !== 'run') d.play('run'); d.speed = clamp(sp / SPEED_RUN, 0.72, 1.25); }
      else if (sp > 3) { if (d.anim !== 'walk') d.play('walk'); d.speed = clamp(sp / SPEED_WALK, 0.6, 1.3); }
      else {
        d.speed = 1;
        this.idleTime += dt;
        if (this.idleTime > IDLE_TO_SMOKE && canAct) {
          this.state = 'smoke';
          d.play('smoke', { restart: true, blend: 0.3 });
        } else if (d.anim !== 'idle') d.play('idle');
      }
    }

    if (this.floatText) {
      this.floatText.t += dt;
      if (this.floatText.t >= this.floatText.dur) this.floatText = null;
    }

    d.update(dt);
  }

  // Alpha da falinha em cima da cabeca: entra rapido, fica, some devagar.
  floatAlpha() {
    if (!this.floatText) return 0;
    const { t, dur } = this.floatText;
    if (t < 0.25) return t / 0.25;
    if (t > dur - 0.9) return Math.max(0, (dur - t) / 0.9);
    return 1;
  }

  _startPunch(n) {
    this.state = 'punch';
    this.comboNext = false;
    this.comboWindow = n === 1 ? 0.34 : 0;
    this.lockTime = n === 1 ? 0.40 : 0.48;
    this.vx = this.facing * 26;
    this.det.play(n === 1 ? 'punch1' : 'punch2', { restart: true, blend: 0.06 });
  }

  // Faz o personagem caminhar sozinho ate um X. Usado pela cutscene.
  autoWalk(dt, targetX, run) {
    const d = this.det;
    const dir = Math.sign(targetX - this.x);
    if (Math.abs(targetX - this.x) < 2) {
      this.vx = 0;
      if (d.anim !== 'idle') d.play('idle');
      d.update(dt);
      return true;
    }
    this.facing = dir; d.setFacing(dir);
    const sp = run ? SPEED_RUN : SPEED_WALK;
    this.vx = dir * sp;
    this.x += this.vx * dt;
    const want = run ? 'run' : 'walk';
    if (d.anim !== want) d.play(want);
    d.update(dt);
    return false;
  }

  draw(ctx, cam) {
    this.det.draw(ctx, this.x - cam.ix, this.y - cam.iy);
  }

  lights(cam) {
    return this.det.lights(this.x - cam.ix, this.y - cam.iy);
  }
}
