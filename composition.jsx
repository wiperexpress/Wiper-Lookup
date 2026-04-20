// Main composition — selector + results

function App() {
  const data = useData();
  const [segment, setSegment] = React.useState(() => localStorage.getItem('wx_seg') || 'auto');
  React.useEffect(() => { localStorage.setItem('wx_seg', segment); }, [segment]);

  const [tweaksOn, setTweaksOn] = React.useState(false);
  const [tweaks, setTweaks] = React.useState(window.TWEAK_DEFAULTS || {});

  React.useEffect(() => {
    const h = (e) => {
      if (e.data?.type === '__activate_edit_mode') setTweaksOn(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweaksOn(false);
    };
    window.addEventListener('message', h);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', h);
  }, []);

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', background: C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontSize: 11, letterSpacing: '0.14em', color: C.dim, textTransform: 'uppercase' }}>
        Loading fitment database…
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.surface, fontFamily: F.body, color: C.ink }}>
      <TopBar segment={segment} onSegment={setSegment} />
      <div style={{ display: 'flex', maxWidth: 1440, margin: '0 auto', padding: '32px', gap: 28, alignItems: 'flex-start' }}>
        <div style={{ width: 340, flexShrink: 0, position: 'sticky', top: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Selector data={data} segment={segment} tweaks={tweaks} />
          <CoverageCard data={data} segment={segment} />
          <HelpCard />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <ResultsForSegment data={data} segment={segment} />
        </div>
      </div>
      {tweaksOn && <TweakPanel tweaks={tweaks} setTweaks={setTweaks} />}
    </div>
  );
}

function ResultsForSegment({ data, segment }) {
  const [sel, setSel] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('wx_sel_' + segment)) || {}; } catch { return {}; }
  });
  React.useEffect(() => {
    try { setSel(JSON.parse(localStorage.getItem('wx_sel_' + segment)) || {}); } catch { setSel({}); }
  }, [segment]);

  // Subscribe to selector changes via a simple custom event
  React.useEffect(() => {
    const h = (e) => { if (e.detail.segment === segment) setSel(e.detail.sel); };
    window.addEventListener('wx:select', h);
    return () => window.removeEventListener('wx:select', h);
  }, [segment]);

  if (segment === 'auto') {
    const row = (sel.year != null && sel.make != null && sel.model != null) ? autoFind(data, sel.year, sel.make, sel.model) : null;
    return <AutoResults data={data} row={row} />;
  }
  if (segment === 'hd') {
    const row = (sel.type != null && sel.year != null && sel.make != null && sel.model != null) ? hdFind(data, sel.type, sel.year, sel.make, sel.model) : null;
    return <HdResults data={data} row={row} />;
  }
  if (segment === 'rv') {
    const row = (sel.make != null && sel.series != null && sel.note != null) ? rvFind(data, sel.make, sel.series, sel.note) : null;
    return <RvResults data={data} row={row} />;
  }
  if (segment === 'utv') {
    const row = (sel.make != null && sel.model != null && sel.year != null) ? utvFind(data, sel.make, sel.model, sel.year) : null;
    return <UtvResults data={data} row={row} />;
  }
  return null;
}

function Selector({ data, segment, tweaks }) {
  const [sel, setSel] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('wx_sel_' + segment)) || {}; } catch { return {}; }
  });
  React.useEffect(() => {
    try { setSel(JSON.parse(localStorage.getItem('wx_sel_' + segment)) || {}); } catch { setSel({}); }
  }, [segment]);
  React.useEffect(() => {
    localStorage.setItem('wx_sel_' + segment, JSON.stringify(sel));
    window.dispatchEvent(new CustomEvent('wx:select', { detail: { segment, sel } }));
  }, [sel, segment]);

  const update = (patch) => setSel(s => ({ ...s, ...patch }));
  const reset = () => setSel({});

  return (
    <div style={{
      background: C.white, border: `1px solid ${C.line}`, borderRadius: 8,
      padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.dim, marginBottom: 4 }}>01 · Vehicle</div>
          <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, letterSpacing: '0.02em' }}>{{ auto: 'Find by YMM', hd: 'Heavy-Duty YMM', rv: 'RV Coach', utv: 'UTV Platform' }[segment]}</div>
        </div>
        <button onClick={reset} style={{
          border: `1px solid ${C.line}`, background: 'transparent', cursor: 'pointer',
          padding: '6px 10px', borderRadius: 4, fontFamily: F.mono, fontSize: 10,
          letterSpacing: '0.1em', textTransform: 'uppercase', color: C.mute,
        }}>Reset</button>
      </div>

      {segment === 'auto' && <AutoSelector data={data} sel={sel} update={update} />}
      {segment === 'hd' && <HdSelector data={data} sel={sel} update={update} />}
      {segment === 'rv' && <RvSelector data={data} sel={sel} update={update} />}
      {segment === 'utv' && <UtvSelector data={data} sel={sel} update={update} />}

      <div style={{ height: 1, background: C.line, margin: '4px 0' }} />
      <StepIndicator sel={sel} segment={segment} />
    </div>
  );
}

