# Carrot Click Game — UI/UX Design Guide

| Item              | Details                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| Document version  | **v1.2 — retains the v1.1 MVP decisions and restores detailed design specifications from v1.0**     |
| Last revised      | 2026-11-03                                                                                          |
| Design direction  | Bright, crisp pixel-art farm; mobile first; fast, immediate feedback                                |
| Related documents | `PRD.en-GB.md` v1.2 · `GAME_LOGIC_DESIGN.en-GB.md` v1.1                                             |
| Status            | Pre-implementation design baseline; visual and touch behaviour still require browser/device testing |

> This guide specifies the visual layout and user interaction conventions. Game states and function responsibilities are documented in Game Logic Design; functional acceptance criteria are documented in the PRD. **Where older PRD requirements differ from the agreed MVP decisions (no overlap checking; instant carrot removal), follow the current MVP decisions in this guide and Game Logic Design, and flag the PRD for a separate revision.**

## 1. Design goals

- Let first-time players understand **START → collect all carrots → success/failure → RESTART** without explanation.
- Build the **portrait, compact layout first**, then use a separate wide background and layout for wider viewports.
- Let the large pixel-art title and farm scene establish the mood without compromising the legibility of controls, time and remaining carrot count.
- Respond to carrot collection and failure immediately. Prioritise short rounds over decorative animation.
- Keep the game's visible UI in English and maintain the design documentation in Korean and British English.
- Use **one continuous farm background** for the board and sky HUD; do not add a separate solid-colour header strip.
- Preserve the chosen board dimensions and object arrangement throughout a round, even if the browser window is resized.
- Result screens contain one short outcome message and one `RESTART` button, without extra statistics or controls.

## 2. Design tokens

### 2.1 Colours

| Name           | CSS token       | HEX       | Main use                                                         |
| -------------- | --------------- | --------- | ---------------------------------------------------------------- |
| **Ivory**      | `--color-ivory` | `#FFF3D3` | Timer, carrot count and button lettering                         |
| **Ink**        | `--color-ink`   | `#26342D` | Lettering outlines, button borders and shadows, outcome messages |
| **Farm Green** | `--color-green` | `#2B6243` | START and RESTART button backgrounds                             |

- The sky, soil, crops and decorations retain the colours of their pixel-art assets. These **three colours** are the core CSS UI palette.
- Give HUD lettering an Ivory fill and a crisp Ink outline against the sky. The **initial CSS technique is multi-directional `text-shadow` with 1px offsets and zero blur**; verify that it does not make the pixel lettering muddy.
- Outcome messages use **Ink**. Buttons use a Green background, Ivory lettering, a **4px Ink border** and a **4px hard-edged Ink shadow**. Decoration already included in the result-frame artwork does not require extra UI colour tokens.
- Darken the **lower farm/play area only** when showing a result. Keep the upper HUD fully readable.

### 2.2 Typography — typeface and displayed sizes

- Use **Pixelify Sans**, **700 (Bold)**, for HUD text, short outcome messages and buttons, with `sans-serif` as the fallback. The game UI language is English; button labels are `START` and `RESTART`.
- Render the **main game title using its own image asset**. The success and failure headings are **already part of their respective frame images**; do not render duplicate HTML headings. The short supporting message and RESTART label are real text.
- The following values **restore the original v1.0 CSS size guidance**. They are starting points, not measurements validated against the final composite layouts.

| Element                            | `compact` (mobile-first) |            `wide` | Colour and treatment   |
| ---------------------------------- | -----------------------: | ----------------: | ---------------------- |
| Timer (`MM:SS`)                    |           **24px / 700** |    **28px / 700** | Ivory with Ink outline |
| Remaining carrot count             |           **20px / 700** |    **24px / 700** | Ivory with Ink outline |
| Success/failure supporting message |        **20–26px / 700** | **22–30px / 700** | Ink                    |
| START button label                 |           **20px / 700** |    **22px / 700** | Ivory                  |
| RESTART button label               |           **18px / 700** |    **20px / 700** | Ivory                  |

