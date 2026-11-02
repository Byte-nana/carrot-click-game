# Carrot Click Game — Game State, Data and Logic Design

| Item | Details |
| --- | --- |
| Document version | v1.1 (pre-implementation baseline; revised function responsibilities) |
| Date | 2 November 2026 |
| Language | British English (`en-GB`) |
| Related documents | `PRD.en-GB.md` v1.1, `DESIGN_GUIDE.en-GB.md` v1.0 |
| Target | A 30-second HTML, CSS and Vanilla JavaScript clicking game |
| Design status | Core flows agreed; browser behaviour not yet tested |

> **Scope of this document:** This records the **current MVP implementation approach** agreed during the design discussions. Differences from the existing PRD and Design Guide (such as omitting overlap checks and removing carrots immediately) are listed in §11; those earlier documents have **not yet been amended**. This document does not claim that the game has been tested.

## 1. Objectives and scope

- Harvest every carrot within 30 seconds to win (`WON`); clicking a bug or running out of time results in a loss (`LOST`).
- Separate the **responsibilities** of game state, data, UI updates, events, timers and audio.
- Share the new-game initialisation workflow between START and RESTART.
- Do **not maintain individual carrot/bug arrays or IDs** in this MVP; manage individual objects through their DOM elements.
- Do not perform object-overlap validation in the MVP. Accept the known risk of obscured carrots and plan to improve placement later.
- Actual HTML/CSS/JavaScript implementation and browser/device testing are outside the scope of this design document.

## 2. State model and transitions

| State | Permitted input | Display and runtime behaviour | Transition |
| --- | --- | --- | --- |
| `READY` | START button | Title and START visible; no objects, timer or carrot counter displayed; BGM stopped | START → `PLAYING` |
| `PLAYING` | Carrot/bug clicks or taps | 30-second countdown, remaining-carrot counter, objects displayed, looping BGM | Zero carrots (time >0) → `WON`; bug click or zero seconds → `LOST` |
| `WON` | RESTART button | Final time and zero carrots frozen, success panel, timer and BGM stopped | RESTART → `PLAYING` |
| `LOST` | RESTART button | Final time and remaining-carrot count frozen, failure panel, timer and BGM stopped | RESTART → `PLAYING` |

- In `READY`, the preview layout may change when the browser viewport changes.
- In `PLAYING`, `WON` and `LOST`, **freeze** the selected background, board dimensions, object sizes, coordinates and stacking order. If the viewport shrinks, allow the necessary scrolling rather than scaling or rearranging the board.
- **The first validly processed ending takes precedence.** `endGame()` has an effect only once, while the state is `PLAYING`. Ignore subsequent win/loss requests.
- Pause and quit-in-progress features are not part of the MVP.

## 3. Game data structure

Use a **mobile-first** approach and group the game's runtime data in a single `game` object. These are conceptual property definitions, not implementation code.

| Property | Type | Default initial value in READY | Update rule |
| --- | --- | --- | --- |
| `state` | string | `'READY'` | START/RESTART → `'PLAYING'`; on ending → `'WON'` or `'LOST'` |
| `layout` | string | `'compact'` | May follow viewport changes in READY; recalculate and lock from the current width on START/RESTART; retain until the next game |
| `remainingTimeSec` | number | `30` (hidden in READY) | Reset to 30 for each new game; decrease by 1 per timer callback in PLAYING, never below 0; retain on ending |
| `carrotCount` | number | `5` | Reset to 5 in `compact` or 10 in `wide` on START/RESTART; thereafter represents **carrots remaining**, decreasing by 1 per valid harvest; retain on ending |
| `bugCount` | number | `5` | Set to 5 in `compact` or 15 in `wide` on START/RESTART; do not decrease during gameplay |
| `timerId` | number or null (in browsers) | `null` | Store the identifier returned by `setInterval()`; reset to `null` after stopping it with `clearInterval()` |

- **Do not keep a separate `remainingCarrots` property.** `carrotCount` determines how many carrots to *create at the start of a game*, then represents how many *remain* once they have been placed. Use the same property for the HUD, decrementing after a harvest, and the win condition (`carrotCount === 0`).
- `bugCount` specifies the *number of bugs to create* at the start of a new game. Clicking a bug causes an immediate loss, so the value does not decrease during gameplay.
- `'compact'`, `carrotCount = 5` and `bugCount = 5` are **mobile-first defaults**. No objects or count HUD are shown in READY; these values do not imply that objects have already been added to the DOM. On START/RESTART, establish the layout, reset the counts and create the objects.
- When starting a game, establish `layout` **before** setting `carrotCount` and `bugCount`. Changes to the browser window during PLAYING/WON/LOST do not alter game data, board dimensions or object placement.
- Grouping properties in `game` does not automatically synchronise them. The relevant functions remain responsible for initialisation, decrements and ending the game.
- Keep time as a number and convert it to an `MM:SS` string such as `00:30` for display only. The MVP timer decreases once per second using `setInterval()`; no `endTimeMs` deadline or other real-time compensation value is used.
- Do not maintain individual object IDs, position arrays or harvested-state arrays. Use DOM existence, position and event targets. Active audio instances may still need separate tracking to stop all sound effects.

