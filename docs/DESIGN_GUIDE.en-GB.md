# Carrot Click Game — UI/UX Design Guide

| Item | Details |
| --- | --- |
| Document version | **v1.1 — aligned with current MVP design** |
| Revised on | 2 November 2026 |
| Design direction | Bright, crisp pixel-art farm; mobile first; short, immediate feedback |
| Related documents | `PRD.en-GB.md` v1.2 · `GAME_LOGIC_DESIGN.en-GB.md` v1.1 |
| Status | Pre-implementation visual baseline; screens and touch interaction not yet device-tested |

> This document covers visual presentation and interaction principles. Refer to Game Logic Design for states and function responsibilities, and to the PRD for acceptance criteria. This guide **does not assume that objects are prevented from overlapping**.

## 1. Design objectives

- Make the **START → harvest every carrot → see success/failure → RESTART** journey immediately understandable to a first-time player.
- Establish the portrait mobile layout **first**, then use separate artwork and layout rules for wider screens.
- Use a distinctive pixel-art title and farm background while keeping interactive elements, remaining time and the carrot counter legible.
- Respond immediately to carrot harvesting and bug clicks. Fast gameplay takes priority over decorative animations.
- Use English for in-game UI; maintain the specification in Korean and British English.

## 2. Design tokens

### 2.1 Colours

| Token | HEX | Primary usage |
| --- | --- | --- |
| **Ivory** | `#FFF3D3` | Bright timer, carrot counter and button lettering |
| **Ink** | `#26342D` | Text outlines, button borders/shadows and result messages |
| **Farm Green** | `#2B6243` | START and RESTART button backgrounds |

- The sky, soil and plants use the palettes already present in the pixel-art assets. The colours above are the **shared interactive UI palette**.
- Render HUD labels in Ivory with a **crisp, dark Ink-coloured text shadow or outline**, so they remain legible against varying sky colours.
- Apply a dark translucent overlay to **only the lower farm-field portion**, not the upper HUD. Adjust opacity against the actual background to preserve contrast.

### 2.2 Typography

- HUD, buttons and supporting text: **Pixelify Sans**, primarily **Bold**, with a fallback typeface if the font does not load.
- Main game title: a **separate graphical asset** because its decoration is integral to the design. Do not attempt to redraw its lettering with ordinary text styling.
- The **success and failure titles are embedded in their respective frame images**. The short supporting message and RESTART label below them remain live text.
- Adjust font size, line spacing and shadows until the `MM:SS` timer and remaining count are easy to distinguish on small screens. Final dimensions are subject to browser checks.

## 3. Layout and responsive rules

### 3.1 Basic principles

| Item | `compact` (default) | `wide` |
| --- | --- | --- |
| Viewport selection | **Below 768px** | **768px or more** |
| Board aspect ratio | **3:4** | **4:3** |
| Maximum board dimensions | **360×480 CSS px** | **800×600 CSS px** |
| Carrots | **5** | **10** |
| Bugs | **5** | **15** |
| Proposed carrot size | 52×52 CSS px | 64×64 CSS px |
| Proposed bug size | 44×44 CSS px | 52×52 CSS px |

- **Mobile first:** style `compact` by default, applying wide overrides at 768px and above. Do not use device type or touch support to choose the layout.
- Preserve each board's aspect ratio, fit it within the available space where possible, and do not exceed the stated maximum dimensions.
- The `READY` preview may change between compact and wide as the viewport changes.
- **On START or RESTART, lock the actual board dimensions and layout.** Resizing in PLAYING, WON or LOST must not recalculate the background, board size, object coordinates, sizes or counts. Allow page scrolling if some of the fixed board falls outside the viewport.
- Target a minimum viewport width of **320 CSS px**. Test button visibility and scrolling on small screens and after portrait/landscape changes.

### 3.2 Screen composition

The board is organised visually into three areas:

1. **Upper sky / HUD:** centre the graphical title, with the timer and remaining-carrot count arranged below it. In READY, show only the title from this HUD group.
2. **Lower farm field:** contains the Spawn Area where carrots and bugs are generated. Their placement should visually correspond to the cultivated soil in the background.
3. **State-specific UI:** display START in READY; in WON/LOST, show a darkened lower-field overlay, the dedicated result artwork, a short message and RESTART.

The result overlay **darkens and blocks interaction with the lower field only**, keeping the HUD visible. Do not display START and the result panel simultaneously.

### 3.3 Spawn Area — provisional background-relative boundaries