- Arrange the central sky HUD in **three centred lines**, in this order: title image → timer → remaining carrots. Only the title is shown in READY.
- Display the timer in `MM:SS`; check **tabular numerals or equivalent alignment** so changing digits do not cause visual movement.
- The precise **display width and height of the title image, line-height, spacing between HUD elements and final message size** remain unconfirmed. Validate them with the actual background and frame assets.

## 3. Layout and responsive rules

### 3.1 Baseline

| Item                              | `compact` (default) | `wide`             |
| --------------------------------- | ------------------- | ------------------ |
| Viewport condition                | **Below 768px**     | **768px or above** |
| Board aspect ratio                | **3:4**             | **4:3**            |
| Maximum board dimensions          | **360×480 CSS px**  | **800×600 CSS px** |
| Default horizontal outside margin | **16px**            | **24px**           |
| Carrot count                      | **5**               | **10**             |
| Bug count                         | **5**               | **15**             |
| Carrot display size (provisional) | 52×52 CSS px        | 64×64 CSS px       |
| Bug display size (provisional)    | 44×44 CSS px        | 52×52 CSS px       |

- **Mobile first:** Write CSS for compact by default and apply wide-specific changes at 768px and above. Do not infer layout from device labels or touch capability.
- The board is **one centred farm background containing the sky HUD**. Do not add a separate solid-colour header band.
- Keep the specified aspect ratio, scale the board to the available space before play, and do not exceed its maximum dimensions.
- In `READY`, the compact/wide preview may respond to changes in viewport width.
- **At START or RESTART, choose and lock the layout and rendered board dimensions.** In PLAYING, WON and LOST, resizing must not recalculate the **background, board size, object positions, sprite dimensions, counts or stacking order**. Allow **vertical and horizontal page scrolling** if needed, while **the countdown continues**.
- Target a minimum viewport width of **320 CSS px**. Verify touch access, scrolling and possible clipping on short screens and after orientation changes.

### 3.2 Screen composition

The board consists of three visual regions:

1. **Upper sky / HUD:** Three **centrally aligned lines** in the open sky (title image → timer → remaining carrots). Show only the title in READY; do not use an independent header background.
2. **Lower farm field:** Contains the Spawn Area for carrots and bugs. The buildings, well, fences, grass and other farm scenery are **background decoration**, not spawn targets. Objects should appear naturally placed on the soil plot.
3. **State-specific UI:** READY shows START. WON/LOST show a darkened lower field, the appropriate result-frame image, a short message and RESTART.

On result screens, darken and block interaction with the **lower field only**; keep the HUD readable. Never show START and the result panel together.

### 3.3 Spawn Area — provisional bounds relative to the background

These are **candidate** percentage co-ordinates relative to the entire rendered board. The Spawn Area's own top-left corner is `(0, 0)` for object placement.

| Boundary | `compact` | `wide` |
| -------- | --------- | ------ |
| Left     | 14%       | 13%    |
| Top      | 50%       | 47%    |
| Right    | 86%       | 87%    |
| Bottom   | 85%       | 85%    |

- Each value is relative to the **full board width or height**. Right and Bottom describe far edges, not the width or height of the Spawn Area.
- Validate these bounds against the real soil region. Do not stretch or crop the background in a way that invalidates them.
- The Spawn Area must contain **each complete object**. It does not have to be identical to the larger lower-field region covered by the result overlay.

## 4. Image and object presentation

### 4.1 Backgrounds and sprites

- Use separate **3:4 compact** and **4:3 wide** farm background images. Do not distort or arbitrarily crop a single image to serve both layouts.
- Use separate, preferably transparent sprites for the carrot and the purple bug.

| Asset                     | Earlier working filename | Source resolution | Aspect ratio |
| ------------------------- | ------------------------ | ----------------: | ------------ |
| `wide` farm background    | `bg-wide.webp`           |    **1200×900px** | 4:3          |
| `compact` farm background | `bg-compact.webp`        |     **720×960px** | 3:4          |
| Carrot sprite             | `carrot.png`             |     **128×128px** | 1:1          |
| Purple bug sprite         | `bug.png`                |     **104×104px** | 1:1          |

