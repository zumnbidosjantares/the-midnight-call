// gfx.js — o pipeline de imagem inteiro do jogo.
//
// Regra de ouro: TUDO e desenhado numa tela interna de 480x270. O navegador
// so amplia o resultado final, com nearest-neighbor, entao o pixel nunca
// borra. Nenhum modulo do jogo deve tocar no canvas visivel direto.
//
// Ordem de um frame:
//   gfx.begin()            limpa a cena
//   ... desenha mundo ...  em gfx.s (contexto 480x270)
//   gfx.beginLights(cor)   pinta o buffer de luz com a luz ambiente
//   ... gfx.addLight(...)  cada lampada/fogo/isqueiro soma luz
//   gfx.endLights()        multiplica luz sobre a cena + bloom
//   ... desenha UI ...     UI vem DEPOIS da luz, senao o menu fica escuro
//   gfx.present(dt)        grao, vinheta, scanline, fade, letterbox, shake

export const VW = 480;
export const VH = 270;

export function makeBuffer(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d', { alpha: true });
  x.imageSmoothingEnabled = false;
  return { c, x };
}

// Ruido determinístico: mesma semente, mesmo resultado. Serve para grao,
// tijolo, ferrugem — coisas que precisam parecer aleatorias mas identicas
// a cada carregamento (senao o cenario "pisca" quando e reconstruido).
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeInOut = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const easeOut = t => 1 - Math.pow(1 - t, 3);
export const easeIn = t => t * t * t;

class Gfx {
  constructor() {
    this.scale = 1;
    this.shakeAmt = 0;
    this.shakeTime = 0;
    this.fade = 0;            // 0 = nada, 1 = preto total
    this.fadeColor = '#000000';
    this.flash = 0;
    this.flashColor = '#ffffff';
    this.letterbox = 0;       // 0..1 — altura das barras de cinema
    // Grao discreto de proposito. Acima de ~0.03 o ruido comeca a comer os
    // pixels do rosto do personagem, que tem 14px de largura — o que sobra
    // e uma cara suja e sem expressao.
    this.grainAmount = 0.018;
    this.scanlines = 0.07;
    this.vignetteAmount = 0.9;
    this.pixelPerfect = false;
    this.time = 0;
  }

  init() {
    this.out = document.getElementById('game');
    this.o = this.out.getContext('2d', { alpha: false });
    this.o.imageSmoothingEnabled = false;

    const scene = makeBuffer(VW, VH);
    this.sceneC = scene.c; this.s = scene.x;

    const light = makeBuffer(VW, VH);
    this.lightC = light.c; this.l = light.x;

    // Buffer de brilho em 1/4 da resolucao. Ampliar ele DE VOLTA com
    // suavizacao ligada e um blur gaussiano de pobre — e o que faz o poste
    // de luz ter halo em vez de borda dura.
    const glow = makeBuffer(VW >> 2, VH >> 2);
    this.glowC = glow.c; this.g = glow.x;
    this.g.imageSmoothingEnabled = true;

    const tmp = makeBuffer(VW, VH);
    this.tmpC = tmp.c; this.t = tmp.x;

    const tmp2 = makeBuffer(VW, VH);
    this.tmp2C = tmp2.c; this.t2 = tmp2.x;

    this._buildGrain();
    this._buildVignette();
    this._buildScanlines();

    this.resize();
    window.addEventListener('resize', () => this.resize());
    return this;
  }

  _buildGrain() {
    this.grain = [];
    const rnd = mulberry32(0xC0FFEE);
    for (let i = 0; i < 6; i++) {
      const b = makeBuffer(VW, VH);
      const img = b.x.createImageData(VW, VH);
      const d = img.data;
      for (let p = 0; p < d.length; p += 4) {
        const v = (rnd() * 255) | 0;
        d[p] = v; d[p + 1] = v; d[p + 2] = v; d[p + 3] = 255;
      }
      b.x.putImageData(img, 0, 0);
      this.grain.push(b.c);
    }
    this.grainIdx = 0;
    this.grainTimer = 0;
  }

