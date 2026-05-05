// Results panel — shows fitment and SKU matrix for selected vehicle

function Stat({ label, value, big, accent }) {
  return (
    <div>
      <div style={{
        fontFamily: F.mono, fontSize: 9, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: C.dim, marginBottom: 6,
      }}>{label}</div>
      <div style={{
        fontFamily: big ? F.display : F.body,
        fontSize: big ? 38 : 15,
        fontWeight: big ? 700 : 500,
        color: accent ? C.blue : C.ink,
        letterSpacing: big ? '0.01em' : 0,
        lineHeight: 1,
      }}>{value || '—'}</div>
    </div>
  );
}

function SkuPill({ sku, muted }) {
  if (!sku) return <span style={{ color: C.dim, fontFamily: F.mono, fontSize: 11 }}>—</span>;
  const pillStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontFamily: F.mono, fontSize: 11, fontWeight: 500,
    padding: '4px 10px', borderRadius: 4,
    background: muted ? C.surface : C.blueLight,
    color: muted ? C.mute : C.blueDark,
    letterSpacing: '0.02em',
    border: '1px solid transparent',
  };
  return <span style={pillStyle}>{sku}</span>;
}

function SkuCopyBtn({ sku }) {
  const [ok, setOk] = React.useState(false);
  if (!sku) return null;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard?.writeText(sku);
        setOk(true); setTimeout(()=>setOk(false), 1200);
      }}
      title="Copy SKU"
      style={{
        border: 'none', background: 'transparent', cursor: 'pointer',
        padding: 4, color: ok ? C.blue : C.dim, marginLeft: 4,
      }}>
      {ok ? (
        <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6 L5 9 L10 3" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round"/></svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 12 12"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" fill="none" strokeWidth="1"/><path d="M2 8 V2 H7" stroke="currentColor" fill="none" strokeWidth="1"/></svg>
      )}
    </button>
  );
}

// ---------------- AUTO RESULTS ----------------
function AutoResults({ data, row }) {
  if (!row) return <EmptyState segment="auto" />;
  const [year, mkIdx, model, typeIdx, fl, fr, btIdx, atIdx, bc, rbtIdx, rl, ratIdx, qfrSku, r1Sku] = row;
  const make = data.auto.makes[mkIdx];
  const vtype = data.auto.types[typeIdx];
  const bladeType = data.auto.bts[btIdx];
  const armType = data.auto.ats[atIdx];
  const rearBT = data.auto.rbts[rbtIdx];
  const rearAT = data.auto.rats[ratIdx];

  const brandRows = [
    { name: 'Autotex M5', tone: 'Conventional', front: [fl && `M5-${fl}`, fr && `M5-${fr}`], rec: bladeType === 'Conventional' },
    { name: 'Autotex M6', tone: 'Premium Conventional', front: [fl && `M6-${fl}`, fr && `M6-${fr}`] },
    { name: 'Clix Original', tone: 'Beam', front: [fl && `CLX-${fl}`, fr && `CLX-${fr}`], rec: bladeType === 'Beam' },
    { name: 'Clix Silicone+', tone: 'Premium Beam', front: [fl && `CLXSP-${fl}`, fr && `CLXSP-${fr}`] },
  ];


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <VehicleHeader year={year} make={make} model={model} type={vtype} badge={bladeType + ' · ' + (armType || '')} />

      <Panel style={{ padding: 22 }}>
        <SectionLabel right={`OEM · ${bladeType}`}>Fitment Specs</SectionLabel>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 18, padding: '18px 0 4px', borderTop: `1px solid ${C.line}`,
        }}>
          <Stat label="Front Left" value={fl && `${fl}"`} big accent />
          <Stat label="Front Right" value={fr && `${fr}"`} big accent />
          <Stat label="Blade Type" value={bladeType} />
          <Stat label="Arm Type" value={armType} />
          <Stat label="Connector" value={bc === '0' || !bc ? '—' : bc} />
          <Stat label="Rear Length" value={rl && `${rl}"`} />
        </div>
      </Panel>

      <Panel style={{ padding: 22 }}>
        <SectionLabel right="4 LINES · 8 FRONT SKUs">Autotex Front</SectionLabel>
        <SkuMatrix rows={brandRows} />
      </Panel>

      {(rl || r1Sku || qfrSku) && (
        <Panel style={{ padding: 22 }}>
          <SectionLabel right={rearAT ? `${rearBT || ''} · ${rearAT}` : rearBT}>Rear Wiper</SectionLabel>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14,
            paddingTop: 14, borderTop: `1px solid ${C.line}`,
          }}>
            <RearSku title="Autotex R1" tone="Conventional" sku={r1Sku || (rl && `R1-${rl}`)} />
            <RearSku title="Autotex QFR" tone="Quick-fit rear" sku={qfrSku || (rl && `QFR-${rl}B`)} />
            <div>
              <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.dim }}>Rear Length</div>
              <div style={{ fontFamily: F.display, fontSize: 38, fontWeight: 700, color: C.blue, lineHeight: 1, marginTop: 6 }}>{rl}"</div>
            </div>
          </div>
        </Panel>
      )}
      <ProductCards codes={autoProductCodes(row)} />
    </div>
  );
}


