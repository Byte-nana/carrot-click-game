# Carrot Click Game — Product Requirements Document (PRD)

| Item | Details |
| --- | --- |
| Document version | **v1.2 — revised MVP implementation baseline** |
| Revised on | 2 November 2026 |
| Status | Pre-implementation baseline; not yet browser-tested |
| Technology | HTML · CSS · Vanilla JavaScript, mobile first |
| Related documents | `DESIGN_GUIDE.en-GB.md` v1.1 · `GAME_LOGIC_DESIGN.en-GB.md` v1.1 |

## 1. Product overview

### 1.1 Purpose

Create a short browser game in which players **click or tap every carrot within 30 seconds**. Clicking a bug or running out of time immediately loses the round. Players press START to begin and RESTART on the result panel to begin a fresh round.

### 1.2 Audience and platforms

- Design and build for mobile browsers first; the game must also be playable using a mouse in desktop browsers.
- A single-page game with no account, installation, server or database requirement.
- Choose **`compact` or `wide` from the viewport width**, not by detecting whether the device is a phone or computer.
- Target a minimum supported viewport width of **320 CSS px**. When the viewport cannot contain the locked game board, allow the necessary page scrolling.

## 2. Game rules and scope

### 2.1 Round rules

1. `READY`: show the title and START button. Hide the timer, remaining-carrot counter and objects; do not play BGM.
2. START: select a layout from the current viewport width, initialise the game data and place all carrots and bugs. Once preparation is complete, enter `PLAYING` and start the timer and BGM.
3. `PLAYING`: decrease the 30-second countdown in one-second increments. A carrot click removes that carrot **immediately** and reduces the number remaining by one.
4. Harvesting the last carrot **while the remaining time is greater than zero** results in `WON`. Clicking a bug or reaching zero seconds results in `LOST`.
5. On ending, stop the timer and BGM; freeze the remaining time and carrot count. Show the appropriate result panel and RESTART button. **Only the first validly processed ending wins.**
6. RESTART: clear previous sound effects, objects and game state, **recheck the current viewport width**, and immediately start a new round.

### 2.2 States

| State | HUD / board | Valid interaction | Transition |
| --- | --- | --- | --- |
| `READY` | Title and START only | START | → `PLAYING` |
| `PLAYING` | Title, timer, remaining-carrot count, carrots and bugs | Carrot and bug clicks/taps | → `WON` / `LOST` |
| `WON` | Frozen HUD, success panel, RESTART | RESTART | → `PLAYING` |
| `LOST` | Frozen HUD, failure panel, RESTART | RESTART | → `PLAYING` |

### 2.3 Layout-specific content

| Item | `compact` (default) | `wide` |
| --- | --- | --- |
| Selection | Viewport width **below 768px** | **768px or more** |
| Background/board aspect ratio | 3:4 | 4:3 |
| Maximum board dimensions | 360×480 CSS px | 800×600 CSS px |
| Carrots at the start of a round | **5** | **10** |
| Bugs at the start of a round | **5** | **15** |
| Proposed carrot display size | 52×52 CSS px | 64×64 CSS px |
| Proposed bug display size | 44×44 CSS px | 52×52 CSS px |

- Initial values: `layout = 'compact'`, `carrotCount = 5`, `bugCount = 5`. The READY preview may reflect the viewport width; START/RESTART establishes the layout and counts.
- `carrotCount` specifies **how many carrots to create** at the start, then becomes **the number of carrots remaining** during play. No separate `remainingCarrots` property is used. `bugCount` specifies the number created and does not decrease during the round.
- The 768px breakpoint and proposed object sizes are implementation baselines; reassess them through visual and placement testing.

### 2.4 In and out of scope for the MVP

**Included:** four game states, 30-second countdown, two responsive background layouts, random placement of the configured object counts, carrot harvesting and bug-triggered defeat, success/failure panels, START/RESTART, mouse and touch input, background music and event sound effects.

**Excluded for this MVP:** accounts, leaderboards, scoring, persistence, pause, inter-object collision/overlap checks, carrot shrink animations and clock-accurate countdown compensation.

