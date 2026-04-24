# Requirements Document

## Introduction

Project Go-Royale is a mobile-first (iOS/Android) tactical turn-based game blending Auto-Chess unit management, Battle Royale shrinking zones, and card-draw economy. Four players compete on a procedurally generated 9×9 grid battlefield. Each match lasts 10–15 minutes. Players buy units, arrange formations, spend Action Points to maneuver and attack, draw fate cards each turn, and survive a progressively shrinking safe zone. The last surviving army wins.

The game targets Casual-Mid Core players who enjoy short tactical games (Langrisser, classic Fire Emblem). Its design philosophy is borrowed from Go: simple rules, profound strategic depth.

**Resolved Open Questions (incorporated into requirements below):**
- Turn structure: **Simultaneous-turn submission** — all four players submit their full turn plan within a time limit; plans resolve concurrently. This preserves the 15-minute session bound and adds a bluffing/prediction layer.
- AP budget: **Fixed per turn, does NOT scale with surviving unit count.** Scaling AP would reward attrition and encourage passive play; fixed AP keeps the tradeoff consistent.
- Card economy: **Use-or-lose per turn.** Cards drawn at the start of a turn must be played or discarded before the turn resolves. This prevents card hoarding and keeps each turn self-contained.
- Monetization: **Cosmetic-only Battle Pass + seasonal cosmetic skins.** No gacha units. All gameplay-affecting units and tiers are unlockable through match currency. Gacha is excluded to preserve Skill > Luck pillar.
- Rejoin/AFK policy: An AFK player's units are auto-managed by a simple AI for up to 2 turns; after 2 consecutive AFK turns the player is eliminated and their units are removed from the map.

---

## Glossary

- **Game**: The Project Go-Royale application.
- **Match**: A single game session involving exactly 4 Players on one Map, from Matchmaking to Win Condition.
- **Player**: A human participant in a Match.
- **Map**: The 9×9 grid battlefield on which a Match is played.
- **Cell**: A single square on the Map grid, identified by (row, column) coordinates.
- **Terrain**: A property of a Cell that affects movement cost and cover. Types: Plains, Forest, Mountain, River.
- **Safe Zone**: The currently active rectangular sub-grid of the Map within which units survive. Shrinks by one ring each turn.
- **Unit**: A single game piece belonging to a Player, placed on a Cell. Has a Unit Type, Tier, HP, and AP cost profile.
- **Unit Type**: One of the six base archetypes — Infantry, Archer, Cavalry, Mage, Scout, and Siege.
- **Tier**: The upgrade level of a Unit (Tier 1, Tier 2, Tier 3). Higher Tier improves stats.
- **Formation Zone**: The 4×4 corner region of the Map assigned to each Player during the Prepare Stage.
- **Turn**: One full cycle of the Turn Loop: Card Draw → Plan Submission → Simultaneous Resolution → Shrink Zone.
- **Action Points (AP)**: The per-turn budget each Player spends to move and act with their units.
- **Card**: A single-use item drawn at the start of each Turn. Types: Buff, Resource, Terrain.
- **Shop**: The unit purchase interface available during the Prepare Stage and between turns.
- **Gold**: The primary in-match currency used to buy and upgrade units.
- **XP**: Experience points earned during a Match, used for meta-progression between matches.
- **Match Currency**: The post-match reward currency used for meta-progression unlocks.
- **Roster**: The full set of Unit Types a Player has unlocked for use in matches.
- **Intransitive Mechanic**: A rock-paper-scissors-style counter relationship between Unit Types.
- **Input Randomness**: Randomness that is revealed to all players before decisions are made (map gen, card draw, shop roll).
- **Output Randomness**: Randomness that affects the outcome of a decision after it is made (damage rolls, miss chance). Explicitly prohibited by design pillar P2.
- **Simultaneous Turn**: A turn structure where all Players submit their plans within a time window; plans resolve at the same time.
- **AFK**: A Player who fails to submit a turn plan within the allotted time.
- **Battle Pass**: A seasonal cosmetic reward track unlocked by spending Match Currency or premium currency.
- **Rank**: A Player's matchmaking rating, updated after each Match.

---

## Requirements

