// scene-espelho.js — A UNICA CENA EM PRIMEIRA PESSOA DO JOGO.
//
// O jogo inteiro e lateral. O jogador nunca viu o rosto dele de frente, em
// tamanho grande, em momento nenhum. A primeira vez que ve e assim. Isso
// nao da para repetir: e uma carta que so se joga uma vez.
//
// COMO SE CHEGA AQUI: o jogador tem que INSISTIR. Na primeira interacao ele
// diz "Nao."; na segunda, "Eu disse nao." — o jogo ja avisou. Quem insiste,
// escolheu.
//
// O que esta refletido e ele. Completamente desfigurado. Nao e ferimento,
// nao e maquiagem de monstro: e a cara de alguem que foi desmontado e
// remontado errado, e ainda assim reconhecivelmente ELE. O sobretudo e o
// mesmo. A gravata e a mesma. O rosto nao.
//
// O reflexo NAO se mexe junto com ele. Fica parado. Olhando.

import { VW, VH, gfx, clamp, lerp, makeBuffer, mulberry32, easeOut } from '../core/gfx.js';
import { audio } from '../core/audio.js';
import { PAL } from '../art/palette.js';
import { rect } from '../art/pixel.js';

// O retrato e a unica arte do jogo que nao sai do rig articulado. Ele e
// desenhado uma vez, em resolucao alta o bastante para caber um rosto de
// verdade, e guardado.
let RETRATO = null;

