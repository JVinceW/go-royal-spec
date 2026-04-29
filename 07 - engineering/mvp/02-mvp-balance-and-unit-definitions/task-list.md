# MVP Balance And Unit Definitions Task List

## Source References

- [MVP system implementation order](../../mvp-system-implementation-order.md)
- [MVP requirements](../../../01 - design/requirements-mvp.md)
- [Units and combat system](../../../01 - design/systems/feature-units-combat.md)

## Goal

Define Unity-readable MVP roster, stats, AP costs, and counter tuning for the deterministic rules engine.

## Unity Implementation Notes

- Target module: `Assets/Game.Common`.
- Target assembly: `Game.Common`.
- Suggested namespace: `Game.Common.Mvp`.
- Suggested runtime path: `Assets/Game.Common/Runtime/Mvp/`.
- Suggested Edit Mode tests: `Assets/Tests/EditMode/Mvp/MvpBalanceConfigTests.cs`.
- Bootstrap default: start with plain C# config/data objects or static factory methods; do not require ScriptableObjects until Unity asset workflow is intentionally introduced.

## Linear Tracking

- Maps most closely to `GO-6`.
- Use as an implementation checklist inside the existing Linear issue.
- Dependency type: gameplay data prerequisite.

## Blocking Relationships

- Depends on:
  - [01-core-gameplay-rules-foundation](../01-core-gameplay-rules-foundation/task-list.md)
- Blocks:
  - [03-match-state-system](../03-match-state-system/task-list.md)
  - [04-prepare-phase-and-initial-setup](../04-prepare-phase-and-initial-setup/task-list.md)
  - [05-turn-plan-validation](../05-turn-plan-validation/task-list.md)
  - [07-combat-resolution](../07-combat-resolution/task-list.md)

## Implementation Tasks

- [ ] Add an MVP balance config object or static default config provider.
- [ ] Define the roster as exactly Infantry, Archer, and Cavalry.
- [ ] Define HP, base attack, movement range, and attack range for each unit type.
- [ ] Define move AP cost, attack AP cost, and per-turn AP budget.
- [ ] Define the default starting loadout as one Infantry, one Archer, and one Cavalry per player.
- [ ] Define Infantry counters Archer, Archer counters Cavalry, and Cavalry counters Infantry.
- [ ] Define normal damage multiplier and counter damage multiplier.
- [ ] Expose safe-zone sequence data through the same MVP config or through the map defaults.
- [ ] Add validation helpers/tests for missing stats, duplicate unit types, and non-MVP unit types.
- [ ] Write Edit Mode tests for roster contents, stat lookup, AP defaults, counter relationships, and safe-zone sequence defaults.

## Acceptance Criteria

- The roster contains exactly Infantry, Archer, and Cavalry.
- All three unit types have HP, attack, movement range, attack range, and AP cost data available to rules code.
- Counter relationships are deterministic and contain no randomness.
- The balance configuration is easy to inspect and tune for MVP playtests.
- Edit Mode tests lock the first-pass defaults so later tuning changes are intentional.

## Out Of Scope

- Mage, Scout, Siege, or other non-MVP unit types
- In-match upgrades
- Random damage rolls, critical hits, miss chance, or hidden modifiers
- External balance tooling