The percentages below specify a **candidate placement rectangle relative to the entire board image**. `(0, 0)` is the top-left of that rectangle.

| Boundary | `compact` | `wide` |
| --- | --- | --- |
| Left | 14% | 13% |
| Top | 50% | 47% |
| Right | 86% | 87% |
| Bottom | 85% | 85% |

- These percentages are **positions relative to overall board width/height**. Right and bottom are end coordinates, not width and height values.
- Verify that the rectangle aligns with the cultivated ground in each actual background image; adjust it if required.
- All objects must fit **entirely within the Spawn Area**. The lower field darkened by the result overlay need not be the exact same rectangle.

## 4. Images and object presentation

### 4.1 Backgrounds and sprites

- Use **different background images** for the 3:4 compact and 4:3 wide layouts. Avoid stretching or arbitrarily cropping a single image to cover both.
- Use independent carrot and purple bug sprites, preferably with transparent backgrounds.
- Preserve pixel-art proportions and apply `image-rendering: pixelated` where appropriate. Inspect edges for excessive blurring on representative devices.
- Treat **source image resolution** and **CSS display size** separately. Prepare source assets with sufficient detail for their intended displayed size and confirm their appearance in a browser.

### 4.2 Visual placement rules

- `createCarrots(count)` and `createBugs(count)` each handle **both element creation and random positioning**. At game start they receive `game.carrotCount` and `game.bugCount` respectively; only `carrotCount` decreases after harvesting.
- Every object must fit **completely within** the Spawn Area. Maximum horizontal position is `field width − object width`; maximum vertical position is `field height − object height`.
- There are **no overlap checks, collision avoidance rules or placement retries**. Sprites may overlap fully; only the topmost element actually hit-tested by the browser responds.
- The previous **20% maximum overlap** and **guaranteed visible 44×44px area for each carrot** have been removed from the current MVP. This is an **acknowledged playability limitation**, not evidence that the arrangement has passed quality testing.

## 5. HUD and state-specific screens

| State | Show | Hide / disable |
| --- | --- | --- |
| **READY** | Graphical title, START | Timer, carrot count, objects and result panels hidden; no BGM |
| **PLAYING** | Title, countdown from `00:30`, remaining count, carrots and bugs | START and result panels hidden |
| **WON** | Final time, carrot count `0`, dedicated success frame, short message, RESTART | Disable object clicks; stop timer and BGM |
| **LOST** | Final time, remaining carrot count at loss, dedicated failure frame, short message, RESTART | Disable object clicks; stop timer and BGM |

- Read HUD values directly from the game data. The **remaining-carrot count uses `game.carrotCount`**; no additional `remainingCarrots` value is maintained.
- Convert `remainingTimeSec` into `MM:SS` for display. Preserve the final value after the game ends.
- Information hierarchy: **title → time → carrots remaining**. Although the title is decorative, its scale and spacing must not overwhelm the timer or counter.

## 6. Buttons and input feedback

### 6.1 START / RESTART

| Attribute | Rule |
| --- | --- |
| Background | Farm Green `#2B6243` |
| Text | Ivory `#FFF3D3`, Pixelify Sans Bold |
| Border | Ink `#26342D`, **4px**, angular pixel-art styling |
| Shadow | Solid, crisp Ink-coloured offset shadow |
| Hover (where supported) | Move **up by 2px** from the default position |
| Active (press) | Move **down by 3px** from the default position |
| Transition | About **100ms**; a short stepped (`steps(...)`) transition is acceptable |
| Focus-visible | Clear, visible outline for keyboard focus |

- Do not depend on hover feedback for mobile. Touch interactions must respond immediately.
- Match the visual button area to its actual clickable/tappable area and provide at least **44×44 CSS px** of target space.
- Prevent accidental duplicate START/RESTART behaviour from repeated input.

### 6.2 Object clicks

- When a carrot is clicked, **remove its sprite from the screen immediately**. Do **not** use the previous 120ms shrink/pop animation.
- Communicate a successful harvest through the **sprite disappearing + counter updating + harvest effect**.
- A bug click immediately enters LOST, using the failure panel and outcome sound for feedback. No dedicated bug sound or bug-removal animation is required.
- Mouse and touch must follow the same game rules.

## 7. Success and failure results

### 7.1 Shared structure

- Display a translucent dark overlay across **only the lower farm field**. Keep the upper HUD readable.
- Position a **short supporting message** and RESTART button with the central result artwork.
- Maintain **two distinct frame image assets**, one for success and one for failure. Do not duplicate the title as additional live HTML text over the artwork.
- While the panel is shown, block interaction with the underlying objects.

