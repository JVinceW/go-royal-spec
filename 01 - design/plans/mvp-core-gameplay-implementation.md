# MVP Core Gameplay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the local deterministic MVP gameplay rules engine for Project Go-Royale before Unity rendering or networking.

**Architecture:** Implement pure C# gameplay rules in the Unity client's `Game.Common` assembly so the core can be tested without scenes, prefabs, or networking. Keep balance values in one shared config object for MVP, with a later production path toward split assets/configs. Add Edit Mode tests that prove map, units, turn validation, movement, combat, shrink, elimination, and winner logic.

**Tech Stack:** Unity `6000.3.8f1`, C#, Unity Test Framework, `Game.Common` assembly, Edit Mode tests.

---

## Source Docs

- [requirements-mvp.md](</E:/go-royal/01 - design/requirements-mvp.md>)
- [mvp-system-overview.md](</E:/go-royal/01 - design/systems/mvp-system-overview.md>)
- [feature-default-map.md](</E:/go-royal/01 - design/systems/feature-default-map.md>)
- [feature-units-combat.md](</E:/go-royal/01 - design/systems/feature-units-combat.md>)
- [feature-turn-resolution.md](</E:/go-royal/01 - design/systems/feature-turn-resolution.md>)

## File Structure

Create gameplay runtime code under:

- `E:/Unity/go-royal-client/go-royal-unity/Assets/Game.Common/Runtime/Mvp/`

Create Edit Mode tests under:

- `E:/Unity/go-royal-client/go-royal-unity/Assets/Tests/EditMode/Mvp/`

Primary runtime files:

- `GridPosition.cs` - immutable row/column coordinate value.
- `SafeZone.cs` - rectangular safe-zone bounds.
- `MvpBalanceConfig.cs` - configurable MVP tuning values.
- `UnitTypeId.cs` - Infantry, Archer, Cavalry enum.
- `PlayerSlot.cs` - four player slots.
- `PlayerState.cs` - active/eliminated state.
- `UnitState.cs` - unit identity, owner, type, HP, position, alive flag.
- `MvpMapDefinition.cs` - fixed 9x9 map, formation zones, shrink sequence.
- `TurnAction.cs` - move/attack action types.
- `TurnPlan.cs` - submitted player plan.
- `MatchState.cs` - canonical local match state.
- `MvpRules.cs` - pure rules for setup, validation, movement, combat, shrink, win checks.
- `ResolutionResult.cs` - events and final state from turn resolution.

Primary test files:

- `MvpMapDefinitionTests.cs`
- `MvpBalanceConfigTests.cs`
- `MvpCombatTests.cs`
- `MvpTurnResolutionTests.cs`
- `MvpWinConditionTests.cs`

---

### Task 1: Create Core Value Types

**Files:**
- Create: `E:/Unity/go-royal-client/go-royal-unity/Assets/Game.Common/Runtime/Mvp/GridPosition.cs`
- Create: `E:/Unity/go-royal-client/go-royal-unity/Assets/Game.Common/Runtime/Mvp/SafeZone.cs`
- Create: `E:/Unity/go-royal-client/go-royal-unity/Assets/Tests/EditMode/Mvp/MvpMapDefinitionTests.cs`

- [ ] **Step 1: Write failing tests for coordinate and safe-zone behavior**

```csharp
using Game.Common.Mvp;
using NUnit.Framework;

namespace Game.Common.Tests.Mvp
{
    public sealed class MvpMapDefinitionTests
    {
        [Test]
        public void GridPosition_ManhattanDistance_ReturnsExpectedDistance()
        {
            var a = new GridPosition(0, 0);
            var b = new GridPosition(3, 4);

            Assert.AreEqual(7, a.ManhattanDistanceTo(b));
        }

        [Test]
        public void SafeZone_Contains_ReturnsTrueForInsideCell()
        {
            var zone = new SafeZone(new GridPosition(1, 1), new GridPosition(7, 7));

            Assert.IsTrue(zone.Contains(new GridPosition(4, 4)));
        }

        [Test]
        public void SafeZone_Contains_ReturnsFalseForOutsideCell()
        {
            var zone = new SafeZone(new GridPosition(1, 1), new GridPosition(7, 7));

            Assert.IsFalse(zone.Contains(new GridPosition(0, 4)));
        }
    }
}
```