function construirRetrato() {
  const W = 120, H = 150;
  const b = makeBuffer(W, H);
  const g = b.x;
  const rnd = mulberry32(0xDEAD01);

  // ombros e sobretudo — identicos aos do boneco, e e isso que torna a
  // coisa insuportavel: da para reconhecer a roupa
  rect(g, 6, 112, 108, 38, PAL.coatDk);
  rect(g, 12, 108, 96, 42, PAL.coat);
  rect(g, 12, 108, 96, 3, PAL.coatHi);
  rect(g, 46, 108, 28, 42, PAL.shirtSh);
  rect(g, 52, 110, 16, 40, PAL.shirt);
  rect(g, 56, 112, 8, 38, PAL.tie);
  rect(g, 56, 112, 8, 3, PAL.tieHi);
  // gola levantada, os dois lados
  rect(g, 34, 104, 18, 30, PAL.coatHi);
  rect(g, 68, 104, 18, 30, PAL.coatHi);
  rect(g, 34, 104, 18, 3, PAL.coat);
  rect(g, 68, 104, 18, 3, PAL.coat);

  // pescoco
  rect(g, 48, 96, 24, 20, PAL.skinSh);
  rect(g, 52, 96, 16, 18, PAL.skin);

  // ---- o cranio ----
  // A forma comeca certa. E ai que esta o problema: a silhueta e de gente.
  rect(g, 30, 18, 60, 84, PAL.skinSh);
  rect(g, 33, 14, 54, 90, PAL.skin);
  rect(g, 36, 12, 48, 8, PAL.skinHi);
  rect(g, 30, 88, 60, 12, PAL.skinSh);
  rect(g, 38, 100, 44, 6, PAL.skinDk);

  // cabelo, jogado para tras, quase preto — com massa nos lados, senao a
  // cabeca le como careca e a semelhanca com ele se perde
  rect(g, 26, 6, 68, 20, PAL.hairDk);
  rect(g, 30, 4, 60, 10, PAL.hair);
  rect(g, 22, 14, 12, 46, PAL.hairDk);
  rect(g, 86, 14, 12, 40, PAL.hairDk);
  rect(g, 24, 16, 4, 40, PAL.hair);
  rect(g, 90, 16, 4, 34, PAL.hair);
  for (let i = 0; i < 30; i++) {
    const x = 28 + rnd() * 62, y = 4 + rnd() * 20;
    rect(g, x, y, 1 + rnd() * 3, 1 + rnd() * 4, rnd() > 0.5 ? PAL.hairHi : PAL.hairDk);
  }

  // ---- e ai o rosto nao fecha ----
  //
  // Os dois olhos existem, mas em alturas diferentes, e um deles e maior do
  // que o outro. Nada aqui e sangue: e montagem errada.
  //
  // olho esquerdo — na altura certa
  rect(g, 40, 44, 16, 4, PAL.brow);
  rect(g, 41, 50, 14, 8, PAL.sclera);
  rect(g, 45, 51, 6, 6, PAL.eye);
  rect(g, 46, 52, 2, 2, '#3a3436');
  rect(g, 41, 58, 14, 2, PAL.skinDk);
  // olho direito — treze pixels mais alto, e grande demais
  rect(g, 64, 31, 20, 4, PAL.brow);
  rect(g, 63, 37, 22, 12, PAL.sclera);
  rect(g, 70, 39, 9, 9, PAL.eye);
  rect(g, 71, 40, 3, 3, '#3a3436');
  rect(g, 63, 49, 22, 2, PAL.skinDk);

  // o nariz sai do lugar e desce demais
  rect(g, 55, 52, 8, 26, PAL.skinSh);
  rect(g, 56, 54, 6, 24, PAL.skin);
  rect(g, 54, 76, 11, 4, PAL.skinDk);
  rect(g, 56, 77, 2, 2, '#3a2018');
  rect(g, 61, 77, 2, 2, '#3a2018');

  // A boca esta larga demais, e mais alta de um lado. Nao esta sorrindo —
  // dentes fariam disso uma careta de monstro, e ele nao e um monstro. E
  // so uma boca posta no lugar errado, fechada, sem fazer nada.
  rect(g, 34, 84, 48, 2, '#3a1c18');
  rect(g, 34, 82, 24, 2, '#3a1c18');
  rect(g, 36, 86, 44, 2, PAL.skinDk);
  rect(g, 34, 81, 24, 1, '#5c2822');

  // as costuras: as linhas por onde ele foi remontado
  for (const [x0, y0, x1, y1] of [[30, 30, 92, 26], [34, 66, 88, 70], [58, 12, 56, 100]]) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let i = 0; i <= n; i++) {
      const x = Math.round(lerp(x0, x1, i / n));
      const y = Math.round(lerp(y0, y1, i / n));
      rect(g, x, y, 1, 1, PAL.skinDk);
      if (i % 6 === 0) rect(g, x, y - 2, 1, 5, '#6b4632');
    }
  }

  // a orelha, e so uma
  rect(g, 24, 52, 8, 18, PAL.skinSh);
  rect(g, 26, 55, 4, 12, PAL.skinDk);

  // barba de dois dias, do jeito que ele sempre teve
  for (let i = 0; i < 220; i++) {
    const x = 34 + rnd() * 52, y = 74 + rnd() * 26;
    g.globalAlpha = 0.35 + rnd() * 0.4;
    rect(g, x, y, 1, 1, PAL.hairDk);
  }
  g.globalAlpha = 1;

  // O retrato e desenhado DEPOIS da luz, entao ele nao passa pela
  // multiplicacao que dessatura o jogo inteiro. Sem esta camada fria por
  // cima, a pele sai laranja e a cena parece de outro jogo.
  g.globalCompositeOperation = 'source-atop';
  g.globalAlpha = 0.3;
  g.fillStyle = '#2b3240';
  g.fillRect(0, 0, W, H);
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';

  RETRATO = b.c;
  return b.c;
}

export class MirrorScene {
  constructor(player) {
    this.player = player;
    this.finished = false;
    this.onEnd = null;
  }

  start() {
    if (!RETRATO) construirRetrato();
    this.phase = 'enter';
    this.pt = 0;
    this.finished = false;
    this.zoom = 0;

    const p = this.player;
    p.frozen = true;
    p.controllable = false;
    p.clearBarks();
    p.det.play('idle', { blend: 0.4 });

    // SILENCIO ABSOLUTO. Corta tudo: ambiente, chuva, musica. So o zumbido.
    // O silencio e a arma principal do jogo, e este e o momento em que ele
    // e usado inteiro.
    audio.stopAllLoops();
    audio.stopMusic(0.2);
    audio.stopDread(0.05);
    audio.duckSfx(0.0, 0.35);
    audio.tinnitus(7);
    gfx.letterbox = 1;
  }

