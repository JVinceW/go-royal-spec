# Combat Resolution Task List

## Source References

- [MVP system implementation order](../../mvp-system-implementation-order.md)
- [MVP requirements](../../../01 - design/requirements-mvp.md)
- [Units and combat system](../../../01 - design/systems/feature-units-combat.md)
- [Turn resolution system](../../../01 - design/systems/feature-turn-resolution.md)

## Goal

Resolve attacks deterministically with MVP base damage, counter bonuses, range rules, and unit death.

## Unity Implementation Notes

- Target module: `Assets/Game.Common`.
- Target assembly: `Game.Common`.
- Suggested namespace: `Game.Common.Mvp`.
- Suggested runtime path: `Assets/Game.Common/Runtime/Mvp/`.
- Suggested Edit Mode tests: `Assets/Tests/EditMode/Mvp/MvpCombatResolutionTests.cs`.
- Combat should use resolved post-movement positions and config data; it must not depend on Unity physics, animations, or scene objects.

## Linear Tracking

- Maps most closely to `GO-8`.
- Use as an implementation checklist inside the existing Linear issue.
- Dependency type: turn-resolution component.

## Blocking Relationships

- Depends on:
  - [02-mvp-balance-and-unit-definitions](../02-mvp-balance-and-unit-definitions/task-list.md)
  - [05-turn-plan-validation](../05-turn-plan-validation/task-list.md)
  - [06-movement-resolution](../06-movement-resolution/task-list.md)
- Blocks:
  - [08-shrink-zone-resolution](../08-shrink-zone-resolution/task-list.md)
  - [09-elimination-and-win-condition](../09-elimination-and-win-condition/task-list.md)
  - [10-core-match-loop](../10-core-match-loop/task-list.md)

## Implementation Tasks

- [x] Add combat resolution entry point that accepts post-movement match state plus accepted attack actions.
- [x] Validate attack range against the positions used for combat.
- [x] Calculate base damage from attacker unit type stats.
- [x] Apply configured counter multiplier when attacker counters defender.
- [x] Use normal multiplier for non-counter attacks.
- [x] Enforce Archer minimum range and Infantry/Cavalry adjacent-only range.
- [x] Apply damage to target unit HP.
- [x] Mark units dead when HP reaches zero or lower.
- [x] Define simultaneous combat so all valid attacks in the step can still contribute before deaths suppress future turns.
- [x] Emit combat result events with attacker, defender, damage, multiplier kind, remaining HP, and death state.
- [x] Write Edit Mode tests for each counter relationship, non-counter damage, Archer range, melee range, lethal damage, and simultaneous lethal attacks.

## Acceptance Criteria

- Combat uses only MVP roster stats and counter relationships.
- Counter bonuses are visible in the resolution result.
- Units at zero or negative HP are no longer alive.
- No randomness affects damage or hit outcomes.
- Edit Mode tests cover damage, range behavior, and death state.

## Out Of Scope

- Status effects
- Area attacks
- Critical hits, misses, or hidden chance
- Post-MVP unit abilities
- Animation or VFX timing
