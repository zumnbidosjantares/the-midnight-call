// i18n.js — TODO texto visivel do jogo mora aqui. Nenhuma string solta
// nos outros arquivos. Trocar de idioma no menu e so trocar `lang`.
//
// A narracao de abertura tem tempos em segundos. Se o audio do narrador
// existir em assets/audio/, as legendas seguem o audio; se nao existir,
// seguem estes tempos. Ajuste `t` e `d` para casar com a sua gravacao.

export const LANGS = ['pt', 'en'];
export let lang = 'pt';
export function setLang(l) { if (LANGS.includes(l)) lang = l; }
export function getLang() { return lang; }

const STR = {
  // ---------- menu ----------
  tagline:        { pt: 'Chamado da Meia-Noite',       en: 'A detective story' },
  menu_continue:  { pt: 'CONTINUAR',                   en: 'CONTINUE' },
  menu_new:       { pt: 'NOVO JOGO',                   en: 'NEW GAME' },
  menu_load:      { pt: 'CARREGAR',                    en: 'LOAD GAME' },
  menu_options:   { pt: 'OPCOES',                      en: 'OPTIONS' },
  menu_extras:    { pt: 'SALA DE TESTE',               en: 'TEST ROOM' },
  menu_back:      { pt: 'VOLTAR',                      en: 'BACK' },
  menu_hint:      { pt: 'SETAS  MOVER      ENTER  CONFIRMAR      ESC  VOLTAR',
                    en: 'ARROWS  MOVE      ENTER  CONFIRM      ESC  BACK' },
  build_tag:      { pt: 'VERSAO DE TESTE 0.1 — FATIA JOGAVEL',
                    en: 'TEST BUILD 0.1 — VERTICAL SLICE' },

  // ---------- saves ----------
  slots_title_save: { pt: 'SALVAR JOGO',   en: 'SAVE GAME' },
  slots_title_load: { pt: 'CARREGAR JOGO', en: 'LOAD GAME' },
  slot:             { pt: 'ARQUIVO',       en: 'FILE' },
  slot_empty:       { pt: 'vazio',         en: 'empty' },
  slot_overwrite:   { pt: 'Sobrescrever este arquivo?', en: 'Overwrite this file?' },
  slot_erase:       { pt: 'DEL  APAGAR',   en: 'DEL  ERASE' },
  slot_erase_ask:   { pt: 'Apagar este arquivo?', en: 'Erase this file?' },
  yes:              { pt: 'SIM',           en: 'YES' },
  no:               { pt: 'NAO',           en: 'NO' },
  saved:            { pt: 'JOGO SALVO',    en: 'GAME SAVED' },
  playtime:         { pt: 'TEMPO',         en: 'TIME' },

  // ---------- pausa ----------
  paused:         { pt: 'PAUSADO',            en: 'PAUSED' },
  pause_resume:   { pt: 'CONTINUAR',          en: 'RESUME' },
  pause_save:     { pt: 'SALVAR',             en: 'SAVE' },
  pause_load:     { pt: 'CARREGAR',           en: 'LOAD' },
  pause_options:  { pt: 'OPCOES',             en: 'OPTIONS' },
  pause_quit:     { pt: 'SAIR PARA O MENU',   en: 'QUIT TO MENU' },
  pause_quit_ask: { pt: 'Sair sem salvar? O progresso desde o ultimo save some.',
                    en: 'Quit without saving? Progress since the last save is lost.' },

  // ---------- opcoes ----------
  opt_title:      { pt: 'OPCOES',              en: 'OPTIONS' },
  opt_lang:       { pt: 'IDIOMA',              en: 'LANGUAGE' },
  opt_master:     { pt: 'VOLUME GERAL',        en: 'MASTER VOLUME' },
  opt_music:      { pt: 'MUSICA',              en: 'MUSIC' },
  opt_sfx:        { pt: 'EFEITOS',             en: 'SOUND FX' },
  opt_voice:      { pt: 'VOZ',                 en: 'VOICE' },
  opt_scan:       { pt: 'LINHAS DE TELA',      en: 'SCANLINES' },
  opt_grain:      { pt: 'GRAO DE FILME',       en: 'FILM GRAIN' },
  opt_shake:      { pt: 'TREMOR DE CAMERA',    en: 'CAMERA SHAKE' },
  opt_pixel:      { pt: 'ESCALA INTEIRA',      en: 'INTEGER SCALING' },
  opt_subs:       { pt: 'LEGENDAS',            en: 'SUBTITLES' },
  on:             { pt: 'LIGADO',              en: 'ON' },
  off:            { pt: 'DESLIGADO',           en: 'OFF' },

  // ---------- jogo ----------
  prompt_open:    { pt: 'ABRIR',      en: 'OPEN' },
  prompt_look:    { pt: 'OLHAR',      en: 'LOOK' },
  prompt_talk:    { pt: 'FALAR',      en: 'TALK' },
  prompt_use:     { pt: 'USAR',       en: 'USE' },
  skip_hold:      { pt: 'SEGURE ESC PARA PULAR', en: 'HOLD ESC TO SKIP' },
  loc_street:     { pt: 'RUA HOLLAND, 2h14',    en: 'HOLLAND STREET, 2:14 AM' },
  loc_alley:      { pt: 'BECO DOS FUNDOS',      en: 'BACK ALLEY' },
  loc_bar:        { pt: 'BAR O ULTIMO TROCO',   en: 'THE LAST DIME BAR' },
  not_today:      { pt: 'hoje não...',          en: 'not tonight...' },

  // ---------- falas soltas em cima da cabeca ----------
  // Curtas, secas, sem ninguem para responder. Piada quando ele consegue,
  // constatacao quando nao consegue.
  bark_alley_enter:  { pt: 'Beco sem saída. Combina.',
                       en: 'Dead end. Fitting.' },
  bark_alley_rain:   { pt: 'A chuva não lava nada. Só espalha.',
                       en: 'Rain never washes anything. It just spreads it around.' },
  bark_alley_lamp:   { pt: 'Ninguém troca a lâmpada de um beco.',
                       en: 'Nobody changes the bulb in an alley.' },
  bark_alley_window: { pt: 'Alguém ainda mora aqui. Coitado.',
                       en: 'Somebody still lives here. Poor bastard.' },
  bark_alley_door:   { pt: 'Seis anos fechado. E a porta abre.',
                       en: 'Six years shut. And the door opens.' },

  bark_bar_enter:    { pt: 'Alguém chegou antes de mim.',
                       en: 'Somebody got here first.' },
  bark_bar_enter2:   { pt: 'E não veio conversar.',
                       en: 'And they did not come to talk.' },
  bark_bar_wreck:    { pt: 'Isso não foi briga de bar.',
                       en: 'This was not a bar fight.' },
  bark_bar_wreck2:   { pt: 'Briga de bar tem dois lados.',
                       en: 'A bar fight has two sides.' },
  bark_bar_chairs:   { pt: 'Empilharam as cadeiras no meio do estrago.',
                       en: 'They stacked the chairs in the middle of the wreckage.' },
  bark_bar_chairs2:  { pt: 'Quem quebra tudo não arruma depois.',
                       en: 'People who wreck a room do not tidy it after.' },
  bark_bar_dark:     { pt: 'Se tem alguém aqui, já me viu.',
                       en: 'If anyone is in here, they have seen me already.' },
  bark_bar_bottles:  { pt: 'Bebida boa, tudo no chão. Que desperdício.',
                       en: 'Good liquor, all over the floor. Waste.' },

  bark_reload:       { pt: 'Vazio. Boa hora.',
                       en: 'Empty. Great timing.' },
  bark_dry:          { pt: 'Sem bala. Como sempre.',
                       en: 'No rounds. Of course.' },

  bark_joke_1:       { pt: 'Devia ter trazido uma lanterna. E um emprego.',
                       en: 'Should have brought a flashlight. And a job.' },
  bark_joke_2:       { pt: 'Já estive em lugares piores. Morei num.',
                       en: 'I have been in worse places. I lived in one.' },
  bark_joke_3:       { pt: 'Duas e meia. Meu horário nobre.',
                       en: 'Half past two. My prime time.' },
  chapter_1:      { pt: 'CAPITULO UM',          en: 'CHAPTER ONE' },
  chapter_1_name: { pt: 'O homem que atendeu',  en: 'The man who answered' },

  // ---------- sala de teste ----------
  lab_title:      { pt: 'SALA DE TESTE',        en: 'TEST ROOM' },
  lab_hint:       { pt: 'SETAS  TROCAR ANIMACAO   Z/X  VELOCIDADE   C  ESQUELETO   V  ESPELHAR   ESC  SAIR',
                    en: 'ARROWS  CHANGE ANIM   Z/X  SPEED   C  SKELETON   V  FLIP   ESC  EXIT' },
  lab_speed:      { pt: 'VELOCIDADE',           en: 'SPEED' },
  lab_frame:      { pt: 'CICLO',                en: 'CYCLE' },

  // ---------- HUD de depuracao ----------
  dbg_on:         { pt: 'DEPURACAO', en: 'DEBUG' },
};

