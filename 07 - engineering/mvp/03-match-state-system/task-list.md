# Match State System Task List

## Source References

- [MVP system implementation order](../../mvp-system-implementation-order.md)
- [MVP requirements](../../../01 - design/requirements-mvp.md)
- [MVP system overview](../../../01 - design/systems/mvp-system-overview.md)
- [Core match loop system](../../../01 - design/systems/feature-core-match-loop.md)

## Goal

Create the Unity shared authoritative local state model used by prepare, planning, resolution, shrink, elimination, and networking wrappers.

## Unity Implementation Notes

- Target module: `Assets/Game.Common`.
- Target assembly: `Game.Common`.
- Suggested namespace: `Game.Common.Mvp`.
- Suggested runtime path: `Assets/Game.Common/Runtime/Mvp/`.
- Suggested Edit Mode tests: `Assets/Tests/EditMode/Mvp/MvpMatchStateTests.cs`.
- Keep state independent of MonoBehaviours, Entities, scenes, and transport so it can be tested as pure C# rules code.

## Linear Tracking

- Maps most closely to `GO-7` for the initial model and setup dependency.
- Use as an implementation checklist inside the existing Linear issue.
- Dependency type: authoritative state prerequisite.

## Blocking Relationships

- Depends on:
  - [01-core-gameplay-rules-foundation](../01-core-gameplay-rules-foundation/task-list.md)
  - [02-mvp-balance-and-unit-definitions](../02-mvp-balance-and-unit-definitions/task-list.md)
- Blocks:
  - [04-prepare-phase-and-initial-setup](../04-prepare-phase-and-initial-setup/task-list.md)
  - [05-turn-plan-validation](../05-turn-plan-validation/task-list.md)
  - [08-shrink-zone-resolution](../08-shrink-zone-resolution/task-list.md)
  - [09-elimination-and-win-condition](../09-elimination-and-win-condition/task-list.md)
  - [10-core-match-loop](../10-core-match-loop/task-list.md)
  - [12-networking-room-flow](../12-networking-room-flow/task-list.md)

## Implementation Tasks

- [ ] Add `MvpMatchState` or equivalent root state object for one match.
- [ ] Add player records with player ID, player slot, display name, and status.
- [ ] Add unit records with unit ID, owner slot/player, unit type, HP, position, and alive flag.
- [ ] Add match phase values for prepare, planning, resolving, ended, and invalid/error if needed.
- [ ] Track current turn number.
- [ ] Track current shrink step and active safe zone.
- [ ] Track submitted turn plans only if this task owns storage; otherwise leave storage to turn-plan validation/loop tasks.
- [ ] Track winner state separately from eliminated player records.
- [ ] Define deterministic state transition expectations: methods should return updated state/results rather than relying on scene objects.
- [ ] Add validation helpers/tests for missing players, duplicate unit IDs, unknown owners, and invalid phase transitions used by later systems.
- [ ] Write Edit Mode tests that construct a minimal valid match state and verify explicit player/unit/winner/shrink fields.

## Acceptance Criteria

- The state model can represent the full MVP match lifecycle.
- The state model can run locally before networking exists.
- Eliminated players and winner state are explicit.
- Later resolution systems can update state deterministically from the same input.
- Edit Mode tests cover valid construction and invalid ownership/identity cases.

## Out Of Scope

- Room creation or join flow
- UI rendering
- Unity ECS component conversion
- Network serialization format beyond fields needed by the model
