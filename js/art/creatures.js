// creatures.js — as coisas que vazaram da cabeça dele, e as duas pessoas.
//
// REGRA: nenhum deles pode ser um monstro genérico. Cada um tem que ser
// reconhecível como UMA IDEIA, e a ideia tem que ser um trauma que a
// profissão dele produz. Não é um bestiário de terror — é a ficha médica
// de um detetive de vinte e tantos anos de serviço.
//
//   OS SEM-ROSTO ..... as pessoas que ele não conseguiu salvar. Ele não
//                      lembra mais a cara de nenhuma. Roupa de gente comum,
//                      mancha escura no peito onde ele não estancou nada.
//
//   OS EMPILHADOS .... os corpos. Dobrados sobre si mesmos como quem foi
//                      guardado com pressa, lençol de necrotério ainda
//                      preso, etiqueta amarela no pé. Andam de quatro.
//
//   O ECOADOR ........ a ligação que chegou tarde. No lugar do rosto tem
//                      um fone de telefone preto, e ele arrasta o fio.
//                      Não ataca: TOCA.
//
//   O CREDOR ......... a conta. Avental de açougueiro por cima do
//                      sobretudo, cabeça de porco costurada em pano de
//                      saco, e uma motosserra que nunca desliga.
//
// Tudo continua sendo o mesmo esqueleto articulado do detetive — o que
// muda são as PEÇAS. Cada criatura troca cabeça, tronco, braços e pernas
// pelas suas, e herda todas as animações de graça.

import { PAL } from './palette.js';
import { sprite, darken } from './pixel.js';

// Paleta de caracteres própria. Deliberadamente mais clara do que a
// lógica pediria: a cena inteira é multiplicada pela luz, e cor
// "realista" vira preto.
const C = {
  // pele morta, esverdeada
  S: '#a89a86', s: '#8a7d6b', q: '#6b6053', t: '#c2b5a0',
  // lençol de necrotério
  L: '#c9c6bd', l: '#a8a49a', k: '#807d75',
  // roupa de gente comum, encardida
  R: '#6e6a79', r: '#565364', z: '#3d3b48',
  // casaco/paletó escuro
  P: '#4a4650', p: '#38353e', d: '#26242b',
  // sangue seco
  B: '#8d2a22', b: '#5c1a15',
  // baquelite do telefone
  T: '#2a2a30', y: '#43434c', Y: '#5e5e69',
  // metal
  M: '#8f959e', m: '#5c626b', N: '#c8ced6',
  // etiqueta de necrotério
  A: '#c9a83a', a: '#8f7620',
  // avental e pano de saco
  V: '#b9a888', v: '#8f8064', u: '#635840',
  // porco
  G: '#c98d8d', g: '#a86a6a', h: '#7d4a4a',
  // cabelo
  H: '#1c1614', E: '#ddd4c6', e: '#141013',
  // uniforme de zelador / vestido de telefonista
  U: '#4a6a5c', n: '#35503f',
  W: '#8a5a68', w: '#6b4250',
  // cabo e franja do esfregão
  F: '#c9bfa0', f: '#9a9078',
};

const P = {};
let pronto = false;

// ---------------------------------------------------------------------------

