// levels-ch2.js — os oito setores do Capitulo 2, "GENTILEZA".
//
// O Capitulo 1 termina com ele forcando uma porta lateral. Do outro lado
// nao ha rua nenhuma: ha o resto do galpao, que e muito maior do que a sala
// onde ele acordou. "Isso nao e um galpao. Isso e um quarteirao."
//
// Cada setor tem uma FUNCAO. E isso que impede uma hora de jogo de virar
// uma hora de corredor:
//
//   1 corredor de carga .. revela a escala. Da o PORRETE.
//   2 escritorio ......... da o CADERNO e o MAPA. Primeiro NPC.
//   3 estantes ........... primeiro combate. MUNICAO, sem arma.
//   4 vestiario .......... respiro. Humanidade. O MACO. O ESPELHO.
//   5 camara fria ........ terror puro. A sanidade despenca.
//   6 sala de maquinas ... a PISTOLA, e o preco dela.
//   7 mezanino ........... a telefonista.
//   8 doca ............... a saida, e quem fica olhando ela.

import { VW, VH, makeBuffer, mulberry32 } from '../core/gfx.js';
import { PAL } from '../art/palette.js';
import { rect, grainRect, ditherV } from '../art/pixel.js';
import * as M from './materials.js';
import { Level } from './levels.js';

const GY = 214;

// ---------------------------------------------------------------------------
// pinceis industriais — so existem aqui
// ---------------------------------------------------------------------------

// Estante industrial de tres niveis. E o movel que define o galpao: alta,
// vazada, e some no escuro la em cima.
function rack(g, x, y, w, h, seed, cheia = true) {
  const rnd = mulberry32(seed);
  const niveis = Math.max(2, Math.floor(h / 34));
  rect(g, x, y, 4, h, '#3a3f47');
  rect(g, x, y, 2, h, '#4c525c');
  rect(g, x + w - 4, y, 4, h, '#3a3f47');
  rect(g, x + w - 4, y, 2, h, '#4c525c');
  for (let i = 0; i <= niveis; i++) {
    const ly = y + Math.round(i * (h / niveis));
    rect(g, x, ly, w, 3, '#454b54');
    rect(g, x, ly, w, 1, '#5c626b');
    if (!cheia || i === niveis) continue;
    let px = x + 5;
    while (px < x + w - 12) {
      const bw = 12 + Math.floor(rnd() * 16);
      const bh = 10 + Math.floor(rnd() * 12);
      if (rnd() > 0.28) {
        const c = ['#4a3a26', '#3d3126', '#2f2a22'][(rnd() * 3) | 0];
        rect(g, px, ly - bh, bw, bh, c);
        rect(g, px, ly - bh, bw, 1, M.shade(c, 1.3));
        rect(g, px, ly - 1, bw, 1, '#1a1512');
        // fita de lacre
        rect(g, px + (bw >> 1) - 1, ly - bh, 2, bh, M.shade(c, 1.45));
      }
      px += bw + 3 + Math.floor(rnd() * 6);
    }
  }
  grainRect(g, x, y, w, h, ['#1e2126', '#4c525c'], 0.03, seed + 7);
}

// Empilhadeira parada ha anos. A chave continua na ignicao.
function forklift(g, x, gy, seed) {
  const w = 54, h = 40;
  const y = gy - h;
  rect(g, x + 6, y + 14, 40, 20, '#7a5e22');
  rect(g, x + 6, y + 14, 40, 2, '#9a7a30');
  rect(g, x + 8, y + 34, 36, 4, '#2a2018');
  // torre e garfos
  rect(g, x + 44, y - 6, 4, 40, '#4a4238');
  rect(g, x + 50, y - 6, 4, 40, '#4a4238');
  rect(g, x + 44, y + 30, 16, 3, '#5a5248');
  rect(g, x + 44, y + 33, 16, 1, '#312a24');
  // cabine e banco
  rect(g, x + 10, y, 3, 16, '#4a4238');
  rect(g, x + 30, y, 3, 16, '#4a4238');
  rect(g, x + 8, y - 3, 27, 3, '#4a4238');
  rect(g, x + 14, y + 18, 12, 10, '#2c2620');
  rect(g, x + 14, y + 18, 12, 2, '#3d352c');
  // rodas
  for (const wx of [x + 12, x + 38]) {
    rect(g, wx, gy - 10, 12, 10, '#1a1719');
    rect(g, wx + 3, gy - 7, 6, 5, '#3a363a');
  }
  grainRect(g, x, y - 6, w + 8, h + 6, [PAL.rust, '#241d18'], 0.06, seed);
}

// Portao de doca. Trancado por fora, como todos.
function dockGate(g, x, gy, w, seed, aberto = false) {
  const h = 108;
  const y = gy - h;
  rect(g, x - 4, y - 5, w + 8, 6, '#1a1e24');
  if (aberto) {
    rect(g, x, y, w, 16, '#232830');
    rect(g, x, y + 16, w, h - 16, '#05070a');
    ditherV(g, x, y + 16, w, 40, '#0b1016', '#05070a', 4);
    return;
  }
  rect(g, x, y, w, h, '#232830');
  for (let i = 0; i < h; i += 5) {
    rect(g, x, y + i, w, 4, i % 10 ? '#2b313a' : '#232830');
    rect(g, x, y + i, w, 1, '#3a4250');
  }
  rect(g, x + (w >> 1) - 11, gy - 34, 22, 9, '#151a1f');
  rect(g, x + (w >> 1) - 9, gy - 32, 18, 3, '#2a3038');
  grainRect(g, x, y, w, h, [PAL.rust, '#1a1e24'], 0.05, seed);
}

// Relogio de ponto. Sempre 02h14.
function punchClock(g, x, y) {
  rect(g, x, y, 22, 26, '#2a2620');
  rect(g, x, y, 22, 1, '#3d372e');
  rect(g, x + 3, y + 3, 16, 16, '#cfc6b0');
  rect(g, x + 3, y + 3, 16, 1, '#8b8272');
  // ponteiros parados em 02h14
  rect(g, x + 10, y + 8, 1, 4, '#241c18');
  rect(g, x + 11, y + 11, 4, 1, '#241c18');
  rect(g, x + 10, y + 11, 2, 2, '#7a1c14');
  rect(g, x + 5, y + 21, 12, 3, '#1c1814');
}

// Armario de vestiario. Alguns abertos, e e sempre o aberto que interessa.
function locker(g, x, gy, n, seed, abertos = []) {
  const w = 20, h = 74;
  const y = gy - h;
  const rnd = mulberry32(seed);
  for (let i = 0; i < n; i++) {
    const lx = x + i * w;
    const aberto = abertos.indexOf(i) >= 0;
    rect(g, lx, y, w, h, '#39434e');
    rect(g, lx, y, w, 1, '#4c5866');
    rect(g, lx, y + h - 1, w, 1, '#20262e');
    rect(g, lx + w - 1, y, 1, h, '#232a32');
    if (aberto) {
      rect(g, lx + 2, y + 2, w - 4, h - 4, '#0b0e12');
      rect(g, lx + 2, y + 2, w - 4, 3, '#141a20');
      // porta escancarada para o lado
      rect(g, lx + w - 2, y + 4, 3, h - 8, '#414c58');
      rect(g, lx + w - 2, y + 4, 1, h - 8, '#556374');
    } else {
      // grelha de ventilacao
      for (let v = 0; v < 4; v++) rect(g, lx + 5, y + 8 + v * 3, 10, 1, '#232a32');
      rect(g, lx + w - 5, y + 34, 2, 5, '#8f959e');
      // etiqueta com nome
      rect(g, lx + 5, y + 46, 10, 5, '#b9b0a2');
      for (let c = 0; c < 3; c++) rect(g, lx + 6 + c * 3, y + 48, 2, 1, '#3a332c');
    }
    if (rnd() > 0.7) grainRect(g, lx, y, w, h, [PAL.rust, '#2b333c'], 0.05, seed + i);
  }
  return { x, y, w: n * w, h };
}

// Mesa de refeitorio de formica.
function canteenTable(g, x, gy, w, seed) {
  const y = gy - 30;
  rect(g, x, y, w, 4, '#9a9080');
  rect(g, x, y, w, 1, '#b6ac99');
  rect(g, x, y + 4, w, 2, '#4a443c');
  rect(g, x + 5, y + 6, 4, 24, '#3a4048');
  rect(g, x + w - 9, y + 6, 4, 24, '#3a4048');
  rect(g, x + 5, gy - 2, w - 10, 2, '#2a3038');
  grainRect(g, x, y, w, 6, ['#7f7668', '#aaa090'], 0.05, seed);
}

// Gancho de acougue pendurado no trilho do teto.
function meatHook(g, x, y, len) {
  rect(g, x, y, 1, len, '#5c626b');
  rect(g, x, y, 1, 2, '#7f858e');
  const b = y + len;
  rect(g, x - 1, b, 3, 2, '#6e747e');
  rect(g, x - 2, b + 2, 2, 3, '#6e747e');
  rect(g, x - 3, b + 5, 2, 2, '#5c626b');
  rect(g, x - 1, b + 6, 2, 1, '#4a5058');
}

// Caldeira / gerador morto.
function boiler(g, x, gy, w, h, seed) {
  const y = gy - h;
  rect(g, x, y, w, h, '#3d4149');
  rect(g, x, y, w, 3, '#4e535c');
  rect(g, x, gy - 4, w, 4, '#23262b');
  for (let i = 0; i < 3; i++) rect(g, x, y + 12 + i * Math.round(h / 4), w, 2, '#2b2f35');
  // painel e valvula
  rect(g, x + 6, y + 10, 14, 12, '#1b1e22');
  rect(g, x + 8, y + 12, 10, 8, '#5c4a1e');
  rect(g, x + w - 14, y + 16, 8, 8, '#6e747e');
  rect(g, x + w - 12, y + 18, 4, 4, '#3a4048');
  grainRect(g, x, y, w, h, [PAL.rust, '#23262b'], 0.07, seed);
}

