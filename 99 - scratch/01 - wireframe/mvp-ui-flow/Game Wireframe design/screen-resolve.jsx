/* Turn Resolution — 4 variations */

const TR_UNITS = [
  { at: 'A1', kind: 'INF', player: 1, hp: 10 },
  { at: 'C4', kind: 'CAV', player: 1, hp: 8 },
  { at: 'B1', kind: 'ARC', player: 1, hp: 6 },
  { at: 'D5', kind: 'CAV', player: 2, hp: 6, sub:'-2' },
  { at: 'C7', kind: 'ARC', player: 2, hp: 6 },
  { at: 'I1', kind: 'INF', player: 3, hp: 10 },
  { at: 'I9', kind: 'ARC', player: 4, hp: 6 },
];

/* V1 — CINEMATIC: large board + step controls */
function ResolveV1({ size = 9 }) {
  return (
    <Frame kind="desktop">
      <Chrome
        left={<span className="hand" style={{fontSize:16}}>RESOLUTION · R4 · STEP 3 / 7</span>}
        right={<><span className="chip">CINEMATIC</span><button className="btn sm">SKIP →</button></>}
      />
      <div style={{padding:12, height:'calc(100% - 42px)', display:'flex', flexDirection:'column', gap:10}}>
        <div style={{flex:1, display:'flex', justifyContent:'center', alignItems:'center', position:'relative'}}>
          <div style={{width:'70%'}}>
            <Board size={size} units={TR_UNITS}
              cells={{'D5':'attack-target'}}
              overlay={<ArrowOverlay arrows={[
                {from:'C4', to:'D5', kind:'attack'}
              ]} size={size} />} />
          </div>
          <div className="note" style={{top:20, right:20, transform:'rotate(2deg)'}}>
            <b>P1 CAV</b> hits <b>P2 CAV</b><br/>damage 2 (no counter)
          </div>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <button className="btn sm">⏮</button>
          <button className="btn sm">◀</button>
          <button className="btn primary">▶ PLAY</button>
          <button className="btn sm">▶▶</button>
          <div className="scrubber" style={{flex:1}}>
            <span className="mono">0:03</span>
            <div className="track"><div className="fill"></div><div className="head"></div></div>
            <span className="mono">0:09</span>
          </div>
          <button className="btn sm">SKIP TO END</button>
        </div>
      </div>
    </Frame>
  );
}