export function t(key) {
  const e = STR[key];
  if (!e) return '[' + key + ']';
  return e[lang] !== undefined ? e[lang] : e.pt;
}

// ---------------------------------------------------------------------------
// NARRACAO DE ABERTURA
//
// Texto e tempos vindos de "roteiro legenda.txt", escrito pelo Luiz.
// Os tempos sao os do roteiro: cada legenda entra na marca dele e fica na
// tela ate a proxima entrar (assim nao pisca buraco entre as falas).
//
// ESCALA AUTOMATICA: estes tempos foram escritos para uma gravacao de
// NARRATION_REF_DUR segundos. Se o arquivo em assets/audio/ tiver outra
// duracao, a cutscene reescalona tudo na mesma proporcao — ver subScale em
// js/systems/cutscene.js. Se a gravacao bater com a referencia, a escala e
// 1.0 e nada muda.
//
// Para reescrever a mao: t = segundo em que a legenda aparece, d = quanto
// tempo ela fica na tela.
// ---------------------------------------------------------------------------

export const NARRATION_REF_DUR = 76.5;

// As pausas do roteiro sao respeitadas: a legenda SAI da tela no silencio
// em vez de ficar segurando ate a proxima. E o que faz o texto respirar
// junto com a voz em vez de parecer um bloco parado.
export const NARRATION = [
  { t:  0.0, d: 2.5, pt: 'Engraçado...',
                     en: 'Funny...' },
  { t:  3.2, d: 4.0, pt: 'Passei metade da vida perseguindo monstros.',
                     en: 'I spent half my life chasing monsters.' },
  { t:  8.2, d: 6.8, pt: 'E a outra metade tentando descobrir por que eles nunca saíam do meu caminho.',
                     en: 'And the other half trying to work out why they never got out of my way.' },
  { t: 16.2, d: 2.3, pt: 'Demorei anos pra entender.',
                     en: 'It took me years to understand.' },
  { t: 20.0, d: 3.5, pt: 'Eles... eles nunca estiveram na minha frente.',
                     en: 'They... they were never in front of me.' },
  { t: 24.2, d: 2.3, pt: 'Eles vinham comigo.',
                     en: 'They were walking with me.' },
  { t: 28.0, d: 4.0, pt: 'Tem gente que acredita que o tempo cura...',
                     en: 'Some people believe time heals...' },
  { t: 32.8, d: 1.0, pt: 'Mentira.',
                     en: 'It does not.' },
  { t: 34.5, d: 4.7, pt: 'O tempo só aprende a esconder as feridas... até você olhar no espelho.',
                     en: 'Time only learns to hide the wounds... until you look in a mirror.' },
  { t: 40.5, d: 3.0, pt: 'Tem noites em que eu ainda escuto.',
                     en: 'There are nights I still hear it.' },
  { t: 44.5, d: 1.7, pt: 'Não são vozes...',
                     en: 'Not voices...' },
  { t: 47.0, d: 1.5, pt: 'Silêncios.',
                     en: 'Silences.' },
  { t: 49.5, d: 2.7, pt: 'Os silêncios que eu deixei pra trás.',
                     en: 'The silences I left behind.' },
  { t: 53.0, d: 4.2, pt: 'Não... Não existe aposentadoria pra consciência.',
                     en: 'No... There is no retirement for a conscience.' },
  { t: 58.0, d: 2.5, pt: 'Ela bate ponto todos os dias.',
                     en: 'It clocks in every single day.' },
  { t: 62.0, d: 6.2, pt: 'Hoje, talvez seja o primeiro dia em muito tempo que eu parei de fugir.',
                     en: 'Tonight might be the first time in a long while that I stopped running.' },
  { t: 69.2, d: 4.0, pt: 'Se existe uma conta esperando por mim...',
                     en: 'If there is a bill waiting for me...' },
  { t: 74.2, d: 2.3, pt: 'Já passou da hora de pagar.',
                     en: 'It is long past time I paid it.' },
];

