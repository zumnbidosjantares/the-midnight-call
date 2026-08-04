// main.js — maquina de estados do jogo e laco principal.
//
//   BOOT  ->  MENU  ->  CUTSCENE  ->  PLAY  <->  PAUSE
//                 \->  LAB (sala de teste)
//
// Regra de desenho respeitada em todos os estados: mundo primeiro, LUZ no
// meio, interface por ultimo. Se a interface for desenhada antes da luz,
// ela sai escura junto com o cenario.

import { VW, VH, gfx, clamp, lerp } from './core/gfx.js';
import { input } from './core/input.js';
import { audio } from './core/audio.js';
import { save, formatPlaytime } from './core/save.js';
import { text, clearTextCache } from './core/text.js';
import { PAL } from './art/palette.js';
import { ANIM_NAMES } from './art/detective.js';
import { Camera } from './world/camera.js';
import { Rain, Fog, Particles, DustMotes } from './world/fx.js';
import { buildAlley, buildBar, buildBackroom, buildWarehouse, buildRoad, buildCar } from './world/levels.js';
import { buildChapter2 } from './world/levels-ch2.js';
import { NoteScene } from './systems/scene-nota.js';
import { MirrorScene } from './systems/scene-espelho.js';
import { Player } from './systems/player.js';
import { Dialogue, drawPrompt, drawLocationCard } from './systems/dialogue.js';
import { Opening } from './systems/cutscene.js';
import { Sanity } from './systems/sanity.js';
import { Journal } from './systems/journal.js';
import { Inventory } from './systems/inventory.js';
import { Director, Enemy } from './systems/enemies.js';
import { Npc, NPCS } from './systems/npc.js';
import { Chase } from './systems/chase.js';
import { TitleMenu } from './ui/menu.js';
import { PauseMenu } from './ui/pause.js';
import { SlotPicker, OptionsPanel, screenDim, panelBox } from './ui/panels.js';
import { t as T, setLang, getLang, LINES, line as L, TALKS } from './i18n.js';

const settings = {
  lang: 'pt',
  master: 0.8, music: 0.55, sfx: 0.85, voice: 1.0,
  subs: true, scanlines: 0.07, grain: 0.018,
  shake: true, pixelPerfect: false,
};

class Game {
  constructor() {
    this.state = 'boot';
    this.playtime = 0;
    this.transition = null;
    this.debug = false;
    this.locCard = 0;
    this.fps = 60;
    this.frames = 0; this.fpsT = 0;
  }

  // -------------------------------------------------------------------
  // arranque
  // -------------------------------------------------------------------

