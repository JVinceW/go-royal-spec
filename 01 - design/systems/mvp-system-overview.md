# MVP System Overview

## Purpose

This document defines the first system-level shape of Project Go-Royale MVP.

It is based on [requirements-mvp.md](</E:/go-royal/01 - design/requirements-mvp.md>) and intentionally avoids relying on the older [design.md](</E:/go-royal/01 - design/design.md>) as a source of truth. Material from the older design can be reused later only when it still matches the MVP scope.

## MVP System Goal

The MVP system SHALL prove that 4 players can complete a short tactical match with:

- A fixed 9x9 test map
- A debug unit roster of Infantry, Archer, and Cavalry
- Simultaneous turn planning
- Deterministic movement and combat
- Shrink-zone pressure
- Room-based multiplayer without matchmaking

The MVP system SHALL keep gameplay rules and networking/session transport separated enough that each can be developed and tested independently.

## System Boundaries

### Gameplay System

The Gameplay System owns all match rules and deterministic state transitions:

- Fixed map definition
- Player formation zones
- Unit definitions and stats
- Unit placement
- AP budget validation
- Movement validation and resolution
- Combat validation and resolution
- Counter relationships
- Shrink-zone resolution
- Player elimination
- Winner declaration

The Gameplay System SHALL be deterministic. Given the same starting state and same submitted turn plans, it SHALL produce the same resulting match state.

### Networking System

The Networking System owns the minimal multiplayer flow required to run a real MVP match:

- Host-created room
- Room ID generation
- Player join by room ID
- Player readiness / match start
- Turn plan submission
- Broadcast of authoritative match state
- Basic disconnect / timeout handling for MVP

The Networking System SHALL not own gameplay rule decisions. It passes player intent into the Gameplay System and distributes the authoritative result.

## Authoritative Model

The MVP SHOULD use an authoritative host/server model.

The authoritative process owns the canonical match state and is responsible for:

- Validating room membership
- Starting the match
- Accepting turn plans
- Calling the Gameplay System to resolve turns
- Broadcasting state updates to all clients

Clients MAY preview local plans for usability, but the authoritative process SHALL make final decisions about validity and resolution.

## Match Lifecycle

The MVP match lifecycle is:

1. Host creates a room.
2. Other players join by room ID.
3. Match starts when exactly 4 players are present.
4. The fixed default map is loaded.
5. Players complete the Prepare Phase.
6. Players repeatedly submit simultaneous turn plans.
7. The authoritative process resolves turns through the Gameplay System.
8. The match ends when one player remains with surviving units.

## Data Flow

At a high level:

1. A player submits an intent, such as placement or a turn plan.
2. The Networking System receives the intent and associates it with a player.
3. The Gameplay System validates whether the intent is legal for the current match state.
4. The Gameplay System returns either a validation error or a new match state.
5. The Networking System broadcasts the accepted state or error result.

## Core Data Objects

The MVP system SHOULD define these core objects before implementation:

- `Room`
- `Player`
- `MatchState`
- `Map`
- `Cell`
- `FormationZone`
- `Unit`
- `UnitType`
- `TurnPlan`
- `Action`
- `MovementAction`
- `AttackAction`
- `SafeZone`
- `ResolutionResult`

Exact programming-language types belong in the later technical design or implementation plan.

## Deferred Systems

The MVP system SHALL leave the following outside the first system design:

- Procedural map generation
- Cards
- Unit upgrades
- Full shop economy
- Matchmaking
- Ranked play
- Meta progression
- Monetization
- Reconnect and replay systems

## System Document Map

The initial system docs are:

- [gameplay-mvp-system.md](</E:/go-royal/01 - design/systems/gameplay-mvp-system.md>)
- [networking-mvp-system.md](</E:/go-royal/01 - design/systems/networking-mvp-system.md>)
- [feature-core-match-loop.md](</E:/go-royal/01 - design/systems/feature-core-match-loop.md>)
- [feature-default-map.md](</E:/go-royal/01 - design/systems/feature-default-map.md>)
- [feature-units-combat.md](</E:/go-royal/01 - design/systems/feature-units-combat.md>)
- [feature-turn-resolution.md](</E:/go-royal/01 - design/systems/feature-turn-resolution.md>)
- [feature-room-multiplayer.md](</E:/go-royal/01 - design/systems/feature-room-multiplayer.md>)

Later feature docs should reference these system docs and stay inside the MVP boundary unless the requirements are updated first.