- [ ] **Step 2: Run the tests and verify they fail**

Run from Unity Test Runner or batch mode:

```sh
Unity -batchmode -projectPath E:/Unity/go-royal-client/go-royal-unity -runTests -testPlatform EditMode -testResults test-results.xml -quit
```

Expected: compile failure because `GridPosition` and `SafeZone` do not exist.

- [ ] **Step 3: Implement `GridPosition`**

```csharp
namespace Game.Common.Mvp
{
    public readonly struct GridPosition
    {
        public GridPosition(int row, int col)
        {
            Row = row;
            Col = col;
        }

        public int Row { get; }
        public int Col { get; }

        public int ManhattanDistanceTo(GridPosition other)
        {
            return System.Math.Abs(Row - other.Row) + System.Math.Abs(Col - other.Col);
        }
    }
}
```

- [ ] **Step 4: Implement `SafeZone`**

```csharp
namespace Game.Common.Mvp
{
    public readonly struct SafeZone
    {
        public SafeZone(GridPosition topLeft, GridPosition bottomRight)
        {
            TopLeft = topLeft;
            BottomRight = bottomRight;
        }

        public GridPosition TopLeft { get; }
        public GridPosition BottomRight { get; }

        public bool Contains(GridPosition position)
        {
            return position.Row >= TopLeft.Row
                && position.Row <= BottomRight.Row
                && position.Col >= TopLeft.Col
                && position.Col <= BottomRight.Col;
        }
    }
}
```

- [ ] **Step 5: Run tests and verify they pass**

Expected: `MvpMapDefinitionTests` pass.

---

### Task 2: Add Balance Config And Default Map

**Files:**
- Create: `E:/Unity/go-royal-client/go-royal-unity/Assets/Game.Common/Runtime/Mvp/MvpBalanceConfig.cs`
- Create: `E:/Unity/go-royal-client/go-royal-unity/Assets/Game.Common/Runtime/Mvp/UnitTypeId.cs`
- Create: `E:/Unity/go-royal-client/go-royal-unity/Assets/Game.Common/Runtime/Mvp/PlayerSlot.cs`
- Create: `E:/Unity/go-royal-client/go-royal-unity/Assets/Game.Common/Runtime/Mvp/MvpMapDefinition.cs`
- Modify: `E:/Unity/go-royal-client/go-royal-unity/Assets/Tests/EditMode/Mvp/MvpMapDefinitionTests.cs`
- Create: `E:/Unity/go-royal-client/go-royal-unity/Assets/Tests/EditMode/Mvp/MvpBalanceConfigTests.cs`

- [ ] **Step 1: Add tests for default balance and map**

```csharp
using Game.Common.Mvp;
using NUnit.Framework;

namespace Game.Common.Tests.Mvp
{
    public sealed class MvpBalanceConfigTests
    {
        [Test]
        public void CreateDefault_HasExpectedActionValues()
        {
            var config = MvpBalanceConfig.CreateDefault();

            Assert.AreEqual(6, config.ActionPointsPerTurn);
            Assert.AreEqual(1, config.MoveActionApCost);
            Assert.AreEqual(2, config.AttackActionApCost);
            Assert.AreEqual(2f, config.CounterMultiplier);
        }

        [Test]
        public void CreateDefault_GivesOneOfEachStartingUnit()
        {
            var config = MvpBalanceConfig.CreateDefault();

            Assert.AreEqual(1, config.GetStartingCount(UnitTypeId.Infantry));
            Assert.AreEqual(1, config.GetStartingCount(UnitTypeId.Archer));
            Assert.AreEqual(1, config.GetStartingCount(UnitTypeId.Cavalry));
        }
    }
}
```

Append to `MvpMapDefinitionTests.cs`:

