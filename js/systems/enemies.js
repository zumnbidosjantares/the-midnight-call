// enemies.js — os inimigos, e o Diretor que decide quando eles existem.
//
// REGRA QUE VALE PARA TODOS: nenhum deles pode ser um monstro generico.
// Cada um tem que ser reconhecivel como uma IDEIA, porque cada um e um medo
// dele que vazou. E o detetive nunca explica o que eles sao. Ele so reage:
// "...eu conheco isso."
//
// Nada aqui e uma peca de arte nova. Sao o MESMO esqueleto do detetive,
// usado errado — que e exatamente o que as coisas sao.

import { clamp, VW } from '../core/gfx.js';
import { audio } from '../core/audio.js';
import { Detective } from '../art/detective.js';

export const TIPOS = {
  // OS EMPILHADOS — corpo dobrado sobre si mesmo como cadeira empilhada,
  // andando de quatro. Vem das cadeiras arrumadas no meio do estrago do
  // bar: ordem imposta sobre destruicao.
  empilhado: {
    // Tingimento forte demais apaga a sombra interna do boneco e a coisa
    // vira um borrao claro rastejando. O que tem que se ler e um CORPO
    // dobrado errado — para isso o desenho de baixo precisa continuar
    // aparecendo por dentro da cor.
    // E a mesma regra da paleta do jogo inteiro: a cena e MULTIPLICADA pela
    // luz, entao cor "realista" vira preto. Estes tons parecem claros
    // demais no codigo e saem certos na tela.
    anim: 'crawl', vel: 26, hp: 3, dano: 15, alcance: 22, recarga: 1.5,
    tint: '#6b5a62', tintK: 0.62, faceless: true, scaleX: 1.14, scaleY: 0.82,
  },
  // OS SEM-ROSTO — gente normal, roupa normal, rosto ALISADO. Andam devagar,
  // cercam, e so machucam quem ficou sem saida. Sao as pessoas que ele nao
  // conseguiu salvar e cujos rostos ele ja nao lembra.
  semrosto: {
    // Tem que ler como GENTE, nao como fantasma. Tingimento claro demais
    // fazia eles brilharem no escuro e a coisa virava assombracao de
    // lencol — o medo aqui e outro: sao pessoas, e ele nao lembra a cara
    // de nenhuma.
    anim: 'shamble', vel: 17, hp: 2, dano: 11, alcance: 19, recarga: 1.9,
    tint: '#6e6a79', tintK: 0.7, faceless: true, scaleX: 1, scaleY: 1,
    encara: true,
  },
  // O ECOADOR — nao ataca. Onde ele aparece, coisa ruim vem. Quando esta
  // perto, TOCA TELEFONE, e o som vem do nada.
  ecoador: {
    anim: 'shamble', vel: 13, hp: 0, dano: 0, alcance: 0, recarga: 0,
    silhueta: '#05050a', alpha: 0.5, scaleX: 0.8, scaleY: 1.08,
    alarme: true, invulneravel: true,
  },
  // O CREDOR — a conta com pernas. Alto demais, o sobretudo dele grande
  // demais, arrastando no chao, e o cano do galpao na mao direita. Nao
  // morre. Tiro faz ele parar; nada mais.
  credor: {
    anim: 'dragWalk', vel: 30, hp: 0, dano: 34, alcance: 24, recarga: 2.4,
    silhueta: '#050406', scaleX: 1.04, scaleY: 1.34, invulneravel: true,
    cano: true, pesado: true,
  },
};

export class Enemy {
  constructor(tipo, x, y) {
    this.tipo = tipo;
    this.cfg = TIPOS[tipo];
    this.x = x; this.y = y;
    this.facing = 1;
    this.hp = this.cfg.hp;
    this.state = 'walk';
    this.t = 0;
    this.cd = 0;
    this.stun = 0;
    this.morto = 0;
    this.alpha = this.cfg.alpha === undefined ? 1 : this.cfg.alpha;
    this.fake = false;        // alucinacao: some quando acertada
    this.ringT = 1.5;
    this.encaraT = 0;
    this.vivo = true;
    this._px = x;

    const d = this.det = new Detective();
    // Contorno frio um pouco mais forte que o do detetive. Eles vivem no
    // escuro, e sem essa casquinha de luz na borda somem no cenario — o
    // susto tem que vir de ver, nao de nao ver.
    d.rimAlpha = this.cfg.silhueta ? 0 : 0.34;
    d.rimColor = '#8fa8c8';
    d.reflect = 0;
    d.faceless = !!this.cfg.faceless;
    if (this.cfg.silhueta) d.silhouette = this.cfg.silhueta;
    else { d.tint = this.cfg.tint; d.tintK = this.cfg.tintK; }
    d.scaleX = this.cfg.scaleX || 1;
    d.scaleY = this.cfg.scaleY || 1;
    d.alpha = this.alpha;
    if (this.cfg.cano) d.props.pipe = 'hand';
    d.onEvent = (ev) => this._evento(ev);
    d.play(this.cfg.anim, { blend: 0 });
  }

