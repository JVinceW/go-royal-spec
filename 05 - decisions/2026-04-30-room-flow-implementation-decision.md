# Decision: MVP Room Flow Implementation

Date: 2026-04-30

## Status

Accepted for MVP implementation planning.

## Context

Go Royal MVP requires a lightweight 4-player room flow without automated matchmaking, persistent accounts, reconnect recovery, or advanced lobby management.

The broader networking direction is already set:

- SpacetimeDB is the authoritative backend
- Unity is a data-rendering client, not the network authority
- shared contracts live outside both the Unity root and the SpacetimeDB module folder

The remaining open question is how the MVP room lifecycle, start rules, slot ownership, and disconnect behavior should work in concrete implementation.

## Decision

Use a host-created, room-code-based multiplayer flow with SpacetimeDB as the single authority for room and match state.

## Room Authority

SpacetimeDB owns all canonical room state.

The room system SHALL be implemented through authoritative reducers and tables, not Unity client-side orchestration and not a separate room framework.

The authoritative room layer owns:

- Room creation
- Room code uniqueness among active rooms
- Player membership
- Slot assignment
- Host identity
- Start gating
- Disconnect state
- Transition into match creation

## Room Code

The MVP room code format SHALL be:

```text
4 uppercase alphanumeric characters
example: A7KQ
```

The server SHALL retry code generation until it finds a code that is not already used by an active room.

Room codes only need to be unique among currently active rooms, not globally forever.

## Room Lifecycle

The MVP room lifecycle SHALL be:

```text
WaitingForPlayers
  -> ReadyToStart
  -> MatchActive
  -> MatchEnded
  -> RoomClosed
```

Notes:

- `WaitingForPlayers` means fewer than 4 active members are present
- `ReadyToStart` means exactly 4 players are present and the room has not started yet
- `MatchActive` means room membership is locked and the match is running
- `MatchEnded` means the winner has been declared and end state is available
- `RoomClosed` means the room is no longer joinable and its active rows may be cleaned up

The Prepare Phase belongs to match state, not room state.

## Host Rules

The player who creates the room is the host.

The host SHALL:

- be assigned to Player1 by default
- remain the host for the full room lifetime
- be the only player allowed to start the match in MVP

The host does not get extra gameplay authority once the match begins. After match start, gameplay state is fully server-authoritative and player-equal.

## Slot Assignment

The MVP SHALL use stable slot assignment by join order.

Default slot order:

1. Host -> Player1
2. First joiner -> Player2
3. Second joiner -> Player3
4. Third joiner -> Player4

Formation-zone mapping remains tied to those slots:

- Player1 -> top-left
- Player2 -> top-right
- Player3 -> bottom-left
- Player4 -> bottom-right

Slots remain fixed for the full match once assigned.

## Match Start Rule

The room SHALL NOT auto-start when full.

The MVP SHALL require:

1. exactly 4 joined players
2. room state = `ReadyToStart`
3. a host-issued `StartMatch` intent

This is preferred over auto-start because it is easier to debug, easier to test locally, and gives the host explicit control over when the room transitions into match creation.

## Membership Rules Before Match Start

Before match start:

- players may leave voluntarily
- disconnected players are removed from the room
- a freed slot becomes available for a new joiner
- if the host leaves, the room is closed instead of transferring host ownership

MVP SHALL NOT implement host migration.

If a room returns from `ReadyToStart` to fewer than 4 players, it SHALL transition back to `WaitingForPlayers`.

## Membership Rules After Match Start

After match start:

- room membership is locked
- no new players may join
- leaving the room does not destroy the authoritative match state
- the former host has no special shutdown rights over the match result

The room remains attached to the active match until match end.

## Disconnect Policy

For the first playable MVP:

- disconnected players remain part of the match
- no reconnect recovery flow is implemented
- if a disconnected player does not submit a turn plan, the server submits an empty plan for that player
- disconnected players are not eliminated purely because they disconnected

Players are only eliminated by gameplay rules such as combat, shrink-zone loss, or later explicit AFK policy if added.

This is intentionally simpler than a missed-turn elimination rule and is preferred for early multiplayer playtests.

## Display Name Policy

The MVP SHOULD accept a client-provided display name when available.

If no usable display name is provided, the server SHALL assign a fallback development name such as:

```text
Player1
Player2
Player3
Player4
```

Persistent profiles and account-linked naming are deferred.

## Room Closure

After match end, the room MAY remain in `MatchEnded` briefly so clients can read the winner and final state.

Recommended MVP cleanup rule:

- close the room when all players leave, or
- close the room after a short timeout if no further interaction is needed

Suggested default:

```text
post_match_room_ttl_seconds = 60
```

The exact cleanup timer may remain configurable.

## SpacetimeDB Implementation Shape

Likely authoritative tables:

- `Room`
- `RoomPlayer`
- `Match`
- `MatchPlayer`
- `SubmittedTurnPlan` private
- `ResolutionEvent`

Likely room reducers:

- `CreateRoom`
- `JoinRoom`
- `LeaveRoom`
- `StartMatch`
- `Heartbeat` or `Ping`

Likely room-level server checks:

- room exists
- room is not full
- room has not started
- joining player is not already in the room
- only host may start
- exactly 4 players are present before start

## Rejected Or Deferred Alternatives

### Auto-Start When Full

Rejected for MVP.

This reduces one click, but makes local testing and multi-client orchestration harder and gives less explicit control during development.

### Host Migration

Deferred.

It adds room-state complexity without helping the first playable build.

### Reconnect Recovery

Deferred.

The MVP may treat disconnects as empty-plan participants instead of resuming live sessions.

### Disconnect Elimination After Missed Turns

Deferred.

This may be added later if playtests show empty-plan disconnected players drag matches too long, but it is not required for the first concrete implementation pass.

## Consequences

Benefits:

- simple room model
- explicit host-controlled start
- stable slot-to-formation mapping
- low implementation complexity
- clean fit with SpacetimeDB authoritative reducers

Tradeoffs:

- no reconnect path
- no host migration
- disconnected players may linger as empty-plan participants
- room state and match state still need explicit cleanup

## Follow-Up

This decision should be reflected in:

- `01 - design/systems/feature-room-multiplayer.md`
- `07 - engineering/mvp/12-networking-room-flow/task-list.md`
- any future networking transport or room UI planning docs
