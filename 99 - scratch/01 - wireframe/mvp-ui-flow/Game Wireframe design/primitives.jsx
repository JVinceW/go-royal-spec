/* Shared wireframe primitives */

const UNIT_GLYPH = { INF: 'I', ARC: 'A', CAV: 'C' };
const UNIT_NAME  = { INF: 'Infantry', ARC: 'Archer', CAV: 'Cavalry' };
const UNIT_BEATS = { INF: 'ARC', ARC: 'CAV', CAV: 'INF' };

function Unit({ kind = 'INF', player = 1, hp, ghost = false, sub, style }) {
  return (
    <div className={`unit p${player} ${ghost ? 'ghost' : ''}`} style={style}>
      <span>{UNIT_GLYPH[kind] || '?'}</span>
      {sub && <span style={{fontSize:9, fontFamily:'var(--mono)', opacity:0.6, marginTop:2}}>{sub}</span>}
      {hp != null && <span className="hp">{hp}</span>}
    </div>
  );
}

function Board({ size = 9, cells = {}, units = [], overlay = null, showCoords = true, style }) {
  // cells: { "B3": "zone-p1", "E5": "danger" }
  const rows = ['A','B','C','D','E','F','G','H','I','J','K'].slice(0, size);
  return (
    <div className="board-wrap" style={{...style}}>
      <div></div>
      {showCoords && (
        <div className="col-labels">
          {Array.from({length: size}, (_, i) => <span key={i}>{i+1}</span>)}
        </div>
      )}
      {showCoords ? (
        <div className="row-labels">
          {rows.map(r => <span key={r}>{r}</span>)}
        </div>
      ) : <div></div>}
      <div
        className="board"
        style={{
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          gridTemplateRows: `repeat(${size}, 1fr)`,
          aspectRatio: '1 / 1',
          position: 'relative',
        }}
      >
        {rows.flatMap((r, ri) =>
          Array.from({length: size}, (_, ci) => {
            const id = r + (ci+1);
            const klass = cells[id] || '';
            const u = units.find(x => x.at === id);
            return (
              <div key={id} className={`cell ${klass}`}>
                {u && <Unit {...u} />}
              </div>
            );
          })
        )}
        {overlay}
      </div>
    </div>
  );
}

// SVG arrow between cell coords on a board of size N (svg goes inside the .board element)
function moveArrow(from, to, size, opts = {}) {
  const cellPct = 100 / size;
  const fr = from.charCodeAt(0) - 65;
  const fc = parseInt(from.slice(1)) - 1;
  const tr = to.charCodeAt(0) - 65;
  const tc = parseInt(to.slice(1)) - 1;
  const x1 = (fc + 0.5) * cellPct;
  const y1 = (fr + 0.5) * cellPct;
  const x2 = (tc + 0.5) * cellPct;
  const y2 = (tr + 0.5) * cellPct;
  return { x1, y1, x2, y2, ...opts };
}

function ArrowOverlay({ arrows, size = 9, color = 'var(--ink)', threats = [] }) {
  return (
    <svg className="overlay" viewBox="0 0 100 100" preserveAspectRatio="none" style={{width:'100%',height:'100%'}}>
      <defs>
        <marker id="arrowhead" markerWidth="3" markerHeight="3" refX="2" refY="1.5" orient="auto">
          <polygon points="0 0, 3 1.5, 0 3" fill={color} />
        </marker>
        <marker id="arrowhead-red" markerWidth="3" markerHeight="3" refX="2" refY="1.5" orient="auto">
          <polygon points="0 0, 3 1.5, 0 3" fill="var(--accent)" />
        </marker>
      </defs>
      {(arrows || []).map((a, i) => {
        const m = moveArrow(a.from, a.to, size);
        const isAtt = a.kind === 'attack';
        return (
          <line key={'a'+i}
            x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2}
            stroke={isAtt ? 'var(--accent)' : color}
            strokeWidth={isAtt ? 0.6 : 0.5}
            strokeDasharray={a.dash ? '1.4 1.2' : 'none'}
            markerEnd={isAtt ? 'url(#arrowhead-red)' : 'url(#arrowhead)'}
            opacity={a.opacity || 1}
          />
        );
      })}
      {(threats || []).map((t, i) => {
        const m = moveArrow(t.from, t.to, size);
        return (
          <line key={'t'+i}
            x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2}
            stroke="var(--accent)" strokeWidth="0.4"
            strokeDasharray="0.8 0.8"
            opacity="0.7"
            markerEnd="url(#arrowhead-red)"
          />
        );
      })}
    </svg>
  );
}

function Frame({ kind = 'desktop', children, style }) {
  return <div className={`frame ${kind}`} style={style}>{children}</div>;
}

function Chrome({ left, right, title }) {
  return (
    <div className="chrome">
      <div className="left">{left}</div>
      {title && <div style={{fontFamily:'var(--hand-bold)', fontSize:18}}>{title}</div>}
      <div className="right">{right}</div>
    </div>
  );
}

function APBar({ total = 5, used = 0 }) {
  return (
    <div className="ap-pips" title={`AP ${total - used}/${total}`}>
      {Array.from({length: total}, (_, i) => (
        <span key={i} className={`pip ${i < (total - used) ? 'filled' : 'spent'}`} />
      ))}
    </div>
  );
}

function CounterTri() {
  return (
    <div className="tri">
      <div className="ring">
        <span>INF</span><i>›</i><span>ARC</span><i>›</i><span>CAV</span><i>›</i><span>INF</span>
      </div>
    </div>
  );
}

function VCard({ tag, title, desc, children }) {
  return (
    <div className="vcard">
      <div className="vlabel">
        <span className="vtag">{tag}</span>
        <span className="vtitle">{title}</span>
        {desc && <span className="vdesc">{desc}</span>}
      </div>
      {children}
    </div>
  );
}

Object.assign(window, {
  UNIT_GLYPH, UNIT_NAME, UNIT_BEATS,
  Unit, Board, ArrowOverlay, Frame, Chrome, APBar, CounterTri, VCard, moveArrow
});
