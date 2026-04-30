# Networked Turn Submission Task List

## Source References

- [MVP system implementation order](../../mvp-system-implementation-order.md)
- [MVP requirements](../../../01 - design/requirements-mvp.md)
- [Networking MVP system](../../../01 - design/systems/networking-mvp-system.md)
- [Turn resolution system](../../../01 - design/systems/feature-turn-resolution.md)
- [SpacetimeDB authoritative networking decision](../../../05%20-%20decisions/2026-04-29-spacetimedb-authoritative-networking.md)
- [Room flow implementation decision](../../../05%20-%20decisions/2026-04-30-room-flow-implementation-decision.md)
- [Networked turn submission and plan privacy decision](../../../05%20-%20decisions/2026-04-30-networked-turn-submission-and-plan-privacy.md)

## Goal

Connect multiplayer player intent to the authoritative deterministic gameplay loop while preserving hidden simultaneous planning.

## Implementation Notes

- SpacetimeDB owns authoritative submission state, plan privacy, turn lock, timeout fallback, logging, and broadcast.
- Unity clients submit plan intents, render public submission status, receive targeted validation feedback, and render authoritative resolution output.
- Opponent plan payloads must remain private until resolution.
- Each active player may replace their accepted plan until the turn locks.
- Scheduled SpacetimeDB reducers own planning deadlines and timeout lock behavior.
- Current state, persistent history, and transient broadcast output must be represented separately.

## Linear Tracking

- Primary Linear issue: `GO-18`.
- Parent Linear story: `GO-13 MVP room-based multiplayer`.
- Current Linear status at last sync: `Backlog`.
- Dependency type: multiplayer gameplay integration milestone.
- Child Linear issues:
  - `GO-24` Define turn submission data model and visibility.
  - `GO-25` Implement authoritative `SubmitTurnPlan` validation.
  - `GO-26` Implement replace-before-lock submission behavior.
  - `GO-27` Implement scheduled timeout and single turn-lock flow.
  - `GO-28` Implement private plan archive and persistent turn log.
  - `GO-29` Implement public status and resolution broadcast contract.
  - `GO-30` Add deterministic tests for authority, privacy, timeout, and logging.

## Blocking Relationships

- Depends on:
  - [05-turn-plan-validation](../05-turn-plan-validation/task-list.md)
  - [10-core-match-loop](../10-core-match-loop/task-list.md)
  - [12-networking-room-flow](../12-networking-room-flow/task-list.md)
- Blocks:
  - [14-multiplayer-match-ui](../14-multiplayer-match-ui/task-list.md)

## Implementation Tasks

### GO-24 Define Turn Submission Data Model And Visibility

- [ ] Define `SubmittedTurnPlan` as private live current-turn state.
- [ ] Define `TurnSubmissionStatus` as public readiness state.
- [ ] Define `SubmittedTurnPlanArchive` as private persistent history.
- [ ] Define `MatchTurnLog` as persistent per-turn resolution history.
- [ ] Define `ResolutionEvent` as transient resolution broadcast output.
- [ ] Verify public subscriptions cannot expose opponent plan payloads.

### GO-25 Implement Authoritative SubmitTurnPlan Validation

- [ ] Validate submitting player belongs to the match.
- [ ] Validate submitting player owns the submitted player slot.
- [ ] Reject submissions outside `TurnPlanning`.
- [ ] Reject submissions with the wrong turn number.
- [ ] Reject submissions from eliminated players.
- [ ] Pass accepted-shape payloads into gameplay plan validation.
- [ ] Return stable structured error categories such as `NotInMatch`, `WrongMatchPhase`, `WrongTurnNumber`, `PlayerEliminated`, `SubmissionWindowClosed`, `InvalidPlan`, and `UnauthorizedPlayerSlot`.

### GO-26 Implement Replace-Before-Lock Submission Behavior

- [ ] Allow a player to resubmit during the planning window.
- [ ] Replace the previous accepted live plan with the newest accepted plan.
- [ ] Keep only one accepted live plan per active player per turn.
- [ ] Reject replacement attempts after the turn locks.
- [ ] Return targeted submitter confirmation when a prior accepted plan was replaced.

### GO-27 Implement Scheduled Timeout And Single Turn-Lock Flow

- [ ] Store server-authoritative planning deadline state.
- [ ] Schedule planning timeout through SpacetimeDB.
- [ ] Lock the turn when all active players have submitted.
- [ ] Lock the turn when the planning timer expires.
- [ ] Fill missing active-player plans with empty timeout fallback plans.
- [ ] Make all-ready lock and timeout lock converge into one authoritative resolve path.
- [ ] Prevent duplicate resolution for the same match turn.

### GO-28 Implement Private Plan Archive And Persistent Turn Log

- [ ] Archive accepted player-submitted plans into `SubmittedTurnPlanArchive`.
- [ ] Archive timeout fallback plans into `SubmittedTurnPlanArchive`.
- [ ] Record plan source as `Player` or `TimeoutFallback`.
- [ ] Persist resolved turn output into `MatchTurnLog`.
- [ ] Keep hidden plan history out of public subscriptions.
- [ ] Ensure every resolved turn has durable history for replay, debugging, and audit.

### GO-29 Implement Public Status And Resolution Broadcast Contract

- [ ] Broadcast public `has_submitted` state by player slot.
- [ ] Broadcast planning timer state.
- [ ] Broadcast phase transition to `TurnResolution`.
- [ ] Emit `ResolutionEvent` records for live resolution output.
- [ ] Broadcast the authoritative post-turn match snapshot.
- [ ] Ensure clients can see which slots submitted without seeing opponent plan contents.
- [ ] Ensure all clients receive identical authoritative post-turn state.

### GO-30 Add Deterministic Tests For Authority, Privacy, Timeout, And Logging

- [ ] Test wrong-slot submission rejection.
- [ ] Test wrong-phase submission rejection.
- [ ] Test wrong-turn submission rejection.
- [ ] Test eliminated-player submission rejection.
- [ ] Test replace-before-lock behavior.
- [ ] Test post-lock submission rejection.
- [ ] Test timeout empty-plan fallback.
- [ ] Test `SubmittedTurnPlanArchive` persistence.
- [ ] Test `MatchTurnLog` persistence.
- [ ] Test no opponent plan leakage before resolution.

## Acceptance Criteria

- Active players can submit plans only for their own slot during `TurnPlanning`.
- Opponent plan contents remain hidden until resolution.
- A player may replace their accepted plan before the turn locks.
- Turn lock happens exactly once per turn.
- Missing active-player plans become empty plans at timeout.
- Accepted plans are archived privately.
- Resolved turn history is stored persistently.
- Clients receive transient resolution events and identical authoritative post-turn results.
- Clients never own gameplay-rule decisions.

## Out Of Scope

- Client-side prediction as authoritative truth
- Reconnect recovery
- Anti-cheat beyond authoritative validation
- Final match UI polish

