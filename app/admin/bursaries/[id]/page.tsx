'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  inputStyle, Field, Grid, Section, SingleSelect, MultiSelectChips,
  TriStateToggle, Toggle, TagChipInput, NumberInput, RadioGroup,
  UrlInput, EmailInput,
} from '@/app/admin/components/FormControls';

// === Option Maps ===

const fundingTypeOpts = [
  { value: 'bursary', label: 'Bursary' }, { value: 'scholarship', label: 'Scholarship' },
  { value: 'loan', label: 'Loan' }, { value: 'grant', label: 'Grant' }, { value: 'fellowship', label: 'Fellowship' },
];

const competitivenessOpts = [
  { value: 'merit_only', label: 'Merit Only' }, { value: 'need_only', label: 'Need Only' },
  { value: 'merit_and_need', label: 'Merit & Need' }, { value: 'open', label: 'Open to All' },
];

const funderCategoryOpts = [
  { value: 'jse_listed', label: 'JSE-Listed Company' }, { value: 'multinational', label: 'Multinational Corporation' },
  { value: 'state_owned', label: 'State-Owned Enterprise' }, { value: 'ngo', label: 'NGO' },
  { value: 'private_trust', label: 'Private Trust' }, { value: 'family_foundation', label: 'Family Foundation' },
  { value: 'government', label: 'Government Department' }, { value: 'professional_body', label: 'Professional Body' },
  { value: 'parastatal', label: 'Parastatal' }, { value: 'sme', label: 'SME' },
];

const applicantLevelOpts = [
  { value: 'undergrad_y1', label: '1st Year Undergrad' }, { value: 'undergrad_y2', label: '2nd Year Undergrad' },
  { value: 'undergrad_y3', label: '3rd Year Undergrad' }, { value: 'undergrad_y4', label: '4th Year Undergrad' },
  { value: 'any_undergrad', label: 'Any Undergraduate' }, { value: 'honours', label: 'Honours' },
  { value: 'masters', label: "Master's" }, { value: 'phd', label: 'PhD / Doctoral' },
  { value: 'postgrad_diploma', label: 'Postgrad Diploma' }, { value: 'any_postgrad', label: 'Any Postgraduate' },
];

const fundingTargetOpts = [
  { value: 'undergraduate', label: 'Undergraduate' }, { value: 'postgraduate', label: 'Postgraduate' },
];

const citizenshipOpts = [
  { value: 'south_african', label: 'South African Citizen' }, { value: 'permanent_resident', label: 'SA Permanent Resident' },
  { value: 'sadc', label: 'SADC Country Citizen' }, { value: 'african_union', label: 'African Union Citizen' },
  { value: 'any', label: 'Any Nationality' },
];

const genderOpts = [
  { value: 'any', label: 'Any' }, { value: 'male', label: 'Male Only' }, { value: 'female', label: 'Female Only' },
];

const provinceOpts = [
  'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State',
  'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape',
].map(p => ({ value: p, label: p }));

const thresholdTypeOpts = [
  { value: 'none', label: 'None' }, { value: 'hard_cap', label: 'Hard Cap' },
  { value: 'sliding_scale', label: 'Sliding Scale' }, { value: 'means_test', label: 'Means Test' },
];

const coverageItemOpts = [
  { value: 'tuition', label: 'Tuition Fees' }, { value: 'accommodation', label: 'Accommodation' },
  { value: 'meals', label: 'Meals / Meal Allowance' }, { value: 'books', label: 'Books & Study Materials' },
  { value: 'laptop', label: 'Laptop / Computer' }, { value: 'transport', label: 'Transport Allowance' },
  { value: 'stipend', label: 'Living Stipend' }, { value: 'registration', label: 'Registration Fee' },
  { value: 'exam_fees', label: 'Examination Fees' },
];

const coveragePeriodOpts = [
  { value: 'annual', label: 'Annual' }, { value: 'once_off', label: 'Once-Off' }, { value: 'monthly', label: 'Monthly' },
];

