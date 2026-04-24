# Design Document — Project Go-Royale

## Overview

Project Go-Royale is a mobile-first (iOS/Android) tactical turn-based game that fuses Auto-Chess unit management, Battle Royale shrinking zones, and a card-draw economy. Four players compete on a procedurally generated 9×9 grid. Each match lasts 10–15 minutes. The design philosophy is borrowed from Go: simple rules, profound strategic depth.

### Design Pillars (from GDD)

| Pillar | Commitment |
|--------|-----------|
| Easy to Learn, Hard to Master | ≤6 unit types, 1-page rules; depth from 9×9 grid × terrain × composition |
| Skill > Luck | Input Randomness only (map gen, card draw, shop roll). Zero Output Randomness (no damage rolls, no miss chance). |
| Bounded Session | ≤15 minutes per match enforced by shrink schedule + strict timers |
| Positional Depth | Every cell is a meaningful decision; random terrain eliminates fixed optimal strategies |

### Resolved Design Decisions

- **Turn structure**: Simultaneous submission — all 4 players submit full plans within 45 s; plans resolve concurrently.
- **AP budget**: Fixed at 12 AP per turn, does not scale with surviving unit count.
- **Card economy**: Use-or-lose per turn. Cards must be played or discarded before plan submission.
- **Monetization**: Cosmetic-only Battle Pass + seasonal skins. No gacha. All gameplay unlocks via Match Currency.
- **AFK policy**: 1 AFK turn → AI defensive plan. 2 consecutive AFK turns → player eliminated, units removed.

---

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Mobile App)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  UI Layer    │  │ Plan Builder │  │  Local State Cache   │  │
│  │ (React Native│  │  (AP budget  │  │  (optimistic render) │  │
│  │  / Flutter)  │  │   validator) │  │                      │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         └─────────────────┴──────────────────────┘              │
│                           │ WebSocket / gRPC                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                     GAME SERVER (Go / Rust)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Matchmaking │  │  Match Room  │  │   State Broadcaster  │   │
│  │   Service   │  │  Controller  │  │  (fan-out to 4 peers)│   │
│  └─────────────┘  └──────┬───────┘  └──────────────────────┘   │
│                           │                                      │
│  ┌────────────────────────▼──────────────────────────────────┐  │
│  │                    Turn Engine                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │  │
│  │  │ Map Generator│  │Combat Resolver│  │ Shrink Zone Mgr│  │  │
│  │  └──────────────┘  └──────────────┘  └────────────────┘  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │  │
│  │  │  Card System │  │  Shop/Economy│  │   AFK Manager  │  │  │
│  │  └──────────────┘  └──────────────┘  └────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Serializer / Deserializer (JSON)             │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    PERSISTENCE LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Player DB   │  │  Match Log   │  │  Meta-Progression DB │  │
│  │  (Postgres)  │  │  (append-only│  │  (Postgres)          │  │
│  │              │  │   event log) │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Mobile Client | Flutter (Dart) | Single codebase for iOS + Android; good canvas/animation support for grid rendering |
| Game Server | Go | Excellent concurrency model (goroutines) for managing 4 simultaneous plan submissions; low latency |
| Real-time Transport | WebSocket (gorilla/websocket) | Low-latency bidirectional; works on mobile networks |
| Persistence | PostgreSQL | ACID transactions for match logs and meta-progression |
| Matchmaking Queue | Redis (sorted sets by Elo) | Fast rank-band queries; TTL-based queue expiry |
| Serialization | JSON (encoding/json in Go) | Human-readable, debuggable, cross-platform |

### Client-Server Model

The server is authoritative. The client is a thin rendering and input layer:

1. Client sends player actions (plan submission) to server.
2. Server validates, resolves, and broadcasts the canonical new game state to all 4 clients.
3. Client renders the received state. Optimistic rendering is used only for local AP budget display during plan building.
4. All game logic (combat, shrink, card effects, AFK detection) runs exclusively on the server.

### Match Room Lifecycle

Each match occupies a dedicated in-memory Match Room on the server. The room is created at matchmaking completion and destroyed after post-match summary delivery. Match state is checkpointed to the Match Log (append-only event log) after every turn resolution, enabling reconnect and replay.

---

## Data Models

### Core Enumerations

```go
type TerrainType string
const (
    Plains   TerrainType = "plains"
    Forest   TerrainType = "forest"
    Mountain TerrainType = "mountain"
    River    TerrainType = "river"
)

type UnitTypeName string
const (
    Infantry UnitTypeName = "infantry"
    Archer   UnitTypeName = "archer"
    Cavalry  UnitTypeName = "cavalry"
    Mage     UnitTypeName = "mage"
    Scout    UnitTypeName = "scout"
    Siege    UnitTypeName = "siege"
)

type CardType string
const (
    CardBuff     CardType = "buff"
    CardResource CardType = "resource"
    CardTerrain  CardType = "terrain"
)

type MatchPhase string
const (
    PhaseMatchmaking  MatchPhase = "matchmaking"
    PhaseMapGen       MatchPhase = "map_generation"
    PhasePrepare      MatchPhase = "prepare"
    PhaseTurnLoop     MatchPhase = "turn_loop"
    PhaseResolved     MatchPhase = "resolved"
)

type PlayerStatus string
const (
    StatusActive     PlayerStatus = "active"
    StatusAFK        PlayerStatus = "afk"
    StatusEliminated PlayerStatus = "eliminated"
)
```

