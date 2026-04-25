# Gameplay MVP System

## Purpose

This document defines the MVP Gameplay System for Project Go-Royale.

The Gameplay System owns deterministic match rules. It does not own matchmaking, transport, persistence, accounts, monetization, or meta progression.

## Design Goals

The MVP Gameplay System SHALL:

- Validate the tactical feel of a 4-player battle on a 9x9 grid
- Make positioning and unit counters matter before adding cards or upgrades
- Resolve all movement and combat deterministically
- Support multiplayer turn plans without depending on networking implementation details
- Be testable as a standalone rules engine

## Match State Ownership

The Gameplay System owns the canonical `MatchState` structure used during a match.

The match state SHOULD include:

- Match phase
- Turn number
- Fixed map and safe-zone boundary
- Player list and player status
- Unit list
- Unit positions
- Unit HP
- Current AP budgets
- Submitted turn plans for the current turn
- Elimination and winner state

The Gameplay System SHALL expose operations that accept a current match state and an intent, then return either an error or an updated match state.

## Phases

### Prepare Phase

During the Prepare Phase:

- Each player chooses units from the MVP debug roster.
- Each player places chosen units inside their assigned formation zone.
- Placement outside the assigned formation zone is rejected.
- Placement onto an occupied cell is rejected.
- The phase ends when all required setup is complete or when the MVP timer policy advances the match.

### Turn Planning Phase

During the Turn Planning Phase:

- Each non-eliminated player receives an AP budget.
- Each non-eliminated player submits one turn plan.
- Turn plans may contain movement actions and attack actions.
- A submitted plan is accepted only if it passes validation.
- No unit positions or HP values change until resolution begins.

### Turn Resolution Phase

During the Turn Resolution Phase:

- The Gameplay System resolves all accepted plans.
- Movement resolves before attacks.
- Attacks resolve after movement.
- Shrink-zone elimination resolves after combat.
- Player elimination and winner checks happen after shrink-zone resolution.

## Fixed Default Map

The MVP uses one fixed 9x9 map.

The map SHOULD be defined as data, not generated procedurally. This lets the team adjust the test battlefield quickly during playtesting.

The default map SHALL include:

- 9 rows
- 9 columns
- 4 formation zones
- A starting safe zone covering the full 9x9 grid
- Enough open space to test approach, retreat, blocking, and forced center conflict

Terrain effects are not required for the first gameplay system unless the implementation team explicitly pulls them into the first development slice.

## Formation Zones

Each player starts in one corner region of the map.

The MVP SHOULD use simple 3x3 or 4x4 corner formation zones. The exact shape belongs in the default map feature doc.

The Gameplay System SHALL enforce that each player can place units only in their assigned formation zone during the Prepare Phase.

## MVP Unit Roster

The MVP debug roster contains:

- Infantry
- Archer
- Cavalry

All players have access to the same roster.

The MVP SHALL use base units only. Unit upgrades, tier scaling, Mage, Scout, and Siege are deferred.

## Counter Model

The MVP counter triangle is:

- Infantry counters Archer
- Archer counters Cavalry
- Cavalry counters Infantry

Counter bonuses SHALL be deterministic.

The exact damage multiplier can be tuned later, but the system SHOULD start with a single counter multiplier value applied consistently across the triangle.

## AP Model

Each player receives a per-turn AP budget.

The Gameplay System SHALL validate that:

- Every action has an AP cost.
- A turn plan cannot exceed the player's AP budget.
- A unit cannot perform actions if it has been eliminated before the action would resolve.

Exact AP values are tuning data and should live in a balancing table or configuration file once implementation begins.

## Movement Resolution

Movement actions SHALL be validated before resolution.

A movement action is valid only when:

- The acting unit belongs to the submitting player.
- The acting unit is alive.
- The destination cell is inside the map.
- The destination cell is inside the currently active safe zone during planning.
- The destination cell is not blocked by a permanent map restriction.
- The player has enough AP for the move.

For MVP simultaneous movement conflicts:

- If multiple units attempt to end movement on the same cell, all conflicting moves are canceled.
- Units with canceled moves remain in their previous cells.
- Non-conflicting moves are applied.

This rule is simple, readable, and good enough for first gameplay validation.

## Combat Resolution

Attack actions SHALL be validated before resolution.

An attack action is valid only when:

- The attacker belongs to the submitting player.
- The attacker is alive.
- The target unit exists.
- The target unit is owned by another player.
- The target is within the attacker's range.
- The player has enough AP for the attack.

Combat SHALL resolve without output randomness.

The MVP combat formula SHOULD start simple:

```text
damage = attacker_attack * counter_multiplier
```

The implementation may add defense later if it is needed for tuning, but first playable validation should keep the formula easy to reason about.

If a unit's HP reaches 0 or lower, that unit is eliminated.

## Attack Ranges

The MVP SHOULD use distinct ranges to make positioning matter:

- Infantry: adjacent melee attack
- Cavalry: adjacent melee attack
- Archer: ranged attack with a minimum distance restriction

Exact range values belong in the first balancing table.

## Shrink Zone

The shrink zone forces conflict over time.

The MVP SHOULD use this sequence:

- Start: 9x9
- After shrink 1: 7x7
- After shrink 2: 5x5
- After shrink 3: 3x3

Shrink resolution happens after movement and combat.

Any surviving unit outside the safe zone after shrink resolution SHALL be eliminated.

## Elimination And Victory

A player is eliminated when they control no surviving units.

Eliminated players:

- Do not submit future turn plans
- Do not block match completion
- Remain visible in match summary state

The winner is the only player who remains with at least one surviving unit.

## Testing Focus

The Gameplay System should be testable without networking.

Initial tests SHOULD cover:

- Legal and illegal formation placement
- AP budget validation
- Movement into valid and invalid cells
- Movement conflict cancellation
- Counter multiplier application
- Deterministic combat results
- Unit elimination
- Shrink-zone elimination
- Winner declaration

## Open Tuning Items

These are intentionally left for feature docs and playtesting:

- Starting unit count
- Starting unit selection rules
- Exact AP budget
- Exact movement AP costs
- Exact unit HP and attack values
- Exact Archer range
- Exact default map layout