### 3.1 Layout configurations

| Item | `compact` (default) | `wide` |
| --- | --- | --- |
| Selection rule | Viewport width **below 768px** | **768px or more** |
| Farm background aspect ratio | 3:4 | 4:3 |
| Maximum board size | 360×480 CSS px | 800×600 CSS px |
| `carrotCount` at game start | 5 | 10 |
| `bugCount` at game start | 5 | 15 |
| Proposed carrot / bug display size | 52×52 / 44×44px | 64×64 / 52×52px |

- `compact` and `wide` describe **layouts based on viewport width, not device categories**. A narrow desktop browser window may use `compact`.
- **768px is a provisional breakpoint**; assess its suitability during visual and placement testing.
- The READY preview may follow viewport changes. On START/RESTART, **read the current width again** and establish both the layout and object counts.

## 4. Functions and responsibilities

| Function (proposed name) | Responsibility | Notes |
| --- | --- | --- |
| `startGame(source)` | Validate starting state; co-ordinate prior-game clean-up, layout/data/board initialisation and launch | `source` distinguishes START from RESTART for sound effects |
| `endGame(result)` | Confirm the ending once, stop timer/BGM, play the result sound and show the corresponding panel | `result` is `'WON'` or `'LOST'` |
| `startTimer()` | Register `setInterval()` and save its ID to `game.timerId` | Prevent duplicate active timers |
| `stopTimer()` | Call `clearInterval()` and set `game.timerId = null` | Handle the case where no timer is active safely |
| `createCarrots(count)` | Create `count` carrot DOM elements, calculate random positions, apply coordinates and append them to the Spawn Area | Receives the initial `game.carrotCount` on START/RESTART |
| `createBugs(count)` | Create `count` bug DOM elements, calculate random positions, apply coordinates and append them to the Spawn Area | Receives `game.bugCount` on START/RESTART |
| `handleObjectClick(event)` | Delegate clicks from the Spawn Area, check state/target and dispatch | Register the listener **once**, not on every restart |
| `handleCarrotClick(element)` | Harvest, decrement count, remove DOM element, play harvest sound, check for victory | Do not change the end state directly |
| `handleBugClick()` | Request `endGame('LOST')` | Do not change remaining time or carrot count |
| `playBGM()` / `stopBGM()` | Play looping BGM from the beginning / stop it | No automatic BGM playback in READY |
| `playSound(type)` | Play one specified sound effect | Start, restart, harvest, win, lose |
| `stopAllSounds()` | Stop **all** currently playing sound effects | Called on RESTART |

- In the MVP, do not introduce separate `createObjects()`, `getRandomPosition()`, `placeObject()` or `isValidPosition()` functions. Each creation function handles its own element creation, coordinate calculation and placement. Some duplication of this simple calculation is acceptable for now; extract a shared helper later if worthwhile.
- Call `createCarrots(count)` and `createBugs(count)` **only when initialising a new game**. Since `carrotCount` decreases during play, do not reuse its post-harvest value as an initial creation count.
- Do not add `winGame()`/`loseGame()` unless they acquire a distinct responsibility. At the relevant decision points, call `endGame('WON'/'LOST')` directly.
- `startGame()` and `endGame()` are **orchestrators**: calling several helpers does not mean implementing every calculation inside them.
- Additional render helpers for the HUD and result panels may be introduced during implementation; their exact names and DOM structure are not yet fixed.

## 5. START and RESTART initialisation flow

1. Check the permitted source state: START is valid only from `READY`, and RESTART only from `WON`/`LOST`. Ignore duplicate submissions.
2. Stop any active timer and reset its ID to `null`. For RESTART, also call `stopAllSounds()` to stop all effects from the previous game.
3. Remove previous carrot/bug DOM elements and clear the old result-panel state. START may have no previous objects.
4. Read the **current viewport width**, select `game.layout`, and establish the background, board dimensions and Spawn Area.
5. Reset `game.remainingTimeSec = 30`; set `game.carrotCount` to `10` (wide) or `5` (compact), and `game.bugCount` to `15` (wide) or `5` (compact).
6. Call `createCarrots(game.carrotCount)` and `createBugs(game.bugCount)` **with the freshly initialised values**. Each function creates, positions and appends its own elements. Prepare the board and HUD for display.
7. Only once preparation is complete, change `game.state` to `'PLAYING'`. Freeze the layout, object positions and sizes.
8. Call `startTimer()` and start `playBGM()` and the matching START/RESTART effect. BGM should loop **from the beginning**.

