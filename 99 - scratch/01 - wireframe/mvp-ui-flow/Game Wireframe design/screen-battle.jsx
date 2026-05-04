/* Battle Planning — 4 variations
   Priority: Show predicted enemy moves / threats
*/

const BP_BASE = (size = 9) => {
  const cells = {};
  // mark just labels for P-zones (lighter)
  return cells;
};

/* V1 — THREAT HEATMAP overlaid on board */
function BattleV1({ size = 9 }) {
  const cells = {};
  // shaded threat zones (where enemies could reach)
  ['D5','D6','E5','E6','F5','F6','C5','D4','E4','F4'].forEach(c => cells[c] = 'threat');
  cells['B3'] = 'selected';
  cells['C3'] = 'move-target';
  cells['C4'] = 'move-target';
  cells['D5'] = 'attack-target';
  const units = [
    { at: 'A1', kind: 'INF', player: 1, hp: 10 },
    { at: 'B3', kind: 'CAV', player: 1, hp: 8 },
    { at: 'B1', kind: 'ARC', player: 1, hp: 6 },
    { at: 'A8', kind: 'INF', player: 2, hp: 9 },
    { at: 'C7', kind: 'ARC', player: 2, hp: 6 },
    { at: 'E6', kind: 'CAV', player: 2, hp: 8 },
    { at: 'I1', kind: 'INF', player: 3, hp: 10 },
    { at: 'I9', kind: 'ARC', player: 4, hp: 6 },
  ];
  const arrows = [
    { from: 'B3', to: 'C4', kind: 'move' },
    { from: 'C4', to: 'D5', kind: 'attack' },
  ];
  const threats = [
    { from: 'E6', to: 'D5' },
    { from: 'C7', to: 'C5', dash: true },
  ];
  return (
    <Frame kind="desktop">
      <Chrome
        left={<><span className="icon-btn">≡</span><span className="hand" style={{fontSize:16}}>PLANNING — R4</span></>}
        right={<>
          <span className="chip">⏱ 0:23</span>
          <span className="chip danger">3 THREATS</span>
          <button className="btn sm">LOG</button>
        </>}
      />
      <div style={{display:'grid', gridTemplateColumns:'1fr 220px', gap:12, padding:12, height:'calc(100% - 42px)'}}>
        <div style={{display:'flex', flexDirection:'column', gap:6}}>
          <div className="modetabs" style={{alignSelf:'flex-start'}}>
            <div className="mt on">MOVE</div>
            <div className="mt">ATTACK</div>
            <div className="mt">UNDO</div>
          </div>
          <div style={{position:'relative'}}>
            <Board size={size} cells={cells} units={units}
              overlay={<ArrowOverlay arrows={arrows} threats={threats} size={size} />} />
            <div className="anno" style={{top:'40%', right:6}}>
              <span className="arrow">←</span> enemy threat
            </div>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8}}>
            <div className="legend">
              <span className="lk"><span className="sw" style={{background:'rgba(217,74,43,0.16)'}}></span>threat zone</span>
              <span className="lk"><span className="sw" style={{background:'rgba(58,58,58,0.18)'}}></span>your move</span>
              <span className="lk"><span className="sw" style={{background:'rgba(217,74,43,0.28)'}}></span>your attack</span>
            </div>
            <button className="btn primary">CONFIRM ✓</button>
          </div>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <div className="panel">
            <div className="row"><span className="hand" style={{fontSize:16}}>AP</span><APBar total={5} used={3} /></div>
            <div className="row tiny"><span className="muted">remaining</span><span className="mono">2 / 5</span></div>
          </div>
          <div className="panel">
            <h4>SELECTED · CAV B3</h4>
            <div className="row tiny"><span className="muted">HP</span><span className="mono">8 / 8</span></div>
            <div className="row tiny"><span className="muted">beats</span><span>INF</span></div>
            <div className="row tiny"><span className="muted">weak vs</span><span>ARC</span></div>
          </div>
          <div className="panel">
            <h4>QUEUED PLAN</h4>
            <div className="queue">
              <span className="qchip">↗ MOVE B3→C4 <span className="x">×</span></span>
              <span className="qchip attack">⚔ ATK D5 <span className="x">×</span></span>
            </div>
          </div>
          <div className="panel" style={{borderColor:'var(--accent)'}}>
            <h4 style={{color:'var(--accent)'}}>⚠ THREATS</h4>
            <div className="tiny" style={{lineHeight:1.4}}>
              P2 CAV (E6) can reach <b>D5</b><br/>
              P2 ARC (C7) can hit <b>C5</b>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* V2 — DUAL VIEW: your plan vs predicted enemy plan */
