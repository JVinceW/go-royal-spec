# Prepare Phase And Initial Setup Task List

## Source References

- [MVP system implementation order](../../mvp-system-implementation-order.md)
- [MVP requirements](../../../01 - design/requirements-mvp.md)
- [Default map system](../../../01 - design/systems/feature-default-map.md)
- [Core match loop system](../../../01 - design/systems/feature-core-match-loop.md)

## Goal

Implement deterministic local match creation and initial MVP unit placement before turn planning begins.

## Unity Implementation Notes

- Target module: `Assets/Game.Common`.
- Target assembly: `Game.Common`.
- Suggested namespace: `Game.Common.Mvp`.
- Suggested runtime path: `Assets/Game.Common/Runtime/Mvp/`.
- Suggested Edit Mode tests: `Assets/Tests/EditMode/Mvp/MvpMatchSetupTests.cs`.
- Bootstrap default: use deterministic fixed setup first; defer player-facing draft/shop UI.

## Linear Tracking

- Maps most closely to `GO-7`.
- Use as an implementation checklist inside the existing Linear issue.
- Dependency type: match-start prerequisite.

## Blocking Relationships

- Depends on:
  - [01-core-gameplay-rules-foundation](../01-core-gameplay-rules-foundation/task-list.md)
  - [02-mvp-balance-and-unit-definitions](../02-mvp-balance-and-unit-definitions/task-list.md)
  - [03-match-state-system](../03-match-state-system/task-list.md)
- Blocks:
  - [05-turn-plan-validation](../05-turn-plan-validation/task-list.md)
  - [10-core-match-loop](../10-core-match-loop/task-list.md)
  - [14-multiplayer-match-ui](../14-multiplayer-match-ui/task-list.md)

## Implementation Tasks

- [x] Add a factory/service for creating a new four-player MVP match state.
- [x] Assign each player to exactly one fixed player slot.
- [x] Assign each player slot to its fixed formation zone.
- [x] Create the default starting roster from balance config for each player.
- [x] Place each player's Infantry, Archer, and Cavalry inside the owner formation zone.
- [x] Ensure starting unit positions are deterministic and non-overlapping.
- [x] Reject or report setup errors for unknown players, invalid cells, duplicate units, or non-MVP unit types.
- [x] Lock initial formations when prepare completes.
- [x] Transition the match state from prepare phase to turn planning.
- [x] Write Edit Mode tests for four-player creation, starting roster, owner formation containment, non-overlap, and phase transition.

## Acceptance Criteria

- A complete four-player match can be initialized from empty input or a minimal player list.
- Each player receives exactly one Infantry, one Archer, and one Cavalry.
- Units cannot be placed outside their assigned formation zone.
- Initial formations are locked before the first turn plan is accepted.
- Edit Mode tests cover both valid setup and key invalid setup cases.

## Out Of Scope

- Player-facing unit selection UI
- Network readiness flow
- Advanced draft or shop behavior
- Scene spawning or prefabs
