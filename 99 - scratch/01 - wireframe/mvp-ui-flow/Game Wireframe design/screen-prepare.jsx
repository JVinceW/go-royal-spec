/* Prepare Placement — 4 variations */

const PREP_BASE_CELLS = (size = 9) => {
  const cells = {};
  // P1 zone: rows A-B, cols 1-3
  for (const r of ['A','B']) for (let c=1; c<=3; c++) cells[r+c] = 'zone-p1';
  // P2 zone: rows A-B, cols 7-9
  for (const r of ['A','B']) for (let c=size-2; c<=size; c++) cells[r+c] = 'zone-p2';
  // P3 zone: rows H-I (or last 2), cols 1-3
  const last = ['ABCDEFGHIJK'[size-2], 'ABCDEFGHIJK'[size-1]];
  for (const r of last) for (let c=1; c<=3; c++) cells[r+c] = 'zone-p3';
  for (const r of last) for (let c=size-2; c<=size; c++) cells[r+c] = 'zone-p4';
  return cells;
};

/* V1 — SIDE ROSTER (current pattern, refined) */
function PrepareV1({ size = 9 }) {
  const cells = PREP_BASE_CELLS(size);
  cells['B2'] = 'zone-p1 selected';
  const units = [
    { at: 'A1', kind: 'INF', player: 1 },
    { at: 'A2', kind: 'INF', player: 1 },
    { at: 'B1', kind: 'ARC', player: 1 },
    { at: 'B2', kind: 'CAV', player: 1, ghost: true },
  ];
  return (
    <Frame kind="desktop">
      <Chrome
        left={<><span className="icon-btn">≡</span><span style={{fontFamily:'var(--hand-bold)',fontSize:16}}>PREPARE</span></>}
        right={<>
          <span className="chip">⏱ 0:42</span>
          <span className="chip solid">2/3 PLACED</span>
        </>}
      />
      <div style={{display:'grid', gridTemplateColumns:'1fr 200px', gap:14, padding:14, height:'calc(100% - 42px)'}}>
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <Board size={size} cells={cells} units={units} />
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12}}>
            <span className="muted">Drag units into your highlighted zone</span>
            <button className="btn primary">READY ✓</button>
          </div>
        </div>
        <div className="panel">
          <h4>YOUR ROSTER</h4>
          <div className="uc"><div className="uc-glyph">I</div><div className="uc-info"><div className="nm">Infantry</div><div className="stats">HP 10 · MV 2</div></div><div className="uc-count">×1</div></div>
          <div className="uc selected"><div className="uc-glyph">A</div><div className="uc-info"><div className="nm">Archer</div><div className="stats">HP 6 · RNG 3</div></div><div className="uc-count">×1</div></div>
          <div className="uc"><div className="uc-glyph">C</div><div className="uc-info"><div className="nm">Cavalry</div><div className="stats">HP 8 · MV 4</div></div><div className="uc-count">×1</div></div>
          <div className="divider"></div>
          <div className="row tiny"><span className="muted">Counters</span><span className="hand">i?</span></div>
          <div style={{marginTop:6, fontSize:11}} className="muted">Tap unit to see what it beats</div>
        </div>
      </div>
    </Frame>
  );
}

