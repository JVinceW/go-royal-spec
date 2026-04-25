# Networking MVP System

## Purpose

This document defines the MVP Networking System for Project Go-Royale.

The Networking System exists to let 4 human players complete a real multiplayer MVP match without building full matchmaking, ranked play, reconnect, replay, or live-service room infrastructure.

## Design Goals

The MVP Networking System SHALL:

- Let one player create a room
- Let three other players join by room ID
- Start a match when exactly 4 players are present
- Collect simultaneous turn plans
- Broadcast authoritative match state updates
- Stay thin around gameplay rules

The Networking System SHALL NOT own combat, movement, AP, shrink, elimination, or win-condition rules.

## Authoritative Process

The MVP SHOULD use an authoritative process that owns each active room and match.

For local development, the authoritative process may be a lightweight server. For later production, this can evolve into a dedicated game server.

The authoritative process SHALL:

- Create rooms
- Track joined players
- Start matches
- Receive player intents
- Pass valid gameplay intents to the Gameplay System
- Broadcast accepted state updates
- Reject invalid player actions with clear errors

## Room Lifecycle

The room lifecycle is:

1. Host requests room creation.
2. Server creates a room and returns a room ID.
3. Other players join using the room ID.
4. Server tracks player slots until exactly 4 players are present.
5. Host or server starts the match.
6. Room transitions into an active match.
7. Room closes when the match ends.

For MVP, rooms may be in-memory and do not need persistence.

## Room Identity

Room IDs SHOULD be short enough to share manually during development and playtesting.

Room IDs SHALL be unique among active rooms.

The exact room ID format belongs in implementation planning, but examples include:

- `ABCD`
- `7KQ2`
- `GO-1842`

## Player Identity

For MVP, player identity can be session-scoped.

The Networking System SHOULD track:

- Player ID
- Display name or debug label
- Connection status
- Room ID
- Assigned player slot

Persistent accounts are deferred.

## Match Start

A match SHALL start only when the room has exactly 4 players.

At match start, the Networking System SHALL:

- Assign each player to a player slot
- Request initial match state from the Gameplay System
- Broadcast the initial match state to all players
- Transition all clients into the Prepare Phase

## Client Intent Messages

The Networking System SHOULD treat client messages as intents, not authoritative changes.

MVP intent categories:

- Create room
- Join room
- Start match
- Choose units
- Place units
- Submit turn plan
- Leave room or disconnect

The server SHALL validate that an intent comes from a player who is allowed to perform it in the current room and match phase.

## State Broadcasts

The server SHALL broadcast authoritative state after accepted state changes.

Important broadcasts include:

- Room created
- Player joined
- Player left or disconnected
- Match started
- Prepare state updated
- Turn plan accepted
- Turn resolution completed
- Player eliminated
- Match ended

Clients should render from the latest authoritative state rather than maintaining independent gameplay truth.

## Turn Plan Submission

During the Turn Planning Phase:

- Each non-eliminated player may submit one turn plan.
- A player may replace their submitted plan until the planning window closes if the implementation supports it.
- The server tracks which players have submitted.
- Resolution begins when all required plans are submitted or the MVP timeout policy triggers.

The server SHALL pass submitted plans to the Gameplay System for validation and resolution.

## Timeout And Disconnect Policy

The MVP needs enough handling to keep playtests moving, but not a full reconnect system.

Recommended MVP policy:

- If a player disconnects before match start, they are removed from the room.
- If a player disconnects during a match, their next missing turn plan is treated as an empty plan.
- If a player misses multiple consecutive turn submissions, the match may eliminate them or keep submitting empty plans depending on the playtest build setting.

The exact policy should be finalized in the first networking feature doc.

## Error Handling

Networking errors SHOULD be clear enough for development and playtesting.

The server SHOULD return structured errors for:

- Room not found
- Room full
- Match already started
- Player not in room
- Invalid phase for action
- Invalid turn plan
- Duplicate player slot
- Unsupported message type

Gameplay validation errors SHOULD come from the Gameplay System and be relayed by the Networking System.

## Transport

The MVP likely needs a real-time bidirectional transport for turn submission and state broadcast.

WebSocket is the default recommendation for the MVP because it is simple, widely supported, and fits turn-based multiplayer well.

The exact transport choice belongs in technical design, but the system contract should remain:

- Client sends intent messages.
- Server broadcasts authoritative state messages.
- Gameplay rules remain independent from transport details.

## Testing Focus

Initial networking tests SHOULD cover:

- Room creation returns a usable room ID
- Players can join by room ID
- A room rejects a fifth player
- A match starts only with exactly 4 players
- Submitted turn plans are associated with the correct player
- Turn resolution waits for required submissions
- Authoritative state is broadcast after resolution
- Invalid phase messages are rejected

## Deferred Networking Systems

The MVP Networking System SHALL defer:

- Automated matchmaking
- Ranked queues
- Persistent accounts
- Reconnect state recovery
- Replay delivery
- Spectator support
- Party systems
- Region selection
- Production room scaling
