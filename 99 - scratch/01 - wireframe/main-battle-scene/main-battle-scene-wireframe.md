# Main Battle Scene Wireframe

## Purpose

This document translates the main battle scene wireframe into reusable text structure.

The screen represents the MVP battle scene during `Planning` phase. It is optimized for tactical readability, simultaneous turn planning, AP spending, safe-zone awareness, and plan confirmation.

## Screen Summary

- Orientation: landscape
- Primary focus: centered 9x9 battlefield
- Secondary focus: bottom selected-unit and turn-plan command bar
- Top status: match phase, round, shrink preview, next round indicator, player submission count
- Side access: global menu on the left, battle log on the right
- Visual style: monochrome wireframe with light grid, strong safe-zone outline, simple icon-based units

## High-Level Layout

```text
+------------------------------------------------------------------------------+
| [Menu]             [PLANNING | R4 | 7 -> 5 | Next Round | 2/4]        [Log] |
|                                                                              |
|                  1   2   3   4   5   6   7   8   9                         |
|              +-------------------------------------------+                  |
|            A | P1 zone                              P2 zone |                |
|            B |                                           |                  |
|            C |      units, safe zone, planned actions    |                  |
|            D |      selected unit, path, attack target   |                  |
|            E |      terrain / obstacle markers           |                  |
|            F |                                           |                  |
|            G |                                           |                  |
|            H | P3 zone                              P4 zone |                |
|            I +-------------------------------------------+                  |
|                                                                              |
| +--------------------------------------------------------------------------+ |
| | Selected Unit | AP | Plan Steps                         | Clear Confirm | |
| +--------------------------------------------------------------------------+ |
+------------------------------------------------------------------------------+
```

## Top Navigation And Match Status

### Left Menu

Position:

- Top-left corner.
- Small hamburger icon.

Function:

- Opens pause/settings/menu overlay.

### Center Match Status Bar

Position:

- Top center.
- Compact horizontal pill.

Content:

```text
PLANNING | R4 | 7 -> 5 | Next Round | 2 / 4
```

Fields:

| Field | Meaning |
|---|---|
| `PLANNING` | Current match phase |
| `R4` | Current round number |
| `7 -> 5` | Safe-zone shrink preview from 7x7 to 5x5 |
| Hourglass icon + `Next Round` | The shrink or resolution timing indicator |
| Player icon + `2 / 4` | Number of players who have submitted or locked their plan |

### Right Log Button

Position:

- Top-right corner.

Content:

```text
[clipboard icon]
LOG
```

Function:

- Opens battle log, action history, or resolution event feed.

## Battlefield Grid

### Grid Shape

The battlefield is a 9x9 square grid.

Column labels:

```text
1 2 3 4 5 6 7 8 9
```

Row labels:

```text
A B C D E F G H I
```

Coordinate convention:

- Columns use numbers left to right.
- Rows use letters top to bottom.
- Example cell: `D4`.

### Board Framing

The board has:

- Thin grid lines for individual cells.
- A stronger rectangular safe-zone border.
- A dashed inner rectangle for next safe-zone preview.
- Light shaded cells for selected movement or action preview.
- Red or hatched cells for danger, enemy threat, attack range, or future unsafe area.

## Player Formation Zones

Each player has a corner formation or ownership marker.

| Player | Position | Marker |
|---|---|---|
| `P1` | Top-left corner | Player dot + rook/castle icon |
| `P2` | Top-right corner | Player dot + rook/castle icon |
| `P3` | Bottom-left corner | Player dot + rook/castle icon |
| `P4` | Bottom-right corner | Player dot + rook/castle icon |

Visual treatment:

- Formation zones use a light diagonal hatch fill.
- Player label appears inside or near the corner zone.
- Castle/rook icon indicates base, camp, or player anchor.

## Safe Zone And Shrink Preview

### Current Safe Zone

Visual:

- Solid dark rectangular border.

Meaning:

- Cells inside this border are currently safe.

### Next Safe Zone

Visual:

- Dashed inner rectangular border.

Meaning:

- Cells inside this border will remain safe after the next shrink.

### Future Unsafe Or Threat Cells

Visual:

- Light red or diagonal hatch cells.

Meaning:

- Cells expected to become unsafe, threatened, targeted, or tactically dangerous.

In the reference layout, a danger preview appears on the right-middle area of the board.

## Map Decoration And Terrain Markers

The board contains simple environmental markers such as small tree or mountain clusters.

Purpose:

- Add spatial anchors.
- Help players read board regions.
- Keep the wireframe from feeling empty.

MVP behavior note:

- Unless later rules define terrain effects, these markers should be treated as visual landmarks only.

## Unit Tokens

### Token Shape

Each unit appears as a circular token.

Token contents:

