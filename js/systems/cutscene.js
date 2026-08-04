// cutscene.js — abertura: o carro, a narracao, a chegada.
//
// A cena e dirigida pela NARRACAO, nao pelo relogio. Enquanto a voz fala,
// o carro anda; quando a voz acaba, ele freia e chega. Se o arquivo de
// audio existir em assets/audio/, o tempo vem dele; se nao existir, vem da
// tabela de tempos em i18n.js. Nos dois casos a cena termina junto da fala.

import { VW, VH, gfx, clamp, lerp, easeOut, easeInOut } from '../core/gfx.js';
import { audio } from '../core/audio.js';
import { input } from '../core/input.js';
import { PAL } from '../art/palette.js';
import { text } from '../core/text.js';
import { drawSubtitle } from './dialogue.js';
import { NARRATION, NARRATION_END, t as T, getLang } from '../i18n.js';

const CRUISE = 150;      // px/s do carro em movimento
const DECEL_T = 3.4;     // segundos de freada
const CAR_SCREEN_X = 150;
const PAR_FAR = 0.10, PAR_MID = 0.30, PAR_NEAR = 0.85, PAR_FORE = 1.9;

function tiled(ctx, img, offset, tile, y = 0) {
  let x = -(((offset % tile) + tile) % tile);
  while (x < VW) { ctx.drawImage(img, Math.round(x), Math.round(y)); x += tile; }
}

export class Opening {
  constructor(road, car, player, rain, fx) {
    this.road = road;
    this.car = car;
    this.player = player;
    this.rain = rain;
    this.fx = fx;
    this.finished = false;
  }

  start() {
    const R = this.road;
    this.phase = 'fadein';
    this.pt = 0;
    this.time = 0;
    this.scroll = 0;
    this.speed = CRUISE;
    this.carX = CAR_SCREEN_X;
    this.destWorldX = 999999;
    this.doorAngle = 0;
    this.narrTimer = 0;
    this.subAlpha = 0;
    this.curSub = null;
    this.skipHold = 0;
    this.finished = false;
    this.wheelSpin = 0;
    this.charVisible = false;

    this.player.det.visible = false;
    this.player.y = R.WALK_Y;
    this.player.x = 0;

    gfx.fade = 1;
    gfx.letterbox = 1;
    this.rain.on = true;
    this.rain.wind = -130;
    this.rain.intensity = 1.15;
    this.rain.groundY = R.CURB_Y + 6;

    audio.ensure();
    audio.startLoop('rain', { gain: 0.16, fade: 2 });
    audio.startLoop('wind', { gain: 0.05, fade: 3 });

    // A voz NAO comeca junto com a cena: ela espera o fade-in acabar. Se
    // comecasse em t=0 as primeiras palavras cairiam numa tela ainda preta
    // e a primeira legenda apareceria meio apagada junto com o fade.
    this.narrEl = null;
    this.narrStarted = false;
  }

  _comecarNarracao() {
    if (this.narrStarted) return;
    this.narrStarted = true;
    this.narrTimer = 0;
    this.narrEl = audio.playNarration();
  }

  // -1 enquanto a voz nao comecou: nenhuma legenda casa com esse valor.
  get narrationTime() {
    if (!this.narrStarted) return -1;
    if (this.narrEl && !isNaN(this.narrEl.duration)) return this.narrEl.currentTime;
    return this.narrTimer;
  }

  get narrationDone() {
    if (!this.narrStarted) return false;
    if (this.narrEl) {
      if (this.narrEl.duration && this.narrEl.currentTime >= this.narrEl.duration - 0.08) return true;
      return this.narrEl.ended;
    }
    return this.narrTimer >= NARRATION_END;
  }

  finish(skip) {
    this.finished = true;
    audio.stopNarration();
    gfx.letterbox = 0;
    this.player.det.visible = true;
  }

