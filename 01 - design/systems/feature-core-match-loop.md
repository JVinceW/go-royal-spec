# Feature System: Core Match Loop

## Purpose

This document defines the MVP core match loop for Project Go-Royale.

The core match loop is the backbone feature that connects gameplay and networking. It defines how a match begins, moves through setup, repeats turns, resolves eliminations, and ends with a winner.

## Source Documents

- [requirements-mvp.md](</E:/go-royal/01 - design/requirements-mvp.md>)
- [mvp-system-overview.md](</E:/go-royal/01 - design/systems/mvp-system-overview.md>)
- [gameplay-mvp-system.md](</E:/go-royal/01 - design/systems/gameplay-mvp-system.md>)
- [networking-mvp-system.md](</E:/go-royal/01 - design/systems/networking-mvp-system.md>)

## Feature Goal

The Core Match Loop SHALL let 4 players complete one MVP match from room start to winner declaration using the fixed default map, debug roster, simultaneous turns, deterministic resolution, and shrink-zone pressure.

## In Scope

- Match phase model
- Match start conditions
- Prepare Phase flow
- Turn Planning Phase flow
- Turn Resolution Phase flow
- Shrink resolution handoff
- Elimination checks
- Winner declaration
- Match end state

## Out of Scope

- Procedural map generation
- Full unit stat balancing
- Full combat formula detail
- Full room transport protocol
- Matchmaking
- Reconnect and replay
- Meta progression
- Cards
- Unit upgrades

## Match Phases

The MVP match SHALL use these phases:

| Phase | Owner | Purpose |
|---|---|---|
| `RoomSetup` | Networking | Host creates room and players join by room ID |
| `MatchStart` | Networking + Gameplay | Lock 4 players, assign slots, initialize match state |
| `Prepare` | Gameplay | Players choose and place starting units |
| `TurnPlanning` | Gameplay + Networking | Players submit simultaneous turn plans |
| `TurnResolution` | Gameplay | Resolve movement, combat, shrink, elimination |
| `MatchEnd` | Gameplay + Networking | Declare winner and broadcast final state |

The implementation MAY use different enum names, but the state machine SHALL preserve this phase order.

## Phase Transitions

```text
RoomSetup
  -> MatchStart
  -> Prepare
  -> TurnPlanning
  -> TurnResolution
  -> TurnPlanning
  -> ...
  -> MatchEnd
```

The match loops between `TurnPlanning` and `TurnResolution` until the win condition is met.

## Match Start Conditions

A match SHALL start only when:

- Exactly 4 players are present in the room.
- Each player has a unique player slot.
- The room is not already in an active match.
- The fixed default map can be loaded.

When the match starts, the system SHALL:

- Create the initial match state.
- Assign each player to one formation zone.
- Set the starting safe zone to the full 9x9 map.
- Set the turn number to 0.
- Transition to `Prepare`.
- Broadcast the initial match state to all players.

## Prepare Phase

The Prepare Phase exists to create the initial tactical position.

During `Prepare`, each player SHALL:

- Select starting units from the debug roster.
- Place selected units inside their assigned formation zone.
- Be prevented from placing units outside their formation zone.
- Be prevented from placing units on occupied cells.

The MVP SHOULD begin with a simple fixed starting budget or fixed starting unit count. The exact value belongs in the unit/combat feature doc.

The Prepare Phase SHALL complete when all 4 players are ready.

For early development builds, a debug command MAY force the Prepare Phase to complete after valid placements exist for all players.

## Turn Planning Phase

At the start of each `TurnPlanning` phase, the system SHALL:

- Increment or expose the current turn number consistently.
- Assign each non-eliminated player their AP budget.
- Clear submitted plans from the previous turn.
- Accept one current turn plan per non-eliminated player.

During `TurnPlanning`, each active player submits a `TurnPlan`.

A `TurnPlan` MAY include:

- Movement actions
- Attack actions

A `TurnPlan` SHALL NOT include:

- Card actions
- Upgrade actions
- Procedural map actions
- Meta progression actions

The Gameplay System SHALL validate each submitted plan before accepting it for resolution.

## Turn Plan Submission Rules

A submitted turn plan is valid only when:

- The submitting player is active.
- The match is in `TurnPlanning`.
- Every referenced unit belongs to the submitting player.
- Every referenced unit is alive at planning time.
- Total AP cost is within the player's AP budget.
- Every action is legal for the current match state.

The Networking System SHALL track which active players have submitted plans.

Resolution begins when:

- All active players have submitted valid plans, or
- The MVP timeout policy supplies empty plans for missing submissions.

## Empty Plans

An empty plan means the player takes no actions that turn.

The MVP MAY use empty plans for:

- Players who intentionally submit no actions
- Players who miss the turn timer
- Players temporarily disconnected during a match

Empty plans SHALL still count as submitted for turn resolution.

## Turn Resolution Phase

During `TurnResolution`, the Gameplay System SHALL resolve the accepted plans in this order:

1. Validate final plan set.
2. Resolve movement actions.
3. Resolve attack actions.
4. Resolve shrink zone.
5. Remove eliminated units.
6. Update player elimination state.
7. Check win condition.
8. Produce a resolution result.

No new player actions are accepted during `TurnResolution`.

## Movement Resolution Handoff

The Core Match Loop does not define every movement rule. It requires the movement subsystem to return:

- Final unit positions
- Canceled movements
- Movement validation errors, if any remain

For MVP, simultaneous movement conflicts SHOULD cancel all conflicting moves into the same destination cell.

## Combat Resolution Handoff

The Core Match Loop does not define every combat rule. It requires the combat subsystem to return:

- Damage results
- Units reduced to 0 HP or below
- Unit elimination events

For MVP, combat SHALL be deterministic and SHALL use the Infantry / Archer / Cavalry counter triangle.

## Shrink Resolution Handoff

After combat resolution, the Core Match Loop SHALL call shrink resolution.

Shrink resolution SHALL:

- Advance the safe-zone boundary when the shrink schedule requires it.
- Identify units outside the new safe zone.
- Eliminate units outside the safe zone.
- Return shrink elimination events.

The MVP SHOULD use the sequence:

```text
9x9 -> 7x7 -> 5x5 -> 3x3
```

## Elimination Rules

After all unit eliminations for a turn are applied:

- A player with no surviving units SHALL become eliminated.
- Eliminated players SHALL not submit future turn plans.
- Eliminated players SHALL remain in match state for display and final results.

If multiple players are eliminated in the same turn, their relative placement can be deferred for MVP unless the UI requires exact placement ordering.

## Win Condition

The match SHALL end when exactly one player remains active with at least one surviving unit.

When the win condition is met, the system SHALL:

- Set the match phase to `MatchEnd`.
- Mark the remaining active player as winner.
- Preserve final unit and player state for display.
- Broadcast the final match state.

## Match End State

The MVP match end state SHALL include:

- Winner player ID
- Final player statuses
- Final unit state
- Final turn number

The MVP match end state SHOULD include final placement ordering if it is easy to derive from elimination order.

Post-match rewards, XP, currencies, rank changes, and progression are deferred.

## State Events

The implementation SHOULD produce readable events for debugging and UI display.

Useful MVP events include:

- `MatchStarted`
- `PrepareCompleted`
- `TurnPlanSubmitted`
- `TurnResolutionStarted`
- `MoveApplied`
- `MoveCanceled`
- `AttackResolved`
- `UnitEliminated`
- `SafeZoneShrunk`
- `PlayerEliminated`
- `MatchEnded`

Events SHOULD be derived from authoritative resolution, not client guesses.

## Testing Focus

The Core Match Loop should be testable without real networking.

Initial tests SHOULD cover:

- Match cannot start with fewer than 4 players.
- Match starts with exactly 4 players.
- Match start creates formation-zone assignments.
- Prepare cannot complete with invalid unit placement.
- Turn planning accepts one valid plan per active player.
- Turn resolution starts when all active players have submitted plans.
- Empty plans allow the match to continue.
- Eliminated players do not block future turn resolution.
- Match ends when only one player remains.
- Match end preserves winner and final state.

## Open Decisions For Implementation Planning

These decisions should be locked before code implementation:

- Whether Prepare Phase uses a timer, ready button, or both
- Starting unit count or starting purchase budget
- Turn timer duration for MVP playtests
- Exact empty-plan policy for disconnected players
- Whether elimination placement ordering is required in the first UI
