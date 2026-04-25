# MVP System Implementation Order

## Purpose

This document records the recommended system build order for Project Go-Royale MVP implementation.

The order prioritizes a deterministic local gameplay simulation before networking, scene polish, or multiplayer UI. This keeps the core tactical rules testable and gives the networking layer a stable authoritative state model to wrap.

## Implementation Order

### 1. Core Gameplay Rules Foundation

Implement the shared primitives used by every later system:

- Grid coordinates
- Fixed 9x9 map
- Formation zones
- Player slots
- Safe zone model
- Unit type identifiers

### 2. MVP Balance And Unit Definitions

Define the debug roster and first-pass tuning values:

- Infantry, Archer, and Cavalry
- HP, attack, movement range, and attack range
- AP costs for movement and attacks
- Deterministic counter triangle:
  - Infantry counters Archer
  - Archer counters Cavalry
  - Cavalry counters Infantry

### 3. Match State System

Create the authoritative local state model:

- Players
- Units
- Turn number
- Shrink step
- Active and eliminated player state
- Current safe zone
- Winner state

### 4. Prepare Phase And Initial Setup

Implement initial match setup:

- Create a 4-player match
- Assign each player a formation zone
- Spawn or place starting units
- Validate placement inside formation zones
- Lock the initial formation before turn planning begins

### 5. Turn Plan Validation

Validate player intent before resolution:

- Submitting player is active
- Referenced unit belongs to that player
- Referenced unit is alive
- Movement destination or attack target is legal
- Total AP cost does not exceed the turn budget

### 6. Movement Resolution

Resolve movement deterministically:

- Apply valid movement
- Reject invalid or blocked cells
- Keep positions unchanged until resolution
- Cancel simultaneous movement conflicts into the same destination cell

### 7. Combat Resolution

Resolve attacks deterministically:

- Validate attack range
- Apply base damage
- Apply counter bonus
- Remove units whose HP reaches zero or below
- Avoid damage rolls, critical hits, miss chance, or other randomness

### 8. Shrink Zone Resolution

Apply match pressure after turn actions:

- Advance the safe zone on the MVP schedule
- Mark safe and unsafe cells
- Eliminate units outside the active safe zone after shrink resolution

### 9. Elimination And Win Condition

Finalize player state after unit removals:

- Eliminate players with no surviving units
- Prevent eliminated players from submitting future plans
- End the match when only one player remains
- Preserve winner and final match state

### 10. Core Match Loop

Connect the rule systems into the full local loop:

- Prepare phase
- Turn planning
- Turn resolution
- Shrink resolution
- Elimination checks
- Match end

### 11. Local Debug UI Or Test Harness

Build a simple way to exercise the rules before real networking:

- Render board state simply
- Submit mock turn plans
- Show AP, HP, ownership, safe zone, and winner state
- Support fast local playtesting and debugging

### 12. Networking Room Flow

Add the minimal multiplayer session wrapper:

- Host creates room
- Generate and display room ID
- Join by room ID
- Require exactly 4 players to start
- Assign player slots

### 13. Networked Turn Submission

Connect multiplayer intent to the authoritative gameplay rules:

- Clients submit turn plans
- Host or server validates plans
- Resolve only when all active players have submitted or timed out
- Broadcast authoritative results to all clients

### 14. Multiplayer Match UI

Build the playable multiplayer presentation after the rule and session systems are stable:

- Room screen
- Prepare screen
- Turn planning UI
- Resolution feedback
- Match end screen

## Guiding Rule

Build the game as a deterministic local simulation first, then add multiplayer transport around it, then polish the player-facing UI.