function StepIndicator({ sel, segment }) {
  const steps = segment === 'rv'
    ? [{ k: 'make', l: 'Make' }, { k: 'series', l: 'Series' }, { k: 'note', l: 'Variant' }]
    : [{ k: 'year', l: 'Year' }, { k: 'make', l: 'Make' }, { k: 'model', l: 'Model' }];
  const done = steps.filter(s => sel[s.k] != null).length;
  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {steps.map((s, i) => (
          <div key={s.k} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < done ? C.blue : C.line, transition: 'background .2s',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.dim }}>
        <span>Step {Math.min(done + 1, steps.length)} of {steps.length}</span>
        <span style={{ color: done === steps.length ? C.blue : C.dim }}>{done === steps.length ? '● Match Found' : `${done}/${steps.length} Complete`}</span>
      </div>
    </div>
  );
}

function AutoSelector({ data, sel, update }) {
  const { makes } = autoOptions(data, null, null);
  const { models } = autoOptions(data, sel.make, null);
  const { years } = autoOptions(data, sel.make, sel.model);
  return (
    <>
      <Combo label="Make" placeholder="Select make" value={sel.make} options={makes}
        formatOption={(i) => data.auto.makes[i]}
        onChange={v => update({ make: v, model: null, year: null })}
        badge={makes.length ? `${makes.length} MAKES` : null} />
      <Combo label="Model" placeholder="Select model" value={sel.model} options={models}
        disabled={sel.make == null}
        onChange={v => update({ model: v, year: null })}
        badge={models.length ? `${models.length} MODELS` : null} />
      <Combo label="Year" placeholder="Select year" value={sel.year} options={years}
        disabled={sel.model == null}
        onChange={v => update({ year: v })} />
    </>
  );
}

function HdSelector({ data, sel, update }) {
  const { types } = hdOptions(data, null, null, null);
  const { makes } = hdOptions(data, sel.type, null, null);
  const { models } = hdOptions(data, sel.type, sel.make, null);
  const { years } = hdOptions(data, sel.type, sel.make, sel.model);
  return (
    <>
      <Combo label="Vehicle Type" placeholder="Select type" value={sel.type} options={types}
        formatOption={(i) => data.hd.types[i]}
        onChange={v => update({ type: v, make: null, model: null, year: null })}
        badge={types.length ? `${types.length} TYPES` : null} />
      <Combo label="Make" placeholder="Select make" value={sel.make} options={makes}
        disabled={sel.type == null}
        formatOption={(i) => data.hd.makes[i]}
        onChange={v => update({ make: v, model: null, year: null })}
        badge={makes.length ? `${makes.length} MAKES` : null} />
      <Combo label="Model" placeholder="Select model" value={sel.model} options={models}
        disabled={sel.make == null}
        onChange={v => update({ model: v, year: null })}
        badge={models.length ? `${models.length} MODELS` : null} />
      <Combo label="Year" placeholder="Select year" value={sel.year} options={years}
        disabled={sel.model == null}
        onChange={v => update({ year: v })} />
    </>
  );
}

