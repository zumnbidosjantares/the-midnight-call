// scene-nota.js — a cena da nota, e o que vem atras dela.
//
// Sequencia: ele se agacha para ler, de costas para a porta. A nota
// pergunta por que ele voltou. Enquanto ele le, uma figura preta entra pela
// porta e vem andando. A musica sobe com a distancia — nao com o relogio,
// com a DISTANCIA, e e isso que faz o jogador olhar para tras. Quando ela
// chega, o som para no meio e a tela apaga.
//
// Depois: palpebras abrindo devagar, com duas piscadas, e ele acorda
// algemado num cano.

import { VW, VH, gfx, clamp, lerp, easeOut } from '../core/gfx.js';
import { audio } from '../core/audio.js';
import { input } from '../core/input.js';
import { PAL } from '../art/palette.js';
import { text } from '../core/text.js';
import { Detective } from '../art/detective.js';
import { t as T } from '../i18n.js';

// A figura para de andar a esta distancia do detetive e da o golpe.
const ALCANCE = 26;
// Distancia em que a tensao ja esta no maximo.
const PERTO = 40;
const LONGE = 230;

export class NoteScene {
  constructor(player, fx) {
    this.player = player;
    this.fx = fx;
    this.finished = false;
    this.figura = new Detective();
    this.figura.silhouette = '#000000';
    this.figura.rimAlpha = 0;
    this.figura.reflect = 0;
    this.figura.scaleY = 1.16;    // mais alta que um homem, so um pouco
    this.figura.scaleX = 0.94;    // e mais estreita
  }

  start(level) {
    this.level = level;
    this.phase = 'crouch';
    this.pt = 0;
    this.finished = false;
    this.noteAlpha = 0;
    this.batida = 0;
    this.figuraX = this.player.x - 300;
    this.figura.facing = 1;
    this.figura.visible = false;
    this.figura.play('walk', { blend: 0 });
    this.figura.speed = 0.55;

    // Congelar e obrigatorio, nao so cosmetico: sem isso a maquina de
    // estados do jogador volta para 'idle' no quadro seguinte e desfaz o
    // agachamento no meio da cena.
    this.player.frozen = true;
    this.player.controllable = false;
    this.player.clearBarks();
    this.player.det.setFacing(1);
    this.player.det.play('read', { blend: 0.45 });
    gfx.letterbox = 1;
    audio.stopLoop('roomtone', 1.5);
  }

  get dist() { return Math.abs(this.player.x - this.figuraX); }