// Tubulacao correndo pela parede.
function pipeRun(g, x, y, w, seed) {
  rect(g, x, y, w, 6, '#4a5058');
  rect(g, x, y, w, 2, '#616872');
  rect(g, x, y + 5, w, 1, '#2a3038');
  const rnd = mulberry32(seed);
  for (let i = 0; i < w; i += 40) {
    const fx = x + i + Math.floor(rnd() * 12);
    rect(g, fx, y - 1, 4, 8, '#565d66');
    rect(g, fx, y - 1, 1, 8, '#6e757f');
  }
  grainRect(g, x, y, w, 6, [PAL.rust, '#3a4048'], 0.08, seed + 3);
}

// Guarda-corpo do mezanino, desenhado no primeiro plano.
function railing(g, x, y, w) {
  rect(g, x, y, w, 2, '#4a5058');
  rect(g, x, y + 14, w, 1, '#3a4048');
  for (let i = 0; i < w; i += 26) rect(g, x + i, y, 2, 30, '#4a5058');
}

// Mesa telefonica antiga: plugue e cabo. Nenhum cabo termina em lugar
// nenhum, e e esse o detalhe que importa.
function switchboard(g, x, gy) {
  const h = 46, w = 52, y = gy - h;
  rect(g, x, y, w, h, '#3a2b1e');
  rect(g, x, y, w, 2, '#54402c');
  rect(g, x + 2, y + 4, w - 4, 24, '#1c1611');
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 8; c++) {
      rect(g, x + 5 + c * 6, y + 7 + r * 7, 3, 3, '#0d0b09');
      rect(g, x + 5 + c * 6, y + 7 + r * 7, 3, 1, '#5c5248');
    }
  }
  // cabos pendurados
  for (const cx of [x + 10, x + 24, x + 38]) {
    for (let i = 0; i < 14; i++) rect(g, cx + Math.round(Math.sin(i * 0.5) * 2), y + 28 + i, 1, 1, '#241c18');
  }
  rect(g, x, gy - 4, w, 4, '#241a12');
}

// Porta pesada de camara fria.
function coldDoor(g, x, gy, seed) {
  const w = 40, h = 78, y = gy - h;
  rect(g, x - 3, y - 3, w + 6, h + 3, '#2a2f36');
  rect(g, x, y, w, h, '#525860');
  rect(g, x, y, w, 2, '#6b727c');
  rect(g, x, y + h - 3, w, 3, '#33383f');
  rect(g, x + 4, y + 6, w - 8, h - 14, '#464c54');
  rect(g, x + w - 12, y + 34, 9, 4, '#8f959e');
  rect(g, x + w - 12, y + 38, 3, 12, '#8f959e');
  grainRect(g, x, y, w, h, ['#6b727c', '#33383f'], 0.05, seed);
  return { x, y, w, h };
}

// Teto industrial: tesouras de aco sumindo no escuro. Vai na camada de
// fundo, com paralaxe — e o que da os tres andares de pe-direito.
function trusses(g, w, h) {
  rect(g, 0, 0, w, h, '#0a0c10');
  for (let x = -20; x < w; x += 118) {
    rect(g, x + 40, 10, 5, 74, '#151a20');
    rect(g, x, 10, 96, 4, '#181d24');
    rect(g, x, 30, 96, 3, '#141920');
    for (let i = 0; i < 5; i++) {
      const bx = x + 8 + i * 18;
      for (let j = 0; j < 20; j++) rect(g, bx + j, 13 + j, 1, 1, '#161b22');
    }
  }
  ditherV(g, 0, 84, w, 70, '#101419', '#07090c', 5);
}

// Parede padrao do galpao: chapa ondulada em cima, alvenaria embaixo, e a
// faixa de sombra colada no teto que faz o lugar parecer alto.
function warehouseWall(g, w, seed, opt = {}) {
  const corte = opt.corte === undefined ? 118 : opt.corte;
  rect(g, 0, 0, w, VH, '#131211');
  M.metalPanel(g, 0, 0, w, corte, seed, { hi: '#3a4048', mid: '#2b3037', dk: '#1a1e23' });
  M.brickWall(g, 0, corte, w, GY - corte, seed + 11, {
    base: '#332f2a', hi: '#3d3831', dk: '#252220', mortar: '#1a1816', moss: false,
  });
  for (let i = 0; i < 52; i++) {
    g.globalAlpha = 0.62 * (1 - i / 52);
    rect(g, 0, i, w, 1, '#040506');
  }
  g.globalAlpha = 1;
  M.asphalt(g, 0, GY, w, VH - GY, seed + 21, { hi: '#33302b', mid: '#26231f', dk: '#191714' });
  rect(g, 0, GY, w, 1, '#0a0908');
  grainRect(g, 0, corte, w, GY - corte, ['#191715', '#3d3831'], 0.05, seed + 31);
}

// Itens que somem quando pegos.
//
// Tudo o mais do cenario e pintado UMA VEZ na camada e depois so deslocado
// — e o que faz o jogo rodar a 60fps sem sprite sheet nenhuma. Mas item
// pego tem que sumir, e pixel pintado na camada nao some. Entao estes
// poucos objetos sao desenhados por quadro, e so enquanto ainda estao la.
//
// Isso importa mais do que parece: o capitulo inteiro e sobre coisas que
// aparecem exatamente onde ele precisa. Se elas continuassem no lugar
// depois de pegas, a piada morria na primeira.
function itensSoltos(lvl, defs) {
  lvl.pego = {};
  const antes = lvl.drawProps;
  lvl.drawProps = (ctx, cam) => {
    if (antes) antes(ctx, cam);
    for (const d of defs) {
      if (lvl.pego[d.id]) continue;
      d.draw(ctx, Math.round(d.x - cam.ix), Math.round(d.y - cam.iy));
    }
  };
}

// Manchas de umidade descendo pela parede.
function damp(g, xs, y) {
  for (const px of xs) {
    for (let i = 0; i < 70; i++) {
      g.globalAlpha = 0.09;
      rect(g, px + Math.sin(i * 0.3) * 2, y + i, 2, 1, '#0d0f12');
    }
  }
  g.globalAlpha = 1;
}

// Lampada de emergencia: a luz que sobrou num predio sem energia. Poucas,
// fracas, e sempre longe uma da outra.
function emergencyLamp(g, x, y) {
  rect(g, x, y, 14, 7, '#2a3038');
  rect(g, x, y, 14, 1, '#3d454f');
  rect(g, x + 2, y + 7, 4, 3, '#8a2e22');
  rect(g, x + 8, y + 7, 4, 3, '#8a2e22');
  rect(g, x + 6, y - 4, 2, 4, '#20252b');
}

// ---------------------------------------------------------------------------
// 1 — CORREDOR DE CARGA
// ---------------------------------------------------------------------------

