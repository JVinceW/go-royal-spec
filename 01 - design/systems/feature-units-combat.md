# Feature System: Units And Combat

## Purpose

This document defines the MVP unit roster and deterministic combat model for Project Go-Royale.

The first playable build uses only attack and HP for combat so the team can validate positioning, ranges, counters, and game feel before adding defense, terrain bonuses, skills, upgrades, or cards.

## Source Documents

- [requirements-mvp.md](</E:/go-royal/01 - design/requirements-mvp.md>)
- [gameplay-mvp-system.md](</E:/go-royal/01 - design/systems/gameplay-mvp-system.md>)
- [feature-core-match-loop.md](</E:/go-royal/01 - design/systems/feature-core-match-loop.md>)
- [feature-default-map.md](</E:/go-royal/01 - design/systems/feature-default-map.md>)

## Feature Goal

The Units And Combat system SHALL provide a small, configurable, deterministic combat model using Infantry, Archer, and Cavalry.

The MVP SHALL prove whether the basic counter triangle creates readable tactical decisions on the fixed 9x9 map.

## In Scope

- MVP debug roster
- Starting unit loadout
- Shared balance config
- Unit HP and attack values
- Attack ranges
- Counter relationships
- Damage calculation
- Unit death
- Combat validation
- Combat events

## Out of Scope

- Defense stat
- Random damage variance
- Critical hits
- Miss chance
- Unit upgrades
- Unit skills
- Cards
- Terrain combat modifiers
- Mage, Scout, and Siege
- Production-grade per-unit config assets

## Balance Config Approach

The MVP SHALL keep gameplay tuning data configurable.

For MVP, unit stats and combat parameters SHOULD live in one shared balance config table so GD can compare and tune values quickly.

For production, the project SHOULD move toward split config assets by unit type or system area once the roster grows.

Internal tooling SHOULD be able to visualize and edit balance data later. The first MVP only needs data organized cleanly enough for tooling to read.

## MVP Debug Roster

The MVP roster SHALL include exactly:

| Unit Type | Role | Counter Role |
|---|---|---|
| `Infantry` | Durable melee unit | Counters Archer |
| `Archer` | Ranged pressure unit | Counters Cavalry |
| `Cavalry` | Mobile melee unit | Counters Infantry |

Every player SHALL have access to the same roster.

## Starting Loadout

The default MVP starting loadout SHALL be configurable.

Recommended default:

| Unit Type | Count Per Player |
|---|---:|
| Infantry | 1 |
| Archer | 1 |
| Cavalry | 1 |

This gives every player the full counter triangle from the first test match.

## Recommended MVP Stats

These are first-pass tuning defaults, not hardcoded constants.

| Unit Type | HP | Attack | Move Range | Attack Range | Notes |
|---|---:|---:|---:|---|---|
| Infantry | 10 | 3 | 2 | 1 | Stable frontline unit |
| Archer | 7 | 3 | 2 | 2-3 | Ranged unit; cannot attack adjacent targets |
| Cavalry | 8 | 3 | 3 | 1 | Faster melee unit |

`Move Range` means the maximum number of cells the unit may move in one movement action if the action is allowed by AP rules.

`Attack Range` uses Manhattan distance.

## Counter Triangle

The MVP counter relationships SHALL be:

| Attacker | Countered Defender |
|---|---|
| Infantry | Archer |
| Archer | Cavalry |
| Cavalry | Infantry |

Recommended default counter multiplier:

```text
counter_multiplier = 2.0
normal_multiplier = 1.0
```

The multiplier SHALL be configurable.

## Damage Formula

The MVP combat formula SHALL use only attack and HP.

```text
damage = attacker.attack * multiplier
```

Where:

- `multiplier = counter_multiplier` when the attacker counters the defender
- `multiplier = normal_multiplier` otherwise

Damage SHALL be deterministic.

Damage SHALL NOT use:

- Random rolls
- Critical hits
- Miss chance
- Defense
- Terrain cover

## Attack Range Rules

Attack range SHALL be measured by Manhattan distance:

```text
distance = abs(attacker.row - target.row) + abs(attacker.col - target.col)
```

Infantry and Cavalry SHALL attack only at distance `1`.