### Cell and Map

```go
type Position struct {
    Row int `json:"row"` // 0-indexed, 0 = top
    Col int `json:"col"` // 0-indexed, 0 = left
}

type Cell struct {
    Pos     Position    `json:"pos"`
    Terrain TerrainType `json:"terrain"`
    UnitID  *string     `json:"unit_id,omitempty"` // nil if empty
}

// Map is always 9x9 at match start. Safe zone shrinks each turn.
type Map struct {
    Cells      [9][9]Cell `json:"cells"`
    SafeZone   SafeZone   `json:"safe_zone"`
    TurnNumber int        `json:"turn_number"`
}

// SafeZone defines the currently active rectangular sub-grid.
type SafeZone struct {
    TopLeft     Position `json:"top_left"`
    BottomRight Position `json:"bottom_right"`
}
```

Shrink sequence (turn-end boundaries):

| After Turn | TopLeft | BottomRight | Size |
|-----------|---------|-------------|------|
| 0 (start) | {0,0}   | {8,8}       | 9x9  |
| 1         | {1,1}   | {7,7}       | 7x7  |
| 2         | {2,2}   | {6,6}       | 5x5  |
| 3         | {3,3}   | {5,5}       | 3x3  |

### Unit and UnitType

```go
type UnitType struct {
    Name        UnitTypeName `json:"name"`
    BaseCost    int          `json:"base_cost"`    // Gold at Tier 1
    BaseHP      int          `json:"base_hp"`
    BaseAttack  int          `json:"base_attack"`
    BaseDefense int          `json:"base_defense"`
    AttackRange AttackRange  `json:"attack_range"`
    APCapPerTurn int         `json:"ap_cap_per_turn"` // always 6
    MoveCosts   map[TerrainType]map[UnitTypeName]int `json:"-"` // see terrain table
}

type AttackRange struct {
    Min int `json:"min"` // minimum cells (0 = melee)
    Max int `json:"max"` // maximum cells
}

type Tier int // 1, 2, or 3

type Unit struct {
    ID         string       `json:"id"`          // UUID
    OwnerID    string       `json:"owner_id"`    // Player ID
    Type       UnitTypeName `json:"type"`
    Tier       Tier         `json:"tier"`
    HP         int          `json:"hp"`
    MaxHP      int          `json:"max_hp"`
    Attack     int          `json:"attack"`
    Defense    int          `json:"defense"`
    Pos        Position     `json:"pos"`
    ActiveBuffs []Buff      `json:"active_buffs"`
}
```

Unit base stats table:

| Type     | Cost | HP  | Attack | Defense | Range (min-max) |
|----------|------|-----|--------|---------|-----------------|
| Scout    | 100  | 60  | 15     | 5       | 0-1 (melee)     |
| Infantry | 150  | 100 | 20     | 10      | 0-1 (melee)     |
| Archer   | 175  | 70  | 25     | 5       | 2-4 (ranged)    |
| Cavalry  | 200  | 120 | 22     | 8       | 0-1 (melee)     |
| Mage     | 250  | 80  | 30     | 5       | 1-3 (AoE)       |
| Siege    | 300  | 150 | 35     | 12      | 2-5 (splash)    |

Tier scaling: HP × 1.5 per tier-up, Attack × 1.3 per tier-up (multiplicative from Tier 1 base).

### Card

```go
type BuffEffect struct {
    AttackBoost  int `json:"attack_boost,omitempty"`  // percentage
    DefenseBoost int `json:"defense_boost,omitempty"` // flat
    APBoost      int `json:"ap_boost,omitempty"`       // flat AP added
    DurationTurns int `json:"duration_turns"`
}

type ResourceEffect struct {
    GoldBonus int `json:"gold_bonus,omitempty"`
    APRefund  int `json:"ap_refund,omitempty"`
}

type TerrainEffect struct {
    Action      string      `json:"action"`       // "place" or "remove"
    TerrainType TerrainType `json:"terrain_type,omitempty"`
}

type Card struct {
    ID     string   `json:"id"`
    Type   CardType `json:"type"`
    // Exactly one of the following is non-nil based on Type:
    Buff     *BuffEffect     `json:"buff,omitempty"`
    Resource *ResourceEffect `json:"resource,omitempty"`
    Terrain  *TerrainEffect  `json:"terrain,omitempty"`
}
```

### Player

```go
type Player struct {
    ID             string       `json:"id"`
    DisplayName    string       `json:"display_name"`
    Rank           int          `json:"rank"`           // Elo rating
    Status         PlayerStatus `json:"status"`
    Gold           int          `json:"gold"`
    AP             int          `json:"ap"`             // remaining this turn
    AFKConsecutive int          `json:"afk_consecutive"`
    DrawnCard      *Card        `json:"drawn_card,omitempty"`
    CardPlayed     bool         `json:"card_played"`
    FormationZone  FormationZone `json:"formation_zone"`
    Placement      *int         `json:"placement,omitempty"` // 1-4, set on elimination
}

// FormationZone is the 4x4 corner assigned to this player.
type FormationZone struct {
    TopLeft     Position `json:"top_left"`
    BottomRight Position `json:"bottom_right"`
}
```