### Requirement 1: Match Lifecycle

**User Story:** As a Player, I want a clearly structured match from start to finish, so that I always know what phase I am in and what actions are available to me.

#### Acceptance Criteria

1. THE Game SHALL support exactly 4 Players per Match.
2. WHEN a Match begins, THE Game SHALL execute phases in this order: Matchmaking → Map Generation → Prepare Stage → Turn Loop → Win Condition Resolution.
3. WHEN only one Player's army remains on the Map, THE Game SHALL declare that Player the winner and end the Match.
4. WHEN a Match ends, THE Game SHALL display a post-match summary showing final placement (1st–4th), Gold earned, XP earned, and Match Currency awarded.
5. THE Game SHALL complete a Match in 15 minutes or fewer under normal play conditions.

---

### Requirement 2: Matchmaking

**User Story:** As a Player, I want to be matched against opponents of similar skill, so that matches feel fair and competitive.

#### Acceptance Criteria

1. WHEN a Player requests a Match, THE Matchmaking System SHALL attempt to match 4 Players within the same Rank band.
2. WHEN no 4 Players of the same Rank band are available within 60 seconds, THE Matchmaking System SHALL expand the search to adjacent Rank bands.
3. WHEN 4 Players are matched, THE Matchmaking System SHALL notify all 4 Players and transition to Map Generation within 3 seconds.
4. IF a matched Player disconnects before Map Generation completes, THEN THE Matchmaking System SHALL replace that Player with another available Player or cancel the Match and return remaining Players to the queue.

---

### Requirement 3: Map Generation

**User Story:** As a Player, I want each match to take place on a unique procedurally generated map, so that no fixed optimal strategy exists and positional decisions remain meaningful.

#### Acceptance Criteria

1. WHEN a Match begins, THE Map Generator SHALL produce a unique 9×9 grid Map.
2. THE Map Generator SHALL assign each Cell one of four Terrain types: Plains, Forest, Mountain, or River.
3. THE Map Generator SHALL ensure that each Player's Formation Zone (4×4 corner) contains at least 8 Plains Cells to guarantee unit placement is always possible.
4. THE Map Generator SHALL ensure the Map is symmetric in Terrain distribution across all four quadrants so no Player starts with a structural advantage.
5. THE Map Generator SHALL ensure no River Terrain forms an impassable wall that completely separates any Formation Zone from the center of the Map.
6. WHEN the Map is generated, THE Game SHALL display the full Map layout to all Players before the Prepare Stage begins.

---

### Requirement 4: Terrain Effects

**User Story:** As a Player, I want terrain to meaningfully affect movement and combat, so that map positioning is a core strategic decision.

#### Acceptance Criteria

1. THE Game SHALL apply the following movement cost modifiers per Cell entered:
   - Plains: 1 AP
   - Forest: 2 AP
   - Mountain: 3 AP
   - River: 2 AP (Infantry, Mage, Siege); 4 AP (Cavalry); 1 AP (Scout)
2. THE Game SHALL apply the following cover bonuses to defending units:
   - Forest: +1 effective Defense
   - Mountain: +2 effective Defense
   - Plains: no bonus
   - River: no bonus
3. WHEN a unit attempts to move to a Cell, THE Game SHALL display the AP cost of that move before the Player confirms it.
4. THE Game SHALL apply terrain movement costs consistently regardless of which Player controls the moving unit.

---

### Requirement 5: Prepare Stage

**User Story:** As a Player, I want a dedicated preparation phase to buy units and set my formation before combat begins, so that I can plan my opening strategy.

#### Acceptance Criteria

1. WHEN the Prepare Stage begins, THE Game SHALL grant each Player exactly 1,000 Gold.
2. THE Game SHALL present each Player with a Shop containing a random selection of available Unit Types from the Player's unlocked Roster.
3. WHEN a Player purchases a unit from the Shop, THE Game SHALL deduct the unit's Gold cost from the Player's Gold balance and add the unit to the Player's available units.
4. IF a Player attempts to purchase a unit when their Gold balance is insufficient, THEN THE Game SHALL reject the purchase and display an insufficient funds message.
5. THE Game SHALL allow each Player to place purchased units only within their assigned Formation Zone (4×4 corner Cells).
6. THE Game SHALL allow each Player to reposition units freely within their Formation Zone until the Prepare Stage timer expires.
7. THE Prepare Stage SHALL last exactly 60 seconds; WHEN the timer expires, THE Game SHALL lock all formations and begin the Turn Loop.
8. IF a Player has not placed all purchased units before the timer expires, THEN THE Game SHALL automatically place unplaced units on available Plains Cells within that Player's Formation Zone.