// -----------------------------------------------------------------------------
// Products in this fitment
// -----------------------------------------------------------------------------
function ProductCards({ codes, title }) {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    const h = () => force();
    window.addEventListener('wx-product-info-ready', h);
    return () => window.removeEventListener('wx-product-info-ready', h);
  }, []);
  const info = window.__WX_PRODUCT_INFO || {};
  const seen = new Set();
  const cards = [];
  for (const c of codes) {
    if (!c || seen.has(c)) continue;
    seen.add(c);
    if (info[c]) cards.push(info[c]);
  }
  if (cards.length === 0) return null;
  return (
    <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 8, padding: 22 }}>
      <SectionLabel right={`${cards.length} PRODUCT${cards.length > 1 ? 'S' : ''}`}>{title || 'Products in this fitment'}</SectionLabel>
      <div style={{
        display: 'grid', gap: 14, paddingTop: 14, borderTop: `1px solid ${C.line}`,
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      }}>
        {cards.map((p, i) => (
          <div key={i} style={{
            border: `1px solid ${C.line}`, borderRadius: 6, overflow: 'hidden',
            display: 'flex', flexDirection: 'column', background: C.white,
          }}>
            <div style={{
              aspectRatio: '4 / 3', background: C.surface,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 12, borderBottom: `1px solid ${C.line}`,
            }}>
              <img src={p.image} alt={p.title}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                loading="lazy" />
            </div>
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              <div style={{
                fontFamily: F.display, fontSize: 15, fontWeight: 700,
                letterSpacing: '0.04em', textTransform: 'uppercase', color: C.ink,
              }}>{p.name}</div>
              <div style={{
                fontFamily: F.mono, fontSize: 9, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: C.blue,
              }}>{p.subtitle}</div>
              <div style={{
                fontSize: 12, color: C.mute, lineHeight: 1.55, marginTop: 4,
              }}>{p.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function autoProductCodes(row) {
  const codes = ['M5', 'M6', 'CLX', 'CLX-SP'];
  const rl = row[10], qfr = row[12], r1 = row[13];
  if (rl || qfr || r1) { codes.push('R1', 'QFR'); }
  return codes;
}
function hdBladePrefix(sku) {
  if (!sku) return null;
  const m = String(sku).match(/^(\d{2})/);
  return m ? m[1] : null;
}
function hdProductCodes(row) {
  const hdDS = row[8], hdPS = row[9];
  const codes = [];
  for (const s of [hdDS, hdPS]) {
    const p = hdBladePrefix(s);
    if (p && ['71','72','74','78'].includes(p)) codes.push(p);
  }
  return codes;
}
function utvProductCodes(r) {
  const blade = r && r.blade ? String(r.blade) : '';
  const m = blade.match(/^(M5|M6|CLX(-SP)?)/);
  return m ? [m[1]] : [];
}

function RearSku({ title, tone, sku }) {
  return (
    <div style={{
      padding: 14, border: `1px solid ${C.line}`, borderRadius: 6,
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ fontFamily: F.display, fontSize: 15, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{title}</div>
      <div style={{ fontSize: 11, color: C.mute }}>{tone}</div>
      <div style={{ marginTop: 6, display: 'flex', alignItems: 'center' }}>
        <SkuPill sku={sku} />
        <SkuCopyBtn sku={sku} />
      </div>
    </div>
  );
}

function SkuMatrix({ rows }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 4 }}>
      <thead>
        <tr>
          <th style={thStyle()}>Line</th>
          <th style={thStyle()}>Blade</th>
          <th style={thStyle()}>Front Left</th>
          <th style={thStyle()}>Front Right</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} style={{ borderTop: `1px solid ${C.line}` }}>
            <td style={tdStyle()}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{r.name}</span>
                {r.rec && <span style={{
                  fontFamily: F.mono, fontSize: 9, letterSpacing: '0.08em',
                  background: C.blue, color: C.white, padding: '2px 7px', borderRadius: 3,
                }}>RECOMMENDED</span>}
              </div>
            </td>
            <td style={tdStyle()}><span style={{ fontSize: 12, color: C.mute }}>{r.tone}</span></td>
            <td style={tdStyle()}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <SkuPill sku={r.front[0]} muted={!r.rec} />
                <SkuCopyBtn sku={r.front[0]} />
              </div>
            </td>
            <td style={tdStyle()}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <SkuPill sku={r.front[1]} muted={!r.rec} />
                <SkuCopyBtn sku={r.front[1]} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function thStyle(align) {
  return {
    fontFamily: F.mono, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
    color: C.dim, fontWeight: 400, textAlign: align || 'left',
    padding: '10px 12px 10px 0', borderBottom: `1px solid ${C.line}`,
  };
}
function tdStyle(align) {
  return { padding: '14px 12px 14px 0', verticalAlign: 'middle', textAlign: align || 'left', color: C.ink, fontSize: 13 };
}

function VehicleHeader({ year, make, model, type, badge }) {
  return (
    <div style={{
      background: C.black, color: C.white, borderRadius: 8,
      padding: '24px 28px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', right: -60, top: -60, width: 200, height: 200,
        borderRadius: '50%', background: C.blue, opacity: 0.08,
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
        <span style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Selected Vehicle</span>
        <span style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.08em', background: 'rgba(0,87,255,0.25)', color: '#B3CAFF', padding: '3px 8px', borderRadius: 3, textTransform: 'uppercase' }}>{badge}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: F.display, fontSize: 48, fontWeight: 700, letterSpacing: '0.01em', lineHeight: 1 }}>{year}</span>
        <span style={{ fontFamily: F.display, fontSize: 28, fontWeight: 600, letterSpacing: '0.02em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>{make}</span>
        <span style={{ fontFamily: F.display, fontSize: 28, fontWeight: 700, letterSpacing: '0.02em', color: C.white, textTransform: 'uppercase' }}>{model}</span>
        <span style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', paddingLeft: 8, borderLeft: '1px solid rgba(255,255,255,0.15)' }}>{type}</span>
      </div>
    </div>
  );
}

function EmptyState({ segment }) {
  const copy = {
    auto: ['Passenger vehicle lookup', 'Select year, make, and model to pull OEM blade lengths and part numbers across Autotex M5, Autotex M6, Clix Original, and Clix Silicone+.'],
    hd: ['Heavy-duty lookup', 'Transit buses, motorcoaches, and Class 7–8 vehicles. Maps OEM Trico part numbers to HD blade families.'],
    rv: ['RV lookup', 'Motorhomes and coaches indexed by make and model series with year-range fitment.'],
    utv: ['UTV / Side-by-side lookup', 'Kit-based fitment for powersports. Includes motor, arm, blade, harness, and full wiper kit components.'],
  }[segment];
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: 600, background: C.white, border: `1px solid ${C.line}`,
      borderRadius: 8, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 440, padding: 40, position: 'relative' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: C.blueLight,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 18 L9 6 L11 12 L13 6 L20 18" stroke={C.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{
          fontFamily: F.mono, fontSize: 10, letterSpacing: '0.14em', color: C.dim,
          textTransform: 'uppercase', marginBottom: 8,
        }}>Awaiting selection</div>
        <h2 style={{
          fontFamily: F.display, fontSize: 32, fontWeight: 700, letterSpacing: '0.02em',
          margin: '0 0 12px',
        }}>{copy[0]}</h2>
        <p style={{ fontSize: 13, color: C.mute, lineHeight: 1.65, fontWeight: 300 }}>{copy[1]}</p>
      </div>
    </div>
  );
}

// ---------------- HD RESULTS ----------------
function HdResults({ data, row }) {
  if (!row) return <EmptyState segment="hd" />;
  const [year, mkIdx, model, typeIdx, trico, ds, ps, connIdx, hdDS, hdPS, motor,
         m5DS, m5PS, m6DS, m6PS, clxDS, clxPS, clxspDS, clxspPS] = row;
  const make = data.hd.makes[mkIdx];
  const vtype = data.hd.types[typeIdx];
  const conn = data.hd.conns[connIdx];
  // Fallback: if this HD row has no motor, look it up in the Motors sheet by year/make/model
  const motorSku = motor || (() => {
    if (!data.motors) return '';
    const hit = data.motors.find(m => m[0] === year && m[1] === make && m[2] === model);
    return hit ? hit[3] : '';
  })();
  // If this fitment has dedicated HD blades, those are primary; otherwise M5/M6/CLX are primary.
  const hasHD = !!hdDS;
  const rows = [
    hasHD && { name: 'Autotex HD', tone: 'Heavy-duty primary', front: [hdDS, hdPS], rec: true },
    { name: 'Autotex M5', tone: 'Conventional', front: [m5DS, m5PS], rec: !hasHD && !!m5DS },
    { name: 'Autotex M6', tone: 'Premium Conventional', front: [m6DS, m6PS] },
    { name: 'Clix Original', tone: 'Beam', front: [clxDS, clxPS] },
    { name: 'Clix Silicone+', tone: 'Premium Beam', front: [clxspDS, clxspPS] },
  ].filter(Boolean);
  const anyMapped = rows.some(r => r.front[0]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <VehicleHeader year={year} make={make} model={model} type={vtype} badge={conn || 'HD'} />
      <Panel style={{ padding: 22 }}>
        <SectionLabel right={`TRICO REF · ${trico || '—'}`}>Fitment Specs</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, padding: '18px 0 4px', borderTop: `1px solid ${C.line}` }}>
          <Stat label="Driver Side" value={ds && `${ds}"`} big accent />
          <Stat label="Passenger Side" value={ps && `${ps}"`} big accent />
          <Stat label="Connection" value={conn} />
          <Stat label="OEM Ref" value={trico} />
        </div>
      </Panel>
      <Panel style={{ padding: 22 }}>
        <SectionLabel right={hasHD ? 'AUTOTEX HD · PRIMARY' : (anyMapped ? '4 LINES · 8 FRONT SKUs' : 'NOT MAPPED')}>Front SKUs — DS / PS</SectionLabel>
        {!anyMapped ? (
          <div style={{
            marginTop: 14, padding: '14px 16px', borderTop: `1px solid ${C.line}`,
            fontFamily: F.mono, fontSize: 11, color: C.mute, letterSpacing: '0.04em',
            background: C.surface, borderRadius: 4,
          }}>
            ○ No Autotex blade mapped for this fitment. Contact sales for cross-reference.
          </div>
        ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle()}>Line</th>
              <th style={thStyle()}>Blade</th>
              <th style={thStyle()}>Driver Side</th>
              <th style={thStyle()}>Passenger Side</th>
                </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderTop: `1px solid ${C.line}` }}>
                <td style={tdStyle()}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{r.name}</span>
                    {r.rec && <span style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: '0.08em', background: C.blue, color: C.white, padding: '2px 7px', borderRadius: 3 }}>PRIMARY</span>}
                  </div>
                </td>
                <td style={tdStyle()}><span style={{ fontSize: 12, color: C.mute }}>{r.tone}</span></td>
                <td style={tdStyle()}><div style={{ display: 'flex', alignItems: 'center' }}><SkuPill sku={r.front[0]} muted={!r.rec} /><SkuCopyBtn sku={r.front[0]} /></div></td>
                <td style={tdStyle()}><div style={{ display: 'flex', alignItems: 'center' }}><SkuPill sku={r.front[1]} muted={!r.rec} /><SkuCopyBtn sku={r.front[1]} /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </Panel>

      {/* Wiper Motor — prominent block */}
      <Panel style={{ padding: 22 }}>
        <SectionLabel right={motorSku ? 'AUTOTEX MOTOR' : 'NOT MAPPED'}>Wiper Motor</SectionLabel>
        <div style={{
          display: 'grid', gridTemplateColumns: motorSku ? '1.2fr 1fr' : '1fr',
          gap: 24, padding: '18px 0 4px', borderTop: `1px solid ${C.line}`, alignItems: 'center',
        }}>
          <div>
            <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.dim, marginBottom: 8 }}>Motor SKU</div>
            {motorSku ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{
                  fontFamily: F.mono, fontSize: 26, fontWeight: 600,
                  background: C.blueLight, color: C.blueDark,
                  padding: '10px 18px', borderRadius: 6, letterSpacing: '0.04em',
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  border: `1px solid transparent`,
                }}>
                  {motorSku}
                </div>
                <SkuCopyBtn sku={motorSku} />
              </div>
            ) : (
              <div style={{
                fontFamily: F.mono, fontSize: 11, color: C.dim,
                padding: '10px 14px', background: C.surface, borderRadius: 4, display: 'inline-block',
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>○ No motor mapped for this fitment</div>
            )}
          </div>
          {motorSku && (
            <div style={{
              background: C.surface, borderRadius: 6, padding: 14,
              borderLeft: `2px solid ${C.blue}`,
            }}>
              <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.dim, marginBottom: 4 }}>Application</div>
              <div style={{ fontSize: 13, color: C.body, lineHeight: 1.5 }}>
                {year} {make} {model} — {vtype}
              </div>
            </div>
          )}
        </div>
      </Panel>
      <ProductCards codes={hdProductCodes(row)} />
    </div>
  );
}

