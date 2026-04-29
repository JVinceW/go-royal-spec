# Core Gameplay Rules Foundation Task List

## Source References

- [MVP system implementation order](../../mvp-system-implementation-order.md)
- [MVP requirements](../../../01 - design/requirements-mvp.md)
- [MVP system overview](../../../01 - design/systems/mvp-system-overview.md)
- [Default map system](../../../01 - design/systems/feature-default-map.md)

## Goal

Create the Unity shared gameplay primitives that every later MVP rule system depends on.

## Unity Implementation Notes

- Target module: `Assets/Game.Common`.
- Target assembly: `Game.Common`.
- Suggested namespace: `Game.Common.Mvp`.
- Suggested runtime path: `Assets/Game.Common/Runtime/Mvp/`.
- Suggested Edit Mode tests: `Assets/Tests/EditMode/Mvp/MvpCoreValueTypesTests.cs`.
- Bootstrap constraint: this repo currently has module asmdefs but no mature MVP runtime pattern, so keep these as small immutable value types and static data helpers.

## Linear Tracking

- Maps most closely to `GO-5`.
- Use as an implementation checklist inside the existing Linear issue instead of creating more child issues unless ownership splits later.
- Dependency type: foundation.

## Blocking Relationships

- Depends on: None.
- Blocks:
  - [02-mvp-balance-and-unit-definitions](../02-mvp-balance-and-unit-definitions/task-list.md)
  - [03-match-state-system](../03-match-state-system/task-list.md)
  - [04-prepare-phase-and-initial-setup](../04-prepare-phase-and-initial-setup/task-list.md)
  - [08-shrink-zone-resolution](../08-shrink-zone-resolution/task-list.md)

## Implementation Tasks

- [x] Add `GridPosition` with zero-based `Row` and `Column` values.
- [x] Add `GridPosition.ManhattanDistanceTo(GridPosition other)`.
- [x] Add map bounds constants for a fixed 9x9 board.
- [x] Add a board-position validation helper for coordinates inside the 9x9 map.
- [x] Add `PlayerSlot` identifiers for exactly four players.
- [x] Add `FormationZone` or equivalent safe rectangular/cell-set representation.
- [x] Add fixed 3x3 corner formation zones for the four player slots.
- [x] Add `SafeZone` with containment checks for rectangular bounds.
- [x] Add safe-zone presets for 9x9, 7x7, 5x5, and 3x3.
- [x] Add `UnitType` identifiers limited to Infantry, Archer, and Cavalry.
- [x] Add stable lightweight player/unit ID value types only if needed by downstream state objects.
- [x] Write Edit Mode tests for Manhattan distance, map bounds, formation-zone containment, safe-zone containment, and MVP unit type limits.

## Acceptance Criteria

- The primitives support exactly four players on one fixed 9x9 grid.
- Formation zones can be queried by player slot and validated by cell.
- Safe-zone areas can be represented without procedural map generation.
- Unit type identifiers are limited to the MVP debug roster.
- Edit Mode tests cover every public primitive behavior introduced by this task.

## Out Of Scope

- Procedural maps
- Unit stats or balance values
- Runtime turn resolution
- Networking room membership
- Unity scene or prefab work