  update(dt) {
    this.pt += dt;
    const p = this.player;
    p.det.update(dt);

    switch (this.phase) {
      // A camera DESCE E ENTRA na cabeca dele. O jogo lateral acaba aqui.
      case 'enter':
        this.zoom = easeOut(clamp(this.pt / 1.5, 0, 1));
        if (this.pt > 1.5) { this.phase = 'olhar'; this.pt = 0; }
        break;

      // Ele fica olhando. O reflexo tambem. Nenhum dos dois se mexe, e e
      // por isso que os poucos segundos parecem longos.
      case 'olhar':
        this.zoom = 1;
        if (this.pt > 4.4) { this.phase = 'sair'; this.pt = 0; }
        break;

      case 'sair':
        this.zoom = 1 - easeOut(clamp(this.pt / 1.2, 0, 1));
        if (this.pt > 1.2) {
          this.phase = 'fim';
          this.pt = 0;
          gfx.letterbox = 0;
          audio.duckSfx(1, 1.6);
          p.frozen = false;
          p.controllable = true;
          this.finished = true;
          if (this.onEnd) this.onEnd();
        }
        break;
    }
  }

  addLights() {}
  draw() {}

  // Desenhado DEPOIS da luz: e primeira pessoa, nao faz parte da cena.
  drawUI(ctx) {
    if (this.zoom <= 0.001) return;
    const z = this.zoom;

    ctx.save();
    ctx.globalAlpha = clamp(z * 1.6, 0, 1);
    ctx.fillStyle = '#05050a';
    ctx.fillRect(0, 0, VW, VH);
    ctx.restore();

    if (z < 0.25) return;
    const a = clamp((z - 0.25) / 0.4, 0, 1);

    // o espelho do vestiario, rachado, visto de dentro
    const mw = 172, mh = 218;
    const mx = Math.round((VW - mw) / 2), my = Math.round((VH - mh) / 2);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = '#4a4840';
    ctx.fillRect(mx - 5, my - 5, mw + 10, mh + 10);
    ctx.fillStyle = '#5c5a52';
    ctx.fillRect(mx - 5, my - 5, mw + 10, 2);
    ctx.fillStyle = '#0a0c10';
    ctx.fillRect(mx, my, mw, mh);

    // o reflexo
    const rw = 120 * 1.28, rh = 150 * 1.28;
    const rx = mx + (mw - rw) / 2, ry = my + mh - rh - 6;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(RETRATO, Math.round(rx), Math.round(ry), Math.round(rw), Math.round(rh));

    // a trinca do espelho, por cima do rosto
    ctx.fillStyle = '#0d1014';
    let cx = mx + 74, cy = my;
    for (let i = 0; i < 54; i++) {
      cx += (i % 3 === 0 ? 2 : -1);
      cy += 4;
      ctx.fillRect(cx, cy, 2, 4);
      if (i % 9 === 0) for (let j = 0; j < 12; j++) ctx.fillRect(cx + j, cy - j, 1, 1);
    }
    ctx.fillStyle = '#7f8a99';
    ctx.globalAlpha = a * 0.25;
    ctx.fillRect(mx + 72, my, 1, mh);

    // a lampada do vestiario tremendo em cima
    ctx.globalAlpha = a * (0.5 + Math.random() * 0.5) * 0.35;
    ctx.fillStyle = '#e8c48a';
    ctx.fillRect(mx + 20, my + 4, mw - 40, 22);
    ctx.restore();

    // vinheta pesada por cima: e um homem olhando, nao uma foto
    ctx.save();
    ctx.globalAlpha = a * 0.85;
    const gr = ctx.createRadialGradient(VW / 2, VH / 2, 40, VW / 2, VH / 2, VH * 0.9);
    gr.addColorStop(0, 'rgba(0,0,0,0)');
    gr.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, VW, VH);
    ctx.restore();
  }
}
