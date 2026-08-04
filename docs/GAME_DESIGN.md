# THE MIDNIGHT CALL — Game Design Document

> Working title (PT): *Chamado da Meia-Noite*
> Genre: side-scrolling investigative survival horror
> Platform: HTML5 / Canvas 2D, runs offline from a local server
> Target length: **~5 hours** main path, ~6h with optional content
> Status: **v0.1 — vertical slice** (menu, opening cutscene, alley, bar)

---

## 1. The pitch

A bankrupt private detective gets a phone call at 2:14 in the morning. A
woman with no name gives him an address: a bar that closed six years ago.
He has nothing left to lose, so he goes.

The case is real. The city is real. Everything he meets inside the case is
not — the enemies are his own fears wearing the shapes of people he failed.
Every "monster" in this game is a memory that learned to walk.

**Design north star:** the horror is not the monster in the room. It is the
five minutes of quiet before you find out the room was always empty.

**References the player should feel:** *Silent Hill 2* (guilt as level
design), *The Evil Within* (protagonist, tone, the visual language of a
worn-down detective), *2Dark* (crushed blacks, dirty amber, dry red),
*Hope 01* / *Urban Detective* (side-scrolling pixel presentation).

---

## 2. Protagonist

**Name:** *(to be decided — placeholder "the detective")*

Visually modelled on the Sebastian Castellanos references in
`assets/reference/`: dark short hair, white dress shirt gone grey, dark
blue-grey waistcoat, dry red tie, holster straps, grey trousers, worn
boots. Late thirties, physically capable but not heroic — he throws two
punches and then he needs a wall.

**Characterisation through animation, not text.** His idle animation is the
whole character in ten seconds: he pulls a cigarette from his pocket, puts
it in his mouth, flicks the lighter, holds the flame — and then changes his
mind, closes the lighter, takes the cigarette out and throws it away. He
quit. He keeps carrying them anyway. He does this every time the player
stands still long enough, and the game never comments on it.

---

## 3. Core loop

```
   WALK / RUN  ->  LOOK AT THINGS  ->  TALK TO PEOPLE  ->  UNDERSTAND
        ^                                                       |
        |                                                       v
   HIDE / RUN  <-  THE PLACE TURNS  <-  A MEMORY GETS LOOSE  <--+
```

1. **Explore** a small, dense, side-scrolling location.
2. **Examine** everything — every prop has an internal monologue line.
   Monologue is the primary storytelling channel.
3. **Talk** — branching dialogue with the few living people left.
4. **Connect** — the journal/case board turns facts into deductions.
5. **Survive** — when a deduction lands, the world shifts. In nightmare
   sections there is no winning a fight, only outlasting it.

Combat exists but is deliberately bad: two punches, slow, and it does not
solve the game. It is there so the player *tries* it and learns it is not
the answer.

---

## 4. Full timeline (~5 hours)

Times are main-path estimates for a first-time player.

### ACT I — THE CALL  (≈50 min, ~90% dialogue and exploration)

| # | Chapter | Location | Length | What it delivers |
|---|---------|----------|--------|------------------|
| 1 | *The man who answered* | Back alley → The Last Dime bar | 12 min | **[BUILT]** Movement, camera, examine, doors. Ends with the wall phone: cord cut years ago. So who called? |
| 2 | *Names on paper* | The detective's office | 15 min | First NPC: **Marguerite**, the landlady who has not been paid in five months. Introduces the journal and the case board. |
| 3 | *The woman who called* | Rowan Street apartment, 3F | 15 min | Long conversation with **the client** (unnamed until Act III). Player choices set the first flags. Ends with the first "slip": the hallway is 40 metres longer on the way out. |
| 4 | *Nobody walks home* | Night street | 8 min | Tutorial for the nightmare state. No enemy yet — only the sound of one. |

### ACT II — THE HOUSE THAT BURNED  (≈70 min)

