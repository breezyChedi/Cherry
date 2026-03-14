'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  inputStyle, Field, Grid, Section, SingleSelect, MultiSelectChips,
  TriStateToggle, Toggle, TagChipInput, NumberInput, RadioGroup,
  UrlInput, EmailInput,
} from '@/app/admin/components/FormControls';

// === Option Maps ===

const institutionTypeOpts = [
  { value: 'public_tvet', label: 'Public TVET College' }, { value: 'cet_college', label: 'CET College' },
  { value: 'private_college', label: 'Private College' }, { value: 'private_hei', label: 'Private Higher Education Institution' },
  { value: 'flight_school', label: 'Flight School' }, { value: 'culinary_school', label: 'Culinary School' },
  { value: 'film_school', label: 'Film School' }, { value: 'agricultural_college', label: 'Agricultural College' },
  { value: 'nursing_college', label: 'Nursing College' }, { value: 'maritime_academy', label: 'Maritime Academy' },
  { value: 'beauty_academy', label: 'Beauty Academy' }, { value: 'it_bootcamp', label: 'IT Bootcamp' },
  { value: 'security_training', label: 'Security Training' }, { value: 'theological_college', label: 'Theological College' },
  { value: 'music_academy', label: 'Music Academy' }, { value: 'sports_academy', label: 'Sports Academy' },
  { value: 'ecd_college', label: 'ECD College' }, { value: 'short_course_provider', label: 'Short Course Provider' },
  { value: 'other', label: 'Other' },
];

const provinceOpts = [
  'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State',
  'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape',
].map(p => ({ value: p, label: p }));

const regBodyOpts = [
  { value: 'DHET', label: 'DHET' }, { value: 'UMALUSI', label: 'UMALUSI' },
  { value: 'CHE', label: 'CHE' }, { value: 'SAQA', label: 'SAQA' }, { value: 'QCTO', label: 'QCTO' },
];

const regTypeOpts = [
  { value: 'government_registration', label: 'Government Registration' },
  { value: 'quality_council', label: 'Quality Council' },
  { value: 'sector_regulator', label: 'Sector Regulator' },
  { value: 'seta', label: 'SETA' },
  { value: 'professional_body', label: 'Professional Body' },
];

const qualLevelOpts = [
  { value: 'NCV Level 2-4', label: 'NCV Level 2-4' }, { value: 'NATED N1-N3', label: 'NATED N1-N3' },
  { value: 'NATED N4-N6', label: 'NATED N4-N6' }, { value: 'Occupational Certificate', label: 'Occupational Certificate' },
  { value: 'Skills Programme', label: 'Skills Programme' }, { value: 'Learnership', label: 'Learnership' },
  { value: 'Apprenticeship', label: 'Apprenticeship' }, { value: 'Short Course', label: 'Short Course' },
  { value: 'Higher Certificate', label: 'Higher Certificate' }, { value: 'Advanced Certificate', label: 'Advanced Certificate' },
  { value: 'Diploma', label: 'Diploma' }, { value: 'Trade Test', label: 'Trade Test' }, { value: 'Other', label: 'Other' },
];

const qualTypeOpts = [
  { value: 'ncv', label: 'NCV' }, { value: 'nated', label: 'NATED' },
  { value: 'occupational_certificate', label: 'Occupational Certificate' },
  { value: 'learnership', label: 'Learnership' }, { value: 'apprenticeship', label: 'Apprenticeship' },
  { value: 'skills_programme', label: 'Skills Programme' }, { value: 'short_course', label: 'Short Course' },
  { value: 'higher_certificate', label: 'Higher Certificate' }, { value: 'advanced_certificate', label: 'Advanced Certificate' },
  { value: 'diploma', label: 'Diploma' }, { value: 'trade_test', label: 'Trade Test' },
  { value: 'sector_license', label: 'Sector License' }, { value: 'international_certification', label: 'International Certification' },
  { value: 'other', label: 'Other' },
];

const durationUnitOpts = [
  { value: 'years', label: 'Years' }, { value: 'months', label: 'Months' },
  { value: 'weeks', label: 'Weeks' }, { value: 'days', label: 'Days' }, { value: 'hours', label: 'Hours' },
];

const studyModeOpts = [
  { value: 'full_time', label: 'Full Time' }, { value: 'part_time', label: 'Part Time' },
  { value: 'distance', label: 'Distance / Online' }, { value: 'block_release', label: 'Block Release' },
];