const disbursementOpts = [
  { value: 'institution_direct', label: 'Paid to Institution' }, { value: 'student_direct', label: 'Paid to Student' },
  { value: 'mixed', label: 'Mixed' },
];

const employerTypeOpts = [
  { value: 'specific_company', label: 'Specific Company' }, { value: 'any_in_sector', label: 'Any in Sector' },
  { value: 'government', label: 'Government' }, { value: 'none', label: 'None' },
];

const reportingFreqOpts = [
  { value: 'every_semester', label: 'Every Semester' }, { value: 'annually', label: 'Annually' },
  { value: 'quarterly', label: 'Quarterly' }, { value: 'on_request', label: 'On Request' },
];

const statusOpts = [
  { value: 'open', label: 'Open', color: '#22c55e' },
  { value: 'closed', label: 'Closed', color: '#ef4444' },
  { value: 'upcoming', label: 'Upcoming', color: '#f59e0b' },
];

const modeOpts = [
  { value: 'online', label: 'Online' }, { value: 'paper', label: 'Paper / Post' }, { value: 'email', label: 'Email' },
];

const renewalMechOpts = [
  { value: 'auto_on_pass', label: 'Automatic on Pass' }, { value: 'reapply_annually', label: 'Must Reapply Each Year' },
  { value: 'guaranteed_duration', label: 'Guaranteed for Full Duration' },
  { value: 'conditional_review', label: 'Conditional Review' }, { value: 'none', label: 'No Renewal' },
];

const failedModuleOpts = [
  { value: 'stop_funding', label: 'Funding Stopped' }, { value: 'probation', label: 'Academic Probation' },
  { value: 'reduced_funding', label: 'Reduced Funding' }, { value: 'repeat_at_own_cost', label: 'Repeat at Own Cost' },
  { value: 'appeal_allowed', label: 'Appeal Process Available' },
];

// === Helpers ===

type AnyObj = Record<string, unknown>;
const get = (obj: AnyObj | undefined, key: string) => (obj || {})[key];
const getArr = (obj: AnyObj | undefined, key: string): string[] => {
  const v = get(obj, key);
  return Array.isArray(v) ? v : [];
};
const getNum = (obj: AnyObj | undefined, key: string): number | null => {
  const v = get(obj, key);
  return typeof v === 'number' ? v : null;
};
const getBool = (obj: AnyObj | undefined, key: string): boolean | null => {
  const v = get(obj, key);
  return v === true ? true : v === false ? false : null;
};
const getStr = (obj: AnyObj | undefined, key: string): string => {
  const v = get(obj, key);
  return typeof v === 'string' ? v : '';
};

type CoverageItem = { item: string; covered: boolean; amount: number | null; period: string; constraint: string | null; notes: string };