```csharp
[Test]
public void CreateDefault_HasNineByNineGrid()
{
    var map = MvpMapDefinition.CreateDefault();

    Assert.AreEqual(9, map.Width);
    Assert.AreEqual(9, map.Height);
}

[Test]
public void CreateDefault_FormationZonesDoNotOverlap()
{
    var map = MvpMapDefinition.CreateDefault();

    Assert.IsFalse(map.GetFormationZone(PlayerSlot.Player1).Overlaps(map.GetFormationZone(PlayerSlot.Player2)));
    Assert.IsFalse(map.GetFormationZone(PlayerSlot.Player1).Overlaps(map.GetFormationZone(PlayerSlot.Player3)));
    Assert.IsFalse(map.GetFormationZone(PlayerSlot.Player1).Overlaps(map.GetFormationZone(PlayerSlot.Player4)));
}

[Test]
public void GetSafeZone_ClampsAfterFinalShrink()
{
    var map = MvpMapDefinition.CreateDefault();

    Assert.AreEqual(new GridPosition(3, 3), map.GetSafeZone(4).TopLeft);
    Assert.AreEqual(new GridPosition(5, 5), map.GetSafeZone(4).BottomRight);
}
```

- [ ] **Step 2: Run tests and verify they fail**

Expected: compile failure because config/map types do not exist.

- [ ] **Step 3: Implement enums and config**

```csharp
namespace Game.Common.Mvp
{
    public enum UnitTypeId
    {
        Infantry,
        Archer,
        Cavalry
    }

    public enum PlayerSlot
    {
        Player1,
        Player2,
        Player3,
        Player4
    }
}
```

```csharp
using System.Collections.Generic;

namespace Game.Common.Mvp
{
    public sealed class MvpBalanceConfig
    {
        private readonly Dictionary<UnitTypeId, int> startingCounts;
        private readonly Dictionary<UnitTypeId, UnitStats> unitStats;

        private MvpBalanceConfig()
        {
            ActionPointsPerTurn = 6;
            MoveActionApCost = 1;
            AttackActionApCost = 2;
            CounterMultiplier = 2f;
            NormalMultiplier = 1f;

            startingCounts = new Dictionary<UnitTypeId, int>
            {
                { UnitTypeId.Infantry, 1 },
                { UnitTypeId.Archer, 1 },
                { UnitTypeId.Cavalry, 1 }
            };

            unitStats = new Dictionary<UnitTypeId, UnitStats>
            {
                { UnitTypeId.Infantry, new UnitStats(10, 3, 2, 1, 1) },
                { UnitTypeId.Archer, new UnitStats(7, 3, 2, 2, 3) },
                { UnitTypeId.Cavalry, new UnitStats(8, 3, 3, 1, 1) }
            };
        }

        public int ActionPointsPerTurn { get; }
        public int MoveActionApCost { get; }
        public int AttackActionApCost { get; }
        public float CounterMultiplier { get; }
        public float NormalMultiplier { get; }

        public static MvpBalanceConfig CreateDefault()
        {
            return new MvpBalanceConfig();
        }

        public int GetStartingCount(UnitTypeId unitType)
        {
            return startingCounts[unitType];
        }

        public UnitStats GetUnitStats(UnitTypeId unitType)
        {
            return unitStats[unitType];
        }
    }

    public readonly struct UnitStats
    {
        public UnitStats(int hp, int attack, int moveRange, int attackRangeMin, int attackRangeMax)
        {
            Hp = hp;
            Attack = attack;
            MoveRange = moveRange;
            AttackRangeMin = attackRangeMin;
            AttackRangeMax = attackRangeMax;
        }

        public int Hp { get; }
        public int Attack { get; }
        public int MoveRange { get; }
        public int AttackRangeMin { get; }
        public int AttackRangeMax { get; }
    }
}
```

- [ ] **Step 4: Implement default map**

