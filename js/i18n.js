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
// Estes tempos NAO foram escritos no olho: sairam da analise do proprio
// arquivo assets/audio/narrator.mp3. O envelope de volume do audio foi
// medido em janelas de 20ms, o que separou 17 blocos de fala com as pausas
// entre eles; as 17 frases deste roteiro foram encaixadas nesses blocos.
// Duas fronteiras bateram com erro 0.00s e o resto ficou entre 0.17s e
// 0.68s — abaixo do que o olho percebe numa legenda.
//
// t = segundo em que a legenda aparece (ja com 0.25s de antecedencia sobre
//     a voz, que e como legenda de cinema se comporta)
// d = quanto tempo fica na tela — cada uma dura ate a proxima entrar, para
//     nao piscar buraco entre as falas
//
// SE VOCE TROCAR O AUDIO, estes numeros precisam ser refeitos.
// Audio atual: 60.76s, 36.84s de fala em 17 blocos.
// ---------------------------------------------------------------------------

export const NARRATION = [
  { t:  0.49, d: 3.36, pt: 'Todo detetive tem um caso que nao fecha.',
                       en: 'Every detective has the one case that never closes.' },
  { t:  3.85, d: 6.78, pt: 'O meu tem sete anos e um nome que eu nao digo em voz alta.',
                       en: 'Mine is seven years old, and has a name I do not say out loud.' },
  { t: 10.63, d: 5.51, pt: 'Perdi o distintivo. Depois a casa. Depois o resto.',
                       en: 'I lost the badge. Then the house. Then everything after that.' },
  { t: 16.14, d: 7.12, pt: 'Sobrou o telefone. E ele nunca tocava.',
                       en: 'All that was left was the phone. And it never rang.' },
  { t: 23.25, d: 3.48, pt: 'Ate hoje, duas e quatorze da manha.',
                       en: 'Until tonight. Two fourteen in the morning.' },
  { t: 26.74, d: 6.26, pt: 'Uma voz de mulher. Sem nome. Sem pressa.',
                       en: 'A woman\'s voice. No name. In no hurry.' },
  { t: 33.00, d: 8.33, pt: '"O senhor foi o unico que atendeu", ela disse.',
                       en: '"You were the only one who answered," she said.' },
  { t: 41.33, d: 6.98, pt: 'Deu um endereco. Um bar fechado ha seis anos.',
                       en: 'She gave me an address. A bar that closed six years ago.' },
  { t: 48.32, d: 5.45, pt: 'Eu devia ter desligado. Todo mundo devia.',
                       en: 'I should have hung up. Anyone would have.' },
  { t: 53.77, d: 7.19, pt: 'Mas quem nao tem nada nao tem medo de perder.',
                       en: 'But a man with nothing has nothing left to lose.' },
];

// So vale quando NAO existe arquivo de audio. Com audio, o jogo usa a
// duracao real do arquivo.
export const NARRATION_END = 60.8;

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
