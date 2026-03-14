'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface College {
  nodeId: number; name: string; isCollege: boolean; logoUrl: string;
  institutionType: string; publicOrPrivate: string; facCount: number; degCount: number;
}

export default function CollegesListPage() {
  const router = useRouter();
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilter, setShowFilter] = useState<'all' | 'colleges' | 'universities'>('all');

  useEffect(() => {
    fetch('/api/admin/colleges', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setColleges(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = colleges.filter(c => {
    const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || c.institutionType === typeFilter;
    const matchShow = showFilter === 'all' || (showFilter === 'colleges' && c.isCollege) || (showFilter === 'universities' && !c.isCollege);
    return matchSearch && matchType && matchShow;
  });

  const institutionTypes = [...new Set(colleges.map(c => c.institutionType).filter(Boolean))].sort();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Institutions</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>
            {colleges.filter(c => !c.isCollege).length} universities, {colleges.filter(c => c.isCollege).length} colleges
          </p>
        </div>
        <button onClick={() => router.push('/admin/colleges/new')} style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
          + New College
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: '10px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14, outline: 'none', minWidth: 200 }}
        />
        <select
          value={showFilter}
          onChange={e => setShowFilter(e.target.value as 'all' | 'colleges' | 'universities')}
          style={{ padding: '10px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14 }}
        >
          <option value="all">All</option>
          <option value="universities">Universities Only</option>
          <option value="colleges">Colleges Only</option>
        </select>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{ padding: '10px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14 }}
        >
          <option value="all">All Types</option>
          {institutionTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No institutions found</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                {['Name', 'Type', 'Public/Private', 'Departments', 'Qualifications'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#94a3b8', fontWeight: 500, fontSize: 12, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr
                  key={c.name}
                  onClick={() => router.push(`/admin/colleges/${encodeURIComponent(c.name)}`)}
                  style={{ borderBottom: '1px solid #1e293b', cursor: 'pointer' }}
                  onMouseOver={e => (e.currentTarget.style.background = '#334155')}
                  onMouseOut={e => (e.currentTarget.style.background = '')}
                >
                  <td style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 500 }}>
                    {c.name}
                    {c.isCollege && <span style={{ marginLeft: 8, fontSize: 10, background: '#334155', color: '#94a3b8', padding: '2px 6px', borderRadius: 4 }}>College</span>}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{c.institutionType || '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{c.publicOrPrivate || '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{c.facCount}</td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{c.degCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
