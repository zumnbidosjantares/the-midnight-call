// npc.js — as pessoas do galpao.
//
// Sao duas, e nenhuma das duas responde a pergunta que importa. O Vigia
// fala de um turno que acabou ha dez anos; a Telefonista transfere ligacoes
// para cabos que nao terminam em lugar nenhum. Em nenhum momento o jogo diz
// se elas sao reais.
//
// A REGRA: ninguem pergunta o nome dele. Todos ja sabem. E ninguem comenta
// isso — nunca. (ver "AS MIGALHAS", ROTEIRO.txt)
//
// Tecnicamente sao o mesmo rig do detetive, recolorido. Nao ha um unico
// pixel de arte nova aqui: e o mesmo homem, pintado de outra cor, sentado
// numa cadeira que nao existe mais.

import { Detective } from '../art/detective.js';

export const NPCS = {
  vigia: {
    level: 'ch2_office', x: 506, facing: -1,
    anim: 'sitChair', tint: '#4a4436', tintK: 0.6,
    talk: 'vigia', prompt: 'prompt_talk',
    // uniforme desbotado; nada nele reage ao estado do lugar
    luz: null,
  },
  operadora: {
    level: 'ch2_mezz', x: 636, facing: -1,
    anim: 'switchboard', tint: '#5a3040', tintK: 0.62,
    talk: 'operadora', prompt: 'prompt_talk',
    luz: null,
  },
};

export class Npc {
  constructor(id) {
    this.id = id;
    const c = this.cfg = NPCS[id];
    this.x = c.x;
    this.facing = c.facing;
    this.falado = false;
    const d = this.det = new Detective();
    d.tint = c.tint;
    d.tintK = c.tintK;
    d.rimAlpha = 0;
    d.reflect = 0;
    d.facing = c.facing;
    d.flipT = 1;
    d.play(c.anim, { blend: 0 });
  }

  update(dt) { this.det.update(dt); }

  draw(ctx, cam, groundY) {
    this.det.draw(ctx, this.x - cam.ix, groundY - cam.iy);
  }

  // Interactable que o jogo insere na fase quando o NPC esta nela.
  gancho() {
    return {
      x: this.x - 14, y: 150, w: 28, h: 64,
      prompt: this.cfg.prompt, action: 'talk', npc: this.id, range: 34, prio: 2,
    };
  }
}