  _buildVignette() {
    const b = makeBuffer(VW, VH);
    const g = b.x.createRadialGradient(VW / 2, VH / 2, VH * 0.28, VW / 2, VH / 2, VH * 0.86);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.55, 'rgba(206,200,196,1)');
    g.addColorStop(1, 'rgba(56,50,54,1)');
    b.x.fillStyle = g;
    b.x.fillRect(0, 0, VW, VH);
    this.vignetteC = b.c;
  }

  _buildScanlines() {
    const b = makeBuffer(4, 4);
    b.x.fillStyle = 'rgba(255,255,255,1)';
    b.x.fillRect(0, 0, 4, 4);
    b.x.fillStyle = 'rgba(120,120,130,1)';
    b.x.fillRect(0, 1, 4, 1);
    this.scanC = b.c;
    this.scanPattern = this.t.createPattern(b.c, 'repeat');
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    let sc = Math.min(w / VW, h / VH);
    if (this.pixelPerfect) sc = Math.max(1, Math.floor(sc));
    this.scale = sc;
    this.out.style.width = Math.round(VW * sc) + 'px';
    this.out.style.height = Math.round(VH * sc) + 'px';
  }

  shake(amount, dur = 0.35) {
    this.shakeAmt = Math.max(this.shakeAmt, amount);
    this.shakeTime = Math.max(this.shakeTime, dur);
    this.shakeDur = this.shakeTime;
  }

  begin(clearColor) {
    const s = this.s;
    this.protect = null;          // cada estado decide de novo o que poupar
    s.setTransform(1, 0, 0, 1, 0, 0);
    s.globalCompositeOperation = 'source-over';
    s.globalAlpha = 1;
    if (clearColor) { s.fillStyle = clearColor; s.fillRect(0, 0, VW, VH); }
    else s.clearRect(0, 0, VW, VH);
  }

  // ---------- luz ----------

  beginLights(ambient) {
    const l = this.l, g = this.g;
    l.setTransform(1, 0, 0, 1, 0, 0);
    l.globalCompositeOperation = 'source-over';
    l.globalAlpha = 1;
    l.fillStyle = ambient;
    l.fillRect(0, 0, VW, VH);
    l.globalCompositeOperation = 'lighter';

    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1;
    g.clearRect(0, 0, VW >> 2, VH >> 2);
    g.globalCompositeOperation = 'lighter';
  }

  // Luz redonda. `falloff` < 1 concentra o miolo, > 1 espalha.
  addLight(x, y, r, color, intensity = 1, falloff = 1) {
    if (r <= 0 || intensity <= 0) return;
    if (x + r < 0 || x - r > VW || y + r < 0 || y - r > VH) return;
    const l = this.l;
    const grad = l.createRadialGradient(x, y, 0, x, y, r);
    const rgb = hexToRgb(color);
    const mid = clamp(0.42 * falloff, 0.05, 0.9);
    grad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${intensity})`);
    grad.addColorStop(mid, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${intensity * 0.42})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    l.fillStyle = grad;
    l.fillRect(x - r, y - r, r * 2, r * 2);

    const g = this.g, q = 0.25;
    const gx = x * q, gy = y * q, gr = r * q;
    const grad2 = g.createRadialGradient(gx, gy, 0, gx, gy, gr);
    grad2.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${intensity * 0.9})`);
    grad2.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad2;
    g.fillRect(gx - gr, gy - gr, gr * 2, gr * 2);
  }

  // Cone de luz — poste de rua, farol de carro, lanterna.
  addCone(x, y, angle, spread, len, color, intensity = 1) {
    const l = this.l;
    const rgb = hexToRgb(color);
    l.save();
    l.translate(x, y);
    l.rotate(angle);
    const grad = l.createLinearGradient(0, 0, len, 0);
    grad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${intensity})`);
    grad.addColorStop(0.45, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${intensity * 0.45})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    l.fillStyle = grad;
    l.beginPath();
    l.moveTo(0, 0);
    l.lineTo(len, -Math.tan(spread / 2) * len);
    l.lineTo(len, Math.tan(spread / 2) * len);
    l.closePath();
    l.fill();
    l.restore();

    const g = this.g, q = 0.25;
    g.save();
    g.translate(x * q, y * q);
    g.rotate(angle);
    const grad2 = g.createLinearGradient(0, 0, len * q, 0);
    grad2.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${intensity * 0.7})`);
    grad2.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad2;
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(len * q, -Math.tan(spread / 2) * len * q);
    g.lineTo(len * q, Math.tan(spread / 2) * len * q);
    g.closePath();
    g.fill();
    g.restore();
  }

  endLights(bloom = 0.5) {
    const s = this.s;
    s.globalCompositeOperation = 'multiply';
    s.globalAlpha = 1;
    s.drawImage(this.lightC, 0, 0);

    if (bloom > 0) {
      s.globalCompositeOperation = 'lighter';
      s.globalAlpha = bloom;
      s.imageSmoothingEnabled = true;
      s.drawImage(this.glowC, 0, 0, VW, VH);
      s.imageSmoothingEnabled = false;
      s.globalAlpha = 1;
    }
    s.globalCompositeOperation = 'source-over';
  }

  // ---------- pos-processamento e apresentacao ----------

  // Aplica um efeito de tela cheia poupando o retangulo `protect` — que e
  // onde o personagem esta. Grao e scanline em cima de um rosto de 14px
  // comem os pixels que desenham o olho e a boca, e ele fica com cara de
  // borrao. Fora dele o efeito vale inteiro; em cima dele, um quarto.
  _post(modo, alpha, desenha) {
    const s = this.s, p = this.protect;
    if (!p) {
      s.save();
      s.globalCompositeOperation = modo;
      s.globalAlpha = alpha;
      desenha(s);
      s.restore();
      return;
    }
    s.save();
    s.beginPath();
    s.rect(0, 0, VW, VH);
    s.rect(p.x, p.y, p.w, p.h);
    s.clip('evenodd');            // tudo menos o personagem
    s.globalCompositeOperation = modo;
    s.globalAlpha = alpha;
    desenha(s);
    s.restore();

    s.save();
    s.beginPath();
    s.rect(p.x, p.y, p.w, p.h);
    s.clip();
    s.globalCompositeOperation = modo;
    s.globalAlpha = alpha * 0.25;
    desenha(s);
    s.restore();
  }

  present(dt) {
    this.time += dt;
    const s = this.s, o = this.o;
    s.setTransform(1, 0, 0, 1, 0, 0);
    s.globalCompositeOperation = 'source-over';
    s.globalAlpha = 1;

    if (this.vignetteAmount > 0) {
      s.globalCompositeOperation = 'multiply';
      s.globalAlpha = this.vignetteAmount;
      s.drawImage(this.vignetteC, 0, 0);
      s.globalAlpha = 1;
      s.globalCompositeOperation = 'source-over';
    }

    if (this.grainAmount > 0) {
      this.grainTimer += dt;
      if (this.grainTimer > 1 / 18) { this.grainTimer = 0; this.grainIdx = (this.grainIdx + 1) % this.grain.length; }
      const img = this.grain[this.grainIdx];
      this._post('overlay', this.grainAmount, (c) => c.drawImage(img, 0, 0));
    }

    if (this.scanlines > 0) {
      this._post('multiply', this.scanlines, (c) => {
        c.fillStyle = this.scanPattern;
        c.fillRect(0, 0, VW, VH);
      });
    }

    if (this.letterbox > 0) {
      const bar = Math.round(VH * 0.06 * this.letterbox);
      s.fillStyle = '#000';
      s.fillRect(0, 0, VW, bar);
      s.fillRect(0, VH - bar, VW, bar);
      this.lbBar = bar;
    } else this.lbBar = 0;

    if (this.flash > 0) {
      s.globalCompositeOperation = 'lighter';
      s.globalAlpha = clamp(this.flash, 0, 1);
      s.fillStyle = this.flashColor;
      s.fillRect(0, 0, VW, VH);
      s.globalAlpha = 1;
      s.globalCompositeOperation = 'source-over';
      this.flash -= dt * 3.2;
      if (this.flash < 0) this.flash = 0;
    }

    if (this.fade > 0) {
      s.globalAlpha = clamp(this.fade, 0, 1);
      s.fillStyle = this.fadeColor;
      s.fillRect(0, 0, VW, VH);
      s.globalAlpha = 1;
    }

    // shake — deslocamento inteiro, senao o pixel treme entre subpixels
    let sx = 0, sy = 0;
    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      const k = clamp(this.shakeTime / (this.shakeDur || 0.35), 0, 1);
      const a = this.shakeAmt * k * k;
      sx = Math.round((Math.random() * 2 - 1) * a);
      sy = Math.round((Math.random() * 2 - 1) * a);
      if (this.shakeTime <= 0) { this.shakeAmt = 0; }
    }

    o.setTransform(1, 0, 0, 1, 0, 0);
    o.globalAlpha = 1;
    o.imageSmoothingEnabled = false;
    if (sx || sy) { o.fillStyle = '#000'; o.fillRect(0, 0, VW, VH); }
    o.drawImage(this.sceneC, sx, sy);
  }

  // Miniatura para a tela de save. Le a cena ANTES do fade, entao chame
  // no momento em que o jogador aperta pausa.
  snapshot(w = 108, h = 61) {
    const b = makeBuffer(w, h);
    b.x.imageSmoothingEnabled = false;
    b.x.drawImage(this.sceneC, 0, 0, VW, VH, 0, 0, w, h);
    return b.c.toDataURL('image/webp', 0.6);
  }
}

export function hexToRgb(hex) {
  if (Array.isArray(hex)) return hex;
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgba(hex, a) {
  const c = hexToRgb(hex);
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}

export function mixHex(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  const r = Math.round(lerp(A[0], B[0], t));
  const g = Math.round(lerp(A[1], B[1], t));
  const bl = Math.round(lerp(A[2], B[2], t));
  return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)}`;
}

export const gfx = new Gfx();
