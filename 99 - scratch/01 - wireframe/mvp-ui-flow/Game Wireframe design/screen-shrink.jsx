/* Shrink Zone — 4 visualization variations */

const SHRINK_UNITS = [
  { at: 'A1', kind: 'INF', player: 1, hp: 10 },
  { at: 'B2', kind: 'CAV', player: 1, hp: 8 },
  { at: 'I9', kind: 'ARC', player: 4, hp: 6 },
  { at: 'A9', kind: 'INF', player: 2, hp: 9 },
  { at: 'I1', kind: 'INF', player: 3, hp: 10 },
  { at: 'E5', kind: 'CAV', player: 2, hp: 8 },
];

// helper: produce shrink ring cells given current ring (1 = outer, 4 = innermost)
function ringCells(size, ringIdx) {
  const cells = {};
  const rows = 'ABCDEFGHIJK'.slice(0, size);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const dist = Math.min(r, c, size-1-r, size-1-c);
      const id = rows[r] + (c+1);
      if (dist < ringIdx - 1) cells[id] = 'shrink-out';
      else if (dist === ringIdx - 1) cells[id] = 'shrink-warn';
    }
  }
  return cells;
}

/* V1 — RINGS: classic concentric, color-coded */
function ShrinkV1({ size = 9 }) {
  const cells = ringCells(size, 2);
  return (
    <Frame kind="desktop">
      <Chrome
        left={<span className="hand" style={{fontSize:16}}>SHRINK · RING VIEW</span>}
        right={<><span className="chip danger">RING 2 INCOMING</span><span className="chip">R5</span></>}
      />
      <div style={{display:'grid', gridTemplateColumns:'1fr 220px', gap:12, padding:12, height:'calc(100% - 42px)'}}>
        <div style={{display:'flex', flexDirection:'column', gap:6}}>
          <Board size={size} cells={cells} units={SHRINK_UNITS} />
          <div className="legend" style={{justifyContent:'center'}}>
            <span className="lk"><span className="sw" style={{background:'var(--paper)', borderColor:'var(--ink)'}}></span>safe</span>
            <span className="lk"><span className="sw" style={{background:'rgba(217,74,43,0.10)'}}></span>shrink next turn</span>
            <span className="lk"><span className="sw" style={{background:'var(--ink)'}}></span>out of bounds</span>
          </div>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <div className="panel" style={{borderColor:'var(--accent)'}}>
            <h4 style={{color:'var(--accent)'}}>⏳ NEXT SHRINK</h4>
            <div className="hand" style={{fontSize:32, lineHeight:1, margin:'4px 0'}}>2 turns</div>
            <div className="tiny muted">Cells in red will be eliminated.</div>
          </div>
          <div className="panel">
            <h4>UNITS AT RISK</h4>
            <div className="row tiny"><span><Unit kind="INF" player={1} style={{width:18,height:18,position:'relative'}}/> P1 A1</span><span className="hand" style={{color:'var(--accent)'}}>!</span></div>
            <div className="row tiny"><span><Unit kind="INF" player={2} style={{width:18,height:18,position:'relative'}}/> P2 A9</span><span className="hand" style={{color:'var(--accent)'}}>!</span></div>
            <div className="row tiny"><span><Unit kind="INF" player={3} style={{width:18,height:18,position:'relative'}}/> P3 I1</span><span className="hand" style={{color:'var(--accent)'}}>!</span></div>
          </div>
          <div className="panel">
            <h4>RING SCHEDULE</h4>
            <div className="row tiny"><span>R3</span><span>9 → 7</span></div>
            <div className="row tiny"><span>R5</span><span>7 → 5</span></div>
            <div className="row tiny"><span>R7</span><span>5 → 3</span></div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* V2 — STORM/FOG creep with countdown timer */
function ShrinkV2({ size = 9 }) {
  // mark "warning" cells with a fog texture using shrink-warn
  const cells = ringCells(size, 2);
  // emphasize edge as a glowing border
  ['B2','B3','B4','B5','B6','B7','B8','C2','D2','E2','F2','G2','H2','C8','D8','E8','F8','G8','H8'].forEach(c => {
    if (cells[c] !== 'shrink-out') cells[c] = 'safe-edge';
  });
  return (
    <Frame kind="desktop">
      <Chrome
        left={<span className="hand" style={{fontSize:16}}>SHRINK · STORM</span>}
        right={<><span className="chip danger solid">⏱ 0:08 TO STORM</span></>}
      />
      <div style={{padding:12, height:'calc(100% - 42px)', display:'flex', flexDirection:'column', gap:8}}>
        <div style={{position:'relative', flex:1}}>
          <Board size={size} cells={cells} units={SHRINK_UNITS}
            style={{height:'100%'}}
          />
          <div className="anno" style={{top:6, left:'50%', transform:'translateX(-50%)'}}>
            <span className="arrow">↓</span> storm wall
          </div>
          <div className="note" style={{bottom:18, right:18, transform:'rotate(2deg)', maxWidth:180}}>
            Edge glows on the <b>last safe cell</b> — pull units inward this turn
          </div>
        </div>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12}}>
          <div className="hand" style={{fontSize:18}}>Safe area: <b>7 × 7</b></div>
          <div className="scrubber" style={{flex:1, maxWidth:360}}>
            <span className="mono tiny">R5</span>
            <div className="track"><div className="fill" style={{width:'66%'}}></div><div className="head" style={{left:'66%'}}></div></div>
            <span className="mono tiny">R7</span>
          </div>
          <span className="chip danger">3 UNITS IN DANGER</span>
        </div>
      </div>
    </Frame>
  );
}