- Preserve pixel-art proportions. Compare real rendering before deciding where `image-rendering: pixelated` should be applied; look for blurry or damaged edges.
- Treat **source image resolution** separately from **CSS display size**. Keep sufficient source pixel detail and check sharpness at the intended CSS sizes.
- Inspect **alpha transparency and transparent padding** within the sprites against their actual pointer hit areas.

### 4.2 Sprite sizes and hit areas

| Object | `compact` initial display size | `wide` initial display size | Minimum display/interaction rectangle |
| ------ | -----------------------------: | --------------------------: | ------------------------------------: |
| Carrot |               **52×52 CSS px** |            **64×64 CSS px** |                      **44×44 CSS px** |
| Bug    |               **44×44 CSS px** |            **52×52 CSS px** |                      **44×44 CSS px** |

- Each object has a **rectangular hit area**. Both sprite and hit area must be completely inside the Spawn Area.
- The **44×44px minimum display/interaction size remains**, but the older requirement that each carrot retain its own **unobstructed 44×44px clickable region is excluded from the MVP**. These are separate requirements: complete overlaps are now possible.
- At an overlap, the object **visually on top** at the clicked position receives the interaction.

### 4.3 Visual placement rules

- `createCarrots(count)` and `createBugs(count)` each **create their DOM elements and assign random positions in the same function**. Pass `game.carrotCount` and `game.bugCount` at the start of a round; only `carrotCount` decreases as carrots are collected.
- Keep entire objects inside the Spawn Area. Maximum horizontal placement is `field width − object width`; maximum vertical placement is `field height − object height`. Use the Spawn Area's top-left corner as the co-ordinate origin.
- **Do not perform overlap checking, collision prevention or placement retries** in the MVP. Sprites may overlap completely; the browser's actual topmost target determines which object receives a click.
- Establish positions and stacking order **once at the beginning of each round**. Do not move or redistribute objects during play. Remove only collected carrots from the DOM, immediately.
- The older **20% overlap limit** and **independent unobstructed 44×44px carrot area** are explicitly removed from the current MVP. This is a **known playability risk**, not a verified safe arrangement.

## 5. HUD and screens by state

| State       | Visible content                                                                       | Hidden or disabled                                           |
| ----------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **READY**   | Title image, START button                                                             | Timer, carrot count, objects and result panel hidden; no BGM |
| **PLAYING** | Title, timer counting down from `00:30`, remaining carrots, carrots and bugs          | START and result panel hidden                                |
| **WON**     | Frozen time, `0` carrots remaining, success frame, short message, RESTART             | Object interaction disabled; timer and BGM stopped           |
| **LOST**    | Frozen time, remaining carrot count at failure, failure frame, short message, RESTART | Object interaction disabled; timer and BGM stopped           |

- Render HUD values from the game data. **Use `game.carrotCount`** for remaining carrots; do not add a separate `remainingCarrots` field.
- Format `remainingTimeSec` as `MM:SS`. Preserve the displayed number when the round ends.
- The visual hierarchy is **title → time → carrots**. Keep enough spacing to distinguish the timer and counter from the decorative title.

## 6. Buttons and input feedback

### 6.1 START / RESTART buttons

| Display size and position | `compact`                                              | `wide`                                                 |
| ------------------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| START width               | **Up to 200px**                                        | **220px**                                              |
| START height              | **48px**                                               | **52px**                                               |
| RESTART width             | **Fits available inner width of result frame**         | **Fits available inner width of result frame**         |
| RESTART height            | **48px**                                               | **48px**                                               |
| START position            | **Centre of the game screen**; check against title/HUD | **Centre of the game screen**; check against title/HUD |
| RESTART position          | **Centred inside result panel**                        | **Centred inside result panel**                        |

