# Project Go-Royale MVP Requirements

## Document Purpose

This document defines the first playable MVP requirements for Project Go-Royale.

It is intentionally narrower than the original [requirements.md](</E:/go-royal/01 - design/requirements.md>) and is based on:

- The project vision in [Project-Go-Royale-GDD-1Page.md](</E:/go-royal/01 - design/Project-Go-Royale-GDD-1Page.md>)
- Later discussion that split the project into `Gameplay` and `Networking`
- A deliberate MVP scope cut focused on validating the core tactical loop first

This file does not replace the original requirements document. It exists as a new baseline for MVP development planning and later comparison.

---

## MVP Product Direction

Project Go-Royale MVP is a multiplayer tactical prototype focused on proving the core game loop and game feel before expanding into broader systems.

The MVP SHALL prioritize:

- Positional tactics on a fixed test map
- Deterministic combat and visible counter relationships
- Simultaneous turn planning between 4 players
- Shrink-zone pressure that forces conflict
- Lightweight multiplayer session flow through host-created rooms

The MVP SHALL NOT prioritize:

- Procedural map generation
- Card systems
- Unit upgrades
- Matchmaking
- Ranked progression
- Meta progression
- Monetization
- Reconnect, replay, or advanced room management

---

## Gameplay / Networking Split

The MVP requirements are split into two coordinated domains:

- **Gameplay**: Rules of play, units, map, turn structure, combat, elimination
- **Networking**: Minimal multiplayer requirements needed to create and run a real 4-player match

This split is intended to support later feature-by-feature development documentation.

---

## Glossary

- **Game**: The Project Go-Royale MVP application.
- **Match**: One complete playable session from room creation to winner declaration.
- **Host**: The player who creates a room.
- **Room**: A pre-match multiplayer session identified by a room ID.
- **Player**: A human participant in a match.
- **Map**: The fixed default battlefield used in MVP.
- **Cell**: A single square on the battlefield grid.
- **Formation Zone**: The map area assigned to one player for initial deployment.
- **Unit**: A controllable battlefield piece owned by one player.
- **Unit Type**: One of the debug MVP unit archetypes: Infantry, Archer, Cavalry.
- **Action Points (AP)**: The per-turn budget used to move and attack.
- **Turn Plan**: A player’s full set of actions submitted for one turn.
- **Safe Zone**: The currently active playable area of the battlefield.
- **Shrink Zone**: The mechanic that removes outer rings of the battlefield over time.
- **Counter Relationship**: A deterministic advantage relationship between unit types.

---

## MVP Scope Summary

### In Scope

- 4-player multiplayer matches
- Host-created room flow
- Join-by-room-ID flow
- Fixed default map
- Prepare phase
- Base units only
- Debug roster of Infantry, Archer, Cavalry
- Simultaneous turn submission
- Deterministic movement and combat resolution
- Shrink zone
- Elimination and win condition flow

### Out of Scope

- Procedural map generation
- Cards
- Unit upgrades
- Shop refresh complexity beyond MVP needs
- Matchmaking and rank bands
- Meta progression and persistent economy
- Cosmetics and monetization
- Reconnect support
- Replay support
- AFK automation beyond minimal timeout handling

---

## Requirements

### Requirement 1: Match Structure

**User Story:** As a player, I want a short and understandable multiplayer match structure so that I can quickly play and evaluate the game’s tactical loop.

#### Acceptance Criteria

1. THE Game SHALL support exactly 4 players in one match.
2. THE Game SHALL execute phases in this order: Room Setup -> Match Start -> Prepare Phase -> Turn Loop -> Match End.
3. THE Game SHALL end the match when only one player still controls at least one surviving unit on the map.
4. THE Game SHALL present a clear winner at match end.
5. THE MVP match flow SHALL be short enough to support repeated playtesting of the core loop.

---

### Requirement 2: Multiplayer Session Flow

**User Story:** As a player, I want to create or join a match with minimal setup so that multiplayer testing is easy without full matchmaking infrastructure.

#### Acceptance Criteria

1. THE Game SHALL allow one player to create a room as host.
2. WHEN a room is created, THE Game SHALL generate a room ID that can be shared with other players.
3. THE Game SHALL allow other players to join a room by entering the room ID.
4. THE Game SHALL allow a match to begin only when exactly 4 players are present in the room.
5. THE Game SHALL identify all players in the room before match start.
6. THE MVP SHALL NOT require automated matchmaking to start a match.