export function buildCorridor() {
  const W = 1700;

  const back = makeBuffer(Math.ceil(VW + (W - VW) * 0.45) + 8, VH);
  trusses(back.x, back.c.width, VH);

  const main = makeBuffer(W, VH);
  const g = main.x;
  warehouseWall(g, W, 5101);
  damp(g, [120, 470, 900, 1320, 1600], 122);

  const inter = [];
  const lights = [];

  // porta de onde ele veio: o cubiculo do Capitulo 1
  const volta = M.doorFrame(g, 48, GY, 5111);
  inter.push({
    x: volta.x, y: volta.y, w: volta.w, h: volta.h, prompt: 'prompt_open',
    action: 'goto', to: 'warehouse', tox: 470, tofacing: -1, range: 30, isDoor: true,
  });
  rect(g, 42, GY, 38, 3, '#2b2620');

  // Estantes ate o teto dos dois lados. Sao elas que dizem "isso e um
  // quarteirao" sem ninguem precisar falar.
  rack(g, 150, 40, 120, GY - 40, 5121);
  rack(g, 290, 40, 120, GY - 40, 5131);
  rack(g, 1380, 46, 110, GY - 46, 5141);
  rack(g, 1500, 46, 110, GY - 46, 5151);

  forklift(g, 430, GY, 5161);
  inter.push({ x: 430, y: GY - 46, w: 60, h: 46, prompt: 'prompt_look', lines: 'c2_forklift', range: 34 });

  // pilha de paletes — e daqui que sai o porrete
  for (let i = 0; i < 7; i++) {
    const py = GY - 6 - i * 7;
    rect(g, 560, py, 62, 5, '#4a3524');
    rect(g, 560, py, 62, 1, '#63482f');
    rect(g, 560, py + 5, 62, 1, '#2a1c11');
  }
  inter.push({ x: 560, y: GY - 52, w: 62, h: 52, prompt: 'prompt_look', lines: 'c2_pallets', range: 32 });

  punchClock(g, 700, 138);
  inter.push({ x: 696, y: 136, w: 26, h: 30, prompt: 'prompt_look', lines: 'c2_clock', range: 26 });

  // escada de metal para o escritorio suspenso
  const ESC = 860;
  rect(g, ESC, 96, 76, 5, '#3d434b');
  rect(g, ESC, 96, 76, 2, '#4f565f');
  for (let i = 0; i < 9; i++) {
    rect(g, ESC + 4 + i * 8, 101 + i * 12, 20, 3, '#3d434b');
    rect(g, ESC + 4 + i * 8, 101 + i * 12, 20, 1, '#525a64');
  }
  rect(g, ESC + 72, 96, 3, GY - 96, '#33383f');
  // caixa do escritorio suspenso, vista por fora
  rect(g, ESC - 6, 40, 130, 58, '#2b3037');
  rect(g, ESC - 6, 40, 130, 3, '#3d454f');
  rect(g, ESC + 4, 50, 46, 30, '#6a5a30');
  rect(g, ESC + 56, 50, 46, 30, '#6a5a30');
  rect(g, ESC + 4, 50, 46, 3, '#8d7a42');
  rect(g, ESC + 56, 50, 46, 3, '#8d7a42');
  lights.push({ x: ESC + 54, y: 66, r: 132, color: '#dfae64', i: 0.5, falloff: 1.15 });
  inter.push({
    x: ESC + 20, y: GY - 40, w: 40, h: 40, prompt: 'prompt_open',
    action: 'goto', to: 'ch2_office', tox: 76, tofacing: 1, range: 34,
  });

  dockGate(g, 980, GY, 104, 5171);
  inter.push({
    x: 980, y: GY - 108, w: 104, h: 108, prompt: 'prompt_look',
    lines: 'c2_dockgate', range: 46, id: 'doca',
  });

  M.crate(g, 1140, GY, 1, 5181);
  M.crate(g, 1164, GY, 0, 5191);
  M.crate(g, 1146, GY - 17, 0, 5201);
  M.debris(g, 1240, GY, 44, 5211);
  M.puddle(g, 700, GY + 12, 70, 5221);
  M.puddle(g, 1290, GY + 16, 52, 5231);

  // correntes penduradas
  for (const cx of [330, 760, 1210, 1560]) {
    for (let i = 0; i < 34 + (cx % 26); i++) rect(g, cx + (i % 2), 14 + i * 2, 2, 1, '#2a2e33');
  }

  // A ripa de palete. Encostada numa coluna. Em pe.
  const COL = 1320;
  rect(g, COL, 30, 12, GY - 30, '#333941');
  rect(g, COL, 30, 3, GY - 30, '#454c56');
  rect(g, COL - 3, GY - 6, 18, 6, '#262b31');
  inter.push({
    x: COL + 10, y: GY - 46, w: 14, h: 46, prompt: 'prompt_take',
    action: 'take_club', range: 26, id: 'porrete',
  });

  // porta para o setor B
  const dB = M.doorFrame(g, 1640, GY, 5241);
  inter.push({
    x: dB.x, y: dB.y, w: dB.w, h: dB.h, prompt: 'prompt_open',
    action: 'goto', to: 'ch2_shelves', tox: 70, tofacing: 1, range: 30, isDoor: true,
  });

  // ---- luz ----
  //
  // Esta e a licao do B-23, e ela custou duas sessoes: luz calibrada para
  // uma sala nao serve num corredor de mil e setecentos pixels. Se as
  // lampadas ficam a 450px uma da outra, o meio do caminho e preto e o
  // jogador perde o proprio corpo de vista — e o setor que existe para
  // MOSTRAR o tamanho do lugar vira o setor onde nao se ve nada.
  //
  // A regra que ficou: lampada forte a cada ~400px, mais um preenchimento
  // fraco a cada ~200px na altura do chao. O escuro continua sendo o tom,
  // mas o espaco fica legivel.
  for (const lx of [240, 690, 1180, 1620]) {
    emergencyLamp(g, lx, 58);
    lights.push({ x: lx + 7, y: 68, r: 210, color: '#c98a5e', i: 0.72, falloff: 1.1 });
    lights.push({ x: lx + 7, y: 68, r: 30, color: '#ffd8a8', i: 0.55 });
    lights.push({ x: lx + 7, y: 196, r: 140, color: '#a8804e', i: 0.3, falloff: 1.35 });
  }
  for (const lx of [90, 460, 900, 1120, 1400, 1560]) {
    lights.push({ x: lx, y: 168, r: 150, color: '#7d6a52', i: 0.26, falloff: 1.4 });
  }
  // claraboias: duas facas de luar cortando o corredor
  for (const sx of [520, 1420]) {
    rect(g, sx, 0, 70, 12, '#0b0d10');
    rect(g, sx + 4, 1, 62, 9, '#3d4d63');
    rect(g, sx + 22, 1, 3, 9, '#0b0d10');
    lights.push({ x: sx + 34, y: 8, r: 210, color: '#6f8ec4', i: 0.56, falloff: 1.3 });
    lights.push({ x: sx + 34, y: 196, r: 140, color: '#5c78a8', i: 0.3, falloff: 1.4 });
  }
  // resto de luz por baixo do portao da doca
  lights.push({ x: 1032, y: 212, r: 100, color: '#b8905c', i: 0.34, falloff: 1.3 });

  const fore = makeBuffer(Math.ceil(VW + (W - VW) * 1.14) + 8, VH);
  {
    const f = fore.x;
    rect(f, 0, 0, f.canvas.width, 14, '#030202');
    rect(f, 0, VH - 8, f.canvas.width, 8, '#030202');
    for (const px of [180, 620, 1120, 1680]) rect(f, px, 0, 9, VH, '#050607');
  }

  const lvl = new Level({
    key: 'ch2_corridor',
    nameKey: 'loc_corridor',
    width: W, groundY: GY,
    ambient: '#2a3242',
    layers: [{ c: back.c, par: 0.45 }, { c: main.c, par: 1 }],
    fores: [{ c: fore.c, par: 1.14 }],
    lightDefs: lights,
    interactables: inter,
    weather: 'none',
    reflect: 0.05,
    minX: 34, maxX: W - 40,
    spawn: { x: 96, facing: 1 },
    bloom: 0.42,
    indoor: true,
    ambience: [{ n: 'hall', g: 0.12 }, { n: 'wind', g: 0.02 }],
    randomSfx: [
      { fn: 'drip', min: 4, max: 11, vol: 0.8 },
      { fn: 'metalCreak', min: 12, max: 28, vol: 0.85 },
      { fn: 'distantThump', min: 24, max: 54, vol: 0.7 },
      { fn: 'chainRattle', min: 18, max: 44, vol: 0.5 },
    ],
    // O corredor e o caminho de volta o capitulo inteiro. Ele so ganha
    // inimigos depois que o jogador ja conheceu o lugar.
    spawnTipos: ['semrosto'],
    ritmo: 42,
    maxInimigos: 2,
    esconderijos: [606, 1150],
    enterBarks: ['b2_corr_1', 'b2_corr_2'],
    barks: [
      { x: 420, key: 'b2_corr_3', range: 60 },
      { x: 520, key: 'b2_corr_4', range: 50 },
      { x: 1000, key: 'b2_corr_5', range: 60 },
    ],
  });
  lvl.docaX = 1032;
  itensSoltos(lvl, [{
    id: 'porrete', x: COL + 14, y: GY - 44,
    draw: (ctx, x, y) => {
      ctx.fillStyle = PAL.wood; ctx.fillRect(x, y, 4, 44);
      ctx.fillStyle = PAL.woodHi; ctx.fillRect(x, y, 1, 44);
      ctx.fillStyle = '#8f959e'; ctx.fillRect(x + 1, y - 2, 1, 3);
    },
  }]);
  return lvl;
}

// ---------------------------------------------------------------------------
// 2 — ESCRITORIO DA ADMINISTRACAO
// ---------------------------------------------------------------------------

