// player.js — o detetive controlavel.
//
// So existe eixo X: andar, correr, socar, interagir. E de proposito — o
// jogo e um corredor lateral e a tensao vem de nao poder desviar.
//
// A regra de ouro do controle: o jogador nunca fica preso numa animacao
// sem saber por que. Soco e interacao travam o movimento por menos de meio
// segundo; a animacao do cigarro e cancelada por QUALQUER tecla.

import { Detective } from '../art/detective.js';
import { clamp, gfx } from '../core/gfx.js';
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
    this.barkQueue = [];
    this.barkGap = 0;

    // arma
    this.gun = 'holstered';   // holstered | drawing | ready | holstering | reloading
    this.gunT = 0;
    this.aimAngle = 0;
    this.ammo = 6;
    this.clipSize = 6;
    this.reserve = 18;
    this.ammoHud = 0;         // quanto tempo o contador ainda fica na tela
    this.fireCd = 0;

    this.det.onEvent = (ev) => this._animEvent(ev);
  }

  get aiming() { return this.det.aim.on; }

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
        this.say('not_today', 2.6);
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
      this.det.play('idle', { blend: 0.22 });
    }
  }

  // -------------------------------------------------------------------
  // arma
  // -------------------------------------------------------------------

  _updateGun(dt, canAct) {
    const d = this.det;
    if (this.gunT > 0) this.gunT -= dt;
    if (this.fireCd > 0) this.fireCd -= dt;
    if (this.ammoHud > 0) this.ammoHud -= dt;

    const querMirar = canAct && input.mouse.right && this.state !== 'punch' && this.state !== 'interact';

    if (this.gun === 'holstered') {
      if (querMirar) {
        this.gun = 'drawing'; this.gunT = 0.30;
        this.aimAngle = 0;
        audio.leather(1);
      }
    } else if (this.gun === 'drawing') {
      if (this.gunT <= 0) {
        this.gun = 'ready';
        d.props.gun = 'hand';
        this.ammoHud = 3;
        audio.reloadClick(1.3);
      }
      if (!input.mouse.right) { this.gun = 'holstered'; this.gunT = 0; }
    } else if (this.gun === 'reloading') {
      if (this.gunT <= 0) {
        const falta = this.clipSize - this.ammo;
        const usa = Math.min(falta, this.reserve);
        this.ammo += usa; this.reserve -= usa;
        this.gun = 'ready';
        this.ammoHud = 3;
        audio.reloadClick(0.8);
      }
    } else if (this.gun === 'ready') {
      if (querMirar) {
        // Mouse para CIMA levanta a mira. movementY e negativo subindo,
        // por isso o sinal invertido. Movimento horizontal e ignorado.
        this.aimAngle = clamp(this.aimAngle - input.mouse.dy * 0.30, -38, 46);
        d.aim.on = true;
        d.aim.angle = this.aimAngle;
        this.vx = 0;                       // mirar prende os pes no chao
        if (input.mouse.pressed) this._fire();
        if (input.pressedFrame.has('KeyR') && this.ammo < this.clipSize && this.reserve > 0) {
          this.gun = 'reloading'; this.gunT = 1.0;
          d.aim.on = false;
          audio.reloadClick(0.7);
          setTimeout(() => audio.reloadClick(1.1), 340);
        }
      } else {
        this.gunT -= dt;
        if (this.gunT < -0.5) { this.gun = 'holstering'; this.gunT = 0.28; audio.leather(0.8); }
      }
    } else if (this.gun === 'holstering') {
      d.aim.on = false;
      if (this.gunT <= 0) { this.gun = 'holstered'; d.props.gun = 'holstered'; }
      if (querMirar) { this.gun = 'ready'; d.props.gun = 'hand'; this.gunT = 0; }
    }

    if (this.gun !== 'ready' || !input.mouse.right) d.aim.on = this.gun === 'ready' && input.mouse.right;
  }

  _fire() {
    if (this.fireCd > 0) return;
    const d = this.det;
    this.ammoHud = 4;
    if (this.ammo <= 0) {
      this.fireCd = 0.28;
      audio.dryClick();
      this.say(this.reserve > 0 ? 'bark_reload' : 'bark_dry', 2.0);
      return;
    }
    this.ammo--;
    this.fireCd = 0.34;
    d.aim.recoil = 1;
    d.muzzleT = 0.055;
    audio.gunshot(1);
    gfx.shake(2.6, 0.22);
    gfx.flash = 0.05;

    const rad = this.aimAngle * Math.PI / 180;
    const ox = this.x + this.facing * 22;
    const oy = this.y - 48 - Math.sin(rad) * 10;

    // cartucho saltando
    this.fx.spawn({
      x: ox, y: oy - 2, vx: -this.facing * 40 + (Math.random() - 0.5) * 20,
      vy: -70 - Math.random() * 30, ay: 320, life: 1.2, size: 1,
      color: '#c8a45a', a: 1, fade: 0.3,
    });
    // fumaca da boca do cano
    this.fx.burst(7, () => ({
      x: ox + this.facing * 12, y: oy - Math.random() * 3,
      vx: this.facing * (30 + Math.random() * 50), vy: -8 - Math.random() * 16,
      ay: -6, drag: 2.2, life: 0.5 + Math.random() * 0.4, size: 1,
      color: '#8d8779', a: 0.35, fade: 1.4,
    }));
    // faisca onde a bala bate
    const dist = 150 + Math.random() * 70;
    const hx = this.x + this.facing * dist;
    const hy = oy - Math.tan(rad) * dist;
    this.fx.burst(9, () => ({
      x: hx, y: hy, vx: -this.facing * (30 + Math.random() * 90),
      vy: (Math.random() - 0.5) * 120, ay: 240, life: 0.3 + Math.random() * 0.25,
      size: 1, color: Math.random() > 0.5 ? '#ffd07a' : '#fff2c8', a: 1, fade: 1.2, glow: true,
    }));
  }

  update(dt, level, allow = true) {
    const d = this.det;
    const canAct = allow && this.controllable;

    if (this.lockTime > 0) this.lockTime -= dt;
    if (this.comboWindow > 0) this.comboWindow -= dt;
    this._updateGun(dt, canAct);

    const mirando = this.aiming;
    let ax = 0;
    const wantRun = input.isDown('run') && !mirando;
    const dir = (canAct && this.lockTime <= 0 && !mirando) ? input.axisX() : 0;

    if (canAct && (input.axisX() !== 0 || input.pressed('attack') || input.pressed('interact')
                   || input.mouse.right)) {
      this.cancelIdleAnim();
    }

    // ---- ataque (soco desativado com a arma na mao) ----
    if (canAct && !mirando && this.gun === 'holstered' && input.pressed('attack')) {
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
        // com a arma na mao ele nao vai procurar cigarro
        if (this.gun !== 'holstered') this.idleTime = 0;
        else this.idleTime += dt;
        if (this.idleTime > IDLE_TO_SMOKE && canAct) {
          this.state = 'smoke';
          d.play('smoke', { restart: true, blend: 0.3 });
        } else if (d.anim !== 'idle') d.play('idle');
      }
    }

    this._updateBarks(dt);
    d.update(dt);
  }

  // Falas soltas em cima da cabeca. Uma de cada vez, com um respiro entre
  // elas — duas ao mesmo tempo viram ruido e ninguem le nenhuma.
  say(key, dur = 2.6) {
    if (this.floatText && this.floatText.key === key) return;
    if (this.barkQueue.some(b => b.key === key)) return;
    this.barkQueue.push({ key, dur });
  }

  sayAll(keys) { for (const k of keys) this.say(k); }

  _updateBarks(dt) {
    if (this.floatText) {
      this.floatText.t += dt;
      if (this.floatText.t >= this.floatText.dur) { this.floatText = null; this.barkGap = 0.5; }
    } else if (this.barkGap > 0) {
      this.barkGap -= dt;
    } else if (this.barkQueue.length) {
      const b = this.barkQueue.shift();
      this.floatText = { key: b.key, dur: b.dur, t: 0 };
    }
  }

  clearBarks() { this.floatText = null; this.barkQueue.length = 0; this.barkGap = 0; }

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
