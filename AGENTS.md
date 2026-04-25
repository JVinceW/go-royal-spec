# Repository Guidelines

## Project Structure & Module Organization
This repository is a git-tracked planning workspace for Project Go-Royale MVP. It is used for brainstorming, product/design documentation, and task management only; application code is implemented elsewhere. The main working set lives under `01 - design/`, with product intent in `requirements.md`, MVP scope in `requirements-mvp.md`, legacy broader context in `design.md`, and feature/system breakdowns in `01 - design/systems/`. Planning artifacts live in `01 - design/plans/`. The remaining top-level folders (`02 - content/` through `06 - references/`, plus `99 - scratch/`) are workflow buckets for later assets, balancing notes, playtest findings, decisions, references, and temporary work. Keep durable material in the numbered folders and clear final content out of `99 - scratch/`.

## Build, Test, and Development Commands
No application build or automated test toolchain is committed here; current development is planning, brainstorming, documentation, and backlog management.

- `Get-ChildItem -Force` checks the repository layout and confirms git metadata.
- `rg --files` inventories design files quickly.
- `Get-Content '01 - design\requirements-mvp.md'` reviews the current MVP source of truth before updating related docs.
- `git status --short` checks in-flight document changes.
- `git log --oneline -5` shows the recent commit style used in this repo.

If code or tooling is added later, replace this section with the exact local commands instead of placeholders.

## Coding Style & Naming Conventions
Use Markdown for all repo documents. Prefer short sections, explicit headings, and normative wording such as `SHALL`, `SHOULD`, and clearly labeled scope boundaries when describing systems. Keep filenames purpose-driven and readable, following existing patterns like `feature-room-multiplayer.md` and `mvp-system-overview.md`. Preserve the numbered folder prefixes so documents stay ordered by workflow stage.

## Testing Guidelines
There is no automated test suite yet. For document edits, verify consistency across `requirements-mvp.md`, related system docs in `01 - design/systems/`, and any plan files affected by the change. Check terminology, map size, player count, unit roster, and scope boundaries carefully so newer MVP docs do not drift back toward older pre-MVP design assumptions.

## Commit & Pull Request Guidelines
This repository has git history, and recent commits use short imperative subjects such as `feat: Add MVP system design` and `init spec project message`. Keep commit messages concise and scoped to the change, for example `docs: refine turn resolution flow` or `design: align room lifecycle wording`. Pull requests should summarize the design change, list affected documents, call out any MVP scope decisions, and note open questions or follow-up docs.

## Contributor Notes
Treat `01 - design/requirements-mvp.md` as the current MVP behavioral source of truth. Use the older `design.md` for background only when it still matches MVP scope, and update related system or plan documents in the same change when a source-of-truth rule shifts.

For Linear workflow, parent stories default to `human`, execution-oriented subtasks usually use `ai-agent`, and both labels are reserved for genuinely shared execution work. Keep the detailed role split in the ticket body, and use [learning.md](/E:/go-royal/learning.md) as the detailed reference for planning and task-management conventions.