export function buildOffice() {
  const W = 560;

  const back = makeBuffer(Math.ceil(VW + (W - VW) * 0.6) + 8, VH);
  {
    const b = back.x;
    rect(b, 0, 0, b.canvas.width, VH, '#080a0e');
    ditherV(b, 0, 40, b.canvas.width, 120, '#12161d', '#07090c', 6);
  }

  const main = makeBuffer(W, VH);
  const g = main.x;

  // sala envidracada: divisoria de madeira embaixo, vidro em cima
  rect(g, 0, 0, W, VH, '#1a1712');
  M.woodPanel(g, 0, 108, W, GY - 108, 5301, { hi: '#5c4229', mid: '#43301e', dk: '#2a1c11' });
  rect(g, 0, 104, W, 4, '#6a4b2c');
  rect(g, 0, 104, W, 1, '#8a6238');
  // gesso amarelado
  ditherV(g, 0, 26, W, 78, '#4a4232', '#38311f', 6);
  grainRect(g, 0, 26, W, 78, ['#2a2416', '#54492f', '#1e1a10'], 0.06, 5311);
  rect(g, 0, 0, W, 26, '#221c14');
  for (let x = 0; x < W; x += 18) rect(g, x, 4, 1, 20, '#2e2619');
  rect(g, 0, 24, W, 2, '#160f0a');
  // piso
  M.asphalt(g, 0, GY, W, VH - GY, 5321, { hi: '#3a352e', mid: '#2b2721', dk: '#1c1915' });
  rect(g, 0, GY, W, 1, '#0d0b09');

  const inter = [];
  const lights = [];

  // porta de volta para a escada
  const ex = M.doorFrame(g, 40, GY, 5331);
  inter.push({
    x: ex.x, y: ex.y, w: ex.w, h: ex.h, prompt: 'prompt_open',
    action: 'goto', to: 'ch2_corridor', tox: 900, tofacing: 1, range: 30, isDoor: true,
  });

  // janela envidracada dando para o corredor la embaixo
  rect(g, 130, 40, 120, 58, '#0d1218');
  rect(g, 130, 40, 120, 2, '#3f4a58');
  rect(g, 188, 40, 3, 58, '#2b333c');
  rect(g, 130, 96, 120, 3, '#2b333c');
  lights.push({ x: 190, y: 70, r: 96, color: '#5c78a8', i: 0.2, falloff: 1.4 });

  // quadro de avisos, com o mapa preso nele
  rect(g, 300, 46, 96, 52, '#3a2b1c');
  rect(g, 302, 48, 92, 48, '#54452e');
  rect(g, 352, 54, 36, 20, '#a89a80');
  rect(g, 352, 78, 30, 14, '#9a9080');
  inter.push({ x: 300, y: 46, w: 50, h: 52, prompt: 'prompt_take', action: 'take_map', range: 30, id: 'mapa' });
  inter.push({ x: 352, y: 46, w: 46, h: 52, prompt: 'prompt_look', lines: 'c2_board', range: 26 });

  // mesa com o caderno e a caneta
  const MESA = 190;
  rect(g, MESA, GY - 34, 108, 6, '#4a3524');
  rect(g, MESA, GY - 34, 108, 1, '#63482f');
  rect(g, MESA + 4, GY - 28, 6, 28, '#33261a');
  rect(g, MESA + 98, GY - 28, 6, 28, '#33261a');
  rect(g, MESA + 12, GY - 28, 60, 24, '#3a2b1e');
  for (let i = 0; i < 3; i++) rect(g, MESA + 16, GY - 24 + i * 7, 52, 1, '#241a12');
  inter.push({
    x: MESA + 26, y: GY - 46, w: 34, h: 16, prompt: 'prompt_take',
    action: 'take_journal', range: 26, id: 'caderno',
  });
  // luminaria de mesa que ainda funciona
  rect(g, MESA + 84, GY - 52, 2, 18, '#2a3038');
  rect(g, MESA + 78, GY - 56, 14, 5, '#39414a');
  rect(g, MESA + 80, GY - 51, 10, 2, '#ffdca8');
  lights.push({ x: MESA + 85, y: GY - 50, r: 128, color: '#e8b46a', i: 0.9, falloff: 0.9 });
  lights.push({ x: MESA + 85, y: GY - 50, r: 22, color: '#fff0c8', i: 0.9 });

  // foto na mesa
  rect(g, MESA + 12, GY - 48, 14, 12, '#2a2018');
  rect(g, MESA + 13, GY - 47, 12, 10, '#6a6152');
  rect(g, MESA + 15, GY - 45, 3, 5, '#8f8472');
  rect(g, MESA + 20, GY - 45, 3, 5, '#8f8472');
  rect(g, MESA + 13, GY - 43, 12, 1, '#c9c6bd');
  inter.push({ x: MESA + 10, y: GY - 50, w: 18, h: 16, prompt: 'prompt_look', lines: 'c2_photo', range: 22 });

  // caneca de cafe pela metade, ainda morna
  rect(g, MESA + 70, GY - 41, 8, 7, '#a89a80');
  rect(g, MESA + 78, GY - 39, 2, 3, '#a89a80');
  rect(g, MESA + 71, GY - 40, 6, 2, '#3a2a1c');
  inter.push({ x: MESA + 68, y: GY - 44, w: 14, h: 12, prompt: 'prompt_look', lines: 'c2_mug', range: 22 });

  // arquivo de aco — falta a gaveta do D
  const ARQ = 440;
  rect(g, ARQ, GY - 76, 42, 76, '#39434e');
  rect(g, ARQ, GY - 76, 42, 2, '#4c5866');
  for (let i = 0; i < 4; i++) {
    const dy = GY - 72 + i * 18;
    if (i === 1) {
      rect(g, ARQ + 3, dy, 36, 15, '#0b0e12');   // a gaveta que nao esta aqui
      continue;
    }
    rect(g, ARQ + 3, dy, 36, 15, '#414c58');
    rect(g, ARQ + 3, dy, 36, 1, '#556374');
    rect(g, ARQ + 16, dy + 6, 10, 3, '#8f959e');
  }
  inter.push({ x: ARQ, y: GY - 76, w: 42, h: 76, prompt: 'prompt_look', lines: 'c2_cabinet', range: 30 });

  // cadeira caida e a cadeira do vigia
  M.brokenChair(g, 340, GY, 5341);
  rect(g, 496, GY - 30, 22, 4, '#3a2b1e');
  rect(g, 496, GY - 52, 4, 24, '#3a2b1e');
  rect(g, 505, GY - 26, 4, 26, '#2a3038');
  rect(g, 500, GY - 2, 16, 2, '#2a3038');

  lights.push({ x: 470, y: 40, r: 176, color: '#c8a06a', i: 0.6, flick: 'bulb', falloff: 1.05 });
  // luz em cima da cadeira dele. O Vigia esta no turno dele, e quem esta no
  // turno tem luz.
  lights.push({ x: 508, y: 150, r: 130, color: '#b08c58', i: 0.42, falloff: 1.2 });
  lights.push({ x: 120, y: 170, r: 120, color: '#8a7a60', i: 0.26, falloff: 1.35 });

  const fore = makeBuffer(Math.ceil(VW + (W - VW) * 1.2) + 8, VH);
  rect(fore.x, 0, 0, fore.c.width, 10, '#040302');
  rect(fore.x, 0, VH - 8, fore.c.width, 8, '#040302');

  const lvl = new Level({
    key: 'ch2_office',
    nameKey: 'loc_office',
    width: W, groundY: GY,
    ambient: '#2e3546',
    layers: [{ c: back.c, par: 0.6 }, { c: main.c, par: 1 }],
    fores: [{ c: fore.c, par: 1.2 }],
    lightDefs: lights,
    interactables: inter,
    weather: 'none',
    reflect: 0.05,
    minX: 30, maxX: W - 40,
    spawn: { x: 76, facing: 1 },
    bloom: 0.42,
    indoor: true,
    safe: true,
    ambience: [{ n: 'roomtone', g: 0.1 }],
    randomSfx: [{ fn: 'drip', min: 8, max: 20, vol: 0.5 }],
    maxInimigos: 0,
    enterBarks: ['b2_off_1'],
  });
  itensSoltos(lvl, [
    {
      // um caderno de capa de couro. Aberto. Em branco. E uma caneta
      // tampada do lado.
      id: 'caderno', x: MESA + 30, y: GY - 41,
      draw: (ctx, x, y) => {
        ctx.fillStyle = '#2a1c12'; ctx.fillRect(x, y + 1, 26, 7);
        ctx.fillStyle = '#c9c1a8'; ctx.fillRect(x + 1, y, 24, 6);
        ctx.fillStyle = '#a89f88'; ctx.fillRect(x + 13, y, 1, 6);
        ctx.fillStyle = '#3a4048'; ctx.fillRect(x + 30, y + 4, 9, 2);
      },
    },
    {
      id: 'mapa', x: 306, y: 52,
      draw: (ctx, x, y) => {
        ctx.fillStyle = '#b9b0a2'; ctx.fillRect(x, y, 40, 32);
        ctx.fillStyle = '#5c5348';
        for (let i = 0; i < 6; i++) ctx.fillRect(x + 3, y + 4 + i * 4, 34, 1);
      },
    },
  ]);
  return lvl;
}

// ---------------------------------------------------------------------------
// 3 — SETOR B: AS ESTANTES
// ---------------------------------------------------------------------------

