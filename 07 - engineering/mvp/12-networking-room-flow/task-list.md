# Networking Room Flow Task List

## Source References

- [MVP system implementation order](../../mvp-system-implementation-order.md)
- [MVP requirements](../../../01 - design/requirements-mvp.md)
- [Networking MVP system](../../../01 - design/systems/networking-mvp-system.md)
- [Room multiplayer system](../../../01 - design/systems/feature-room-multiplayer.md)
- [Room flow implementation decision](../../../05 - decisions/2026-04-30-room-flow-implementation-decision.md)

## Goal

Add the minimal multiplayer session wrapper around stable local gameplay rules.

## Unity Implementation Notes

- Target module is not final from current repo evidence; likely `Assets/Game.MainGame` for Unity-facing orchestration plus `Assets/Game.Common` for shared message/state DTOs if needed.
- Do not put gameplay rules in networking code; networking calls the stable `Game.Common` loop.
- Transport choice is locked to the SpacetimeDB client path over WebSocket.
- Shared contracts live outside both app roots; Unity should consume the wrapper package, not shape room logic around server project structure.
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

- [ ] Define room state with room ID, host player, joined players, assigned slots, and room status.
- [ ] Implement room status transitions: `WaitingForPlayers -> ReadyToStart -> MatchActive -> MatchEnded -> RoomClosed`.
- [ ] Implement host-created room flow in the chosen authority process.
- [ ] Generate a shareable room ID.
- [ ] Expose room ID to the Unity presentation layer.
- [ ] Implement join-by-room-ID flow.
- [ ] Reject joins for unknown, full, duplicate, or already-started rooms.
- [ ] Require exactly four players before host-issued match start.
- [ ] Assign each joined player to one stable player slot by join order: host Player1, then Player2, Player3, Player4.
- [ ] Allow only the host to start the match.
- [ ] Transition from room state to match setup through the local match loop.
- [ ] Remove disconnected players from the room before match start.
- [ ] Close the room if the host leaves before match start.
- [ ] Lock room membership after match start.
- [ ] Treat disconnected in-match players as empty-plan participants instead of disconnect-eliminating them.
- [ ] Keep gameplay rule decisions outside the room flow.
- [ ] Add tests for room creation, join order, slot assignment, full room rejection, host-only start gating, pre-match disconnect removal, and post-start membership lock.

## Acceptance Criteria

- One host can create a room and receive a room ID.
- Other players can join by room ID.
- A match cannot begin with fewer or more than four players.
- Every player has a stable player slot before match setup.
- Only the host can start a full room.
- The room does not auto-start when it becomes full.
- A host leaving before match start closes the room.
- A disconnected in-match player becomes an empty-plan participant instead of being removed from the match.
- Room flow does not resolve gameplay actions.

## Out Of Scope

- Automated matchmaking
- Ranked queues
- Reconnect support beyond MVP placeholder handling
- Social features or lobby browser
- Host migration
- Gameplay validation or turn resolution
