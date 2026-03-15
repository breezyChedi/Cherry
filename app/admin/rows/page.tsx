'use client';

import { useEffect, useState, useRef } from 'react';
import { inputStyle, Section } from '@/app/admin/components/FormControls';

// === Types ===

interface Row {
  id: string;
  label: string;
  sortOrder: number;
  institutions?: string[];
  bursaries?: string[];
}

interface ExploreConfig {
  version: string;
  lastUpdated: string;
  categories: Row[];
  bursaryCategories: Row[];
}

type TabType = 'institutions' | 'bursaries';

// === Helpers ===

function toKebab(label: string, prefix?: string): string {
  const slug = label.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return prefix ? `${prefix}-${slug}` : slug;
}

// === Autocomplete Component ===

function NameAutocomplete({ names, selected, onAdd, placeholder }: {
  names: string[];
  selected: string[];
  onAdd: (name: string) => void;
  placeholder: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const selectedLower = new Set(selected.map(n => n.toLowerCase()));
  const filtered = query.trim()
    ? names.filter(n => !selectedLower.has(n.toLowerCase()) && n.toLowerCase().includes(query.toLowerCase())).slice(0, 15)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setHighlightIdx(0); }, [query]);

  const pick = (name: string) => {
    onAdd(name);
    setQuery('');
    setOpen(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIdx(i => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && filtered[highlightIdx]) { e.preventDefault(); pick(filtered[highlightIdx]); }
    else if (e.key === 'Escape') { setOpen(false); }
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        style={{ ...inputStyle, width: '100%' }}
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => { if (query.trim()) setOpen(true); }}
        onKeyDown={handleKey}
        placeholder={placeholder}
      />
      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: 220, overflowY: 'auto',
          background: '#1e293b', border: '1px solid #475569', borderRadius: '0 0 6px 6px', zIndex: 20,
        }}>
          {filtered.map((name, i) => (
            <div
              key={name}
              onClick={() => pick(name)}
              onMouseEnter={() => setHighlightIdx(i)}
              style={{
                padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: '#e2e8f0',
                background: i === highlightIdx ? '#334155' : 'transparent',
              }}
            >
              {name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// === Name Chip ===

function NameChip({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px',
      background: '#334155', color: '#e2e8f0', borderRadius: 4, fontSize: 12,
    }}>
      {name}
      <button onClick={onRemove} style={{
        background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 14,
        padding: 0, lineHeight: 1,
      }}>&times;</button>
    </span>
  );
}

// === Row Card ===

function RowCard({ row, tab, allNames, index, total, onUpdate, onDelete, onMoveUp, onMoveDown }: {
  row: Row;
  tab: TabType;
  allNames: string[];
  index: number;
  total: number;
  onUpdate: (updated: Row) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const names = tab === 'institutions' ? (row.institutions || []) : (row.bursaries || []);
  const nameKey = tab === 'institutions' ? 'institutions' : 'bursaries';
  const prefix = tab === 'bursaries' ? 'burs' : undefined;

  const setLabel = (label: string) => {
    onUpdate({ ...row, label, id: toKebab(label, prefix) });
  };

  const addName = (name: string) => {
    onUpdate({ ...row, [nameKey]: [...names, name] });
  };

  const removeName = (idx: number) => {
    onUpdate({ ...row, [nameKey]: names.filter((_, i) => i !== idx) });
  };

  return (
    <div style={{
      background: '#1e293b', borderRadius: 8, padding: 16, marginBottom: 12,
      border: '1px solid #334155',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          {/* Reorder buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <button onClick={onMoveUp} disabled={index === 0} style={{
              background: index === 0 ? '#1e293b' : '#334155', color: index === 0 ? '#475569' : '#94a3b8',
              border: 'none', borderRadius: 3, padding: '2px 6px', cursor: index === 0 ? 'default' : 'pointer', fontSize: 11,
            }}>&#9650;</button>
            <button onClick={onMoveDown} disabled={index === total - 1} style={{
              background: index === total - 1 ? '#1e293b' : '#334155', color: index === total - 1 ? '#475569' : '#94a3b8',
              border: 'none', borderRadius: 3, padding: '2px 6px', cursor: index === total - 1 ? 'default' : 'pointer', fontSize: 11,
            }}>&#9660;</button>
          </div>

          {/* Label + ID */}
          <div style={{ flex: 1 }}>
            <input
              style={{ ...inputStyle, fontWeight: 600, fontSize: 14, marginBottom: 4, width: '100%' }}
              value={row.label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Row label — e.g. Western Cape"
            />
            <div style={{ color: '#64748b', fontSize: 11 }}>
              id: <span style={{ color: '#94a3b8' }}>{row.id || '—'}</span>
              <span style={{ marginLeft: 12 }}>#{index + 1}</span>
              <span style={{ marginLeft: 12 }}>{names.length} item{names.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        <button onClick={onDelete} style={{
          background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: 4,
          padding: '4px 10px', cursor: 'pointer', fontSize: 12,
        }}>Remove</button>
      </div>

      {/* Name chips */}
      {names.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {names.map((name, i) => (
            <NameChip key={`${name}-${i}`} name={name} onRemove={() => removeName(i)} />
          ))}
        </div>
      )}

      {/* Autocomplete */}
      <NameAutocomplete
        names={allNames}
        selected={names}
        onAdd={addName}
        placeholder={tab === 'institutions' ? 'Search institutions to add...' : 'Search bursaries to add...'}
      />
    </div>
  );
}

// === Main Page ===

export default function RowsPage() {
  const [config, setConfig] = useState<ExploreConfig | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('institutions');
  const [institutionNames, setInstitutionNames] = useState<string[]>([]);
  const [bursaryNames, setBursaryNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Load data on mount
  useEffect(() => {
    Promise.all([
      fetch('/api/admin/rows', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/admin/rows/names?type=institutions', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/admin/rows/names?type=bursaries', { credentials: 'include' }).then(r => r.json()),
    ])
      .then(([cfg, instNames, bursNames]) => {
        setConfig(cfg);
        setInstitutionNames(Array.isArray(instNames) ? instNames : []);
        setBursaryNames(Array.isArray(bursNames) ? bursNames : []);
      })
      .catch(err => setMessage('Failed to load: ' + err.message))
      .finally(() => setLoading(false));
  }, []);

  // Current rows for active tab
  const rows = config
    ? (activeTab === 'institutions' ? config.categories : config.bursaryCategories)
    : [];
  const allNames = activeTab === 'institutions' ? institutionNames : bursaryNames;

  const setRows = (newRows: Row[]) => {
    if (!config) return;
    if (activeTab === 'institutions') {
      setConfig({ ...config, categories: newRows });
    } else {
      setConfig({ ...config, bursaryCategories: newRows });
    }
  };

  const updateRow = (index: number, updated: Row) => {
    const copy = [...rows];
    copy[index] = updated;
    setRows(copy);
  };

  const deleteRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const moveRow = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const copy = [...rows];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    setRows(copy);
  };

  const addRow = () => {
    const prefix = activeTab === 'bursaries' ? 'burs' : undefined;
    const nameKey = activeTab === 'institutions' ? 'institutions' : 'bursaries';
    setRows([...rows, { id: toKebab('new-row', prefix), label: '', sortOrder: rows.length + 1, [nameKey]: [] }]);
  };

  // Validation
  const validate = (): string[] => {
    if (!config) return ['No config loaded'];
    const errors: string[] = [];

    const check = (list: Row[], type: string) => {
      const ids = new Set<string>();
      list.forEach((row, i) => {
        if (!row.label.trim()) errors.push(`${type} row ${i + 1}: label is empty`);
        if (!row.id.trim()) errors.push(`${type} row ${i + 1}: id is empty (add a label)`);
        if (row.id === 'all') errors.push(`${type} row ${i + 1}: id "all" is reserved`);
        if (ids.has(row.id)) errors.push(`${type}: duplicate id "${row.id}"`);
        ids.add(row.id);
      });
    };

    check(config.categories, 'Institution');
    check(config.bursaryCategories, 'Bursary');
    return errors;
  };

  const handleSave = async () => {
    if (!config) return;
    const errors = validate();
    if (errors.length > 0) {
      setMessage('Validation errors:\n' + errors.join('\n'));
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/rows', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
        credentials: 'include',
      });
      if (res.ok) {
        setMessage('Saved successfully!');
      } else {
        const data = await res.json();
        setMessage('Error: ' + (data.error || 'Save failed'));
      }
    } catch (e) {
      setMessage('Error: ' + (e instanceof Error ? e.message : 'Unknown'));
    }
    setSaving(false);
  };

  if (loading) {
    return <div style={{ padding: 40, color: '#94a3b8' }}>Loading rows config...</div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, color: '#e2e8f0' }}>Explore Rows</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>
            Manage the rows shown on the mobile app&apos;s explore screen
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} style={{
          padding: '10px 24px', background: '#2563eb', color: 'white', border: 'none',
          borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600,
          opacity: saving ? 0.6 : 1,
        }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 13, whiteSpace: 'pre-wrap',
          background: message.startsWith('Error') || message.startsWith('Validation') ? '#7f1d1d' : '#14532d',
          color: message.startsWith('Error') || message.startsWith('Validation') ? '#fca5a5' : '#86efac',
        }}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid #334155' }}>
        {(['institutions', 'bursaries'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer',
              background: 'transparent', border: 'none',
              color: activeTab === tab ? '#e2e8f0' : '#64748b',
              borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
            }}
          >
            {tab === 'institutions' ? `Institution Rows (${config?.categories.length || 0})` : `Bursary Rows (${config?.bursaryCategories.length || 0})`}
          </button>
        ))}
      </div>

      {/* Row list */}
      <Section title={activeTab === 'institutions' ? 'Institution Rows' : 'Bursary Rows'} defaultOpen={true} color={activeTab === 'institutions' ? '#38bdf8' : '#a78bfa'}>
        {rows.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
            No rows yet. Click &quot;Add Row&quot; to create one.
          </div>
        )}
        {rows.map((row, i) => (
          <RowCard
            key={`${activeTab}-${i}`}
            row={row}
            tab={activeTab}
            allNames={allNames}
            index={i}
            total={rows.length}
            onUpdate={updated => updateRow(i, updated)}
            onDelete={() => deleteRow(i)}
            onMoveUp={() => moveRow(i, -1)}
            onMoveDown={() => moveRow(i, 1)}
          />
        ))}
        <button onClick={addRow} style={{
          padding: '8px 16px', background: '#334155', color: '#94a3b8', border: 'none',
          borderRadius: 6, cursor: 'pointer', fontSize: 13, marginTop: 4,
        }}>
          + Add Row
        </button>
      </Section>

      {/* Config info */}
      {config && (
        <div style={{ marginTop: 20, padding: 12, background: '#0f172a', borderRadius: 6, color: '#475569', fontSize: 11 }}>
          Version: {config.version} &nbsp;|&nbsp; Last updated: {config.lastUpdated ? new Date(config.lastUpdated).toLocaleString() : 'never'}
        </div>
      )}
    </div>
  );
}