Formation zone assignments (0-indexed):

| Player | TopLeft | BottomRight |
|--------|---------|-------------|
| P0     | {0,0}   | {3,3}       |
| P1     | {0,5}   | {3,8}       |
| P2     | {5,0}   | {8,3}       |
| P3     | {5,5}   | {8,8}       |

### Shop

```go
type ShopSlot struct {
    UnitType UnitTypeName `json:"unit_type"`
    Tier     Tier         `json:"tier"`
    Cost     int          `json:"cost"`
    Quantity int          `json:"quantity"` // available to purchase
}

type Shop struct {
    PlayerID     string     `json:"player_id"`
    Slots        []ShopSlot `json:"slots"`
    RefreshCost  int        `json:"refresh_cost"` // always 50
    LastRefreshed int       `json:"last_refreshed_turn"`
}
```

### TurnPlan and Actions

```go
type ActionType string
const (
    ActionMove    ActionType = "move"
    ActionAttack  ActionType = "attack"
    ActionSkill   ActionType = "skill"
    ActionPlayCard ActionType = "play_card"
    ActionDiscard ActionType = "discard_card"
    ActionUpgrade ActionType = "upgrade"
    ActionBuy     ActionType = "buy"
    ActionRefreshShop ActionType = "refresh_shop"
)

type Action struct {
    Type     ActionType `json:"type"`
    UnitID   string     `json:"unit_id,omitempty"`
    Target   *Position  `json:"target,omitempty"`
    CardID   string     `json:"card_id,omitempty"`
    CardTarget *Position `json:"card_target,omitempty"`
    CardTerrainType *TerrainType `json:"card_terrain_type,omitempty"`
    CardBuffTarget  *string      `json:"card_buff_target,omitempty"` // unit ID
    APCost   int        `json:"ap_cost"`
}

type TurnPlan struct {
    PlayerID  string   `json:"player_id"`
    TurnNumber int     `json:"turn_number"`
    Actions   []Action `json:"actions"`
    Submitted bool     `json:"submitted"`
    SubmittedAt *int64 `json:"submitted_at,omitempty"` // unix ms
}
```

### GameState

```go
// GameState is the complete, authoritative state of a match.
// This is the object that is serialized/deserialized for reconnect and replay.
type GameState struct {
    MatchID        string                `json:"match_id"`
    Phase          MatchPhase            `json:"phase"`
    TurnNumber     int                   `json:"turn_number"`
    Map            Map                   `json:"map"`
    Units          map[string]Unit       `json:"units"`          // keyed by unit ID
    Players        map[string]Player     `json:"players"`        // keyed by player ID
    PlayerOrder    []string              `json:"player_order"`   // stable ordering of player IDs
    Shops          map[string]Shop       `json:"shops"`          // keyed by player ID
    Plans          map[string]TurnPlan   `json:"plans"`          // keyed by player ID
    CardDrawHistory []CardDrawEvent      `json:"card_draw_history"`
    EliminationLog  []EliminationEvent   `json:"elimination_log"`
    WinnerID       *string               `json:"winner_id,omitempty"`
    CreatedAt      int64                 `json:"created_at"`     // unix ms
    UpdatedAt      int64                 `json:"updated_at"`     // unix ms
}

type CardDrawEvent struct {
    TurnNumber int    `json:"turn_number"`
    PlayerID   string `json:"player_id"`
    Card       Card   `json:"card"`
}

type EliminationEvent struct {
    TurnNumber int    `json:"turn_number"`
    PlayerID   string `json:"player_id"`
    Cause      string `json:"cause"` // "combat", "shrink", "afk"
    Placement  int    `json:"placement"`
}
```

### Meta-Progression Models

```go
type PlayerProfile struct {
    ID              string            `json:"id"`
    DisplayName     string            `json:"display_name"`
    Rank            int               `json:"rank"`           // Elo
    MatchCurrency   int               `json:"match_currency"`
    XP              int               `json:"xp"`
    UnlockedRoster  []UnitTypeName    `json:"unlocked_roster"`
    TierDiscounts   map[UnitTypeName][]Tier `json:"tier_discounts"` // tiers with 20% discount
    BattlePassLevel int               `json:"battle_pass_level"`
    CosmeticSkins   []string          `json:"cosmetic_skins"`
}
```

---

## Components and Interfaces

### Matchmaking Service

Responsible for grouping 4 players into a match. Uses Redis sorted sets keyed by Elo rating.

**Rank Bands:** Players are bucketed into bands of 200 Elo points (e.g., 0–199, 200–399, …). A match is formed when 4 players share the same band.

**60-Second Timeout Expansion:** If a full group of 4 cannot be assembled within 60 seconds, the search expands to include the immediately adjacent bands (±1 band). This repeats every 60 seconds until a match is found or the queue is empty.

**Match Formation Flow:**
```
Player joins queue
  → placed in Redis sorted set at their Elo score
  → MatchmakingWorker polls every 500ms
  → if 4 players in same band: form match, notify all 4 via WebSocket within 3s
  → if 60s elapsed with < 4: expand to adjacent bands, retry
  → if matched player disconnects before MapGen: replace from queue or cancel + requeue
```

