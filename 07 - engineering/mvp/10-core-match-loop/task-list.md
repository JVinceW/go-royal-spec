# Core Match Loop Task List

## Source References

- [MVP system implementation order](../../mvp-system-implementation-order.md)
- [MVP requirements](../../../01 - design/requirements-mvp.md)
- [Core match loop system](../../../01 - design/systems/feature-core-match-loop.md)

## Goal

Connect the pure rule systems into a complete deterministic local Unity gameplay loop from prepare phase through match end.

## Unity Implementation Notes

- Target module: `Assets/Game.Common` for the pure loop; `Assets/Game.MainGame` only if a scene-facing adapter is required later.
- Target assembly: `Game.Common` first.
- Suggested namespace: `Game.Common.Mvp`.
- Suggested runtime path: `Assets/Game.Common/Runtime/Mvp/`.
- Suggested Edit Mode tests: `Assets/Tests/EditMode/Mvp/MvpCoreMatchLoopTests.cs`.
- Keep loop orchestration independent of MonoBehaviours; expose a thin adapter later if a Unity scene needs it.

## Linear Tracking

- Primary Linear issue: `GO-15`.
- Parent Linear story: `GO-12 MVP local gameplay loop and debug harness`.
- Current Linear status at last sync: `Done`.
- Dependency type: local gameplay integration milestone.

## Blocking Relationships

- Depends on:
  - [04-prepare-phase-and-initial-setup](../04-prepare-phase-and-initial-setup/task-list.md)
  - [05-turn-plan-validation](../05-turn-plan-validation/task-list.md)
  - [06-movement-resolution](../06-movement-resolution/task-list.md)
  - [07-combat-resolution](../07-combat-resolution/task-list.md)
  - [08-shrink-zone-resolution](../08-shrink-zone-resolution/task-list.md)
  - [09-elimination-and-win-condition](../09-elimination-and-win-condition/task-list.md)
- Blocks:
  - [11-local-debug-ui-or-test-harness](../11-local-debug-ui-or-test-harness/task-list.md)
  - [12-networking-room-flow](../12-networking-room-flow/task-list.md)
  - [13-networked-turn-submission](../13-networked-turn-submission/task-list.md)
  - [14-multiplayer-match-ui](../14-multiplayer-match-ui/task-list.md)

## Implementation Tasks

- [x] Add loop orchestration for prepare, planning, resolving, shrink, elimination, and match end.
- [x] Start a match with fixed map, four player slots, and default setup.
- [x] Open turn planning for active players only.
- [x] Accept one valid turn plan per active player per turn.
- [x] Reject duplicate or late plans for already-resolved turns.
- [x] Start resolution only after all active plans are available or the caller supplies empty timeout plans.
- [x] Resolve movement before combat.
- [x] Resolve combat before shrink.
- [x] Resolve shrink before elimination and winner checks.
- [x] Advance turn number only when the match continues.
- [x] Stop accepting plans when winner state is set.
- [x] Return a resolution result that includes state changes and event summaries.
- [x] Write Edit Mode tests for full setup-to-planning flow, one complete turn, eliminated-player exclusion, winner-stop behavior, and deterministic repeat runs.

## Acceptance Criteria

- A full local match can progress from setup to winner declaration.
- Resolution order is explicit and deterministic.
- The loop excludes eliminated players from later planning.
- The loop can run without networking.
- Edit Mode tests cover integration across the core rule systems.

## Verification Notes

- Runtime/test compile verification passed for the full MVP rule set after GO-15 implementation.
- Review workflow found no new correctness issues in the GO-15 slice.
- Unity Edit Mode runner was not executed in that update pass, so verification remains compile-level.

## Out Of Scope

- Multiplayer transport
- Final player-facing UI
- AI opponents or automated play beyond test harness needs
- Scene lifecycle management