  update(dt) {
    const R = this.road;
    this.time += dt;
    this.pt += dt;
    if (this.narrStarted) this.narrTimer += dt;

    // Pular segurando ESC. Os primeiros 0,6s ignoram tecla: quem apertou
    // ENTER no menu ainda esta com o dedo em cima e pularia a abertura sem
    // querer.
    if (this.time > 0.6 && (input.isDown('cancel') || input.isDown('confirm'))) {
      this.skipHold += dt;
      if (this.skipHold > 0.7 && this.phase !== 'out') {
        this.phase = 'out'; this.pt = 0;
        audio.stopNarration();
      }
    } else this.skipHold = Math.max(0, this.skipHold - dt * 2);

    // legenda ativa
    const nt = this.narrationTime;
    let sub = null;
    for (const s of NARRATION) {
      if (nt >= s.t && nt < s.t + s.d) { sub = s; break; }
    }
    if (sub !== this.curSub) { this.curSub = sub; }
    this.subAlpha = clamp(this.subAlpha + (sub ? dt * 4 : -dt * 4), 0, 1);

    this.scroll += this.speed * dt;
    this.wheelSpin += this.speed * dt * 0.16;

    switch (this.phase) {
      case 'fadein':
        gfx.fade = 1 - clamp(this.pt / 1.6, 0, 1);
        // a voz entra com a tela ja aberta em 80%
        if (this.pt > 1.3) this._comecarNarracao();
        if (this.pt > 1.6) { this.phase = 'drive'; this.pt = 0; }
        break;

      case 'drive':
        if (this.narrationDone) {
          this.phase = 'decel'; this.pt = 0;
          this.v0 = this.speed;
          const D = this.v0 * DECEL_T / 3;
          const scrollFinal = this.scroll + D;
          // Coloca a boca do beco na tela na hora certa, independente de
          // quanto tempo a narracao durou.
          this.destWorldX = scrollFinal * PAR_NEAR + 153;
          audio.carPassBy(0.5);
        }
        break;

      case 'decel': {
        const k = clamp(this.pt / DECEL_T, 0, 1);
        this.speed = this.v0 * (1 - k) * (1 - k);
        if (k >= 1) {
          this.speed = 0;
          this.phase = 'stop'; this.pt = 0;
          this.rain.wind = -34;
          this.rain.intensity = 1;
          audio.setLoopGain('rain', 0.24);
        }
        break;
      }

      case 'stop':
        if (this.pt > 1.4) { this.phase = 'dooropen'; this.pt = 0; audio.doorCreak(0.8); }
        break;

      case 'dooropen':
        this.doorAngle = easeOut(clamp(this.pt / 0.75, 0, 1)) * 1.15;
        if (this.pt > 0.75) {
          this.phase = 'exit'; this.pt = 0;
          this.charVisible = true;
          this.player.det.visible = true;
          this.player.spawn(this.carX + 86, 1, R.WALK_Y);
          this.player.det.play('getout', { restart: true, blend: 0 });
        }
        break;

      case 'exit':
        this.player.det.update(dt);
        if (this.player.det.done) {
          this.phase = 'closedoor'; this.pt = 0;
          audio.doorSlam(0.7);
          gfx.shake(1.4, 0.2);
        }
        break;

      case 'closedoor':
        this.doorAngle = lerp(1.15, 0, easeInOut(clamp(this.pt / 0.45, 0, 1)));
        this.player.det.update(dt);
        if (this.pt > 0.6) { this.phase = 'cardrive'; this.pt = 0; audio.carPassBy(0.7); }
        break;

      case 'cardrive': {
        const k = clamp(this.pt / 2.4, 0, 1);
        this.carX = CAR_SCREEN_X + easeOut(k) * 520;
        this.player.det.update(dt);
        if (k >= 1) { this.phase = 'walk'; this.pt = 0; }
        break;
      }

      case 'walk': {
        const alleyScreenX = this.destWorldX - this.scroll * PAR_NEAR + R.destAlleyX;
        const done = this.player.autoWalk(dt, alleyScreenX, false);
        if (done || this.pt > 12) { this.phase = 'enter'; this.pt = 0; }
        break;
      }

      case 'enter':
        this.player.det.update(dt);
        gfx.fade = clamp(this.pt / 1.1, 0, 1);
        gfx.letterbox = 1 - clamp(this.pt / 1.1, 0, 1);
        if (this.pt > 1.3) this.finish(false);
        break;

      case 'out':
        gfx.fade = clamp(this.pt / 0.5, 0, 1);
        gfx.letterbox = 1 - clamp(this.pt / 0.5, 0, 1);
        if (this.pt > 0.6) this.finish(true);
        break;
    }

    this.rain.update(dt, 0);
    this.fx.update(dt);
  }