**Interface:**
```go
type MatchmakingService interface {
    Enqueue(playerID string, elo int) error
    Dequeue(playerID string) error
    TryFormMatch() (*MatchGroup, error)  // returns nil if not enough players
    ExpandBands(matchID string) error    // called after 60s timeout
}

type MatchGroup struct {
    Players    [4]string // player IDs
    FormedAt   int64     // unix ms
}
```

---

### Map Generator

Produces a unique 9×9 grid with terrain distribution guarantees.

**Algorithm:**
1. Fill all 81 cells with Plains.
2. For each of the 4 quadrants, apply a seeded noise function to assign Forest, Mountain, and River cells.
3. Mirror the terrain assignment symmetrically across all 4 quadrants (rotational symmetry).
4. Validate: each 4×4 formation zone has ≥ 8 Plains cells. If not, convert excess non-Plains cells to Plains.
5. Validate: no River forms an impassable wall. Run a BFS from each formation zone center to the map center; if any path is blocked, convert blocking River cells to Plains.
6. Return the validated map.

**Interface:**
```go
type MapGenerator interface {
    Generate(seed int64) (Map, error)
}
```

**Timing Constraint:** Must complete within 2 seconds (Req 20.3).

---

### Turn Engine

Orchestrates the full turn lifecycle. Called once per turn by the Match Room Controller.

**Turn Resolution Order:**
1. Award Gold income to all active players: `min(50 + 10 * survivingUnitCount, 150)` (Req 17.6)
2. Draw 1 card per active player; broadcast all drawn cards publicly (Req 11.1–11.2)
3. Open plan submission window (45-second timer) (Req 9.2)
4. On timer expiry or all plans submitted: close submission window
5. Mark any player who did not submit as AFK (Req 14.1)
6. Resolve all plans simultaneously:
   a. Apply card effects that modify AP or stats before movement
   b. Resolve movement (conflict detection: two units → same cell → both stay) (Req 9.5)
   c. Resolve attacks in declaration order; apply damage formula (Req 12.1)
   d. Remove units with HP ≤ 0 (Req 12.4)
   e. Apply Shrink Zone: remove units outside new boundary (Req 10.5)
7. Check elimination: any player with 0 units → eliminated, assign placement (Req 13.1)
8. Check win condition: if exactly 1 player remains → declare winner (Req 13.3)
9. Broadcast new GameState + turn replay animation (≤ 10s) (Req 9.8)
10. Advance turn number; update SafeZone boundary

**Interface:**
```go
type TurnEngine interface {
    ResolveTurn(state *GameState) (*GameState, []TurnEvent, error)
}

type TurnEvent struct {
    Type    string      `json:"type"`    // "move", "attack", "eliminate", "shrink", "card"
    Payload interface{} `json:"payload"`
}
```

---

### Combat Resolver

Implements the deterministic damage formula and range enforcement.

**Damage Formula (Req 12.1):**
```
Damage = Attacker.Attack × CounterMultiplier(attacker.Type, defender.Type)
         − Defender.Defense
         − TerrainCoverBonus(defender.Cell.Terrain)
```
Minimum damage is 0 (cannot heal via defense).

**Counter Multiplier Table (Req 6.2):**

| Attacker | Defender | Multiplier |
|----------|----------|-----------|
| Infantry | Archer   | 1.5×      |
| Archer   | Cavalry  | 1.5×      |
| Cavalry  | Infantry | 1.5×      |
| Scout    | Siege    | 2.0×      |
| Siege    | Infantry | 1.5× (splash) |
| Siege    | Cavalry  | 1.5× (splash) |
| Mage     | any cluster ≥3 | 1.0× (AoE, no counter bonus) |
| all others | — | 1.0× |

**Terrain Cover Bonus (Req 4.2):**

| Terrain  | Defense Bonus |
|----------|--------------|
| Forest   | +1           |
| Mountain | +2           |
| Plains   | 0            |
| River    | 0            |

**AoE Rules:**
- Mage: deals damage to all enemy units within a 2-cell Chebyshev radius of the target cell (Req 12.5)
- Siege: deals damage to all units (including friendly) within a 2-cell Chebyshev radius of the target cell (Req 12.6)

**Attack Range Enforcement (Req 12.7–12.8):**

| Unit Type | Min Range | Max Range | Notes |
|-----------|-----------|-----------|-------|
| Infantry  | 0         | 1         | melee |
| Archer    | 2         | 4         | cannot attack adjacent |
| Cavalry   | 0         | 1         | melee |
| Mage      | 1         | 3         | AoE at target |
| Scout     | 0         | 1         | melee |
| Siege     | 2         | 5         | cannot attack adjacent 2 cells |

Range is measured as Chebyshev distance (max of |Δrow|, |Δcol|).

**Interface:**
```go
type CombatResolver interface {
    CalculateDamage(attacker Unit, defender Unit, defenderCell Cell) int
    ResolveAttacks(state *GameState, attacks []AttackAction) []CombatResult
    IsInRange(attacker Unit, targetPos Position) bool
}

type CombatResult struct {
    AttackerID string
    DefenderID string
    Damage     int
    Eliminated bool
}
```

---

### Shrink Zone Manager