const minQualOpts = [
  { value: 'none', label: 'No Formal Qualification' }, { value: 'abet_level_4', label: 'ABET Level 4' },
  { value: 'grade_9_getc', label: 'Grade 9 / GETC' }, { value: 'grade_10', label: 'Grade 10' },
  { value: 'grade_11', label: 'Grade 11' }, { value: 'grade_12_any', label: 'Grade 12 / Matric (Any Pass)' },
  { value: 'nsc_higher_cert', label: 'NSC Higher Certificate Pass' },
  { value: 'nsc_diploma', label: 'NSC Diploma Pass' }, { value: 'nsc_bachelor', label: "NSC Bachelor's Pass" },
  { value: 'senior_cert_old', label: 'Old Senior Certificate (pre-2008)' },
  { value: 'ncv_level_2', label: 'NCV Level 2' }, { value: 'ncv_level_3', label: 'NCV Level 3' },
  { value: 'ncv_level_4', label: 'NCV Level 4' }, { value: 'n3_certificate', label: 'National N3 Certificate' },
  { value: 'n6_certificate', label: 'National N6 Certificate' },
  { value: 'nqf_level_2', label: 'NQF Level 2 Equivalent' }, { value: 'nqf_level_3', label: 'NQF Level 3 Equivalent' },
  { value: 'nqf_level_4', label: 'NQF Level 4 Equivalent' }, { value: 'nqf_level_5', label: 'NQF Level 5 Equivalent' },
  { value: 'prior_diploma', label: 'Completed Diploma' }, { value: 'prior_degree', label: 'Completed Degree' },
  { value: 'other', label: 'Other' },
];

const addReqTypeOpts = [
  { value: 'placement_test', label: 'Placement Test' }, { value: 'interview', label: 'Interview' },
  { value: 'portfolio', label: 'Portfolio' }, { value: 'audition', label: 'Audition' },
  { value: 'medical_certificate', label: 'Medical Certificate' }, { value: 'physical_fitness', label: 'Physical Fitness' },
  { value: 'swim_test', label: 'Swim Test' }, { value: 'criminal_clearance', label: 'Criminal Clearance' },
  { value: 'driver_license', label: "Driver's License" }, { value: 'vaccination', label: 'Vaccination' },
  { value: 'prior_experience', label: 'Prior Experience' }, { value: 'age_min', label: 'Minimum Age' },
  { value: 'age_max', label: 'Maximum Age' }, { value: 'language_proficiency', label: 'Language Proficiency' },
  { value: 'employer_sponsorship', label: 'Employer Sponsorship' },
  { value: 'psira_registration', label: 'PSIRA Registration' }, { value: 'other', label: 'Other' },
];

const feeItemOpts = [
  { value: 'tuition', label: 'Tuition' }, { value: 'registration', label: 'Registration' },
  { value: 'equipment', label: 'Equipment' }, { value: 'exam', label: 'Exam Fees' },
  { value: 'flight_hours', label: 'Flight Hours' }, { value: 'uniform', label: 'Uniform' },
  { value: 'textbooks', label: 'Textbooks' }, { value: 'medical_cert', label: 'Medical Certificate' },
  { value: 'professional_registration', label: 'Professional Registration' }, { value: 'other', label: 'Other' },
];

const feePeriodOpts = [
  { value: 'annual', label: 'Annual' }, { value: 'semester', label: 'Per Semester' },
  { value: 'monthly', label: 'Monthly' }, { value: 'once_off', label: 'Once-Off' },
  { value: 'per_subject', label: 'Per Subject' }, { value: 'per_hour', label: 'Per Hour' },
  { value: 'total_programme', label: 'Total Programme' },
];

const outcomeTypeOpts = [
  { value: 'certificate', label: 'Certificate' }, { value: 'diploma', label: 'Diploma' },
  { value: 'occupational_certificate', label: 'Occupational Certificate' }, { value: 'license', label: 'License' },
];

const certifiedByOpts = [
  { value: 'UMALUSI', label: 'UMALUSI' }, { value: 'DHET', label: 'DHET' }, { value: 'QCTO', label: 'QCTO' },
];

const intakeFreqOpts = [
  { value: 'annual', label: 'Annual' }, { value: 'biannual', label: 'Twice a Year' },
  { value: 'rolling', label: 'Rolling Admissions' }, { value: 'quarterly', label: 'Quarterly' },
];

const monthOpts = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
].map(m => ({ value: m, label: m }));

// === Types ===

type AnyObj = Record<string, unknown>;
type Qual = AnyObj;
type Dept = { name: string; qualifications: Qual[] };
type Reg = { body: string; registrationNumber: string; type: string };
type Campus = { name: string; city: string; province: string };

const getStr = (o: AnyObj | undefined, k: string): string => { const v = (o || {})[k]; return typeof v === 'string' ? v : ''; };
const getNum = (o: AnyObj | undefined, k: string): number | null => { const v = (o || {})[k]; return typeof v === 'number' ? v : null; };
const getArr = (o: AnyObj | undefined, k: string): string[] => { const v = (o || {})[k]; return Array.isArray(v) ? v : []; };
const getBool = (o: AnyObj | undefined, k: string): boolean | null => { const v = (o || {})[k]; return v === true ? true : v === false ? false : null; };

// Parse a possibly-JSON-string field
function parseJsonField(obj: AnyObj, field: string): unknown {
  const v = obj[field];
  if (typeof v === 'string') { try { return JSON.parse(v); } catch { return null; } }
  return v ?? null;
}

// === Qualification Editor ===