  async boot() {
    const msg = document.getElementById('boot-msg');
    const set = (s) => { if (msg) msg.textContent = s; };

    const st = save.loadSettings();
    if (st) Object.assign(settings, st);
    setLang(settings.lang || 'pt');

    gfx.init();
    input.init();
    this.applySettings();

    set('montando o beco...');
    await frame();
    this.levels = { alley: buildAlley() };

    set('acendendo o bar...');
    await frame();
    this.levels.bar = buildBar();

    set('abrindo os fundos...');
    await frame();
    this.levels.backroom = buildBackroom();
    this.levels.warehouse = buildWarehouse();

    // O Capitulo 2 e um galpao inteiro: sete setores mais a doca. Cada um
    // e montado uma vez, aqui, e depois so deslocado.
    set('acendendo o galpao...');
    await frame();
    Object.assign(this.levels, buildChapter2());

    set('ligando o carro...');
    await frame();
    this.road = buildRoad();
    this.car = buildCar();

    set('procurando a narracao...');
    this.narrationUrl = await audio.findNarration();

    set('afinando o titulo...');
    await frame();
    this.menu = new TitleMenu(this);
    this.menu.build();

    // mundo jogavel
    this.cam = new Camera();
    this.fx = new Particles(500);
    this.player = new Player(this.fx);
    this.rain = new Rain({ count: 210, groundY: 216 });
    this.fog = new Fog({ y: 190, alpha: 0.14, count: 6 });
    this.dust = new DustMotes(70);
    this.dialogue = new Dialogue();
    this.pause = new PauseMenu(settings, {
      onSave: (i) => this.saveSlot(i),
      onLoad: (i) => this.loadSlot(i),
      onQuit: () => this.toMenu(),
      onSettings: () => this.applySettings(),
    });
    this.menuSlots = new SlotPicker();
    this.menuOptions = new OptionsPanel(settings, () => this.applySettings());
    this.player.onInteract = (it) => this.doInteract(it);

    // ---- sistemas do Capitulo 2 ----
    this.sanity = new Sanity();
    this.journal = new Journal();
    this.inv = new Inventory();
    this.director = new Director();
    this.chase = new Chase();
    this.npcs = {};
    for (const id of Object.keys(NPCS)) this.npcs[id] = new Npc(id);
    this.player.onClubHit = () => this.golpeDePorrete();
    this.player.onShot = (x, f, a) => this.tiro(x, f, a);
    this.player.onHurt = (n) => { this.sanity.drain(n * 0.35, true); };
    this.inv.onUse = (key) => this.usarItem(key);
    this.sanity.onEvent = (tipo) => this.eventoSanidade(tipo);

    set(this.narrationUrl ? 'PRESSIONE QUALQUER TECLA' : 'PRESSIONE QUALQUER TECLA');
    this.state = 'waitkey';

    // O laco engole erros de um quadro so. Um soluco isolado (um gradiente
    // com numero invalido, um sprite que ainda nao existe) nao pode matar a
    // sessao inteira; tres erros seguidos, ai sim, para e mostra a tela de
    // erro — nesse ponto o jogo esta quebrado de verdade.
    let last = performance.now();
    let seguidos = 0;
    const loop = (ts) => {
      let dt = (ts - last) / 1000;
      last = ts;
      // dt pode vir negativo no primeiro quadro (o carimbo do rAF as vezes e
      // anterior ao performance.now() lido antes dele) ou absurdo depois de a
      // aba ficar minimizada. Os dois estragam a fisica.
      if (!(dt > 0)) dt = 1 / 60;
      if (dt > 0.05) dt = 0.05;
      try {
        this.tick(dt);
        seguidos = 0;
      } catch (e) {
        seguidos++;
        this.lastError = e;
        if (seguidos >= 3) {
          if (window.__crash) {
            window.__crash('Erro no laco do jogo (3 quadros seguidos)',
              (e && e.stack) ? e.stack : String(e));
          }
          return;   // para o laco: continuar so geraria mil erros iguais
        }
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  applySettings() {
    audio.setVolumes({
      master: settings.master, music: settings.music,
      sfx: settings.sfx, voice: settings.voice,
    });
    gfx.scanlines = settings.scanlines;
    gfx.grainAmount = settings.grain;
    gfx.pixelPerfect = settings.pixelPerfect;
    gfx.resize();
    settings.lang = getLang();
    save.saveSettings(settings);
    if (this.menu) this.menu.refresh();
  }

  // -------------------------------------------------------------------
  // laco
  // -------------------------------------------------------------------

  tick(dt) {
    this.frames++; this.fpsT += dt;
    if (this.fpsT >= 0.5) { this.fps = this.frames / this.fpsT; this.frames = 0; this.fpsT = 0; }

    input.update(dt);

    if (this.state === 'waitkey') {
      if (input.anyPress || input.mouse.pressed) {
        document.getElementById('boot').classList.add('gone');
        document.body.classList.add('playing');
        audio.ensure();
        this.toMenu();
      }
      input.flush();
      return;
    }

    if (input.pressed('debug')) this.debug = !this.debug;

    if (this.transition) this.updateTransition(dt);

    switch (this.state) {
      case 'menu': this.updateMenu(dt); break;
      case 'cutscene': this.updateCutscene(dt); break;
      case 'chapcard': this.updateChapCard(dt); break;
      case 'play': this.updatePlay(dt); break;
      case 'endcard': this.updateEndCard(dt); break;
      case 'lab': this.updateLab(dt); break;
    }

    audio.updateMusic();
    input.flush();
  }

  updateTransition(dt) {
    const tr = this.transition;
    tr.t += dt;
    if (tr.phase === 'out') {
      gfx.fade = clamp(tr.t / tr.outDur, 0, 1);
      if (tr.t >= tr.outDur) {
        tr.phase = 'in'; tr.t = 0;
        if (tr.action) tr.action();
      }
    } else {
      gfx.fade = 1 - clamp(tr.t / tr.inDur, 0, 1);
      if (tr.t >= tr.inDur) { gfx.fade = 0; this.transition = null; }
    }
  }

  fadeTo(action, outDur = 0.55, inDur = 0.7) {
    if (this.transition) return;
    this.transition = { t: 0, phase: 'out', outDur, inDur, action };
  }

  // -------------------------------------------------------------------
  // MENU
  // -------------------------------------------------------------------

  toMenu() {
    this.state = 'menu';
    this.scene = null;
    audio.stopDread(0.3);
    audio.stopAllLoops();
    audio.stopNarration();
    gfx.eyelid = 1;
    this.menu.refresh();
    this.menu.enter();
    gfx.letterbox = 0;
  }

  updateMenu(dt) {
    const blocked = this.menuSlots.open || this.menuOptions.open || !!this.transition;
    const act = this.menu.update(dt, blocked);

    if (this.menuSlots.open) this.menuSlots.update(dt);
    else if (this.menuOptions.open) this.menuOptions.update(dt);

    if (act === 'new') this.fadeTo(() => this.startNewGame(), 0.8, 0.01);
    else if (act === 'continue') {
      const i = save.mostRecent();
      if (i >= 0) this.fadeTo(() => this.loadSlot(i), 0.7, 0.7);
    } else if (act === 'load') {
      this.menuSlots.show('load', (i) => this.fadeTo(() => this.loadSlot(i), 0.6, 0.7), () => {});
    } else if (act === 'options') {
      this.menuOptions.show(() => this.applySettings());
    } else if (act === 'lab') {
      this.fadeTo(() => this.startLab(), 0.5, 0.5);
    }

    // desenho
    gfx.begin('#000');
    this.menu.draw(gfx.s);
    gfx.beginLights('#28324a');
    this.menu.addLights();
    gfx.endLights(0.5);
    this.menu.drawUI(gfx.s);
    this.menuSlots.draw(gfx.s);
    this.menuOptions.draw(gfx.s);
    if (this.debug) this.drawDebug(gfx.s, 'MENU');
    gfx.present(dt);
  }

  // -------------------------------------------------------------------
  // CUTSCENE
  // -------------------------------------------------------------------

  startNewGame() {
    this.playtime = 0;
    this.flags = {};
    // jogo novo: ele tem cigarro no bolso de novo, e arma no coldre
    this.player.idleMode = null;
    this.player.hasGun = true;
    this.player.ammo = 6;
    this.player.reserve = 18;
    this.player.det.props.gun = 'holstered';
    this.player.segurarPorrete(false);
    this.player.hp = 100;
    this.player.club = false;
    this.qte = null;
    this.resetChapter2();
    audio.stopMusic(1.2);
    audio.stopAllLoops();
    this.opening = new Opening(this.road, this.car, this.player, this.rain, this.fx);
    this.fx.clear();
    this.opening.start();
    this.state = 'cutscene';
  }

  updateCutscene(dt) {
    this.playtime += dt;
    const op = this.opening;
    op.update(dt);

    gfx.begin('#000');
    op.draw(gfx.s);
    gfx.beginLights('#333f56');
    op.addLights(gfx);
    for (const L2 of this.player.det.lights(this.player.x, this.player.y)) {
      gfx.addLight(L2.x, L2.y, L2.r, L2.color, L2.i);
    }
    gfx.endLights(0.6);
    if (settings.subs) op.drawUI(gfx.s);
    else if (op.skipHold > 0.12) op.drawUI(gfx.s);
    if (this.debug) this.drawDebug(gfx.s, 'CUTSCENE ' + op.phase);
    gfx.present(dt);

    if (op.finished) {
      this.enterLevel('alley', null, 1, true);
      this.state = 'play';
      gfx.fade = 1;
      this.transition = { t: 0, phase: 'in', outDur: 0.01, inDur: 1.1, action: null };
    }
  }

  // -------------------------------------------------------------------
  // PLAY
  // -------------------------------------------------------------------

  enterLevel(key, x, facing, firstTime) {
    const lv = this.levels[key];
    this.level = lv;
    const sp = lv.spawn;
    this.player.spawn(x === null || x === undefined ? sp.x : x, facing || sp.facing, lv.groundY);
    this.cam.setBounds(0, lv.width);
    this.cam.snapTo(this.player.x, 0);
    this.rain.on = lv.weather === 'rain';
    this.rain.groundY = lv.groundY + 2;
    this.rain.intensity = lv.rainIntensity || 1;
    this.player.det.reflect = lv.reflect;
    this.player.det.visible = true;   // a cutscene esconde; entrar numa fase sempre mostra
    this.player.wet = lv.weather === 'rain';
    this.fx.clear();
    this.locCard = 4.0;
    this.dialogue.active = false;
    this.dialogue.fade = 0;
    this.player.clearBarks();
    this.player.frozen = false;
    this.player.controllable = true;
    this.qte = null;
    this.flags = this.flags || {};
    if (lv.barks) for (const b of lv.barks) b.done = false;
    if (lv.enterBarksNow) this.player.sayAll(lv.enterBarksNow, true);
    else if (lv.enterBarks) this.player.sayAll(lv.enterBarks);

    // Cada lugar tem o proprio som. Antes a chuva seguia o jogador para
    // dentro de qualquer sala, o que dizia ao ouvido que nada tinha mudado.
    audio.stopAllLoops();
    for (const a of (lv.ambience || [{ n: 'roomtone', g: 0.1 }])) {
      audio.startLoop(a.n, { gain: a.g, fade: a.f || 1.5 });
    }
    this.randomSfxT = [];
    if (lv.randomSfx) {
      for (const r of lv.randomSfx) this.randomSfxT.push(r.min + Math.random() * (r.max - r.min));
    }

    // Se o setor teve as luzes derrubadas por uma cena, elas voltam ao
    // entrar de novo — menos durante a perseguicao, que e quem esta
    // apagando o galpao de proposito.
    if (lv._apagada && !this.chase.ativo) {
      for (const f of lv.lightDefs) if (f.i0 !== undefined) f.i = f.i0;
      lv._apagada = false;
    }
    this.player.det.alpha = 1;
    this.entrouCh2(lv);
  }

  updatePlay(dt) {
    const lv = this.level;
    const paused = this.pause.active;

    if (!paused && !this.transition && !this.scene && input.pressed('pause') && !this.dialogue.active) {
      this.pause.open();
    }

    const sim = paused ? 0 : dt;
    this.playtime += sim;
    if (this.locCard > 0) this.locCard -= sim;

    const cap2 = lv.key.slice(0, 4) === 'ch2_';

    // O caderno e o casaco NAO pausam o jogo. Abrir a mochila no meio do
    // galpao tem que custar alguma coisa: enquanto o casaco esta aberto,
    // ele tapa parte da tela.
    if (cap2 && !paused && !this.scene && !this.dialogue.active && !this.transition) {
      if (input.pressed('journal') && this.flags.caderno) { this.journal.toggle(); this.inv.open = false; }
      if (input.pressed('bag')) { this.inv.toggle(); this.journal.open = false; }
    }
    if (cap2) { this.journal.update(paused ? 0 : dt); this.inv.update(paused ? 0 : dt); }
    const uiAberta = this.journal.open || this.inv.open;

    if (!paused) {
      lv.update(sim);
      this.dialogue.update(sim);
      if (this.scene) {
        this.scene.update(sim);
        if (this.scene.finished) {
          const era = this.scene;
          this.scene = null;
          // A cena da nota devolve o jogador algemado; as do Capitulo 2
          // devolvem ele de pe.
          if (!(era instanceof MirrorScene)) this.player.controllable = false;
        }
      }
      if (this.qte) this.updateQte(sim);
      if (this.emboscada > 0) {
        this.emboscada -= sim;
        if (this.emboscada <= 0) this.dispararEmboscada();
      }
      let prendendo = false;
      if (this.escondido) prendendo = this.updateEsconderijo(sim);
      const canControl = !this.dialogue.active && !this.transition && !this.scene
        && !this.qte && !uiAberta && !this.escondido;
      this.player.update(sim, lv, canControl);
      if (cap2) this.updateCh2(sim, lv, prendendo);
      // Numa conversa a camera sobe. A caixa de dialogo ocupa o terco de
      // baixo da tela, e sem isso quem esta falando com voce fica escondido
      // atras da propria fala.
      this.cam.offsetY = this.dialogue.talk ? 40 : 0;
      this.cam.follow(this.player.x, 0, this.player.facing, sim, Math.abs(this.player.vx) > 4);
      this.checkBarks(lv);
      this.updateRandomSfx(lv, sim);
      this.rain.update(sim, this.cam.x);
      this.fog.update(sim, lv.t);
      this.fx.update(sim);
      if (lv.indoor) this.dust.update(sim, lv.t);
      // luz do beco vem de cima e da esquerda; no bar, da lampada
      this.player.det.rimColor = lv.indoor ? '#e8b46a' : '#7fa5d8';
      this.player.det.rimDX = lv.indoor ? -1 : 1;
    }

    this.pause.update(dt);

    // ---- desenho ----
    const cam = this.cam;
    gfx.begin('#05060a');
    lv.drawBack(gfx.s, cam);
    if (lv.drawProps) lv.drawProps(gfx.s, cam);
    // Gente e inimigos vao ANTES do jogador: num corredor estreito o
    // personagem do jogador nunca pode ficar escondido atras de nada.
    if (cap2) {
      for (const id of Object.keys(this.npcs)) {
        const n = this.npcs[id];
        if (n.cfg.level === lv.key) n.draw(gfx.s, cam, lv.groundY);
      }
      this.director.draw(gfx.s, cam);
      this.chase.draw(gfx.s, cam, lv.key);
      if (this.credorParado) this.drawCredorParado(gfx.s, cam);
    }
    this.player.draw(gfx.s, cam);
    if (this.scene) this.scene.draw(gfx.s, cam);
    this.fx.draw(gfx.s, cam.ix, cam.iy);
    if (lv.indoor) this.dust.draw(gfx.s);
    else this.fog.draw(gfx.s);
    if (lv.weather === 'rain') this.rain.draw(gfx.s);
    lv.drawFore(gfx.s, cam);

    gfx.beginLights(lv.ambient);
    lv.addLights(gfx, cam);
    // "Luz de heroi": um halo fraquissimo colado no personagem. Nao existe
    // no mundo, existe para o jogador nunca perder o proprio corpo de vista
    // num jogo que e quase todo escuro.
    gfx.addLight(this.player.x - cam.ix, this.player.y - cam.iy - 30, 86,
      lv.indoor ? '#a88458' : '#8f8d84', 0.26, 1.45);
    for (const L2 of this.player.lights(cam)) gfx.addLight(L2.x, L2.y, L2.r, L2.color, L2.i);
    // O isqueiro e a lanterna dele na camara fria — e ele so aguenta
    // alguns segundos aceso por vez.
    if (this.isqueiroT > 0) {
      const fx2 = this.player.x - cam.ix + this.player.facing * 8;
      const fy2 = this.player.y - cam.iy - 40;
      const tremor = 0.78 + Math.sin(lv.t * 21) * 0.1 + Math.random() * 0.12;
      const fim = clamp(this.isqueiroT, 0, 1);
      gfx.addLight(fx2, fy2, 64 * fim, PAL.flame, 0.95 * tremor * fim);
      gfx.addLight(fx2, fy2, 16, '#fff0c0', 0.9 * fim);
    }
    if (lv.casaco > 0) {
      gfx.addLight(lv.casacoX - cam.ix, lv.casacoY - cam.iy, 66,
        PAL.flame, 0.55 * lv.casaco * (this.isqueiroT > 0 ? 1 : 0.3));
    }
    if (this.scene) this.scene.addLights(cam);
    gfx.endLights(lv.bloom);

    // ---- interface ----
    if (this.locCard > 0) {
      const a = clamp(Math.min(this.locCard, 4.0 - this.locCard + 3.4), 0, 1);
      drawLocationCard(gfx.s, lv.nameKey, this.flagsFirst ? 'chapter_1' : null, a);
    }

    // O balao fica acima da CABECA do detetive, nao acima do objeto: quase
    // sempre ele esta colado no objeto, e em cima do objeto o balao tapava
    // justamente o personagem.
    const near = (!this.dialogue.active && !paused && !this.scene && !this.qte
      && !uiAberta && !this.escondido)
      ? lv.nearest(this.player.x) : null;
    this.promptA = lerp(this.promptA || 0, near ? 1 : 0, 1 - Math.exp(-14 * dt));
    if (this.promptA > 0.02 && near) {
      drawPrompt(gfx.s, this.player.x - cam.ix, this.player.y - cam.iy - 70,
        near.prompt, this.promptA, lv.t);
    }

    // Falinha em cima da cabeca. Sobe mais quando o balao de interagir
    // esta na tela, senao os dois se sobrepoem e nao se le nenhum.
    const fa = this.player.floatAlpha();
    if (fa > 0) {
      const ft = this.player.floatText;
      const alto = this.promptA > 0.15 ? 96 : 80;
      text(gfx.s, T(ft.key), this.player.x - cam.ix,
        this.player.y - cam.iy - alto - Math.min(6, ft.t * 5), {
        size: 10, font: 'serif', color: '#cfc6b8', align: 'center',
        alpha: fa, outline: true, outlineColor: '#000000', outlineAlpha: 0.8,
      });
    }

    if (this.scene) this.scene.drawUI(gfx.s);
    if (this.qte) this.drawQteUI(gfx.s);
    if (!paused && !this.scene && !this.qte && !uiAberta) this.drawGunUI(gfx.s, cam);
    if (cap2 && !this.scene) this.drawCh2UI(gfx.s);

    // Poupa o personagem do grao e das scanlines (ver gfx._post).
    gfx.protect = {
      x: Math.round(this.player.x - cam.ix) - 26,
      y: Math.round(this.player.y - cam.iy) - 76,
      w: 52, h: 80,
    };

    this.dialogue.draw(gfx.s);
    if (cap2) { this.journal.draw(gfx.s); this.inv.draw(gfx.s); }
    this.pause.draw(gfx.s);
    if (this.debug) this.drawDebug(gfx.s, 'PLAY ' + lv.key);
    gfx.present(dt);
  }

  // Linha de mira e contador de balas.
  //
  // A linha existe porque nao ha mira na tela: sem ela o jogador nao tem
  // como saber para onde o cano esta apontando antes de gastar a bala.
  // Ela e pontilhada e fraca de proposito — e uma nocao, nao um laser.
  drawGunUI(ctx, cam) {
    const p = this.player;

    if (p.aiming) {
      const rad = p.aimAngle * Math.PI / 180;
      const ox = p.x - cam.ix + p.facing * 26;
      const oy = p.y - cam.iy - 48 - Math.sin(rad) * 10;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let d = 6; d < 130; d += 7) {
        const a = 0.42 * (1 - d / 130);
        ctx.globalAlpha = a;
        ctx.fillStyle = '#d8a860';
        ctx.fillRect(Math.round(ox + p.facing * d), Math.round(oy - Math.tan(rad) * d), 1, 1);
      }
      ctx.restore();
    }

    if (p.ammoHud > 0 || p.aiming) {
      const a = p.aiming ? 1 : clamp(p.ammoHud, 0, 1);
      const x = VW - 16, y = VH - 20;
      ctx.save();
      ctx.globalAlpha = a;
      for (let i = 0; i < p.clipSize; i++) {
        const bx = x - (p.clipSize - i) * 5;
        ctx.fillStyle = i < p.ammo ? '#e8c88a' : '#3a332c';
        ctx.fillRect(bx, y, 3, 6);
        if (i < p.ammo) { ctx.fillStyle = '#fff0c8'; ctx.fillRect(bx, y, 3, 1); }
      }
      text(ctx, String(p.reserve), x - p.clipSize * 5 - 6, y - 2, {
        size: 9, font: 'ui', weight: 'bold', color: PAL.uiDim, align: 'right', alpha: a,
      });
      if (p.gun === 'reloading') {
        text(ctx, 'R', x - p.clipSize * 5 - 6, y - 2, {
          size: 9, font: 'ui', weight: 'bold', color: PAL.uiAccent, align: 'right', alpha: a,
        });
      }
      ctx.restore();
    }
  }

  // Sons soltos do lugar: uma gota, uma chapa de metal cedendo, uma porta
  // longe. Espacados de forma irregular — som que chega em intervalo certo
  // deixa de ser ambiente e vira metronomo.
  updateRandomSfx(lv, dt) {
    if (!lv.randomSfx || !this.randomSfxT) return;
    for (let i = 0; i < lv.randomSfx.length; i++) {
      const r = lv.randomSfx[i];
      this.randomSfxT[i] -= dt;
      if (this.randomSfxT[i] <= 0) {
        this.randomSfxT[i] = r.min + Math.random() * (r.max - r.min);
        const fn = audio[r.fn];
        if (fn) fn.call(audio, r.vol === undefined ? 1 : r.vol);
      }
    }
  }

  // Falas de passagem: dispara quando o jogador cruza um ponto da fase.
  // Cada uma so uma vez por visita — repetir piada mata a piada.
  checkBarks(lv) {
    if (!lv.barks) return;
    for (const b of lv.barks) {
      if (b.done) continue;
      if (Math.abs(this.player.x - b.x) < (b.range || 40)) {
        b.done = true;
        this.player.sayAll(Array.isArray(b.key) ? b.key : [b.key]);
      }
    }
  }

  doInteract(it) {
    if (it.action === 'enter_bar') {
      audio.doorCreak(0.9);
      this.fadeTo(() => {
        this.enterLevel('bar', null, 1);
        audio.doorSlam(0.5);
      }, 0.7, 0.9);
      return;
    }
    if (it.action === 'exit_bar') {
      audio.doorCreak(0.9);
      this.fadeTo(() => {
        this.enterLevel('alley', this.levels.alley.doorX - 26, -1);
      }, 0.7, 0.9);
      return;
    }
    if (it.action === 'enter_back') {
      audio.doorCreak(0.8);
      this.fadeTo(() => this.enterLevel('backroom', null, 1), 0.7, 0.9);
      return;
    }
    if (it.action === 'exit_back') {
      audio.doorCreak(0.8);
      this.fadeTo(() => this.enterLevel('bar', 900, -1), 0.7, 0.9);
      return;
    }
    if (it.action === 'read_note') {
      this.startNoteScene();
      return;
    }
    if (it.action === 'take_pipe') {
      this.flags.pipe = true;
      it.disabled = true;
      audio.reloadClick(0.6);
      this.player.say('bark_pipe_take', 2.0, true);
      return;
    }
    if (it.action === 'pry_door') {
      if (!this.flags.pipe) {
        this.player.say('bark_door_pry', 2.6, true);
        audio.doorSlam(0.35);
        gfx.shake(1.6, 0.2);
        return;
      }
      // com o cano na mao: arranca as tabuas
      audio.strain(1);
      gfx.shake(3, 0.4);
      this.fx.burst(18, () => ({
        x: this.player.x + this.player.facing * 20 + Math.random() * 10,
        y: this.level.groundY - 40 - Math.random() * 40,
        vx: this.player.facing * (30 + Math.random() * 80), vy: -40 + Math.random() * 80,
        ay: 260, life: 0.6, size: 1, color: '#43301e', a: 1, fade: 1,
      }));
      setTimeout(() => audio.doorCreak(1), 260);
      // Ele sai. E o galpao e muito maior do que ele pensava.
      this.fadeTo(() => this.startChapter2(), 1.4, 0.01);
      return;
    }
    if (it.action === 'goto') {
      audio.doorCreak(it.sfx === 'heavy' ? 0.5 : 0.9);
      if (it.sfx === 'heavy') audio.metalCreak(1);
      this.fadeTo(() => {
        this.enterLevel(it.to, it.tox, it.tofacing);
        if (it.isDoor) audio.doorSlam(0.45);
      }, 0.6, 0.8);
      return;
    }
    if (this.doInteractCh2(it)) return;
    if (it.lines) {
      const arr = LINES[it.lines] || [];
      this.dialogue.start(arr.map((_, i) => ({ name: null, text: L(it.lines, i) })));
    }
  }

  // -------------------------------------------------------------------
  // a cena da nota
  // -------------------------------------------------------------------

  startNoteScene() {
    this.scene = new NoteScene(this.player, this.fx);
    this.scene.onWake = () => {
      this.enterLevel('warehouse', null, 1);
      this.player.frozen = true;
      this.player.controllable = false;
      this.player.det.play('cuffed', { blend: 0 });
      // levaram tudo: nem arma, nem coldre cheio
      this.player.hasGun = false;
      this.player.gun = 'holstered';
      this.player.ammo = 0; this.player.reserve = 0;
      this.player.det.props.gun = 'none';
      this.locCard = 0;
    };
    // So depois das palpebras abrirem: antes disso as falas ficavam
    // escondidas atras do preto e ninguem lia nenhuma.
    this.scene.onAwake = () => {
      this.locCard = 4.5;
      this.player.sayAll(['bark_cell_1', 'bark_cell_2', 'bark_cell_3'], true);
      this.qte = { prog: 0, last: null, t: 0, hint: 0 };
    };
    this.scene.start(this.level);
  }

  // -------------------------------------------------------------------
  // o QTE de se soltar do cano
  // -------------------------------------------------------------------

  updateQte(dt) {
    const q = this.qte, p = this.player;
    q.t += dt;
    q.hint = Math.min(1, q.hint + dt * 1.4);

    // A alternancia e o que importa: martelar a mesma tecla nao adianta.
    const a = input.pressedFrame.has('KeyA') || input.pressedFrame.has('ArrowLeft');
    const d = input.pressedFrame.has('KeyD') || input.pressedFrame.has('ArrowRight');
    let puxou = false;
    if (a && q.last !== 'A') { q.last = 'A'; puxou = true; }
    else if (d && q.last !== 'D') { q.last = 'D'; puxou = true; }

    if (puxou) {
      // Numeros calibrados para MAO HUMANA. Antes eram 0.058 por toque
      // contra 0.20/s de queda: alternando a 4 toques por segundo o saldo
      // era +0.03/s, ou seja meio minuto de martelada. Agora 4 toques por
      // segundo enchem a barra em cerca de tres segundos.
      q.prog = clamp(q.prog + 0.085, 0, 1);
      q.pull = 0.16;
      audio.strain(0.7 + q.prog * 0.5);
      if (Math.random() < 0.4) audio.chainRattle(0.5);
      gfx.shake(0.6 + q.prog * 1.6, 0.12);
    }
    // Trava de catraca: o progresso nunca cai abaixo do quarto ja
    // conquistado. Sem isso, quem martela devagar fica preso para sempre e
    // o jogo vira um teste de dedo, nao de tensao.
    q.floor = Math.max(q.floor || 0, Math.floor(q.prog * 4) / 4);
    q.prog = Math.max(q.floor, q.prog - dt * 0.09);
    if (q.pull > 0) q.pull -= dt;

    const puxando = q.pull > 0;
    if (puxando && p.det.anim !== 'strainCuffs') p.det.play('strainCuffs', { blend: 0.08 });
    else if (!puxando && q.prog < 0.02 && p.det.anim !== 'cuffed') p.det.play('cuffed', { blend: 0.3 });
    p.det.speed = 1 + q.prog;
    p.det.update(dt);

    if (q.prog >= 1) this.breakFree();
  }

  breakFree() {
    const p = this.player, lv = this.level;
    this.qte = null;
    audio.pipeBurst(1);
    gfx.shake(4.5, 0.6);
    // ferrugem e agua saindo do cano arrebentado
    this.fx.burst(30, () => ({
      x: p.x + 8 + Math.random() * 26, y: lv.pipeY + 2,
      vx: 40 + Math.random() * 90, vy: -20 + Math.random() * 60, ay: 260,
      life: 0.5 + Math.random() * 0.7, size: 1,
      color: Math.random() > 0.5 ? '#6b8ba8' : '#6e4728', a: 0.9, fade: 1.1,
    }));

    p.frozen = false;
    p.controllable = true;
    p.det.play('idle', { blend: 0.4 });
    // De pe, mas sem nada. So a partir daqui o ocio dele vira sentar — e
    // ainda assim so depois de um tempo em pe, como quem cansa de esperar.
    p.idleMode = 'sit';
    lv.minX = lv.freeMinX;
    lv.maxX = lv.freeMaxX;
    lv.interactables = lv.interLivre;
    for (const b of (lv.barks || [])) b.done = false;
    p.sayAll(['bark_free_1', 'bark_free_2', 'bark_free_3'], true);
  }

  drawQteUI(ctx) {
    const q = this.qte;
    if (!q) return;
    const a = q.hint;
    const w = 108, h = 6;
    const x = (VW - w) / 2, y = VH - 52;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = '#0c0a0b';
    ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
    ctx.fillStyle = '#2a2320';
    ctx.fillRect(x, y, w, h);
    const g2 = ctx.createLinearGradient(x, 0, x + w, 0);
    g2.addColorStop(0, '#7a2a22');
    g2.addColorStop(1, '#c8503a');
    ctx.fillStyle = g2;
    ctx.fillRect(x, y, Math.round(w * q.prog), h);
    ctx.restore();
    const pisca = q.last === 'A' ? 0 : 1;
    text(ctx, T('qte_hint'), VW / 2, y - 14, {
      size: 9, font: 'ui', weight: 'bold', color: pisca ? '#e8e0d2' : PAL.uiAccent,
      align: 'center', track: 3, alpha: a, shadow: true,
    });
  }

  // Fim do trecho jogavel. Cartao preto, e volta para o menu.
  endOfChapter() {
    this.state = 'endcard';
    this.endT = 0;
    this.qte = null;
    this.scene = null;
    audio.stopAllLoops();
    audio.stopDread(0.2);
  }

  updateEndCard(dt) {
    this.endT += dt;
    gfx.begin('#000');
    const a = clamp(this.endT - 0.4, 0, 1) * clamp(4.6 - this.endT, 0, 1);
    text(gfx.s, T('to_be_continued'), VW / 2, VH / 2 - 6, {
      size: 13, font: 'serif', color: PAL.uiText, align: 'center', track: 4, alpha: a,
    });
    gfx.fade = 0;
    gfx.present(dt);
    if (this.endT > 5.2) this.toMenu();
  }

  // ===================================================================
  // CAPITULO 2 — "GENTILEZA"
  // ===================================================================

  resetChapter2() {
    this.sanity.enabled = false;
    this.sanity.reset(100);
    this.journal.reset();
    this.inv.reset();
    this.director.reset();
    this.director.ligado = false;
    this.chase.parar();
    this.cigTentativas = 0;
    this.escondido = null;
    this.isqueiroT = 0;
    for (const id of Object.keys(this.npcs)) this.npcs[id].falado = false;
  }

  // Preto, "CAPITULO DOIS", e embaixo o nome. Mesma tipografia corroida do
  // titulo do jogo.
  startChapter2() {
    this.state = 'chapcard';
    this.chapT = 0;
    this.qte = null;
    this.scene = null;
    audio.stopAllLoops();
    audio.stopDread(0.2);
    this.flags.cap2 = true;
    // A sanidade existia desde o Capitulo 1; e aqui que ela comeca a se
    // mexer o bastante para o jogador perceber que ela existia.
    this.sanity.enabled = true;
    this.sanity.reset(100);
    this.player.hp = 100;
    this.player.idleMode = 'sit';
  }

  updateChapCard(dt) {
    this.chapT += dt;
    gfx.begin('#000');
    const a = clamp(this.chapT - 0.5, 0, 1) * clamp(4.6 - this.chapT, 0, 1);
    text(gfx.s, T('chapter_2'), VW / 2, VH / 2 - 16, {
      size: 9, font: 'ui', weight: 'bold', color: PAL.uiDim,
      align: 'center', track: 6, alpha: a,
    });
    text(gfx.s, T('chapter_2_name'), VW / 2, VH / 2 - 2, {
      size: 20, font: 'serif', color: PAL.uiText, align: 'center', track: 2, alpha: a,
    });
    // o fio vermelho, do mesmo vermelho que so o sangue e o titulo tem
    ctxLinha(gfx.s, VW / 2, VH / 2 + 26, 46 * a, a * 0.8);
    gfx.fade = 0;
    gfx.present(dt);
    if (this.chapT > 5.0) {
      this.state = 'play';
      this.enterLevel('ch2_corridor', null, 1);
      this.locCard = 4.5;
      gfx.fade = 1;
      this.transition = { t: 0, phase: 'in', outDur: 0.01, inDur: 1.2, action: null };
    }
  }

  // -------------------------------------------------------------------
  // ao entrar num setor do capitulo
  // -------------------------------------------------------------------

  entrouCh2(lv) {
    const cap2 = lv.key.slice(0, 4) === 'ch2_';
    this.director.limpar();
    this.escondido = null;
    this.isqueiroT = 0;
    this.frio = null;
    if (!cap2) { this.director.ligado = false; return; }

    // Sair do mezanino depois de falar com ela e o gatilho da fuga. As
    // luzes do galpao inteiro comecam a apagar setor por setor, vindo na
    // direcao dele, e alguma coisa comeca a arrastar metal no chao.
    if (this.flags.telefonista && !this.flags.fuga && lv.key === 'ch2_machines') {
      this.flags.fuga = true;
      this.chase.comecar(this.levels, 'ch2_mezz', 900);
      this.player.sayAll(['b2_chase_1', 'b2_chase_2'], true);
    }

    this.director.ligado = !this.chase.ativo;
    this.director.reset(lv.safe ? 999 : 12);

    // Pegar uma coisa e sair de uma sala ganham de ler a parede. Sem isso o
    // cartaz colado do lado da porta rouba o "E" da porta.
    for (const it of lv.interactables) {
      if (it.prio !== undefined) continue;
      if (it.action === 'goto' || it.action === 'sair') it.prio = 1;
      else if (typeof it.action === 'string' && it.action.slice(0, 5) === 'take_') it.prio = 1;
    }

    // O primeiro deles aparece SOZINHO, e o jogo deixa o jogador olhar
    // para ele por uns segundos antes de ele reagir.
    if (lv.key === 'ch2_shelves' && !this.flags.primeiro) {
      this.flags.primeiro = true;
      this.director.forcar('empilhado', 470, lv.groundY);
      this.director.calma = 50;
      this.primeiroVisto = false;
    }

    // O NPC daquele setor entra na lista de coisas com que da para
    // interagir. Nao ha lista separada: para o jogo, gente e cenario que
    // responde.
    for (const id of Object.keys(this.npcs)) {
      const n = this.npcs[id];
      if (n.cfg.level !== lv.key) continue;
      if (!lv.interactables.some(i => i.npc === id)) lv.interactables.push(n.gancho());
    }

    // Esconderijos: so servem quando ha de quem se esconder.
    if (lv.esconderijos && !lv._esc) {
      lv._esc = lv.esconderijos.map(x => ({
        x: x - 12, y: lv.groundY - 60, w: 24, h: 60,
        prompt: 'prompt_hide', action: 'hide', range: 26, disabled: true,
      }));
      for (const e of lv._esc) lv.interactables.push(e);
    }
    if (lv._esc) for (const e of lv._esc) e.disabled = !this.chase.ativo;

    // O portao da doca so abre quando o mapa ja virou armadilha.
    const doca = lv.interactables.find(i => i.id === 'doca');
    if (doca) {
      if (this.chase.ativo) {
        doca.prompt = 'prompt_open';
        doca.action = 'goto'; doca.to = 'ch2_dock'; doca.tox = 70; doca.tofacing = 1;
        doca.lines = null;
      } else {
        doca.prompt = 'prompt_look';
        doca.action = null; doca.lines = 'c2_dockgate';
      }
    }
  }

  // -------------------------------------------------------------------
  // interacoes do capitulo
  // -------------------------------------------------------------------

  doInteractCh2(it) {
    const p = this.player;
    // Objeto pego some do cenario. Sem isto a ripa continuaria encostada na
    // coluna depois de ele levar a ripa embora.
    if (it.id && this.level.pego) this.level.pego[it.id] = true;
    switch (it.action) {
      case 'take_club':
        it.disabled = true;
        this.inv.hand = 'club';
        p.segurarPorrete(true);
        audio.leather(0.7);
        // A PRIMEIRA VEZ que ele percebe a conveniencia. Ele nao entende
        // ainda — so acha estranho. A partir daqui e um tema.
        p.sayAll(['b2_club_1', 'b2_club_2'], true);
        this.anotar('j_conv');
        return true;

      case 'take_journal':
        it.disabled = true;
        this.flags.caderno = true;
        audio.pageTurn(1);
        p.sayAll(['b2_diary_1', 'b2_diary_2', 'b2_diary_3'], true);
        // O caderno chega ja com o que ele carrega desde o Capitulo 1.
        this.journal.add('j_phone');
        this.journal.add('j_note');
        this.journal.add('j_locked');
        return true;

      case 'take_map':
        it.disabled = true;
        this.pegar('map');
        p.sayAll(['b2_map_1', 'b2_map_2'], true);
        return true;

      case 'take_ammo':
        it.disabled = true;
        this.pegar('ammo');
        p.reserve = 18;
        // A jogada mais importante do capitulo: municao ANTES da arma. O
        // jogador vai carregar isso inutil por vinte minutos.
        p.sayAll(['b2_ammo_1', 'b2_ammo_2', 'b2_ammo_3'], true);
        this.anotar('j_ammo');
        return true;

      case 'take_cigs':
        it.disabled = true;
        this.pegar('cigs');
        this.pegar('lighter');
        p.sayAll(['b2_cig_1', 'b2_cig_2', 'b2_cig_3'], true);
        this.anotar('j_cigs');
        return true;

      case 'take_gun':
        it.disabled = true;
        this.pegarPistola();
        return true;

      case 'mirror':
        this.tentarEspelho(it);
        return true;

      case 'talk': {
        const npc = this.npcs[it.npc];
        if (!npc) return true;
        const t = TALKS[npc.cfg.talk];
        if (!t) return true;
        this.dialogue.startTalk(t, {
          onDone: () => {
            if (!npc.falado) {
              npc.falado = true;
              if (it.npc === 'vigia') { this.anotar('j_vigia'); this.player.say('b2_vigia_bye', 3.0); }
              if (it.npc === 'operadora') {
                this.anotar('j_oper');
                this.player.say('b2_mezz_4', 3.0);
                this.flags.telefonista = true;
              }
            }
          },
        });
        return true;
      }

      case 'hide':
        this.entrarEsconderijo(it);
        return true;

      case 'sair':
        this.fimDoCapitulo2();
        return true;
    }
    return false;
  }

  pegar(key) {
    if (this.inv.add(key)) return true;
    this.player.say('inv_full', 2.2, true);
    return false;
  }

  anotar(key) {
    if (!this.flags.caderno) return false;
    if (!this.journal.add(key)) return false;
    // Escrever e organizar a cabeca. Ate o cigarro destravar, la no
    // Capitulo 3, e a principal forma de se recuperar.
    this.sanity.restore(7);
    return true;
  }

  // O PRECO DA PISTOLA. No instante em que ele encosta nela, as luzes de
  // emergencia apagam, TODAS as maquinas ligam ao mesmo tempo, e tres
  // deles entram pela porta por onde ele veio. Toda gentileza cobra na
  // saida.
  pegarPistola() {
    const p = this.player, lv = this.level;
    this.inv.hand = null;
    p.segurarPorrete(false);
    this.pegar('gun');
    p.hasGun = true;
    p.ammo = 6;
    p.reserve = Math.max(p.reserve, 18);
    p.det.props.gun = 'holstered';
    p.sayAll(['b2_gun_1', 'b2_gun_2', 'b2_gun_3', 'b2_gun_4'], true);
    this.anotar('j_gun');

    this.emboscada = 2.6;
  }

  dispararEmboscada() {
    const lv = this.level, p = this.player;
    audio.machineStart(1);
    audio.stopLoop('hum', 0.2);
    audio.startLoop('hum', { gain: 0.16, fade: 0.4 });
    gfx.shake(5, 0.9);
    gfx.flash = 0.12;
    for (const f of lv.lightDefs) { if (f.i0 === undefined) f.i0 = f.i; f.i = f.i0 * 0.25; }
    lv._apagada = true;
    // pela porta por onde ele entrou
    const px = lv.portaX === undefined ? lv.minX + 20 : lv.portaX;
    for (let i = 0; i < 3; i++) this.director.forcar('semrosto', px - 20 - i * 26, lv.groundY);
    this.director.calma = 24;
    p.say('b2_ambush', 2.2, true);
    p.say('b2_ambush2', 2.6);
  }

  // O ESPELHO. Duas recusas, e na terceira o jogo inteiro muda de camera.
  tentarEspelho(it) {
    this.espelhoN = (this.espelhoN || 0) + 1;
    if (this.espelhoN === 1) { this.player.say('cig_no_1', 2.0, true); return; }
    if (this.espelhoN === 2) { this.player.say('cig_no_2', 2.2, true); return; }
    it.disabled = true;
    this.scene = new MirrorScene(this.player);
    this.scene.onEnd = () => {
      // Custa mais do que qualquer outra coisa do capitulo. O teimoso paga
      // caro — e ganha uma pagina que so existe para quem olhou.
      this.sanity.drain(30, true);
      this.journal.add('j_mirror');
      this.player.say('b2_mirror_after', 3.4, true);
      this.locCard = 0;
      // o ambiente do vestiario volta
      for (const a of (this.level.ambience || [])) audio.startLoop(a.n, { gain: a.g, fade: 2.5 });
    };
    this.scene.start();
  }

  // A ESCADA DO CIGARRO, degrau 1: ele nem tira do maco. A recusa e
  // automatica, quase reflexo. Ela vai mudar — mas so no Capitulo 3.
  usarItem(key) {
    if (key === 'cigs') {
      const falas = ['cig_no_1', 'cig_no_2', 'cig_no_3', 'cig_no_4'];
      this.player.say(falas[this.cigTentativas % falas.length], 2.4, true);
      this.cigTentativas++;
      return;
    }
    if (key === 'lighter') { audio.lighterFlick(); return; }
    if (key === 'map') { audio.pageTurn(0.8); return; }
  }

  eventoSanidade(tipo) {
    if (tipo !== 'worse') return;
    // As paginas que ele nao escreveu so aparecem quando a cabeca cede.
    if (!this.flags.caderno) return;
    const st = this.sanity.state;
    if (st >= 2 && !this.journal.has('j_x1')) this.journal.add('j_x1');
    else if (st >= 3 && !this.journal.has('j_x2')) this.journal.add('j_x2');
  }

  // -------------------------------------------------------------------
  // combate
  // -------------------------------------------------------------------

  golpeDePorrete() {
    const p = this.player;
    audio.whoosh(1.1);
    const alvo = this.director.maisPerto(p.x, 34, p.facing);
    if (!alvo) return;
    const r = alvo.levarDano(1, p.x);
    if (r === 'fake') {
      // Nao estava la. E ele nao comenta.
      this.fx.burst(14, () => ({
        x: alvo.x + (Math.random() - 0.5) * 12, y: alvo.y - 20 - Math.random() * 40,
        vx: (Math.random() - 0.5) * 40, vy: -20 - Math.random() * 30, ay: -10,
        life: 0.6, size: 1, color: '#2a2430', a: 0.5, fade: 1.4,
      }));
      this.sanity.drain(4);
      return;
    }
    audio.clubHit(1);
    gfx.shake(2.4, 0.22);
    this.fx.burst(8, () => ({
      x: alvo.x, y: alvo.y - 30 - Math.random() * 20,
      vx: (Math.random() - 0.5) * 80, vy: -40 - Math.random() * 40, ay: 240,
      life: 0.4, size: 1, color: '#6d1a15', a: 0.9, fade: 1.2,
    }));
    if (r === 'morreu') {
      this.director.respirar(40 + Math.random() * 20);
      this.sanity.restore(2);   // a violencia acalma, e isso e feio
    }
    // A ripa e madeira. Ela vai quebrar, e o jogo nunca disse quando.
    this.inv.clubHp -= 0.11 + Math.random() * 0.06;
    if (this.inv.clubHp <= 0) {
      this.inv.clubHp = 0;
      this.inv.hand = null;
      p.segurarPorrete(false);
      audio.clubBreak(1);
      p.say('b2_club_broke', 2.6, true);
    }
  }

  // -------------------------------------------------------------------
  // esconderijo
  // -------------------------------------------------------------------

  entrarEsconderijo(it) {
    const p = this.player;
    this.escondido = it;
    p.x = it.x + it.w / 2;
    p.frozen = true;
    p.controllable = false;
    p.det.play('hide', { blend: 0.3 });
    p.det.alpha = 0.55;
    audio.leather(0.6);
    this.respiro = 1;
  }

  sairEsconderijo() {
    const p = this.player;
    this.escondido = null;
    p.frozen = false;
    p.controllable = true;
    p.det.alpha = 1;
    p.det.play('idle', { blend: 0.3 });
  }

  updateEsconderijo(dt) {
    const p = this.player;
    const prendendo = input.isDown('breath') && this.respiro > 0;
    if (prendendo) {
      this.respiro = clamp(this.respiro - dt * 0.22, 0, 1);
      // Ficar parado nao e gratis: escondido a sanidade drena mais rapido.
      this.sanity.drain(dt * 1.1);
      gfx.shake(0.5, 0.1);
    } else {
      this.respiro = clamp(this.respiro + dt * 0.34, 0, 1);
      this.respiroT = (this.respiroT || 0) - dt;
      if (this.respiroT <= 0) { this.respiroT = 1.4; audio.breath(0.7); }
    }
    this.batidaT = (this.batidaT || 0) - dt;
    const k = this.chase.pressao(this.level.key, p.x);
    if (this.batidaT <= 0) {
      this.batidaT = lerp(1.1, 0.36, k);
      audio.heartbeat(0.4 + k * 0.6);
    }
    if (input.pressed('interact')) this.sairEsconderijo();
    return prendendo;
  }

  // -------------------------------------------------------------------
  // fim do capitulo
  // -------------------------------------------------------------------

  fimDoCapitulo2() {
    const p = this.player;
    this.chase.parar();
    this.director.limpar();
    p.controllable = false;
    p.frozen = true;
    p.say('b2_end_1', 2.6, true);
    p.say('b2_end_2', 2.6);
    p.say('b2_end_3', 3.0);
    audio.doorSlam(0.6);
    // E a ultima coisa que a camera mostra antes do corte e ele parado.
    const cp = new Enemy('credor', clamp(p.x - 150, this.level.minX, this.level.maxX), this.level.groundY);
    cp.det.play('idle', { blend: 0 });
    cp.det.setFacing(1);
    cp.det.flipT = 1;
    this.credorParado = { det: cp };
    setTimeout(() => { if (this.state === 'play') this.fadeTo(() => this.endOfChapter(), 2.2, 0.01); }, 8200);
  }

  // -------------------------------------------------------------------
  // o laco do capitulo
  // -------------------------------------------------------------------

  updateCh2(dt, lv, prendendo) {
    const p = this.player;

    for (const id of Object.keys(this.npcs)) {
      const n = this.npcs[id];
      if (n.cfg.level === lv.key) n.update(dt);
    }

    // ---- o isqueiro ----
    if (this.isqueiroT > 0) {
      this.isqueiroT -= dt;
      if (this.isqueiroT <= 0) audio.blip(0.3);
    }
    if (input.pressed('light') && this.inv.has('lighter') && this.isqueiroT <= 0
        && !this.escondido && !this.dialogue.active) {
      this.isqueiroT = 6;
      audio.lighterFlick();
      audio.flameWhoosh(0.7);
    }

    // ---- o Diretor ----
    this.director.update(dt, { player: p, level: lv, cam: this.cam, sanity: this.sanity });
    for (const e of this.director.lista) {
      if (e.state === 'dead') continue;
      if (e.acertou() && !this.escondido) p.takeDamage(e.cfg.dano, e.x);
    }
    // Ver um deles ja custa, mesmo sem encostar.
    const dInimigo = this.director.distanciaMaisProximo(p.x);
    if (dInimigo < 170) this.sanity.drain(dt * 0.5);

    // Ele nunca diz o que aquilo e. Nunca. O jogador que se vire.
    if (this.primeiroVisto === false && dInimigo < 140) {
      this.primeiroVisto = true;
      p.say('b2_know', 3.0, true);
      this.sanity.drain(8, true);
    }

    // ---- a perseguicao ----
    if (this.chase.ativo) {
      this.chase.update(dt, {
        player: p, level: lv, levelKey: lv.key,
        escondido: !!this.escondido, prendendo,
      });
    }

    // ---- a sanidade ----
    this.sanity.update(dt, {
      dark: lv.darkAt(p.x) * (this.isqueiroT > 0 ? 0.3 : 1),
      safe: !!lv.safe && !this.chase.ativo,
      chase: this.chase.ativo && !this.escondido,
    });
    // A camara fria cobra so por estar la dentro. E ela que ensina o
    // jogador a temer o proprio medidor.
    if (lv.frio) this.sanity.drain(dt * (this.isqueiroT > 0 ? 0.35 : 0.9));
    this.sanity.apply();
    const jt = this.sanity.jitter();
    if (jt > 0) gfx.shake(jt, 0.1);

    if (p.hp <= 0) this.derrubado();

    this.updateFrio(dt, lv);
  }

  // A PRIMEIRA ALUCINACAO GRANDE. Os ganchos comecam a balancar. Todos. No
  // mesmo ritmo. E nao ha vento aqui dentro.
  updateFrio(dt, lv) {
    if (!lv.frio) return;
    const p = this.player;
    const f = this.frio || (this.frio = { fase: 0, t: 0 });
    f.t += dt;

    if (f.fase === 0 && p.x > 460) {
      f.fase = 1; f.t = 0;
      lv.balanco = 1;
      audio.metalCreak(1.2);
      audio.chainRattle(0.8);
      p.sayAll(['b2_hook_1', 'b2_hook_2'], true);
      this.sanity.drain(6, true);
    } else if (f.fase === 1 && f.t > 5.2) {
      f.fase = 2; f.t = 0;
      p.say('b2_hook_3', 2.8, true);
    } else if (f.fase === 2 && this.isqueiroT > 0 && Math.abs(p.x - 490) < 150) {
      f.fase = 3; f.t = 0;
      lv.casaco = 1;
      p.say('b2_hook_4', 2.8, true);
      this.sanity.drain(8, true);
    } else if (f.fase === 3 && this.isqueiroT <= 0) {
      // A chama apaga. Quando ele acende de novo, nao tem mais nada.
      f.fase = 4; f.t = 0;
      lv.casaco = 0;
    } else if (f.fase === 4 && this.isqueiroT > 0) {
      f.fase = 5; f.t = 0;
      p.sayAll(['b2_hook_5', 'b2_hook_6'], true);
      this.sanity.drain(10, true);
      this.anotar('j_cold');
      this.anotar('j_hooks');
    }
  }

  // O tiro precisa saber em quem bateu. O jogador dispara; o jogo procura
  // alguem na frente do cano.
  tiro(x, facing, ang) {
    const alvo = this.director.maisPerto(x, 210, facing);
    if (!alvo) return;
    // Mira so no eixo vertical: acima de uns 20 graus a bala passa por cima.
    if (Math.abs(ang) > 22) return;
    const r = alvo.levarDano(3, x);
    if (r === 'fake') {
      // Voce gastou a bala do mesmo jeito.
      this.sanity.drain(5, true);
      return;
    }
    audio.punchHit(0.6);
    this.fx.burst(10, () => ({
      x: alvo.x, y: alvo.y - 34 - Math.random() * 20,
      vx: facing * (20 + Math.random() * 70), vy: -30 - Math.random() * 40, ay: 250,
      life: 0.45, size: 1, color: '#6d1a15', a: 0.95, fade: 1.2,
    }));
    if (r === 'morreu') { this.director.respirar(45 + Math.random() * 15); this.sanity.restore(2); }
  }

  // Ele cai. Nao morre: acorda de novo no comeco do setor, com menos
  // cabeca do que tinha. Num jogo em que tudo e a mente dele, "game over"
  // seria a unica coisa que quebraria a regra.
  derrubado() {
    const p = this.player;
    p.hp = 100;
    p.say('b2_down', 3.0, true);
    this.sanity.drain(14, true);
    this.director.limpar();
    this.director.respirar(30);
    audio.tinnitus(2.5);
    const key = this.level.key;
    this.fadeTo(() => {
      this.enterLevel(key, null, 1);
      gfx.eyelid = 0.1;
    }, 1.0, 1.6);
    setTimeout(() => { gfx.eyelid = 1; }, 2600);
  }

  // -------------------------------------------------------------------
  // interface do capitulo
  // -------------------------------------------------------------------

  drawCh2UI(ctx) {
    const p = this.player;

    this.journal.drawToast(ctx);
    this.inv.drawToast(ctx);

    // A vida so aparece quando ele apanha. Barra permanente avisaria o
    // jogador de que ele e um personagem.
    if (p.hurtT > 0 || p.hp < 100) {
      const a = clamp(p.hurtT > 0 ? 1 : (p.hp < 60 ? 0.7 : 0), 0, 1);
      if (a > 0.02) {
        ctx.save();
        ctx.globalAlpha = a * 0.55;
        ctx.fillStyle = '#0c0a0b';
        ctx.fillRect(14, VH - 20, 52, 4);
        ctx.fillStyle = PAL.uiAccent;
        ctx.fillRect(14, VH - 20, Math.round(52 * (p.hp / 100)), 4);
        ctx.restore();
      }
    }

    // Escondido: o folego, e como sair.
    if (this.escondido) {
      const w = 92, x = (VW - w) / 2, y = VH - 46;
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#0c0a0b';
      ctx.fillRect(x - 1, y - 1, w + 2, 6);
      ctx.fillStyle = this.respiro > 0.3 ? '#7fa5d8' : PAL.uiAccent;
      ctx.fillRect(x, y, Math.round(w * this.respiro), 4);
      ctx.restore();
      text(ctx, T('hint_hold_breath'), VW / 2, y - 14, {
        size: 8, font: 'ui', weight: 'bold', color: PAL.uiDim,
        align: 'center', track: 2, alpha: 0.9, shadow: true,
      });
      text(ctx, T('hint_hide'), VW / 2, y + 10, {
        size: 7, font: 'ui', color: PAL.uiFaint, align: 'center', track: 1, alpha: 0.8,
      });
    }

    // Lembrete das teclas novas, so nos primeiros segundos do setor.
    if (this.locCard > 1.4 && this.flags.caderno && !this.chase.ativo) {
      text(ctx, T('hint_journal'), VW - 14, 14, {
        size: 7, font: 'ui', color: PAL.uiFaint, align: 'right', track: 1,
        alpha: clamp(this.locCard - 1.4, 0, 1) * 0.8,
      });
    }
  }

  // Ele parado, sem perseguir mais. Apenas olhando ele ir embora — como
  // quem sabe que vai cobrar outro dia.
  drawCredorParado(ctx, cam) {
    const c = this.credorParado;
    if (!c) return;
    c.det.det.update(1 / 60);
    c.det.draw(ctx, cam);
  }

  // -------------------------------------------------------------------
  // salvar / carregar
  // -------------------------------------------------------------------

  saveSlot(i) {
    const lv = this.level;
    save.write(i, {
      locationName: T(lv.nameKey),
      playtime: this.playtime,
      thumb: gfx.snapshot(),
      state: {
        level: lv.key,
        x: Math.round(this.player.x),
        facing: this.player.facing,
        flags: this.flags || {},
        // Capitulo 2: o que ele carrega, o que ele anotou e o quanto de
        // cabeca ainda sobrou.
        san: this.sanity.save(),
        jr: this.journal.save(),
        inv: this.inv.save(),
        hp: Math.round(this.player.hp),
        gun: !!this.player.hasGun,
        ammo: this.player.ammo, res: this.player.reserve,
        // As portas e os itens ja pegos nao voltam.
        usados: (lv.interactables || []).filter(i => i.disabled && i.id).map(i => i.id),
      },
    });
    if (this.menu) this.menu.refresh();
  }

  loadSlot(i) {
    const d = save.read(i);
    if (!d || !d.state) { this.toMenu(); return; }
    const s = d.state;
    this.playtime = d.playtime || 0;
    this.flags = s.flags || {};
    audio.stopMusic(0.8);
    this.pause.active = false;

    this.resetChapter2();
    this.sanity.load(s.san);
    this.journal.load(s.jr);
    this.inv.load(s.inv);
    const p = this.player;
    p.hp = typeof s.hp === 'number' ? s.hp : 100;
    p.hasGun = !!s.gun;
    p.ammo = s.ammo === undefined ? 0 : s.ammo;
    p.reserve = s.res === undefined ? 0 : s.res;
    p.det.props.gun = p.hasGun ? 'holstered' : 'none';
    p.segurarPorrete(this.inv.hand === 'club');
    p.idleMode = this.flags.cap2 ? 'sit' : null;

    this.enterLevel(s.level || 'alley', s.x, s.facing);
    // itens ja pegos continuam pegos, na lista e no cenario
    const lv = this.level;
    for (const id of (s.usados || [])) {
      if (lv.pego) lv.pego[id] = true;
      const it = (lv.interactables || []).find(i => i.id === id);
      if (it) it.disabled = true;
    }
    this.state = 'play';
  }

  // -------------------------------------------------------------------
  // SALA DE TESTE
  // -------------------------------------------------------------------

  startLab() {
    this.state = 'lab';
    this.labAnim = -1;      // -1 = automatico
    this.labSpeed = 1;
    this.labSkel = false;
    this.labFlip = 1;
    this.labFree = false;
    audio.stopMusic(0.6);
    audio.stopAllLoops();
    this.enterLevel('alley', 200, 1);
    this.locCard = 0;
    this.player.det.play('idle', { blend: 0 });
  }

  updateLab(dt) {
    const lv = this.level;
    if (input.pressed('cancel')) { this.fadeTo(() => this.toMenu(), 0.4, 0.5); }

    // troca de animacao
    if (input.pressedFrame.has('ArrowLeft') || input.pressedFrame.has('ArrowRight')) {
      const d = input.pressedFrame.has('ArrowRight') ? 1 : -1;
      this.labAnim = this.labAnim + d;
      if (this.labAnim < -1) this.labAnim = ANIM_NAMES.length - 1;
      if (this.labAnim >= ANIM_NAMES.length) this.labAnim = -1;
      audio.uiMove();
      if (this.labAnim >= 0) this.player.det.play(ANIM_NAMES[this.labAnim], { restart: true, blend: 0.1 });
    }
    if (input.pressedFrame.has('KeyZ')) { this.labSpeed = clamp(this.labSpeed - 0.1, 0.1, 3); audio.uiMove(); }
    if (input.pressedFrame.has('KeyX')) { this.labSpeed = clamp(this.labSpeed + 0.1, 0.1, 3); audio.uiMove(); }
    if (input.pressedFrame.has('KeyC')) { this.labSkel = !this.labSkel; audio.uiMove(); }
    if (input.pressedFrame.has('KeyV')) { this.labFlip = -this.labFlip; this.player.det.setFacing(this.labFlip); audio.uiMove(); }
    if (input.pressedFrame.has('KeyF')) { this.labFree = !this.labFree; this.cam.free = this.labFree; audio.uiMove(); }

    lv.update(dt);
    if (this.labAnim >= 0) {
      const d = this.player.det;
      d.speed = this.labSpeed;
      if (d.done && !d.loopHint) d.play(ANIM_NAMES[this.labAnim], { restart: true, blend: 0 });
      d.update(dt);
      this.player.vx = 0;
    } else {
      this.player.det.speed = this.labSpeed;
      this.player.update(dt, lv, !this.labFree);
    }

    if (this.labFree) {
      this.cam.x = clamp(this.cam.x + input.axisX() * 220 * dt, this.cam.minX, this.cam.maxX);
    } else {
      this.cam.follow(this.player.x, 0, this.player.facing, dt, Math.abs(this.player.vx) > 4);
    }
    this.rain.update(dt, this.cam.x);
    this.fog.update(dt, lv.t);
    this.fx.update(dt);

    const cam = this.cam;
    gfx.begin('#05060a');
    lv.drawBack(gfx.s, cam);
    this.player.draw(gfx.s, cam);
    this.fx.draw(gfx.s, cam.ix, cam.iy);
    this.fog.draw(gfx.s);
    this.rain.draw(gfx.s);
    lv.drawFore(gfx.s, cam);
    gfx.beginLights(lv.ambient);
    lv.addLights(gfx, cam);
    for (const L2 of this.player.lights(cam)) gfx.addLight(L2.x, L2.y, L2.r, L2.color, L2.i);
    gfx.endLights(lv.bloom);

    if (this.labSkel) this.drawSkeleton(gfx.s, cam);
    this.drawLabUI(gfx.s);
    gfx.present(dt);
  }

  drawSkeleton(ctx, cam) {
    const p = this.player;
    const x = Math.round(p.x - cam.ix), y = Math.round(p.y - cam.iy);
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#38d0ff';
    ctx.fillRect(x - 1, y - 1, 3, 3);                 // pe
    ctx.fillStyle = '#ffd24a';
    ctx.fillRect(x - 1, y - 31, 3, 3);                // quadril
    ctx.fillRect(x - 1, y - 51, 3, 3);                // ombro
    ctx.fillStyle = '#ff5a4a';
    ctx.fillRect(x - 1, y - 67, 3, 3);                // topo da cabeca
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#38d0ff';
    ctx.fillRect(x, y - 66, 1, 66);
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 30, y, 60, 1);                   // linha do chao
    ctx.restore();
  }

  drawLabUI(ctx) {
    const name = this.labAnim < 0 ? (getLang() === 'en' ? 'AUTO (free control)' : 'AUTO (controle livre)')
      : ANIM_NAMES[this.labAnim].toUpperCase();
    panelBox(ctx, 8, 8, 190, 44, 1);
    text(ctx, T('lab_title'), 14, 12, { size: 9, font: 'ui', weight: 'bold', color: PAL.uiAccent, track: 2 });
    text(ctx, name, 14, 24, { size: 10, font: 'ui', weight: 'bold', color: PAL.uiText, track: 1 });
    text(ctx, `${T('lab_speed')} ${this.labSpeed.toFixed(1)}x   ${this.player.det.anim}`, 14, 37,
      { size: 8, font: 'ui', color: PAL.uiDim, track: 1 });
    text(ctx, T('lab_hint'), VW / 2, VH - 14,
      { size: 7, font: 'ui', color: '#5a5249', align: 'center', track: 1, shadow: true });
    text(ctx, this.labFree ? 'F  CAMERA LIVRE [ON]' : 'F  CAMERA LIVRE', VW - 8, 12,
      { size: 7, font: 'ui', color: this.labFree ? PAL.uiAccent : '#5a5249', align: 'right', track: 1 });
  }

  // -------------------------------------------------------------------
  // depuracao
  // -------------------------------------------------------------------

  drawDebug(ctx, label) {
    const lines = [
      `${T('dbg_on')}  ${label}`,
      `fps ${this.fps.toFixed(0)}   ${formatPlaytime(this.playtime)}`,
    ];
    if (this.player && this.state !== 'menu') {
      lines.push(`x ${this.player.x.toFixed(1)}  v ${this.player.vx.toFixed(0)}  ${this.player.state}`);
      lines.push(`anim ${this.player.det.anim}  t ${this.player.det.time.toFixed(2)}`);
      lines.push(`cam ${this.cam.x.toFixed(0)}  face ${this.player.facing}`);
    }
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 150, lines.length * 10 + 8);
    ctx.restore();
    for (let i = 0; i < lines.length; i++) {
      text(ctx, lines[i], 5, 4 + i * 10, { size: 8, font: 'mono', color: '#7ce08a' });
    }
  }
}

