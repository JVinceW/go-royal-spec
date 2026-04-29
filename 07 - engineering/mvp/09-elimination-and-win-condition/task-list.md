# Elimination And Win Condition Task List

## Source References

- [MVP system implementation order](../../mvp-system-implementation-order.md)
- [MVP requirements](../../../01 - design/requirements-mvp.md)
- [Core match loop system](../../../01 - design/systems/feature-core-match-loop.md)

## Goal

Finalize player state after combat and shrink removals, then end the match when one player remains.

## Unity Implementation Notes

- Target module: `Assets/Game.Common`.
- Target assembly: `Game.Common`.
- Suggested namespace: `Game.Common.Mvp`.
- Suggested runtime path: `Assets/Game.Common/Runtime/Mvp/`.
- Suggested Edit Mode tests: `Assets/Tests/EditMode/Mvp/MvpWinConditionTests.cs`.
- Keep results explicit for later debug UI, multiplayer UI, and network broadcasts.

## Linear Tracking

- Maps most closely to `GO-10`.
- Use as an implementation checklist inside the existing Linear issue.
- Dependency type: match-end resolution component.

## Blocking Relationships

- Depends on:
  - [03-match-state-system](../03-match-state-system/task-list.md)
  - [07-combat-resolution](../07-combat-resolution/task-list.md)
  - [08-shrink-zone-resolution](../08-shrink-zone-resolution/task-list.md)
- Blocks:
  - [10-core-match-loop](../10-core-match-loop/task-list.md)
  - [11-local-debug-ui-or-test-harness](../11-local-debug-ui-or-test-harness/task-list.md)
  - [14-multiplayer-match-ui](../14-multiplayer-match-ui/task-list.md)

## Implementation Tasks

- [ ] Count surviving units for each player after combat and shrink resolution.
- [ ] Mark players with no surviving units as eliminated.
- [ ] Prevent eliminated players from submitting future turn plans through validation/loop checks.
- [ ] Keep eliminated player records in final match state for results display.
- [ ] Determine whether exactly one non-eliminated player remains.
- [ ] Set winner state when exactly one player remains.
- [ ] Transition the match to ended state when a winner exists.
- [ ] Define deterministic all-players-eliminated behavior for MVP and surface it as an explicit result if no winner can be declared.
- [ ] Emit elimination and winner events.
- [ ] Write Edit Mode tests for player elimination, active player survival, winner declaration, no-winner/all-eliminated behavior, and ended phase transition.

## Acceptance Criteria

- Players with no surviving units are eliminated.
- Eliminated players cannot submit later plans.
- The match ends when exactly one player remains active.
- Winner and final match state are preserved for display.
- Edit Mode tests cover normal and edge-case match-end outcomes.

## Out Of Scope

- Ranking beyond winner declaration
- Rewards, progression, or persistent profile data
- Replay export
- Post-match UI
