// input.js — teclado, mouse e gamepad atras de nomes de acao.
// Nenhum sistema do jogo deve perguntar por 'KeyD'; pergunta por 'right'.

const BINDINGS = {
  left:     ['ArrowLeft', 'KeyA'],
  right:    ['ArrowRight', 'KeyD'],
  up:       ['ArrowUp', 'KeyW'],
  down:     ['ArrowDown', 'KeyS'],
  run:      ['ShiftLeft', 'ShiftRight'],
  interact: ['KeyE'],
  attack:   ['KeyJ', 'Space'],
  confirm:  ['Enter', 'NumpadEnter', 'KeyE'],
  cancel:   ['Escape', 'Backspace'],
  pause:    ['Escape'],
  skip:     ['Escape', 'Enter'],
  menuUp:   ['ArrowUp', 'KeyW'],
  menuDown: ['ArrowDown', 'KeyS'],
  menuLeft: ['ArrowLeft', 'KeyA'],
  menuRight:['ArrowRight', 'KeyD'],
  debug:    ['F1'],
  animLab:  ['F2'],
};

class Input {
  constructor() {
    this.down = new Set();
    this.pressedFrame = new Set();
    this.releasedFrame = new Set();
    this.heldTime = new Map();
    // dy acumula o movimento vertical do mouse desde o quadro anterior.
    // Movimento horizontal e lido e descartado de proposito: a mira do jogo
    // so sobe e desce.
    this.mouse = { x: 0, y: 0, down: false, pressed: false, right: false, rightPressed: false, dy: 0 };
    this.anyPress = false;
    this.lastDevice = 'keyboard';
  }

  init() {
    window.addEventListener('keydown', e => {
      // F5/F12 continuam funcionando; o resto o jogo consome.
      if (!['F5', 'F12', 'F11'].includes(e.code)) e.preventDefault();
      if (e.repeat) return;
      this.down.add(e.code);
      this.pressedFrame.add(e.code);
      this.heldTime.set(e.code, 0);
      this.anyPress = true;
      this.lastDevice = 'keyboard';
    });
    window.addEventListener('keyup', e => {
      this.down.delete(e.code);
      this.releasedFrame.add(e.code);
      this.heldTime.delete(e.code);
    });
    window.addEventListener('blur', () => { this.down.clear(); this.heldTime.clear(); });
    window.addEventListener('mousedown', e => {
      this.anyPress = true;
      if (e.button === 2) { this.mouse.right = true; this.mouse.rightPressed = true; }
      else { this.mouse.down = true; this.mouse.pressed = true; }
    });
    window.addEventListener('mouseup', e => {
      if (e.button === 2) this.mouse.right = false;
      else this.mouse.down = false;
    });
    window.addEventListener('mousemove', e => {
      this.mouse.dy += e.movementY || 0;
    });
    window.addEventListener('blur', () => { this.mouse.right = false; this.mouse.down = false; });
    window.addEventListener('contextmenu', e => e.preventDefault());
    return this;
  }

  update(dt) {
    for (const [k] of this.heldTime) this.heldTime.set(k, this.heldTime.get(k) + dt);
  }

  // chame no fim do frame
  flush() {
    this.pressedFrame.clear();
    this.releasedFrame.clear();
    this.mouse.pressed = false;
    this.mouse.rightPressed = false;
    this.mouse.dy = 0;
    this.anyPress = false;
  }

  isDown(action) {
    const keys = BINDINGS[action];
    if (!keys) return false;
    for (const k of keys) if (this.down.has(k)) return true;
    return false;
  }

  pressed(action) {
    const keys = BINDINGS[action];
    if (!keys) return false;
    for (const k of keys) if (this.pressedFrame.has(k)) return true;
    return false;
  }

  released(action) {
    const keys = BINDINGS[action];
    if (!keys) return false;
    for (const k of keys) if (this.releasedFrame.has(k)) return true;
    return false;
  }

  // Quanto tempo a acao esta segurada (o maior entre as teclas ligadas).
  held(action) {
    const keys = BINDINGS[action];
    if (!keys) return 0;
    let m = 0;
    for (const k of keys) { const t = this.heldTime.get(k); if (t !== undefined && t > m) m = t; }
    return m;
  }

  axisX() {
    return (this.isDown('right') ? 1 : 0) - (this.isDown('left') ? 1 : 0);
  }
}

export const input = new Input();