export function buildShelves() {
  const W = 1500;

  const back = makeBuffer(Math.ceil(VW + (W - VW) * 0.4) + 8, VH);
  {
    const b = back.x;
    trusses(b, b.canvas.width, VH);
    // fileiras de estante sumindo no fundo
    for (let x = 0; x < b.canvas.width; x += 150) rack(b, x, 96, 96, 118, 5400 + x, false);
    b.globalAlpha = 0.55;
    rect(b, 0, 0, b.canvas.width, VH, '#05070a');
    b.globalAlpha = 1;
  }

  const main = makeBuffer(W, VH);
  const g = main.x;
  warehouseWall(g, W, 5411, { corte: 126 });
  damp(g, [260, 700, 1160], 130);

  const inter = [];
  const lights = [];

  const ex = M.doorFrame(g, 44, GY, 5421);
  inter.push({
    x: ex.x, y: ex.y, w: ex.w, h: ex.h, prompt: 'prompt_open',
    action: 'goto', to: 'ch2_corridor', tox: 1600, tofacing: -1, range: 30, isDoor: true,
  });

  // O labirinto. Estantes de tres niveis, corredores estreitos, visao
  // bloqueada — coisas se mexem duas fileiras adiante e voce nao ve o que.
  const posicoes = [160, 300, 440, 620, 760, 900, 1060, 1200, 1340];
  for (let i = 0; i < posicoes.length; i++) {
    rack(g, posicoes[i], 46 + (i % 2) * 8, 104, GY - 46 - (i % 2) * 8, 5430 + i * 7, true);
  }

  // estante desabada de dentro para fora
  {
    const x = 520;
    rect(g, x, GY - 8, 96, 8, '#3a3f47');
    rect(g, x + 10, GY - 22, 76, 5, '#454b54');
    rect(g, x + 4, GY - 40, 6, 32, '#3a3f47');
    rect(g, x + 62, GY - 52, 5, 44, '#3a3f47');
    M.debris(g, x + 8, GY, 70, 5501);
    for (let i = 0; i < 6; i++) rect(g, x + 12 + i * 13, GY - 16 - (i % 3) * 6, 11, 9, '#3d3126');
  }
  inter.push({ x: 520, y: GY - 52, w: 96, h: 52, prompt: 'prompt_look', lines: 'c2_rack', range: 34 });

  // caixas lacradas, todas vazias
  M.crate(g, 700, GY, 1, 5511);
  M.crate(g, 724, GY, 0, 5521);
  M.crate(g, 706, GY - 17, 0, 5531);
  inter.push({ x: 700, y: GY - 36, w: 48, h: 36, prompt: 'prompt_look', lines: 'c2_boxes', range: 30 });

  // marca de arrasto: alguma coisa pesada passou por aqui, e nao faz muito
  {
    const rnd = mulberry32(5541);
    for (let i = 0; i < 120; i++) {
      const x = 1120 + i * 2.2;
      g.globalAlpha = 0.16 + rnd() * 0.16;
      rect(g, x, GY + 3 + Math.sin(i * 0.12) * 2, 3, 2, '#1a1512');
      rect(g, x, GY + 9 + Math.sin(i * 0.12) * 2, 2, 2, '#1a1512');
    }
    g.globalAlpha = 1;
  }
  inter.push({ x: 1180, y: GY, w: 100, h: 18, prompt: 'prompt_look', lines: 'c2_dragmark', range: 44 });

  // A MUNICAO. Numa prateleira, cheia, nova. E nao ha arma nenhuma neste
  // capitulo ate a sala de maquinas — e a jogada mais importante do bloco.
  const MUN = 980;
  inter.push({
    x: MUN - 4, y: GY - 64, w: 30, h: 20, prompt: 'prompt_take',
    action: 'take_ammo', range: 26, id: 'municao',
  });

  const dR = M.doorFrame(g, 1440, GY, 5551);
  inter.push({
    x: dR.x, y: dR.y, w: dR.w, h: dR.h, prompt: 'prompt_open',
    action: 'goto', to: 'ch2_locker', tox: 70, tofacing: 1, range: 30, isDoor: true,
  });

  // Aqui o escuro e o ponto: o labirinto so funciona se a visao for curta.
  // Mas curta nao e cega — o chao precisa aparecer.
  for (const lx of [380, 980, 1420]) {
    emergencyLamp(g, lx, 60);
    lights.push({ x: lx + 7, y: 70, r: 176, color: '#c98a5e', i: 0.6, falloff: 1.15 });
    lights.push({ x: lx + 7, y: 196, r: 120, color: '#a8804e', i: 0.26, falloff: 1.4 });
  }
  for (const lx of [120, 620, 800, 1180, 1300]) {
    lights.push({ x: lx, y: 150, r: 132, color: '#6a5c48', i: 0.26, falloff: 1.42 });
  }

  // Primeiro plano: e ele que faz o labirinto. Estantes cortando a tela,
  // por onde o jogador ve pedacos do que se mexe e nunca a coisa inteira.
  const fore = makeBuffer(Math.ceil(VW + (W - VW) * 1.3) + 8, VH);
  {
    const f = fore.x;
    rect(f, 0, 0, f.canvas.width, 12, '#030202');
    rect(f, 0, VH - 8, f.canvas.width, 8, '#030202');
    for (let x = 60; x < f.canvas.width; x += 210) {
      rect(f, x, 0, 14, VH, '#060708');
      rect(f, x - 26, 40, 66, 6, '#070809');
      rect(f, x - 26, 120, 66, 6, '#070809');
      rect(f, x - 26, 196, 66, 6, '#070809');
    }
  }

  const lvl = new Level({
    key: 'ch2_shelves',
    nameKey: 'loc_shelves',
    width: W, groundY: GY,
    ambient: '#242c3a',
    layers: [{ c: back.c, par: 0.4 }, { c: main.c, par: 1 }],
    fores: [{ c: fore.c, par: 1.3 }],
    lightDefs: lights,
    interactables: inter,
    weather: 'none',
    reflect: 0.04,
    minX: 34, maxX: W - 40,
    spawn: { x: 70, facing: 1 },
    bloom: 0.4,
    indoor: true,
    ambience: [{ n: 'hall', g: 0.1 }],
    randomSfx: [
      { fn: 'metalCreak', min: 8, max: 20, vol: 0.9 },
      { fn: 'drip', min: 6, max: 16, vol: 0.7 },
      { fn: 'distantThump', min: 18, max: 40, vol: 0.8 },
    ],
    spawnTipos: ['empilhado', 'semrosto'],
    ritmo: 22,
    maxInimigos: 3,
    esconderijos: [660, 1260],
    enterBarks: ['b2_shelf_1'],
    barks: [{ x: 640, key: 'b2_shelf_2', range: 60 }],
  });
  itensSoltos(lvl, [{
    id: 'municao', x: MUN, y: GY - 60,
    draw: (ctx, x, y) => {
      ctx.fillStyle = '#5d4a2c'; ctx.fillRect(x, y, 22, 12);
      ctx.fillStyle = '#8a6a38'; ctx.fillRect(x, y, 22, 2);
      ctx.fillStyle = '#3a2d1a'; ctx.fillRect(x + 3, y + 3, 16, 3);
    },
  }]);
  return lvl;
}

// ---------------------------------------------------------------------------
// 4 — VESTIARIO E REFEITORIO
// ---------------------------------------------------------------------------

export function buildLockerRoom() {
  const W = 1150;

  const back = makeBuffer(Math.ceil(VW + (W - VW) * 0.5) + 8, VH);
  {
    const b = back.x;
    rect(b, 0, 0, b.canvas.width, VH, '#0d1014');
    ditherV(b, 0, 30, b.canvas.width, 110, '#161b22', '#0a0d11', 6);
  }

  const main = makeBuffer(W, VH);
  const g = main.x;

  // Azulejo ate a meia altura: e o primeiro lugar do capitulo que foi feito
  // para gente, e nao para carga.
  rect(g, 0, 0, W, VH, '#1b1e21');
  ditherV(g, 0, 24, W, 84, '#4a4a44', '#3a3a36', 5);
  for (let x = 0; x < W; x += 14) rect(g, x, 24, 1, 84, '#2e2e2a');
  for (let y = 24; y < 108; y += 14) rect(g, 0, y, W, 1, '#2e2e2a');
  grainRect(g, 0, 24, W, 84, ['#333330', '#565650'], 0.05, 5601);
  rect(g, 0, 106, W, 3, '#5a5a52');
  M.brickWall(g, 0, 109, W, GY - 109, 5611, {
    base: '#3d3831', hi: '#484238', dk: '#2c2823', mortar: '#1e1b18', moss: false,
  });
  rect(g, 0, 0, W, 24, '#101214');
  M.asphalt(g, 0, GY, W, VH - GY, 5621, { hi: '#3d3a34', mid: '#2e2b26', dk: '#1f1d19' });
  rect(g, 0, GY, W, 1, '#0d0b09');
  // piso quadriculado, meio comido
  {
    const rnd = mulberry32(5631);
    for (let x = 0; x < W; x += 16) {
      for (let y = GY + 2; y < VH; y += 16) {
        if (rnd() > 0.45) rect(g, x, y, 15, 15, '#37342e');
      }
    }
  }

  const inter = [];
  const lights = [];

  const ex = M.doorFrame(g, 44, GY, 5641);
  inter.push({
    x: ex.x, y: ex.y, w: ex.w, h: ex.h, prompt: 'prompt_open',
    action: 'goto', to: 'ch2_shelves', tox: 1400, tofacing: -1, range: 30, isDoor: true,
  });

  // fileira de armarios, com um aberto — e o aberto que interessa
  locker(g, 150, GY, 6, 5651, [3]);
  inter.push({ x: 150, y: GY - 74, w: 60, h: 74, prompt: 'prompt_look', lines: 'c2_lockers', range: 30 });
  // O MACO. Fechado. Da marca dele. Isso ja nao e sorte.
  const ARM = 150 + 3 * 20;
  inter.push({
    x: ARM + 2, y: GY - 50, w: 20, h: 14, prompt: 'prompt_take',
    action: 'take_cigs', range: 24, id: 'maco',
  });
  // bilhete na porta do armario
  rect(g, 276, GY - 56, 12, 9, '#c9c1a8');
  for (let i = 0; i < 3; i++) rect(g, 278, GY - 54 + i * 3, 8, 1, '#5c5348');
  inter.push({ x: 272, y: GY - 60, w: 20, h: 16, prompt: 'prompt_read', lines: 'c2_locknote', range: 22 });

  locker(g, 300, GY, 4, 5661, []);

  // banco de vestiario
  rect(g, 400, GY - 18, 90, 5, '#5a4530');
  rect(g, 400, GY - 18, 90, 1, '#75593c');
  rect(g, 406, GY - 13, 5, 13, '#3a4048');
  rect(g, 480, GY - 13, 5, 13, '#3a4048');

  // ★ O ESPELHO. A unica cena em primeira pessoa do jogo inteiro esta atras
  // dele — e so para quem insistir tres vezes.
  const ESP = 560;
  M.crackedMirror(g, ESP, 44, 54, 62, 5671);
  rect(g, ESP - 3, 42, 60, 2, '#5c5a52');
  rect(g, ESP - 3, 106, 60, 3, '#4a4840');
  // pia embaixo
  rect(g, ESP - 6, 118, 66, 10, '#9a968c');
  rect(g, ESP - 6, 118, 66, 2, '#b6b2a6');
  rect(g, ESP + 20, 128, 6, 14, '#7f7b72');
  inter.push({
    x: ESP, y: 44, w: 54, h: 62, prompt: 'prompt_look',
    action: 'mirror', range: 28, id: 'espelho',
  });

  // quadro de escala do mes
  rect(g, 660, 40, 76, 46, '#2a2620');
  rect(g, 662, 42, 72, 42, '#8f8878');
  for (let r = 0; r < 5; r++) rect(g, 665, 46 + r * 8, 66, 1, '#5c554a');
  for (let c = 0; c < 6; c++) rect(g, 665 + c * 11, 44, 1, 38, '#5c554a');
  for (let i = 0; i < 7; i++) rect(g, 668 + (i % 6) * 11, 48 + ((i / 6) | 0) * 8, 5, 4, '#7a2018');
  inter.push({ x: 660, y: 40, w: 76, h: 46, prompt: 'prompt_look', lines: 'c2_roster', range: 28 });

  // refeitorio
  canteenTable(g, 700, GY, 120, 5681);
  canteenTable(g, 880, GY, 100, 5691);
  M.chair(g, 690, GY, false, 5701);
  M.chair(g, 830, GY, true, 5711);

  // maquina de cafe
  rect(g, 1000, GY - 62, 32, 62, '#3a3f47');
  rect(g, 1000, GY - 62, 32, 2, '#4c525c');
  rect(g, 1004, GY - 56, 24, 18, '#14181d');
  rect(g, 1006, GY - 54, 8, 6, '#5c4a1e');
  rect(g, 1006, GY - 30, 20, 14, '#1b1e22');
  rect(g, 1010, GY - 26, 12, 8, '#0d0f12');
  inter.push({ x: 1000, y: GY - 62, w: 32, h: 62, prompt: 'prompt_look', lines: 'c2_coffee', range: 28 });

  // radio em cima da mesa
  rect(g, 760, GY - 40, 22, 12, '#4a3a26');
  rect(g, 760, GY - 40, 22, 2, '#63513a');
  rect(g, 763, GY - 37, 9, 7, '#1c1611');
  rect(g, 775, GY - 37, 4, 4, '#8f959e');
  inter.push({ x: 756, y: GY - 44, w: 30, h: 18, prompt: 'prompt_use', lines: 'c2_radio', range: 24 });

  // porta de aco para a camara fria
  const cd = coldDoor(g, 618, GY, 5721);
  inter.push({
    x: cd.x, y: cd.y, w: cd.w, h: cd.h, prompt: 'prompt_open',
    action: 'goto', to: 'ch2_cold', tox: 70, tofacing: 1, range: 32, isDoor: true, sfx: 'heavy',
  });

  // porta para a sala de maquinas
  const dM = M.doorFrame(g, 1080, GY, 5731);
  inter.push({
    x: dM.x, y: dM.y, w: dM.w, h: dM.h, prompt: 'prompt_open',
    action: 'goto', to: 'ch2_machines', tox: 70, tofacing: 1, range: 30, isDoor: true,
  });

  // ---- luz: aqui ela e boa. E de proposito. ----
  for (const lx of [200, 460, 720, 980]) {
    rect(g, lx - 26, 20, 52, 5, '#2a3038');
    rect(g, lx - 22, 25, 44, 2, '#ffe6b0');
    lights.push({ x: lx, y: 30, r: 176, color: '#e8c48a', i: 0.72, falloff: 1.05 });
    lights.push({ x: lx, y: 30, r: 26, color: '#fff2d0', i: 0.6 });
  }
  // uma delas pisca. Uma so — o suficiente para o lugar nao ser confortavel.
  lights.push({ x: 720, y: 30, r: 96, color: '#e8c48a', i: 0.35, flick: 'bulb' });
  lights.push({ x: 560, y: 90, r: 92, color: '#cfd8e8', i: 0.3, falloff: 1.2 });

  const fore = makeBuffer(Math.ceil(VW + (W - VW) * 1.16) + 8, VH);
  rect(fore.x, 0, 0, fore.c.width, 10, '#040302');
  rect(fore.x, 0, VH - 8, fore.c.width, 8, '#040302');
  rect(fore.x, 340, 0, 8, VH, '#050607');

  const lvl = new Level({
    key: 'ch2_locker',
    nameKey: 'loc_locker',
    width: W, groundY: GY,
    ambient: '#33394a',
    layers: [{ c: back.c, par: 0.5 }, { c: main.c, par: 1 }],
    fores: [{ c: fore.c, par: 1.16 }],
    lightDefs: lights,
    interactables: inter,
    weather: 'none',
    reflect: 0.09,
    minX: 34, maxX: W - 40,
    spawn: { x: 70, facing: 1 },
    bloom: 0.5,
    indoor: true,
    safe: true,
    ambience: [{ n: 'roomtone', g: 0.11 }],
    randomSfx: [{ fn: 'drip', min: 9, max: 22, vol: 0.6 }],
    // O respiro tem que ser respiro de verdade. Aqui nao nasce ninguem.
    maxInimigos: 0,
    esconderijos: [160, 200, 320, 1010],
    enterBarks: ['b2_lock_1', 'b2_lock_2'],
  });
  itensSoltos(lvl, [{
    id: 'maco', x: ARM + 6, y: GY - 46,
    draw: (ctx, x, y) => {
      ctx.fillStyle = '#8d3128'; ctx.fillRect(x, y, 8, 6);
      ctx.fillStyle = '#c0bab0'; ctx.fillRect(x, y, 8, 2);
      ctx.fillStyle = '#4a4a52'; ctx.fillRect(x + 9, y + 2, 4, 4);
    },
  }]);
  return lvl;
}

