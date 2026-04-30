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

## Shared Contract Boundary

Shared server-client contract code must live outside both the Unity project root and the SpacetimeDB module folder.

Use a sibling shared source root, for example:

```text
E:\Unity\go-royal-client\
  shared\
    GoRoyal.Shared\
  go-royal-server\
  go-royal-unity\
```

The contract layer should contain only thin cross-runtime types such as:

- Stable IDs
- Enums
- Small value objects
- Command and DTO payload shapes
- Constants that are genuinely shared by client and server

The contract layer must not contain:

- UnityEngine types
- MonoBehaviours or ScriptableObjects
- UI view models
- SpacetimeDB reducer logic
- SpacetimeDB table definitions
- Unity package-specific build assumptions

### Unity Consumption

Unity should consume shared contracts through a thin local package wrapper, not by making the server-facing C# project itself into the Unity package.

This keeps Unity package metadata such as `package.json`, `.asmdef`, and `.meta` files out of the plain shared project boundary.

### Server Consumption

The SpacetimeDB server project must never depend on a Unity package wrapper.

If shared contract reuse is needed on the server side, the server may consume the plain shared C# project only. If the SpacetimeDB module toolchain proves brittle with external project references, keep the module self-contained and duplicate only the minimal types required inside the module boundary.

The important rule is:

- server can depend on shared plain C# code
- server must not depend on Unity package structure
- Unity may depend on a wrapper package built around the shared code

## Transport

SpacetimeDB uses persistent WebSocket connections for client communication.

For Unity/C# clients, the client integration must call `DbConnection.FrameTick()` from the game loop so incoming subscription updates and reducer callbacks are processed.

## Deployment Topology

Do not create a separate SpacetimeDB database instance for every room or match.

The default topology should be one shared SpacetimeDB production database, such as `go-royal-prod`, where each active game is represented as rows keyed by `room_id` and `match_id`.

All production clients connect to the same SpacetimeDB host and database, then subscribe only to the room, match, player, and event rows they are allowed to see.

Use separate SpacetimeDB databases for:

- Development, staging, and production environment isolation
- Future regional deployments if latency or compliance requires it
- Future sharding if load tests show a single production database is not enough

This means the game creates new `Room` and `Match` records for each game, not new database instances.

## Local Development Ownership

For local development, default to a stable logged-in SpacetimeDB identity instead of anonymous publish.

Local anonymous publish creates throwaway ownership that makes later admin actions such as `logs`, `delete`, and republish flows harder to manage. The preferred local workflow is:

1. reset local server state when needed
2. `spacetime login` in WSL
3. publish locally with non-anonymous ownership

Anonymous publish should be reserved for intentionally throwaway local databases only.

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
- If shared contract reuse on the SpacetimeDB side conflicts with module-build constraints, prefer preserving a stable module build over forcing strict DRY across client and server.
