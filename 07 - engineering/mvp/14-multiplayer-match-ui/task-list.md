# Multiplayer Match UI Task List

## Source References

- [MVP system implementation order](../../mvp-system-implementation-order.md)
- [MVP requirements](../../../01 - design/requirements-mvp.md)
- [Networking MVP system](../../../01 - design/systems/networking-mvp-system.md)
- [Room multiplayer system](../../../01 - design/systems/feature-room-multiplayer.md)

## Goal

Build the playable Unity multiplayer presentation after rule and session systems are stable.

## Unity Implementation Notes

- Target module/path is intentionally not fixed yet because this repo has no established UI Toolkit or Figma/UI pipeline.
- Route actual implementation through the UI workflow once a design handoff, screenshot, HTML/CSS mockup, or approved screen spec exists.
- UI must render authoritative state from gameplay/networking systems and submit intents; it must not own gameplay rules.
- Keep first implementation narrow: room, prepare, planning, resolution feedback, and winner display only. Use Play Mode/UI tests or manual Unity verification once the UI stack is selected.

## Linear Tracking

- Primary Linear issue: `GO-19`.
- Parent Linear story: `GO-14 MVP multiplayer match UI`.
- Current Linear status at last sync: `Backlog`.
- Dependency type: player-facing integration milestone.

## Blocking Relationships

- Depends on:
  - [04-prepare-phase-and-initial-setup](../04-prepare-phase-and-initial-setup/task-list.md)
  - [09-elimination-and-win-condition](../09-elimination-and-win-condition/task-list.md)
  - [10-core-match-loop](../10-core-match-loop/task-list.md)
  - [11-local-debug-ui-or-test-harness](../11-local-debug-ui-or-test-harness/task-list.md)
  - [12-networking-room-flow](../12-networking-room-flow/task-list.md)
  - [13-networked-turn-submission](../13-networked-turn-submission/task-list.md)
- Blocks: None.

## Implementation Tasks

- [ ] Confirm UI stack and design handoff source before implementation.
- [ ] Build room creation screen.
- [ ] Build join-by-room-ID screen.
- [ ] Show room ID and joined player count.
- [ ] Show match-start readiness for exactly four players.
- [ ] Build prepare phase screen for MVP unit placement.
- [ ] Show assigned formation zone during prepare phase.
- [ ] Build turn planning controls for movement and attack intent.
- [ ] Show AP budget and remaining AP during planning.
- [ ] Show unit ownership, HP, type, and position clearly.
- [ ] Show MVP counter relationships in a readable way.
- [ ] Show safe zone and unsafe cells.
- [ ] Show resolution feedback for movement, combat, shrink, and elimination.
- [ ] Show match end screen with winner state.
- [ ] Keep UI driven by authoritative match state from gameplay and networking systems.

## Acceptance Criteria

- Players can create or join a room from the UI.
- Players can complete prepare phase and submit turn plans.
- The UI clearly communicates AP, HP, ownership, safe zone, counters, and winner.
- Multiplayer UI does not introduce new gameplay rules outside the authoritative systems.
- Implementation follows the repo UI workflow selected for the actual design handoff.

## Out Of Scope

- Marketing landing page
- Cosmetic progression
- Ranked or matchmaking UI
- Post-MVP unit roster UI
- New gameplay rules