```csharp
using System.Collections.Generic;

namespace Game.Common.Mvp
{
    public sealed class MvpMapDefinition
    {
        private readonly Dictionary<PlayerSlot, SafeZone> formationZones;
        private readonly SafeZone[] safeZones;

        private MvpMapDefinition()
        {
            Width = 9;
            Height = 9;

            formationZones = new Dictionary<PlayerSlot, SafeZone>
            {
                { PlayerSlot.Player1, new SafeZone(new GridPosition(0, 0), new GridPosition(2, 2)) },
                { PlayerSlot.Player2, new SafeZone(new GridPosition(0, 6), new GridPosition(2, 8)) },
                { PlayerSlot.Player3, new SafeZone(new GridPosition(6, 0), new GridPosition(8, 2)) },
                { PlayerSlot.Player4, new SafeZone(new GridPosition(6, 6), new GridPosition(8, 8)) }
            };

            safeZones = new[]
            {
                new SafeZone(new GridPosition(0, 0), new GridPosition(8, 8)),
                new SafeZone(new GridPosition(1, 1), new GridPosition(7, 7)),
                new SafeZone(new GridPosition(2, 2), new GridPosition(6, 6)),
                new SafeZone(new GridPosition(3, 3), new GridPosition(5, 5))
            };
        }

        public int Width { get; }
        public int Height { get; }

        public static MvpMapDefinition CreateDefault()
        {
            return new MvpMapDefinition();
        }

        public bool IsInsideBounds(GridPosition position)
        {
            return position.Row >= 0 && position.Row < Height && position.Col >= 0 && position.Col < Width;
        }

        public SafeZone GetFormationZone(PlayerSlot slot)
        {
            return formationZones[slot];
        }

        public SafeZone GetSafeZone(int shrinkStep)
        {
            var index = System.Math.Min(shrinkStep, safeZones.Length - 1);
            return safeZones[index];
        }
    }
}
```

Add to `SafeZone.cs`:

```csharp
public bool Overlaps(SafeZone other)
{
    var rowsOverlap = TopLeft.Row <= other.BottomRight.Row && BottomRight.Row >= other.TopLeft.Row;
    var colsOverlap = TopLeft.Col <= other.BottomRight.Col && BottomRight.Col >= other.TopLeft.Col;
    return rowsOverlap && colsOverlap;
}
```

- [ ] **Step 5: Run tests and verify they pass**

Expected: map and balance tests pass.

---

### Task 3: Add Match State And Unit Setup

**Files:**
- Create: `E:/Unity/go-royal-client/go-royal-unity/Assets/Game.Common/Runtime/Mvp/PlayerState.cs`
- Create: `E:/Unity/go-royal-client/go-royal-unity/Assets/Game.Common/Runtime/Mvp/UnitState.cs`
- Create: `E:/Unity/go-royal-client/go-royal-unity/Assets/Game.Common/Runtime/Mvp/MatchState.cs`
- Create: `E:/Unity/go-royal-client/go-royal-unity/Assets/Game.Common/Runtime/Mvp/MvpRules.cs`
- Create: `E:/Unity/go-royal-client/go-royal-unity/Assets/Tests/EditMode/Mvp/MvpMatchSetupTests.cs`

- [ ] **Step 1: Write failing setup tests**

```csharp
using System.Linq;
using Game.Common.Mvp;
using NUnit.Framework;

namespace Game.Common.Tests.Mvp
{
    public sealed class MvpMatchSetupTests
    {
        [Test]
        public void CreateInitialMatch_CreatesFourPlayers()
        {
            var state = MvpRules.CreateInitialMatch(MvpMapDefinition.CreateDefault(), MvpBalanceConfig.CreateDefault());

            Assert.AreEqual(4, state.Players.Count);
        }

        [Test]
        public void CreateInitialMatch_GivesEachPlayerOneOfEachUnit()
        {
            var state = MvpRules.CreateInitialMatch(MvpMapDefinition.CreateDefault(), MvpBalanceConfig.CreateDefault());

            foreach (var player in state.Players)
            {
                var units = state.Units.Where(unit => unit.Owner == player.Slot).ToArray();
                Assert.AreEqual(3, units.Length);
                Assert.IsTrue(units.Any(unit => unit.Type == UnitTypeId.Infantry));
                Assert.IsTrue(units.Any(unit => unit.Type == UnitTypeId.Archer));
                Assert.IsTrue(units.Any(unit => unit.Type == UnitTypeId.Cavalry));
            }
        }
    }
}
```

- [ ] **Step 2: Run tests and verify they fail**

Expected: compile failure because match state does not exist.

- [ ] **Step 3: Implement player, unit, and match state**

