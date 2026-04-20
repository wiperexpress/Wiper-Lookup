// Selector column — Year / Make / Model pickers
const { useState: uS1, useMemo: uM1, useRef: uR1, useEffect: uE1 } = React;

function Panel({ children, style }) {
  return (
    <div style={{
      background: C.white, border: `1px solid ${C.line}`, borderRadius: 8,
      ...style,
    }}>{children}</div>
  );
}

function SectionLabel({ children, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontFamily: F.mono, fontSize: 10, letterSpacing: '0.14em',
      textTransform: 'uppercase', color: C.dim, marginBottom: 10,
    }}>
      <span>{children}</span>
      {right && <span style={{ color: C.mute }}>{right}</span>}
    </div>
  );
}

// Searchable combo-box
function Combo({ label, value, options, onChange, placeholder, disabled, badge, formatOption }) {
  const [open, setOpen] = uS1(false);
  const [q, setQ] = uS1('');
  const ref = uR1();
  uE1(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const filtered = uM1(() => {
    if (!q) return options;
    const qq = q.toLowerCase();
    return options.filter(o => String(formatOption ? formatOption(o) : o).toLowerCase().includes(qq));
  }, [q, options]);
  const display = value == null ? '' : (formatOption ? formatOption(value) : String(value));
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{
        fontFamily: F.mono, fontSize: 10, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: C.dim, marginBottom: 6,
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>{label}</span>
        {badge && <span style={{ color: C.blue }}>{badge}</span>}
      </div>
      <button
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        style={{
          width: '100%', height: 44, padding: '0 14px',
          background: disabled ? C.surface : C.white,
          border: `1px solid ${open ? C.black : C.line}`,
          borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: F.body, fontSize: 14, color: disabled ? C.dim : (value == null ? C.dim : C.ink),
          textAlign: 'left', transition: 'border-color .12s',
        }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {display || placeholder}
        </span>
        <svg width="10" height="6" style={{ marginLeft: 8, opacity: disabled ? 0.3 : 0.6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>
          <path d="M1 1 L5 5 L9 1" stroke="currentColor" fill="none" strokeWidth="1.5"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50,
          background: C.white, border: `1px solid ${C.line}`, borderRadius: 6,
          boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
          maxHeight: 340, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ padding: 8, borderBottom: `1px solid ${C.line}` }}>
            <input
              autoFocus value={q} onChange={e => setQ(e.target.value)}
              placeholder={`Search ${options.length}...`}
              style={{
                width: '100%', height: 32, padding: '0 10px',
                border: `1px solid ${C.line}`, borderRadius: 4,
                fontFamily: F.body, fontSize: 13, outline: 'none',
              }}
            />
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 && (
              <div style={{ padding: '14px 16px', fontSize: 12, color: C.dim, fontFamily: F.mono }}>
                NO MATCHES
              </div>
            )}
            {filtered.map((o, i) => (
              <button key={i}
                onClick={() => { onChange(o); setOpen(false); setQ(''); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '10px 14px', border: 'none', background: value === o ? C.blueLight : 'transparent',
                  cursor: 'pointer', fontFamily: F.body, fontSize: 13,
                  color: value === o ? C.blueDark : C.ink,
                  borderBottom: `1px solid ${C.surface}`,
                }}
                onMouseEnter={e => { if (value !== o) e.currentTarget.style.background = C.surface; }}
                onMouseLeave={e => { if (value !== o) e.currentTarget.style.background = 'transparent'; }}
              >{formatOption ? formatOption(o) : o}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Panel, SectionLabel, Combo });