  update(dt) {
    this.pt += dt;
    const p = this.player;

    switch (this.phase) {
      case 'crouch':
        if (this.pt > 1.1) { this.phase = 'read'; this.pt = 0; }
        break;

      case 'read':
        this.noteAlpha = clamp(this.noteAlpha + dt * 1.6, 0, 1);
        if (this.pt > 2.6) {
          this.phase = 'approach'; this.pt = 0;
          this.figura.visible = true;
          audio.startDread();
          audio.doorCreak(0.5);
        }
        break;

      case 'approach': {
        // Ele fala enquanto ela vem. O jogador ja viu; ele nao. Cada frase
        // chega mais perto de perceber, e a ultima chega tarde demais.
        if (this.pt > 0.6 && !this._f1) { this._f1 = 1; this.player.say('bark_note_1', 2.4, true); }
        if (this.pt > 3.6 && !this._f2) { this._f2 = 1; this.player.say('bark_note_2', 2.4, true); }
        if (this.dist < 90 && !this._f3) { this._f3 = 1; this.player.say('bark_note_3', 2.4, true); }

        // anda devagar, e desacelera de leve chegando perto: a ultima parte
        // demora mais do que o jogador espera
        const d = this.dist;
        const vel = 15 + 9 * clamp((d - ALCANCE) / 180, 0, 1);
        this.figuraX += vel * dt;
        this.figura.update(dt);

        const k = clamp(1 - (d - PERTO) / (LONGE - PERTO), 0, 1);
        audio.setDread(k);

        // batimento acelera junto
        this.batida -= dt;
        if (this.batida <= 0) {
          this.batida = lerp(1.15, 0.34, k);
          audio.heartbeat(0.35 + k * 0.65);
        }
        if (k > 0.55) gfx.shake(k * 0.7, 0.2);

        if (d <= ALCANCE) { this.phase = 'strike'; this.pt = 0; }
        break;
      }

      case 'strike':
        this.figura.play('punch1', { restart: this.pt < dt * 2, blend: 0.05 });
        this.figura.speed = 1.1;
        this.figura.update(dt);
        if (this.pt > 0.30 && !this._bateu) {
          this._bateu = true;
          audio.stopDread(0.01);     // corta no meio, sem despedida
          audio.thud(1);
          audio.tinnitus(4);
          gfx.shake(5, 0.5);
          gfx.fade = 1;
          gfx.eyelid = 0;
        }
        if (this.pt > 0.55) { this.phase = 'black'; this.pt = 0; }
        break;

      case 'black':
        // A figura sai de cena AQUI. Antes ela continuava desenhada e
        // reaparecia no galpao junto com o jogador, sumindo no quadro
        // seguinte — o susto virava bug.
        this.figura.visible = false;
        gfx.fade = 1;
        gfx.eyelid = 0;
        if (this.pt > 2.4) {
          this.phase = 'wake'; this.pt = 0;
          if (this.onWake) this.onWake();       // troca para a cela
          gfx.fade = 0;
          audio.startLoop('roomtone', { gain: 0.09, fade: 3 });
        }
        break;

      case 'wake': {
        // duas piscadas antes de abrir de vez
        const t = this.pt;
        let k;
        if (t < 1.2) k = (t / 1.2) * 0.22;
        else if (t < 1.7) k = lerp(0.22, 0.03, (t - 1.2) / 0.5);
        else if (t < 3.0) k = lerp(0.03, 0.55, (t - 1.7) / 1.3);
        else if (t < 3.4) k = lerp(0.55, 0.30, (t - 3.0) / 0.4);
        else k = lerp(0.30, 1, easeOut(clamp((t - 3.4) / 2.2, 0, 1)));
        gfx.eyelid = k;
        if (t > 5.8) {
          gfx.eyelid = 1;
          gfx.letterbox = 0;
          this.finished = true;
          // So agora ele fala. Antes disso as falas apareciam por tras das
          // palpebras fechadas e o jogador nao lia nenhuma.
          if (this.onAwake) this.onAwake();
        }
        break;
      }
    }

    if (this.phase !== 'strike' && this.phase !== 'approach') this.figura.update(dt);
    p.det.update(dt);
  }

  // desenhado junto com a fase, depois do jogador
  draw(ctx, cam) {
    if (!this.figura.visible) return;
    this.figura.draw(ctx, this.figuraX - cam.ix, this.player.y - cam.iy);
  }

  // A figura nao emite nem consome luz — ela e desenhada preta e pronto.
  // Como a cena inteira e multiplicada pela luz, preto continua preto sob
  // qualquer lampada, e e exatamente esse o efeito.
  addLights() {}

  drawUI(ctx) {
    if (this.noteAlpha <= 0 || this.phase === 'black' || this.phase === 'wake') return;
    const a = this.noteAlpha * (this.phase === 'strike' ? 0.4 : 1);
    const w = 196, h = 44;
    const x = (VW - w) / 2, y = 52;
    ctx.save();
    ctx.globalAlpha = a;
    // papel amassado
    ctx.fillStyle = '#0a0806';
    ctx.fillRect(x + 2, y + 2, w, h);
    ctx.fillStyle = '#c9c2ad';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#b3ac97';
    ctx.fillRect(x, y + h - 4, w, 4);
    ctx.fillStyle = '#8b1a14';
    ctx.fillRect(x + w - 14, y + h - 9, 9, 9);
    ctx.restore();
    text(ctx, T('note_text'), VW / 2, y + 17, {
      size: 11, font: 'serif', color: '#2a211c', align: 'center', track: 1, alpha: a,
    });
  }
}