```csharp
namespace Game.Common.Mvp
{
    public sealed class PlayerState
    {
        public PlayerState(PlayerSlot slot)
        {
            Slot = slot;
            IsEliminated = false;
        }

        public PlayerSlot Slot { get; }
        public bool IsEliminated { get; private set; }

        public void Eliminate()
        {
            IsEliminated = true;
        }
    }
}
```

```csharp
namespace Game.Common.Mvp
{
    public sealed class UnitState
    {
        public UnitState(int id, PlayerSlot owner, UnitTypeId type, int hp, GridPosition position)
        {
            Id = id;
            Owner = owner;
            Type = type;
            Hp = hp;
            Position = position;
        }

        public int Id { get; }
        public PlayerSlot Owner { get; }
        public UnitTypeId Type { get; }
        public int Hp { get; private set; }
        public GridPosition Position { get; private set; }
        public bool IsAlive => Hp > 0;

        public void MoveTo(GridPosition position)
        {
            Position = position;
        }

        public void ApplyDamage(int damage)
        {
            Hp -= damage;
        }
    }
}
```

```csharp
using System.Collections.Generic;

namespace Game.Common.Mvp
{
    public sealed class MatchState
    {
        public MatchState(MvpMapDefinition map, MvpBalanceConfig balance, List<PlayerState> players, List<UnitState> units)
        {
            Map = map;
            Balance = balance;
            Players = players;
            Units = units;
            TurnNumber = 1;
            ShrinkStep = 0;
        }

        public MvpMapDefinition Map { get; }
        public MvpBalanceConfig Balance { get; }
        public List<PlayerState> Players { get; }
        public List<UnitState> Units { get; }
        public int TurnNumber { get; private set; }
        public int ShrinkStep { get; private set; }

        public SafeZone CurrentSafeZone => Map.GetSafeZone(ShrinkStep);

        public void AdvanceTurn()
        {
            TurnNumber += 1;
            ShrinkStep += 1;
        }
    }
}
```

- [ ] **Step 4: Implement initial match creation**

```csharp
using System.Collections.Generic;

namespace Game.Common.Mvp
{
    public static class MvpRules
    {
        public static MatchState CreateInitialMatch(MvpMapDefinition map, MvpBalanceConfig balance)
        {
            var players = new List<PlayerState>
            {
                new PlayerState(PlayerSlot.Player1),
                new PlayerState(PlayerSlot.Player2),
                new PlayerState(PlayerSlot.Player3),
                new PlayerState(PlayerSlot.Player4)
            };

            var units = new List<UnitState>();
            var nextUnitId = 1;

            foreach (var player in players)
            {
                var zone = map.GetFormationZone(player.Slot);
                var placements = new[]
                {
                    zone.TopLeft,
                    new GridPosition(zone.TopLeft.Row, zone.TopLeft.Col + 1),
                    new GridPosition(zone.TopLeft.Row + 1, zone.TopLeft.Col)
                };

                var unitTypes = new[] { UnitTypeId.Infantry, UnitTypeId.Archer, UnitTypeId.Cavalry };
                for (var i = 0; i < unitTypes.Length; i++)
                {
                    var type = unitTypes[i];
                    var stats = balance.GetUnitStats(type);
                    units.Add(new UnitState(nextUnitId, player.Slot, type, stats.Hp, placements[i]));
                    nextUnitId++;
                }
            }

            return new MatchState(map, balance, players, units);
        }
    }
}
```

- [ ] **Step 5: Run tests and verify they pass**

Expected: match setup tests pass.

---

### Task 4: Add Combat Rules

**Files:**
- Modify: `E:/Unity/go-royal-client/go-royal-unity/Assets/Game.Common/Runtime/Mvp/MvpRules.cs`
- Create: `E:/Unity/go-royal-client/go-royal-unity/Assets/Tests/EditMode/Mvp/MvpCombatTests.cs`

- [ ] **Step 1: Write failing combat tests**