function BattleV2({ size = 9 }) {
  const yourCells = { 'B3':'selected', 'C3':'move-target', 'D4':'move-target', 'D5':'attack-target' };
  const enemyCells = { 'E6':'selected', 'D6':'move-target', 'D5':'attack-target' };
  const baseUnits = [
    { at: 'A1', kind: 'INF', player: 1, hp: 10 },
    { at: 'B3', kind: 'CAV', player: 1, hp: 8 },
    { at: 'A8', kind: 'INF', player: 2, hp: 9 },
    { at: 'E6', kind: 'CAV', player: 2, hp: 8 },
  ];
  const yourArrows = [{ from: 'B3', to: 'D4', kind: 'move' }, { from: 'D4', to: 'D5', kind: 'attack' }];
  const enemyArrows = [{ from: 'E6', to: 'D5', kind: 'attack', dash: true }];
  return (
    <Frame kind="desktop">
      <Chrome
        left={<span className="hand" style={{fontSize:16}}>PLANNING · DUAL FORECAST</span>}
        right={<><span className="chip">R4</span><span className="chip">⏱ 0:18</span></>}
      />
      <div style={{padding:12, height:'calc(100% - 42px)', display:'flex', flexDirection:'column', gap:10}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, flex:1, minHeight:0}}>
          <div style={{display:'flex', flexDirection:'column', gap:4}}>
            <div className="hand" style={{fontSize:16, color:'var(--ink)'}}>YOUR PLAN</div>
            <Board size={size} cells={yourCells} units={baseUnits}
              overlay={<ArrowOverlay arrows={yourArrows} size={size} />} />
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:4}}>
            <div className="hand" style={{fontSize:16, color:'var(--accent)'}}>LIKELY ENEMY (P2)</div>
            <Board size={size} cells={enemyCells} units={baseUnits}
              overlay={<ArrowOverlay arrows={enemyArrows} size={size} />} />
          </div>
        </div>
        <div className="panel" style={{borderColor:'var(--accent)'}}>
          <div className="flex between center">
            <div>
              <div className="hand" style={{fontSize:16}}>Predicted clash on D5</div>
              <div className="tiny muted">Both you and P2 want this cell. Counter: your CAV beats their INF, but P2 sends CAV — coin flip.</div>
            </div>
            <div className="flex gap-8">
              <APBar total={5} used={3} />
              <button className="btn primary">CONFIRM ✓</button>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* V3 — STEP-BY-STEP TURN PLANNER (left rail = sequence) */
function BattleV3({ size = 9 }) {
  const cells = { 'B3':'selected', 'C4':'move-target', 'D5':'attack-target' };
  const units = [
    { at: 'A1', kind: 'INF', player: 1, hp: 10 },
    { at: 'B3', kind: 'CAV', player: 1, hp: 8 },
    { at: 'B1', kind: 'ARC', player: 1, hp: 6 },
    { at: 'E6', kind: 'CAV', player: 2, hp: 8 },
    { at: 'C7', kind: 'ARC', player: 2, hp: 6 },
  ];
  return (
    <Frame kind="desktop">
      <Chrome
        left={<span className="hand" style={{fontSize:16}}>STEP-PLAN · R4</span>}
        right={<><span className="chip">AP 2/5</span><span className="chip">⏱ 0:30</span></>}
      />
      <div style={{display:'grid', gridTemplateColumns:'200px 1fr 220px', gap:12, padding:12, height:'calc(100% - 42px)'}}>
        <div style={{display:'flex', flexDirection:'column', gap:6}}>
          <div className="hand" style={{fontSize:16}}>PLAN ORDER</div>
          <div className="panel" style={{fontSize:12, padding:8}}>
            <div className="row" style={{padding:'6px 0'}}>
              <span><b>1.</b> CAV B3 → C4</span><span className="mono tiny">1 AP</span>
            </div>
            <div className="row" style={{padding:'6px 0'}}>
              <span><b>2.</b> CAV C4 ⚔ D5</span><span className="mono tiny">2 AP</span>
            </div>
            <div className="row" style={{padding:'6px 0'}}>
              <span><b>3.</b> ARC B1 ⚔ C7</span><span className="mono tiny">2 AP</span>
            </div>
            <div className="row" style={{padding:'6px 0', opacity:0.4, borderStyle:'dashed'}}>
              <span>+ add step…</span><span></span>
            </div>
          </div>
          <div className="tiny muted">Drag to reorder. Steps run simultaneously.</div>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:6}}>
          <Board size={size} cells={cells} units={units}
            overlay={<ArrowOverlay arrows={[
              { from: 'B3', to: 'C4', kind: 'move' },
              { from: 'C4', to: 'D5', kind: 'attack' },
              { from: 'B1', to: 'C7', kind: 'attack', dash: true, opacity:0.5 },
            ]} size={size} />} />
          <button className="btn primary" style={{alignSelf:'flex-end'}}>SUBMIT TURN ✓</button>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <div className="panel">
            <h4>FORECAST</h4>
            <div className="tiny" style={{lineHeight:1.5}}>
              ✓ Step 2 hits — CAV vs CAV (no counter)<br/>
              ⚠ Step 3 risky — ARC in CAV's reach<br/>
              ✓ AP within budget (5/5)
            </div>
          </div>
          <div className="panel">
            <h4>PLAYERS</h4>
            <div className="row tiny"><span>P2</span><span className="muted">⏳ planning</span></div>
            <div className="row tiny"><span>P3</span><span className="hand">✓</span></div>
            <div className="row tiny"><span>P4</span><span className="muted">⏳ planning</span></div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* V4 — UNIT-CENTRIC: sheet that pops on selected unit */