Tracks and applies the safe zone shrink sequence.

**Shrink Sequence (Req 10.1):**

| After Turn | TopLeft | BottomRight | Grid Size |
|-----------|---------|-------------|-----------|
| 0 (start) | {0,0}   | {8,8}       | 9×9       |
| 1         | {1,1}   | {7,7}       | 7×7       |
| 2         | {2,2}   | {6,6}       | 5×5       |
| 3         | {3,3}   | {5,5}       | 3×3       |

After turn 3, the safe zone is at its minimum (3×3). No further shrink occurs; the match must end by this point due to the bounded turn count.

**Simultaneous Elimination Tiebreaker (Req 10.6):** If all remaining players' units are eliminated simultaneously by the shrink zone in the same turn, players are ranked by the number of units they had at the **start** of that turn (more units = better placement). Ties within that count are broken by total HP remaining at turn start.

**Interface:**
```go
type ShrinkZoneManager interface {
    GetSafeZone(turnNumber int) SafeZone
    GetEliminatedCells(turnNumber int) []Position
    ApplyShrink(state *GameState) ([]string, error) // returns eliminated unit IDs
}
```

---

### AFK Manager

Tracks consecutive AFK turns and enforces the 2-turn elimination policy.

**State Machine per Player:**
```
ACTIVE
  → (no submission in 45s) → AFK_1
    → (submits next turn) → ACTIVE
    → (no submission again) → AFK_2 → ELIMINATED (cause: "afk")
```

**Defensive Plan (Req 14.2):** When a player is AFK for 1 consecutive turn, the AFK Manager submits a `TurnPlan` with an empty `Actions` slice (no movement, no attacks). The player's card is auto-discarded (Req 11.8).

**Reconnect Handling (Req 14.4):** If an AFK player reconnects and submits a plan before the 2nd consecutive AFK turn resolves, their `AFKConsecutive` counter resets to 0 and full control is restored on the next turn.

**Reward Forfeiture (Req 14.6):** Players eliminated via AFK receive 0 Match Currency and 0 XP. Their placement is still recorded for ranking purposes.

**Interface:**
```go
type AFKManager interface {
    RecordSubmission(playerID string, turnNumber int)
    RecordAFK(playerID string, turnNumber int) AFKStatus
    ShouldEliminate(playerID string) bool
    GenerateDefensivePlan(playerID string, state *GameState) TurnPlan
}

type AFKStatus int
const (
    AFKStatusNone        AFKStatus = 0
    AFKStatusFirstTurn   AFKStatus = 1
    AFKStatusEliminate   AFKStatus = 2
)
```

---

### Shop and Economy

Manages per-player shops, gold income, and purchase validation.

**Gold Income Formula (Req 17.6):**
```
income = min(50 + 10 × survivingUnitCount, 150)
```

Examples:
- 0 units: 50 Gold
- 5 units: 100 Gold
- 10 units: 150 Gold (capped)

**Shop Refresh (Req 17.3–17.4):** Costs 50 Gold. If a player does not pay to refresh, the same shop slots are retained from the previous turn. The shop is automatically refreshed (free) at the start of the Prepare Stage.

**Shop Slot Generation:** Each slot is drawn randomly from the player's unlocked roster. The number of slots is fixed at 5. Duplicate unit types across slots are allowed.

**Upgrade Costs (Req 7.3):**
- Tier 1 → Tier 2: 200 Gold
- Tier 2 → Tier 3: 400 Gold
- With 20% tier discount unlock: 160 Gold / 320 Gold respectively

**Interface:**
```go
type ShopService interface {
    GenerateShop(playerID string, roster []UnitTypeName) Shop
    RefreshShop(playerID string, state *GameState) (*Shop, error) // deducts 50G
    PurchaseUnit(playerID string, slotIndex int, state *GameState) (*Unit, error)
    UpgradeUnit(playerID string, unitID string, state *GameState) (*Unit, error)
    AwardGoldIncome(state *GameState) *GameState
}
```

---

### Card System

Manages card draw, effect application, and use-or-lose enforcement.

**Card Draw:** At the start of each turn, the server draws 1 card per active player from a shuffled deck. The deck contains equal proportions of Buff, Resource, and Terrain cards. All drawn cards are broadcast publicly before plan submission opens (Req 11.2).

**Card Effects (Req 11.4–11.6):**

| Card Type | Effect | Value | Duration |
|-----------|--------|-------|----------|
| Buff – Attack Boost | +50% attack damage | ×1.5 multiplier | 1 Turn |
| Buff – Defense Boost | +2 effective Defense | flat +2 | 2 Turns |
| Buff – Speed Boost | +2 AP movement allowance | +2 AP for moves only | 1 Turn |
| Resource – Gold Bonus | +150 Gold immediately | +150G | instant |
| Resource – AP Refund | +3 AP to current budget | +3 AP | instant |
| Terrain – Place | Convert Plains → Forest or Mountain | player's choice | permanent |
| Terrain – Remove | Convert Forest/Mountain/River → Plains | — | permanent |

**Use-or-Lose Enforcement (Req 11.7–11.8):** The plan submission endpoint rejects a plan if the player's `DrawnCard` is non-nil and `CardPlayed` is false. If the timer expires, the server auto-discards the card (sets `DrawnCard = nil`, `CardPlayed = true`).