// Pausa curta para o navegador pintar a mensagem de carregamento. Usa
// setTimeout e nao requestAnimationFrame de proposito: rAF congela quando a
// aba esta em segundo plano e o jogo travaria no meio do boot.
function frame(ms = 24) { return new Promise(r => setTimeout(r, ms)); }

// O fio vermelho embaixo do nome do capitulo. E o unico vermelho da tela,
// e e o mesmo do titulo e do sangue — a paleta so deixa essa cor gritar.
function ctxLinha(ctx, cx, y, largura, alpha) {
  if (largura <= 0 || alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = PAL.uiAccent;
  ctx.fillRect(Math.round(cx - largura / 2), Math.round(y), Math.round(largura), 1);
  ctx.restore();
}

const game = new Game();
window.game = game;

// Ganchos de desenvolvimento. Permitem rodar o jogo quadro a quadro e tirar
// capturas sem depender do rAF (que nao roda em aba escondida). Nao afetam
// o jogo normal — nada aqui e chamado pelo laco principal.
window.__dev = {
  step(dt = 1 / 60, n = 1) { for (let i = 0; i < n; i++) game.tick(dt); return game.state; },
  gfx,
  // Pula direto para um setor. Existe so para testar: sem isto e preciso
  // jogar o capitulo inteiro para olhar a ultima sala.
  ir(key, x, facing = 1) {
    game.state = 'play';
    game.transition = null;
    gfx.fade = 0; gfx.eyelid = 1; gfx.letterbox = 0;
    game.scene = null; game.qte = null;
    game.enterLevel(key, x, facing);
    return key;
  },
  key(code, ms = 40) {
    window.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true }));
    setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true })), ms);
  },
  hold(code) { window.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true })); },
  release(code) { window.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true })); },
  snap(nome) {
    const c = document.getElementById('game');
    return fetch('/snap?nome=' + nome, { method: 'POST', body: c.toDataURL('image/png') })
      .then(r => r.text());
  },
};

// Erro na construcao das fases viraria uma "promise rejeitada" sem contexto.
// Aqui ele chega na tela de erro junto com a etapa em que o boot parou.
game.boot().catch(e => {
  if (window.__crash) {
    window.__crash('Erro durante o carregamento', (e && e.stack) ? e.stack : String(e));
  } else throw e;
});
