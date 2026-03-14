'use client';

import React, { useState, KeyboardEvent } from 'react';

// === Shared Styles ===
export const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155',
  borderRadius: 6, color: '#e2e8f0', fontSize: 14, boxSizing: 'border-box' as const,
};

// === Layout Components ===

export function Field({ label, children, fullWidth }: { label: string; children: React.ReactNode; fullWidth?: boolean }) {
  return (
    <div style={{ marginBottom: 16, ...(fullWidth ? { gridColumn: '1 / -1' } : {}) }}>
      <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 4, fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}

export function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0 16px' }}>
      {children}
    </div>
  );
}

export function Section({ title, children, defaultOpen = true, color = '#c084fc' }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean; color?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: '#1e293b', borderRadius: 10, border: '1px solid #334155', marginBottom: 20, overflow: 'hidden' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ padding: '14px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}
      >
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color }}>{title}</h3>
        <span style={{ color: '#64748b', fontSize: 20, fontWeight: 300, lineHeight: 1 }}>{open ? '\u2212' : '+'}</span>
      </div>
      {open && <div style={{ padding: '0 20px 20px' }}>{children}</div>}
    </div>
  );
}

// === Single-Select Dropdown ===

type Option = { value: string; label: string };

export function SingleSelect({ value, onChange, options, placeholder = 'Select...' }: {
  value: string | null | undefined;
  onChange: (val: string | null) => void;
  options: Option[];
  placeholder?: string;
}) {
  return (
    <select style={inputStyle} value={value || ''} onChange={e => onChange(e.target.value || null)}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// === Multi-Select Chips (checkbox group) ===

export function MultiSelectChips({ values, onChange, options, maxSelect }: {
  values: string[];
  onChange: (vals: string[]) => void;
  options: Option[];
  maxSelect?: number;
}) {
  const vals = values || [];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map(o => {
        const sel = vals.includes(o.value);
        const disabled = !sel && maxSelect !== undefined && vals.length >= maxSelect;
        return (
          <button
            key={o.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(sel ? vals.filter(v => v !== o.value) : [...vals, o.value])}
            style={{
              padding: '5px 12px', borderRadius: 16, fontSize: 12, cursor: disabled ? 'not-allowed' : 'pointer',
              border: sel ? '1px solid #7c3aed' : '1px solid #475569',
              background: sel ? '#7c3aed22' : 'transparent',
              color: sel ? '#c4b5fd' : disabled ? '#475569' : '#94a3b8',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            {sel ? '\u2713 ' : ''}{o.label}
          </button>
        );
      })}
    </div>
  );
}

// === Tri-State Toggle (Yes / No / Unknown) ===

export function TriStateToggle({ value, onChange }: {
  value: boolean | null | undefined;
  onChange: (val: boolean | null) => void;
}) {
  const states: { val: boolean | null; label: string; color: string }[] = [
    { val: true, label: 'Yes', color: '#22c55e' },
    { val: false, label: 'No', color: '#ef4444' },
    { val: null, label: 'Unknown', color: '#64748b' },
  ];
  return (
    <div style={{ display: 'flex', gap: 0, borderRadius: 6, overflow: 'hidden', border: '1px solid #334155' }}>
      {states.map((s, i) => {
        const active = value === s.val;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(s.val)}
            style={{
              flex: 1, padding: '6px 0', fontSize: 12, cursor: 'pointer',
              border: 'none', borderRight: i < 2 ? '1px solid #334155' : 'none',
              background: active ? s.color + '22' : '#0f172a',
              color: active ? s.color : '#64748b',
              fontWeight: active ? 600 : 400,
            }}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

// === Toggle (simple boolean) ===

export function Toggle({ value, onChange }: {
  value: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div
      onClick={() => onChange(!value)}
      role="checkbox"
      aria-checked={value}
      style={{
        width: 40, height: 22, borderRadius: 11, cursor: 'pointer',
        background: value ? '#7c3aed' : '#334155',
        position: 'relative', transition: 'background 0.2s',
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: 9, background: '#e2e8f0',
        position: 'absolute', top: 2, left: value ? 20 : 2, transition: 'left 0.2s',
      }} />
    </div>
  );
}

// === Tag/Chip Input (free text) ===

export function TagChipInput({ values, onChange, suggestions, placeholder = 'Type and press Enter...' }: {
  values: string[];
  onChange: (vals: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}) {
  const [input, setInput] = useState('');
  const vals = values || [];

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !vals.includes(t)) onChange([...vals, t]);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag(input); }
  };

  const unused = (suggestions || []).filter(s => !vals.includes(s));

  return (
    <div>
      {vals.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
          {vals.map((v, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', background: '#334155', borderRadius: 14, fontSize: 12, color: '#e2e8f0' }}>
              {v}
              <button type="button" onClick={() => onChange(vals.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>&times;</button>
            </span>
          ))}
        </div>
      )}
      <input style={inputStyle} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} />
      {unused.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
          {unused.slice(0, 10).map(s => (
            <button key={s} type="button" onClick={() => addTag(s)} style={{ padding: '2px 8px', borderRadius: 12, border: '1px dashed #475569', background: 'transparent', color: '#64748b', fontSize: 11, cursor: 'pointer' }}>
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// === Number Input with optional prefix/suffix ===

export function NumberInput({ value, onChange, prefix, suffix, min, max, step, placeholder }: {
  value: number | null | undefined;
  onChange: (val: number | null) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}) {
  const hasPrefix = !!prefix;
  const hasSuffix = !!suffix;
  return (
    <div style={{ display: 'flex', alignItems: 'stretch' }}>
      {hasPrefix && (
        <span style={{ display: 'flex', alignItems: 'center', padding: '0 10px', background: '#1e293b', border: '1px solid #334155', borderRight: 'none', borderRadius: '6px 0 0 6px', color: '#64748b', fontSize: 13, whiteSpace: 'nowrap' }}>
          {prefix}
        </span>
      )}
      <input
        style={{
          ...inputStyle,
          borderRadius: hasPrefix && hasSuffix ? 0 : hasPrefix ? '0 6px 6px 0' : hasSuffix ? '6px 0 0 6px' : 6,
        }}
        type="number"
        value={value ?? ''}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value !== '' ? Number(e.target.value) : null)}
      />
      {hasSuffix && (
        <span style={{ display: 'flex', alignItems: 'center', padding: '0 10px', background: '#1e293b', border: '1px solid #334155', borderLeft: 'none', borderRadius: '0 6px 6px 0', color: '#64748b', fontSize: 13, whiteSpace: 'nowrap' }}>
          {suffix}
        </span>
      )}
    </div>
  );
}

// === Radio Group with colored badges ===

export function RadioGroup({ value, onChange, options }: {
  value: string | null | undefined;
  onChange: (val: string) => void;
  options: (Option & { color?: string })[];
}) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map(o => {
        const active = value === o.value;
        const c = o.color || '#7c3aed';
        return (
          <label key={o.value} onClick={() => onChange(o.value)} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '5px 14px', borderRadius: 6, border: active ? `1px solid ${c}` : '1px solid #334155', background: active ? c + '22' : 'transparent' }}>
            <div style={{ width: 14, height: 14, borderRadius: 7, border: `2px solid ${active ? c : '#475569'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {active && <div style={{ width: 6, height: 6, borderRadius: 3, background: c }} />}
            </div>
            <span style={{ fontSize: 13, color: active ? '#e2e8f0' : '#94a3b8' }}>{o.label}</span>
          </label>
        );
      })}
    </div>
  );
}

// === URL Input ===

export function UrlInput({ value, onChange, placeholder = 'https://...' }: {
  value: string | null | undefined;
  onChange: (val: string | null) => void;
  placeholder?: string;
}) {
  const v = value || '';
  const valid = !v || /^https?:\/\/.+/.test(v);
  return (
    <input
      style={{ ...inputStyle, borderColor: v && !valid ? '#ef4444' : '#334155' }}
      type="url"
      value={v}
      onChange={e => onChange(e.target.value || null)}
      placeholder={placeholder}
    />
  );
}

// === Email Input ===

export function EmailInput({ value, onChange, placeholder = 'email@example.com' }: {
  value: string | null | undefined;
  onChange: (val: string | null) => void;
  placeholder?: string;
}) {
  const v = value || '';
  const valid = !v || /@/.test(v);
  return (
    <input
      style={{ ...inputStyle, borderColor: v && !valid ? '#ef4444' : '#334155' }}
      type="email"
      value={v}
      onChange={e => onChange(e.target.value || null)}
      placeholder={placeholder}
    />
  );
}
