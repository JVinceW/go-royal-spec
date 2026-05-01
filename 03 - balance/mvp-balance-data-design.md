# MVP Balance Data Design

## Purpose

This document defines a designer-editable data structure for Project Go-Royale MVP balance values.

The goal is to let game designers inspect, tune, review, and version gameplay numbers without touching implementation code. The structure is intentionally small for MVP and is grounded in the current fixed-map, deterministic-combat, 4-player tactical prototype.

This is a planning document only. It does not define Unity classes, SpacetimeDB tables, generated schemas, or file formats for implementation.

## Source Documents

- [requirements-mvp.md](</E:/go-royal/01 - design/requirements-mvp.md>)
- [feature-default-map.md](</E:/go-royal/01 - design/systems/feature-default-map.md>)
- [feature-units-combat.md](</E:/go-royal/01 - design/systems/feature-units-combat.md>)
- [feature-turn-resolution.md](</E:/go-royal/01 - design/systems/feature-turn-resolution.md>)
- [mvp-system-implementation-order.md](</E:/go-royal/07 - engineering/mvp-system-implementation-order.md>)
- [learning.md](</E:/go-royal/learning.md>)

## 1. Design Goals

The MVP balance data SHALL make the current tactical rules easy to inspect and tune.

For designers, the data SHALL:

- Keep all first-playable balance numbers in one readable place.
- Expose unit HP, attack, movement range, attack range, AP costs, counter multipliers, starting loadout, shrink timing, and turn timer values.
- Use stable names such as `Infantry`, `Archer`, and `Cavalry` instead of hidden numeric IDs.
- Make risky changes visible during review, especially changes that affect match length, map pressure, or deterministic combat outcomes.

For engineers, the data SHALL:

- Define clear groups that can later become shared config, generated data, ScriptableObjects, server-side config, or another implementation format.
- Separate balance values from runtime match state.
- Provide validation rules before runtime systems consume the data.
- Preserve deterministic behavior across local simulation, server authority, and Unity presentation.

For testing, the data SHALL:

- Support small, stable fixtures for expected unit stats, AP costs, counter outcomes, map bounds, formation zones, and shrink sequence.
- Make it obvious when a test should change because a balance value changed.
- Avoid implicit defaults that cannot be reviewed.

For future multiplayer authority, the data SHALL:

- Identify which values must be identical on server and client.
- Treat server-authoritative rules as the source for final validation and resolution.
- Allow Unity to display and preview values without becoming the authority for match results.

## 2. Data Ownership And Runtime Boundary

The MVP SHOULD use one shared balance config for all gameplay-affecting tuning values. A single shared config keeps debugging and playtest review simple while the roster has only three units and one fixed map.

### Shared Gameplay Config

Shared gameplay config is the canonical source for deterministic rules that both server and Unity need to understand.

It SHALL include:

- Unit definitions.
- Action costs.
- AP budget.
- Counter relationships and multipliers.
- Starting roster.
- Fixed map dimensions.
- Formation zones.
- Safe-zone and shrink schedule.
- Turn timer and timeout fallback policy.
- Designer-facing validation limits.

It SHALL be identical between server-authoritative resolution and Unity client preview for MVP. If client and server disagree, the server-authoritative version wins.

### Server-Authoritative Runtime Config

The server-authoritative runtime SHALL consume the shared config to validate turn plans, resolve movement, resolve combat, resolve shrink, apply eliminations, and produce authoritative match results.

The server MAY store a copied version or version hash of the config used by a match so playtest results can be traced back to exact tuning values.

### Unity Presentation Config

Unity presentation config SHOULD contain only display data that does not change authoritative outcomes, such as:

- Unit display names.
- Icons.
- Colors.
- Tooltip text.
- Range preview visuals.
- Counter relationship presentation text.

Unity MAY read shared gameplay config for previews, but previews SHALL be treated as advisory. Final validity and results come from authoritative validation and resolution.

### Playtest Notes

Playtest notes SHOULD record why values changed, what was observed, and what should be tested next. They SHALL NOT be treated as authoritative gameplay config.

## 3. Proposed Data Structure

### 3.1 Balance Config Header

Purpose: Identifies the balance set being tested.

| Field | Type | Example | Notes |
|---|---|---|---|
| `config_id` | string | `mvp_balance_v001` | Stable identifier for the data set. |
| `display_name` | string | `MVP Balance V001` | Human-readable label. |
| `version` | integer | `1` | Incremented when balance values change. |
| `status` | enum | `playtest` | Suggested values: `draft`, `playtest`, `approved`, `archived`. |
| `notes` | string | `First shared MVP tuning pass.` | Short designer note. |

