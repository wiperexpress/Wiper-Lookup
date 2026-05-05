// Wiper Express Fitment Lookup — main app
const { useState, useEffect, useMemo, useRef } = React;

// -----------------------------------------------------------------------------
// Brand tokens
// -----------------------------------------------------------------------------
const C = {
  black: '#0A0A0A',
  ink: '#1A1A1A',
  body: '#2A2A2A',
  mute: '#666666',
  dim: '#AAAAAA',
  line: '#EDEDED',
  surface: '#F7F7F7',
  white: '#FFFFFF',
  blue: '#0057FF',
  blueDark: '#003DBF',
  blueMid: '#3378FF',
  blueLight: '#E5EEFF',
};

const F = {
  display: `'Barlow Condensed', system-ui, sans-serif`,
  body: `'DM Sans', system-ui, sans-serif`,
  mono: `'DM Mono', ui-monospace, monospace`,
};

// -----------------------------------------------------------------------------
// Data access
// -----------------------------------------------------------------------------
function useData() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('data/packed.json').then(r => r.json()).then(setData);
  }, []);
  return data;
}

// -----------------------------------------------------------------------------
// Selectors per segment — derive unique options
// -----------------------------------------------------------------------------
function autoOptions(data, makeIdx, model) {
  const rows = data.auto.rows;
  const makes = new Set();
  const models = new Set();
  const years = new Set();
  for (const r of rows) {
    makes.add(r[1]);
    if (makeIdx != null && r[1] !== makeIdx) continue;
    models.add(r[2]);
    if (model != null && r[2] !== model) continue;
    years.add(r[0]);
  }
  return {
    makes: [...makes].sort((a,b)=>data.auto.makes[a].localeCompare(data.auto.makes[b])),
    models: [...models].sort(),
    years: [...years].sort((a,b)=>b-a),
  };
}

function autoFind(data, year, makeIdx, model) {
  return data.auto.rows.find(r => r[0]===year && r[1]===makeIdx && r[2]===model);
}

function hdOptions(data, typeIdx, makeIdx, model) {
  const rows = data.hd.rows;
  const types = new Set();
  const makes = new Set();
  const models = new Set();
  const years = new Set();
  for (const r of rows) {
    types.add(r[3]);
    if (typeIdx != null && r[3] !== typeIdx) continue;
    makes.add(r[1]);
    if (makeIdx != null && r[1] !== makeIdx) continue;
    models.add(r[2]);
    if (model != null && r[2] !== model) continue;
    years.add(r[0]);
  }
  return {
    types: [...types].sort((a,b)=>data.hd.types[a].localeCompare(data.hd.types[b])),
    makes: [...makes].sort((a,b)=>data.hd.makes[a].localeCompare(data.hd.makes[b])),
    models: [...models].sort(),
    years: [...years].sort((a,b)=>b-a),
  };
}
function hdFind(data, typeIdx, year, makeIdx, model) {
  return data.hd.rows.find(r => r[3]===typeIdx && r[0]===year && r[1]===makeIdx && r[2]===model);
}

function rvOptions(data, make, series) {
  const rv = data.rv || [];
  const makes = new Set();
  const serieses = new Set();
  const notes = new Set();
  for (const r of rv) {
    makes.add(r[0]);
    if (make != null && r[0] !== make) continue;
    serieses.add(r[1]);
    if (series != null && r[1] !== series) continue;
    notes.add(r[2]);
  }
  return {
    makes: [...makes].sort(),
    serieses: [...serieses].sort(),
    notes: [...notes].sort(),
  };
}
function rvFind(data, make, series, note) {
  return (data.rv || []).find(r => r[0]===make && r[1]===series && r[2]===note);
}

function utvOptions(data, make, model) {
  const years = new Set();
  const makes = new Set();
  const models = new Set();
  for (const r of data.utv) {
    makes.add(r.mk);
    if (make != null && r.mk !== make) continue;
    models.add(r.md);
    if (model != null && r.md !== model) continue;
    years.add(r.y);
  }
  return {
    years: [...years].sort((a,b)=>+b-+a),
    makes: [...makes].sort(),
    models: [...models].sort(),
  };
}
function utvFind(data, make, model, year) {
  return data.utv.find(r => r.mk===make && r.md===model && r.y===year);
}

// -----------------------------------------------------------------------------
// Top bar
// -----------------------------------------------------------------------------
function TopBar() {
  return (
    <header style={{
      background: C.black, color: C.white,
      borderBottom: `1px solid rgba(255,255,255,0.08)`,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '0 32px', height: 72, gap: 24,
      }}>
        <Logo />
        <div style={{ flex: 1 }} />
        <span style={{
          fontFamily: F.mono, fontSize: 10, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
        }}>The Wiper Experts</span>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <img
        src="assets/logo-vertical-blue-white.png"
        alt="Wiper Express"
        style={{ height: 40, display: 'block' }}
      />
      <div style={{
        height: 22, width: 1, background: 'rgba(255,255,255,0.15)',
      }} />
      <span style={{
        fontFamily: F.mono, fontSize: 10, color: 'rgba(255,255,255,0.55)',
        letterSpacing: '0.16em', textTransform: 'uppercase',
      }}>Fitment Lookup</span>
    </div>
  );
}

function MonoTag({ label, value }) {
  return (
    <div style={{
      fontFamily: F.mono, fontSize: 10,
      letterSpacing: '0.1em', textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.35)', display: 'flex', gap: 6, alignItems: 'center',
    }}>
      {label}
      <span style={{ color: 'rgba(255,255,255,0.75)' }}>{value}</span>
    </div>
  );
}

Object.assign(window, { C, F, TopBar, Logo, MonoTag, useData,
  autoOptions, autoFind, hdOptions, hdFind, rvOptions, rvFind, utvOptions, utvFind });