  draw(ctx) {
    const R = this.road;
    const s = this.scroll;

    ctx.drawImage(R.sky, 0, 0);
    tiled(ctx, R.far, s * PAR_FAR, R.TILE);
    tiled(ctx, R.mid, s * PAR_MID, R.TILE);
    tiled(ctx, R.near, s * PAR_NEAR, R.TILE);

    // bloco de destino (so aparece depois que a freada comeca)
    const dx = this.destWorldX - s * PAR_NEAR;
    if (dx < VW + 40 && dx > -R.destW - 40) ctx.drawImage(R.dest, Math.round(dx), 0);

    tiled(ctx, R.road, s, R.TILE);
    this._wetStreaks(ctx);
    this._drawCar(ctx);

    // O detetive vem DEPOIS do carro: a porta que abre e a do lado da
    // camera, entao ele sai por cima do carro, nao por tras dele.
    if (this.charVisible) this.player.det.draw(ctx, this.player.x, this.player.y);

    this.fx.draw(ctx, 0, 0);
    this.rain.draw(ctx);
    tiled(ctx, R.fore, s * PAR_FORE, R.TILE);
  }

  _drawCar(ctx) {
    const R = this.road, car = this.car;
    if (!car) return;
    const x = Math.round(this.carX), y = Math.round(R.ROAD_Y - (car.wheels[0][1] + car.wr));

    // porta aberta, desenhada antes do corpo para o batente ficar por cima
    if (this.doorAngle > 0.01) {
      // interior escuro aparecendo
      ctx.fillStyle = '#07080a';
      ctx.fillRect(x + 60, y + 11, 32, 27);
      ctx.save();
      ctx.translate(x + 58, y + 26);
      ctx.rotate(-this.doorAngle * 0.55);
      ctx.fillStyle = '#2a2126';
      ctx.fillRect(0, -17, 35, 29);
      ctx.fillStyle = '#12181f';
      ctx.fillRect(4, -15, 26, 12);
      ctx.fillStyle = '#63505a';
      ctx.fillRect(0, -17, 35, 1);
      ctx.fillStyle = '#8f959e';
      ctx.fillRect(0, -2, 35, 1);
      ctx.restore();
    }

    ctx.drawImage(car.body, x, y);
    for (const [wx, wy] of car.wheels) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.translate(x + wx, y + wy);
      ctx.rotate(this.wheelSpin);
      ctx.drawImage(car.wheel, -car.wr, -car.wr);
      ctx.restore();
    }

