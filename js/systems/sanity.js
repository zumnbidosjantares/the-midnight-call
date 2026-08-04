// sanity.js — a sanidade do detetive.
//
// Existe desde que ele desceu do carro no Capitulo 1. No Capitulo 1 ela
// quase nao se mexe: e uma coisa que o jogador so descobre que existia
// quando comeca a piorar. Por isso NAO ha barra na tela. O medidor e a
// propria imagem — a vinheta fecha, o som mente, e as coisas que ele ve
// deixam de estar la.
//
// Escala 0..100. Quatro estados:
//   100..75  LUCIDO      nada acontece
//    74..50  RACHANDO    sons falsos, passos atras de voce
//    49..25  VAZANDO     alucinacoes atacaveis, cochichos, imagem tremendo
//    24..0   RENDIDO     o Diretor gera muito mais, paginas que ele nao escreveu

import { clamp, gfx, lerp } from '../core/gfx.js';
import { audio } from '../core/audio.js';

export const SAN_LUCID = 0, SAN_CRACK = 1, SAN_LEAK = 2, SAN_GONE = 3;

export class Sanity {
  constructor() {
    this.value = 100;
    this.shown = 100;         // valor suavizado, usado pelos efeitos
    this.enabled = false;     // so liga no Capitulo 2
    this.darkT = 0;
    this.whisperT = 6;
    this.falseStepT = 12;
    this.pulse = 0;           // clarao curto quando ela cai de repente
    this.onEvent = null;      // (tipo) -> jogo reage (fala, alucinacao...)
  }

  reset(v = 100) {
    this.value = v;
    this.shown = v;
    this.darkT = 0;
    this.pulse = 0;
  }

  get state() {
    const v = this.value;
    if (v >= 75) return SAN_LUCID;
    if (v >= 50) return SAN_CRACK;
    if (v >= 25) return SAN_LEAK;
    return SAN_GONE;
  }

  // Perder sanidade tem que ser SENTIDO, nao lido. Cada queda grande da um
  // baque no som e um aperto na vinheta; e isso, e nao um numero, que ensina
  // o jogador a evitar o escuro.
  drain(n, forte = false) {
    if (!this.enabled || n <= 0) return;
    const antes = this.state;
    this.value = clamp(this.value - n, 0, 100);
    if (forte || n >= 6) {
      this.pulse = Math.min(1, this.pulse + 0.35 + n * 0.012);
      audio.heartbeat(0.5 + Math.min(0.5, n * 0.03));
      // Tremor so nos baques grandes, e curto. O tremor continuo do estado
      // VAZANDO foi removido: ele fazia a tela chacoalhar o tempo todo e
      // era impossivel andar em linha reta.
      if (n >= 8) gfx.shake(1.0 + n * 0.03, 0.22);
    }
    if (this.state !== antes && this.onEvent) this.onEvent('worse');
  }

  restore(n) {
    if (!this.enabled || n <= 0) return;
    const antes = this.state;
    this.value = clamp(this.value + n, 0, 100);
    if (this.state !== antes && this.onEvent) this.onEvent('better');
  }

  // `escuro` de 0 a 1: quanto do lugar onde ele esta nao tem luz nenhuma.
  // `seguro` marca os setores de respiro (o vestiario e o exemplo).
  update(dt, opts = {}) {
    if (!this.enabled) return;
    const escuro = opts.dark || 0;
    const seguro = !!opts.safe;

    // O escuro nao cobra de imediato: ele cobra por PERMANECER. Um corredor
    // preto de passagem nao custa nada; ficar parado nele custa.
    //
    // CALIBRAGEM (medida em jogo, nao chutada): a primeira versao tirava
    // 1,35 por segundo no escuro e 1,6 por segundo so de ver alguem. Trinta
    // segundos de setor B levavam o medidor de 100 a 16 — o capitulo inteiro
    // acabaria no estado RENDIDO antes do vestiario. Estes numeros dao
    // uns tres minutos de exposicao continua para atravessar um estado, que
    // e o que faz o jogador SENTIR a queda em vez de assistir a ela.
    if (escuro > 0.35) {
      this.darkT += dt;
      if (this.darkT > 3) this.value = clamp(this.value - escuro * 0.45 * dt, 0, 100);
    } else {
      this.darkT = Math.max(0, this.darkT - dt * 2);
    }

    if (seguro && escuro < 0.3) this.value = clamp(this.value + 1.6 * dt, 0, 100);
    if (opts.chase) this.value = clamp(this.value - 0.6 * dt, 0, 100);

    this.shown = lerp(this.shown, this.value, 1 - Math.exp(-2.2 * dt));
    if (this.pulse > 0) this.pulse = Math.max(0, this.pulse - dt * 1.4);

    const st = this.state;

    // ---- os sons que nao existem ----
    if (st >= SAN_CRACK) {
      this.whisperT -= dt;
      if (this.whisperT <= 0) {
        // Quanto pior ele esta, mais perto vem o proximo. Nunca em intervalo
        // fixo: som ritmado deixa de ser medo e vira metronomo.
        this.whisperT = st >= SAN_GONE ? 3 + Math.random() * 5
          : st >= SAN_LEAK ? 7 + Math.random() * 9 : 14 + Math.random() * 16;
        audio.whisper(st >= SAN_LEAK ? 1 : 0.6);
      }
      this.falseStepT -= dt;
      if (this.falseStepT <= 0) {
        this.falseStepT = st >= SAN_LEAK ? 9 + Math.random() * 11 : 20 + Math.random() * 20;
        // Um passo atras de voce. Um so. Dois viram inimigo, e inimigo tem
        // solucao — passo sozinho nao tem.
        audio.step(false, 0.5);
        if (this.onEvent) this.onEvent('falsestep');
      }
    }
  }

  // Efeitos de imagem. Chamado depois da luz, antes do present().
  //
  // CALIBRAGEM: a vinheta chegava a 2,15 e fechava a tela inteira — o
  // jogador nao conseguia ver o que estava acontecendo durante a fuga,
  // que e justamente quando ele mais precisa ver. O teto agora e 1,35, e
  // o pulso do baque entra com um quarto da forca que tinha.
  apply() {
    const v = this.shown;
    const k = clamp((100 - v) / 100, 0, 1);
    gfx.vignetteAmount = clamp(0.9 + k * 0.34 + this.pulse * 0.12, 0.9, 1.35);
    // o grao sobe pouco: acima de um ponto ele come o rosto (B-16)
    gfx.grainExtra = k * 0.006;
  }

  save() { return { v: Math.round(this.value), on: this.enabled }; }
  load(d) {
    if (!d) return;
    this.enabled = !!d.on;
    this.reset(typeof d.v === 'number' ? d.v : 100);
  }
}