**Terrain Card Restriction (Req 11.9):** A Terrain card cannot be played on a cell occupied by any unit. The server validates this before applying the effect.

**Interface:**
```go
type CardSystem interface {
    DrawCard(playerID string) Card
    PlayCard(playerID string, card Card, target CardTarget, state *GameState) (*GameState, error)
    DiscardCard(playerID string, state *GameState) *GameState
    AutoDiscardAll(state *GameState) *GameState // called on timer expiry
}

type CardTarget struct {
    UnitID      *string      // for Buff cards
    CellPos     *Position    // for Terrain cards
    TerrainType *TerrainType // for Place Terrain cards
}
```

---

### Meta-Progression Service

Handles post-match reward distribution, Elo updates, and roster management.

**Placement Reward Scaling (Req 13.5):**

| Placement | Multiplier | Base Match Currency | Base XP |
|-----------|-----------|---------------------|---------|
| 1st       | 4×        | 400 MC              | 400 XP  |
| 2nd       | 2×        | 200 MC              | 200 XP  |
| 3rd       | 1×        | 100 MC              | 100 XP  |
| 4th       | 0.5×      | 50 MC               | 50 XP   |

AFK-eliminated players receive 0 MC and 0 XP regardless of placement (Req 14.6).

**Elo Update (Req 15.4):** Standard Elo formula with K-factor of 32. Expected score is calculated against the field average. After each match, each player's Elo is updated based on their placement relative to expected outcome.

```
E_i = 1 / (1 + 10^((avg_opponent_elo - player_elo) / 400))
S_i = placement_score  // 1.0 for 1st, 0.67 for 2nd, 0.33 for 3rd, 0.0 for 4th
new_elo = old_elo + K × (S_i - E_i)
```

**Roster Unlocks (Req 15.2):** All 6 base unit types are available to all players by default (Req 16.4). Additional roster slots (if any future unit types are added) are unlocked via Match Currency.

**Tier Discounts (Req 15.3):** Spending Match Currency permanently unlocks a 20% discount on a specific unit type's tier upgrade cost in all future matches. Stored in `PlayerProfile.TierDiscounts`.

**Interface:**
```go
type MetaProgressionService interface {
    AwardPostMatchRewards(matchResult MatchResult) ([]PlayerRewardSummary, error)
    UpdateElo(playerID string, placement int, opponentElos []int) (int, error)
    UnlockRosterUnit(playerID string, unitType UnitTypeName) error
    UnlockTierDiscount(playerID string, unitType UnitTypeName, tier Tier) error
}

type MatchResult struct {
    MatchID    string
    Placements []PlayerPlacement
}

type PlayerPlacement struct {
    PlayerID  string
    Placement int  // 1-4
    AFKElim   bool // true if eliminated due to AFK
}

type PlayerRewardSummary struct {
    PlayerID      string
    MatchCurrency int
    XP            int
    EloChange     int
    NewElo        int
}
```

---

### Serializer / Deserializer

Handles JSON serialization of the complete `GameState` for persistence, reconnect, and replay.

**Round-Trip Guarantee (Req 19.4):** `Deserialize(Serialize(state))` must produce a `GameState` equivalent to the original (all fields equal, including nested maps and slices).

**Error Handling (Req 19.5):** If the input JSON is malformed or missing required fields, the deserializer returns a structured error identifying the specific missing/invalid field path.

**Pretty Printer (Req 19.3):** Outputs JSON with 2-space indentation and alphabetically sorted top-level keys for deterministic output.

**Interface:**
```go
type GameStateSerializer interface {
    Serialize(state GameState) ([]byte, error)
    Deserialize(data []byte) (GameState, error)
    PrettyPrint(state GameState) (string, error)
}
```

---

### State Broadcaster

Fan-out service that sends the updated `GameState` to all 4 clients after each turn resolution.

**Broadcast Payload:** The full `GameState` JSON is sent to all connected clients. Clients that are disconnected have the state queued; on reconnect, the latest state is delivered immediately.

**Reconnect Flow:**
1. Client reconnects via WebSocket with their `playerID` and `matchID`.
2. Server looks up the active Match Room.
3. Server sends the latest `GameState` checkpoint from the Match Log.
4. Client re-renders from the received state.

---

### Win Condition and Elimination Tracker

Monitors player unit counts after each turn resolution phase.

**Elimination (Req 13.1):** After combat and shrink resolution, any player with 0 surviving units is marked `StatusEliminated`. Their `Placement` is set to the current number of remaining active players + 1 (e.g., if 2 players remain active, the eliminated player gets placement 3).

**Winner Declaration (Req 13.3):** After elimination checks, if exactly 1 player has `StatusActive`, that player is declared the winner (placement 1). The match transitions to `PhaseResolved`.

**Post-Match Summary (Req 1.4):** The server computes and sends a `PostMatchSummary` to all clients:
```go
type PostMatchSummary struct {
    MatchID   string                  `json:"match_id"`
    Players   []PlayerMatchSummary    `json:"players"`
}

type PlayerMatchSummary struct {
    PlayerID      string `json:"player_id"`
    DisplayName   string `json:"display_name"`
    Placement     int    `json:"placement"`
    GoldEarned    int    `json:"gold_earned"`    // total gold income during match
    XPEarned      int    `json:"xp_earned"`
    MCEarned      int    `json:"mc_earned"`      // Match Currency
    EloChange     int    `json:"elo_change"`
    NewElo        int    `json:"new_elo"`
}
```

