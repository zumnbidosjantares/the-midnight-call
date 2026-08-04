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
  loc_back:       { pt: 'DEPOSITO DOS FUNDOS',  en: 'BACK STOREROOM' },
  loc_cell:       { pt: 'EM ALGUM LUGAR',       en: 'SOMEWHERE' },
  note_text:      { pt: 'POR QUE VOCÊ VOLTOU AQUI?',
                    en: 'WHY DID YOU COME BACK HERE?' },

  bark_blood:     { pt: 'Sangue. Fresco.',              en: 'Blood. Fresh.' },
  bark_blood2:    { pt: 'Vai para os fundos.',          en: 'It leads to the back.' },
  bark_back_door: { pt: 'A trilha para aqui.',          en: 'The trail stops here.' },
  bark_pool:      { pt: 'Alguem ficou parado sangrando aqui. Tempo demais.',
                    en: 'Someone stood here bleeding. For too long.' },
  bark_note_pre:  { pt: 'Tem um papel no meio da poça.',
                    en: 'There is a piece of paper in the middle of it.' },
  qte_hint:       { pt: 'A  +  D  ALTERNADO',           en: 'A  +  D  ALTERNATE' },
  to_be_continued:{ pt: 'CONTINUA',                     en: 'TO BE CONTINUED' },
  prompt_pry:     { pt: 'FORCAR',                       en: 'PRY' },

  bark_note_1:    { pt: 'Quem escreveu isso sabia que eu viria.',
                    en: 'Whoever wrote this knew I would come.' },
  bark_note_2:    { pt: 'Sabia ate onde eu ia parar pra ler.',
                    en: 'Knew exactly where I would stop to read it.' },
  // NAO devolver a fala antiga aqui ("Tem alguem atras de mim, nao tem?").
  // Ela entregava o susto: o detetive nao pode perceber a figura, senao o
  // jogador para de sentir que sabe mais do que ele.
  bark_note_3:    { pt: 'Essa letra... eu conheço essa letra.',
                    en: 'This handwriting... I know this handwriting.' },

  bark_free_1:    { pt: 'Cano velho. Enferrujado por dentro.',
                    en: 'Old pipe. Rusted through.' },
  bark_free_2:    { pt: 'Levaram tudo. O cigarro, a arma, a carteira.',
                    en: 'They took everything. The smokes, the gun, the wallet.' },
  bark_free_3:    { pt: 'Deixaram o casaco. Que gentileza.',
                    en: 'They left the coat. How thoughtful.' },
  bark_pipe_take: { pt: 'Serve.',                       en: 'This will do.' },
  bark_door_pry:  { pt: 'Pregada por fora. Alguem me trancou aqui.',
                    en: 'Nailed from outside. Someone locked me in.' },
  bark_out:       { pt: 'Ar. Finalmente.',              en: 'Air. Finally.' },

  bark_cell_1:    { pt: 'Cano. Frio. Sem folga.',       en: 'Pipe. Cold. No slack.' },
  bark_cell_2:    { pt: 'Nao me mataram. Isso e pior.', en: 'They did not kill me. That is worse.' },
  bark_cell_3:    { pt: 'Alguem me trouxe ate aqui. Carregado.',
                    en: 'Somebody carried me here.' },
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

  // =====================================================================
  // CAPITULO 2 — "GENTILEZA"
  // =====================================================================

  chapter_2:      { pt: 'CAPITULO DOIS',        en: 'CHAPTER TWO' },
  chapter_2_name: { pt: 'Gentileza',            en: 'Kindness' },

  loc_corridor:   { pt: 'CORREDOR DE CARGA',    en: 'LOADING CORRIDOR' },
  loc_office:     { pt: 'ESCRITORIO',           en: 'FRONT OFFICE' },
  loc_shelves:    { pt: 'SETOR B — ESTANTES',   en: 'SECTOR B — RACKS' },
  loc_locker:     { pt: 'VESTIARIO',            en: 'LOCKER ROOM' },
  loc_cold:       { pt: 'CAMARA FRIA',          en: 'COLD STORE' },
  loc_machines:   { pt: 'SALA DE MAQUINAS',     en: 'MACHINE ROOM' },
  loc_mezz:       { pt: 'MEZANINO',             en: 'MEZZANINE' },
  loc_dock:       { pt: 'DOCA 3',               en: 'DOCK 3' },

  speaker_me:     { pt: 'EU',      en: 'ME' },
  talk_leave:     { pt: 'Deixa pra lá.', en: 'Never mind.' },
  prompt_take:    { pt: 'PEGAR',   en: 'TAKE' },
  prompt_read:    { pt: 'LER',     en: 'READ' },
  prompt_hide:    { pt: 'ESCONDER', en: 'HIDE' },
  prompt_talk2:   { pt: 'FALAR',   en: 'TALK' },
  prompt_force:   { pt: 'FORCAR',  en: 'FORCE' },

  // ---------- corredor de carga ----------
  b2_corr_1:  { pt: 'Isso não é um galpão. Isso é um quarteirão.',
                en: 'This is not a warehouse. This is a city block.' },
  b2_corr_2:  { pt: 'Eu estava numa caixa de fósforo dentro de outra caixa.',
                en: 'I was in a matchbox inside another box.' },
  b2_corr_3:  { pt: 'Um lugar desse tamanho devia ter eco.',
                en: 'A place this size should have an echo.' },
  b2_corr_4:  { pt: 'Devia. Não tem.',
                en: 'It should. It does not.' },
  b2_club_1:  { pt: 'Um pedaço de pau do tamanho certo. Encostado numa coluna. Em pé.',
                en: 'A piece of wood exactly the right size. Leaning on a column. Upright.' },
  b2_club_2:  { pt: 'Que sorte a minha.',
                en: 'Lucky me.' },
  b2_corr_5:  { pt: 'Toda porta daqui tranca por fora.',
                en: 'Every door in this place locks from outside.' },

  // ---------- escritorio ----------
  b2_off_1:   { pt: 'Escritório. Luz acesa. Claro que sim.',
                en: 'An office. Light on. Of course.' },
  b2_diary_1: { pt: 'Um caderno em branco. E uma caneta que ainda escreve.',
                en: 'A blank notebook. And a pen that still works.' },
  b2_diary_2: { pt: 'Até parece que querem que eu anote.',
                en: 'Almost like somebody wants me taking notes.' },
  b2_diary_3: { pt: 'Ou eu estou com muita sorte, ou alguém está arrumando a casa pra mim.',
                en: 'Either I am very lucky, or somebody is tidying the house for me.' },
  b2_map_1:   { pt: 'Setor A, B, C. Câmara fria. Casa de máquinas.',
                en: 'Sector A, B, C. Cold store. Machine room.' },
  b2_map_2:   { pt: 'Pelo menos agora eu sei o tamanho do problema.',
                en: 'At least now I know how big the problem is.' },
  b2_vigia_bye: { pt: 'Ele nunca perguntou o meu nome.',
                en: 'He never asked my name.' },

  // ---------- estantes ----------
  b2_shelf_1: { pt: 'Corredor de estante. Não dá pra ver duas fileiras à frente.',
                en: 'Racking aisle. You cannot see two rows ahead.' },
  b2_shelf_2: { pt: 'Alguma coisa se mexeu ali atrás.',
                en: 'Something moved back there.' },
  b2_know:    { pt: '...eu conheço isso.',
                en: '...I know this.' },
  b2_ammo_1:  { pt: 'Munição.',
                en: 'Ammunition.' },
  b2_ammo_2:  { pt: 'Sem arma.',
                en: 'No gun.' },
  b2_ammo_3:  { pt: 'Alguém tem senso de humor.',
                en: 'Somebody has a sense of humor.' },

  // ---------- vestiario ----------
  b2_lock_1:  { pt: 'Vestiário. Luz melhor. Quase um lugar de gente.',
                en: 'Locker room. Better light. Almost a place for people.' },
  b2_lock_2:  { pt: 'Se eu fosse sentar em algum canto, seria aqui.',
                en: 'If I were going to sit down anywhere, it would be here.' },
  b2_cig_1:   { pt: '...',
                en: '...' },
  b2_cig_2:   { pt: 'Minha marca.',
                en: 'My brand.' },
  b2_cig_3:   { pt: 'Isso já não é sorte. Isso é recado.',
                en: 'This is not luck anymore. This is a message.' },
  b2_mirror_after: { pt: '...era isso que eu não queria ver.',
                en: '...that is what I did not want to see.' },

  // ---------- camara fria ----------
  b2_cold_1:  { pt: 'Frio. Depois de todos esses anos, ainda tem frio aqui dentro.',
                en: 'Cold. After all these years, it is still cold in here.' },
  b2_cold_2:  { pt: 'Isso não é possível. Já sei. Já anotei.',
                en: 'Not possible. I know. I wrote it down.' },
  b2_cold_3:  { pt: 'O isqueiro dura uns segundos. Depois esfria demais pra segurar.',
                en: 'The lighter lasts a few seconds. Then it gets too cold to hold.' },
  b2_hook_1:  { pt: 'Os ganchos estão balançando. Todos.',
                en: 'The hooks are swinging. All of them.' },
  b2_hook_2:  { pt: 'Não tem vento aqui.',
                en: 'There is no wind in here.' },
  b2_hook_3:  { pt: 'Tem alguma coisa pendurada ali.',
                en: 'There is something hanging over there.' },
  b2_hook_4:  { pt: 'Um casaco. Marrom.',
                en: 'A coat. Brown.' },
  b2_hook_5:  { pt: 'Não tem nada ali.',
                en: 'There is nothing there.' },
  b2_hook_6:  { pt: 'Nunca teve.',
                en: 'There never was.' },

  // ---------- sala de maquinas ----------
  b2_mach_1:  { pt: 'Zumbido. Num lugar sem energia.',
                en: 'A hum. In a place with no power.' },
  b2_gun_1:   { pt: 'Lá está ela.',
                en: 'There it is.' },
  b2_gun_2:   { pt: 'No meio da sala. Limpa. Apontada pra porta.',
                en: 'Middle of the room. Clean. Pointed at the door.' },
  b2_gun_3:   { pt: 'Isso não é uma arma perdida. Isso é uma arma entregue.',
                en: 'That is not a lost gun. That is a gun handed over.' },
  b2_gun_4:   { pt: 'E eu vou pegar, porque eu sou exatamente o idiota que eles precisam.',
                en: 'And I am going to take it, because I am exactly the fool they need.' },
  b2_ambush:  { pt: 'Claro.',
                en: 'Of course.' },
  b2_ambush2: { pt: 'Toda gentileza cobra na saída.',
                en: 'Every kindness bills you on the way out.' },

  // ---------- mezanino ----------
  b2_mezz_1:  { pt: '...',
                en: '...' },
  b2_mezz_2:  { pt: 'Moça?',
                en: 'Miss?' },
  b2_mezz_3:  { pt: 'Moça, eu não vou te machucar.',
                en: 'Miss, I am not going to hurt you.' },
  b2_mezz_4:  { pt: 'Cabos que não terminam em lugar nenhum.',
                en: 'Cables that do not end anywhere.' },

  // ---------- a fuga ----------
  b2_chase_1: { pt: 'As luzes estão apagando. Setor por setor.',
                en: 'The lights are going out. Sector by sector.' },
  b2_chase_2: { pt: 'Vindo pra cá.',
                en: 'Coming this way.' },
  b2_chase_3: { pt: 'Isso é metal raspando no chão.',
                en: 'That is metal dragging on concrete.' },
  b2_chase_4: { pt: 'Esse casaco é igual ao meu.',
                en: 'That coat is the same as mine.' },
  b2_chase_5: { pt: 'A doca. Chuva do outro lado.',
                en: 'The dock. Rain on the other side.' },
  b2_chase_6: { pt: 'Não adianta. Ele não cai.',
                en: 'No use. He does not go down.' },
  b2_end_1:   { pt: 'Ele não veio atrás.',
                en: 'He did not follow.' },
  b2_end_2:   { pt: 'Só ficou olhando.',
                en: 'He just stood there watching.' },
  b2_end_3:   { pt: 'Não era pra cobrar hoje.',
                en: 'Tonight was not collection day.' },

  // ---------- o cigarro travado (degrau 1) ----------
  cig_no_1:   { pt: 'Não.',                      en: 'No.' },
  cig_no_2:   { pt: 'Eu não vou fumar isso.',    en: 'I am not smoking that.' },
  cig_no_3:   { pt: 'Não é hoje.',               en: 'Not today.' },
  cig_no_4:   { pt: 'Guarda isso.',              en: 'Put it away.' },

  // ---------- combate ----------
  b2_swing_tired: { pt: 'Preciso... de um segundo.',
                en: 'I need... a second.' },
  b2_club_broke:  { pt: 'Quebrou. Era madeira, afinal.',
                en: 'Snapped. It was wood, after all.' },
  b2_hurt_1:  { pt: 'Isso doeu de verdade.',     en: 'That one was real.' },
  b2_down:    { pt: 'Não. Ainda não.',           en: 'No. Not yet.' },

  // ---------- interface: caderno ----------
  jr_title:       { pt: 'CADERNO',            en: 'NOTEBOOK' },
  jr_hint:        { pt: 'SETAS  VIRAR PAGINA      Q  FECHAR',
                    en: 'ARROWS  TURN PAGE      Q  CLOSE' },
  jr_empty:       { pt: 'Nada anotado ainda.', en: 'Nothing written yet.' },
  jr_new:         { pt: 'ANOTADO NO CADERNO',  en: 'WRITTEN IN THE NOTEBOOK' },
  jr_cat_clue:    { pt: 'PISTAS',             en: 'LEADS' },
  jr_cat_people:  { pt: 'PESSOAS',            en: 'PEOPLE' },
  jr_cat_place:   { pt: 'LUGARES',            en: 'PLACES' },
  jr_cat_self:    { pt: 'EU MESMO',           en: 'MYSELF' },
  jr_cat_other:   { pt: '?',                  en: '?' },
  jr_page:        { pt: 'PAGINA',             en: 'PAGE' },

  // ---------- interface: inventario ----------
  inv_title:      { pt: 'O CASACO',           en: 'THE COAT' },
  inv_hint:       { pt: 'ARRASTAR  MOVER      R  GIRAR      TAB  FECHAR',
                    en: 'DRAG  MOVE      R  ROTATE      TAB  CLOSE' },
  inv_belt:       { pt: 'CINTO',              en: 'BELT' },
  inv_pocket_l:   { pt: 'BOLSO INTERNO',      en: 'INNER POCKET' },
  inv_pocket_r:   { pt: 'BOLSO INTERNO',      en: 'INNER POCKET' },
  inv_chest:      { pt: 'PEITO',              en: 'CHEST' },
  inv_full:       { pt: 'Não cabe.',          en: 'It does not fit.' },
  inv_got:        { pt: 'GUARDADO',           en: 'STOWED' },
  inv_nohands:    { pt: 'O porrete não cabe em bolso nenhum. Fica na mão ou fica pra trás.',
                    en: 'The club fits in no pocket. It stays in your hand or stays behind.' },

  it_club:        { pt: 'RIPA DE PALETE',     en: 'PALLET SLAT' },
  it_club_d:      { pt: 'Madeira grossa, um prego torto na ponta. Vai quebrar uma hora.',
                    en: 'Thick wood, a bent nail at the tip. It will break eventually.' },
  it_ammo:        { pt: 'CAIXA DE MUNICAO',   en: 'BOX OF ROUNDS' },
  it_ammo_d:      { pt: 'Cheia. Nova. Inútil, por enquanto.',
                    en: 'Full. New. Useless, for now.' },
  it_cigs:        { pt: 'MACO DE CIGARROS',   en: 'PACK OF CIGARETTES' },
  it_cigs_d:      { pt: 'Fechado. Da minha marca.',
                    en: 'Sealed. My brand.' },
  it_lighter:     { pt: 'ISQUEIRO',           en: 'LIGHTER' },
  it_lighter_d:   { pt: 'Pesa pouco. Acende no primeiro golpe.',
                    en: 'Light in the hand. Catches on the first strike.' },
  it_gun:         { pt: 'PISTOLA',            en: 'PISTOL' },
  it_gun_d:       { pt: 'Limpa demais pra um lugar assim.',
                    en: 'Too clean for a place like this.' },
  it_map:         { pt: 'MAPA DO GALPAO',     en: 'WAREHOUSE MAP' },
  it_map_d:       { pt: 'Planta baixa. Alguém marcou a doca 3 a lápis.',
                    en: 'Floor plan. Somebody pencilled a mark on dock 3.' },
  it_note:        { pt: 'BILHETE',            en: 'THE NOTE' },
  it_note_d:      { pt: '"POR QUE VOCÊ VOLTOU AQUI?" Eu conheço essa letra.',
                    en: '"WHY DID YOU COME BACK HERE?" I know this handwriting.' },

  // ---------- interface: sanidade ----------
  san_1:          { pt: 'LUCIDO',             en: 'LUCID' },
  san_2:          { pt: 'RACHANDO',           en: 'CRACKING' },
  san_3:          { pt: 'VAZANDO',            en: 'LEAKING' },
  san_4:          { pt: 'RENDIDO',            en: 'SURRENDERED' },

  // ---------- interface: perseguicao ----------
  hint_hold_breath: { pt: 'SEGURE  SHIFT  PARA PRENDER A RESPIRACAO',
                    en: 'HOLD  SHIFT  TO HOLD YOUR BREATH' },
  hint_hide:      { pt: 'E  PARA SAIR',       en: 'E  TO GET OUT' },
  hint_journal:   { pt: 'Q  CADERNO      TAB  CASACO',
                    en: 'Q  NOTEBOOK      TAB  COAT' },
  hint_run:       { pt: 'SHIFT  CORRER',      en: 'SHIFT  RUN' },

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
  wh_gate: [
    { pt: 'Portao de enrolar. Cadeado do lado de fora.',
      en: 'Roller gate. Padlock on the outside.' },
    { pt: 'Nao fui eu que fechei.', en: 'I did not close it.' },
  ],
  wh_sky: [
    { pt: 'Claraboia quebrada. Uns oito metros de altura.',
      en: 'Broken skylight. Twenty-five feet up.' },
    { pt: 'Se eu tivesse vinte anos a menos, talvez.',
      en: 'Twenty years ago, maybe.' },
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

  // =====================================================================
  // CAPITULO 2
  // =====================================================================

  c2_forklift: [
    { pt: 'Chave na ignição. Bateria seca há uns dez anos.',
      en: 'Key in the ignition. Battery dead about ten years.' },
    { pt: 'Alguém saiu daqui com pressa. Ou nunca voltou.',
      en: 'Somebody left in a hurry. Or never came back.' },
  ],
  c2_dockgate: [
    { pt: 'Trancado por fora. Igual todos os outros.',
      en: 'Locked from outside. Like all the others.' },
    { pt: 'Estou começando a achar que "por fora" é o único lado que existe.',
      en: 'I am starting to think "outside" is the only side there is.' },
  ],
  c2_clock: [
    { pt: 'Relógio de ponto. Parado.',
      en: 'Punch clock. Stopped.' },
    { pt: '02h14.',
      en: '2:14 AM.' },
  ],
  c2_pallets: [
    { pt: 'Foi daqui que saiu meu pedaço de pau.',
      en: 'This is where my piece of wood came from.' },
    { pt: 'Ou pelo menos é o que eu prefiro acreditar.',
      en: 'Or that is what I would rather believe.' },
  ],
  c2_photo: [
    { pt: 'Foto de família. O vidro trincado.',
      en: 'A family photo. The glass is cracked.' },
    { pt: 'Não é a minha família. Acho que não é.',
      en: 'Not my family. I do not think it is.' },
  ],
  c2_cabinet: [
    { pt: 'Pastas de A a C. E de E até Z.',
      en: 'Files from A to C. And from E to Z.' },
    { pt: 'Só a gaveta do D não está aqui.',
      en: 'Only the D drawer is missing.' },
  ],
  c2_mug: [
    { pt: 'Café pela metade. Ainda morno.',
      en: 'Half a cup of coffee. Still warm.' },
    { pt: 'Isso não é possível.',
      en: 'That is not possible.' },
  ],
  c2_board: [
    { pt: 'Quadro de avisos. Aviso de segurança de dez anos atrás.',
      en: 'Notice board. A safety notice from ten years ago.' },
    { pt: '"MANTENHA AS SAIDAS DESOBSTRUIDAS". Boa piada.',
      en: '"KEEP EXITS CLEAR". Good one.' },
  ],
  c2_rack: [
    { pt: 'Isso desabou de dentro para fora. Igual a parede do bar.',
      en: 'This came down from the inside out. Same as the wall in the bar.' },
  ],
  c2_boxes: [
    { pt: 'Todas as caixas estão vazias. Todas lacradas.',
      en: 'Every box is empty. Every box is sealed.' },
    { pt: 'Ninguém lacra caixa vazia.',
      en: 'Nobody seals an empty box.' },
  ],
  c2_dragmark: [
    { pt: 'Alguma coisa foi arrastada por aqui. Pesado.',
      en: 'Something was dragged through here. Something heavy.' },
    { pt: 'E não faz muito tempo.',
      en: 'And not long ago.' },
  ],
  c2_lockers: [
    { pt: 'Marcos. Elaine. Betinho.',
      en: 'Marcos. Elaine. Betinho.' },
    { pt: 'Gente que teve nome. Deve ter ido embora.',
      en: 'People who had names. They must have left.' },
  ],
  c2_radio: [
    { pt: 'Ainda liga.',
      en: 'It still turns on.' },
    { pt: 'Estática. Em todas as estações.',
      en: 'Static. On every station.' },
    { pt: 'Achei que fosse gostar mais do silêncio.',
      en: 'I thought I liked silence more than this.' },
  ],
  c2_roster: [
    { pt: 'Escala do mês. Todo mundo com folga marcada.',
      en: 'This month’s roster. Everyone has a day off marked.' },
    { pt: 'Ninguém marcou volta.',
      en: 'Nobody marked a return.' },
  ],
  c2_coffee: [
    { pt: 'Sem copo. Sem energia. Sem chance.',
      en: 'No cup. No power. No chance.' },
  ],
  c2_locknote: [
    { pt: '"Volto às seis."',
      en: '"Back at six."' },
    { pt: 'Todo mundo volta às seis.',
      en: 'Everybody is back at six.' },
  ],
  c2_thermo: [
    { pt: 'Marca dois graus negativos.',
      en: 'It reads two below.' },
    { pt: 'O compressor está desligado há uma década.',
      en: 'The compressor has been off for a decade.' },
  ],
  c2_hooks: [
    { pt: 'Fileira de ganchos. Vinte e três.',
      en: 'A row of hooks. Twenty-three.' },
    { pt: 'Contei duas vezes. Deu vinte e quatro na segunda.',
      en: 'I counted twice. The second time it was twenty-four.' },
  ],
  c2_panel: [
    { pt: 'Disjuntor geral desligado. Selado com arame.',
      en: 'Main breaker off. Sealed with wire.' },
    { pt: 'Então de onde vem esse zumbido?',
      en: 'So where is that hum coming from?' },
  ],
  c2_overall: [
    { pt: 'Macacão de mecânico. Do meu tamanho.',
      en: 'A mechanic’s overall. My size.' },
    { pt: 'Claro que é do meu tamanho.',
      en: 'Of course it is my size.' },
  ],
  c2_boiler: [
    { pt: 'Caldeira fria. Fria de anos, não de horas.',
      en: 'Cold boiler. Cold for years, not hours.' },
    { pt: 'E mesmo assim o cano treme.',
      en: 'And the pipe is trembling anyway.' },
  ],
  c2_switchboard: [
    { pt: 'Uma mesa telefônica. Dessas de plugue e cabo.',
      en: 'A switchboard. The old plug-and-cord kind.' },
    { pt: 'Nenhum dos cabos vai a lugar nenhum.',
      en: 'None of the cords go anywhere.' },
  ],
  c2_railing: [
    { pt: 'Daqui dá pra ver o galpão inteiro.',
      en: 'From up here you can see the whole warehouse.' },
    { pt: 'E o galpão inteiro dá pra me ver.',
      en: 'And the whole warehouse can see me.' },
  ],
  c2_dockdoor: [
    { pt: 'Doca 3. Foi essa que estava marcada a lápis no mapa.',
      en: 'Dock 3. That is the one pencilled on the map.' },
    { pt: 'Alguém marcou a minha saída antes de eu chegar.',
      en: 'Somebody marked my way out before I got here.' },
  ],
};