- START begins the first game; RESTART additionally requires particular care to clean up the previous game and reassess the current viewport.
- Handle browser audio playback restrictions and failed playback attempts during implementation.
- If board preparation fails, do not start the timer or transition to PLAYING.

## 6. Timer logic — simple MVP approach

1. `startTimer()` registers a repeating task with a 1,000ms interval and stores the returned ID.
2. Each callback should only make changes when `game.state === 'PLAYING'`. Decrease `remainingTimeSec` by 1, never allowing it below 0.
3. Update the HUD using an `MM:SS` representation of the remaining time.
4. At zero seconds, **immediately** request `endGame('LOST')`. `endGame()` will call `stopTimer()`.
5. When the player wins or clicks a bug, retain the **current remaining time** as it is.

**Known limitation:** `setInterval()` does not guarantee exact one-second timing. Background tabs or busy browsers may cause the display to drift and the game to last longer than 30 real seconds. The MVP accepts this limitation and will measure it in testing. Victory after the last carrot uses **the currently maintained `remainingTimeSec > 0`** as its time condition.

## 7. Object creation and placement — simple MVP approach

### 7.1 Creation rules

- On each new game, create 10 carrots and 15 bugs for `wide`, or 5 carrots and 5 bugs for `compact`.
- Once `startGame()` has reset the counts for the selected layout, it calls `createCarrots(game.carrotCount)` and `createBugs(game.bugCount)` separately.
- **Inside each creation function**, repeat `count` times: create a DOM element → inspect the Spawn Area and object dimensions → calculate a random position → apply coordinates → append to the Spawn Area.
- Treat the **top-left corner of the Spawn Area as `(0, 0)`**. The calculated coordinates denote the object's top-left position.
- Each object must fit **entirely within** the Spawn Area. If its dimensions make this impossible, do not append it at invalid coordinates; treat preparation of the new game as failed. Decide how to clean up partly created elements during implementation.
- Carrots and bugs use the same simple coordinate formula, but the MVP does not introduce separate positioning or placement functions.

### 7.2 Coordinate calculation

If the Spawn Area is `fieldWidth` by `fieldHeight` and an object is `objectWidth` by `objectHeight`:

- `maxX = fieldWidth - objectWidth`
- `maxY = fieldHeight - objectHeight`
- Within each creation function, choose `x` at random between `0` and `maxX`, inclusive, and independently choose `y` between `0` and `maxY`, inclusive.

If either `maxX` or `maxY` is negative, the object **cannot be placed** at that size. Display coordinates and the DOM positioning reference must use the same coordinate system.

### 7.3 Checks omitted from the MVP

- Do not implement object-overlap percentage checks, retry-count limits or overlap-avoidance rearrangement.
- Objects **may overlap completely**. Only the visually topmost object receives the click, so an obscured carrot may be impossible to harvest.
- Consequently, the MVP may generate an **unwinnable board**; this is a **deliberately acknowledged limitation**. Reconsider the 20% overlap cap and safe carrot hit area in a subsequent version.
- The Design Guide §3 provides provisional relative Spawn Area boundaries against the background image; these still require testing against the actual image.

## 8. Click events and win/loss decisions

### 8.1 Event delegation

- Attach **one click listener** to the Spawn Area. Do not attach it again on RESTART.
- `event.currentTarget` is the Spawn Area; `event.target` is the actual clicked element.
- If the object contains an image or other child elements, identify its wrapper with `closest()` or an equivalent method, and confirm that wrapper belongs to the Spawn Area.
- Distinguish carrots and bugs with an attribute such as `data-type`. Ignore empty ground and decorative elements.
- For overlapping objects, act on the object **visually on top**, as selected by the browser; never give carrots arbitrary priority.
- Use one valid `click` action for mouse or ordinary touch interaction; avoid duplicate event registrations.

### 8.2 Carrot click

1. Verify `PLAYING`, `remainingTimeSec > 0` and that the clicked element is still a harvestable carrot.
2. **Decrease** `game.carrotCount` by 1.
3. **Immediately remove** the clicked carrot DOM element. There is no shrinking animation in this MVP.
4. Call `playSound('carrot')`. The sound may finish even after its DOM element has been removed.
5. If the remaining-carrot count is `0`, call `endGame('WON')`. Do not modify `game.state` directly here.

### 8.3 Bug click

1. Recognise a valid bug click while in `PLAYING`.
2. `handleBugClick()` only requests `endGame('LOST')`.
3. Retain `remainingTimeSec`, `carrotCount` and the bug DOM element. Do not play a separate bug-click effect.

