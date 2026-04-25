# Feature System: Default Map

## Purpose

This document defines the fixed default map for Project Go-Royale MVP.

The default map exists so the team can test movement, formation, combat, shrink pressure, and game feel before procedural map generation is designed.

## Source Documents

- [requirements-mvp.md](</E:/go-royal/01 - design/requirements-mvp.md>)
- [mvp-system-overview.md](</E:/go-royal/01 - design/systems/mvp-system-overview.md>)
- [gameplay-mvp-system.md](</E:/go-royal/01 - design/systems/gameplay-mvp-system.md>)
- [feature-core-match-loop.md](</E:/go-royal/01 - design/systems/feature-core-match-loop.md>)

## Feature Goal

The Default Map SHALL provide one stable 9x9 battlefield that supports 4-player deployment, readable movement, early counter-play, and shrink-zone pressure.

## In Scope

- Fixed 9x9 grid definition
- Player formation zones
- Initial safe zone
- Shrink-zone sequence
- Cell coordinate convention
- MVP map data requirements
- Playtest goals for the default map

## Out of Scope

- Procedural map generation
- Random terrain distribution
- Advanced terrain effects
- Fog of war
- Alternate maps
- Map editor tools
- Cosmetic board themes

## Coordinate Convention

The MVP map SHALL use 0-based grid coordinates.

```text
row: 0 at top, 8 at bottom
col: 0 at left, 8 at right
```

The top-left cell is `(0, 0)`.

The bottom-right cell is `(8, 8)`.

All map, movement, formation-zone, and safe-zone rules SHALL use this coordinate convention.

## Map Size

The default MVP map SHALL be exactly 9x9.

```text
9 rows x 9 columns = 81 cells
```

The map size SHALL remain fixed for the first MVP implementation.

## Cell Types

For first playable MVP, every cell SHOULD behave as a basic passable cell.

The system MAY name this cell type `Plain`, `Open`, or `Normal`, but the behavior SHALL be:

- Passable by all MVP units
- No movement cost modifier
- No defense modifier
- No line-of-sight modifier

Terrain effects are deferred. This keeps the first map focused on position, counters, and shrink timing.

## Formation Zones

Each player receives one corner formation zone.

For MVP, each formation zone SHOULD be a 3x3 corner region:

| Player Slot | Formation Zone |
|---|---|
| `Player1` | rows 0-2, cols 0-2 |
| `Player2` | rows 0-2, cols 6-8 |
| `Player3` | rows 6-8, cols 0-2 |
| `Player4` | rows 6-8, cols 6-8 |

The Gameplay System SHALL reject unit placement outside the owning player's formation zone during Prepare Phase.

The Gameplay System SHALL reject unit placement on an occupied cell.

## Center Pressure

The center cell is `(4, 4)`.

The map SHOULD encourage players to move toward the center before the first shrink meaningfully reduces the battlefield.

Because terrain is deferred, center pressure is primarily created by:

- Symmetric starting corners
- Shrink-zone sequence
- Unit attack ranges
- AP movement budget

## Initial Safe Zone

At match start, the safe zone SHALL cover the full 9x9 map.

```text
top_left: (0, 0)
bottom_right: (8, 8)
```

All cells are safe during Prepare Phase and the first Turn Planning Phase unless the turn-resolution system defines warnings for the next shrink.

## Shrink Sequence

The MVP default map SHOULD use this safe-zone sequence:

| Shrink Step | Top Left | Bottom Right | Size |
|---|---|---|---|
| 0 | `(0, 0)` | `(8, 8)` | 9x9 |
| 1 | `(1, 1)` | `(7, 7)` | 7x7 |
| 2 | `(2, 2)` | `(6, 6)` | 5x5 |
| 3 | `(3, 3)` | `(5, 5)` | 3x3 |

The shrink sequence SHALL remain centered and symmetric.

The system SHALL NOT shrink below 3x3 during MVP unless a later balancing decision changes the session design.

## Shrink Timing

For MVP, shrink resolution SHOULD happen at the end of each turn resolution after movement and combat.

The first implementation SHOULD use this timing:

```text
Turn 1 resolves -> shrink to 7x7
Turn 2 resolves -> shrink to 5x5
Turn 3 resolves -> shrink to 3x3
Turn 4+ resolves -> remain 3x3
```

This timing makes the match converge quickly and supports short playtest sessions.

## Safe-Zone Warnings

During Turn Planning, the UI SHOULD be able to show:

- Current safe zone
- Next safe zone
- Cells that will become unsafe after the turn resolves

The map system SHOULD expose enough data for that preview, but the UI presentation belongs in client design.

## Unit Placement Capacity

Each 3x3 formation zone has 9 cells.

The first MVP SHOULD keep starting unit counts low enough that every player can place all starting units without overcrowding.

Recommended first-playtest starting count:

```text
3 units per player
```

This gives each player meaningful formation choices while leaving room for movement experiments.

## Map Data Shape

The default map SHOULD be represented as data that is easy to inspect and change.

The map data SHOULD include:

- Map ID
- Width
- Height
- Cell list or grid
- Formation zones by player slot
- Safe-zone sequence

Example conceptual shape:

```text
MapDefinition
  id: "mvp_default_9x9"
  width: 9
  height: 9
  cells: 81 passable cells
  formation_zones:
    Player1: rows 0-2, cols 0-2
    Player2: rows 0-2, cols 6-8
    Player3: rows 6-8, cols 0-2
    Player4: rows 6-8, cols 6-8
  safe_zones:
    9x9, 7x7, 5x5, 3x3
```

The exact C# or server-side structure belongs in the implementation plan.

## Validation Rules

The map system SHALL provide validation for:

- Map width is 9.
- Map height is 9.
- All formation-zone cells are inside the map.
- No two player formation zones overlap.
- The safe-zone sequence is centered and within map bounds.
- Every safe zone is smaller than or equal to the previous safe zone.
- Every MVP cell is passable.

## Playtest Goals

The default map should help answer:

- Can players understand the board quickly?
- Do corner starts feel fair?
- Does 3 units per player create enough opening decisions?
- Does the first shrink create pressure too early, too late, or at the right time?
- Does the 3x3 final zone create a decisive ending?
- Do unit ranges and AP budgets make center control meaningful?

## Testing Focus

Initial tests SHOULD cover:

- Default map loads successfully.
- Default map has exactly 81 cells.
- Coordinate bounds reject rows or columns outside 0-8.
- Each player has exactly one formation zone.
- Formation zones do not overlap.
- Units can be placed inside their owner's formation zone.
- Units cannot be placed outside their owner's formation zone.
- Safe-zone step 0 is 9x9.
- Safe-zone step 1 is 7x7.
- Safe-zone step 2 is 5x5.
- Safe-zone step 3 is 3x3.
- Safe-zone step 4 remains 3x3 unless future rules change it.

## Open Decisions For Implementation Planning

These decisions should be locked before code implementation:

- Whether the map is stored as a ScriptableObject, JSON-like data, code constant, or server data object
- Whether Player1 always starts top-left or player slots rotate by room assignment
- Whether cells outside the next safe zone are visually warned during MVP
- Whether the first shrink happens after Turn 1 or after a longer opening period