  // Som de passo com volume pela distancia. Fora do alcance nem toca: um
  // galpao inteiro de passos audiveis viraria papel amassado.
  _evento(ev) {
    const dist = this.dist;
    if (dist > 240) return;
    const v = clamp(1 - dist / 260, 0.12, 1);
    if (ev === 'crawlstep') audio.step(false, 0.34 * v);
    else if (ev === 'softstep') audio.step(false, 0.24 * v);
    else if (ev === 'heavystep') { audio.step(false, 0.62 * v); audio.dragMetal(0.85 * v); }
  }

  get dist() { return Math.abs(this._px - this.x); }

  // ---------------------------------------------------------------------

  update(dt, player, level) {
    this._px = player.x;
    this.t += dt;
    if (this.cd > 0) this.cd -= dt;
    const d = this.det;

    if (this.state === 'dead') {
      this.morto += dt;
      d.update(dt);
      d.alpha = clamp(1.6 - this.morto, 0, 1) * this.alpha;
      if (this.morto > 2.2) this.vivo = false;
      return;
    }

    if (this.stun > 0) {
      this.stun -= dt;
      d.update(dt);
      if (this.stun <= 0) d.play(this.cfg.anim, { blend: 0.16 });
      return;
    }

    const dx = player.x - this.x;
    const dist = Math.abs(dx);
    const dir = Math.sign(dx) || 1;

    // O Ecoador nao chega perto e nao ataca. Ele TOCA TELEFONE, cada vez
    // mais alto conforme se aproxima — e o alarme, nao a ameaca.
    if (this.cfg.alarme) {
      this.ringT -= dt;
      if (this.ringT <= 0) {
        this.ringT = 3.4 + Math.random() * 3.2;
        audio.phoneRing(clamp(1 - dist / 320, 0.18, 1), clamp(dist / 320, 0, 0.9));
      }
      // meia distancia: foge se voce chega, segue se voce afasta
      const alvo = 130;
      if (dist < alvo - 20) this.x -= dir * this.cfg.vel * dt;
      else if (dist > alvo + 40) this.x += dir * this.cfg.vel * dt;
      this.facing = dir;
      d.setFacing(dir);
      d.update(dt);
      return;
    }

    if (this.state === 'attack') {
      d.update(dt);
      if (d.done) { this.state = 'walk'; d.play(this.cfg.anim, { blend: 0.18 }); }
      return;
    }

    // Os Sem-Rosto param e OLHAM DE VOLTA de vez em quando. Um inimigo que
    // encara sem atacar assusta mais do que um que corre para cima.
    if (this.cfg.encara && this.encaraT > 0) {
      this.encaraT -= dt;
      this.facing = dir; d.setFacing(dir);
      if (d.anim !== 'idle') d.play('idle', { blend: 0.3 });
      d.update(dt);
      return;
    }

    if (dist <= this.cfg.alcance && this.cd <= 0) {
      this.state = 'attack';
      this.cd = this.cfg.recarga;
      this.facing = dir; d.setFacing(dir);
      d.play(this.tipo === 'empilhado' ? 'punch2' : 'punch1', { restart: true, blend: 0.06 });
      this.golpeDado = false;
      return;
    }

    if (dist > this.cfg.alcance - 4) {
      this.facing = dir;
      d.setFacing(dir);
      this.x += dir * this.cfg.vel * dt;
      if (level) this.x = clamp(this.x, level.minX - 30, level.maxX + 30);
      if (d.anim !== this.cfg.anim) d.play(this.cfg.anim, { blend: 0.2 });
      if (this.cfg.encara && Math.random() < dt * 0.08) this.encaraT = 1.4 + Math.random() * 1.6;
    }
    d.update(dt);
  }

  // Momento exato em que o golpe conta. Quem decide e o jogo, nao a
  // animacao: assim o dano nunca sai de uma pose que ficou congelada.
  acertou() {
    if (this.state !== 'attack' || this.golpeDado) return false;
    if (this.det.time < 0.20) return false;
    this.golpeDado = true;
    return Math.abs(this._px - this.x) <= this.cfg.alcance + 7;
  }

  levarDano(n, deX) {
    if (this.state === 'dead') return false;
    // Alucinacao: some quando acertada. A bala foi gasta do mesmo jeito, e
    // e isso que faz o jogador desconfiar do proprio dedo.
    if (this.fake) {
      this.state = 'dead';
      this.morto = 1.0;
      audio.whisper(1.2);
      return 'fake';
    }
    if (this.cfg.invulneravel) {
      this.stun = this.cfg.pesado ? 1.1 : 0.5;
      this.det.play('hurt', { restart: true, blend: 0.05 });
      audio.punchHit(0.5);
      return 'stun';
    }
    this.hp -= n;
    const dir = Math.sign(this.x - deX) || 1;
    this.x += dir * 5;
    if (this.hp <= 0) {
      this.state = 'dead';
      this.morto = 0;
      this.det.play('collapse', { restart: true, blend: 0.06 });
      return 'morreu';
    }
    this.stun = 0.34;
    this.det.play('hurt', { restart: true, blend: 0.05 });
    return 'stun';
  }

  draw(ctx, cam) {
    this.det.draw(ctx, this.x - cam.ix, this.y - cam.iy);
  }
}

