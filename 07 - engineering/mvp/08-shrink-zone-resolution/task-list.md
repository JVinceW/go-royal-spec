# Shrink Zone Resolution Task List

## Source References

- [MVP system implementation order](../../mvp-system-implementation-order.md)
- [MVP requirements](../../../01 - design/requirements-mvp.md)
- [Default map system](../../../01 - design/systems/feature-default-map.md)
- [Core match loop system](../../../01 - design/systems/feature-core-match-loop.md)

## Goal

Apply safe-zone pressure after turn actions by advancing the MVP shrink schedule and eliminating unsafe units.

## Unity Implementation Notes

- Target module: `Assets/Game.Common`.
- Target assembly: `Game.Common`.
- Suggested namespace: `Game.Common.Mvp`.
- Suggested runtime path: `Assets/Game.Common/Runtime/Mvp/`.
- Suggested Edit Mode tests: `Assets/Tests/EditMode/Mvp/MvpShrinkResolutionTests.cs`.
- Keep shrink as deterministic rules data; UI can later render safe and unsafe cells from state/results.

## Linear Tracking

- Maps most closely to `GO-10`.
- Use as an implementation checklist inside the existing Linear issue.
- Dependency type: post-turn resolution component.

## Blocking Relationships

- Depends on:
  - [01-core-gameplay-rules-foundation](../01-core-gameplay-rules-foundation/task-list.md)
  - [03-match-state-system](../03-match-state-system/task-list.md)
  - [06-movement-resolution](../06-movement-resolution/task-list.md)
  - [07-combat-resolution](../07-combat-resolution/task-list.md)
- Blocks:
  - [09-elimination-and-win-condition](../09-elimination-and-win-condition/task-list.md)
  - [10-core-match-loop](../10-core-match-loop/task-list.md)

## Implementation Tasks

- [x] Use the shared safe-zone sequence for 9x9, 7x7, 5x5, and 3x3.
- [x] Track current shrink step in match state.
- [x] Advance safe zone at the configured MVP timing at the end of turn resolution.
- [x] Provide a query for safe cells and unsafe cells in the active safe zone.
- [x] Evaluate all surviving units after movement and combat resolution.
- [x] Eliminate units outside the active safe zone after shrink resolution.
- [x] Leave already-dead units unchanged.
- [x] Emit shrink events for new safe-zone bounds and units eliminated by shrink.
- [x] Prevent shrink logic from depending on procedural map generation.
- [x] Write Edit Mode tests for every shrink step, containment at boundaries, unit survival inside zone, unit death outside zone, and max-shrink behavior.

## Acceptance Criteria

- The safe area can shrink from 9x9 to 7x7 to 5x5 to 3x3.
- Units outside the active safe zone are eliminated after shrink resolution.
- Safe and unsafe cells can be displayed by later UI systems.
- Shrink resolution is deterministic for identical state and turn number.
- Edit Mode tests cover shrink sequence and unit elimination.

## Out Of Scope

- Animated shrink presentation
- Variable procedural safe zones
- Reconnect or replay handling
- Scene overlays or tile rendering
