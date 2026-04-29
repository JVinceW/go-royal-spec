# Go-Royale Planning Workflow Learning

## Purpose

This repository is for planning, brainstorming, design documentation, and task management only. It is not an implementation repository, so documents here should define scope, rules, decisions, and downstream work rather than describe local code changes.

Use this file as the durable reference for how to structure planning work and Linear tickets for Project Go-Royale MVP.

## Repo Usage

- Use `01 - design/` for product intent, MVP requirements, and feature/system definitions.
- Use `01 - design/plans/` for implementation plans, backlog breakdowns, and execution ordering.
- Keep implementation details grounded in the design docs, but do not imply that code is written in this repo.
- When a rule changes, update the relevant source-of-truth document and the dependent plan/backlog docs together.

## Linear Ownership Labels

Current ownership labels in `go-team-shared`:

- `human`
- `ai-agent`

Treat these labels as the primary working mode for a ticket, not as a claim that only one side will ever touch it.

### Labeling rules

- Use `human` for parent stories, prioritization, scope control, ambiguity resolution, review-heavy work, and approval-heavy tasks.
- Use `ai-agent` for execution-oriented subtasks that are concrete, decomposition-ready, and testable downstream.
- Use both labels only when the human is expected to materially execute part of the same task, not merely review or approve it.

Review and approval alone do not make a task shared ownership.

## Ticket Hierarchy

Use a two-level structure by default:

- Parent story or epic: defines the outcome, scope, and completion standard.
- Child tasks: define the concrete next actions needed to achieve the parent outcome.

Parent stories should usually stay `human`. Child tasks should usually stay `ai-agent` unless the task is genuinely shared execution.

## Ticket Writing Conventions

When creating or updating planning tickets:

- Write a clear title that describes the outcome.
- Include short acceptance criteria for the child task.
- Include `Agent` and `Human` notes when the role split matters.
- Include execution order when the tasks depend on one another.
- Link the related planning or design documents by repo path.
- Keep descriptions focused on planning intent and downstream execution, not local coding instructions for this repo.

## Current Reference Pattern

The current MVP implementation backlog is the reference example:

- `GO-11` is the parent story and should remain `human`.
- `GO-5` through `GO-10` are execution-oriented child tasks and should remain `ai-agent`.
- `GO-12` is the parent story for local loop and harness work and should remain `human`.
- `GO-15` and `GO-16` are execution-oriented child tasks and should remain `ai-agent`.
- `GO-13` is the parent story for room-based multiplayer and should remain `human`.
- `GO-17` and `GO-18` are execution-oriented child tasks and should remain `ai-agent`.
- `GO-14` is the parent story for multiplayer match UI and should remain `human`.
- `GO-19` is an execution-oriented child task and should remain `ai-agent`.

Execution order:

1. `GO-5` Create MVP gameplay value types
2. `GO-6` Add MVP balance config and default map
3. `GO-7` Add match state and default unit setup
4. `GO-8` Add deterministic combat rules
5. `GO-9` Add MVP turn plans and movement resolution
6. `GO-10` Add shrink, elimination, and winner checks
7. `GO-15` Integrate deterministic core match loop
8. `GO-16` Add local debug UI or test harness
9. `GO-17` Add networking room flow
10. `GO-18` Add networked turn submission
11. `GO-19` Build multiplayer match UI

Core related documents for that backlog:

- `01 - design/plans/mvp-core-gameplay-implementation.md`
- `01 - design/plans/linear-mvp-backlog.md`
- `01 - design/requirements-mvp.md`
- `01 - design/systems/mvp-system-overview.md`
- `01 - design/systems/feature-default-map.md`
- `01 - design/systems/feature-units-combat.md`
- `01 - design/systems/feature-turn-resolution.md`
- `07 - engineering/mvp/*/task-list.md`

## Do / Don't

Do:

- keep the repo focused on planning artifacts
- use labels to indicate primary working mode
- keep task bodies explicit about role split when needed
- keep documents aligned with the MVP source of truth

Don't:

- treat this repo as a code workspace
- invent implementation progress that did not happen here
- add both ownership labels just because a human reviews the task
- let backlog documents drift from the requirements and system docs
