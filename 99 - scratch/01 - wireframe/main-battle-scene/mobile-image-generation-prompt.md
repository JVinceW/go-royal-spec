# Mobile Main Battle Scene Image Generation Prompt

Use this prompt to generate a mobile-first refinement of the main battle scene.

The goal is to stay close to `main-battle-scene-wireframe.md`, while reducing visual clutter for a small mobile screen.

```text
Generate a complete mobile landscape main battle scene wireframe / UI mockup for Project Go-Royale.

Use case: ui-mockup
Asset type: mobile tactical game battle screen wireframe
Target device: mobile phone in landscape orientation, 16:9 or similar wide mobile aspect ratio
Style: high-quality grayscale or low-color UX wireframe, not final game art

Primary reference:
Use this exact design structure as the main reference:
- 9x9 board centered as the dominant element
- top compact match status
- top-left menu
- top-right log access
- bottom selected-unit / AP / plan / confirm command bar
- current safe zone, next safe zone, unit tokens, movement path, attack preview

Reference synthesis:
- Prioritize Fire Emblem and Langrisser-style tactical readability: square grid clarity, selected unit feedback, movement range overlays, attack preview, unit HP readability, and tactical board focus.
- Borrow only high-level auto-battler HUD discipline from Dota Auto Chess and Teamfight Tactics: round/status clarity, compact player readiness, and pre-resolution planning structure.
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

Mobile-first layout goals:
- Screen space is very limited, so keep the interface simple and clear.
- The 9x9 board must occupy most of the screen, roughly 70-80% of the usable height.
- Avoid side panels.
- Keep top HUD as a thin compact strip.
- Keep bottom command bar as a short, dense, touch-friendly strip.
- Use icons, compact labels, and badges instead of long text where possible.
- Do not show all secondary information at once. Log, counter help, and detailed player info can be accessed by small buttons.
- Preserve touch targets for Clear and Confirm.

Composition:
- Landscape mobile screen.
- Large centered 9x9 tactical board is the dominant visual focus.
- Coordinate labels are small but readable: columns 1-9 and rows A-I.
- Top-left: small hamburger menu icon.
- Top-center: compact status pill reading exactly: PLANNING | R4 | 7 -> 5 | 2 / 4
- Top-right: small LOG icon button.
- Bottom: compressed full-width command bar.

Board details:
- Four corner formation zones labeled P1, P2, P3, P4 with subtle hatch fills.
- Current safe zone shown as a strong solid border.
- Next safe zone shown as a dashed inner border.
- Unit tokens on the board showing type, owner, HP, and selection state.
- Use compact unit labels/icons: INF, ARC, CAV.
- Selected Infantry unit should have a strong outline.
- Movement range cells should be lightly shaded.
- Planned movement path should use numbered markers 1 and 2.
- Planned attack should show a clear arrow and target marker.
- Enemy threat or future unsafe cells should use subtle red or hatched cells.
- Terrain landmarks may appear only if very low-contrast and not competing with the grid.

Bottom mobile command bar:
- Use one compact strip, not a tall panel.
- Left segment: selected unit chip with INFANTRY, HP 8/10, SAFE.
- Middle-left segment: AP 3/5 with five tiny dots, three filled.
- Middle segment: plan sequence chips: 1 Move > 2 Move > Attack D6.
- Right segment: small Clear button and stronger Confirm button.
- Confirm should be the strongest button, labeled CONFIRM.
- Helper text like "Tap to lock in plan" may be omitted if space is tight.

Information hierarchy:
1. Board and tactical overlays
2. Selected unit and AP
3. Queued plan
4. Confirm / Clear
5. Round and submission status
6. Log and secondary help

Must show:
- phase: PLANNING
- round: R4
- shrink preview: 7 -> 5
- submitted players: 2 / 4
- selected unit: INFANTRY, HP 8/10, SAFE
- AP: 3 / 5
- plan: 1 Move > 2 Move > Attack D6
- current safe zone and next safe zone
- selected movement path and attack target

Constraints:
- Board-first tactical readability.
- Mobile screen must not feel crowded.
- Keep typography large enough to read on a phone.
- Use fewer labels and more compact icon-like chips.
- Text must be legible and spelled correctly.
- Movement range, attack range, safe zone, next safe zone, selected cells, and danger cells must be visually distinct.
- Avoid decorative fantasy UI unless it improves readability.
- Avoid looking like a direct clone of any referenced game.
- Avoid desktop-style side panels, large logs, large portraits, or tall command panels.
```

## Design Notes

The mobile direction keeps the original MD structure but compresses it:

- `NEXT ROUND` is removed from the top pill to save width; the shrink preview `7 -> 5` already carries the main meaning.
- The battle log becomes only a small icon button.
- The selected-unit panel becomes a compact chip instead of a portrait-heavy block.
- The AP display stays visible because it directly affects planning.
- The plan sequence stays visible because simultaneous planning needs player confidence before confirmation.
- Secondary explanations, counter charts, and detailed logs should be hidden behind buttons or overlays.

