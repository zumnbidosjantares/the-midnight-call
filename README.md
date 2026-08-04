# The Midnight Call

*Chamado da Meia-Noite* — a side-scrolling investigative survival horror game
about a bankrupt detective who answers the phone at 2:14 in the morning.

Built from scratch in HTML5 Canvas. No engine, no build step, no dependencies.

> **Status: v0.1 — vertical slice.** Menu, opening cutscene, one alley, one
> bar. Playable end to end. See [`docs/SESSION_LOG.md`](docs/SESSION_LOG.md)
> for exactly what works and what is still broken.

---

## Running it

**Windows:** double-click `ABRIR_JOGO.bat`.
**Linux / macOS:** `./abrir_jogo.sh`

Both start a small local server and open the game. Needs Python 3 (or
Node.js as a fallback). Keep the terminal window open while playing.

The game **must** be served over `http://localhost` — opening `index.html`
directly with `file://` makes the browser refuse to load the JavaScript
modules.

If it does not open, run `DIAGNOSTICO.bat`.

## Controls

| Key | Action |
|-----|--------|
| `A` / `D` or arrows | Walk |
| `Shift` (hold) | Run |
| `E` | Interact / advance dialogue |
| `J` or `Space` | Punch (press twice for the second hit) |
| `Esc` | Pause / back |
| `Esc` or `Enter` (hold) | Skip the opening cutscene |
| `F1` | Debug overlay |

The main menu has a **Test Room** for stepping through every animation.

## What is interesting in here, technically

- **No sprite sheets.** The detective is a skeletal rig — nine hand-drawn
  pixel-art parts rotating around joints, driven by interpolated key poses.
  Rotated with nearest-neighbour sampling so the pixels stay hard-edged
  while the motion runs at a true 60 fps.
- **No font files.** Text is rendered with a system font into a buffer, then
  its alpha channel is hard-cut to produce bitmap-font edges — with accents
  intact, which matters for a bilingual PT/EN game.
- **No audio files** (except the narration). Rain, wind, footsteps, punches,
  door creaks, the lighter, and the menu piano are all synthesised at
  runtime in WebAudio.
- **Everything renders at 480×270** and is upscaled with nearest neighbour.
  The scene is multiplied by a light buffer, with a quarter-resolution
  bloom pass, film grain, scanlines and vignette on top.
- **Level art is procedural but deterministic** — brick, asphalt, rust and
  grime are thousands of seeded 1px rectangles, drawn once at load into
  layer canvases.
- **The opening cutscene is driven by the narration audio**, not a timer.
  The car brakes when the sentence ends, whatever the recording's length.
  The subtitle cues were derived by measuring the audio's volume envelope
  and aligning the script's sentences to the detected speech blocks.

## Layout

```
index.html          shell + crash screen
js/core/            renderer, text, input, audio, saves
js/art/             palette, pixel tools, the character rig
js/world/           camera, materials, levels, weather
js/systems/         player, dialogue, cutscene
js/ui/              menu, pause, shared panels
docs/GAME_DESIGN.md the plan: full 5-hour chapter breakdown, systems roadmap
docs/SESSION_LOG.md what was built each session, and every open bug
```

## A note on `assets/reference/`

Those are third-party reference images (concept art and screenshots the
author collected while defining the look). They are here for development
convenience. **Remove them before making this repository public.**