// ---------------------------------------------------------------------------
// CONVERSAS COM NPC — arvore com escolhas.
//
// Cada no tem falas e, opcionalmente, escolhas. Escolha sem `to` encerra.
// Ninguem neste jogo pergunta o nome do detetive: todos ja sabem. Isso e
// regra, nao esquecimento (ver "AS MIGALHAS" no ROTEIRO.txt).
// ---------------------------------------------------------------------------

export const TALKS = {
  vigia: {
    speaker: { pt: 'VIGIA', en: 'NIGHT WATCHMAN' },
    start: 'a',
    nodes: {
      a: {
        lines: [
          { pt: 'O senhor é da inspeção? Avisaram que vinha alguém hoje.',
            en: 'Are you the inspector? They said somebody was coming today.' },
        ],
        choices: [
          { pt: 'Que dia é hoje?', en: 'What day is it?', to: 'dia' },
          { pt: 'Quem trabalha aqui?', en: 'Who works here?', to: 'gente' },
          { pt: 'Você me viu chegar?', en: 'Did you see me come in?', to: 'chegar' },
        ],
      },
      dia: {
        lines: [
          { pt: 'Terça.', en: 'Tuesday.' },
          { pt: 'ME|Terça de que ano?', en: 'ME|Tuesday of what year?' },
          { pt: '(ele sorri) Engraçado o senhor.', en: '(he smiles) You are a funny one.' },
        ],
        back: 'a',
      },
      gente: {
        lines: [
          { pt: 'Nós todos. Marcos na doca, Elaine no escritório. O Betinho entra às seis.',
            en: 'All of us. Marcos on the dock, Elaine in the office. Betinho clocks in at six.' },
          { pt: 'ME|E onde eles estão agora?', en: 'ME|And where are they now?' },
          { pt: 'No turno deles, ora.', en: 'On their shift, where else.' },
        ],
        back: 'a',
      },
      chegar: {
        lines: [
          { pt: 'O senhor chegou sozinho. Fui eu que abri o portão.',
            en: 'You came in on your own. I opened the gate for you.' },
          { pt: 'ME|O portão está trancado por fora.', en: 'ME|The gate is padlocked from outside.' },
          { pt: 'Então está tudo certo.', en: 'Then everything is in order.' },
        ],
        back: 'a',
      },
      fim: {
        lines: [
          { pt: 'Boa noite, David.', en: 'Good night, David.' },
        ],
      },
    },
  },

  // A TELEFONISTA. Ela e a origem da ligacao das 2h14 — e a resposta que ela
  // da e a maior pista do jogo, dita em tres palavras, sem explicar nada.
  operadora: {
    speaker: { pt: 'TELEFONISTA', en: 'OPERATOR' },
    start: 'a',
    nodes: {
      a: {
        lines: [
          { pt: 'Um momento, vou transferir.', en: 'One moment, I will put you through.' },
          { pt: 'ME|Transferir pra quem?', en: 'ME|Put me through to who?' },
          { pt: '(sem olhar) Pro senhor.', en: '(without looking up) To you, sir.' },
        ],
        choices: [
          { pt: 'Quem foi que me ligou?', en: 'Who called me?', to: 'quem' },
          { pt: 'Que lugar é este?', en: 'What is this place?', to: 'lugar' },
          { pt: 'Esses cabos não estão ligados em nada.',
            en: 'Those cords are not plugged into anything.', to: 'cabos' },
        ],
      },
      quem: {
        lines: [
          { pt: 'O senhor mesmo.', en: 'You did.' },
          { pt: 'O senhor foi o único que atendeu.', en: 'You were the only one who answered.' },
        ],
        back: 'a',
      },
      lugar: {
        lines: [
          { pt: 'É a central, senhor. Sempre foi.', en: 'It is the exchange, sir. It always was.' },
          { pt: 'ME|Central de quê?', en: 'ME|Exchange for what?' },
          { pt: 'De chamadas que ninguém atende.', en: 'For calls nobody answers.' },
        ],
        back: 'a',
      },
      cabos: {
        lines: [
          { pt: 'Estão sim. O senhor é que não vê a outra ponta.',
            en: 'They are. You just cannot see the other end.' },
        ],
        back: 'a',
      },
      fim: {
        lines: [
          { pt: 'Se o senhor lembrar de alguma coisa, é só chamar.',
            en: 'If you remember anything, just call.' },
        ],
      },
    },
  },
};

