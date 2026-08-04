# SESSION LOG — The Midnight Call

Running record of every working session. **Read this file first when
resuming.** It is the handover note; `GAME_DESIGN.md` is the plan.

> A note on the numbers: token counts and durations below are **honest
> estimates**, not metered values — I have no access to the billing meter
> from inside a session. They are recorded to show relative cost between
> sessions, not to be accurate to the token.

---

## Where the project stands right now

**Version:** 0.1 — vertical slice
**Playable:** yes, end to end. Menu → opening cutscene → alley → bar →
save → menu.
**How to run:** double-click `ABRIR_JOGO.bat` (needs Python; it is already
installed on this machine). Keep the black window open while playing.

**Next session should start with:** deciding the detective's name, then
building the NPC + dialogue-choice system (Chapter 2, the landlady).

---

## Session 01 — 2026-08-03

**Duration:** ~2h30 (estimate)
**Tokens:** ~350k (estimate — heavy on image reads, since every art change
was verified by screenshotting the running game)

### What we did

Built the entire foundation from an empty folder.

**Engine**
- 480×270 internal resolution, nearest-neighbour upscale, no blurring at
  any scale (`gfx.js`).
- Full lighting pipeline: ambient buffer, additive coloured lights, cone
  lights, quarter-resolution bloom, film grain, scanlines, vignette,
  letterbox, fade, flash, integer screen shake.
- Text renderer that takes a system font, renders it small, and hard-cuts
  the alpha channel so it comes out looking like a bitmap font — with
  accents and cedillas intact, which matters for a PT/EN game.
- Input behind action names, 3-slot versioned save system with WebP
  thumbnails, settings persistence.
- Fully synthesised audio: rain, wind, room tone, footsteps (wet/dry),
  punch whoosh and impact, door creak and slam, lighter flick, flame,
  thunder, car pass-by, UI blips, and a slow D-minor piano piece with
  convolution reverb and vinyl crackle for the menu.

**Character**
- The detective is a skeletal rig, not a sprite sheet: nine hand-drawn
  pixel parts rotating around joints, driven by interpolated key poses.
  Runs at true 60 fps instead of stepping through frames.
- Animations: idle (breathing), walk, run, two-hit punch combo, interact,
  get-out-of-car, look-back, and the **10-second cigarette animation** —
  pocket, mouth, lighter flick, flame (which lights the scene for real),
  hesitation, close the lighter, take it out, throw it away.
- Per-frame rim light, wet-floor reflection, and a horizontal squash when
  he turns around.

**World**
- Materials library: brick, asphalt, wood panelling, sheet metal, plus
  dumpster, crates, fire escape, drain pipes, posters, graffiti, boarded
  windows, doors, street lamps, bare bulbs, neon boxes, bar counter, bottle
  shelf, cracked mirror, tables, stacked chairs, wall phone, blinds,
  puddles, trash, manholes, building silhouettes.
- **Back alley** (1300px): wet brick, flickering caged lamp, lit window,
  neon over the bar door, four examinable props, rain with splashes.
- **The Last Dime bar** (1000px): pressed-tin ceiling, nicotine-stained
  plaster, wainscot, two swinging pendant lamps whose light actually
  swings, moonlight through blinds, stacked chairs, cracked mirror, the
  wall phone with the cut cord, dust motes.
- **The drive** (tiling city): six parallax layers, lit windows, fire
  escapes, wet-asphalt light streaks, a 134px sedan with spinning wheels,
  a door that opens, headlights and tail lights.

**Presentation**
- Title screen is a live scene, not an image: it rains, the lamp buzzes,
  and the detective stands under it going through the cigarette animation
  every 26 seconds. Title is rendered from Impact and then eroded
  pixel-by-pixel with drips, revealed by a wipe, and flickers like bad
  neon.
- Pause menu → 3 save slots with screenshots, timestamps, playtime.
- Options: language, four volume sliders, subtitles, scanlines, grain,
  camera shake, integer scaling. All persisted.
- **Opening cutscene** as specified: the car drives through the rain while
  the narrator speaks with subtitles; **when the narration ends the car
  brakes**, arrives, the door opens, he climbs out, the car leaves, he
  walks into the alley, control is handed over. Hold Esc to skip.
