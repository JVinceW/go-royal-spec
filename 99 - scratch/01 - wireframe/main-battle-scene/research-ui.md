# Main Battle Scene UI Research

## Purpose

This note executes the research portion of `image-generation-prompt.md` and turns the reference genres into a concrete direction for the Project Go-Royale main battle scene wireframe.

## Reference Summary

### Fire Emblem

Useful patterns:

- Square-grid tactical maps make movement and attack legality easy to understand.
- Selected-unit feedback is usually expressed directly on the board through highlighted reachable cells.
- Movement and attack ranges are separated visually, commonly as different color overlays.
- HP and allegiance are readable near the unit rather than hidden in deep panels.
- Tactical flow is unit-first: select unit, inspect reachable cells, choose destination, choose attack or action.

Implication for Go-Royale:

- The selected unit should drive the screen state.
- Movement range, planned path, attack range, and danger cells must be visually distinct.
- Unit HP and ownership should be visible on the board at all times.

### Langrisser

Useful patterns:

- Tactical RPG presentation often benefits from a slightly angled or board-forward camera that makes units feel like pieces on a battlefield.
- Class matchups, terrain, and position are treated as core decision inputs.
- Hero/unit detail can be compact but should support quick comparison before committing.
- Grid-based movement remains readable even when the battlefield has scenic dressing.

Implication for Go-Royale:

- Keep the board readable first, but allow low-contrast map landmarks.
- The Infantry / Archer / Cavalry counter triangle should be visible in a compact reference panel.
- Unit type identity should be stronger than decorative unit art in the MVP wireframe.

### Dota Auto Chess

Useful patterns:

- Auto-battlers emphasize pre-combat positioning and round structure.
- The board is the main planning surface, while combat execution happens after player commitment.
- Player health/status, round information, and readiness are persistent UI concerns.
- The game can support many players by showing compact opponent/player indicators rather than full details.

Implication for Go-Royale:

- The planning phase should feel like committing a formation and plan before resolution.
- Player submission state, such as `2 / 4`, should remain persistent in the top HUD.
- The screen should not overload each opponent's detail; compact P1-P4 markers are enough for MVP.

### Teamfight Tactics

Useful patterns:

- TFT's board-first layout keeps the battlefield central while surrounding it with economy, round, roster, and player information.
- The round display and opponent/player state are always close to the primary play area.
- Auto-battler screens separate planning information from combat results, but keep both accessible.
- Benches, shops, and traits create high information density; Go-Royale should borrow the HUD discipline, not the shop complexity.

Implication for Go-Royale:

- Use a compact top status bar for phase, round, shrink preview, and submission count.
- Use a persistent bottom command bar for selected unit, AP, queued actions, and confirmation.
- Use a log button for resolution detail instead of crowding the battle screen.

## Project Go-Royale UI Direction

The main battle screen should combine:

- Fire Emblem / Langrisser tactical readability for grid selection, movement range, attack range, and unit state.
- Auto Chess / TFT status clarity for phase, round, readiness, and player-state HUD.

The result should be an original board-first tactical UI. It should not copy the exact visual identity, panel shapes, icons, colors, characters, or branded layouts of any reference game.

## Recommended Wireframe Structure

### Top HUD

Use a compact horizontal status bar centered above the board.

Required fields:

- `PLANNING`
- `R4`
- `7 -> 5`
- `NEXT ROUND`
- `2 / 4`

Purpose:

- Show match phase, current round, shrink transition, next-round timing, and submitted-player count without stealing board space.

### Main Board

Use a large 9x9 square grid as the dominant screen element.

Required layers:

- Coordinate labels: columns `1-9`, rows `A-I`
- Four corner formation zones: `P1`, `P2`, `P3`, `P4`
- Solid current safe-zone border
- Dashed next safe-zone border
- Movement range cells
- Attack range cells
- Danger or future unsafe cells
- Planned movement path with numbered steps
- Planned attack arrow and target marker

### Unit Tokens

Use compact circular tokens.

Each token should show:

- Unit type icon or abbreviation
- Owner color or marker
- Current HP number
- Small HP bar
- Selection outline when active

MVP unit token labels:

- `INF` for Infantry
- `ARC` for Archer
- `CAV` for Cavalry

### Bottom Command Bar

Use a full-width persistent command bar.

Sections:

