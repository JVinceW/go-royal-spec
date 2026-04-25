# Feature System: Turn Resolution

## Purpose

This document defines implementation-ready MVP rules for simultaneous turn planning and deterministic turn resolution.

Turn resolution connects the map, units, combat, shrink zone, and multiplayer submission flow into one repeatable sequence.

## Source Documents

- [requirements-mvp.md](</E:/go-royal/01 - design/requirements-mvp.md>)
- [gameplay-mvp-system.md](</E:/go-royal/01 - design/systems/gameplay-mvp-system.md>)
- [feature-core-match-loop.md](</E:/go-royal/01 - design/systems/feature-core-match-loop.md>)
- [feature-default-map.md](</E:/go-royal/01 - design/systems/feature-default-map.md>)
- [feature-units-combat.md](</E:/go-royal/01 - design/systems/feature-units-combat.md>)

## Feature Goal

The Turn Resolution system SHALL let all active players submit plans simultaneously, validate those plans against configurable tuning data, and resolve the turn deterministically.

## In Scope

- AP budget defaults
- Turn plan structure
- Plan validation
- Movement action resolution
- Movement conflict handling
- Attack action resolution
- Simultaneous combat behavior
- Shrink-zone timing
- Elimination check handoff
- Resolution events

## Out of Scope

- Cards
- Unit upgrades
- Terrain movement cost modifiers
- Terrain combat modifiers
- Multi-action skills
- Reconnect and replay
- Client animation timing
- Matchmaking

## Configurable Turn Values

The MVP SHALL keep turn and action values configurable.

Recommended defaults:

| Parameter | Default |
|---|---:|
| AP per player per turn | 6 |
| Move action AP cost | 1 |
| Attack action AP cost | 2 |
| Turn timer | 45 seconds |
| Max movement actions per unit per turn | 1 |
| Max attack actions per unit per turn | 1 |

These values are starting points for playtesting, not hardcoded constants.

## Turn Plan Structure

A `TurnPlan` represents one player's complete submitted plan for one turn.

Conceptual shape:

```text
TurnPlan
  player_id
  turn_number
  actions[]
```

Supported MVP action types:

```text
MoveAction
  unit_id
  destination

AttackAction
  attacker_unit_id
  target_unit_id
```

The MVP SHALL NOT support cards, upgrades, skills, or terrain-modification actions in a turn plan.

## Planning Rules

During `TurnPlanning`:

- Every active player may submit one valid turn plan.
- A player may submit an empty plan.
- A player may replace their plan before the planning window closes if the implementation supports it.
- Eliminated players do not submit plans.
- No submitted action changes the match state until `TurnResolution`.

## Plan Validation

The system SHALL validate each submitted plan before accepting it.

A plan is valid only when:

- The match is in `TurnPlanning`.
- The submitting player is active.
- The plan's `turn_number` matches the current match turn.
- Every referenced unit belongs to the submitting player where ownership is required.
- Every acting unit is alive at planning time.
- Every action type is supported in MVP.
- Total AP cost is less than or equal to the player's AP budget.
- Each unit has no more than one move action.
- Each unit has no more than one attack action.
- Each movement action has a valid destination.
- Each attack action has a valid target and range.

Invalid plans SHALL be rejected with a reason.

## AP Cost Calculation

Recommended MVP AP costs:

```text
move_action_cost = 1
attack_action_cost = 2
player_turn_budget = 6
```

Example:

```text
Move Infantry = 1 AP
Attack with Infantry = 2 AP
Move Archer + Attack with Archer = 3 AP
Move all 3 starting units = 3 AP
Attack with all 3 starting units = 6 AP
```

This lets the default 3-unit roster take meaningful actions without making turns too long.

## Movement Validation

A movement action is valid only when:

- The acting unit belongs to the submitting player.
- The acting unit is alive.
- The destination is inside the 9x9 map.
- The destination is inside the current safe zone at planning time.
- The destination is not occupied at planning time, unless the occupying unit is also moving away in the same resolution step.
- The destination is within the unit's configured move range.
- The player has enough AP for the action.

Movement distance SHALL use Manhattan distance:

```text
distance = abs(start.row - destination.row) + abs(start.col - destination.col)
```

## Movement Resolution Order

Movement resolves before attacks.

The MVP movement resolution sequence SHALL be:

1. Collect all accepted movement actions.
2. Reject actions whose unit is no longer alive at movement resolution start.
3. Determine each unit's intended destination.
4. Detect destination conflicts.
5. Cancel all conflicting moves.
6. Apply non-conflicting moves simultaneously.
7. Emit movement events.

## Movement Conflict Rules

A movement conflict occurs when:

- Two or more units attempt to end movement on the same destination cell.
- A unit attempts to move into a cell occupied by a unit that is not moving away.
- Two units attempt to swap cells in the same movement step.

When a movement conflict occurs:

- All conflicting moves are canceled.
- Each canceled unit remains in its original cell.
- The turn continues.

This rule is intentionally simple for MVP and should be easy for players to understand.

## Attack Validation

An attack action is valid only when:

- The attacker belongs to the submitting player.
- The attacker is alive at planning time.
- The target exists at planning time.
- The target belongs to another player.
- The target is within the attacker's configured range after movement resolution.
- The player has enough AP for the action.

Because movement resolves before attacks, attack range SHALL be checked against post-movement positions during resolution.

If an attack target is eliminated before attack resolution begins, the attack is canceled.

## Attack Resolution Order

The MVP attack resolution sequence SHALL be:

1. Collect all accepted attack actions.
2. Remove attacks from units that are dead before attack resolution starts.
3. Re-check target existence and post-movement range.
4. Calculate damage for every remaining attack.
5. Apply all calculated damage.
6. Eliminate units with HP at or below 0.
7. Emit combat events.

Damage calculation SHALL use the attack + HP model defined in [feature-units-combat.md](</E:/go-royal/01 - design/systems/feature-units-combat.md>).

## Simultaneous Combat Rule

All valid attacks in one attack-resolution step are treated as simultaneous.

A unit alive at the start of attack resolution may still deal damage even if incoming damage from the same step also eliminates it.

This supports readable mutual eliminations and avoids hidden initiative rules in MVP.

## Shrink Resolution

Shrink resolves after movement and combat.

The MVP shrink sequence is:

```text
start: 9x9
after Turn 1: 7x7
after Turn 2: 5x5
after Turn 3: 3x3
after Turn 4+: remain 3x3
```

After the safe zone changes, every surviving unit outside the new safe zone SHALL be eliminated.

Shrink eliminations happen before player elimination and win-condition checks.

## Turn Resolution Sequence

The full MVP turn resolution sequence SHALL be:

1. Close plan submission.
2. Fill missing active-player plans with empty plans.
3. Transition match phase to `TurnResolution`.
4. Resolve movement.
5. Resolve attacks.
6. Resolve shrink zone.
7. Remove eliminated units from active play.
8. Update player elimination state.
9. Check win condition.
10. Increment or prepare the next turn state.
11. Broadcast the authoritative resolution result.

No client action can modify the match state during this sequence.

## Missing Plan Policy

For MVP playtests, a missing plan SHOULD become an empty plan when the turn timer expires.

Recommended default:

```text
turn_timer_seconds = 45
missing_plan = empty_plan
```

Repeated missing plans are handled by the room multiplayer policy, not by turn resolution itself.

## Resolution Events

Turn resolution SHOULD emit events in deterministic order.

Recommended event categories:

- `TurnResolutionStarted`
- `MoveApplied`
- `MoveCanceled`
- `AttackResolved`
- `DamageApplied`
- `UnitEliminated`
- `SafeZoneShrunk`
- `PlayerEliminated`
- `TurnResolutionCompleted`
- `MatchEnded`

Events should be useful for UI animation, debugging, and future replay work, even though replay is deferred.

## Testing Focus

Initial tests SHOULD cover:

- A plan exceeding AP budget is rejected.
- A plan with unsupported action type is rejected.
- A unit cannot move more than once per turn.
- A unit cannot attack more than once per turn.
- Movement uses Manhattan distance.
- Movement outside the map is rejected.
- Movement outside configured move range is rejected.
- Conflicting moves to the same destination are canceled.
- Cell swaps are canceled.
- Non-conflicting moves apply simultaneously.
- Attacks use post-movement positions.
- Out-of-range attacks after movement are canceled.
- Simultaneous attacks can eliminate both units.
- Shrink happens after combat.
- Units outside the new safe zone are eliminated.
- Missing plans become empty plans when timeout policy triggers.

## Open Decisions For Implementation Planning

These decisions should be confirmed when coding starts:

- Whether invalid attack actions after movement are reported as canceled events or validation errors
- Whether the client previews post-movement attack validity before submission
- Whether all events are stored in match state or returned only as resolution output