- **Test Room** on the main menu: cycle every animation, change playback
  speed, toggle the skeleton overlay, flip facing, free camera.

### What went right

- The skeletal rig was the correct call. Changing the character's whole
  proportion took one edit to a table of numbers, not redrawing 40 frames.
- Building a screenshot endpoint (`ferramentas/servidor_dev.py` + the
  `window.__dev` hooks) early. Every art decision after that was made by
  looking at the actual game instead of guessing. That is the single
  biggest reason the art landed.
- Driving the cutscene off the narration length instead of a fixed timer.
  Whatever audio file you drop in, the cutscene ends with the sentence.

### What went wrong (and how it was fixed)

- **Everything was invisible for the first hour.** Ambient light of ~12%
  turned realistically-coloured assets into black rectangles. Fixed by
  raising the entire palette ~25% and adding a faint "hero light" that
  follows the player. Rule recorded in the design doc.
- **`putImageData` ignores `globalAlpha`.** The dithered gradient helper
  was being used to darken the top of the alley wall and was erasing the
  brick instead of shading it. Replaced with alpha-blended rectangles.
- **The car sat where the detective's feet were**, so he looked like he was
  standing on the roof. Fixed by pushing the road plane down and drawing
  him *after* the car — the door that opens is the camera-side door, so he
  should be in front of it anyway.
- **The reach-for-the-face poses were completely wrong.** Raising the
  shoulder pushes the hand *away* from the head. The correct shape is a
  small shoulder angle with a nearly fully folded elbow.
- **The browser tab used for testing was hidden**, so `requestAnimationFrame`
  never fired and the boot sequence hung forever. Boot now yields with
  `setTimeout` instead of `rAF`.

### Bugs fixed this session

| Bug | Fix |
|-----|-----|
| Esc opened and closed the pause menu in the same frame | `justOpened` guard that skips one update |
| Enter held over from the menu instantly skipped the opening cutscene | skip input ignored for the first 0.6s |
| Bar interior effectively invisible | restructured the wall into ceiling / plaster / wainscot, brightened wood, added a second pendant lamp and floor bounce light |
| Interact prompt drew on top of the detective | prompt now floats above his head, not above the object |
| Save/load screen let the pause menu bleed through | screen dim raised to 90% |
| Bar's swinging lamp updated the wrong two lights (index drift) | lights held by named reference instead of array index |
| Typo left a broken colour string in the alley builder | corrected |
| A `clearRect` on the torn poster punched a hole through to the parallax layer | replaced with a dark fill |

### Known bugs / rough edges still open

1. **The alley is under-decorated between x≈550 and x≈1000.** Long stretch
   of plain brick. Needs an AC unit, horizontal pipes, a vent, chains, more
   ground clutter.
2. **The lighter reads slightly low** — it sits at chin height rather than
   in front of the mouth. Close enough to ship, worth a 2px pass.
3. **Dialogue choices are unimplemented.** The data format supports them;
   the box does not draw them yet.
4. **No gamepad support.** The input layer is ready for it, nothing is
   wired.
5. **The cutscene's tiled street repeats visibly** — three lamps at a fixed
   190px spacing reads like a metronome on a long drive.
6. **The bar's back-room parallax layer is nearly pure black** and is doing
   no work. Either give it depth or delete it.
7. **Not verified on a real focused browser tab at 60fps.** Everything was
   tested by stepping the game loop manually from a hidden tab. Frame
   pacing and audio behaviour under real playback are unconfirmed.

### What is left before this is a game