function build() {
  // =======================================================================
  // OS SEM-ROSTO
  // =======================================================================
  // A cabeça é a parte inteira do truque: mesmo formato de crânio, mesmo
  // cabelo, e nenhum traço dentro. A silhueta continua sendo de gente — e
  // é por isso que assusta. Um rosto derretido seria monstro; isto aqui é
  // alguém de quem você esqueceu a cara.
  P.faceHead = sprite({
    pivot: [6, 14], map: C, rows: [
      '...HHHHHHH....',
      '..HHHHHHHHH...',
      '.HHHHHqqqqH...',
      '.HHHHqSSSSSt..',
      '.HHHqSSSSSSSt.',
      '.HHHqSSSSSSSt.',
      '.HHHqSSSSSSSt.',
      '.HHHqSSSSSSSt.',
      '.HHHqSSSSSSSt.',
      '.HHHqSSSSSSst.',
      '..HqSSSSSSSst.',
      '..qsSSSSSSSs..',
      '...sSSSSSSs...',
      '....sSSSs.....',
      '....sSSSs.....',
    ]
  });

  // Tronco: roupa de trabalho comum, e a mancha. Ela é a única informação
  // do corpo inteiro, e conta a história toda sem uma linha de diálogo.
  P.faceTorso = sprite({
    pivot: [9, 20], map: C, rows: [
      '...zRRRRRRRz......',
      '..zRRRRRRRRRz.....',
      '.zRRRRRRRRREEz....',
      '.zRRRRRRRRRERz....',
      '.zRRRrRRRRRzRz....',
      '.zRRRrRRRRRzRz....',
      '.zRRrbBBbrRzRz....',
      '.zRRbBBBBbRzRz....',
      '.zRRbBBBBBbzRz....',
      '.zRRrbBBBbRzRz....',
      '.zRRRrbBbrRzRz....',
      '.zRRRRrbrRRzRz....',
      '.zRRRRRRRRRzRz....',
      '.zRRRRRRRRRzRz....',
      '.zRRRRRRRRRzRz....',
      '.zRRRRRRRRRzRz....',
      '.zRRRRRRRRRzRz....',
      '.zRRRRRRRRRzRz....',
      '..zRRRRRRRRzRz....',
      '..zRRRRRRRRRz.....',
      '...zRRRRRRRz......',
    ]
  });

  P.faceUpper = sprite({
    pivot: [2, 1], map: C, rows: [
      'zRRRr', 'zRRRr', 'zRRRr', 'zRRRr', 'zRRRr', 'zRRRr',
      'zRRRr', 'zRRRr', 'zRRRr', '.zRRr', '.zrrr',
    ]
  });
  P.faceFore = sprite({
    pivot: [2, 1], map: C, rows: [
      'zRRRr', 'zRRRr', 'zRRRr', 'zRRRr', '.zRRr', '.zRRr',
      '.zSSq', '.zSSq', 'zSSSq', '.zqqq',
    ]
  });
  P.faceHand = sprite({
    pivot: [2, 0], map: C, rows: ['.sSs.', 'sSSSs', 'sSSSs', '.sSs.', '..q..'],
  });
  P.faceThigh = sprite({
    pivot: [4, 1], map: C, rows: [
      'dpPPPPpd', 'dpPPPPpd', 'dpPPPPpd', 'dpPPPPpd',
      'dpPPPPpd', 'dpPPPPpd', 'dpPPPPpd', 'dpPPPPpd',
      '.dpPPPpd', '.dpPPPpd', '.dpPPPpd', '.dpPPPpd',
      '.dpPPPpd', '..dpPpd.',
    ]
  });
  P.faceShin = sprite({
    pivot: [3, 1], map: C, rows: [
      '.dpPPpd', '.dpPPpd', '.dpPPpd', '.dpPPpd', '.dpPPpd',
      'dppppppd', 'dpppppd', 'dpppppd', 'dpppppd', 'dpppppd',
      'dpppppd', 'ddpppdd',
    ]
  });
  P.faceFoot = sprite({
    pivot: [3, 0], map: C, rows: ['.dppppd..', 'dpppppppd', 'dddddddd.', '.dddddd..'],
  });

  // =======================================================================
  // OS EMPILHADOS
  // =======================================================================
  // A cabeça pende para baixo, virada ao contrário. O lençol ainda está
  // amarrado por cima — quem guardou não terminou o serviço.
  P.stackHead = sprite({
    pivot: [6, 12], map: C, rows: [
      '....LLLLL.....',
      '..LLLLLLLLL...',
      '.LLLlllllLLL..',
      '.Llq.....qlL..',
      '.lqSSSSSSSql..',
      '.qSSsssssSSq..',
      '.qSseeeeesSq..',
      '.qSsee.eesSq..',
      '..qSssssssq...',
      '..qSSqqqSSq...',
      '...qSSSSSq....',
      '....qqqqq.....',
    ]
  });

  // Tronco dobrado, com as costelas marcando por baixo do lençol.
  P.stackTorso = sprite({
    pivot: [9, 20], map: C, rows: [
      '...kLLLLLLLk......',
      '..kLLLLLLLLLk.....',
      '.kLLLLLLLLLLLk....',
      '.kLlLLLLLLLlLk....',
      '.kLlkLLLLLklLk....',
      '.kLLlkLLLklLLk....',
      '.kLLLlkLklLLLk....',
      '.kLLLLlklLLLLk....',
      '.kLLLLLkLLLLLk....',
      '.kLLLLklkLLLLk....',
      '.kLLLklLlkLLLk....',
      '.kLLklLLLlkLLk....',
      '.kLklLLLLLlkLk....',
      '.kklLLLLLLLlkk....',
      '.klLLLLLLLLLlk....',
      '.kLLLLLLLLLLLk....',
      '.kLLLLqqqLLLLk....',
      '.kLLLqSSSqLLLk....',
      '..kLLqSSSqLLk.....',
      '..kLLLqqqLLLk.....',
      '...kLLLLLLLk......',
    ]
  });

  // Membros esqueléticos: pele colada no osso, sem roupa.
  P.stackUpper = sprite({
    pivot: [2, 1], map: C, rows: [
      'qSSsq', 'qSSsq', 'qSsSq', 'qSSsq', 'qSsSq', 'qSSsq',
      'qSsSq', 'qSSsq', 'qSsSq', '.qSsq', '.qqsq',
    ]
  });
  P.stackFore = sprite({
    pivot: [2, 1], map: C, rows: [
      'qSSsq', 'qSsSq', 'qSSsq', 'qSsSq', '.qSSq', '.qSsq',
      '.qSSq', '.qSsq', 'qSSSq', '.qqqq',
    ]
  });
  P.stackHand = sprite({
    pivot: [2, 0], map: C, rows: ['.sqs.', 'sSqSs', 'qSSSq', '.sqs.', '..q..'],
  });
  P.stackThigh = sprite({
    pivot: [4, 1], map: C, rows: [
      'qsSSSSsq', 'qsSSSSsq', 'qsSsSSsq', 'qsSSSSsq',
      'qsSsSSsq', 'qsSSSSsq', 'qsSsSSsq', 'qsSSSSsq',
      '.qsSSSsq', '.qsSsSsq', '.qsSSSsq', '.qsSsSsq',
      '.qsSSSsq', '..qsSsq.',
    ]
  });
  P.stackShin = sprite({
    pivot: [3, 1], map: C, rows: [
      '.qsSSsq', '.qsSsSq', '.qsSSsq', '.qsSsSq', '.qsSSsq',
      '.qsSsSq', '.qsSSsq', '.qsSsSq', '.qsSSsq', '.qsSSsq',
      '.qsSSsq', '.qqssqq',
    ]
  });
  // O pé com a etiqueta de necrotério amarrada. É o detalhe que diz o que
  // isso é, e ele nunca comenta.
  P.stackFoot = sprite({
    pivot: [3, 0], map: C, rows: [
      '.qsSSSsq..', 'qsSSSSSSq.', 'qqsssssqq.', '.qqAAAqq..', '...aAa....',
    ]
  });

  // =======================================================================
  // O ECOADOR
  // =======================================================================
  // No lugar da cara, um fone de telefone preto — daqueles pesados, de
  // baquelite. Ele não tem boca, e mesmo assim é o único que faz barulho.
  P.echoHead = sprite({
    pivot: [6, 13], map: C, rows: [
      '...HHHHHHH....',
      '..HHHHHHHHH...',
      '.HHHqqqqqqH...',
      '.HHqSSSSSSq...',
      '..TTTTTTTTTT..',
      '.TYYYYYYYYYYT.',
      'TYYYTTTTTTYYYT',
      'TYYT......TYYT',
      '.TT........TT.',
      '..qSSSSSSSq...',
      '..qSSSSSSSq...',
      '...qSSSSSq....',
      '....qSSSq.....',
    ]
  });

  P.echoTorso = sprite({
    pivot: [9, 20], map: C, rows: [
      '....dPPPPPd.......',
      '...dPPPPPPPd......',
      '..dPPPPPPPPPd.....',
      '..dPPPpPPPpPd.....',
      '..dPPpPPPPPpd.....',
      '..dPpPPPPPPpd.....',
      '..dPpPPPPPPpd.....',
      '..dPpPPPPPPpd.....',
      '..dPpPPPPPPpd.....',
      '..dPpPPPPPPpd.....',
      '..dPpPPPPPPpd.....',
      '..dPpPPPPPPpd.....',
      '..dPpPPPPPPpd.....',
      '..dPpPPPPPPpd.....',
      '..dPpPPPPPPpd.....',
      '..dPpPPPPPPpd.....',
      '..dPpPPPPPPpd.....',
      '..dPPpPPPPpPd.....',
      '...dPPPPPPPd......',
      '...dPPPPPPPd......',
      '....dPPPPPd.......',
    ]
  });

  P.echoUpper = sprite({
    pivot: [2, 1], map: C, rows: [
      'dPPp', 'dPPp', 'dPPp', 'dPPp', 'dPPp', 'dPPp',
      'dPPp', 'dPPp', 'dPPp', '.dPp', '.dpp',
    ]
  });
  P.echoFore = sprite({
    pivot: [2, 1], map: C, rows: [
      'dPPp', 'dPPp', 'dPPp', 'dPPp', '.dPp', '.dPp',
      '.dSq', '.dSq', 'dSSq', '.dqq',
    ]
  });
  P.echoHand = sprite({
    pivot: [2, 0], map: C, rows: ['.sSs.', 'sSSSs', 'sSSSs', '.sSs.', '..q..'],
  });
  P.echoThigh = sprite({
    pivot: [4, 1], map: C, rows: [
      'dpPPPPpd', 'dpPPPPpd', 'dpPPPPpd', 'dpPPPPpd',
      'dpPPPPpd', 'dpPPPPpd', 'dpPPPPpd', '.dpPPPpd',
      '.dpPPPpd', '.dpPPPpd', '.dpPPPpd', '.dpPPPpd',
      '..dpPpd.', '..dpPpd.',
    ]
  });
  P.echoShin = sprite({
    pivot: [3, 1], map: C, rows: [
      '.dpPPpd', '.dpPPpd', '.dpPPpd', '.dpPPpd', '.dpPPpd',
      '.dppppd', '.dppppd', '.dppppd', '.dppppd', '.dppppd',
      '.dppppd', '.ddppdd',
    ]
  });
  P.echoFoot = sprite({
    pivot: [3, 0], map: C, rows: ['.dpppd...', 'dppppppd.', 'dddddddd.', '.dddddd..'],
  });

  // O fio, que ele arrasta e que não está ligado em lugar nenhum.
  P.echoCord = sprite({
    pivot: [1, 0], map: C, rows: [
      '.T.', 'TT.', '.TT', '.T.', 'TT.', '.TT', '.T.', 'TT.',
      '.TT', '.T.', 'TT.', '.TT', '.T.', 'TTT',
    ]
  });

  // =======================================================================
  // O CREDOR
  // =======================================================================
  // Cabeça de porco costurada em pano de saco. Não é uma máscara bonita:
  // é pano grosso, com dois furos e um focinho mal costurado. Os olhos
  // não são olhos — são buracos onde a luz não entra.
  P.pigHead = sprite({
    pivot: [7, 15], map: C, rows: [
      '..vvvvvvvvv...',
      '.vVVVVVVVVVv..',
      'vVVVVVVVVVVVv.',
      'vVVuVVVVVuVVv.',
      'vVVVVVVVVVVVv.',
      'vVVeeVVVVeeVv.',
      'vVVeeVVVVeeVvG',
      'vVVVVVVVVVGGGG',
      'vVVVVVVVVGGggG',
      'vVVVVVVVVGeGeG',
      'vVVuVVVVVGGGGG',
      '.vVVVVVVVVGGg.',
      '.vVVVVVVVVVv..',
      '..vuvuvuvuv...',
      '...vvvvvvv....',
    ]
  });

  // Avental de açougueiro por cima do sobretudo. O avental é claro, e é a
  // única coisa clara nele — por isso é o que se vê primeiro no escuro.
  P.pigTorso = sprite({
    pivot: [10, 22], map: C, rows: [
      '...ddPPPPPPPdd.....',
      '..dPPPPPPPPPPPd....',
      '.dPPPPPPPPPPPPPd...',
      '.dPPvVVVVVVVvPPd...',
      '.dPvVVVVVVVVVvPd...',
      '.dPvVVVVVVVVVvPd...',
      '.dPvVVVbBBbVVvPd...',
      '.dPvVVbBBBBbVvPd...',
      '.dPvVVVbBBbVVvPd...',
      '.dPvVVVVVVVVVvPd...',
      '.dPvVVVVVVVVVvPd...',
      '.dPvVVVVVVVVVvPd...',
      '.dPvVVVVVVVVVvPd...',
      '.dPvVVbVVVbVVvPd...',
      '.dPvVVVVVVVVVvPd...',
      '.dPvVVVVVVVVVvPd...',
      '.dPvVVVVVVVVVvPd...',
      '.dPvVVVVVVVVVvPd...',
      '.dPPvVVVVVVVvPPd...',
      '..dPPvvvvvvvPPd....',
      '..dPPPPPPPPPPPd....',
      '...ddPPPPPPPdd.....',
    ]
  });

  P.pigUpper = sprite({
    pivot: [2, 1], map: C, rows: [
      'dPPPp', 'dPPPp', 'dPPPp', 'dPPPp', 'dPPPp', 'dPPPp',
      'dPPPp', 'dPPPp', 'dPPPp', '.dPPp', '.dppp',
    ]
  });
  P.pigFore = sprite({
    pivot: [2, 1], map: C, rows: [
      'dPPPp', 'dPPPp', 'dPPPp', 'dPPPp', '.dPPp', '.dPPp',
      '.dGGh', '.dGGh', 'dGGGh', '.dhhh',
    ]
  });
  P.pigHand = sprite({
    pivot: [2, 0], map: C, rows: ['.gGg.', 'gGGGg', 'gGGGg', '.gGg.', '..h..'],
  });
  P.pigThigh = sprite({
    pivot: [4, 1], map: C, rows: [
      'dpPPPPpd', 'dpPPPPpd', 'dpPPPPpd', 'dpPPPPpd',
      'dpPPPPpd', 'dpPPPPpd', 'dpPPPPpd', 'dpPPPPpd',
      'dpPPPPpd', '.dpPPPpd', '.dpPPPpd', '.dpPPPpd',
      '.dpPPPpd', '..dpPpd.',
    ]
  });
  P.pigShin = sprite({
    pivot: [3, 1], map: C, rows: [
      '.dpPPpd', '.dpPPpd', '.dpPPpd', '.dpPPpd', '.dpPPpd',
      'ddddddd', 'dddddddd', 'ddddddd', 'ddddddd', 'ddddddd',
      'ddddddd', 'ddddddd',
    ]
  });
  P.pigFoot = sprite({
    pivot: [3, 0], map: C, rows: ['.dddddd..', 'dddddddddd', 'dddddddddd', '.dddddddd.'],
  });

  // A MOTOSSERRA. Ela nunca desliga — e é o som dela que chega antes dele.
  // Corrente desenhada com dentes alternados para o olho pegar movimento
  // mesmo com a coisa parada.
  P.chainsaw = sprite({
    pivot: [2, 0], map: C, rows: [
      'mMMMMm', 'MNNNNM', 'mMMMMm', 'mmMMmm', '.mMMm.',
      '.mMMm.', '.MmmM.', '.mMMm.', '.MmmM.', '.mMMm.',
      '.MmmM.', '.mMMm.', '.MmmM.', '.mMMm.', '.MmmM.',
      '.mMMm.', '..MM..', '..mm..',
    ]
  });

  // =======================================================================
  // AS DUAS PESSOAS
  // =======================================================================

  // A TELEFONISTA — cabelo preso, vestido de trabalho vinho, gola branca.
  // Ela está no turno dela, e o turno dela acabou há dez anos.
  P.opHead = sprite({
    pivot: [6, 14], map: C, rows: [
      '...HHHHHHH....',
      '..HHHHHHHHHH..',
      '.HHHHHHHHHHHH.',
      '.HHHHHHHSSStH.',
      '.HHHHHSSSSSStH',
      '.HHHHqSSeeSStH',
      '.HHHHqSSEeSstH',
      '.HHHHqSSqSStSH',
      '.HHHHqSSSSSqSH',
      '.HHHHSSSSSSstH',
      '..HHqSSBBBSstH',
      '..sHSSSSSSSsHH',
      '...sSSSSSSs.H.',
      '....sSSSs.....',
      '....sSSSs.....',
    ]
  });
  P.opTorso = sprite({
    pivot: [9, 20], map: C, rows: [
      '...wWWWWWWWw......',
      '..wWWWWWWWWWw.....',
      '.wWWWWWWWWWEEw....',
      '.wWWWWWWWWWEWw....',
      '.wWWWwWWWWWwWw....',
      '.wWWWwWWWWWwWw....',
      '.wWWWwWWWWWwWw....',
      '.wWWWwWWWWWwWw....',
      '.wWWWwWWWWWwWw....',
      '.wWWWwWWWWWwWw....',
      '.wWWWwWWWWWwWw....',
      '.wWWWwWWWWWwWw....',
      '.wwwwwwwwwwwww....',
      '.wWWWWWWWWWWWw....',
      '.wWWWWWWWWWWWw....',
      '.wWWWWWWWWWWWw....',
      '.wWWWWWWWWWWWw....',
      '.wWWWWWWWWWWWw....',
      '..wWWWWWWWWWw.....',
      '..wWWWWWWWWWw.....',
      '...wWWWWWWWw......',
    ]
  });
  P.opUpper = sprite({
    pivot: [2, 1], map: C, rows: [
      'wWWWw', 'wWWWw', 'wWWWw', 'wWWWw', 'wWWWw', 'wWWWw',
      'wWWWw', 'wWWWw', '.wWWw', '.wSSq', '.qSSq',
    ]
  });
  P.opFore = sprite({
    pivot: [2, 1], map: C, rows: [
      'qSSSq', 'qSSSq', 'qSSSq', 'qSSSq', '.qSSq', '.qSSq',
      '.qSSq', '.qSSq', 'qSSSq', '.qqqq',
    ]
  });

  // O ZELADOR — macacão verde desbotado, e o esfregão. Ele nunca larga o
  // esfregão, nem quando está sentado, nem quando está falando com você.
  P.jaHead = sprite({
    pivot: [6, 14], map: C, rows: [
      '...LLLLLLL....',
      '..LLLLLLLLLL..',
      '.LLLLLLLLLLLL.',
      '.HHHHHHHSSSt..',
      '.HHHHHSSSSSSt.',
      '.HHHHqSSeeSSt.',
      '.HHHHqSSEeSst.',
      '.HHHHqSSqSStS.',
      '.HHHHqSSSSSqS.',
      '.HHHHSSSSSSst.',
      '..HHqSSSSSSst.',
      '..sHSSSSSSSs..',
      '...sSSSSSSs...',
      '....sSSSs.....',
      '....sSSSs.....',
    ]
  });
  P.jaTorso = sprite({
    pivot: [9, 20], map: C, rows: [
      '...nUUUUUUUn......',
      '..nUUUUUUUUUn.....',
      '.nUUUUUUUUUEEn....',
      '.nUUUUUUUUUEUn....',
      '.nUUUnUUUUUnUn....',
      '.nUUUnUUUUUnUn....',
      '.nUUUnUUUUUnUn....',
      '.nUUUnUUUUUnUn....',
      '.nUAAnUUUUUnUn....',
      '.nUAAnUUUUUnUn....',
      '.nUUUnUUUUUnUn....',
      '.nUUUnUUUUUnUn....',
      '.nUUUnUUUUUnUn....',
      '.nUUUnUUUUUnUn....',
      '.nUUUUUUUUUUUn....',
      '.nUUUUUUUUUUUn....',
      '.nUUUnUUUUUnUn....',
      '.nUUUnUUUUUnUn....',
      '..nUUnUUUUUnUn....',
      '..nUUUUUUUUUn.....',
      '...nUUUUUUUn......',
    ]
  });
  P.jaUpper = sprite({
    pivot: [2, 1], map: C, rows: [
      'nUUUn', 'nUUUn', 'nUUUn', 'nUUUn', 'nUUUn', 'nUUUn',
      'nUUUn', 'nUUUn', 'nUUUn', '.nUUn', '.nnnn',
    ]
  });
  P.jaFore = sprite({
    pivot: [2, 1], map: C, rows: [
      'nUUUn', 'nUUUn', 'nUUUn', 'nUUUn', '.nUUn', '.nUUn',
      '.qSSq', '.qSSq', 'qSSSq', '.qqqq',
    ]
  });

  // O esfregão. Cabo comprido e um bolo de fios cinzentos na ponta.
  P.mop = sprite({
    pivot: [1, 0], map: C, rows: [
      'fFf', 'fFf', 'fFf', 'fFf', 'fFf', 'fFf', 'fFf', 'fFf',
      'fFf', 'fFf', 'fFf', 'fFf', 'fFf', 'fFf',
      'kLk', 'LLL', 'LLL', 'lLl', 'lll', 'klk',
    ]
  });

  // versões escurecidas dos membros de trás
  const K = 0.68, T2 = '#22304a';
  for (const nome of ['faceUpper', 'faceFore', 'faceHand', 'faceThigh', 'faceShin', 'faceFoot',
    'stackUpper', 'stackFore', 'stackHand', 'stackThigh', 'stackShin', 'stackFoot',
    'echoUpper', 'echoFore', 'echoHand', 'echoThigh', 'echoShin', 'echoFoot',
    'pigUpper', 'pigFore', 'pigHand', 'pigThigh', 'pigShin', 'pigFoot',
    'opUpper', 'opFore', 'jaUpper', 'jaFore']) {
    P['d_' + nome] = darken(P[nome], K, T2);
  }

  pronto = true;
}

