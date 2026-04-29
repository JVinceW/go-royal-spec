# Turn Plan Validation Task List

## Source References

- [MVP system implementation order](../../mvp-system-implementation-order.md)
- [MVP requirements](../../../01 - design/requirements-mvp.md)
- [Turn resolution system](../../../01 - design/systems/feature-turn-resolution.md)

## Goal

Validate Unity gameplay intent data before deterministic turn resolution mutates match state.

## Unity Implementation Notes

- Target module: `Assets/Game.Common`.
- Target assembly: `Game.Common`.
- Suggested namespace: `Game.Common.Mvp`.
- Suggested runtime path: `Assets/Game.Common/Runtime/Mvp/`.
- Suggested Edit Mode tests: `Assets/Tests/EditMode/Mvp/MvpTurnPlanValidationTests.cs`.
- Keep validation pure and transport-agnostic; networking later submits the same model.

## Linear Tracking

- Maps most closely to `GO-9` for turn-plan types and validation.
- Use as an implementation checklist inside the existing Linear issue.
- Dependency type: rules validation prerequisite.

## Blocking Relationships

- Depends on:
  - [02-mvp-balance-and-unit-definitions](../02-mvp-balance-and-unit-definitions/task-list.md)
  - [03-match-state-system](../03-match-state-system/task-list.md)
  - [04-prepare-phase-and-initial-setup](../04-prepare-phase-and-initial-setup/task-list.md)
- Blocks:
  - [06-movement-resolution](../06-movement-resolution/task-list.md)
  - [07-combat-resolution](../07-combat-resolution/task-list.md)
  - [10-core-match-loop](../10-core-match-loop/task-list.md)
  - [13-networked-turn-submission](../13-networked-turn-submission/task-list.md)

## Implementation Tasks

- [x] Add `TurnPlan` for one player's submitted actions.
- [x] Add action types for movement and attack only.
- [x] Define movement action fields as acting unit ID and destination `GridPosition`.
- [x] Define attack action fields as attacker unit ID and target unit ID.
- [x] Add a validation result type with success/failure and readable error messages.
- [x] Validate that the submitting player exists and is active.
- [x] Validate that acting units belong to the submitting player and are alive.
- [x] Validate movement destinations are inside the map, inside the current safe zone, and legal for the unit range.
- [x] Validate attack targets are enemy units, alive, and in valid range from current positions.
- [x] Calculate AP cost from config and reject plans exceeding the turn budget.
- [x] Reject unsupported action types, duplicate impossible references, and plans submitted outside the planning phase.
- [x] Write Edit Mode tests for valid plans, eliminated player rejection, dead unit rejection, ownership rejection, invalid movement, invalid attack range, and AP overspend.

## Acceptance Criteria

- Invalid plans are rejected before resolution mutates match state.
- Eliminated players cannot submit plans.
- Dead units cannot move or attack.
- AP overspend is blocked consistently.
- The same state and same plan always produce the same validation result.
- Validation errors are readable enough for debug UI and later multiplayer UI.

## Out Of Scope

- Applying movement
- Applying combat damage
- Network timeouts or missing plan substitution
- Client-side prediction
