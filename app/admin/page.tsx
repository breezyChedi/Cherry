'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface BursaryRow { id: string; name: string; funder: string; status: string; closingDate: string; }
interface CollegeRow { name: string; isCollege: boolean; institutionType: string; facCount: number; degCount: number; }

export default function AdminDashboard() {
  const router = useRouter();
  const [bursaries, setBursaries] = useState<BursaryRow[]>([]);
  const [colleges, setColleges] = useState<CollegeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/bursaries', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/admin/colleges', { credentials: 'include' }).then(r => r.json()),
    ]).then(([b, c]) => {
      setBursaries(Array.isArray(b) ? b : []);
      setColleges(Array.isArray(c) ? c : []);
    }).finally(() => setLoading(false));
  }, []);

  const unis = colleges.filter(c => !c.isCollege);
  const cols = colleges.filter(c => c.isCollege);
  const openBursaries = bursaries.filter(b => b.status === 'open');
  const closedBursaries = bursaries.filter(b => b.status === 'closed');
  const upcomingBursaries = bursaries.filter(b => b.status === 'upcoming');

  const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div style={{
      background: '#1e293b', borderRadius: 12, padding: '24px 20px',
      border: '1px solid #334155', minWidth: 140,
    }}>
      <div style={{ fontSize: 32, fontWeight: 700, color }}>{loading ? '...' : value}</div>
      <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>{label}</div>
    </div>
  );

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Dashboard</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Overview of Cherry data</p>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 40 }}>
        <StatCard label="Universities" value={unis.length} color="#60a5fa" />
        <StatCard label="Colleges" value={cols.length} color="#a78bfa" />
        <StatCard label="Total Bursaries" value={bursaries.length} color="#c084fc" />
        <StatCard label="Open" value={openBursaries.length} color="#4ade80" />
        <StatCard label="Upcoming" value={upcomingBursaries.length} color="#facc15" />
        <StatCard label="Closed" value={closedBursaries.length} color="#f87171" />
      </div>

      {/* Quick Actions */}
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Quick Actions</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
        <button onClick={() => router.push('/admin/bursaries/new')} style={btnStyle('#7c3aed')}>
          + New Bursary
        </button>
        <button onClick={() => router.push('/admin/colleges/new')} style={btnStyle('#2563eb')}>
          + New College
        </button>
        <button onClick={() => router.push('/admin/bursaries')} style={btnStyle('#334155')}>
          View All Bursaries
        </button>
        <button onClick={() => router.push('/admin/colleges')} style={btnStyle('#334155')}>
          View All Colleges
        </button>
      </div>

      {/* Recent Bursaries */}
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Bursaries</h2>
      <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155' }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Funder</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Closing Date</th>
            </tr>
          </thead>
          <tbody>
            {bursaries.slice(0, 10).map(b => (
              <tr
                key={b.id}
                onClick={() => router.push(`/admin/bursaries/${b.id}`)}
                style={{ borderBottom: '1px solid #1e293b', cursor: 'pointer' }}
                onMouseOver={e => (e.currentTarget.style.background = '#334155')}
                onMouseOut={e => (e.currentTarget.style.background = '')}
              >
                <td style={tdStyle}>{b.name}</td>
                <td style={tdStyle}>{b.funder}</td>
                <td style={tdStyle}>
                  <span style={statusBadge(b.status)}>{b.status}</span>
                </td>
                <td style={tdStyle}>{b.closingDate || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const btnStyle = (bg: string): React.CSSProperties => ({
  padding: '10px 20px', background: bg, color: 'white', border: 'none',
  borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500,
});

const thStyle: React.CSSProperties = {
  padding: '12px 16px', textAlign: 'left', color: '#94a3b8', fontWeight: 500, fontSize: 12,
  textTransform: 'uppercase', letterSpacing: '0.05em',
};

const tdStyle: React.CSSProperties = { padding: '12px 16px', color: '#e2e8f0' };

const statusBadge = (status: string): React.CSSProperties => ({
  padding: '3px 10px',
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 500,
  background: status === 'open' ? '#064e3b' : status === 'upcoming' ? '#713f12' : '#7f1d1d',
  color: status === 'open' ? '#6ee7b7' : status === 'upcoming' ? '#fde047' : '#fca5a5',
});
