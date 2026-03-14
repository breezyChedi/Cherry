'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Bursary {
  id: string; name: string; funder: string; status: string;
  closingDate: string; category: string; fundingType: string; logoUrl: string;
}

export default function BursariesListPage() {
  const router = useRouter();
  const [bursaries, setBursaries] = useState<Bursary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetch('/api/admin/bursaries', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setBursaries(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = bursaries.filter(b => {
    const matchSearch = !search || b.name?.toLowerCase().includes(search.toLowerCase()) || b.funder?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Bursaries</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>{bursaries.length} total</p>
        </div>
        <button
          onClick={() => router.push('/admin/bursaries/new')}
          style={{ padding: '10px 20px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}
        >
          + New Bursary
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input
          placeholder="Search by name or funder..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, padding: '10px 14px', background: '#1e293b', border: '1px solid #334155',
            borderRadius: 8, color: '#e2e8f0', fontSize: 14, outline: 'none', maxWidth: 400,
          }}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{
            padding: '10px 14px', background: '#1e293b', border: '1px solid #334155',
            borderRadius: 8, color: '#e2e8f0', fontSize: 14,
          }}
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="upcoming">Upcoming</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No bursaries found</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                {['Name', 'Funder', 'Type', 'Status', 'Closing Date'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#94a3b8', fontWeight: 500, fontSize: 12, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr
                  key={b.id}
                  onClick={() => router.push(`/admin/bursaries/${b.id}`)}
                  style={{ borderBottom: '1px solid #1e293b', cursor: 'pointer' }}
                  onMouseOver={e => (e.currentTarget.style.background = '#334155')}
                  onMouseOut={e => (e.currentTarget.style.background = '')}
                >
                  <td style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 500 }}>{b.name}</td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{b.funder}</td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{b.fundingType || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                      background: b.status === 'open' ? '#064e3b' : b.status === 'upcoming' ? '#713f12' : '#7f1d1d',
                      color: b.status === 'open' ? '#6ee7b7' : b.status === 'upcoming' ? '#fde047' : '#fca5a5',
                    }}>{b.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{b.closingDate || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