---

### Requirement 6: Unit Types and Intransitive Counters

**User Story:** As a Player, I want units with distinct roles and counter relationships, so that army composition is a meaningful strategic choice with no single dominant strategy.

#### Acceptance Criteria

1. THE Game SHALL provide exactly 6 base Unit Types: Infantry, Archer, Cavalry, Mage, Scout, and Siege.
2. THE Game SHALL implement the following Intransitive counter relationships (attacker deals 150% damage to countered type):
   - Infantry counters Archer
   - Archer counters Cavalry
   - Cavalry counters Infantry
   - Mage counters any cluster of 3 or more enemy units within a 2-Cell radius (area damage)
   - Scout counters Siege (deals 200% damage to Siege)
   - Siege counters Infantry and Cavalry (area attack, 2-Cell splash)
3. THE Game SHALL display counter relationship indicators in the unit info panel so Players can identify counters at a glance.
4. THE Game SHALL apply counter damage multipliers deterministically with no random variance (Output Randomness is prohibited).
5. THE Game SHALL assign the following base Gold costs per Unit Type at Tier 1:
   - Scout: 100 Gold
   - Infantry: 150 Gold
   - Archer: 175 Gold
   - Cavalry: 200 Gold
   - Mage: 250 Gold
   - Siege: 300 Gold

---

### Requirement 7: Unit Tiers and Upgrades

**User Story:** As a Player, I want to upgrade my units to higher tiers during a match, so that investing Gold into fewer, stronger units is a viable strategy against fielding many weaker units.

#### Acceptance Criteria

1. THE Game SHALL support 3 Tiers per Unit Type (Tier 1, Tier 2, Tier 3).
2. WHEN a Player upgrades a unit from Tier N to Tier N+1, THE Game SHALL increase that unit's HP by 50% and its base attack damage by 30%.
3. THE Game SHALL set upgrade costs as follows:
   - Tier 1 → Tier 2: 200 Gold
   - Tier 2 → Tier 3: 400 Gold
4. THE Game SHALL allow unit upgrades to be purchased from the Shop during the Prepare Stage and at the start of each subsequent Turn before plan submission.
5. WHEN a unit is upgraded, THE Game SHALL visually distinguish the upgraded unit on the Map (e.g., tier badge or model change).
6. IF a unit is eliminated from the Map, THEN THE Game SHALL not refund the Gold spent on that unit or its upgrades.

---

### Requirement 8: Action Points System

**User Story:** As a Player, I want a fixed Action Point budget per turn, so that I must make meaningful tradeoffs between moving, attacking, and using special skills.

#### Acceptance Criteria

1. THE Game SHALL grant each Player exactly 12 AP per Turn, regardless of how many units that Player has surviving.
2. THE Game SHALL apply the following AP costs for actions:
   - Move 1 Cell (Plains): 1 AP
   - Move 1 Cell (Forest or River): 2 AP (or 4 AP for Cavalry on River)
   - Move 1 Cell (Mountain): 3 AP
   - Basic Attack: 2 AP
   - Special Skill: 4 AP
3. THE Game SHALL allow a Player to distribute their 12 AP freely across any of their surviving units in any order during plan submission.
4. THE Game SHALL prevent a Player from assigning more AP to a single unit than that unit's per-turn AP cap (6 AP per unit).
5. WHEN a Player's AP budget reaches 0, THE Game SHALL prevent further actions from being added to the plan.
6. THE Game SHALL display the remaining AP budget prominently during plan submission.
7. THE Game SHALL not carry over unused AP to the next Turn.

---

### Requirement 9: Simultaneous Turn Structure

**User Story:** As a Player, I want all players to submit their turn plans simultaneously, so that matches feel dynamic and require me to predict opponent moves rather than react to them.