| Property                         | Rule                                                                  |
| -------------------------------- | --------------------------------------------------------------------- |
| Background                       | Farm Green `#2B6243`                                                  |
| Text                             | Ivory `#FFF3D3`, Pixelify Sans Bold                                   |
| Border                           | Ink `#26342D`, **4px**, crisp pixel styling                           |
| Shadow                           | Hard, unblurred Ink shadow, **4px to the right and down** by default  |
| Hover (devices supporting hover) | Move **2px upwards** from default                                     |
| Active (while pressed)           | Move **3px downwards** from default                                   |
| Transition                       | Approximately **100ms**; use `steps(2, end)` as the initial treatment |
| Focus-visible                    | Clearly visible keyboard focus outline                                |
| Corners                          | Sharp pixel styling; **border-radius: 0**                             |

- Lengthen the shadow to match hover movement and shorten it while pressed to create a tactile feel. Under `prefers-reduced-motion: reduce`, remove unnecessary movement and transitions.
- Do not depend on hover for touch devices; taps must respond immediately.
- Make the visible button match its actual clickable/tappable area, with a minimum target size of **44×44 CSS px**.
- Avoid duplicate START or RESTART processing from repeated input.

### 6.2 Object clicks

- On a successful carrot click, **remove the sprite from the DOM immediately**. Do **not** use the older 120ms shrink/pop animation.
- Feedback consists of **the carrot disappearing + the count updating + the harvest effect sound**.
- A bug click enters LOST immediately, with a failure effect and result panel. No separate bug-click effect or bug-removal animation is needed.
- Apply the same gameplay rules to pointer and touch input.

## 7. Success and failure results

### 7.1 Shared layout

- Add a semi-transparent overlay to **the lower farm field only**. Its initial value is **Ink `#26342D` at approximately 55% opacity**, subject to visual checking against the artwork. Show this backdrop immediately; keep the HUD readable.
- Centre a result image/frame holding **one short supporting message** and **one RESTART button**. Do not add scores, elapsed-time summaries, a second button or extra explanatory text.
- Use **a distinct frame image for each result**, with the heading already embedded. Do not duplicate that heading in HTML.
- Block clicks on the underlying game objects while the panel is visible.

### 7.2 Differences between the frames

| Item           | WON                                                                           | LOST                                                            |
| -------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Frame image    | **Dedicated success frame**                                                   | **Dedicated failure frame**                                     |
| Decoration     | Carrots, bright accents and **upwards-reaching rays above the frame heading** | Bugs, darker accents and **dark hatch marks above the heading** |
| Heading        | Embedded in the success image                                                 | Embedded in the failure image                                   |
| Shared content | Short supporting message + RESTART                                            | Short supporting message + RESTART                              |

Use concise English copy. Possible supporting messages are “All carrots collected!” for WON and “Try again!” for LOST. Finalise the wording during implementation after checking the frame images.

**Measurements not yet finalised:** the frame image's **display width and height**, **internal padding**, precise supporting-message size (within the typography ranges above), **spacing between the message and RESTART**, and the title image's final display size. Validate with real assets in both compact and wide layouts.

- Keep the farm background and remaining objects **as they were when the round ended**, but disable gameplay clicks. Freeze the time and remaining carrots in the sky HUD.

## 8. Audio UX

| Situation           | BGM                               | Sound effects                                                          |
| ------------------- | --------------------------------- | ---------------------------------------------------------------------- |
| READY               | Not playing                       | None                                                                   |
| START               | **Loop from the beginning**       | Start effect                                                           |
| Carrot collection   | Continue playing                  | Harvest effect (may finish after the carrot DOM node has been removed) |
| WON                 | Stop                              | Success effect; may briefly overlap the last harvest sound             |
| LOST (bug/time-out) | Stop                              | Failure effect; no separate bug sound                                  |
| RESTART             | **Loop again from the beginning** | **Stop all previous sound effects** then play the restart effect       |

- Separate BGM (`playBGM()` / `stopBGM()`) from sound effects (`playSound(type)` / `stopAllSounds()`).
- Do not automatically stop every harvest effect merely because the round ends; **clear all previous-round effects on RESTART**.
- Aim for approximately **3–4-second** result effects. Audio playback failure, including browser autoplay restrictions, must not stop the game from functioning.

