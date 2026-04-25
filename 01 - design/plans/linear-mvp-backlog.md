# Linear Backlog: MVP Core Gameplay

## Purpose

This file is the Linear-ready task breakdown for the first MVP development slice.

The Linear MCP is not currently exposed to this Codex session through available MCP resources or tools. Until that is connected, this document is the local source for issue titles, descriptions, labels, and acceptance criteria.

## Recommended Linear Setup

Project:

```text
Project Go-Royale MVP
```

Milestone:

```text
MVP Core Gameplay Rules
```

Labels:

```text
area:gameplay
area:unity
type:implementation
type:test
mvp
```

## Issues

### Issue 1: Create MVP gameplay value types

Labels: `area:gameplay`, `area:unity`, `type:implementation`, `mvp`

Description:

Create `GridPosition` and `SafeZone` in `Game.Common` as the foundation for map, movement, and safe-zone rules.

Acceptance criteria:

- `GridPosition` stores row and column.
- `GridPosition.ManhattanDistanceTo` returns Manhattan distance.
- `SafeZone.Contains` detects positions inside rectangular bounds.
- Edit Mode tests cover distance and safe-zone containment.

Source plan:

- [mvp-core-gameplay-implementation.md](</E:/go-royal/01 - design/plans/mvp-core-gameplay-implementation.md>) Task 1

### Issue 2: Add MVP balance config and default map

Labels: `area:gameplay`, `area:unity`, `type:implementation`, `mvp`

Description:

Create the shared MVP balance config and fixed 9x9 default map definition.

Acceptance criteria:

- Balance config exposes AP, action costs, counter multiplier, starting loadout, and unit stats.
- Default map is 9x9.
- Four 3x3 formation zones exist and do not overlap.
- Safe-zone sequence supports 9x9, 7x7, 5x5, and 3x3.
- Edit Mode tests cover config defaults and map shape.

Source plan:

- [mvp-core-gameplay-implementation.md](</E:/go-royal/01 - design/plans/mvp-core-gameplay-implementation.md>) Task 2

### Issue 3: Add match state and default unit setup

Labels: `area:gameplay`, `area:unity`, `type:implementation`, `mvp`

Description:

Create player, unit, and match-state models plus initial MVP match creation.

Acceptance criteria:

- Initial match contains four players.
- Each player receives one Infantry, one Archer, and one Cavalry.
- Units use stats from balance config.
- Units start inside their owner formation zone.
- Edit Mode tests cover initial player and unit setup.

Source plan:

- [mvp-core-gameplay-implementation.md](</E:/go-royal/01 - design/plans/mvp-core-gameplay-implementation.md>) Task 3

### Issue 4: Add deterministic combat rules

Labels: `area:gameplay`, `area:unity`, `type:implementation`, `mvp`

Description:

Implement attack + HP combat, counter relationships, damage calculation, and attack range checks.

Acceptance criteria:

- Infantry counters Archer.
- Archer counters Cavalry.
- Cavalry counters Infantry.
- Counter attacks use the configured counter multiplier.
- Non-counter attacks use the normal multiplier.
- Archer cannot attack adjacent targets.
- Infantry and Cavalry attack adjacent targets only.
- Edit Mode tests cover damage and range behavior.

Source plan:

- [mvp-core-gameplay-implementation.md](</E:/go-royal/01 - design/plans/mvp-core-gameplay-implementation.md>) Task 4

### Issue 5: Add MVP turn plans and movement resolution

Labels: `area:gameplay`, `area:unity`, `type:implementation`, `mvp`

Description:

Create turn action, turn plan, resolution result, and minimal deterministic movement resolution.

Acceptance criteria:

- Turn plans support move and attack actions.
- Non-conflicting moves apply.
- Conflicting moves to the same cell are canceled.
- Resolution emits readable events.
- Edit Mode tests cover movement application and conflict cancellation.

Source plan:

- [mvp-core-gameplay-implementation.md](</E:/go-royal/01 - design/plans/mvp-core-gameplay-implementation.md>) Task 5

### Issue 6: Add shrink, elimination, and winner checks

Labels: `area:gameplay`, `area:unity`, `type:implementation`, `mvp`

Description:

Implement safe-zone shrink elimination, player elimination, and winner detection.

Acceptance criteria:

- Units outside the current safe zone are eliminated after shrink.
- Players with no surviving units are eliminated.
- Winner is returned when exactly one player remains active.
- Turn resolution integrates shrink and elimination.
- Edit Mode tests cover shrink, player elimination, and winner logic.

Source plan:

- [mvp-core-gameplay-implementation.md](</E:/go-royal/01 - design/plans/mvp-core-gameplay-implementation.md>) Task 6

## MCP Status

Checked from Codex:

```text
functions.list_mcp_resources -> []
functions.list_mcp_resource_templates -> []
```

No Linear MCP resources or templates are currently exposed to this session. When Linear MCP is available, create the issues above under the `Project Go-Royale MVP` project and keep issue status aligned with the checkboxes in the implementation plan.