- Unit type icon in the center.
- HP value below or inside token.
- Small HP bar underneath.

Example:

```text
+-----+
| icon|
|  8  |
+-----+
-----
```

### Visible Unit Types

| Icon Concept | Unit Type |
|---|---|
| Helmet / soldier | Infantry |
| Bow | Archer |
| Horse head | Cavalry |
| Sword | Melee attacker or generic attack-capable unit |

### Unit State Indicators

Possible indicators:

- HP number: current health.
- HP bar: relative remaining health.
- Filled icon: selected or owned unit.
- Outline token: non-selected unit or enemy.
- Dark target marker: planned attack target.

## Selected Unit State

The selected unit in the screenshot is an Infantry unit.

Bottom-left selected unit panel:

```text
[Infantry portrait]
INFANTRY
Heart icon 8 / 10
[SAFE]
```

Fields:

| Field | Meaning |
|---|---|
| Portrait | Unit class identity |
| `INFANTRY` | Selected unit type |
| `8 / 10` | Current HP / max HP |
| `SAFE` | Current safe-zone status |

## Planned Action Visualization

The board shows a planned sequence from the selected unit.

### Movement Preview

Visual elements:

- Light shaded reachable or selected cells.
- Numbered action markers such as `1` and `2`.
- Dashed directional arrow for queued movement path.

Meaning:

- `1 Move` is the first planned movement action.
- `2 Move` is the second planned movement action.
- The unit position does not finalize until resolution.

### Attack Preview

Visual elements:

- Straight arrow from attacking unit toward target.
- Dark circular attack marker with crossed-swords icon.
- Target unit highlighted or visually connected.

Meaning:

- The selected plan includes an attack after movement.
- The attack target appears at coordinate-like label `D6` in the plan summary.

## Bottom Command Bar

The bottom command bar is the main interaction surface during planning.

Layout:

```text
+---------------+--------------+-------------------------------------+---------+-----------+
| Selected Unit | AP           | Plan                                | Clear   | Confirm   |
+---------------+--------------+-------------------------------------+---------+-----------+
```

### AP Panel

Content:

```text
AP
3 / 5
* * * o o
```

Meaning:

- Player has used or reserved 3 AP out of 5.
- Dot meter provides fast scan of AP budget.

### Plan Panel

Content:

```text
PLAN
[1 Move] > [2 Move] > [Attack (D6)]
```

Behavior:

- Displays the queued action sequence.
- Each action appears as a compact pill.
- Arrows indicate action order.
- Attack action includes the target cell or target unit reference.

### Clear Button

Content:

```text
X
CLEAR
```

Behavior:

- Clears the current planned action sequence.
- Should not end the turn.

### Confirm Button

Content:

```text
[check] CONFIRM
Tap to lock in plan
```

Behavior:

- Locks the player's current turn plan.
- Contributes to the `2 / 4` submitted-player count.
- Should visually become disabled or locked after confirmation.

## Interaction States

### Planning State

Visible:

- Current AP.
- Selected unit info.
- Movement range.
- Planned action sequence.
- Confirm button.
- Safe-zone preview.
- Other players' submission count.

Primary actions:

- Select unit.
- Add move action.
- Add attack action.
- Clear plan.
- Confirm plan.

### Confirmed State

Expected changes:

- Confirm button becomes locked or disabled.
- Plan remains visible for review.
- Board input is disabled or limited unless unconfirm is allowed.
- Submission count increments.

### Resolution State

Expected changes:

- Bottom plan editor becomes read-only.
- Board animates or steps through moves, attacks, shrink, and eliminations.
- Log button can show event details.

## Component Inventory

| Component | Purpose |
|---|---|
| Menu button | Opens global menu |
| Match status bar | Shows phase, round, shrink, timer, submissions |
| Log button | Opens battle event log |
| Grid labels | Makes coordinates readable |
| 9x9 board | Main tactical play area |
| Formation zones | Shows four player start areas |
| Safe-zone border | Shows current safe area |
| Next-zone border | Shows upcoming shrink area |
| Unit token | Shows unit type, owner, HP, state |
| Movement preview | Shows planned movement path |
| Attack preview | Shows queued attack and target |
| Selected unit panel | Shows currently selected unit details |
| AP panel | Shows current AP budget and usage |
| Plan sequence | Shows queued turn actions |
| Clear button | Clears planned actions |
| Confirm button | Locks turn plan |

## Notes For Reuse

- Keep the board visually dominant.
- Keep the bottom command bar persistent during planning.
- Represent safe-zone information in at least two layers: current safe zone and next safe zone.
- Use numbered markers to make planned action order readable.
- Use compact unit tokens so the 9x9 grid remains legible.
- Keep `Confirm` visually stronger than `Clear`.
- Preserve the `2 / 4` player-submission indicator because simultaneous planning depends on it.