// ---------------------------------------------------------------------------
// 5 — CAMARA FRIA
// ---------------------------------------------------------------------------

export function buildColdStore() {
  const W = 900;

  const main = makeBuffer(W, VH);
  const g = main.x;

  // aco por todo lado, e um chao que ainda tem gelo velho nos cantos
  rect(g, 0, 0, W, VH, '#161a1e');
  M.metalPanel(g, 0, 0, W, GY, 5801, { hi: '#3f464e', mid: '#2f353c', dk: '#1e2329' });
  for (let i = 0; i < 60; i++) {
    g.globalAlpha = 0.68 * (1 - i / 60);
    rect(g, 0, i, W, 1, '#04060a');
  }
  g.globalAlpha = 1;
  // rebites nas emendas
  for (let x = 20; x < W; x += 64) {
    rect(g, x, 0, 2, GY, '#252b32');
    for (let y = 16; y < GY; y += 18) rect(g, x - 1, y, 4, 2, '#454d56');
  }
  M.asphalt(g, 0, GY, W, VH - GY, 5811, { hi: '#3a4046', mid: '#2b3036', dk: '#1d2126' });
  rect(g, 0, GY, W, 1, '#0d1013');
  {
    const rnd = mulberry32(5821);
    for (let i = 0; i < 60; i++) {
      const x = rnd() * W, w = 8 + rnd() * 26;
      g.globalAlpha = 0.1 + rnd() * 0.14;
      rect(g, x, GY + 2 + rnd() * 40, w, 2 + rnd() * 3, '#9fc0e8');
    }
    g.globalAlpha = 1;
  }

  const inter = [];
  const lights = [];

  const cd = coldDoor(g, 40, GY, 5831);
  inter.push({
    x: cd.x, y: cd.y, w: cd.w, h: cd.h, prompt: 'prompt_open',
    action: 'goto', to: 'ch2_locker', tox: 660, tofacing: -1, range: 32, isDoor: true, sfx: 'heavy',
  });

  // trilho de ganchos correndo pelo teto. Vinte e tres. Ou vinte e quatro.
  rect(g, 140, 30, 700, 4, '#5c626b');
  rect(g, 140, 30, 700, 1, '#767d87');
  const ganchos = [];
  for (let i = 0; i < 23; i++) {
    const gx = 160 + i * 30;
    const len = 26 + (i % 4) * 5;
    meatHook(g, gx, 34, len);
    ganchos.push({ x: gx, len });
  }
  inter.push({ x: 380, y: 34, w: 200, h: 60, prompt: 'prompt_look', lines: 'c2_hooks', range: 60 });

  // termometro
  rect(g, 120, 96, 12, 34, '#2a3038');
  rect(g, 122, 98, 8, 26, '#c9c6bd');
  rect(g, 125, 102, 2, 20, '#7a1c14');
  rect(g, 124, 120, 4, 6, '#7a1c14');
  inter.push({ x: 116, y: 94, w: 20, h: 40, prompt: 'prompt_look', lines: 'c2_thermo', range: 24 });

  M.crate(g, 700, GY, 1, 5841);
  M.crate(g, 780, GY, 0, 5851);
  M.debris(g, 620, GY, 40, 5861);

  // A luz daqui e quase nada. O isqueiro e a lanterna, e ele so aguenta
  // alguns segundos por vez.
  lights.push({ x: 60, y: 150, r: 92, color: '#8fb4e8', i: 0.22, falloff: 1.4 });
  lights.push({ x: 470, y: 20, r: 120, color: '#7d94c4', i: 0.16, falloff: 1.5 });
  lights.push({ x: 860, y: 150, r: 76, color: '#6f8ec4', i: 0.14, falloff: 1.5 });

  const fore = makeBuffer(Math.ceil(VW + (W - VW) * 1.18) + 8, VH);
  rect(fore.x, 0, 0, fore.c.width, 12, '#020304');
  rect(fore.x, 0, VH - 8, fore.c.width, 8, '#020304');

  const lvl = new Level({
    key: 'ch2_cold',
    nameKey: 'loc_cold',
    width: W, groundY: GY,
    ambient: '#12161d',
    layers: [{ c: main.c, par: 1 }],
    fores: [{ c: fore.c, par: 1.18 }],
    lightDefs: lights,
    interactables: inter,
    weather: 'none',
    reflect: 0.12,
    minX: 34, maxX: W - 50,
    spawn: { x: 70, facing: 1 },
    bloom: 0.34,
    indoor: true,
    frio: true,
    ambience: [{ n: 'freezer', g: 0.13 }],
    randomSfx: [
      { fn: 'metalCreak', min: 7, max: 18, vol: 1 },
      { fn: 'drip', min: 5, max: 13, vol: 0.6 },
    ],
    spawnTipos: ['empilhado'],
    ritmo: 34,
    maxInimigos: 1,
    esconderijos: [740],
    enterBarksNow: ['b2_cold_1'],
    barks: [
      { x: 200, key: 'b2_cold_2', range: 50 },
      { x: 300, key: 'b2_cold_3', range: 50 },
    ],
  });

  // Os ganchos balancam quando a cena manda. Todos, no mesmo ritmo, e nao
  // ha vento aqui dentro.
  lvl.ganchos = ganchos;
  lvl.balanco = 0;
  lvl.casaco = 0;
  // Onde o casaco fica pendurado. O jogo acende uma luz fraca aqui
  // enquanto ele existe: sem isso a coisa aparece num ponto que a chama do
  // isqueiro nao alcanca, e o jogador nunca ve o que ele acabou de dizer
  // que viu.
  lvl.casacoX = ganchos[11].x;
  lvl.casacoY = 34 + ganchos[11].len + 16;
  lvl.onUpdate = (dt, t) => {
    if (lvl.balanco > 0) lvl.balancoT = (lvl.balancoT || 0) + dt;
  };
  lvl.drawProps = (ctx, cam) => {
    if (lvl.balanco <= 0) return;
    const a = Math.sin((lvl.balancoT || 0) * 2.2) * 6 * lvl.balanco;
    for (const h of lvl.ganchos) {
      const x = Math.round(h.x - cam.ix + a);
      const y = Math.round(34 - cam.iy);
      ctx.fillStyle = '#5c626b';
      for (let i = 0; i < h.len; i++) {
        ctx.fillRect(Math.round(h.x - cam.ix + a * (i / h.len)), y + i, 1, 1);
      }
      const b = y + h.len;
      ctx.fillStyle = '#6e747e';
      ctx.fillRect(x - 1, b, 3, 2);
      ctx.fillRect(x - 2, b + 2, 2, 3);
      ctx.fillRect(x - 3, b + 5, 2, 2);
    }
    // O que esta pendurado no gancho do meio: um sobretudo marrom. Vazio.
    // Quando a chama apaga e ele acende de novo, nao tem mais nada.
    if (lvl.casaco > 0) {
      const h = lvl.ganchos[11];
      const x = Math.round(h.x - cam.ix + a) - 7;
      const y = Math.round(34 + h.len - cam.iy) + 4;
      ctx.save();
      ctx.globalAlpha = lvl.casaco;
      ctx.fillStyle = PAL.coatDk;
      ctx.fillRect(x, y, 15, 34);
      ctx.fillStyle = PAL.coat;
      ctx.fillRect(x + 2, y + 2, 11, 30);
      ctx.fillStyle = PAL.coatHi;
      ctx.fillRect(x + 2, y + 2, 11, 2);
      ctx.fillRect(x + 6, y + 4, 2, 26);
      ctx.fillStyle = PAL.coatEdge;
      ctx.fillRect(x, y + 32, 15, 3);
      ctx.restore();
    }
  };
  return lvl;
}

