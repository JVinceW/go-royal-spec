# Decision: SpacetimeDB Authoritative Networking Direction

Date: 2026-04-29

## Status

Accepted for MVP architecture exploration. Revisit after a working multiplayer prototype and load test.

## Context

Go Royal is a turn-based 4-player strategy game. The MVP needs room creation, room join by ID, hidden simultaneous turn plan submission, deterministic turn resolution, and authoritative match-state broadcast.

The game does not require frame-by-frame object replication for the first playable build. The important network path is reliable intent submission and authoritative state/event synchronization.

## Decision

Use SpacetimeDB as the authoritative backend for the MVP networking model.

SpacetimeDB will own:

- Room and player-slot state
- Match state
- Hidden submitted turn plans in private/server-only tables
- Deterministic turn resolution through reducers
- Public match state and resolution events for client subscriptions

Unity will not use NGO as the source of network truth for MVP. Unity will render local GameObjects from SpacetimeDB state and resolution events.

## Transport

SpacetimeDB uses persistent WebSocket connections for client communication.

For Unity/C# clients, the client integration must call `DbConnection.FrameTick()` from the game loop so incoming subscription updates and reducer callbacks are processed.

## Rejected Or Deferred Alternatives

### Colyseus + SpacetimeDB Split

Deferred for MVP.

Colyseus can manage rooms well, but splitting live room authority between Colyseus and SpacetimeDB creates consistency risks. If used later, Colyseus should either own the full live match flow, or only perform matchmaking/assignment before handing off authority to SpacetimeDB.

### Unity Netcode for GameObjects

Deferred for MVP.

NGO is useful when Unity GameObjects are replicated by a Unity host or dedicated server. Go Royal's MVP should be data-first: reducers, tables, subscriptions, and deterministic resolution events.

## Initial SpacetimeDB Shape

Likely tables:

- `Room`
- `RoomPlayer`
- `Match`
- `MatchPlayer`
- `UnitState`
- `SubmittedTurnPlan` private
- `ResolutionEvent`

Likely reducers:

- `CreateRoom`
- `JoinRoom`
- `LeaveRoom`
- `StartMatch`
- `ChooseUnits`
- `PlaceUnits`
- `SubmitTurnPlan`
- `ResolveTurn`

## Risks And Follow-Up Checks

- SpacetimeDB does not provide a built-in Colyseus-style room system; Go Royal must implement its own room rules using tables and reducers.
- Reconnection behavior needs explicit application-level handling.
- Production suitability should be verified with multiplayer prototype tests and load tests before final commitment.
- If production scale or operations exceed SpacetimeDB's fit, revisit a dedicated match-worker architecture.