/* V2 — DRAFT-FIRST: pick composition before placing */
function PrepareV2({ size = 9 }) {
  const cells = PREP_BASE_CELLS(size);
  return (
    <Frame kind="desktop">
      <Chrome
        left={<span style={{fontFamily:'var(--hand-bold)',fontSize:16}}>PREPARE → DRAFT</span>}
        right={<><span className="chip">STEP 1 / 2</span></>}
      />
      <div style={{display:'flex', gap:14, padding:18, height:'calc(100% - 42px)', alignItems:'stretch'}}>
        <div style={{flex:1, display:'flex', flexDirection:'column', gap:12}}>
          <div style={{fontFamily:'var(--hand-bold)', fontSize:22}}>Pick 3 units</div>
          <div className="muted tiny">Tap to add. Counter triangle: <CounterTri /></div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginTop:6}}>
            <div className="uc selected" style={{flexDirection:'column', alignItems:'flex-start', padding:10}}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <div className="uc-glyph">I</div>
                <div className="uc-info"><div className="nm">Infantry</div><div className="stats">HP 10 · MV 2</div></div>
              </div>
              <div className="ctrcue">beats ARC</div>
              <div style={{marginTop:6, fontSize:11}}>Tank · short range</div>
              <div className="uc-count" style={{alignSelf:'flex-end'}}>×2</div>
            </div>
            <div className="uc" style={{flexDirection:'column', alignItems:'flex-start', padding:10}}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <div className="uc-glyph">A</div>
                <div className="uc-info"><div className="nm">Archer</div><div className="stats">HP 6 · RNG 3</div></div>
              </div>
              <div className="ctrcue">beats CAV</div>
              <div style={{marginTop:6, fontSize:11}}>Ranged · fragile</div>
              <div className="uc-count" style={{alignSelf:'flex-end'}}>×1</div>
            </div>
            <div className="uc" style={{flexDirection:'column', alignItems:'flex-start', padding:10}}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <div className="uc-glyph">C</div>
                <div className="uc-info"><div className="nm">Cavalry</div><div className="stats">HP 8 · MV 4</div></div>
              </div>
              <div className="ctrcue">beats INF</div>
              <div style={{marginTop:6, fontSize:11}}>Fast · flanker</div>
              <div className="uc-count" style={{alignSelf:'flex-end'}}>×0</div>
            </div>
          </div>
          <div className="panel" style={{marginTop:'auto'}}>
            <div className="row"><span className="hand" style={{fontSize:18}}>Your team</span><span className="hand" style={{fontSize:22}}>2 INF + 1 ARC</span></div>
            <div className="row tiny"><span className="muted">Strong vs</span><span>Archers, Cavalry</span></div>
            <div className="row tiny"><span className="muted">Weak vs</span><span>Mixed cavalry</span></div>
          </div>
          <button className="btn primary" style={{alignSelf:'flex-end'}}>NEXT → PLACE</button>
        </div>
        <div style={{width:280, display:'flex', flexDirection:'column', gap:6}}>
          <div className="muted tiny">Preview placement</div>
          <Board size={size} cells={cells} />
          <div className="anno" style={{position:'static', justifyContent:'center'}}><span className="arrow">↗</span> drag to place next</div>
        </div>
      </div>
    </Frame>
  );
}

/* V3 — ZOOMED ZONE-ONLY (focuses on player's 3x3) */
function PrepareV3({ size = 9 }) {
  const cells = {};
  for (let r=0;r<3;r++) for (let c=0;c<3;c++) cells['ABC'[r]+(c+1)] = 'zone-p1';
  cells['B2'] = 'zone-p1 selected';
  const units = [
    { at: 'A1', kind: 'INF', player: 1 },
    { at: 'A3', kind: 'ARC', player: 1 },
  ];
  return (
    <Frame kind="desktop">
      <Chrome
        left={<span style={{fontFamily:'var(--hand-bold)',fontSize:16}}>PREPARE — YOUR ZONE</span>}
        right={<><span className="chip">2 / 3 PLACED</span><span className="icon-btn">⛶</span></>}
      />
      <div style={{display:'grid', gridTemplateColumns:'180px 1fr 180px', gap:14, padding:14, height:'calc(100% - 42px)'}}>
        <div style={{display:'flex', flexDirection:'column', gap:6}}>
          <div className="muted tiny">Map overview</div>
          <Board size={size} cells={PREP_BASE_CELLS(size)} showCoords={false} />
          <div className="tiny muted">your zone is highlighted</div>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:8, alignItems:'center', justifyContent:'center'}}>
          <div className="hand" style={{fontSize:22}}>Place into your 3 × 3</div>
          <div style={{width:'70%'}}>
            <Board size={3} cells={cells} units={units} showCoords={true} />
          </div>
          <div style={{display:'flex', gap:10, marginTop:8}}>
            <div className="uc" style={{cursor:'grab'}}><div className="uc-glyph">I</div><div className="uc-info"><div className="nm">INF</div></div><div className="uc-count">×1</div></div>
            <div className="uc selected" style={{cursor:'grab'}}><div className="uc-glyph">C</div><div className="uc-info"><div className="nm">CAV</div></div><div className="uc-count">×1</div></div>
          </div>
          <button className="btn primary" style={{marginTop:8}}>READY ✓</button>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:6}}>
          <div className="panel" style={{fontSize:11}}>
            <h4 style={{fontSize:14}}>OPPONENTS</h4>
            <div className="row"><span><Unit kind="INF" player={2} style={{width:22, height:22}} /> P2</span><span className="hand">ready ✓</span></div>
            <div className="row"><span><Unit kind="ARC" player={3} style={{width:22, height:22}} /> P3</span><span className="muted">…placing</span></div>
            <div className="row"><span><Unit kind="CAV" player={4} style={{width:22, height:22}} /> P4</span><span className="muted">…placing</span></div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* V4 — TEMPLATE-ASSISTED placement (presets) */