```csharp
using Game.Common.Mvp;
using NUnit.Framework;

namespace Game.Common.Tests.Mvp
{
    public sealed class MvpCombatTests
    {
        [Test]
        public void CalculateDamage_UsesCounterMultiplier()
        {
            var balance = MvpBalanceConfig.CreateDefault();

            var damage = MvpRules.CalculateDamage(UnitTypeId.Infantry, UnitTypeId.Archer, balance);

            Assert.AreEqual(6, damage);
        }

        [Test]
        public void CalculateDamage_UsesNormalMultiplierWhenNotCountering()
        {
            var balance = MvpBalanceConfig.CreateDefault();

            var damage = MvpRules.CalculateDamage(UnitTypeId.Infantry, UnitTypeId.Cavalry, balance);

            Assert.AreEqual(3, damage);
        }

        [Test]
        public void IsInAttackRange_ArcherCannotAttackAdjacentTarget()
        {
            var balance = MvpBalanceConfig.CreateDefault();

            Assert.IsFalse(MvpRules.IsInAttackRange(UnitTypeId.Archer, new GridPosition(0, 0), new GridPosition(0, 1), balance));
        }

        [Test]
        public void IsInAttackRange_ArcherCanAttackAtRangeThree()
        {
            var balance = MvpBalanceConfig.CreateDefault();

            Assert.IsTrue(MvpRules.IsInAttackRange(UnitTypeId.Archer, new GridPosition(0, 0), new GridPosition(0, 3), balance));
        }
    }
}
```

- [ ] **Step 2: Run tests and verify they fail**

Expected: compile failure because combat methods do not exist.

- [ ] **Step 3: Add combat methods to `MvpRules`**

```csharp
public static bool Counters(UnitTypeId attacker, UnitTypeId defender)
{
    return (attacker == UnitTypeId.Infantry && defender == UnitTypeId.Archer)
        || (attacker == UnitTypeId.Archer && defender == UnitTypeId.Cavalry)
        || (attacker == UnitTypeId.Cavalry && defender == UnitTypeId.Infantry);
}

public static int CalculateDamage(UnitTypeId attacker, UnitTypeId defender, MvpBalanceConfig balance)
{
    var attackerStats = balance.GetUnitStats(attacker);
    var multiplier = Counters(attacker, defender) ? balance.CounterMultiplier : balance.NormalMultiplier;
    return (int)(attackerStats.Attack * multiplier);
}

public static bool IsInAttackRange(UnitTypeId attackerType, GridPosition attackerPosition, GridPosition targetPosition, MvpBalanceConfig balance)
{
    var stats = balance.GetUnitStats(attackerType);
    var distance = attackerPosition.ManhattanDistanceTo(targetPosition);
    return distance >= stats.AttackRangeMin && distance <= stats.AttackRangeMax;
}
```

- [ ] **Step 4: Run tests and verify they pass**

Expected: combat tests pass.

---

### Task 5: Add Turn Plans And Resolution

**Files:**
- Create: `E:/Unity/go-royal-client/go-royal-unity/Assets/Game.Common/Runtime/Mvp/TurnAction.cs`
- Create: `E:/Unity/go-royal-client/go-royal-unity/Assets/Game.Common/Runtime/Mvp/TurnPlan.cs`
- Create: `E:/Unity/go-royal-client/go-royal-unity/Assets/Game.Common/Runtime/Mvp/ResolutionResult.cs`
- Modify: `E:/Unity/go-royal-client/go-royal-unity/Assets/Game.Common/Runtime/Mvp/MvpRules.cs`
- Create: `E:/Unity/go-royal-client/go-royal-unity/Assets/Tests/EditMode/Mvp/MvpTurnResolutionTests.cs`

- [ ] **Step 1: Write failing turn resolution tests**