- Selected unit panel: portrait/icon, unit type, HP, safe status
- AP panel: `AP 3 / 5`, dot meter
- Plan sequence: `1 Move > 2 Move > Attack (D6)`
- Clear button
- Confirm button

Purpose:

- Keep player action construction separate from the board while preserving a clear link to planned path markers.

### Side / Secondary Access

Use minimal side access:

- Top-left menu button
- Top-right `LOG` button

The log should hold resolution details, combat events, and shrink/elimination messages outside the core planning view.

## Image Generation Prompt

```text
Generate a complete landscape main battle scene wireframe / UI mockup for Project Go-Royale.

Use case: ui-mockup
Asset type: tactical game battle screen wireframe
Style: high-quality grayscale or low-color UX wireframe, not final game art

Reference synthesis:
- Prioritize Fire Emblem and Langrisser-style tactical readability: square grid clarity, selected unit feedback, movement range overlays, attack preview, unit HP readability, and tactical board focus.
- Borrow only high-level auto-battler HUD discipline from Dota Auto Chess and Teamfight Tactics: round/status clarity, player status, compact battle HUD, and pre-resolution planning structure.
- Do not copy exact UI layouts, art, icons, characters, logos, colors, fonts, panel shapes, or branded visual identity from any reference game.

Project context:
- 4-player tactical battle MVP
- Fixed 9x9 square grid battlefield
- Four players start from corner formation zones
- Units: Infantry, Archer, Cavalry
- Current phase: Planning
- Players queue movement and attack actions before simultaneous resolution
- Each player spends AP on movement and attacks
- Safe zone shrinks over time: 9x9 -> 7x7 -> 5x5 -> 3x3
- Combat counters: Infantry counters Archer, Archer counters Cavalry, Cavalry counters Infantry

Composition:
- 16:9 landscape screen
- Large central 9x9 tactical board is the dominant visual focus
- Coordinate labels around the board: columns 1-9, rows A-I
- Top-left hamburger menu
- Top-center status pill reading: PLANNING | R4 | 7 -> 5 | NEXT ROUND | 2 / 4
- Top-right clipboard icon labeled LOG
- Bottom full-width command bar

Board details:
- Four corner formation zones labeled P1, P2, P3, P4 with light hatch fills
- Current safe zone shown as a strong solid border
- Next safe zone shown as a dashed inner border
- Unit tokens on the board showing type, owner, HP, and selection state
- Use simple labels/icons: INF, ARC, CAV
- Selected Infantry unit should have a strong outline
- Movement range cells should be lightly shaded
- Planned movement path should use numbered markers 1 and 2
- Planned attack should show an arrow and target marker
- Enemy threat or future unsafe cells should use subtle red or hatched cells
- Low-contrast terrain landmarks are allowed, but must not reduce grid readability

Bottom command bar:
- Selected unit panel: infantry icon, INFANTRY, HP 8 / 10, SAFE badge
- AP panel: AP 3 / 5 and five-dot meter with three filled
- Plan sequence: 1 Move > 2 Move > Attack (D6)
- Clear button
- Dark primary Confirm button labeled CONFIRM with helper text Tap to lock in plan

Constraints:
- Board-first tactical readability
- Clean spacing and compact information panels
- Text must be legible and spelled correctly
- Movement range, attack range, safe zone, next safe zone, selected cells, and danger cells must be visually distinct
- Avoid decorative fantasy UI unless it improves readability
- Avoid looking like a direct clone of any referenced game
```

## Sources

- Fire Emblem movement range and map highlighting: <https://fireemblem.fandom.com/wiki/Movement>
- Fire Emblem Heroes battle mechanics and danger area behavior: <https://feheroes.fandom.com/wiki/Mechanics>
- Fire Emblem Heroes battle-system summary: <https://serenesforest.net/fire-emblem-heroes/beginners-guide/battle-system/>
- Langrisser App Store listing: <https://apps.apple.com/us/app/langrisser/id1435314243>
- Langrisser Mobile overview: <https://www.mobilegameslist.com/game/langrisser-mobile>
- Dota Auto Chess gameplay overview: <https://dotaautochess.fandom.com/wiki/How_to_play_guide_for_Dota_Auto_Chess>
- Teamfight Tactics official overview: <https://teamfighttactics.leagueoflegends.com/en-us/news/game-updates/what-is-teamfight-tactics/>
- Teamfight Tactics UI guide: <https://tftips.app/en/specs/ui>

