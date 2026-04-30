# Repository Guidelines

## Project Structure & Module Organization
This repository is a git-tracked planning workspace for Project Go-Royale MVP. It is for brainstorming, product/design documentation, backlog shaping, and task management only; application code is implemented elsewhere. The main source material lives under `01 - design/`: baseline intent in `requirements.md`, active MVP scope in `requirements-mvp.md`, broader legacy context in `design.md`, system specs in `01 - design/systems/`, and plan/backlog docs in `01 - design/plans/`. The other numbered folders are workflow buckets: `02 - content/`, `03 - balance/`, `04 - playtest/`, `05 - decisions/`, `06 - references/`, and `07 - engineering/` for implementation-facing planning artifacts such as execution order and task lists. Use `99 - scratch/` for temporary exploration only, and move any durable output into the appropriate numbered folder before considering the work final.

## Build, Test, and Development Commands
No application build or automated test toolchain is committed here. Work in this repo is document-first and planning-only.

- `Get-ChildItem -Force` checks the repository layout and confirms git metadata.
- `rg --files` inventories design files quickly.
- `Get-Content '01 - design\requirements-mvp.md'` reviews the current MVP source of truth before updating related docs.
- `Get-Content 'learning.md'` reviews the durable planning and Linear workflow conventions before changing repo guidance or ticket-writing patterns.
- `git status --short` checks in-flight document changes.
- `git log --oneline -5` shows the recent commit style used in this repo.

If code or tooling is added later, replace this section with the exact local commands instead of placeholders.

## Coding Style & Naming Conventions
Use Markdown for all repo documents. Prefer short sections, explicit headings, and normative wording such as `SHALL`, `SHOULD`, and clearly labeled scope boundaries when describing systems. Keep filenames purpose-driven and readable, following existing patterns like `feature-room-multiplayer.md`, `mvp-system-overview.md`, and `task-list.md`. Preserve the numbered folder prefixes so documents stay ordered by workflow stage.

## Testing Guidelines
There is no automated test suite yet. For document edits, verify consistency across `01 - design/requirements-mvp.md`, related system docs in `01 - design/systems/`, affected plan docs in `01 - design/plans/`, and any downstream execution docs in `07 - engineering/`. Check terminology, map size, player count, unit roster, execution order, and scope boundaries carefully so newer MVP docs do not drift back toward older pre-MVP assumptions.

## Commit & Pull Request Guidelines
This repository has git history, and recent commits use short imperative subjects such as `feat: Add MVP system design` and `init spec project message`. Keep commit messages concise and scoped to the change, for example `docs: refine turn resolution flow` or `design: align room lifecycle wording`. Pull requests should summarize the design change, list affected documents, call out any MVP scope decisions, and note open questions or follow-up docs.

## Contributor Notes
Treat `01 - design/requirements-mvp.md` as the current MVP behavioral source of truth. Use the older `design.md` for background only when it still matches MVP scope, and update related system, plan, and engineering-task documents in the same change when a source-of-truth rule shifts.

For multiplayer backend and networking planning, treat `05 - decisions/2026-04-29-spacetimedb-authoritative-networking.md` as the current architecture decision baseline until it is replaced by a newer decision note. Use `05 - decisions/2026-04-30-room-flow-implementation-decision.md` for room lifecycle, slot, host, and disconnect rules, and use `05 - decisions/2026-04-30-networked-turn-submission-and-plan-privacy.md` for hidden turn-plan submission, plan privacy, timeout locking, and MVP log storage. New room-flow, transport, shared-contract, phase-timer, turn-submission, or local-dev backend planning should extend these decisions instead of inventing parallel assumptions.

This repo is not an implementation workspace. Do not describe local code changes as if they happened here; capture planning intent, requirements, execution order, and downstream task breakdowns instead.

For Linear workflow, treat layer labels and execution labels separately. Use `shared`, `server`, or `client` to show the primary implementation layer, and use `ai-agent` only when the task is concrete enough to be assigned to Codex. Keep the detailed labeling and role-split rules in the ticket body and in [learning.md](/E:/go-royal/learning.md) instead of overloading labels alone. Treat `01 - design/plans/linear-mvp-backlog.md` as the current issue-hierarchy snapshot and `07 - engineering/mvp/*/task-list.md` as the local implementation-checklist layer that mirrors the active Linear tasks.