### 7.2 Frame variants

| Item | WON | LOST |
| --- | --- | --- |
| Frame asset | **Dedicated success artwork** | **Dedicated failure artwork** |
| Decoration | Carrots, bright colouring and **rays rising above the title** | Bugs, darker colouring and **dark diagonal hatching above the title** |
| Title | Success heading included in image | Failure heading included in image |
| Shared controls | Short message + RESTART | Short message + RESTART |

Use concise English copy. Examples: “All carrots collected!” for WON and “Try again!” for LOST. Final wording can be settled during implementation.

## 8. Audio UX

| Event | BGM | Sound effect |
| --- | --- | --- |
| READY | No playback | None |
| START | **Loop from the beginning** | Start effect |
| Carrot harvest | Continue playing | Harvest effect (may finish after DOM removal) |
| WON | Stop | Success effect; may briefly overlap the final harvest |
| LOST (bug or timeout) | Stop | Failure effect; no separate bug sound |
| RESTART | **Loop from the beginning** | **Stop all previous effects**, then play the restart effect |

- Manage BGM with `playBGM()`/`stopBGM()`, and one-shot effects with `playSound(type)`/`stopAllSounds()`.
- Do not abruptly stop the final harvest sound on normal game completion. **Clean up every sound from the previous round when RESTART is pressed.**
- Aim for result effects of approximately **3–4 seconds**. Audio playback being blocked by the browser must not stop game progression.

## 9. Motion and transitions

- **Carrot harvest:** **no animation**. Immediately remove the DOM element, update the counter and play the sound.
- **Result panel:** an approximately **120ms fade-in** may be applied. Rays and dark hatching are **static details incorporated in the frame assets**.
- **Buttons:** short hover/press responses of about 100ms. Never prioritise decoration over legibility or click responsiveness.
- **Reduced motion:** where users request reduced motion, remove or minimise non-essential panel fades and button movement. Convey states and outcomes immediately regardless.

## 10. Responsive and accessibility checklist

- [ ] No overlapping or clipped HUD text in compact (320px/360px) or wide (768px boundary/800px+)
- [ ] Title and result frame artwork remain proportional and crisp
- [ ] START/RESTART meet minimum touch target requirements and show hover, active and keyboard focus states appropriately
- [ ] Each layout creates the correct numbers of carrots and bugs fully inside the Spawn Area
- [ ] Resizing during a round leaves the board locked; scrolling is possible when required
- [ ] Results darken only the lower field, preserve the HUD and block object interaction
- [ ] Harvesting removes a carrot **immediately, without animation**, and updates the count
- [ ] Result-effect overlap is permitted; RESTART stops all old sound effects
- [ ] UI remains usable with `prefers-reduced-motion`, muted audio or browser playback restrictions
- [ ] Record unwinnable rounds caused by complete overlaps as a **known MVP limitation**

## 11. Asset production and organisation

Recommended project structure (final filenames to be chosen during implementation):

```text
assets/
  images/
    backgrounds/     # compact / wide backgrounds
    sprites/         # carrot / bug
    ui/              # game title / success frame / failure frame
  audio/
    bgm/             # looping game music
    sfx/             # start / restart / carrot / win / lose
```

- Keep two backgrounds, two sprites, one title graphic and **one separate frame for each outcome**.
- Result artwork should include **both title and decoration**. Adding independent CSS decoration around a shared base frame would not match this design baseline.
- Source graphics may be stored at a higher resolution than their final CSS display size. Check for blur and uneven pixel scaling in real browsers.
- Make meaningful title and outcome information accessible through suitable alternative or accompanying text rather than relying on images alone.
- Verify rights and attribution for sound and font assets; where practical, keep original source files distinct from project-ready exports.

## 12. Revision history and implementation baseline

| Version | Changes |
| --- | --- |
| v1.0 | Previous pixel-art UI/UX guide |
| **v1.1** | Mobile-first compact default, locked per-round layout, `carrotCount` display, simplified object creation/placement, **removed overlap validation**, **removed carrot harvest animation**, dedicated success/failure frames, and RESTART clean-up of all effects |

**Implementation note:** The proportional Spawn Area boundaries and proposed display sizes are baselines awaiting visual testing. After adjusting them, synchronise the corresponding requirements in `PRD.en-GB.md` and `GAME_LOGIC_DESIGN.en-GB.md`.