// ---------------------------------------------------------------------------
// 6 — SALA DE MAQUINAS
// ---------------------------------------------------------------------------

export function buildMachineRoom() {
  const W = 950;

  const back = makeBuffer(Math.ceil(VW + (W - VW) * 0.55) + 8, VH);
  {
    const b = back.x;
    rect(b, 0, 0, b.canvas.width, VH, '#0a0c0f');
    for (let x = 0; x < b.canvas.width; x += 70) {
      rect(b, x, 60, 26, 130, '#12161c');
      rect(b, x, 60, 26, 2, '#181d24');
    }
    ditherV(b, 0, 40, b.canvas.width, 80, '#101419', '#08090c', 5);
  }

  const main = makeBuffer(W, VH);
  const g = main.x;
  warehouseWall(g, W, 5901, { corte: 96 });
  damp(g, [180, 520, 820], 100);

  const inter = [];
  const lights = [];

  const ex = M.doorFrame(g, 44, GY, 5911);
  inter.push({
    x: ex.x, y: ex.y, w: ex.w, h: ex.h, prompt: 'prompt_open',
    action: 'goto', to: 'ch2_locker', tox: 1060, tofacing: -1, range: 30, isDoor: true,
  });

  pipeRun(g, 0, 62, W, 5921);
  pipeRun(g, 0, 78, W, 5931);
  boiler(g, 150, GY, 78, 120, 5941);
  boiler(g, 250, GY, 62, 96, 5951);
  boiler(g, 760, GY, 88, 128, 5961);
  inter.push({ x: 150, y: GY - 120, w: 78, h: 120, prompt: 'prompt_look', lines: 'c2_boiler', range: 34 });

  // painel eletrico, desligado e selado com arame
  rect(g, 420, 100, 46, 56, '#2f353c');
  rect(g, 420, 100, 46, 2, '#414a54');
  rect(g, 424, 104, 38, 46, '#1b1e22');
  for (let i = 0; i < 5; i++) {
    rect(g, 428, 108 + i * 8, 12, 5, '#3d4148');
    rect(g, 444, 108 + i * 8, 12, 5, '#3d4148');
  }
  rect(g, 430, 152, 26, 3, '#8f959e');
  inter.push({ x: 420, y: 100, w: 46, h: 56, prompt: 'prompt_look', lines: 'c2_panel', range: 28 });

  // macacao de mecanico pendurado. Do tamanho dele, claro.
  rect(g, 520, 96, 2, 6, '#5c626b');
  rect(g, 512, 102, 18, 42, '#3d5064');
  rect(g, 512, 102, 18, 2, '#4e6479');
  rect(g, 519, 106, 3, 34, '#2c3b4b');
  rect(g, 512, 142, 8, 16, '#3d5064');
  rect(g, 522, 142, 8, 16, '#3d5064');
  inter.push({ x: 510, y: 96, w: 22, h: 62, prompt: 'prompt_look', lines: 'c2_overall', range: 26 });

  // A BANCADA, e a arma em cima dela. Nao esta caida. Esta POSTA, e
  // apontada para a porta por onde ele entra.
  const BAN = 600;
  rect(g, BAN, GY - 32, 96, 6, '#4a4238');
  rect(g, BAN, GY - 32, 96, 1, '#5f564a');
  rect(g, BAN + 4, GY - 26, 6, 26, '#33383f');
  rect(g, BAN + 86, GY - 26, 6, 26, '#33383f');
  inter.push({
    x: BAN + 26, y: GY - 42, w: 26, h: 14, prompt: 'prompt_take',
    action: 'take_gun', range: 26, id: 'pistola',
  });

  // escada para o mezanino
  rect(g, 870, 40, 4, GY - 40, '#33383f');
  for (let i = 0; i < 12; i++) {
    rect(g, 866 + i * 2, GY - 14 - i * 14, 24, 3, '#3d434b');
    rect(g, 866 + i * 2, GY - 14 - i * 14, 24, 1, '#525a64');
  }
  inter.push({
    x: 880, y: GY - 44, w: 44, h: 44, prompt: 'prompt_open',
    action: 'goto', to: 'ch2_mezz', tox: 80, tofacing: 1, range: 34,
  });

  for (const lx of [340, 700]) {
    emergencyLamp(g, lx, 40);
    lights.push({ x: lx + 7, y: 50, r: 186, color: '#c98a5e', i: 0.66, falloff: 1.12 });
    lights.push({ x: lx + 7, y: 190, r: 128, color: '#a8804e', i: 0.3, falloff: 1.35 });
  }
  lights.push({ x: 630, y: 176, r: 120, color: '#a8804e', i: 0.34, falloff: 1.3 });
  lights.push({ x: 120, y: 160, r: 128, color: '#7d6a52', i: 0.3, falloff: 1.4 });
  lights.push({ x: 880, y: 160, r: 128, color: '#7d6a52', i: 0.26, falloff: 1.4 });

  const fore = makeBuffer(Math.ceil(VW + (W - VW) * 1.2) + 8, VH);
  {
    const f = fore.x;
    rect(f, 0, 0, f.canvas.width, 12, '#030202');
    rect(f, 0, VH - 8, f.canvas.width, 8, '#030202');
    rect(f, 260, 0, 10, VH, '#050607');
    rect(f, 0, VH - 34, f.canvas.width, 5, '#060708');
  }

  const lvl = new Level({
    key: 'ch2_machines',
    nameKey: 'loc_machines',
    width: W, groundY: GY,
    ambient: '#262e3c',
    layers: [{ c: back.c, par: 0.55 }, { c: main.c, par: 1 }],
    fores: [{ c: fore.c, par: 1.2 }],
    lightDefs: lights,
    interactables: inter,
    weather: 'none',
    reflect: 0.05,
    minX: 34, maxX: W - 40,
    spawn: { x: 70, facing: 1 },
    bloom: 0.44,
    indoor: true,
    ambience: [{ n: 'hall', g: 0.09 }, { n: 'hum', g: 0.05 }],
    randomSfx: [
      { fn: 'metalCreak', min: 9, max: 22, vol: 0.9 },
      { fn: 'distantThump', min: 16, max: 38, vol: 0.8 },
    ],
    spawnTipos: ['semrosto'],
    ritmo: 40,
    maxInimigos: 2,
    esconderijos: [790],
    enterBarks: ['b2_mach_1'],
  });
  lvl.portaX = 60;
  // A arma nao esta caida. Esta POSTA, e apontada para a porta por onde ele
  // entra. E ela some da bancada no instante em que ele a pega.
  itensSoltos(lvl, [{
    id: 'pistola', x: BAN + 30, y: GY - 37,
    draw: (ctx, x, y) => {
      ctx.fillStyle = '#3f444b'; ctx.fillRect(x, y, 16, 4);
      ctx.fillStyle = '#727880'; ctx.fillRect(x, y, 12, 2);
      ctx.fillStyle = '#727880'; ctx.fillRect(x + 12, y + 2, 5, 3);
    },
  }]);
  return lvl;
}

// ---------------------------------------------------------------------------
// 7 — MEZANINO
// ---------------------------------------------------------------------------