function QualificationEditor({ qual, onChange, campusList }: { qual: Qual; onChange: (q: Qual) => void; campusList: string[] }) {
  const u = (key: string, val: unknown) => onChange({ ...qual, [key]: val });
  const dur = (qual.duration || {}) as AnyObj;
  const adm = (qual.admission || {}) as AnyObj;
  const addReqs = Array.isArray(adm.additionalRequirements) ? adm.additionalRequirements as AnyObj[] : [];
  const fees = Array.isArray(qual.fees) ? qual.fees as AnyObj[] : [];
  const sched = (qual.scheduling || {}) as AnyObj;
  const struct = (qual.structure || {}) as AnyObj;
  const intern = (struct.internship || {}) as AnyObj;

  const updateDur = (k: string, v: unknown) => u('duration', { ...dur, [k]: v });
  const updateAdm = (k: string, v: unknown) => u('admission', { ...adm, [k]: v });
  const updateSched = (k: string, v: unknown) => u('scheduling', { ...sched, [k]: v });
  const updateStruct = (k: string, v: unknown) => u('structure', { ...struct, [k]: v });
  const updateIntern = (k: string, v: unknown) => u('structure', { ...struct, internship: { ...intern, [k]: v } });

  const campusOpts = campusList.map(c => ({ value: c, label: c }));

  return (
    <div style={{ padding: 16, background: '#1e293b', borderRadius: 8, marginBottom: 8 }}>
      {/* Basic Info */}
      <Grid>
        <Field label="ID">
          <input style={{ ...inputStyle, opacity: 0.6 }} value={getStr(qual, 'id')} readOnly />
        </Field>
        <Field label="Name">
          <input style={inputStyle} value={getStr(qual, 'name')} onChange={e => u('name', e.target.value)} />
        </Field>
        <Field label="Short Name">
          <input style={inputStyle} value={getStr(qual, 'shortName')} onChange={e => u('shortName', e.target.value || null)} />
        </Field>
        <Field label="Code (SAQA ID)">
          <input style={inputStyle} value={getStr(qual, 'code')} onChange={e => u('code', e.target.value || null)} />
        </Field>
        <Field label="Level">
          <SingleSelect value={qual.level as string} onChange={v => u('level', v)} options={qualLevelOpts} />
        </Field>
        <Field label="Qualification Type">
          <SingleSelect value={qual.qualificationType as string} onChange={v => u('qualificationType', v)} options={qualTypeOpts} />
        </Field>
        <Field label="NQF Level">
          <NumberInput value={getNum(qual, 'nqfLevel')} onChange={v => u('nqfLevel', v)} min={1} max={10} />
        </Field>
        <Field label="Credit Value">
          <NumberInput value={getNum(qual, 'creditValue')} onChange={v => u('creditValue', v)} />
        </Field>
        <Field label="Outcome Type">
          <SingleSelect value={qual.outcomeType as string} onChange={v => u('outcomeType', v)} options={outcomeTypeOpts} />
        </Field>
        <Field label="Award Title">
          <input style={inputStyle} value={getStr(qual, 'awardTitle')} onChange={e => u('awardTitle', e.target.value || null)} />
        </Field>
        <Field label="Certified By">
          <SingleSelect value={qual.certifiedBy as string} onChange={v => u('certifiedBy', v)} options={certifiedByOpts} placeholder="Select or type..." />
        </Field>
        <Field label="Unit Standard Based">
          <Toggle value={!!qual.isUnitStandardBased} onChange={v => u('isUnitStandardBased', v)} />
        </Field>
      </Grid>

      <Field label="Description" fullWidth>
        <textarea style={{ ...inputStyle, minHeight: 50 }} value={getStr(qual, 'description')} onChange={e => u('description', e.target.value || null)} />
      </Field>

      {/* Duration */}
      <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 4, fontWeight: 500, marginTop: 8 }}>Duration</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 8, marginBottom: 16 }}>
        <NumberInput value={getNum(dur, 'value')} onChange={v => updateDur('value', v)} placeholder="Value" />
        <SingleSelect value={dur.unit as string} onChange={v => updateDur('unit', v)} options={durationUnitOpts} />
        <input style={inputStyle} value={getStr(dur, 'displayString')} onChange={e => updateDur('displayString', e.target.value || null)} placeholder="Display string (auto)" />
      </div>

      {/* Study Modes & Campuses */}
      <Field label="Study Modes" fullWidth>
        <MultiSelectChips values={getArr(qual, 'studyModes')} onChange={v => u('studyModes', v)} options={studyModeOpts} />
      </Field>
      {campusList.length > 0 && (
        <Field label="Campuses" fullWidth>
          <MultiSelectChips values={getArr(qual, 'campuses')} onChange={v => u('campuses', v)} options={campusOpts} />
        </Field>
      )}

      {/* Admission */}
      <label style={{ display: 'block', color: '#c084fc', fontSize: 13, fontWeight: 600, marginBottom: 8, marginTop: 8 }}>Admission</label>
      <Grid>
        <Field label="Min Qualification">
          <SingleSelect value={adm.minQualification as string} onChange={v => updateAdm('minQualification', v)} options={minQualOpts} />
        </Field>
        <Field label="Min Qualification Display">
          <input style={inputStyle} value={getStr(adm, 'minQualificationDisplay')} onChange={e => updateAdm('minQualificationDisplay', e.target.value || null)} placeholder="Auto-filled, editable" />
        </Field>
        <Field label="RPL Accepted">
          <Toggle value={!!adm.rplAccepted} onChange={v => updateAdm('rplAccepted', v)} />
        </Field>
      </Grid>
      <Field label="Admission Notes" fullWidth>
        <textarea style={{ ...inputStyle, minHeight: 40 }} value={getStr(adm, 'notes')} onChange={e => updateAdm('notes', e.target.value || null)} />
      </Field>

      {/* Additional Requirements */}
      <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 6, fontWeight: 500 }}>Additional Requirements</label>
      {addReqs.map((req, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr auto', gap: 8, marginBottom: 6 }}>
          <SingleSelect value={req.type as string} onChange={v => {
            const arr = [...addReqs]; arr[i] = { ...arr[i], type: v || '' }; updateAdm('additionalRequirements', arr);
          }} options={addReqTypeOpts} placeholder="Type..." />
          <input style={inputStyle} value={(req.value as string) || ''} onChange={e => {
            const arr = [...addReqs]; arr[i] = { ...arr[i], value: e.target.value || null }; updateAdm('additionalRequirements', arr);
          }} placeholder="Value" />
          <input style={inputStyle} value={(req.detail as string) || ''} onChange={e => {
            const arr = [...addReqs]; arr[i] = { ...arr[i], detail: e.target.value }; updateAdm('additionalRequirements', arr);
          }} placeholder="Detail" />
          <button type="button" onClick={() => {
            const arr = [...addReqs]; arr.splice(i, 1); updateAdm('additionalRequirements', arr);
          }} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 11 }}>X</button>
        </div>
      ))}
      <button type="button" onClick={() => updateAdm('additionalRequirements', [...addReqs, { type: '', value: null, detail: '' }])}
        style={{ padding: '4px 12px', background: '#334155', color: '#94a3b8', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, marginBottom: 12 }}>
        + Add Requirement
      </button>

      {/* Fees */}
      <label style={{ display: 'block', color: '#c084fc', fontSize: 13, fontWeight: 600, marginBottom: 8, marginTop: 8 }}>Fees</label>
      {fees.map((fee, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 2fr auto', gap: 8, marginBottom: 6 }}>
          <SingleSelect value={fee.item as string} onChange={v => {
            const arr = [...fees]; arr[i] = { ...arr[i], item: v || '' }; u('fees', arr);
          }} options={feeItemOpts} placeholder="Item..." />
          <NumberInput value={getNum(fee, 'amount')} prefix="R" onChange={v => {
            const arr = [...fees]; arr[i] = { ...arr[i], amount: v }; u('fees', arr);
          }} />
          <SingleSelect value={fee.period as string} onChange={v => {
            const arr = [...fees]; arr[i] = { ...arr[i], period: v || '' }; u('fees', arr);
          }} options={feePeriodOpts} placeholder="Period..." />
          <input style={inputStyle} value={(fee.detail as string) || ''} onChange={e => {
            const arr = [...fees]; arr[i] = { ...arr[i], detail: e.target.value }; u('fees', arr);
          }} placeholder="Detail" />
          <button type="button" onClick={() => { const arr = [...fees]; arr.splice(i, 1); u('fees', arr); }}
            style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 11 }}>X</button>
        </div>
      ))}
      <button type="button" onClick={() => u('fees', [...fees, { item: '', amount: null, period: 'annual', detail: '' }])}
        style={{ padding: '4px 12px', background: '#334155', color: '#94a3b8', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, marginBottom: 12 }}>
        + Add Fee
      </button>

      {/* Career / Skills / Industries */}
      <Field label="Career Opportunities" fullWidth>
        <TagChipInput values={getArr(qual, 'careerOpportunities')} onChange={v => u('careerOpportunities', v)} />
      </Field>
      <Field label="Skills" fullWidth>
        <TagChipInput values={getArr(qual, 'skills')} onChange={v => u('skills', v)} />
      </Field>
      <Field label="Industries" fullWidth>
        <TagChipInput values={getArr(qual, 'industries')} onChange={v => u('industries', v)} />
      </Field>
      <Field label="Focal Areas" fullWidth>
        <TagChipInput values={getArr(qual, 'focalAreas')} onChange={v => u('focalAreas', v)} />
      </Field>

      {/* Scheduling */}
      <label style={{ display: 'block', color: '#c084fc', fontSize: 13, fontWeight: 600, marginBottom: 8, marginTop: 8 }}>Scheduling</label>
      <Field label="Intake Months" fullWidth>
        <MultiSelectChips values={getArr(sched, 'intakeMonths')} onChange={v => updateSched('intakeMonths', v)} options={monthOpts} />
      </Field>
      <Field label="Intake Frequency">
        <SingleSelect value={sched.intakeFrequency as string} onChange={v => updateSched('intakeFrequency', v)} options={intakeFreqOpts} />
      </Field>

      {/* Structure */}
      <label style={{ display: 'block', color: '#c084fc', fontSize: 13, fontWeight: 600, marginBottom: 8, marginTop: 8 }}>Structure</label>
      <Grid>
        <Field label="Theory/Practical Split">
          <input style={inputStyle} value={getStr(struct, 'theoryPracticalSplit')} onChange={e => updateStruct('theoryPracticalSplit', e.target.value || null)} placeholder="e.g. 50/50" />
        </Field>
        <Field label="Logbook Required">
          <Toggle value={!!struct.logbookRequired} onChange={v => updateStruct('logbookRequired', v)} />
        </Field>
        <Field label="Trade Test Required">
          <Toggle value={!!struct.tradeTestRequired} onChange={v => updateStruct('tradeTestRequired', v)} />
        </Field>
      </Grid>
      <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 4, fontWeight: 500, marginTop: 4 }}>Internship</label>
      <Grid>
        <Field label="Required">
          <Toggle value={!!intern.required} onChange={v => updateIntern('required', v)} />
        </Field>
        <Field label="Duration (months)">
          <NumberInput value={getNum(intern, 'durationMonths')} onChange={v => updateIntern('durationMonths', v)} />
        </Field>
        <Field label="Paid">
          <TriStateToggle value={getBool(intern, 'paid')} onChange={v => updateIntern('paid', v)} />
        </Field>
        <Field label="Placement Guaranteed">
          <Toggle value={!!intern.placementGuaranteed} onChange={v => updateIntern('placementGuaranteed', v)} />
        </Field>
      </Grid>
    </div>
  );
}