#### Acceptance Criteria

1. THE Game SHALL use a Simultaneous Turn structure: all 4 Players submit their full turn plan within a shared time window before any plan is executed.
2. THE Game SHALL allow each Player exactly 45 seconds to submit their turn plan.
3. WHEN all 4 Players have submitted their plans, THE Game SHALL resolve all plans simultaneously in a single animation sequence.
4. IF a Player does not submit a plan within 45 seconds, THEN THE Game SHALL treat that Player as AFK for that Turn and submit an empty plan (no actions) on their behalf.
5. THE Game SHALL resolve movement conflicts (two units attempting to occupy the same Cell) by canceling both moves and leaving both units in their original Cells.
6. THE Game SHALL resolve attack actions after all movement is resolved.
7. WHEN simultaneous attacks result in both units being eliminated, THE Game SHALL remove both units from the Map.
8. THE Game SHALL display a replay of the full turn resolution to all Players after each Turn, lasting no more than 10 seconds.

---

### Requirement 10: Shrink Zone

**User Story:** As a Player, I want the safe zone to shrink each turn, so that matches are forced to a conclusion within the session time limit and passive turtling is punished.

#### Acceptance Criteria

1. THE Game SHALL shrink the Safe Zone by removing the outermost ring of Cells at the end of each Turn, following this sequence: 9×9 → 7×7 → 5×5 → 3×3.
2. WHEN the Safe Zone shrinks, THE Game SHALL visually indicate the new boundary to all Players before the next Turn's plan submission phase begins.
3. WHEN a unit is located outside the Safe Zone boundary after shrink resolution, THE Game SHALL eliminate that unit from the Map.
4. THE Game SHALL warn Players during plan submission which Cells will be outside the Safe Zone at the end of the current Turn.
5. THE Game SHALL apply Shrink Zone elimination after all movement and attack resolution for that Turn.
6. IF all remaining Players' units are eliminated simultaneously by the Shrink Zone, THEN THE Game SHALL rank surviving Players by the number of units they had at the start of that Turn.

---

### Requirement 11: Card Draw System

**User Story:** As a Player, I want to draw a fate card at the start of each turn, so that each turn has a dynamic element that I can factor into my plan before committing to actions.

#### Acceptance Criteria