| # | Chapter | Location | Length | What it delivers |
|---|---------|----------|--------|------------------|
| 5 | *Ash* | The burned house (his) | 18 min | First enemy: **the Smoke** — a shape that only moves when you are not looking at it. Introduces hiding. |
| 6 | *The neighbour* | Cul-de-sac, three houses | 15 min | Dialogue hub. Three NPCs, contradicting testimony. First real deduction puzzle. |
| 7 | *Seven years* | Playable memory | 20 min | Flashback. The player controls him **before** — different colours, different walk cycle, no cigarette animation. |
| 8 | *The first door* | Threshold hub | 17 min | The nightmare hub is established. Introduces sanity and the lighter as a light source. |

### ACT III — WHAT HE DID  (≈80 min)

| # | Chapter | Location | Length | What it delivers |
|---|---------|----------|--------|------------------|
| 9 | *Precinct* | Police station, night shift | 20 min | Old colleagues. Best dialogue set-piece in the game: four people, one lie, no combat. |
| 10 | *The hospital of quiet rooms* | Abandoned wing | 25 min | Peak horror. Stealth-heavy. Enemy: **the Nurse of Small Corrections**. |
| 11 | *The Tallow Man* | Chase gauntlet | 15 min | Boss as a chase, not a fight. |
| 12 | *Confession* | A single room | 20 min | Dialogue only. The player decides what he admits. Locks the ending branch. |

### ACT IV — THE MIDNIGHT CALL  (≈70 min)

| # | Chapter | Location | Length | What it delivers |
|---|---------|----------|--------|------------------|
| 13 | *The bar again* | The Last Dime, changed | 18 min | Same level as Chapter 1, re-lit and re-dressed. Payoff for every prop the player examined in the first ten minutes. |
| 14 | *The long hallway* | Gauntlet | 22 min | Every enemy type returns at once. |
| 15 | *Who answered* | The room with the phone | 20 min | Final confrontation. He is on both ends of the line. |
| 16 | *Endings* | — | 10 min | **Three endings:** *Answer* / *Hang up* / *Let it ring*. Determined by Chapter 12 plus how many case files were found. |

### Optional (≈30–45 min)
- 12 **case files** hidden across the game (each is a page of the real story).
- 4 optional rooms that only open if specific dialogue choices were made.
- New Game+: the cigarette animation changes. That is the whole reward.

---

## 5. Systems roadmap

| System | State | Notes |
|--------|-------|-------|
| Low-res render pipeline (480×270, lights, bloom, grain, vignette) | **done** | `js/core/gfx.js` |
| Skeletal pixel-art character rig | **done** | `js/art/detective.js` |
| Walk / run / punch combo / interact / idle-smoke | **done** | |
| Camera with look-ahead | **done** | `js/world/camera.js` |
| Parallax level system + materials library | **done** | `js/world/` |
| Rain, fog, particles, dust | **done** | `js/world/fx.js` |
| Procedural audio (rain, wind, steps, punches, doors, lighter, music) | **done** | `js/core/audio.js` |
| Dialogue box, typewriter, subtitles, prompts | **done** | speaker + choices ready, choices unused so far |
| 3-slot save with thumbnails | **done** | `js/core/save.js` |
| Title menu, pause menu, options, PT/EN | **done** | |
| Opening cutscene driven by narration audio | **done** | |
| **NPCs** (portraits, idle behaviour, talk state) | next | |
| **Dialogue choices + flags** | next | data format already supports it |
| **Journal / case board** | next | the deduction verb |
| **Inventory** | later | small, 6 slots, mostly key items |
| **Sanity** | later | drives the post-processing, not a bar on screen |
| **Enemies + AI + chases** | later | |
| **Hiding** | later | |
| **Gun: draw, aim, fire, reload, ammo** | **done** | right mouse aims, mouse Y sets the angle, aiming roots you |
| **Barks** (short lines above the head) | **done** | `level.barks` / `level.enterBarks` |

---

## 6. Technical architecture