function PrepareV4({ size = 9 }) {
  const cells = PREP_BASE_CELLS(size);
  cells['A2'] = 'zone-p1 selected';
  cells['B1'] = 'zone-p1 selected';
  cells['B3'] = 'zone-p1 selected';
  const units = [
    { at: 'A2', kind: 'INF', player: 1, ghost: true },
    { at: 'B1', kind: 'CAV', player: 1, ghost: true },
    { at: 'B3', kind: 'ARC', player: 1, ghost: true },
  ];
  return (
    <Frame kind="desktop">
      <Chrome
        left={<span style={{fontFamily:'var(--hand-bold)',fontSize:16}}>PREPARE</span>}
        right={<><span className="chip">⏱ 0:55</span></>}
      />
      <div style={{display:'grid', gridTemplateColumns:'1fr 230px', gap:14, padding:14, height:'calc(100% - 42px)'}}>
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <div className="hand" style={{fontSize:18}}>Try a starter formation, then tweak</div>
          <Board size={size} cells={cells} units={units} />
          <div className="tiny muted" style={{textAlign:'center'}}>Ghost units = preset suggestion · drag to override</div>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <div className="panel">
            <h4>FORMATIONS</h4>
            <div className="uc selected"><div className="uc-glyph">▤</div><div className="uc-info"><div className="nm">Wall</div><div className="stats">2 INF · 1 ARC</div></div></div>
            <div className="uc"><div className="uc-glyph">▷</div><div className="uc-info"><div className="nm">Skirmish</div><div className="stats">2 CAV · 1 ARC</div></div></div>
            <div className="uc"><div className="uc-glyph">⌂</div><div className="uc-info"><div className="nm">Balanced</div><div className="stats">1 each</div></div></div>
            <div className="uc"><div className="uc-glyph">+</div><div className="uc-info"><div className="nm">Custom</div><div className="stats">empty grid</div></div></div>
          </div>
          <div className="panel" style={{fontSize:12}}>
            <div className="hand" style={{fontSize:16, marginBottom:4}}>Why "Wall"?</div>
            <div className="muted" style={{lineHeight:1.4}}>Strong vs the Archer-heavy meta. Beats P2's expected lineup.</div>
          </div>
          <button className="btn primary" style={{marginTop:'auto'}}>READY ✓</button>
        </div>
      </div>
    </Frame>
  );
}

function ScreenPrepare({ size, accent, density }) {
  return (
    <div className={`accent-${accent} density-${density}`}>
      <div className="section-head">
        <h1>1 · Prepare Placement</h1>
        <p>Pick units from the debug roster (INF / ARC / CAV) and place them in your assigned zone before combat begins. Four ways to balance "what" vs "where".</p>
      </div>
      <div className="variations">
        <VCard tag="A" title="Side roster + zone view" desc="closest to current">
          <PrepareV1 size={size} />
        </VCard>
        <VCard tag="B" title="Two-step: draft then place" desc="composition-first">
          <PrepareV2 size={size} />
        </VCard>
        <VCard tag="C" title="Zone-zoom + minimap" desc="focus on your 3×3">
          <PrepareV3 size={size} />
        </VCard>
        <VCard tag="D" title="Preset formations" desc="onboarding-friendly">
          <PrepareV4 size={size} />
        </VCard>
      </div>
    </div>
  );
}

window.ScreenPrepare = ScreenPrepare;