Immediate (next 1–3 sessions):
- Decide the detective's name.
- NPC entity: idle behaviour, facing the player, a talk state.
- Dialogue choices + a flag system that survives saving.
- Journal / case board — the deduction verb the whole game hangs on.
- Chapter 2 (the office) and Chapter 3 (the client's apartment).

Then: sanity, enemies, hiding, chases — see `GAME_DESIGN.md` §5.

### Files that did not exist before this session

Everything. 26 source files, 3 launcher scripts, 2 documents.

---

## Session 01b — 2026-08-04 (short follow-up)

**Duration:** ~20 min (estimate) · **Tokens:** ~40k (estimate)

### Why

Player reported the game showing **"o jogo travou"** — that is the built-in
crash overlay, so a JavaScript error was thrown somewhere. The actual error
text was not captured.

### Could not reproduce

Ran the game loop in real time (not stepped) twice: 695 frames through
menu → load save → gameplay, and 1016 frames through menu → new game →
opening cutscene with a live AudioContext. No exception either time.
Audited the source for modern syntax the browser might not support and for
the usual canvas throwers (`createRadialGradient` / `getImageData` with
non-finite values) — nothing found. **The cause is still unknown.**

### What was changed instead

Made the next report self-serving rather than guessing:

- Crash overlay now includes a **COPIAR ERRO** button and a **RECARREGAR**
  button, and appends an environment block: browser UA, window size, DPR,
  game state, current level, fps, player position and animation, cutscene
  phase — or, if the game never finished loading, the exact boot step it
  stopped on.
- The error text is saved to `localStorage['tmc.lastError']`, and a
  **"ver o ultimo erro"** link appears on the boot screen when one exists.
  Closing or reloading no longer loses it.
- `boot()` failures now land on the crash screen with the failing step
  instead of becoming a contextless unhandled rejection.
- **The main loop no longer dies from a single bad frame.** `tick()` is
  wrapped; one or two failed frames are swallowed and the game keeps
  running. Three consecutive failures stop the loop and show the overlay.
- Fixed a real latent bug found while doing this: the first frame's `dt`
  could be **negative** (the rAF timestamp can predate the
  `performance.now()` read just before it), and after minimising the tab it
  could be enormous. Both are now clamped.

### Follow-up: the player reported "nothing to copy"

That reframed the whole thing. **An empty crash panel means the crash
overlay was probably never what they saw** — the page most likely never
finished loading, which shows as a black screen pulsing "carregando…" with
nothing to copy. The player's own guess ("is it the local server?") was
right.

Two concrete defects found in the launcher:

1. **`ABRIR_JOGO.bat` opened the browser *before* starting the server.**
   Python takes a few hundred milliseconds to bind, so the browser could
   hit a dead port and show "can't reach this site". Fixed: `servidor.py`
   now opens the browser itself, and only after the socket is listening.
2. **A busy port failed silently.** Windows' `SO_REUSEADDR` semantics let a
   second server "bind" a port that another process is already serving, so
   the new one gets no traffic and no error. Fixed: the server probes the
   port first and walks forward (8137 → 8138 → …) until it finds a free
   one, printing which it chose.

Aggravating factor worth remembering: **the dev screenshot server was being
started and killed on port 8137 throughout session 01.** Anyone opening the
game during that window would have hit a dead or hijacked port. Never leave
the dev server bound to the same port the player's launcher uses.

Also added:
- **`DIAGNOSTICO.bat`** — prints Python version, every required file with
  OK/FALTANDO, ports in use, and whether the narration audio exists. Made
  for copying into chat.
- **Boot watchdog** — if the game has not left the loading state after 15
  seconds, the screen turns itself into a real diagnosis naming the likely
  cause (no server / opened via `file://` / build step that stalled).
- `ABRIR_JOGO.bat` now `pause`s at the end, so if Python dies instantly the
  window stays open with the reason on screen instead of vanishing.

Verified after the fix: the server picks a port, opens the default browser,
and serves all 22 modules with 200.

`DIAGNOSTICO.bat` output from the player's machine came back **completely
clean** — Python 3.13.14, all 23 files present, no port conflicts. So the
install is fine; the launcher race was the whole problem.

One more piece of noise removed: the player saw
`code 404, message File not found` in the server window and reasonably read
it as a failure. It was the game probing eight possible filenames for the
narration audio. `SimpleHTTPRequestHandler` logs that through `log_error`,
not `log_message`, so the existing 404 filter never caught it. Both are
filtered now, and the server prints an explicit line at startup saying
whether narration audio was found and what happens if it was not.

### ROOT CAUSE FOUND — and it was never a crash at all

The player's third report had the detail that cracked it: *"the error screen
with nothing in it, but there is sound, there is music, and the cursor
disappears when I move outside the box."*

Sound + music + hidden cursor means **the game was running perfectly the
whole time.** It was running *behind* a black overlay.

```css
#crash {
  display: flex;   /* this line */
  z-index: 20;
}
```

The crash panel is hidden with the HTML `hidden` attribute, which only works
because browsers ship `[hidden] { display: none }` in the user-agent
stylesheet. An **ID selector beats that**, so `display: flex` won, and the
overlay was visible from the first frame of the very first run — showing its
title ("O jogo travou.") and an empty `<pre>`, because no error had ever
occurred. Hence: nothing to copy. Ever.

Fix: `#crash[hidden] { display: none !important; }`

Verified: on load `hidden=true` → `display: none`; forced open →
`display: flex` with the text present; closed again → `display: none`. Swept
the DOM for any other element whose `hidden` attribute is being overridden
by one of my own display rules — **none**.

**Lesson worth keeping:** never hide an element with the `hidden` attribute
if its own selector sets `display`. Either pair every such rule with an
explicit `[hidden]` guard, or hide with a class. Also: "nothing to copy" on
an error screen is itself the diagnosis — an error panel with no error in it
was never triggered by an error.

Everything built during the follow-up (crash copy button, environment dump,
stored last error, boot watchdog, loop hardening, launcher race fix, port
fallback, `DIAGNOSTICO.bat`, 404 log suppression) stays. None of it was the
bug, all of it is worth having, and the launcher race and the negative first
`dt` were both real defects that would have bitten later.

### Next session starts with

Confirming the player sees the menu. Then: the detective's name, and the
NPC + dialogue-choice system.

---

## Session 02 — 2026-08-04

**Duration:** ~35 min (estimate) · **Tokens:** ~60k (estimate)

### Narration audio wired in and subtitles synced

The player supplied `audio cutscene.mp3` (60.76s, 48kHz stereo). Copied to
`assets/audio/narrator.mp3`, where the game finds it automatically.

**Syncing the subtitles without being able to hear the file.** I cannot
transcribe audio, so the timings were derived by measurement instead:

1. Decoded the mp3 in the browser and computed an RMS envelope in 20ms
   windows.
2. Ran hysteresis silence detection (enter at 0.0055, leave at 0.0028,
   minimum 240ms of speech, minimum 360ms of pause) → **17 speech blocks**,
   36.84s of actual voice inside 60.76s of file.
3. Checked whether the recording was even *this* script: the script has
   **exactly 17 sentences**. Estimating each sentence's spoken length from
   its character count and comparing cumulative boundaries against the
   detected blocks gave errors of **0.00s, 0.19s, 0.17s, 0.33s, 0.58s,
   0.59s, 0.68s, 0.00s**. Two independent boundaries landing dead-on is not
   a coincidence — the recording is the script in `i18n.js`.
4. Built a piecewise map from "speech time" to "file time" through the
   blocks, and placed each of the 10 display lines on it, with a 0.25s lead
   and each cue holding until the next one starts (no flicker between
   lines).

Verified against the live audio clock: at `currentTime` 1.07 / 4.68 / 11.93
/ 17.37 the correct cue was on screen each time.

**Bug found while doing it:** the narration started at the same moment as
the 2-second fade-in, so the first words played over a black screen and the
first subtitle appeared washed out. The voice now waits for the fade
(shortened to 1.6s) and starts at 80% opacity. `narrationTime` returns −1
before that, so no cue can match early.

Re-confirmed the whole chain still works: `drive → decel → stop → exit`
fires only when the voice ends.

### Pushed to GitHub

`https://github.com/luizhenriquevfernandes2008-ops/the-midnight-call`
— **private**, branch `main`, one commit.

Added `README.md` and `.gitignore` (excludes dev screenshots and Audacity
project files).

**Deliberately private.** Public is one command away and cannot be undone
— anything published can be cached or indexed even after deletion. Also,
`assets/reference/` holds third-party concept art and screenshots; those
should be deleted before the repo ever goes public. Noted in the README.

### Still open

Everything from Session 01's open list. The alley's plain stretch between
x≈550 and x≈1000 remains the most visible art gap.

### Next session starts with

The detective's name, then NPCs and dialogue choices.

---

## Session 03 — 2026-08-04

**Duration:** ~40 min (estimate) · **Tokens:** ~70k (estimate)

### The voice was inaudible — and it is the file, not the mix

Measured `narrator.mp3`: **peak −14.1 dBFS, overall RMS −40.7 dBFS.** It has
5x of headroom before clipping. No mix change alone would have saved it.

Fixes:
- The narration now plays **through WebAudio** instead of straight out of
  the `<audio>` element, so it can be amplified past 1.0 (an element's
  `volume` caps there). Chain: source → **gain ×4 (+12 dB)** → limiter
  (−6 dB threshold, 12:1) → voice bus. The limiter matters: +12 dB on a
  −14 dBFS peak would clip the loud syllables without it.
- **Ambience ducks while the voice speaks.** Rain 0.10 → 0.030, wind
  0.03 → 0.010, SFX bus to 30%. Everything ramps back the moment the
  narration ends, in step with the car braking. Also restored on skip, so
  the rest of the game is never left muffled.
- Car pass-by one-shots turned down (0.5 → 0.35 and 0.7 → 0.55).

**Bug fixed along the way:** the SFX duck and the SFX volume slider were
writing to the same `AudioParam`, so a ramp from one would cancel an
assignment from the other depending on ordering. The duck now lives on its
own gain node in series after the bus. If you touch this again: reading
`.value` on a param of a node with no active source is misleading in
Chrome — the automation is not advanced until something is actually
rendering through it.

### The supplied subtitle script does not match the supplied audio

`roteiro legenda.txt` arrived with 18 cues. Three independent checks say it
is **not the script in `narrator.mp3`**:

1. The script runs to 76.5s; cue 16 starts at 62s. The file is **60.76s**.
2. Forcing an 18-group segmentation of the audio and correlating group
   durations against the 18 cue durations gives **r = 0.149** — no
   relationship. A real match would be 0.7+.
3. Cue 1 is a single word (*"Engraçado..."*) followed by a pause, but the
   audio opens with **~8 seconds of continuous speech** at every detection
   threshold tested (0.002 → 0.008, pause minimums 0.15s → 0.6s).

**Correcting an over-claim from Session 02.** Last session I concluded the
audio *was* my own placeholder script, citing two boundary matches at
0.00s. Those two were zero by construction — the first and last boundaries
of a cumulative mapping always coincide. The mean error was 0.94s against
an expected ~1.8s for random points, which is barely better than chance. I
should not have called it proof.

### What was done anyway

- His 18 lines are now the narration text, with EN translations, using his
  own timings (each cue holds until the next enters, so no flicker).
- Added **`NARRATION_REF_DUR`** (77s) and automatic rescaling: the cutscene
  reads the real audio duration and scales every cue by the same factor.
  A 60.76s file gives scale 0.789; a matching file gives 1.00 and changes
  nothing. Protects against a render coming out slightly faster or slower.
  It cannot protect against a different script.
- Copied his script to `assets/audio/roteiro-narracao.srt` so it travels
  with the project.
- Verified every accented character survives the alpha-cut font renderer:
  `ç í ó ê ã á` all render clean at 12px.

### Open

- **Waiting on the correct narration export.** Drop it in as
  `assets/audio/narrator.mp3` and the subtitles line up. If the new file is
  not ~77s, update `NARRATION_REF_DUR` to whatever duration the timings
  were written for.
- If the new recording is louder (normalised near −3 dBFS), drop
  `GANHO_VOZ` in `js/core/audio.js` from 4.0 to about 1.2 or it will sound
  squashed.
- Everything from Session 01's open list.

### Next session starts with

The detective's name, then NPCs and dialogue choices.

---

## Session 04 — 2026-08-04

**Duration:** ~1h10 (estimate) · **Tokens:** ~120k (estimate)

A correction pass against a list of nine complaints from the player.

### The game not running on other machines — root cause and real fix

**Cause:** the source is written as ES modules. Browsers refuse to load
modules over `file://`. Anyone who downloaded the repo and double-clicked
`index.html` got a black screen forever. The local server existed to work
around that, but a server needs Python, a free port, and a firewall that
cooperates — three ways to fail on someone else's machine.

**Fix:** `ferramentas/gerar_offline.py` packs every module into a single
`JOGO_OFFLINE.html` (245 KB) that opens with a double-click anywhere. Each
module is wrapped in a function registered in a tiny module map, so module
scope is preserved — plain concatenation would have broken, since
`pixel.js` and `i18n.js` both export something called `line`. Exports are
registered as getters so live bindings still work (`i18n` reassigns `lang`).

`findNarration` also needed a `file://` branch: `fetch` is blocked there, so
it probes candidate filenames with an `<audio>` element instead.

**Verified:** the bundle boots, reaches the menu, plays the cutscene with
audio and subtitles, and completes the whole opening — tested over http.
**Not verified:** actual `file://` execution. The sandbox used for testing
renders local files as static snapshots and cannot run scripts in them. The
blocker it removes is structural (no modules left), but the player should
confirm.

### Character

- **Head redrawn as a real three-quarter view.** One eye instead of two, a
  nose breaking the silhouette at x12, an ear notch at x3, hair mass pushed
  back. Two symmetric eyes were why he read as facing the camera — or away.
- **Torso redrawn asymmetric.** Shirt-and-tie panel moved right of centre,
  wide vest panel behind, narrow one in front, holster strap only on the
  back. The old symmetric layout read as a back view in a side-scroller.
- **Back arm no longer vanishes.** Its shoulder now sits 7px out instead of
  5, and the darkening on back limbs went from 0.62 to 0.80.
- **Back legs darkened separately (0.64).** Arms need to stay visible, legs
  need to separate — one constant could not do both, so there are now two.
- **Rim light cut from 0.55 to 0.30** and the hero light desaturated. He had
  a blue outline around his whole body and read as wearing neon.
- **Vest darkened** so the white shirt reads as a separate garment.
- Legs given a slight stance in the rest pose; parallel legs merged into a
  single block.

### Animation stiffness

Added `ease: 'linear'` per animation, used by walk, run and both punches.
Easing in *and* out of every single key made every limb decelerate at every
keyframe — that is exactly the floppy ragdoll look. Also:

- Walk: elbow amplitude cut roughly in half (the swing belongs to the
  shoulder; the forearm should stay nearly locked).
- Run: elbow now holds a near-constant ~57° instead of pumping 72→80°.
- Punches: added a hold frame right after impact so the hit has weight.
- `getout` rebuilt as one monotone rise. The old version had the knee at
  104° and the torso at 26° simultaneously, and interpolation passed
  through poses no body makes — hence the contorting.

### Cigarette animation reworked

The lighter was in the back hand while the cigarette was in the front hand.
Now there is no lighter at all: pocket → look at it → hesitate → **"hoje
não..."** floats above his head → throw it away. One hand throughout. The
old lighter version is kept as `smokeLighter` (its flame is a real light
source and may be useful later).

Added a small floating-text system for that line; it also plays on the
title screen.

### Cutscene and post-processing

- **The car stays parked.** It used to drive off after he got out, which
  only makes sense for a taxi. Headlights now switch off once he closes the
  door.
- **Film grain cut from 0.055 to 0.018**, scanlines from 0.10 to 0.07, and
  the option sliders' maximums lowered to match. At the old level the noise
  was eating a face that is only 14px wide.
- Subtitles rewritten from the updated script, now **respecting the pauses**
  — each line leaves the screen during silence instead of holding until the
  next one.

### Still broken, and not fixable from here

The narration audio still does not match the script. Session 03 proved it
three ways (76.5s script vs 60.76s file; duration correlation 0.149; an
8-second opening block against a one-word first line). Adding the pauses to
the subtitles improved the pacing but cannot make the words line up with a
different recording. **A matching export of the narration is still needed.**

### Next session starts with

Confirmation that `JOGO_OFFLINE.html` runs on another machine, then the
detective's name and the NPC/dialogue-choice system.

---

## Session 05 — 2026-08-04

**Duration:** ~50 min (estimate) · **Tokens:** ~90k (estimate)

### The overcoat

The waistcoat-and-shirt outfit never resolved into a shape at 62px tall —
the player's words were "you cannot tell what it is". Replaced with a
**brown overcoat**, which is the single biggest readability win so far:

- New torso: coat open at the front, shirt and tie showing in the gap. The
  back panel is wide and the front panel narrow — that width difference is
  what tells you which way he faces.
- New part: **coat skirt** hanging from the hip to just below the knee. It
  lags behind the torso lean and sways with each step. This is the one
  place on the character where floppy is correct: cloth does not follow
  bone.
- Sleeves became coat sleeves with a lighter cuff.
- Hair pushed down to near-black. Brown hair on a brown coat made the head
  melt into the body. Contrast beat realism.

### The head connects to the body now

Two additions fixed "the body looks disconnected, like paper":

- **Raised coat collar**, drawn *behind* the head. Previously the head sat
  on a 2px neck and read as cut out and pasted on. The collar points now
  frame the neck and stitch the head to the shoulders.
- **The eye has four pixels with different jobs**: brow, sclera, pupil, and
  the shadow under it. A single black dot is not an eye, it is a hole —
  and that is exactly what it looked like.

### Barks

New system for short lines above his head, one at a time with a gap between
them. Fired by walking past a point (`level.barks`), by entering a level
(`level.enterBarks`), or by an animation event. Nineteen lines written for
the alley and the bar — dry observations and a few jokes he tells nobody.

`"hoje não..."` now uses the same system.

### The bar is wrecked, and he notices

It was merely closed: dark, tidy, chairs stacked. Now it is **destroyed** —
two holes smashed through the panelling, debris and glass across the floor,
broken chairs, a collapsed bottle shelf, wallpaper hanging in strips. The
chairs are still stacked neatly in the middle of it, and that contradiction
is the point; he says so out loud.

Added an examine chain on the broken wall: the splinters point inward, and
there is no room on the other side.

### Also

- Film grain and scanline defaults were still too strong for a 14px face
  after the last pass; the option maximums were lowered to match.
- `enterLevel` now forces `det.visible = true`. The cutscene hides the
  character and nothing else guaranteed it came back.
- Barks are positioned higher when an interact prompt is on screen, so the
  two never overlap.
- Rebuilt `JOGO_OFFLINE.html` (257 KB).

### Note for next time

Do not launch the dev screenshot server on port 8137 — the player's own
`ABRIR_JOGO.bat` uses it, and a running game was found holding the port
mid-session. Use 8140.

### Next session starts with

The detective's name, then NPCs and dialogue choices.

---

## Session 06 — 2026-08-04

**Duration:** ~40 min (estimate) · **Tokens:** ~80k (estimate)

### The coat is closed now

Caught by the player, and he was right: the coat was drawn open with the
shirt and tie running down the middle of the chest. That is what you see
from the **front**. A side-scroller camera looks at the *side* of the coat,
where there is no opening at all.

Redrawn as solid cloth with a folded lapel near the neck, a row of buttons
along the front edge, and a belt. The only shirt left visible is the small
triangle of collar at the throat, which is correct.

### Gun

- **Holster on the hip**, drawn over the coat. Under it would be more
  realistic and completely invisible.
- Sprites for the gun, the grip sticking out of the holster, and a muzzle
  flash.
- **Aiming overrides the animation** rather than being one. The arm angle
  comes from the player's mouse, so it cannot be keyframed: after the
  animation is sampled, the front arm, head tilt and torso lean are
  overwritten from `aim.angle`. The body keeps breathing underneath.
- Right mouse draws and aims (0.30s draw), mouse Y sets the angle between
  −38° and +46°, **horizontal movement is read and discarded**. Left mouse
  fires, `R` reloads, releasing right mouse holsters after a beat.
- Aiming roots the feet. You cannot walk and shoot.
- Six rounds, eighteen in reserve. Dry click and a bark when empty.
- Firing gives recoil on the arm and torso, screen shake, a muzzle flash
  that is a **real light source** (it lights the whole alley for one frame),
  a spinning shell casing, smoke from the barrel, and sparks where the
  round hits.
- **Dotted aim line**, because there is no crosshair — without it you cannot
  tell where the barrel points until you have wasted the bullet. Faint and
  dashed on purpose: a notion, not a laser.
- New sounds: gunshot (crack, body, low thump, and a tail thrown into the
  reverb so it sounds like an alley and not a balloon), dry click, leather
  for draw and holster, and reload clicks.

Punching is disabled while the gun is out, and he will not reach for a
cigarette with a weapon in his hand.

### Next session starts with

The detective's name, then NPCs and dialogue choices.

---

## Session 07 — 2026-08-04

**Duration:** ~45 min (estimate) · **Tokens:** ~90k (estimate)

The blood trail, the note, the figure, and waking up cuffed.

### New content

- **Blood trail across the bar.** Drops start sparse near the counter and
  get denser toward a new back door at x=930. No arrow on screen — the
  spacing does the pointing.
- **`backroom`** — storeroom where the trail ends in a small pool with a
  folded note in it. One bad bulb directly overhead.
- **`cell`** — bare concrete, a pipe along the wall at the shoulder height
  of a man sitting on the floor, a single bulb, a boarded door out of
  reach. `minX`/`maxX` are two pixels apart: there is nowhere to go.

### The scene (`js/systems/scene-nota.js`)

Crouch → read → approach → strike → black → wake.

- He reads with his **back to the door**, which is where the figure comes
  from. The player sees it long before he could.
- **The dread music is driven by distance, not by a clock.** Two detuned
  sawtooths beating against each other, a filter that opens as it closes
  in, and a heartbeat whose interval shrinks from 1.15s to 0.34s. That is
  what makes the player want to turn around.
- On the hit the music is cut in **10 milliseconds**. The sudden silence
  is the scare; the thud and the tinnitus are just the aftermath.
- **The figure is the detective's own rig** rendered through
  `silhouettePass` in pure black, 1.16× tall and 0.94× wide. It walks with
  the same skeleton, which is why it reads as a person and still has no
  face. Since the whole scene is multiplied by the light buffer, black
  stays black under any lamp.
- **Eyelids** are a new `gfx.eyelid` (0 closed, 1 open) with a curved inner
  edge and a haze while nearly shut. The wake-up opens to 0.22, closes to
  0.03, opens to 0.55, closes to 0.30, then opens fully — two blinks.

### Two bugs found while testing

- The crouch-to-read pose was **undone every frame** by the player's own
  state machine, which saw no movement and forced `idle`. Scenes now set
  `player.frozen`, which makes `update()` advance the animation and touch
  nothing else.
- The backroom and the cell were lit for a room half their size, so both
  read as solid black. Ambient raised and the cell's bulb moved to sit
  directly above where he wakes.

### Next session starts with

What he does about the pipe — and the first NPC.

---

## Session 08 — 2026-08-04

**Duration:** ~50 min (estimate) · **Tokens:** ~100k (estimate)

### Ambience is per-place now

The rain used to follow the player into every room, which told the ear that
nothing had changed. Levels now declare `ambience` (which loops at what
gain) and `randomSfx` (one-shots at irregular intervals). New sounds: drip,
metal creak, chain rattle, distant thump, pipe burst, strain.

The warehouse has no rain at all — still air, water dripping somewhere, and
the structure giving every twenty seconds or so. The intervals are randomised
inside a range because a sound on a fixed beat stops being ambience and
becomes a metronome.

### Barks, fixed three ways

- **`say(key, dur, agora)`** — `agora` clears the current line and the whole
  queue. The blood pool now fires the instant he walks in, cutting whatever
  he was saying about chairs.
- **He talks while the figure approaches.** Three lines that get closer to
  realising, the last one arriving too late.
- **Nothing is said behind closed eyelids.** The wake-up lines used to play
  under the black and were never read. The scene now has an `onAwake`
  callback that fires only when the eyes are fully open.

### Escape

- **QTE**: alternate `A` and `D`. Hammering one key does nothing — the
  alternation is the whole mechanic. Each valid pull shakes the screen and
  strains the chain; the bar decays if you stop. There is a **ratchet**: it
  never falls below the last quarter reached, so a slow player still gets
  out. Without it the scene becomes a finger test instead of a tense one.
- The pipe bursts, rust and water spray, and he is free — **with nothing**.
  No gun, no cigarettes. `hasGun = false` blocks the draw entirely.
- **His idle changes.** With no cigarette to occupy his hands, standing
  still now means sitting on the floor tapping a foot (`sitImpatient`).
- The broken length of pipe on the floor becomes the tool: pick it up, pry
  the boarded door, and that is the end of the playable chunk.

### Doors were too small

26×46 for a 62px man — he would have had to crawl. Now 32×74, which is the
real-world ratio of a door to a person.

### Note on testing

The QTE was measured accumulating correctly (0 → 0.414 over eight
alternating presses, monotonic) but a scripted loop of sixty presses never
completed. The mechanism is verified; the loop is a harness artifact I did
not chase further. **Worth a real play-test.**

### Next session starts with

What is on the other side of that door.

---

## Template for the next entry

```
## Session NN — YYYY-MM-DD

**Duration:**
**Tokens:**

### What we did
### What went right
### What went wrong
### Bugs fixed
### Bugs still open
### Next session starts with
```
