# Networking Room Flow Task List

## Source References

- [MVP system implementation order](../../mvp-system-implementation-order.md)
- [MVP requirements](../../../01 - design/requirements-mvp.md)
- [Networking MVP system](../../../01 - design/systems/networking-mvp-system.md)
- [Room multiplayer system](../../../01 - design/systems/feature-room-multiplayer.md)

## Goal

Add the minimal multiplayer session wrapper around stable local gameplay rules.

## Unity Implementation Notes

- Target module is not final from current repo evidence; likely `Assets/Game.MainGame` for Unity-facing orchestration plus `Assets/Game.Common` for shared message/state DTOs if needed.
- Do not put gameplay rules in networking code; networking calls the stable `Game.Common` loop.
- Transport choice must be confirmed before implementation; WebSocket is the design recommendation, but the Unity package/runtime path is not established yet.
- Add Edit Mode tests for pure room state where possible; add Play Mode/integration tests only after transport is selected.

## Linear Tracking

- Primary Linear issue: `GO-17`.
- Parent Linear story: `GO-13 MVP room-based multiplayer`.
- Current Linear status at last sync: `Backlog`.
- Dependency type: multiplayer session prerequisite.

## Blocking Relationships

- Depends on:
  - [10-core-match-loop](../10-core-match-loop/task-list.md)
  - [11-local-debug-ui-or-test-harness](../11-local-debug-ui-or-test-harness/task-list.md)
- Blocks:
  - [13-networked-turn-submission](../13-networked-turn-submission/task-list.md)
  - [14-multiplayer-match-ui](../14-multiplayer-match-ui/task-list.md)

## Implementation Tasks

- [ ] Confirm MVP transport/runtime approach before writing Unity networking code.
- [ ] Define room state with room ID, host player, joined players, assigned slots, and room status.
- [ ] Implement host-created room flow in the chosen authority process.
- [ ] Generate a shareable room ID.
- [ ] Expose room ID to the Unity presentation layer.
- [ ] Implement join-by-room-ID flow.
- [ ] Reject joins for unknown, full, duplicate, or already-started rooms.
- [ ] Require exactly four players before match start.
- [ ] Assign each joined player to one stable player slot.
- [ ] Transition from room state to match setup through the local match loop.
- [ ] Keep gameplay rule decisions outside the room flow.
- [ ] Add tests for room creation, join order, slot assignment, full room rejection, and start gating.

## Acceptance Criteria

- One host can create a room and receive a room ID.
- Other players can join by room ID.
- A match cannot begin with fewer or more than four players.
- Every player has a stable player slot before match setup.
- Room flow does not resolve gameplay actions.

## Out Of Scope

- Automated matchmaking
- Ranked queues
- Reconnect support beyond MVP placeholder handling
- Social features or lobby browser
- Gameplay validation or turn resolution
