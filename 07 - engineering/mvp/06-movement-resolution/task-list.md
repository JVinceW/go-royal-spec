# Movement Resolution Task List

## Source References

- [MVP system implementation order](../../mvp-system-implementation-order.md)
- [MVP requirements](../../../01 - design/requirements-mvp.md)
- [Turn resolution system](../../../01 - design/systems/feature-turn-resolution.md)

## Goal

Resolve validated movement actions deterministically after all active turn plans are submitted.

## Unity Implementation Notes

- Target module: `Assets/Game.Common`.
- Target assembly: `Game.Common`.
- Suggested namespace: `Game.Common.Mvp`.
- Suggested runtime path: `Assets/Game.Common/Runtime/Mvp/`.
- Suggested Edit Mode tests: `Assets/Tests/EditMode/Mvp/MvpMovementResolutionTests.cs`.
- Movement should produce a new state/result object usable by tests, debug UI, and later networking broadcasts.

## Linear Tracking

- Maps most closely to `GO-9`.
- Use as an implementation checklist inside the existing Linear issue.
- Dependency type: turn-resolution component.

## Blocking Relationships

- Depends on:
  - [03-match-state-system](../03-match-state-system/task-list.md)
  - [05-turn-plan-validation](../05-turn-plan-validation/task-list.md)
- Blocks:
  - [07-combat-resolution](../07-combat-resolution/task-list.md)
  - [08-shrink-zone-resolution](../08-shrink-zone-resolution/task-list.md)
  - [10-core-match-loop](../10-core-match-loop/task-list.md)

## Implementation Tasks

- [x] Add movement resolution entry point that accepts match state plus accepted turn plans.
- [x] Collect all validated movement actions for the current turn.
- [x] Preserve starting positions until conflict evaluation is complete.
- [x] Re-check destination cells against the fixed map and current safe zone before applying.
- [x] Detect simultaneous movement conflicts into the same destination cell.
- [x] Cancel all moves that target the same contested destination cell.
- [x] Apply non-conflicting valid moves to the next match state.
- [x] Keep units in their original position when movement is canceled.
- [x] Emit movement result events for applied moves, canceled conflicts, and rejected stale/invalid moves.
- [x] Keep ordering deterministic by using stable unit/player/action ordering where lists must be processed.
- [x] Write Edit Mode tests for single movement, multiple non-conflicting moves, same-cell conflict cancellation, invalid destination behavior, and result events.

## Acceptance Criteria

- Movement does not update positions until turn resolution begins.
- Invalid or blocked movement leaves the unit in its original cell.
- Simultaneous destination conflicts cancel consistently.
- Movement results can be inspected by debug UI or tests.
- Edit Mode tests prove deterministic output for identical input.

## Out Of Scope

- Attack damage
- Pathfinding beyond MVP movement legality
- Animation timing or visual interpolation
- ECS movement systems
