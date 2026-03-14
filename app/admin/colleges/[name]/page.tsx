'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155',
  borderRadius: 6, color: '#e2e8f0', fontSize: 14, boxSizing: 'border-box',
};
const selectStyle: React.CSSProperties = { ...inputStyle };

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 4, fontWeight: 500 }}>{label}</label>
    {children}
  </div>
);

const Section = ({ title, children, color = '#60a5fa' }: { title: string; children: React.ReactNode; color?: string }) => (
  <div style={{ background: '#1e293b', borderRadius: 10, border: '1px solid #334155', padding: 20, marginBottom: 20 }}>
    <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color }}>{title}</h3>
    {children}
  </div>
);

const Grid = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0 16px' }}>
    {children}
  </div>
);

type CollegeData = Record<string, unknown>;

const institutionTypes = [
  'public_tvet', 'cet_college', 'private_college', 'private_hei', 'flight_school',
  'culinary_school', 'film_school', 'agricultural_college', 'nursing_college',
  'maritime_academy', 'beauty_academy', 'it_bootcamp', 'security_training',
  'theological_college', 'music_academy', 'sports_academy', 'ecd_college',
  'short_course_provider', 'other',
];

export default function CollegeEditPage({ params }: { params: Promise<{ name: string }> }) {
  const { name: encodedName } = use(params);
  const name = decodeURIComponent(encodedName);
  const router = useRouter();
  const [data, setData] = useState<CollegeData | null>(null);
  const [departments, setDepartments] = useState<{ name: string; qualifications: Record<string, unknown>[] }[]>([]);
  const [nodeId, setNodeId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/colleges/${encodeURIComponent(name)}`, { credentials: 'include' })
      .then(r => r.json())
      .then(result => {
        if (result.error) return;
        const inst = result.institution || {};
        // Parse JSON string fields
        if (typeof inst.registrationsJson === 'string') {
          try { inst.registrations = JSON.parse(inst.registrationsJson); } catch {}
        }
        if (typeof inst.campusesJson === 'string') {
          try { inst.campuses = JSON.parse(inst.campusesJson); } catch {}
        }
        setData(inst);
        setNodeId(String(result.nodeId || ''));
        setDepartments(result.departments || []);
      })
      .finally(() => setLoading(false));
  }, [name]);

  const updateField = (path: string, value: unknown) => {
    setData(prev => {
      if (!prev) return prev;
      const copy = { ...prev };
      copy[path] = value;
      return copy;
    });
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        institution: { ...data, isCollege: data.isCollege !== false },
        departments,
      };
      const res = await fetch('/api/admin/colleges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (res.ok) setMessage('Saved successfully!');
      else setMessage('Error: ' + (await res.json()).error);
    } catch (e) {
      setMessage('Error: ' + (e instanceof Error ? e.message : 'Unknown'));
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${name}" and all its departments/qualifications?`)) return;
    await fetch(`/api/admin/colleges/${encodeURIComponent(name)}`, { method: 'DELETE', credentials: 'include' });
    router.push('/admin/colleges');
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('file', file);
    const slug = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    formData.append('filename', `${slug}_logo.png`);
    try {
      const res = await fetch('/api/admin/upload/logo', { method: 'POST', body: formData, credentials: 'include' });
      const result = await res.json();
      if (result.logoPath) updateField('logoUrl', result.logoPath);
    } catch {}
    setUploadingLogo(false);
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHero(true);
    const formData = new FormData();
    formData.append('file', file);
    const slug = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    formData.append('filename', `${slug}.jpg`);
    try {
      const res = await fetch('/api/admin/upload/hero', { method: 'POST', body: formData, credentials: 'include' });
      const result = await res.json();
      if (result.url) updateField('campusImageUrl', result.url);
    } catch {}
    setUploadingHero(false);
  };

  if (loading) return <div style={{ padding: 40, color: '#64748b' }}>Loading...</div>;
  if (!data) return <div style={{ padding: 40, color: '#f87171' }}>Institution not found</div>;

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <button onClick={() => router.push('/admin/colleges')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: 13, marginBottom: 8 }}>
            ← Back to Institutions
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{name}</h1>
          {nodeId && <p style={{ color: '#64748b', fontSize: 12, margin: '4px 0 0' }}>Node ID: {nodeId}</p>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleDelete} style={{ padding: '8px 16px', background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Delete</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {message && (
        <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 16, background: message.includes('Error') ? '#7f1d1d' : '#064e3b', color: message.includes('Error') ? '#fca5a5' : '#6ee7b7', fontSize: 14 }}>
          {message}
        </div>
      )}

      <Section title="Institution Details">
        <Grid>
          <Field label="Name"><input style={inputStyle} value={(data.name as string) || ''} onChange={e => updateField('name', e.target.value)} /></Field>
          <Field label="Institution Type">
            <select style={selectStyle} value={(data.institutionType as string) || ''} onChange={e => updateField('institutionType', e.target.value)}>
              <option value="">Select...</option>
              {institutionTypes.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Public/Private">
            <select style={selectStyle} value={(data.publicOrPrivate as string) || ''} onChange={e => updateField('publicOrPrivate', e.target.value)}>
              <option value="">Select...</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </Field>
          <Field label="Is College">
            <select style={selectStyle} value={data.isCollege === true ? 'true' : 'false'} onChange={e => updateField('isCollege', e.target.value === 'true')}>
              <option value="true">Yes (College/TVET)</option>
              <option value="false">No (University)</option>
            </select>
          </Field>
          <Field label="Website URL"><input style={inputStyle} value={(data.websiteUrl as string) || ''} onChange={e => updateField('websiteUrl', e.target.value)} /></Field>
          <Field label="General Email"><input style={inputStyle} value={(data.generalEmail as string) || ''} onChange={e => updateField('generalEmail', e.target.value)} /></Field>
          <Field label="Admissions Email"><input style={inputStyle} value={(data.admissionsEmail as string) || ''} onChange={e => updateField('admissionsEmail', e.target.value)} /></Field>
          <Field label="Phone"><input style={inputStyle} value={(data.generalPhone as string) || ''} onChange={e => updateField('generalPhone', e.target.value)} /></Field>
        </Grid>
        <Field label="Description">
          <textarea style={{ ...inputStyle, minHeight: 60 }} value={(data.description as string) || ''} onChange={e => updateField('description', e.target.value)} />
        </Field>
        <Grid>
          <Field label="NSFAS Eligible">
            <select style={selectStyle} value={data.nsfasEligible === true ? 'true' : data.nsfasEligible === false ? 'false' : ''} onChange={e => updateField('nsfasEligible', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}>
              <option value="">Unknown</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </Field>
          <Field label="Accommodation">
            <select style={selectStyle} value={data.accommodationAvailable === true ? 'true' : data.accommodationAvailable === false ? 'false' : ''} onChange={e => updateField('accommodationAvailable', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}>
              <option value="">Unknown</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </Field>
          <Field label="Facilities (comma-separated)">
            <input style={inputStyle} value={Array.isArray(data.facilities) ? (data.facilities as string[]).join(', ') : ''} onChange={e => updateField('facilities', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
          </Field>
        </Grid>
      </Section>

      {/* Image Management */}
      <Section title="Images" color="#f59e0b">
        <Grid>
          <Field label="Logo">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input style={{ ...inputStyle, flex: 1 }} value={(data.logoUrl as string) || ''} onChange={e => updateField('logoUrl', e.target.value)} placeholder="/logos/filename.png" />
              <label style={{ padding: '8px 14px', background: '#334155', color: '#e2e8f0', borderRadius: 6, cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' }}>
                {uploadingLogo ? '...' : 'Upload'}
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </Field>
          <Field label="Hero Image URL">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input style={{ ...inputStyle, flex: 1 }} value={(data.campusImageUrl as string) || ''} onChange={e => updateField('campusImageUrl', e.target.value)} />
              <label style={{ padding: '8px 14px', background: '#334155', color: '#e2e8f0', borderRadius: 6, cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' }}>
                {uploadingHero ? '...' : 'Upload'}
                <input type="file" accept="image/*" onChange={handleHeroUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </Field>
        </Grid>
      </Section>

      {/* Departments */}
      <Section title={`Departments (${departments.length})`} color="#a78bfa">
        {departments.map((dept, di) => (
          <div key={di} style={{ background: '#0f172a', borderRadius: 8, padding: 16, marginBottom: 12, border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <input
                style={{ ...inputStyle, fontWeight: 600, fontSize: 15, background: 'transparent', border: 'none', padding: 0, color: '#e2e8f0' }}
                value={dept.name}
                onChange={e => {
                  const copy = [...departments];
                  copy[di] = { ...copy[di], name: e.target.value };
                  setDepartments(copy);
                }}
                placeholder="Department name"
              />
              <button
                onClick={() => setDepartments(departments.filter((_, i) => i !== di))}
                style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}
              >Remove</button>
            </div>
            <div style={{ color: '#64748b', fontSize: 12, marginBottom: 8 }}>
              {dept.qualifications.length} qualification(s)
            </div>
            {dept.qualifications.map((qual, qi) => (
              <div key={qi} style={{ background: '#1e293b', borderRadius: 6, padding: 10, marginBottom: 6, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#e2e8f0' }}>{(qual.name as string) || 'Unnamed'}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: 11 }}>{(qual.level as string) || ''}</span>
                    <button
                      onClick={() => {
                        const copy = [...departments];
                        copy[di] = { ...copy[di], qualifications: copy[di].qualifications.filter((_, i) => i !== qi) };
                        setDepartments(copy);
                      }}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 12 }}
                    >x</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        <button
          onClick={() => setDepartments([...departments, { name: '', qualifications: [] }])}
          style={{ padding: '8px 16px', background: '#334155', color: '#94a3b8', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
        >
          + Add Department
        </button>
      </Section>

      {/* Bottom save */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16, marginBottom: 40 }}>
        <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