// So vale quando NAO existe arquivo de audio. Com audio, o jogo usa a
// duracao real do arquivo.
export const NARRATION_END = NARRATION_REF_DUR;

// ---------------------------------------------------------------------------
// MONOLOGOS DE EXAMINAR — testam o sistema de dialogo antes de existir NPC.
// Formato: array de falas. speaker null = pensamento do detetive.
// ---------------------------------------------------------------------------

export const LINES = {
  alley_dumpster: [
    { pt: 'Lixo de bar. Vidro, guardanapo, nada que preste.',
      en: 'Bar trash. Glass, napkins, nothing worth a damn.' },
    { pt: 'Se tem alguem morando aqui, saiu com pressa.',
      en: 'If somebody was sleeping here, they left in a hurry.' },
  ],
  alley_poster: [
    { pt: 'Um cartaz de desaparecida. A chuva ja comeu metade do rosto.',
      en: 'A missing person poster. The rain ate half the face already.' },
    { pt: 'A data e de tres semanas atras. Ninguem arrancou.',
      en: 'Dated three weeks ago. Nobody tore it down.' },
    { pt: 'Ninguem arranca o que ninguem le.',
      en: 'Nobody tears down what nobody reads.' },
  ],
  alley_puddle: [
    { pt: 'A poca me devolve uma cara que eu nao reconheco mais.',
      en: 'The puddle hands me back a face I do not recognize anymore.' },
  ],
  alley_lamp: [
    { pt: 'O poste pisca. A cidade inteira pisca, so ninguem repara.',
      en: 'The lamp flickers. The whole city flickers, nobody notices.' },
  ],
  alley_door: [
    { pt: 'A porta dos fundos. Sem cadeado.',
      en: 'The back door. No padlock.' },
    { pt: 'Um bar fechado ha seis anos nao devia estar destrancado.',
      en: 'A bar shut for six years has no business being unlocked.' },
  ],
  bar_chairs: [
    { pt: 'Cadeiras empilhadas. Empilhadas direito, uma por uma.',
      en: 'Chairs stacked. Stacked properly, one by one.' },
    { pt: 'Quem fecha um bar para sempre nao arruma as cadeiras.',
      en: 'Nobody closing a bar for good bothers stacking the chairs.' },
  ],
  bar_counter: [
    { pt: 'O balcao esta limpo. Sem poeira.',
      en: 'The counter is clean. No dust.' },
    { pt: 'Seis anos de po nao somem sozinhos.',
      en: 'Six years of dust does not just walk away.' },
  ],
  bar_phone: [
    { pt: 'Um telefone de parede. O fio esta cortado.',
      en: 'A wall phone. The cord is cut.' },
    { pt: 'Cortado ha tempo. O corte ja enferrujou.',
      en: 'Cut a long time ago. The cut has rusted over.' },
    { pt: 'Entao de onde veio a ligacao?',
      en: 'So where did the call come from?' },
  ],
  bar_wreck: [
    { pt: 'A parede foi arrebentada de dentro para fora.',
      en: 'The wall was broken from the inside out.' },
    { pt: 'As farpas apontam para ca. Alguem bateu daquele lado.',
      en: 'The splinters point this way. Something struck from the other side.' },
    { pt: 'E do outro lado nao tem comodo nenhum. So parede.',
      en: 'And on the other side there is no room. Just wall.' },
  ],
  bar_mirror: [
    { pt: 'O espelho atras das garrafas esta trincado no meio.',
      en: 'The mirror behind the bottles is cracked down the middle.' },
    { pt: 'Nao olho. Hoje nao.',
      en: 'I do not look. Not tonight.' },
  ],
};

export function line(key, idx) {
  const arr = LINES[key];
  if (!arr || !arr[idx]) return '';
  return arr[idx][lang] !== undefined ? arr[idx][lang] : arr[idx].pt;
}

export function lineCount(key) {
  return LINES[key] ? LINES[key].length : 0;
}

export const SPEAKER = {
  self: { pt: 'EU', en: 'ME' },
};

export function speaker(id) {
  const s = SPEAKER[id];
  if (!s) return '';
  return s[lang] !== undefined ? s[lang] : s.pt;
}