```
index.html          shell + crash screen
css/style.css       black frame, nearest-neighbour scaling
js/
  main.js           state machine: BOOT -> MENU -> CUTSCENE -> PLAY / LAB
  i18n.js           EVERY user-visible string, PT + EN, plus narration timings
  core/
    gfx.js          480x270 buffers, light buffer, bloom, grain, present()
    text.js         system font -> hard-edged "bitmap" text, cached
    input.js        keyboard behind action names
    audio.js        WebAudio synthesis + narration loader
    save.js         3 slots, versioned, localStorage
  art/
    palette.js      the closed palette
    pixel.js        ASCII grid -> canvas, rotation, rim light, dithering
    detective.js    parts, skeleton, animations, prop state
  world/
    camera.js       side-scrolling follow camera
    materials.js    brick, asphalt, wood, props — build-time only
    levels.js       buildAlley(), buildBar(), buildRoad(), buildCar()
    fx.js           rain, fog, particles, dust motes
  systems/
    player.js       movement + state machine
    dialogue.js     dialogue box, subtitles, prompts, location cards
    cutscene.js     the opening
  ui/
    menu.js         title screen (it is a live scene, not a poster)
    pause.js        pause + save
    panels.js       slot picker + options, shared by menu and pause
```

### Two rules that keep the look consistent

**1. Draw order is always: world → LIGHT → interface.**
The scene is multiplied by the light buffer. Anything drawn before
`gfx.endLights()` gets darkened; anything after stays at full brightness.
UI must come after. Weather and fog come *before*, on purpose — that is why
rain only glows inside lamp cones.

**2. Everything is painted brighter than it "should" be.**
Ambient light is 20–25%, so a realistically-coloured dark coat becomes a
black hole. Every palette entry is pushed up. If a new asset disappears
into the background, the fix is almost always the palette, not the light.

### The character rig

The detective is not a sprite sheet. He is nine little pixel-art pieces
rotating around joints, driven by interpolated key poses. That is what gives
60 fps motion out of hand-authored art. Consequences worth remembering:

- `drawImage` with `imageSmoothingEnabled = false` under rotation gives
  nearest-neighbour sampling, so rotated limbs stay crunchy.
- Angles are in degrees, **positive = forward** (toward the facing side).
- Foot angles are authored in *world* space (0 = flat on the ground); the
  rig subtracts the thigh and shin rotations automatically.
- Reaching for the face needs a **small** shoulder angle (10–16°) and a
  nearly folded elbow (−170°). Raising the shoulder pushes the hand away.
- A sprite sheet can replace all of this later by reimplementing
  `Detective._renderRig()`. Nothing else in the game touches it.

---

## 7. Content authoring guide

### Adding a line of dialogue
1. Add the key to `LINES` in `js/i18n.js` with `pt` and `en`.
2. Point an interactable at it: `{ x, y, w, h, prompt: 'prompt_look', lines: 'my_key' }`.

### Adding a prop to a level
Write a function in `js/world/materials.js` that draws into a context. It
runs once at level build time, so it can be as expensive as you like — use
thousands of 1px rectangles for grime, rust, cracks. Then call it from
`buildAlley()` / `buildBar()`.

### Adding a light
Push into the level's `lightDefs`:
`{ x, y, r, color, i, flick: 'bulb' | 'neon' | 'swing' | undefined }`.
World coordinates. `addLights()` converts to screen automatically.

### Adding an animation
Add an entry to `ANIM` in `js/art/detective.js`: `dur`, `loop`, `keys`
(normalised `t` from 0 to 1), optional `events`. Then check it in the
**Test Room** (main menu → SALA DE TESTE, arrow keys cycle animations).

---

## 8. Controls

| Key | Action |
|-----|--------|
| A / D or ← / → | Walk |
| Shift (held) | Run |
| E | Interact / advance dialogue |
| J or Space | Punch (press twice for the second hit) |
| Esc | Pause (in-game) / back (in menus) |
| Esc or Enter (**hold**) | Skip the opening cutscene |
| Delete | Erase the highlighted save file |
| F1 | Debug overlay |

**Test Room extras:** ← / → change animation, Z / X change playback speed,
C toggles the skeleton, V flips facing, F toggles the free camera.

---

## 9. Open design questions

- The detective's name. Everything else can be built around a placeholder;
  this one gets baked into ~20k words of dialogue, so it should be decided
  before Act I dialogue is written.
- Whether the client is real. Current plan: she is, but the phone call was
  not. This needs to be locked before Chapter 3.
- Whether the game has any music at all outside the menu, or only room
  tone. Current lean: room tone, with music reserved for three moments.
- Voice acting scope. The opening narration exists; if the whole game is
  narrated the writing has to change shape considerably.