export function buildMezzanine() {
  const W = 1000;

  // O fundo e o galpao inteiro visto de cima. E daqui que o jogador entende
  // o tamanho do lugar por onde ele andou.
  const back = makeBuffer(Math.ceil(VW + (W - VW) * 0.35) + 8, VH);
  {
    const b = back.x;
    rect(b, 0, 0, b.canvas.width, VH, '#080a0d');
    trusses(b, b.canvas.width, 120);
    for (let x = 0; x < b.canvas.width; x += 132) {
      rack(b, x, 150, 92, 108, 6000 + x, false);
    }
    b.globalAlpha = 0.6;
    rect(b, 0, 120, b.canvas.width, VH - 120, '#05070a');
    b.globalAlpha = 1;
    // duas lampadas de emergencia la embaixo, minusculas
    for (const lx of [140, 520, 900]) rect(b, lx, 176, 5, 2, '#8a5a30');
  }

  const main = makeBuffer(W, VH);
  const g = main.x;

  rect(g, 0, 0, W, VH, '#0b0d11');
  // a passarela: chapa xadrez de aco
  rect(g, 0, GY, W, 12, '#3a4048');
  rect(g, 0, GY, W, 2, '#4e5660');
  rect(g, 0, GY + 10, W, 2, '#232930');
  {
    const rnd = mulberry32(6011);
    for (let x = 0; x < W; x += 6) {
      for (let y = GY + 3; y < GY + 10; y += 4) {
        if (rnd() > 0.35) rect(g, x + (y % 8 ? 0 : 3), y, 3, 2, '#454c56');
      }
    }
  }
  rect(g, 0, GY + 12, W, VH - GY - 12, '#04060a');
  // parede parcial no fundo do mezanino
  M.metalPanel(g, 0, 40, W, GY - 40, 6021, { hi: '#333941', mid: '#262b32', dk: '#171b20' });
  for (let i = 0; i < 40; i++) {
    g.globalAlpha = 0.6 * (1 - i / 40);
    rect(g, 0, 40 + i, W, 1, '#04060a');
  }
  g.globalAlpha = 1;
  rect(g, 0, 0, W, 40, '#05070a');

  const inter = [];
  const lights = [];

  // escada de volta
  inter.push({
    x: 40, y: GY - 40, w: 40, h: 40, prompt: 'prompt_open',
    action: 'goto', to: 'ch2_machines', tox: 890, tofacing: -1, range: 32,
  });
  rect(g, 34, GY - 44, 4, 44, '#33383f');
  rect(g, 60, GY - 44, 4, 44, '#33383f');

  // a mesa telefonica, no meio da passarela
  switchboard(g, 600, GY);
  inter.push({ x: 596, y: GY - 48, w: 60, h: 48, prompt: 'prompt_look', lines: 'c2_switchboard', range: 30 });

  M.crate(g, 300, GY, 0, 6031);
  for (let i = 0; i < 40; i++) rect(g, 420 + (i % 2), 10 + i * 2, 2, 1, '#2a2e33');

  inter.push({ x: 200, y: GY - 30, w: 60, h: 30, prompt: 'prompt_look', lines: 'c2_railing', range: 40 });

  // Uma luminaria em cima dela, e mais nada. O resto do mezanino e escuro:
  // a mulher esta sentada no unico lugar iluminado da passarela.
  rect(g, 620, 44, 2, 22, '#2a3038');
  rect(g, 612, 66, 20, 5, '#39414a');
  rect(g, 615, 71, 14, 2, '#ffdca8');
  lights.push({ x: 622, y: 74, r: 148, color: '#e8b46a', i: 0.86, falloff: 0.95 });
  lights.push({ x: 622, y: 74, r: 24, color: '#fff0c8', i: 0.8 });
  lights.push({ x: 100, y: 180, r: 92, color: '#7d6a52', i: 0.26, falloff: 1.4 });
  lights.push({ x: 940, y: 180, r: 86, color: '#6f8ec4', i: 0.2, falloff: 1.45 });

  // guarda-corpo no primeiro plano: e ele que diz "voce esta la em cima"
  const fore = makeBuffer(Math.ceil(VW + (W - VW) * 1.1) + 8, VH);
  {
    const f = fore.x;
    railing(f, 0, GY + 14, f.canvas.width);
    rect(f, 0, 0, f.canvas.width, 12, '#030202');
    rect(f, 0, VH - 6, f.canvas.width, 6, '#030202');
  }

  return new Level({
    key: 'ch2_mezz',
    nameKey: 'loc_mezz',
    width: W, groundY: GY,
    ambient: '#20283a',
    layers: [{ c: back.c, par: 0.35 }, { c: main.c, par: 1 }],
    fores: [{ c: fore.c, par: 1.1 }],
    lightDefs: lights,
    interactables: inter,
    weather: 'none',
    reflect: 0.06,
    minX: 34, maxX: W - 60,
    spawn: { x: 80, facing: 1 },
    bloom: 0.46,
    indoor: true,
    ambience: [{ n: 'hall', g: 0.1 }, { n: 'wind', g: 0.03 }],
    randomSfx: [
      { fn: 'metalCreak', min: 10, max: 24, vol: 0.8 },
      { fn: 'chainRattle', min: 14, max: 34, vol: 0.5 },
    ],
    maxInimigos: 0,
  });
}

// ---------------------------------------------------------------------------
// 8 — DOCA 3
// ---------------------------------------------------------------------------

export function buildDock() {
  const W = 760;

  const back = makeBuffer(Math.ceil(VW + (W - VW) * 0.5) + 8, VH);
  {
    const b = back.x;
    rect(b, 0, 0, b.canvas.width, VH, '#0a0c10');
    trusses(b, b.canvas.width, VH);
  }

  const main = makeBuffer(W, VH);
  const g = main.x;
  warehouseWall(g, W, 6101, { corte: 110 });

  const inter = [];
  const lights = [];

  const ex = M.doorFrame(g, 40, GY, 6111);
  inter.push({
    x: ex.x, y: ex.y, w: ex.w, h: ex.h, prompt: 'prompt_open',
    action: 'goto', to: 'ch2_corridor', tox: 1032, tofacing: -1, range: 30, isDoor: true,
  });

  // plataforma de carga
  rect(g, 200, GY - 20, W - 200, 20, '#3a352e');
  rect(g, 200, GY - 20, W - 200, 2, '#4c463c');
  rect(g, 200, GY - 20, 3, 20, '#2a251f');

  // tres portoes: dois fechados, e a doca 3
  dockGate(g, 260, GY - 20, 96, 6121);
  dockGate(g, 380, GY - 20, 96, 6131);
  dockGate(g, 500, GY - 20, 100, 6141, true);
  rect(g, 500, GY - 128, 100, 6, '#151a1f');
  // o numero pintado na parede — so o 3. A barra que ficava do lado dele
  // fazia o portao virar "13".
  rect(g, 548, GY - 148, 12, 4, '#8a8272');
  rect(g, 556, GY - 144, 4, 5, '#8a8272');
  rect(g, 548, GY - 140, 12, 4, '#8a8272');
  rect(g, 556, GY - 136, 4, 5, '#8a8272');
  rect(g, 548, GY - 132, 12, 4, '#8a8272');

  inter.push({
    x: 500, y: GY - 128, w: 100, h: 108, prompt: 'prompt_open',
    action: 'sair', range: 52, id: 'saida',
  });
  inter.push({ x: 380, y: GY - 128, w: 96, h: 108, prompt: 'prompt_look', lines: 'c2_dockdoor', range: 40 });

  M.crate(g, 150, GY, 1, 6151);
  M.crate(g, 700, GY - 20, 0, 6161);
  M.debris(g, 320, GY - 20, 40, 6171);

  emergencyLamp(g, 180, 60);
  lights.push({ x: 187, y: 70, r: 120, color: '#c07a52', i: 0.44, falloff: 1.25 });
  // a chuva do lado de fora, entrando pela doca aberta
  lights.push({ x: 550, y: 150, r: 200, color: '#6f8ec4', i: 0.5, falloff: 1.3 });
  lights.push({ x: 550, y: 60, r: 96, color: '#8fb4e8', i: 0.36, falloff: 1.2 });

  const fore = makeBuffer(Math.ceil(VW + (W - VW) * 1.14) + 8, VH);
  rect(fore.x, 0, 0, fore.c.width, 12, '#030202');
  rect(fore.x, 0, VH - 8, fore.c.width, 8, '#030202');

  return new Level({
    key: 'ch2_dock',
    nameKey: 'loc_dock',
    width: W, groundY: GY,
    ambient: '#232b3a',
    layers: [{ c: back.c, par: 0.5 }, { c: main.c, par: 1 }],
    fores: [{ c: fore.c, par: 1.14 }],
    lightDefs: lights,
    interactables: inter,
    weather: 'none',
    reflect: 0.08,
    minX: 34, maxX: W - 40,
    spawn: { x: 70, facing: 1 },
    bloom: 0.5,
    indoor: true,
    // A chuva volta a ser ouvida aqui, abafada: e o primeiro sinal de que
    // existe um lado de fora.
    ambience: [{ n: 'hall', g: 0.07 }, { n: 'rain', g: 0.05 }],
    randomSfx: [{ fn: 'thunder', min: 20, max: 50, vol: 0.35 }],
    maxInimigos: 0,
    enterBarks: ['b2_chase_5'],
  });
}

// Tudo do capitulo, montado de uma vez. O boot chama isto depois das fases
// do Capitulo 1 — a construcao inteira leva alguns quadros.
export function buildChapter2() {
  return {
    ch2_corridor: buildCorridor(),
    ch2_office: buildOffice(),
    ch2_shelves: buildShelves(),
    ch2_locker: buildLockerRoom(),
    ch2_cold: buildColdStore(),
    ch2_machines: buildMachineRoom(),
    ch2_mezz: buildMezzanine(),
    ch2_dock: buildDock(),
  };
}