// Conjuntos de peças por criatura. O rig procura primeiro aqui e cai no
// detetive para o que não estiver definido — assim uma criatura nova só
// precisa das peças que realmente mudam.
export function partesDe(id) {
  if (!pronto) build();
  switch (id) {
    case 'semrosto': return {
      head: P.faceHead, headBlank: P.faceHead, torso: P.faceTorso,
      upperArm: P.faceUpper, forearm: P.faceFore, hand: P.faceHand,
      thigh: P.faceThigh, shin: P.faceShin, foot: P.faceFoot,
      dUpperArm: P.d_faceUpper, dForearm: P.d_faceFore, dHand: P.d_faceHand,
      dThigh: P.d_faceThigh, dShin: P.d_faceShin, dFoot: P.d_faceFoot,
      collar: null, coatSkirt: null, holster: null,
    };
    case 'empilhado': return {
      head: P.stackHead, headBlank: P.stackHead, torso: P.stackTorso,
      upperArm: P.stackUpper, forearm: P.stackFore, hand: P.stackHand,
      thigh: P.stackThigh, shin: P.stackShin, foot: P.stackFoot,
      dUpperArm: P.d_stackUpper, dForearm: P.d_stackFore, dHand: P.d_stackHand,
      dThigh: P.d_stackThigh, dShin: P.d_stackShin, dFoot: P.d_stackFoot,
      collar: null, coatSkirt: null, holster: null,
    };
    case 'ecoador': return {
      head: P.echoHead, headBlank: P.echoHead, torso: P.echoTorso,
      upperArm: P.echoUpper, forearm: P.echoFore, hand: P.echoHand,
      thigh: P.echoThigh, shin: P.echoShin, foot: P.echoFoot,
      dUpperArm: P.d_echoUpper, dForearm: P.d_echoFore, dHand: P.d_echoHand,
      dThigh: P.d_echoThigh, dShin: P.d_echoShin, dFoot: P.d_echoFoot,
      collar: null, coatSkirt: null, holster: null,
      naMao: P.echoCord,
    };
    case 'credor': return {
      head: P.pigHead, headBlank: P.pigHead, torso: P.pigTorso,
      upperArm: P.pigUpper, forearm: P.pigFore, hand: P.pigHand,
      thigh: P.pigThigh, shin: P.pigShin, foot: P.pigFoot,
      dUpperArm: P.d_pigUpper, dForearm: P.d_pigFore, dHand: P.d_pigHand,
      dThigh: P.d_pigThigh, dShin: P.d_pigShin, dFoot: P.d_pigFoot,
      collar: null, coatSkirt: null, holster: null,
      naMao: P.chainsaw,
    };
    case 'operadora': return {
      head: P.opHead, headBlank: P.opHead, torso: P.opTorso,
      upperArm: P.opUpper, forearm: P.opFore,
      dUpperArm: P.d_opUpper, dForearm: P.d_opFore,
      collar: null, coatSkirt: null, holster: null,
    };
    case 'zelador': return {
      head: P.jaHead, headBlank: P.jaHead, torso: P.jaTorso,
      upperArm: P.jaUpper, forearm: P.jaFore,
      dUpperArm: P.d_jaUpper, dForearm: P.d_jaFore,
      collar: null, coatSkirt: null, holster: null,
      naMao: P.mop,
    };
  }
  return null;
}

export { P as CREATURE_PARTS };