function RvSelector({ data, sel, update }) {
  const { makes } = rvOptions(data, null, null);
  const { serieses } = rvOptions(data, sel.make, null);
  const { notes } = rvOptions(data, sel.make, sel.series);
  return (
    <>
      <Combo label="Make" placeholder="Select make" value={sel.make} options={makes}
        onChange={v => update({ make: v, series: null, note: null })} />
      <Combo label="Model Series" placeholder="Select series" value={sel.series} options={serieses}
        disabled={sel.make == null}
        onChange={v => update({ series: v, note: null })} />
      <Combo label="Variant / Year Range" placeholder="Select variant" value={sel.note} options={notes}
        disabled={sel.series == null}
        onChange={v => update({ note: v })} />
    </>
  );
}

function UtvSelector({ data, sel, update }) {
  const { makes } = utvOptions(data, null, null);
  const { models } = utvOptions(data, sel.make, null);
  const { years } = utvOptions(data, sel.make, sel.model);
  return (
    <>
      <Combo label="Make" placeholder="Select make" value={sel.make} options={makes} onChange={v => update({ make: v, model: null, year: null })} badge={makes.length ? `${makes.length} MAKES` : null} />
      <Combo label="Model" placeholder="Select model" value={sel.model} options={models} disabled={sel.make == null} onChange={v => update({ model: v, year: null })} badge={models.length ? `${models.length} MODELS` : null} />
      <Combo label="Year" placeholder="Select year" value={sel.year} options={years} disabled={sel.model == null} onChange={v => update({ year: v })} />
    </>
  );
}

function CoverageCard({ data, segment }) {
  const stats = {
    auto: { n: data.auto.rows.length, mk: data.auto.makes.length, label: 'AUTO', sub: 'Passenger + Light Truck' },
    hd: { n: data.hd.rows.length, mk: data.hd.makes.length, label: 'HD', sub: 'Transit + Motorcoach' },
    rv: { n: 0, mk: 0, label: 'RV', sub: 'Motorhome + Coach' },
    utv: { n: data.utv.length, mk: new Set(data.utv.map(r=>r.mk)).size, label: 'UTV', sub: 'Side-by-Side' },
  }[segment];
  return (
    <div style={{ background: C.black, color: C.white, borderRadius: 8, padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: '50%', background: C.blue, opacity: 0.1 }} />
      <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
        Coverage · {stats.label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 6, position: 'relative' }}>
        <span style={{ fontFamily: F.display, fontSize: 34, fontWeight: 700, letterSpacing: '0.01em' }}>{stats.n.toLocaleString()}</span>
        <span style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Fitments</span>
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 300, position: 'relative' }}>
        {stats.mk} makes · {stats.sub}
      </div>
    </div>
  );
}

function HelpCard() {
  return (
    <div style={{ padding: 16, border: `1px dashed ${C.line}`, borderRadius: 8 }}>
      <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.dim, marginBottom: 8 }}>Tips</div>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: C.mute, lineHeight: 1.8 }}>
        <li>Type in any dropdown to search</li>
        <li>Click a SKU to open its Shopify product page</li>
        <li>Click <code style={{ fontFamily: F.mono, fontSize: 11, color: C.blue }}>⧉</code> to copy a SKU</li>
        <li>Dashed pill = SKU not yet mapped (search fallback)</li>
        <li>Selections persist per segment</li>
      </ul>
    </div>
  );
}

