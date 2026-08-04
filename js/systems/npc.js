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
import { partesDe } from '../art/creatures.js';

export const NPCS = {
  // O ZELADOR. Macacao verde desbotado e um esfregao que ele nunca larga —
  // nem sentado, nem falando com voce. Ele esta no turno dele, e o turno
  // dele acabou ha dez anos.
  vigia: {
    level: 'ch2_office', x: 508, facing: -1,
    anim: 'sitChair', arte: 'zelador',
    talk: 'vigia', prompt: 'prompt_talk',
  },
  // A TELEFONISTA. Cabelo preso, vestido de trabalho vinho, gola branca.
  operadora: {
    level: 'ch2_mezz', x: 638, facing: -1,
    anim: 'switchboard', arte: 'operadora',
    talk: 'operadora', prompt: 'prompt_talk',
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
    // Peças próprias. Antes eles eram o detetive tingido — literalmente a
    // mesma pessoa, um sentado e o outro quase de quatro. Agora cada um
    // tem cabeça, tronco e roupa dele.
    d.parts = partesDe(c.arte);
    d.rimAlpha = 0.16;
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