---

### Requirement 3: Fixed Default Map

**User Story:** As a designer and player, I want a fixed default map for MVP so that gameplay rules and game feel can be tested before procedural map generation is defined.

#### Acceptance Criteria

1. THE Game SHALL use a single fixed default map in MVP.
2. THE default map SHALL use a 9x9 grid.
3. THE default map SHALL be identical across all MVP matches.
4. THE default map SHALL define one starting formation zone for each of the 4 players.
5. THE default map SHALL be sufficient to test movement, positioning, combat, and shrink-zone pressure.
6. THE MVP SHALL NOT depend on procedural map generation.

---

### Requirement 4: Prepare Phase

**User Story:** As a player, I want a setup phase before combat begins so that I can choose my starting force and initial formation.

#### Acceptance Criteria

1. WHEN a match begins, THE Game SHALL enter a Prepare Phase before the first turn.
2. DURING the Prepare Phase, THE Game SHALL allow each player to choose units from the MVP debug roster.
3. DURING the Prepare Phase, THE Game SHALL allow each player to place their chosen units only within their assigned formation zone.
4. THE Game SHALL prevent unit placement outside the assigned formation zone during the Prepare Phase.
5. WHEN the Prepare Phase ends, THE Game SHALL lock all starting formations and begin the Turn Loop.

---

### Requirement 5: MVP Unit Roster

**User Story:** As a designer, I want a small debug roster first so that the team can validate positioning and counters before adding complexity.

#### Acceptance Criteria

1. THE Game SHALL include exactly 3 unit types in the MVP debug roster: Infantry, Archer, Cavalry.
2. THE Game SHALL make the same MVP debug roster available to all 4 players.
3. THE MVP SHALL use base units only.
4. THE MVP SHALL NOT include in-match unit upgrades.
5. THE MVP SHALL NOT include Mage, Scout, or Siege in the first playable build.

---

### Requirement 6: Counter Relationships

**User Story:** As a player, I want clear counter relationships between the MVP units so that composition and positioning choices matter.

#### Acceptance Criteria

1. THE Game SHALL implement a deterministic counter triangle for the MVP roster.
2. Infantry SHALL counter Archer.
3. Archer SHALL counter Cavalry.
4. Cavalry SHALL counter Infantry.
5. THE Game SHALL expose these counter relationships clearly in the game UI.
6. THE Game SHALL resolve counter bonuses without randomness.

---

### Requirement 7: Turn Structure

**User Story:** As a player, I want simultaneous turn planning so that the game feels tense and prediction-based rather than purely reactive.

#### Acceptance Criteria

1. THE Game SHALL use simultaneous turn submission for all 4 players.
2. DURING each turn, every player SHALL submit one turn plan before resolution begins.
3. THE Game SHALL not resolve any player’s actions until the turn submission phase has ended.
4. WHEN all required turn plans are submitted, THE Game SHALL resolve the turn for all players.
5. THE turn loop SHALL repeat until the win condition is met.

---

### Requirement 8: Action Points

**User Story:** As a player, I want a shared action budget each turn so that every action requires a meaningful tradeoff.

#### Acceptance Criteria

1. THE Game SHALL assign an AP budget to each player at the start of every turn.
2. THE Game SHALL require movement and attacks to consume AP.
3. THE Game SHALL prevent a player from submitting actions whose total AP cost exceeds the allowed budget.
4. THE Game SHALL display the current AP budget during turn planning.
5. THE final AP values for MVP tuning MAY be adjusted during playtesting, but the AP budget model itself SHALL exist in MVP.

---

### Requirement 9: Movement

**User Story:** As a player, I want to move units on the grid so that positioning is the heart of gameplay.

#### Acceptance Criteria

1. THE Game SHALL allow units to move between valid map cells by spending AP.
2. THE Game SHALL prevent movement to invalid or blocked cells.
3. THE Game SHALL resolve movement deterministically.
4. THE Game SHALL update unit positions only after turn resolution begins.
5. THE Game SHALL make unit positioning readable during and after resolution.

---

### Requirement 10: Combat Resolution