/* V2 — SPLIT: board + timeline scrubber w/ event chips */
function ResolveV2({ size = 9 }) {
  const events = [
    { t: 'P1 CAV move B3→C4', kind: 'move', done: true },
    { t: 'P3 INF move I1→H2', kind: 'move', done: true },
    { t: 'P1 CAV ⚔ P2 CAV (D5)', kind: 'attack', done: true, active: true },
    { t: 'P2 ARC ⚔ P1 ARC', kind: 'attack' },
    { t: 'P4 ARC move I9→H8', kind: 'move' },
    { t: 'Shrink ring 9→7', kind: 'shrink' },
    { t: 'P2 CAV eliminated', kind: 'elim' },
  ];
  return (
    <Frame kind="desktop">
      <Chrome
        left={<span className="hand" style={{fontSize:16}}>RESOLUTION · TIMELINE</span>}
        right={<><span className="chip">R4</span><span className="chip">3 / 7</span></>}
      />
      <div style={{display:'grid', gridTemplateColumns:'1fr 260px', gap:12, padding:12, height:'calc(100% - 42px)'}}>
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <Board size={size} units={TR_UNITS}
            cells={{'D5':'attack-target','C4':'selected'}}
            overlay={<ArrowOverlay arrows={[{from:'C4',to:'D5',kind:'attack'}]} size={size} />} />
          <div className="scrubber">
            <span className="mono">3/7</span>
            <div className="track" style={{position:'relative'}}>
              <div className="fill" style={{width:'42%'}}></div>
              <div className="head" style={{left:'42%'}}></div>
              <div className="marks">
                {[0,1,2,3,4,5,6].map(i => <div key={i} className="mark" />)}
              </div>
            </div>
            <button className="btn sm">▶</button>
            <button className="btn sm">⏭</button>
          </div>
        </div>
        <div className="panel" style={{display:'flex', flexDirection:'column', overflow:'hidden'}}>
          <h4>EVENTS (THIS TURN)</h4>
          <div style={{display:'flex', flexDirection:'column', gap:4, fontSize:11}}>
            {events.map((e,i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:6,
                padding:'5px 6px',
                border: e.active ? '1.5px solid var(--accent)' : '1px solid var(--rule-soft)',
                borderRadius:6,
                background: e.active ? 'rgba(217,74,43,0.08)' : (e.done ? 'transparent' : 'var(--paper-2)'),
                opacity: e.done && !e.active ? 0.55 : 1,
              }}>
                <span className="mono" style={{width:14, textAlign:'right'}}>{i+1}</span>
                <span style={{
                  width:18, height:18, border:'1px solid var(--ink)', borderRadius:4,
                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                  fontSize:11, fontWeight:700,
                  background: e.kind==='attack'?'var(--accent)':'transparent',
                  color: e.kind==='attack'?'var(--paper)':'var(--ink)'
                }}>
                  {e.kind==='move'?'↗':e.kind==='attack'?'⚔':e.kind==='shrink'?'▣':e.kind==='elim'?'☠':'•'}
                </span>
                <span style={{flex:1}}>{e.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* V3 — AUTO-PLAY w/ skip + minimal HUD */
function ResolveV3({ size = 9 }) {
  return (
    <Frame kind="desktop">
      <Chrome
        left={<span className="hand" style={{fontSize:16}}>RESOLUTION</span>}
        right={<><span className="chip solid">AUTO-PLAYING</span></>}
      />
      <div style={{padding:12, height:'calc(100% - 42px)', display:'flex', flexDirection:'column', gap:8, alignItems:'center'}}>
        <Board size={size} units={TR_UNITS}
          cells={{'D5':'attack-target'}}
          style={{maxWidth:560, width:'100%'}}
          overlay={<ArrowOverlay arrows={[
            {from:'C4',to:'D5',kind:'attack'},
            {from:'I1',to:'H2',kind:'move',opacity:0.5},
          ]} size={size} />} />
        <div style={{display:'flex', alignItems:'center', gap:14}}>
          <div className="hand" style={{fontSize:22}}>P1 CAV strikes P2 CAV — −2 hp</div>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button className="btn">⏸ PAUSE</button>
          <button className="btn ghost">◀ STEP BACK</button>
          <button className="btn primary">SKIP TO END ⏭</button>
        </div>
        <div className="tiny muted">7 events · auto-advancing every 1.2s</div>
      </div>
    </Frame>
  );
}

/* V4 — STEP LOG focus (event-list primary, mini board) */
function ResolveV4({ size = 9 }) {
  const events = [
    { p:1, t:'P1 CAV move B3 → C4', kind:'move', done:true },
    { p:3, t:'P3 INF move I1 → H2', kind:'move', done:true },
    { p:1, t:'P1 CAV attacks P2 CAV @ D5', kind:'attack', done:true, active:true, dmg:'-2' },
    { p:2, t:'P2 ARC attacks P1 ARC @ B1', kind:'attack', dmg:'-3' },
    { p:4, t:'P4 ARC move I9 → H8', kind:'move' },
    { p:0, t:'⚠ Shrink: ring 9 → 7', kind:'shrink' },
  ];
  return (
    <Frame kind="desktop">
      <Chrome
        left={<span className="hand" style={{fontSize:16}}>RESOLUTION · LOG VIEW</span>}
        right={<><span className="chip">R4</span></>}
      />
      <div style={{display:'grid', gridTemplateColumns:'320px 1fr', gap:12, padding:12, height:'calc(100% - 42px)'}}>
        <div style={{display:'flex', flexDirection:'column', gap:6, overflow:'hidden'}}>
          <div className="hand" style={{fontSize:16}}>WHAT HAPPENED</div>
          <div style={{display:'flex', flexDirection:'column', gap:6, fontSize:12, overflow:'auto'}}>
            {events.map((e,i)=>(
              <div key={i} style={{
                border: e.active ? '2px solid var(--accent)' : '1.5px solid var(--ink)',
                borderRadius:8, padding:8, background: e.done && !e.active ? 'var(--paper-2)':'var(--paper)',
                opacity: !e.done ? 0.55 : 1,
                display:'flex', alignItems:'center', gap:8
              }}>
                <span className="mono" style={{width:18}}>{i+1}.</span>
                <span style={{
                  width:24, height:24, border:'1px solid var(--ink)', borderRadius:6,
                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                  background: e.kind==='attack'?'var(--accent)':e.kind==='shrink'?'var(--ink)':'transparent',
                  color: (e.kind==='attack'||e.kind==='shrink')?'var(--paper)':'var(--ink)',
                  fontSize:13, fontWeight:700
                }}>
                  {e.kind==='move'?'↗':e.kind==='attack'?'⚔':e.kind==='shrink'?'▣':'•'}
                </span>
                <span style={{flex:1, lineHeight:1.3}}>{e.t}</span>
                {e.dmg && <span className="qchip attack" style={{fontSize:10}}>{e.dmg}</span>}
              </div>
            ))}
          </div>
          <div style={{display:'flex', gap:6, marginTop:'auto'}}>
            <button className="btn sm">◀</button>
            <button className="btn sm primary">▶</button>
            <button className="btn sm">⏭</button>
            <button className="btn sm">SKIP</button>
          </div>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:6}}>
          <Board size={size} units={TR_UNITS}
            cells={{'D5':'attack-target','C4':'selected'}}
            overlay={<ArrowOverlay arrows={[{from:'C4',to:'D5',kind:'attack'}]} size={size} />} />
          <div className="tiny muted" style={{textAlign:'center'}}>Click any event to jump to that moment</div>
        </div>
      </div>
    </Frame>
  );
}

function ScreenResolve({ size, accent, density }) {
  return (
    <div className={`accent-${accent} density-${density}`}>
      <div className="section-head">
        <h1>3 · Turn Resolution</h1>
        <p>All four players' actions play out at once. Variations explore cinematic, scrubber, auto-play and log-first approaches.</p>
      </div>
      <div className="variations">
        <VCard tag="A" title="Cinematic w/ step controls" desc="full-screen drama">
          <ResolveV1 size={size} />
        </VCard>
        <VCard tag="B" title="Board + timeline scrubber" desc="event chips on side">
          <ResolveV2 size={size} />
        </VCard>
        <VCard tag="C" title="Auto-play, skippable" desc="minimal HUD">
          <ResolveV3 size={size} />
        </VCard>
        <VCard tag="D" title="Event log primary" desc="board secondary">
          <ResolveV4 size={size} />
        </VCard>
      </div>
    </div>
  );
}

window.ScreenResolve = ScreenResolve;