Archer SHALL attack at distance `2` or `3`.

Archer SHALL NOT attack adjacent targets.

## Unit Death

When damage reduces a unit's HP to `0` or lower, that unit SHALL be eliminated.

Eliminated units SHALL:

- Be removed from active combat
- Be ignored by future movement and attack validation
- Count against the owning player's remaining unit count

The match loop decides whether a player is eliminated after all unit deaths for the resolution step are applied.

## Combat Validation

An attack action is valid only when:

- The match is in the correct planning or resolution context.
- The attacker exists.
- The attacker is alive.
- The attacker belongs to the submitting player.
- The target exists.
- The target is alive.
- The target belongs to another player.
- The target is inside the attacker's allowed range.
- The player can pay the attack AP cost defined by the turn-resolution config.

Invalid attack actions SHALL be rejected before turn resolution begins.

## Simultaneous Combat Principle

The MVP SHOULD resolve attacks after movement.

If multiple attacks eliminate units in the same attack-resolution step, those eliminations SHOULD be treated as simultaneous for that step.

This means a unit that was alive at the start of attack resolution can still complete its submitted attack even if another attack also eliminates it in the same step.

The detailed ordering belongs in [feature-turn-resolution.md](</E:/go-royal/01 - design/systems/feature-turn-resolution.md>).

## Combat Events

Combat resolution SHOULD produce readable events for UI, logs, and debugging.

Recommended events:

- `AttackResolved`
- `CounterApplied`
- `DamageApplied`
- `UnitEliminated`
- `AttackRejected`

Event data SHOULD include:

- Attacker unit ID
- Defender unit ID
- Attacker owner ID
- Defender owner ID
- Damage amount
- Whether a counter multiplier applied
- Defender HP before and after damage

## Example Outcomes

With the recommended defaults:

```text
Infantry attacks Archer:
damage = 3 * 2.0 = 6
Archer HP 7 -> 1
```

```text
Archer attacks Cavalry:
damage = 3 * 2.0 = 6
Cavalry HP 8 -> 2
```

```text
Cavalry attacks Infantry:
damage = 3 * 2.0 = 6
Infantry HP 10 -> 4
```

```text
Infantry attacks Cavalry:
damage = 3 * 1.0 = 3
Cavalry HP 8 -> 5
```

## Config Data Shape

The MVP balance config SHOULD be easy to inspect as a table.

Conceptual shape:

```text
BalanceConfig
  action_points_per_turn: 6
  move_action_ap_cost: 1
  attack_action_ap_cost: 2
  counter_multiplier: 2.0
  normal_multiplier: 1.0
  starting_loadout:
    Infantry: 1
    Archer: 1
    Cavalry: 1
  units:
    Infantry:
      hp: 10
      attack: 3
      move_range: 2
      attack_range_min: 1
      attack_range_max: 1
    Archer:
      hp: 7
      attack: 3
      move_range: 2
      attack_range_min: 2
      attack_range_max: 3
    Cavalry:
      hp: 8
      attack: 3
      move_range: 3
      attack_range_min: 1
      attack_range_max: 1
```

The exact Unity or server representation belongs in implementation planning.

## Testing Focus

Initial tests SHOULD cover:

- The roster contains exactly Infantry, Archer, and Cavalry.
- The default loadout gives each player one of each unit.
- Infantry counters Archer.
- Archer counters Cavalry.
- Cavalry counters Infantry.
- Non-counter attacks use the normal multiplier.
- Counter attacks use the counter multiplier.
- Damage is deterministic for the same attacker and defender.
- Archer cannot attack adjacent targets.
- Archer can attack targets at range 2 and 3.
- Infantry and Cavalry can attack only adjacent targets.
- A unit is eliminated when HP reaches 0 or lower.
- Eliminated units cannot attack.
- Eliminated units cannot be targeted.

## Open Decisions For Implementation Planning

These decisions should be confirmed when coding starts:

- Whether balance config lives in Unity ScriptableObject, JSON, server config, or a shared generated format
- Whether combat preview is calculated client-side for UI and validated server-side authoritatively
- Whether all attack actions in one turn are fully simultaneous or ordered by a stable deterministic event order for display