// ---------------- RV RESULTS ----------------
function RvResults({ data, row }) {
  if (!row) return <EmptyState segment="rv" />;
  const [mk, ms, mn, ys, ye, conn, fd, fp, bd, bp] = row;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: C.black, color: C.white, borderRadius: 8, padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 200, height: 200, borderRadius: '50%', background: C.blue, opacity: 0.08 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
          <span style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>RV Coach</span>
          <span style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.08em', background: 'rgba(0,87,255,0.25)', color: '#B3CAFF', padding: '3px 8px', borderRadius: 3, textTransform: 'uppercase' }}>{conn}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: F.display, fontSize: 38, fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{mk}</span>
          <span style={{ fontFamily: F.display, fontSize: 28, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>{ms}</span>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{ys}–{ye}</span>
        </div>
      </div>
      <Panel style={{ padding: 22 }}>
        <SectionLabel right={conn}>Fitment</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, padding: '18px 0 4px', borderTop: `1px solid ${C.line}` }}>
          <Stat label="Year Range" value={`${ys} – ${ye}`} />
          <Stat label="Connection" value={conn} />
          <Stat label="Model Notes" value={mn === ms ? '—' : mn} />
          <Stat label="Segment" value="Motorhome" />
        </div>
      </Panel>
      <Panel style={{ padding: 22 }}>
        <SectionLabel right="RV LINES">SKU Matrix</SectionLabel>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle()}>Line</th>
              <th style={thStyle()}>Driver</th>
              <th style={thStyle()}>Passenger</th>
                </tr>
          </thead>
          <tbody>
            {[
              { n: 'Framed (Conventional)', d: fd, p: fp, rec: !!fd },
              { n: 'Beam', d: bd, p: bp, rec: !!bd && !fd },
            ].map((r, i) => (
              <tr key={i} style={{ borderTop: `1px solid ${C.line}` }}>
                <td style={tdStyle()}><span style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{r.n}</span></td>
                <td style={tdStyle()}><div style={{ display: 'flex', alignItems: 'center' }}><SkuPill sku={r.d} muted={!r.rec} /><SkuCopyBtn sku={r.d} /></div></td>
                <td style={tdStyle()}><div style={{ display: 'flex', alignItems: 'center' }}><SkuPill sku={r.p} muted={!r.rec} /><SkuCopyBtn sku={r.p} /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

// ---------------- UTV RESULTS ----------------
function UtvResults({ data, row }) {
  if (!row) return <EmptyState segment="utv" />;
  const r = row;
  const flags = (r.flags || '').split(',').filter(Boolean);
  const components = [
    ['Motor', r.motor],
    ['Arm', r.arm],
    ['Blade', r.blade],
    ['Mounting Hardware', r.mh],
    ['Wire Harness', r.wh],
    ['Motor Switch', r.ms],
    ['Washer Switch', r.ws],
    ['Washer Pump', r.wp],
    ['Washer Reservoir', r.wr],
  ].filter(([, v]) => v);
  const included = components.length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <VehicleHeader year={r.y} make={r.mk} model={r.md} type={r.pg} badge="UTV Kit" />
      {flags.length > 0 && (
        <div style={{
          background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 6,
          padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <div style={{ color: '#92400E', fontFamily: F.mono, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>⚠ Verify</div>
          <div style={{ flex: 1, fontSize: 12, color: '#78350F' }}>
            {flags.map(f => <code key={f} style={{ fontFamily: F.mono, marginRight: 10 }}>{f.trim()}</code>)}
          </div>
        </div>
      )}

      {/* Master fitment: All-Makes Kit */}
      <div style={{
        background: C.black, color: C.white, borderRadius: 8,
        padding: '26px 28px 24px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -80, top: -80, width: 260, height: 260, borderRadius: '50%', background: C.blue, opacity: 0.12 }} />
        <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>Master Fitment</span>
              <span style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.08em', background: C.blue, color: C.white, padding: '3px 8px', borderRadius: 3, textTransform: 'uppercase' }}>Recommended</span>
            </div>
            <div style={{ fontFamily: F.display, fontSize: 34, fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1 }}>
              All-Makes Kit
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 8, letterSpacing: '0.04em' }}>
              Complete wiper + washer assembly · {included} components included
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {r.amk ? (
              <>
                <div style={{
                  fontFamily: F.mono, fontSize: 22, fontWeight: 600,
                  background: C.white, color: C.black,
                  padding: '10px 18px', borderRadius: 4, letterSpacing: '0.04em',
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                }}>
                  {r.amk}
                </div>
                <SkuCopyBtn sku={r.amk} />
              </>
            ) : (
              <div style={{ fontFamily: F.mono, fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em' }}>○ KIT SKU NOT MAPPED</div>
            )}
          </div>
        </div>
      </div>

      <Panel style={{ padding: 22 }}>
        <SectionLabel right={`${included} OF 9`}>Kit Components</SectionLabel>
        <p style={{ fontSize: 12, color: C.mute, margin: '6px 0 16px', lineHeight: 1.5 }}>
          Everything below ships inside <strong style={{ color: C.body, fontWeight: 600 }}>{r.amk || 'the kit'}</strong>. Individual SKUs shown for service and replacement orders only.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
          {components.map(([l, v], i) => (
            <div key={l} style={{
              padding: '12px 14px', background: C.surface, borderRadius: 4,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
              borderLeft: `2px solid ${C.blue}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <span style={{ fontFamily: F.mono, fontSize: 10, color: C.dim, width: 18 }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.mute }}>{l}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <SkuPill sku={v} /><SkuCopyBtn sku={v} />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel style={{ padding: 22 }}>
        <SectionLabel>Mounting</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, padding: '18px 0 4px', borderTop: `1px solid ${C.line}` }}>
          <Stat label="Platform" value={r.pg} />
          <Stat label="Pivot Type" value={r.pivot} />
          <Stat label="Attachment" value={r.att} />
        </div>
      </Panel>
      <ProductCards codes={utvProductCodes(r)} />
      {r.notes && (
        <Panel style={{ padding: 22 }}>
          <SectionLabel>Fitment Notes</SectionLabel>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: C.body, margin: 0, paddingTop: 10, borderTop: `1px solid ${C.line}` }}>{r.notes}</p>
        </Panel>
      )}
    </div>
  );
}

Object.assign(window, { AutoResults, HdResults, RvResults, UtvResults, EmptyState, VehicleHeader, Stat, SkuPill, ProductCards, autoProductCodes, hdProductCodes, utvProductCodes });