**User Story:** As a player, I want combat to resolve deterministically so that I can learn from outcomes and make informed tactical decisions.

#### Acceptance Criteria

1. THE Game SHALL allow units to perform attacks during turn planning.
2. THE Game SHALL resolve attacks deterministically.
3. THE Game SHALL apply counter relationships during combat resolution.
4. THE Game SHALL NOT use output randomness such as damage rolls, critical hits, or miss chance in MVP combat.
5. WHEN a unit’s health reaches zero or lower, THE Game SHALL remove that unit from the battlefield.
6. THE MVP combat model SHALL be sufficient to evaluate positioning and counter-play between Infantry, Archer, and Cavalry.

---

### Requirement 11: Shrink Zone

**User Story:** As a player, I want the safe area to shrink over time so that the match is forced toward conflict and conclusion.

#### Acceptance Criteria

1. THE Game SHALL implement a shrink-zone system in MVP.
2. THE shrink zone SHALL reduce the playable battlefield over time.
3. THE Game SHALL indicate which cells are safe and which cells are outside the active safe zone.
4. WHEN a unit ends shrink resolution outside the safe zone, THE Game SHALL eliminate that unit.
5. THE shrink-zone system SHALL be active in all MVP matches.

---

### Requirement 12: Elimination and Victory

**User Story:** As a player, I want clear elimination and victory rules so that the outcome of the match is always understandable.

#### Acceptance Criteria

1. WHEN a player has no surviving units on the battlefield, THE Game SHALL eliminate that player from the match.
2. ELIMINATED players SHALL no longer submit turn plans.
3. WHEN only one player remains non-eliminated, THE Game SHALL declare that player the winner.
4. THE Game SHALL clearly display player elimination and final victory.

---

### Requirement 13: Information Clarity

**User Story:** As a player, I want to clearly understand the battlefield state so that my decisions are based on visible information rather than hidden rules.

#### Acceptance Criteria

1. THE Game SHALL display the full battlefield grid during the match.
2. THE Game SHALL display unit ownership and battlefield position clearly.
3. THE Game SHALL display unit health clearly.
4. THE Game SHALL display the current safe zone clearly.
5. THE Game SHALL display the AP budget during turn planning.
6. THE Game SHALL display or otherwise communicate the MVP counter relationships clearly.

---

### Requirement 14: Deferred Systems Boundary

**User Story:** As a development team, we want a clear MVP boundary so that implementation stays focused on validating the core loop first.

#### Acceptance Criteria

1. THE MVP SHALL NOT require procedural map generation.
2. THE MVP SHALL NOT require a card system.
3. THE MVP SHALL NOT require unit upgrades.
4. THE MVP SHALL NOT require automated matchmaking.
5. THE MVP SHALL NOT require meta progression systems.
6. THE MVP SHALL NOT require monetization systems.
7. THE MVP SHALL NOT require reconnect or replay support.

---

## Notes For Next Documents

This MVP requirements file is intended to feed the next layer of documentation:

- Feature-split development specs for `gameplay`
- Feature-split development specs for `networking`
- A fresh technical `design.md` written later from the stable MVP requirements, reusing only valid material from the older reference design

Current MVP system docs:

- [mvp-system-overview.md](</E:/go-royal/01 - design/systems/mvp-system-overview.md>)
- [gameplay-mvp-system.md](</E:/go-royal/01 - design/systems/gameplay-mvp-system.md>)
- [networking-mvp-system.md](</E:/go-royal/01 - design/systems/networking-mvp-system.md>)
- [feature-core-match-loop.md](</E:/go-royal/01 - design/systems/feature-core-match-loop.md>)
- [feature-default-map.md](</E:/go-royal/01 - design/systems/feature-default-map.md>)
- [feature-units-combat.md](</E:/go-royal/01 - design/systems/feature-units-combat.md>)
- [feature-turn-resolution.md](</E:/go-royal/01 - design/systems/feature-turn-resolution.md>)
- [feature-room-multiplayer.md](</E:/go-royal/01 - design/systems/feature-room-multiplayer.md>)

Open items still expected to be refined in later docs:

- Exact Unity/server config storage format
- Exact client-side UI preview behavior
- Exact first-build disconnect elimination policy
- Exact production direction for split balance assets