---

### UI Layer (Client)

The Flutter client renders game state received from the server. All game logic runs server-side; the client is a thin rendering and input layer.

**Key UI Panels (Req 18):**

| Panel | Content | Always Visible |
|-------|---------|---------------|
| Map View | 9×9 grid, all units, HP bars, terrain icons, safe zone boundary | Yes |
| Shrink Schedule | Turn-by-turn shrink sequence (9×9→7×7→5×5→3×3) | Yes |
| Player HUD | Gold balance, AP remaining, drawn card | Yes (during plan phase) |
| Unit Info Panel | HP, Attack, Defense, AP costs, attack range, counter relationships | On tap/click |
| Turn Timer | Countdown from 45s, visible to all players | During plan submission |
| Plan Preview | Ghost overlays showing planned moves and attacks | During plan submission |
| Post-Match Summary | Placement, Gold earned, XP, Match Currency, Elo change | After match ends |
| AFK Indicator | Visual badge on AFK player's formation zone | When player is AFK |

**Information Transparency (Req 18.7):** All game state is public. No information is hidden from any player. This is enforced by the server broadcasting the full `GameState` (not a filtered view) to all clients.

**Damage Preview (Req 12.3):** When a player hovers/taps an attack action during plan submission, the client calls a local calculation using the same damage formula to display the exact damage before confirmation. The formula is replicated client-side for UX only; the server's calculation is authoritative.

---

## Performance Requirements

**Target Hardware:** Mid-range mobile devices from 2022 or later (e.g., Snapdragon 778G, Apple A15).

| Requirement | Target | Enforcement |
|-------------|--------|-------------|
| Frame rate | ≥ 30 fps | Flutter rendering pipeline; avoid overdraw on 9×9 grid |
| Turn resolution animation | ≤ 10 seconds | Animation sequence capped server-side; client skips if behind |
| Map generation | ≤ 2 seconds | Synchronous on server at match start; benchmarked in CI |
| Plan submission timer | 45 seconds, no extensions | Server-enforced hard cutoff |
| Match duration bound | ≤ 15 minutes | Mathematical guarantee: 3 shrink steps × (45s plan + 10s resolution) + 60s prepare = ~4.5 min worst case; well within 15 min |

**Session Time Bound Analysis (Req 20.5):**
- Prepare Stage: 60 seconds
- Maximum turns before 3×3 safe zone: 3 turns
- Per turn: 45s plan + 10s resolution = 55s
- Total: 60 + (3 × 55) = 225 seconds ≈ 3.75 minutes
- Even with matchmaking (up to ~2 min) and post-match summary, total session is well under 15 minutes.

---

## Error Handling

### Client Disconnection
- If a client disconnects during plan submission, their plan is treated as not submitted (AFK logic applies).
- If a client disconnects during map generation or prepare stage, matchmaking attempts to replace them (Req 2.4).
- On reconnect, the server delivers the latest `GameState` checkpoint.

### Invalid Plan Submission
- Server validates each action in a `TurnPlan` before accepting it:
  - AP budget not exceeded (total ≤ 12, per-unit ≤ 6)
  - Unit belongs to the submitting player
  - Move targets are within the map bounds
  - Attack targets are within the unit's attack range
  - Card is played or discarded (use-or-lose)
- Invalid plans are rejected with a structured error; the client must correct and resubmit before the timer expires.

### Insufficient Gold
- Purchase and upgrade attempts with insufficient gold are rejected immediately with an `ErrInsufficientGold` error (Req 5.4).

### Malformed Game State
- If the Match Log contains a corrupted checkpoint, the server falls back to the previous valid checkpoint and replays subsequent events.
- Deserialization errors return a structured `DeserializeError` with the field path that failed (Req 19.5).

### Simultaneous Elimination Edge Cases
- If all players are eliminated in the same turn (combat + shrink), the player with the most units at turn start is ranked 1st. Ties broken by total HP at turn start (Req 10.6).
- If exactly 2 players remain and both are eliminated simultaneously, the player with more units at turn start is declared the winner.

---

## Testing Strategy

### Unit Tests
- Damage formula with all counter multiplier combinations
- Terrain cover bonus application
- AP budget validation (total cap, per-unit cap)
- Gold income formula across all unit counts (0–10+)
- Shop refresh cost deduction
- Tier upgrade stat scaling (HP ×1.5, Attack ×1.3)
- AFK state machine transitions (0→1→2 consecutive turns)
- Shrink zone boundary calculation per turn number
- Card effect application (all 7 card variants)
- Placement assignment and reward scaling (4×/2×/1×/0.5×)
- Elo update formula
- Serialization round-trip for all GameState variants

### Property-Based Tests
Each property is tested with a minimum of 100 randomly generated inputs using a property-based testing library (e.g., `gopter` for Go).

Tag format: **Feature: go-royale-game, Property {N}: {property_text}**

See Correctness Properties section for the full list.