> **Knowingly accepted limitation:** objects **may overlap completely**. If a carrot is fully covered by another object, that round may be impossible to win. The MVP will not retry placement or enforce a maximum overlap percentage.

## 3. Functional requirements and acceptance criteria

### FR-01 — Starting and state control

- START operates only in `READY`; RESTART operates only in `WON`/`LOST`.
- Both use a shared new-game initialisation workflow.
- **AC-01:** Once a new game is prepared, the remaining time is `30` and the generated carrot and bug counts match the current layout.
- **AC-02:** Rapid repeated input does not duplicate the board, timer or event listeners.
- **AC-03:** Resizing or rotating the viewport during a round does not change the selected layout, background, board dimensions, object positions/sizes or counts. Re-evaluate on RESTART only.

### FR-02 — Object creation and placement

- `createCarrots(count)` and `createBugs(count)` each create the required DOM elements, calculate random positions and append the elements to the Spawn Area.
- Each function performs **element creation, coordinate calculation and placement together**. Separate `createObjects()`, `getRandomPosition()` and `placeObject()` helpers are not required in the MVP.
- Use the Spawn Area's top-left as coordinate origin `(0, 0)` and ensure each object's full bounds remain inside its rectangle.
- **AC-01:** Generate 5 carrots + 5 bugs in `compact`, and 10 carrots + 15 bugs in `wide`.
- **AC-02:** Each object's top-left position satisfies `0 ≤ x ≤ fieldWidth − objectWidth` and `0 ≤ y ≤ fieldHeight − objectHeight`.
- **AC-03:** Do not retry or rearrange objects merely because they overlap. **Neither a 20% overlap cap nor a guaranteed unobscured 44×44px carrot hit area applies to this MVP.**

### FR-03 — Carrot and bug input

- Use **one delegated click listener** on the Spawn Area to identify carrots and bugs. Ordinary touch interaction must work through the same click handling.
- The topmost object actually selected by the browser receives the click. Ignore empty soil and decorative elements.
- **AC-01:** Each valid carrot click decreases `carrotCount` exactly once, **immediately removes** that carrot's DOM element and plays the harvest sound once.
- **AC-02:** When `carrotCount === 0` and time remains, end in `WON`.
- **AC-03:** A bug click results in `LOST` without a separate bug-click sound and without changing the remaining time or carrot count.
- **AC-04:** Object clicks have no game effect in `READY` or after a result has been confirmed.

### FR-04 — Timer and ending

- The MVP uses `setInterval()` at 1,000ms to decrease `remainingTimeSec` by 1 per callback.
- Never allow the value below zero; display it as `MM:SS`.
- **AC-01:** Reaching zero results in `LOST`, with `00:00` retained on screen.
- **AC-02:** `endGame(result)` only processes the first valid call during `PLAYING`, sets the state first, then stops the timer and BGM.
- **AC-03:** Remaining time and carrot count no longer change after the round has ended.
- **Limitation:** `setInterval()` can be delayed in background tabs. No elapsed-real-time compensation is included in this MVP.

### FR-05 — Audio

- Loop BGM only during `PLAYING`, after START/RESTART; **start the track from the beginning every time**. Stop it when either outcome is confirmed.
- Include one sound effect each for START, RESTART, carrot harvest, WON and LOST. There is no dedicated bug sound. Handle BGM through `playBGM()`/`stopBGM()` and effects through `playSound(type)`/`stopAllSounds()`.
- **AC-01:** The final harvest sound and success sound may overlap briefly. Do not stop all effects on ordinary game completion.
- **AC-02:** On RESTART, **stop every sound effect still playing from the previous round**, then play the new restart sound.
- **AC-03:** A carrot harvest sound can finish naturally after the associated DOM element has been removed.
- **AC-04:** Entering READY does not autoplay sound. Account for browser requirements for user-initiated playback.

### FR-06 — HUD, results and buttons