Edited by: designer, reviewed by engineer or design lead.

Consumed by: tooling, test harnesses, server, Unity debug UI.

Validation rules:

- `config_id` SHALL be unique.
- `version` SHALL be positive.
- `status` SHALL use a known value.

### 3.2 Unit Definitions

Purpose: Defines the MVP unit roster and per-unit combat/movement numbers.

| Field | Type | Example | Notes |
|---|---|---|---|
| `unit_id` | enum/string | `Infantry` | Stable rule ID. |
| `role` | string | `Durable melee unit` | Designer-facing description. |
| `hp` | integer | `10` | Starting and max HP for MVP. |
| `attack` | integer | `3` | Base attack used by deterministic damage formula. |
| `move_range` | integer | `2` | Maximum Manhattan distance for one move action. |
| `attack_range_min` | integer | `1` | Minimum Manhattan attack distance. |
| `attack_range_max` | integer | `1` | Maximum Manhattan attack distance. |
| `can_attack_adjacent` | boolean | `true` | Redundant but designer-readable. |

Example values:

| Unit | HP | Attack | Move Range | Attack Min | Attack Max | Adjacent Attack |
|---|---:|---:|---:|---:|---:|---|
| `Infantry` | 10 | 3 | 2 | 1 | 1 | true |
| `Archer` | 7 | 3 | 2 | 2 | 3 | false |
| `Cavalry` | 8 | 3 | 3 | 1 | 1 | true |

Edited by: designer.

Consumed by: shared validation, combat resolution, movement validation, Unity previews, debug UI, tests.

Validation rules:

- MVP unit list SHALL contain exactly `Infantry`, `Archer`, and `Cavalry`.
- `hp`, `attack`, and `move_range` SHALL be positive integers.
- `attack_range_min` SHALL be positive.
- `attack_range_max` SHALL be greater than or equal to `attack_range_min`.
- `attack_range_max` SHOULD NOT exceed the maximum meaningful Manhattan distance on the 9x9 board unless a future rule explicitly allows it.
- `can_attack_adjacent` SHALL match whether `attack_range_min <= 1 <= attack_range_max`.

### 3.3 Action Cost Definitions

Purpose: Defines AP economy for turn planning.

| Field | Type | Example | Notes |
|---|---|---|---|
| `ap_per_turn` | integer | `6` | Player AP budget each turn. |
| `move_action_ap_cost` | integer | `1` | Cost for one move action. |
| `attack_action_ap_cost` | integer | `2` | Cost for one attack action. |
| `max_move_actions_per_unit` | integer | `1` | MVP action limit. |
| `max_attack_actions_per_unit` | integer | `1` | MVP action limit. |

Edited by: designer.

Consumed by: turn-plan validation, UI AP display, test harness.

Validation rules:

- AP values SHALL be non-negative integers.
- `ap_per_turn` SHALL be greater than `0`.
- At least one valid action SHOULD be affordable with the configured AP budget.
- The default starting roster SHOULD be able to perform meaningful choices within the AP budget.

### 3.4 Counter Relationship Definitions

Purpose: Defines deterministic unit advantages.

| Field | Type | Example | Notes |
|---|---|---|---|
| `attacker_unit_id` | unit ID | `Infantry` | Unit applying the counter. |
| `defender_unit_id` | unit ID | `Archer` | Unit being countered. |
| `multiplier` | decimal | `2.0` | Damage multiplier for this relationship. |

Example values:

| Attacker | Counters | Multiplier |
|---|---|---:|
| `Infantry` | `Archer` | 2.0 |
| `Archer` | `Cavalry` | 2.0 |
| `Cavalry` | `Infantry` | 2.0 |

The config SHOULD also define:

| Field | Type | Example |
|---|---|---|
| `normal_damage_multiplier` | decimal | `1.0` |

Edited by: designer.

Consumed by: combat resolution, combat previews, UI counter display, tests.

Validation rules:

- Every `attacker_unit_id` and `defender_unit_id` SHALL reference a known unit.
- MVP SHALL have exactly the three current counter relationships unless a design document changes the roster rule.
- Duplicate attacker/defender relationships SHALL be rejected.
- `multiplier` and `normal_damage_multiplier` SHALL be greater than `0`.
- Counter relationships SHALL NOT introduce randomness.

### 3.5 Starting Roster Definitions

Purpose: Defines each player's default starting force.

| Field | Type | Example | Notes |
|---|---|---|---|
| `unit_id` | unit ID | `Infantry` | Unit type in the starting roster. |
| `count_per_player` | integer | `1` | Number of that unit each player starts with. |

Example values:

| Unit | Count Per Player |
|---|---:|
| `Infantry` | 1 |
| `Archer` | 1 |
| `Cavalry` | 1 |

Edited by: designer.

Consumed by: prepare phase setup, match-state creation, validation tests.

Validation rules:

- Every `unit_id` SHALL reference a known unit definition.
- `count_per_player` SHALL be greater than or equal to `0`.
- Total starting units per player SHOULD be `3` for first playable MVP unless a later balancing decision changes the value.
- Total starting units per player SHALL fit inside one player's formation zone.
- All players SHALL use the same starting roster in MVP.

### 3.6 Map Definition

Purpose: Defines fixed MVP battlefield dimensions and cell behavior.

| Field | Type | Example | Notes |
|---|---|---|---|
| `map_id` | string | `mvp_default_9x9` | Stable map identifier. |
| `width` | integer | `9` | Number of columns. |
| `height` | integer | `9` | Number of rows. |
| `coordinate_origin` | enum/string | `top_left_zero_based` | Matches system docs. |
| `default_cell_type` | enum/string | `Plain` | All MVP cells are passable. |

Edited by: designer with engineer review.

Consumed by: placement validation, movement validation, safe-zone validation, UI board rendering.

Validation rules:

- `width` SHALL be `9` for MVP.
- `height` SHALL be `9` for MVP.
- Coordinate convention SHALL be 0-based with row `0` at top and col `0` at left.
- Every MVP cell SHALL be passable unless a future terrain system is explicitly added.

### 3.7 Formation Zone Definition

Purpose: Defines where each player may place units during Prepare Phase.

| Field | Type | Example | Notes |
|---|---|---|---|
| `player_slot` | enum | `Player1` | One of four MVP player slots. |
| `row_min` | integer | `0` | Inclusive row start. |
| `row_max` | integer | `2` | Inclusive row end. |
| `col_min` | integer | `0` | Inclusive col start. |
| `col_max` | integer | `2` | Inclusive col end. |

Example values:

| Player Slot | Rows | Cols |
|---|---|---|
| `Player1` | 0-2 | 0-2 |
| `Player2` | 0-2 | 6-8 |
| `Player3` | 6-8 | 0-2 |
| `Player4` | 6-8 | 6-8 |

Edited by: designer with engineer review.

Consumed by: prepare phase placement validation, debug UI, map preview.

Validation rules:

- MVP SHALL define exactly four formation zones.
- Each formation zone SHALL be inside the 9x9 map.
- Formation zones SHALL NOT overlap.
- Each zone SHALL have enough cells for the starting roster.

### 3.8 Safe-Zone And Shrink Schedule

Purpose: Defines match pressure over time.

| Field | Type | Example | Notes |
|---|---|---|---|
| `step` | integer | `0` | Shrink step index. |
| `after_turn_resolution` | integer/null | `null` | Turn after which this zone becomes active. |
| `row_min` | integer | `0` | Inclusive safe row start. |
| `row_max` | integer | `8` | Inclusive safe row end. |
| `col_min` | integer | `0` | Inclusive safe col start. |
| `col_max` | integer | `8` | Inclusive safe col end. |

Example values:

| Step | Active Timing | Rows | Cols | Size |
|---:|---|---|---|---|
| 0 | Match start | 0-8 | 0-8 | 9x9 |
| 1 | After Turn 1 resolves | 1-7 | 1-7 | 7x7 |
| 2 | After Turn 2 resolves | 2-6 | 2-6 | 5x5 |
| 3 | After Turn 3 resolves | 3-5 | 3-5 | 3x3 |

Edited by: designer with engineer review.

Consumed by: shrink resolution, movement validation, UI safe-zone preview, tests.

Validation rules:

- Step `0` SHALL cover the full 9x9 map.
- Every safe zone SHALL be inside the map.
- Safe zones SHALL be centered and symmetric for MVP.
- Each later safe zone SHALL be smaller than or equal to the previous safe zone.
- MVP SHALL NOT shrink below 3x3 unless a later balancing decision changes the session design.
- Shrink SHALL resolve after movement and combat.

### 3.9 Match Timing Values

Purpose: Defines time pressure for simultaneous turn submission.

| Field | Type | Example | Notes |
|---|---|---|---|
| `turn_timer_seconds` | integer | `45` | Planning window duration. |
| `missing_plan_policy` | enum | `empty_plan` | MVP timeout fallback. |
| `allow_plan_replacement_before_lock` | boolean | `true` | Whether players may replace accepted plans before turn lock. |

Edited by: designer with engineer review.

Consumed by: server turn submission, Unity timer display, room/match flow tests.

