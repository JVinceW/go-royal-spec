# Repository Guidelines

## Project Structure & Module Organization
This repository currently stores product and game-design artifacts rather than application code. The active source material lives in `01- design/`, including [`requirements.md`](E:/new-game/01-%20design/requirements.md), [`design.md`](E:/new-game/01-%20design/design.md), and the one-page GDD. The remaining top-level folders (`02 - content/` through `06 - references/`, plus `99 - scratch/`) are reserved for future content, balancing notes, playtest data, decisions, references, and temporary working files. Keep durable project documents in numbered folders and avoid leaving final material in `99 - scratch/`.

## Build, Test, and Development Commands
No build, test, or runtime toolchain is committed yet. Current work is document editing and review.

- `Get-ChildItem -Force` lists the repository layout.
- `rg --files` inventories tracked working files quickly.
- `Get-Content '01- design\\requirements.md'` reviews the requirements source before editing related docs.

If code is added later, update this section with the exact local build and test commands instead of placeholders.

## Coding Style & Naming Conventions
Use Markdown for repository documents. Prefer short sections, explicit headings, and requirement-style language for normative specs. Follow the existing folder naming pattern with numeric prefixes such as `01- design/` and `05 - decisions/` so materials stay ordered by workflow stage. Name new documents by purpose, for example `combat-resolution.md` or `2026-04-25-playtest-notes.md`.

## Testing Guidelines
There is no automated test suite yet. For document changes, verify consistency across `requirements.md`, `design.md`, and related reference files. When adding rules or systems, check terminology, numeric values, and acceptance criteria against the existing design docs. If code is introduced, add a matching test directory and document the command used to run it here.

## Commit & Pull Request Guidelines
Git history is not available in this workspace, so no commit convention can be inferred from the repository itself. Use concise, imperative commit messages such as `docs: refine shrink zone rules` or `design: align AP budget wording`. Pull requests should summarize the change, list affected files, call out any design decisions or unresolved questions, and include screenshots only when visual assets or layouts change.

## Contributor Notes
Do not invent implementation details that contradict the current design documents. Treat `requirements.md` as the behavioral source of truth, and update `design.md` in the same change when architectural implications shift.
