// chase.js — O CREDOR, e os dez minutos finais do capitulo.
//
// Na narracao de abertura ele diz: "Se existe uma conta esperando por
// mim... ja passou da hora de pagar." O Credor e essa conta com pernas.
//
// O QUE ELE E: alto demais. Sobretudo IGUAL AO DELE, mas grande demais,
// arrastando no chao. Sem rosto sob a gola levantada. E arrasta um cano de
// metal — o MESMO cano com que o detetive se soltou no fim do Capitulo 1.
//
// O QUE ELE NAO PODE SER:
//   · rapido demais — terror de perseguicao funciona quando voce QUASE
//     consegue;
//   · burro — se der para enganar em circulo, morre a tensao;
//   · barulhento o tempo todo — o silencio dele e pior.
//
// REGRA DE OURO: o jogador precisa OUVIR o cano arrastando antes de ver.
//
// E o que faz a coisa funcionar nao e ele: e o mapa. O jogador ja conhece
// os sete setores, e agora eles viraram armadilha.

import { clamp, gfx, VW } from '../core/gfx.js';
import { audio } from '../core/audio.js';
import { Enemy } from './enemies.js';

// Ordem em que as luzes vao apagando, do mezanino ate a doca. Ele vem
// vindo, e o jogador ve por onde.
const ORDEM_APAGAR = [
  'ch2_mezz', 'ch2_machines', 'ch2_locker', 'ch2_cold', 'ch2_shelves', 'ch2_corridor',
];

export class Chase {
  constructor() {
    this.ativo = false;
    this.credor = null;
    this.levelKey = null;      // onde ele esta agora
    this.chegada = 0;          // quanto falta para ele entrar na sua fase
    this.lastX = 0;
    this.estado = 'cacar';     // cacar | procurar
    this.procuraT = 0;
    this.apagou = 0;
    this.t = 0;
    this.buscaT = 0;
    this.onFala = null;
    this.onDano = null;
    this._orig = new Map();
  }

  // -------------------------------------------------------------------

  comecar(levels, deLevel, deX) {
    this.ativo = true;
    this.t = 0;
    this.apagou = 0;
    this.estado = 'cacar';
    this.levelKey = deLevel;
    this.jogadorLevel = deLevel;
    this.lastX = deX;
    this.chegada = 8;          // ele nao aparece junto: primeiro se ouve
    this.dano = 0;
    this.credor = new Enemy('credor', deX, 214);
    this.levels = levels;
    audio.startDread();
    // A motosserra comeca a roncar AGORA, no outro lado do galpao, e nao
    // para mais ate o fim do capitulo.
    audio.startLoop('serra', { gain: 0.04, fade: 3 });
  }

  parar() {
    this.ativo = false;
    this.credor = null;
    audio.stopDread(1.2);
    audio.stopLoop('serra', 1.6);
    this._restaurar();
  }

  // Estado salvavel. Sem isto, carregar um save feito no meio da fuga
  // devolvia o jogador a um galpao apagado, com a musica de tensao tocando
  // e SEM o Credor — e com o portao da doca fechado, ou seja, sem saida.
  save() {
    if (!this.ativo) return null;
    return {
      lvl: this.levelKey, x: Math.round(this.credor ? this.credor.x : 0),
      lastX: Math.round(this.lastX), apagou: this.apagou,
      t: Math.round(this.t), estado: this.estado,
    };
  }

  load(d, levels, levelKeyDoJogador) {
    if (!d) { this.ativo = false; this.credor = null; return; }
    this.comecar(levels, d.lvl, d.x || 0);
    this.t = d.t || 0;
    this.lastX = d.lastX || 0;
    this.estado = d.estado || 'cacar';
    this.jogadorLevel = levelKeyDoJogador;
    if (this.credor) this.credor.x = d.x || 0;
    // reaplica o apagao dos setores que ja estavam no escuro
    this.apagou = 0;
    for (let i = 0; i < (d.apagou || 0) && i < ORDEM_APAGAR.length; i++) {
      this._apagarSetor(ORDEM_APAGAR[i]);
      this.apagou++;
    }
    // Se ele estava noutro setor, mantem a distancia — carregar um save
    // nunca pode devolver o jogador com o Credor colado nele.
    if (this.levelKey !== levelKeyDoJogador) this.chegada = 9;
  }

