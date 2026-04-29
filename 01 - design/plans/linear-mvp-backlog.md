# Linear Backlog: MVP Implementation

## Purpose

This file tracks the current Linear implementation shape for Project Go-Royale MVP.

It started as the local source for creating the first gameplay-rule tickets. Linear is now connected in Codex, so this file should mirror the active issue hierarchy and execution order rather than act as a placeholder backlog.

## Active Linear Setup

Project:

```text
go-royal
```

Team:

```text
Go-team-shared
```

Labels:

```text
human
ai-agent
Feature
```

## Current Issue Hierarchy

### Parent Stories

- `GO-11` MVP core gameplay rules - `human`
- `GO-12` MVP local gameplay loop and debug harness - `human`
- `GO-13` MVP room-based multiplayer - `human`
- `GO-14` MVP multiplayer match UI - `human`

### Child Implementation Tasks

#### GO-11 child tasks

- `GO-5` Create MVP gameplay value types - `Done`
- `GO-6` Add MVP balance config and default map - `Done`
- `GO-7` Add match state and default unit setup - `In Progress`
- `GO-8` Add deterministic combat rules - `Done`
- `GO-9` Add MVP turn plans and movement resolution - `Done`
- `GO-10` Add shrink, elimination, and winner checks - `Done`

#### GO-12 child tasks

- `GO-15` Integrate deterministic core match loop - `Backlog`
- `GO-16` Add local debug UI or test harness - `Backlog`

#### GO-13 child tasks

- `GO-17` Add networking room flow - `Backlog`
- `GO-18` Add networked turn submission - `Backlog`

#### GO-14 child tasks

- `GO-19` Build multiplayer match UI - `Backlog`

## Recommended Execution Order

1. `GO-7` Complete match state and default unit setup.
2. `GO-15` Integrate deterministic core match loop.
3. `GO-16` Add local debug UI or test harness.
4. `GO-17` Add networking room flow.
5. `GO-18` Add networked turn submission.
6. `GO-19` Build multiplayer match UI.

## Local Task-List Mapping

- `GO-5` through `GO-10` map to `07 - engineering/mvp/01` through `09`.
- `GO-15` maps to [10-core-match-loop/task-list.md](</E:/go-royal/07 - engineering/mvp/10-core-match-loop/task-list.md>).
- `GO-16` maps to [11-local-debug-ui-or-test-harness/task-list.md](</E:/go-royal/07 - engineering/mvp/11-local-debug-ui-or-test-harness/task-list.md>).
- `GO-17` maps to [12-networking-room-flow/task-list.md](</E:/go-royal/07 - engineering/mvp/12-networking-room-flow/task-list.md>).
- `GO-18` maps to [13-networked-turn-submission/task-list.md](</E:/go-royal/07 - engineering/mvp/13-networked-turn-submission/task-list.md>).
- `GO-19` maps to [14-multiplayer-match-ui/task-list.md](</E:/go-royal/07 - engineering/mvp/14-multiplayer-match-ui/task-list.md>).

## Sync Note

This snapshot reflects Linear state observed from Codex on 2026-04-29.