function TweakPanel({ tweaks, setTweaks }) {
  const apply = (k, v) => {
    const next = { ...tweaks, [k]: v };
    setTweaks(next);
    // Keep live window.TWEAK_DEFAULTS in sync so helpers (e.g. shopifyUrlFor) read fresh values
    if (window.TWEAK_DEFAULTS) window.TWEAK_DEFAULTS[k] = v;
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*');
  };
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, width: 300,
      background: C.white, border: `1px solid ${C.line}`, borderRadius: 8,
      boxShadow: '0 24px 48px rgba(0,0,0,0.12)', padding: 20, zIndex: 100,
      maxHeight: 'calc(100vh - 48px)', overflowY: 'auto',
    }}>
      <div style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Tweaks</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.mute, display: 'block', marginBottom: 6 }}>Recommended badge</label>
          <div style={{ display: 'flex', gap: 4 }}>
            {['on','off'].map(v => (
              <button key={v} onClick={() => apply('showRecommended', v === 'on')}
                style={{ flex: 1, padding: '8px 10px', border: `1px solid ${tweaks.showRecommended === (v==='on') ? C.black : C.line}`, background: tweaks.showRecommended === (v==='on') ? C.black : C.white, color: tweaks.showRecommended === (v==='on') ? C.white : C.ink, cursor: 'pointer', fontFamily: F.mono, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 4 }}>{v}</button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.mute, display: 'block', marginBottom: 6 }}>Accent color</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              ['#0057FF', 'Blue'],
              ['#E63946', 'Red'],
              ['#166534', 'Green'],
              ['#0A0A0A', 'Black'],
            ].map(([v, l]) => (
              <button key={v} onClick={() => { apply('accent', v); document.documentElement.style.setProperty('--accent', v); }}
                title={l}
                style={{ width: 32, height: 32, border: tweaks.accent === v ? `2px solid ${C.black}` : `1px solid ${C.line}`, background: v, borderRadius: 4, cursor: 'pointer' }} />
            ))}
          </div>
        </div>
        <div>
          <label style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.mute, display: 'block', marginBottom: 6 }}>Density</label>
          <div style={{ display: 'flex', gap: 4 }}>
            {['compact','regular','comfortable'].map(v => (
              <button key={v} onClick={() => apply('density', v)}
                style={{ flex: 1, padding: '8px 6px', border: `1px solid ${tweaks.density === v ? C.black : C.line}`, background: tweaks.density === v ? C.black : C.white, color: tweaks.density === v ? C.white : C.ink, cursor: 'pointer', fontFamily: F.mono, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 4 }}>{v}</button>
            ))}
          </div>
        </div>

        {/* Shopify section */}
        <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 14, marginTop: 2 }}>
          <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.ink, marginBottom: 10, fontWeight: 600 }}>Shopify Links</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.mute, display: 'block', marginBottom: 6 }}>SKU Links</label>
              <div style={{ display: 'flex', gap: 4 }}>
                {['on','off'].map(v => (
                  <button key={v} onClick={() => apply('shopifyLinksEnabled', v === 'on')}
                    style={{ flex: 1, padding: '8px 10px', border: `1px solid ${tweaks.shopifyLinksEnabled === (v==='on') ? C.black : C.line}`, background: tweaks.shopifyLinksEnabled === (v==='on') ? C.black : C.white, color: tweaks.shopifyLinksEnabled === (v==='on') ? C.white : C.ink, cursor: 'pointer', fontFamily: F.mono, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 4 }}>{v}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.mute, display: 'block', marginBottom: 6 }}>Storefront Domain</label>
              <input
                type="text"
                value={tweaks.shopifyDomain || ''}
                onChange={(e) => apply('shopifyDomain', e.target.value)}
                placeholder="autotexwipers.com"
                style={{
                  width: '100%', padding: '8px 10px',
                  border: `1px solid ${C.line}`, borderRadius: 4,
                  fontFamily: F.mono, fontSize: 11,
                  color: C.ink, background: C.surface,
                }}
              />
            </div>
            <SkuMapStatus />
            <div style={{ fontSize: 10, color: C.dim, lineHeight: 1.5, fontFamily: F.body }}>
              Edit <code style={{ fontFamily: F.mono, color: C.blueDark }}>data/shopify-skus.json</code> to map SKUs to product handles. Unmapped SKUs fall back to site search.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkuMapStatus() {
  const [count, setCount] = React.useState(Object.keys(window.__SKU_MAP || {}).length);
  React.useEffect(() => {
    const h = () => setCount(Object.keys(window.__SKU_MAP || {}).length);
    window.addEventListener('sku-map-loaded', h);
    return () => window.removeEventListener('sku-map-loaded', h);
  }, []);
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 10px', background: C.surface, borderRadius: 4,
      fontFamily: F.mono, fontSize: 10, letterSpacing: '0.04em',
    }}>
      <span style={{ color: C.mute, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mapped SKUs</span>
      <span style={{ color: C.blueDark, fontWeight: 600 }}>{count}</span>
    </div>
  );
}

Object.assign(window, { App, Selector, ResultsForSegment });
