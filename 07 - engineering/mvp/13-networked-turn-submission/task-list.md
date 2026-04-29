# Networked Turn Submission Task List

## Source References

- [MVP system implementation order](../../mvp-system-implementation-order.md)
- [MVP requirements](../../../01 - design/requirements-mvp.md)
- [Networking MVP system](../../../01 - design/systems/networking-mvp-system.md)
- [Turn resolution system](../../../01 - design/systems/feature-turn-resolution.md)

## Goal

Connect multiplayer player intent to the authoritative deterministic gameplay loop.

## Unity Implementation Notes

- Networking layer should translate client messages into existing `Game.Common` turn-plan models.
- Gameplay validation and resolution remain in `Game.Common`; transport/session code only authenticates ownership, stores submissions, and broadcasts authoritative results.
- Target module depends on confirmed transport; likely `Assets/Game.MainGame` for orchestration plus shared DTOs in `Assets/Game.Common` if needed.
- Add deterministic Edit Mode tests for submission storage and ownership checks before transport integration tests; add Play Mode/integration tests only after transport is selected.

## Linear Tracking

- Primary Linear issue: `GO-18`.
- Parent Linear story: `GO-13 MVP room-based multiplayer`.
- Current Linear status at last sync: `Backlog`.
- Dependency type: multiplayer gameplay integration milestone.

## Blocking Relationships

- Depends on:
  - [05-turn-plan-validation](../05-turn-plan-validation/task-list.md)
  - [10-core-match-loop](../10-core-match-loop/task-list.md)
  - [12-networking-room-flow](../12-networking-room-flow/task-list.md)
- Blocks:
  - [14-multiplayer-match-ui](../14-multiplayer-match-ui/task-list.md)

## Implementation Tasks

- [ ] Define the network request shape for submitted turn plans after transport is selected.
- [ ] Map network payloads into the existing `TurnPlan` model.
- [ ] Associate each submitted plan with the joined player slot.
- [ ] Reject submissions from players outside the room or match.
- [ ] Reject submissions from eliminated players.
- [ ] Pass submitted plans into the gameplay validation system.
- [ ] Store one accepted plan per active player per turn.
- [ ] Prevent duplicate submissions from changing resolved turns.
- [ ] Resolve the turn only when all active players have submitted or timed out.
- [ ] Define MVP timeout behavior for missing active-player plans as empty plans.
- [ ] Broadcast authoritative validation errors to the submitting client.
- [ ] Broadcast authoritative resolution results to all clients.
- [ ] Add tests for ownership checks, duplicate rejection, all-player-ready resolution, timeout empty-plan behavior, and identical broadcast state.

## Acceptance Criteria

- Clients can submit turn plans for their assigned player slot.
- The authoritative process validates and resolves plans.
- Resolution waits for all active players or MVP timeout handling.
- All clients receive the same authoritative post-resolution match state.
- Clients never own gameplay-rule decisions.

## Out Of Scope

- Client-side prediction as authoritative truth
- Reconnect recovery
- Replay persistence
- Anti-cheat beyond authoritative validation
- Final match UI polish

