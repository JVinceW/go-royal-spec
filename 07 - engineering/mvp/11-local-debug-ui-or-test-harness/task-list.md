# Local Debug UI Or Test Harness Task List

## Source References

- [MVP system implementation order](../../mvp-system-implementation-order.md)
- [MVP requirements](../../../01 - design/requirements-mvp.md)
- [MVP system overview](../../../01 - design/systems/mvp-system-overview.md)

## Goal

Provide a minimal Unity-facing way to exercise deterministic local rules before networking and polished multiplayer UI exist.

## Unity Implementation Notes

- Preferred first implementation: Edit Mode or Play Mode test harness around `Game.Common` rules.
- Optional Unity module if a scene adapter is needed: `Assets/Game.MainGame`.
- Avoid establishing a permanent UI Toolkit architecture here; the harness can be disposable.
- Suggested tests: `Assets/Tests/EditMode/Mvp/MvpDebugHarnessTests.cs` or Play Mode tests only if scene interaction is required.

## Linear Tracking

- Primary Linear issue: `GO-16`.
- Parent Linear story: `GO-12 MVP local gameplay loop and debug harness`.
- Current Linear status at last sync: `Backlog`.
- Dependency type: verification and playtest support milestone.

## Blocking Relationships

- Depends on:
  - [09-elimination-and-win-condition](../09-elimination-and-win-condition/task-list.md)
  - [10-core-match-loop](../10-core-match-loop/task-list.md)
- Blocks:
  - [12-networking-room-flow](../12-networking-room-flow/task-list.md)
  - [14-multiplayer-match-ui](../14-multiplayer-match-ui/task-list.md)

## Implementation Tasks

- [ ] Decide whether the first harness is test-only, console/log based, or a minimal Unity scene adapter.
- [ ] Render or print the current 9x9 board state.
- [ ] Show unit ownership, type, position, HP, and alive status.
- [ ] Show current turn number and shrink step.
- [ ] Show safe-zone cells and unsafe cells.
- [ ] Show each active player's AP budget.
- [ ] Allow submission of mock turn plans for local testing.
- [ ] Surface validation errors for illegal plans.
- [ ] Display movement results.
- [ ] Display combat results, damage, counter bonus, and deaths.
- [ ] Display shrink eliminations.
- [ ] Display eliminated players and winner state.
- [ ] Keep the harness isolated from final multiplayer UI code unless the team explicitly promotes it.

## Acceptance Criteria

- Designers and engineers can inspect the full match state locally.
- Mock plans can drive the core match loop without networking.
- The harness exposes enough data to debug AP, HP, ownership, safe zone, and winner logic.
- The harness stays simple and disposable compared with the final multiplayer UI.

## Out Of Scope

- Production UI polish
- Online room flow
- Matchmaking
- Persistent telemetry
- Reusable UI framework decisions