// ---------------------------------------------------------------------------
// PAGINAS DO CADERNO
//
// Ele anota sozinho. O jogador nunca digita nada. As paginas marcadas com
// `alheia` NAO foram escritas por ele: a letra e outra, mais firme, e elas
// so aparecem quando a sanidade cai. (Ver PARTE V do ROTEIRO.txt.)
// ---------------------------------------------------------------------------

export const JOURNAL = {
  j_phone:   { cat: 'clue', pt: 'Telefone do bar com o fio cortado há anos. A ligação veio assim mesmo.',
               en: 'The bar phone, cord cut years ago. The call came through anyway.' },
  j_note:    { cat: 'self', pt: 'O bilhete no depósito. Eu conheço a letra. Não sei de onde.',
               en: 'The note in the storeroom. I know the handwriting. I do not know from where.' },
  j_locked:  { cat: 'place', pt: 'Toda porta deste galpão tranca pelo lado de fora.',
               en: 'Every door in this warehouse locks from the outside.' },
  j_clock:   { cat: 'clue', pt: 'Relógio de ponto parado em 02h14. Mesma hora da ligação.',
               en: 'Punch clock stopped at 2:14. Same time as the call.' },
  j_vigia:   { cat: 'people', pt: 'O vigia. Fala de um turno que acabou há dez anos. Sabe o meu nome, e eu não disse.',
               en: 'The watchman. Talks about a shift that ended ten years ago. Knows my name, and I never said it.' },
  j_conv:    { cat: 'clue', pt: 'Cada coisa de que eu preciso aparece no minuto em que eu preciso.',
               en: 'Everything I need turns up the minute I need it.' },
  j_ammo:    { cat: 'clue', pt: 'Achei munição antes de achar arma. Nessa ordem.',
               en: 'I found ammunition before I found a gun. In that order.' },
  j_cigs:    { cat: 'self', pt: 'Um maço da minha marca, num armário que não é meu.',
               en: 'A pack of my brand, in a locker that is not mine.' },
  j_mirror:  { cat: 'self', pt: 'Eu me vi. Não vou escrever o que eu vi.',
               en: 'I saw myself. I am not writing down what I saw.' },
  j_cold:    { cat: 'place', pt: 'Dois graus negativos numa câmara desligada há dez anos.',
               en: 'Two below in a cold store that has been off for ten years.' },
  j_hooks:   { cat: 'clue', pt: 'Contei os ganchos duas vezes. Deram números diferentes.',
               en: 'I counted the hooks twice. Two different numbers.' },
  j_gun:     { cat: 'clue', pt: 'A arma não estava caída. Estava posta, apontada pra porta por onde eu entrei.',
               en: 'The gun was not dropped. It was placed, aimed at the door I came in by.' },
  j_oper:    { cat: 'people', pt: 'Uma telefonista no mezanino. Disse que quem me ligou fui eu.',
               en: 'An operator on the mezzanine. She said the man who called me was me.' },
  j_credor:  { cat: 'self', pt: 'Alguma coisa do meu tamanho, com o meu casaco, arrastando o meu cano.',
               en: 'Something my size, in my coat, dragging my pipe.' },

  // As que ele nao escreveu.
  j_x1: { cat: 'other', alheia: true, pt: 'VOCÊ ESTÁ QUASE LEMBRANDO.', en: 'YOU ARE ALMOST REMEMBERING.' },
  j_x2: { cat: 'other', alheia: true, pt: 'NÃO ERA CULPA DELA.',        en: 'IT WAS NOT HER FAULT.' },
  j_x3: { cat: 'other', alheia: true, pt: 'SETE ANOS. CONTA DIREITO.',  en: 'SEVEN YEARS. COUNT AGAIN.' },
};

// Resolve um par {pt, en} no idioma atual. Usado por conversas, caderno e
// inventario, que guardam o texto junto do dado em vez de numa chave.
export function tx(o) {
  if (!o) return '';
  return o[lang] !== undefined ? o[lang] : o.pt;
}

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
