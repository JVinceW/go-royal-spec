# Feature System: Room Multiplayer

## Purpose

This document defines the MVP room-based multiplayer system for Project Go-Royale.

The MVP needs real 4-player multiplayer, but it does not need automated matchmaking, ranked queues, persistent accounts, reconnect recovery, replay delivery, or production-scale room management.

## Source Documents

- [requirements-mvp.md](</E:/go-royal/01 - design/requirements-mvp.md>)
- [networking-mvp-system.md](</E:/go-royal/01 - design/systems/networking-mvp-system.md>)
- [feature-core-match-loop.md](</E:/go-royal/01 - design/systems/feature-core-match-loop.md>)
- [feature-turn-resolution.md](</E:/go-royal/01 - design/systems/feature-turn-resolution.md>)

## Feature Goal

The Room Multiplayer system SHALL let one player create a room, three other players join by room ID, and all four players complete one authoritative MVP match.

## In Scope

- Host-created room
- Join by room ID
- Session-scoped player identity
- Player slots
- Room readiness
- Match start
- Client intent messages
- Authoritative state broadcasts
- Turn plan submission
- MVP timeout and disconnect behavior
- Development-friendly error handling

## Out of Scope

- Automated matchmaking
- Ranked play
- Persistent accounts
- Party system
- Friend invites
- Reconnect recovery
- Replay delivery
- Spectators
- Region selection
- Production room scaling

## Authority Model

The MVP SHALL use an authoritative process for each active room and match.

The authoritative process SHALL:

- Own room state
- Own canonical match state
- Validate player identity for each message
- Accept or reject client intents
- Call gameplay systems for match-state changes
- Broadcast authoritative state to all connected players

Clients MAY preview local actions for usability, but client state is not authoritative.

## Transport Recommendation

WebSocket is the recommended MVP transport.

The system contract SHALL remain transport-agnostic:

- Client sends intent messages.
- Server sends authoritative state and error messages.
- Gameplay rules do not depend on WebSocket-specific details.

## Room Lifecycle

The MVP room lifecycle SHALL be:

```text
RoomCreated
  -> WaitingForPlayers
  -> ReadyToStart
  -> MatchActive
  -> MatchEnded
  -> RoomClosed
```

Rooms MAY be stored in memory for MVP.

Rooms do not need persistence for the first playable build.

## Room Creation

When a host creates a room, the server SHALL:

- Generate a unique room ID.
- Create an empty room state.
- Add the host as Player1 unless slot assignment is randomized later.
- Return the room ID and host player ID.
- Broadcast the updated room state to connected room members.

Recommended room ID default:

```text
4 uppercase alphanumeric characters
example: A7KQ
```

The exact room ID format SHALL be configurable if implementation cost is low.

## Joining A Room

When a player joins by room ID, the server SHALL:

- Validate that the room exists.
- Validate that the room is not full.
- Validate that the match has not already started.
- Assign the player to the next available slot.
- Return player ID, room ID, and assigned slot.
- Broadcast the updated room state to all room members.

A room SHALL reject a fifth player.

## Player Slots

The MVP SHALL support exactly 4 player slots:

| Slot | Default Formation Zone |
|---|---|
| Player1 | Top-left |
| Player2 | Top-right |
| Player3 | Bottom-left |
| Player4 | Bottom-right |

Slot assignment SHOULD be stable for the duration of the match.

For MVP, the host SHOULD default to Player1 and join order SHOULD fill Player2, Player3, and Player4.

Production may later randomize or rebalance slot assignment.

## Player Identity

MVP player identity can be session-scoped.

The server SHOULD track:

- `player_id`
- `display_name`
- `room_id`
- `slot`
- `connection_status`
- `is_host`
- `last_seen_at`

Persistent accounts are deferred.

## Starting A Match

A match SHALL start only when exactly 4 players are present.

The MVP SHOULD allow the host to start the match once all 4 slots are filled.

When the match starts, the server SHALL:

- Lock room membership.
- Create initial match state.
- Assign formation zones from player slots.
- Load the default map.
- Apply the default starting loadout.
- Transition the room to `MatchActive`.
- Broadcast the initial authoritative match state.

## Client Intent Messages