```csharp
using Game.Common.Mvp;
using NUnit.Framework;

namespace Game.Common.Tests.Mvp
{
    public sealed class MvpTurnResolutionTests
    {
        [Test]
        public void ResolveTurn_AppliesNonConflictingMove()
        {
            var state = MvpRules.CreateInitialMatch(MvpMapDefinition.CreateDefault(), MvpBalanceConfig.CreateDefault());
            var unit = state.Units[0];
            var plan = new TurnPlan(PlayerSlot.Player1).AddMove(unit.Id, new GridPosition(3, 3));

            var result = MvpRules.ResolveTurn(state, new[] { plan });

            Assert.AreEqual(new GridPosition(3, 3), unit.Position);
            Assert.IsTrue(result.Events.Contains("MoveApplied"));
        }

        [Test]
        public void ResolveTurn_CancelsConflictingMoves()
        {
            var state = MvpRules.CreateInitialMatch(MvpMapDefinition.CreateDefault(), MvpBalanceConfig.CreateDefault());
            var p1Unit = state.Units.Find(unit => unit.Owner == PlayerSlot.Player1);
            var p2Unit = state.Units.Find(unit => unit.Owner == PlayerSlot.Player2);
            var p1Start = p1Unit.Position;
            var p2Start = p2Unit.Position;

            var plans = new[]
            {
                new TurnPlan(PlayerSlot.Player1).AddMove(p1Unit.Id, new GridPosition(4, 4)),
                new TurnPlan(PlayerSlot.Player2).AddMove(p2Unit.Id, new GridPosition(4, 4))
            };

            var result = MvpRules.ResolveTurn(state, plans);

            Assert.AreEqual(p1Start, p1Unit.Position);
            Assert.AreEqual(p2Start, p2Unit.Position);
            Assert.IsTrue(result.Events.Contains("MoveCanceled"));
        }
    }
}
```

- [ ] **Step 2: Run tests and verify they fail**

Expected: compile failure because turn plan and resolution types do not exist.

- [ ] **Step 3: Implement action and plan types**

```csharp
namespace Game.Common.Mvp
{
    public abstract class TurnAction
    {
        protected TurnAction(int unitId)
        {
            UnitId = unitId;
        }

        public int UnitId { get; }
    }

    public sealed class MoveAction : TurnAction
    {
        public MoveAction(int unitId, GridPosition destination) : base(unitId)
        {
            Destination = destination;
        }

        public GridPosition Destination { get; }
    }

    public sealed class AttackAction : TurnAction
    {
        public AttackAction(int unitId, int targetUnitId) : base(unitId)
        {
            TargetUnitId = targetUnitId;
        }

        public int TargetUnitId { get; }
    }
}
```

```csharp
using System.Collections.Generic;

namespace Game.Common.Mvp
{
    public sealed class TurnPlan
    {
        private readonly List<TurnAction> actions = new List<TurnAction>();

        public TurnPlan(PlayerSlot player)
        {
            Player = player;
        }

        public PlayerSlot Player { get; }
        public IReadOnlyList<TurnAction> Actions => actions;

        public TurnPlan AddMove(int unitId, GridPosition destination)
        {
            actions.Add(new MoveAction(unitId, destination));
            return this;
        }

        public TurnPlan AddAttack(int unitId, int targetUnitId)
        {
            actions.Add(new AttackAction(unitId, targetUnitId));
            return this;
        }
    }
}
```

```csharp
using System.Collections.Generic;

namespace Game.Common.Mvp
{
    public sealed class ResolutionResult
    {
        private readonly List<string> events = new List<string>();

        public IReadOnlyList<string> Events => events;

        public void AddEvent(string eventName)
        {
            events.Add(eventName);
        }
    }
}
```

- [ ] **Step 4: Implement minimal movement resolution**

Add to `MvpRules`:

```csharp
public static ResolutionResult ResolveTurn(MatchState state, TurnPlan[] plans)
{
    var result = new ResolutionResult();
    var destinations = new Dictionary<int, GridPosition>();
    var destinationCounts = new Dictionary<GridPosition, int>();

    foreach (var plan in plans)
    {
        foreach (var action in plan.Actions)
        {
            if (action is MoveAction move)
            {
                destinations[move.UnitId] = move.Destination;
                destinationCounts.TryGetValue(move.Destination, out var count);
                destinationCounts[move.Destination] = count + 1;
            }
        }
    }

    foreach (var pair in destinations)
    {
        var unit = state.Units.Find(candidate => candidate.Id == pair.Key);
        if (unit == null || !unit.IsAlive)
        {
            continue;
        }

        if (destinationCounts[pair.Value] > 1)
        {
            result.AddEvent("MoveCanceled");
            continue;
        }

        unit.MoveTo(pair.Value);
        result.AddEvent("MoveApplied");
    }

    return result;
}
```