### Integration Tests
- Matchmaking queue: rank band grouping, 60s timeout expansion
- WebSocket plan submission and broadcast
- Match Room full lifecycle (matchmaking → map gen → prepare → 3 turns → win)
- Post-match reward persistence to PlayerProfile

### Smoke Tests
- 30 fps rendering on target device (manual QA)
- Turn resolution animation completes within 10 seconds (automated timing test)
- Map generation completes within 2 seconds (CI benchmark)

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Damage formula is deterministic

*For any* attacker unit, defender unit, and defender cell terrain, the damage calculated by `CalculateDamage` SHALL always return the same value when called with identical inputs.

**Validates: Requirements 12.1, 12.2**

---

### Property 2: Counter multiplier correctness

*For any* attacker/defender unit type pair, the counter multiplier applied SHALL match the defined intransitive counter table exactly (1.5× for standard counters, 2.0× for Scout vs Siege, 1.0× for all other pairs).

**Validates: Requirements 6.2, 6.4, 12.1**

---

### Property 3: Terrain cover bonus correctness

*For any* defending unit on any terrain type, the effective defense bonus applied SHALL match the defined terrain cover table (Forest +1, Mountain +2, Plains 0, River 0).

**Validates: Requirements 4.2, 12.1**

---

### Property 4: AP budget invariant

*For any* turn plan, the sum of AP costs across all actions SHALL not exceed 12, and the AP assigned to any single unit SHALL not exceed 6.

**Validates: Requirements 8.1, 8.4**

---

### Property 5: Gold income formula

*For any* player with N surviving units (N ≥ 0), the gold income awarded at turn start SHALL equal `min(50 + 10 × N, 150)`.

**Validates: Requirement 17.6**

---

### Property 6: Tier upgrade stat scaling

*For any* unit upgraded from Tier N to Tier N+1, the unit's MaxHP SHALL increase by exactly 50% and its base Attack SHALL increase by exactly 30% relative to the Tier N values.

**Validates: Requirement 7.2**

---

### Property 7: Shrink zone sequence

*For any* turn number T (0 ≤ T ≤ 3), the safe zone boundary returned by `GetSafeZone(T)` SHALL match the defined shrink sequence: T=0 → 9×9, T=1 → 7×7, T=2 → 5×5, T=3 → 3×3.

**Validates: Requirement 10.1**

---

### Property 8: Units outside safe zone are eliminated

*For any* game state after shrink resolution, no surviving unit SHALL have a position outside the current safe zone boundary.

**Validates: Requirements 10.3, 10.5**

---

### Property 9: Movement conflict resolution

*For any* two units from any players that both attempt to move to the same cell in the same turn, both units SHALL remain in their original cells after movement resolution.

**Validates: Requirement 9.5**

---

### Property 10: Card use-or-lose enforcement

*For any* player turn plan submission, if the player has a drawn card that has not been played or discarded, the plan submission SHALL be rejected.

**Validates: Requirement 11.7**

---

### Property 11: Card effect correctness

*For any* card of any type played on a valid target, the resulting game state SHALL reflect the exact effect defined for that card type (correct gold delta, AP delta, stat buff, or terrain change).

**Validates: Requirements 11.4, 11.5, 11.6**

---

### Property 12: Terrain card cell occupancy restriction

*For any* terrain card play targeting a cell occupied by any unit, the play SHALL be rejected and the game state SHALL remain unchanged.

**Validates: Requirement 11.9**

---

### Property 13: AFK consecutive turn elimination

*For any* player who fails to submit a plan for 2 consecutive turns, that player SHALL be eliminated from the match with cause "afk" after the 2nd consecutive AFK turn resolves.

**Validates: Requirements 14.2, 14.3**

---

### Property 14: Placement reward scaling

*For any* completed match, the Match Currency and XP awarded to each player SHALL equal the base reward multiplied by their placement multiplier (1st: 4×, 2nd: 2×, 3rd: 1×, 4th: 0.5×), except AFK-eliminated players who receive 0.

**Validates: Requirements 13.5, 14.6, 15.1**

---

### Property 15: Serialization round-trip

*For any* valid `GameState` object, serializing it to JSON and then deserializing the result SHALL produce a `GameState` object equivalent to the original (all fields equal).

**Validates: Requirement 19.4**

---

### Property 16: Map formation zone plains guarantee

*For any* generated map, each of the four 4×4 formation zone corners SHALL contain at least 8 Plains cells.

**Validates: Requirement 3.3**

---

### Property 17: Map terrain symmetry

*For any* generated map, the terrain type distribution across all four quadrants SHALL be symmetric (rotationally equivalent).

**Validates: Requirement 3.4**

---

### Property 18: Attack range enforcement

*For any* attack action where the target cell is outside the attacking unit's defined attack range, the action SHALL be rejected and the game state SHALL remain unchanged.

**Validates: Requirements 12.7, 12.8**

---

### Property 19: Winner is last player with units

*For any* game state where exactly one player has surviving units and all other players are eliminated, that player SHALL be declared the winner.

**Validates: Requirement 13.3**

---

### Property 20: Shop refresh cost deduction

*For any* player who requests a shop refresh with sufficient gold, their gold balance SHALL decrease by exactly 50 and the shop slots SHALL be replaced with a new random selection.

**Validates: Requirement 17.3**