    // respingo das rodas
    if (this.speed > 20 && Math.random() < 0.7) {
      this.fx.spawn({
        x: x + 100 + Math.random() * 10, y: R.ROAD_Y - 2,
        vx: -40 - Math.random() * 70, vy: -20 - Math.random() * 34, ay: 210,
        life: 0.32, size: 1, color: '#7d97bd', a: 0.55, fade: 1.2,
      });
    }
  }

  // Reflexo molhado: faixa vertical de luz descendo de cada poste sobre o
  // asfalto. Barato e e o que faz a rua parecer encharcada.
  _wetStreaks(ctx) {
    const R = this.road;
    const off = ((this.scroll * PAR_NEAR) % R.TILE + R.TILE) % R.TILE;
    const xs = [];
    for (let base = -R.TILE; base < VW + R.TILE; base += R.TILE) {
      for (const px of [40, 230, 420]) xs.push(base + px + 20 - off);
    }
    const dx = this.destWorldX - this.scroll * PAR_NEAR;
    if (dx > -200 && dx < VW + 200) { xs.push(dx + R.destLampX); xs.push(dx + R.destLamp2X); }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const sx of xs) {
      if (sx < -40 || sx > VW + 40) continue;
      const g = ctx.createLinearGradient(0, R.CURB_Y, 0, VH);
      g.addColorStop(0, 'rgba(255,187,99,0.30)');
      g.addColorStop(0.5, 'rgba(255,170,90,0.11)');
      g.addColorStop(1, 'rgba(255,160,80,0)');
      ctx.fillStyle = g;
      const w = 16 + Math.sin(this.time * 2 + sx) * 2;
      ctx.fillRect(Math.round(sx - w / 2), R.CURB_Y, Math.round(w), VH - R.CURB_Y);
    }
    ctx.restore();
  }

  addLights(gfx) {
    const R = this.road;
    const s = this.scroll;
    // postes da fita repetida
    const off = ((s * PAR_NEAR) % R.TILE + R.TILE) % R.TILE;
    for (let base = -R.TILE; base < VW + R.TILE; base += R.TILE) {
      for (const px of [40, 230, 420]) {
        const sx = base + px + 20 - off;
        if (sx < -80 || sx > VW + 80) continue;
        gfx.addLight(sx, R.WALK_Y - 92 + 11, 92, PAL.lampWarm, 0.62, 0.9);
        gfx.addCone(sx, R.WALK_Y - 92 + 13, Math.PI / 2, 1.35, 116, PAL.lampWarm, 0.30);
      }
    }
    // poste da esquina do destino
    const dx = this.destWorldX - s * PAR_NEAR;
    if (dx > -200 && dx < VW + 200) {
      gfx.addLight(dx + R.destLampX, R.destLampY, 108, PAL.lampWarm, 0.7, 0.9);
      gfx.addCone(dx + R.destLampX, R.destLampY + 2, Math.PI / 2, 1.3, 130, PAL.lampWarm, 0.34);
      gfx.addLight(dx + R.destLamp2X, R.destLamp2Y, 128, PAL.lampWarm, 0.86, 0.85);
      gfx.addCone(dx + R.destLamp2X, R.destLamp2Y + 2, Math.PI / 2, 1.35, 150, PAL.lampWarm, 0.42);
      // o vao do beco fica preto de proposito: nada de luz ali
    }
    // farois e um pouco de luz de preenchimento no carro, senao ele vira
    // uma mancha preta em cima do asfalto preto
    if (this.phase !== 'walk' && this.phase !== 'enter') {
      const cx = this.carX + 130, cy = R.ROAD_Y - 18;
      gfx.addCone(cx, cy, 0.06, 0.5, 220, '#fff0c8', 0.6);
      gfx.addLight(cx, cy, 34, '#ffe6b0', 0.85);
      gfx.addLight(this.carX + 6, cy, 24, '#ff4a3a', 0.55);
      // O carro so tem luz propria enquanto anda; parado, quem o ilumina e
      // o poste da esquina.
      const moving = this.phase === 'fadein' || this.phase === 'drive' || this.phase === 'decel';
      gfx.addLight(this.carX + 65, R.ROAD_Y - 22, 150, '#93a8c9', moving ? 0.72 : 0.34, 1.25);
    }
  }

  drawUI(ctx) {
    if (this.curSub) {
      const s = this.curSub;
      drawSubtitle(ctx, s[getLang()] || s.pt, this.subAlpha, -gfx.lbBar * 0.2);
    }
    if (this.skipHold > 0.12 && this.phase !== 'out') {
      const a = clamp(this.skipHold / 0.7, 0, 1);
      const w = 60;
      const x = VW - w - 18, y = 16;
      ctx.save();
      ctx.globalAlpha = 0.8;
      text(ctx, T('skip_hold'), VW - 18, y, {
        size: 8, font: 'ui', weight: 'bold', color: PAL.uiDim, align: 'right', track: 1,
      });
      ctx.fillStyle = '#2a2320';
      ctx.fillRect(x, y + 12, w, 2);
      ctx.fillStyle = PAL.uiAccent;
      ctx.fillRect(x, y + 12, Math.round(w * a), 2);
      ctx.restore();
    }
  }
}