- [ ] **Step 5: Run tests and verify they pass**

Expected: turn resolution movement tests pass.

---

### Task 6: Add Shrink, Elimination, And Winner Checks

**Files:**
- Modify: `E:/Unity/go-royal-client/go-royal-unity/Assets/Game.Common/Runtime/Mvp/MvpRules.cs`
- Create: `E:/Unity/go-royal-client/go-royal-unity/Assets/Tests/EditMode/Mvp/MvpWinConditionTests.cs`

- [ ] **Step 1: Write failing win/shrink tests**

```csharp
using System.Linq;
using Game.Common.Mvp;
using NUnit.Framework;

namespace Game.Common.Tests.Mvp
{
    public sealed class MvpWinConditionTests
    {
        [Test]
        public void ApplyShrink_EliminatesUnitsOutsideSafeZone()
        {
            var state = MvpRules.CreateInitialMatch(MvpMapDefinition.CreateDefault(), MvpBalanceConfig.CreateDefault());
            var unit = state.Units[0];
            unit.MoveTo(new GridPosition(0, 0));

            state.AdvanceTurn();
            MvpRules.ApplyShrinkElimination(state);

            Assert.IsFalse(unit.IsAlive);
        }

        [Test]
        public void UpdateEliminations_EliminatesPlayerWithNoAliveUnits()
        {
            var state = MvpRules.CreateInitialMatch(MvpMapDefinition.CreateDefault(), MvpBalanceConfig.CreateDefault());
            foreach (var unit in state.Units.Where(unit => unit.Owner == PlayerSlot.Player1))
            {
                unit.ApplyDamage(999);
            }

            MvpRules.UpdatePlayerEliminations(state);

            Assert.IsTrue(state.Players.Find(player => player.Slot == PlayerSlot.Player1).IsEliminated);
        }
    }
}
```

- [ ] **Step 2: Run tests and verify they fail**

Expected: compile failure because shrink/elimination methods do not exist.

- [ ] **Step 3: Implement shrink and elimination methods**

Add to `MvpRules`:

```csharp
public static void ApplyShrinkElimination(MatchState state)
{
    var safeZone = state.CurrentSafeZone;
    foreach (var unit in state.Units)
    {
        if (unit.IsAlive && !safeZone.Contains(unit.Position))
        {
            unit.ApplyDamage(unit.Hp);
        }
    }
}

public static void UpdatePlayerEliminations(MatchState state)
{
    foreach (var player in state.Players)
    {
        var hasAliveUnit = state.Units.Exists(unit => unit.Owner == player.Slot && unit.IsAlive);
        if (!hasAliveUnit)
        {
            player.Eliminate();
        }
    }
}

public static PlayerSlot? GetWinner(MatchState state)
{
    PlayerSlot? winner = null;
    var activeCount = 0;

    foreach (var player in state.Players)
    {
        if (!player.IsEliminated)
        {
            winner = player.Slot;
            activeCount++;
        }
    }

    return activeCount == 1 ? winner : null;
}
```

- [ ] **Step 4: Integrate shrink and elimination into `ResolveTurn`**

At the end of `ResolveTurn`, before `return result;`, add:

```csharp
state.AdvanceTurn();
ApplyShrinkElimination(state);
UpdatePlayerEliminations(state);

if (GetWinner(state).HasValue)
{
    result.AddEvent("MatchEnded");
}
```

- [ ] **Step 5: Run all Edit Mode MVP tests and verify they pass**

Expected: all tests under `Assets/Tests/EditMode/Mvp/` pass.

---

## Linear Tracking Mapping

Use [linear-mvp-backlog.md](</E:/go-royal/01 - design/plans/linear-mvp-backlog.md>) as the issue source for Linear tracking.

## Verification

Run after implementation:

```sh
Unity -batchmode -projectPath E:/Unity/go-royal-client/go-royal-unity -runTests -testPlatform EditMode -testResults test-results.xml -quit
```

Expected: all MVP Edit Mode tests pass.