// === Main Page ===

export default function CollegeEditPage({ params }: { params: Promise<{ name: string }> }) {
  const { name: encodedName } = use(params);
  const name = decodeURIComponent(encodedName);
  const router = useRouter();
  const [data, setData] = useState<AnyObj | null>(null);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [nodeId, setNodeId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [expandedQuals, setExpandedQuals] = useState<Record<string, boolean>>({});
  const [galleryPhotos, setGalleryPhotos] = useState<{ id: string; url: string; label: string; campus?: string }[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoLabel, setPhotoLabel] = useState('');
  const [photoCampus, setPhotoCampus] = useState('');

  useEffect(() => {
    fetch(`/api/admin/colleges/${encodeURIComponent(name)}`, { credentials: 'include' })
      .then(r => r.json())
      .then(result => {
        if (result.error) return;
        const inst = result.institution || {};
        if (typeof inst.registrationsJson === 'string') {
          try { inst.registrations = JSON.parse(inst.registrationsJson); } catch { /* skip */ }
        }
        if (typeof inst.campusesJson === 'string') {
          try { inst.campuses = JSON.parse(inst.campusesJson); } catch { /* skip */ }
        }
        if (!Array.isArray(inst.registrations)) inst.registrations = [];
        if (!Array.isArray(inst.campuses)) inst.campuses = [];
        setData(inst);
        setNodeId(String(result.nodeId || ''));
        // Parse JSON fields in qualifications
        const depts = (result.departments || []).map((d: Dept) => ({
          name: d.name,
          qualifications: d.qualifications.map((q: AnyObj) => {
            const parsed = { ...q };
            if (typeof q.durationJson === 'string') { try { parsed.duration = JSON.parse(q.durationJson as string); } catch { /* skip */ } }
            if (typeof q.admissionJson === 'string') { try { parsed.admission = JSON.parse(q.admissionJson as string); } catch { /* skip */ } }
            if (typeof q.feesJson === 'string') { try { parsed.fees = JSON.parse(q.feesJson as string); } catch { /* skip */ } }
            if (typeof q.schedulingJson === 'string') { try { parsed.scheduling = JSON.parse(q.schedulingJson as string); } catch { /* skip */ } }
            if (typeof q.structureJson === 'string') { try { parsed.structure = JSON.parse(q.structureJson as string); } catch { /* skip */ } }
            if (!parsed.duration) parsed.duration = {};
            if (!parsed.admission) parsed.admission = {};
            if (!Array.isArray(parsed.fees)) parsed.fees = [];
            if (!parsed.scheduling) parsed.scheduling = {};
            if (!parsed.structure) parsed.structure = {};
            return parsed;
          }),
        }));
        setDepartments(depts);
      })
      .finally(() => setLoading(false));
  }, [name]);

  // Fetch campus gallery from GCS manifest (try direct GCS, fallback to API proxy)
  useEffect(() => {
    if (!nodeId) return;
    setLoadingGallery(true);
    console.log(`[Gallery] Fetching manifest for nodeId="${nodeId}"`);
    fetch(`/api/admin/campus-gallery?nodeId=${nodeId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(result => {
        console.log(`[Gallery] API response:`, result);
        if (result.photos) {
          setGalleryPhotos(result.photos);
        } else {
          console.log(`[Gallery] No photos found. Available institution keys:`, result.availableKeys?.slice(0, 10));
        }
      })
      .catch(err => { console.error(`[Gallery] Fetch failed:`, err); })
      .finally(() => setLoadingGallery(false));
  }, [nodeId]);

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
      const payload = { institution: { ...data, isCollege: data.isCollege !== false }, departments };
      const res = await fetch('/api/admin/colleges', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), credentials: 'include',
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
    } catch { /* skip */ }
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
    } catch { /* skip */ }
    setUploadingHero(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !photoLabel.trim()) return;
    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('institutionName', name);
    formData.append('slug', name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    formData.append('label', photoLabel.trim());
    if (photoCampus) formData.append('campus', photoCampus);
    try {
      const res = await fetch('/api/admin/upload/campus-photo', { method: 'POST', body: formData, credentials: 'include' });
      const result = await res.json();
      if (result.photoEntry) {
        setGalleryPhotos(prev => [...prev, result.photoEntry]);
        setPhotoLabel('');
        setPhotoCampus('');
      } else if (result.error) {
        setMessage('Photo upload error: ' + result.error);
      }
    } catch { /* skip */ }
    setUploadingPhoto(false);
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Remove this photo from the gallery?')) return;
    try {
      const res = await fetch('/api/admin/upload/campus-photo', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ institutionName: name, photoId }),
        credentials: 'include',
      });
      if (res.ok) {
        setGalleryPhotos(prev => prev.filter(p => p.id !== photoId));
      }
    } catch { /* skip */ }
  };

  if (loading) return <div style={{ padding: 40, color: '#64748b' }}>Loading...</div>;
  if (!data) return <div style={{ padding: 40, color: '#f87171' }}>Institution not found</div>;

  const registrations = (Array.isArray(data.registrations) ? data.registrations : []) as Reg[];
  const campuses = (Array.isArray(data.campuses) ? data.campuses : []) as Campus[];
  const campusNames = campuses.map(c => c.name).filter(Boolean);

  return (
    <div style={{ maxWidth: 960 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <button onClick={() => router.push('/admin/colleges')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: 13, marginBottom: 8 }}>
            &larr; Back to Institutions
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

      {/* ====== INSTITUTION DETAILS ====== */}
      <Section title="Institution Details" defaultOpen={true} color="#60a5fa">
        <Grid>
          <Field label="Name">
            <input style={inputStyle} value={getStr(data, 'name')} onChange={e => updateField('name', e.target.value)} />
          </Field>
          <Field label="Short Name">
            <input style={inputStyle} value={getStr(data, 'shortName')} onChange={e => updateField('shortName', e.target.value || null)} />
          </Field>
          <Field label="Type">
            <SingleSelect value={data.institutionType as string} onChange={v => updateField('institutionType', v)} options={institutionTypeOpts} />
          </Field>
          <Field label="Public / Private">
            <RadioGroup value={data.publicOrPrivate as string} onChange={v => updateField('publicOrPrivate', v)} options={[{ value: 'public', label: 'Public' }, { value: 'private', label: 'Private' }]} />
          </Field>
          <Field label="Website URL">
            <UrlInput value={data.websiteUrl as string} onChange={v => updateField('websiteUrl', v)} />
          </Field>
          <Field label="General Email">
            <EmailInput value={data.generalEmail as string} onChange={v => updateField('generalEmail', v)} />
          </Field>
          <Field label="Admissions Email">
            <EmailInput value={data.admissionsEmail as string} onChange={v => updateField('admissionsEmail', v)} />
          </Field>
          <Field label="Phone">
            <input style={inputStyle} value={getStr(data, 'generalPhone')} onChange={e => updateField('generalPhone', e.target.value || null)} />
          </Field>
        </Grid>
        <Field label="Description" fullWidth>
          <textarea style={{ ...inputStyle, minHeight: 60 }} value={getStr(data, 'description')} onChange={e => updateField('description', e.target.value || null)} />
        </Field>
        <Grid>
          <Field label="NSFAS Eligible">
            <Toggle value={!!data.nsfasEligible} onChange={v => updateField('nsfasEligible', v)} />
          </Field>
          <Field label="Receives Government Subsidy">
            <Toggle value={!!data.receivesGovernmentSubsidy} onChange={v => updateField('receivesGovernmentSubsidy', v)} />
          </Field>
          <Field label="Accommodation Available">
            <Toggle value={!!data.accommodationAvailable} onChange={v => updateField('accommodationAvailable', v)} />
          </Field>
          <Field label="Pass Rate">
            <input style={inputStyle} value={getStr(data, 'passRate')} onChange={e => updateField('passRate', e.target.value || null)} placeholder="e.g. 85%" />
          </Field>
        </Grid>
        <Field label="Facilities" fullWidth>
          <TagChipInput values={getArr(data, 'facilities')} onChange={v => updateField('facilities', v)}
            suggestions={['Library', 'Computer Labs', 'Workshops', 'Science Labs', 'Sports Facilities', 'Student Centre', 'Cafeteria']} />
        </Field>
        <Field label="Student Support" fullWidth>
          <TagChipInput values={getArr(data, 'studentSupport')} onChange={v => updateField('studentSupport', v)}
            suggestions={['Student Support Services', 'Career Guidance', 'Counselling', 'Disability Support', 'Financial Aid Office']} />
        </Field>
        <Field label="Industry Partnerships" fullWidth>
          <TagChipInput values={getArr(data, 'industryPartnerships')} onChange={v => updateField('industryPartnerships', v)} />
        </Field>
      </Section>

      {/* ====== IMAGE MANAGEMENT ====== */}
      <Section title="Image Management" defaultOpen={true} color="#f59e0b">
        {/* --- Logo --- */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ margin: '0 0 8px', fontSize: 14, color: '#e2e8f0' }}>Logo</h4>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {getStr(data, 'logoUrl') && (
              <img
                src={`https://storage.googleapis.com/cherry-app-assets${getStr(data, 'logoUrl')}`}
                alt="Logo"
                style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 6, background: '#0f172a', padding: 4, border: '1px solid #334155' }}
              />
            )}
            <div style={{ flex: 1 }}>
              <input style={{ ...inputStyle, marginBottom: 6 }} value={getStr(data, 'logoUrl')} readOnly placeholder="No logo uploaded" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ display: 'inline-block', padding: '6px 14px', background: '#334155', color: '#e2e8f0', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                  {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoUpload} style={{ display: 'none' }} />
                </label>
                <span style={{ color: '#64748b', fontSize: 11 }}>PNG/JPG/SVG/WebP, max 400px, converted to PNG</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Hero Image --- */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ margin: '0 0 8px', fontSize: 14, color: '#e2e8f0' }}>Hero Image</h4>
          {getStr(data, 'campusImageUrl') && (
            <img
              src={getStr(data, 'campusImageUrl')}
              alt="Hero"
              style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 8, border: '1px solid #334155' }}
            />
          )}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input style={{ ...inputStyle, flex: 1 }} value={getStr(data, 'campusImageUrl')} readOnly placeholder="No hero image uploaded" />
            <label style={{ padding: '6px 14px', background: '#334155', color: '#e2e8f0', borderRadius: 6, cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' }}>
              {uploadingHero ? 'Uploading...' : 'Upload Hero'}
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleHeroUpload} style={{ display: 'none' }} />
            </label>
          </div>
          <span style={{ color: '#64748b', fontSize: 11 }}>Max 1200px, JPEG quality 80. Full URL stored in Neo4j.</span>
        </div>

        {/* --- Campus Gallery --- */}
        <div>
          <h4 style={{ margin: '0 0 8px', fontSize: 14, color: '#e2e8f0' }}>Campus Gallery</h4>
          {loadingGallery ? (
            <p style={{ color: '#64748b', fontSize: 13 }}>Loading gallery...</p>
          ) : galleryPhotos.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 12 }}>No gallery photos yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
              {galleryPhotos.map(photo => (
                <div key={photo.id} style={{ background: '#0f172a', borderRadius: 8, overflow: 'hidden', border: '1px solid #334155' }}>
                  <img src={photo.url} alt={photo.label} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                  <div style={{ padding: 8 }}>
                    <div style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 500 }}>{photo.label}</div>
                    {photo.campus && <div style={{ color: '#64748b', fontSize: 11 }}>{photo.campus}</div>}
                    <button type="button" onClick={() => handleDeletePhoto(photo.id)}
                      style={{ marginTop: 4, background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 11 }}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Photo Form */}
          <div style={{ background: '#0f172a', borderRadius: 8, padding: 12, border: '1px solid #334155' }}>
            <h5 style={{ margin: '0 0 8px', fontSize: 13, color: '#94a3b8' }}>Add Photo</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8, marginBottom: 8 }}>
              <input style={inputStyle} value={photoLabel} onChange={e => setPhotoLabel(e.target.value)}
                placeholder="Label (required) — e.g. Parktown Campus" />
              <select style={inputStyle} value={photoCampus} onChange={e => setPhotoCampus(e.target.value)}>
                <option value="">Campus (optional)</option>
                {campusNames.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{
                display: 'inline-block', padding: '6px 14px', borderRadius: 6, fontSize: 12,
                background: photoLabel.trim() ? '#2563eb' : '#334155',
                color: photoLabel.trim() ? 'white' : '#64748b',
                cursor: photoLabel.trim() ? 'pointer' : 'not-allowed',
              }}>
                {uploadingPhoto ? 'Uploading...' : 'Choose & Upload Photo'}
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePhotoUpload}
                  disabled={!photoLabel.trim() || uploadingPhoto} style={{ display: 'none' }} />
              </label>
              {!photoLabel.trim() && <span style={{ color: '#f59e0b', fontSize: 11 }}>Enter a descriptive label first</span>}
            </div>
          </div>
        </div>
      </Section>

      {/* ====== REGISTRATIONS ====== */}
      <Section title={`Registrations (${registrations.length})`} defaultOpen={false} color="#22d3ee">
        {registrations.map((reg, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr auto', gap: 8, marginBottom: 8 }}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 2 }}>Body</label>
              <SingleSelect value={reg.body} onChange={v => {
                const arr = [...registrations]; arr[i] = { ...arr[i], body: v || '' }; updateField('registrations', arr);
              }} options={regBodyOpts} placeholder="Select or type..." />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 2 }}>Registration Number</label>
              <input style={inputStyle} value={reg.registrationNumber || ''} onChange={e => {
                const arr = [...registrations]; arr[i] = { ...arr[i], registrationNumber: e.target.value }; updateField('registrations', arr);
              }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 2 }}>Type</label>
              <SingleSelect value={reg.type} onChange={v => {
                const arr = [...registrations]; arr[i] = { ...arr[i], type: v || '' }; updateField('registrations', arr);
              }} options={regTypeOpts} />
            </div>
            <button type="button" onClick={() => {
              const arr = [...registrations]; arr.splice(i, 1); updateField('registrations', arr);
            }} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 11, alignSelf: 'end', marginBottom: 4 }}>X</button>
          </div>
        ))}
        <button type="button" onClick={() => updateField('registrations', [...registrations, { body: '', registrationNumber: '', type: '' }])}
          style={{ padding: '8px 16px', background: '#334155', color: '#94a3b8', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
          + Add Registration
        </button>
      </Section>

      {/* ====== CAMPUSES ====== */}
      <Section title={`Campuses (${campuses.length})`} defaultOpen={false} color="#22d3ee">
        {campuses.map((camp, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr auto', gap: 8, marginBottom: 8 }}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 2 }}>Name</label>
              <input style={inputStyle} value={camp.name} onChange={e => {
                const arr = [...campuses]; arr[i] = { ...arr[i], name: e.target.value }; updateField('campuses', arr);
              }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 2 }}>City</label>
              <input style={inputStyle} value={camp.city || ''} onChange={e => {
                const arr = [...campuses]; arr[i] = { ...arr[i], city: e.target.value }; updateField('campuses', arr);
              }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 2 }}>Province</label>
              <SingleSelect value={camp.province} onChange={v => {
                const arr = [...campuses]; arr[i] = { ...arr[i], province: v || '' }; updateField('campuses', arr);
              }} options={provinceOpts} />
            </div>
            <button type="button" onClick={() => {
              const arr = [...campuses]; arr.splice(i, 1); updateField('campuses', arr);
            }} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 11, alignSelf: 'end', marginBottom: 4 }}>X</button>
          </div>
        ))}
        <button type="button" onClick={() => updateField('campuses', [...campuses, { name: '', city: '', province: '' }])}
          style={{ padding: '8px 16px', background: '#334155', color: '#94a3b8', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
          + Add Campus
        </button>
      </Section>

      {/* ====== DEPARTMENTS & QUALIFICATIONS ====== */}
      <Section title={`Departments (${departments.length})`} defaultOpen={true} color="#a78bfa">
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
              <button onClick={() => setDepartments(departments.filter((_, i) => i !== di))}
                style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>Remove Dept</button>
            </div>

            {/* Qualifications under this department */}
            {dept.qualifications.map((qual, qi) => {
              const qkey = `${di}-${qi}`;
              const expanded = expandedQuals[qkey];
              return (
                <div key={qi} style={{ marginBottom: 6 }}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#1e293b', borderRadius: expanded ? '6px 6px 0 0' : 6, cursor: 'pointer', border: '1px solid #334155' }}
                    onClick={() => setExpandedQuals(prev => ({ ...prev, [qkey]: !prev[qkey] }))}
                  >
                    <div>
                      <span style={{ color: '#e2e8f0', fontSize: 13 }}>{getStr(qual, 'name') || 'Unnamed'}</span>
                      <span style={{ color: '#64748b', fontSize: 11, marginLeft: 8 }}>{getStr(qual, 'level')}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ color: '#64748b', fontSize: 14 }}>{expanded ? '\u2212' : '+'}</span>
                      <button type="button" onClick={e => {
                        e.stopPropagation();
                        const copy = [...departments];
                        copy[di] = { ...copy[di], qualifications: copy[di].qualifications.filter((_, i) => i !== qi) };
                        setDepartments(copy);
                      }} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 12 }}>Remove</button>
                    </div>
                  </div>
                  {expanded && (
                    <QualificationEditor
                      qual={qual}
                      campusList={campusNames}
                      onChange={updated => {
                        const copy = [...departments];
                        const quals = [...copy[di].qualifications];
                        quals[qi] = updated;
                        copy[di] = { ...copy[di], qualifications: quals };
                        setDepartments(copy);
                      }}
                    />
                  )}
                </div>
              );
            })}

            <button type="button" onClick={() => {
              const copy = [...departments];
              copy[di] = { ...copy[di], qualifications: [...copy[di].qualifications, { id: '', name: '', level: '', qualificationType: '', duration: {}, admission: {}, fees: [], scheduling: {}, structure: {} }] };
              setDepartments(copy);
              setExpandedQuals(prev => ({ ...prev, [`${di}-${copy[di].qualifications.length - 1}`]: true }));
            }} style={{ padding: '6px 12px', background: '#334155', color: '#94a3b8', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, marginTop: 8 }}>
              + Add Qualification
            </button>
          </div>
        ))}
        <button onClick={() => setDepartments([...departments, { name: '', qualifications: [] }])}
          style={{ padding: '8px 16px', background: '#334155', color: '#94a3b8', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
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