function BattleV4({ size = 9 }) {
  const cells = { 'B3':'selected', 'C3':'move-target', 'C4':'move-target', 'D4':'move-target', 'D5':'attack-target', 'C5':'threat', 'D6':'threat' };
  const units = [
    { at: 'B3', kind: 'CAV', player: 1, hp: 8 },
    { at: 'A1', kind: 'INF', player: 1, hp: 10 },
    { at: 'E6', kind: 'CAV', player: 2, hp: 8 },
    { at: 'C7', kind: 'ARC', player: 2, hp: 6 },
  ];
  return (
    <Frame kind="desktop">
      <Chrome
        left={<span className="hand" style={{fontSize:16}}>PLANNING · UNIT FOCUS</span>}
        right={<><span className="chip">R4</span><APBar total={5} used={2} /></>}
      />
      <div style={{position:'relative', padding:12, height:'calc(100% - 42px)'}}>
        <Board size={size} cells={cells} units={units}
          overlay={<ArrowOverlay arrows={[{from:'B3', to:'C4', kind:'move'}]}
                                  threats={[{from:'E6',to:'C5'}]} size={size} />} />
        {/* floating unit sheet */}
        <div style={{
          position:'absolute', top:60, right:24,
          width: 230, padding: 12,
          border: '2px solid var(--ink)', borderRadius: 12,
          background: 'var(--paper)', boxShadow: '3px 4px 0 rgba(0,0,0,0.1)'
        }}>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
            <Unit kind="CAV" player={1} style={{width:36, height:36, position:'relative'}} />
            <div>
              <div className="hand" style={{fontSize:18}}>Cavalry · B3</div>
              <div className="tiny mono">HP 8/8 · MV 4 · beats INF</div>
            </div>
          </div>
          <div className="modetabs" style={{width:'100%'}}>
            <div className="mt on">MOVE (1)</div>
            <div className="mt">ATTACK (2)</div>
            <div className="mt">WAIT (0)</div>
          </div>
          <div className="divider"></div>
          <div className="tiny" style={{lineHeight:1.4}}>
            <b>Reachable:</b> 4 cells<br/>
            <b>Targets in range:</b> P2 CAV (E6)<br/>
            <span style={{color:'var(--accent)'}}><b>⚠ Threatened by:</b> P2 ARC (C7) → counter</span>
          </div>
          <div className="divider"></div>
          <div className="queue">
            <span className="qchip">↗ B3→C4</span>
          </div>
        </div>
        <button className="btn primary" style={{position:'absolute', bottom:18, right:24}}>CONFIRM ✓</button>
        <div className="anno" style={{bottom:60, left:'30%'}}>
          <span className="arrow">↘</span> tap any unit for its sheet
        </div>
      </div>
    </Frame>
  );
}

function ScreenBattle({ size, accent, density }) {
  return (
    <div className={`accent-${accent} density-${density}`}>
      <div className="section-head">
        <h1>2 · Battle Planning</h1>
        <p>Simultaneous turn submission — every player plans privately, then all four resolve at once. These variations focus on surfacing <b>predicted enemy threats</b>, the priority you flagged.</p>
      </div>
      <div className="variations">
        <VCard tag="A" title="Threat heatmap on board" desc="enemies' reach shaded">
          <BattleV1 size={size} />
        </VCard>
        <VCard tag="B" title="Dual forecast view" desc="your plan vs predicted">
          <BattleV2 size={size} />
        </VCard>
        <VCard tag="C" title="Step list + reorder" desc="action queue as primary UI">
          <BattleV3 size={size} />
        </VCard>
        <VCard tag="D" title="Unit-focus sheet" desc="floating panel per unit">
          <BattleV4 size={size} />
        </VCard>
      </div>
    </div>
  );
}

window.ScreenBattle = ScreenBattle;