// ---------------------------------------------------------------------------
// O DIRETOR
//
// Nao e gerador de ondas. E um diretor, que decide quando VALE A PENA por
// alguem em cena — mesma ideia do Left 4 Dead, adaptada para um jogo em que
// tudo e a cabeca do protagonista.
//
// Regras que nao podem ser quebradas:
//   · NUNCA aparecer dentro do campo de visao. Sempre do escuro, sempre de
//     fora da tela. Como e a mente dele, isso e diegetico.
//   · Nunca dois seguidos no mesmo lugar.
//   · Sempre existe rota de fuga: o jogo nunca obriga a lutar.
//   · Depois de um combate, 40 a 60 segundos de silencio.
//
// E isso que evita o problema de "so andar e bater". O ritmo tem que ser
// tenso-calmo-tenso, nao uma esteira.
// ---------------------------------------------------------------------------

const TETO = 3;

export class Director {
  constructor() {
    this.lista = [];
    this.calma = 12;          // segundos de silencio ainda devidos
    this.ultimoX = -9999;
    this.ligado = false;
    this.onSpawn = null;
  }

  reset(calma = 14) {
    this.lista.length = 0;
    this.calma = calma;
    this.ultimoX = -9999;
  }

  get vivos() {
    let n = 0;
    for (const e of this.lista) if (e.state !== 'dead') n++;
    return n;
  }

  // Depois de uma briga, silencio. Sem isso o jogo vira esteira.
  respirar(seg) { this.calma = Math.max(this.calma, seg); }

  update(dt, ctx) {
    const { player, level, sanity } = ctx;

    for (const e of this.lista) e.update(dt, player, level);
    for (let i = this.lista.length - 1; i >= 0; i--) if (!this.lista[i].vivo) this.lista.splice(i, 1);

    if (!this.ligado || !level || !level.spawnTipos || !level.spawnTipos.length) return;

    this.calma -= dt;
    if (this.calma > 0) return;
    const teto = level.maxInimigos === undefined ? TETO : level.maxInimigos;
    if (this.vivos >= Math.min(TETO, teto)) return;

    // Quanto pior a cabeca dele, mais o lugar produz. E o unico numero do
    // jogo que o jogador consegue sentir sem nunca ver.
    const s = sanity ? sanity.value : 100;
    const pressa = clamp(1 + (100 - s) / 45, 1, 3.2);
    const base = (level.ritmo || 26) / pressa;
    if (Math.random() > dt / base) return;

    const x = this._lugar(player, level);
    if (x === null) return;
    const tipo = level.spawnTipos[(Math.random() * level.spawnTipos.length) | 0];
    const e = new Enemy(tipo, x, level.groundY);
    // Abaixo de VAZANDO, parte do que aparece nao esta la.
    if (s < 50 && tipo !== 'ecoador' && Math.random() < (s < 25 ? 0.45 : 0.22)) e.fake = true;
    this.lista.push(e);
    this.ultimoX = x;
    this.calma = 2.5;
    if (this.onSpawn) this.onSpawn(e);
  }

  // Escolhe um lugar FORA DA TELA e longe do ultimo. Se os dois lados
  // estiverem bloqueados pelas bordas da fase, nao nasce ninguem: melhor o
  // silencio do que um inimigo brotando na cara do jogador.
  _lugar(player, level) {
    const margem = VW / 2 + 40;
    const op = [];
    for (const s of [-1, 1]) {
      const x = player.x + s * (margem + Math.random() * 90);
      if (x < level.minX + 20 || x > level.maxX - 20) continue;
      if (Math.abs(x - this.ultimoX) < 120) continue;
      op.push(x);
    }
    if (!op.length) return null;
    return op[(Math.random() * op.length) | 0];
  }

  // Poe alguem na cena na marra (a emboscada da sala de maquinas).
  forcar(tipo, x, y) {
    const e = new Enemy(tipo, x, y);
    this.lista.push(e);
    this.calma = 3;
    return e;
  }

  draw(ctx, cam) {
    for (const e of this.lista) e.draw(ctx, cam);
  }

  // Inimigo mais perto do jogador dentro de um alcance, opcionalmente so
  // do lado para onde ele esta virado.
  maisPerto(x, alcance, facing) {
    let melhor = null, bd = 1e9;
    for (const e of this.lista) {
      if (e.state === 'dead') continue;
      if (e.cfg.alarme) continue;         // no Ecoador nao se bate
      const dx = e.x - x;
      if (facing && Math.sign(dx) !== facing && Math.abs(dx) > 8) continue;
      const d = Math.abs(dx);
      if (d < alcance && d < bd) { bd = d; melhor = e; }
    }
    return melhor;
  }

  // Distancia do inimigo vivo mais proximo — a sanidade usa isso para saber
  // se ele esta vendo alguma coisa.
  distanciaMaisProximo(x) {
    let bd = 1e9;
    for (const e of this.lista) {
      if (e.state === 'dead') continue;
      bd = Math.min(bd, Math.abs(e.x - x));
    }
    return bd;
  }

  limpar() { this.lista.length = 0; }
}