export default function BursaryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<AnyObj | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/bursaries/${id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(raw => {
        const parsed: AnyObj = { ...raw };
        for (const key of ['funderJson', 'eligibilityJson', 'coverageJson', 'obligationsJson', 'applicationJson', 'renewalJson']) {
          if (typeof raw[key] === 'string') {
            try { parsed[key.replace('Json', '')] = JSON.parse(raw[key]); } catch { /* skip */ }
          }
        }
        if (!parsed.funder) parsed.funder = {};
        if (!parsed.eligibility) parsed.eligibility = { academic: {}, demographic: {}, financial: {} };
        const elig = parsed.eligibility as AnyObj;
        if (!elig.academic) elig.academic = {};
        if (!elig.demographic) elig.demographic = {};
        if (!elig.financial) elig.financial = {};
        if (!parsed.coverageInfo) parsed.coverageInfo = { items: [], disbursementRecipient: null };
        if (!parsed.obligations) parsed.obligations = { workBack: {}, duringStudies: {}, academic: {} };
        const oblig = parsed.obligations as AnyObj;
        if (!oblig.workBack) oblig.workBack = {};
        if (!oblig.duringStudies) oblig.duringStudies = {};
        if (!oblig.academic) oblig.academic = {};
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
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), credentials: 'include',
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !data) return;
    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('file', file);
    const slug = (getStr(data.funder as AnyObj, 'name') || 'logo').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    formData.append('filename', `${slug}_logo.png`);
    try {
      const res = await fetch('/api/admin/upload/logo', { method: 'POST', body: formData, credentials: 'include' });
      const result = await res.json();
      if (result.logoPath) updateField('funder.logoUrl', result.logoPath);
    } catch { /* skip */ }
    setUploadingLogo(false);
  };

  if (loading) return <div style={{ padding: 40, color: '#64748b' }}>Loading...</div>;
  if (!data) return <div style={{ padding: 40, color: '#f87171' }}>Bursary not found</div>;

  const funder = (data.funder || {}) as AnyObj;
  const eligAcad = ((data.eligibility as AnyObj)?.academic || {}) as AnyObj;
  const eligDemo = ((data.eligibility as AnyObj)?.demographic || {}) as AnyObj;
  const eligFin = ((data.eligibility as AnyObj)?.financial || {}) as AnyObj;
  const coverage = (data.coverageInfo || {}) as AnyObj;
  const coverageItems = (Array.isArray(coverage.items) ? coverage.items : []) as CoverageItem[];
  const workBack = ((data.obligations as AnyObj)?.workBack || {}) as AnyObj;
  const duringStudies = ((data.obligations as AnyObj)?.duringStudies || {}) as AnyObj;
  const acadOblig = ((data.obligations as AnyObj)?.academic || {}) as AnyObj;
  const application = (data.application || {}) as AnyObj;
  const renewal = (data.renewal || {}) as AnyObj;

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <button onClick={() => router.push('/admin/bursaries')} style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontSize: 13, marginBottom: 8 }}>
            &larr; Back to Bursaries
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

      {/* ====== GENERAL ====== */}
      <Section title="General" defaultOpen={true}>
        <Grid>
          <Field label="Bursary ID">
            <input style={{ ...inputStyle, opacity: 0.6 }} value={getStr(data, 'id')} readOnly />
          </Field>
          <Field label="Name">
            <input style={inputStyle} value={getStr(data, 'name')} onChange={e => updateField('name', e.target.value)} />
          </Field>
          <Field label="Funding Type">
            <SingleSelect value={data.fundingType as string} onChange={v => updateField('fundingType', v)} options={fundingTypeOpts} />
          </Field>
          <Field label="Competitiveness">
            <SingleSelect value={data.competitiveness as string} onChange={v => updateField('competitiveness', v)} options={competitivenessOpts} />
          </Field>
        </Grid>
      </Section>

      {/* ====== FUNDER ====== */}
      <Section title="Funder" defaultOpen={true}>
        <Grid>
          <Field label="Funder Name">
            <input style={inputStyle} value={getStr(funder, 'name')} onChange={e => updateField('funder.name', e.target.value)} />
          </Field>
          <Field label="Legal Name">
            <input style={inputStyle} value={getStr(funder, 'legalName')} onChange={e => updateField('funder.legalName', e.target.value)} />
          </Field>
          <Field label="Category">
            <SingleSelect value={funder.category as string} onChange={v => updateField('funder.category', v)} options={funderCategoryOpts} />
          </Field>
          <Field label="Industry Sector">
            <input style={inputStyle} value={getStr(funder, 'industrySector')} onChange={e => updateField('funder.industrySector', e.target.value)} />
          </Field>
          <Field label="Logo" fullWidth>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {getStr(funder, 'logoUrl') && (
                <img src={`https://storage.googleapis.com/cherry-app-assets${getStr(funder, 'logoUrl')}`} alt="logo"
                  style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 6, background: '#0f172a', padding: 4, border: '1px solid #334155' }} />
              )}
              <div style={{ flex: 1 }}>
                <input style={{ ...inputStyle, marginBottom: 6 }} value={getStr(funder, 'logoUrl')} readOnly placeholder="No logo uploaded" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ display: 'inline-block', padding: '6px 14px', background: '#334155', color: '#e2e8f0', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                    {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoUpload} style={{ display: 'none' }} />
                  </label>
                  <span style={{ color: '#64748b', fontSize: 11 }}>PNG/JPG/SVG/WebP, max 400px, converted to PNG</span>
                </div>
              </div>
            </div>
          </Field>
        </Grid>
      </Section>

      {/* ====== ELIGIBILITY - ACADEMIC ====== */}
      <Section title="Eligibility - Academic" defaultOpen={false} color="#60a5fa">
        <Field label="Applicant Levels" fullWidth>
          <MultiSelectChips values={getArr(eligAcad, 'applicantLevels')} onChange={v => updateField('eligibility.academic.applicantLevels', v)} options={applicantLevelOpts} />
        </Field>
        <Field label="Funding Target Levels (max 2)" fullWidth>
          <MultiSelectChips values={getArr(eligAcad, 'fundingTargetLevels')} onChange={v => updateField('eligibility.academic.fundingTargetLevels', v)} options={fundingTargetOpts} maxSelect={2} />
        </Field>
        <Grid>
          <Field label="Minimum APS">
            <NumberInput value={getNum(eligAcad, 'minimumAps')} onChange={v => updateField('eligibility.academic.minimumAps', v)} min={0} max={50} />
          </Field>
          <Field label="Competitive APS">
            <NumberInput value={getNum(eligAcad, 'competitiveAps')} onChange={v => updateField('eligibility.academic.competitiveAps', v)} min={0} max={50} />
          </Field>
          <Field label="Min Aggregate">
            <NumberInput value={getNum(eligAcad, 'minAggregate')} onChange={v => updateField('eligibility.academic.minAggregate', v)} min={0} max={100} suffix="%" />
          </Field>
          <Field label="Maths Literacy Accepted">
            <TriStateToggle value={getBool(eligAcad, 'mathsLiteracyAccepted')} onChange={v => updateField('eligibility.academic.mathsLiteracyAccepted', v)} />
          </Field>
          <Field label="NBT Required">
            <TriStateToggle value={getBool(eligAcad, 'nbtRequired')} onChange={v => updateField('eligibility.academic.nbtRequired', v)} />
          </Field>
          <Field label="First Degree Only">
            <Toggle value={!!eligAcad.firstDegreeOnly} onChange={v => updateField('eligibility.academic.firstDegreeOnly', v)} />
          </Field>
          <Field label="Max Prior Years">
            <NumberInput value={getNum(eligAcad, 'maxPriorYears')} onChange={v => updateField('eligibility.academic.maxPriorYears', v)} min={0} />
          </Field>
          <Field label="Supports Extended Curriculum">
            <TriStateToggle value={getBool(eligAcad, 'supportsExtended')} onChange={v => updateField('eligibility.academic.supportsExtended', v)} />
          </Field>
        </Grid>
        <Field label="Subject Requirements (raw text)" fullWidth>
          <textarea style={{ ...inputStyle, minHeight: 60 }} value={getStr(eligAcad, 'subjectRequirementsRaw')} onChange={e => updateField('eligibility.academic.subjectRequirementsRaw', e.target.value || null)} />
        </Field>
        <Field label="Faculties" fullWidth>
          <TagChipInput values={getArr(eligAcad, 'faculties')} onChange={v => updateField('eligibility.academic.faculties', v)} />
        </Field>
        <Field label="Degree Whitelist" fullWidth>
          <TagChipInput values={getArr(eligAcad, 'degreeWhitelist')} onChange={v => updateField('eligibility.academic.degreeWhitelist', v.length ? v : null)} />
        </Field>
        <Field label="Institution Whitelist" fullWidth>
          <TagChipInput values={getArr(eligAcad, 'institutionWhitelist')} onChange={v => updateField('eligibility.academic.institutionWhitelist', v.length ? v : null)} />
        </Field>
      </Section>

      {/* ====== ELIGIBILITY - DEMOGRAPHIC ====== */}
      <Section title="Eligibility - Demographic" defaultOpen={false} color="#60a5fa">
        <Field label="Citizenship" fullWidth>
          <MultiSelectChips values={getArr(eligDemo, 'citizenship')} onChange={v => updateField('eligibility.demographic.citizenship', v)} options={citizenshipOpts} />
        </Field>
        <Grid>
          <Field label="Gender">
            <RadioGroup value={eligDemo.gender as string || 'any'} onChange={v => updateField('eligibility.demographic.gender', v)} options={genderOpts} />
          </Field>
          <Field label="Race">
            <input style={inputStyle} value={getStr(eligDemo, 'race')} onChange={e => updateField('eligibility.demographic.race', e.target.value || null)} placeholder="e.g. Any, Black, etc." />
          </Field>
          <Field label="Age Min">
            <NumberInput value={getNum(eligDemo, 'ageMin')} onChange={v => updateField('eligibility.demographic.ageMin', v)} min={0} />
          </Field>
          <Field label="Age Max">
            <NumberInput value={getNum(eligDemo, 'ageMax')} onChange={v => updateField('eligibility.demographic.ageMax', v)} min={0} />
          </Field>
          <Field label="Disability Preference">
            <Toggle value={!!eligDemo.disabilityPreference} onChange={v => updateField('eligibility.demographic.disabilityPreference', v)} />
          </Field>
          <Field label="Quintile Range">
            <input style={inputStyle} value={getStr(eligDemo, 'quintileRange')} onChange={e => updateField('eligibility.demographic.quintileRange', e.target.value || null)} placeholder="e.g. 1-3" />
          </Field>
        </Grid>
        <Field label="Provinces" fullWidth>
          <MultiSelectChips values={getArr(eligDemo, 'provinces')} onChange={v => updateField('eligibility.demographic.provinces', v.length ? v : null)} options={provinceOpts} />
        </Field>
        <Field label="Special Flags" fullWidth>
          <TagChipInput values={getArr(eligDemo, 'specialFlags')} onChange={v => updateField('eligibility.demographic.specialFlags', v)} />
        </Field>
      </Section>

      {/* ====== ELIGIBILITY - FINANCIAL ====== */}
      <Section title="Eligibility - Financial" defaultOpen={false} color="#60a5fa">
        <Grid>
          <Field label="Max Household Income">
            <NumberInput value={getNum(eligFin, 'maxHouseholdIncome')} onChange={v => updateField('eligibility.financial.maxHouseholdIncome', v)} prefix="R" />
          </Field>
          <Field label="Threshold Type">
            <SingleSelect value={eligFin.thresholdType as string} onChange={v => updateField('eligibility.financial.thresholdType', v)} options={thresholdTypeOpts} />
          </Field>
          <Field label="SASSA Auto-Approve">
            <Toggle value={!!eligFin.sassaAutoApprove} onChange={v => updateField('eligibility.financial.sassaAutoApprove', v)} />
          </Field>
          <Field label="Asset Test Enabled">
            <Toggle value={!!eligFin.assetTestEnabled} onChange={v => updateField('eligibility.financial.assetTestEnabled', v)} />
          </Field>
          <Field label="Exclusivity Clause">
            <Toggle value={!!eligFin.exclusivityClause} onChange={v => updateField('eligibility.financial.exclusivityClause', v)} />
          </Field>
          <Field label="Allows Top-Up">
            <Toggle value={!!eligFin.allowsTopUp} onChange={v => updateField('eligibility.financial.allowsTopUp', v)} />
          </Field>
          <Field label="Parental Income Cap">
            <NumberInput value={getNum(eligFin, 'parentalIncomeCap')} onChange={v => updateField('eligibility.financial.parentalIncomeCap', v)} prefix="R" />
          </Field>
        </Grid>
      </Section>

      {/* ====== COVERAGE ====== */}
      <Section title="Coverage" defaultOpen={false} color="#f59e0b">
        <Field label="Disbursement Recipient">
          <SingleSelect value={coverage.disbursementRecipient as string} onChange={v => updateField('coverageInfo.disbursementRecipient', v)} options={disbursementOpts} />
        </Field>

        <div style={{ marginTop: 12 }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Coverage Items</label>
          {coverageItems.map((item, i) => (
            <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: 12, marginBottom: 8, border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 500 }}>Item {i + 1}</span>
                <button type="button" onClick={() => {
                  const items = [...coverageItems];
                  items.splice(i, 1);
                  updateField('coverageInfo.items', items);
                }} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 11 }}>Remove</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px 12px' }}>
                <Field label="Item">
                  <SingleSelect value={item.item} onChange={v => {
                    const items = [...coverageItems]; items[i] = { ...items[i], item: v || '' }; updateField('coverageInfo.items', items);
                  }} options={coverageItemOpts} />
                </Field>
                <Field label="Covered">
                  <Toggle value={item.covered !== false} onChange={v => {
                    const items = [...coverageItems]; items[i] = { ...items[i], covered: v }; updateField('coverageInfo.items', items);
                  }} />
                </Field>
                <Field label="Amount">
                  <NumberInput value={item.amount} prefix="R" onChange={v => {
                    const items = [...coverageItems]; items[i] = { ...items[i], amount: v }; updateField('coverageInfo.items', items);
                  }} />
                </Field>
                <Field label="Period">
                  <SingleSelect value={item.period} onChange={v => {
                    const items = [...coverageItems]; items[i] = { ...items[i], period: v || '' }; updateField('coverageInfo.items', items);
                  }} options={coveragePeriodOpts} />
                </Field>
                <Field label="Constraint">
                  <input style={inputStyle} value={item.constraint || ''} onChange={e => {
                    const items = [...coverageItems]; items[i] = { ...items[i], constraint: e.target.value || null }; updateField('coverageInfo.items', items);
                  }} />
                </Field>
                <Field label="Notes">
                  <input style={inputStyle} value={item.notes || ''} onChange={e => {
                    const items = [...coverageItems]; items[i] = { ...items[i], notes: e.target.value }; updateField('coverageInfo.items', items);
                  }} />
                </Field>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => {
            updateField('coverageInfo.items', [...coverageItems, { item: '', covered: true, amount: null, period: 'annual', constraint: null, notes: '' }]);
          }} style={{ padding: '8px 16px', background: '#334155', color: '#94a3b8', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
            + Add Coverage Item
          </button>
        </div>
      </Section>

      {/* ====== OBLIGATIONS - WORK-BACK ====== */}
      <Section title="Obligations - Work-Back" defaultOpen={false} color="#fb923c">
        <Grid>
          <Field label="Required">
            <TriStateToggle value={getBool(workBack, 'required')} onChange={v => updateField('obligations.workBack.required', v)} />
          </Field>
          <Field label="Years per Study Year">
            <NumberInput value={getNum(workBack, 'yearsPerStudyYear')} onChange={v => updateField('obligations.workBack.yearsPerStudyYear', v)} step={0.5} />
          </Field>
          <Field label="Employer Type">
            <SingleSelect value={workBack.employerType as string} onChange={v => updateField('obligations.workBack.employerType', v)} options={employerTypeOpts} />
          </Field>
          <Field label="Location Restriction">
            <input style={inputStyle} value={getStr(workBack, 'locationRestriction')} onChange={e => updateField('obligations.workBack.locationRestriction', e.target.value || null)} />
          </Field>
          <Field label="Breach Penalty" fullWidth>
            <textarea style={{ ...inputStyle, minHeight: 50 }} value={getStr(workBack, 'breachPenalty')} onChange={e => updateField('obligations.workBack.breachPenalty', e.target.value || null)} />
          </Field>
        </Grid>
      </Section>

      {/* ====== OBLIGATIONS - DURING STUDIES ====== */}
      <Section title="Obligations - During Studies" defaultOpen={false} color="#fb923c">
        <Grid>
          <Field label="Vacation Work Required">
            <Toggle value={!!duringStudies.vacationWorkRequired} onChange={v => updateField('obligations.duringStudies.vacationWorkRequired', v)} />
          </Field>
          <Field label="Vacation Work Weeks/Year">
            <NumberInput value={getNum(duringStudies, 'vacationWorkWeeksPerYear')} onChange={v => updateField('obligations.duringStudies.vacationWorkWeeksPerYear', v)} min={0} />
          </Field>
          <Field label="Vacation Work Paid">
            <TriStateToggle value={getBool(duringStudies, 'vacationWorkPaid')} onChange={v => updateField('obligations.duringStudies.vacationWorkPaid', v)} />
          </Field>
          <Field label="Mentorship Required">
            <Toggle value={!!duringStudies.mentorshipRequired} onChange={v => updateField('obligations.duringStudies.mentorshipRequired', v)} />
          </Field>
          <Field label="Community Service Hours/Year">
            <NumberInput value={getNum(duringStudies, 'communityServiceHoursPerYear')} onChange={v => updateField('obligations.duringStudies.communityServiceHoursPerYear', v)} min={0} />
          </Field>
          <Field label="Community Service Description" fullWidth>
            <textarea style={{ ...inputStyle, minHeight: 50 }} value={getStr(duringStudies, 'communityServiceDescription')} onChange={e => updateField('obligations.duringStudies.communityServiceDescription', e.target.value || null)} />
          </Field>
        </Grid>
      </Section>

      {/* ====== OBLIGATIONS - ACADEMIC ====== */}
      <Section title="Obligations - Academic" defaultOpen={false} color="#fb923c">
        <Grid>
          <Field label="Maintenance Average">
            <NumberInput value={getNum(acadOblig, 'maintenanceAverage')} onChange={v => updateField('obligations.academic.maintenanceAverage', v)} min={0} max={100} suffix="%" />
          </Field>
          <Field label="Reporting Frequency">
            <SingleSelect value={acadOblig.reportingFrequency as string} onChange={v => updateField('obligations.academic.reportingFrequency', v)} options={reportingFreqOpts} />
          </Field>
          <Field label="Min Credits per Year">
            <NumberInput value={getNum(acadOblig, 'minCreditsPerYear')} onChange={v => updateField('obligations.academic.minCreditsPerYear', v)} min={0} />
          </Field>
          <Field label="Propensity to Graduate Letter">
            <Toggle value={!!acadOblig.propensityToGraduateLetter} onChange={v => updateField('obligations.academic.propensityToGraduateLetter', v)} />
          </Field>
        </Grid>
      </Section>

      {/* ====== APPLICATION ====== */}
      <Section title="Application" defaultOpen={false} color="#22d3ee">
        <Field label="Status" fullWidth>
          <RadioGroup value={application.status as string} onChange={v => updateField('application.status', v)} options={statusOpts} />
        </Field>
        <Grid>
          <Field label="Cycle Year">
            <NumberInput value={getNum(application, 'cycleYear')} onChange={v => updateField('application.cycleYear', v)} placeholder="e.g. 2026" />
          </Field>
          <Field label="Is Recurring">
            <Toggle value={!!application.isRecurring} onChange={v => updateField('application.isRecurring', v)} />
          </Field>
          <Field label="Opening Date">
            <input style={inputStyle} type="date" value={getStr(application, 'openingDate')} onChange={e => updateField('application.openingDate', e.target.value || null)} />
          </Field>
          <Field label="Closing Date">
            <input style={inputStyle} type="date" value={getStr(application, 'closingDate')} onChange={e => updateField('application.closingDate', e.target.value || null)} />
          </Field>
          <Field label="Official URL">
            <UrlInput value={application.officialUrl as string} onChange={v => updateField('application.officialUrl', v)} />
          </Field>
          <Field label="Portal URL">
            <UrlInput value={application.portalUrl as string} onChange={v => updateField('application.portalUrl', v)} />
          </Field>
          <Field label="Contact Email">
            <EmailInput value={application.contactEmail as string} onChange={v => updateField('application.contactEmail', v)} />
          </Field>
          <Field label="Contact Phone">
            <input style={inputStyle} value={getStr(application, 'contactPhone')} onChange={e => updateField('application.contactPhone', e.target.value || null)} />
          </Field>
          <Field label="Is Public Offering">
            <Toggle value={!!application.isPublicOffering} onChange={v => updateField('application.isPublicOffering', v)} />
          </Field>
          <Field label="Certification Required">
            <Toggle value={!!application.certificationRequired} onChange={v => updateField('application.certificationRequired', v)} />
          </Field>
          <Field label="Certification Max Months">
            <NumberInput value={getNum(application, 'certificationMaxMonths')} onChange={v => updateField('application.certificationMaxMonths', v)} min={0} />
          </Field>
          <Field label="Reference Letters">
            <NumberInput value={getNum(application, 'referenceLetters')} onChange={v => updateField('application.referenceLetters', v)} min={0} />
          </Field>
          <Field label="Turnaround Weeks">
            <NumberInput value={getNum(application, 'turnaroundWeeks')} onChange={v => updateField('application.turnaroundWeeks', v)} min={0} />
          </Field>
        </Grid>
        <Field label="Application Modes" fullWidth>
          <MultiSelectChips values={getArr(application, 'modes')} onChange={v => updateField('application.modes', v)} options={modeOpts} />
        </Field>
        <Field label="Required Documents" fullWidth>
          <TagChipInput
            values={getArr(application, 'requiredDocuments')}
            onChange={v => updateField('application.requiredDocuments', v)}
            suggestions={['Certified ID copy', 'Academic transcript', 'Proof of income', 'Proof of registration', 'Motivation letter', 'CV']}
          />
        </Field>
        <Field label="Stages" fullWidth>
          <TagChipInput values={getArr(application, 'stages')} onChange={v => updateField('application.stages', v)} />
        </Field>
      </Section>

      {/* ====== RENEWAL ====== */}
      <Section title="Renewal" defaultOpen={false} color="#a78bfa">
        <Grid>
          <Field label="Mechanism">
            <SingleSelect value={renewal.mechanism as string} onChange={v => updateField('renewal.mechanism', v)} options={renewalMechOpts} />
          </Field>
          <Field label="Max Tenure Years">
            <NumberInput value={getNum(renewal, 'maxTenureYears')} onChange={v => updateField('renewal.maxTenureYears', v)} min={0} />
          </Field>
          <Field label="Grace Period Years">
            <NumberInput value={getNum(renewal, 'gracePeriodYears')} onChange={v => updateField('renewal.gracePeriodYears', v)} min={0} />
          </Field>
          <Field label="Failed Module Policy">
            <SingleSelect value={renewal.failedModulePolicy as string} onChange={v => updateField('renewal.failedModulePolicy', v)} options={failedModuleOpts} />
          </Field>
          <Field label="Transferable University">
            <Toggle value={!!renewal.transferableUniversity} onChange={v => updateField('renewal.transferableUniversity', v)} />
          </Field>
          <Field label="Transferable Degree">
            <Toggle value={!!renewal.transferableDegree} onChange={v => updateField('renewal.transferableDegree', v)} />
          </Field>
          <Field label="Dropout Repayment">
            <Toggle value={!!renewal.dropoutRepayment} onChange={v => updateField('renewal.dropoutRepayment', v)} />
          </Field>
        </Grid>
      </Section>

      {/* Bottom save */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16, marginBottom: 40 }}>
        <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
