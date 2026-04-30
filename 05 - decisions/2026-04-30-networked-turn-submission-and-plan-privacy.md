# Decision: MVP Networked Turn Submission And Plan Privacy

Date: 2026-04-30

## Status

Draft for review before implementation planning sync.

## Context

Go Royal MVP already has two accepted multiplayer decisions:

- SpacetimeDB is the authoritative backend
- room creation, slot ownership, and disconnect handling are defined by the room-flow decision

The remaining open multiplayer behavior is the concrete contract for turn-plan submission during a live match.

The MVP needs:

- simultaneous hidden planning
- authoritative plan validation
- deterministic resolution after submission closes
- safe client feedback without leaking another player's plan
- simple behavior for duplicates, resubmits, timeouts, and disconnects

The turn-resolution feature already defines gameplay behavior such as AP checks, action validation, empty-plan timeout fallback, and deterministic resolution order. This decision only locks the networked submission and privacy boundary around that gameplay system.

## Decision

Use private authoritative plan storage with public submission-status signals.

During `TurnPlanning`, each active player submits a turn plan intent to SpacetimeDB. The submitted plan remains private until the planning window closes and the server resolves the turn.

Other clients may know whether a player has submitted, but they may not read the submitted plan contents before resolution.

## Authority Boundary

SpacetimeDB SHALL own:

- acceptance or rejection of submitted plans
- plan replacement rules before lock
- timeout behavior for missing plans
- private storage of submitted plan payloads
- transition from `TurnPlanning` to `TurnResolution`
- authoritative post-resolution event and state broadcast

Unity clients SHALL only:

- build a local candidate plan
- submit it as an intent
- receive acceptance or rejection for that player's own submission
- observe public readiness and final authoritative resolution output

Clients do not see hidden opponent plans before resolution and do not trigger resolution locally.

## Submission Model

Each active non-eliminated player may have at most one accepted plan for the current turn at any moment.

The MVP submission model SHALL be:

1. client submits a plan intent for `turn_number`
2. server validates room membership, player slot, match phase, elimination state, and turn number
3. server passes the plan to gameplay validation
4. if valid, server stores the latest accepted plan for that player and turn
5. if invalid, server rejects the submission with a structured reason

The stored plan is authoritative only after acceptance by the server.

## Replacement Rule

The MVP SHALL allow plan replacement while the planning window is still open.

Meaning:

- a player may resubmit for the same `turn_number`
- the newest accepted plan replaces the older accepted plan
- replacement is allowed only before the turn is locked for resolution

Once the planning window closes or the match enters `TurnResolution`, further submissions for that turn SHALL be rejected.

This is preferred over first-submit-lock because it is easier for playtesting and better matches a normal simultaneous-planning UX.

## Public Versus Private State

### Private State

The following data SHALL be private or server-only until resolution:

- raw plan payload
- action order inside the plan
- unit movement destinations
- attack targets
- whether a player submitted an empty plan intentionally or by timeout

### Public State During Planning

The following data MAY be public during planning:

- current turn number
- planning timer remaining
- whether each active player has submitted
- whether a player is disconnected

Recommended public room or match signal shape:

```text
TurnSubmissionStatus
  match_id
  turn_number
  player_slot
  has_submitted
  is_disconnected
```

The MVP SHALL NOT expose opponent action details before resolution.

## Submission Status Visibility

The preferred MVP visibility rule is:

- every player can see which player slots have submitted
- no player can inspect another slot's actual plan contents

This gives enough shared pacing information for multiplayer playtests without breaking hidden simultaneous planning.

## Turn Lock And Resolution Trigger

The server SHALL lock submissions for the turn when either of these conditions becomes true:

1. all active non-eliminated players have an accepted plan
2. the planning timer expires

After lock:

1. missing active-player plans are converted to empty plans
2. no further replacement is allowed
3. match phase transitions to `TurnResolution`
4. the deterministic resolver runs once
5. authoritative results are broadcast

Clients SHALL NOT be able to force multiple resolutions for the same turn.

## Timeout Policy

Use the gameplay default timer unless future tuning overrides it:

```text
turn_timer_seconds = 45
```

At timeout:

- any active player without an accepted plan receives an empty plan
- disconnected players follow the same rule
- timeout does not reveal whether another player had a partial draft client-side

The authoritative system only cares whether an accepted plan existed when the window closed.

## Disconnect Interaction

This decision follows the accepted room-flow rule:

- disconnected players remain in the match
- if they have not submitted when the timer closes, the server fills an empty plan

If a disconnected player had already submitted an accepted plan before timeout, that accepted plan SHALL still be used for resolution.

## Structured Error Contract

Rejected submissions SHOULD return structured development-friendly reasons.

Recommended MVP error categories:

- `NotInMatch`
- `WrongMatchPhase`
- `WrongTurnNumber`
- `PlayerEliminated`
- `SubmissionWindowClosed`
- `InvalidPlan`
- `UnauthorizedPlayerSlot`

Gameplay validation details may be nested under `InvalidPlan`, but the public error response should remain stable enough for UI and debug logging.

## Broadcast Contract

The MVP broadcast split SHALL be:

### Targeted Response To Submitter

After a submission attempt, only the submitting client receives:

- accepted or rejected result
- validation error details if rejected
- confirmation that the latest accepted plan replaced the prior one if relevant

### Public Match Broadcasts

All clients may receive:

- submission-status updates by player slot
- planning timer state
- phase change to `TurnResolution`
- authoritative resolution events
- authoritative post-turn match snapshot

The server SHALL NOT broadcast raw plan payloads at submit time.

## Suggested SpacetimeDB Shape

Likely private table:

- `SubmittedTurnPlan`

Likely public table or derived row set:

- `TurnSubmissionStatus`

Suggested private plan fields:

```text
SubmittedTurnPlan
  match_id
  turn_number
  player_slot
  submitted_at
  submission_source = Player | TimeoutFallback
  payload
```

### MVP Log Storage

The MVP SHALL keep explicit application-level log tables instead of relying only on current-state reconstruction.

Recommended split:

- `SubmittedTurnPlan` private for live current-turn authoritative state
- `SubmittedTurnPlanArchive` private persistent for accepted historical turn plans
- `MatchTurnLog` persistent for resolved per-turn outcomes
- `ResolutionEvent` event table for transient client-facing resolution broadcast

Suggested archive shape:

```text
SubmittedTurnPlanArchive
  match_id
  turn_number
  player_slot
  submitted_at
  submission_source = Player | TimeoutFallback
  payload
```

Suggested turn log shape:

```text
MatchTurnLog
  match_id
  turn_number
  resolved_at
  public_resolution_payload
```

This keeps replay, debugging, and audit history available without exposing hidden plans publicly and without depending on internal commitlog behavior as a product feature.

Suggested reducers:

- `SubmitTurnPlan`
- `TickPlanningTimer` or server-side scheduled timeout hook
- `ResolveTurnIfReady`

Suggested checks inside `SubmitTurnPlan`:

- player belongs to match
- player owns the slot they are submitting for
- match phase is `TurnPlanning`
- turn number matches current turn
- player is not eliminated
- submission window is still open
- payload passes gameplay validation

## Rejected Or Deferred Alternatives

### Public Raw Plans During Planning

Rejected for MVP.

This breaks the simultaneous hidden-planning model and changes the game materially.

### First Accepted Plan Locks Immediately

Rejected for MVP.

It is simpler server-side, but too unforgiving for playtests and makes UX worse during a timed planning window.

### Client-Side Resolution Trigger

Rejected for MVP.

Resolution must remain server-authoritative to avoid duplicate resolves and desync risk.

### Full Reconnect Draft Recovery

Deferred.

The MVP does not preserve in-progress client drafts across disconnects.

## Consequences

Benefits:

- preserves hidden simultaneous planning
- clear privacy boundary
- simple readiness UI
- supports plan editing before lock
- clean fit with deterministic server resolution

Tradeoffs:

- requires separate private and public submission representations
- needs explicit server timer or scheduled timeout handling
- rejected plans need stable error mapping for client UX

## Follow-Up

If accepted, this decision should be reflected in:

- `01 - design/systems/networking-mvp-system.md`
- `01 - design/systems/feature-turn-resolution.md`
- `07 - engineering/mvp/13-networked-turn-submission/task-list.md`