1. THE Game SHALL draw exactly 1 Card for each Player at the start of each Turn, before the plan submission phase.
2. THE Game SHALL reveal each Player's drawn Card publicly to all Players before plan submission begins.
3. THE Game SHALL implement 3 Card types: Buff, Resource, and Terrain.
4. THE Game SHALL implement the following Buff Card effects (applied to one unit of the Player's choice, lasting 1–2 Turns as specified on the card):
   - Attack Boost: +50% attack damage for 1 Turn
   - Defense Boost: +2 effective Defense for 2 Turns
   - Speed Boost: +2 AP movement allowance for 1 Turn
5. THE Game SHALL implement the following Resource Card effects (applied immediately upon play):
   - Gold Bonus: +150 Gold added to the Player's balance
   - AP Refund: +3 AP added to the Player's current Turn budget
6. THE Game SHALL implement the following Terrain Card effects (applied to one Cell of the Player's choice):
   - Place Terrain: Convert a Plains Cell to Forest or Mountain (Player's choice)
   - Remove Terrain: Convert a Forest, Mountain, or River Cell to Plains
7. THE Game SHALL require each Player to play or discard their drawn Card before their turn plan is submitted (use-or-lose).
8. IF a Player does not play or discard their Card before the plan submission timer expires, THEN THE Game SHALL automatically discard the Card.
9. THE Game SHALL prevent a Player from playing a Terrain Card on a Cell occupied by any unit.

---

### Requirement 12: Combat Resolution

**User Story:** As a Player, I want combat outcomes to be fully deterministic based on unit stats and positioning, so that I can always predict the result of an attack before committing to it.

#### Acceptance Criteria

1. THE Game SHALL calculate damage using the formula: `Damage = Attacker_Attack × Counter_Multiplier − Defender_Defense − Terrain_Cover_Bonus`.
2. THE Game SHALL apply no random variance to damage calculations (Output Randomness is prohibited).
3. THE Game SHALL display the exact damage that will be dealt when a Player hovers over an attack action during plan submission.
4. WHEN a unit's HP reaches 0 or below, THE Game SHALL eliminate that unit from the Map.
5. THE Game SHALL apply Mage area damage to all enemy units within a 2-Cell radius of the target Cell simultaneously.
6. THE Game SHALL apply Siege splash damage to all units (enemy and friendly) within a 2-Cell radius of the target Cell.
7. THE Game SHALL not allow a unit to attack a Cell that is outside its attack range (defined per Unit Type).
8. THE Game SHALL define attack ranges as follows:
   - Infantry: 1 Cell (melee)
   - Archer: 2–4 Cells (ranged, cannot attack adjacent Cell)
   - Cavalry: 1 Cell (melee)
   - Mage: 1–3 Cells
   - Scout: 1 Cell (melee)
   - Siege: 2–5 Cells (cannot attack adjacent 2 Cells)

---

### Requirement 13: Win Condition and Elimination

**User Story:** As a Player, I want clear elimination and win conditions, so that I always know my standing in the match.

#### Acceptance Criteria

1. WHEN a Player has no units remaining on the Map, THE Game SHALL eliminate that Player from the Match.
2. WHEN a Player is eliminated, THE Game SHALL display their final placement rank and post-match rewards immediately.
3. WHEN exactly 1 Player remains with units on the Map, THE Game SHALL declare that Player the winner.
4. THE Game SHALL award placements as follows: 1st (winner), 2nd (last eliminated), 3rd, 4th (first eliminated).
5. THE Game SHALL award Match Currency and XP scaled by placement: 1st receives 4× the base reward, 2nd receives 2×, 3rd receives 1×, 4th receives 0.5×.

---

### Requirement 14: AFK and Disconnect Handling

**User Story:** As a Player, I want the game to handle disconnected or AFK opponents gracefully, so that a single player's absence does not ruin the match for the remaining three.

#### Acceptance Criteria

1. WHEN a Player fails to submit a turn plan within the 45-second window, THE Game SHALL mark that Player as AFK for that Turn.
2. WHEN a Player is AFK for 1 consecutive Turn, THE AFK Manager SHALL submit a minimal defensive plan (no movement, no attacks) on that Player's behalf.
3. WHEN a Player is AFK for 2 consecutive Turns, THE AFK Manager SHALL eliminate that Player from the Match and remove all their units from the Map.
4. IF an AFK Player reconnects before their 2nd consecutive AFK Turn resolves, THEN THE Game SHALL restore full control to that Player on the next Turn.
5. THE Game SHALL display a visible AFK indicator on the map for any Player currently marked as AFK.
6. THE Game SHALL not award Match Currency or XP to a Player who was eliminated due to 2 consecutive AFK Turns.

---

### Requirement 15: Meta-Progression System

**User Story:** As a Player, I want to earn persistent rewards between matches, so that I have long-term goals and a sense of progression beyond individual match outcomes.

#### Acceptance Criteria

1. THE Game SHALL award Match Currency and XP to all Players at the end of each Match, scaled by placement per Requirement 13.
2. THE Game SHALL allow Players to spend Match Currency to unlock new Unit Types for their Roster.
3. THE Game SHALL allow Players to spend Match Currency to permanently unlock Tier 2 and Tier 3 upgrade availability for specific Unit Types (reducing in-match upgrade cost by 20% for unlocked tiers).
4. THE Game SHALL track a Player's Rank and update it after each Match using an Elo-based rating system.
5. WHEN a Player's Rank changes, THE Game SHALL display the rank change and new rating on the post-match summary screen.
6. THE Game SHALL not gate any gameplay-affecting unit or ability behind premium currency or gacha mechanics.

---

### Requirement 16: Monetization (Cosmetic-Only)

**User Story:** As a Player, I want to be able to support the game financially without being forced to pay for gameplay advantages, so that the game remains fair and skill-based.

#### Acceptance Criteria

1. THE Game SHALL offer a seasonal Battle Pass purchasable with premium currency, granting only cosmetic rewards (unit skins, board themes, card back designs, emotes).
2. THE Game SHALL offer individual cosmetic unit skins purchasable with premium currency.
3. THE Game SHALL not sell any item that affects unit stats, AP, Gold income, card draw probability, or any other gameplay variable.
4. THE Game SHALL make all 6 base Unit Types available to all Players without any purchase.
5. THE Game SHALL allow all gameplay-affecting unlocks (additional Roster units, tier discounts) to be earned exclusively through Match Currency obtained by playing matches.

---

### Requirement 17: Shop and Economy

**User Story:** As a Player, I want a transparent in-match economy, so that I can plan my spending and make informed build decisions.

#### Acceptance Criteria

1. THE Game SHALL display each Player's current Gold balance at all times during a Match.
2. THE Game SHALL allow Players to spend Gold during the Prepare Stage and at the start of each Turn (before plan submission).
3. THE Game SHALL refresh the Shop with a new random selection of units at the start of each Turn for a cost of 50 Gold.
4. IF a Player does not pay to refresh, THEN THE Game SHALL retain the same Shop selection from the previous Turn.
5. THE Game SHALL display the Gold cost and stats of each unit in the Shop before purchase.
6. THE Game SHALL award Gold income at the start of each Turn: base income of 50 Gold + 10 Gold per surviving unit the Player controls (maximum 150 Gold per Turn).

---

### Requirement 18: User Interface and Information Transparency

**User Story:** As a Player, I want all game state information to be clearly visible, so that I can make fully informed decisions without hidden variables.

#### Acceptance Criteria

1. THE Game SHALL display the full Map, all unit positions, all unit HP values, and the current Safe Zone boundary at all times during a Match.
2. THE Game SHALL display each Player's Gold balance, AP remaining, and drawn Card publicly during the plan submission phase.
3. THE Game SHALL display the Shrink Zone schedule (which ring shrinks on which Turn) at all times.
4. THE Game SHALL display unit stat panels (HP, Attack, Defense, AP costs, attack range, counter relationships) on tap/click for any unit on the Map.
5. THE Game SHALL display a turn timer countdown visible to all Players during the plan submission phase.
6. THE Game SHALL display a preview of planned moves and attacks on the Map before a Player confirms their plan submission.
7. THE Game SHALL not hide any game state information from any Player (all information is public, consistent with Input Randomness design pillar P2).

---

### Requirement 19: Parser and Serialization (Game State)

**User Story:** As a developer, I want the game state to be serializable and deserializable, so that matches can be saved, replayed, and reconnected without data loss.

#### Acceptance Criteria

1. THE Serializer SHALL serialize the complete game state (Map, all unit positions, HP, AP budgets, Gold balances, Safe Zone boundary, Turn number, Card draw history) into a JSON document.
2. WHEN a valid JSON game state document is provided, THE Deserializer SHALL reconstruct an identical game state object.
3. THE Pretty_Printer SHALL format serialized game state JSON documents with consistent indentation and field ordering.
4. FOR ALL valid game state objects, serializing then deserializing SHALL produce a game state object equivalent to the original (round-trip property).
5. IF a malformed or incomplete JSON game state document is provided, THEN THE Deserializer SHALL return a descriptive error identifying the missing or invalid fields.

---

### Requirement 20: Performance and Session Bounds

**User Story:** As a Player on a mobile device, I want the game to run smoothly and respect the 15-minute session promise, so that I can play during short breaks without the match running over.

#### Acceptance Criteria

1. THE Game SHALL render at a minimum of 30 frames per second on target mobile hardware (mid-range devices from 2022 or later).
2. THE Game SHALL complete turn resolution animation sequences within 10 seconds.
3. THE Game SHALL complete Map Generation within 2 seconds of Match start.
4. WHILE a Match is in progress, THE Game SHALL enforce the 45-second plan submission timer strictly, with no extensions.
5. THE Game SHALL guarantee that a Match ends within 15 minutes by design: with a 9×9 → 7×7 → 5×5 → 3×3 shrink sequence, the maximum number of Turns before the Safe Zone reaches 3×3 is 3 shrink steps; combined with the 45-second turn timer and 10-second resolution, the total match time is bounded.