/* V3 — PREVIEW: ghost outline of next safe zone (no extra panels) */
function ShrinkV3({ size = 9 }) {
  const cells = ringCells(size, 1); // current is whole 9x9
  // overlay next ring (ring 2) as warning
  const next = ringCells(size, 2);
  Object.entries(next).forEach(([k, v]) => { if (v === 'shrink-warn') cells[k] = 'shrink-warn'; });
  return (
    <Frame kind="desktop">
      <Chrome
        left={<span className="hand" style={{fontSize:16}}>SHRINK · NEXT-RING PREVIEW</span>}
        right={<><span className="chip">R3</span></>}
      />
      <div style={{padding:18, height:'calc(100% - 42px)', display:'flex', flexDirection:'column', gap:10}}>
        <div className="hand" style={{fontSize:20}}>Hold ⓘ to preview the next safe zone</div>
        <div style={{position:'relative', flex:1, display:'flex', justifyContent:'center'}}>
          <div style={{maxWidth:560, width:'100%'}}>
            <Board size={size} cells={cells} units={SHRINK_UNITS}
              overlay={
                <svg className="overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* dashed outline of next safe area */}
                  <rect x={100/9} y={100/9} width={100*7/9} height={100*7/9}
                    fill="none" stroke="var(--accent)" strokeWidth="0.6" strokeDasharray="2 1.5" />
                </svg>
              } />
          </div>
          <div className="anno" style={{top:'10%', right:'8%'}}><span className="arrow">↙</span> next safe area</div>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div className="legend">
            <span className="lk"><span className="sw" style={{background:'rgba(217,74,43,0.10)'}}></span>shrinks next</span>
            <span className="lk"><span className="sw" style={{borderStyle:'dashed', borderColor:'var(--accent)', background:'transparent'}}></span>future safe zone</span>
          </div>
          <button className="btn">ⓘ HOLD TO PREVIEW</button>
        </div>
      </div>
    </Frame>
  );
}

/* V4 — TIMELINE: visualize ring schedule as a vertical strip */
function ShrinkV4({ size = 9 }) {
  const cells = ringCells(size, 2);
  return (
    <Frame kind="desktop">
      <Chrome
        left={<span className="hand" style={{fontSize:16}}>SHRINK · SCHEDULE</span>}
        right={<><span className="chip">R5 · 7 × 7 SAFE</span></>}
      />
      <div style={{display:'grid', gridTemplateColumns:'1fr 180px', gap:12, padding:12, height:'calc(100% - 42px)'}}>
        <Board size={size} cells={cells} units={SHRINK_UNITS} />
        <div style={{display:'flex', flexDirection:'column', gap:0, position:'relative'}}>
          <div className="hand" style={{fontSize:16, marginBottom:8}}>Map shrink</div>
          {[
            { r:'R1', s:'9 × 9', past:true, label:'start' },
            { r:'R3', s:'9 → 7', past:true, label:'shrink 1' },
            { r:'R5', s:'7 × 7', current:true, label:'now' },
            { r:'R7', s:'7 → 5', label:'shrink 2', soon:true },
            { r:'R9', s:'5 → 3', label:'shrink 3' },
            { r:'R11', s:'3 × 3', label:'final' },
          ].map((s, i, arr) => (
            <div key={i} style={{display:'flex', alignItems:'flex-start', gap:8, position:'relative'}}>
              <div style={{display:'flex', flexDirection:'column', alignItems:'center', minWidth:18}}>
                <div style={{
                  width:14, height:14, borderRadius:'50%',
                  border:'1.5px solid var(--ink)',
                  background: s.current ? 'var(--accent)' : s.past ? 'var(--ink)' : 'var(--paper)',
                  borderColor: s.soon ? 'var(--accent)' : 'var(--ink)',
                }}></div>
                {i < arr.length - 1 && <div style={{width:1.5, flex:1, background: s.past ? 'var(--ink)' : 'var(--rule-soft)', minHeight: 28}}></div>}
              </div>
              <div style={{paddingBottom:14, opacity: s.past ? 0.5 : 1}}>
                <div className="hand" style={{fontSize:15, color: s.current ? 'var(--accent)' : 'var(--ink)'}}>
                  {s.r} · {s.s}
                </div>
                <div className="tiny muted">{s.label}</div>
              </div>
            </div>
          ))}
          <div className="panel" style={{marginTop:'auto', borderColor:'var(--accent)', fontSize:11}}>
            <b style={{color:'var(--accent)'}}>NEXT (R7)</b>: 4 cells lost. 1 unit at risk.
          </div>
        </div>
      </div>
    </Frame>
  );
}

function ScreenShrink({ size, accent, density }) {
  return (
    <div className={`accent-${accent} density-${density}`}>
      <div className="section-head">
        <h1>4 · Shrink Zone</h1>
        <p>The safe area collapses on a schedule, forcing conflict. Variations explore how much the player should know about timing and future rings.</p>
      </div>
      <div className="variations">
        <VCard tag="A" title="Concentric rings + side panel" desc="schedule + at-risk list">
          <ShrinkV1 size={size} />
        </VCard>
        <VCard tag="B" title="Storm wall + countdown" desc="urgency-first">
          <ShrinkV2 size={size} />
        </VCard>
        <VCard tag="C" title="Hold-to-preview next ring" desc="minimal chrome">
          <ShrinkV3 size={size} />
        </VCard>
        <VCard tag="D" title="Schedule timeline" desc="full plan visible">
          <ShrinkV4 size={size} />
        </VCard>
      </div>
    </div>
  );
}

window.ScreenShrink = ScreenShrink;