  // As luzes de emergencia do galpao inteiro comecam a apagar SETOR POR
  // SETOR, vindo na direcao dele. Guarda a intensidade original para o
  // capitulo poder terminar sem deixar o mundo no escuro para sempre.
  _apagarSetor(key) {
    const lv = this.levels && this.levels[key];
    if (!lv || this._orig.has(key)) return;
    const antes = lv.lightDefs.map(f => f.i);
    this._orig.set(key, antes);
    for (const f of lv.lightDefs) f.i *= 0.16;
  }

  _restaurar() {
    for (const [key, antes] of this._orig) {
      const lv = this.levels && this.levels[key];
      if (!lv) continue;
      for (let i = 0; i < lv.lightDefs.length; i++) lv.lightDefs[i].i = antes[i];
    }
    this._orig.clear();
  }

  // -------------------------------------------------------------------

  update(dt, ctx) {
    if (!this.ativo) return;
    const { player, level, levelKey, escondido, prendendo } = ctx;
    this.t += dt;

    // ---- as luzes apagando, uma fase de cada vez ----
    if (this.apagou < ORDEM_APAGAR.length && this.t > 4 + this.apagou * 9) {
      this._apagarSetor(ORDEM_APAGAR[this.apagou]);
      this.apagou++;
      audio.distantThump(0.9);
      gfx.shake(1.4, 0.3);
    }

    // ---- trocou de setor: ele NAO vem junto ----
    //
    // Este era o pior defeito da perseguicao. `chegada` era acertado uma
    // vez, no comeco, e nunca mais: depois da primeira chegada ele ficava
    // em zero, e trocar de sala punha o Credor em cima do jogador no mesmo
    // quadro. Fugir nao servia para nada.
    //
    // Agora cada porta atravessada compra tempo — pouco, mas compra. E e
    // esse tempo que transforma o mapa numa ferramenta em vez de numa
    // sentenca.
    if (levelKey !== this.jogadorLevel) {
      this.jogadorLevel = levelKey;
      if (this.levelKey !== levelKey) {
        this.chegada = 7 + Math.random() * 4;
        this.estado = 'cacar';
      }
    }

    // ---- ele nao esta na sua fase: esta vindo ----
    if (this.levelKey !== levelKey) {
      this.chegada -= dt;
      // O som chega antes dele. Sempre. A motosserra fica mais alta
      // conforme ele se aproxima da porta.
      audio.setLoopGain('serra', clamp(0.10 - this.chegada * 0.008, 0.02, 0.1), 0.6);
      this.buscaT -= dt;
      if (this.buscaT <= 0) {
        this.buscaT = 1.4 + Math.random() * 1.6;
        audio.dragMetal(clamp(0.4 - this.chegada * 0.02, 0.1, 0.4));
      }
      audio.setDread(clamp(0.22 - this.chegada * 0.015, 0.08, 0.42));
      if (this.chegada <= 0) {
        this.levelKey = levelKey;
        // Entra pela porta por onde VOCE entrou, do lado de fora da tela.
        const lado = player.x > (level.minX + level.maxX) / 2 ? -1 : 1;
        this.credor.x = clamp(player.x - lado * (VW / 2 + 60), level.minX, level.maxX);
        this.credor.y = level.groundY;
        this.lastX = player.x;
        audio.doorSlam(0.7);
        gfx.shake(2.4, 0.4);
        if (this.onFala) this.onFala('b2_chase_3');
      }
      return;
    }

    // ---- ele esta aqui ----
    const c = this.credor;
    const dist = Math.abs(player.x - c.x);

    // Escondido e prendendo a respiracao, ele PERDE o rastro. Escondido sem
    // prender, ele acha — a mecanica so vale se custar alguma coisa.
    const invisivel = escondido && prendendo;
    if (!invisivel) this.lastX = player.x;

    if (this.estado === 'cacar') {
      const alvo = invisivel ? this.lastX : player.x;
      const dir = Math.sign(alvo - c.x) || c.facing;
      // Zona morta de 14px. Sem ela, com o Credor em cima do jogador o
      // sinal de `dir` trocava a cada quadro, `setFacing` disparava a
      // virada toda vez, e ele ficava GIRANDO no lugar para sempre — foi
      // exatamente o que travou a camara fria.
      if (Math.abs(alvo - c.x) > 14) {
        c.facing = dir;
        c.det.setFacing(dir);
        // Perto ele acelera um pouco. E o "quase consegue".
        const v = c.cfg.vel * (dist < 120 ? 1.18 : 1);
        c.x = clamp(c.x + dir * v * dt, level.minX - 20, level.maxX + 20);
        if (c.det.anim !== 'dragWalk' && c.stun <= 0) c.det.play('dragWalk', { blend: 0.2 });
      } else if (invisivel) {
        // Chegou onde te viu pela ultima vez e nao achou ninguem. Agora ele
        // PROCURA: abre armario, chuta engradado. Nao e aleatorio — e uma
        // busca que vai fechando o cerco.
        this.estado = 'procurar';
        this.procuraT = 6 + Math.random() * 5;
        this.buscaT = 0;
      }
      if (c.stun <= 0) c.det.update(dt);
      else { c.stun -= dt; c.det.update(dt); if (c.stun <= 0) c.det.play('dragWalk', { blend: 0.15 }); }
    } else {
      this.procuraT -= dt;
      this.buscaT -= dt;
      if (this.buscaT <= 0) {
        this.buscaT = 1.1 + Math.random() * 1.4;
        audio.lockerBang(0.85);
        gfx.shake(1.1, 0.2);
        // vasculha para os lados, fechando o cerco em volta do ultimo ponto
        this.lastX += (Math.random() - 0.5) * 90;
        this.lastX = clamp(this.lastX, level.minX, level.maxX);
      }
      const dir = Math.sign(this.lastX - c.x) || 1;
      c.facing = dir; c.det.setFacing(dir);
      c.x = clamp(c.x + dir * c.cfg.vel * 0.55 * dt, level.minX - 20, level.maxX + 20);
      c.det.update(dt);
      if (!invisivel && dist < 200) { this.estado = 'cacar'; this.procuraT = 0; }
      if (this.procuraT <= 0) this.estado = 'cacar';
    }

    // ---- tensao pela DISTANCIA, nunca pelo relogio ----
    const k = escondido ? clamp(1 - dist / 300, 0, 1) * 0.8 : clamp(1 - dist / 340, 0, 1);
    audio.setDread(k * 0.85);
    // A motosserra sobe com a proximidade — e ela nunca desliga.
    audio.setLoopGain('serra', 0.05 + k * 0.16, 0.35);
    // Tremor SO quando ele esta em cima de voce, e fraco. Antes era a cada
    // quadro acima de 0.6 e a tela inteira balancava a fuga inteira.
    if (k > 0.86 && !escondido) gfx.shake(1.1, 0.18);

    // ---- a motosserra ----
    //
    // Ele PRECISA machucar. O gancho de dano nunca chegou a ser ligado no
    // jogo, entao o Credor chegava perto, encostava, e nao acontecia nada
    // — ele era um susto ambulante sem consequencia nenhuma.
    if (this.dano > 0) this.dano -= dt;
    if (!escondido && dist < c.cfg.alcance && this.dano <= 0 && this.onDano) {
      this.dano = 1.6;
      audio.punchHit(1.2);
      this.onDano(c.cfg.dano, c.x);
      // Depois de acertar ele para um instante — e e essa janela que da
      // para correr. Sem ela a coisa vira uma sentenca, nao uma fuga.
      c.stun = 1.5;
      c.det.play('hurt', { restart: true, blend: 0.06 });
    }
  }

  // Ele so e desenhado se estiver na fase em que o jogador esta.
  draw(ctx, cam, levelKey) {
    if (!this.ativo || !this.credor || this.levelKey !== levelKey) return;
    this.credor.draw(ctx, cam);
  }

  // Quanto ele esta perto, de 0 a 1 — usado pela sanidade e pelo HUD.
  pressao(levelKey, px) {
    if (!this.ativo || !this.credor) return 0;
    if (this.levelKey !== levelKey) return 0.15;
    return clamp(1 - Math.abs(px - this.credor.x) / 320, 0, 1);
  }
}
