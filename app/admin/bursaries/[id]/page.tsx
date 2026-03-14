'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

// Helper components
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 4, fontWeight: 500 }}>{label}</label>
    {children}
  </div>
);

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155',
  borderRadius: 6, color: '#e2e8f0', fontSize: 14, boxSizing: 'border-box',
};

const selectStyle: React.CSSProperties = { ...inputStyle };

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ background: '#1e293b', borderRadius: 10, border: '1px solid #334155', padding: 20, marginBottom: 20 }}>
    <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#c084fc' }}>{title}</h3>
    {children}
  </div>
);

const Grid = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0 16px' }}>
    {children}
  </div>
);

type BursaryData = Record<string, unknown>;

export default function BursaryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<BursaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`/api/admin/bursaries/${id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(raw => {
        // Parse JSON string fields
        const parsed: BursaryData = { ...raw };
        for (const key of ['funderJson', 'eligibilityJson', 'coverageJson', 'obligationsJson', 'applicationJson', 'renewalJson']) {
          if (typeof raw[key] === 'string') {
            try { parsed[key.replace('Json', '')] = JSON.parse(raw[key]); } catch {}
          }
        }
        // Map scalar to nested
        if (!parsed.funder) parsed.funder = {};
        if (!parsed.eligibility) parsed.eligibility = { academic: {}, demographic: {}, financial: {} };
        if (!parsed.coverageInfo) parsed.coverageInfo = { items: [] };
        if (!parsed.obligations) parsed.obligations = { workBack: {}, duringStudies: {}, academic: {} };
        if (!parsed.application) parsed.application = {};
        if (!parsed.renewal) parsed.renewal = {};
        parsed.id = raw.id || id;
        parsed.name = raw.name || '';
        parsed.fundingType = raw.fundingType || '';
        parsed.competitiveness = raw.competitiveness || '';
        setData(parsed);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const updateField = (path: string, value: unknown) => {
    setData(prev => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let obj = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!obj[parts[i]]) obj[parts[i]] = {};
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = value;
      return copy;
    });
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/bursaries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (res.ok) setMessage('Saved successfully!');
      else setMessage('Error saving: ' + (await res.json()).error);
    } catch (e) {
      setMessage('Error: ' + (e instanceof Error ? e.message : 'Unknown'));
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this bursary?')) return;
    await fetch(`/api/admin/bursaries/${id}`, { method: 'DELETE', credentials: 'include' });
    router.push('/admin/bursaries');
  };

  if (loading) return <div style={{ padding: 40, color: '#64748b' }}>Loading...</div>;
  if (!data) return <div style={{ padding: 40, color: '#f87171' }}>Bursary not found</div>;

  const funder = (data.funder || {}) as Record<string, unknown>;
  const eligAcademic = ((data.eligibility as Record<string, unknown>)?.academic || {}) as Record<string, unknown>;
  const eligDemographic = ((data.eligibility as Record<string, unknown>)?.demographic || {}) as Record<string, unknown>;
  const eligFinancial = ((data.eligibility as Record<string, unknown>)?.financial || {}) as Record<string, unknown>;
  const application = (data.application || {}) as Record<string, unknown>;
  const workBack = ((data.obligations as Record<string, unknown>)?.workBack || {}) as Record<string, unknown>;
  const renewal = (data.renewal || {}) as Record<string, unknown>;

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <button onClick={() => router.push('/admin/bursaries')} style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontSize: 13, marginBottom: 8 }}>
            ← Back to Bursaries
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{data.name as string || 'Edit Bursary'}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleDelete} style={{ padding: '8px 16px', background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Delete</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {message && (
        <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 16, background: message.includes('Error') ? '#7f1d1d' : '#064e3b', color: message.includes('Error') ? '#fca5a5' : '#6ee7b7', fontSize: 14 }}>
          {message}
        </div>
      )}

      <Section title="General">
        <Grid>
          <Field label="Bursary ID"><input style={inputStyle} value={(data.id as string) || ''} onChange={e => updateField('id', e.target.value)} /></Field>
          <Field label="Name"><input style={inputStyle} value={(data.name as string) || ''} onChange={e => updateField('name', e.target.value)} /></Field>
          <Field label="Funding Type">
            <select style={selectStyle} value={(data.fundingType as string) || ''} onChange={e => updateField('fundingType', e.target.value)}>
              <option value="">Select...</option>
              {['bursary', 'scholarship', 'loan', 'grant', 'fellowship'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Competitiveness">
            <select style={selectStyle} value={(data.competitiveness as string) || ''} onChange={e => updateField('competitiveness', e.target.value)}>
              <option value="">Select...</option>
              {['merit_only', 'need_only', 'merit_and_need', 'open'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
        </Grid>
      </Section>

      <Section title="Funder">
        <Grid>
          <Field label="Funder Name"><input style={inputStyle} value={(funder.name as string) || ''} onChange={e => updateField('funder.name', e.target.value)} /></Field>
          <Field label="Legal Name"><input style={inputStyle} value={(funder.legalName as string) || ''} onChange={e => updateField('funder.legalName', e.target.value)} /></Field>
          <Field label="Category">
            <select style={selectStyle} value={(funder.category as string) || ''} onChange={e => updateField('funder.category', e.target.value)}>
              <option value="">Select...</option>
              {['jse_listed', 'multinational', 'state_owned', 'ngo', 'private_trust', 'family_foundation', 'government', 'professional_body', 'parastatal', 'sme'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Industry Sector"><input style={inputStyle} value={(funder.industrySector as string) || ''} onChange={e => updateField('funder.industrySector', e.target.value)} /></Field>
          <Field label="Logo URL"><input style={inputStyle} value={(funder.logoUrl as string) || ''} onChange={e => updateField('funder.logoUrl', e.target.value)} /></Field>
        </Grid>
      </Section>

      <Section title="Eligibility - Academic">
        <Grid>
          <Field label="Applicant Levels (comma-separated)">
            <input style={inputStyle} value={Array.isArray(eligAcademic.applicantLevels) ? (eligAcademic.applicantLevels as string[]).join(', ') : ''} onChange={e => updateField('eligibility.academic.applicantLevels', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
          </Field>
          <Field label="Funding Target Levels (comma-separated)">
            <input style={inputStyle} value={Array.isArray(eligAcademic.fundingTargetLevels) ? (eligAcademic.fundingTargetLevels as string[]).join(', ') : ''} onChange={e => updateField('eligibility.academic.fundingTargetLevels', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
          </Field>
          <Field label="Faculties (comma-separated)">
            <input style={inputStyle} value={Array.isArray(eligAcademic.faculties) ? (eligAcademic.faculties as string[]).join(', ') : ''} onChange={e => updateField('eligibility.academic.faculties', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
          </Field>
          <Field label="Minimum APS"><input style={inputStyle} type="number" value={(eligAcademic.minimumAps as number) ?? ''} onChange={e => updateField('eligibility.academic.minimumAps', e.target.value ? Number(e.target.value) : null)} /></Field>
          <Field label="Subject Requirements (raw text)">
            <textarea style={{ ...inputStyle, minHeight: 60 }} value={(eligAcademic.subjectRequirementsRaw as string) || ''} onChange={e => updateField('eligibility.academic.subjectRequirementsRaw', e.target.value || null)} />
          </Field>
        </Grid>
      </Section>

      <Section title="Eligibility - Demographic">
        <Grid>
          <Field label="Citizenship (comma-separated)">
            <input style={inputStyle} value={Array.isArray(eligDemographic.citizenship) ? (eligDemographic.citizenship as string[]).join(', ') : ''} onChange={e => updateField('eligibility.demographic.citizenship', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
          </Field>
          <Field label="Gender">
            <select style={selectStyle} value={(eligDemographic.gender as string) || 'any'} onChange={e => updateField('eligibility.demographic.gender', e.target.value)}>
              {['any', 'male', 'female'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Provinces (comma-separated)">
            <input style={inputStyle} value={Array.isArray(eligDemographic.provinces) ? (eligDemographic.provinces as string[]).join(', ') : ''} onChange={e => updateField('eligibility.demographic.provinces', e.target.value ? e.target.value.split(',').map(s => s.trim()).filter(Boolean) : null)} />
          </Field>
          <Field label="Age Min"><input style={inputStyle} type="number" value={(eligDemographic.ageMin as number) ?? ''} onChange={e => updateField('eligibility.demographic.ageMin', e.target.value ? Number(e.target.value) : null)} /></Field>
          <Field label="Age Max"><input style={inputStyle} type="number" value={(eligDemographic.ageMax as number) ?? ''} onChange={e => updateField('eligibility.demographic.ageMax', e.target.value ? Number(e.target.value) : null)} /></Field>
        </Grid>
      </Section>

      <Section title="Eligibility - Financial">
        <Grid>
          <Field label="Max Household Income (ZAR)"><input style={inputStyle} type="number" value={(eligFinancial.maxHouseholdIncome as number) ?? ''} onChange={e => updateField('eligibility.financial.maxHouseholdIncome', e.target.value ? Number(e.target.value) : null)} /></Field>
          <Field label="Threshold Type">
            <select style={selectStyle} value={(eligFinancial.thresholdType as string) || ''} onChange={e => updateField('eligibility.financial.thresholdType', e.target.value)}>
              <option value="">Select...</option>
              {['none', 'hard_cap', 'sliding_scale', 'means_test'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
        </Grid>
      </Section>

      <Section title="Application">
        <Grid>
          <Field label="Status">
            <select style={selectStyle} value={(application.status as string) || ''} onChange={e => updateField('application.status', e.target.value)}>
              <option value="">Select...</option>
              {['open', 'closed', 'upcoming'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Cycle Year"><input style={inputStyle} type="number" value={(application.cycleYear as number) ?? ''} onChange={e => updateField('application.cycleYear', e.target.value ? Number(e.target.value) : null)} /></Field>
          <Field label="Opening Date"><input style={inputStyle} type="date" value={(application.openingDate as string) || ''} onChange={e => updateField('application.openingDate', e.target.value || null)} /></Field>
          <Field label="Closing Date"><input style={inputStyle} type="date" value={(application.closingDate as string) || ''} onChange={e => updateField('application.closingDate', e.target.value || null)} /></Field>
          <Field label="Official URL"><input style={inputStyle} value={(application.officialUrl as string) || ''} onChange={e => updateField('application.officialUrl', e.target.value)} /></Field>
          <Field label="Portal URL"><input style={inputStyle} value={(application.portalUrl as string) || ''} onChange={e => updateField('application.portalUrl', e.target.value || null)} /></Field>
          <Field label="Contact Email"><input style={inputStyle} value={(application.contactEmail as string) || ''} onChange={e => updateField('application.contactEmail', e.target.value || null)} /></Field>
          <Field label="Required Documents (comma-separated)">
            <input style={inputStyle} value={Array.isArray(application.requiredDocuments) ? (application.requiredDocuments as string[]).join(', ') : ''} onChange={e => updateField('application.requiredDocuments', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
          </Field>
        </Grid>
      </Section>

      <Section title="Obligations - Work-back">
        <Grid>
          <Field label="Required">
            <select style={selectStyle} value={workBack.required === true ? 'true' : workBack.required === false ? 'false' : ''} onChange={e => updateField('obligations.workBack.required', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}>
              <option value="">Unknown</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </Field>
          <Field label="Years per Study Year"><input style={inputStyle} type="number" value={(workBack.yearsPerStudyYear as number) ?? ''} onChange={e => updateField('obligations.workBack.yearsPerStudyYear', e.target.value ? Number(e.target.value) : null)} /></Field>
          <Field label="Employer Type">
            <select style={selectStyle} value={(workBack.employerType as string) || ''} onChange={e => updateField('obligations.workBack.employerType', e.target.value || null)}>
              <option value="">Select...</option>
              {['specific_company', 'any_in_sector', 'government', 'none'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
        </Grid>
      </Section>

      <Section title="Renewal">
        <Grid>
          <Field label="Mechanism">
            <select style={selectStyle} value={(renewal.mechanism as string) || ''} onChange={e => updateField('renewal.mechanism', e.target.value || null)}>
              <option value="">Select...</option>
              {['auto_on_pass', 'reapply_annually', 'guaranteed_duration', 'conditional_review', 'none'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Max Tenure Years"><input style={inputStyle} type="number" value={(renewal.maxTenureYears as number) ?? ''} onChange={e => updateField('renewal.maxTenureYears', e.target.value ? Number(e.target.value) : null)} /></Field>
          <Field label="Failed Module Policy">
            <select style={selectStyle} value={(renewal.failedModulePolicy as string) || ''} onChange={e => updateField('renewal.failedModulePolicy', e.target.value || null)}>
              <option value="">Select...</option>
              {['stop_funding', 'probation', 'reduced_funding', 'repeat_at_own_cost', 'appeal_allowed'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
        </Grid>
      </Section>

      {/* Bottom save */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