Validation rules:

- `turn_timer_seconds` SHALL be positive.
- `missing_plan_policy` SHALL use a known value.
- MVP recommended missing-plan behavior SHOULD be `empty_plan`.
- Timing values SHALL NOT require reconnect, AFK automation, or advanced room management for MVP.

### 3.10 Validation Rule Definitions

Purpose: Makes expected config checks visible before implementation.

| Field | Type | Example | Notes |
|---|---|---|---|
| `rule_id` | string | `unit_hp_positive` | Stable validation rule name. |
| `severity` | enum | `error` | Suggested values: `error`, `warning`. |
| `message` | string | `Unit HP must be greater than 0.` | Designer-readable failure text. |

Edited by: engineer or technical designer.

Consumed by: config validation tooling, CI later, local debug checks.

Validation rules:

- Validation rule IDs SHALL be stable enough for tests and documentation.
- MVP config errors SHALL block use of the balance config.
- Warnings MAY allow playtest use but SHALL be visible.

## 4. Example Designer-Facing Tables

The following example is intentionally close to YAML because it is compact and readable. It is not a required implementation format.

```yaml
config:
  config_id: mvp_balance_v001
  display_name: MVP Balance V001
  version: 1
  status: playtest
  notes: First shared MVP tuning pass.

match:
  players_per_match: 4
  ap_per_turn: 6
  move_action_ap_cost: 1
  attack_action_ap_cost: 2
  max_move_actions_per_unit: 1
  max_attack_actions_per_unit: 1
  turn_timer_seconds: 45
  missing_plan_policy: empty_plan
  allow_plan_replacement_before_lock: true

units:
  - unit_id: Infantry
    role: Durable melee unit
    hp: 10
    attack: 3
    move_range: 2
    attack_range_min: 1
    attack_range_max: 1
    can_attack_adjacent: true

  - unit_id: Archer
    role: Ranged pressure unit
    hp: 7
    attack: 3
    move_range: 2
    attack_range_min: 2
    attack_range_max: 3
    can_attack_adjacent: false

  - unit_id: Cavalry
    role: Mobile melee unit
    hp: 8
    attack: 3
    move_range: 3
    attack_range_min: 1
    attack_range_max: 1
    can_attack_adjacent: true

damage:
  normal_damage_multiplier: 1.0
  counter_relationships:
    - attacker: Infantry
      defender: Archer
      multiplier: 2.0
    - attacker: Archer
      defender: Cavalry
      multiplier: 2.0
    - attacker: Cavalry
      defender: Infantry
      multiplier: 2.0

starting_roster:
  - unit_id: Infantry
    count_per_player: 1
  - unit_id: Archer
    count_per_player: 1
  - unit_id: Cavalry
    count_per_player: 1

map:
  map_id: mvp_default_9x9
  width: 9
  height: 9
  coordinate_origin: top_left_zero_based
  default_cell_type: Plain

formation_zones:
  - player_slot: Player1
    rows: [0, 2]
    cols: [0, 2]
  - player_slot: Player2
    rows: [0, 2]
    cols: [6, 8]
  - player_slot: Player3
    rows: [6, 8]
    cols: [0, 2]
  - player_slot: Player4
    rows: [6, 8]
    cols: [6, 8]

safe_zones:
  - step: 0
    active: match_start
    rows: [0, 8]
    cols: [0, 8]
  - step: 1
    active: after_turn_1_resolution
    rows: [1, 7]
    cols: [1, 7]
  - step: 2
    active: after_turn_2_resolution
    rows: [2, 6]
    cols: [2, 6]
  - step: 3
    active: after_turn_3_resolution
    rows: [3, 5]
    cols: [3, 5]
```

The same data can also be reviewed as tables during playtest:

| Category | Designer-Tunable Values |
|---|---|
| Match | AP per turn, move AP cost, attack AP cost, turn timer, missing plan policy |
| Units | HP, attack, move range, attack range |
| Damage | Normal multiplier, counter multiplier relationships |
| Roster | Count per unit per player |
| Map | Width, height, formation zones |
| Shrink | Safe-zone rectangles and timing |

## 5. Validation Rules

The balance config SHALL fail validation when any error-level rule fails.

### Unit Validation

- Unit IDs SHALL be unique.
- MVP roster SHALL contain exactly `Infantry`, `Archer`, and `Cavalry`.
- Every unit SHALL have positive HP.
- Every unit SHALL have positive attack.
- Every unit SHALL have positive move range.
- Every unit SHALL have a valid attack range.
- Archer SHALL NOT attack adjacent targets under current MVP design.
- Infantry and Cavalry SHALL attack only adjacent targets under current MVP design.