The MVP SHOULD support these client intent categories:

| Intent | Purpose |
|---|---|
| `CreateRoom` | Host requests a new room |
| `JoinRoom` | Player joins by room ID |
| `LeaveRoom` | Player leaves before match start |
| `StartMatch` | Host starts a full room |
| `PlaceUnit` | Player places a unit during Prepare |
| `SetReady` | Player marks Prepare complete |
| `SubmitTurnPlan` | Player submits current turn plan |
| `Ping` | Client keeps connection alive |

Every client intent SHALL include enough player/session information for the server to validate ownership.

## Server Broadcast Messages

The MVP SHOULD support these broadcast categories:

| Broadcast | Purpose |
|---|---|
| `RoomStateUpdated` | Room membership or slot state changed |
| `MatchStarted` | Initial match state is available |
| `PrepareStateUpdated` | Unit placement or ready state changed |
| `TurnPlanningStarted` | New planning phase opened |
| `TurnPlanAccepted` | A player's plan was accepted |
| `TurnResolutionCompleted` | Authoritative turn result is available |
| `PlayerDisconnected` | Player connection state changed |
| `PlayerEliminated` | Player has no units remaining |
| `MatchEnded` | Winner and final state are available |
| `Error` | Intent rejected or server error occurred |

Broadcasts SHOULD include enough data for clients to render from authoritative state.

## Turn Plan Submission

During `TurnPlanning`, the server SHALL:

- Accept plans only from active players.
- Reject plans from eliminated players.
- Reject plans for the wrong turn number.
- Pass turn plans to the gameplay validation layer.
- Track which active players have submitted valid plans.
- Start resolution when all active players have valid plans.

The server MAY allow a player to replace a submitted plan before the turn timer expires.

## Turn Timer

Recommended MVP default:

```text
turn_timer_seconds = 45
```

The timer value SHALL be configurable.

When the timer expires, the server SHALL submit empty plans for active players who have not submitted a valid plan.

## Disconnect Policy

The MVP disconnect policy SHOULD keep playtests moving.

Recommended default:

- Before match start: disconnected players are removed from the room.
- During match: disconnected players remain in the match.
- During match: a disconnected player's missing turn plan becomes an empty plan.
- After 2 consecutive missed turn submissions, the player MAY be eliminated by configurable playtest policy.

Recommended configurable value:

```text
missed_turns_before_elimination = 2
```

The first build MAY keep disconnected players submitting empty plans instead of eliminating them if that is easier for debugging.

## Error Handling

The server SHOULD return clear structured errors.

Recommended errors:

- `RoomNotFound`
- `RoomFull`
- `MatchAlreadyStarted`
- `NotRoomHost`
- `NotEnoughPlayers`
- `InvalidPlayerSession`
- `InvalidPhase`
- `InvalidUnitPlacement`
- `InvalidTurnPlan`
- `UnsupportedIntent`

Errors SHOULD include a short readable message for development and UI debugging.

## State Ownership

The server SHALL own:

- Room membership
- Player slots
- Match phase
- Unit positions
- Unit HP
- Safe-zone state
- Submitted turn plans
- Resolution result
- Elimination and winner state

The client SHALL render from the latest authoritative state.

## Testing Focus

Initial tests SHOULD cover:

- Creating a room returns a room ID.
- Room IDs are unique among active rooms.
- Host is assigned Player1 by default.
- Players can join by room ID.
- Join order fills Player2, Player3, and Player4.
- A fifth player is rejected.
- A match cannot start with fewer than 4 players.
- A match can start with exactly 4 players.
- Non-host players cannot start the match if host-only start is enabled.
- Submitted turn plans are associated with the correct player.
- Plans for the wrong turn are rejected.
- Missing plans become empty plans when the timer expires.
- Room broadcasts state after player join.
- Room broadcasts state after turn resolution.

## Open Decisions For Implementation Planning

These decisions should be confirmed when coding starts:

- Whether host-only start is required or the room auto-starts when full
- Whether the first server is embedded in Unity for local testing or runs as a separate lightweight service
- Whether player display names are typed by users or auto-generated for MVP
- Whether disconnected players are eliminated after missed turns in the first build or only submit empty plans