- The HUD contains the graphical game title, timer and remaining-carrot count. In READY, show only the title and START button.
- `WON` uses a success image frame decorated with carrots and bright rays; `LOST` uses a failure image frame decorated with bugs and dark diagonal hatching. **Each result title is part of its own frame artwork.**
- Include a short message and RESTART button on the result panel. Dim **only the lower farm-field portion** of the board, keeping the top HUD visible.
- **AC-01:** Display the matching frame and play the appropriate outcome effect.
- **AC-02:** Preserve the final timer and carrot counter; block further object interaction.
- **AC-03:** START and RESTART are accessible using keyboard focus as well as touch input.

## 4. Visual and audio asset requirements

| Asset category | Required assets | Notes |
| --- | --- | --- |
| Backgrounds | 3:4 compact farm and 4:3 wide farm pixel-art scenes | Open sky for title/HUD, cultivated field below |
| Sprites | Carrot and purple bug | Prefer transparent backgrounds; set layout-specific CSS dimensions |
| Decorative UI | Game title, success frame (including title), failure frame (including title) | Bright rays/carrots for success; dark hatching/bugs for failure |
| Audio | One BGM track; START, RESTART, harvest, success and failure effects | Handle looping BGM separately from one-shot effects |
| Font | Pixelify Sans Bold | Primarily English UI; provide a sensible fallback font |

- Verify usage and distribution permissions for any third-party fonts, audio and images before including them in the repository.
- Distinguish asset source resolution from on-screen dimensions. Use `image-rendering: pixelated` for pixel art where appropriate.

## 5. Non-functional requirements

- **Input and accessibility:** target at least 44×44 CSS px for controls and sprites. However, **an independently unobscured 44×44 hit area for overlapping objects is not guaranteed in the MVP**. Provide keyboard-operable START/RESTART and visible focus states.
- **Responsive behaviour:** begin with the compact layout and switch to wide at 768px; never rearrange a board once its round has started.
- **Stability:** prevent duplicate results, clear the timer identifier, register the delegated listener only once, and clean up earlier audio and DOM elements on RESTART.
- **Performance:** build using DOM, CSS and Vanilla JavaScript without a separate game engine. Keep decorative transitions short and simple.
- **Reduced motion:** respect `prefers-reduced-motion` for non-essential animation. Communicate status and remaining carrots with text as well as artwork.
- **Sound:** browser playback restrictions must not prevent the game itself from functioning.

## 6. Verification plan (after implementation)

- [ ] Examine the board and HUD at 320px, 360px, around 768px and at or above 800px
- [ ] Check compact 5+5 and wide 10+15 generation, with every object within the field bounds
- [ ] Rapidly repeat START/RESTART and verify no duplicate timers, listeners or BGM
- [ ] Check immediate carrot removal, count decrement and victory on the last carrot
- [ ] Check defeat on bug click and zero seconds, with final values frozen
- [ ] Check that the result overlay dims only the lower field while leaving the HUD visible
- [ ] Resize during play to check the layout lock; RESTART to check re-selection from the new width
- [ ] Check sound-effect overlap and stopping all previously playing effects on RESTART
- [ ] Record unwinnable placements due to overlap and timer delays for future improvements

> These are **acceptance criteria and planned tests**, not claims that testing has already succeeded.

## 7. Known limitations and possible improvements

1. Object overlap: complete overlaps can make carrots impossible to harvest → consider a maximum overlap percentage and minimum visible hit area in a later version.
2. Timer drift: `setInterval()` may run late in background tabs → consider measuring actual elapsed time later.
3. Placement boundaries: proportional field coordinates against the artwork may need visual adjustments during implementation.
4. Visual effects: the carrot harvest animation is intentionally omitted from this MVP; reconsider only as a separate enhancement.

## 8. Revision history

| Version | Notes |
| --- | --- |
| v1.1 | Previous PRD baseline |
| **v1.2** | Mobile-first compact default; `carrotCount`/`bugCount` data; `createCarrots(count)`/`createBugs(count)` approach; omitted overlap checks and carrot shrink animation; simplified timer; complete previous-effect clean-up on RESTART |

**Implementation authority:** see `GAME_LOGIC_DESIGN.en-GB.md` v1.1 for state, function and coordinate details, and `DESIGN_GUIDE.en-GB.md` v1.1 for visual presentation. If discrepancies appear, reconcile the three documents rather than silently introducing different behaviour.