## 9. Motion and state changes

- **Carrot collection:** **No animation**. Remove the DOM node immediately, update the counter and play the effect.
- **Result panel:** Show the dark lower-field backdrop **immediately**. The centred panel may briefly fade in over approximately **120ms**. Rays and hatch marks belong to the **static frame images**.
- **Buttons:** Keep hover and pressed feedback short (approximately **100ms**). Never prioritise decorative motion over legibility or input responsiveness.
- **Timer:** Change the digits immediately on each second; do not add bouncing or zooming. **START/RESTART:** Do not add a full-screen fade or transition.
- **Reduced motion:** If the user prefers less motion, omit or minimise the panel fade and button movement without delaying game-state changes.

## 10. Responsive and accessibility checks

- [ ] The **three centred sky HUD lines** do not clip or overlap buildings or clouds in compact (320px/360px) or wide (768px boundary/800px+) layouts.
- [ ] The title and result-frame images preserve their aspect ratios and pixel-art clarity; **sprite alpha padding and hit areas** feel consistent when clicking.
- [ ] Check the restored **typography sizes, 16/24px horizontal margins, 200×48 / 220×52px START sizes, 48px RESTART height, 4px border and hard shadow** in real layouts.
- [ ] Verify minimum tappable area, hover, active and keyboard focus treatment for START and RESTART.
- [ ] Confirm the required carrot/bug count fits completely inside the Spawn Area in each layout.
- [ ] Resizing during a round does not change the locked layout; allow scrolling as needed.
- [ ] On results, only the lower field is darkened by the **initial ~55%-opacity Ink overlay**; the HUD stays readable and object clicks are blocked.
- [ ] Validate the frame's unresolved **size, padding and message-to-RESTART spacing** using the actual composited assets.
- [ ] Carrots disappear **immediately**, with no animation, and the displayed count updates.
- [ ] Confirm any allowed result/harvest sound overlap and that RESTART stops all previous effects.
- [ ] Confirm that `prefers-reduced-motion`, mute and audio restrictions do not make the interface unusable.
- [ ] Record complete overlaps and unwinnable arrangements as **known MVP limitations**.

## 11. Asset production and organisation

Suggested project paths (final filenames chosen during implementation):

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

- Keep two backgrounds, two sprites, one game title image and **separate success and failure frames**.
- Each result-frame image includes **its own heading and decoration**. Replacing that with CSS-built decorations around a generic frame would depart from this visual specification.
- A source asset may be higher resolution than the final CSS display size. Check pixel scaling and edge clarity in the browser.
- Supply meaningful alternative text or an equivalent accessible announcement for important title and result information embedded in images.
- Check licences, attribution and usage rights for music and fonts, and distinguish source files from exported implementation assets where practical.

## 12. Revision history and implementation baseline

| Version  | Main changes                                                                                                                                                                                                                                                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| v1.0     | Original pixel-art UI/UX design guide                                                                                                                                                                                                                                                                                                            |
| **v1.1** | Mobile-first compact default, locked game layout, `carrotCount` display, simpler object creation and placement, **overlap checks removed**, **carrot harvest animation removed**, separate result frames and stopping previous effects on RESTART                                                                                                |
| **v1.2** | Restored details lost between v1.0 and v1.1: **element-specific typography sizes, horizontal margins, 1px/zero-blur HUD outlines, button dimensions/4px shadow/`steps(2, end)`, ~55%-opacity result overlay, original asset filenames/resolutions, hit areas and measurement/testing notes**. All agreed v1.1 MVP simplifications are preserved. |

**Implementation note:** Spawn Area percentages and CSS display sizes are provisional until checked against the composed artwork. Keep `PRD.en-GB.md` and `GAME_LOGIC_DESIGN.en-GB.md` aligned when making changes. The available PRD v1.1 still contains the **20% overlap** and **carrot-shrink animation** requirements; it will need a separate revision to match this MVP.