### Counter Validation

- Every counter relationship SHALL reference known unit IDs.
- Counter relationships SHALL be unique by attacker and defender pair.
- MVP counter triangle SHALL contain Infantry over Archer, Archer over Cavalry, and Cavalry over Infantry.
- Damage multipliers SHALL be greater than `0`.
- No damage rule SHALL use randomness.

### AP And Turn Validation

- AP budget SHALL be greater than `0`.
- Move and attack AP costs SHALL be greater than or equal to `0`.
- At least one configured action SHOULD cost more than `0` to preserve meaningful tradeoffs.
- Max move and attack actions per unit SHALL be non-negative integers.
- Turn timer SHALL be positive.
- Missing plan policy SHALL be recognized.

### Roster Validation

- Starting roster entries SHALL reference known unit IDs.
- Counts SHALL be non-negative integers.
- Total starting units per player SHALL fit inside every formation zone.
- MVP starting roster SHOULD remain one Infantry, one Archer, and one Cavalry until a later balance decision changes it.

### Map And Formation Validation

- Map width and height SHALL be `9` for MVP.
- Coordinates SHALL use the documented 0-based convention.
- Formation zones SHALL be inside the map.
- Formation zones SHALL NOT overlap.
- Formation zones SHALL cover exactly the intended corner regions unless a later map balance decision changes them.

### Shrink Validation

- Step `0` safe zone SHALL cover the full 9x9 map.
- Every safe zone SHALL be inside the map.
- Every safe zone SHALL be centered and symmetric for MVP.
- Safe zones SHALL not grow during the shrink sequence.
- MVP safe-zone sequence SHOULD be 9x9, 7x7, 5x5, 3x3.
- MVP SHALL not shrink below 3x3.
- Shrink timing SHALL happen after movement and combat.

### Cross-Table Validation

- All referenced IDs SHALL resolve to known data.
- Client-preview values and server-authoritative values SHALL come from the same gameplay config version.
- A balance config used for a match SHOULD be identifiable by `config_id` and `version`.
- Designer-facing display values SHALL not override authoritative gameplay values.

## 6. Change Workflow

1. Designer creates or edits a balance config version.
2. Designer records a short reason for the change in the config notes or related playtest notes.
3. Engineer or technical designer reviews whether the change stays inside MVP scope and passes validation.
4. The team runs local deterministic checks or playtest harness checks once implementation exists.
5. Playtest results record the exact `config_id` and `version`.
6. Approved values are promoted from `draft` to `playtest` or `approved`.
7. Older versions are archived instead of overwritten when they are useful for comparison.

The change review SHOULD answer:

- Which values changed?
- Which behavior is expected to change?
- Does the change affect deterministic server validation?
- Does the Unity client need updated display text or preview behavior?
- Is the change still inside MVP scope?

Balance changes SHOULD be small enough to isolate playtest effects. For example, changing AP budget, unit HP, and shrink timing in one pass makes it harder to know which value affected match feel.

## 7. Future-Proofing

The MVP data shape SHOULD leave room for expansion without adding deferred systems now.

Future units MAY be added by extending `units`, `counter_relationships`, and `starting_roster`, but MVP validation SHALL continue to enforce the three-unit roster until the design changes.

Terrain MAY later extend map data with per-cell types and movement or combat modifiers. MVP keeps one passable cell type so terrain cannot silently affect balance.

Abilities MAY later add a separate `abilities` table referenced by units. MVP unit definitions SHALL NOT include ability behavior.

Cards MAY later add card definitions, costs, targeting rules, and effects. MVP turn plans SHALL NOT include card actions.

Unit upgrades MAY later add levels or stat progressions. MVP unit HP and attack are base-unit values only.

Procedural maps MAY later add generation parameters, seed rules, and map validation constraints. MVP uses one fixed map definition.

Production data MAY later split into multiple assets by system or unit. MVP SHOULD keep one shared config because it is easier to inspect, debug, and review during the first playable phase.

## 8. Open Questions

These questions should be answered before implementation chooses a concrete file or asset format:

- Should the first implementation store shared gameplay config as Unity ScriptableObject, JSON-like data, server-owned config, or generated shared data?
- Should each match persist the exact balance config version or only a version/hash reference?
- Should Unity calculate full combat and movement previews from shared config, or only display simple AP/range hints before server validation?
- Should invalid attack actions after movement be reported as canceled resolution events or as validation errors before plan acceptance?
- Should Player1 always use the top-left formation zone, or should formation zones rotate or randomize by assigned room slot later?

These questions do not block the planning-level data structure. They block only the later implementation format and runtime ownership details.