### 8.4 Shared ending function

1. On entry to `endGame(result)`, return immediately if `game.state !== 'PLAYING'`.
2. **Set the state first**, using a valid result (`'WON'` or `'LOST'`).
3. Call `stopTimer()` and `stopBGM()`.
4. Play the appropriate result sound **once**, then show the corresponding success/failure frame and RESTART button.
5. Do not modify the remaining time or carrot count. Ignore subsequent click and timer actions.

If the last carrot, the timer or a bug click all occur close together, **only the first validly processed ending request** determines the result.

## 9. Audio control

| Event | BGM | Sound effects |
| --- | --- | --- |
| READY | Stopped | None |
| START | Play from the beginning, loop | One `start` effect |
| Valid carrot harvest | Keep playing | One `carrot` effect |
| LOST by bug click | Stop | One `lose` effect; no separate bug sound |
| LOST by timeout | Stop | One `lose` effect |
| WON | Stop | One `win` effect; it may overlap the preceding harvest sound |
| RESTART | Play from the beginning, loop | **Stop every previous sound effect**, then play one `restart` effect |

- `playSound(type)` plays independent short effects. Aim for a result effect duration of about 3–4 seconds.
- `stopAllSounds()` must be able to track and stop all currently playing effect instances; completed effects should be removed from that tracking.
- Do **not** stop every sound effect on ordinary game completion: overlap between the final harvest and success effects is allowed. RESTART, however, stops every effect from the previous game.
- Verify prevention of duplicate BGM playback, resetting the playback position to zero on restart, and browser playback restrictions during implementation.

## 10. Scenarios to verify after implementation

The following are **expected design behaviours**, not completed test results.

- [ ] One START click in READY prepares the board, transitions to PLAYING and starts one timer and one BGM instance.
- [ ] Viewport widths at/above and below 768px create 10+15 and 5+5 objects respectively.
- [ ] Every object's full bounds fit within the Spawn Area and coordinate systems align.
- [ ] A carrot click decrements exactly once, removes its DOM element immediately and plays its effect.
- [ ] Harvesting the last carrot with `remainingTimeSec > 0` ends in WON.
- [ ] Clicking a bug preserves the time and carrot count and ends in LOST.
- [ ] Reaching zero seconds ends in LOST, with `00:00` retained on screen.
- [ ] Closely timed ending conditions produce only one result, panel and result sound.
- [ ] After WON/LOST, object clicks have no effect and the timer no longer decreases.
- [ ] Repeated RESTART actions leave no previous objects, panel, audio or timer and do not duplicate listeners or timers.
- [ ] Resizing during a game does not change the board, background, coordinates, sizes, object counts or state.
- [ ] RESTART reselects `wide` or `compact` using the current viewport width.
- [ ] Measure how often complete overlaps produce an unharvestable carrot (known MVP limitation).
- [ ] Measure timer drift, including when the browser tab is in the background (known MVP limitation).
- [ ] Verify audio playback policy, looping BGM, permitted effect overlap and stopping all effects on RESTART.

## 11. Differences from existing documents and subsequent work

| Topic | Existing PRD/Design Guide | Current MVP implementation decision | Documents to update |
| --- | --- | --- | --- |
| Object overlap | Maximum 20% overlapping area and a 44×44px unobscured carrot hit area | **Omit overlap checks; allow complete overlap** | `PRD.en-GB.md` §2.3, FR-02 AC-03, §7; `DESIGN_GUIDE.en-GB.md` §4 and §11 |
| Carrot animation | 120ms shrink with `steps(3,end)` | **Remove the DOM element immediately; no shrink animation** | `DESIGN_GUIDE.en-GB.md` §9 and associated text |
| Timer accuracy | Countdown in one-second increments | **Use a one-second `setInterval()` decrement**, without timing compensation | Recommend noting timing limitations and test conditions |
| Layout names | PC/mobile | Device-independent **wide/compact** | Recommend consistent terminology; retain the 768px threshold |
| Stopping sound effects | Some result/harvest overlap permitted | **Stop all previous effects on RESTART**; retain other rules | Recommend supplementing the audio control specification |

**v1.1 internal design changes:** Creation and placement are now handled directly by `createCarrots(count)` and `createBugs(count)`; `startGame()` and click handling now consistently use the `carrotCount`/`bugCount` data names from §3. Updating the earlier PRD and Design Guide is outside this revision.

**Next steps:** (1) Use this design as the implementation baseline → (2) implement HTML/CSS/JavaScript feature by feature → (3) verify the scenarios in a browser → (4) decide whether placement and timer accuracy need improvements based on observed results → (5) amend both Korean and British English versions of the PRD and Design Guide consistently.
